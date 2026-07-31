import { IconStack2 } from '@tabler/icons-react';
import { useAppStore } from '@/store/app-store';
import type { PhysicalSize, ReconstructionCanvas } from '@/types';
import { FieldGroup, FieldLegend, FieldSet } from '@/shadcn/field';
import type { DraggableImageSelection } from '../../reconstruction-types';
import { useComposerStore } from '../../canvas-composer/composer-store';
import { EditablePixelSize } from './editable-pixel-size';
import { EditablePhysicalSize } from './editable-physical-size';
import { SelectedImageDetails } from './selected-image-details';

interface SingleSelectionProps {

  canvas: ReconstructionCanvas;

  imageSelection?: DraggableImageSelection;

}

export const SingleSelection = (props: SingleSelectionProps) => {
  const { canvas } = props;

  const { width, height } = canvas;

  const resizeCanvas = useAppStore(state => state.resizeCanvas);
  const setPhysicalSize = useAppStore(state => state.setReconstructionPhysicalSize);

  const updateImage = useComposerStore(state => state.updateImage);
  const setIsDraggingImage = useComposerStore(state => state.setIsDraggingImage);

  const selectedImage = props.imageSelection?.item.reconstructionCanvasId === canvas.id
    ? props.imageSelection.image
    : undefined; // Just being defensive - should never happen

  const onResizeCanvasPx = (newWidth: number, newHeight: number) => {
    if (newWidth === Math.round(width) && newHeight === Math.round(height)) return;
    resizeCanvas(canvas.id, newWidth, newHeight);
  }

  const onResizeCanvasPhys = (size: PhysicalSize) =>
    setPhysicalSize(canvas.id, size);

  const onChangeImagePosition = (x: number, y: number, width: number) => {
    if (!selectedImage) return;
    setIsDraggingImage(true);
    updateImage(canvas.id, { ...selectedImage, x, y, width });
    requestAnimationFrame(() => setIsDraggingImage(false));
  }

  return (
    <div className="space-y-1">
      <h2 className="flex items-center gap-1.5 border-b p-4">
        {canvas.type === 'composite' && (
          <IconStack2 className="size-5 text-muted-foreground shrink-0" stroke={1.75} />
        )}
        <span className="text-base truncate">{canvas.label}</span>
      </h2>

      <FieldGroup className="p-4 gap-4">
        <FieldSet className="gap-1 items-start space-y-0.5">
          <FieldLegend variant="label" className="data-[variant=label]:text-xs uppercase font-normal text-muted-foreground">
            Image size
          </FieldLegend>
          <EditablePixelSize
            width={width}
            height={height}
            onCommit={onResizeCanvasPx} />
        </FieldSet>

        <FieldSet className="gap-1 items-start space-y-0.5">
          <FieldLegend variant="label" className="data-[variant=label]:text-xs  uppercase font-normal text-muted-foreground">
            Physical size
          </FieldLegend>
          <EditablePhysicalSize
            size={canvas.physicalSize}
            onCommit={onResizeCanvasPhys} />
        </FieldSet>
      </FieldGroup>

      {selectedImage && (
        <SelectedImageDetails
          image={selectedImage}
          onCommit={onChangeImagePosition} />
      )}
    </div>
  )

}