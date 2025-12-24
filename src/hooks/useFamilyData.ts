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
    async function fetchData(url: string): Promise<{ success: boolean; error?: string }> {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText}`
          )
        }

        const csvText = await response.text()
        if (!csvText || csvText.trim().length === 0) {
          throw new Error('Empty response from data source')
        }

        const people = parseSheetData(csvText)

        if (people.length === 0) {
          throw new Error('No data found after parsing')
        }

        const treeStructure = buildTreeStructure(people)
        if (!treeStructure) {
          throw new Error('Failed to build tree structure')
        }

        setTree(treeStructure)
        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error(`Failed to fetch from ${url}:`, errorMessage)
        return { success: false, error: errorMessage }
      }
    }

    async function loadData() {
      setLoading(true)
      setError(null)

      // Try primary URL first if provided
      if (primaryUrl) {
        const primaryResult = await fetchData(primaryUrl)
        if (primaryResult.success) {
          setLoading(false)
          return
        }
        // If primary URL failed, try fallback
        if (fallbackUrl) {
          const fallbackResult = await fetchData(fallbackUrl)
          if (fallbackResult.success) {
            setLoading(false)
            setError(null) // Clear error since fallback succeeded
            return
          }
          // Both failed - show detailed error
          setError(
            `Failed to load data: Primary (${primaryResult.error || 'unknown error'}), Fallback (${fallbackResult.error || 'unknown error'})`
          )
        } else {
          setError(`Failed to load data from primary source: ${primaryResult.error || 'unknown error'}`)
        }
        setTree(null)
      } else if (fallbackUrl) {
        // No primary URL, use fallback directly
        const fallbackResult = await fetchData(fallbackUrl)
        if (!fallbackResult.success) {
          setError(`Failed to load data from fallback source: ${fallbackResult.error || 'unknown error'}`)
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

