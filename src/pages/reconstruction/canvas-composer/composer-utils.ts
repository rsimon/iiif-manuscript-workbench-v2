import type { Point } from 'openseadragon';
import type { ComposerLayout, ComposerLayoutItem } from './composer-types';

export const getItemAt = (point: Point, layout: ComposerLayout): ComposerLayoutItem => {
  const hits = layout.items.filter(item => {
    const right = item.x + item.width;
    const bottom = item.y + item.height;
    return point.x >= item.x && point.x <= right && point.y >= item.y && point.y <= bottom;
  });

  return hits.sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    return areaA - areaB;
  })[0];
}