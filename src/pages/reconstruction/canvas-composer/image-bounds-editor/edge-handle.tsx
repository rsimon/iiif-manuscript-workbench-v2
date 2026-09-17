import { useEffect, useRef } from 'react';
import type { Point, Viewer } from 'openseadragon';

const HANDLE_SIZE_PX = 8;

type EdgeDirection = 'NS' | 'EW';

export type EdgeHandleType = 
  | 'TOP'
  | 'RIGHT'
  | 'BOTTOM'
  | 'LEFT';

interface EdgeHandleProps {

  point: Point;

  direction: EdgeDirection;

  type: EdgeHandleType;

  viewer: Viewer;

  onPointerDown: React.PointerEventHandler<SVGElement>;

  onPointerMove: React.PointerEventHandler<SVGElement>;

  onPointerUp: React.PointerEventHandler<SVGElement>;

  onPointerCancel: React.PointerEventHandler<SVGElement>;

}

export const EdgeHandle = (props: EdgeHandleProps) => {
  const { type, viewer } = props;

  const handleRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const onUpdateViewport = () => {
      const zoom = viewer.viewport.getZoom(true);
      const containerWidth = viewer.container.clientWidth;
      if (containerWidth === 0) return;

      const size = HANDLE_SIZE_PX / (zoom * containerWidth);

      const isHorizontal = type === 'TOP' || type === 'BOTTOM';

      handleRef.current?.setAttribute('width', isHorizontal ? `${size * 3}` : `${size}`);
      handleRef.current?.setAttribute('height', isHorizontal ? `${size}` : `${size * 3}`);
      handleRef.current?.setAttribute('rx', `${size / 4}`);
      handleRef.current?.setAttribute('transform', `translate(-${isHorizontal ? size * 1.5 : size / 2}, -${isHorizontal ? size / 2 : size * 1.5})`);
    };

    viewer.addHandler('update-viewport', onUpdateViewport);
    
    onUpdateViewport();

    return () => {
      props.viewer.removeHandler('update-viewport', onUpdateViewport);
    };
  }, [props.direction, viewer, type]);

  return (
    <rect
      ref={handleRef}
      x={props.point.x}
      y={props.point.y}
      style={{ cursor: `${props.direction}-resize` }}
      fill="black"
      stroke="white"
      strokeWidth={1.75}
      vectorEffect="non-scaling-stroke"
      onPointerDownCapture={props.onPointerDown}
      onPointerMoveCapture={props.onPointerMove}
      onPointerUpCapture={props.onPointerUp}
      onPointerCancelCapture={props.onPointerCancel} />
  );
};
