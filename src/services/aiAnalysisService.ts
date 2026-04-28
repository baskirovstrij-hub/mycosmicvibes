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
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in client environment");
    throw new Error("Конфигурация AI не найдена. Пожалуйста, убедитесь, что GEMINI_API_KEY установлен в настройках приложения.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const modelName = "gemini-3-flash-preview";
    
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
  "title": Креативное название (например, "Душевный Стратег"). НЕ используйте слова "Ядро" или "Разбор" в этом заголовке.
  "text": Синтез Солнца (${sunSign}) и доминирующих функций MBTI (${mbti}). Короткий, емкий нарратив о том, как она воспринимает мир и в чем её истинная природа.

"shadow": 
  "title": "Социальная маска и Тень",
  "text": Асцендент (${ascendantSign}) (как её видят другие) + слабые функции MBTI (что она в себе отрицает или скрывает). Контрастный анализ внутреннего и внешнего.

"growth":
  "title": "Двигатель прогресса",
  "points": 3 пункта развития на основе Сатурна (${saturnSign}) и Плутона (${plutoSign}) + точки роста ${mbti}.
    В каждом пункте строго: "thesis" (Тезис), "cause" (Причина), "solution" (Решение/Рекомендация).

"summary":
  "text": Итоговая вдохновляющая цитата-резюме (1-2 предложения), которая ставит точку в этом разборе.
`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!result.text) {
      throw new Error("AI вернул пустой ответ. Возможно, срабатывают фильтры безопасности.");
    }

    return JSON.parse(result.text);
  } catch (error: any) {
    console.error("AI Analysis error details:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("Ошибка конфигурации API ключа. Убедитесь, что GEMINI_API_KEY установлен правильно.");
    }
    throw error;
  }
}
