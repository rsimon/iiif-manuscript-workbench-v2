import { IconArrowMerge, IconFilePlus } from '@tabler/icons-react';
import { PanelActionButton } from '@/components/panel-action-button';

export const ReconstructionTreeToolbar = () => {

  return (
    <div className="text-muted-foreground flex justify-end pt-2 pr-2.5">
      <div className="flex items-center gap-1.5">
        <PanelActionButton
          disabled
          variant="outline"
          className="shadow-none rounded-sm font-normal"
          tooltip="Merge selected canvases">
          <IconArrowMerge className="size-4" />
        </PanelActionButton>

        <PanelActionButton
          variant="outline"
          className="shadow-none rounded-sm font-normal"
          tooltip="Create empty leaf">
          <IconFilePlus className="size-4" />
        </PanelActionButton>
      </div>
    </div>
  )

}