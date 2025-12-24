import Papa from 'papaparse'
import { Person } from '../types/family'

export interface SheetRow {
  id: string
  name: string
  birthdate: string
  photo_url: string
  parent_id: string
  spouse_id: string
  location: string
  contact: string
  generation: string
}

export function parseSheetData(csvText: string): Person[] {
  const result = Papa.parse<SheetRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      // Normalize header names to handle variations
      const normalized = header.trim().toLowerCase().replace(/\s+/g, '_')
      return normalized
    },
  })

  if (result.errors.length > 0) {
    console.warn('CSV parsing errors:', result.errors)
  }

  return result.data
    .filter((row) => row.id && row.name) // Filter out empty rows
    .map((row) => ({
      id: row.id.trim(),
      name: row.name.trim(),
      birthdate: row.birthdate?.trim() || '',
      photoUrl: row.photo_url?.trim() || '',
      parentId: row.parent_id?.trim() || null,
      spouseId: row.spouse_id?.trim() || null,
      location: row.location?.trim() || '',
      contact: row.contact?.trim() || '',
      generation: parseInt(row.generation?.trim() || '0', 10),
    }))
}

