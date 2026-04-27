import { motion } from 'motion/react';
import { CreditCard, RefreshCcw, Scale, HelpCircle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-6 space-y-12 font-light text-gray-300 leading-relaxed">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-light text-white italic tracking-tight">Публичная оферта</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-purple-500 font-medium">Последнее обновление: 27 апреля 2026</p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-4 text-white">
          <Scale className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-medium tracking-tight">1. Предмет договора</h2>
        </div>
        <p>
          Данный документ является официальным предложением (публичной офертой) администрации CosmicVibes (далее — Исполнитель) и содержит все существенные условия по оказанию информационно-консультационных услуг в сфере астрологии и психологии (цифрового контента).
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4 text-white">
          <CreditCard className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-medium tracking-tight">2. Стоимость и порядок оплаты</h2>
        </div>
        <p>
          Стоимость платных услуг (Глубокий разбор личности) указана в интерфейсе приложения и в Telegram-боте. Оплата производится в рублях РФ через платежный сервис ЮKassa.
        </p>
        <p>
          Услуга считается оказанной в полном объеме с момента предоставления доступа к цифровому аналитическому отчету в интерфейсе приложения.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4 text-white">
          <RefreshCcw className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-medium tracking-tight">3. Политика возврата</h2>
        </div>
        <p>
          В соответствии с законодательством РФ, цифровой контент (информационные услуги), предоставленный пользователю в полном объеме, возврату не подлежит.
        </p>
        <p>
          Возврат денежных средств возможен только в случае технического сбоя, при котором доступ к оплаченному контенту не был предоставлен. В этом случае пользователь должен обратиться в поддержку в течение 24 часов с момента оплаты.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4 text-white">
          <HelpCircle className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-medium tracking-tight">4. Отказ от ответственности</h2>
        </div>
        <p>
          Все предоставляемые расчеты, интерпретации и рекомендации носят исключительно развлекательный и ознакомительный характер. Исполнитель не несет ответственности за решения, принятые пользователем на основе предоставленной информации.
        </p>
      </section>

      <div className="pt-12 border-t border-white/5 text-center space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">Реквизиты Исполнителя</div>
        <p className="text-sm text-gray-500 italic">Самозанятый Башкиров Данил Алексеевич</p>
        <p className="text-sm text-gray-500 italic">ИНН: 236506862010</p>
        <p className="text-sm text-gray-500 italic">Email: Baskriovstrij@gmail.com</p>
      </div>
    </div>
  );
}
