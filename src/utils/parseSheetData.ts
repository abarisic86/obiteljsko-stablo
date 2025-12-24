import Papa from 'papaparse'
import { Person } from '../types/family'

export interface SheetRow {
  id: string
  name: string
  birthdate: string
  photo_url: string
  parent_id: string
  spouse_id: string
  street_address: string
  phone_number: string
  deceased_date: string
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

      // Handle misaligned fields due to commas in street_address field
      // If generation is missing but __parsed_extra exists, reconstruct fields
      let streetAddress = row.street_address?.trim() || ''
      let phoneNumber = row.phone_number?.trim() || ''
      let deceasedDate = row.deceased_date?.trim() || ''
      let generation = row.generation?.trim() || ''
      
      // If generation is empty but we have __parsed_extra, the street_address field was split
      if (!generation && row.__parsed_extra && Array.isArray(row.__parsed_extra)) {
        // Reconstruct: street_address was split, phone_number got street_address part, generation is in __parsed_extra
        if (row.__parsed_extra.length > 0) {
          generation = row.__parsed_extra[0]?.trim() || ''
        }
        // If phone_number looks like it contains address info (starts with space or comma), merge it
        if (phoneNumber && (phoneNumber.startsWith(' ') || phoneNumber.startsWith(','))) {
          streetAddress = streetAddress + phoneNumber
          phoneNumber = row.__parsed_extra[1]?.trim() || ''
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
          streetAddress: streetAddress,
          phoneNumber: phoneNumber,
          deceasedDate: deceasedDate,
          generation: parseInt(generation || '0', 10),
        }
      } catch (error) {
        console.error('Error parsing row:', row, error)
        return null
      }
    })
    .filter((person): person is Person => person !== null) // Remove any null entries
}

