import { useEffect, useRef } from 'react';
import OpenSeadragon, { TiledImage } from 'openseadragon';
import { useShallow } from 'zustand/react/shallow';
import { useComposerStore } from './composer-store';
import { getDraggableImageKey } from './composer-utils';
import { OverlayLayer } from './overlay-layer';
import { useComposerSelection } from './use-composer-selection';

export const CanvasComposer = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  const viewer = useComposerStore(state => state.viewer);
  const layout = useComposerStore(state => state.layout);
  const setViewer = useComposerStore(state => state.setViewer);

  // One images array per layout item
  const images = useComposerStore(useShallow(state =>
    layout.items.map(item => state.imagesByCanvasId.get(item.reconstructionCanvasId) ?? [])
  ));

  const firstRender = useRef(true);

  useComposerSelection(viewer, layout);

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
      setViewer(undefined);
    };
  }, []);

  useEffect(() => {
    if (!viewer) return;

    viewer.world.removeAll();
    useComposerStore.getState().tiledImages.clear();

    const promises = layout.items.flatMap((item, i) =>
      images[i].map(image => new Promise<void>(resolve => {
        viewer.addTiledImage({
          tileSource: image.tileSource,
          x: item.x + image.x / image.resource.width,
          y: item.y + image.y / image.resource.width,
          width: image.width / image.resource.width,
          success: (evt: Event) => {
            const { item } = evt as unknown as { item: TiledImage };
            useComposerStore.getState().tiledImages.set(getDraggableImageKey(image), item);
            resolve();
          }
        });
      }))
    );

    Promise.all(promises).then(() => {
      if (firstRender.current) {
        const aspectRatio = layout.layoutWidth / layout.layoutHeight;
        const worldRect = new OpenSeadragon.Rect(-0.15, -0.12, 1.3 * layout.layoutWidth, 1.3 * layout.layoutWidth / aspectRatio);
        viewer.viewport.fitBounds(worldRect, true);
        firstRender.current = false;
      }
    });
  }, [viewer, layout, images]);

  return (
    <div className="size-full bg-neutral-100 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px] [&_.openseadragon-container]:z-10 shadow-[inset_0_0_80px_-5px_rgba(0,0,0,0.06)] relative">
      <div ref={elementRef} className="size-full">
        <OverlayLayer />
      </div>
    </div>
  )

}