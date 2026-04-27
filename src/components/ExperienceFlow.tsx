import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Space as Cosmic, Calendar, Globe, Send, Brain, User, RefreshCcw, Star, Zap, ChevronDown, Heart, Activity, Briefcase, Compass, Aperture, Sparkles, Orbit, ChevronUp } from 'lucide-react';
import CityPicker from './CityPicker';
import CustomDatePicker from './CustomDatePicker';
import { useUserStore } from '../store/userStore';
import { MBTI_DESCRIPTIONS, MBTI_LETTERS } from '../constants/mbti';
import DailyVibe from './DailyVibe';
import InteractiveZodiac from './InteractiveZodiac';
import { calculateNatalData } from '../services/astrologyService';
import { mapNatalDataToInterpretations } from '../services/interpretationService';
import { getEnergySynthesis } from '../services/synthesisService';

interface Question {
  id: number;
  text: string;
  dichotomy: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
}

const EXTENDED_MBTI_QUESTIONS: Question[] = [
  { id: 1, text: "Вам легко общаться с новыми людьми и заводить знакомства.", dichotomy: 'E' },
  { id: 2, text: "После долгого общения с группой людей вы чувствуете себя истощенным.", dichotomy: 'I' },
  { id: 3, text: "Вы предпочитаете быть в центре внимания на мероприятиях.", dichotomy: 'E' },
  { id: 4, text: "Вам больше нравятся глубокие беседы один на один, чем шумные компании.", dichotomy: 'I' },
  { id: 5, text: "Вы больше доверяете конкретным фактам, чем абстрактным идеям.", dichotomy: 'S' },
  { id: 6, text: "Вы часто погружаетесь в размышления о будущем и скрытых смыслах.", dichotomy: 'N' },
  { id: 7, text: "Вы предпочитаете практичные решения, которые можно применить сейчас.", dichotomy: 'S' },
  { id: 8, text: "Вам интереснее 'почему' что-то происходит, чем просто 'что' происходит.", dichotomy: 'N' },
  { id: 9, text: "При принятии решений логика для вас важнее, чем эмоции.", dichotomy: 'T' },
  { id: 10, text: "Вы стараетесь сохранять гармонию в отношениях любой ценой.", dichotomy: 'F' },
  { id: 11, text: "В споре для вас важнее доказать истину, даже если это заденет чувства.", dichotomy: 'T' },
  { id: 12, text: "Вы часто принимаете решения, основываясь на своих ценностях и чувствах.", dichotomy: 'F' },
  { id: 13, text: "Вы предпочитаете иметь четкий план действий и расписание.", dichotomy: 'J' },
  { id: 14, text: "Вы легко меняете свои планы в последнюю минуту.", dichotomy: 'P' },
  { id: 15, text: "Вам комфортнее, когда ваши дела строго организованы.", dichotomy: 'J' },
  { id: 16, text: "Вы любите спонтанность и оставляете варианты открытыми.", dichotomy: 'P' },
  { id: 17, text: "Вы часто берете на себя роль лидера в группе.", dichotomy: 'E' },
  { id: 18, text: "Вы часто замечаете детали, которые другие упускают.", dichotomy: 'S' },
  { id: 19, text: "Вы цените объективность выше субъективных переживаний.", dichotomy: 'T' },
  { id: 20, text: "Завершение проектов приносит вам больше удовольствия, чем их начало.", dichotomy: 'J' }
];

const OPPOSITES: Record<string, string> = {
  E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J'
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Ascendant: 'Asc', Descendant: 'Dsc', MC: 'MC', IC: 'IC'
};

const PLANET_LABELS: Record<string, string> = {
  Sun: 'Солнце', Moon: 'Луна', Mercury: 'Меркурий', Venus: 'Венера', Mars: 'Марс', 
  Jupiter: 'Юпитер', Saturn: 'Сатурн', Uranus: 'Уран', Neptune: 'Нептун', Pluto: 'Плутон',
  Ascendant: 'Асцендент', Descendant: 'Десцендент', MC: 'Зенит (MC)', IC: 'Надир (IC)'
};

const ASPECT_LABELS: Record<string, string> = {
  Conjunction: 'Соединение', Sextile: 'Секстиль', Square: 'Квадрат',
  Trine: 'Трин', Opposition: 'Оппозиция'
};

