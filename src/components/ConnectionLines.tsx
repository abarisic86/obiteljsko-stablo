import { FamilyNode, PersonPosition } from "../types/family";

interface ConnectionLinesProps {
  generations: FamilyNode[][];
  positions: Map<string, PersonPosition>;
  zoomLevel: number;
}

export default function ConnectionLines({
  generations,
  positions,
  zoomLevel,
}: ConnectionLinesProps) {
  if (zoomLevel < 0.2) return null; // Hide lines when very zoomed out

  const lines: JSX.Element[] = [];

  // Draw lines from parents to children
  for (let genIndex = 0; genIndex < generations.length - 1; genIndex++) {
    const parentGen = generations[genIndex];
    const childGen = generations[genIndex + 1];

    parentGen.forEach((parent) => {
      // Use calculated positions directly
      const parentPos = positions.get(parent.id);
      if (!parentPos) return;

      const parentX = parentPos.x + parentPos.width / 2;
      const parentY = parentPos.y + parentPos.height / 2;

      parent.children.forEach((child) => {
        // Find child's position in next generation
        const childIndexInGen = childGen.findIndex((n) => n.id === child.id);
        if (childIndexInGen === -1) return;

        // Use calculated positions directly
        const childPos = positions.get(child.id);
        if (!childPos) return;

        const childX = childPos.x + childPos.width / 2;
        const childY = childPos.y + childPos.height / 2;

        // Create bezier curve for smoother lines
        const midX = (parentX + childX) / 2;
        const path = `M ${parentX} ${parentY} C ${midX} ${parentY}, ${midX} ${childY}, ${childX} ${childY}`;

        lines.push(
          <path
            key={`${parent.id}-${child.id}`}
            d={path}
            stroke="#ffffff"
            strokeWidth={zoomLevel < 0.3 ? 6 : zoomLevel < 0.5 ? 4 : zoomLevel < 1 ? 3 : 2}
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
