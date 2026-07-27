import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import type { Viewer as OpenSeadragonViewer } from 'openseadragon';
import type { ReconstructionCanvas } from '@/types';
import { usePreviewStore } from '../preview-store';
import { ViewerControls } from './viewer-controls';
import { ViewerToolbar } from './viewer-toolbar';

interface ViewerProps {

  isInspectorOpen: boolean;

  onChangeInspectorOpen(open: boolean): void;

}

// Horizontal gap between pages
const PAGE_GAP = 0;

const getCanvasDimensions = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original' ? canvas.source.canvas : canvas;

const getCanvasImages = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original'
    ? canvas.source.canvas.images
    : canvas.sources.flatMap(s => s.canvas.images);

/**
 * Adds the tiled image(s) for one page to the OSD world, scaling the whole
 * page to exactly 1 world unit tall and offsetting it horizontally by
 * `xOffset` - so multiple pages can be laid out side by side at the same
 * visual height regardless of their individual pixel aspect ratios.
 */
const addPage = (viewer: OpenSeadragonViewer, canvas: ReconstructionCanvas, xOffset: number) => {
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(canvas);

  // Uniform pixel-to-world scale factor: canvasHeight maps to 1 world unit.
  const scale = 1 / canvasHeight;
  const pageWidth = canvasWidth * scale;

  const images = getCanvasImages(canvas);

  const items = images.length > 0 ? images.map(image => ({
    tileSource: image.type === 'dynamic' || image.type === 'level0'
      ? image.serviceUrl
      : image.url,
    target: image.target || { x: 0, y: 0, w: canvasWidth, h: canvasHeight }
  })) : [{
    tileSource: { type: 'image', url: './empty_placeholder.png' },
    target: { x: 0, y: 0, w: canvasWidth, h: canvasHeight }
  }];

  const promise = Promise.all(items.map(({ tileSource, target }) => new Promise<void>(resolve => {
    viewer.addTiledImage({
      tileSource,
      x: xOffset + target.x * scale,
      y: target.y * scale,
      width: target.w * scale,
      success: () => resolve()
    });
  }))).then(() => {});

  return { promise, width: pageWidth };
}

export const Viewer = (props: ViewerProps) => {
  const selectedView = usePreviewStore(state => state.selectedView);
  const { left, right } = selectedView ?? {};

  const elementRef = useRef<HTMLDivElement>(null);

  const [viewer, setViewer] = useState<OpenSeadragonViewer | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const v = OpenSeadragon({
      element: elementRef.current,
      showNavigationControl: false,
      maxZoomPixelRatio: Infinity,
      minZoomImageRatio: 0,
      animationTime: 0.5,
      springStiffness: 10,
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true
      }
    });

    setViewer(v);

    return () => {
      v.destroy();
      setViewer(null);
    };
  }, []);

  useEffect(() => {
    if (!viewer || !left) return;

    // Guards against a superseded fitBounds after fast next/prev navigation
    let cancelled = false;

    const leftPage = addPage(viewer, left, 0);
    const rightPage = right ? addPage(viewer, right, leftPage.width + PAGE_GAP) : undefined;

    const totalWidth = rightPage ? leftPage.width + PAGE_GAP + rightPage.width : leftPage.width;

    Promise.all([leftPage.promise, rightPage?.promise]).then(() => {
      if (cancelled) return;

      const marginX = 0.15;
      const marginTop = 0.12;
      const marginBottom = 0.18;

      const spreadRect = new OpenSeadragon.Rect(
        -marginX,
        -marginTop,
        totalWidth + marginX * 2,
        1 + marginTop + marginBottom
      );

      viewer.viewport.fitBounds(spreadRect, true);
    });

    return () => {
      cancelled = true;
      viewer.world.removeAll();
    }
  }, [viewer, left, right]);

  return (
    <div className="size-full relative bg-neutral-100 [&>.openseadragon-container]:z-10 shadow-[inset_0_0_80px_-5px_rgba(0,0,0,0.07)]">
      <div ref={elementRef} className="size-full" />

      <ViewerControls
        viewer={viewer}
        isInspectorOpen={props.isInspectorOpen}
        onChangeInspectorOpen={props.onChangeInspectorOpen} />

      <ViewerToolbar />
    </div>
  )

}
