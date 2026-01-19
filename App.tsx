
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Thermometer, 
  Gauge, 
  Box, 
  Info, 
  Play, 
  RotateCcw,
  LineChart as LineChartIcon,
  Activity,
  ClipboardList,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { ProcessMode, GasState, GraphPoint } from './types';
import GasSimulation from './components/GasSimulation';
import SidebarControls from './components/SidebarControls';
import GaugeDisplay from './components/GaugeDisplay';
import LabNotebook from './components/LabNotebook';

type GraphType = 'PV' | 'VT' | 'PT';

const App: React.FC = () => {
  const [state, setState] = useState<GasState>({
    pressure: 1.0,
    volume: 300,
    temperature: 300,
    nR: 1
  });

  const [mode, setMode] = useState<ProcessMode>(ProcessMode.ISOTHERMAL);
  const [activeGraph, setActiveGraph] = useState<GraphType>('PV');
  const [history, setHistory] = useState<GraphPoint[]>([]);
  const [logs, setLogs] = useState<GraphPoint[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const updateState = useCallback((newValues: Partial<GasState>) => {
    setState(prev => {
      const next = { ...prev, ...newValues };
      
      if (mode === ProcessMode.ISOTHERMAL) {
        if (newValues.volume !== undefined) {
          next.pressure = (next.nR * next.temperature) / next.volume;
        } else if (newValues.pressure !== undefined) {
          next.volume = (next.nR * next.temperature) / next.pressure;
        }
      } else if (mode === ProcessMode.ISOBARIC) {
        if (newValues.temperature !== undefined) {
          next.volume = (next.nR * next.temperature) / next.pressure;
        } else if (newValues.volume !== undefined) {
          next.temperature = (next.pressure * next.volume) / next.nR;
        }
      } else if (mode === ProcessMode.ISOCHORIC) {
        if (newValues.temperature !== undefined) {
          next.pressure = (next.nR * next.temperature) / next.volume;
        } else if (newValues.pressure !== undefined) {
          next.temperature = (next.pressure * next.volume) / next.nR;
        }
      }
      
      return next;
    });
  }, [mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setHistory(prev => {
          const newPoint = { p: state.pressure, v: state.volume, t: state.temperature };
          const last = prev[prev.length - 1];
          // Sensitivity check to avoid overwhelming Recharts with identical points
          if (!last || Math.abs(last.p - newPoint.p) > 0.01 || Math.abs(last.v - newPoint.v) > 1 || Math.abs(last.t - newPoint.t) > 1) {
             const updated = [...prev, newPoint];
             return updated.slice(-100);
          }
          return prev;
        });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [state, isPaused]);

  const captureState = () => {
    const addNoise = (val: number, percent: number) => {
      const noise = val * (percent / 100) * (Math.random() * 2 - 1);
      return val + noise;
    };

    let p = addNoise(state.pressure, 2.5); 
    let v = state.volume + (Math.random() * 6 - 3); 
    let t = state.temperature + (Math.random() * 4 - 2);

    if (mode === ProcessMode.ISOTHERMAL) t = state.temperature;
    else if (mode === ProcessMode.ISOBARIC) p = state.pressure;
    else if (mode === ProcessMode.ISOCHORIC) v = state.volume;

    setLogs(prev => [...prev, { 
      p: Math.max(0.01, p), 
      v: Math.max(1, v), 
      t: Math.max(1, t) 
    }]);
  };

  const clearLogs = () => setLogs([]);

  const resetSimulation = () => {
    setState({
      pressure: 1.0,
      volume: 300,
      temperature: 300,
      nR: 1
    });
    setHistory([]);
    setLogs([]);
  };

  const renderActiveChart = () => {
    switch (activeGraph) {
      case 'PV':
        return (
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              type="number" dataKey="v" name="Volume" unit="L" stroke="#94a3b8" fontSize={10} domain={[0, 500]}
              label={{ value: 'V (L)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 10 }}
            />
            <YAxis 
              type="number" dataKey="p" name="Pressure" unit="atm" stroke="#94a3b8" fontSize={10} domain={[0, 6]}
              label={{ value: 'P (atm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
            <Scatter name="Dữ liệu" data={history} fill="#10b981" />
            <Scatter name="Hiện tại" data={[{p: state.pressure, v: state.volume, t: state.temperature}]} fill="#3b82f6" shape="circle" />
          </ScatterChart>
        );
      case 'VT':
        return (
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              type="number" dataKey="t" name="Temperature" unit="K" stroke="#94a3b8" fontSize={10} domain={[0, 600]}
              label={{ value: 'T (K)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 10 }}
            />
            <YAxis 
              type="number" dataKey="v" name="Volume" unit="L" stroke="#94a3b8" fontSize={10} domain={[0, 500]}
              label={{ value: 'V (L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
            <Scatter name="Dữ liệu" data={history} fill="#f43f5e" />
            <Scatter name="Hiện tại" data={[{p: state.pressure, v: state.volume, t: state.temperature}]} fill="#3b82f6" shape="circle" />
          </ScatterChart>
        );
      case 'PT':
        return (
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              type="number" dataKey="t" name="Temperature" unit="K" stroke="#94a3b8" fontSize={10} domain={[0, 600]}
              label={{ value: 'T (K)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 10 }}
            />
            <YAxis 
              type="number" dataKey="p" name="Pressure" unit="atm" stroke="#94a3b8" fontSize={10} domain={[0, 6]}
              label={{ value: 'P (atm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
            <Scatter name="Dữ liệu" data={history} fill="#f59e0b" />
            <Scatter name="Hiện tại" data={[{p: state.pressure, v: state.volume, t: state.temperature}]} fill="#3b82f6" shape="circle" />
          </ScatterChart>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <div className="w-full lg:w-80 border-r border-slate-700 bg-slate-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-blue-400 w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight">Ideal Gas Lab</h1>
        </div>

        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Chọn quá trình</h2>
          <div className="flex flex-col gap-2">
            {Object.values(ProcessMode).map(m => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setLogs([]); 
                  setHistory([]);
                }}
                className={`text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  mode === m 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <SidebarControls state={state} mode={mode} onUpdate={updateState} />

        <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600 border-dashed flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase">Hành động</h3>
          <button 
            onClick={captureState}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20"
          >
            <PlusCircle size={16} /> Ghi số liệu (Log)
          </button>
          <button 
            onClick={clearLogs}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Trash2 size={16} /> Xóa bảng số liệu
          </button>
        </div>

        <div className="mt-auto flex gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-medium transition-colors"
          >
            {isPaused ? <Play size={18} /> : <div className="w-4 h-4 bg-white rounded-sm" />}
            {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          </button>
          <button onClick={resetSimulation} className="flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-3 rounded-lg transition-colors">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col min-h-0 relative overflow-y-auto">
        <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="aspect-video xl:aspect-auto xl:h-[500px] bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Box className="text-blue-400" size={20} />
                  <span className="font-semibold text-slate-200">Mô phỏng Xylanh</span>
                </div>
                <div className="text-xs text-slate-400 font-mono italic">PV = nRT (nR = 1.0)</div>
              </div>
              <div className="flex-1 relative">
                <GasSimulation state={state} isPaused={isPaused} />
                <div className="absolute top-4 left-4 p-3 bg-slate-900/80 backdrop-blur rounded-lg border border-slate-700 text-sm font-mono shadow-xl pointer-events-none">
                  <div className="text-blue-400 mb-1 font-bold">Physics Logic:</div>
                  <div className="text-white">P &times; V = nRT</div>
                  <div className="text-slate-400 text-xs mt-1">
                    {mode === ProcessMode.ISOTHERMAL && "T = Const → P ∝ 1/V"}
                    {mode === ProcessMode.ISOBARIC && "P = Const → V ∝ T"}
                    {mode === ProcessMode.ISOCHORIC && "V = Const → P ∝ T"}
                  </div>
                </div>
              </div>
            </div>
            <LabNotebook logs={logs} mode={mode} />
          </div>

          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <GaugeDisplay label="Áp suất (P)" value={state.pressure.toFixed(2)} unit="atm" icon={<Gauge size={20} className="text-orange-400" />} color="orange" percentage={(state.pressure / 6) * 100} />
              <GaugeDisplay label="Nhiệt độ (T)" value={state.temperature.toFixed(0)} unit="K" icon={<Thermometer size={20} className="text-red-400" />} color="red" percentage={(state.temperature / 600) * 100} />
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden h-[400px]">
              <div className="flex flex-col border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
                  <LineChartIcon className="text-emerald-400" size={18} />
                  <span className="font-semibold text-sm text-slate-200">Đồ thị thực nghiệm</span>
                </div>
                <div className="flex p-1 gap-1">
                  {(['PV', 'VT', 'PT'] as GraphType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setActiveGraph(type)}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded uppercase tracking-wider transition-all ${
                        activeGraph === type 
                        ? 'bg-blue-600 text-white shadow-inner' 
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {type === 'PV' ? 'P-V (Boyle)' : type === 'VT' ? 'V-T (Charles)' : 'P-T (Gay-L)'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  {renderActiveChart()}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 flex flex-col gap-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-blue-400 uppercase tracking-tighter">
                <ClipboardList size={18} /> Ghi chú quan sát
              </h3>
              <ul className="text-[11px] text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>Trong đồ thị <b>{activeGraph === 'PV' ? 'P-V' : activeGraph === 'VT' ? 'V-T' : 'P-T'}</b>, các chấm màu đại diện cho dữ liệu đã đo.</li>
                <li>Màu xanh dương là trạng thái tức thời của hệ thống.</li>
                <li>{activeGraph === 'PV' && "Đồ thị P-V là một đường Hyperbol khi nhiệt độ không đổi."}
                    {activeGraph === 'VT' && "Đồ thị V-T là đường thẳng đi qua gốc tọa độ khi áp suất không đổi."}
                    {activeGraph === 'PT' && "Đồ thị P-T là đường thẳng đi qua gốc tọa độ khi thể tích không đổi."}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
