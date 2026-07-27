import { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ScrollArea } from '@/shadcn/scroll-area';
import { cn } from '@/shadcn/utils';
import { Thumbnail } from './thumbnail';
import { usePreviewStore } from '../preview-store';

export const ThumbnailStrip = () => {
  const views = usePreviewStore(state => state.views);
  const selectedView = usePreviewStore(state => state.selectedView);
  const setSelectedView = usePreviewStore(state => state.setSelectedView);

  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);

  const renderView = (idx: number) => {
    const view = views[idx];
    const isSelected = view === selectedView;

    return (
      <button
        className={cn(
          'cursor-pointer bg-white border shadow-xs grid grid-cols-1 gap-0.5 @[160px]:grid-cols-2 w-full rounded-md overflow-hidden',
          idx > 0 && 'mt-2',
          isSelected ? 'ring-3 ring-primary bg-primary/5' : 'hover:bg-primary/5'
        )}
        onClick={() => setSelectedView(view)}>
        {view.left && <Thumbnail canvas={view.left} />}
        {view.right && <Thumbnail canvas={view.right} />}
      </button>
    )
  }

  return (
    <div className="@container flex h-full flex-col bg-muted">
      {views.length === 0 ? (
        <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
          No reconstruction canvases yet.
        </div>
      ) : (
        <ScrollArea className="grow min-h-0 p-2" viewportRef={setViewportEl}>
          <div className="h-full p-2.5">
            <Virtuoso
              customScrollParent={viewportEl ?? undefined}
              totalCount={views.length}
              itemContent={renderView} />
          </div>
        </ScrollArea>
      )}
    </div>
  )

}
