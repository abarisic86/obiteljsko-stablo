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
    // Handle extra fields gracefully
    skipEmptyLines: 'greedy',
  })

  if (result.errors.length > 0) {
    console.warn('CSV parsing errors:', result.errors)
  }

  return result.data
    .filter((row) => row && row.id && row.name && row.id.trim() && row.name.trim()) // Filter out empty rows
    .map((row: any) => {
      if (!row || !row.id || !row.name) {
        console.warn('Skipping invalid row:', row)
        return null
      }

      // Handle misaligned fields due to commas in location field
      // If generation is missing but __parsed_extra exists, reconstruct fields
      let location = row.location?.trim() || ''
      let contact = row.contact?.trim() || ''
      let generation = row.generation?.trim() || ''
      
      // If generation is empty but we have __parsed_extra, the location field was split
      if (!generation && row.__parsed_extra && Array.isArray(row.__parsed_extra)) {
        // Reconstruct: location was split, contact got location part, generation is in __parsed_extra
        if (row.__parsed_extra.length > 0) {
          generation = row.__parsed_extra[0]?.trim() || ''
        }
        // If contact looks like it contains location info (starts with space or comma), merge it
        if (contact && (contact.startsWith(' ') || contact.startsWith(','))) {
          location = location + contact
          contact = row.__parsed_extra[1]?.trim() || ''
        }
      }

      const parentId = row.parent_id?.trim()
      const spouseId = row.spouse_id?.trim()
      
      try {
        return {
          id: row.id.trim(),
          name: row.name.trim(),
          birthdate: row.birthdate?.trim() || '',
          photoUrl: row.photo_url?.trim() || '',
          parentId: parentId && parentId.length > 0 ? parentId : null,
          spouseId: spouseId && spouseId.length > 0 ? spouseId : null,
          location: location,
          contact: contact,
          generation: parseInt(generation || '0', 10),
        }
      } catch (error) {
        console.error('Error parsing row:', row, error)
        return null
      }
    })
    .filter((person): person is Person => person !== null) // Remove any null entries
}

