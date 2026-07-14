import type { CanvasClickEvent, Viewer } from 'openseadragon';
import { useReconstructionStore } from '../reconstruction-store';
import { useEffect } from 'react';
import type { ComposerLayout } from './composer-types';
import { getImageAt, getItemAt } from './composer-utils';
import { useComposerStore } from './composer-store';

export const useComposerSelection = (viewer: Viewer | undefined, layout: ComposerLayout) => {
  const setSelectedItems = useReconstructionStore(state => state.setSelection);
  const setSelectedImage = useComposerStore(state => state.setSelectedImage);

  useEffect(() => {
    if (!viewer) return;

    const onCanvasClick = (evt: CanvasClickEvent) => {
      const { metaKey } = evt.originalEvent as PointerEvent;

      const point = viewer.viewport.viewerElementToViewportCoordinates(evt.position);
      const item = getItemAt(point, layout);

      if (item) {
        if (metaKey) {
          setSelectedImage();
          setSelectedItems(current => [...current, item.canvas]);
        } else {
          setSelectedItems(current => {
            if (current.length === 1 && current[0].id === item.canvas.id) {
              // Same selected canvas, clicked again -> select image
              const hit = getImageAt(point, layout);
              setSelectedImage(hit?.image);              
              return current;
            } else {
              return [item.canvas];
            }
          });
        }
      } else if (!metaKey) {
        setSelectedImage();
        setSelectedItems([]);
      }
    }

    viewer.addHandler('canvas-click', onCanvasClick);

    return () => {
      viewer?.removeHandler('canvas-click', onCanvasClick);
    }
  }, [viewer, layout, setSelectedItems, setSelectedImage]);

}