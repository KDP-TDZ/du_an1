import React, { useState } from 'react';
import { ChapterKeywords, Keyword, CategoryType } from '../types';
import { Sparkles, CheckSquare, Square, Users, Zap, Palette, Heart, ArrowLeft, ArrowRight, FileSignature, Filter } from 'lucide-react';

interface KeywordsStageProps {
  chapters: ChapterKeywords[];
  selectedKeywordIds: string[];
  onToggleKeyword: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  questionsPerKeyword: number;
  setQuestionsPerKeyword: (num: number) => void;
  onGenerateQuestions: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }> = {
  NHAN_VAT: {
    label: 'Nhân vật',
    icon: Users,
    bg: 'bg-violet-50/90',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  BIEN_CO: {
    label: 'Biến cố / Cốt truyện',
    icon: Zap,
    bg: 'bg-amber-50/90',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  NGHE_THUAT: {
    label: 'Biện pháp nghệ thuật',
    icon: Palette,
    bg: 'bg-teal-50/90',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
  TU_THUONG: {
    label: 'Chủ đề / Tư tưởng',
    icon: Heart,
    bg: 'bg-fuchsia-50/90',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
  },
};

export const KeywordsStage: React.FC<KeywordsStageProps> = ({
  chapters,
  selectedKeywordIds,
  onToggleKeyword,
  onSelectAll,
  onDeselectAll,
  questionsPerKeyword,
  setQuestionsPerKeyword,
  onGenerateQuestions,
  onBack,
  isLoading,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Flatten keywords
  const allKeywords = chapters.flatMap((c) => c.keywords);
  const selectedCount = selectedKeywordIds.length;

  const getCategoryInfo = (cat: string) => {
    return CATEGORY_CONFIG[cat] || {
      label: cat,
      icon: Sparkles,
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
    };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Info Banner */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Kết quả trích xuất từ khóa cốt lõi</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Chọn các từ khóa trọng tâm để <span className="text-violet-600">tạo câu hỏi</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Đã phát hiện <span className="font-bold text-slate-800">{allKeywords.length} từ khóa</span> từ tác phẩm. Bạn hãy tick chọn những nội dung muốn luyện tập.
          </p>
        </div>

        {/* Quick Select Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onSelectAll}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4 text-violet-500" />
            <span>Chọn tất cả</span>
          </button>

          <button
            onClick={onDeselectAll}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Square className="w-4 h-4 text-slate-400" />
            <span>Bỏ chọn hết</span>
          </button>
        </div>
      </div>

      {/* Filter Category Bar & Density Settings */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 pr-2">
            <Filter className="w-4 h-4" />
            <span>Lọc:</span>
          </div>

          <button
            onClick={() => setActiveCategoryFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategoryFilter === 'ALL'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-white/70 text-slate-600 hover:bg-white border border-white/80'
            }`}
          >
            Tất cả ({allKeywords.length})
          </button>

          {Object.entries(CATEGORY_CONFIG).map(([catKey, config]) => {
            const count = allKeywords.filter((k) => k.category === catKey).length;
            if (count === 0) return null;

            const Icon = config.icon;
            const isActive = activeCategoryFilter === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setActiveCategoryFilter(catKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white/70 text-slate-600 hover:bg-white border border-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{config.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Questions Density Selector */}
        <div className="flex items-center gap-3 bg-violet-50/70 p-2 rounded-2xl border border-violet-100 self-end lg:self-auto">
          <span className="text-xs font-bold text-violet-800 whitespace-nowrap pl-2">
            Số câu hỏi / từ khóa:
          </span>
          <div className="flex items-center gap-1">
            {[2, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionsPerKeyword(num)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                  questionsPerKeyword === num
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white/80 text-violet-700 hover:bg-white border border-violet-100'
                }`}
              >
                {num} câu
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Chapters & Keyword Cards */}
      <div className="space-y-6">
        {chapters.map((chapter, chapIdx) => {
          const filteredKeywords = activeCategoryFilter === 'ALL'
            ? chapter.keywords
            : chapter.keywords.filter((k) => k.category === activeCategoryFilter);

          if (filteredKeywords.length === 0) return null;

          return (
            <div
              key={chapIdx}
              className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-extrabold text-xs">
                  {chapIdx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {chapter.chapter_title}
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  ({filteredKeywords.length} từ khóa)
                </span>
              </div>

              {/* Keywords Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredKeywords.map((kw) => {
                  const isSelected = selectedKeywordIds.includes(kw.id);
                  const catInfo = getCategoryInfo(kw.category);
                  const CatIcon = catInfo.icon;

                  return (
                    <div
                      key={kw.id}
                      onClick={() => onToggleKeyword(kw.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 backdrop-blur-sm transition-all duration-200 select-none flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-white/90 border-violet-500 shadow-md shadow-violet-100/50 ring-2 ring-violet-400/20'
                          : 'bg-white/60 border-white/80 hover:border-violet-200 hover:bg-white/80 shadow-2xs'
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs">
                            <CheckSquare className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-lg border-2 border-slate-300 bg-white" />
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-extrabold text-slate-800 truncate">
                            {kw.word}
                          </h4>

                          {/* Category Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${catInfo.bg} ${catInfo.text} ${catInfo.border}`}
                          >
                            <CatIcon className="w-3 h-3" />
                            <span>{catInfo.label}</span>
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {kw.context_brief}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls Bar */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại nhập liệu</span>
        </button>

        <button
          onClick={onGenerateQuestions}
          disabled={selectedCount === 0 || isLoading}
          className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-98 ${
            selectedCount > 0 && !isLoading
              ? 'bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white shadow-violet-200 cursor-pointer'
              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <FileSignature className="w-5 h-5 animate-spin" />
              <span>Đang biên soạn câu hỏi...</span>
            </>
          ) : (
            <>
              <FileSignature className="w-5 h-5" />
              <span>Tạo bộ câu hỏi ({selectedCount} từ khóa)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
