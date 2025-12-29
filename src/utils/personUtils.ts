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

export function formatDateHR(date: string): string {
  return new Date(date).toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export interface UpcomingEvent {
  person: Person
  eventType: 'birthday' | 'anniversary'
  daysUntil: number
  date: Date
}

export function getUpcomingEvents(people: Person[], count: number = 10): UpcomingEvent[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const events: UpcomingEvent[] = []
  
  for (const person of people) {
    // Handle birthdays for living people
    if (person.birthdate && !person.deceasedDate) {
      try {
        const birthDate = new Date(person.birthdate)
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
        
        // If birthday already passed this year, check next year
        const nextBirthday = thisYearBirthday < today
          ? new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
          : thisYearBirthday
        
        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntil >= 0) {
          events.push({
            person,
            eventType: 'birthday',
            daysUntil,
            date: nextBirthday,
          })
        }
      } catch {
        // Skip invalid dates
      }
    }
    
    // Handle death anniversaries for deceased people
    if (person.deceasedDate) {
      try {
        const deathDate = new Date(person.deceasedDate)
        const thisYearAnniversary = new Date(today.getFullYear(), deathDate.getMonth(), deathDate.getDate())
        
        // If anniversary already passed this year, check next year
        const nextAnniversary = thisYearAnniversary < today
          ? new Date(today.getFullYear() + 1, deathDate.getMonth(), deathDate.getDate())
          : thisYearAnniversary
        
        const daysUntil = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntil >= 0) {
          events.push({
            person,
            eventType: 'anniversary',
            daysUntil,
            date: nextAnniversary,
          })
        }
      } catch {
        // Skip invalid dates
      }
    }
  }
  
  // Sort by days until event, then by date
  events.sort((a, b) => {
    if (a.daysUntil !== b.daysUntil) {
      return a.daysUntil - b.daysUntil
    }
    return a.date.getTime() - b.date.getTime()
  })
  
  // Return top N events
  return events.slice(0, count)
}

