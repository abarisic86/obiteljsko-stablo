import { Person } from '../../types/family'

interface PersonPhotoProps {
  person: Person
  size?: 'small' | 'large'
}

export default function PersonPhoto({ person, size = 'large' }: PersonPhotoProps) {
  const sizeClasses = size === 'small' ? 'w-24 h-24 text-2xl' : 'w-32 h-32 text-3xl'

  if (!person.photoUrl) return null

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent && !parent.querySelector('.initials')) {
      const initials = person.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      const initialsDiv = document.createElement('div')
      initialsDiv.className = `initials flex items-center justify-center w-full h-full text-gray-600 font-bold ${sizeClasses}`
      initialsDiv.textContent = initials
      parent.appendChild(initialsDiv)
    }
  }

  return (
    <div className={`${sizeClasses} mx-auto rounded-full overflow-hidden bg-gray-200`}>
      <img
        src={person.photoUrl}
        alt={person.name}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    </div>
  )
}

