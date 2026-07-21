import { IconChevronLeft, IconChevronRight, IconFilter } from '@tabler/icons-react';
import { Button } from '@/shadcn/button';

interface ViewerPaginationControlProps {
  
  displayAsFiltered?: boolean;

  selectedPageIndex: number;

  selectedPageLabel: string;

  totalPageCount: number;

  onNext(): void;

  onPrevious(): void;

}

export const ViewerPaginationControl = (props: ViewerPaginationControlProps) => {
  const hasNext = props.selectedPageIndex < props.totalPageCount - 1;
  const hasPrev = props.selectedPageIndex > 0;

  return (
    <div className="flex items-center gap-0.5">
      <Button
        disabled={!hasPrev}
        variant="ghost"
        className="rounded-full"
        onClick={props.onPrevious}>
        <IconChevronLeft />
      </Button>

      <div className="text-xs flex gap-1.5 items-center">
        <span>{props.selectedPageLabel}</span>
        {props.displayAsFiltered ? (
          <div className="ml-0.5 flex items-center gap-1 bg-accent py-1 px-2 pr-2.5 rounded-full text-primary">
            <IconFilter className="size-3.5" /> 
            <span>{props.selectedPageIndex + 1}/{props.totalPageCount}</span>
          </div>
        ) : (
          <span className="text-muted-foreground/80 space-x-1.5"> 
            <span>·</span> 
            <span className="tracking-wider">
              {props.selectedPageIndex + 1}/{props.totalPageCount}
            </span>
          </span>
        )}
      </div>

      <Button
        disabled={!hasNext}
        variant="ghost"
        className="rounded-full"
        onClick={props.onNext}>
        <IconChevronRight />
      </Button>
    </div>
  )

}