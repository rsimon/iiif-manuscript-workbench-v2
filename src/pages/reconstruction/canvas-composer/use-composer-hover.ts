import { useEffect } from 'react';
import { Point, type Viewer } from 'openseadragon';
import { useReconstructionStore } from '../reconstruction-store';
import type { ComposerLayout } from './composer-types';

export const useComposerHover = (viewer: Viewer | null, layout: ComposerLayout) => {

  const hover = useReconstructionStore(state => state.hoveredCanvas);
  const setHover = useReconstructionStore(state => state.setHoveredCanvas);

  useEffect(() => {
    if (!viewer) return;

    const getItemAt = (point: Point) => {
      const hits = layout.items.filter(item => {
        const l = item.x;
        const r = item.x + item.width;
        const t = item.y;
        const b = item.y + item.height;
        return point.x >= l && point.x <= r && point.y >= t && point.y <= b;
      });

      return hits.sort((a, b) => {
        const areaA = a.width * a.height;
        const areaB = b.width * b.height;
        return areaA - areaB;
      })[0];
    }

    const onPointerMove = (event: PointerEvent) => {
      const offset = new Point(event.offsetX, event.offsetY);
      const point = viewer.viewport.viewerElementToViewportCoordinates(offset);
      const hovered = getItemAt(point);
      console.log({ hovered });
      setHover(hovered?.canvas);
    }

    viewer.canvas.addEventListener('pointermove', onPointerMove);

    return () => {
      viewer.canvas?.removeEventListener('pointermove', onPointerMove);
    };
  }, [viewer, layout, hover, setHover]);

}