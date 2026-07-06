import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SplashState {

  dismissed: boolean;

  dismiss: () => void;

}

export const useSplashStore = create<SplashState>()(
  persist(
    set => ({
      dismissed: false,
      dismiss: () => set({ dismissed: true }),
    }),
    { name: 'iiif-workbench-splash' }
  )
)