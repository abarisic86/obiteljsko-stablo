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
  selectedPersonId: string | null
  onPersonSelect: (id: string | null) => void
}

export default function FamilyTree({
  rootNode,
  selectedPersonId,
  onPersonSelect,
}: FamilyTreeProps) {
  const { generations, positions, bounds } = useTreeLayout(rootNode)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const transformControlsRef = useRef<{
    zoomIn: () => void
    zoomOut: () => void
    resetTransform: () => void
  } | null>(null)

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

  // Find spouse for selected person
  const selectedSpouse = selectedPerson
    ? generations
        .flat()
        .find((node) => node.id === selectedPerson.id)?.spouse
    : undefined

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
        onClose={() => onPersonSelect(null)}
      />
    </div>
  )
}

