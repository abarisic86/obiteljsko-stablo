import { useState } from 'react'
import FamilyTree from './components/FamilyTree'
import { useFamilyData } from './hooks/useFamilyData'

// Primary data source: Google Sheets CSV export URL
// For Google Sheets: File > Share > Publish to web > CSV format
// If this URL fails or doesn't exist, the app will automatically fall back to test-data.csv
const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0'

// Fallback data source: Local test data file (used if primary URL fails)
const FALLBACK_DATA_URL = '/test-data.csv'

function App() {
  const { tree, loading, error } = useFamilyData({
    primaryUrl: GOOGLE_SHEETS_URL !== 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0' 
      ? GOOGLE_SHEETS_URL 
      : null,
    fallbackUrl: FALLBACK_DATA_URL,
  })
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Učitavanje obiteljskog stabla...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Greška</h2>
          <p className="text-gray-700">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Provjerite da je izvor podataka (CSV datoteka ili Google Sheets URL) ispravan i dostupan.
          </p>
        </div>
      </div>
    )
  }

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Nema podataka za prikaz.</p>
        </div>
      </div>
    )
  }

  return (
    <FamilyTree
      rootNode={tree}
      selectedPersonId={selectedPersonId}
      onPersonSelect={setSelectedPersonId}
    />
  )
}

export default App

