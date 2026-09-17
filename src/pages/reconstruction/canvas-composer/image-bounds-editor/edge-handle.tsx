import { useEffect, useRef } from 'react';
import type { Point, Viewer } from 'openseadragon';
import type { EdgeHandleType } from './corner-handle';

const HANDLE_SIZE_PX = 8;

type EdgeDirection = 'ns' | 'ew';

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
  const handleRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const onUpdateViewport = () => {
      const zoom = props.viewer.viewport.getZoom(true);
      const containerWidth = props.viewer.container.clientWidth;
      if (containerWidth === 0) return;

      const size = HANDLE_SIZE_PX / (zoom * containerWidth);
      const isHorizontal = props.type === 'TOP' || props.type === 'BOTTOM';
      handleRef.current?.setAttribute('width', isHorizontal ? `${size * 3}` : `${size}`);
      handleRef.current?.setAttribute('height', isHorizontal ? `${size}` : `${size * 3}`);
      handleRef.current?.setAttribute('transform', `translate(-${isHorizontal ? size * 1.5 : size / 2}, -${isHorizontal ? size / 2 : size * 1.5})`);
    };

    props.viewer.addHandler('update-viewport', onUpdateViewport);
    onUpdateViewport();

    return () => {
      props.viewer.removeHandler('update-viewport', onUpdateViewport);
    };
  }, [props.direction, props.viewer]);

  return (
    <rect
      ref={handleRef}
      x={props.point.x}
      y={props.point.y}
      style={{ cursor: `${props.direction}-resize` }}
      fill="white"
      stroke="oklch(70.5% 0.213 47.604)"
      strokeWidth={2}
      vectorEffect="non-scaling-stroke"
      onPointerDownCapture={props.onPointerDown}
      onPointerMoveCapture={props.onPointerMove}
      onPointerUpCapture={props.onPointerUp}
      onPointerCancelCapture={props.onPointerCancel} />
  );
};
