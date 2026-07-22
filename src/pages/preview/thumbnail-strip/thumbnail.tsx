import type { CozyImageResource } from 'cozy-iiif';
import { cn } from '@/shadcn/utils';
import type { ReconstructionCanvas } from '@/types';

interface ThumbnailProps {

  canvas: ReconstructionCanvas;

  className?: string;

  minSize?: number;

}

export const Thumbnail = (props: ThumbnailProps) => {
  const { canvas } = props;

  const sources = canvas.type === 'original' ? [canvas.source] : canvas.sources;
  const images = sources.flatMap(s => s.canvas.images);

  const { width: canvasWidth, height: canvasHeight } = canvas.type === 'original' ? canvas.source.canvas : canvas;

  const isPrimitive = images.length === 1 && !images[0].target;

  return isPrimitive ? (
    <PrimitiveImageThumbnail 
      image={images[0]}
      label={canvas.label} 
      className={props.className} 
      minSize={props.minSize} />
  ) : (
    <CompositeImageThumbnail 
      canvasHeight={canvasHeight}
      canvasWidth={canvasWidth} 
      images={images} 
      label={canvas.label} 
      className={props.className} 
      minSize={props.minSize} />
  )

}

interface PrimitiveImageThumbnailProps {

  className?: string;

  image: CozyImageResource;

  label: string;

  minSize?: number;

}

const PrimitiveImageThumbnail = (props: PrimitiveImageThumbnailProps) => {

  return (
    <img
      src={props.image.getImageURL(props.minSize || 80)}
      className={cn('w-9 h-11 object-contain', props.className)} 
      alt={props.label}
      loading="lazy" />
  )

}

interface CompositeImageThumbnailProps {

  canvasHeight: number;

  canvasWidth: number;

  className?: string;

  images: CozyImageResource[];

  label: string;

  minSize?: number;

}

const CompositeImageThumbnail = (props: CompositeImageThumbnailProps) => {
  const { canvasWidth, canvasHeight, label, minSize = 80 } = props;

  const renderImage = (image: CozyImageResource, idx: number) => {
    const target = image.target || {
      x: 0,
      y: 0,
      w: canvasWidth,
      h: canvasHeight
    };

    return (
      <img
        key={idx}
        src={image.getImageURL(minSize)}
        alt={`${label}: image ${idx + 1}`}
        loading="lazy"
        className="absolute object-fill"
        style={{
          left: `${(target.x / canvasWidth) * 100}%`,
          top: `${(target.y / canvasHeight) * 100}%`,
          width: `${(target.w / canvasWidth) * 100}%`,
          height: `${(target.h / canvasHeight) * 100}%`,
        }} />
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-100 w-9 h-11', 
        props.className
      )}
      style={{ aspectRatio: `${props.canvasWidth} / ${props.canvasHeight}` }}>
      {props.images.map((image, idx) => renderImage(image, idx))}
    </div>
  )

}