import { useAppStore } from '@/store/app-store';

export const createManifest = (
  label: string, 
  summary: string, 
  attribution: string
) => {
  const { baseURI, reconstruction, sources } = useAppStore.getState();

  return {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    type: 'Manifest',
    id: `${baseURI}/manifest/0001`,
    label: {
      en: [label]
    },
    summary: {
      en: [summary]
    },
    requiredStatement: {
      label: { en: [ 'Attribution' ]},
      value: { en: [ attribution ]}
    },
    metadata: [
      {
        label: { en: ['Created' ]},
        value: { en: [ new Date().toISOString() ]},
      },
      {
        label: { en: ['Source Manifests']},
        value: { en: [sources.map(s => s.url).join(', ')]},
      },
    ],
    // items: reconstruction.map(r => r.canvas.source)
  }
};