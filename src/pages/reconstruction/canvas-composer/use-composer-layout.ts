import { useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import { getRepresentativeCanvas } from './utils';
import type { ReconstructionCanvas } from '@/types';

export interface Layout {

  items: LayoutItem[];

  layoutWidth: number;

  layoutHeight: number;

}

export interface LayoutItem { 
  
  canvas: ReconstructionCanvas;

  x: number; 
  
  y: number; 
  
  width: number; 
  
  height: number;

}

export interface LayoutRow {

  items: LayoutItem[];

  rowHeight: number;

}

export const ROW_GAP = 0.25;
export const COLUMN_GAP = 0.25;
export const COLUMN_WIDTH = 1;

export const useComposerLayout = () => {

  const reconstruction = useAppStore(state => state.reconstruction);

  const layout: Layout  = useMemo(() => {
    const rows: LayoutRow[] = [];

    for (let i = 0; i < reconstruction.length; i += 2) {
      const left = reconstruction[i];
      const right = reconstruction[i + 1];

      const leftCanvas = getRepresentativeCanvas(left);
      const rightCanvas = right ? getRepresentativeCanvas(right) : undefined;

      // Temporary hack - derive a proper world coordinate system later!
      const leftAspect = leftCanvas.height / leftCanvas.width;
      const rightAspect = rightCanvas ? rightCanvas.height / rightCanvas.width : 0;
      const rowHeight = Math.max(leftAspect, rightAspect);

      rows.push({
        items: [
          { canvas: left, x: 0, y: 0, width: COLUMN_WIDTH, height: leftAspect },
          ...(right ? [{ canvas: right, x: COLUMN_WIDTH + COLUMN_GAP, y: 0, width: COLUMN_WIDTH, height: rightAspect }] : [])
        ],
        rowHeight
      });
    }

    let currentY = 0;

    const items: LayoutItem[] = [];

    for (const row of rows) {
      for (const item of row.items) {
        items.push({
          ...item,
          y: currentY + (row.rowHeight - item.height) / 2
        });
      }
      currentY += row.rowHeight + ROW_GAP;
    }

    return {
      items,
      layoutWidth: COLUMN_WIDTH * 2 + COLUMN_GAP,
      layoutHeight: Math.max(0, currentY - ROW_GAP)
    };
  }, [reconstruction]);

  return layout;

}