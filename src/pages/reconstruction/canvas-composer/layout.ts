import type { ReconstructionCanvas } from '@/types';
import type { ComposerLayout, DraggableImage, ReconstructionCanvasItem } from './composer-types';
import { getRepresentativeCanvas } from './utils';

export const ROW_GAP = 0.25;

export const COLUMN_GAP = 0.25;

export const COLUMN_WIDTH = 1;

const DEFAULT_WIDTH = 0.4;

const DEFAULT_STEP = 0.05; // rightward/downward shift per stacked image

// Helper
export interface LayoutRow {

  items: ReconstructionCanvasItem[];

  rowHeight: number;

}

const toDraggableImages = (r: ReconstructionCanvas): DraggableImage[] => {
  const sources = r.type === 'original' ? [r.source] : r.sources;

  return sources.reduce<DraggableImage[]>((agg, source) => {
    return [
      ...agg, 
      ...source.canvas.images.map((image, idx) => {
        const runningIndex = agg.length + idx;

        const defaultWidth = runningIndex === 0 ? source.canvas.width : source.canvas.width * DEFAULT_WIDTH;
        const defaultOffset = runningIndex === 0 ? 0 : source.canvas.width * DEFAULT_STEP * runningIndex;

        const x = image.target ? image.target.x : defaultOffset;
        const y = image.target ? image.target.y : defaultOffset;
        const width = image.target ? image.target.w : defaultWidth;

        return {
          sourceCanvasId: source.canvas.id,
          resource: image,
          tileSource: image.type === 'dynamic' || image.type === 'level0' ? image.serviceUrl : {
            type: 'image',
            url: image.getImageURL()
          },
          x,
          y,
          width
        } as DraggableImage
      })
    ]
  }, []);
}

export const TwoColumnLayout = (reconstruction: ReconstructionCanvas[]): ComposerLayout => {
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
        { 
          canvas: left, 
          x: 0, 
          y: 0, 
          width: COLUMN_WIDTH, 
          height: leftAspect,
          images: toDraggableImages(left)
        },
        ...(right ? [{ 
          canvas: right, 
          x: COLUMN_WIDTH + COLUMN_GAP, 
          y: 0, 
          width: COLUMN_WIDTH, 
          height: rightAspect,
          images: toDraggableImages(right)
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
