import { useEffect, useRef } from 'react';
import { CanvasIndicatorBackground, CanvasIndicatorForeground } from './canvas-indicator';
import { useComposerStore } from '../composer-store';
import { ImageTool } from './image-tool';

export const OverlayLayer = () => {
  const viewer = useComposerStore(state => state.viewer);
  const layout = useComposerStore(state => state.layout);

  const belowSvgRef = useRef<SVGSVGElement>(null);
  const belowGroupRef = useRef<SVGGElement>(null);

  const aboveSvgRef = useRef<SVGSVGElement>(null);
  const aboveGroupRef = useRef<SVGGElement>(null);

  const containerSizeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (
      !viewer || 
      !belowGroupRef.current || 
      !aboveGroupRef.current 
    ) return;

    const setViewBox = (x: number, y: number) => {
      const viewBox = `0 0 ${x} ${y}`;
      belowSvgRef.current?.setAttribute('viewBox', viewBox);
      aboveSvgRef.current?.setAttribute('viewBox', viewBox);
    };

    const onUpdateViewport = () => {
      const bounds = viewer.viewport.getBounds(true);

      const scaleX = containerSizeRef.current.x / bounds.width;
      const scaleY = containerSizeRef.current.y / bounds.height;

      if (isNaN(scaleX) || isNaN(scaleY)) return;
      
      const transform = 
        `scale(${scaleX}, ${scaleY}) translate(${-bounds.x}, ${-bounds.y})`;

      belowGroupRef.current?.setAttribute('transform', transform);
      aboveGroupRef.current?.setAttribute('transform', transform);
    };

    const onResize = (entries: ResizeObserverEntry[]) => {
      // Observer entry's contentRect is always current, regardless of
      // whether OSD has already caught up.
      const { width, height } = entries[0].contentRect;

      containerSizeRef.current = { x: width, y: height };
      setViewBox(width, height);

      onUpdateViewport();
    };

    // Sync initial size
    const { x, y } = viewer.viewport.getContainerSize();
    containerSizeRef.current = { x, y };
    setViewBox(x, y);

    viewer.addHandler('update-viewport', onUpdateViewport);

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(viewer.container);

    return () => {
      viewer.removeHandler('update-viewport', onUpdateViewport);
      resizeObserver.disconnect();
    };
  }, [viewer]);

  return viewer ? (
    <> 
      {/* Elements BELOW the OSD image layer */}
      <svg
        ref={belowSvgRef}
        className="absolute inset-0 size-full pointer-events-none z-0">
        <g ref={belowGroupRef} className="pointer-events-auto">
          <CanvasIndicatorBackground layout={layout} />
        </g>
      </svg>

      {/* Elements ABOVE the OSD image layer */}
      <svg
        ref={aboveSvgRef}
        className="absolute inset-0 size-full pointer-events-none z-50">
        <g ref={aboveGroupRef} className="pointer-events-auto">
          <CanvasIndicatorForeground 
            layout={layout} />

          <ImageTool 
            viewer={viewer}/>
        </g>
      </svg>
    </>
  ) : null;

}