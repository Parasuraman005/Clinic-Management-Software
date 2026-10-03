import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
      setTimeout(onFinish, 800);
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: exit ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden font-serif"
    >
      {/* Background Decor Image with fallback */}
      <div className="absolute inset-0 opacity-15 mix-blend-overlay">
        <img 
          src="/src/assets/images/medical_office_background_1790961124610.jpg" 
          alt="Background" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Subtle glowing orb */}
      <div className="absolute w-[500px] h-[500px] bg-medical-primary/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        {/* Logo Container */}
        <div className="w-28 h-28 md:w-36 md:h-36 mb-6 relative">
          <div className="absolute inset-0 bg-medical-primary rounded-3xl blur-2xl opacity-40 animate-pulse" />
          <img 
            src="/src/assets/images/clinic_logo_minimal_1790833437046.jpg" 
            alt="MedFlow Logo" 
            className="w-full h-full object-contain relative z-10 rounded-3xl shadow-2xl border border-white/10 bg-white"
            onError={(e) => {
              e.currentTarget.src = 'https://ui-avatars.com/api/?name=MF&background=0284c7&color=fff&size=256';
            }}
          />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            MedFlow Pro
          </h1>
          <p className="text-sm md:text-base text-slate-300 font-sans tracking-wide">
            Enterprise Clinic & Hospital Management System
          </p>
        </div>

        {/* Loading Spinner / Dots */}
        <div className="mt-10 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-medical-primary rounded-full"
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom Footer & Skip Action */}
      <div className="absolute bottom-10 left-0 right-0 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-slate-400 max-w-5xl mx-auto z-20">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>NABH Compliant · AES-256 Secure Node</span>
        </div>

        <button
          onClick={() => {
            setExit(true);
            setTimeout(onFinish, 400);
          }}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all flex items-center gap-1.5"
        >
          <span>Enter System</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
