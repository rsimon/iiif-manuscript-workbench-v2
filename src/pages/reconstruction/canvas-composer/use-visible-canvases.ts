import { useEffect, useState } from 'react';
import type { Viewer } from 'openseadragon';
import type { ComposerLayout, ComposerLayoutItem } from '../reconstruction-types';

// Overscan margin around current viewport, as a multiple of the viewport size
const VIEWPORT_OVERSCAN = 1;

const computeVisibleIds = (viewer: Viewer, layout: ComposerLayout): Set<string> => {
  const bounds = viewer.viewport.getBounds(true);

  const minX = bounds.x - bounds.width * VIEWPORT_OVERSCAN;
  const maxX = bounds.x + bounds.width * (1 + VIEWPORT_OVERSCAN);
  const minY = bounds.y - bounds.height * VIEWPORT_OVERSCAN;
  const maxY = bounds.y + bounds.height * (1 + VIEWPORT_OVERSCAN);

  const intersects = (item: ComposerLayoutItem) =>
    item.x <= maxX &&
    item.x + item.width >= minX &&
    item.y <= maxY &&
    item.y + item.height >= minY;

  return new Set(
    layout.items.filter(intersects).map((item) => item.reconstructionCanvasId)
  );
}

const sameIds = (a: Set<string>, b: Set<string>): boolean =>
  a.size === b.size && [...a].every(id => b.has(id));

// Canvas IDs that currently intersect the viewport + overscan margin
export const useVisibleCanvases = (viewer: Viewer | undefined, layout: ComposerLayout): Set<string> => {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!viewer) return;

    const recompute = () => {
      const next = computeVisibleIds(viewer, layout);
      setVisibleIds(prev => sameIds(prev, next) ? prev : next);
    };

    recompute();

    viewer.addHandler('update-viewport', recompute);
    
    return () => {
      viewer.removeHandler('update-viewport', recompute);
    };
  }, [viewer, layout]);

  return visibleIds;
}
