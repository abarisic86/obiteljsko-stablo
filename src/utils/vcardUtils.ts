import { Person } from '../types/family'

export function generateVCard(person: Person): string {
  const nameParts = person.name.trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${person.name}`,
    `N:${lastName};${firstName};;;`,
  ]

  if (person.phoneNumber) {
    lines.push(`TEL;TYPE=CELL:${person.phoneNumber}`)
  }

  if (person.streetAddress) {
    lines.push(`ADR;TYPE=HOME:;;${person.streetAddress};;;;`)
  }

  if (person.birthdate) {
    const date = new Date(person.birthdate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    lines.push(`BDAY:${year}-${month}-${day}`)
  }

  if (person.deceasedDate) {
    const date = new Date(person.deceasedDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    lines.push(`DEATHDATE:${year}-${month}-${day}`)
  }

  lines.push('END:VCARD')

  return lines.join('\r\n')
}

export function downloadVCard(person: Person): void {
  const vcardContent = generateVCard(person)

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (isIOS) {
    const dataUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcardContent)}`
    const link = document.createElement('a')
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${person.name.replace(/\s+/g, '_')}.vcf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  }
}
