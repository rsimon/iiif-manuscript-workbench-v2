import type { ReactNode } from 'react';
import { IconRulerMeasure } from '@tabler/icons-react';
import { Input } from '@/shadcn/input';
import { Button } from '@/shadcn/button';
import { 
  FloatingPanel, 
  FloatingPanelContent, 
  FloatingPanelTrigger 
} from '@/components/floating-panel';
import { 
  Field, 
  FieldContent, 
  FieldGroup, 
  FieldLabel, 
  FieldLegend, 
  FieldSet 
} from '@/shadcn/field';

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

      <FloatingPanelContent 
        title="Physical dimensions"
        className="w-sm">
        <div className="p-4 space-y-6">
          <Field className="gap-2">
            <FieldLabel className="text-sm">Image size</FieldLabel>

            <FieldContent>
              <p className="text-muted-foreground text-sm tabular-nums">
                1,234 × 2,312 px
              </p>
            </FieldContent>
          </Field>

          <FieldSet className="gap-0.5 items-start">
            <FieldLegend variant="label">Physical size</FieldLegend>

            <FieldGroup 
              className="flex flex-row gap-2 mt-2 items-center">
              <Field>
                <FieldLabel htmlFor="width" className="sr-only">
                  Width
                </FieldLabel>
                <Input
                  id="width"
                  placeholder="Width"
                  className="tabular-nums grow" />
              </Field>
                
              <span className="text-muted-foreground">×</span>

              <Field className="pr-2">
                <FieldLabel htmlFor="height" className="sr-only">
                  Height
                </FieldLabel>
                <Input
                  placeholder="Height"
                  className="tabular-nums grow" />
              </Field>

              <Field>
                <FieldLabel htmlFor="unit" className="sr-only">
                  Unit
                </FieldLabel>
                <Input
                  placeholder="Unit"
                  className="tabular-nums shrink-o" />
              </Field>
            </FieldGroup>

            <Button 
              variant="link"
              className="font-normal px-0.5">
              <IconRulerMeasure className="size-4" /> Measure from image
            </Button>
          </FieldSet>
        </div>
      </FloatingPanelContent>
    </FloatingPanel>
  )
  /*
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
  */

}