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

    // Check if birthday is in the next week
    const isBirthdaySoon = () => {
      if (!person.birthdate || person.deceasedDate) return false

      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const birthDate = new Date(person.birthdate)
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
        
        // If birthday already passed this year, check next year
        const nextBirthday = thisYearBirthday < today
          ? new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
          : thisYearBirthday
        
        // Calculate days until birthday
        const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        return daysUntilBirthday >= 0 && daysUntilBirthday <= 7
      } catch {
        return false
      }
    }

    // Check if person is older than 30 and has no spouse (and is alive)
    const isOver30WithoutSpouse = () => {
      if (!person.birthdate || person.deceasedDate || person.spouseId) return false

      try {
        const today = new Date()
        const birthDate = new Date(person.birthdate)
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age
        return actualAge > 30
      } catch {
        return false
      }
    }

    const birthdaySoon = isBirthdaySoon()
    const singleOver30 = isOver30WithoutSpouse()

    return (
      <div
        ref={ref}
        className={`
          ${singleOver30 ? 'bg-red-100 border-red-400' : 'bg-white border-gray-200'}
          rounded-lg shadow-md border-2
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

