import { IconArrowMerge, IconFilePlus } from '@tabler/icons-react';
import { PanelActionButton } from '@/components/panel-action-button';
import { useAppStore } from '@/store/app-store';

export const ReconstructionTreeToolbar = () => {

  const appendEmptyCanvas = useAppStore(state => state.appendEmptyCanvas);

  return (
    <div className="text-muted-foreground py-2 pl-1 pr-3.5 flex justify-end bg-white border-b">
      <div className="flex items-center gap-1.5">
        <PanelActionButton
          disabled
          tooltip="Merge selected canvases">
          <IconArrowMerge className="size-4" />
        </PanelActionButton>

        <PanelActionButton
          tooltip="Create empty canvas"
          onClick={() => appendEmptyCanvas()}>
          <IconFilePlus className="size-4" />
        </PanelActionButton>
      </div>
    </div>
  )

}