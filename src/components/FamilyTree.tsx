import { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { FamilyNode, Person } from "../types/family";
import PersonCard from "./PersonCard";
import ConnectionLines from "./ConnectionLines";
import PersonDetailModal from "./PersonDetailModal";
import ZoomControls from "./ZoomControls";
import { useTreeLayout } from "../hooks/useTreeLayout";

interface FamilyTreeProps {
  rootNode: FamilyNode;
  people: Person[];
  selectedPersonId: string | null;
  onPersonSelect: (id: string | null) => void;
}

export default function FamilyTree({
  rootNode,
  people,
  selectedPersonId,
  onPersonSelect,
}: FamilyTreeProps) {
  const { generations, positions, bounds } = useTreeLayout(rootNode);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformControlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
  } | null>(null);

  // Find selected person data
  useEffect(() => {
    if (!selectedPersonId) {
      setSelectedPerson(null);
      return;
    }

    function findPerson(node: FamilyNode): Person | null {
      if (node.id === selectedPersonId) return node;
      for (const child of node.children) {
        const found = findPerson(child);
        if (found) return found;
      }
      return null;
    }

    const person = findPerson(rootNode);
    setSelectedPerson(person);
  }, [selectedPersonId, rootNode]);

  const handlePersonClick = (person: Person) => {
    onPersonSelect(person.id);
  };

  const handleZoomChange = (state: { scale: number }) => {
    setZoomLevel(state.scale);
  };

  const handleZoomIn = () => {
    transformControlsRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    transformControlsRef.current?.zoomOut();
  };

  const handleReset = () => {
    transformControlsRef.current?.resetTransform();
  };

  // Find spouse for selected person - check both tree and original people array
  const selectedSpouse = selectedPerson
    ? (() => {
        // First check if spouse is in the tree
        const nodeInTree = generations
          .flat()
          .find((node) => node.id === selectedPerson.id);
        if (nodeInTree?.spouse) {
          return nodeInTree.spouse;
        }
        // If not in tree, check original people array
        if (selectedPerson.spouseId) {
          const spouse = people.find((p) => p.id === selectedPerson.spouseId);
          return spouse || undefined;
        }
        return undefined;
      })()
    : undefined;

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
        onTransformed={(_ref, state) => handleZoomChange(state)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => {
          // Store controls for external access
          transformControlsRef.current = { zoomIn, zoomOut, resetTransform };

          return (
            <>
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="flex items-center justify-center"
                contentStyle={{
                  width: `${bounds.width}px`,
                  height: `${bounds.height}px`,
                  minWidth: "100%",
                  minHeight: "100%",
                }}
              >
                <div
                  ref={containerRef}
                  data-tree-container
                  className="relative flex items-center justify-center"
                  style={{
                    width: `${bounds.width}px`,
                    height: `${bounds.height}px`,
                    padding: "20px",
                  }}
                >
                  {/* Connection Lines */}
                  <ConnectionLines
                    generations={generations}
                    positions={positions}
                    zoomLevel={zoomLevel}
                  />

                  {/* Cards positioned absolutely based on calculated positions */}
                  <div
                    className="relative"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {generations.flat().map((node) => {
                      const pos = positions.get(node.id);
                      if (!pos) return null;

                      return (
                        <div
                          key={node.id}
                          className="absolute"
                          style={{
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            width: `${pos.width}px`,
                          }}
                        >
                          <PersonCard
                            person={node}
                            onClick={() => handlePersonClick(node)}
                            zoomLevel={zoomLevel}
                          />
                        </div>
                      );
                    })}
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
          );
        }}
      </TransformWrapper>

      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        spouse={selectedSpouse}
        onClose={() => onPersonSelect(null)}
      />
    </div>
  );
}