const PLANETARY_DESCRIPTIONS: Record<string, string> = {
  Sun: "Ядро вашей личности, сознательная воля и фундаментальный источник жизни. Это ваш внутренний герой, определяющий жизненный вектор, творческий потенциал и уникальное свечение, которое вы транслируете в этот мир.",
  Moon: "Зеркало вашей души и океан подсознания. Луна управляет интуицией, глубинными эмоциональными потребностями и чувством безопасности. Это то, как вы проявляете заботу, адаптируетесь к переменам и находите уют внутри себя.",
  Mercury: "Алхимия вашего разума и архитектор коммуникаций. Планета определяет скорость мысли, способ обработки информации и стиль самовыражения. Она отвечает за то, как вы связываете разрозненные факты в единую систему смыслов.",
  Venus: "Ваш эталон красоты, гармонии и притяжения. Венера управляет языком чувств, эстетическим выбором и способностью наслаждаться жизнью. Она показывает, что вы на самом деле цените в отношениях и через что проявляете свое обаяние.",
  Mars: "Двигатель вашей воли, страсти и инстинкта действия. Это сила, с которой вы преодолеваете препятствия и защищаете свои идеалы. Марс наделяет решимостью, соревновательным духом и энергией для физического воплощения идей.",
  Jupiter: "Планета расширения, изобилия и мудрости. Она показывает, как вы растете, где вам сопутствует удача и каковы ваши философские взгляды на мир.",
  Saturn: "Учитель дисциплины, структуры и кармы. Сатурн указывает на ваши главные жизненные уроки, ответственность и то, где вам нужно проявить стойкость.",
  Uranus: "Вестник инноваций, свободы и внезапных перемен. Он показывает вашу уникальность, гениальность и потребность ломать устаревшие шаблоны.",
  Neptune: "Океан снов, интуиции и мистицизма. Нептун управляет вашим воображением, духовным поиском и способностью к тонкому восприятию реальности.",
  Pluto: "Сила трансформации, власти и возрождения. Плутон указывает на глубинные психологические процессы и способность восстать из пепла обновленным.",
  Ascendant: "Ваша социальная маска и импульс первого впечатления. То, как мир воспринимает вас и ваш подход к новым начинаниям.",
  Descendant: "Точка партнерства и отражения. Показывает, какие качества вы ищете в других людях и тип ваших значимых отношений.",
  MC: "Вершина ваших амбиций, карьера и общественный статус. Путеводная звезда вашей реализации в социуме.",
  IC: "Ваши корни, фундамент и частная жизнь. Глубинная основа вашей личности и связь с семьей и родом."
};

const CelestialStructureTile = ({ planet, interpretations }: { planet: any, interpretations: any[] }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const signInterpretation = interpretations.find(i => i.key === `${planet.name}_${planet.sign}`);
  const houseInterpretation = interpretations.find(i => i.key === `${planet.name}_House_${planet.house}`);

  return (
    <div 
      onClick={() => setIsFlipped(!isFlipped)}
      className="rounded-2xl border border-white/5 bg-white/[0.02] flex group transition-all hover:border-white/20 hover:bg-white/[0.05] cursor-pointer h-[100px] md:h-[110px] relative overflow-hidden"
    >
      {!isFlipped ? (
        <div className="flex flex-row items-center justify-between h-full w-full absolute inset-0 px-4 md:px-5">
          <div className="flex items-center gap-3 overflow-hidden">
             <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/5 text-gold shrink-0 relative">
                <span className="text-xl font-serif leading-none mt-px">{PLANET_SYMBOLS[planet.name]}</span>
                {planet.isRetrograde && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[7px] font-bold px-1 rounded-full border border-black">
                    Rx
                  </div>
                )}
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-semibold text-gray-300 uppercase tracking-widest truncate">
                   {PLANET_LABELS[planet.name]}
                </span>
                <span className="text-[9px] text-gray-500 font-light tracking-wider">
                   {planet.degree}° {SIGN_LABELS[planet.sign]}
                </span>
             </div>
          </div>
          <div className="flex flex-col items-end shrink-0 ml-3 text-right">
             <span className="text-sm md:text-base font-light text-gold tracking-tight">
                {SIGN_LABELS[planet.sign]}
             </span>
             {planet.house && (
               <span className="text-[9px] text-white/40 uppercase tracking-widest">
                  {planet.house} дом
               </span>
             )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start justify-center text-left h-full w-full absolute inset-0 px-4 bg-white/[0.02] overflow-y-auto custom-scrollbar py-2">
           {signInterpretation && (
              <p className="text-[8px] md:text-[9px] text-gold mb-1 font-medium tracking-wider uppercase">
                 {signInterpretation.content.split(':')[0]}
              </p>
           )}
           <p className="text-[9px] md:text-[10px] font-light tracking-normal text-gray-300 leading-relaxed text-justify">
              {signInterpretation?.detailedContent || houseInterpretation?.detailedContent || PLANETARY_DESCRIPTIONS[planet.name] || planet.name}
           </p>
        </div>
      )}
    </div>
  );
};

