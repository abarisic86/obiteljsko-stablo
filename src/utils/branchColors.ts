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
 * Traverses from root down, assigning branch indices to level 1 children and their descendants.
 */
function buildBranchIndexMap(rootNode: FamilyNode): Map<string, number> {
  const branchMap = new Map<string, number>()

  // Root has no branch index
  branchMap.set(rootNode.id, -1)
  if (rootNode.spouse) {
    branchMap.set(rootNode.spouse.id, -1)
  }

  // Traverse each level 1 branch and assign indices
  rootNode.children.forEach((level1Child, branchIndex) => {
    function assignBranchToDescendants(node: FamilyNode, branchIdx: number) {
      branchMap.set(node.id, branchIdx)
      if (node.spouse) {
        branchMap.set(node.spouse.id, branchIdx)
      }
      node.children.forEach(child => assignBranchToDescendants(child, branchIdx))
    }

    assignBranchToDescendants(level1Child, branchIndex)
  })

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
  // Generation 1: base lightness (75%)
  // Generation 2: lighter (+5% = 80%)
  // Generation 3+: even lighter (+10% = 85%, capped at 95%)
  let lightness = baseColor.l
  if (generation === 1) {
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

  function traverse(node: FamilyNode) {
    const branchIndex = branchIndexMap.get(node.id) ?? -1
    const color = getBranchColor(branchIndex, node.generation)
    colorMap.set(node.id, color)

    // Also set color for spouse if exists
    if (node.spouse) {
      const spouseBranchIndex = branchIndexMap.get(node.spouse.id) ?? -1
      const spouseColor = getBranchColor(spouseBranchIndex, node.spouse.generation)
      colorMap.set(node.spouse.id, spouseColor)
    }

    // Traverse children
    node.children.forEach(child => traverse(child))
  }

  traverse(rootNode)
  return colorMap
}

