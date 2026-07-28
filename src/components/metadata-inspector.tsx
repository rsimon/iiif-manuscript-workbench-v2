import { ScrollArea } from '@/shadcn/scroll-area';
import type { CozyMetadata } from 'cozy-iiif';

interface MetadataInspectorProps {

  manifestLabel: string;

  manifestMetadata: CozyMetadata[];

  canvasLabel?: string;

  canvasMetadata?: CozyMetadata[];

}

export const MetadataInspector = (props: MetadataInspectorProps) => {

  const { canvasLabel, canvasMetadata } = props;

  const hasCanvas = canvasLabel && canvasMetadata;

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="grow min-h-0">
        {hasCanvas && (
          <div className="border-b p-3.5">
            <div className="pb-2">
              <h2 className="text-xs uppercase text-muted-foreground">
                Current Item
              </h2>
            </div>

            <MetadataSection
              label={canvasLabel}
              metadata={canvasMetadata} />
          </div>
        )}

        <div className="p-3.5">
          <div className="pb-2">
            <h2 className="text-xs uppercase text-muted-foreground">
              Resource
            </h2>
          </div>

          <MetadataSection
            label={props.manifestLabel}
            metadata={props.manifestMetadata} />
        </div>
      </ScrollArea>
    </div>
  )

}


interface MetadataSectionProps {

  label: string;

  metadata: CozyMetadata[];

}

export const MetadataSection = (props: MetadataSectionProps) => {

  return (
    <section>
      <h3 className="text-base truncate">
        {props.label}
      </h3>

      {props.metadata.length > 0 ? (
        <dl className="mt-3.5 space-y-3.5">
          {props.metadata.map((item, idx) => (
            <div key={idx}>
              <dt className="text-xs font-medium text-muted-foreground">
                {item.label}
              </dt>

              <dd className="text-sm whitespace-pre-wrap">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )

}
