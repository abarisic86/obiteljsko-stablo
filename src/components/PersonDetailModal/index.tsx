import { Person } from '../../types/family'
import { isBirthdaySoon } from '../../utils/personUtils'
import PersonPhoto from './PersonPhoto'
import PersonInfoSection from './PersonInfoSection'
import SpouseCard from './SpouseCard'
import FamilyLinks from './FamilyLinks'

interface PersonDetailModalProps {
  person: Person | null
  spouse?: Person
  parent?: Person | null
  children?: Person[]
  onClose: () => void
  onPersonClick: (personId: string) => void
}

export default function PersonDetailModal({ 
  person, 
  spouse, 
  parent, 
  children = [], 
  onClose, 
  onPersonClick 
}: PersonDetailModalProps) {
  if (!person) return null

  const personBirthdaySoon = isBirthdaySoon(person.birthdate, person.deceasedDate)

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-800">
            {person.name}
            {person.deceasedDate && <span className="ml-2 text-gray-500">✝</span>}
            {personBirthdaySoon && !person.deceasedDate && <span className="ml-2" title="Birthday soon!">🎂</span>}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Photo */}
          <PersonPhoto person={person} />

          {/* Person Info */}
          <PersonInfoSection person={person} />

          {/* Spouse */}
          {spouse && <SpouseCard spouse={spouse} />}

          {/* Family Links */}
          <FamilyLinks parent={parent} children={children} onPersonClick={onPersonClick} />
        </div>
      </div>
    </div>
  )
}

