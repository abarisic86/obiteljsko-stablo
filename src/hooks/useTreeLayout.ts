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
      
      // Center vertically within generation (centered around 0)
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
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    positions.forEach((pos) => {
      minX = Math.min(minX, pos.x)
      maxX = Math.max(maxX, pos.x + pos.width)
      minY = Math.min(minY, pos.y)
      maxY = Math.max(maxY, pos.y + pos.height)
    })

    // Calculate center of the tree
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // Adjust positions to center the tree at origin (0, 0)
    const adjustedPositions = new Map<string, PersonPosition>()
    positions.forEach((pos, id) => {
      adjustedPositions.set(id, {
        ...pos,
        x: pos.x - centerX,
        y: pos.y - centerY,
      })
    })

    // Recalculate bounds after centering
    let adjMinX = Infinity
    let adjMaxX = -Infinity
    let adjMinY = Infinity
    let adjMaxY = -Infinity

    adjustedPositions.forEach((pos) => {
      adjMinX = Math.min(adjMinX, pos.x)
      adjMaxX = Math.max(adjMaxX, pos.x + pos.width)
      adjMinY = Math.min(adjMinY, pos.y)
      adjMaxY = Math.max(adjMaxY, pos.y + pos.height)
    })

    return {
      generations,
      positions: adjustedPositions,
      bounds: {
        width: adjMaxX - adjMinX + COLUMN_SPACING,
        height: adjMaxY - adjMinY + ROW_SPACING,
        minX: adjMinX,
        minY: adjMinY,
        centerX: 0, // Tree is now centered at origin
        centerY: 0,
      },
    }
  }, [rootNode])
}

