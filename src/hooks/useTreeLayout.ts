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

    // First pass: traverse tree and organize by generation
    function traverse(node: FamilyNode, generation: number) {
      if (!generations[generation]) {
        generations[generation] = [];
      }
      generations[generation].push(node);

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

    return {
      generations,
      positions: adjustedPositions,
      spousePositions: adjustedSpousePositions,
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
