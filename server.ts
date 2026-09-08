import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please configure it in your environment.");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Generate Flashcards
app.post("/api/generate-cards", async (req, res) => {
  try {
    const {
      topic = "Giao tiếp hàng ngày",
      level = "B1-B2",
      count = 6,
      existingWords = [],
    } = req.body;

    const ai = getGenAI();

    const prompt = `Bạn là một giáo viên dạy tiếng Anh bản xứ xuất sắc và thân thiện dành riêng cho người Việt Nam.
Hãy tạo đúng ${count} thẻ từ vựng/cụm từ (Flashcards) tiếng Anh chất lượng cao cho người học.
Chủ đề: "${topic}"
Trình độ: ${level} (A1-A2: Cơ bản, B1-B2: Trung cấp, C1-C2: Nâng cao)
Yêu cầu:
1. Từ vựng thực tế, hữu dụng, tự nhiên trong đời sống hàng ngày hoặc công việc.
2. Tránh các từ này vì người học đã biết hoặc đã học: ${JSON.stringify(existingWords.slice(-30))}.
3. Phiên âm chuẩn IPA (ví dụ: /kəˌmjuː.nɪˈkeɪ.ʃən/).
4. Nghĩa tiếng Việt ngắn gọn, súc tích, dễ hiểu.
5. Câu ví dụ tiếng Anh thực tế, kèm bản dịch tiếng Việt mượt mà.
6. Mẹo ghi nhớ (memoryTip): Mẹo vui, liên tưởng âm thanh hoặc hình ảnh bằng tiếng Việt giúp người học nhớ siêu lâu.
7. Cụm từ hay đi kèm (collocations): 2-3 cụm từ phổ biến.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "Bạn là trợ lý AI chuyên tạo thẻ học tiếng Anh (Flashcards) cho người Việt Nam. Luôn xuất dữ liệu theo đúng JSON Schema được quy định.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicTitle: {
              type: Type.STRING,
              description: "Tiêu đề tiếng Việt ngắn gọn của bộ thẻ hôm nay",
            },
            level: {
              type: Type.STRING,
              description: "Trình độ của bộ từ",
            },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: {
                    type: Type.STRING,
                    description: "Từ hoặc cụm từ tiếng Anh (e.g., 'procrastinate', 'hit the sack')",
                  },
                  phonetic: {
                    type: Type.STRING,
                    description: "Phiên âm quốc tế IPA (e.g., '/prəˈkræs.tɪ.neɪt/')",
                  },
                  partOfSpeech: {
                    type: Type.STRING,
                    description: "Loại từ: noun, verb, adj, adv, idiom, phrasal verb",
                  },
                  vietnameseMeaning: {
                    type: Type.STRING,
                    description: "Định nghĩa và nghĩa tiếng Việt chuẩn xác",
                  },
                  exampleSentence: {
                    type: Type.STRING,
                    description: "Câu ví dụ tiếng Anh có chứa từ",
                  },
                  exampleTranslation: {
                    type: Type.STRING,
                    description: "Bản dịch tiếng Việt của câu ví dụ",
                  },
                  memoryTip: {
                    type: Type.STRING,
                    description: "Mẹo nhớ từ vựng liên tưởng hoặc nguồn gốc từ ngắn gọn bằng tiếng Việt",
                  },
                  collocations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "2-3 cụm từ hay đi kèm phổ biến",
                  },
                },
                required: [
                  "word",
                  "phonetic",
                  "partOfSpeech",
                  "vietnameseMeaning",
                  "exampleSentence",
                  "exampleTranslation",
                  "memoryTip",
                  "collocations",
                ],
              },
            },
          },
          required: ["topicTitle", "level", "cards"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Không nhận được phản hồi văn bản từ Gemini");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (err: unknown) {
    console.error("Error generating cards:", err);
    const errorMessage = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tạo thẻ";
    res.status(500).json({ error: errorMessage });
  }
});

// Check user's sentence practice
app.post("/api/check-sentence", async (req, res) => {
  try {
    const { word, userSentence } = req.body;
    if (!word || !userSentence) {
      return res.status(400).json({ error: "Thiếu từ hoặc câu luyện tập" });
    }

    const ai = getGenAI();
    const prompt = `Người học tiếng Anh đang luyện đặt câu với từ/cụm từ: "${word}".
Câu người học vừa viết: "${userSentence}"

Hãy đánh giá câu này và phản hồi bằng định dạng JSON:
1. isCorrect: boolean (true nếu câu đúng ngữ pháp và tự nhiên, false nếu có lỗi)
2. score: number (điểm từ 1 đến 10)
3. correction: string (câu sửa lại chuẩn nhất nếu có lỗi, hoặc câu gốc nếu đã chuẩn)
4. explanation: string (giải thích nhận xét bằng tiếng Việt, chỉ ra lỗi sai hoặc khen ngợi điểm tốt)
5. betterAlternative: string (1 cách diễn đạt tự nhiên hơn của người bản xứ)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            correction: { type: Type.STRING },
            explanation: { type: Type.STRING },
            betterAlternative: { type: Type.STRING },
          },
          required: ["isCorrect", "score", "correction", "explanation", "betterAlternative"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: unknown) {
    console.error("Error checking sentence:", err);
    const errorMessage = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi kiểm tra câu";
    res.status(500).json({ error: errorMessage });
  }
});

// Word deep dive / AI Explanation
app.post("/api/word-deep-dive", async (req, res) => {
  try {
    const { word, meaning } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Thiếu từ cần tra cứu" });
    }

    const ai = getGenAI();
    const prompt = `Hãy phân tích chuyên sâu từ tiếng Anh "${word}" (nghĩa: ${meaning || "tự suy luận"}) cho người học Việt Nam:
1. Nuances & sắc thái nghĩa (dùng khi nào, trang trọng hay thân mật).
2. Lỗi phổ biến người Việt hay mắc phải (commonMistake) khi dùng từ này (nhầm giới từ, dịch word-by-word, v.v.).
3. 2 từ đồng nghĩa (synonyms) và sự khác biệt nhỏ về cách dùng.
4. Một đoạn hội thoại ngắn 2 lượt thoại (dialogue) sử dụng từ này tự nhiên.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            nuance: { type: Type.STRING, description: "Sắc thái và ngữ cảnh dùng bằng tiếng Việt" },
            commonMistake: { type: Type.STRING, description: "Lỗi người Việt hay gặp khi dùng từ này" },
            synonyms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  difference: { type: Type.STRING },
                },
                required: ["word", "difference"],
              },
            },
            dialogue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  en: { type: Type.STRING },
                  vi: { type: Type.STRING },
                },
                required: ["speaker", "en", "vi"],
              },
            },
          },
          required: ["word", "nuance", "commonMistake", "synonyms", "dialogue"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: unknown) {
    console.error("Error in deep dive:", err);
    const errorMessage = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tra cứu chi tiết";
    res.status(500).json({ error: errorMessage });
  }
});

// Vite middleware or static files
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`English Flashcards AI Server running on http://localhost:${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
