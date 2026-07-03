import { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import { Button } from '@/shadcn/button';

interface SourcePreviewProps {

  isInspectorOpen: boolean;

  setInspectorOpen(open: boolean): void;

}

export const SourcePreview = (props: SourcePreviewProps) => {

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
    <div className="size-full relative">
      <div ref={elementRef} className="size-full bg-neutral-100" /> 

      <Button 
        className="absolute top-6 right-6"
        onClick={() => props.setInspectorOpen(!props.isInspectorOpen)}>
        {props.isInspectorOpen ? 'Close' : 'Open'}
      </Button>
    </div>
  )
  
}