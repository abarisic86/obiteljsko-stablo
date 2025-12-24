import { useState, useRef, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { FamilyNode, Person } from '../types/family'
import GenerationColumn from './GenerationColumn'
import ConnectionLines from './ConnectionLines'
import PersonDetailModal from './PersonDetailModal'
import ZoomControls from './ZoomControls'
import { useTreeLayout } from '../hooks/useTreeLayout'

interface FamilyTreeProps {
  rootNode: FamilyNode
  people: Person[]
  selectedPersonId: string | null
  onPersonSelect: (id: string | null) => void
}

export default function FamilyTree({
  rootNode,
  people,
  selectedPersonId,
  onPersonSelect,
}: FamilyTreeProps) {
  const { generations, positions, bounds } = useTreeLayout(rootNode)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [cardPositions, setCardPositions] = useState<Map<string, DOMRect>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const transformControlsRef = useRef<{
    zoomIn: () => void
    zoomOut: () => void
    resetTransform: () => void
  } | null>(null)

  const handleCardPositionUpdate = (personId: string, rect: DOMRect) => {
    setCardPositions((prev) => {
      const next = new Map(prev)
      next.set(personId, rect)
      return next
    })
  }

  // Find selected person data
  useEffect(() => {
    if (!selectedPersonId) {
      setSelectedPerson(null)
      return
    }

    function findPerson(node: FamilyNode): Person | null {
      if (node.id === selectedPersonId) return node
      for (const child of node.children) {
        const found = findPerson(child)
        if (found) return found
      }
      return null
    }

    const person = findPerson(rootNode)
    setSelectedPerson(person)
  }, [selectedPersonId, rootNode])

  const handlePersonClick = (person: Person) => {
    onPersonSelect(person.id)
  }

  const handleZoomChange = (state: { scale: number }) => {
    setZoomLevel(state.scale)
    // Trigger position update after zoom change
    setTimeout(() => {
      if (containerRef.current) {
        const cards = containerRef.current.querySelectorAll('[data-person-id]')
        const newPositions = new Map<string, DOMRect>()
        cards.forEach((card) => {
          const personId = card.getAttribute('data-person-id')
          if (personId) {
            const rect = card.getBoundingClientRect()
            const containerRect = containerRef.current!.getBoundingClientRect()
            const relativeRect = new DOMRect(
              rect.left - containerRect.left,
              rect.top - containerRect.top,
              rect.width,
              rect.height
            )
            newPositions.set(personId, relativeRect)
          }
        })
        setCardPositions(newPositions)
      }
    }, 50)
  }

  const handleZoomIn = () => {
    transformControlsRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    transformControlsRef.current?.zoomOut()
  }

  const handleReset = () => {
    transformControlsRef.current?.resetTransform()
  }

  // Find spouse for selected person - check both tree and original people array
  const selectedSpouse = selectedPerson
    ? (() => {
        // First check if spouse is in the tree
        const nodeInTree = generations.flat().find((node) => node.id === selectedPerson.id)
        if (nodeInTree?.spouse) {
          return nodeInTree.spouse
        }
        // If not in tree, check original people array
        if (selectedPerson.spouseId) {
          const spouse = people.find((p) => p.id === selectedPerson.spouseId)
          return spouse || undefined
        }
        return undefined
      })()
    : undefined

  // Check if spouse is in the tree structure
  const isSpouseInTree = selectedSpouse
    ? generations.flat().some((node) => node.id === selectedSpouse.id)
    : false

  return (
    <div className="w-full h-screen bg-gray-50 overflow-hidden relative">
      <TransformWrapper
        initialScale={0.5}
        minScale={0.1}
        maxScale={2}
        limitToBounds={false}
        centerOnInit={true}
        initialPositionX={0}
        initialPositionY={0}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: false, step: 0.7 }}
        onTransformed={(ref, state) => handleZoomChange(state)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => {
          // Store controls for external access
          transformControlsRef.current = { zoomIn, zoomOut, resetTransform }

          return (
            <>
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="flex items-center justify-center"
                contentStyle={{
                  width: `${bounds.width}px`,
                  height: `${bounds.height}px`,
                  minWidth: '100%',
                  minHeight: '100%',
                }}
              >
                <div
                  ref={containerRef}
                  data-tree-container
                  className="relative flex items-center justify-center"
                  style={{
                    width: `${bounds.width}px`,
                    height: `${bounds.height}px`,
                    padding: '40px',
                  }}
                >
                  {/* Connection Lines */}
                  <ConnectionLines
                    generations={generations}
                    positions={positions}
                    cardPositions={cardPositions}
                    zoomLevel={zoomLevel}
                  />

                  {/* Generation Columns - positioned relative to centered container */}
                  <div className="relative flex gap-8 items-center">
                    {generations.map((nodes, genIndex) => (
                      <GenerationColumn
                        key={genIndex}
                        nodes={nodes}
                        onPersonClick={handlePersonClick}
                        zoomLevel={zoomLevel}
                        onCardPositionUpdate={handleCardPositionUpdate}
                      />
                    ))}
                  </div>
                </div>
              </TransformComponent>

              {/* Zoom Controls */}
              <ZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
              />
            </>
          )
        }}
      </TransformWrapper>

      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        spouse={selectedSpouse}
        isSpouseInTree={isSpouseInTree}
        onClose={() => onPersonSelect(null)}
      />
    </div>
  )
}

