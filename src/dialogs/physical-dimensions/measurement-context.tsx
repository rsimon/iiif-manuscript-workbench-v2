import { createContext, useContext, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Point } from 'openseadragon';

export interface ActiveMeasureState {

  phase: 'dragging' | 'committed';

  start: Point;

  end: Point;

  distancePx: number;

}

export interface IdleMeasureState {

  phase: 'idle';

}

export type TapeMeasureState = ActiveMeasureState | IdleMeasureState;


interface MeasurementContextValue {

  isTapeMeasureEnabled: boolean;

  setEnableTapeMeasure(enabled: boolean): void;

  tapeMeasureState: TapeMeasureState;

  setTapeMeasureState: Dispatch<SetStateAction<TapeMeasureState>>;

}

const MeasurementContext = createContext<MeasurementContextValue | undefined>(undefined);

export const MeasurementProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTapeMeasureEnabled, setEnableTapeMeasure] = useState(false);
  const [tapeMeasureState, setTapeMeasureState] = useState<TapeMeasureState>({ phase: 'idle'});

  return (
    <MeasurementContext.Provider 
      value={{ 
        isTapeMeasureEnabled,
        setEnableTapeMeasure,
        tapeMeasureState, 
        setTapeMeasureState 
      }}>
      {children}
    </MeasurementContext.Provider>
  )

}

export const useMeasurement = () => {
  const ctx = useContext(MeasurementContext);
  if (!ctx) throw new Error('useMeasurement must be used within a MeasurementProvider');
  return ctx;
}