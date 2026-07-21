import { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ScrollArea } from '@/shadcn/scroll-area';
import { useAppStore } from '@/store/app-store';
import { Thumbnail } from './thumbnail';
import { usePreviewStore } from '../preview-store';

export const ThumbnailStrip = () => {
  const reconstruction = useAppStore(state => state.reconstruction);

  const setSelected = usePreviewStore(state => state.setSelected);

  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);

  const renderThumbnail = (idx: number) => {
    const canvas = reconstruction[idx];

    return (
      <button 
        className={idx > 0 ? 'mt-2' : ''}
        onClick={() => setSelected(canvas)}>
        <Thumbnail canvas={canvas} />
      </button>
    )
  } 

  return (
    <div className="flex h-full flex-col">
      {reconstruction.length === 0 ? (
        <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
          No reconstruction canvases yet.
        </div>
      ) : (
        <ScrollArea className="grow min-h-0" viewportRef={setViewportEl}>
          <div className="h-full p-2.5">
            <Virtuoso
              customScrollParent={viewportEl ?? undefined}
              totalCount={reconstruction.length}
              itemContent={renderThumbnail} />
          </div>
        </ScrollArea>
      )}
    </div>
  )

}