import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import QuizCard from '../components/QuizCard.jsx'
import Loading from '../components/Loading.jsx'
import { getQuizQuestions, submitQuizAnswers } from '../services/api.js'
import { FALLBACK_QUESTIONS } from '../utils/quizData.js'
import { calcPercent, formatPoints } from '../utils/helpers.js'

// Points awarded per correct answer
const POINTS_PER_CORRECT = 10

// How many seconds per question
const TIME_PER_QUESTION = 20

/**
 * Quiz – multi-step quiz page.
 *
 * States:
 *  'idle'     → intro screen
 *  'playing'  → answering questions
 *  'results'  → score summary
 */
function Quiz() {
  const { user, addPoints, addQuizResult } = useUser()
  const navigate = useNavigate()

  const [stage, setStage] = useState('idle')      // 'idle' | 'playing' | 'results'
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [answersArray, setAnswersArray] = useState([])
  const [loadingQuiz, setLoadingQuiz] = useState(false)

  // ── Timer countdown ─────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'playing' || isRevealed) return
    if (timeLeft <= 0) {
      handleReveal(null) // auto-advance when time runs out
      return
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, stage, isRevealed])

  // ── Load questions ───────────────────────────────────────────────────────
  const startQuiz = async () => {
    if (loadingQuiz) return
    setLoadingQuiz(true)
    try {
      const data = await getQuizQuestions()
      setQuestions(data?.questions ?? data ?? FALLBACK_QUESTIONS)

      setStage('playing')
      setCurrentIndex(0)
      setScore(0)
      setAnswersArray([])
      setSelectedAnswer(null)
      setIsRevealed(false)
      setTimeLeft(TIME_PER_QUESTION)
    } catch (err) {
      if (err?.status === 429) {
        alert('You have already played your quiz today! Come back tomorrow.')
      } else {
        // Backend unavailable or error â€” use local fallback questions
        console.warn('[Quiz] Backend start failed, using fallback questions:', err.message)
        setQuestions(FALLBACK_QUESTIONS)
        setStage('playing')
        setCurrentIndex(0)
        setScore(0)
        setAnswersArray([])
        setSelectedAnswer(null)
        setIsRevealed(false)
        setTimeLeft(TIME_PER_QUESTION)
      }
    } finally {
      setLoadingQuiz(false)
    }
  }

  // ── Answer selected ──────────────────────────────────────────────────────
  const handleAnswer = (optionIndex) => {
    if (isRevealed) return
    setSelectedAnswer(optionIndex)
    handleReveal(optionIndex)
  }

  const handleReveal = useCallback(
    (optionIndex) => {
      setIsRevealed(true)
      const q = questions[currentIndex]
      const correct = q?.answer

      setAnswersArray(prev => [...prev, { questionId: q._id || q.id, selected: optionIndex }])

      if (optionIndex !== null && optionIndex === correct) {
        setScore((s) => s + 1)
      }

      // Auto-advance faster if not grading locally
      const delay = correct !== undefined ? 1500 : 800
      setTimeout(() => advanceQuestion(), delay)
    },
    [currentIndex, questions]
  )

  const advanceQuestion = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= questions.length) {
      finishQuiz()
    } else {
      setCurrentIndex(nextIndex)
      setSelectedAnswer(null)
      setIsRevealed(false)
      setTimeLeft(TIME_PER_QUESTION)
    }
  }

  // ── Finish & save ────────────────────────────────────────────────────────
  const finishQuiz = async () => {
    setStage('results')

    try {
      const res = await submitQuizAnswers(answersArray)

      const serverScore = res?.score ?? 0
      const earned = res?.pointsEarned ?? 0

      setScore(serverScore)
      addPoints(earned)

      addQuizResult({
        score: serverScore,
        total: questions.length,
        earned,
        date: new Date().toISOString(),
      })
    } catch (err) {
      // Backend unavailable – result already saved locally
      const earned = score * POINTS_PER_CORRECT
      addPoints(earned)

      const result = {
        score,
        total: questions.length,
        earned,
        date: new Date().toISOString(),
      }
      addQuizResult(result)
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  if (loadingQuiz) return <Loading message="Loading questions…" />

  const currentQ = questions[currentIndex]
  const totalQ = questions.length
  const earnedPoints = score * POINTS_PER_CORRECT
  const percent = calcPercent(score, totalQ)

  // ── Idle / Intro ─────────────────────────────────────────────────────────
  if (stage === 'idle') {
    return (
      <div className="min-h-screen bg-tg-darker px-4 pt-12 flex flex-col items-center justify-center page-enter">
        <div className="text-6xl mb-4">🧠</div>
        <h1 className="text-2xl font-bold text-tg-text mb-2">Quiz Challenge</h1>
        <p className="text-tg-hint text-sm text-center mb-8">
          Answer {FALLBACK_QUESTIONS.length} questions and earn{' '}
          <span className="text-tg-blue font-semibold">
            up to {FALLBACK_QUESTIONS.length * POINTS_PER_CORRECT} points!
          </span>
        </p>

        {/* Rules */}
        <div className="w-full bg-tg-card rounded-2xl p-4 border border-white/5 mb-8">
          {[
            `⏱️ ${TIME_PER_QUESTION}s per question`,
            `🎯 +${POINTS_PER_CORRECT} points per correct answer`,
            '❌ No penalty for wrong answers',
            '🏆 Top scores appear on the Leaderboard',
          ].map((rule) => (
            <p key={rule} className="text-tg-text text-sm py-1.5 border-b border-white/5 last:border-0">
              {rule}
            </p>
          ))}
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-tg-blue to-blue-600 text-white font-bold text-base active:scale-95 transition-all"
        >
          Start Quiz 🚀
        </button>
      </div>
    )
  }

  // ── Results ──────────────────────────────────────────────────────────────
  if (stage === 'results') {
    const emoji = percent >= 80 ? '🏆' : percent >= 50 ? '👍' : '📚'

    return (
      <div className="min-h-screen bg-tg-darker px-4 pt-12 flex flex-col items-center page-enter">
        <div className="text-6xl mb-3">{emoji}</div>
        <h1 className="text-2xl font-bold text-tg-text mb-1">Quiz Complete!</h1>
        <p className="text-tg-hint text-sm mb-6">Here's how you did</p>

        {/* Score circle */}
        <div className="w-28 h-28 rounded-full border-4 border-tg-blue flex flex-col items-center justify-center mb-6 bg-tg-blue/10">
          <span className="text-3xl font-bold text-tg-blue">
            {score}/{totalQ}
          </span>
          <span className="text-tg-hint text-xs">{percent}%</span>
        </div>

        {/* Earned points */}
        <div className="w-full bg-tg-card rounded-2xl p-4 border border-tg-blue/30 flex items-center gap-3 mb-6">
          <span className="text-3xl">🪙</span>
          <div>
            <p className="text-tg-hint text-xs">Points Earned</p>
            <p className="text-2xl font-bold text-tg-blue">+{formatPoints(earnedPoints)}</p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => setStage('idle')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-tg-blue to-blue-600 text-white font-bold active:scale-95 transition-all"
          >
            Play Again 🔁
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-2xl bg-tg-card border border-white/10 text-tg-text font-medium active:scale-95 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // ── Playing ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-tg-darker px-4 pt-6 page-enter">
      {/* Timer bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-tg-hint text-xs">Score: {score * POINTS_PER_CORRECT} pts</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-tg-card rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-tg-blue'
                }`}
              style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
            />
          </div>
          <span
            className={`text-sm font-mono font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-tg-text'
              }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      <QuizCard
        question={currentQ}
        questionIndex={currentIndex}
        totalQuestions={totalQ}
        selectedAnswer={selectedAnswer}
        onAnswer={handleAnswer}
        isRevealed={isRevealed}
        correctAnswer={currentQ?.answer}
      />
    </div>
  )
}

export default Quiz
