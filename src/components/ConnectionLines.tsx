import { FamilyNode, PersonPosition } from "../types/family";

interface ConnectionLinesProps {
  generations: FamilyNode[][];
  positions: Map<string, PersonPosition>;
  spousePositions: Map<string, PersonPosition>;
  zoomLevel: number;
}

export default function ConnectionLines({
  generations,
  positions,
  spousePositions,
  zoomLevel,
}: ConnectionLinesProps) {
  if (zoomLevel < 0.2) return null; // Hide lines when very zoomed out

  const lines: JSX.Element[] = [];

  // Draw lines from parents to children
  // Lines come INTO the person (top card) and go OUT from the spouse (bottom card)
  for (let genIndex = 0; genIndex < generations.length - 1; genIndex++) {
    const parentGen = generations[genIndex];
    const childGen = generations[genIndex + 1];

    parentGen.forEach((parent) => {
      const parentPos = positions.get(parent.id);
      if (!parentPos) return;

      // Outgoing connection: start from spouse if exists, otherwise from person
      let outX: number;
      let outY: number;

      if (parent.spouse) {
        const spousePos = spousePositions.get(parent.spouse.id);
        if (spousePos) {
          // Start from center of spouse card (bottom of the couple)
          outX = spousePos.x + spousePos.width / 2;
          outY = spousePos.y + spousePos.height / 2;
        } else {
          outX = parentPos.x + parentPos.width / 2;
          outY = parentPos.y + parentPos.height / 2;
        }
      } else {
        outX = parentPos.x + parentPos.width / 2;
        outY = parentPos.y + parentPos.height / 2;
      }

      parent.children.forEach((child) => {
        // Find child's position in next generation
        const childIndexInGen = childGen.findIndex((n) => n.id === child.id);
        if (childIndexInGen === -1) return;

        const childPos = positions.get(child.id);
        if (!childPos) return;

        // Incoming connection: always to the person card (top card)
        const inX = childPos.x + childPos.width / 2;
        const inY = childPos.y + childPos.height / 2;

        // Create bezier curve for smoother lines
        const midX = (outX + inX) / 2;
        const path = `M ${outX} ${outY} C ${midX} ${outY}, ${midX} ${inY}, ${inX} ${inY}`;

        lines.push(
          <path
            key={`${parent.id}-${child.id}`}
            d={path}
            stroke="#ffffff"
            strokeWidth={
              zoomLevel < 0.3 ? 6 : zoomLevel < 0.5 ? 4 : zoomLevel < 1 ? 3 : 2
            }
            fill="none"
            strokeDasharray={zoomLevel < 0.4 ? "3,3" : "0"}
            opacity={zoomLevel > 0.5 ? 0.8 : zoomLevel > 0.3 ? 0.6 : 0.4}
          />
        );
      });
    });
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      {lines}
    </svg>
  );
}
