import React from 'react';
import { BrainCircuit, Settings, Sparkles, FileText, CheckCircle2, FileSignature, BarChart3 } from 'lucide-react';
import { Stage } from '../types';

interface HeaderProps {
  currentStage: Stage;
  onSelectStage: (stage: Stage) => void;
  unlockedStages: Stage[];
  onOpenSettings: () => void;
  onReset: () => void;
  hasApiKey: boolean;
}

const STAGES: { key: Stage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'INPUT', label: 'Văn bản / OCR', icon: FileText },
  { key: 'KEYWORDS', label: 'Từ khóa', icon: Sparkles },
  { key: 'QUESTIONS', label: 'Câu hỏi', icon: FileSignature },
  { key: 'EVALUATION', label: 'Chấm điểm', icon: CheckCircle2 },
  { key: 'REPORT', label: 'Báo cáo', icon: BarChart3 },
];

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  onSelectStage,
  unlockedStages,
  onOpenSettings,
  onReset,
  hasApiKey,
}) => {
  const getStageIndex = (stage: Stage) => STAGES.findIndex((s) => s.key === stage);
  const currentIndex = getStageIndex(currentStage);

  return (
    <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={onReset}
          className="flex items-center gap-3 group text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-400 rounded-xl p-1 transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-violet-200 group-hover:shadow-lg group-hover:shadow-violet-300 transition-all">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">
                EduVăn <span className="bg-gradient-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">AI Engine</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Trợ lý phân tích tác phẩm & Chấm điểm Văn học
            </p>
          </div>
        </button>

        {/* Interactive Step Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-xs">
          {STAGES.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStage === s.key;
            const isUnlocked = unlockedStages.includes(s.key);
            const isPassed = idx < currentIndex;

            return (
              <div key={s.key} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (isUnlocked) {
                      onSelectStage(s.key);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-200 scale-105 cursor-default'
                      : isUnlocked
                      ? 'bg-white/80 text-violet-700 hover:bg-violet-100 hover:text-violet-900 border border-violet-100/80 cursor-pointer active:scale-95'
                      : 'text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                  title={isUnlocked ? `Chuyển sang bước: ${s.label}` : 'Bước này chưa mở'}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </button>
                {idx < STAGES.length - 1 && (
                  <div
                    className={`w-3 h-0.5 mx-0.5 rounded-full transition-colors ${
                      idx < currentIndex ? 'bg-violet-300' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 hover:bg-white border border-white/60 text-slate-700 hover:text-violet-600 transition-all shadow-xs active:scale-95 text-xs font-semibold"
            title="Cài đặt API Key"
          >
            <Settings className="w-4 h-4 text-violet-500" />
            <span className="hidden sm:inline">Cài đặt API</span>
            {hasApiKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile step navigation bar */}
      <div className="md:hidden flex items-center justify-around bg-white/70 backdrop-blur-md px-2 py-2 border-t border-slate-100 overflow-x-auto">
        {STAGES.map((s) => {
          const Icon = s.icon;
          const isActive = currentStage === s.key;
          const isUnlocked = unlockedStages.includes(s.key);

          return (
            <button
              key={s.key}
              onClick={() => isUnlocked && onSelectStage(s.key)}
              disabled={!isUnlocked}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
                isActive
                  ? 'text-violet-600 font-black'
                  : isUnlocked
                  ? 'text-slate-600 hover:text-violet-600'
                  : 'text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{s.label.split('/')[0].trim()}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
