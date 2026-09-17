import { GoogleGenAI, Type } from '@google/genai';

// Helper to get client-side GoogleGenAI instance
const getClientAi = (apiKey: string) => {
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
  });
};

// Retry helper for client-side API calls
const clientGenerateWithRetry = async (client: GoogleGenAI, config: any, maxRetries = 2) => {
  let lastError: any = null;
  const totalAttempts = maxRetries + 1;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      return await client.models.generateContent({
        ...config,
        model: 'gemini-3.6-flash',
      });
    } catch (error: any) {
      lastError = error;
      if (attempt < totalAttempts) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
        continue;
      }
    }
  }

  let msg = 'Đã xảy ra lỗi khi gọi Gemini API từ trình duyệt.';
  if (lastError) {
    const raw = lastError.message || '';
    if (raw.toLowerCase().includes('api key') || raw.includes('401') || raw.includes('403')) {
      msg = 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong phần Cài đặt.';
    } else if (raw.toLowerCase().includes('quota') || raw.includes('429')) {
      msg = 'API Key của bạn đã đạt giới hạn lượt sử dụng. Vui lòng thử lại sau.';
    } else if (raw) {
      msg = raw;
    }
  }
  throw new Error(msg);
};

export const clientExtractKeywords = async (
  apiKey: string,
  textContent: string,
  imageFiles: Array<{ base64: string; mimeType?: string }>,
  processingMode: string
) => {
  const client = getClientAi(apiKey);
  const parts: any[] = [];

  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((img) => {
      if (img && img.base64) {
        parts.push({
          inlineData: {
            data: img.base64.replace(/^data:image\/\w+;base64,/, ''),
            mimeType: img.mimeType || 'image/png',
          },
        });
      }
    });
  }

  if (textContent) {
    parts.push({ text: `Văn bản tác phẩm cần phân tích:\n${textContent}` });
  }

  parts.push({ text: `Chế độ xử lý: ${processingMode || 'STANDARD'}` });

  const response = await clientGenerateWithRetry(client, {
    contents: { parts },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          state: { type: Type.STRING },
          ocr_applied: { type: Type.BOOLEAN },
          processing_mode: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                chapter_title: { type: Type.STRING },
                keywords: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      word: { type: Type.STRING },
                      category: { type: Type.STRING },
                      context_brief: { type: Type.STRING },
                    },
                    required: ['id', 'word', 'category', 'context_brief'],
                  },
                },
              },
              required: ['chapter_title', 'keywords'],
            },
          },
        },
        required: ['state', 'ocr_applied', 'processing_mode', 'chapters'],
      },
      systemInstruction: `Bạn là chuyên gia nghiên cứu Văn học Việt Nam. Nhiệm vụ của bạn là đọc hiểu tác phẩm văn học được cung cấp (văn bản hoặc OCR từ ảnh), chia tác phẩm thành các chương/đoạn hợp lý và trích xuất từ khóa cốt lõi. Mọi từ khóa gán vào danh mục: NHAN_VAT, BIEN_CO, NGHE_THUAT, hoặc TU_THUONG kèm tóm tắt ngắn gọn.

QUY TẮC BẮT BUỘC VỀ DẤU TIẾNG VIỆT:
1. TẤT CẢ văn bản trả về (chapter_title, word, context_brief) BẮT BUỘC PHẢI DÙNG TIẾNG VIỆT CÓ DẤU ĐẦY ĐỦ VÀ ĐÚNG CHÍNH TẢ.
2. TUYỆT ĐỐI CẤM xuất ra tiếng Việt không dấu hoặc chữ ASCII không dấu dưới mọi hình thức.
3. Trả về kết quả cô đọng, súc tích để phản hồi cực nhanh. Tuyệt đối KHÔNG dùng emoji.`,
    },
  });

  return JSON.parse(response.text.trim());
};

