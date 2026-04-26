import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, RefreshCcw, User, ChevronDown } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { MBTI_DESCRIPTIONS, MBTI_LETTERS } from '../constants/mbti';

interface Question {
  id: number;
  text: string;
  dichotomy: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
}

const MBTI_QUESTIONS: Question[] = [
  { id: 1, text: "Вам легко общаться с новыми людьми и заводить знакомства.", dichotomy: 'E' },
  { id: 2, text: "После долгого общения с группой людей вы чувствуете себя истощенным и нуждаетесь в уединении.", dichotomy: 'I' },
  { id: 3, text: "Вы предпочитаете быть в центре внимания на мероприятиях.", dichotomy: 'E' },
  { id: 4, text: "Вы больше доверяете конкретным фактам и личному опыту, чем абстрактным идеям.", dichotomy: 'S' },
  { id: 5, text: "Вы часто погружаетесь в размышления о будущем и скрытых смыслах вещей.", dichotomy: 'N' },
  { id: 6, text: "Вы предпочитаете практичные решения, которые можно применить здесь и сейчас.", dichotomy: 'S' },
  { id: 7, text: "При принятии решений логика и объективные факты для вас важнее, чем эмоции людей.", dichotomy: 'T' },
  { id: 8, text: "Вы стараетесь избегать конфликтов и сохранять гармонию в отношениях любой ценой.", dichotomy: 'F' },
  { id: 9, text: "В споре для вас важнее доказать истину, даже если это может кого-то задеть.", dichotomy: 'T' },
  { id: 10, text: "Вы предпочитаете иметь четкий план действий и заранее составленное расписание.", dichotomy: 'J' },
  { id: 11, text: "Вы легко меняете свои планы в последнюю минуту и любите действовать спонтанно.", dichotomy: 'P' },
  { id: 12, text: "Вам комфортнее, когда ваше рабочее место и дела строго организованы.", dichotomy: 'J' }
];

const OPPOSITES: Record<string, string> = {
  E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J'
};

interface MBTIQuizProps {
  onComplete: () => void;
}

export default function MBTIQuiz({ onComplete }: MBTIQuizProps) {
  const { mbtiResult, setMbtiData } = useUserStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [scores, setScores] = useState<Record<string, number>>({
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
  });
  const [result, setResult] = useState<string | null>(mbtiResult);
  const [showLetters, setShowLetters] = useState(false);
  
  const handleAnswer = (value: number) => {
    const question = MBTI_QUESTIONS[currentStep];
    const trait = question.dichotomy;
    const oppositeTrait = OPPOSITES[trait];
    
    const newAnswers = { ...answers, [currentStep]: value };
    const newScores = { ...scores };
    
    if (value > 0) {
      newScores[trait] += value;
    } else if (value < 0) {
      newScores[oppositeTrait] += Math.abs(value);
    }
    
    setAnswers(newAnswers);
    setScores(newScores);

    if (currentStep < MBTI_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => calculateResult(newScores, newAnswers), 300);
    }
  };

  const calculateResult = (finalScores: Record<string, number>, finalAnswers: Record<number, number>) => {
    const eOrI = finalScores.E >= finalScores.I ? 'E' : 'I';
    const sOrN = finalScores.S >= finalScores.N ? 'S' : 'N';
    const tOrF = finalScores.T >= finalScores.F ? 'T' : 'F';
    const jOrP = finalScores.J >= finalScores.P ? 'J' : 'P';
    
    const mbtiType = `${eOrI}${sOrN}${tOrF}${jOrP}`;
    setResult(mbtiType);
    
    const stringAnswers: Record<number, string> = {};
    Object.entries(finalAnswers).forEach(([k, v]) => {
      stringAnswers[Number(k)] = String(v);
    });
    setMbtiData(mbtiType, stringAnswers);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setResult(null);
    setShowLetters(false);
    setMbtiData(null, null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-[400px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="space-y-2 text-center">
              <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest">
                Вопрос {currentStep + 1} из {MBTI_QUESTIONS.length}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mt-4 min-h-[80px]">
                {MBTI_QUESTIONS[currentStep].text}
              </h3>
            </div>

            <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto mt-12 space-y-8">
              <div className="flex items-center justify-between w-full gap-2 sm:gap-6">
                <span className="text-rose-400 font-bold text-xs sm:text-sm w-20 sm:w-24 text-right uppercase tracking-wider">
                  Не согласен
                </span>
                
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  {[
                    { val: -2, size: 'w-12 h-12 sm:w-16 sm:h-16', color: 'border-rose-500 hover:bg-rose-500/20' },
                    { val: -1, size: 'w-10 h-10 sm:w-12 sm:h-12', color: 'border-rose-400 hover:bg-rose-400/20' },
                    { val: 0, size: 'w-8 h-8 sm:w-10 sm:h-10', color: 'border-gray-500 hover:bg-gray-500/20' },
                    { val: 1, size: 'w-10 h-10 sm:w-12 sm:h-12', color: 'border-emerald-400 hover:bg-emerald-400/20' },
                    { val: 2, size: 'w-12 h-12 sm:w-16 sm:h-16', color: 'border-emerald-500 hover:bg-emerald-500/20' }
                  ].map((btn) => (
                    <motion.button
                      key={btn.val}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAnswer(btn.val)}
                      className={`rounded-full border-2 transition-colors ${btn.size} ${btn.color} ${
                        answers[currentStep] === btn.val ? btn.color.replace('hover:', '').replace('/20', '/40') : ''
                      }`}
                    />
                  ))}
                </div>

                <span className="text-emerald-400 font-bold text-xs sm:text-sm w-20 sm:w-24 text-left uppercase tracking-wider">
                  Согласен
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-10"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400"
              />
              <div className="relative p-8 rounded-full bg-white/5 border border-white/10 text-emerald-400">
                <Brain size={64} strokeWidth={1.5} />
              </div>
            </div>

            <div className="space-y-4">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-white"
              >
                Ваш тип личности: <span className="text-emerald-400">{result}</span>
              </motion.h2>
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-semibold text-gold"
              >
                {MBTI_DESCRIPTIONS[result]?.title}
              </motion.h3>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed italic"
              >
                {MBTI_DESCRIPTIONS[result]?.desc}
              </motion.p>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 text-sm max-w-lg mx-auto leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10"
              >
                {MBTI_DESCRIPTIONS[result]?.fullDesc}
              </motion.p>

              {/* Letter Breakdown */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 space-y-4 text-left max-w-lg mx-auto"
              >
                <button 
                  onClick={() => setShowLetters(!showLetters)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-white font-bold"
                >
                  Разбор каждой буквы
                  <ChevronDown className={`transition-transform ${showLetters ? 'rotate-180' : ''}`} size={20} />
                </button>
                
                <AnimatePresence>
                  {showLetters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      {result.split('').map((letter, idx) => (
                        <div key={idx} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                          <div className="text-emerald-400 font-bold">{MBTI_LETTERS[letter]?.label}</div>
                          <div className="text-gray-400 text-xs leading-relaxed">{MBTI_LETTERS[letter]?.desc}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <button
                onClick={onComplete}
                className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 group"
              >
                <User size={20} className="group-hover:scale-110 transition-transform" />
                Перейти в профиль
              </button>
              <button
                onClick={resetQuiz}
                className="px-8 py-4 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <RefreshCcw size={18} />
                Пройти заново
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
