import { calculateTransitMoon } from './astrologyService';

interface HoroscopeTip {
  type: 'positive' | 'neutral' | 'negative';
  text: string;
  vibe: string;
}

const FALLBACK_TIPS: Record<string, HoroscopeTip> = {
  Conjunction: {
    type: 'positive',
    text: 'Сегодня Луна соединяется с вашим Солнцем. Это день мощного обновления энергии. Начинайте новые дела и верьте в себя! Отличное время для самовыражения и реализации личных амбиций.',
    vibe: 'Энергия и Начала'
  },
  Opposition: {
    type: 'negative',
    text: 'Луна в оппозиции к вашему Солнцу. Возможен внутренний конфликт или споры с окружающими. Лучше отдохнуть и не спорить с боссом.',
    vibe: 'Баланс и Терпение'
  },
  Trine: {
    type: 'positive',
    text: 'Гармоничный трин Луны к вашему Солнцу. Все дела спорятся, а удача сама идет в руки. Отличное время для творчества и любви.',
    vibe: 'Гармония и Удача'
  },
  Square: {
    type: 'negative',
    text: 'Луна в квадрате к вашему Солнцу. Напряженный день. Избегайте импульсивных решений и берегите нервную систему.',
    vibe: 'Вызов и Выдержка'
  },
  Sextile: {
    type: 'positive',
    text: 'Благоприятный секстиль Луны. Хороший день для общения, новых знакомств и обмена идеями. Будьте открыты миру.',
    vibe: 'Общение и Возможности'
  },
  Neutral: {
    type: 'neutral',
    text: 'Сегодня спокойный день. Звезды не дают резких указаний, так что просто следуйте своему обычному ритму.',
    vibe: 'Спокойствие и Рутина'
  }
};

const ZODIAC_SIGNS_RU = {
  Aries: 'Овен', Taurus: 'Телец', Gemini: 'Близнецы', Cancer: 'Рак', 
  Leo: 'Лев', Virgo: 'Дева', Libra: 'Весы', Scorpio: 'Скорпион', 
  Sagittarius: 'Стрелец', Capricorn: 'Козерог', Aquarius: 'Водолей', Pisces: 'Рыбы'
};

const getZodiacSign = (longitude: number) => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[Math.floor(longitude / 30)];
};

export async function getDailyHoroscope(natalSunLongitude: number): Promise<HoroscopeTip> {
  const transitMoon = await calculateTransitMoon(new Date());
  const sign = getZodiacSign(natalSunLongitude);
  const signRu = ZODIAC_SIGNS_RU[sign as keyof typeof ZODIAC_SIGNS_RU] || sign;
  const transitMoonSignRu = ZODIAC_SIGNS_RU[transitMoon.sign as keyof typeof ZODIAC_SIGNS_RU] || transitMoon.sign;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const modelName = "gemini-3-flash-preview";

      const prompt = `Сгенерируй персонализированный гороскоп на сегодня для знака ${signRu}. 
Учти текущий транзит Луны (в знаке ${transitMoonSignRu}).
Тон: мистический, глубинный, поддерживающий.
Верни ТОЛЬКО JSON: { "vibe": "название энергии (1-2 слова)", "text": "гороскоп (2-3 предложения)" }`;

      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      if (result.text) {
        const data = JSON.parse(result.text);
        return {
          type: 'neutral',
          text: data.text,
          vibe: data.vibe
        };
      }
    } catch (error) {
      console.error("Client-side horoscope generation error:", error);
    }
  }

  // Fallback to aspect-based logic if AI fails or no key
  console.log("🌌 Using aspect-based fallback for horoscope");
  const diff = Math.abs(transitMoon.longitude - natalSunLongitude);
  const angle = diff > 180 ? 360 - diff : diff;
  
  const majorAspects = [
    { name: 'Conjunction', angle: 0, orb: 10 },
    { name: 'Opposition', angle: 180, orb: 10 },
    { name: 'Trine', angle: 120, orb: 8 },
    { name: 'Square', angle: 90, orb: 8 },
    { name: 'Sextile', angle: 60, orb: 6 }
  ];

  let foundAspect = 'Neutral';
  for (const aspect of majorAspects) {
    if (Math.abs(angle - aspect.angle) <= aspect.orb) {
      foundAspect = aspect.name;
      break;
    }
  }

  return FALLBACK_TIPS[foundAspect];
}
