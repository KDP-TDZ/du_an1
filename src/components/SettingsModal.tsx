import React, { useState, useEffect } from 'react';
import { Settings, Key, CheckCircle2, Trash2, X, ShieldAlert, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('eduv_gemini_api_key') || '';
      setApiKey(saved);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem('eduv_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('eduv_gemini_api_key');
    }
    onSaveKey(trimmed);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    localStorage.removeItem('eduv_gemini_api_key');
    setApiKey('');
    onSaveKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow ornament */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-violet-300/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-300/30 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Cấu hình API Key</h3>
              <p className="text-xs text-slate-500">Tùy chọn Custom Gemini API Key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-4">
          <div className="p-3.5 bg-violet-50/80 border border-violet-100 rounded-2xl text-xs text-violet-800 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>Chế độ API Key tùy chỉnh</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Mặc định EduVăn AI Engine sử dụng System API Key. Bạn có thể nhập Gemini API Key riêng của mình để tránh các giới hạn lượt gọi hoặc lỗi 429 khi hệ thống quá tải.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm font-mono text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 transition-all placeholder:text-slate-300"
              />
              {apiKey && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-1"
                  title="Xóa Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Key được lưu bảo mật trong LocalStorage của trình duyệt và chỉ dùng để gửi tới server của ứng dụng.
            </p>
          </div>
        </div>

        {/* Saved Success Toast */}
        {showSavedToast && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã lưu cấu hình API Key thành công!</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-200 transition-all active:scale-95"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};
