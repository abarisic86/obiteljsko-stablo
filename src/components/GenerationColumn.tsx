import { memo, useRef, useEffect } from 'react'
import { FamilyNode, Person } from '../types/family'
import PersonCard from './PersonCard'

interface GenerationColumnProps {
  nodes: FamilyNode[]
  onPersonClick: (person: Person) => void
  zoomLevel: number
  onCardPositionUpdate?: (personId: string, rect: DOMRect) => void
}

function GenerationColumn({ nodes, onPersonClick, zoomLevel, onCardPositionUpdate }: GenerationColumnProps) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (!onCardPositionUpdate) return

    const updatePositions = () => {
      cardRefs.current.forEach((element, personId) => {
        if (element) {
          const rect = element.getBoundingClientRect()
          const container = element.closest('[data-tree-container]')
          if (container) {
            const containerRect = container.getBoundingClientRect()
            const relativeRect = new DOMRect(
              rect.left - containerRect.left,
              rect.top - containerRect.top,
              rect.width,
              rect.height
            )
            onCardPositionUpdate(personId, relativeRect)
          }
        }
      })
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      updatePositions()
    })

    // Also update on resize and zoom changes
    window.addEventListener('resize', updatePositions)
    
    // Update positions when zoom level changes
    const timeoutId = setTimeout(() => {
      updatePositions()
    }, 100)
    
    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePositions)
    }
  }, [onCardPositionUpdate, nodes, zoomLevel])

  return (
    <div className="flex flex-col items-center gap-4 px-2">
      {nodes.map((node) => (
        <div key={node.id} className="flex flex-col items-center gap-2">
          <PersonCard
            ref={(el) => {
              if (el) cardRefs.current.set(node.id, el)
              else cardRefs.current.delete(node.id)
            }}
            person={node}
            onClick={() => onPersonClick(node)}
            zoomLevel={zoomLevel}
          />
        </div>
      ))}
    </div>
  )
}

export default memo(GenerationColumn)

