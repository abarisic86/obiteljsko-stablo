export function addToCalendar(name: string, birthdate: string): void {
  const birthDate = new Date(birthdate)
  const year = birthDate.getFullYear()
  const month = String(birthDate.getMonth() + 1).padStart(2, '0')
  const day = String(birthDate.getDate()).padStart(2, '0')
  
  // Format date as YYYYMMDD for ICS format
  const dateStr = `${year}${month}${day}`
  
  // Create ICS file content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Family Tree//Birthday Event//EN',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:${name} - Rođendan`,
    `DESCRIPTION:Rođendan ${name}`,
    'RRULE:FREQ=YEARLY;INTERVAL=1',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  
  // Detect iOS devices
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  
  if (isIOS) {
    // On iOS, use data URL without download attribute
    // This should trigger the calendar app to open directly
    const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
    const link = document.createElement('a')
    link.href = dataUrl
    // Don't use download attribute on iOS - let the system handle it
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    // On Android and desktop, use blob URL with download attribute
    // Android will typically offer to open with calendar app
    // Desktop will download but user can open with calendar app
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${name.replace(/\s+/g, '_')}_birthday.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the blob URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  }
}

export function getGoogleMapsUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address)
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
}

