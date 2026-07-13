import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import type { ReconstructionCanvas } from '@/types';
import { useComposerLayout } from './use-composer-layout';

export const CanvasComposer = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [viewer, setViewer] = useState<OpenSeadragon.Viewer | null>(null);

  const firstRender = useRef(true);

  // For later: make this hook handle different layout modes
  const layout = useComposerLayout();

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
      preserveViewport: true
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

    Promise.all(layout.items.flatMap(({ canvas, x, y, width }) => {
      return addReconstructionCanvas(viewer, canvas, x, y, width)
    })).then(() => {
      if (firstRender.current) {
        const aspectRatio = layout.layoutWidth / layout.layoutHeight;
        const worldRect = new OpenSeadragon.Rect(-0.15, -0.12, 1.3 * layout.layoutWidth, 1.3 * layout.layoutWidth / aspectRatio);
        viewer.viewport.fitBounds(worldRect, true);
        firstRender.current = false;
      }
    });
  }, [viewer, layout]);

  return (
    <div className="size-full bg-neutral-100 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px] [&>.openseadragon-container]:z-10 shadow-[inset_0_0_80px_-5px_rgba(0,0,0,0.06)] relative">
      <div ref={elementRef} className="size-full" />

      {/* }
      <CanvasComposerOverlay
        viewer={viewer}
        items={layout.items}
        selectedIds={selection.map(item => item.id)}
      /> */}
    </div>
  );
}

const addReconstructionCanvas = (
  viewer: OpenSeadragon.Viewer,
  reconstructionCanvas: ReconstructionCanvas,
  xOffset: number,
  yOffset: number,
  width: number
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
          width,
          success: () => resolve()
        });
      }
    })));
}
