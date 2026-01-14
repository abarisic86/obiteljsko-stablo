import { FamilyNode } from '../types/family'

// 9 distinct pastel base colors in HSL format for level 1 branches
const BASE_COLORS = [
  { h: 0, s: 45, l: 75 },    // Pastel Red
  { h: 30, s: 45, l: 75 },   // Pastel Orange
  { h: 60, s: 45, l: 75 },   // Pastel Yellow
  { h: 120, s: 45, l: 75 },  // Pastel Green
  { h: 180, s: 45, l: 75 },  // Pastel Cyan
  { h: 210, s: 45, l: 75 },  // Pastel Blue
  { h: 270, s: 45, l: 75 },  // Pastel Purple
  { h: 300, s: 45, l: 75 },  // Pastel Magenta
  { h: 330, s: 45, l: 75 },  // Pastel Pink
]

/**
 * Builds a map of person IDs to their branch indices.
 * Assigns branch indices based on generation 1 nodes (the main family branches).
 */
function buildBranchIndexMap(rootNode: FamilyNode): Map<string, number> {
  const branchMap = new Map<string, number>()

  // Find all generation 1 nodes - these are the main branches
  const generation1Nodes: FamilyNode[] = []

  function findGeneration1(node: FamilyNode) {
    if (node.generation === 1) {
      generation1Nodes.push(node)
    } else if (node.generation < 1) {
      // Continue searching in children
      node.children.forEach(child => findGeneration1(child))
    }
  }

  findGeneration1(rootNode)

  // Assign branch indices to generation 1 nodes and their descendants
  generation1Nodes.forEach((gen1Node, branchIndex) => {
    function assignBranchToDescendants(node: FamilyNode, branchIdx: number) {
      branchMap.set(node.id, branchIdx)
      if (node.spouse) {
        branchMap.set(node.spouse.id, branchIdx)
      }
      node.children.forEach(child => assignBranchToDescendants(child, branchIdx))
    }

    assignBranchToDescendants(gen1Node, branchIndex)
  })

  // Mark generation 0 and below as no branch color
  function markAncestors(node: FamilyNode) {
    if (node.generation <= 0) {
      branchMap.set(node.id, -1)
      if (node.spouse) {
        branchMap.set(node.spouse.id, -1)
      }
      node.children.forEach(child => {
        if (child.generation <= 0) {
          markAncestors(child)
        }
      })
    }
  }

  markAncestors(rootNode)

  return branchMap
}

/**
 * Gets the branch color for a person based on their branch index and generation.
 * Returns HSL color string or null if no branch color should be applied.
 */
export function getBranchColor(branchIndex: number, generation: number): string | null {
  // No color for root (generation 0) or if branch not found
  if (branchIndex < 0 || generation === 0) {
    return null
  }

  const baseColor = BASE_COLORS[branchIndex % BASE_COLORS.length]

  // Calculate lightness based on generation depth
  // Negative generations (ancestors): darker
  // Generation 1: base lightness (75%)
  // Generation 2: lighter (+5% = 80%)
  // Generation 3+: even lighter (+10% = 85%, capped at 95%)
  let lightness = baseColor.l
  if (generation < 0) {
    // Ancestors get slightly darker colors
    lightness = Math.max(baseColor.l - 10, 50)
  } else if (generation === 1) {
    lightness = baseColor.l
  } else if (generation === 2) {
    lightness = Math.min(baseColor.l + 5, 95)
  } else {
    lightness = Math.min(baseColor.l + 10, 95)
  }

  return `hsl(${baseColor.h}, ${baseColor.s}%, ${lightness}%)`
}

/**
 * Builds a map of person IDs to their branch colors.
 * This is more efficient than calculating on every render.
 */
export function buildBranchColorMap(rootNode: FamilyNode): Map<string, string | null> {
  const colorMap = new Map<string, string | null>()
  const branchIndexMap = buildBranchIndexMap(rootNode)

  function traverse(node: FamilyNode, inheritedBranchIndex?: number) {
    const branchIndex = branchIndexMap.get(node.id) ?? inheritedBranchIndex ?? -1
    const color = getBranchColor(branchIndex, node.generation)
    colorMap.set(node.id, color)

    // Also set color for spouse if exists
    if (node.spouse) {
      const spouseBranchIndex = branchIndexMap.get(node.spouse.id) ?? branchIndex
      const spouseColor = getBranchColor(spouseBranchIndex, node.spouse.generation)
      colorMap.set(node.spouse.id, spouseColor)
    }

    // Traverse spouse parents (ancestors of spouse)
    if (node.spouseParents) {
      traverseSpouseParents(node.spouseParents, branchIndex)
    }

    // Traverse children
    node.children.forEach(child => traverse(child))
  }

  function traverseSpouseParents(node: FamilyNode, branchIndex: number) {
    const color = getBranchColor(branchIndex, node.generation)
    colorMap.set(node.id, color)

    if (node.spouse) {
      const spouseColor = getBranchColor(branchIndex, node.spouse.generation)
      colorMap.set(node.spouse.id, spouseColor)
    }

    // Recursively traverse if there are more ancestors
    node.children.forEach(child => traverseSpouseParents(child, branchIndex))
  }

  traverse(rootNode)
  return colorMap
}

