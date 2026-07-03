import { Button } from '@/shadcn/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { type ButtonProps } from '@base-ui/react';

interface PanelActionButtonProps extends ButtonProps {

  tooltip: string;

}

export const PanelActionButton = (props: PanelActionButtonProps) => {
  const { tooltip, ...rest } = props;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 -ml-1"
            {...rest}>
            {props.children}
          </Button>
        }/>

      <TooltipContent>
        {props.tooltip}
      </TooltipContent>
    </Tooltip>
  )

}