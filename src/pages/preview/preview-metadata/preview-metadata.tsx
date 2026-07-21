import { MetadataInspector } from '@/components/metadata-inspector';
import { usePreviewStore } from '../preview-store';

export const PreviewMetadata = () => {
  const selected = usePreviewStore(state => state.selected);

  const sources = selected ? selected.type === 'original' ? [selected.source] : selected.sources : [];
  const flattenedCanvasMetadata = sources.flatMap(s => s.canvas.getMetadata());

  return selected ? (
    <MetadataInspector 
      canvasLabel={selected.label} 
      canvasMetadata={flattenedCanvasMetadata} 
      manifestLabel="Reconstruction" 
      manifestMetadata={[]} />
  ) : null;

}