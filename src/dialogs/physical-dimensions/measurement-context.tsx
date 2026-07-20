import { createContext, useContext, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Point } from 'openseadragon';

export interface Scale { 

  factor: number; unit: string;

}

export interface ActiveMeasurementState {

  phase: 'dragging' | 'committed';

  start: Point;

  end: Point;

  viewportDistance: number;

}

export interface IdleMeasurementState {

  phase: 'idle';

}

export type MeasurementState = ActiveMeasurementState | IdleMeasurementState;


interface MeasurementContextValue {

  canvasScale?: Scale;

  setCanvasScale: Dispatch<SetStateAction<Scale | undefined>>;

  measurement: MeasurementState;

  setMeasurement: Dispatch<SetStateAction<MeasurementState>>;

}

const MeasurementContext = createContext<MeasurementContextValue | undefined>(undefined);

export const MeasurementProvider = ({ children }: { children: React.ReactNode }) => {
  const [canvasScale, setCanvasScale] = useState<Scale | undefined>();
  const [measurement, setMeasurement] = useState<MeasurementState>({ phase: 'idle'});

  return (
    <MeasurementContext.Provider 
      value={{ 
        canvasScale,
        setCanvasScale,
        measurement, 
        setMeasurement 
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