import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Wallet, Heart, Brain, Trophy, 
  Share2, Check, Copy, Sparkles, ChevronDown, ChevronUp, Info,
  Briefcase, Activity, ShieldCheck, Compass
} from 'lucide-react';

interface Interpretation {
  category: string;
  key: string;
  content: string;
  detailedContent?: string | null;
}

interface ReadingDashboardProps {
  data: Interpretation[];
  onTabChange?: (tabId: string) => void;
}

export const CATEGORIES = [
  { id: 'Personality', icon: User, label: 'Личность' },
  { id: 'Money', icon: Wallet, label: 'Деньги' },
  { id: 'Love', icon: Heart, label: 'Любовь' },
  { id: 'Intellect', icon: Brain, label: 'Ум' },
  { id: 'Talent', icon: Trophy, label: 'Таланты' },
  { id: 'Career', icon: Briefcase, label: 'Карьера' },
  { id: 'Health', icon: Activity, label: 'Здоровье' },
  { id: 'Spirituality', icon: Compass, label: 'Духовность' },
  { id: 'Destiny', icon: Sparkles, label: 'Предназначение' }
];

const formatKey = (key: string) => {
  const parts = key.split('_');
  if (parts.length === 2) {
    // Planet_Sign
    return `${translatePlanet(parts[0])} в ${translateSign(parts[1])}`;
  }
  if (parts.length === 3) {
    if (parts[0] === 'House') {
      // House_N_Sign
      return `${parts[1]}-й дом в ${translateSign(parts[2])}`;
    }
    if (parts[1] === 'House') {
      // Planet_House_N
      return `${translatePlanet(parts[0])} в ${parts[2]}-м доме`;
    }
    // Planet1_Planet2_Aspect
    return `${translatePlanet(parts[0])} и ${translatePlanet(parts[1])}: ${translateAspect(parts[2])}`;
  }
  return key;
};

const translatePlanet = (p: string) => {
  const map: Record<string, string> = {
    Sun: 'Солнце', Moon: 'Луна', Mercury: 'Меркурий', Venus: 'Венера',
    Mars: 'Марс', Jupiter: 'Юпитер', Saturn: 'Сатурн', Uranus: 'Уран',
    Neptune: 'Нептун', Pluto: 'Плутон'
  };
  return map[p] || p;
};

const translateSign = (s: string) => {
  const map: Record<string, string> = {
    Aries: 'Овне', Taurus: 'Тельце', Gemini: 'Близнецах', Cancer: 'Раке',
    Leo: 'Льве', Virgo: 'Деве', Libra: 'Весах', Scorpio: 'Скорпионе',
    Sagittarius: 'Стрельце', Capricorn: 'Козероге', Aquarius: 'Водолее', Pisces: 'Рыбах'
  };
  return map[s] || s;
};

const translateAspect = (a: string) => {
  const map: Record<string, string> = {
    Conjunction: 'Соединение', Opposition: 'Оппозиция', Trine: 'Трин',
    Square: 'Квадрат', Sextile: 'Секстиль'
  };
  return map[a] || a;
};

export default function ReadingDashboard({ data, onTabChange }: ReadingDashboardProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };
  const [copied, setCopied] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const groupedData = data.reduce((acc: Record<string, Interpretation[]>, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const activeContent = activeTab ? (groupedData[activeTab] || []) : [];
  const activeCategory = CATEGORIES.find(c => c.id === activeTab);

  return (
    <div className="w-full space-y-4">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 sm:bg-white/[0.02] sm:border border-white/5 sm:rounded-2xl sm:backdrop-blur-xl">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          const hasContent = (groupedData[cat.id]?.length || 0) > 0;

          return (
            <button
              key={cat.id}
              onClick={() => handleTabClick(cat.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl transition-all relative
                ${isActive ? 'text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}
                ${!hasContent && !isActive ? 'opacity-30' : ''}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                />
              )}
              <Icon size={14} className={isActive ? 'text-gold' : 'text-gray-600'} />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[200px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab || 'welcome'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {!activeTab ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-4 text-center border-2 border-dashed border-white/5 rounded-2xl"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles size={32} className="text-gold" />
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Ваша натальная карта</h3>
                  <p className="max-w-xs mx-auto text-sm">Выберите категорию выше, чтобы открыть тайные свитки вашей судьбы.</p>
                </div>
              </motion.div>
            ) : activeContent.length > 0 ? (
              activeContent.map((item, idx) => {
                const isExpanded = expandedKeys.has(`${item.key}-${idx}`);
                const hasDetails = !!item.detailedContent;

                return (
                  <motion.div
                    key={`${activeTab}-${item.key}-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ 
                      y: -2, 
                      backgroundColor: '#ffffff14',
                      borderColor: '#ffd7004d' 
                    }}
                    whileTap={{ scale: 0.995 }}
                    transition={{ 
                      delay: idx * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    className={`
                      p-4 md:p-6 rounded-[1.5rem] bg-white/[0.03] border border-white/5 transition-all group relative overflow-hidden backdrop-blur-sm
                      ${hasDetails ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => hasDetails && toggleExpand(`${item.key}-${idx}`)}
                  >
                    {/* Subtle background glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="flex flex-col gap-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gold/80 font-bold text-[10px] uppercase tracking-[0.2em]">
                          {formatKey(item.key)}
                        </div>
                        {hasDetails && (
                          <div className="text-gray-500 group-hover:text-gold transition-colors">
                            <motion.div
                              animate={isExpanded ? { rotate: 180 } : { rotate: 0 }}
                            >
                              <ChevronDown size={14} />
                            </motion.div>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-200 leading-relaxed text-[15px] md:text-lg font-light">
                        {item.content}
                      </p>
                      
                      {hasDetails && !isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="pl-4 mt-1"
                        >
                          <button 
                            className="text-gold/60 text-[10px] font-bold flex items-center gap-1 hover:text-gold transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(`${item.key}-${idx}`);
                            }}
                          >
                            <Info size={12} />
                            Раскрыть тайну
                          </button>
                        </motion.div>
                      )}
                      
                      <AnimatePresence>
                        {isExpanded && item.detailedContent && (
                          <motion.div
                            key="details"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-white/5 pl-4">
                              <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase mb-1.5">
                                <Info size={10} />
                                Глубинное толкование
                              </div>
                              <p className="text-gray-400 text-sm leading-relaxed italic">
                                {item.detailedContent}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-3 border-2 border-dashed border-white/5 rounded-2xl"
              >
                <div className="p-3 rounded-full bg-white/5">
                  {activeCategory && React.createElement(activeCategory.icon, { size: 24 })}
                </div>
                <p className="text-sm">Звезды молчат в этой сфере...</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
