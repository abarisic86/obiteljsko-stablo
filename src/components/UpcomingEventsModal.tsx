import { Person } from '../types/family'
import { getUpcomingEvents, formatDateHR, UpcomingEvent } from '../utils/personUtils'

interface UpcomingEventsModalProps {
  people: Person[]
  onClose: () => void
  onPersonClick?: (personId: string) => void
}

export default function UpcomingEventsModal({ 
  people, 
  onClose,
  onPersonClick 
}: UpcomingEventsModalProps) {
  const events = getUpcomingEvents(people, 10)

  const handlePersonClick = (personId: string) => {
    if (onPersonClick) {
      onPersonClick(personId)
    }
    onClose()
  }

  const formatDaysUntil = (days: number): string => {
    if (days === 0) return 'Danas'
    if (days === 1) return 'Sutra'
    return `Za ${days} dana`
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-800">
            Nadolazeći događaji
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {events.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nema nadolazećih događaja.
            </p>
          ) : (
            <div className="space-y-1">
              {events.map((event: UpcomingEvent, index: number) => (
                <div
                  key={`${event.person.id}-${event.eventType}-${index}`}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors ${
                    index % 2 === 0 ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                  } ${onPersonClick ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                  onClick={() => onPersonClick && handlePersonClick(event.person.id)}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {event.eventType === 'birthday' ? (
                      <svg
                        className="w-5 h-5 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Event Info - Single Line */}
                  <div className="flex-1 min-w-0 flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-800 truncate">
                      {event.person.name}
                    </span>
                    {event.person.deceasedDate && (
                      <span className="text-gray-500 flex-shrink-0">✝</span>
                    )}
                    {event.eventType === 'anniversary' && (
                      <>
                        <span className="text-gray-500 flex-shrink-0">•</span>
                        <span className="text-gray-600 flex-shrink-0">Godišnjica</span>
                      </>
                    )}
                    <span className="text-gray-500 flex-shrink-0">•</span>
                    <span className="text-gray-500 flex-shrink-0">
                      {formatDateHR(
                        `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}-${String(event.date.getDate()).padStart(2, '0')}`
                      )}
                    </span>
                  </div>

                  {/* Days Until - Hidden on small screens */}
                  <div className="flex-shrink-0 hidden md:block">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      {formatDaysUntil(event.daysUntil)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

