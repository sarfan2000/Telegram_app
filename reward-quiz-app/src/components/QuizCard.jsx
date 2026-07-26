import React from 'react'

/**
 * QuizCard – renders a single quiz question with multiple choice options.
 *
 * Props:
 *  - question      : { question: string, options: string[] }
 *  - questionIndex : current question number (0-indexed)
 *  - totalQuestions: total number of questions
 *  - selectedAnswer: index of the selected option (null if none)
 *  - onAnswer      : callback(optionIndex)
 *  - isRevealed    : bool – show correct/wrong colours after submission
 *  - correctAnswer : index of the correct option
 */
function QuizCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  isRevealed = false,
  correctAnswer,
}) {
  if (!question) return null

  /**
   * Determine the visual state class for each option button.
   */
  const getOptionClass = (index) => {
    const base =
      'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 '

    if (!isRevealed) {
      // Before answer submission
      if (selectedAnswer === index) {
        return base + 'bg-tg-blue/20 border-tg-blue text-tg-blue'
      }
      return base + 'bg-tg-card border-white/10 text-tg-text hover:border-tg-blue/50 hover:bg-tg-blue/10 active:scale-95'
    }

    // After reveal
    if (correctAnswer !== undefined) {
      if (index === correctAnswer) {
        return base + 'bg-green-500/20 border-green-500 text-green-400'
      }
      if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
        return base + 'bg-red-500/20 border-red-500 text-red-400'
      }
    } else {
      // Backend mode - no immediate grading, keep selected highlighted
      if (index === selectedAnswer) {
        return base + 'bg-tg-blue/20 border-tg-blue text-tg-blue'
      }
    }
    return base + 'bg-tg-card border-white/5 text-tg-hint opacity-60'
  }

  return (
    <div className="bg-tg-card rounded-2xl p-5 border border-white/5 page-enter">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-tg-hint text-xs">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        {/* Mini progress bar */}
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i < questionIndex
                  ? 'w-3 bg-green-400'
                  : i === questionIndex
                    ? 'w-4 bg-tg-blue'
                    : 'w-3 bg-tg-hint/30'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Question text */}
      <h2 className="text-tg-text font-semibold text-base leading-snug mb-5">
        {question.question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={getOptionClass(index)}
            onClick={() => !isRevealed && onAnswer(index)}
            disabled={isRevealed}
          >
            <span className="flex items-center gap-3">
              {/* Letter label */}
              <span className="w-6 h-6 rounded-full bg-white/10 text-xs flex items-center justify-center flex-shrink-0 font-bold">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuizCard
