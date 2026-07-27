import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import type { Viewer as OpenSeadragonViewer } from 'openseadragon';
import { usePreviewStore } from '../preview-store';
import { ViewerControls } from './viewer-controls';
import { ViewerToolbar } from './viewer-toolbar';
import { addPage, getHeight } from './viewer-utils';

interface ViewerProps {

  isInspectorOpen: boolean;

  onChangeInspectorOpen(open: boolean): void;

}

// Horizontal gap between pages
const PAGE_GAP = 0;

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
    if (!viewer || !(left || right)) return;

    let cancelled = false;

    const addLeft = left ? addPage(viewer, left, 0) : undefined;
    const addRight = right ? addPage(viewer, right, 1 + PAGE_GAP) : undefined;

    const totalWidth = (addLeft &&  addRight) ? 2 + PAGE_GAP : 1;
    const totalHeight = getHeight([left, right]);

    Promise.all([addLeft, addRight]).then(() => {
      if (cancelled) return;

      const viewRect = new OpenSeadragon.Rect(-0.15, -0.12, totalWidth, totalHeight);
      viewer.viewport.fitBounds(viewRect, true);
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
