import { GoogleGenAI, Type } from "@google/genai";
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

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Сгенерируй персонализированный гороскоп на сегодня для знака ${signRu}. 
      Учти текущий транзит Луны (в знаке ${ZODIAC_SIGNS_RU[transitMoon.sign as keyof typeof ZODIAC_SIGNS_RU]}).
      
      Стиль: эзотерический, вдохновляющий, глубокий, в духе CosmicVibes.
      Max length: 200 characters.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Текст гороскопа" },
            vibe: { type: Type.STRING, description: "Короткая фраза - вайб дня (2-3 слова)" },
            type: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'], description: "Общий характер дня" }
          },
          required: ["text", "vibe", "type"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    if (result.text && result.vibe && result.type) {
      return result as HoroscopeTip;
    }
  } catch (error) {
    console.error("Horoscope generation error:", error);
  }

  // Fallback to aspect-based logic
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
