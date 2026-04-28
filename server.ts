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

    bot.telegram.setMyCommands([
      { command: 'start', description: 'Запустить CosmicVibes' },
      { command: 'unlock_me', description: '🔓 (DEV) Разблокировать доступ' },
      { command: 'help', description: 'Помощь и инструкции' }
    ]);

    bot.start((ctx) => {
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

  // API Routes - defined BEFORE Vite middleware
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', bot_active: !!bot });
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
