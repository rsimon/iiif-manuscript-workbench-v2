import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { useComposerStore } from './composer-store';
// import type { ReconstructionCanvasItem } from './composer-types';
// import type { ReconstructionCanvas } from '@/types';
// import { OverlayLayer } from './overlay-layer/overlay-layer';

export const CanvasComposer = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [viewer, setViewer] = useState<OpenSeadragon.Viewer | null>(null);

  const firstRender = useRef(true);

  const layout = useComposerStore(state => state.layout);

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

    Promise.all(layout.items.map(item => {
      return item.images.map(image => new Promise<void>(resolve => {
        return viewer.addTiledImage({
          tileSource: image.tileSource,
          x: item.x + image.x / image.resource.width,
          y: item.y + image.y / image.resource.width,
          width: image.width / image.resource.width,
          success: () => resolve()
        });
      }));
    })).then(() => {
      if (firstRender.current) {
        console.log('fit', layout.layoutWidth, layout.layoutHeight);
        const aspectRatio = layout.layoutWidth / layout.layoutHeight;
        const worldRect = new OpenSeadragon.Rect(-0.15, -0.12, 1.3 * layout.layoutWidth, 1.3 * layout.layoutWidth / aspectRatio);
        viewer.viewport.fitBounds(worldRect, true);
        firstRender.current = false;
      }
    });
  }, [viewer, layout]);

  return (
    <div className="size-full bg-neutral-100 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px] [&_.openseadragon-container]:z-10 shadow-[inset_0_0_80px_-5px_rgba(0,0,0,0.06)] relative">
      <div ref={elementRef} className="size-full">
        {/* <OverlayLayer
          viewer={viewer} /> */}
      </div>
    </div>
  );
}