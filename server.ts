import fs from 'fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PAYMENT_TOKEN = process.env.YOOKASSA_PROVIDER_TOKEN || process.env.PAYMENT_TOKEN;
const APP_URL = process.env.VITE_APP_URL || 'https://cosmicvibes.app';

// Standard Firebase Admin setup for server-side updates
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin (requires service account)
const SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;
let adminDb: any = null;

if (SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(SERVICE_ACCOUNT);
    let dbId = '(default)';
    
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.firestoreDatabaseId) {
          dbId = config.firestoreDatabaseId;
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not read firebase-applet-config.json, using fallback');
      dbId = 'ai-studio-c0d869ee-b27d-4fcd-b189-1349543c59f5';
    }
    
    if (process.env.FIRESTORE_DATABASE_ID) {
      dbId = process.env.FIRESTORE_DATABASE_ID;
    }

    initializeApp({
      credential: cert(serviceAccount)
    });
    
    adminDb = getAdminFirestore(dbId);
    console.log(`✅ Firebase Admin initialized with database: ${dbId}`);
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err);
  }
}

async function startServer() {
  const app = express();
  
  console.log(`[INIT] GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`[INIT] BOT_TOKEN present: ${!!process.env.TELEGRAM_BOT_TOKEN}`);

  // Simple request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Initialize Telegram Bot
  let bot: Telegraf | null = null;
  if (BOT_TOKEN) {
    bot = new Telegraf(BOT_TOKEN);

    bot.start((ctx) => {
      const firstName = ctx.from?.first_name || 'Странник';
      ctx.reply(
        `Приветствуем тебя в CosmicVibes, ${firstName}! ✨\n\nЯ — твой проводник в мир звезд и психологии. Исследуй свою натальную карту, узнай свой тип личности и получи глубокий разбор своей души.`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Запустить CosmicVibes', APP_URL)],
          [
            Markup.button.callback('✨ О функционале', 'about_features'),
            Markup.button.callback('💳 Полный разбор (100₽)', 'buy_analysis')
          ]
        ])
      );
    });

    bot.action('buy_analysis', (ctx) => {
      if (!PAYMENT_TOKEN) {
        console.error('❌ PAYMENT_TOKEN is missing!');
        return ctx.reply('⚠️ Платежная система временно недоступна (отсутствует конфигурация токена).');
      }

      const timestamp = Date.now();
      const payload = `paid_analysis_${ctx.from.id}_${timestamp}`;
      
      console.log(`💳 Generating fresh invoice for user ${ctx.from.id}`);
      console.log(`🔹 Token: ${PAYMENT_TOKEN.substring(0, 10)}...`);
      console.log(`🔹 Payload: ${payload}`);

      ctx.replyWithInvoice({
        title: 'Глубокий разбор личности ✨',
        description: 'Полный синтез твоей натальной карты и психологического типа личности от ИИ.',
        payload: payload,
        provider_token: PAYMENT_TOKEN,
        currency: 'RUB',
        prices: [{ label: 'Разбор личности', amount: 10000 }], // 100 RUB (Minimum for Live)
        start_parameter: 'analysis_payment'
      }).catch(err => {
        console.error('❌ Detailed Invoice Error:', err);
        const errorMsg = err.description || err.message || 'Неизвестная ошибка';
        ctx.reply(`❌ Ошибка при формировании счета: ${errorMsg}\n\n⚠️ Обратите внимание: для Live-платежей минимальная сумма обычно 100₽. Если вы тестируете, используйте тестовый токен в настройках.`);
      });
    });

    // Secret command for developer to bypass payment during testing
    bot.command('unlock_me', async (ctx) => {
      const tgId = ctx.from.id.toString();
      console.log(`🔑 Developer bypass for testing: unlocking analysis for ${tgId}`);
      
      if (!adminDb) {
        return ctx.reply('❌ Ошибка: База данных не инициализирована.');
      }

      try {
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef.where('tgId', '==', tgId).get();

        if (!snapshot.empty) {
          const batch = adminDb.batch();
          snapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
              isAnalysisPaid: true,
              updatedAt: FieldValue.serverTimestamp()
            });
          });
          await batch.commit();
          
          ctx.reply(`✨ (DEV) Разблокировано документов: ${snapshot.size}. Попробуйте перезагрузить приложение.`);
          console.log(`✅ Successfully unlocked ${snapshot.size} docs for tgId ${tgId}`);
        } else {
          // List some users to debug if any exist
          const anyUsers = await usersRef.limit(5).get();
          const userCount = anyUsers.size;
          ctx.reply(`⚠️ Пользователь с tgId ${tgId} не найден.\nВсего пользователей в БД: ${userCount}.\nУбедитесь, что вы запустили приложение и авторизовались.`);
          console.log(`⚠️ No user found with tgId ${tgId}. Total users in DB: ${userCount}`);
        }
      } catch (err) {
        console.error('❌ Error in /unlock_me:', err);
        ctx.reply(`❌ Ошибка при разблокировке: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

    bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));

    bot.on('successful_payment', async (ctx) => {
      const tgId = ctx.from.id.toString();
      console.log(`💰 Успешная оплата от пользователя ${tgId}`);

      if (adminDb) {
        try {
          const usersRef = adminDb.collection('users');
          const snapshot = await usersRef.where('tgId', '==', tgId).limit(1).get();

          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            await userDoc.ref.update({
              isAnalysisPaid: true,
              updatedAt: FieldValue.serverTimestamp()
            });
            console.log(`✅ Статус оплаты обновлен для пользователя ${tgId}`);
            ctx.reply('🎉 Оплата прошла успешно! Теперь тебе доступен полный разбор в приложении.');
          } else {
            console.warn(`⚠️ Пользователь с tgId ${tgId} не найден в БД. Оплата прошла, но статус не обновлен.`);
            ctx.reply('🎉 Оплата прошла успешно! Если разбор не открылся, пожалуйста, убедись, что ты авторизован в приложении под тем же аккаунтом.');
          }
        } catch (err) {
          console.error('❌ Ошибка при обновлении статуса оплаты в Firestore:', err);
          ctx.reply('🎉 Оплата прошла успешно, но произошла ошибка при обновлении твоего профиля. Пожалуйста, напиши в поддержку.');
        }
      } else {
        console.warn('⚠️ Firebase Admin не инициирован. Не удалось обновить статус оплаты.');
        ctx.reply('🎉 Оплата прошла успешно, но мы не смогли автоматически обновить твой статус. Пожалуйста, подожди немного или напиши в поддержку.');
      }
    });

    bot.action('about_features', (ctx) => {
      ctx.reply(
        'В CosmicVibes ты найдешь:\n' +
        '• 🪐 Натальная карта: подробный разбор планет в твоем гороскопе.\n' +
        '• 🧠 MBTI Тест: определение твоего психологического типа личности.\n' +
        '• 🔮 Синастрия: анализ совместимости с партнером.\n' +
        '• ✨ Глубокий разбор: умный синтез астрологии и психологии для раскрытия твоих талантов и предназначения.\n\n' +
        'Начни путь к себе прямо сейчас!',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Открыть приложение', APP_URL)]
        ])
      );
    });

    bot.action('about_payment', (ctx) => {
      ctx.reply(
        '🎁 Базовый функционал доступен бесплатно!\n\n' +
        'Для тех, кто хочет пойти глубже, у нас есть "Глубокий разбор личности" от ИИ, который синтезирует данные астрологии и психологии.\n\n' +
        '💳 Стоимость полного разбора: 100₽.\n' +
        'Оплата производится внутри приложения через безопасные платежные системы.',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Перейти к оплате в приложении', APP_URL)]
        ])
      );
    });

    bot.launch().then(() => {
      console.log('✅ Telegram Bot is running');
    }).catch(err => {
      console.error('❌ Failed to start Telegram Bot:', err);
    });

    // Enable graceful stop
    process.once('SIGINT', () => bot?.stop('SIGINT'));
    process.once('SIGTERM', () => bot?.stop('SIGTERM'));
  } else {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN is missing. Bot functionality disabled.');
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', bot_active: !!bot });
  });

  app.use(express.json());

  app.post('/api/generate-deep-analysis', async (req, res) => {
    const { natalData, mbti } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing in server environment');
      return res.status(500).json({ error: 'AI key not configured on server' });
    }

    if (!natalData || !mbti) {
      return res.status(400).json({ error: 'Missing natalData or mbti' });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
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
  "text": Финальный вывод на один абзац в стиле сторителлинга. "Ваша история — это путь от [X] к [Y]..."
`;

      const responseSchema = {
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
      };

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Use 2.0 Flash as it is modern and fast
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      const responseText = result.text;
      res.json(JSON.parse(responseText || '{}'));
    } catch (err: any) {
      console.error('❌ Gemini Error on server:', err);
      res.status(500).json({ error: err.message || 'Internal server error while generating analysis' });
    }
  });

  app.post('/api/generate-horoscope', async (req, res) => {
    const { signRu, transitMoonSignRu } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'AI key not configured on server' });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const prompt = `Сгенерируй персонализированный гороскоп на сегодня для знака ${signRu}. 
Учти текущий транзит Луны (в знаке ${transitMoonSignRu}).

Стиль: эзотерический, вдохновляющий, глубокий, в духе CosmicVibes.
Max length: 200 characters. Обращайся к пользователю на ты.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "Текст гороскопа" },
          vibe: { type: Type.STRING, description: "Короткая фраза - вайб дня (2-3 слова)" },
          type: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'], description: "Общий характер дня" }
        },
        required: ["text", "vibe", "type"]
      };

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      res.json(JSON.parse(result.text || '{}'));
    } catch (err: any) {
      console.error('❌ Horoscope AI Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Catch-all for API routes to avoid returning HTML
  app.all('/api/*', (req, res) => {
    console.warn(`[${new Date().toISOString()}] 404 API Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
