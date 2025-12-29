import { Person } from '../../types/family'

interface FamilyLinksProps {
  parent?: Person | null
  children?: Person[]
  onPersonClick: (personId: string) => void
}

export default function FamilyLinks({ parent, children = [], onPersonClick }: FamilyLinksProps) {
  return (
    <>
      {/* Parent */}
      {parent && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
            Roditelj
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPersonClick(parent.id)
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
          >
            {parent.name}
            {parent.birthdate && (
              <span className="text-gray-500 ml-2">
                '{String(new Date(parent.birthdate).getFullYear()).slice(-2)}
              </span>
            )}
            {parent.deceasedDate && <span className="ml-1 text-gray-500">✝</span>}
          </button>
        </div>
      )}

      {/* Children */}
      {children.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
            Djeca
          </h3>
          <div className="space-y-1">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={(e) => {
                  e.stopPropagation()
                  onPersonClick(child.id)
                }}
                className="block text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
              >
                {child.name}
                {child.birthdate && (
                  <span className="text-gray-500 ml-2">
                    '{String(new Date(child.birthdate).getFullYear()).slice(-2)}
                  </span>
                )}
                {child.deceasedDate && <span className="ml-1 text-gray-500">✝</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

