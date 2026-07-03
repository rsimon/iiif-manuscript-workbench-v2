import { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';

export const SourcePreview = () => {

  const elementRef = useRef<HTMLDivElement>(null);

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

    return () => {
      v.destroy();
    };
  }, []);
  
  return (
    <div ref={elementRef} className="size-full bg-neutral-100" /> 
  )
  
}