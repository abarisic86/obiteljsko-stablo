import { useState, useEffect } from 'react'
import { QuizQuestion } from '../../hooks/useQuiz'

interface QuestionCardProps {
  question: QuizQuestion
  onAnswer: (answer: string) => void
  questionNumber: number
  totalQuestions: number
}

export default function QuestionCard({ question, onAnswer, questionNumber, totalQuestions }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    setSelectedAnswer(null)
    setShowFeedback(false)
  }, [question])

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return // Already answered
    
    setSelectedAnswer(answer)
    setShowFeedback(true)
    
    setTimeout(() => {
      onAnswer(answer)
    }, 1500)
  }

  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          Pitanje {questionNumber} od {totalQuestions}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{question.prompt}</h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, index) => {
          let buttonClass = 'w-full py-4 px-6 rounded-lg border-2 transition-all text-left font-medium'
          
          if (selectedAnswer === option) {
            buttonClass += isCorrect
              ? ' bg-green-100 border-green-500 text-green-800'
              : ' bg-red-100 border-red-500 text-red-800'
          } else if (showFeedback && option === question.correctAnswer) {
            buttonClass += ' bg-green-100 border-green-500 text-green-800'
          } else if (selectedAnswer !== null) {
            buttonClass += ' bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed'
          } else {
            buttonClass += ' bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              className={buttonClass}
            >
              {option}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`text-center font-semibold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? '✓ Točno!' : `✗ Netočno. Točan odgovor: ${question.correctAnswer}`}
        </div>
      )}
    </div>
  )
}

