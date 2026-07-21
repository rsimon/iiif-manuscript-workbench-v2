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

export interface TapeMeasureOpts { showLabel?: boolean };

interface MeasurementContextValue {

  isTapeMeasureEnabled: boolean;

  setEnableTapeMeasure(enabled: boolean, opts?: TapeMeasureOpts): void;

  tapeMeasureState: TapeMeasureState;

  setTapeMeasureState: Dispatch<SetStateAction<TapeMeasureState>>;

}

const MeasurementContext = createContext<MeasurementContextValue | undefined>(undefined);

export const MeasurementProvider = ({ children }: { children: React.ReactNode }) => {
  const [tapeMeasureState, setTapeMeasureState] = useState<TapeMeasureState>({ phase: 'idle'});

  const [_isTapeMeasureEnabled, _setEnableTapeMeasure] = useState<TapeMeasureOpts | null>(null);

  const isTapeMeasureEnabled = Boolean(_isTapeMeasureEnabled);
  
  const setEnableTapeMeasure = (enabled: boolean, opts: TapeMeasureOpts= {}) => {
    if (enabled) 
      _setEnableTapeMeasure(opts);
    else 
      _setEnableTapeMeasure(null);
  }

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