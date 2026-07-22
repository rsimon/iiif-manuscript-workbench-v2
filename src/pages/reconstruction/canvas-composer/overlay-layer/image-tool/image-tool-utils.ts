import { Point } from 'openseadragon';
import { useAppStore } from '@/store/app-store';
import type { DraggableImageSelection } from '../../composer-types';
import { getItemCanvasSize } from '../../composer-utils';

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