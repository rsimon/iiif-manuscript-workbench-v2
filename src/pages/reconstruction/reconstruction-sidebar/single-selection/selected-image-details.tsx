import type { DraggableImage } from '../../reconstruction-types';

interface SelectedImageDetailsProps {

  image: DraggableImage;

}

export const SelectedImageDetails = (props: SelectedImageDetailsProps) => {
  const { image } = props;

  const height = image.width * image.resource.height / image.resource.width;

  const cells: [string, number][] = [
    ['x', image.x],
    ['y', image.y],
    ['w', image.width],
    ['h', height]
  ];

  return (
    <div className="px-4">
      <div className="space-y-2">
        <div className=" font-medium tracking-wide uppercase">
          Selected image
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {cells.map(([key, value]) => (
            <div key={key} className="bg-white rounded-sm px-2 py-1 text-xs tabular-nums">
              <div className="text-muted-foreground text-[10px] uppercase">{key}</div>
              {Math.round(value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

}