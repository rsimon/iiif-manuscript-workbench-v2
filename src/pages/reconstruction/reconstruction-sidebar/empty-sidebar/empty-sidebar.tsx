import { IconMicroscope } from '@tabler/icons-react';

export const EmptySidebar = () => {

  return (
    <div className="h-full flex flex-col gap-2 items-center justify-center p-4 text-center">
      <IconMicroscope
        className="size-16 text-muted-foreground opacity-80"
        stroke={1} />

      <p className="text-sm text-muted-foreground max-w-38 tracking-wide leading-relaxed">
        Click a canvas or an image to select it
      </p>
    </div>
  )

}