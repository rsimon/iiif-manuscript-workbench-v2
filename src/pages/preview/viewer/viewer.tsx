import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import type { Viewer as OpenSeadragonViewer } from 'openseadragon';
import type { CozyImageResource } from 'cozy-iiif';
import { usePreviewStore } from '../preview-store';
import { ViewerControls } from './viewer-controls';

interface ViewerProps {

  isInspectorOpen: boolean;

  onChangeInspectorOpen(open: boolean): void;

}

export const Viewer = (props: ViewerProps) => {
  const selected = usePreviewStore(state => state.selected);

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
    if (!viewer || !selected) return;

    // Guards against a superseded fitBounds after fast next/prev navigation
    let cancelled = false;

    const { width: canvasWidth, height: canvasHeight } = 
      selected.type === 'original' ? selected.source.canvas : selected;

    const addImage = (image: CozyImageResource) => new Promise<void>(resolve => {
      const tileSource = image.type === 'dynamic' || image.type === 'level0'
        ? image.serviceUrl
        : image.url;

      if (image.target) {
        const x = image.target.x / canvasWidth;
        const y = image.target.y / canvasWidth;
        const width = image.target.w / canvasWidth;

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

    const images = selected.type === 'original' 
      ? selected.source.canvas.images 
      : selected.sources.flatMap(s => s.canvas.images);

    Promise.all(images.map(addImage)).then(() => {
      if (cancelled) return;

      const aspectRatio = canvasWidth / canvasHeight;
      const canvasRect = new OpenSeadragon.Rect(-0.15, -0.12, 1.3, 1.3 / aspectRatio);
      viewer.viewport.fitBounds(canvasRect, true);
    });

    return () => {
      cancelled = true;
      viewer.world.removeAll();
    }
  }, [viewer, selected]);

  return (
    <div className="size-full relative">
      <div ref={elementRef} className="size-full" />

      <ViewerControls 
        viewer={viewer} 
        isInspectorOpen={props.isInspectorOpen}
        onChangeInspectorOpen={props.onChangeInspectorOpen} />
    </div>
  )

}