import { useEffect, useRef, useState } from 'react';
import OpenSeadragon, { TiledImage } from 'openseadragon';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/shadcn/utils';
import { useAppStore } from '@/store/app-store';
import { useComposerStore } from './composer-store';
import { getDraggableImageKey } from './composer-utils';
import { useComposerSelection } from './use-composer-selection';
import { OverlayLayer } from './overlay-layer';

export const OSD_SPRING_STIFFNESS = 10;
export const OSD_ANIMATION_TIME = 0.5;

export const CanvasComposer = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  const layout = useComposerStore(state => state.layout);
  const viewer = useComposerStore(state => state.viewer);
  const setViewer = useComposerStore(state => state.setViewer);
  const reconstruction = useAppStore(state => state.reconstruction);

  useComposerSelection(viewer, layout);
  
  const firstRender = useRef(true);
  const [isReady, setIsReady] = useState(false);

  // images per layout item
  const images = useComposerStore(useShallow(state =>
    layout.items.map(item => state.imagesByCanvasId.get(item.reconstructionCanvasId) ?? [])
  ));

  // Allows OSD and react-resizable-panel to co-exist
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const onPointerDownCapture = (e: PointerEvent) => {
      if (e.defaultPrevented) 
        e.stopPropagation();
    }

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
      animationTime: OSD_ANIMATION_TIME,
      springStiffness: OSD_SPRING_STIFFNESS,
      clickDistThreshold: 10,
      clickTimeThreshold: 400,
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true
      },
      preserveViewport: true,
      showNavigator:  true,
      navigatorPosition: 'BOTTOM_RIGHT'
    });

    viewerInstance.navigator?.viewport.setMargins({ left: 8, top: 8, right: 8, bottom: 8 });

    setViewer(viewerInstance);
    
    return () => {
      viewerInstance.destroy();
      useComposerStore.getState().tiledImages.clear();
      setViewer(undefined);
    }
  }, []);

  useEffect(() => {
    if (!viewer) return;

    const { tiledImages, isDraggingImage } = useComposerStore.getState();

    // All layout items
    const placements = layout.items.flatMap((item, i) =>
      images[i].map(image => ({
        key: getDraggableImageKey(image),
        tileSource: image.tileSource,
        x: item.x + image.x / image.resource.width,
        y: item.y + image.y / image.resource.width,
        width: image.width / image.resource.width
      })));

    const toKeep = new Set(placements.map(p => p.key));

    // 1. Remove all images that are no longer in the layout
    [...tiledImages.entries()].forEach(([key, tiledImage]) => {
      if (!toKeep.has(key)) {
        viewer.world.removeItem(tiledImage);
        tiledImages.delete(key);
      }
    });

    const toAdd = placements.map(({ key, tileSource, x, y, width }) => {
      // 2. move/resize images that already exist
      const existing = tiledImages.get(key);
      if (existing) {
        existing.setPosition(new OpenSeadragon.Point(x, y), isDraggingImage);
        existing.setWidth(width, isDraggingImage);
        return Promise.resolve();
      }

      // 3. Add images that don't exist yet
      return new Promise<void>(resolve => {
        viewer.addTiledImage({
          tileSource,
          x, y, width,
          // @types/openseadragon mistypes this as (event: Event) => void;
          // OSD actually calls it with { item: TiledImage }.
          success: (evt: Event) => {
            const { item: tiledImage } = evt as unknown as { item: TiledImage };
            tiledImages.set(key, tiledImage);
            resolve();
          }
        });
      });
    });

    Promise.all(toAdd).then(() => {
      if (firstRender.current) {
        const aspectRatio = layout.layoutWidth / layout.layoutHeight;
        const worldRect = new OpenSeadragon.Rect(-0.15, -0.12, 1.3 * layout.layoutWidth, 1.3 * layout.layoutWidth / aspectRatio);
        viewer.viewport.fitBounds(worldRect, true);
        firstRender.current = false;
        setIsReady(true);
      }
    });
  }, [viewer, layout, images, reconstruction]);

  return (
    <div className="size-full relative bg-neutral-100 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px] 
      [&_.openseadragon-container]:z-10 [&_.navigator]:rounded-tl-md [&_.navigator]:bg-neutral-50! [&_.navigator]:border-r-0! 
      [&_.navigator]:border-b-0! [&_.navigator]:border-t! [&_.navigator]:border-l! [&_.navigator]:border-neutral-400/70! 
      [&_.navigator]:shadow-md shadow-[inset_0_0_80px_-5px_rgba(0,0,0,0.06)]">
      <div ref={elementRef} className={cn('size-full leading-0', !isReady && 'invisible')}>
        <OverlayLayer />
      </div>
    </div>
  )

}