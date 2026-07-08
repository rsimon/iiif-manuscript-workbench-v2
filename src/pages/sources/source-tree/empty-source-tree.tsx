import { IconBooks } from '@tabler/icons-react';
import { Button } from '@/shadcn/button';

interface EmptySourceTreeProps {

  onImport(): void;

}

export const EmptySourceTree = (props: EmptySourceTreeProps) => {
  
  return (
    <div className="grow flex flex-col gap-8 items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center">
        <IconBooks
          className="size-20 text-muted-foreground opacity-80"
          stroke={1} />

        <p className="text-sm text-muted-foreground">
          No source manifests
        </p>
      </div>

      <Button 
        variant="secondary"
        size="lg"
        onClick={props.onImport}>
        Import from URL
      </Button>
    </div>
  )

}