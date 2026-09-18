import { Toggle as TogglePrimitive } from '@base-ui/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { Toggle } from '@/shadcn/toggle';

export const ToolbarToggle = (props: TogglePrimitive.Props & { tooltip: string }) => {
  const { children, ...rest } = props;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Toggle
            className="rounded-full aspect-square disabled:text-muted-foreground/80"
            {...rest}>
            {children}
          </Toggle>
        }/>
      <TooltipContent>
        {props.tooltip}
      </TooltipContent>
    </Tooltip>
  )

}