/**
 * quizData.js – Fallback local quiz questions used when the backend is
 * unavailable (dev mode / offline).
 *
 * Each question has:
 *  - id       : unique identifier
 *  - question : question text
 *  - options  : array of 4 answer strings
 *  - answer   : index (0-3) of the correct option
 */

export const FALLBACK_QUESTIONS = [
  {
    id: 1,
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Hyper Transfer Markup Logic',
      'Home Tool Markup Language',
    ],
    answer: 0,
  },
  {
    id: 2,
    question: 'Which company created the React library?',
    options: ['Google', 'Microsoft', 'Meta (Facebook)', 'Apple'],
    answer: 2,
  },
  {
    id: 3,
    question: 'What is the correct way to declare a variable in modern JS?',
    options: ['var x = 5', 'let x = 5', 'x = 5', 'declare x = 5'],
    answer: 1,
  },
  {
    id: 4,
    question: 'Which method is used to add an element to the end of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    answer: 0,
  },
  {
    id: 5,
    question: 'What does CSS stand for?',
    options: [
      'Computer Style Sheets',
      'Creative Style Syntax',
      'Cascading Style Sheets',
      'Colorful Style Sheets',
    ],
    answer: 2,
  },
  {
    id: 6,
    question: 'In React, what hook is used for side effects?',
    options: ['useState', 'useEffect', 'useContext', 'useMemo'],
    answer: 1,
  },
  {
    id: 7,
    question: 'Which HTTP method is used to retrieve data?',
    options: ['POST', 'PUT', 'DELETE', 'GET'],
    answer: 3,
  },
  {
    id: 8,
    question: 'What symbol is used for template literals in JavaScript?',
    options: ["Single quote '", 'Double quote "', 'Backtick `', 'Hash #'],
    answer: 2,
  },
  {
    id: 9,
    question: 'What does API stand for?',
    options: [
      'Application Programming Interface',
      'Applied Program Integration',
      'Automated Process Interaction',
      'Application Process Input',
    ],
    answer: 0,
  },
  {
    id: 10,
    question: 'Which Telegram object provides user data in a Mini App?',
    options: [
      'window.TelegramBot',
      'window.Telegram.WebApp',
      'window.TG.User',
      'window.Bot.User',
    ],
    answer: 1,
  },
]
