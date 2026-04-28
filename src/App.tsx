/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, memo, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import Header from './components/Header';
import ExperienceFlow from './components/ExperienceFlow';
import SynastryForm from './components/SynastryForm';
import SynastryResult from './components/SynastryResult';
import AnalysisDashboard from './components/AnalysisDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { useUserStore } from './store/userStore';
import { useSynastryStore } from './store/synastryStore';
import { useTelegram } from './hooks/useTelegram';
import { useAuth } from './hooks/useAuth';
import { useUserSync } from './hooks/useUserSync';

import TermsOfService from './components/legal/TermsOfService';
import PrivacyPolicy from './components/legal/PrivacyPolicy';

type AppMode = 'home' | 'experience' | 'synastry' | 'profile' | 'analysis' | 'terms' | 'privacy';

const SynastryBackground = memo(({ stars }: { stars: any[] }) => (
  <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-red-950/20" />
    <motion.div 
      animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.05, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[10%] left-[5%] w-[80vw] h-[80vw] bg-red-600/25 rounded-full blur-[180px]" 
    />
    <motion.div 
      animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.03, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-[10%] right-[10%] w-[70vw] h-[70vw] bg-rose-600/20 rounded-full blur-[160px]" 
    />
    {stars.map((star) => (
      <motion.div
        key={`syn-star-${star.id}`}
        initial={{ opacity: star.initialOpacity, top: star.top, left: star.left, scale: star.scale }}
        animate={{ opacity: star.animateOpacity, scale: star.animateScale }}
        transition={{ duration: star.duration, repeat: Infinity, ease: "linear", delay: star.delay }}
        className="absolute bg-white rounded-full shadow-[0_0_8px_1.5px_rgba(239,68,68,0.5)]"
        style={{ width: `${star.size}px`, height: `${star.size}px` }}
      />
    ))}
  </div>
));

const AnalysisBackground = memo(({ stars }: { stars: any[] }) => (
  <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-emerald-950/20" />
    <motion.div 
      animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.05, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[10%] left-[15%] w-[80vw] h-[80vw] bg-emerald-600/20 rounded-full blur-[180px]" 
    />
    <motion.div 
      animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.03, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[10%] right-[5%] w-[70vw] h-[70vw] bg-teal-600/15 rounded-full blur-[160px]" 
    />
    {stars.map((star) => (
      <motion.div
        key={`ana-star-${star.id}`}
        initial={{ opacity: star.initialOpacity, top: star.top, left: star.left, scale: star.scale }}
        animate={{ opacity: star.animateOpacity, scale: star.animateScale }}
        transition={{ duration: Math.max(star.duration, 5), repeat: Infinity, ease: "linear", delay: star.delay }}
        className="absolute bg-white rounded-full shadow-[0_0_8px_2px_rgba(52,211,153,0.4)]"
        style={{ width: `${star.size}px`, height: `${star.size}px` }}
      />
    ))}
  </div>
));

