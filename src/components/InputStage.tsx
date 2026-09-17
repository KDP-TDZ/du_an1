import React, { useState } from 'react';
import { FileText, Upload, BrainCircuit, BookOpen, Trash2, Image as ImageIcon, Sparkles, AlertCircle, ArrowRight, Layers } from 'lucide-react';
import { SAMPLE_TEXTS } from '../data/samples';
import { ImageFileItem, SampleText } from '../types';

interface InputStageProps {
  textContent: string;
  setTextContent: (text: string) => void;
  imageFiles: ImageFileItem[];
  setImageFiles: React.Dispatch<React.SetStateAction<ImageFileItem[]>>;
  processingMode: 'STANDARD' | 'DEEP';
  setProcessingMode: (mode: 'STANDARD' | 'DEEP') => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const InputStage: React.FC<InputStageProps> = ({
  textContent,
  setTextContent,
  imageFiles,
  setImageFiles,
  processingMode,
  setProcessingMode,
  onSubmit,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'TEXT' | 'IMAGE'>('TEXT');
  const [dragOver, setDragOver] = useState(false);

  // Handle sample selection
  const handleSelectSample = (sample: SampleText) => {
    setTextContent(sample.content);
    setActiveTab('TEXT');
  };

  // Handle image upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newItem: ImageFileItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          base64: result,
          mimeType: file.type,
          previewUrl: result,
        };
        setImageFiles((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImageFiles((prev) => prev.filter((img) => img.id !== id));
  };

  const canSubmit = (textContent.trim().length > 0 || imageFiles.length > 0) && !isLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Welcome Banner */}
      <div className="bg-white/70 backdrop-blur-md border border-white/80 shadow-md rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-violet-200/40 via-fuchsia-200/30 to-teal-200/40 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/90 text-violet-700 text-xs font-bold border border-violet-200/60 shadow-2xs">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Phân tích văn học chuẩn Quốc gia</span>
          </div>

          {/* Frameless Colorful & Bold Made by Tuấn Khang Text */}
          <div className="flex items-center gap-2 cursor-default select-none group self-start sm:self-auto py-1">
            <Sparkles className="w-5 h-5 text-fuchsia-500 fill-fuchsia-400 animate-pulse shrink-0" />
            <span className="text-base sm:text-lg font-black tracking-wider uppercase bg-gradient-to-r from-violet-600 via-fuchsia-500 to-teal-500 bg-clip-text text-transparent drop-shadow-xs group-hover:scale-105 transition-transform duration-200">
              Made by Tuấn Khang
            </span>
          </div>
        </div>

        <div className="max-w-3xl space-y-3 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Khám phá chiều sâu tác phẩm <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-teal-600 bg-clip-text text-transparent">Văn học Việt Nam</span>
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Nhập văn bản trích đoạn hoặc tải ảnh chụp trang sách. Hệ thống AI sẽ tự động phân tích cấu trúc, trích xuất từ khóa trọng tâm, sinh bộ câu hỏi phân hóa và chấm điểm tự luận theo tiêu chuẩn quốc gia.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="mt-6 pt-6 border-t border-slate-100 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <BookOpen className="w-4 h-4 text-violet-500" />
            <span>Thử nhanh tác phẩm mẫu trong chương trình:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="px-3.5 py-2 rounded-xl bg-white/70 hover:bg-white border border-white/80 hover:border-violet-300 text-slate-700 hover:text-violet-700 text-xs font-medium transition-all shadow-2xs hover:shadow-xs active:scale-95 flex items-center gap-2"
              >
                <span className="font-bold text-violet-600">{sample.title}</span>
                <span className="text-slate-400">({sample.author})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Input Form Container */}
      <div className="bg-white/55 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Input Method Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('TEXT')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'TEXT'
                ? 'bg-white text-violet-700 shadow-sm border border-white/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Văn bản thuần</span>
            {textContent.trim().length > 0 && (
              <span className="w-2 h-2 rounded-full bg-violet-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('IMAGE')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'IMAGE'
                ? 'bg-white text-violet-700 shadow-sm border border-white/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Tải ảnh trang sách (OCR)</span>
            {imageFiles.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-extrabold">
                {imageFiles.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Text Area */}
        {activeTab === 'TEXT' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nội dung văn bản tác phẩm
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {textContent.length} ký tự
              </span>
            </div>
            <textarea
              rows={8}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Dán hoặc nhập trích đoạn văn bản tác phẩm Văn học vào đây (ví dụ: Chuyện người con gái Nam Xương, Chuyện chức tản viên đền Tản Viên, Vợ nhặt, Tây Tiến...)"
              className="w-full p-4 bg-white/50 focus:bg-white border border-white/80 backdrop-blur-sm rounded-2xl text-sm text-slate-800 leading-relaxed focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 transition-all placeholder:text-slate-300 resize-y"
            />
          </div>
        )}

        {/* Tab 2: OCR Image Upload */}
        {activeTab === 'IMAGE' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                dragOver
                  ? 'border-violet-400 bg-violet-50/50 scale-[0.99]'
                  : 'border-slate-200/80 bg-white/40 hover:bg-white/60 hover:border-violet-300'
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3 shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                Kéo thả ảnh trang sách vào đây
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Hỗ trợ định dạng PNG, JPG, WEBM (Tự động nhận diện chữ qua OCR)
              </p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-violet-200 active:scale-95">
                <ImageIcon className="w-4 h-4" />
                <span>Chọn tập tin ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
            </div>

            {/* Image Preview List */}
            {imageFiles.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-violet-500" />
                  <span>Danh sách ảnh đã tải lên ({imageFiles.length}):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imageFiles.map((img) => (
                    <div
                      key={img.id}
                      className="group relative bg-white/80 border border-slate-200/80 rounded-2xl p-2 flex flex-col items-center shadow-2xs overflow-hidden"
                    >
                      <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                        <img
                          src={img.previewUrl}
                          alt={img.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 truncate w-full text-center">
                        {img.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(img.size / 1024).toFixed(1)} KB
                      </p>
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-3 right-3 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Mode Selection */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chế độ xử lý AI
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Standard Mode */}
            <div
              onClick={() => setProcessingMode('STANDARD')}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all backdrop-blur-sm ${
                processingMode === 'STANDARD'
                  ? 'bg-violet-50/90 border-violet-500 ring-2 ring-violet-400/20 shadow-xs'
                  : 'bg-white/60 border-white/80 hover:border-violet-200 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  processingMode === 'STANDARD' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Tiêu chuẩn (Fast)</h4>
                  <p className="text-[11px] text-slate-500">Tối ưu tốc độ phản hồi nhanh</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-snug pl-11">
                Trích xuất nhanh các từ khóa đại diện cốt lõi theo từng đoạn chính của tác phẩm.
              </p>
            </div>

            {/* Deep Analysis Mode */}
            <div
              onClick={() => setProcessingMode('DEEP')}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all backdrop-blur-sm ${
                processingMode === 'DEEP'
                  ? 'bg-violet-50/90 border-violet-500 ring-2 ring-violet-400/20 shadow-xs'
                  : 'bg-white/60 border-white/80 hover:border-violet-200 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  processingMode === 'DEEP' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Chuyên sâu (Deep Analysis)</h4>
                  <p className="text-[11px] text-slate-500">Bao quát toàn bộ tuyến đề tài</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-snug pl-11">
                Phân tích sâu chiều sâu tâm lý nhân vật, biện pháp nghệ thuật độc đáo và tư tưởng cốt lõi.
              </p>
            </div>

          </div>
        </div>

        {/* Submit Action Area */}
        <div className="pt-4 flex items-center justify-end">
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-98 ${
              canSubmit
                ? 'bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white shadow-violet-200 cursor-pointer'
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <BrainCircuit className="w-5 h-5 animate-spin" />
                <span>Đang phân tích tác phẩm...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-5 h-5" />
                <span>Trích xuất từ khóa cốt lõi</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
