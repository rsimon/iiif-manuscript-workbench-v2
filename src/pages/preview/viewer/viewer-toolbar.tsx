import { ViewerPaginationControl } from '@/components/viewer-pagination-control';
import { useAppStore } from '@/store/app-store';
import { usePreviewStore } from '../preview-store';

export const ViewerToolbar = () => {
  const reconstruction = useAppStore(state => state.reconstruction);

  const selected = usePreviewStore(state => state.selected);
  const selectNext = usePreviewStore(state => state.selectNext);
  const selectPrevious = usePreviewStore(state => state.selectPrevious);

  const selectedPageIndex = selected ? reconstruction.indexOf(selected) : -1;

  return selected ? (
    <div className="absolute bottom-8 w-full flex justify-center z-50 pointer-events-none">
      <div className="bg-white flex items-center gap-1 min-w-20 rounded-full p-1 pointer-events-auto
        ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]">
        
        <ViewerPaginationControl 
          selectedPageIndex={selectedPageIndex}
          selectedPageLabel={selected.label}
          totalPageCount={reconstruction.length}
          onNext={selectNext}
          onPrevious={selectPrevious} />
      </div>
    </div>
  ) : null;

}