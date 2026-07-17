import type { ReactNode } from 'react';
import { 
  FloatingPanel, 
  FloatingPanelContent, 
  FloatingPanelTrigger 
} from '@/components/floating-panel';

interface PhysicalDimensionsDialogProps {

  open: boolean;

  onOpenChange(open: boolean): void;

  children: ReactNode;

}

// type PhysicalDimensionsDialogMode = 'FORM_INPUT' | 'MEASURING';

export const PhysicalDimensionsDialog = (props: PhysicalDimensionsDialogProps) => {

  // const [mode, setMode] = useState<PhysicalDimensionsDialogMode>('FORM_INPUT');

  return (
    <FloatingPanel 
      open={props.open} 
      onOpenChange={props.onOpenChange}>
      <FloatingPanelTrigger>
        {props.children}
      </FloatingPanelTrigger>

      <FloatingPanelContent title="Physical dimensions">
        <div>A floating panel...</div>
      </FloatingPanelContent>
    </FloatingPanel>
  )
  /*
  return (
    <FloatingPanel
      open={props.open}
      onOpenChange={props.onOpenChange}>
      <DialogContent>
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <IconRuler className="size-4 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Physical dimensions</span>
          <button className="rounded-xs p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <IconX className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Image size
            </div>
            <div className="mt-0.5 text-sm tabular-nums">1,234 × 2,312 px</div>
          </div>

          {mode === 'FORM_INPUT' ? (
            <>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Physical size
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <input
                    placeholder="Width"
                    defaultValue="61.7"
                    className="h-8 w-full min-w-0 rounded-xs border border-input bg-background px-2 text-sm tabular-nums" />
                  <span className="text-muted-foreground">×</span>

                  <input
                    placeholder="Height"
                    defaultValue="115.6"
                    className="h-8 w-full min-w-0 rounded-xs border border-input bg-background px-2 text-sm tabular-nums"/>
                  <input
                    placeholder="unit"
                    defaultValue="cm"
                    className="h-8 w-14 flex-none rounded-xs border border-input bg-background px-2 text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">≈ 20 px/cm</p>
              </div>

              <button className="text-sm underline underline-offset-4 hover:text-foreground/80">
                Measure from image
              </button>
            </>
          ) : (
            <>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Measured distance
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="flex h-8 min-w-20 items-center rounded-xs border border-dashed border-input px-2 text-sm tabular-nums text-muted-foreground">
                    200 px
                  </div>
                  <span className="text-muted-foreground">=</span>
                  <input
                    defaultValue="10"
                    className="h-8 w-16 flex-none rounded-xs border border-input bg-background px-2 text-sm tabular-nums"
                  />
                  <input
                    placeholder="unit"
                    defaultValue="cm"
                    className="h-8 w-14 flex-none rounded-xs border border-input bg-background px-2 text-sm"
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Click two points with a known distance apart to calibrate the physical size.
                </p>
              </div>

              <div className="flex gap-2">
                <button className="h-8 flex-1 rounded-xs bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Apply scale
                </button>
                <button className="h-8 flex-1 rounded-xs border border-input bg-background px-3 text-sm hover:bg-accent">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </FloatingPanel>
  )
  */

}