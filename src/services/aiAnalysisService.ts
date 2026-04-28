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
    const response = await fetch('/api/generate-deep-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ natalData, mbti }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("AI Analysis error details:", error);
    throw error;
  }
}
