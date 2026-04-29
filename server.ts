import fs from 'fs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PAYMENT_TOKEN = process.env.YOOKASSA_PROVIDER_TOKEN || process.env.PAYMENT_TOKEN;
// AI Studio passes ais-dev- URL in APP_URL, which blocks Telegram. Convert it to ais-pre-
let APP_URL = process.env.VITE_APP_URL && !process.env.VITE_APP_URL.includes('gen-lang-') ? process.env.VITE_APP_URL : (process.env.APP_URL || 'https://cosmicvibes.app');
if (APP_URL.includes('ais-dev-')) {
  APP_URL = APP_URL.replace('ais-dev-', 'ais-pre-');
}

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

  process.on('uncaughtException', (err) => {
    console.error('🔥 FATAL UNCAUGHT EXCEPTION:', err);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 FATAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
  });
  
  // Logic for picking the best AI Key
  const getAiKey = () => {
    // Priority: VITE_ variable then fallback to system GEMINI_API_KEY.
    // We check for common placeholders to avoid using invalid keys.
    const key = (process.env.VITE_GEMINI_API_KEY && 
                 !process.env.VITE_GEMINI_API_KEY.includes('YOUR_GEMINI') && 
                 !process.env.VITE_GEMINI_API_KEY.includes('MY_GEMINI')) 
      ? process.env.VITE_GEMINI_API_KEY.trim() 
      : process.env.GEMINI_API_KEY?.trim();
    
    if (!key || key.includes('YOUR_GEMINI') || key.includes('MY_GEMINI')) return null;
    return key;
  };

  const botEnabled = !!process.env.TELEGRAM_BOT_TOKEN;
  let bot: Telegraf | null = null;

  const handleDeepAnalysis = async (req: express.Request, res: express.Response) => {
    console.log('📬 [API] /api/generate-deep-analysis | Body keys:', Object.keys(req.body));
    const { natalData, mbti } = req.body;
    const apiKey = getAiKey();

    if (!apiKey) {
      console.error('❌ Missing API Key in server environment');
      return res.status(500).json({ error: 'AI key not configured on server. Please set VITE_GEMINI_API_KEY in Settings.' });
    }

    if (!natalData || !mbti) {
      return res.status(400).json({ error: 'Missing natalData or mbti' });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using gemini-3-flash-preview for fresh quota and better logic
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      console.log(`🤖 Using model: gemini-3-flash-preview for deep analysis`);
      
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      res.json(JSON.parse(text || '{}'));
    } catch (err: any) {
      console.error('❌ [API] Deep Analysis Error:', err);
      res.status(500).json({ error: err.message || 'Internal server error while generating analysis' });
    }
  };

  const handleHoroscope = async (req: express.Request, res: express.Response) => {
    console.log('📬 [API] /api/generate-horoscope | Sign:', req.body.signRu);
    const { signRu, transitMoonSignRu } = req.body;
    const apiKey = getAiKey();

    if (!apiKey) {
      return res.status(500).json({ error: 'AI key not configured' });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `Сгенерируй персонализированный гороскоп на сегодня для знака ${signRu}. 
Учти текущий транзит Луны (в знаке ${transitMoonSignRu}).
Тон: мистический, глубинный, поддерживающий.
Верни ТОЛЬКО JSON: { "vibe": "название энергии (1-2 слова)", "text": "гороскоп (2-3 предложения)" }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      res.json(JSON.parse(text || '{}'));
    } catch (err: any) {
      console.error('❌ [API] Horoscope Error:', err);
      res.status(500).json({ error: err.message || 'Internal AI error' });
    }
  };

  if (BOT_TOKEN) {
    bot = new Telegraf(BOT_TOKEN);

    bot.telegram.setMyCommands([
      { command: 'start', description: 'Запустить CosmicVibes' },
      { command: 'unlock_me', description: '🔓 (DEV) Разблокировать доступ' },
      { command: 'help', description: 'Помощь и инструкции' }
    ]);

    bot.on('message', (ctx, next) => {
      console.log(`📩 Bot received message: ${'text' in ctx.message ? ctx.message.text : 'non-text'} from ${ctx.from.id}`);
      return next();
    });

    bot.start((ctx) => {
      console.log(`🤖 Bot received /start from ${ctx.from?.id} (@${ctx.from?.username})`);
      const firstName = ctx.from?.first_name || 'Странник';
      const welcomeMsg = `Приветствуем тебя в CosmicVibes, ${firstName}! ✨\n\nЯ — твой проводник в мир звезд и психологии. Исследуй свою натальную карту, узнай свой тип личности и получи глубокий разбор своей души.`;
      
      ctx.reply(
        welcomeMsg,
        Markup.keyboard([
          ['🚀 Запустить CosmicVibes'],
          ['💳 Полный разбор (100₽)', '🔓 DEV Разблокировка'],
          ['❓ Помощь']
        ]).resize()
      );

      // Keep inline version as well for the first message
      ctx.reply('Выбери действие:', Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Запустить CosmicVibes', APP_URL)],
        [
          Markup.button.callback('✨ О функционале', 'about_features'),
          Markup.button.callback('💳 Купить разбор', 'buy_analysis')
        ]
      ]));
    });

    bot.hears('🚀 Запустить CosmicVibes', (ctx) => {
      ctx.reply('Нажми на кнопку ниже:', Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Открыть приложение', APP_URL)]
      ]));
    });

    bot.hears('❓ Помощь', (ctx) => {
      ctx.reply('CosmicVibes — это твое зеркало в мире звезд.\n\n1. Заполни свои данные в приложении\n2. Получи расчет натальной карты\n3. Пройди тест на личность\n4. Оплати полный разбор для синтеза всех данных от ИИ.\n\nПо всем вопросам: @support');
    });

    const buyAnalysisHandler = (ctx: any) => {
      if (!PAYMENT_TOKEN) {
        console.error('❌ PAYMENT_TOKEN is missing!');
        return ctx.reply('⚠️ Платежная система временно недоступна (отсутствует конфигурация токена).');
      }

      const timestamp = Date.now();
      const payload = `paid_analysis_${ctx.from.id}_${timestamp}`;
      
      ctx.replyWithInvoice({
        title: 'Глубокий разбор личности ✨',
        description: 'Полный синтез твоей натальной карты и психологического типа личности от ИИ.',
        payload: payload,
        provider_token: PAYMENT_TOKEN,
        currency: 'RUB',
        prices: [{ label: 'Разбор личности', amount: 10000 }], // 100 RUB
        start_parameter: 'analysis_payment'
      }).catch(err => {
        console.error('❌ Invoice Error:', err);
        ctx.reply(`❌ Ошибка: ${err.description || err.message}`);
      });
    };

    const unlockMeHandler = async (ctx: any) => {
      const tgId = ctx.from.id.toString();
      if (!adminDb) return ctx.reply('❌ БД не инициализирована');

      try {
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef.where('tgId', '==', tgId).get();
        if (!snapshot.empty) {
          const batch = adminDb.batch();
          snapshot.docs.forEach(doc => batch.update(doc.ref, { isAnalysisPaid: true, updatedAt: FieldValue.serverTimestamp() }));
          await batch.commit();
          ctx.reply(`✨ (DEV) Доступ разблокирован для ${snapshot.size} аккаунтов. Перезагрузите приложение.`);
        } else {
          ctx.reply('⚠️ Сначала авторизуйтесь в приложении.');
        }
      } catch (err) {
        ctx.reply('❌ Ошибка при разблокировке.');
      }
    };

    bot.hears('💳 Полный разбор (100₽)', buyAnalysisHandler);
    bot.action('buy_analysis', buyAnalysisHandler);

    bot.hears('🔓 DEV Разблокировка', unlockMeHandler);
    bot.command('unlock_me', unlockMeHandler);

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

    bot.launch({
      dropPendingUpdates: true
    }).then(() => {
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

  // API Routes - defined BEFORE Vite middleware
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  app.post('/api/generate-deep-analysis', handleDeepAnalysis);
  app.post('/api/generate-horoscope', handleHoroscope);

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      bot_active: !!bot, 
      bot_configured: botEnabled,
      time: new Date().toISOString()
    });
  });

  // Catch-all for API routes to avoid returning HTML
  app.all('/api/*', (req, res) => {
    console.warn(`[${new Date().toISOString()}] 404 API Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Global Error handler for API requests
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`❌ [API Error] ${req.method} ${req.url}:`, err);
    res.status(err.status || 500).json({ error: err.message || 'Server Error' });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
