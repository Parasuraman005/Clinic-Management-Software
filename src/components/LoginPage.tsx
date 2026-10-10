import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, 
  ChevronDown, UserCircle, 
  Users, ChevronRight 
} from 'lucide-react';
import mediLogo from '../assets/images/medi-logo.jpg';
import { useSharedUsers } from '../hooks/useSharedUsers';
import { UserAccount } from '../types';

export type UserRole = 'Administrator' | 'Doctor' | 'Receptionist' | 'Accountant' | 'Staff';

interface LoginPageProps {
  onLogin: (role: UserRole, user?: UserAccount) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { users, authenticateUser } = useSharedUsers();

  const [role, setRole] = useState<UserRole | ''>('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickFill, setShowQuickFill] = useState(false);

  const roles: UserRole[] = ['Administrator', 'Doctor', 'Receptionist', 'Accountant', 'Staff'];

  // Auto-detect role when typing an exact username or email
  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    setError('');
    
    const trimmed = value.trim().toLowerCase();
    if (trimmed) {
      const match = users.find(u => 
        u.username.toLowerCase() === trimmed || 
        u.email.toLowerCase() === trimmed
      );
      if (match && (!role || role !== match.role)) {
        setRole(match.role as UserRole);
      }
    }
  };

  const handleSelectQuickAccount = (u: UserAccount) => {
    setIdentifier(u.username);
    setPassword(u.password || 'password123');
    setRole(u.role as UserRole);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!identifier.trim()) {
      setError('Please enter your registered username or email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials against the registered Staff & User registry
      const authResult = authenticateUser(identifier, password, role || undefined);

      if (!authResult.success) {
        setIsLoading(false);
        setError(authResult.error || 'Authentication failed.');
        return;
      }

      setIsLoading(false);
      const authenticatedUser = authResult.user!;
      onLogin(authenticatedUser.role as UserRole, authenticatedUser);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-serif p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 border border-slate-200 shadow-xs p-1">
              <img 
                src={mediLogo} 
                alt="MediFlow Logo" 
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=MF&background=0284c7&color=fff&size=128';
                }}
              />
            </div>
            <h1 className="text-[20pt] font-bold text-slate-900 tracking-tight">MedFlow Pro</h1>
            <p className="text-slate-500 text-[11pt]">Clinic Management System</p>
            
            {/* Live Staff Registry Connection Indicator */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9pt] font-sans font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Staff Registry Connected · {users.length} Registered Accounts</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs leading-relaxed"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {/* Role Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10pt] font-bold text-slate-700 uppercase tracking-wider block font-serif">
                  Role
                </label>
                <span className="text-[9pt] text-slate-400 font-sans">
                  {role ? `Selected: ${role}` : 'Auto-detected on username'}
                </span>
              </div>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as UserRole);
                    setError('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-10 text-xs font-sans text-slate-800 focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select or auto-detect role...</option>
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Username/Email */}
            <div className="space-y-1.5">
              <label className="text-[10pt] font-bold text-slate-700 uppercase tracking-wider block font-serif">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  placeholder="e.g. jsmith_admin or admin@medflow.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-800 focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary outline-none transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10pt] font-bold text-slate-700 uppercase tracking-wider block font-serif">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-11 text-xs font-sans text-slate-800 focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary outline-none transition-all"
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-medical-primary text-white rounded-xl font-bold text-[11pt] font-serif shadow-lg shadow-medical-primary/20 hover:bg-medical-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>LOGIN</span>
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Registered Accounts Helper Drawer */}
          <div className="mt-5 pt-4 border-t border-slate-100 font-sans text-xs">
            <button 
              type="button"
              onClick={() => setShowQuickFill(!showQuickFill)}
              className="w-full flex items-center justify-between text-slate-600 hover:text-slate-900 font-bold p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <Users size={14} className="text-medical-primary" />
                <span>Registered Staff Quick Credentials ({users.length})</span>
              </span>
              <ChevronDown size={14} className={`transition-transform ${showQuickFill ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showQuickFill && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-1.5 overflow-hidden max-h-52 overflow-y-auto pr-1"
                >
                  <p className="text-[10px] text-slate-400 px-1">
                    Click any registered personnel to auto-fill their username, role and password:
                  </p>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectQuickAccount(u)}
                      className="w-full text-left p-2 rounded-xl border border-slate-200 hover:border-medical-primary hover:bg-blue-50/50 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-[11px] truncate">{u.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-slate-100 text-slate-600">
                            {u.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          @{u.username} · pwd: {u.password || 'password123'}
                        </div>
                      </div>
                      <span className="text-medical-primary opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                        <span>Fill</span>
                        <ChevronRight size={12} />
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-slate-400 text-[9pt] uppercase tracking-widest font-bold">
              © 2023 MedFlow Pro v2.4.0
            </p>
            {typeof window !== 'undefined' && window.electronAPI?.isElectron && (
              <button
                type="button"
                onClick={() => window.electronAPI?.close()}
                className="text-[10pt] text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center gap-1 font-sans cursor-pointer"
                title="Close Application (Alt+F4)"
              >
                Exit Application (Alt+F4)
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
