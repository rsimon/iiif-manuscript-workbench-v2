import type { ButtonProps } from '@base-ui/react';
import { Button } from '@/shadcn/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { Trash2 } from 'lucide-react';

interface SourcePreviewToolbarButtonProps extends ButtonProps {

  tooltip: string;

}

const SourcePreviewToolbarButton = (props: SourcePreviewToolbarButtonProps) => {

  const { children, ...rest } = props;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            className="rounded-lg h-10 aspect-square"
            {...rest}>
            {children}
          </Button>
        }/>
      <TooltipContent>
        {props.tooltip}
      </TooltipContent>
    </Tooltip>
  )

}

export const SourcePreviewToolbar = () => {

  return (
    <div className="absolute bottom-8 w-full flex justify-center z-50 pointer-events-none">
      <div className="bg-white flex items-center gap-1 min-w-20 rounded-lg p-1 pointer-events-auto
        ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]">
        <SourcePreviewToolbarButton
          tooltip="Delete">
          <Trash2 className="size-4" />
        </SourcePreviewToolbarButton>
      </div>
    </div>
  )

}