import { useEffect, useMemo, useRef, useState } from 'react';
import { Point, Viewer } from 'openseadragon';
import { useAppStore } from '@/store/app-store';
import { useReconstructionStore } from '../../../reconstruction-store';
import { useComposerStore } from '../../composer-store';
import type { ComposerLayoutItem,  DraggableImage,  HandleType, ResizeHandleType } from '../../composer-types';
import { getDraggableImageKey, getIntersectingItems, getItemCanvasSize } from '../../composer-utils';
import { ToolCornerHandle } from './tool-corner-handle';
import { 
  cornersToSvgPoints, 
  getImageCorners, 
  getPoint, 
  HANDLE_TYPES, 
  RESIZE_SIGNS, 
  type InitialShape 
} from './image-tool-utils';

interface ImageToolProps {

  viewer: Viewer;

}

export const ImageTool = (props: ImageToolProps) => {
  const layout = useComposerStore(state => state.layout);
  const selectedImage = useComposerStore(state => state.selectedImage);

  const updateImage = useComposerStore(state => state.updateImage);
  const moveImageToCanvas = useComposerStore(state => state.moveImageToCanvas);
  const setIsDraggingImage = useComposerStore(state => state.setIsDraggingImage);

  const setSelectedCanvas = useReconstructionStore(state => state.setSelection);

  // Last pointer down location (OSD viewport coordinate system)
  const origin = useRef<Point | undefined>(undefined);

  // Image state when drag started
  const initialShape = useRef<InitialShape | undefined>(undefined);

  const [intersectingItems, setIntersectingItems] = useState<ComposerLayoutItem[]>([]);

  // Stable identity for the current selection - unlike `selectedImage` itself,
  // this does NOT change on every drag-driven position update, so it's safe
  // to use as an effect dependency for resetting drag state on (re)selection.
  const selectionKey = selectedImage ? getDraggableImageKey(selectedImage.image) : undefined;

  const isValidDestination = useMemo(() => {
    if (intersectingItems.length === 0 || !selectedImage) return false;

    const hasChangedItem = intersectingItems.every(r => 
      r.reconstructionCanvasId !== selectedImage.item.reconstructionCanvasId);

    return !hasChangedItem || selectedImage.canChangeItem;
  }, [intersectingItems, selectedImage]);

  useEffect(() => {
    origin.current = undefined;
    initialShape.current = undefined;

    if (selectedImage) {
      const { x, y, width } = selectedImage.image;
      const liveCorners = getImageCorners(selectedImage, x, y, width);
      updateIntersectingItems(liveCorners);
    }
  }, [selectionKey]);

  useEffect(() => {
    if (!selectedImage || !initialShape.current) return;
    if (initialShape.current.item.reconstructionCanvasId === selectedImage.item.reconstructionCanvasId) return;

    // Selected (= dragged) image and initialShape no longer point to the
    // same reconstruction canvas ID - this means the canvas was modified,
    // usually changed from 'original' to 'composite' -> follow!
    const canvas = useAppStore.getState().reconstruction
      .find(r => r.id === selectedImage.item.reconstructionCanvasId);

    if (!canvas) return;

    initialShape.current = {
      ...initialShape.current,
      item: selectedImage.item,
      canvas
    };
  }, [selectedImage]);

  const corners = useMemo(() => {
    if (!selectedImage) return [];
    return getImageCorners(selectedImage);
  }, [selectedImage]);

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

  const onPointerDown = (evt: React.PointerEvent) => {
    if (!selectedImage) return;

    const target = evt.target as Element;
    target.setPointerCapture(evt.pointerId);

    const { image, item } = selectedImage;

    // Get current selection reference canvas
    const canvas = useAppStore.getState().reconstruction
      .find(r => r.id === selectedImage.item.reconstructionCanvasId);
    if (!canvas) return;

    const [canvasWidth] = getItemCanvasSize(canvas);

    origin.current = getPoint(evt, props.viewer);

    initialShape.current = {
      image, item, canvas,
      initialViewportPos: {
        x: item.x + image.x / canvasWidth,
        y: item.y + image.y / canvasWidth,
        width: image.width / canvasWidth
      }
    };

    setIsDraggingImage(true);    
  }

  const onPointerMove = (handle: HandleType) => (evt: React.PointerEvent) => {
    if (!origin.current) return;

    const pt = getPoint(evt, props.viewer);
    if (!pt) return;

    // X/Y delta in OSD viewport coordinates
    const delta = [pt.x - origin.current.x, pt.y - origin.current.y];

    if (handle === 'SHAPE') {
      onMoveImage(delta);
    } else {
      onResizeImage(handle, delta);
    }
  }

  const onPointerUp = (evt: React.PointerEvent) => {
    if (!selectedImage || !initialShape.current) return; // Should never happen

    const target = evt.target as Element;
    target.releasePointerCapture(evt.pointerId);

    const { x, y, width } = initialShape.current.image;

    // Revert position if dropped outside a canvas
    if (intersectingItems.length === 0) {
      updateImage(initialShape.current.item.reconstructionCanvasId, {
        ...selectedImage.image,
        x, y, width
      });

      const revertedCorners = getImageCorners(selectedImage, x, y, width);
      updateIntersectingItems(revertedCorners);
    }

    origin.current = undefined;
    initialShape.current = undefined;

    requestAnimationFrame(() => setIsDraggingImage(false));
  }

  const onPointerCancel = () => {
    // Capture is auto-released by the browser on cancel
    origin.current = undefined;
    initialShape.current = undefined;
    setIsDraggingImage(false);
  }

  const onMoveImage = (delta: number[]) => {
    if (!selectedImage || !initialShape.current) return;

    const initialImg = initialShape.current.image;
    const initialItem = initialShape.current.item;
    const initialPos = initialShape.current.initialViewportPos;

    // New bounds in OSD viewport coordinaets
    const viewportX = initialPos.x + delta[0];
    const viewportY = initialPos.y + delta[1];
    
    const aspect = initialImg.resource.height / initialImg.resource.width;
    const viewportHeight = initialPos.width * aspect;

    const intersecting = updateIntersectingItems([
      new Point(viewportX, viewportY),
      new Point(viewportX + initialPos.width, viewportY),
      new Point(viewportX + initialPos.width, viewportY + viewportHeight),
      new Point(viewportX, viewportY + viewportHeight)
    ]);

    const destination = intersecting.find(i => 
      i.reconstructionCanvasId === initialItem.reconstructionCanvasId) 
      || intersecting[0];

    const hasChangedDestination = destination && 
      destination.reconstructionCanvasId !== initialItem.reconstructionCanvasId;

    const isValidDestination = destination && 
      (!hasChangedDestination || selectedImage.canChangeItem);
      
    if (hasChangedDestination && isValidDestination) {
      const { reconstruction} = useAppStore.getState();

      const source = reconstruction.find(r => r.id === initialItem.reconstructionCanvasId);
      const target = reconstruction.find(r => r.id === destination.reconstructionCanvasId);

      const targetItem = layout.items.find(i => i.reconstructionCanvasId === destination.reconstructionCanvasId);

      // Should never happen
      if (!source || !target || !targetItem) return;

      // Translate image into the new canvas's local coordinate system
      const [targetWidth] = getItemCanvasSize(target);

      const targetImage = {
        ...initialImg,
        x: (viewportX - destination.x) * targetWidth,
        y: (viewportY - destination.y) * targetWidth,
        width: initialImg.width
      };

      const success = moveImageToCanvas(
        initialItem.reconstructionCanvasId,
        destination.reconstructionCanvasId,
        targetImage);

      if (success) {
        initialShape.current = {
          ...initialShape.current,
          item: targetItem,
          canvas: target
        };

        setSelectedCanvas([target]);
      }
    } else {
      const [canvasWidth] = getItemCanvasSize(initialShape.current.canvas);

      const updatedImage: DraggableImage = {
        ...initialImg, 
        x: (viewportX - initialItem.x) * canvasWidth,
        y: (viewportY - initialItem.y) * canvasWidth
      }

      updateImage(initialItem.reconstructionCanvasId, updatedImage);
    }
  }

  const onResizeImage = (handle: ResizeHandleType, delta: number[]) => {
    if (!selectedImage || !initialShape.current) return;

    const [canvasWidth] = getItemCanvasSize(initialShape.current.canvas);

    const dx = delta[0] * canvasWidth;
    const dy = delta[1] * canvasWidth;

    const { h, v } = RESIZE_SIGNS[handle];

    const initialImage = initialShape.current.image;

    const aspect = initialImage.resource.width / initialImage.resource.height;
    const initialHeight = initialImage.width / aspect;

    const dWidthFromX = h * dx;
    const dWidthFromY = v * dy * aspect;

    const dWidth = Math.abs(dWidthFromX) >= Math.abs(dWidthFromY) ? dWidthFromX : dWidthFromY;

    const width = Math.max(1, initialImage.width + dWidth);
    const height = width / aspect;

    const x = h < 0 ? (initialImage.x + initialImage.width) - width : initialImage.x;
    const y = v < 0 ? (initialImage.y + initialHeight) - height : initialImage.y;

    // const liveCorners = getImageCorners(selectedImage, x, y, width);
    // const intersecting = updateIntersectingItems(liveCorners);

    updateImage(initialShape.current.item.reconstructionCanvasId, {
      ...initialImage,
      x, y, width
    });

    /*
    



    const hasChangedItem = intersecting.length > 0 && selectedImage.canChangeItem &&
      intersecting.every(r => r.reconstructionCanvasId !== selectedImage.item.reconstructionCanvasId);

    const destinationId = hasChangedItem 
      ? intersecting[0].reconstructionCanvasId : selectedImage.item.reconstructionCanvasId;

    updateImage(destinationId, {
      ...selectedImage.image,
      x, y, width
    });
    */
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
