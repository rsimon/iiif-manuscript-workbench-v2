import { ScrollArea } from '@/shadcn/scroll-area';
import { useSelectedSource } from '../sources-store';
import { IconBook } from '@tabler/icons-react';
import { MetadataSection } from './metadata-section';

export const MetadataInspector = () => {
  const { manifest, canvas } = useSelectedSource();

  return manifest ? (
    <div className="h-full flex flex-col">
      <ScrollArea className="grow min-h-0">
        {canvas && (
          <div className="border-b p-3.5">
            <div className="pb-2">
              <h2 className="text-xs uppercase text-muted-foreground">
                Current Item
              </h2>
            </div>

            <MetadataSection
              label={canvas.getLabel()}
              metadata={canvas.getMetadata()} />
          </div>
        )}

        <div className="p-3.5">
          <div className="pb-2">
            <h2 className="text-xs uppercase text-muted-foreground">
              Resource
            </h2>
          </div>

          <MetadataSection
            label={manifest.getLabel() ?? 'Manifest'}
            metadata={manifest.getMetadata()} />
        </div>
      </ScrollArea>
    </div>
  ) : (
    <div className="h-full flex items-center justify-center p-6 text-center">
      <div className="min-w-30 text-muted-foreground flex flex-col gap-2 items-center">
        <IconBook className="size-20 opacity-80" stroke={1} /> 
        <p className="text-sm leading-relaxed w-30">
          Select a canvas to view metadata
        </p>
      </div>
    </div>
  )

}
