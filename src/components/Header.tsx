import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, Heart, Zap, Menu, X, Users, Brain, Orbit } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onNavigate: (mode: 'home' | 'experience' | 'synastry' | 'profile' | 'analysis') => void;
  currentMode: string;
  hasUserData: boolean;
}

export default function Header({ onNavigate, currentMode, hasUserData }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const mainElement = document.querySelector('main');
    const handleScroll = () => {
      if (mainElement) {
        setIsScrolled(mainElement.scrollTop > 20);
      }
    };
    
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const menuItems = [
    { id: 'experience', label: 'Мой Путь', icon: User, color: 'text-amber-500' },
    { id: 'analysis', label: 'Разбор', icon: Brain, color: 'text-emerald-500' },
    { id: 'synastry', label: 'Совместимость', icon: Heart, color: 'text-red-500' },
  ];

  const getThemeColor = (mode: string) => {
    switch (mode) {
      case 'synastry': return 'red-500';
      case 'analysis': return 'emerald-500';
      case 'experience': return 'amber-500';
      default: return 'purple-500';
    }
  };

  const themeColor = getThemeColor(currentMode);
  const logoColor = `text-${themeColor}`;
  const logoHoverColor = `group-hover:text-${themeColor.replace('500', '400')}`;
  const logoBgColor = `bg-${themeColor}/10`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="relative flex items-center justify-center p-1 transition-all duration-300">
             <Orbit size={28} className={`${logoColor} ${logoHoverColor} transition-colors md:w-6 md:h-6`} />
             <div className={`absolute inset-0 rounded-xl ${logoBgColor} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </div>
          <motion.div 
             initial={false}
             animate={{ 
                width: isScrolled ? 0 : 'auto',
                opacity: isScrolled ? 1 : 1, // Keep opacity to avoid flicker, let width handle it
                marginRight: isScrolled ? 0 : 8,
             }}
             transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
             className="overflow-hidden whitespace-nowrap"
          >
            <span className="text-lg font-medium tracking-[0.2em] text-white/90 group-hover:text-white transition-colors pl-2">Cosmic<span className={`${logoColor} font-light group-hover:text-amber-200 transition-colors`}>Vibes</span></span>
          </motion.div>
        </motion.div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all text-sm font-light ${
                currentMode === item.id 
                  ? 'bg-white/5 text-white' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <item.icon size={14} className={item.color} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Toggle - Simple & Performant */}
        <button 
          className="md:hidden w-10 h-10 flex items-center justify-center text-gray-400 active:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay - Optimized for Mobile Performance */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ willChange: 'transform, opacity' }}
            className="md:hidden fixed inset-x-0 top-16 z-40 px-6 pt-2 pointer-events-none"
          >
            <div className="rounded-[2rem] bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden pointer-events-auto">
              {/* Simplified content to avoid GPU lag */}
              <div className="relative p-2 space-y-0.5">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id as any);
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-4 rounded-2xl flex items-center gap-4 text-white font-light active:bg-white/5 transition-all text-sm"
                  >
                    <item.icon size={18} className={`${item.color} opacity-80`} />
                    <span className="tracking-[0.2em] uppercase text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Click away area */}
            <div 
               className="inset-0 h-screen mt-2 pointer-events-auto" 
               onClick={() => setIsMenuOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
