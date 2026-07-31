import { useEffect, useRef } from 'react';
import type { Point, Viewer } from 'openseadragon';

const HANDLE_SIZE_PX = 8;

export type HandleDirection = 'NW' | 'NE' | 'SE' | 'SW';

export type CornerHandleType = 
  | 'TOP_LEFT'
  | 'TOP_RIGHT'
  | 'BOTTOM_RIGHT'
  | 'BOTTOM_LEFT';

export type EdgeHandleType = 
  | 'TOP'
  | 'RIGHT'
  | 'BOTTOM'
  | 'LEFT';

export type ResizeHandleType =
  | CornerHandleType
  | EdgeHandleType;

export type HandleType = 
  | 'SHAPE'
  | ResizeHandleType;

interface CornerHandleProps {

  corner: Point;

  direction: HandleDirection;

  invalid?: boolean;

  type: CornerHandleType;

  viewer: Viewer;

  onPointerDown: React.PointerEventHandler<SVGElement>;

  onPointerMove: React.PointerEventHandler<SVGElement>;

  onPointerUp: React.PointerEventHandler<SVGElement>;

  onPointerCancel: React.PointerEventHandler<SVGElement>;

}

export const CornerHandle = (props: CornerHandleProps) => {
  const { corner, viewer } = props;

  const handleRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (!viewer || !handleRef.current) return;

    const onUpdateViewport = () => {
      const zoom = viewer.viewport.getZoom(true);
      const containerWidth = viewer.container.clientWidth;
      if (containerWidth === 0) return;

      const s = HANDLE_SIZE_PX / (zoom * containerWidth);

      handleRef.current?.setAttribute('width', `${s}`);
      handleRef.current?.setAttribute('height', `${s}`);
      handleRef.current?.setAttribute('transform', `translate(-${s/2}, -${s/2})`);
    };

    viewer.addHandler('update-viewport', onUpdateViewport);

    onUpdateViewport();

    return () => {
      viewer.removeHandler('update-viewport', onUpdateViewport);
    };
  }, [viewer]);

  return (
    <rect
      ref={handleRef}
      x={corner.x}
      y={corner.y}
      style={{
        cursor: `${props.direction.toLowerCase()}-resize`
      }}
      fill="white"
      stroke={props.invalid ? 'oklch(57.7% 0.245 27.325)' : 'oklch(70.5% 0.213 47.604)'}
      strokeWidth={2}
      vectorEffect="non-scaling-stroke"
      onPointerDownCapture={props.onPointerDown}
      onPointerMoveCapture={props.onPointerMove}
      onPointerUpCapture={props.onPointerUp}
      onPointerCancelCapture={props.onPointerCancel} />
  )

}