import { useMemo } from 'react'
import { FamilyNode, PersonPosition } from '../types/family'

const CARD_WIDTH = 140
const CARD_HEIGHT = 180
const COLUMN_SPACING = 200
const ROW_SPACING = 220

export function useTreeLayout(rootNode: FamilyNode) {
  return useMemo(() => {
    const generations: FamilyNode[][] = []
    const positions = new Map<string, PersonPosition>()

    // Traverse tree and organize by generation
    function traverse(node: FamilyNode, generation: number) {
      if (!generations[generation]) {
        generations[generation] = []
      }
      generations[generation].push(node)

      // Calculate position
      const genIndex = generation
      const rowIndex = generations[generation].length - 1
      
      // Count siblings at same level
      const siblingsInGen = generations[generation].length
      
      // Center vertically within generation
      const totalHeight = siblingsInGen * ROW_SPACING
      const startY = -totalHeight / 2 + ROW_SPACING / 2
      
      const x = genIndex * COLUMN_SPACING
      const y = startY + rowIndex * ROW_SPACING

      positions.set(node.id, {
        id: node.id,
        x,
        y,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      })

      // Process children
      node.children.forEach((child) => {
        traverse(child, generation + 1)
      })
    }

    traverse(rootNode, 0)

    // Calculate bounds
    let minX = 0
    let maxX = 0
    let minY = 0
    let maxY = 0

    positions.forEach((pos) => {
      minX = Math.min(minX, pos.x)
      maxX = Math.max(maxX, pos.x + pos.width)
      minY = Math.min(minY, pos.y)
      maxY = Math.max(maxY, pos.y + pos.height)
    })

    return {
      generations,
      positions,
      bounds: {
        width: maxX - minX + COLUMN_SPACING,
        height: maxY - minY + ROW_SPACING,
        minX,
        minY,
      },
    }
  }, [rootNode])
}

