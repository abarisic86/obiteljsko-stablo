import { useEffect } from 'react'
import { Person } from '../../types/family'
import { useQuiz } from '../../hooks/useQuiz'
import QuestionCard from './QuestionCard'
import ResultScreen from './ResultScreen'

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  people: Person[]
}

export default function QuizModal({ isOpen, onClose, people }: QuizModalProps) {
  const {
    questions,
    currentIndex,
    score,
    isFinished,
    startQuiz,
    answerQuestion,
    resetQuiz,
    currentQuestion,
    totalQuestions,
  } = useQuiz(people)

  useEffect(() => {
    if (isOpen && questions.length === 0) {
      startQuiz()
    }
  }, [isOpen, questions.length, startQuiz])

  const handlePlayAgain = () => {
    resetQuiz()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Kviz - Pogađanje godina rođenja</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isFinished ? (
            <ResultScreen
              score={score}
              totalQuestions={totalQuestions}
              onPlayAgain={handlePlayAgain}
              onClose={onClose}
            />
          ) : currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              onAnswer={answerQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={totalQuestions}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Učitavanje pitanja...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

