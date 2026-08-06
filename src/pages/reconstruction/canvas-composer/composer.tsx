import { useEffect, useRef, useState } from 'react';
import OpenSeadragon, { TiledImage } from 'openseadragon';
import { useShallow } from 'zustand/react/shallow';
import { ViewerSvgOverlay } from '@/components/viewer-svg-overlay';
import { cn } from '@/shadcn/utils';
import { useAppStore } from '@/store/app-store';
import { getDraggableImageKey } from '../reconstruction-utils';
import { ComposerSelectionControl } from './composer-selection-control';
import { useComposerStore } from './composer-store';
import { ComposerToolbar } from './composer-toolbar';
import { ImageBoundsEditor } from './image-bounds-editor';
import { useComposerSelection } from './use-composer-selection';
import { useVisibleCanvases } from './use-visible-canvases';
import {
  CanvasIndicatorBackgroundLayer,
  CanvasIndicatorForegroundLayer
} from './canvas-indicator-layer';

export const OSD_SPRING_STIFFNESS = 10;
export const OSD_ANIMATION_TIME = 0.5;

// How many layout items (in layout order) the initial view fits to, instead
// of the whole manifest - keeps first paint cheap and fast on large manifests.
const INITIAL_VISIBLE_ITEMS = 8;

interface CanvasComposerProps {

  isSidebarOpen: boolean;

  onChangeSidebarOpen(open: boolean): void;

}

