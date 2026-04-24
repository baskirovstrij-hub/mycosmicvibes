import { motion } from 'motion/react';
import { Sparkles, Star, User, Heart, Zap, Users, Brain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { feedback } from '../lib/haptics';

const Asteroid = () => {
  const [flight, setFlight] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    angle: 0,
    duration: 4,
    delay: 2,
    key: 0
  });

  useEffect(() => {
    generateFlight(1);
  }, []);

  const generateFlight = (k: number) => {
    const side = Math.random() < 0.5 ? 1 : 3; // 1 = right to left, 3 = left to right
    const w = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const h = typeof window !== 'undefined' ? window.innerHeight : 1000;
    
    const offset = 400; // Large offset to ensure it starts and ends completely off-screen
    
    // Start Y near the middle (30% to 70% of screen height)
    const sy = h * 0.3 + Math.random() * (h * 0.4);
    
    // Ensure a small but noticeable angle. dy should be ~10% to 30% of dx.
    const dxMag = w + 2 * offset;
    const dyMag = dxMag * (Math.random() * 0.2 + 0.1); 
    const dy = Math.random() < 0.5 ? dyMag : -dyMag; // random up or down direction

    const ey = sy + dy;
    let sx = 0, ex = 0;
    
    switch (side) {
      case 1: sx = w + offset; ex = -offset; break; // right to left
      case 3: sx = -offset; ex = w + offset; break; // left to right
    }

    const dx = ex - sx;
    const angle = Math.atan2(ey - sy, dx) * (180 / Math.PI);
    
    setFlight({
      startX: sx,
      startY: sy,
      endX: ex,
      endY: ey,
      angle: angle,
      duration: Math.random() * 2 + 2.5, // slightly faster
      delay: Math.random() * 3 + 4, // 4 to 7 sec between flights
      key: k
    });
  };

  if (flight.key === 0) return null;

  return (
    <motion.div
       key={flight.key}
       initial={{ x: flight.startX, y: flight.startY, opacity: 0 }}
       animate={{ x: flight.endX, y: flight.endY, opacity: [0, 1, 1, 0] }}
       transition={{ 
         duration: flight.duration, 
         delay: flight.delay, 
         ease: "linear",
         times: [0, 0.05, 0.95, 1] 
       }}
       onAnimationComplete={() => generateFlight(flight.key + 1)}
       className="absolute z-0 w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_15px_3px_rgba(255,255,255,0.8)]"
    >
       <div 
         className="absolute top-1/2 right-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent to-white/60 origin-right blur-[1px]"
         style={{ transform: `translateY(-50%) rotate(${flight.angle}deg)` }}
       />
    </motion.div>
  );
};

const AmbientStars = () => {
  const stars = useState(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
    size: Math.random() * 2 + 0.5,
    color: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'rgba(234, 179, 8, 0.6)' : 'rgba(168, 85, 247, 0.6)') : 'rgba(255, 255, 255, 0.6)'
  })))[0];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.1, scale: 0.8 }}
          animate={{ opacity: [0.1, 0.6, 0.1], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute rounded-full blur-[0.3px]"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: star.color.replace('0.6', '1')
          }}
        />
      ))}
    </div>
  );
};

const NebulaCloud = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <motion.div 
        animate={{ 
          x: [0, 60, 0], 
          y: [0, -40, 0],
          rotate: [0, 8, 0]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_30%_30%,_rgba(168,85,247,0.15)_0%,_transparent_50%)] blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          x: [0, -50, 0], 
          y: [0, 50, 0],
          rotate: [0, -6, 0]
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 -right-1/4 w-[140%] h-[140%] bg-[radial-gradient(circle_at_70%_70%,_rgba(212,175,55,0.1)_0%,_transparent_40%)] blur-[140px]" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.05)_0%,_transparent_70%)]"
      />
    </div>
  );
};

interface HomeProps {
  onNavigate: (mode: 'form' | 'synastry' | 'chart' | 'mbti' | 'profile') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <section className="relative flex-1 w-full flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Mystical Background Elements */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <NebulaCloud />
        <AmbientStars />
        <Asteroid />

        <div className="absolute w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[140px]" />
        
        {/* Unified Orbiting System - Perfectly centered */}
        <div className="absolute w-[450px] h-[450px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px]">
          {/* Visible Orbital Axis */}
          <div className="absolute inset-0 border border-white/10 rounded-full" />
          
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            {/* Parallel Star 1 (Top) */}
            <div className="absolute top-[0%] left-[50%] w-3 h-3 md:w-4 md:h-4 bg-gold rounded-full shadow-[0_0_20px_5px_rgba(255,215,0,0.4)]" style={{ transform: 'translate(-50%, -50%)' }} />
            
            {/* Parallel Star 2 (Bottom - Diametrically Opposite) */}
            <div className="absolute top-[100%] left-[50%] w-3 h-3 md:w-4 md:h-4 bg-purple-500 rounded-full shadow-[0_0_20px_5px_rgba(168,85,247,0.4)]" style={{ transform: 'translate(-50%, -50%)' }} />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center space-y-8 md:space-y-10 w-full max-w-3xl px-4 pointer-events-none *:pointer-events-auto"
      >
        <div className="space-y-6 text-center">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-[0.2em] text-white/90 lowercase drop-shadow-lg flex items-center justify-center max-w-[300px] sm:max-w-full mx-auto"
          >
            cosmic<span className="text-purple-400 font-light">vibes</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[10px] md:text-sm text-gray-400 max-w-xs md:max-w-lg mx-auto font-light leading-relaxed px-4 md:px-6 tracking-wide"
          >
            Раскройте архитектуру своей души через сакральное слияние звездной навигации и глубинной психологии.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-2"
        >
          <button
            onClick={() => {
               feedback.light();
               onNavigate('form');
            }}
            className="group relative px-10 py-5 border border-white/10 text-white font-light uppercase tracking-[0.3em] rounded-full overflow-hidden hover:border-gold/40 hover:bg-white/[0.02] transition-all duration-700 text-[10px] md:text-xs backdrop-blur-sm shadow-[0_0_20px_0_rgba(0,0,0,0.5)] active:scale-95"
          >
            <span className="relative z-10">Начать путь</span>
          </button>
        </motion.div>

         {/* Floating Concept Pillars - Perfectly Centered underneath */}
        <div className="pt-8 md:pt-12 flex items-center justify-center gap-4 sm:gap-8 md:gap-16 opacity-30 hover:opacity-60 transition-opacity duration-1000">
           <div className="text-center">
              <div className="text-[8px] md:text-[10px] text-white font-light uppercase tracking-[0.2em] md:tracking-[0.4em]">карта</div>
           </div>
           <div className="w-[1px] h-3 bg-white/20" />
           <div className="text-center">
              <div className="text-[8px] md:text-[10px] text-white font-light uppercase tracking-[0.2em] md:tracking-[0.4em]">психотип</div>
           </div>
           <div className="w-[1px] h-3 bg-white/20" />
           <div className="text-center">
              <div className="text-[8px] md:text-[10px] text-white font-light uppercase tracking-[0.2em] md:tracking-[0.4em]">судьба</div>
           </div>
        </div>
      </motion.div>
    </section>
  );
}

function MenuCard({ icon, title, desc, color, borderColor, hoverColor, onClick, delay }: any) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative flex flex-col items-center text-center p-5 rounded-2xl bg-gradient-to-b ${color} border ${borderColor} ${hoverColor} transition-all overflow-hidden backdrop-blur-sm`}
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="mb-3 p-3 rounded-xl bg-black/40 text-white group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{desc}</p>
    </motion.button>
  );
}
