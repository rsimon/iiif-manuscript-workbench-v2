import { Button, buttonVariants } from '@/shadcn/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { type ButtonProps } from '@base-ui/react';
import type { VariantProps } from 'class-variance-authority';

type PanelActionButtonProps = ButtonProps & VariantProps<typeof buttonVariants> & {

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