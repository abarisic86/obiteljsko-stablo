import { Person } from '../../types/family'
import { isBirthdaySoon } from '../../utils/personUtils'
import { downloadVCard } from '../../utils/vcardUtils'
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadVCard(person)}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Spremi kontakt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
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

