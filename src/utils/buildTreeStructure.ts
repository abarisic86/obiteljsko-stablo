import { Person, FamilyNode } from '../types/family'

export function buildTreeStructure(people: Person[]): FamilyNode | null {
  if (people.length === 0) return null

  // Filter out any invalid person objects
  const validPeople = people.filter((person) => person && person.id && person.name)
  if (validPeople.length === 0) {
    console.error('No valid people found after filtering')
    return null
  }

  // Create a map for quick lookup
  const personMap = new Map<string, Person>()
  validPeople.forEach((person) => {
    if (person && person.id) {
      personMap.set(person.id, person)
    }
  })

  // Create spouse map (bidirectional)
  const spouseMap = new Map<string, Person>()
  validPeople.forEach((person) => {
    if (person && person.id && person.spouseId) {
      const spouse = personMap.get(person.spouseId)
      if (spouse && spouse.id) {
        spouseMap.set(person.id, spouse)
        // Also map the reverse relationship
        spouseMap.set(spouse.id, person)
      }
    }
  })

  // Find root nodes (people with no parent or parent not in the dataset)
  const rootNodes = validPeople.filter(
    (person) => person && person.id && (!person.parentId || !personMap.has(person.parentId))
  )

  if (rootNodes.length === 0) {
    // If no root found, use the person with the lowest generation number
    const sortedByGeneration = [...validPeople]
      .filter((p) => p && p.id)
      .sort((a, b) => a.generation - b.generation)
    
    if (sortedByGeneration.length === 0) {
      console.error('No valid people to build tree from')
      return null
    }
    return buildNode(sortedByGeneration[0], personMap, spouseMap, new Set())
  }

  // If multiple roots, create a virtual root
  if (rootNodes.length > 1) {
    // Find the oldest generation
    const validRoots = rootNodes.filter((p) => p && p.id)
    if (validRoots.length === 0) {
      console.error('No valid root nodes found')
      return null
    }
    
    const oldestGeneration = Math.min(...validRoots.map((p) => p.generation))
    const oldestRoots = validRoots.filter((p) => p.generation === oldestGeneration)

    if (oldestRoots.length === 1) {
      return buildNode(oldestRoots[0], personMap, spouseMap, new Set())
    }

    // Multiple roots at same generation - use first one as primary
    if (oldestRoots.length > 0) {
      return buildNode(oldestRoots[0], personMap, spouseMap, new Set())
    }
  }

  if (rootNodes.length > 0 && rootNodes[0] && rootNodes[0].id) {
    return buildNode(rootNodes[0], personMap, spouseMap, new Set())
  }

  console.error('Unable to build tree structure')
  return null
}

function buildNode(
  person: Person,
  personMap: Map<string, Person>,
  spouseMap: Map<string, Person>,
  visited: Set<string>
): FamilyNode {
  if (!person || !person.id) {
    throw new Error('Invalid person object passed to buildNode')
  }

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

