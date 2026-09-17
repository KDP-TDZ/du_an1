import React, { useState } from 'react';
import { KeywordQuestions, EvaluationResult } from '../types';
import { FileSignature, CheckCircle2, ArrowLeft, ArrowRight, Edit3, Award, AlertCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface QuestionsStageProps {
  questionsData: KeywordQuestions[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  onEvaluateSingle: (questionId: string) => void;
  onEvaluateAll: () => void;
  onBack: () => void;
  isLoadingAll: boolean;
  evaluatingSingleMap: Record<string, boolean>;
  singleEvaluationResults: Record<string, EvaluationResult>;
}

export const QuestionsStage: React.FC<QuestionsStageProps> = ({
  questionsData,
  answers,
  onAnswerChange,
  onEvaluateSingle,
  onEvaluateAll,
  onBack,
  isLoadingAll,
  evaluatingSingleMap,
  singleEvaluationResults,
}) => {
  const [expandedDetailsMap, setExpandedDetailsMap] = useState<Record<string, boolean>>({});

  const toggleDetails = (questionId: string) => {
    setExpandedDetailsMap((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const allQuestions = questionsData.flatMap((kq) =>
    kq.questions.map((q) => ({ ...q, keyword: kq.keyword }))
  );

  const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Stage Header Banner */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-2">
            <FileSignature className="w-4 h-4 text-violet-500" />
            <span>Bộ câu hỏi tự luận phân hóa</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Luyện tập & Viết <span className="text-violet-600">câu trả lời tự luận Văn học</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Đã sinh <span className="font-bold text-slate-800">{allQuestions.length} câu hỏi</span> phân hóa (Cơ bản & Nâng cao). Bạn có thể viết câu trả lời và bấm chấm điểm từng câu hoặc chấm toàn bộ.
          </p>
        </div>

        {/* Progress Counter Badge */}
        <div className="flex items-center gap-3 bg-violet-50/80 px-4 py-3 rounded-2xl border border-violet-100 self-start md:self-auto">
          <Edit3 className="w-5 h-5 text-violet-600" />
          <div>
            <div className="text-xs font-bold text-violet-800">Tiến độ làm bài</div>
            <div className="text-sm font-extrabold text-slate-800">
              {answeredCount} / {allQuestions.length} câu đã trả lời
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questionsData.map((kq, kwIdx) => (
          <div
            key={kq.keyword_id || kwIdx}
            className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6"
          >
            {/* Keyword Title Group */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                {kwIdx + 1}
              </div>
              <div>
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">
                  Từ khóa trọng tâm
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  {kq.keyword}
                </h3>
              </div>
            </div>

            {/* Questions under this Keyword */}
            <div className="space-y-6">
              {kq.questions.map((q, qIdx) => {
                const isEvaluatingThis = evaluatingSingleMap[q.question_id] || false;
                const singleEval = singleEvaluationResults[q.question_id];
                const currentAns = answers[q.question_id] || '';
                const isLevelCoBan = q.level === 'CO_BAN' || q.level === 'CƠ BẢN';
                const isExpanded = expandedDetailsMap[q.question_id] || false;

                return (
                  <div
                    key={q.question_id || qIdx}
                    className="p-5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-4 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          Q{qIdx + 1}
                        </span>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed">
                          {q.question_text}
                        </p>
                      </div>

                      {/* Difficulty Level Tag */}
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 ${
                          isLevelCoBan
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-violet-50 text-violet-700 border-violet-200'
                        }`}
                      >
                        {isLevelCoBan ? 'CƠ BẢN' : 'NÂNG CAO'}
                      </span>
                    </div>

                    {/* Answer Text Area */}
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={currentAns}
                        onChange={(e) => onAnswerChange(q.question_id, e.target.value)}
                        placeholder="Nhập câu trả lời tự luận của bạn cho câu hỏi này..."
                        className="w-full p-3.5 bg-white/60 focus:bg-white border border-slate-200/80 backdrop-blur-sm rounded-xl text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 transition-all placeholder:text-slate-300 resize-y"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {currentAns.trim().length} ký tự
                        </span>

                        {/* Individual Evaluate Button */}
                        <button
                          onClick={() => onEvaluateSingle(q.question_id)}
                          disabled={!currentAns.trim() || isEvaluatingThis || isLoadingAll}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            currentAns.trim() && !isEvaluatingThis && !isLoadingAll
                              ? 'bg-violet-100 hover:bg-violet-200 text-violet-700 shadow-2xs active:scale-95 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isEvaluatingThis ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
                              <span>Đang chấm câu này...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                              <span>Chấm điểm câu này</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Inline Single Evaluation Preview with Collapsible Toggle */}
                    {singleEval && (
                      <div className="p-4 bg-violet-50/90 border border-violet-200/80 rounded-2xl space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-violet-600" />
                            <span className="text-xs font-extrabold text-violet-900">
                              Kết quả đánh giá
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Score Percentage Badge */}
                            <span className="px-3 py-1 rounded-full bg-violet-600 text-white font-black text-xs">
                              {singleEval.percentage_score}%
                            </span>

                            {/* Toggle Details Button */}
                            <button
                              onClick={() => toggleDetails(q.question_id)}
                              className="px-2.5 py-1 rounded-xl bg-white hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            >
                              <span>{isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Details Content */}
                        {isExpanded && (
                          <div className="space-y-3 pt-3 border-t border-violet-200/60 animate-fade-in">
                            {/* Correct points */}
                            {singleEval.correct_points && singleEval.correct_points.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Ý đúng đã đạt:</span>
                                </span>
                                <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 pl-1">
                                  {singleEval.correct_points.map((pt, i) => (
                                    <li key={i}>{pt}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Missing points */}
                            {singleEval.missing_points && singleEval.missing_points.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Cần bổ sung / hoàn thiện:</span>
                                </span>
                                <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 pl-1">
                                  {singleEval.missing_points.map((pt, i) => (
                                    <li key={i}>{pt}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Standard Answer */}
                            <div className="space-y-1 pt-1 border-t border-violet-200/50">
                              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                                <span>Đáp án chuẩn:</span>
                              </span>
                              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-violet-100">
                                {singleEval.standard_answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls Bar */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách từ khóa</span>
        </button>

        <button
          onClick={onEvaluateAll}
          disabled={answeredCount === 0 || isLoadingAll}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-98 ${
            answeredCount > 0 && !isLoadingAll
              ? 'bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white shadow-violet-200 cursor-pointer'
              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          {isLoadingAll ? (
            <>
              <CheckCircle2 className="w-5 h-5 animate-spin" />
              <span>Đang tổng hợp & Chấm điểm...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Chấm điểm toàn bộ bài làm ({answeredCount} câu)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
