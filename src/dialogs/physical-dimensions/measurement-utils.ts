import type { Point, Viewer } from "openseadragon";

export const formatNumber = (n: number): string => {
  if (!Number.isFinite(n)) return '';
  return String(Math.round(n * 100) / 100);
}

export const parseNumber = (s: string): number | undefined => {
  const n = Number.parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const getDistance = (start: Point, end: Point, viewer: Viewer) => {
  const startPx = viewer.viewport.viewportToImageCoordinates(start);
  const endPx = viewer.viewport.viewportToImageCoordinates(end);

  const dx = Math.abs(endPx.x - startPx.x);
  const dy = Math.abs(endPx.y - startPx.y);

  return Math.ceil(10 * Math.sqrt(dx * dx + dy * dy)) / 10;
}