export const CanvasComposer = (props: CanvasComposerProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const layout = useComposerStore(state => state.layout);
  const viewer = useComposerStore(state => state.viewer);
  const setViewer = useComposerStore(state => state.setViewer);

  useComposerSelection(viewer, layout);

  const visibleIds = useVisibleCanvases(viewer, layout);

  const firstRender = useRef(true);
  const [isReady, setIsReady] = useState(false);

  // images per layout item - read only for its role as an effect dependency
  // below (via useShallow, so it changes reference exactly when per-canvas
  // image data changes); the effect itself looks images up fresh by ID.
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
      // The built-in navigator mirrors the exact set of TiledImages in the
      // main world - incompatible with lazily adding/removing them as the
      // user pans. Disabled until we build a geometry-only replacement.
      showNavigator: false,
      // Default is unlimited concurrent tile/info.json requests - with 100+
      // pages that's a thundering herd. Cap it.
      imageLoaderLimit: 6
    });

    setViewer(viewerInstance);
    
    return () => {
      viewerInstance.destroy();
      useComposerStore.getState().tiledImages.clear();
      useComposerStore.getState().pendingTiledImageKeys.clear();
      setViewer(undefined);
    }
  }, []);

  useEffect(() => {
    if (!viewer) return;

    // Initial view fits the first few layout items only, not the whole
    // manifest - on a 150-page document, fitting everything would put every
    // single canvas inside the viewport on frame one, defeating the
    // visibility-based loading below before it can do anything.
    const isFirstRender = firstRender.current;
    const initialItems = layout.items.slice(0, INITIAL_VISIBLE_ITEMS);

    if (isFirstRender) {
      const initialHeight = initialItems.length > 0
        ? Math.max(...initialItems.map(item => item.y + item.height))
        : layout.layoutHeight;

      const aspectRatio = layout.layoutWidth / (initialHeight || 1);
      const worldRect = new OpenSeadragon.Rect(-0.15, -0.12, 1.3 * layout.layoutWidth, 1.3 * layout.layoutWidth / aspectRatio);
      viewer.viewport.fitBounds(worldRect, true);

      firstRender.current = false;
      setIsReady(true);
    }

    const { reconstruction } = useAppStore.getState();
    const { tiledImages, pendingTiledImageKeys, isUserEdit, imagesByCanvasId } = useComposerStore.getState();

    // Only place images for canvases currently within the viewport (+
    // margin, see use-visible-canvases.ts) - everything else keeps whatever
    // TiledImage (or lack thereof) it already had. On the very first pass,
    // `visibleIds` can't be trusted yet: OpenSeadragon only starts its
    // internal update loop (and with it, the 'update-viewport' events
    // useVisibleCanvases relies on) once something has actually been added
    // to the world, so nothing would ever kick that loop off if we waited
    // for a viewport-derived answer here. Use the same deterministic first
    // batch as the fitBounds call above instead; visibleIds takes over from
    // the next pass onward, once the loop is running for real.
    const effectiveVisibleIds = isFirstRender
      ? new Set(initialItems.map(item => item.reconstructionCanvasId))
      : visibleIds;

    const visibleItems = layout.items.filter(item => effectiveVisibleIds.has(item.reconstructionCanvasId));

    const placements = visibleItems.flatMap(item => {
      const canvas = reconstruction.find(r => r.id === item.reconstructionCanvasId);
      if (!canvas) return [];

      const imagesForCanvas = imagesByCanvasId.get(item.reconstructionCanvasId) ?? [];

      return imagesForCanvas.map(image => ({
        key: getDraggableImageKey(image),
        tileSource: image.tileSource,
        x: item.x + image.x / canvas.width,
        y: item.y + image.y / canvas.width,
        width: image.width / canvas.width
      }));
    });

    const toKeep = new Set(placements.map(p => p.key));

    // 1. Evict images that scrolled out of the visible range
    [...tiledImages.entries()].forEach(([key, tiledImage]) => {
      if (!toKeep.has(key)) {
        viewer.world.removeItem(tiledImage);
        tiledImages.delete(key);
      }
    });

    // 2. Move/resize images that already exist
    placements.forEach(({ key, x, y, width }) => {
      const existing = tiledImages.get(key);
      if (existing) {
        existing.setPosition(new OpenSeadragon.Point(x, y), isUserEdit);
        existing.setWidth(width, isUserEdit);
      }
    });

    // 3. Add images that don't exist yet and aren't already being added -
    // addTiledImage() is async, so a key can be "requested but not yet in
    // tiledImages" for a while; without the pending check, a second effect
    // run in that window (e.g. once useVisibleCanvases picks up the real
    // viewport right after the initial deterministic batch) would fire a
    // duplicate request for the same image.
    placements
      .filter(({ key }) => !tiledImages.has(key) && !pendingTiledImageKeys.has(key))
      .forEach(({ key, tileSource, x, y, width }) => {
        pendingTiledImageKeys.add(key);

        viewer.addTiledImage({
          tileSource,
          x, y, width,
          // @types/openseadragon mistypes this as (event: Event) => void;
          // OSD actually calls it with { item: TiledImage }.
          success: (evt: Event) => {
            const { item: tiledImage } = evt as unknown as { item: TiledImage };
            pendingTiledImageKeys.delete(key);
            tiledImages.set(key, tiledImage);
          }
        });
      });
  }, [viewer, layout, images, visibleIds]);

  return (
    <div className="size-full relative bg-neutral-100 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-size-[16px_16px]
      [&_.openseadragon-container]:z-10 shadow-[inset_0_0_80px_-5px_rgba(0,0,0,0.06)]">
      <div ref={elementRef} className={cn('size-full leading-0', !isReady && 'invisible')}>
        {viewer && (
          <ViewerSvgOverlay
            viewer={viewer}
            bottomLayer={(
              <CanvasIndicatorBackgroundLayer
                layout={layout}
                viewer={viewer}
                visibleIds={visibleIds} />
            )}
            topLayer={(
              <>
                <CanvasIndicatorForegroundLayer
                  layout={layout}
                  viewer={viewer}
                  visibleIds={visibleIds} />

                <ImageBoundsEditor
                  viewer={viewer}/>
              </>
            )}/>
        )}
      </div>

      <ComposerSelectionControl
        isSidebarOpen={props.isSidebarOpen}
        onChangeSidebarOpen={props.onChangeSidebarOpen} />

      <ComposerToolbar />
    </div>
  )

}