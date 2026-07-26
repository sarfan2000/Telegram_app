'use strict'

const express = require('express')
const router = express.Router()

const { getQuestions, submitQuiz, getQuizHistory } = require('../controllers/quizController')
const { protect } = require('../middleware/authMiddleware')
const validate = require('../middleware/validateMiddleware')
const { submitValidators } = require('../validators/quizValidators')

// All quiz routes require authentication
router.use(protect)

// GET /api/quiz/questions  – get randomised question set (answers excluded)
router.get('/questions', getQuestions)

// POST /api/quiz/submit  – submit answers for server-side grading
router.post('/submit', submitValidators, validate, submitQuiz)

// GET /api/quiz/history  – current user's past results
router.get('/history', getQuizHistory)

module.exports = router
