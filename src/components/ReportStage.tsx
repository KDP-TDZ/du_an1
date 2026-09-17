import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart3, Copy, Check, Download, RotateCcw, Sparkles, Play, FastForward, CheckCircle2 } from 'lucide-react';

interface ReportStageProps {
  markdownContent: string;
  onRestart: () => void;
}

export const ReportStage: React.FC<ReportStageProps> = ({
  markdownContent,
  onRestart,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Typing effect logic
  useEffect(() => {
    if (!markdownContent) return;

    // Reset typing state
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;
    const totalLength = markdownContent.length;
    const chunkSize = Math.max(2, Math.floor(totalLength / 250)); // smooth step calculation

    timerRef.current = setInterval(() => {
      currentIndex += chunkSize;
      if (currentIndex >= totalLength) {
        setDisplayedText(markdownContent);
        setIsTyping(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setDisplayedText(markdownContent.slice(0, currentIndex));
      }
    }, 20);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [markdownContent]);

  // Skip typing animation
  const handleSkipTyping = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedText(markdownContent);
    setIsTyping(false);
  };

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
          {isTyping && (
            <button
              onClick={handleSkipTyping}
              className="px-4 py-2.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-bold shadow-2xs transition-all active:scale-95 flex items-center gap-2 animate-pulse cursor-pointer"
              title="Hiện toàn bộ nội dung ngay lập tức"
            >
              <FastForward className="w-4 h-4" />
              <span>Hiển thị ngay</span>
            </button>
          )}

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

      {/* Rendered Markdown Paper View Container with Typing Indicator */}
      <div className="bg-white/70 backdrop-blur-md border border-white/80 shadow-md rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        
        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
            {isTyping ? (
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-ping" />
                <span>AI đang xuất báo cáo kết quả...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã hoàn tất báo cáo</span>
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Markdown Document
          </div>
        </div>

        {/* Markdown Content with Typing Cursor */}
        <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4">
          <ReactMarkdown>{displayedText}</ReactMarkdown>
          {isTyping && (
            <span className="inline-block w-2.5 h-4 ml-1 bg-violet-600 animate-pulse align-middle" />
          )}
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
