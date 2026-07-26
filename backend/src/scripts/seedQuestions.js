'use strict'

/**
 * seedQuestions.js – populate the Quiz collection with starter questions.
 *
 * Run with:  npm run seed
 *
 * The script is idempotent – it clears all existing questions first,
 * then inserts the seed data fresh each time.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })

const mongoose = require('mongoose')
const Quiz = require('../models/Quiz')

// ── Seed data ──────────────────────────────────────────────────────────────
const QUESTIONS = [
  // ── Technology ────────────────────────────────────────────────────────
  {
    question: 'What does HTML stand for?',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Logic', 'Home Tool Markup Language'],
    answer: 0, category: 'technology', difficulty: 'easy',
  },
  {
    question: 'Which company created the React library?',
    options: ['Google', 'Microsoft', 'Meta (Facebook)', 'Apple'],
    answer: 2, category: 'technology', difficulty: 'easy',
  },
  {
    question: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Creative Style Syntax', 'Cascading Style Sheets', 'Colorful Style Sheets'],
    answer: 2, category: 'technology', difficulty: 'easy',
  },
  {
    question: 'Which HTTP method is used to retrieve data?',
    options: ['POST', 'PUT', 'DELETE', 'GET'],
    answer: 3, category: 'technology', difficulty: 'easy',
  },
  {
    question: 'What does API stand for?',
    options: ['Application Programming Interface', 'Applied Program Integration', 'Automated Process Interaction', 'Application Process Input'],
    answer: 0, category: 'technology', difficulty: 'easy',
  },
  {
    question: 'In React, which hook handles side effects?',
    options: ['useState', 'useEffect', 'useContext', 'useMemo'],
    answer: 1, category: 'technology', difficulty: 'medium',
  },
  {
    question: 'Which of these is NOT a JavaScript data type?',
    options: ['String', 'Boolean', 'Float', 'Symbol'],
    answer: 2, category: 'technology', difficulty: 'medium',
  },
  {
    question: 'What does NoSQL stand for?',
    options: ['Not Only SQL', 'No Structured Query Language', 'Non-Standard SQL', 'Numeric Object SQL'],
    answer: 0, category: 'technology', difficulty: 'medium',
  },
  {
    question: 'Which protocol does HTTPS use for encryption?',
    options: ['SSH', 'FTP', 'TLS/SSL', 'SMTP'],
    answer: 2, category: 'technology', difficulty: 'medium',
  },
  {
    question: 'What is a JWT?',
    options: ['JavaScript Web Transfer', 'JSON Web Token', 'Java Web Thread', 'JSON Widget Tool'],
    answer: 1, category: 'technology', difficulty: 'medium',
  },
  {
    question: 'Which data structure uses LIFO order?',
    options: ['Queue', 'Stack', 'Heap', 'Tree'],
    answer: 1, category: 'technology', difficulty: 'medium',
  },
  {
    question: 'What does DOM stand for?',
    options: ['Document Object Model', 'Data Object Management', 'Dynamic Object Module', 'Display Output Model'],
    answer: 0, category: 'technology', difficulty: 'easy',
  },
  {
    question: 'Which JavaScript method adds an element to the end of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    answer: 0, category: 'technology', difficulty: 'easy',
  },
  {
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
    answer: 2, category: 'technology', difficulty: 'hard',
  },
  {
    question: 'Which database type stores data as key-value pairs?',
    options: ['Relational', 'Document', 'Key-Value', 'Graph'],
    answer: 2, category: 'technology', difficulty: 'medium',
  },
  // ── General knowledge ─────────────────────────────────────────────────
  {
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    answer: 2, category: 'general', difficulty: 'easy',
  },
  {
    question: 'How many continents are there on Earth?',
    options: ['5', '6', '7', '8'],
    answer: 2, category: 'general', difficulty: 'easy',
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    answer: 1, category: 'general', difficulty: 'easy',
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 3, category: 'general', difficulty: 'easy',
  },
  {
    question: 'Who painted the Mona Lisa?',
    options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'],
    answer: 2, category: 'general', difficulty: 'easy',
  },
  // ── Science ───────────────────────────────────────────────────────────
  {
    question: 'What is the chemical symbol for water?',
    options: ['WO', 'H2O', 'HO2', 'O2H'],
    answer: 1, category: 'science', difficulty: 'easy',
  },
  {
    question: 'What force keeps planets in orbit around the Sun?',
    options: ['Magnetic force', 'Nuclear force', 'Gravity', 'Friction'],
    answer: 2, category: 'science', difficulty: 'easy',
  },
  {
    question: 'What is the speed of light (approx)?',
    options: ['300,000 km/s', '150,000 km/s', '1,000 km/s', '3,000 km/s'],
    answer: 0, category: 'science', difficulty: 'medium',
  },
  {
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Lysosome'],
    answer: 2, category: 'science', difficulty: 'easy',
  },
  {
    question: 'What gas do plants absorb during photosynthesis?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    answer: 2, category: 'science', difficulty: 'easy',
  },
]

const connectDB = require('../config/db')

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await connectDB()
    console.log('✅ Connected to MongoDB')

    await Quiz.deleteMany({})
    console.log('🗑️  Cleared existing questions')

    const inserted = await Quiz.insertMany(QUESTIONS)
    console.log(`✅ Seeded ${inserted.length} questions`)

    await mongoose.disconnect()
    console.log('👋 Disconnected. Seed complete!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()
