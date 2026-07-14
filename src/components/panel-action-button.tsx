import { Button, buttonVariants } from '@/shadcn/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { cn } from '@/shadcn/utils';
import { type ButtonProps } from '@base-ui/react';
import type { VariantProps } from 'class-variance-authority';

type PanelActionButtonProps = ButtonProps & VariantProps<typeof buttonVariants> & {

  tooltip: string;

}

export const PanelActionButton = (props: PanelActionButtonProps) => {
  const { tooltip, className, ...rest } = props;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            className={cn('size-7', className)}
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