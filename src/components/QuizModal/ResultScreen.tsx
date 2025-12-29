interface ResultScreenProps {
  score: number
  totalQuestions: number
  onPlayAgain: () => void
  onClose: () => void
}

export default function ResultScreen({ score, totalQuestions, onPlayAgain, onClose }: ResultScreenProps) {
  const percentage = Math.round((score / totalQuestions) * 100)
  
  let message = ''
  let emoji = ''
  
  if (percentage === 100) {
    message = 'Izvrsno! Savršeno!'
    emoji = '🎉'
  } else if (percentage >= 80) {
    message = 'Odlično! Jako dobro!'
    emoji = '👏'
  } else if (percentage >= 60) {
    message = 'Dobro! Može bolje!'
    emoji = '👍'
  } else if (percentage >= 40) {
    message = 'Nije loše, ali može bolje!'
    emoji = '🤔'
  } else {
    message = 'Probaj ponovo!'
    emoji = '💪'
  }

  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl mb-4">{emoji}</div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{message}</h2>
      
      <div className="text-5xl font-bold text-blue-600 mb-4">
        {score} / {totalQuestions}
      </div>
      
      <div className="text-xl text-gray-600 mb-8">
        {percentage}% točnih odgovora
      </div>

      {/* Score visualization */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${
            percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Igraj ponovo
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Zatvori
        </button>
      </div>
    </div>
  )
}

