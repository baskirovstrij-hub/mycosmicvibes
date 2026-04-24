import { GoogleGenAI, Type } from "@google/genai";

export interface AIAnalysisResponse {
  core: {
    title: string;
    text: string;
  };
  shadow: {
    title: string;
    text: string;
  };
  growth: {
    title: string;
    points: Array<{
      thesis: string;
      cause: string;
      solution: string;
    }>;
  };
  summary: {
    text: string;
  };
}

export async function generateDeepAnalysis(natalData: any, mbti: string): Promise<AIAnalysisResponse> {
  // Priority: VITE_ prefixed env (Standard Vite) -> process.env (AI Studio / Vite define)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error(
      "API ключ не настроен. \n\n" +
      "1. Если вы на Netlify: Добавьте переменную VITE_GEMINI_API_KEY в настройках Site Settings -> Build & deploy -> Environment.\n" +
      "2. Если вы в AI Studio: Проверьте GEMINI_API_KEY в меню Settings.\n" +
      "Ключ можно получить здесь: https://aistudio.google.com/app/apikey"
    );
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  // Extract key elements for the prompt
  const sunSign = natalData.planets?.find((p: any) => p.name === 'Sun')?.sign || 'Unknown';
  const moonSign = natalData.planets?.find((p: any) => p.name === 'Moon')?.sign || 'Unknown';
  const ascendantSign = natalData.ascendant?.sign || 'Unknown';
  const saturnSign = natalData.planets?.find((p: any) => p.name === 'Saturn')?.sign || 'Unknown';
  const plutoSign = natalData.planets?.find((p: any) => p.name === 'Pluto')?.sign || 'Unknown';

  const prompt = `
Вы — ведущий астропсихолог, помогающий девушке/женщине осознать ее жизненный путь.
Составьте "Интеллектуальную карту личности", объединяя астрологию (Натальную карту) и MBTI.

ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:
MBTI: ${mbti}
Солнце: ${sunSign}
Луна: ${moonSign}
Асцендент: ${ascendantSign}
Сатурн: ${saturnSign}
Плутон: ${plutoSign}

ВАЖНЫЕ ПРАВИЛА И ТОН:
- Ваша целевая аудитория: девушки и молодые женщины, которые ищут смыслы.
- Тон: Глубинный, астропсихологический, мистический, поддерживающий, но структурированный. Никакой излишней "воды", баланс "Структура (Dashboard) + Наполнение (Storytelling)".
- Обращайтесь к пользователю на "вы", уважительно и поддерживающе.
- Формат: Верните ТОЛЬКО валидный JSON с указанной структурой.

СТРУКТУРА ОТВЕТА (JSON):
"core": 
  "title": Креативное название, например "Ядро: Звёздный [Архетип]",
  "text": Синтез Солнца (${sunSign}) и доминирующих функций MBTI (${mbti}). Короткий, емкий нарратив о том, как она воспринимает мир и в чем её истинная природа.

"shadow": 
  "title": "Социальная маска и Тень",
  "text": Асцендент (${ascendantSign}) (как её видят другие) + слабые функции MBTI (что она в себе отрицает или скрывает). Контрастный анализ внутреннего и внешнего.

"growth":
  "title": "Двигатель прогресса",
  "points": 3 пункта развития на основе Сатурна (${saturnSign}) и Плутона (${plutoSign}) + точки роста ${mbti}.
    В каждом пункте строго: "thesis" (Тезис), "cause" (Причина), "solution" (Решение/Рекомендация).

"summary":
  "text": Финальный вывод на один абзац в стиле сторителлинга. "Ваша история — это путь от [X] к [Y]..."
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            core: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["title", "text"]
            },
            shadow: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["title", "text"]
            },
            growth: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                points: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      thesis: { type: Type.STRING },
                      cause: { type: Type.STRING },
                      solution: { type: Type.STRING }
                    },
                    required: ["thesis", "cause", "solution"]
                  }
                }
              },
              required: ["title", "points"]
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING }
              },
              required: ["text"]
            }
          },
          required: ["core", "shadow", "growth", "summary"]
        }
      }
    });

    let resultString = response.text || '';
    if (!resultString) throw new Error("Empty response from AI");
    
    // Safety: strip code blocks if AI included them despite responseMimeType
    resultString = resultString.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    
    const parsed: AIAnalysisResponse = JSON.parse(resultString);
    return parsed;
  } catch (error: any) {
    console.error("AI Analysis error details:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Ошибка конфигурации API ключа. Убедитесь, что VITE_GEMINI_API_KEY установлен.");
    }
    throw error;
  }
}
