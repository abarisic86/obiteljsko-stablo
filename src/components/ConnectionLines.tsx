import { FamilyNode, PersonPosition } from "../types/family";

interface ConnectionLinesProps {
  generations: FamilyNode[][];
  positions: Map<string, PersonPosition>;
  cardPositions: Map<string, DOMRect>;
  zoomLevel: number;
}

export default function ConnectionLines({
  generations,
  positions,
  cardPositions,
  zoomLevel,
}: ConnectionLinesProps) {
  if (zoomLevel < 0.2) return null; // Hide lines when very zoomed out

  const lines: JSX.Element[] = [];

  // Draw lines from parents to children
  for (let genIndex = 0; genIndex < generations.length - 1; genIndex++) {
    const parentGen = generations[genIndex];
    const childGen = generations[genIndex + 1];

    parentGen.forEach((parent) => {
      // Use actual card position if available, otherwise fall back to calculated position
      const parentCardRect = cardPositions.get(parent.id);
      let parentX: number;
      let parentY: number;

      if (parentCardRect) {
        // Use actual DOM position
        parentX = parentCardRect.left + parentCardRect.width / 2;
        parentY = parentCardRect.top + parentCardRect.height / 2;
      } else {
        // Fallback to calculated position
        const parentPos = positions.get(parent.id);
        if (!parentPos) return;
        parentX = parentPos.x + parentPos.width / 2;
        parentY = parentPos.y + parentPos.height / 2;
      }

      parent.children.forEach((child) => {
        // Find child's position in next generation
        const childIndexInGen = childGen.findIndex((n) => n.id === child.id);
        if (childIndexInGen === -1) return;

        // Use actual card position if available, otherwise fall back to calculated position
        const childCardRect = cardPositions.get(child.id);
        let childX: number;
        let childY: number;

        if (childCardRect) {
          // Use actual DOM position
          childX = childCardRect.left + childCardRect.width / 2;
          childY = childCardRect.top + childCardRect.height / 2;
        } else {
          // Fallback to calculated position
          const childPos = positions.get(child.id);
          if (!childPos) return;
          childX = childPos.x + childPos.width / 2;
          childY = childPos.y + childPos.height / 2;
        }

        // Create bezier curve for smoother lines
        const midX = (parentX + childX) / 2;
        const path = `M ${parentX} ${parentY} C ${midX} ${parentY}, ${midX} ${childY}, ${childX} ${childY}`;

        lines.push(
          <path
            key={`${parent.id}-${child.id}`}
            d={path}
            stroke="#94a3b8"
            strokeWidth={zoomLevel > 0.5 ? 2 : 1}
            fill="none"
            strokeDasharray={zoomLevel < 0.4 ? "3,3" : "0"}
            opacity={zoomLevel > 0.3 ? 0.6 : 0.3}
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
