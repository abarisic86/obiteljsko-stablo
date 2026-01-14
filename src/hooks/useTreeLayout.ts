import { useMemo } from "react";
import { FamilyNode, PersonPosition } from "../types/family";

const CARD_WIDTH = 140;
const CARD_HEIGHT = 60;
const COLUMN_SPACING = 200;
const ROW_SPACING = 80;

export function useTreeLayout(rootNode: FamilyNode) {
  return useMemo(() => {
    const generations: FamilyNode[][] = [];
    const positions = new Map<string, PersonPosition>();
    const spousePositions = new Map<string, PersonPosition>(); // Track spouse positions separately
    const spouseParentNodes: { node: FamilyNode; genIndex: number; spouseId: string }[] = []; // Track spouse parent trees

    // First pass: traverse tree and organize by generation
    function traverse(node: FamilyNode, generation: number) {
      if (!generations[generation]) {
        generations[generation] = [];
      }
      generations[generation].push(node);

      // Track spouse parents for later positioning
      if (node.spouseParents) {
        spouseParentNodes.push({
          node: node.spouseParents,
          genIndex: Math.max(0, generation - 1), // Parent's generation (one level up)
          spouseId: node.spouse!.id,
        });
      }

      // Process children
      node.children.forEach((child) => {
        traverse(child, generation + 1);
      });
    }

    traverse(rootNode, 0);

    // Calculate total height for a person (including spouse if present)
    function getPersonTotalHeight(node: FamilyNode): number {
      return node.spouse ? CARD_HEIGHT + CARD_HEIGHT : CARD_HEIGHT;
    }

    // Helper function to shift a subtree and all its descendants down by offset
    function shiftSubtree(node: FamilyNode, offset: number): void {
      // Shift the node's position if it's already set
      const nodePos = positions.get(node.id);
      if (nodePos) {
        positions.set(node.id, {
          ...nodePos,
          y: nodePos.y + offset,
        });
      }

      // Shift the spouse's position if it exists and is already set
      if (node.spouse) {
        const spousePos = spousePositions.get(node.spouse.id);
        if (spousePos) {
          spousePositions.set(node.spouse.id, {
            ...spousePos,
            y: spousePos.y + offset,
          });
        }
      }

      // Recursively shift all children
      node.children.forEach((child) => {
        shiftSubtree(child, offset);
      });
    }

    // Recursive function to position a subtree
    // Returns the vertical range (minY, maxY) of the positioned subtree
    function positionSubtree(
      node: FamilyNode,
      genIndex: number,
      startY: number
    ): { minY: number; maxY: number } {
      const baseX = genIndex * COLUMN_SPACING;
      const totalHeight = getPersonTotalHeight(node);

      if (node.children.length === 0) {
        // Leaf node - position it
        positions.set(node.id, {
          id: node.id,
          x: baseX,
          y: startY,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });

        // Position spouse directly below (no gap - they are spouses)
        if (node.spouse) {
          spousePositions.set(node.spouse.id, {
            id: node.spouse.id,
            x: baseX,
            y: startY + CARD_HEIGHT,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          });
        }

        return { minY: startY, maxY: startY + totalHeight };
      }

      // Position all children first (recursively)
      // Siblings should be positioned close together
      let currentChildY = startY;
      const childrenRanges: { minY: number; maxY: number }[] = [];

      node.children.forEach((child, index) => {
        const childRange = positionSubtree(child, genIndex + 1, currentChildY);

        // Check if the subtree moved up above the allowed minimum Y position
        // This can happen when a parent centers itself relative to its children
        if (childRange.minY < currentChildY) {
          const offset = currentChildY - childRange.minY;
          shiftSubtree(child, offset);
          // Update the range to reflect the shift
          childRange.minY += offset;
          childRange.maxY += offset;
        }

        childrenRanges.push(childRange);
        // Position next sibling directly below with minimal spacing (siblings grouped together)
        // Use smaller spacing for siblings, larger spacing between different parent groups
        const spacing = index < node.children.length - 1 ? 20 : ROW_SPACING / 2;
        currentChildY = childRange.maxY + spacing;
      });

      // Calculate the vertical center of all children
      const minChildY = Math.min(...childrenRanges.map((r) => r.minY));
      const maxChildY = Math.max(...childrenRanges.map((r) => r.maxY));
      const childrenCenterY = (minChildY + maxChildY) / 2;

      // Position parent centered with children (accounting for spouse below)
      const parentY = childrenCenterY - totalHeight / 2;

      positions.set(node.id, {
        id: node.id,
        x: baseX,
        y: parentY,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      });

      // Position spouse directly below (no gap - they are spouses)
      if (node.spouse) {
        spousePositions.set(node.spouse.id, {
          id: node.spouse.id,
          x: baseX,
          y: parentY + CARD_HEIGHT,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });
      }

      // Return the range covering parent (with spouse) and all children
      return {
        minY: Math.min(parentY, minChildY),
        maxY: Math.max(parentY + totalHeight, maxChildY),
      };
    }

    // Position the entire tree starting from root
    // We'll center it later, so start at 0
    positionSubtree(rootNode, 0, 0);

    // Position spouse parent trees
    spouseParentNodes.forEach(({ node: spouseParentNode, genIndex, spouseId }) => {
      const spousePos = spousePositions.get(spouseId);
      if (!spousePos) return;

      // Position spouse parent at the same X as other nodes in that generation
      // but vertically aligned below the spouse
      const baseX = genIndex * COLUMN_SPACING;
      const spouseParentY = spousePos.y + CARD_HEIGHT + ROW_SPACING;

      // Add to generations array for rendering
      if (!generations[genIndex]) {
        generations[genIndex] = [];
      }
      generations[genIndex].push(spouseParentNode);

      // Position the spouse parent node
      positions.set(spouseParentNode.id, {
        id: spouseParentNode.id,
        x: baseX,
        y: spouseParentY,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      });

      // Position spouse parent's spouse if exists
      if (spouseParentNode.spouse) {
        spousePositions.set(spouseParentNode.spouse.id, {
          id: spouseParentNode.spouse.id,
          x: baseX,
          y: spouseParentY + CARD_HEIGHT,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });
      }
    });

    // Sort each generation by Y position so they render in the correct order
    generations.forEach((genNodes) => {
      genNodes.sort((a, b) => {
        const posA = positions.get(a.id);
        const posB = positions.get(b.id);
        if (!posA || !posB) return 0;
        return posA.y - posB.y;
      });
    });

    // Calculate bounds (include spouse positions)
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    positions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x + pos.width);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y + pos.height);
    });

    spousePositions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x + pos.width);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y + pos.height);
    });

    // Calculate center of the tree
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Adjust positions to center the tree at origin (0, 0)
    const adjustedPositions = new Map<string, PersonPosition>();
    positions.forEach((pos, id) => {
      adjustedPositions.set(id, {
        ...pos,
        x: pos.x - centerX,
        y: pos.y - centerY,
      });
    });

    const adjustedSpousePositions = new Map<string, PersonPosition>();
    spousePositions.forEach((pos, id) => {
      adjustedSpousePositions.set(id, {
        ...pos,
        x: pos.x - centerX,
        y: pos.y - centerY,
      });
    });

    // Recalculate bounds after centering
    let adjMinX = Infinity;
    let adjMaxX = -Infinity;
    let adjMinY = Infinity;
    let adjMaxY = -Infinity;

    adjustedPositions.forEach((pos) => {
      adjMinX = Math.min(adjMinX, pos.x);
      adjMaxX = Math.max(adjMaxX, pos.x + pos.width);
      adjMinY = Math.min(adjMinY, pos.y);
      adjMaxY = Math.max(adjMaxY, pos.y + pos.height);
    });

    adjustedSpousePositions.forEach((pos) => {
      adjMinX = Math.min(adjMinX, pos.x);
      adjMaxX = Math.max(adjMaxX, pos.x + pos.width);
      adjMinY = Math.min(adjMinY, pos.y);
      adjMaxY = Math.max(adjMaxY, pos.y + pos.height);
    });

    // Build spouse parent connections for line drawing
    const spouseParentConnections = spouseParentNodes.map(({ node, spouseId }) => ({
      parentId: node.id,
      spouseParentSpouseId: node.spouse?.id,
      childId: spouseId,
    }));

    return {
      generations,
      positions: adjustedPositions,
      spousePositions: adjustedSpousePositions,
      spouseParentConnections,
      bounds: {
        width: adjMaxX - adjMinX + COLUMN_SPACING,
        height: adjMaxY - adjMinY + ROW_SPACING / 2,
        minX: adjMinX,
        minY: adjMinY,
        centerX: 0, // Tree is now centered at origin
        centerY: 0,
      },
    };
  }, [rootNode]);
}
