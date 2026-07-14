import type { ReconstructionCanvas } from '@/types';
import type { ComposerLayout, ComposerLayoutItem } from './composer-types';

export const ROW_GAP = 0.25;

export const COLUMN_GAP = 0.25;

export const COLUMN_WIDTH = 1;

// Helper
export interface LayoutRow {

  items: ComposerLayoutItem[];

  rowHeight: number;

}

export const TwoColumnLayout = (reconstruction: ReconstructionCanvas[]): ComposerLayout => {
  const rows: LayoutRow[] = [];

  for (let i = 0; i < reconstruction.length; i += 2) {
    const left = reconstruction[i];
    const right = reconstruction[i + 1]

    const leftHeight = left.type === 'composite' ? left.height : left.source.canvas.height;
    const leftWidth = left.type === 'composite' ? left.width : left.source.canvas.width;
    const leftAspect = leftHeight / leftWidth;

    const rightWidth = right ? right.type === 'composite' ? right.width : right.source.canvas.width : 0;
    const rightHeight = right ? right.type === 'composite' ? right.height : right.source.canvas.height : 0;
    const rightAspect = right ? rightHeight / rightWidth : 0;

    const rowHeight = Math.max(leftAspect, rightAspect);

    rows.push({
      items: [
        { 
          reconstructionCanvasId: left.id,
          x: 0, 
          y: 0, 
          width: COLUMN_WIDTH, 
          height: leftAspect
        },
        ...(right ? [{ 
          reconstructionCanvasId: right.id, 
          x: COLUMN_WIDTH + COLUMN_GAP, 
          y: 0, 
          width: COLUMN_WIDTH, 
          height: rightAspect
        }] : []) 
      ],
      rowHeight
    });
  }

  let currentY = 0;

  const items = [];

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
}