const PLANET_ORDER = [
  'Sun', 'Moon', 'Ascendant', 'MC', 'IC', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Descendant'
];

const SIGN_LABELS_PREP: Record<string, string> = {
  Aries: 'Овне', Taurus: 'Тельце', Gemini: 'Близнецах', Cancer: 'Раке', 
  Leo: 'Льве', Virgo: 'Деве', Libra: 'Весах', Scorpio: 'Скорпионе', 
  Sagittarius: 'Стрельце', Capricorn: 'Козероге', Aquarius: 'Водолее', Pisces: 'Рыбах'
};

const SIGN_LABELS: Record<string, string> = {
  Aries: 'Овен', Taurus: 'Телец', Gemini: 'Близнецы', Cancer: 'Рак', Leo: 'Лев', Virgo: 'Дева',
  Libra: 'Весы', Scorpio: 'Скорпион', Sagittarius: 'Стрелец', Capricorn: 'Козерог', Aquarius: 'Водолей', Pisces: 'Рыбы'
};

const formatAstroKey = (key: string) => {
  const parts = key.split('_');
  
  // House_1_Aries -> 1 Дом в Овне
  if (parts[0] === 'House' && parts.length === 3) {
    return `${parts[1]} Дом в ${SIGN_LABELS_PREP[parts[2]] || parts[2]}`;
  }
  
  // Sun_House_1 -> Солнце в 1 Доме
  if (parts.length === 3 && parts[1] === 'House') {
    return `${PLANET_LABELS[parts[0]] || parts[0]} в ${parts[2]} Доме`;
  }
  
  // Sun_Aries -> Солнце в Овне
  if (parts.length === 2 && PLANET_LABELS[parts[0]] && SIGN_LABELS_PREP[parts[1]]) {
    return `${PLANET_LABELS[parts[0]]} в ${SIGN_LABELS_PREP[parts[1]]}`;
  }
  
  // Planet_Planet_Aspect -> Аспект: Планета - Планета
  if (parts.length === 3 && ASPECT_LABELS[parts[2]]) {
    return `${ASPECT_LABELS[parts[2]]} ${PLANET_LABELS[parts[0]] || parts[0]} — ${PLANET_LABELS[parts[1]] || parts[1]}`;
  }

  return key.replace(/_/g, ' ');
};

const CATEGORIES_ICONS: Record<string, any> = {
  Personality: User, Money: Zap, Love: Heart, Intellect: Brain, 
  Talent: Star, Career: Briefcase, Health: Activity, Spirituality: Compass, Destiny: Sparkles
};

const CATEGORIES_LABELS: Record<string, string> = {
  Personality: 'Личность', Money: 'Финансы', Love: 'Любовь', 
  Intellect: 'Интеллект', Talent: 'Таланты', Career: 'Карьера',
  Health: 'Здоровье', Spirituality: 'Дух', Destiny: 'Судьба'
};

