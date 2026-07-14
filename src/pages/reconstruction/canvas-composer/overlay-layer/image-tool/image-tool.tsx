import { useEffect, useMemo, useState } from 'react';
import { Point, type Viewer } from 'openseadragon';
import { ToolCornerHandle } from './tool-corner-handle';
import type { CornerHandleType, HandleType, ResizeHandleType } from '../../composer-types';
import { useComposerStore } from '../../composer-store';
import { getDraggableImageKey, getItemCanvasSize } from '../../composer-utils';
import { cornersToSvgPoints, getImageCorners } from './image-tool-utils';
import { useAppStore } from '@/store/app-store';

interface ImageToolProps {

  viewer: Viewer;

}

const HANDLE_TYPES: CornerHandleType[] = [
  'TOP_LEFT',
  'TOP_RIGHT',
  'BOTTOM_RIGHT',
  'BOTTOM_LEFT'
];

// Sign of each handle's effect on the image's x/y position as it's resized:
// +1 keeps the opposite (min) edge anchored, -1 keeps the opposite (max)
// edge anchored, 0 means this axis isn't driven by that handle at all.
const RESIZE_SIGNS: Record<ResizeHandleType, { h: number; v: number }> = {
  TOP_LEFT: { h: -1, v: -1 },
  TOP: { h: 0, v: -1 },
  TOP_RIGHT: { h: 1, v: -1 },
  RIGHT: { h: 1, v: 0 },
  BOTTOM_RIGHT: { h: 1, v: 1 },
  BOTTOM: { h: 0, v: 1 },
  BOTTOM_LEFT: { h: -1, v: 1 },
  LEFT: { h: -1, v: 0 }
};

// Image x/y/width, snapshotted at drag start (pixel-space units, same as
// DraggableImage), plus the canvas pixel size needed to convert viewport
// deltas back into that same pixel space.
interface DragStart {

  x: number;

  y: number;

  width: number;

  canvasWidth: number;

}

export const ImageTool = (props: ImageToolProps) => {
  const { viewport } = props.viewer;

  const [origin, setOrigin] = useState<Point>();

  const [dragStart, setDragStart] = useState<DragStart>();

  const selectedImage = useComposerStore(state => state.selectedImage);

  const updateImage = useComposerStore(state => state.updateImage);

  // Stable identity for the current selection - unlike `selectedImage` itself,
  // this does NOT change on every drag-driven position update, so it's safe
  // to use as an effect dependency for resetting drag state on (re)selection.
  const selectionKey = selectedImage
    ? `${selectedImage.item.reconstructionCanvasId}:${getDraggableImageKey(selectedImage.image)}`
    : undefined;

  useEffect(() => {
    setOrigin(undefined);
    setDragStart(undefined);
  }, [selectionKey]);

  const corners = useMemo(() => {
    if (!selectedImage) return [];
    return getImageCorners(selectedImage);
  }, [selectedImage]);

  const onMoveImage = (delta: number[]) => {
    if (!selectedImage || !dragStart) return;

    const [dx, dy] = delta;

    updateImage(selectedImage.item.reconstructionCanvasId, {
      ...selectedImage.image,
      x: dragStart.x + dx * dragStart.canvasWidth,
      y: dragStart.y + dy * dragStart.canvasWidth
    });
  }

  const onResizeImage = (handle: ResizeHandleType, delta: number[]) => {
    if (!selectedImage || !dragStart) return;

    const [dxViewport, dyViewport] = delta;
    const dx = dxViewport * dragStart.canvasWidth;
    const dy = dyViewport * dragStart.canvasWidth;

    const { h, v } = RESIZE_SIGNS[handle];

    // Images can't be distorted: height always follows the resource's own
    // aspect ratio, so width is the only free variable. Whichever axis the
    // pointer moved further along (horizontal vs. vertical) drives it.
    const aspect = selectedImage.image.resource.width / selectedImage.image.resource.height;
    const initialHeight = dragStart.width / aspect;

    const dWidthFromX = h * dx;
    const dWidthFromY = v * dy * aspect;
    const dWidth = Math.abs(dWidthFromX) >= Math.abs(dWidthFromY) ? dWidthFromX : dWidthFromY;

    const width = Math.max(1, dragStart.width + dWidth);
    const height = width / aspect;

    const x = h < 0 ? (dragStart.x + dragStart.width) - width : dragStart.x;
    const y = v < 0 ? (dragStart.y + initialHeight) - height : dragStart.y;

    updateImage(selectedImage.item.reconstructionCanvasId, {
      ...selectedImage.image,
      x, y, width
    });
  }

  const onPointerDown = (evt: React.PointerEvent) => {
    if (!selectedImage) return;

    const canvas = useAppStore.getState().reconstruction.find(r => r.id === selectedImage.item.reconstructionCanvasId);
    if (!canvas) return;

    const [canvasWidth] = getItemCanvasSize(canvas);

    const target = evt.target as Element;
    target.setPointerCapture(evt.pointerId);

    setDragStart({
      x: selectedImage.image.x,
      y: selectedImage.image.y,
      width: selectedImage.image.width,
      canvasWidth
    });

    const pt = viewport.pointFromPixel(new Point(evt.clientX, evt.clientY));
    setOrigin(pt);
  }

  const onPointerMove = (handle: HandleType) => (evt: React.PointerEvent) => {
    if (!origin) return;

    const { x, y } = viewport.pointFromPixel(new Point(evt.clientX, evt.clientY));
    const delta = [x - origin.x, y - origin.y];

    if (handle === 'SHAPE') {
      onMoveImage(delta);
    } else {
      onResizeImage(handle, delta);
    }
  }

  const onPointerUp = (evt: React.PointerEvent) => {
    const target = evt.target as Element;
    target.releasePointerCapture(evt.pointerId);

    setOrigin(undefined);
    setDragStart(undefined);
  }

  const onPointerCancel = () => {
    // Capture is auto-released by the browser on cancel
    setOrigin(undefined);
    setDragStart(undefined);
  }

  return (
    <g>
      <polygon
        className="cursor-grab pointer-events-none"
        points={cornersToSvgPoints(corners)}
        fill="transparent"
        stroke="white"
        strokeWidth={5}
        vectorEffect="non-scaling-stroke" />

      <polygon
        className="cursor-grab"
        points={cornersToSvgPoints(corners)}
        fill="transparent"
        stroke="oklch(70.5% 0.213 47.604)"
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
        strokeDasharray="5 2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove('SHAPE')}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel} />

      {corners.map((corner, i) => (
        <ToolCornerHandle
          key={i}
          direction={
            i === 0 ? 'NW' :
            i === 1 ? 'NE' :
            i === 2 ? 'SE' :
            'SW'
          }
          corner={corner}
          type={HANDLE_TYPES[i]}
          viewer={props.viewer}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove(HANDLE_TYPES[i])}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel} />
      ))}
    </g>
  )

}
