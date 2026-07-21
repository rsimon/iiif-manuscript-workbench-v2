import { useEffect } from 'react';
import { Point } from 'openseadragon';
import type { CanvasClickEvent, Viewer } from 'openseadragon';
import { useMeasurement } from './measurement-context';

interface MeasurementToolProps {

  viewer?: Viewer | null;

  enabled: boolean;

}

const viewportDistance = (a: Point, b: Point) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export const MeasurementTool = (props: MeasurementToolProps) => {
  const { viewer, enabled } = props;

  const { measurement, setMeasurement } = useMeasurement();

  useEffect(() => {
    if (!viewer || !enabled) return;

    const onCanvasClick = (evt: CanvasClickEvent) => {
      if (!evt.quick) return;

      const pt = viewer.viewport.pointFromPixel(evt.position);

      setMeasurement(m => {
        if (m.phase === 'idle' || m.phase === 'committed') {
          return { phase: 'dragging', start: pt, end: pt, viewportDistance: 0 };
        } else { // m.phase === 'dragging'
          return { ...m, phase: 'committed' };
        }
      });
    }

    const onPointerMove = (evt: PointerEvent) => {
      const pt = viewer.viewport.pointFromPixel(new Point(evt.offsetX, evt.offsetY));

      setMeasurement(m => m.phase === 'dragging'
        ? { ...m, end: pt, viewportDistance: viewportDistance(m.start, pt) }
        : m
      );
    }

    viewer.element.style.cursor = 'crosshair';

    viewer.addHandler('canvas-click', onCanvasClick);
    viewer.element.addEventListener('pointermove', onPointerMove);

    return () => {
      viewer.element.style.cursor = '';

      viewer.removeHandler('canvas-click', onCanvasClick);
      viewer.element.removeEventListener('pointermove', onPointerMove);

      setMeasurement({ phase: 'idle' });
    };
  }, [viewer, enabled]);

  return (viewer && enabled && measurement && measurement.phase !== 'idle') ? (
    <g pointerEvents="none">
      <defs>
        <marker
          id="measure-tick"
          markerWidth="1"
          markerHeight="6"
          refX="0.5"
          refY="3"
          markerUnits="strokeWidth"
          orient="auto">

          <line
            x1="0.5" y1="0"
            x2="0.5" y2="8"
            stroke="oklch(75% 0.35 328)"
            strokeWidth="1" />
        </marker>
      </defs>
      <line
        x1={measurement.start.x} y1={measurement.start.y}
        x2={measurement.end.x}   y2={measurement.end.y}
        stroke="oklch(75% 0.35 328)"
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke" 
        markerStart="url(#measure-tick)"
        markerEnd="url(#measure-tick)"  />
    </g>
  ) : null;

}