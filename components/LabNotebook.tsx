
import React, { useState, useEffect } from 'react';
import { GraphPoint, ProcessMode } from '../types';
import { ClipboardList, Calculator, BarChart, CheckCircle2, XCircle, Info, BookOpen, AlertCircle } from 'lucide-react';

interface Props {
  logs: GraphPoint[];
  mode: ProcessMode;
}

interface UserCalculation {
  kValues: string[];
  averageK: string;
}

const LabNotebook: React.FC<Props> = ({ logs, mode }) => {
  const [userInput, setUserInput] = useState<UserCalculation>({
    kValues: [],
    averageK: ''
  });
  const [showRowSolution, setShowRowSolution] = useState<number | null>(null);

  // Sync inputs with logs length
  useEffect(() => {
    setUserInput(prev => ({
      ...prev,
      kValues: logs.map((_, i) => prev.kValues[i] || '')
    }));
  }, [logs]);

  const getCalculationInfo = () => {
    switch (mode) {
      case ProcessMode.ISOTHERMAL:
        return {
          law: "Định luật Boyle (Đẳng nhiệt)",
          formula: "P \u00D7 V = k",
          calc: (p: number, v: number, t: number) => p * v,
          unit: "atm.L",
          label: "P \u00D7 V",
          hint: (p: number, v: number, t: number) => `k = P \u00D7 V = ${p.toFixed(2)} atm \u00D7 ${v.toFixed(1)} L = ${(p * v).toFixed(2)} atm.L`,
          steps: [
            "Bước 1: Kiểm tra cột Nhiệt độ (T). Trong quá trình Đẳng nhiệt, T phải không đổi ở mọi lần đo.",
            "Bước 2: Xác định giá trị Áp suất (P) và Thể tích (V) từ bảng số liệu.",
            "Bước 3: Áp dụng công thức Định luật Boyle: k = P \u00D7 V.",
            "Bước 4: Thực hiện phép nhân cho từng lần đo. Ví dụ lần 1: P₁ \u00D7 V₁ = k₁ (đơn vị là atm.L).",
            "Bước 5: Sau khi có đủ các giá trị k, tính hằng số trung bình: k_tb = (k₁ + k₂ + ... + kₙ) / n."
          ]
        };
      case ProcessMode.ISOBARIC:
        return {
          law: "Định luật Charles (Đẳng áp)",
          formula: "V / T = k",
          calc: (p: number, v: number, t: number) => v / t,
          unit: "L/K",
          label: "V / T",
          hint: (p: number, v: number, t: number) => `k = V / T = ${v.toFixed(1)} L / ${t.toFixed(1)} K = ${(v / t).toFixed(4)} L/K`,
          steps: [
            "Bước 1: Kiểm tra cột Áp suất (P). Trong quá trình Đẳng áp, P phải được giữ cố định.",
            "Bước 2: Xác định giá trị Thể tích (V) và Nhiệt độ tuyệt đối (T) từ bảng số liệu.",
            "Bước 3: Áp dụng công thức Định luật Charles: k = V / T.",
            "Bước 4: Thực hiện phép chia cho từng lần đo. Ví dụ lần 1: V₁ / T₁ = k₁ (đơn vị là L/K).",
            "Bước 5: Tính giá trị trung bình k_tb để xác nhận tỉ lệ thuận giữa V và T."
          ]
        };
      case ProcessMode.ISOCHORIC:
        return {
          law: "Định luật Gay-Lussac (Đẳng tích)",
          formula: "P / T = k",
          calc: (p: number, v: number, t: number) => p / t,
          unit: "atm/K",
          label: "P / T",
          hint: (p: number, v: number, t: number) => `k = P / T = ${p.toFixed(2)} atm / ${t.toFixed(1)} K = ${(p / t).toFixed(4)} atm/K`,
          steps: [
            "Bước 1: Kiểm tra cột Thể tích (V). Trong quá trình Đẳng tích, V không đổi vì bình chứa được chốt chặt.",
            "Bước 2: Xác định giá trị Áp suất (P) và Nhiệt độ tuyệt đối (T) từ bảng số liệu.",
            "Bước 3: Áp dụng công thức Định luật Gay-Lussac: k = P / T.",
            "Bước 4: Thực hiện phép chia cho từng lần đo. Ví dụ lần 1: P₁ / T₁ = k₁ (đơn vị là atm/K).",
            "Bước 5: Tính giá trị trung bình k_tb để xác nhận mối liên hệ tỉ lệ thuận giữa P và T."
          ]
        };
      default:
        return {
          law: "Khí lý tưởng",
          formula: "(P \u00D7 V) / T = k",
          calc: (p: number, v: number, t: number) => (p * v) / t,
          unit: "atm.L/K",
          label: "PV/T",
          hint: (p: number, v: number, t: number) => `k = (P \u00D7 V) / T = (${p.toFixed(2)} \u00D7 ${v.toFixed(1)}) / ${t.toFixed(1)} = ${((p * v) / t).toFixed(2)} atm.L/K`,
          steps: [
            "Bước 1: Thu thập cả 3 thông số P, V và T cho mỗi trạng thái.",
            "Bước 2: Tính tích (P \u00D7 V) sau đó chia cho T.",
            "Bước 3: Đảm bảo đơn vị đồng nhất cho mọi lần đo.",
            "Bước 4: Tính trung bình k_tb để xác định hằng số nR của mẫu khí."
          ]
        };
    }
  };

  const config = getCalculationInfo();

  const validateValue = (input: string, truth: number) => {
    const val = parseFloat(input);
    if (isNaN(val)) return null;
    const error = Math.abs(val - truth) / truth;
    return error <= 0.05; // 5% error margin
  };

  const handleKChange = (index: number, value: string) => {
    const newK = [...userInput.kValues];
    newK[index] = value;
    setUserInput({ ...userInput, kValues: newK });
  };

  const trueKValues = logs.map(log => config.calc(log.p, log.v, log.t));
  const trueAvgK = trueKValues.length > 0 
    ? trueKValues.reduce((acc, curr) => acc + curr, 0) / trueKValues.length 
    : 0;

  const isAvgCorrect = validateValue(userInput.averageK, trueAvgK);

  // Requirement: Only show solutions if the user has attempted and failed the average value
  const canSeeSolutions = isAvgCorrect === false;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-emerald-400" size={20} />
          <span className="font-semibold text-slate-200">Báo cáo thực hành Gas Laws</span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500/20">
          <Calculator className="text-emerald-400" size={14} />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">{config.law}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <th className="px-4 py-3 border-b border-slate-700">Lần đo</th>
              <th className="px-4 py-3 border-b border-slate-700">P (atm)</th>
              <th className="px-4 py-3 border-b border-slate-700">V (L)</th>
              <th className="px-4 py-3 border-b border-slate-700">T (K)</th>
              <th className="px-4 py-3 border-b border-slate-700 text-emerald-400 bg-emerald-900/10">Tính k ({config.unit})</th>
              {canSeeSolutions && <th className="px-4 py-3 border-b border-slate-700 text-center">Giải thích</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={canSeeSolutions ? 6 : 5} className="px-6 py-8 text-center text-slate-500 italic">
                  Bấm "Capture Data Point" để thu thập số liệu.
                </td>
              </tr>
            ) : (
              <>
                {logs.map((log, index) => {
                  const truth = config.calc(log.p, log.v, log.t);
                  const isCorrect = validateValue(userInput.kValues[index], truth);
                  
                  return (
                    <React.Fragment key={index}>
                      <tr className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">#{index + 1}</td>
                        <td className="px-4 py-3 font-mono">{log.p.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono">{log.v.toFixed(1)}</td>
                        <td className="px-4 py-3 font-mono">{log.t.toFixed(1)}</td>
                        <td className="px-4 py-3 bg-emerald-900/5">
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="k = ?"
                              className={`w-24 bg-slate-900 border ${isCorrect === null ? 'border-slate-600' : isCorrect ? 'border-emerald-500' : 'border-red-500'} rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                              value={userInput.kValues[index] || ''}
                              onChange={(e) => handleKChange(index, e.target.value)}
                            />
                            {isCorrect === true && <CheckCircle2 size={16} className="text-emerald-500" />}
                            {isCorrect === false && <XCircle size={16} className="text-red-500" />}
                          </div>
                        </td>
                        {canSeeSolutions && (
                          <td className="px-4 py-3 text-center">
                            <button 
                              onClick={() => setShowRowSolution(showRowSolution === index ? null : index)}
                              className={`p-1 rounded-full transition-colors ${showRowSolution === index ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-blue-400'}`}
                            >
                              <Info size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                      {canSeeSolutions && showRowSolution === index && (
                        <tr className="bg-blue-900/10">
                          <td colSpan={6} className="px-6 py-4 text-[11px] font-mono border-l-4 border-blue-500">
                             <div className="space-y-1">
                                <span className="text-blue-400 font-bold block">BƯỚC TÍNH LẦN #{index + 1}:</span>
                                <p className="text-slate-300">Công thức: {config.formula}</p>
                                <p className="text-slate-300">Thế số: {config.hint(log.p, log.v, log.t)}</p>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {/* Average Row */}
                <tr className="bg-emerald-900/20 font-bold border-t-2 border-emerald-500/30">
                  <td colSpan={4} className="px-4 py-4 text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-2">
                    <BarChart size={14} /> Giá trị trung bình k_tb ({config.unit})
                  </td>
                  <td colSpan={canSeeSolutions ? 2 : 1} className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          placeholder="k_tb = ?"
                          className={`w-36 bg-slate-900 border ${isAvgCorrect === null ? 'border-slate-600' : isAvgCorrect ? 'border-emerald-500' : 'border-red-500'} rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                          value={userInput.averageK}
                          onChange={(e) => setUserInput({...userInput, averageK: e.target.value})}
                        />
                        {isAvgCorrect === true && (
                          <div className="flex items-center gap-2 text-emerald-400 text-xs animate-pulse">
                            <CheckCircle2 size={16} />
                            <span className="font-bold">Chính xác! Bạn đã nắm vững kiến thức.</span>
                          </div>
                        )}
                        {isAvgCorrect === false && (
                          <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
                            <AlertCircle size={16} />
                            <span>Kết quả sai! Hãy xem phần giải chi tiết bên dưới.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      
      {logs.length > 0 && canSeeSolutions && (
        <div className="p-5 bg-slate-900/50 border-t border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-blue-400">
              <BookOpen size={18} />
              <h4 className="text-xs font-bold uppercase tracking-widest">Hướng dẫn giải chi tiết cho học sinh</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Process guide */}
              <div className="space-y-4">
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-inner">
                  <p className="text-[11px] font-bold text-blue-400 mb-3 border-b border-slate-700 pb-2 uppercase">I. Quy tắc tính toán ({config.law}):</p>
                  <ul className="space-y-3">
                    {config.steps.map((step, i) => (
                      <li key={i} className="text-[10px] text-slate-300 flex gap-3 leading-relaxed">
                        <span className="w-5 h-5 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center shrink-0 font-bold border border-blue-800/50">{i+1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step by step math breakdown */}
              <div className="space-y-4">
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-inner">
                  <p className="text-[11px] font-bold text-emerald-400 mb-3 border-b border-slate-700 pb-2 uppercase">II. Giải chi tiết giá trị trung bình:</p>
                  <div className="text-[10px] text-slate-400 space-y-4 font-mono">
                    <div className="space-y-2">
                      <p className="text-blue-400 font-bold underline">1. Tổng các hằng số (Σk):</p>
                      <div className="pl-3 border-l-2 border-slate-700 bg-slate-900/30 p-2 rounded">
                        <p className="break-all">Σk = {trueKValues.map(v => v.toFixed(mode === ProcessMode.ISOTHERMAL ? 2 : 4)).join(' + ')}</p>
                        <p className="text-white mt-1">Σk ≈ {trueKValues.reduce((a, b) => a + b, 0).toFixed(4)} {config.unit}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-emerald-400 font-bold underline">2. Tính k trung bình (k_tb):</p>
                      <div className="pl-3 border-l-2 border-slate-700 bg-slate-900/30 p-2 rounded">
                        <p>Công thức: k_tb = Σk / n</p>
                        <p>Với n = {logs.length} (số lần đo)</p>
                        <p>Thế số: {trueKValues.reduce((a, b) => a + b, 0).toFixed(4)} / {logs.length}</p>
                        <p className="text-white mt-2 text-xs font-bold border-t border-slate-700 pt-2">
                          Kết quả k_tb ≈ <span className="text-emerald-400 underline">{trueAvgK.toFixed(mode === ProcessMode.ISOTHERMAL ? 2 : 4)}</span> {config.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-900/10 rounded-lg border border-blue-700/20 text-[10px] text-slate-400 italic leading-relaxed flex gap-3 items-center">
              <Info size={18} className="text-blue-400 shrink-0" />
              <p>Học sinh lưu ý: Sai số trong thí nghiệm là điều bình thường. Hằng số k thực nghiệm có thể biến thiên nhẹ do các yếu tố ngẫu nhiên, nhưng giá trị trung bình sẽ luôn tiến gần đến hằng số lý thuyết của mẫu khí.</p>
            </div>
          </div>
        </div>
      )}

      {logs.length > 0 && isAvgCorrect === null && (
        <div className="p-4 bg-slate-900/30 border-t border-slate-700 flex items-center justify-center gap-2">
          <AlertCircle size={16} className="text-slate-500" />
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Vui lòng nhập giá trị k_tb để kiểm tra kết quả và xem hướng dẫn chi tiết.</p>
        </div>
      )}
    </div>
  );
};

export default LabNotebook;
