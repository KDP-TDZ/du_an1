import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { InputStage } from './components/InputStage';
import { KeywordsStage } from './components/KeywordsStage';
import { QuestionsStage } from './components/QuestionsStage';
import { EvaluationStage } from './components/EvaluationStage';
import { ReportStage } from './components/ReportStage';

import {
  Stage,
  ImageFileItem,
  ChapterKeywords,
  Keyword,
  KeywordQuestions,
  EvaluationSummary,
  EvaluationResult,
} from './types';

import { AlertCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  // 1. Core State Machine Stage
  const [stage, setStage] = useState<Stage>('INPUT');

  // 2. Input Stage States
  const [textContent, setTextContent] = useState('');
  const [imageFiles, setImageFiles] = useState<ImageFileItem[]>([]);
  const [processingMode, setProcessingMode] = useState<'STANDARD' | 'DEEP'>('STANDARD');

  // 3. Keywords Stage States
  const [chapters, setChapters] = useState<ChapterKeywords[]>([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
  const [questionsPerKeyword, setQuestionsPerKeyword] = useState<number>(2);

  // 4. Questions Stage States
  const [questionsData, setQuestionsData] = useState<KeywordQuestions[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // 5. Evaluation & Report Stage States
  const [evaluationSummary, setEvaluationSummary] = useState<EvaluationSummary | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [singleEvaluationResults, setSingleEvaluationResults] = useState<Record<string, EvaluationResult>>({});
  const [markdownReport, setMarkdownReport] = useState('');

  // 6. UI & Lock States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Synchronous Locks (JavaScript Memory Context)
  const isRequesting = useRef(false);
  const evaluatingRef = useRef<Record<string, boolean>>({});
  const [evaluatingSingleMap, setEvaluatingSingleMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('eduv_gemini_api_key');
    setHasApiKey(!!(saved && saved.trim() !== ''));
  }, []);

  // Compute Unlocked Stages
  const unlockedStages: Stage[] = ['INPUT'];
  if (chapters.length > 0) unlockedStages.push('KEYWORDS');
  if (questionsData.length > 0) unlockedStages.push('QUESTIONS');
  if (evaluationSummary !== null || evaluationResults.length > 0) unlockedStages.push('EVALUATION');
  if (markdownReport !== '') unlockedStages.push('REPORT');

  // Standard API Request Wrapper
  const apiRequest = async (endpoint: string, body: any) => {
    if (isRequesting.current) {
      return Promise.reject(new Error("Request in progress"));
    }

    isRequesting.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const savedKey = localStorage.getItem('eduv_gemini_api_key');
      if (savedKey && savedKey.trim() !== '') {
        headers['x-gemini-api-key'] = savedKey.trim();
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Lỗi từ server (${response.status})`);
      }

      return await response.json();
    } catch (err: any) {
      if (err.message !== "Request in progress") {
        setError(err.message || 'Đã xảy ra lỗi khi gửi yêu cầu.');
      }
      throw err;
    } finally {
      setIsLoading(false);
      isRequesting.current = false;
    }
  };

  // Stage 1 -> 2: Extract Keywords
  const handleExtractKeywords = async () => {
    if (!textContent.trim() && imageFiles.length === 0) return;

    try {
      const data = await apiRequest('/api/extract-keywords', {
        text_content: textContent,
        image_files: imageFiles.map((f) => ({
          base64: f.base64,
          mimeType: f.mimeType,
        })),
        processing_mode: processingMode,
      });

      if (data.chapters && Array.isArray(data.chapters)) {
        setChapters(data.chapters);
        // Pre-select all keywords by default
        const allIds = data.chapters.flatMap((c: ChapterKeywords) => c.keywords.map((k: Keyword) => k.id));
        setSelectedKeywordIds(allIds);
        setStage('KEYWORDS');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      // Error handled in apiRequest
    }
  };

  // Toggle Keyword Selection
  const handleToggleKeyword = (id: string) => {
    setSelectedKeywordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllKeywords = () => {
    const allIds = chapters.flatMap((c) => c.keywords.map((k) => k.id));
    setSelectedKeywordIds(allIds);
  };

  const handleDeselectAllKeywords = () => {
    setSelectedKeywordIds([]);
  };

  // Stage 2 -> 3: Generate Questions
  const handleGenerateQuestions = async () => {
    if (selectedKeywordIds.length === 0) return;

    const allKeywords = chapters.flatMap((c) => c.keywords);
    const selectedKeywords = allKeywords.filter((k) => selectedKeywordIds.includes(k.id));

    try {
      const data = await apiRequest('/api/generate-questions', {
        selected_keywords: selectedKeywords,
        questions_per_keyword: questionsPerKeyword,
      });

      if (data.questions_data && Array.isArray(data.questions_data)) {
        setQuestionsData(data.questions_data);
        setStage('QUESTIONS');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      // Error handled in apiRequest
    }
  };

  // Answer change handler
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Single Question Evaluation
  const handleEvaluateSingle = async (questionId: string) => {
    const answerText = answers[questionId];
    if (!answerText || !answerText.trim()) return;

    // Synchronous lock check for single question
    if (evaluatingRef.current[questionId]) return;

    evaluatingRef.current[questionId] = true;
    setEvaluatingSingleMap((prev) => ({ ...prev, [questionId]: true }));
    setError(null);

    try {
      // Find question details
      let foundQuestionText = '';
      questionsData.forEach((kq) => {
        kq.questions.forEach((q) => {
          if (q.question_id === questionId) {
            foundQuestionText = q.question_text;
          }
        });
      });

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const savedKey = localStorage.getItem('eduv_gemini_api_key');
      if (savedKey && savedKey.trim() !== '') {
        headers['x-gemini-api-key'] = savedKey.trim();
      }

      const response = await fetch('/api/evaluate-answers', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_answers: [
            {
              question_id: questionId,
              question_text: foundQuestionText,
              student_answer: answerText,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Không thể chấm điểm câu hỏi này');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const resultItem = data.results[0];
        setSingleEvaluationResults((prev) => ({
          ...prev,
          [questionId]: resultItem,
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi chấm điểm câu hỏi');
    } finally {
      evaluatingRef.current[questionId] = false;
      setEvaluatingSingleMap((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Stage 3 -> 4: Evaluate All Answers
  const handleEvaluateAll = async () => {
    const questionsWithAnswers: any[] = [];
    questionsData.forEach((kq) => {
      kq.questions.forEach((q) => {
        const studentAns = answers[q.question_id] || '';
        if (studentAns.trim().length > 0) {
          questionsWithAnswers.push({
            question_id: q.question_id,
            question_text: q.question_text,
            student_answer: studentAns,
          });
        }
      });
    });

    if (questionsWithAnswers.length === 0) return;

    try {
      const data = await apiRequest('/api/evaluate-answers', {
        user_answers: questionsWithAnswers,
      });

      if (data.summary && data.results) {
        setEvaluationSummary(data.summary);
        setEvaluationResults(data.results);
        setStage('EVALUATION');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      // Error handled in apiRequest
    }
  };

  // Stage 4 -> 5: Export Markdown Report
  const handleExportReport = async () => {
    if (!evaluationSummary || evaluationResults.length === 0) return;

    try {
      // Try to get work title
      const sampleMatch = textContent ? textContent.slice(0, 30) : 'Tác phẩm Ngữ văn';

      const data = await apiRequest('/api/export-report', {
        text_title: sampleMatch,
        questions_data: questionsData,
        evaluation_results: evaluationResults,
      });

      if (data.markdown_content) {
        setMarkdownReport(data.markdown_content);
        setStage('REPORT');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      // Error handled in apiRequest
    }
  };

  // Reset Application
  const handleReset = () => {
    if (stage !== 'INPUT') {
      if (confirm('Bạn có chắc muốn làm lại từ đầu không? Toàn bộ dữ liệu vừa tạo sẽ xóa.')) {
        setStage('INPUT');
        setTextContent('');
        setImageFiles([]);
        setChapters([]);
        setSelectedKeywordIds([]);
        setQuestionsData([]);
        setAnswers({});
        setEvaluationSummary(null);
        setEvaluationResults([]);
        setSingleEvaluationResults({});
        setMarkdownReport('');
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-pink-50 to-teal-50 min-h-screen flex flex-col text-slate-800 selection:bg-fuchsia-200 relative overflow-hidden">
      
      {/* Glassmorphic Sticky Navigation Header */}
      <Header
        currentStage={stage}
        onSelectStage={(targetStage) => {
          setStage(targetStage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unlockedStages={unlockedStages}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={handleReset}
        hasApiKey={hasApiKey}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Global Error Notification Alert Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50/90 border border-rose-200 rounded-2xl shadow-sm text-rose-800 flex items-start justify-between gap-3 animate-fade-in backdrop-blur-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Thông báo lỗi hệ thống:</h4>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Stage Rendering */}
        {stage === 'INPUT' && (
          <InputStage
            textContent={textContent}
            setTextContent={setTextContent}
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            processingMode={processingMode}
            setProcessingMode={setProcessingMode}
            onSubmit={handleExtractKeywords}
            isLoading={isLoading}
          />
        )}

        {stage === 'KEYWORDS' && (
          <KeywordsStage
            chapters={chapters}
            selectedKeywordIds={selectedKeywordIds}
            onToggleKeyword={handleToggleKeyword}
            onSelectAll={handleSelectAllKeywords}
            onDeselectAll={handleDeselectAllKeywords}
            questionsPerKeyword={questionsPerKeyword}
            setQuestionsPerKeyword={setQuestionsPerKeyword}
            onGenerateQuestions={handleGenerateQuestions}
            onBack={() => setStage('INPUT')}
            isLoading={isLoading}
          />
        )}

        {stage === 'QUESTIONS' && (
          <QuestionsStage
            questionsData={questionsData}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onEvaluateSingle={handleEvaluateSingle}
            onEvaluateAll={handleEvaluateAll}
            onBack={() => setStage('KEYWORDS')}
            isLoadingAll={isLoading}
            evaluatingSingleMap={evaluatingSingleMap}
            singleEvaluationResults={singleEvaluationResults}
          />
        )}

        {stage === 'EVALUATION' && evaluationSummary && (
          <EvaluationStage
            summary={evaluationSummary}
            results={evaluationResults}
            questionsData={questionsData}
            onExportReport={handleExportReport}
            onEditAnswers={() => setStage('QUESTIONS')}
            isLoadingReport={isLoading}
          />
        )}

        {stage === 'REPORT' && (
          <ReportStage
            markdownContent={markdownReport}
            onRestart={handleReset}
          />
        )}

      </main>

      {/* Glassmorphic Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKey={(key) => setHasApiKey(!!(key && key.trim() !== ''))}
      />

      {/* Fixed Footer with required signature */}
      <Footer />

    </div>
  );
};

export default App;
