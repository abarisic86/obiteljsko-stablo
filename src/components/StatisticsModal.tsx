import { Person } from '../types/family'
import { formatDateHR } from '../utils/personUtils'

interface StatisticsModalProps {
  people: Person[]
  onClose: () => void
}

interface FamilyStatistics {
  totalPeople: number
  totalSpouses: number
  totalPhotos: number
  totalAddresses: number
  totalPhoneNumbers: number
  oldestLiving: Person | null
  youngestLiving: Person | null
}

function calculateStatistics(people: Person[]): FamilyStatistics {
  const totalPeople = people.length
  const totalSpouses = people.filter(p => p.spouseId).length
  const totalPhotos = people.filter(p => p.photoUrl && p.photoUrl.trim() !== '').length
  const totalAddresses = people.filter(p => p.streetAddress && p.streetAddress.trim() !== '').length
  const totalPhoneNumbers = people.filter(p => p.phoneNumber && p.phoneNumber.trim() !== '').length
  
  const livingPeople = people.filter(p => !p.deceasedDate && p.birthdate)
  
  let oldestLiving: Person | null = null
  let youngestLiving: Person | null = null
  
  if (livingPeople.length > 0) {
    oldestLiving = livingPeople.reduce((oldest, current) => {
      if (!oldest.birthdate) return current
      if (!current.birthdate) return oldest
      return new Date(current.birthdate) < new Date(oldest.birthdate) ? current : oldest
    })
    
    youngestLiving = livingPeople.reduce((youngest, current) => {
      if (!youngest.birthdate) return current
      if (!current.birthdate) return youngest
      return new Date(current.birthdate) > new Date(youngest.birthdate) ? current : youngest
    })
  }
  
  return {
    totalPeople,
    totalSpouses,
    totalPhotos,
    totalAddresses,
    totalPhoneNumbers,
    oldestLiving,
    youngestLiving,
  }
}

function calculateAge(birthdate: string): number {
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export default function StatisticsModal({ people, onClose }: StatisticsModalProps) {
  const stats = calculateStatistics(people)
  
  const spousePercentage = stats.totalPeople > 0 
    ? Math.round((stats.totalSpouses / stats.totalPeople) * 100) 
    : 0
  const photoPercentage = stats.totalPeople > 0 
    ? Math.round((stats.totalPhotos / stats.totalPeople) * 100) 
    : 0
  const addressPercentage = stats.totalPeople > 0 
    ? Math.round((stats.totalAddresses / stats.totalPeople) * 100) 
    : 0
  const phonePercentage = stats.totalPeople > 0 
    ? Math.round((stats.totalPhoneNumbers / stats.totalPeople) * 100) 
    : 0
  
  const oldestAge = stats.oldestLiving?.birthdate ? calculateAge(stats.oldestLiving.birthdate) : null
  const youngestAge = stats.youngestLiving?.birthdate ? calculateAge(stats.youngestLiving.birthdate) : null

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
            Statistika obitelji
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Oldest Living */}
          {stats.oldestLiving ? (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Najstariji živući član</div>
              <div className="text-xl font-bold text-gray-800 mb-1">
                {stats.oldestLiving.name}
              </div>
              {stats.oldestLiving.birthdate && (
                <>
                  <div className="text-sm text-gray-600">
                    Rođen/a: {formatDateHR(stats.oldestLiving.birthdate)}
                  </div>
                  {oldestAge !== null && (
                    <div className="text-lg font-semibold text-blue-700 mt-2">
                      {oldestAge} {oldestAge === 1 ? 'godina' : oldestAge < 5 ? 'godine' : 'godina'}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Najstariji živući član</div>
              <div className="text-gray-500">Nema podataka</div>
            </div>
          )}

          {/* Youngest Living */}
          {stats.youngestLiving ? (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Najmlađi živući član</div>
              <div className="text-xl font-bold text-gray-800 mb-1">
                {stats.youngestLiving.name}
              </div>
              {stats.youngestLiving.birthdate && (
                <>
                  <div className="text-sm text-gray-600">
                    Rođen/a: {formatDateHR(stats.youngestLiving.birthdate)}
                  </div>
                  {youngestAge !== null && (
                    <div className="text-lg font-semibold text-green-700 mt-2">
                      {youngestAge} {youngestAge === 1 ? 'godina' : youngestAge < 5 ? 'godine' : 'godina'}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Najmlađi živući član</div>
              <div className="text-gray-500">Nema podataka</div>
            </div>
          )}

          {/* Total People */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Ukupan broj unosa</div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalPeople}</div>
          </div>

          {/* Total Spouses */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Osobe s supružnikom</div>
            <div className="text-3xl font-bold text-gray-800">{spousePercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalSpouses} od {stats.totalPeople} unosa
            </div>
          </div>

          {/* Total Photos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Osobe s fotografijom</div>
            <div className="text-3xl font-bold text-gray-800">{photoPercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalPhotos} od {stats.totalPeople} unosa
            </div>
          </div>

          {/* Total Addresses */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Osobe s adresom</div>
            <div className="text-3xl font-bold text-gray-800">{addressPercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalAddresses} od {stats.totalPeople} unosa
            </div>
          </div>

          {/* Total Phone Numbers */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Osobe s brojem telefona</div>
            <div className="text-3xl font-bold text-gray-800">{phonePercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalPhoneNumbers} od {stats.totalPeople} unosa
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

