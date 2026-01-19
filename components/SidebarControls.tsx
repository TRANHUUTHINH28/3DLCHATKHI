
import React from 'react';
import { ProcessMode, GasState } from '../types';

interface Props {
  state: GasState;
  mode: ProcessMode;
  onUpdate: (update: Partial<GasState>) => void;
}

const SidebarControls: React.FC<Props> = ({ state, mode, onUpdate }) => {
  const isTFixed = mode === ProcessMode.ISOTHERMAL;
  const isPFixed = mode === ProcessMode.ISOBARIC;
  const isVFixed = mode === ProcessMode.ISOCHORIC;

  return (
    <div className="flex flex-col gap-6">
      {/* Pressure Slider */}
      <div className={`flex flex-col gap-2 ${isPFixed ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-400 uppercase">Pressure (P)</label>
          <span className="font-mono text-orange-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            {state.pressure.toFixed(2)} atm
          </span>
        </div>
        <input 
          type="range" 
          min="0.5" 
          max="6.0" 
          step="0.05"
          value={state.pressure}
          onChange={(e) => onUpdate({ pressure: parseFloat(e.target.value) })}
          disabled={isPFixed}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        {isPFixed && <div className="text-[10px] text-orange-500/80 italic text-right mt-1">Locked (Isobaric)</div>}
      </div>

      {/* Volume Slider */}
      <div className={`flex flex-col gap-2 ${isVFixed ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-400 uppercase">Volume (V)</label>
          <span className="font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            {state.volume.toFixed(0)} L
          </span>
        </div>
        <input 
          type="range" 
          min="100" 
          max="500" 
          step="5"
          value={state.volume}
          onChange={(e) => onUpdate({ volume: parseFloat(e.target.value) })}
          disabled={isVFixed}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        {isVFixed && <div className="text-[10px] text-emerald-500/80 italic text-right mt-1">Locked (Isochoric)</div>}
      </div>

      {/* Temperature Slider */}
      <div className={`flex flex-col gap-2 ${isTFixed ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-400 uppercase">Temperature (T)</label>
          <span className="font-mono text-red-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            {state.temperature.toFixed(0)} K
          </span>
        </div>
        <input 
          type="range" 
          min="100" 
          max="600" 
          step="5"
          value={state.temperature}
          onChange={(e) => onUpdate({ temperature: parseFloat(e.target.value) })}
          disabled={isTFixed}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
        {isTFixed && <div className="text-[10px] text-red-500/80 italic text-right mt-1">Locked (Isothermal)</div>}
      </div>
    </div>
  );
};

export default SidebarControls;
