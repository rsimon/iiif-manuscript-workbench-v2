import { useEffect, useRef } from 'react';
import type { Point, Viewer } from 'openseadragon';
import type { CornerHandleType } from '../../composer-types';

const HANDLE_SIZE_PX = 8;

export type HandleDirection = 'NW' | 'NE' | 'SE' | 'SW';

interface ToolCornerHandleProps {

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

export const ToolCornerHandle = (props: ToolCornerHandleProps) => {
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
      onPointerDown={props.onPointerDown} 
      onPointerMove={props.onPointerMove} 
      onPointerUp={props.onPointerUp} 
      onPointerCancel={props.onPointerCancel} />
  )

}