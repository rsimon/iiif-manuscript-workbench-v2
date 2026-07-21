import { OpenSeadragonSVGOverlay } from '@/components/openseadragon-svg-overlay';
import { useComposerStore } from '../composer-store';
import { CanvasIndicatorBackground, CanvasIndicatorForeground } from './canvas-indicator';
import { ImageTool } from './image-tool';

export const OverlayLayer = () => {
  const viewer = useComposerStore(state => state.viewer);
  const layout = useComposerStore(state => state.layout);

  return viewer ? (
    <OpenSeadragonSVGOverlay 
      viewer={viewer}
      bottomLayer={(
        <CanvasIndicatorBackground layout={layout} viewer={viewer} />
      )} 
      topLayer={(
        <>
          <CanvasIndicatorForeground layout={layout} viewer={viewer} />
          <ImageTool  viewer={viewer}/>
        </>
      )}/>
  ) : null;

}