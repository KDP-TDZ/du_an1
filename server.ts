import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Default client initialized with system API key
const defaultAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: { 'User-Agent': 'eduvien-ai-engine/1.0' },
  },
});

const app = express();
app.use(express.json({ limit: '50mb' }));

// Helper to get client using custom header API key if available
const getAiClient = (req: express.Request): GoogleGenAI => {
  const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;
  if (customApiKey && customApiKey.trim() !== '') {
    return new GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: { headers: { 'User-Agent': 'eduvien-ai-engine/1.0' } },
    });
  }
  return defaultAi;
};

// Retry Protocol for Gemini API
const generateContentWithRetry = async (client: GoogleGenAI, aiConfig: any, maxRetries = 2) => {
  let lastError: any = null;
  const totalAttempts = maxRetries + 1;

  const mergedConfig = {
    ...aiConfig,
    config: {
      ...aiConfig.config,
      thinkingConfig: { thinkingLevel: 'LOW' },
    },
  };

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      return await client.models.generateContent({
        ...mergedConfig,
        model: 'gemini-3.5-flash',
      });
    } catch (error: any) {
      lastError = error;
      const status = error.status || (error.response && error.response.status) || 500;
      
      let parsedError: any = {};
      try { 
        parsedError = JSON.parse(error.message); 
      } catch (e) {}
      
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCodeStr = (parsedError.error?.status || '').toUpperCase();
      
      const is503 = status === 503 || errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('overloaded');
      const isHardQuota = errorMessage.includes('quota exceeded') || errorCodeStr === 'RESOURCE_EXHAUSTED';
      const isRateLimit = status === 429 && !isHardQuota;

      if ((is503 || isRateLimit) && attempt < totalAttempts) {
        let delay = -1;
        const retryAfterHeader = error.response?.headers?.get?.('retry-after') || error.response?.headers?.['retry-after'];
        if (retryAfterHeader) {
          const parsedRetry = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsedRetry)) delay = parsedRetry * 1000;
        }
        
        if (delay === -1) {
          const baseDelay = Math.pow(2, attempt) * 1000;
          const jitter = Math.random() * 1000;
          delay = baseDelay + jitter;
        }
        
        console.log(`[AI Retry] Attempt ${attempt}/${totalAttempts} failed (${status}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      break;
    }
  }
  
  const err: any = new Error("Đã xảy ra lỗi không xác định từ AI Engine.");
  err.status = 500;

  if (lastError) {
    const status = lastError.status || (lastError.response && lastError.response.status) || 500;
    let msg = lastError.message || '';
    try {
      const parsed = JSON.parse(lastError.message);
      if (parsed.error?.message) msg = parsed.error.message;
    } catch (e) {}

    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes('503') || lowerMsg.includes('high demand') || status === 503) {
      err.message = "Hệ thống AI hiện đang quá tải (High Demand). Vui lòng đợi vài giây và thử lại.";
      err.status = 503;
    } else if (lowerMsg.includes('429') || lowerMsg.includes('quota') || status === 429) {
      err.message = "Đã vượt quá giới hạn lượt dùng API. Vui lòng cấu hình API Key riêng của bạn trong phần Cài đặt.";
      err.status = 429;
    } else if (lowerMsg.includes('401') || lowerMsg.includes('403') || lowerMsg.includes('api key') || status === 401 || status === 403) {
      err.message = "API Key không hợp lệ hoặc không có quyền truy cập.";
      err.status = 401;
    } else if (lowerMsg.includes('400') || status === 400) {
      err.message = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại nội dung văn bản đầu vào.";
      err.status = 400;
    } else {
      err.message = msg || err.message;
    }
  }
  throw err;
};

// Route 1: Extract Keywords (/api/extract-keywords)
app.post('/api/extract-keywords', async (req, res) => {
  try {
    const client = getAiClient(req);
    const { text_content, image_files, processing_mode } = req.body;
    let parts: any[] = [];

    if (image_files && Array.isArray(image_files) && image_files.length > 0) {
      image_files.forEach((img: any) => {
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

    if (text_content) {
      parts.push({ text: `Văn bản tác phẩm cần phân tích:\n${text_content}` });
    }

    parts.push({ text: `Chế độ xử lý: ${processing_mode || 'STANDARD'}` });

    const response = await generateContentWithRetry(client, {
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
                        category: { type: Type.STRING }, // NHAN_VAT | BIEN_CO | NGHE_THUAT | TU_THUONG
                        context_brief: { type: Type.STRING },
                      },
                      required: ["id", "word", "category", "context_brief"],
                    },
                  },
                },
                required: ["chapter_title", "keywords"],
              },
            },
          },
          required: ["state", "ocr_applied", "processing_mode", "chapters"],
        },
        systemInstruction: `Bạn là chuyên gia nghiên cứu Văn học Việt Nam. Nhiệm vụ của bạn là đọc hiểu tác phẩm văn học được cung cấp (văn bản hoặc OCR từ ảnh), chia tác phẩm thành các chương/đoạn hợp lý và trích xuất từ khóa cốt lõi. Mọi từ khóa gán vào danh mục: NHAN_VAT, BIEN_CO, NGHE_THUAT, hoặc TU_THUONG kèm tóm tắt ngắn gọn.

QUY TẮC BẮT BUỘC VỀ DẤU TIẾNG VIỆT:
1. TẤT CẢ văn bản trả về (chapter_title, word, context_brief) BẮT BUỘC PHẢI DÙNG TIẾNG VIỆT CÓ DẤU ĐẦY ĐỦ VÀ ĐÚNG CHÍNH TẢ (Ví dụ: "Nhân vật Ngô Tử Văn", "Đốt đền tà", "Nghệ thuật kỳ ảo").
2. TUYỆT ĐỐI CẤM xuất ra tiếng Việt không dấu hoặc chữ ASCII không dấu dưới mọi hình thức.
3. Trả về kết quả cô đọng, súc tích để phản hồi cực nhanh. Tuyệt đối KHÔNG dùng emoji.`,
      },
    });

    const parsedData = JSON.parse(response.text.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error in extract-keywords:', error.message || error);
    res.status(error.status || 500).json({ error: error.message || 'Error extracting keywords' });
  }
});

// Route 2: Generate Questions (/api/generate-questions)
app.post('/api/generate-questions', async (req, res) => {
  try {
    const client = getAiClient(req);
    const { selected_keywords, questions_per_keyword } = req.body;

    const prompt = `Danh sách từ khóa lựa chọn:\n${JSON.stringify(selected_keywords)}\nSố câu hỏi mỗi từ khóa: ${questions_per_keyword || 2}`;

    const response = await generateContentWithRetry(client, {
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
                        level: { type: Type.STRING }, // CO_BAN | NANG_CAO
                        question_text: { type: Type.STRING },
                      },
                      required: ["question_id", "level", "question_text"],
                    },
                  },
                },
                required: ["keyword_id", "keyword", "questions"],
              },
            },
          },
          required: ["state", "questions_data"],
        },
        systemInstruction: `Bạn là chuyên gia biên soạn đề thi môn Văn học. Dựa vào danh sách từ khóa được chọn, hãy tạo bộ câu hỏi tự luận sắc bén. Mỗi từ khóa tạo đúng số lượng câu hỏi yêu cầu. Cấu trúc câu hỏi gồm 50% CƠ BẢN (CO_BAN) và 50% NÂNG CAO (NANG_CAO). Tuyệt đối KHÔNG cung cấp đáp án hay gợi ý ở bước này.

QUY TẮC BẮT BUỘC VỀ DẤU TIẾNG VIỆT:
1. TẤT CẢ câu hỏi (keyword, question_text) BẮT BUỘC PHẢI DÙNG TIẾNG VIỆT CÓ DẤU ĐẦY ĐỦ VÀ ĐÚNG CHÍNH TẢ.
2. TUYỆT ĐỐI CẤM xuất ra tiếng Việt không dấu.
3. Trả về kết quả cô đọng, đi thẳng vào câu hỏi để phản hồi nhanh nhất. Tuyệt đối KHÔNG dùng emoji.`,
      },
    });

    res.json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error('Error in generate-questions:', error.message || error);
    res.status(error.status || 500).json({ error: error.message || 'Error generating questions' });
  }
});

// Route 3: Evaluate Answers (/api/evaluate-answers)
app.post('/api/evaluate-answers', async (req, res) => {
  try {
    const client = getAiClient(req);
    const { user_answers } = req.body;

    const prompt = `Danh sách câu hỏi và câu trả lời của học sinh:\n${JSON.stringify(user_answers)}`;

    const response = await generateContentWithRetry(client, {
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
                overall_score: { type: Type.NUMBER, description: "Điểm phần trăm tổng kết (0-100)" },
                teacher_feedback: { type: Type.STRING, description: "Nhận xét tổng quan của giám khảo bằng tiếng Việt có dấu" },
              },
              required: ["overall_score", "teacher_feedback"],
            },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question_id: { type: Type.STRING },
                  percentage_score: { type: Type.NUMBER, description: "Tỷ lệ phần trăm đúng (0-100)" },
                  correct_points: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Các ý đúng đã trả lời được (bằng tiếng Việt có dấu đầy đủ)",
                  },
                  missing_points: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Các ý còn thiếu hoặc chưa chính xác (bằng tiếng Việt có dấu đầy đủ)",
                  },
                  standard_answer: { type: Type.STRING, description: "Đáp án mẫu chuẩn đạt điểm tối đa (bằng tiếng Việt có dấu đầy đủ)" },
                },
                required: ["question_id", "percentage_score", "correct_points", "missing_points", "standard_answer"],
              },
            },
          },
          required: ["state", "summary", "results"],
        },
        systemInstruction: `Bạn là giám khảo chấm bài môn Văn học. Phân tích bài làm học sinh, chấm tỷ lệ phần trăm chính xác (0-100%), đưa ra các ý đúng, ý thiếu và đáp án mẫu chuẩn.

QUY TẮC BẮT BUỘC VỀ DẤU TIẾNG VIỆT:
1. TẤT CẢ nhận xét, ý đúng, ý thiếu, đáp án chuẩn (teacher_feedback, correct_points, missing_points, standard_answer) BẮT BUỘC PHẢI DÙNG TIẾNG VIỆT CHUẨN CÓ DẤU ĐẦY ĐỦ.
Ví dụ đúng: "Ngô Tử Văn tên là Soạn, người huyện Yên Dũng, đất Lạng Giang. Chàng là người nổi tiếng khảng khái, nóng nảy, cương trực, thấy sự tà gian thì không thể chịu được."
Ví dụ SAI nghiêm trọng: "Ngo Tu Van ten la Soan, nguoi huyen Yen Dung..."
2. CẤM BẢO GIỜ dùng tiếng Việt không dấu hoặc bỏ dấu.
3. Trả về câu từ cô đọng, súc tích, đi thẳng vào trọng tâm kiến thức để phản hồi nhanh nhất. Tuyệt đối KHÔNG dùng emoji.`,
      },
    });

    res.json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error('Error in evaluate-answers:', error.message || error);
    res.status(error.status || 500).json({ error: error.message || 'Error evaluating answers' });
  }
});

// Route 4: Export Report (/api/export-report)
app.post('/api/export-report', async (req, res) => {
  try {
    const client = getAiClient(req);
    const { text_title, questions_data, evaluation_results } = req.body;

    const prompt = `Tổng hợp báo cáo học tập môn Văn học từ dữ liệu:\nTên tác phẩm: ${text_title || 'Tác phẩm Văn học'}\nCâu hỏi: ${JSON.stringify(questions_data)}\nKết quả chấm điểm: ${JSON.stringify(evaluation_results)}`;

    const response = await generateContentWithRetry(client, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            state: { type: Type.STRING },
            markdown_content: { type: Type.STRING },
          },
          required: ["state", "markdown_content"],
        },
        systemInstruction: `Bạn là chuyên viên biên soạn báo cáo học tập môn Văn học. Chuyển đổi dữ liệu phân tích và kết quả chấm điểm thành báo cáo Markdown hoàn chỉnh, sinh động, chuẩn cấu trúc.

QUY TẮC BẮT BUỘC VỀ DẤU TIẾNG VIỆT:
1. TẤT CẢ nội dung báo cáo Markdown BẮT BUỘC PHẢI DÙNG TIẾNG VIỆT CHUẨN CÓ DẤU ĐẦY ĐỦ.
2. TUYỆT ĐỐI KHÔNG trả về chữ tiếng Việt không dấu.
3. Trả về báo cáo súc tích, chuyên nghiệp, phản hồi cực nhanh. Tuyệt đối KHÔNG dùng emoji.`,
      },
    });

    res.json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error('Error in export-report:', error.message || error);
    res.status(error.status || 500).json({ error: error.message || 'Error exporting report' });
  }
});

// Vite Middleware for Dev / Static serving for Production
async function startServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduVăn AI Engine Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
