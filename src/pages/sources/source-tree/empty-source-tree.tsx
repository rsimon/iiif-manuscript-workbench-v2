import { IconBook } from '@tabler/icons-react';
import { Button } from '@/shadcn/button';

interface EmptySourceTreeProps {

  onImport(): void;

}

export const EmptySourceTree = (props: EmptySourceTreeProps) => {
  
  return (
    <div className="grow flex flex-col gap-6 items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center">
        <IconBook 
          className="mb-2 h-8 w-8 text-muted-foreground" />

        <p className="text-sm text-muted-foreground">
          No source manifests
        </p>
      </div>

      <Button onClick={props.onImport}>
        Import from URL
      </Button>
    </div>
  )

}