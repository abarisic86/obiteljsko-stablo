import { Person } from '../../types/family'
import { formatDateHR } from '../../utils/personUtils'
import { addToCalendar, getGoogleMapsUrl } from '../../utils/calendarUtils'

interface PersonInfoSectionProps {
  person: Person
}

export default function PersonInfoSection({ person }: PersonInfoSectionProps) {
  const handleAddressClick = (e: React.MouseEvent<HTMLAnchorElement>, address: string) => {
    e.stopPropagation()
    e.preventDefault()
    window.open(getGoogleMapsUrl(address), '_blank', 'noopener,noreferrer')
  }

  const handleCalendarClick = (e: React.MouseEvent<HTMLButtonElement>, name: string, birthdate: string) => {
    e.stopPropagation()
    addToCalendar(name, birthdate)
  }

  return (
    <>
      {/* Birthdate */}
      {person.birthdate && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
            Datum rođenja
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-gray-800">
              {formatDateHR(person.birthdate)}
            </p>
            {!person.deceasedDate && (
              <button
                onClick={(e) => handleCalendarClick(e, person.name, person.birthdate)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Dodaj u kalendar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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

      {/* Deceased Date */}
      {person.deceasedDate && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
            Datum smrti
          </h3>
          <p className="text-gray-800">
            {formatDateHR(person.deceasedDate)}
          </p>
        </div>
      )}

      {/* Street Address */}
      {person.streetAddress && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
            Adresa
          </h3>
          <a
            href={getGoogleMapsUrl(person.streetAddress)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleAddressClick(e, person.streetAddress)}
            className="text-blue-600 hover:text-blue-800 hover:underline break-words cursor-pointer"
          >
            {person.streetAddress}
          </a>
        </div>
      )}

      {/* Phone Number */}
      {person.phoneNumber && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
            Telefon
          </h3>
          <a
            href={`tel:${person.phoneNumber}`}
            className="text-blue-600 hover:text-blue-800 hover:underline break-all cursor-pointer"
          >
            {person.phoneNumber}
          </a>
        </div>
      )}
    </>
  )
}

