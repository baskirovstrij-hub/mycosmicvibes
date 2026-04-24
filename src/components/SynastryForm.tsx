import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Users, ArrowRight, Sparkles, Moon, Sun, ArrowLeft } from 'lucide-react';
import BirthForm from './BirthForm';
import { useSynastryStore } from '../store/synastryStore';
import { useUserStore } from '../store/userStore';

interface SynastryFormProps {
  onCalculate: (u1: any, u2: any) => void;
  loading: boolean;
}

export default function SynastryForm({ onCalculate, loading }: SynastryFormProps) {
  const { user1, setUser1, setUser2 } = useSynastryStore();
  const { userData, mbtiResult } = useUserStore();
  
  // Use global userData if user1 is not set in synastryStore
  // Merge MBTI from personality test if not already present
  const effectiveUser1 = user1 || (userData ? { ...userData, mbti: mbtiResult } : null);
  const [step, setStep] = useState(effectiveUser1 && (effectiveUser1 as any).date ? 2 : 1);

  const handleUser1Submit = (data: any) => {
    setUser1(data);
    setStep(2);
    setTimeout(() => {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleUser2Submit = (data: any) => {
    setUser2(data);
    onCalculate(effectiveUser1, data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-0 px-0 md:px-2 mt-0 md:mt-2">
      <div className="relative min-h-[250px]">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="user1"
              initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 30, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="text-center mb-6 md:mb-8 px-1 relative z-10">
                <h3 className="text-lg md:text-xl font-medium text-white tracking-[0.2em] uppercase mb-1">Ваши данные</h3>
                <p className="text-gray-500 font-light tracking-widest text-[10px] uppercase">Введите свои координаты для начала</p>
              </div>
              <BirthForm 
                onSubmit={handleUser1Submit} 
                loading={false} 
                initialData={effectiveUser1} 
                isPartner={false} 
                showMbti={! (effectiveUser1 as any)?.mbti}
                colorTheme="red" 
              />
            </motion.div>
          ) : (
            <motion.div
              key="user2"
              initial={{ opacity: 0, x: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="text-center mb-6 md:mb-8 px-1 relative z-10">
                <button 
                  onClick={() => {
                    setStep(1);
                    setTimeout(() => {
                      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 50);
                  }}
                  className="flex items-center gap-2 mx-auto mb-6 text-red-500/80 hover:text-red-500 transition-all text-[10px] uppercase tracking-[0.2em] font-medium group"
                  aria-label="Назад"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Назад к моим данным
                </button>
                <h3 className="text-lg md:text-xl font-medium text-white tracking-[0.2em] uppercase mb-1">Данные партнера</h3>
                <p className="text-gray-500 font-light tracking-widest text-[10px] uppercase">Введите данные души партнера</p>
              </div>
              <BirthForm onSubmit={handleUser2Submit} loading={loading} isPartner={true} showMbti={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