const ResultBackgroundGlows = memo(({ natalData }: { natalData: any }) => {
  const shootingStars = useMemo(() => Array.from({ length: 40 }).map(() => ({
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, scale: Math.random() * 0.4 + 0.1,
    duration: Math.random() * 10 + 10, delay: Math.random() * 2
  })), []);
  
  const bgStars = useMemo(() => Array.from({ length: 30 }).map(() => ({
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, scale: Math.random() * 0.3 + 0.3,
    duration: Math.random() * 5 + 5, delay: Math.random() * 1.5
  })), []);

  return (
    <div className="fixed top-0 left-0 w-full h-[100svh] pointer-events-none z-0 overflow-hidden opacity-80">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black z-0" />
      
      <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-purple-900/40 rounded-full blur-[100px] mix-blend-screen z-0" />
      <div className="absolute top-[60%] right-[10%] w-[50vw] h-[50vw] bg-indigo-900/30 rounded-full blur-[120px] mix-blend-screen z-0" />
      <div className="absolute top-[80%] left-[30%] w-[30vw] h-[30vw] bg-gold/10 rounded-full blur-[90px] mix-blend-screen z-0" />
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen z-0" />
      <div className="absolute top-[30%] right-[20%] w-[25vw] h-[25vw] bg-purple-500/15 rounded-full blur-[100px] mix-blend-screen z-0" />

      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[60vh] md:h-[60vh] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen z-0" 
      />

      <div className="absolute left-1/2 top-[8%] -translate-x-1/2 flex items-center justify-center mix-blend-screen opacity-70 z-10 overflow-visible pointer-events-none rounded-full">
          <div className="w-[85vw] h-[85vw] md:w-[60vh] md:h-[60vh] flex items-center justify-center">
              <InteractiveZodiac data={natalData} />
          </div>
      </div>
      
      {shootingStars.map((star, i) => (
         <motion.div
           key={`star-${i}`}
           initial={{ opacity: 0, top: star.top, left: star.left, scale: star.scale }}
           animate={{ y: [0, -200], opacity: [0, 0.5, 0] }}
           transition={{ duration: star.duration, repeat: Infinity, ease: "linear", delay: star.delay }}
           className="absolute w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_10px_1px_rgba(255,255,255,0.5)] z-20"
         />
      ))}

      {bgStars.map((star, i) => (
         <motion.div
           key={`glow-star-${i}`}
           initial={{ opacity: 0, top: star.top, left: star.left, scale: star.scale }}
           animate={{ opacity: [0, 0.4, 0], scale: [1, 1.2, 1] }}
           transition={{ duration: star.duration, repeat: Infinity, ease: "easeInOut", delay: star.delay }}
           className="absolute w-[3px] h-[3px] bg-white rounded-full blur-[1px] z-10"
         />
      ))}
    </div>
  );
});

const StaticCosmicStars = memo(({ stars, count, opacity, size }: { stars: any[], count: number, opacity: number, size: number }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1 }}
    className="fixed top-0 left-0 w-full h-[100svh] z-0 pointer-events-none overflow-hidden"
  >
    {stars.slice(0, count).map((star, i) => (
      <motion.div
        key={`static-star-${i}`}
        initial={{ 
          opacity: star.opacityOffset * (opacity / 2), 
          top: star.top, 
          left: star.left,
          scale: 0.8
        }}
        animate={{ 
          opacity: [star.opacityOffset * 0.2, opacity, star.opacityOffset * 0.2],
          scale: [0.8, star.scaleBase, 0.8],
        }}
        transition={{ 
          duration: star.duration, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: star.delay
        }}
        className="absolute bg-white rounded-full shadow-[0_0_12px_3px_rgba(255,255,255,0.7)]"
        style={{ width: `${star.sizeOffset * size + 1.5}px`, height: `${star.sizeOffset * size + 1.5}px` }}
      />
    ))}
  </motion.div>
));

