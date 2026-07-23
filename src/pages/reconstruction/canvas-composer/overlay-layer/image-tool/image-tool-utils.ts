import type { PointerEvent } from 'react';
import { Point, Viewer } from 'openseadragon';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';
import type { ComposerLayoutItem, CornerHandleType, DraggableImage, DraggableImageSelection, ResizeHandleType } from '../../composer-types';
import { getItemCanvasSize } from '../../composer-utils';

/* Initial image state at drag start */
export interface InitialShape {

  image: DraggableImage;

  item: ComposerLayoutItem;

  canvas: ReconstructionCanvas;

  // Image initial position, OSD viewport coordinates
  initialViewportPos: {

    x: number;

    y: number;

    width: number;

  }


}

export const HANDLE_TYPES: CornerHandleType[] = [
  'TOP_LEFT',
  'TOP_RIGHT',
  'BOTTOM_RIGHT',
  'BOTTOM_LEFT'
];

/**
 * Sign of each handle's effect on the image's x/y position as it's resized:
 * +1 keeps the opposite (min) edge anchored, -1 keeps the opposite (max)
 * edge anchored, 0 means this axis isn't driven by that handle at all.
 */
export const RESIZE_SIGNS: Record<ResizeHandleType, { h: number; v: number }> = {
  TOP_LEFT: { h: -1, v: -1 },
  TOP: { h: 0, v: -1 },
  TOP_RIGHT: { h: 1, v: -1 },
  RIGHT: { h: 1, v: 0 },
  BOTTOM_RIGHT: { h: 1, v: 1 },
  BOTTOM: { h: 0, v: 1 },
  BOTTOM_LEFT: { h: -1, v: 1 },
  LEFT: { h: -1, v: 0 }
};

/**
 * Returns list of corner points, OSD viewport coordinates. Optionally 
 * supports "overrides" for image position, in case image corners should 
 * be computed from live data, before Zustand state has updated.
 */
export const getImageCorners = (selected: DraggableImageSelection, ox?: number, oy?: number, ow?: number): Point[] => {
  const { image, item } = selected;

  // Snapshot read: canvas pixel size is structural (same category as
  // layout), not something that changes mid-drag - no need to subscribe.
  const canvas = useAppStore.getState().reconstruction.find(r => r.id === item.reconstructionCanvasId);
  if (!canvas) return [];

  const [canvasWidth] = getItemCanvasSize(canvas);

  const aspect = image.resource.width / image.resource.height;

  const x = item.x + (ox ?? image.x) / canvasWidth;
  const y = item.y + (oy ?? image.y) / canvasWidth;
  const w = (ow ?? image.width) / canvasWidth;
  const h = w / aspect;

  return [
    new Point(x, y),
    new Point(x + w, y),
    new Point(x + w, y + h),
    new Point(x, y + h)
  ];
}

export const cornersToSvgPoints = (corners: Point[]): string =>
  corners.map(p => `${p.x},${p.y}`).join(' ');

export const getPoint = (evt: PointerEvent, viewer: Viewer) => {
  const { x, y } = viewer.element.getBoundingClientRect();

  const { clientX, clientY } = evt;
  const offsetX = clientX - x;
  const offsetY = clientY - y;

  return viewer.viewport.pointFromPixel(new Point(offsetX, offsetY));
}