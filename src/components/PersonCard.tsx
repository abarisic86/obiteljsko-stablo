import { memo } from 'react'
import { Person } from '../types/family'

interface PersonCardProps {
  person: Person
  onClick?: () => void
  zoomLevel?: number
}

function PersonCard({ person, onClick, zoomLevel = 1 }: PersonCardProps) {
  const isZoomedOut = zoomLevel < 0.5
  const showDetails = zoomLevel > 0.3

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md border-2 border-gray-200
        transition-all duration-200 cursor-pointer
        hover:shadow-lg hover:border-blue-400
        ${onClick ? 'hover:scale-105' : ''}
        ${isZoomedOut ? 'p-1' : 'p-2'}
      `}
      onClick={onClick}
      style={{ minWidth: isZoomedOut ? '60px' : '120px' }}
    >
      {/* Photo */}
      <div className={`${isZoomedOut ? 'w-12 h-12' : 'w-20 h-20'} mx-auto mb-2 rounded-full overflow-hidden bg-gray-200`}>
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={person.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent && !parent.querySelector('.initials')) {
                const initials = person.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                const initialsDiv = document.createElement('div')
                initialsDiv.className = 'initials flex items-center justify-center w-full h-full text-gray-600 font-bold'
                initialsDiv.style.fontSize = isZoomedOut ? '12px' : '18px'
                initialsDiv.textContent = initials
                parent.appendChild(initialsDiv)
              }
            }}
          />
        ) : (
          <div className={`flex items-center justify-center w-full h-full text-gray-600 font-bold ${isZoomedOut ? 'text-xs' : 'text-lg'}`}>
            {person.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
        )}
      </div>

      {/* Name */}
      <div className={`text-center font-semibold text-gray-800 ${isZoomedOut ? 'text-xs' : 'text-sm'} truncate`}>
        {person.name}
      </div>

      {/* Additional details when zoomed in */}
      {showDetails && !isZoomedOut && (
        <div className="mt-2 space-y-1">
          {person.birthdate && (
            <div className="text-xs text-gray-600 text-center">
              {new Date(person.birthdate).getFullYear()}
            </div>
          )}
          {person.location && (
            <div className="text-xs text-gray-500 text-center truncate">
              {person.location}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(PersonCard)

