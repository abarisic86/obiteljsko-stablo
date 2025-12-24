import { memo } from 'react'
import { FamilyNode, Person } from '../types/family'
import PersonCard from './PersonCard'

interface GenerationColumnProps {
  nodes: FamilyNode[]
  onPersonClick: (person: Person) => void
  zoomLevel: number
}

function GenerationColumn({ nodes, onPersonClick, zoomLevel }: GenerationColumnProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-2">
      {nodes.map((node) => (
        <div key={node.id} className="flex flex-col items-center gap-2">
          {/* Family unit: person + spouse */}
          <div className="flex items-center gap-2">
            <PersonCard
              person={node}
              onClick={() => onPersonClick(node)}
              zoomLevel={zoomLevel}
            />
            {node.spouse && (
              <>
                <div className="text-gray-400 text-xs">+</div>
                <PersonCard
                  person={node.spouse}
                  onClick={() => onPersonClick(node.spouse!)}
                  zoomLevel={zoomLevel}
                />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default memo(GenerationColumn)

