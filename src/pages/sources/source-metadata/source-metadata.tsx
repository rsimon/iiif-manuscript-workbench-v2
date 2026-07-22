import { IconBook } from '@tabler/icons-react';
import { MetadataInspector } from '@/components/metadata-inspector';
import { useSelectedSource } from '../sources-store';

export const SourceMetadata = () => {
  const { manifest, canvas } = useSelectedSource();

  return manifest ? (
    <MetadataInspector 
      canvasLabel={canvas?.getLabel()}
      canvasMetadata={canvas?.getMetadata()}
      manifestLabel={manifest.getLabel() || 'Manifest'} 
      manifestMetadata={manifest.getMetadata()} />
  ) : (
    <div className="h-full flex items-center justify-center p-6 text-center">
      <div className="min-w-30 text-muted-foreground flex flex-col items-center">
        <IconBook className="size-20 opacity-80" stroke={0.7} /> 
        <p className="text-sm leading-relaxed w-30">
          Select a canvas to view metadata
        </p>
      </div>
    </div>
  )

}
