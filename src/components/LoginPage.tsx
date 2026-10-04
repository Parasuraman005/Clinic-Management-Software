import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ChevronDown, UserCircle } from 'lucide-react';

export type UserRole = 'Administrator' | 'Doctor' | 'Receptionist' | 'Accountant' | 'Staff';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roles: UserRole[] = ['Administrator', 'Doctor', 'Receptionist', 'Accountant', 'Staff'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!role) {
      setError('Please select your role.');
      return;
    }

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, validation happens here
      if (email.includes('error')) {
         setError('Invalid username or password.');
      } else {
         onLogin(role as UserRole);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-serif p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-medical-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-medical-primary/20">
              <img 
                src="/src/assets/images/clinic_logo_minimal_1790833437046.jpg" 
                alt="Logo" 
                className="w-10 h-10 object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=MF&background=0284c7&color=fff&size=128';
                }}
              />
            </div>
            <h1 className="text-[20pt] font-bold text-slate-900 tracking-tight">MedFlow Pro</h1>
            <p className="text-slate-500 text-[11pt]">Clinic Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 text-[10pt]"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-[10pt] font-bold text-slate-700 uppercase tracking-wider block">Role</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-10 text-[11pt] focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select role...</option>
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Username/Email */}
            <div className="space-y-1.5">
              <label className="text-[10pt] font-bold text-slate-700 uppercase tracking-wider block">Username or Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin or admin@clinic.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-[11pt] focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10pt] font-bold text-slate-700 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-11 text-[11pt] focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary outline-none transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-medical-primary text-white rounded-xl font-bold text-[12pt] shadow-lg shadow-medical-primary/20 hover:bg-medical-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  LOGIN
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[9pt] uppercase tracking-widest font-bold">
              © 2023 MedFlow Pro v2.4.0
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
