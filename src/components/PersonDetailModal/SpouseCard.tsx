import { Person } from '../../types/family'
import { formatDateHR, isBirthdaySoon } from '../../utils/personUtils'
import { addToCalendar, getGoogleMapsUrl } from '../../utils/calendarUtils'
import { downloadVCard } from '../../utils/vcardUtils'
import PersonPhoto from './PersonPhoto'

interface SpouseCardProps {
  spouse: Person
  onSpouseClick?: (spouseId: string) => void
}

export default function SpouseCard({ spouse, onSpouseClick }: SpouseCardProps) {
  const spouseBirthdaySoon = isBirthdaySoon(spouse.birthdate, spouse.deceasedDate)

  const handleAddressClick = (e: React.MouseEvent<HTMLAnchorElement>, address: string) => {
    e.stopPropagation()
    e.preventDefault()
    window.open(getGoogleMapsUrl(address), '_blank', 'noopener,noreferrer')
  }

  const handleCalendarClick = (e: React.MouseEvent<HTMLButtonElement>, name: string, birthdate: string) => {
    e.stopPropagation()
    addToCalendar(name, birthdate)
  }

  const handleCardClick = () => {
    if (onSpouseClick) {
      onSpouseClick(spouse.id)
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
        Supružnik
      </h3>
      <div
        className={`space-y-3 border border-gray-300 rounded-lg p-4 bg-gray-50 ${onSpouseClick ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
        onClick={handleCardClick}
      >
        {/* Spouse Photo */}
        <PersonPhoto person={spouse} size="small" />
        
        {/* Spouse Name */}
        <div className="flex items-center justify-center gap-2">
          <p className="text-lg font-semibold text-gray-800">
            {spouse.name}
            {spouse.deceasedDate && <span className="ml-1 text-gray-500">✝</span>}
            {spouseBirthdaySoon && !spouse.deceasedDate && <span className="ml-1" title="Birthday soon!">🎂</span>}
          </p>
          <button
            onClick={() => downloadVCard(spouse)}
            className="text-gray-500 hover:text-gray-700"
            title="Spremi kontakt"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
        
        {/* Spouse Birthdate */}
        {spouse.birthdate && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Datum rođenja
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">
                {formatDateHR(spouse.birthdate)}
              </p>
              {!spouse.deceasedDate && (
                <button
                  onClick={(e) => handleCalendarClick(e, spouse.name, spouse.birthdate)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Dodaj u kalendar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Spouse Deceased Date */}
        {spouse.deceasedDate && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Datum smrti
            </h4>
            <p className="text-sm text-gray-700">
              {formatDateHR(spouse.deceasedDate)}
            </p>
          </div>
        )}
        
        {/* Spouse Street Address */}
        {spouse.streetAddress && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Adresa
            </h4>
            <a
              href={getGoogleMapsUrl(spouse.streetAddress)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleAddressClick(e, spouse.streetAddress)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-words cursor-pointer"
            >
              {spouse.streetAddress}
            </a>
          </div>
        )}
        
        {/* Spouse Phone Number */}
        {spouse.phoneNumber && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Telefon
            </h4>
            <a
              href={`tel:${spouse.phoneNumber}`}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all cursor-pointer"
            >
              {spouse.phoneNumber}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

