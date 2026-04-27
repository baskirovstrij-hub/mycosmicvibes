import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-6 space-y-12 font-light text-gray-300 leading-relaxed">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-light text-white italic tracking-tight">Политика конфиденциальности</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-medium">Последнее обновление: 27 апреля 2026</p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-4 text-white">
          <Shield className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-medium tracking-tight">1. Общие положения</h2>
        </div>
        <p>
          Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые администрацией CosmicVibes (далее — Оператор).
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4 text-white">
          <Eye className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-medium tracking-tight">2. Какие данные мы собираем</h2>
        </div>
        <ul className="list-disc pl-6 space-y-2">
          <li>Имя и фамилия (из профиля Telegram);</li>
          <li>ID пользователя Telegram;</li>
          <li>Данные о рождении (дата, время, место) для построения натальной карты;</li>
          <li>Результаты психологических тестов (MBTI);</li>
          <li>Электронная почта (если предоставлена в процессе оплаты).</li>
        </ul>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4 text-white">
          <FileText className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-medium tracking-tight">3. Цели обработки</h2>
        </div>
        <p>
          Мы используем ваши данные исключительно для предоставления персонализированного контента:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Расчет и визуализация астрологических данных;</li>
          <li>Генерация персональных аналитических отчетов;</li>
          <li>Обеспечение работы личного кабинета и синхронизации данных;</li>
          <li>Обработка платежей через платежные системы (ЮKassa).</li>
        </ul>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4 text-white">
          <Lock className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-medium tracking-tight">4. Безопасность и хранение</h2>
        </div>
        <p>
          Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных.
        </p>
        <p>
          Мы не храним данные ваших банковских карт. Все платежные операции проходят на защищенных серверах платежного провайдера.
        </p>
      </section>

      <div className="pt-12 border-t border-white/5 text-center space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">Контакты для обращений</div>
        <p className="text-sm text-gray-500 italic">Оператор: Башкиров Данил Алексеевич</p>
        <p className="text-sm text-gray-500 italic">Email: Baskriovstrij@gmail.com</p>
      </div>
    </div>
  );
}
