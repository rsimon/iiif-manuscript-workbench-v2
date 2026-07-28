import { ViewerPaginationControl } from '@/components/viewer-pagination-control';
import { usePreviewStore } from '../preview-store';

export const ViewerToolbar = () => {
  const views = usePreviewStore(state => state.views);
  const selectedView = usePreviewStore(state => state.selectedView);

  const selectNext = usePreviewStore(state => state.selectNext);
  const selectPrevious = usePreviewStore(state => state.selectPrevious);

  const index = selectedView ? views.indexOf(selectedView) : -1;

  const { left, right } = selectedView ?? {};

  const label = left && right
    ? `${left.label} / ${right.label}`
    : left?.label || right?.label;

  return (left || right) ? (
    <div className="absolute bottom-8 w-full flex justify-center z-50 pointer-events-none">
      <div className="bg-white flex items-center gap-1 min-w-20 rounded-full p-1 pointer-events-auto
        ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]">

        <ViewerPaginationControl
          selectedPageIndex={index}
          selectedPageLabel={label!}
          totalPageCount={views.length}
          onNext={selectNext}
          onPrevious={selectPrevious} />
      </div>
    </div>
  ) : null;

}
