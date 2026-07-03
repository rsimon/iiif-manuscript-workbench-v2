import { createContext, useContext, useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { SourcePreviewControls } from './source-preview-controls';

const ViewerContext = createContext<OpenSeadragon.Viewer | null>(null);

export const useViewer = () => useContext(ViewerContext);

interface SourcePreviewProps {

  isInspectorOpen: boolean;

  setInspectorOpen(open: boolean): void;

}

export const SourcePreview = (props: SourcePreviewProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [viewer, setViewer] = useState<OpenSeadragon.Viewer | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const v = OpenSeadragon({
      element: elementRef.current,
      showNavigationControl: false,
      maxZoomPixelRatio: Infinity,
      minZoomImageRatio: 0,
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

  return (
    <ViewerContext.Provider value={viewer}>
      <div className="size-full relative">
        <div ref={elementRef} className="size-full bg-neutral-100" />

        <SourcePreviewControls 
          isInspectorOpen={props.isInspectorOpen} 
          setInspectorOpen={props.setInspectorOpen} />
      </div>
    </ViewerContext.Provider>
  )

}