import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useUserStore } from '../store/userStore';
import { generateDeepAnalysis, AIAnalysisResponse } from '../services/aiAnalysisService';
import { Sparkles, Brain, Lock, Star } from 'lucide-react';

export default function AnalysisDashboard() {
  const { userData, natalData, mbtiResult, analysisData, setAnalysisData } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisData && natalData && mbtiResult) {
      handleGenerate();
    }
  }, [natalData, mbtiResult, analysisData]);

  const handleGenerate = async () => {
    if (!natalData || !mbtiResult) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await generateDeepAnalysis(natalData, mbtiResult);
      setAnalysisData(data);
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
           Синтез вашей натальной карты и психотипа ({mbtiResult}). Детальный анализ ядра вашей личности, скрытых мотивов и точек роста.
         </motion.p>
      </div>

      {loading && !analysisData && (
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

      {analysisData && (
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
                  {analysisData.core.title.replace(/^(Ядро|ЯДРО):\s*/i, '')}
                </h2>
                <div className="max-w-4xl w-full">
                  <p className="text-white/70 font-light leading-[1.9] text-base md:text-xl text-justify md:text-left">
                    {analysisData.core.text}
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
                  {analysisData.shadow.title}
                </h2>
                <div className="max-w-4xl w-full">
                  <p className="text-white/70 font-light leading-[1.9] text-base md:text-xl text-justify md:text-left">
                    {analysisData.shadow.text}
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
                  {analysisData.growth.title}
                </h2>
             </div>
             
             <div className="grid grid-cols-1 gap-24 md:gap-32 relative z-10 w-full">
               {analysisData.growth.points.map((point: any, idx: number) => (
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
                  {analysisData.summary.text}
                </p>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
