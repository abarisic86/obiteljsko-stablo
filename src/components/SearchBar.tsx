import { useState, useRef, useEffect } from 'react'
import { Person } from '../types/family'

interface SearchBarProps {
  people: Person[]
  onPersonSelect: (personId: string) => void
}

export default function SearchBar({ people, onPersonSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter people based on search query (case-insensitive)
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10) // Limit to 10 results

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length > 0)
    setSelectedIndex(-1)
  }

  // Handle person selection
  const handlePersonSelect = (person: Person) => {
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    onPersonSelect(person.id)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredPeople.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < filteredPeople.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredPeople.length) {
          handlePersonSelect(filteredPeople[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Highlight matching text in name
  const highlightMatch = (name: string, query: string) => {
    if (!query) return name

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = name.split(regex)

    return parts.map((part, index) =>
      index % 2 === 1 ? ( // Odd indices are the matched parts
        <mark key={index} className="bg-yellow-200">{part}</mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="relative w-full max-w-md mx-auto mb-4 px-4 sm:px-6 lg:px-8 z-50">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder="Pretraži osobe..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-auto"
        >
          {filteredPeople.length > 0 ? (
            filteredPeople.map((person, index) => (
              <button
                key={person.id}
                onClick={() => handlePersonSelect(person)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {highlightMatch(person.name, query)}
                  </span>
                  {person.birthdate && (
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(person.birthdate).getFullYear()}
                      {person.deceasedDate && ` - ${new Date(person.deceasedDate).getFullYear()}`}
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : query.length > 0 ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              Nema rezultata za "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
