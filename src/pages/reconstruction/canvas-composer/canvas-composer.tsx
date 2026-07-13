import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';

const ROW_GAP = 0.25;
const COLUMN_GAP = 0.25;
const COLUMN_WIDTH = 1;

export const CanvasComposer = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<OpenSeadragon.Viewer | null>(null);
  const reconstruction = useAppStore(state => state.reconstruction);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const onPointerDownCapture = (e: PointerEvent) => {
      if (e.defaultPrevented) e.stopPropagation();
    };

    el.addEventListener('pointerdown', onPointerDownCapture, true);
    return () => el.removeEventListener('pointerdown', onPointerDownCapture, true);
  }, []);

  useEffect(() => {
    if (!elementRef.current) return;

    const viewerInstance = OpenSeadragon({
      element: elementRef.current,
      showNavigationControl: false,
      maxZoomPixelRatio: Infinity,
      minZoomImageRatio: 0,
      animationTime: 0.5,
      springStiffness: 10,
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true
      },
      viewportMargins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    });

    setViewer(viewerInstance);
    return () => {
      viewerInstance.destroy();
      setViewer(null);
    };
  }, []);

  useEffect(() => {
    if (!viewer) return;

    viewer.world.removeAll();
    if (reconstruction.length === 0) return;

    const rows: { items: { canvas: ReconstructionCanvas; xOffset: number; yOffset: number }[]; rowHeight: number }[] = [];

    for (let i = 0; i < reconstruction.length; i += 2) {
      const left = reconstruction[i];
      const right = reconstruction[i + 1];
      const leftCanvas = getRepresentativeCanvas(left);
      const rightCanvas = right ? getRepresentativeCanvas(right) : undefined;

      const leftHeight = leftCanvas.height / leftCanvas.width;
      const rightHeight = rightCanvas ? rightCanvas.height / rightCanvas.width : 0;
      const rowHeight = Math.max(leftHeight, rightHeight);

      rows.push({
        items: [
          { canvas: left, xOffset: 0, yOffset: 0 },
          ...(right ? [{ canvas: right, xOffset: COLUMN_WIDTH + COLUMN_GAP, yOffset: 0 }] : [])
        ],
        rowHeight
      });
    }

    let currentY = 0;
    const loadPromises: Promise<void>[] = [];

    for (const row of rows) {
      for (const item of row.items) {
        const itemHeight = getRepresentativeCanvas(item.canvas).height / getRepresentativeCanvas(item.canvas).width;
        item.yOffset = currentY + (row.rowHeight - itemHeight) / 2;

        loadPromises.push(...getImageLoadPromises(viewer, item.canvas, item.xOffset, item.yOffset));
      }
      currentY += row.rowHeight + ROW_GAP;
    }

    Promise.all(loadPromises).then(() => {
      const fullWidth = COLUMN_WIDTH * 2 + COLUMN_GAP;
      const fullHeight = currentY - ROW_GAP;
      const worldRect = new OpenSeadragon.Rect(0, 0, fullWidth, fullHeight);
      viewer.viewport.fitBounds(worldRect, true);
    });
  }, [viewer, reconstruction]);

  return (
    <div className="size-full bg-neutral-100 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px] [&>.openseadragon-container]:z-10 shadow-[inset_0_0_80px_-5px_rgba(0,0,0,0.06)] relative">
      <div ref={elementRef} className="size-full" />
      {reconstruction.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-600">
          No reconstruction canvases yet.
        </div>
      )}
    </div>
  );
}

const getRepresentativeCanvas = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original' ? canvas.source.canvas : canvas.sources[0].canvas;

const getImageLoadPromises = (
  viewer: OpenSeadragon.Viewer,
  reconstructionCanvas: ReconstructionCanvas,
  xOffset: number,
  yOffset: number
) => {
  const sources = reconstructionCanvas.type === 'original'
    ? [reconstructionCanvas.source]
    : reconstructionCanvas.sources;

  return sources.flatMap(source =>
    source.canvas.images.map(image => new Promise<void>(resolve => {
      const tileSource = image.type === 'dynamic' || image.type === 'level0'
        ? image.serviceUrl
        : image.url;

      if (image.target) {
        viewer.addTiledImage({
          tileSource,
          x: xOffset + image.target.x / source.canvas.width,
          y: yOffset + image.target.y / source.canvas.width,
          width: image.target.w / source.canvas.width,
          success: () => resolve()
        });
      } else {
        viewer.addTiledImage({
          tileSource,
          x: xOffset,
          y: yOffset,
          width: COLUMN_WIDTH,
          success: () => resolve()
        });
      }
    })));
}
