import { Person } from '../types/family'

export function isBirthdaySoon(birthdate: string | null, deceasedDate: string | null): boolean {
  if (!birthdate || deceasedDate) return false

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const birthDate = new Date(birthdate)
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    
    // If birthday already passed this year, check next year
    const nextBirthday = thisYearBirthday < today
      ? new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
      : thisYearBirthday
    
    // Calculate days until birthday
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilBirthday >= 0 && daysUntilBirthday <= 7
  } catch {
    return false
  }
}

export function isOver30WithoutSpouse(person: Person): boolean {
  if (!person.birthdate || person.deceasedDate || person.spouseId) return false

  try {
    const today = new Date()
    const birthDate = new Date(person.birthdate)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age
    return actualAge > 30
  } catch {
    return false
  }
}

export function formatDateHR(date: string): string {
  return new Date(date).toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

