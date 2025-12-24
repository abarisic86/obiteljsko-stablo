import { Person, FamilyNode } from '../types/family'

export function buildTreeStructure(people: Person[]): FamilyNode | null {
  if (people.length === 0) return null

  // Create a map for quick lookup
  const personMap = new Map<string, Person>()
  people.forEach((person) => {
    personMap.set(person.id, person)
  })

  // Create spouse map (bidirectional)
  const spouseMap = new Map<string, Person>()
  people.forEach((person) => {
    if (person.spouseId) {
      const spouse = personMap.get(person.spouseId)
      if (spouse) {
        spouseMap.set(person.id, spouse)
        // Also map the reverse relationship
        spouseMap.set(spouse.id, person)
      }
    }
  })

  // Find root nodes (people with no parent or parent not in the dataset)
  const rootNodes = people.filter(
    (person) => !person.parentId || !personMap.has(person.parentId)
  )

  if (rootNodes.length === 0) {
    // If no root found, use the person with the lowest generation number
    const sortedByGeneration = [...people].sort(
      (a, b) => a.generation - b.generation
    )
    return buildNode(sortedByGeneration[0], personMap, spouseMap, new Set())
  }

  // If multiple roots, create a virtual root
  if (rootNodes.length > 1) {
    // Find the oldest generation
    const oldestGeneration = Math.min(...rootNodes.map((p) => p.generation))
    const oldestRoots = rootNodes.filter((p) => p.generation === oldestGeneration)

    if (oldestRoots.length === 1) {
      return buildNode(oldestRoots[0], personMap, spouseMap, new Set())
    }

    // Multiple roots at same generation - use first one as primary
    return buildNode(oldestRoots[0], personMap, spouseMap, new Set())
  }

  return buildNode(rootNodes[0], personMap, spouseMap, new Set())
}

function buildNode(
  person: Person,
  personMap: Map<string, Person>,
  spouseMap: Map<string, Person>,
  visited: Set<string>
): FamilyNode {
  if (visited.has(person.id)) {
    // Prevent infinite loops
    return {
      ...person,
      children: [],
    }
  }

  visited.add(person.id)

  // Find all children of this person
  const children: FamilyNode[] = []
  personMap.forEach((p) => {
    if (p.parentId === person.id) {
      children.push(buildNode(p, personMap, spouseMap, visited))
    }
  })

  // Sort children by birthdate if available
  children.sort((a, b) => {
    if (a.birthdate && b.birthdate) {
      return a.birthdate.localeCompare(b.birthdate)
    }
    return 0
  })

  const node: FamilyNode = {
    ...person,
    children,
  }

  // Add spouse if exists
  const spouse = spouseMap.get(person.id)
  if (spouse) {
    node.spouse = spouse
  }

  return node
}

