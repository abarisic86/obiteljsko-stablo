import React, { memo, forwardRef } from 'react'
import { Person } from '../types/family'
import { isBirthdaySoon, formatDateHR } from '../utils/personUtils'

interface PersonCardProps {
  person: Person
  onClick?: () => void
  zoomLevel?: number
  branchColor?: string | null
}

const PersonCard = forwardRef<HTMLDivElement, PersonCardProps>(
  ({ person, onClick, zoomLevel = 1, branchColor = null }, ref) => {
    const isZoomedOut = zoomLevel < 0.5

    const birthdaySoon = isBirthdaySoon(person.birthdate, person.deceasedDate)

    // Build tooltip text
    const tooltipParts: string[] = [person.name]
    if (person.birthdate) {
      tooltipParts.push(`Rođen/a: ${formatDateHR(person.birthdate)}`)
    }
    if (person.deceasedDate) {
      tooltipParts.push(`Preminuo/la: ${formatDateHR(person.deceasedDate)}`)
    }
    const tooltipText = tooltipParts.join('\n')

    // Build style object with branch color
    const cardStyle: React.CSSProperties = {
      minWidth: isZoomedOut ? '60px' : '120px',
    }
    if (branchColor) {
      cardStyle.backgroundColor = branchColor
      cardStyle.borderColor = branchColor
    }

    return (
      <div
        ref={ref}
        className={`
          ${branchColor ? '' : 'bg-white border-gray-200'}
          rounded-lg shadow-md border-2
          transition-all duration-200 cursor-pointer
          hover:shadow-lg hover:border-blue-400
          ${onClick ? 'hover:scale-105' : ''}
          ${isZoomedOut ? 'p-1' : 'p-2'}
        `}
        onClick={onClick}
        style={cardStyle}
        data-person-id={person.id}
        title={tooltipText}
      >
        {/* Name */}
        <div className={`text-center font-semibold text-gray-800 ${isZoomedOut ? 'text-xs' : 'text-sm'} truncate`}>
          {person.name}
          {person.deceasedDate && <span className="ml-1 text-gray-500">✝</span>}
          {birthdaySoon && !person.deceasedDate && <span className="ml-1" title="Birthday soon!">🎂</span>}
        </div>

        {/* Year of birth and death */}
        {person.birthdate && (
          <div className={`text-center text-gray-600 ${isZoomedOut ? 'text-xs' : 'text-xs'} mt-1`}>
            {new Date(person.birthdate).getFullYear()}
            {person.deceasedDate && (
              <span className="text-gray-500"> - {new Date(person.deceasedDate).getFullYear()}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)

PersonCard.displayName = 'PersonCard'

export default memo(PersonCard)

