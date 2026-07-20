import { useState, type ReactNode } from 'react';
import { IconForms, IconRulerMeasure } from '@tabler/icons-react';
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
  FieldDescription, 
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

type PhysicalDimensionsDialogMode = 'FORM_INPUT' | 'MEASURE';

export const PhysicalDimensionsDialog = (props: PhysicalDimensionsDialogProps) => {

  const [mode, setMode] = useState<PhysicalDimensionsDialogMode>('FORM_INPUT');

  return (
    <FloatingPanel 
      open={props.open} 
      onOpenChange={props.onOpenChange}>
      <FloatingPanelTrigger>
        {props.children}
      </FloatingPanelTrigger>

      <FloatingPanelContent 
        title="Physical dimensions"
        align="center"
        sideOffset={14}
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

          {mode === 'FORM_INPUT' ? (
            <div className="space-y-6" key="form_input">
              <FieldSet className="gap-0.5 items-start">
                <FieldLegend variant="label">Physical size</FieldLegend>

                <FieldDescription className="pt-2 text-xs leading-relaxed">
                  Enter the known physical measurements for the scanned image.
                </FieldDescription>

                <FieldGroup 
                  className="flex flex-row gap-2 mt-2 items-center">
                  <Field>
                    <FieldLabel htmlFor="width" className="sr-only">
                      Width
                    </FieldLabel>
                    <Input
                      id="width"
                      placeholder="–"
                      className="tabular-nums grow h-8" />
                  </Field>
                    
                  <span className="text-muted-foreground">×</span>

                  <Field className="pr-2">
                    <FieldLabel htmlFor="height" className="sr-only">
                      Height
                    </FieldLabel>
                    <Input
                      id="height"
                      placeholder="–"
                      className="tabular-nums grow h-8" />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="unit" className="sr-only">
                      Unit
                    </FieldLabel>
                    <Input
                      id="unit"
                      placeholder="e.g. mm"
                      className="tabular-nums shrink-0 h-8" />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <div className="flex gap-2 justify-between items-end">
                <Button 
                  disabled
                  size="sm"
                  className="bg-black hover:bg-black/80">
                  Apply scale
                </Button>

                <Button
                  variant="link"
                  size="sm"
                  className="font-normal text-primary hover:text-primary px-0.5 h-auto"
                  onClick={() => setMode('MEASURE')}>
                  <IconRulerMeasure className="size-4" /> Measure from image
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6" key="measure">
              <FieldSet className="gap-0.5 items-start">
                <FieldLegend variant="label">Measured distance</FieldLegend>

                <FieldDescription className="px-1 py-1.5 text-xs leading-relaxed">
                  Click two points with a known distance apart to calibrate the physical size.
                </FieldDescription>

                <FieldGroup className="flex-row items-center gap-2 mt-2">
                  <Field>
                    <FieldLabel htmlFor="measured-px" className="sr-only">
                      Measured pixels
                    </FieldLabel>
                    <Input
                      readOnly 
                      id="measured-px"
                      className="bg-muted tabular-nums text-muted-foreground text-sm h-8"
                      value="200 px" />
                  </Field>

                  <span className="text-muted-foreground">=</span>

                  <Field className="pr-2">
                    <FieldLabel htmlFor="measured-value" className="sr-only">
                      Value
                    </FieldLabel>
                    <Input
                      id="measured-value"
                      className="grow tabular-nums h-8" />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="unit" className="sr-only">
                      Unit
                    </FieldLabel>
                    <Input
                      id="unit"
                      placeholder="Unit"
                      className="tabular-nums shrink-0 h-8" />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <div className="flex gap-2 justify-between items-end">
                <Button 
                  size="sm"
                  className="bg-black hover:bg-black/80">
                  Apply scale
                </Button>

                <Button
                  variant="link"
                  size="sm"
                  className="font-normal px-0.5 h-auto"
                  onClick={() => setMode('FORM_INPUT')}>
                  <IconForms className="size-4" /> Enter manually
                </Button>
              </div>
            </div>
          )}
        </div>
      </FloatingPanelContent>
    </FloatingPanel>
  )
 
}