export default function ExperienceFlow() {
  const { setNatalData, setMbtiData, setUserData, userData, natalData, mbtiResult } = useUserStore();
  const [showAllPlanets, setShowAllPlanets] = useState(false);
  const [step, setStep] = useState<'intro' | 'birth' | 'mbti' | 'result'>(() => {
    // Determine initial step synchronously to avoid flicker
    if (natalData && mbtiResult) return 'result';
    if (userData?.name) return 'mbti';
    if (tgUser?.first_name) return 'mbti'; // Skips intro
    return 'intro';
  });
  const [userName, setUserName] = useState(() => {
     if (userData?.name) return userData.name;
     if (tgUser?.first_name) return tgUser.first_name;
     return '';
  });
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [scores, setScores] = useState<Record<string, number>>({
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
  });
  
  const [showLetters, setShowLetters] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  // useEffect removed to prevent state-jump flicker

  const handleBirthSubmit = async () => {
    if (!startDate || !location) return;
    setLoading(true);
    try {
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const timeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      
      const chart = await calculateNatalData(
        `${year}-${month}-${day}`,
        timeStr,
        location.lat,
        location.lng
      );
      
      const { getDailyHoroscope } = await import('../services/horoscopeService');
      const horoscope = await getDailyHoroscope(chart.planets[0].longitude);
      
      const interpretations = await mapNatalDataToInterpretations(chart);
      
      const birthData = {
        name: userName,
        date: `${year}-${month}-${day}`,
        time: timeStr,
        lat: location.lat,
        lng: location.lng,
        locationName: location.name
      };

      setUserData(birthData);
      setNatalData({
        ...chart,
        ...birthData,
        horoscope,
        interpretations
      });
      
      setStep('result');
      setTimeout(() => {
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (value: number) => {
    const question = EXTENDED_MBTI_QUESTIONS[quizStep];
    const trait = question.dichotomy;
    const oppositeTrait = OPPOSITES[trait];
    
    const newAnswers = { ...answers, [quizStep]: value };
    const newScores = { ...scores };
    
    if (value > 0) newScores[trait] += value;
    else if (value < 0) newScores[oppositeTrait] += Math.abs(value);
    
    setAnswers(newAnswers);
    setScores(newScores);

    if (quizStep < EXTENDED_MBTI_QUESTIONS.length - 1) {
      setTimeout(() => {
        setQuizStep(quizStep + 1);
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    } else {
      setTimeout(() => finalizeMBTI(newScores, newAnswers), 200);
    }
  };

  const finalizeMBTI = (finalScores: Record<string, number>, finalAnswers: Record<number, number>) => {
    const mbti = [
      finalScores.E >= finalScores.I ? 'E' : 'I',
      finalScores.S >= finalScores.N ? 'S' : 'N',
      finalScores.T >= finalScores.F ? 'T' : 'F',
      finalScores.J >= finalScores.P ? 'J' : 'P'
    ].join('');
    
    const stringAnswers: Record<number, string> = {};
    Object.entries(finalAnswers).forEach(([k, v]) => stringAnswers[Number(k)] = String(v));
    setMbtiData(mbti, stringAnswers);
    setStep('birth');
    setTimeout(() => {
       document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const resetAll = () => {
    setStep('intro');
    setUserName('');
    setStartDate(null);
    setLocation(null);
    setQuizStep(0);
    setAnswers({});
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setNatalData(null);
    setMbtiData(null, null);
  };

  const getStarsConfig = (currentStep: string) => {
    if (currentStep === 'intro') return { count: 100, opacity: 0.3, size: 1.2 };
    if (currentStep === 'mbti') return { count: 100, opacity: 0.6, size: 1.8 };
    if (currentStep === 'birth') return { count: 100, opacity: 0.8, size: 2.0 };
    return { count: 100, opacity: 0, size: 0 };
  };
  const starConfig = getStarsConfig(step);

  const displayPoints = useMemo(() => {
    if (!natalData) return [];
    if (natalData.points?.length >= 4) return natalData.points;
    if (natalData.houses?.length >= 12) {
       const getZodiacSignLocal = (long: number) => {
         const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
         return signs[Math.floor(long / 30)] || 'Aries';
       };
       return [
         { name: 'Ascendant', longitude: natalData.houses[0].longitude, sign: getZodiacSignLocal(natalData.houses[0].longitude), degree: Math.floor(natalData.houses[0].longitude % 30) },
         { name: 'Descendant', longitude: natalData.houses[6].longitude, sign: getZodiacSignLocal(natalData.houses[6].longitude), degree: Math.floor(natalData.houses[6].longitude % 30) },
         { name: 'MC', longitude: natalData.houses[9].longitude, sign: getZodiacSignLocal(natalData.houses[9].longitude), degree: Math.floor(natalData.houses[9].longitude % 30) },
         { name: 'IC', longitude: natalData.houses[3].longitude, sign: getZodiacSignLocal(natalData.houses[3].longitude), degree: Math.floor(natalData.houses[3].longitude % 30) }
       ];
    }
    return natalData.points || [];
  }, [natalData]);

  const cosmicStars = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scaleBase: Math.random() * 0.6 + 0.7,
      duration: Math.random() * 8 + 5,
      delay: Math.random() * 2,
      sizeOffset: Math.random(),
      opacityOffset: Math.random()
    }));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center relative">
      
      <AnimatePresence>
        {(step === 'intro' || step === 'mbti' || step === 'birth') && (
          <StaticCosmicStars 
            stars={cosmicStars} 
            count={starConfig.count} 
            opacity={starConfig.opacity} 
            size={starConfig.size} 
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full mb-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="text-center space-y-12 w-full max-w-xl px-4"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-light text-white tracking-tight">Как к вам обращаться?</h2>
              <p className="text-gray-500 text-xs md:text-sm font-light">Представьтесь, чтобы мы могли персонализировать ваш путь.</p>
            </div>
            <div className="space-y-8">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ваше имя..."
                className="w-full bg-transparent border-b border-white/10 px-4 py-4 text-xl md:text-2xl font-light text-white focus:outline-none focus:border-gold/40 transition-colors text-center"
              />
              <button
                disabled={!userName.trim()}
                onClick={() => {
                  setStep('mbti');
                  setTimeout(() => {
                    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 50);
                }}
                className="w-full md:w-auto px-10 py-3.5 border border-white/20 text-white font-light uppercase tracking-[0.2em] rounded-full disabled:opacity-10 transition-all hover:border-gold/40 active:scale-95 text-xs"
              >
                Далее
              </button>
            </div>
          </motion.div>
        )}

        {step === 'birth' && (
          <motion.div
            key="birth"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl space-y-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-light text-white">Привет, {userName}</h2>
              <p className="text-gray-500 text-sm font-light">Нам нужны данные вашего рождения для расчета натальной карты.</p>
            </div>
            
            <div className="space-y-4 md:p-10 py-8 px-4 rounded-[3rem] sm:bg-white/[0.02] sm:border border-white/5 sm:backdrop-blur-3xl transition-all">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                    <Calendar size={12} className="text-gold" /> Дата рождения
                  </label>
                  <CustomDatePicker value={startDate} onChange={setStartDate} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                    <Globe size={12} className="text-gold" /> Город рождения
                  </label>
                  <CityPicker onSelect={(lat, lng, name) => setLocation({ lat, lng, name })} />
                </div>
              </div>

              <div className="pt-8">
                <button
                  disabled={!startDate || !location || loading}
                  onClick={handleBirthSubmit}
                  className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.3em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 text-[10px] md:text-sm"
                >
                  {loading ? 'Синхронизация...' : 'Рассчитать судьбу'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'mbti' && (
          <motion.div
            key="mbti"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl px-4"
          >
            <div className="text-center space-y-4 mb-[30px]">
              <div className="flex justify-center">
                <div className="p-3 md:p-4 bg-purple-500/10 rounded-full border border-purple-500/30 text-purple-400">
                  <Brain size={40} className="md:w-12 md:h-12" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Глубинный Психотест</h2>
              <p className="text-gray-400 text-[10px] md:text-sm uppercase tracking-widest">Вопрос {quizStep + 1} из {EXTENDED_MBTI_QUESTIONS.length}</p>
              
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${((quizStep + 1) / EXTENDED_MBTI_QUESTIONS.length) * 100}%` }}
                   className="h-full bg-purple-400"
                />
              </div>
            </div>

            <div className="min-h-[140px] md:min-h-[180px] flex items-center justify-center px-4 mb-[40px]">
              <motion.h3 
                key={quizStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl md:text-3xl font-light text-white text-center leading-relaxed"
              >
                {EXTENDED_MBTI_QUESTIONS[quizStep].text}
              </motion.h3>
            </div>

            <div className="flex flex-col items-center gap-10">
              <div className="flex items-center justify-between w-full max-w-xl px-4 md:px-0 mb-2">
                 <span className="text-[11px] md:text-sm font-medium text-purple-400 uppercase tracking-widest">Согласен</span>
                 <span className="text-[11px] md:text-sm font-medium text-gold/60 uppercase tracking-widest text-right">Не согласен</span>
              </div>
              
              <div className="flex items-center justify-between w-full max-w-xl px-2">
                {[3, 2, 1, 0, -1, -2, -3].map((val) => {
                  const sizeClass = val === 3 || val === -3 ? 'w-12 h-12 md:w-16 md:h-16' : 
                                    val === 2 || val === -2 ? 'w-10 h-10 md:w-14 md:h-14' : 
                                    val === 1 || val === -1 ? 'w-8 h-8 md:w-10 md:h-10' : 'w-6 h-6 md:w-8 md:h-8';
                  
                  const colorClass = val > 0 ? 'border-purple-500 hover:bg-purple-500/10' : 
                                     val < 0 ? 'border-gold/40 hover:bg-gold/10' : 
                                     'border-gray-400 hover:bg-gray-400/10';
                  
                  const activeColorClass = val > 0 ? 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 
                                           val < 0 ? 'bg-gold/60 shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 
                                           'bg-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.4)]';

                  return (
                    <motion.button
                      key={val}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuizAnswer(val)}
                      className={`relative rounded-full border-2 transition-all duration-300 flex items-center justify-center ${sizeClass} ${colorClass} ${answers[quizStep] === val ? activeColorClass : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'result' && natalData && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full relative pb-10"
          >
             <ResultBackgroundGlows natalData={natalData} />

             <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-0">
                <div className="space-y-12 md:space-y-16">
                    
                     <div className="relative space-y-6 mt-8 md:mt-0">
                        <div className="flex flex-col items-start gap-1 text-gray-400 font-light text-[10px] uppercase tracking-[0.4em] mb-8">
                           <span className="text-gold/80">{natalData.date}</span>
                           <span className="text-white/60 leading-relaxed">{natalData.locationName}</span>
                        </div>
                        <motion.div
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="relative inline-block"
                        >
                           <h2 className="text-4xl md:text-5xl lg:text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 tracking-tighter leading-tight pb-0">
                              <span>Твоя звездная карта,&nbsp;{userName || 'Искатель'}</span>
                           </h2>
                           <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full -z-10 mix-blend-screen opacity-50" />
                        </motion.div>

                        {natalData.horoscope && (
                           <motion.div 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: 0.3 }}
                             className="pt-5"
                           >
                              <div className="pl-6 border-l-2 border-purple-500/40 text-gray-300 text-sm md:text-base font-light leading-relaxed max-w-2xl bg-gradient-to-r from-purple-900/10 to-transparent py-2 text-justify">
                                 <span className="flex items-center gap-2 text-[9px] text-purple-300 uppercase tracking-widest mb-3">
                                    <Sparkles size={10} className="text-gold" />
                                    <span>Энергия дня: <span className="text-gold font-medium">{natalData.horoscope.vibe.toLowerCase().replace(/^\w/, c => c.toUpperCase())}</span></span>
                                 </span>
                                 {natalData.horoscope.text.replace(/^"|"$/g, '').toLowerCase().replace(/^\s*\w/, c => c.toUpperCase())}
                              </div>
                           </motion.div>
                        )}
                     </div>

                    <div className="flex flex-col items-center space-y-16 pt-5 pb-12 border-t border-white/10">
                        <div className="w-full space-y-12">
                           <div className="space-y-4 max-w-3xl text-left px-4 w-full self-start">
                              <h4 className="text-xl md:text-[22px] font-light text-white flex items-center justify-start gap-2 uppercase tracking-[0.4em] text-left">
                                 <Compass size={20} className="text-gold hidden md:block" /> Небесная структура
                              </h4>
                              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light text-left max-w-2xl">
                                 Ваша астральная архитектура — это фундаментальный чертеж духа, определяющий тончайшие настройки личности, врожденные таланты и кармические паттерны взаимодействия с макрокосмосом. Это живая карта вашего предназначения, где каждое положение планет открывает уникальный портал к реализации вашего высшего потенциала.
                              </p>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 w-full max-w-full overflow-hidden">
                                 {(() => {
                                    const allPoints = [...(natalData.planets || []), ...displayPoints];
                                    const uniquePoints = allPoints.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
                                    const sortedPoints = uniquePoints.sort((a, b) => {
                                       const idxA = PLANET_ORDER.indexOf(a.name);
                                       const idxB = PLANET_ORDER.indexOf(b.name);
                                       return (idxA > -1 ? idxA : 999) - (idxB > -1 ? idxB : 999);
                                    });
                                    return (showAllPlanets ? sortedPoints : sortedPoints.slice(0, 3)).map((planet: any) => (
                                       <CelestialStructureTile 
                                         key={planet.name} 
                                         planet={planet} 
                                         interpretations={natalData.interpretations || []} 
                                       />
                                    ));
                                 })()}
                           </div>

                           {!showAllPlanets && (natalData.planets.length + displayPoints.length) > 3 && (
                             <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setShowAllPlanets(true)}
                                className="mt-6 mx-auto flex flex-col items-center gap-2 group transition-all"
                             >
                               <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-gold transition-colors">Показать все планеты</span>
                               <ChevronDown className="text-white/20 group-hover:text-gold group-hover:translate-y-1 transition-all" size={20} />
                             </motion.button>
                           )}

                           {showAllPlanets && (
                             <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setShowAllPlanets(false)}
                                className="mt-8 mx-auto flex flex-col items-center gap-2 group transition-all"
                             >
                               <ChevronUp className="text-white/20 group-hover:text-gold group-hover:-translate-y-1 transition-all" size={20} />
                               <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-gold transition-colors">Свернуть</span>
                             </motion.button>
                           )}
                        </div>

                        <div className="w-full max-w-3xl mx-auto space-y-8 bg-gradient-to-br from-purple-900/10 to-transparent px-4 py-10 md:p-12 rounded-[3rem] border border-white/5 backdrop-blur-sm relative overflow-hidden flex flex-col items-center text-center">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen" />
                           <h3 className="text-xs md:text-sm font-medium text-purple-500 uppercase tracking-[0.5em] flex items-center gap-2 mb-2">
                              <Brain size={16} /> Психо-архетип
                           </h3>
                           <div className="text-7xl md:text-[6.5rem] font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 tracking-tighter leading-none filter drop-shadow-lg mb-6">
                               {mbtiResult}
                           </div>
                           <div className="w-full">
                              <div className="text-lg md:text-xl font-medium text-white/90 uppercase tracking-[0.3em] mb-4 text-center">
                                 {mbtiResult && MBTI_DESCRIPTIONS[mbtiResult]?.title}
                              </div>
                              <p className="text-gray-400 text-[13px] md:text-sm leading-relaxed font-light tracking-[0.08em] text-center">
                                 {mbtiResult && MBTI_DESCRIPTIONS[mbtiResult]?.desc}
                              </p>
                           </div>
                        </div>
                    </div>

                   <div className="max-w-4xl space-y-8 pt-10 md:pt-16 pb-10 border-y border-white/5 w-full">
                       <div className="space-y-6 pt-0">
                          <h3 className="text-xl md:text-3xl font-light text-white uppercase tracking-[0.4em] md:tracking-[0.8em] text-left">Синтез Энергий</h3>
                          <div className="text-lg md:text-2xl text-gray-300 leading-relaxed font-light text-left">
                             <p className="w-full">
                                {getEnergySynthesis(natalData.planets[0].sign, mbtiResult || '')}
                             </p>
                          </div>
                       </div>
                   </div>

                   <div className="space-y-8 pb-10 md:pb-16">
                      <div className="space-y-4">
                         <h3 className="text-xs md:text-sm font-light text-purple-500 uppercase tracking-[0.2em] md:tracking-[0.5em]">Архитектура Психики</h3>
                         <div className="text-xl md:text-2xl text-white font-light uppercase tracking-widest">
                            Детальный разбор типа {mbtiResult}
                         </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                         {mbtiResult?.split('').map((letter: string, i: number) => {
                             const info = MBTI_LETTERS[letter];
                             if (!info) return null;
                             return (
                                <div key={i} className="space-y-2">
                                   <div className="flex items-center gap-3">
                                      <span className="text-2xl md:text-3xl text-purple-500 font-light">{letter}</span>
                                      <div className="text-xs md:text-sm text-white uppercase tracking-widest">{info.label ? info.label.split(' ')[0] : ''}</div>
                                   </div>
                                   <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed">
                                      {info.desc}
                                   </p>
                                </div>
                             )
                         })}
                      </div>
                   </div>

                   <div className="space-y-12 md:space-y-20">
                      {Object.keys(CATEGORIES_LABELS).map((catId) => {
                         const catInterpretations = natalData.interpretations?.filter((i: any) => i.category === catId) || [];
                         if (catInterpretations.length === 0) return null;

                         return (
                            <motion.div 
                               key={catId}
                               initial={{ opacity: 0, y: 20 }}
                               whileInView={{ opacity: 1, y: 0 }}
                               viewport={{ once: true, margin: "-100px" }}
                               className="pt-10 md:pt-16 border-t border-white/5"
                            >
                               <h3 className="text-xl md:text-3xl font-light text-white uppercase tracking-[0.5em] mb-8 md:mb-10">
                                  {CATEGORIES_LABELS[catId]}
                               </h3>

                                <div className="space-y-10 max-w-3xl">
                                   {catInterpretations.map((item: any, idx: number) => {
                                      const textParts = item.content.split(':');
                                      const displayContent = textParts.length > 1 ? textParts.slice(1).join(':').trim() : item.content;

                                      return (
                                         <div key={idx} className="space-y-3">
                                            <div className="text-[9px] font-medium uppercase tracking-[0.4em] text-gold mb-1">
                                               {formatAstroKey(item.key)}
                                            </div>
                                            <p className="text-lg md:text-2xl text-gray-200 font-light leading-snug tracking-tight">
                                               {displayContent}
                                            </p>
                                            {item.detailedContent && (
                                               <p className="text-xs md:text-sm text-gray-500 italic font-light leading-relaxed">
                                                  {item.detailedContent}
                                               </p>
                                            )}
                                         </div>
                                      );
                                   })}
                                </div>
                            </motion.div>
                         );
                      })}
                   </div>

                   <div className="pt-20 flex flex-col items-center gap-8 justify-center">
                       <button 
                         onClick={resetAll}
                         className="px-10 py-4 bg-white/[0.05] border border-white/10 text-white font-light rounded-full hover:bg-white/10 transition-all uppercase tracking-[0.5em] text-[11px] flex items-center justify-center gap-4"
                       >
                          <RefreshCcw size={12} /> Обновить Путь
                       </button>
                    </div>
                 </div>
              </div>
           </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
