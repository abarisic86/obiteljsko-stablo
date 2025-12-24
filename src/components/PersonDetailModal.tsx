import { Person } from '../types/family'

interface PersonDetailModalProps {
  person: Person | null
  spouse?: Person
  isSpouseInTree?: boolean
  onClose: () => void
}

export default function PersonDetailModal({ person, spouse, isSpouseInTree, onClose }: PersonDetailModalProps) {
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
          <h2 className="text-2xl font-bold text-gray-800">{person.name}</h2>
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
              <p className="text-gray-800">
                {new Date(person.birthdate).toLocaleDateString('hr-HR', {
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
              <p className="text-gray-800 break-all">{person.phoneNumber}</p>
            </div>
          )}

          {/* Spouse */}
          {spouse && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Supružnik
              </h3>
              <div className="space-y-3">
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
                <p className="text-lg font-semibold text-gray-800 text-center">{spouse.name}</p>
                
                {!isSpouseInTree && (
                  <p className="text-xs text-gray-500 italic text-center">
                    (Nije direktno u obiteljskom stablu)
                  </p>
                )}
                
                {/* Spouse Birthdate */}
                {spouse.birthdate && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Datum rođenja
                    </h4>
                    <p className="text-sm text-gray-700">
                      {new Date(spouse.birthdate).toLocaleDateString('hr-HR', {
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
                    <p className="text-sm text-gray-700 break-all">{spouse.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

