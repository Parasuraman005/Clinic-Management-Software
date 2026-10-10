import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import clinicLogo from '../assets/images/medi-logo.jpg';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [exit, setExit] = useState(false);
  const hasFinishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const proceedToLogin = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setExit(true);
    setTimeout(() => {
      onFinishRef.current();
    }, 450);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      proceedToLogin();
    }, 2400);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        proceedToLogin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: exit ? 0 : 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      onClick={proceedToLogin}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F4F7FB] text-slate-800 overflow-hidden select-none cursor-pointer p-4"
    >
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} 
      />

      {/* Atmospheric Soft Ambient Lighting */}
      <div className="absolute w-[500px] h-[500px] bg-medical-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Branding: App Logo + App Name */}
      <motion.div
        initial={{ y: 15, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* App Logo */}
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-white p-4 shadow-[0_15px_35px_-5px_rgba(2,132,199,0.18),0_5px_15px_-5px_rgba(0,0,0,0.05)] border border-slate-200/80 flex items-center justify-center">
            <img 
              src={clinicLogo} 
              alt="MedFlow Pro Logo" 
              className="w-full h-full object-contain rounded-2xl"
              onError={(e) => {
                e.currentTarget.src = 'https://ui-avatars.com/api/?name=MedFlow&background=0284c7&color=fff&size=256';
              }}
            />
          </div>
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-baseline"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-serif">
            MedFlow<span className="text-medical-primary">.</span>Pro
          </h1>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
