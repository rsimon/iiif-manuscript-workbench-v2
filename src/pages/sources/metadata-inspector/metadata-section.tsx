import type { CozyMetadata } from 'cozy-iiif';

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