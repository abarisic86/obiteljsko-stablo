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
  scrollToPersonId: string | null;
  onScrollComplete: () => void;
}

export default function FamilyTree({
  rootNode,
  people,
  selectedPersonId,
  onPersonSelect,
  scrollToPersonId,
  onScrollComplete,
}: FamilyTreeProps) {
  const { generations, positions, bounds } = useTreeLayout(rootNode);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [shouldScrollToPerson, setShouldScrollToPerson] = useState<
    string | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformControlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
  } | null>(null);

  // Get viewport size immediately
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

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

  // Handle scroll to person
  useEffect(() => {
    if (scrollToPersonId) {
      setShouldScrollToPerson(scrollToPersonId);
    }
  }, [scrollToPersonId]);

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

  // Calculate initial position to center content at (0,0) in viewport center
  // Content (0,0) should appear at viewport center
  const scale = 0.75;
  const initialPositionX = viewportSize.width / 2;
  const initialPositionY = viewportSize.height / 2;

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
        initialScale={scale}
        minScale={0.1}
        maxScale={2}
        limitToBounds={false}
        initialPositionX={initialPositionX}
        initialPositionY={initialPositionY}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: false, step: 0.7 }}
        onTransformed={(_ref, state) => handleZoomChange(state)}
      >
        {({ zoomIn, zoomOut, resetTransform, setTransform }) => {
          // Store controls for external access
          transformControlsRef.current = { zoomIn, zoomOut, resetTransform };

          // Handle scroll to person if needed
          if (shouldScrollToPerson) {
            const personId = shouldScrollToPerson;
            const personPosition = positions.get(personId);

            if (personPosition) {
              // Calculate target position to center the person in viewport
              // Account for search bar overlaying the top portion
              const searchBarOffset = 40; // Approximate search bar height + spacing
              const targetX = viewportSize.width / 2 - personPosition.x;
              const targetY = viewportSize.height / 2 - personPosition.y + searchBarOffset;

              // Keep current zoom level
              setTransform(targetX, targetY, zoomLevel);
            }

            // Reset the scroll flag and notify parent
            setShouldScrollToPerson(null);
            onScrollComplete();
          }

          return (
            <>
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="flex items-center justify-center"
                contentStyle={{
                  width: `${bounds.width}px`,
                  height: `${bounds.height}px`,
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
