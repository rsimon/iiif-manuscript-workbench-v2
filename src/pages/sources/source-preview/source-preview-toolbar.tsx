import { IconCheck, IconDimensions, IconPlus, IconRulerMeasure } from '@tabler/icons-react';
import type { ButtonProps } from '@base-ui/react';
import type { CozyCanvas } from 'cozy-iiif';
import { Button } from '@/shadcn/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { Separator } from '@/shadcn/separator';
import { useAppStore } from '@/store/app-store';

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
            className="rounded-full"
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

interface SourcePreviewToolbarProps {

  sourceId: string;

  canvas: CozyCanvas;

}

export const SourcePreviewToolbar = (props: SourcePreviewToolbarProps) => {
  const reconstruction = useAppStore(state => state.reconstruction);
  const isInRecontruction = reconstruction.some(r => 
    r.sourceManifestId === props.sourceId && r.canvas.id === props.canvas.id);

  const addToReconstruction = useAppStore(state => state.addCanvasToReconstruction);
  const removeFromReconstruction = useAppStore(state => state.removeCanvasFromReconstruction);

  return (
    <div className="absolute bottom-8 w-full flex justify-center z-50 pointer-events-none">
      <div className="bg-white flex items-center gap-2 min-w-20 rounded-full p-1.5 pointer-events-auto
        ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]">
        <Button
          variant="ghost"
          className="rounded-full font-normal text-xs text-muted-foreground">
          <IconDimensions /> 215 x 280 mm
        </Button>

        <Separator orientation="vertical" />

        <SourcePreviewToolbarButton
          tooltip="Measure">
          <IconRulerMeasure className="size-4.5" />
        </SourcePreviewToolbarButton>

        <Separator orientation="vertical" />

        {isInRecontruction ? (
          <Button
            className="rounded-full font-normal pr-3"
            onClick={() => removeFromReconstruction(props.canvas.id)}>
            <IconCheck /> In Reconstruction
          </Button>
        ) : (
          <Button
            variant="outline"
            className="rounded-full font-normal pr-3 shadow-none border-primary/50 text-primary hover:bg-accent/40 hover:text-primary"
            onClick={() => addToReconstruction(props.sourceId, props.canvas)}>
            <IconPlus /> Add to Reconstruction
          </Button>
        )}
      </div>
    </div>
  )

}