export default function App() {
  const { tg, user: tgUser } = useTelegram();
  const { user, profile, loading: authLoading } = useAuth();
  useUserSync();
  const [mode, setMode] = useState<AppMode>('home');
  const { natalData } = useUserStore();
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Catch Quota/Firebase errors globally
  useEffect(() => {
    const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const msg = (event instanceof ErrorEvent ? event.message : (event as any).reason?.message) || '';
      console.log("Global Error Caught:", msg);
      if (msg.includes('permission-denied') || msg.includes('resource-exhausted') || msg.includes('Quota') || msg.includes('quota')) {
        setQuotaExceeded(true);
      }
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const { synastryResult, setSynastryResult, reset } = useSynastryStore();
  const [loading, setLoading] = useState(false);

  const navigateTo = (newMode: AppMode) => {
    console.log("Navigating to mode:", newMode);
    // For legacy compatibility during migration
    if ((newMode as any) === 'form' || (newMode as any) === 'mbti') {
      setMode('experience');
    } else {
      setMode(newMode);
    }
    setTimeout(() => {
      document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 10);
  };

  const handleSynastryCalculate = async (u1: any, u2: any) => {
    setLoading(true);
    try {
      const { calculateNatalData } = await import('./services/astrologyService');
      const { calculateSynastry } = await import('./services/synastryService');
      
      const n1 = await calculateNatalData(u1.date, u1.time, u1.lat, u1.lng);
      const n2 = await calculateNatalData(u2.date, u2.time, u2.lat, u2.lng);
      
      const result = calculateSynastry(n1, n2, u1.mbti, u2.mbti);
      setSynastryResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const synastryStars = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      initialOpacity: Math.random() * 0.4 + 0.1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: Math.random() * 0.4 + 0.5,
      animateOpacity: [Math.random() * 0.2, 0.7, Math.random() * 0.2],
      animateScale: [0.9, 1.1, 0.9],
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 3,
      size: Math.random() * 1.5 + 1
    }));
  }, []);

  const content = () => {
    switch (mode) {
      case 'home':
        return <Home user={tgUser} onNavigate={(m) => navigateTo(m as AppMode)} />;
      case 'experience':
        return <ExperienceFlow tgUser={tgUser} />;
      case 'analysis':
        return <AnalysisDashboard />;
      case 'terms':
        return <TermsOfService />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'synastry':
        return (
          <div className="relative w-full flex flex-col items-center">


             <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center space-y-2 md:space-y-4">
               {!synastryResult && (
                 <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-5xl font-light text-white tracking-tight">Совместимость</h2>
                    <p className="text-gray-400 font-light text-[10px] md:text-sm">Проверьте связь ваших звездных путей с партнером.</p>
                 </div>
               )}
               <div className="w-full">
                 {!synastryResult ? (
                   <SynastryForm onCalculate={handleSynastryCalculate} loading={loading} />
                 ) : (
                   <div className="w-full flex justify-center pb-20 fade-in text-left">
                     <div className="w-full flex flex-col items-center">
                        <SynastryResult 
                          score={synastryResult.score} 
                          details={synastryResult.details} 
                          u1Traits={synastryResult.u1Traits} 
                          u2Traits={synastryResult.u2Traits} 
                          onReset={() => {
                            reset();
                            document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        />
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        );
      default:
        return <Home onNavigate={(m) => navigateTo(m as AppMode)} />;
    }
  };

  const isScrollLocked = mode === 'home' || ((mode === 'experience' || mode === 'analysis') && !natalData);

  if (authLoading && !quotaExceeded) {
    return (
      <Layout>
        <div className="fixed inset-0 bg-[#020205] flex flex-col items-center justify-center space-y-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full"
          />
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] animate-pulse">Синхронизация со звездами...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header onNavigate={(m) => navigateTo(m as AppMode)} currentMode={mode} hasUserData={!!natalData} />
      
      {quotaExceeded && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-amber-500/90 backdrop-blur-md py-2 px-4 flex items-center justify-between">
          <p className="text-black text-[10px] md:text-xs font-medium uppercase tracking-[0.1em]">
            Превышен лимит запросов к базе данных. Приложение работает в автономном режиме.
          </p>
          <button 
            onClick={() => setQuotaExceeded(false)}
            className="text-black/60 hover:text-black font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      <main 
        className={`flex-1 min-h-0 w-full relative scroll-smooth ${isScrollLocked ? 'overflow-hidden flex flex-col' : 'overflow-y-auto overflow-x-hidden pt-16 md:pt-20 pb-20'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`w-full flex-1 flex flex-col items-center ${isScrollLocked ? 'justify-center h-full' : 'justify-start max-w-7xl mx-auto w-full px-4'}`}
          >
            {content()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Background Layer */}
      <div className="fixed inset-0 pointer-events-none -z-30 bg-[#020205]" />

      {/* Decorative Aura (Purple/Gold) */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden opacity-50">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-neon-purple/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[160px]" />
      </div>

      {/* Synastry Background Refined (Red Glow & Stars) */}
      {mode === 'synastry' && <SynastryBackground stars={synastryStars} />}

      {/* Analysis Background (Emerald/Teal Glow & Stars) */}
      {mode === 'analysis' && <AnalysisBackground stars={synastryStars} />}
    </Layout>
  );
}
