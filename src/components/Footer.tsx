import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 text-center border-t border-white/40 bg-transparent relative z-10 flex flex-col items-center gap-1">
      <p className="text-xs font-semibold text-slate-500 tracking-wide">
        EduVăn AI Engine — Hệ thống Phân tích & Chấm điểm Văn học
      </p>
      <p className="text-[11px] font-bold text-slate-400">
        Made with excellence by <span className="text-violet-600 font-extrabold">Tuấn Khang</span>
      </p>
    </footer>
  );
};
