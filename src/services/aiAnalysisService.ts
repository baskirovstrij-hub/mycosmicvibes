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
  try {
    console.log("🚀 Calling API: /api/generate-deep-analysis");
    const response = await fetch('/api/generate-deep-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ natalData, mbti }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Expected JSON from analysis but got:", text.substring(0, 100));
      if (text.toLowerCase().includes("<!doctype html>") || text.toLowerCase().includes("<html")) {
        throw new Error("Сервер вернул HTML вместо данных. Похоже, сервер перезагружается или произошла ошибка маршрутизации.");
      }
      throw new Error(`Server returned non-JSON response (${response.status}).`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("AI Analysis error details:", error);
    if (error.message?.includes("API key not valid") || error.message?.includes("API key expired") || error.message?.includes("key not configured")) {
      throw new Error("Ошибка конфигурации API ключа. Встроенный бесплатный ключ устарел или не настроен. Зайдите в Settings и укажите свой личный VITE_GEMINI_API_KEY.");
    }
    throw error;
  }
}
