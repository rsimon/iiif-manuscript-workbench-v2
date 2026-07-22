import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { Point, type Viewer } from 'openseadragon';
import { ToolCornerHandle } from './tool-corner-handle';
import type { ComposerLayoutItem, CornerHandleType, DraggableImage, HandleType, ResizeHandleType } from '../../composer-types';
import { useComposerStore } from '../../composer-store';
import { getDraggableImageKey, getIntersectingItems, getItemAt, getItemCanvasSize } from '../../composer-utils';
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

  layoutX: number;

  layoutY: number;

  layoutWidth: number;

  itemId: string;

  image: DraggableImage;

}

export const ImageTool = (props: ImageToolProps) => {
  const { viewport, canvas: canvasEl } = props.viewer;

  const layout = useComposerStore(state => state.layout);

  const [origin, setOrigin] = useState<Point>();

  const [dragStart, setDragStart] = useState<DragStart>();

  const dragStartRef = useRef<DragStart | undefined>(undefined);

  const [intersectingItems, setIntersectingItems] = useState<ComposerLayoutItem[]>([]);

  const selectedImage = useComposerStore(state => state.selectedImage);

  const updateImage = useComposerStore(state => state.updateImage);
  const moveImageToCanvas = useComposerStore(state => state.moveImageToCanvas);

  const setIsDraggingImage = useComposerStore(state => state.setIsDraggingImage);

  // Stable identity for the current selection - unlike `selectedImage` itself,
  // this does NOT change on every drag-driven position update, so it's safe
  // to use as an effect dependency for resetting drag state on (re)selection.
  const selectionKey = selectedImage
    ? getDraggableImageKey(selectedImage.image)
    : undefined;

  const isValidDestination = useMemo(() => {
    if (intersectingItems.length === 0 || !selectedImage) return false;

    const hasChangedItem = intersectingItems.every(r => 
      r.reconstructionCanvasId !== selectedImage.item.reconstructionCanvasId);

    return !hasChangedItem || selectedImage.canChangeItem;
  }, [intersectingItems, selectedImage]);

  useEffect(() => {
    setOrigin(undefined);
    setDragStart(undefined);
    dragStartRef.current = undefined;

    if (selectedImage) {
      const { x, y, width } = selectedImage.image;
      const liveCorners = getImageCorners(selectedImage, x, y, width);
      updateIntersectingItems(liveCorners);
    }
  }, [selectionKey]);

  const corners = useMemo(() => {
    if (!selectedImage) return [];
    return getImageCorners(selectedImage);
  }, [selectedImage]);

  const getPoint = (evt: PointerEvent) => {
    const { x, y } = canvasEl.getBoundingClientRect();

    const { clientX, clientY } = evt;
    const offsetX = clientX - x;
    const offsetY = clientY - y;

    return viewport.pointFromPixel(new Point(offsetX, offsetY));
  }

  const updateIntersectingItems = (corners: Point[]) => {
    const intersectingItems = getIntersectingItems({
      x1: corners[0].x,
      y1: corners[0].y,
      x2: corners[2].x,
      y2: corners[2].y
    }, layout);

    setIntersectingItems(intersectingItems);

    // For convenience
    return intersectingItems;
  }

  const onMoveImage = (delta: number[]) => {
    const drag = dragStartRef.current;
    if (!selectedImage || !drag) return;

    const layoutX = drag.layoutX + delta[0];
    const layoutY = drag.layoutY + delta[1];
    const imageAspect = drag.image.resource.height / drag.image.resource.width;
    const layoutHeight = drag.layoutWidth * imageAspect;

    updateIntersectingItems([
      new Point(layoutX, layoutY),
      new Point(layoutX + drag.layoutWidth, layoutY),
      new Point(layoutX + drag.layoutWidth, layoutY + layoutHeight),
      new Point(layoutX, layoutY + layoutHeight)
    ]);

    const destination = getItemAt(
      new Point(layoutX + drag.layoutWidth / 2, layoutY + layoutHeight / 2),
      layout
    );

    if (destination && destination.reconstructionCanvasId !== drag.itemId && selectedImage.canChangeItem) {
      const source = useAppStore.getState().reconstruction.find(r =>
        r.id === drag.itemId);
      const target = useAppStore.getState().reconstruction.find(r =>
        r.id === destination.reconstructionCanvasId);

      if (!source || !target) return;

      const [targetWidth] = getItemCanvasSize(target);
      const targetImage = {
        ...drag.image,
        x: (layoutX - destination.x) * targetWidth,
        y: (layoutY - destination.y) * targetWidth,
        width: drag.layoutWidth * targetWidth
      };

      moveImageToCanvas(
        drag.itemId,
        destination.reconstructionCanvasId,
        targetImage
      );

      const nextDrag = {
        ...drag,
        x: targetImage.x,
        y: targetImage.y,
        width: targetImage.width,
        canvasWidth: targetWidth,
        itemId: destination.reconstructionCanvasId,
        image: targetImage
      };
      dragStartRef.current = nextDrag;
      setDragStart(nextDrag);
    } else {
      const canvas = useAppStore.getState().reconstruction.find(r => r.id === drag.itemId);
      if (!canvas) return;

      const [canvasWidth] = getItemCanvasSize(canvas);
      const item = layout.items.find(i => i.reconstructionCanvasId === drag.itemId);
      if (!item) return;

      const x = (layoutX - item.x) * canvasWidth;
      const y = (layoutY - item.y) * canvasWidth;
      const updatedImage = { ...drag.image, x, y };

      dragStartRef.current = { ...drag, x, y, image: updatedImage };
      updateImage(drag.itemId, updatedImage);
    }
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

    const liveCorners = getImageCorners(selectedImage, x, y, dragStart.width);
    const intersecting = updateIntersectingItems(liveCorners);

    const hasChangedItem = intersecting.length > 0 && selectedImage.canChangeItem &&
      intersecting.every(r => r.reconstructionCanvasId !== selectedImage.item.reconstructionCanvasId);

    const destinationId = hasChangedItem 
      ? intersecting[0].reconstructionCanvasId : selectedImage.item.reconstructionCanvasId;

    updateImage(destinationId, {
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

    const { x, y, width } = selectedImage.image;

    const item = layout.items.find(i => i.reconstructionCanvasId === selectedImage.item.reconstructionCanvasId);
    if (!item) return;

    const nextDrag = {
      x, y, width, canvasWidth,
      layoutX: item.x + x / canvasWidth,
      layoutY: item.y + y / canvasWidth,
      layoutWidth: width / canvasWidth,
      itemId: item.reconstructionCanvasId,
      image: selectedImage.image
    };

    dragStartRef.current = nextDrag;
    setDragStart(nextDrag);

    setIsDraggingImage(true);
    setOrigin(getPoint(evt));
  }

  const onPointerMove = (handle: HandleType) => (evt: React.PointerEvent) => {
    if (!origin) return;

    const pt = getPoint(evt);
    if (!pt) return;

    const delta = [pt.x - origin.x, pt.y - origin.y];

    if (handle === 'SHAPE') {
      onMoveImage(delta);
    } else {
      onResizeImage(handle, delta);
    }
  }

  const onPointerUp = (evt: React.PointerEvent) => {
    if (!selectedImage || !dragStart) return; // Should never happen

    const target = evt.target as Element;
    target.releasePointerCapture(evt.pointerId);

    // Revert position if dropped outside a canvas
    if (intersectingItems.length === 0) {
      updateImage(selectedImage.item.reconstructionCanvasId, {
        ...selectedImage.image,
        x: dragStart.x,
        y: dragStart.y,
        width: dragStart.width
      });

      const revertedCorners = getImageCorners(selectedImage, dragStart.x, dragStart.y, dragStart.width);
      updateIntersectingItems(revertedCorners);
    }

    setOrigin(undefined);
    setDragStart(undefined);
    requestAnimationFrame(() => setIsDraggingImage(false));
  }

  const onPointerCancel = () => {
    // Capture is auto-released by the browser on cancel
    setOrigin(undefined);
    setDragStart(undefined);
    setIsDraggingImage(false);
  }

  return selectedImage ? (
    <>
      <g>
        {intersectingItems.length > 0 && (
          <polygon
            className="cursor-grab pointer-events-none"
            points={cornersToSvgPoints(corners)}
            fill="transparent"
            stroke="white"
            strokeWidth={5}
            vectorEffect="non-scaling-stroke" />
        )}

        <polygon
          className="cursor-grab"
          points={cornersToSvgPoints(corners)}
          fill={isValidDestination ? 'transparent' : 'oklch(57.7% 0.245 27.325 / 0.3)'}
          stroke={isValidDestination ? 'oklch(70.5% 0.213 47.604)' : 'oklch(57.7% 0.245 27.325)'}
          strokeWidth={isValidDestination ? 2.5 : 1.5}
          vectorEffect="non-scaling-stroke"
          strokeDasharray={isValidDestination ?  '5 2' : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove('SHAPE')}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel} />

        {!isValidDestination && (
          <line 
            x1={corners[0].x}
            y1={corners[0].y} 
            x2={corners[2].x} 
            y2={corners[2].y} 
            stroke="oklch(57.7% 0.245 27.325)" 
            strokeWidth={1} 
            vectorEffect="non-scaling-stroke" />
        )}
        
        {corners.map((corner, i) => (
          <ToolCornerHandle
            key={i}
            invalid={!isValidDestination}
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
    </>
  ) : null;

}
