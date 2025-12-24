import { useState, useEffect } from 'react'
import { FamilyNode } from '../types/family'
import { parseSheetData } from '../utils/parseSheetData'
import { buildTreeStructure } from '../utils/buildTreeStructure'

export function useFamilyData(sheetUrl: string) {
  const [tree, setTree] = useState<FamilyNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(sheetUrl)
        if (!response.ok) {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText}`
          )
        }

        const csvText = await response.text()
        const people = parseSheetData(csvText)

        if (people.length === 0) {
          throw new Error('No data found in the sheet')
        }

        const treeStructure = buildTreeStructure(people)
        setTree(treeStructure)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An unknown error occurred while loading data'
        )
        setTree(null)
      } finally {
        setLoading(false)
      }
    }

    if (sheetUrl && sheetUrl !== 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0') {
      fetchData()
    } else {
      setError('Please configure the Google Sheets URL in App.tsx')
      setLoading(false)
    }
  }, [sheetUrl])

  return { tree, loading, error }
}

