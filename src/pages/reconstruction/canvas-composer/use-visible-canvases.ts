import { useEffect, useState } from 'react';
import type { Viewer } from 'openseadragon';
import type { ComposerLayout } from '../reconstruction-types';

// Margin around the current viewport, expressed as a multiple of the
// viewport's own width/height. Generous enough that ordinary panning/zooming
// doesn't repeatedly cross the boundary and thrash tiled images in and out,
// while still being far smaller than the full manifest on large documents.
const VIEWPORT_MARGIN = 1;

const computeVisibleIds = (viewer: Viewer, layout: ComposerLayout): Set<string> => {
  const bounds = viewer.viewport.getBounds(true);

  const minX = bounds.x - bounds.width * VIEWPORT_MARGIN;
  const maxX = bounds.x + bounds.width * (1 + VIEWPORT_MARGIN);
  const minY = bounds.y - bounds.height * VIEWPORT_MARGIN;
  const maxY = bounds.y + bounds.height * (1 + VIEWPORT_MARGIN);

  const ids = new Set<string>();

  for (const item of layout.items) {
    const itemRight = item.x + item.width;
    const itemBottom = item.y + item.height;

    if (item.x <= maxX && itemRight >= minX && item.y <= maxY && itemBottom >= minY)
      ids.add(item.reconstructionCanvasId);
  }

  return ids;
}

const sameIds = (a: Set<string>, b: Set<string>): boolean =>
  a.size === b.size && [...a].every(id => b.has(id));

// Canvas IDs whose layout bounds currently intersect the viewport (+ margin).
// Drives which pages get a live OpenSeadragon TiledImage - see composer.tsx -
// and which indicator rects are mounted - see canvas-indicator-layer.tsx.
// Recomputed on every 'update-viewport' tick, but only triggers a re-render
// (and downstream effects) when set membership actually changes.
export const useVisibleCanvases = (viewer: Viewer | undefined, layout: ComposerLayout): Set<string> => {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());

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
