import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Appointments from './components/Appointments';
import Queue from './components/Queue';
import Consultation from './components/Consultation';
import Billing from './components/Billing';
import Doctors from './components/Doctors';
import Reports from './components/Reports';
import Staff from './components/Staff';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import Prescription from './components/Prescription';
import Payments from './components/Payments';
import AboutMediFlow from './components/AboutMediFlow';
import NotFound from './components/NotFound';
import ServerError from './components/ServerError';
import ThankYou from './components/ThankYou';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import LoginPage, { UserRole } from './components/LoginPage';
import ToastContainer, { ToastMessage, ToastType } from './components/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { initializeAllLocalStorage } from './utils/localJsonStorage';

export default function App() {
  const [appState, setAppState] = useState<'splash' | 'login' | 'authenticated'>('splash');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  React.useEffect(() => {
    const titles: Record<string, { title: string; desc: string }> = {
      dashboard: { title: 'Dashboard – MedFlow Pro', desc: 'Overview of hospital metrics, daily patient flow, and clinical analytics.' },
      patients: { title: 'Patient Directory – MedFlow Pro', desc: 'Manage patient health records, medical histories, and personal details.' },
      appointments: { title: 'Appointments & Schedule – MedFlow Pro', desc: 'Schedule, reschedule, and track doctor appointments across departments.' },
      queue: { title: 'Live Queue & Token Management – MedFlow Pro', desc: 'Real-time patient queue and OPD token management system.' },
      doctors: { title: 'Medical Staff & Doctors – MedFlow Pro', desc: 'Directory of attending physicians, specialists, and working hours.' },
      records: { title: 'Electronic Health Records – MedFlow Pro', desc: 'Consultation notes, diagnoses, prescriptions, and lab reports.' },
      prescriptions: { title: 'Prescriptions & Pharmacy – MedFlow Pro', desc: 'Digital prescription management and pharmacy dispensing.' },
      billing: { title: 'Billing & Invoices – MedFlow Pro', desc: 'Generate and manage patient invoices, insurance claims, and payments.' },
      payments: { title: 'Payment Processing – MedFlow Pro', desc: 'Track settlement records, receipts, and financial reconciliation.' },
      reports: { title: 'Clinical & Financial Reports – MedFlow Pro', desc: 'Detailed analytics on patient admissions, revenue, and hospital operations.' },
      staff: { title: 'Staff & User Management – MedFlow Pro', desc: 'Administer internal roles, permissions, and department assignments.' },
      settings: { title: 'System Settings – MedFlow Pro', desc: 'Configure hospital branch parameters, security, and preferences.' },
      notifications: { title: 'Notifications & Alerts – MedFlow Pro', desc: 'System alerts, emergency broadcasts, and task notifications.' },
      help: { title: 'Help & Support – MedFlow Pro', desc: 'Documentation, FAQ, and technical support ticketing.' },
      about: { title: 'About MediFlow Pro', desc: 'Learn about MedFlow Pro enterprise healthcare administration software.' },
      policies: { title: 'Terms & Privacy Policies – MedFlow Pro', desc: 'Compliance, HIPAA guidelines, and terms of service.' },
      '404': { title: 'Page Not Found (404) – MedFlow Pro', desc: 'The requested clinical record or module could not be found.' },
      '500': { title: 'Server Error (500) – MedFlow Pro', desc: 'An unexpected server interruption occurred.' },
      thankyou: { title: 'Submission Successful – MedFlow Pro', desc: 'Your clinical data has been securely recorded.' }
    };

    const current = titles[activeTab] || {
      title: 'MedFlow Pro – Enterprise Clinic Management System',
      desc: 'Professional healthcare administration platform.'
    };

    document.title = current.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', current.desc);
    }
  }, [activeTab]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogin = (role: UserRole) => {
    setAppState('authenticated');
    addToast('success', 'Login Successful', `Welcome back, ${role}. Secure EHR session established.`);
    
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
          setAppState('login');
          addToast('info', 'Session Terminated', 'You have been securely logged out.');
        }}
      />
      
      <div className="flex-1 lg:ml-20 flex flex-col h-screen overflow-hidden min-w-0">
        <Header setIsOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
        
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
    </div>
  );
}
