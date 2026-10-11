import React, { useState } from 'react';
import {
  Sidebar,
  Header,
  Dashboard,
  Patients,
  Appointments,
  Queue,
  Consultation,
  Billing,
  Doctors,
  Reports,
  Staff,
  Settings,
  Notifications,
  Prescription,
  Payments,
  AboutMediFlow,
  NotFound,
  ServerError,
  ThankYou,
  Footer,
  SplashScreen,
  LoginPage,
  type UserRole,
  ToastContainer,
  type ToastMessage,
  type ToastType,
  UpdateModal,
  KeyboardShortcutsModal
} from './components';
import { motion, AnimatePresence } from 'motion/react';
import { initializeAllLocalStorage, applyLocalSeo } from './utils';
import { UserAccount } from './types';


export default function App() {
  const [appState, setAppState] = useState<'splash' | 'login' | 'authenticated'>('splash');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Global Keyboard Shortcuts Listener
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowShortcutsModal(false);
        return;
      }

      if (e.altKey && appState === 'authenticated') {
        const key = e.key.toLowerCase();
        switch (key) {
          case 'd':
            e.preventDefault();
            setActiveTab('dashboard');
            break;
          case 'p':
            e.preventDefault();
            setActiveTab('patients');
            break;
          case 'a':
            e.preventDefault();
            setActiveTab('appointments');
            break;
          case 'q':
            e.preventDefault();
            setActiveTab('queue');
            break;
          case 'c':
            e.preventDefault();
            setActiveTab('consultation');
            break;
          case 'r':
            e.preventDefault();
            setActiveTab('prescriptions');
            break;
          case 'b':
            e.preventDefault();
            setActiveTab('billing');
            break;
          case 'n':
            e.preventDefault();
            setActiveTab('payments');
            break;
          case 's':
            e.preventDefault();
            setActiveTab('settings');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [appState]);

  // Initialize Local JSON Storage Engine on app start
  React.useEffect(() => {
    initializeAllLocalStorage();
  }, []);

  const handleSplashFinish = React.useCallback(() => {
    setAppState('login');
  }, []);

  React.useEffect(() => {
    if (appState !== 'authenticated') return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [appState]);

  // Dynamic Local SEO optimization across all pages
  React.useEffect(() => {
    applyLocalSeo(activeTab);
  }, [activeTab]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogin = (role: UserRole, user?: UserAccount) => {
    setAppState('authenticated');
    if (user) {
      setCurrentUser(user);
    }
    const displayName = user ? `${user.name} (${role})` : role;
    addToast('success', 'Login Successful', `Welcome back, ${displayName}. Verified against Staff Registry.`);
    
    switch (role) {
      case 'Administrator': setActiveTab('dashboard'); break;
      case 'Doctor': setActiveTab('queue'); break;
      case 'Receptionist': setActiveTab('patients'); break;
      case 'Accountant': setActiveTab('billing'); break;
      case 'Staff': setActiveTab('dashboard'); break;
      default: setActiveTab('dashboard'); break;
    }
  };

  if (appState === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'patients':
        return <Patients setActiveTab={setActiveTab} />;
      case 'appointments':
        return <Appointments setActiveTab={setActiveTab} />;
      case 'queue':
        return <Queue setActiveTab={setActiveTab} />;
      case 'doctors':
        return <Doctors setActiveTab={setActiveTab} />;
      case 'reports':
        return <Reports />;
      case 'staff':
        return <Staff />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <Notifications />;
      case 'help':
        return <AboutMediFlow initialSubTab="help" />;
      case 'about':
        return <AboutMediFlow initialSubTab="overview" />;
      case 'policies':
        return <AboutMediFlow initialSubTab="policies" />;
      case '404':
        return <NotFound setActiveTab={setActiveTab} />;
      case '500':
        return <ServerError setActiveTab={setActiveTab} />;
      case 'thankyou':
        return <ThankYou setActiveTab={setActiveTab} onNewSubmission={() => setActiveTab('patients')} />;
      case 'prescriptions':
        return <Prescription setActiveTab={setActiveTab} />;
      case 'consultation':
      case 'records':
        return <Consultation setActiveTab={setActiveTab} />;
      case 'billing':
        return <Billing setActiveTab={setActiveTab} />;
      case 'payments':
        return <Payments />;
      default:
        return <NotFound setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-medical-bg font-serif overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        onLogout={() => {
          setCurrentUser(null);
          setAppState('login');
          addToast('info', 'Session Terminated', 'You have been securely logged out.');
        }}
      />
      
      <div className="flex-1 lg:ml-20 flex flex-col h-screen overflow-hidden min-w-0">
        <Header 
          setIsOpen={setSidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentUser={currentUser} 
          onOpenShortcuts={() => setShowShortcutsModal(true)}
        />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-[1600px] mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          <Footer currentTime={currentTime} />
        </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <UpdateModal />
      <KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </div>
  );
}
