import { memo, forwardRef } from 'react'
import { Person } from '../types/family'

interface PersonCardProps {
  person: Person
  onClick?: () => void
  zoomLevel?: number
}

const PersonCard = forwardRef<HTMLDivElement, PersonCardProps>(
  ({ person, onClick, zoomLevel = 1 }, ref) => {
    const isZoomedOut = zoomLevel < 0.5

    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-lg shadow-md border-2 border-gray-200
          transition-all duration-200 cursor-pointer
          hover:shadow-lg hover:border-blue-400
          ${onClick ? 'hover:scale-105' : ''}
          ${isZoomedOut ? 'p-1' : 'p-2'}
        `}
        onClick={onClick}
        style={{ minWidth: isZoomedOut ? '60px' : '120px' }}
        data-person-id={person.id}
      >
        {/* Name */}
        <div className={`text-center font-semibold text-gray-800 ${isZoomedOut ? 'text-xs' : 'text-sm'} truncate`}>
          {person.name}
        </div>

        {/* Year of birth */}
        {person.birthdate && (
          <div className={`text-center text-gray-600 ${isZoomedOut ? 'text-xs' : 'text-xs'} mt-1`}>
            {new Date(person.birthdate).getFullYear()}
          </div>
        )}
      </div>
    )
  }
)

PersonCard.displayName = 'PersonCard'

export default memo(PersonCard)

