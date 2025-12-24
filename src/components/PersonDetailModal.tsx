import { Person } from '../types/family'

interface PersonDetailModalProps {
  person: Person | null
  spouse?: Person
  parent?: Person | null
  children?: Person[]
  onClose: () => void
  onPersonClick: (personId: string) => void
}

export default function PersonDetailModal({ person, spouse, parent, children = [], onClose, onPersonClick }: PersonDetailModalProps) {
  if (!person) return null

  const getGoogleMapsUrl = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  }

  const handleAddressClick = (e: React.MouseEvent<HTMLAnchorElement>, address: string) => {
    e.stopPropagation()
    e.preventDefault()
    window.open(getGoogleMapsUrl(address), '_blank', 'noopener,noreferrer')
  }

  const addToCalendar = (name: string, birthdate: string) => {
    const birthDate = new Date(birthdate)
    const year = birthDate.getFullYear()
    const month = String(birthDate.getMonth() + 1).padStart(2, '0')
    const day = String(birthDate.getDate()).padStart(2, '0')
    
    // Format date as YYYYMMDD for ICS format
    const dateStr = `${year}${month}${day}`
    
    // Create ICS file content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Family Tree//Birthday Event//EN',
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:${name} - Rođendan`,
      `DESCRIPTION:Rođendan ${name}`,
      'RRULE:FREQ=YEARLY;INTERVAL=1',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    
    // Detect iOS devices
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    
    if (isIOS) {
      // On iOS, use data URL without download attribute
      // This should trigger the calendar app to open directly
      const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
      const link = document.createElement('a')
      link.href = dataUrl
      // Don't use download attribute on iOS - let the system handle it
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // On Android and desktop, use blob URL with download attribute
      // Android will typically offer to open with calendar app
      // Desktop will download but user can open with calendar app
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${name.replace(/\s+/g, '_')}_birthday.ics`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)
    }
  }

  const handleCalendarClick = (e: React.MouseEvent<HTMLButtonElement>, name: string, birthdate: string) => {
    e.stopPropagation()
    addToCalendar(name, birthdate)
  }

  // Check if birthday is in the next week
  const isBirthdaySoon = (personData: Person) => {
    if (!personData.birthdate || personData.deceasedDate) return false

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const birthDate = new Date(personData.birthdate)
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

  const personBirthdaySoon = isBirthdaySoon(person)
  const spouseBirthdaySoon = spouse ? isBirthdaySoon(spouse) : false

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
          {person.photoUrl && (
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200">
              <img
                src={person.photoUrl}
                alt={person.name}
                className="w-full h-full object-cover"
                onError={(e) => {
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
                    initialsDiv.className = 'initials flex items-center justify-center w-full h-full text-gray-600 font-bold text-3xl'
                    initialsDiv.textContent = initials
                    parent.appendChild(initialsDiv)
                  }
                }}
              />
            </div>
          )}

          {/* Birthdate */}
          {person.birthdate && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                Datum rođenja
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-800">
                  {new Date(person.birthdate).toLocaleDateString('hr-HR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
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
                {new Date(person.deceasedDate).toLocaleDateString('hr-HR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
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

          {/* Spouse */}
          {spouse && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Supružnik
              </h3>
              <div className="space-y-3 border border-gray-300 rounded-lg p-4 bg-gray-50">
                {/* Spouse Photo */}
                {spouse.photoUrl && (
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={spouse.photoUrl}
                      alt={spouse.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent && !parent.querySelector('.initials')) {
                          const initials = spouse.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                          const initialsDiv = document.createElement('div')
                          initialsDiv.className = 'initials flex items-center justify-center w-full h-full text-gray-600 font-bold text-2xl'
                          initialsDiv.textContent = initials
                          parent.appendChild(initialsDiv)
                        }
                      }}
                    />
                  </div>
                )}
                
                {/* Spouse Name */}
                <p className="text-lg font-semibold text-gray-800 text-center">
                  {spouse.name}
                  {spouse.deceasedDate && <span className="ml-1 text-gray-500">✝</span>}
                  {spouseBirthdaySoon && !spouse.deceasedDate && <span className="ml-1" title="Birthday soon!">🎂</span>}
                </p>
                
                {/* Spouse Birthdate */}
                {spouse.birthdate && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Datum rođenja
                    </h4>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700">
                        {new Date(spouse.birthdate).toLocaleDateString('hr-HR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
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
                      {new Date(spouse.deceasedDate).toLocaleDateString('hr-HR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
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
          )}

          {/* Parent */}
          {parent && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Roditelj
              </h3>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onPersonClick(parent.id)
                  }}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left w-full"
                >
                  {parent.name}
                  {parent.deceasedDate && <span className="ml-2 text-gray-500">✝</span>}
                </button>
                {parent.birthdate && (
                  <p className="text-sm text-gray-600 mt-1">
                    Rođen: {new Date(parent.birthdate).getFullYear()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Children */}
          {children.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Djeca ({children.length})
              </h3>
              <div className="space-y-2">
                {children.map((child) => (
                  <div key={child.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onPersonClick(child.id)
                      }}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left w-full"
                    >
                      {child.name}
                      {child.deceasedDate && <span className="ml-2 text-gray-500">✝</span>}
                    </button>
                    {child.birthdate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Rođen: {new Date(child.birthdate).getFullYear()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

