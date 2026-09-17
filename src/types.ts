export type Stage = 'INPUT' | 'KEYWORDS' | 'QUESTIONS' | 'EVALUATION' | 'REPORT';

export type CategoryType = 'NHAN_VAT' | 'BIEN_CO' | 'NGHE_THUAT' | 'TU_THUONG';

export type QuestionLevel = 'CO_BAN' | 'NANG_CAO';

export interface Keyword {
  id: string;
  word: string;
  category: CategoryType | string;
  context_brief: string;
  selected?: boolean;
}

export interface ChapterKeywords {
  chapter_title: string;
  keywords: Keyword[];
}

export interface ExtractKeywordsResponse {
  state: string;
  ocr_applied: boolean;
  processing_mode: string;
  chapters: ChapterKeywords[];
}

export interface QuestionItem {
  question_id: string;
  level: QuestionLevel | string;
  question_text: string;
}

export interface KeywordQuestions {
  keyword_id: string;
  keyword: string;
  questions: QuestionItem[];
}

export interface GenerateQuestionsResponse {
  state: string;
  questions_data: KeywordQuestions[];
}

export interface EvaluationResult {
  question_id: string;
  percentage_score: number;
  correct_points: string[];
  missing_points: string[];
  standard_answer: string;
}

export interface EvaluationSummary {
  overall_score: number;
  teacher_feedback: string;
}

export interface EvaluateAnswersResponse {
  state: string;
  summary: EvaluationSummary;
  results: EvaluationResult[];
}

export interface ExportReportResponse {
  state: string;
  markdown_content: string;
}

export interface SampleText {
  id: string;
  title: string;
  author: string;
  genre: string;
  content: string;
}

export interface ImageFileItem {
  id: string;
  name: string;
  size: number;
  base64: string;
  mimeType: string;
  previewUrl: string;
}
