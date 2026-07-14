import { Point } from 'openseadragon';
import type { DraggableImageSelection } from '../../composer-types';
import { getItemCanvasSize } from '../../composer-utils';
import { useAppStore } from '@/store/app-store';

// Returns list of corner points, OSD viewport coordinates
export const getImageCorners = (selected: DraggableImageSelection): Point[] => {
  const { image, item } = selected;

  // Snapshot read: canvas pixel size is structural (same category as
  // layout), not something that changes mid-drag - no need to subscribe.
  const canvas = useAppStore.getState().reconstruction.find(r => r.id === item.reconstructionCanvasId);
  if (!canvas) return [];

  const [canvasWidth, canvasHeight] = getItemCanvasSize(canvas);

  const aspect = image.resource.width / image.resource.height;

  const x = item.x + image.x / canvasWidth;
  const y = item.y + image.y / canvasHeight;
  const w = image.width / canvasWidth;
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