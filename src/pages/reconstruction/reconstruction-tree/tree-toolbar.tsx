import { IconArrowMerge, IconFilePlus } from '@tabler/icons-react';
import { PanelActionButton } from '@/components/panel-action-button';

export const ReconstructionTreeToolbar = () => {

  return (
    <div className="text-muted-foreground py-2 pl-1 pr-3.5 flex justify-end bg-white border-b">
      <div className="flex items-center gap-1.5">
        <PanelActionButton
          disabled
          tooltip="Merge selected canvases">
          <IconArrowMerge className="size-4" />
        </PanelActionButton>

        <PanelActionButton
          tooltip="Create empty canvas">
          <IconFilePlus className="size-4" />
        </PanelActionButton>
      </div>
    </div>
  )

}