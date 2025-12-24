import { FamilyNode, PersonPosition } from '../types/family'

interface ConnectionLinesProps {
  generations: FamilyNode[][]
  positions: Map<string, PersonPosition>
  zoomLevel: number
}

const CARD_WIDTH = 140
const COLUMN_SPACING = 200
const ROW_SPACING = 220

export default function ConnectionLines({ generations, positions, zoomLevel }: ConnectionLinesProps) {
  if (zoomLevel < 0.2) return null // Hide lines when very zoomed out

  const lines: JSX.Element[] = []

  // Draw lines from parents to children
  for (let genIndex = 0; genIndex < generations.length - 1; genIndex++) {
    const parentGen = generations[genIndex]
    const childGen = generations[genIndex + 1]

    parentGen.forEach((parent, parentIndex) => {
      const parentPos = positions.get(parent.id)
      if (!parentPos) return

      // Calculate parent center (accounting for column layout)
      const parentX = parentPos.x + CARD_WIDTH / 2
      const parentY = parentPos.y + 90 // Middle of card

      parent.children.forEach((child) => {
        // Find child's position in next generation
        const childIndexInGen = childGen.findIndex((n) => n.id === child.id)
        if (childIndexInGen === -1) return

        const childPos = positions.get(child.id)
        if (!childPos) return

        // Calculate child center
        const childX = childPos.x + CARD_WIDTH / 2
        const childY = childPos.y + 90 // Middle of card

        // Create bezier curve for smoother lines
        const midX = (parentX + childX) / 2
        const path = `M ${parentX} ${parentY} C ${midX} ${parentY}, ${midX} ${childY}, ${childX} ${childY}`

        lines.push(
          <path
            key={`${parent.id}-${child.id}`}
            d={path}
            stroke="#94a3b8"
            strokeWidth={zoomLevel > 0.5 ? 2 : 1}
            fill="none"
            strokeDasharray={zoomLevel < 0.4 ? '3,3' : '0'}
            opacity={zoomLevel > 0.3 ? 0.6 : 0.3}
          />
        )
      })
    })
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      {lines}
    </svg>
  )
}

