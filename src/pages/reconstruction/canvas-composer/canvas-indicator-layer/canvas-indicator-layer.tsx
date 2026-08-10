import { useEffect, useRef } from 'react';
import { Spring, type Viewer } from 'openseadragon';
import { useReconstructionStore } from '../../reconstruction-store';
import type { ComposerLayout, ComposerLayoutItem } from '../../reconstruction-types';
import { OSD_ANIMATION_TIME, OSD_SPRING_STIFFNESS } from '../composer';

interface CanvasIndicatorLayerProps {

  viewer: Viewer;

  layout: ComposerLayout;

  visibleIds: Set<string>;

}

interface ItemSprings {

  x: Spring;

  y: Spring;

  height: Spring;

}

const SELECTED_STROKE = 'oklch(0.5 0.15 246.78)'; // primary
const DEFAULT_STROKE = 'oklch(92.2% 0 0)'; // neutral-200

const createSprings = (item: ComposerLayoutItem): ItemSprings => {
  const options = { springStiffness: OSD_SPRING_STIFFNESS, animationTime: OSD_ANIMATION_TIME };
  return {
    x: new Spring({ ...options, initial: item.x }),
    y: new Spring({ ...options, initial: item.y }),
    height: new Spring({ ...options, initial: item.height })
  };
}

export const CanvasIndicatorLayer = (props: CanvasIndicatorLayerProps) => {
  const { viewer } = props;

  const backgroundRef = useRef<HTMLCanvasElement>(null);
  const foregroundRef = useRef<HTMLCanvasElement>(null);

  const springsById = useRef<Map<string, ItemSprings>>(new Map());
  const itemsById = useRef<Map<string, ComposerLayoutItem>>(new Map());
  const visibleIdsRef = useRef(props.visibleIds);
  const selectedIdsRef = useRef<Set<string>>(new Set());

  const selection = useReconstructionStore(state => state.selection);

  // Points at the current draw() closure from the setup effect below, so the
  // effects here can force an immediate repaint. Without this, a change that
  // isn't accompanied by an OSD 'update-viewport' event - selection, most
  // notably - would just sit there showing stale pixels until the next pan/
  // zoom happened to trigger one.
  const drawRef = useRef<() => void>(() => {});

  useEffect(() => {
    selectedIdsRef.current = new Set(selection.map(s => s.id));
    drawRef.current();
  }, [selection]);

  useEffect(() => {
    visibleIdsRef.current = props.visibleIds;

    // Drop springs for canvases that are out of view and fully settled
    for (const [id, springs] of springsById.current) {
      const stillNeeded = props.visibleIds.has(id) ||
        !springs.x.isAtTargetValue() || !springs.y.isAtTargetValue() || !springs.height.isAtTargetValue();

      if (!stillNeeded) springsById.current.delete(id);
    }

    drawRef.current();
  }, [props.visibleIds]);

  useEffect(() => {
    itemsById.current = new Map(props.layout.items.map(item => [item.reconstructionCanvasId, item]));

    for (const item of props.layout.items) {
      const springs = springsById.current.get(item.reconstructionCanvasId);
      if (!springs) continue;

      if (springs.x.target.value !== item.x) springs.x.springTo(item.x);
      if (springs.y.target.value !== item.y) springs.y.springTo(item.y);
      if (springs.height.target.value !== item.height) springs.height.springTo(item.height);
    }

    drawRef.current();
  }, [props.layout]);

  useEffect(() => {
    const backgroundCanvas = backgroundRef.current;
    const foregroundCanvas = foregroundRef.current;
    if (!backgroundCanvas || !foregroundCanvas) return;

    const backgroundCtx = backgroundCanvas.getContext('2d');
    const foregroundCtx = foregroundCanvas.getContext('2d');
    if (!backgroundCtx || !foregroundCtx) return;

    const dpr = window.devicePixelRatio || 1;
    const containerSize = { x: 0, y: 0 };

    const sizeCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    const draw = () => {
      const bounds = viewer.viewport.getBounds(true);

      const scaleX = containerSize.x / bounds.width;
      const scaleY = containerSize.y / bounds.height;
      if (isNaN(scaleX) || isNaN(scaleY)) return;

      backgroundCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      backgroundCtx.clearRect(0, 0, containerSize.x, containerSize.y);

      foregroundCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      foregroundCtx.clearRect(0, 0, containerSize.x, containerSize.y);

      for (const canvasId of visibleIdsRef.current) {
        const item = itemsById.current.get(canvasId);
        if (!item) continue;

        let springs = springsById.current.get(canvasId);
        if (!springs) {
          springs = createSprings(item);
          springsById.current.set(canvasId, springs);
        }

        springs.x.update();
        springs.y.update();
        springs.height.update();

        // World (layout) coordinates -> screen (CSS pixel) coordinates.
        const screenX = (springs.x.current.value - bounds.x) * scaleX;
        const screenY = (springs.y.current.value - bounds.y) * scaleY;
        const screenWidth = item.width * scaleX;
        const screenHeight = springs.height.current.value * scaleY;

        backgroundCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        backgroundCtx.fillRect(screenX, screenY, screenWidth, screenHeight);

        const isSelected = selectedIdsRef.current.has(canvasId);

        foregroundCtx.strokeStyle = isSelected ? SELECTED_STROKE : DEFAULT_STROKE;
        foregroundCtx.lineWidth = isSelected ? 2 : 1;
        foregroundCtx.strokeRect(screenX, screenY, screenWidth, screenHeight);
      }
    }

    const onResize = (entries: ResizeObserverEntry[]) => {
      const { width, height } = entries[0].contentRect;

      containerSize.x = width;
      containerSize.y = height;
      sizeCanvas(backgroundCanvas, width, height);
      sizeCanvas(foregroundCanvas, width, height);
      draw();
    }

    drawRef.current = draw;

    const { x, y } = viewer.viewport.getContainerSize();
    containerSize.x = x;
    containerSize.y = y;
    sizeCanvas(backgroundCanvas, x, y);
    sizeCanvas(foregroundCanvas, x, y);
    draw();

    viewer.addHandler('update-viewport', draw);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(viewer.container);

    return () => {
      viewer.removeHandler('update-viewport', draw);
      resizeObserver.disconnect();
      drawRef.current = () => {};
    };
  }, [viewer]);

  return (
    <>
      <canvas ref={backgroundRef} className="absolute inset-0 size-full pointer-events-none z-0" />
      <canvas ref={foregroundRef} className="absolute inset-0 size-full pointer-events-none z-40" />
    </>
  );

}
