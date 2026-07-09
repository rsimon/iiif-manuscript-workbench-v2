import { createContext, useContext, useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { SourcePreviewControls } from './source-preview-controls';
import type { CozyImageResource } from 'cozy-iiif';
import { SourcePreviewToolbar } from './source-preview-toolbar';
import { useSourceNavigation } from '../use-source-navigation';

const ViewerContext = createContext<OpenSeadragon.Viewer | null>(null);

export const useViewer = () => useContext(ViewerContext);

interface SourcePreviewProps {

  isInspectorOpen: boolean;

  setInspectorOpen(open: boolean): void;

}

export const SourcePreview = (props: SourcePreviewProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [viewer, setViewer] = useState<OpenSeadragon.Viewer | null>(null);

  const { 
    selectedCanvas,
    selectedManifest,
    isInReconstruction,
    selectNext,
    selectPrevious,
    currentSelectedIndex,
    visibleCanvases
  } = useSourceNavigation();

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // react-resizable-panel expands each Separator's drag hit target a few
    // pixels into neighboring Panel content, and only calls preventDefault()
    // when a pointerdown starts a resize there. That interferes with OSD!
    // Listening in the capture phase lets us detect that the drag
    // was claimed and stop it from reaching OSD at all.
    const onPointerDownCapture = (e: PointerEvent) => {
      if (e.defaultPrevented) 
        e.stopPropagation();
    }

    el.addEventListener('pointerdown', onPointerDownCapture, true);
    return () => el.removeEventListener('pointerdown', onPointerDownCapture, true);
  }, []);

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
      },
      viewportMargins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    });

    setViewer(v);

    return () => {
      v.destroy();
      setViewer(null);
    };
  }, []);

  useEffect(() => {
    if (!viewer || !selectedCanvas) return;

    const addImage = (image: CozyImageResource) => new Promise<void>(resolve => {
      const tileSource = image.type === 'dynamic' || image.type === 'level0' 
        ? image.serviceUrl
        : image.url;

      if (image.target) {
        const x = image.target.x / selectedCanvas!.width;
        const y = image.target.y / selectedCanvas!.width;
        const width = image.target.w / selectedCanvas!.width;

        viewer.addTiledImage({ 
          tileSource,
          x,
          y,
          width,
          success: () => resolve()
        });
      } else {
        viewer.addTiledImage({ tileSource, success: () => resolve() });
      }
    });

    Promise.all(selectedCanvas.images.map(addImage)).then(() => {
      const aspectRatio = selectedCanvas!.width / selectedCanvas!.height;
      const canvasRect = new OpenSeadragon.Rect(-0.15, -0.12, 1.3, 1.3 / aspectRatio);
      viewer.viewport.fitBounds(canvasRect, true);
    });

    return () => {
      viewer.world.removeAll();
    }
  }, [viewer, selectedCanvas]);

  return (
    <ViewerContext.Provider value={viewer}>
      <div 
        className="size-full relative bg-neutral-100 [&>.openseadragon-container]:z-10 shadow-[inset_0_0_80px_-5px_rgba(0,0,0,0.07)]">
        <div ref={elementRef} className="size-full" />

        <SourcePreviewControls 
          isInspectorOpen={props.isInspectorOpen} 
          setInspectorOpen={props.setInspectorOpen} />

        {(selectedManifest && selectedCanvas) && (
          <SourcePreviewToolbar 
            isInReconstruction={isInReconstruction(selectedManifest.id, selectedCanvas.id)}
            selectedCanvas={selectedCanvas}
            selectedManifest={selectedManifest} 
            selectedPageIndex={currentSelectedIndex}
            totalPageCount={visibleCanvases.length}
            onNext={selectNext} 
            onPrevious={selectPrevious} />
        )}
      </div>
    </ViewerContext.Provider>
  )

}