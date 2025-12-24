import { useState, useEffect } from 'react'
import { FamilyNode } from '../types/family'
import { parseSheetData } from '../utils/parseSheetData'
import { buildTreeStructure } from '../utils/buildTreeStructure'

interface UseFamilyDataOptions {
  primaryUrl?: string | null
  fallbackUrl?: string
}

export function useFamilyData({ primaryUrl, fallbackUrl = '/test-data.csv' }: UseFamilyDataOptions) {
  const [tree, setTree] = useState<FamilyNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData(url: string): Promise<boolean> {
      try {
        const response = await fetch(url)
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
        return true
      } catch (err) {
        return false
      }
    }

    async function loadData() {
      setLoading(true)
      setError(null)

      // Try primary URL first if provided
      if (primaryUrl) {
        const success = await fetchData(primaryUrl)
        if (success) {
          setLoading(false)
          return
        }
        // If primary URL failed, try fallback
        if (fallbackUrl) {
          const fallbackSuccess = await fetchData(fallbackUrl)
          if (fallbackSuccess) {
            setLoading(false)
            setError(null) // Clear error since fallback succeeded
            return
          }
        }
        // Both failed
        setError('Failed to load data from both primary source and fallback')
        setTree(null)
      } else if (fallbackUrl) {
        // No primary URL, use fallback directly
        const success = await fetchData(fallbackUrl)
        if (!success) {
          setError('Failed to load data from fallback source')
          setTree(null)
        }
      } else {
        setError('No data source configured')
        setTree(null)
      }

      setLoading(false)
    }

    loadData()
  }, [primaryUrl, fallbackUrl])

  return { tree, loading, error }
}

