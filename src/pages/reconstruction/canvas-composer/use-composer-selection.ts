import type { CanvasClickEvent, Viewer } from 'openseadragon';
import { useReconstructionStore } from '../reconstruction-store';
import { useEffect } from 'react';
import type { ComposerLayout } from './composer-types';
import { getItemAt } from './composer-utils';

export const useComposerSelection = (viewer: Viewer | undefined, layout: ComposerLayout) => {
  const setSelection = useReconstructionStore(state => state.setSelection);

  useEffect(() => {
    if (!viewer) return;

    const onCanvasClick = (evt: CanvasClickEvent) => {
      const { metaKey } = evt.originalEvent as PointerEvent;

      const point = viewer.viewport.viewerElementToViewportCoordinates(evt.position);
      const item = getItemAt(point, layout);

      if (item) {
        if (metaKey)
          setSelection(current => [...current, item.canvas]);
        else
          setSelection([item.canvas]);
      } else if (!metaKey) {
        setSelection([]);
      }
    }

    viewer.addHandler('canvas-click', onCanvasClick);

    return () => {
      viewer?.removeHandler('canvas-click', onCanvasClick);
    }
  }, [viewer, layout, setSelection]);

}