import React, { useState } from 'react';
import { EvaluationSummary, EvaluationResult, KeywordQuestions } from '../types';
import { Award, CheckCircle2, AlertCircle, BookOpen, GraduationCap, ArrowLeft, ArrowRight, BarChart3, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface EvaluationStageProps {
  summary: EvaluationSummary;
  results: EvaluationResult[];
  questionsData: KeywordQuestions[];
  onExportReport: () => void;
  onEditAnswers: () => void;
  isLoadingReport: boolean;
}

export const EvaluationStage: React.FC<EvaluationStageProps> = ({
  summary,
  results,
  questionsData,
  onExportReport,
  onEditAnswers,
  isLoadingReport,
}) => {
  const [expandedCardsMap, setExpandedCardsMap] = useState<Record<string, boolean>>({});

  const toggleCard = (questionId: string) => {
    setExpandedCardsMap((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const questionTextMap = new Map<string, string>();
  questionsData.forEach((kq) => {
    kq.questions.forEach((q) => {
      questionTextMap.set(q.question_id, q.question_text);
    });
  });

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-violet-700 bg-violet-50 border-violet-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Overall Score & Feedback Banner Card */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 sm:p-8 relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-violet-200/30 via-pink-200/30 to-teal-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 pb-6 border-b border-slate-100">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
              <Award className="w-4 h-4 text-violet-500" />
              <span>Kết quả đánh giá bài làm tự luận Văn học</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Bảng điểm & Nhận xét của <span className="text-violet-600">Giám khảo AI</span>
            </h2>
            <p className="text-sm text-slate-500">
              Phân tích tỷ lệ chính xác theo chuẩn đáp án và tiêu chí chấm môn Văn học.
            </p>
          </div>

          {/* Overall Percentage Score Badge */}
          <div className="flex items-center gap-4 bg-white/90 p-4 rounded-3xl border border-white shadow-md shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 to-teal-400 opacity-20 blur-sm" />
              <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-violet-600 to-teal-500 text-white flex flex-col items-center justify-center font-extrabold shadow-sm">
                <span className="text-2xl leading-none">{summary.overall_score}%</span>
                <span className="text-[9px] font-semibold opacity-80 uppercase tracking-wider mt-0.5">Tỷ lệ đúng</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đánh giá tổng kết</div>
              <div className="text-base font-extrabold text-slate-800">
                {summary.overall_score >= 80 ? 'Xuất sắc' : summary.overall_score >= 60 ? 'Khá giỏi' : summary.overall_score >= 40 ? 'Trung bình' : 'Cần cố gắng'}
              </div>
              <div className="text-xs text-slate-500">Tỷ lệ chính xác {summary.overall_score}%</div>
            </div>
          </div>

        </div>

        {/* Teacher Feedback Box */}
        <div className="bg-violet-50/80 border border-violet-100 rounded-2xl p-5 space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-violet-800 font-extrabold text-sm">
            <GraduationCap className="w-5 h-5 text-violet-600" />
            <span>Nhận xét tổng quan từ giám khảo:</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {summary.teacher_feedback}
          </p>
        </div>

      </div>

      {/* Per-Question Percentage Breakdown */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-600" />
          <span>Chi tiết đánh giá từng câu hỏi ({results.length} câu):</span>
        </h3>

        {results.map((res, idx) => {
          const questionText = questionTextMap.get(res.question_id) || `Câu hỏi #${idx + 1}`;
          const badgeStyle = getScoreColorClass(res.percentage_score);
          const isExpanded = expandedCardsMap[res.question_id] || false;

          return (
            <div
              key={res.question_id || idx}
              className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 sm:p-8 space-y-4"
            >
              {/* Question Header & Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Mã câu hỏi: {res.question_id}
                    </span>
                    <h4 className="text-base font-bold text-slate-800 leading-snug">
                      {questionText}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {/* Percentage Score Badge */}
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${badgeStyle}`}>
                    Đúng {res.percentage_score}%
                  </span>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleCard(res.question_id)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <span>{isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-violet-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-violet-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Content Section */}
              {isExpanded && (
                <div className="space-y-5 pt-4 border-t border-slate-100 animate-fade-in">
                  {/* Analysis Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Correct Points Achieved */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Ý đúng đã thể hiện được:</span>
                      </div>
                      {res.correct_points && res.correct_points.length > 0 ? (
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-1">
                          {res.correct_points.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Chưa ghi nhận ý đúng rõ ràng.</p>
                      )}
                    </div>

                    {/* Missing Points / Areas to Improve */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Cần bổ sung & hoàn thiện:</span>
                      </div>
                      {res.missing_points && res.missing_points.length > 0 ? (
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-1">
                          {res.missing_points.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Bài làm cơ bản đầy đủ ý.</p>
                      )}
                    </div>

                  </div>

                  {/* Standard Model Answer Box */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                      <BookOpen className="w-4 h-4 text-violet-600" />
                      <span>Đáp án chuẩn tham khảo:</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3.5 rounded-xl border border-slate-100">
                      {res.standard_answer}
                    </p>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Navigation Controls Bar */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 flex items-center justify-between gap-4">
        <button
          onClick={onEditAnswers}
          className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sửa lại câu trả lời</span>
        </button>

        <button
          onClick={onExportReport}
          disabled={isLoadingReport}
          className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white shadow-lg shadow-violet-200 transition-all active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
        >
          {isLoadingReport ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang tạo báo cáo Markdown...</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5" />
              <span>Xuất báo cáo học tập Markdown</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
