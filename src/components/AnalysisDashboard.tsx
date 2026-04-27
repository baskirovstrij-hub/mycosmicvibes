import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useUserStore } from '../store/userStore';
import { useAuth } from '../hooks/useAuth';
import { generateDeepAnalysis, AIAnalysisResponse } from '../services/aiAnalysisService';
import { Sparkles, Brain, Lock, Star, CreditCard } from 'lucide-react';

export default function AnalysisDashboard() {
  const { profile } = useAuth();
  const { userData, natalData, mbtiResult, analysisData, setAnalysisData } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const isPaid = profile?.isAnalysisPaid === true;
  const activeAnalysis = profile?.analysisData || analysisData;

  const handleGenerate = async () => {
    if (!natalData || !mbtiResult) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await generateDeepAnalysis(natalData, mbtiResult);
      // Attach the user details that generated this analysis
      const permanentAnalysis = {
        ...data,
        lockedName: userData?.name,
        lockedMbti: mbtiResult
      };
      setAnalysisData(permanentAnalysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Не удалось сгенерировать разбор. Пожалуйста, проверьте подключение и повторите попытку.');
    } finally {
      setLoading(false);
    }
  };

  if (!natalData || !mbtiResult) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh] space-y-6">
         <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <Lock className="text-emerald-500" size={32} />
         </div>
         <div className="text-center space-y-2">
           <h2 className="text-xl md:text-3xl font-light text-white tracking-tight">Разбор недоступен</h2>
           <p className="text-gray-400 font-light text-sm max-w-sm">Сначала пройдите "Мой Путь" и определите свой психотип, чтобы разблокировать интеллектуальную карту личности.</p>
         </div>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[70vh] px-6 space-y-12">
         <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[60px] animate-pulse" />
            <div className="relative w-24 h-24 bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[2rem] flex items-center justify-center">
               <Lock className="text-emerald-500 w-10 h-10" />
            </div>
         </div>
         
         <div className="text-center space-y-4 max-w-md">
            <h2 className="text-3xl font-light text-white tracking-tight italic">Глубокий разбор личности</h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Откройте доступ к полному синтезу вашей натальной карты и психотипа. 
              Узнайте свои скрытые таланты, теневые стороны и истинное предназначение.
            </p>
         </div>

         <div className="flex flex-col items-center gap-6 w-full max-w-xs">
            <div className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 text-center">
               <div className="text-emerald-500 font-light text-4xl tracking-tighter italic">299₽</div>
               <div className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-medium">Единоразовый доступ</div>
            </div>

            <a 
              href="https://t.me/cosmicvibe_bot" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full group relative py-5 bg-white text-black rounded-full flex items-center justify-center gap-3 overflow-hidden transition-transform active:scale-95"
            >
              <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <CreditCard className="relative z-10 w-5 h-5 group-hover:text-white transition-colors" />
              <span className="relative z-10 font-medium group-hover:text-white transition-colors uppercase tracking-widest text-xs">Оплатить в боте</span>
            </a>
            
            <p className="text-[10px] text-gray-600 uppercase tracking-widest text-center px-4">
              После оплаты разбор будет разблокирован автоматически через несколько секунд
            </p>
         </div>
      </div>
    );
  }

  // Pre-generation confirmation screen for paid users who haven't generated yet
  if (isPaid && !activeAnalysis && !loading && !error) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-6 text-center">
         <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <Brain className="text-emerald-500" size={32} />
         </div>
         <div className="space-y-4">
           <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">Подтверждение данных</h2>
           <p className="text-gray-400 font-light text-sm leading-relaxed">
             Глубокий разбор генерируется <strong className="text-white">один раз и навсегда привязывается к вашему аккаунту</strong>. Вы не сможете перегенерировать его бесплатно.
           </p>
           <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-left space-y-2 mt-4 inline-block mx-auto min-w-[250px]">
              <div className="text-xs text-gray-400">Имя: <span className="text-white font-medium">{userData?.name}</span></div>
              <div className="text-xs text-gray-400">Дата: <span className="text-white font-medium">{userData?.date}</span></div>
              <div className="text-xs text-gray-400">Город: <span className="text-white font-medium">{userData?.locationName}</span></div>
              <div className="text-xs text-gray-400">Психотип: <span className="text-white font-medium">{mbtiResult}</span></div>
           </div>
         </div>
         
         {!confirmed ? (
           <button 
             onClick={() => setConfirmed(true)}
             className="w-full py-4 border border-emerald-500/50 text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors uppercase tracking-widest text-xs"
           >
             Данные верны, продолжить
           </button>
         ) : (
           <button 
             onClick={handleGenerate}
             className="w-full py-4 bg-emerald-500 text-black rounded-full hover:bg-emerald-400 transition-colors uppercase tracking-widest text-xs font-bold shadow-[0_0_20px_rgba(52,211,153,0.3)]"
           >
             Сгенерировать разбор
           </button>
         )}
      </div>
    );
  }

  const displayMbti = activeAnalysis?.lockedMbti || mbtiResult;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-6 md:px-0">
      
      {/* Header section */}
      <div className="text-center space-y-4 mb-16 pt-8">
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-[0.2em]"
         >
           <Brain size={14} />
           <span>Интеллектуальная Карта</span>
         </motion.div>
         
         <motion.h1 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="text-3xl md:text-5xl font-light text-white tracking-tight"
         >
           Глубинный Разбор
         </motion.h1>
         <motion.p
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="text-gray-400 font-light text-sm max-w-lg mx-auto"
         >
           Синтез вашей натальной карты и психотипа ({displayMbti}). Детальный анализ ядра вашей личности, скрытых мотивов и точек роста.
         </motion.p>
      </div>

      {loading && !activeAnalysis && (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
           <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[40px] animate-pulse" />
              <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="relative w-16 h-16 border border-emerald-500/30 rounded-full"
              >
                 <div className="absolute top-0 left-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] -translate-x-1/2 -translate-y-1/2" />
              </motion.div>
              <Brain className="absolute text-emerald-400 z-10" size={32} />
           </div>
           <p className="text-emerald-400/80 font-light text-xs uppercase tracking-[0.3em] animate-pulse">Анализ нейронных и звездных связей...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-[2rem] text-center space-y-4">
           <p className="text-red-400 font-light text-sm">{error}</p>
           <button 
             onClick={handleGenerate}
             className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-full transition-colors text-xs uppercase tracking-widest"
           >
             Повторить
           </button>
        </div>
      )}

      {activeAnalysis && (
        <div className="space-y-32 md:space-y-48 pb-48 px-4 md:px-0">
          {/* Core Block */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative flex flex-col group w-full items-center md:items-start"
          >
             <div className="absolute top-1/2 left-0 w-[60vw] h-[60vw] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
             
             <div className="relative z-10 flex flex-col items-center md:items-start w-full">
                <h3 className="text-emerald-500/60 uppercase tracking-[0.5em] text-[10px] md:text-xs font-medium mb-6 text-center md:text-left">
                  Ядро Личности
                </h3>
                <h2 className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase text-white/95 mb-10 text-center md:text-left">
                  {activeAnalysis.core.title.replace(/^(Ядро|ЯДРО):\s*/i, '')}
                </h2>
                <div className="max-w-4xl w-full">
                  <p className="text-white/70 font-light leading-[1.9] text-base md:text-xl text-justify md:text-left">
                    {activeAnalysis.core.text}
                  </p>
                </div>
             </div>
          </motion.div>

          {/* Shadow Block */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative flex flex-col group w-full items-center md:items-start"
          >
             <div className="absolute top-1/2 left-0 w-[60vw] h-[60vw] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
             
             <div className="relative z-10 flex flex-col items-center md:items-start w-full">
                <h3 className="text-emerald-500/60 uppercase tracking-[0.5em] text-[10px] md:text-xs font-medium mb-6 text-center md:text-left">
                   Скрытая Тень
                </h3>
                <h2 className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase text-white/95 mb-10 text-center md:text-left">
                  {activeAnalysis.shadow.title}
                </h2>
                <div className="max-w-4xl w-full">
                  <p className="text-white/70 font-light leading-[1.9] text-base md:text-xl text-justify md:text-left">
                    {activeAnalysis.shadow.text}
                  </p>
                </div>
             </div>
          </motion.div>

          {/* Growth Points */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative flex flex-col group w-full items-center md:items-start"
          >
             <div className="absolute top-1/2 left-0 w-[80vw] h-[80vw] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
             
             <div className="relative z-10 flex flex-col items-center md:items-start w-full mb-16">
                <h3 className="text-amber-500/60 uppercase tracking-[0.5em] text-[10px] md:text-xs font-medium mb-6 text-center md:text-left">
                  Двигатель Прогресса
                </h3>
                <h2 className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase text-white/95 text-center md:text-left">
                  {activeAnalysis.growth.title}
                </h2>
             </div>
             
             <div className="grid grid-cols-1 gap-24 md:gap-32 relative z-10 w-full">
               {activeAnalysis.growth.points.map((point: any, idx: number) => (
                 <motion.div 
                   key={idx} 
                   initial={{ opacity: 0, scale: 0.98 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   className="flex flex-col gap-6 md:gap-8 text-center md:text-left w-full"
                 >
                   <h4 className="text-white/95 font-light text-xl md:text-3xl tracking-wide px-2 md:px-0">
                     {point.thesis}
                   </h4>
                   
                   <div className="space-y-10 md:space-y-12 max-w-5xl">
                      <div className="space-y-4">
                        <span className="text-white/30 uppercase text-[9px] tracking-[0.4em] font-medium block text-center md:text-left">Причина</span>
                        <p className="text-white/60 font-light text-base md:text-xl leading-relaxed text-justify md:text-left whitespace-pre-line">
                          {point.cause}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <span className="text-amber-500/40 uppercase text-[9px] tracking-[0.4em] font-medium block text-center md:text-left">Решение</span>
                        <p className="text-white/90 font-light text-base md:text-xl leading-relaxed text-justify md:text-left whitespace-pre-line">
                          {point.solution}
                        </p>
                      </div>
                   </div>
                 </motion.div>
               ))}
             </div>
          </motion.div>

          {/* Summary */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative flex flex-col items-center md:items-start text-center md:text-left pt-20"
          >
             <div className="absolute top-1/2 left-0 w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
             <Sparkles className="text-emerald-400 mb-8 w-6 h-6 opacity-40 mx-auto md:ml-1" />
             <div className="relative font-serif w-full max-w-4xl">
                <span className="absolute -top-10 -left-6 text-7xl text-emerald-500/10 select-none hidden md:block">“</span>
                <p className="text-white/90 font-light text-lg md:text-2xl tracking-wide leading-relaxed italic relative z-10 text-justify">
                  {activeAnalysis.summary.text}
                </p>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
