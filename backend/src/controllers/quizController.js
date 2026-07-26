'use strict'

const Quiz = require('../models/Quiz')
const QuizResult = require('../models/QuizResult')
const User = require('../models/User')
const Reward = require('../models/Reward')
const { pickRandom, successResponse } = require('../utils/helpers')
const { QUIZ_POINTS_PER_CORRECT } = require('../config/constants')

// Default questions per session
const DEFAULT_QUESTION_COUNT = 10

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quiz/questions  (protected)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getQuestions – return a randomised set of active quiz questions.
 *
 * The answer index is EXCLUDED from the response to prevent cheating.
 * Answers are verified server-side in /submit.
 *
 * Query params:
 *  - count    : number of questions (default 10, max 20)
 *  - category : filter by category (optional)
 */
const getQuestions = async (req, res, next) => {
  try {
    const count = Math.min(20, Math.max(1, parseInt(req.query.count) || DEFAULT_QUESTION_COUNT))
    const filter = { active: true }
    if (req.query.category) filter.category = req.query.category

    const allQuestions = await Quiz.find(filter)
      .select('_id question options category difficulty answer')  // answer included for immediate UI feedback
      .lean()

    if (allQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available. Please seed the database.',
      })
    }

    const selected = pickRandom(allQuestions, count)

    return res.json(
      successResponse(
        { questions: selected, total: selected.length },
        'Questions fetched'
      )
    )
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quiz/submit  (protected)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * submitQuiz – validate answers server-side, calculate score, award points.
 *
 * Body:
 *  {
 *    answers: [{ questionId: string, selected: number }]  // one per question
 *  }
 *
 * The server fetches each question's correct answer from MongoDB,
 * so the client cannot fake a score.
 */
const submitQuiz = async (req, res, next) => {
  try {
    const user = req.user
    const { answers } = req.body   // array of { questionId, selected }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'answers must be a non-empty array.',
      })
    }

    // Fetch all referenced questions in one query
    const questionIds = answers.map((a) => a.questionId)
    const questions = await Quiz.find({
      _id: { $in: questionIds },
      active: true,
    }).select('_id answer').lean()

    // Build a map for O(1) lookup
    const answerMap = {}
    questions.forEach((q) => { answerMap[String(q._id)] = q.answer })

    // Grade each answer
    let score = 0
    const gradedAnswers = answers.map((a) => {
      const correct = answerMap[String(a.questionId)]
      const isCorrect = correct !== undefined && a.selected === correct
      if (isCorrect) score++
      return {
        questionId: a.questionId,
        selected: a.selected,
        correct: correct ?? null,
        isCorrect,
      }
    })

    const total = answers.length
    const pointsEarned = score * QUIZ_POINTS_PER_CORRECT

    // ── Save result ─────────────────────────────────────────────────────────
    const result = await QuizResult.create({
      user: user._id,
      telegram_id: user.telegram_id,
      score,
      total,
      pointsEarned,
      answers: gradedAnswers,
    })

    // ── Update user totals ──────────────────────────────────────────────────
    await User.findByIdAndUpdate(user._id, {
      $inc: { points: pointsEarned, quizzesTaken: 1 },
    })

    // ── Log reward event ────────────────────────────────────────────────────
    if (pointsEarned > 0) {
      await Reward.create({
        user: user._id,
        telegram_id: user.telegram_id,
        points: pointsEarned,
        source: 'quiz',
        meta: { score, total, resultId: result._id },
      })
    }

    return res.json(
      successResponse(
        {
          score,
          total,
          percentage: total > 0 ? Math.round((score / total) * 100) : 0,
          pointsEarned,
          answers: gradedAnswers,
        },
        `Quiz completed! You scored ${score}/${total}`
      )
    )
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quiz/history  (protected)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getQuizHistory – paginated quiz results for the authenticated user.
 */
const getQuizHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const [results, total] = await Promise.all([
      QuizResult.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('score total pointsEarned createdAt')
        .lean(),
      QuizResult.countDocuments({ user: req.user._id }),
    ])

    return res.json(
      successResponse(
        {
          results,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
        'Quiz history fetched'
      )
    )
  } catch (err) {
    next(err)
  }
}

module.exports = { getQuestions, submitQuiz, getQuizHistory }