export const clientGenerateQuestions = async (
  apiKey: string,
  selectedKeywords: any[],
  questionsPerKeyword: number
) => {
  const client = getClientAi(apiKey);
  const prompt = `Danh sách từ khóa lựa chọn:\n${JSON.stringify(selectedKeywords)}\nSố câu hỏi mỗi từ khóa: ${questionsPerKeyword || 2}`;

  const response = await clientGenerateWithRetry(client, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          state: { type: Type.STRING },
          questions_data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keyword_id: { type: Type.STRING },
                keyword: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question_id: { type: Type.STRING },
                      level: { type: Type.STRING },
                      question_text: { type: Type.STRING },
                    },
                    required: ['question_id', 'level', 'question_text'],
                  },
                },
              },
              required: ['keyword_id', 'keyword', 'questions'],
            },
          },
        },
        required: ['state', 'questions_data'],
      },
      systemInstruction: `Bạn là chuyên gia biên soạn đề thi môn Văn học. Dựa vào danh sách từ khóa được chọn, hãy tạo bộ câu hỏi tự luận sắc bén. Mỗi từ khóa tạo đúng số lượng câu hỏi yêu cầu. Cấu trúc câu hỏi gồm 50% CƠ BẢN (CO_BAN) và 50% NÂNG CAO (NANG_CAO). Tuyệt đối KHÔNG cung cấp đáp án hay gợi ý ở bước này.

QUY TẮC BẮT BUỘC VỀ DẤU TIẾNG VIỆT:
1. TẤT CẢ câu hỏi (keyword, question_text) BẮT BUỘC PHẢI DÙNG TIẾNG VIỆT CÓ DẤU ĐẦY ĐỦ VÀ ĐÚNG CHÍNH TẢ.
2. TUYỆT ĐỐI CẤM xuất ra tiếng Việt không dấu.
3. Trả về kết quả cô đọng, đi thẳng vào câu hỏi để phản hồi nhanh nhất. Tuyệt đối KHÔNG dùng emoji.`,
    },
  });

  return JSON.parse(response.text.trim());
};

export const clientEvaluateAnswers = async (apiKey: string, userAnswers: any) => {
  const client = getClientAi(apiKey);
  const prompt = `Danh sách câu hỏi và câu trả lời của học sinh:\n${JSON.stringify(userAnswers)}`;

  const response = await clientGenerateWithRetry(client, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          state: { type: Type.STRING },
          summary: {
            type: Type.OBJECT,
            properties: {
              overall_score: { type: Type.NUMBER },
              teacher_feedback: { type: Type.STRING },
            },
            required: ['overall_score', 'teacher_feedback'],
          },
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question_id: { type: Type.STRING },
                percentage_score: { type: Type.NUMBER },
                correct_points: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                missing_points: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                standard_answer: { type: Type.STRING },
              },
              required: ['question_id', 'percentage_score', 'correct_points', 'missing_points', 'standard_answer'],
            },
          },
        },
        required: ['state', 'summary', 'results'],
      },
      systemInstruction: `Bạn là giám khảo chấm bài môn Văn học. Phân tích bài làm học sinh, chấm tỷ lệ phần trăm chính xác (0-100%), đưa ra các ý đúng, ý thiếu và đáp án mẫu chuẩn.

QUY TẮC BẮT BUỘC VỀ DẤU TIẾNG VIỆT:
1. TẤT CẢ nhận xét, ý đúng, ý thiếu, đáp án chuẩn (teacher_feedback, correct_points, missing_points, standard_answer) BẮT BUỘC PHẢI DÙNG TIẾNG VIỆT CHUẨN CÓ DẤU ĐẦY ĐỦ.
2. CẤM BẢO GIỜ dùng tiếng Việt không dấu hoặc bỏ dấu.
3. Trả về câu từ cô đọng, súc tích, đi thẳng vào trọng tâm kiến thức để phản hồi nhanh nhất. Tuyệt đối KHÔNG dùng emoji.`,
    },
  });

  return JSON.parse(response.text.trim());
};

export const clientExportReport = async (
  apiKey: string,
  textTitle: string,
  questionsData: any,
  evaluationResults: any
) => {
  const client = getClientAi(apiKey);
  const prompt = `Tổng hợp báo cáo học tập môn Văn học từ dữ liệu:\nTên tác phẩm: ${textTitle || 'Tác phẩm Văn học'}\nCâu hỏi: ${JSON.stringify(questionsData)}\nKết quả chấm điểm: ${JSON.stringify(evaluationResults)}`;

  const response = await clientGenerateWithRetry(client, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          state: { type: Type.STRING },
          markdown_content: { type: Type.STRING },
        },
        required: ['state', 'markdown_content'],
      },
      systemInstruction: `Bạn là chuyên viên biên soạn báo cáo học tập môn Văn học. Chuyển đổi dữ liệu phân tích và kết quả chấm điểm thành báo cáo Markdown hoàn chỉnh, sinh động, chuẩn cấu trúc.

QUY TẮC BẮT BUỘC VỀ DẤU TIẾNG VIỆT:
1. TẤT CẢ nội dung báo cáo Markdown BẮT BUỘC PHẢI DÙNG TIẾNG VIỆT CHUẨN CÓ DẤU ĐẦY ĐỦ.
2. TUYỆT ĐỐI KHÔNG trả về chữ tiếng Việt không dấu.
3. Trả về báo cáo súc tích, chuyên nghiệp, phản hồi cực nhanh. Tuyệt đối KHÔNG dùng emoji.`,
    },
  });

  return JSON.parse(response.text.trim());
};
