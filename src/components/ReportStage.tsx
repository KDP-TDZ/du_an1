import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart3, Copy, Check, Download, RotateCcw, FileText, Sparkles } from 'lucide-react';

interface ReportStageProps {
  markdownContent: string;
  onRestart: () => void;
}

export const ReportStage: React.FC<ReportStageProps> = ({
  markdownContent,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_cao_EduVan_AI_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Report Header Banner */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-2">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            <span>Báo cáo học tập tổng hợp</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Báo cáo phân tích & <span className="text-violet-600">Đánh giá Văn học</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Đã tổng hợp toàn bộ lịch sử phân tích, từ khóa trọng tâm, câu hỏi và điểm số thành định dạng Markdown chuẩn hóa.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs transition-all active:scale-95 flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-violet-600" />
                <span>Sao chép Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải về file .md</span>
          </button>
        </div>
      </div>

      {/* Rendered Markdown Paper View Container */}
      <div className="bg-white/70 backdrop-blur-md border border-white/80 shadow-md rounded-3xl p-6 sm:p-10 relative">
        <div className="absolute top-4 right-6 text-xs text-slate-300 font-mono">
          Markdown Viewer
        </div>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4">
          <ReactMarkdown>{markdownContent}</ReactMarkdown>
        </div>
      </div>

      {/* Restart Footer Control */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Muốn phân tích tác phẩm khác?</h4>
            <p className="text-xs text-slate-500">Bắt đầu lại với tác phẩm Văn học mới</p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-violet-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Phân tích tác phẩm mới</span>
        </button>
      </div>

    </div>
  );
};
