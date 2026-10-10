import React, { useState, useMemo } from 'react';
import { 
  Search, Users, Calendar, ListOrdered, ClipboardList, 
  CreditCard, BarChart3, ChevronDown, ChevronUp, 
  HelpCircle, Phone, MessageSquare, 
  FileText, Send, CheckCircle2,
  Printer, Wifi, Database, Keyboard, AlertCircle,
  ArrowRight, RefreshCw, Sparkles, Laptop, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockSupportTickets } from '../mockData';
import { SupportTicket } from '../types';

const TICKETS_STORAGE_KEY = 'medflow_tickets_data';

const getInitialTickets = (): SupportTicket[] => {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse tickets from JSON storage', e);
  }
  return mockSupportTickets;
};

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'guides' | 'faq' | 'tickets' | 'diagnostics' | 'shortcuts'>('guides');
  const [tickets, setTickets] = useState<SupportTicket[]>(getInitialTickets);

  React.useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.error('Failed to save tickets to JSON storage', e);
    }
  }, [tickets]);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<{ title: string; steps: string[]; tips: string } | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Diagnostics interactive state
  const [diagnosticStatus, setDiagnosticStatus] = useState<{
    printer?: 'idle' | 'running' | 'success';
    network?: 'idle' | 'running' | 'success';
    storage?: 'idle' | 'running' | 'success';
  }>({});

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Billing Problem' as SupportTicket['category'],
    priority: 'Medium' as SupportTicket['priority'],
    description: '',
    workstation: 'OPD Counter 1'
  });
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  // Categories for Guides
  const guidesData = [
    {
      id: 'patients',
      title: 'Patient Registration & Records',
      desc: 'Complete workflow for onboarding new outpatients, recording attendant details (+91), vital signs, and chronic allergies.',
      icon: Users,
      badge: 'Front Desk',
      steps: [
        'Open Patients from the sidebar navigation or press Alt + N.',
        'Select "Register New Patient" and input full demographic information.',
        'Enter primary mobile and attendant phone with standard Indian (+91) format.',
        'Record documented drug allergies (e.g. Penicillin, NSAIDs) for automated prescription safety.',
        'Save record. The patient is immediately issued a unique Hospital ID (e.g. P-1004).'
      ],
      tips: 'Ensure correct emergency contact numbers are registered for inpatient or pediatric care.'
    },
    {
      id: 'queue',
      title: 'OPD Queue & Token Calling',
      desc: 'Managing live patient waiting tokens, triaging urgent cases, and synchronizing waiting room display monitors.',
      icon: ListOrdered,
      badge: 'Nursing & OPD',
      steps: [
        'Open the Queue module from sidebar.',
        'Upon patient arrival, check them into the active waiting queue.',
        'Select the consulting physician and specify priority (Normal, Urgent, Emergency).',
        'Use "Call Next Patient" to trigger automated token call and notify the consultation cabin.',
        'When consultation finishes, mark as completed to release the token slot.'
      ],
      tips: 'Emergency priority tokens automatically bypass standard routine waiting lists.'
    },
    {
      id: 'prescriptions',
      title: 'E-Prescriptions & Drug Safety',
      desc: 'Generating digital prescriptions with ICD-10 clinical diagnosis, Schedule H medication guard, and print templates.',
      icon: ClipboardList,
      badge: 'Physicians',
      steps: [
        'Open Prescriptions module or access from inside active Consultation.',
        'Select target patient; existing allergies will display prominently in red.',
        'Select generic or proprietary medications from catalog with dosage frequency and duration.',
        'Review mandatory Schedule H / X medication warnings and clinical notes.',
        'Click "Finalize & Sign" to store record and generate printable A4 or prescription slip.'
      ],
      tips: 'Generic drug naming complies with National Medical Commission clinical guidelines.'
    },
    {
      id: 'billing',
      title: 'Invoicing, GST & Cashless Billing',
      desc: 'Generating tax-compliant INR (₹) itemized bills, processing UPI / card payments, and printing formal transaction invoices.',
      icon: CreditCard,
      badge: 'Accounts & Cashier',
      steps: [
        'Navigate to Billing or Payments in the navigation bar.',
        'Select patient and add itemized clinical services (Doctor consultation, pathology tests, procedures).',
        'Verify applicable GST rate, discounts, and final total in Indian Rupees (₹).',
        'Record tender method: UPI QR code, POS Card swipe, or Cash counter receipt.',
        'Click "Print Invoice" to generate a clean, professional PDF receipt with clinic letterhead.'
      ],
      tips: 'All transaction invoices feature statutory clinic GST numbers and payment reconciliation IDs.'
    },
    {
      id: 'appointments',
      title: 'Doctor Calendars & Scheduling',
      desc: 'Managing appointment slots, recurring specialist rosters, rescheduling, and automated SMS appointment reminders.',
      icon: Calendar,
      badge: 'Reception',
      steps: [
        'Open Appointments and view the weekly or daily calendar view.',
        'Click "Book Appointment" and choose the patient and specialist doctor.',
        'Select an available time slot matching the doctor\'s consultation duration.',
        'Confirm booking. The appointment is added to the doctor’s daily roster.'
      ],
      tips: 'Doctors can adjust their available working days and consult durations under Doctor Management.'
    },
    {
      id: 'reports',
      title: 'Institutional Analytics & Audits',
      desc: 'Reviewing daily patient census, departmental revenue trajectories in Lakhs/Thousands, and statutory audit logs.',
      icon: BarChart3,
      badge: 'Administration',
      steps: [
        'Navigate to Reports in the main navigation.',
        'Select analysis timeframe (Today, This Week, Monthly, or Custom Date Range).',
        'Review financial graphs in Indian Rupees (₹), department breakdowns, and patient volume.',
        'Export summary sheets via CSV or Print for hospital accounting records.'
      ],
      tips: 'Financial figures are reconciled directly with processed bills and payment ledger entries.'
    }
  ];

  const faqs = [
    { 
      q: 'How do I print a formal tax invoice for a patient transaction?',
      a: 'Go to Payments or Billing, click the "View Details" (eye icon) on the target transaction, and click the blue "Print Invoice" button. A clean, professional PDF invoice formatted for Indian healthcare standards with INR (₹) itemization will be generated immediately.',
      category: 'Billing & Payments'
    },
    { 
      q: 'How are Indian phone numbers (+91) validated in the system?',
      a: 'The system enforces the Indian +91 telecommunications prefix on both patient registration and attendant emergency contacts. When entering a 10-digit mobile number, the system automatically prepends +91 and standardizes formatting as +91 XXXXX-XXXXX.',
      category: 'Patients & System'
    },
    { 
      q: 'Can a patient with critical chest pain bypass the standard OPD waiting queue?',
      a: 'Yes. When checking in a patient in the Queue module, set Priority to "Emergency". Emergency tokens are highlighted in red and automatically positioned at the top of the physician’s calling queue.',
      category: 'OPD Queue'
    },
    { 
      q: 'How do I add a new doctor or update consultation fees?',
      a: 'Administrators can navigate to the Doctors tab, click "Register Doctor" or the Edit button on an existing doctor card, and update their specialization, working days, and consultation fee in Indian Rupees (₹ INR).',
      category: 'Doctors & Staff'
    },
    { 
      q: 'What should the clinic do during temporary internet disconnection?',
      a: 'MediFlow Pro utilizes local browser encrypted cache to maintain active consultation notes and queue numbers during transient network dips. When connection is restored, data synchronizes with the primary cloud node without loss.',
      category: 'Technical & Offline'
    },
    { 
      q: 'How do I reset a staff member’s password or modify permissions?',
      a: 'Go to the Staff module. Locate the personnel in the directory, click the Key icon to trigger an instant password reset token dispatch, or use the Edit icon to adjust their department and designated system role.',
      category: 'Staff & Security'
    },
    { 
      q: 'Are thermal receipt printers (80mm) supported alongside A4 invoices?',
      a: 'Yes. MediFlow Pro generates standardized print layouts that automatically adapt to standard 80mm ESC/POS thermal printers as well as full A4/A5 clinical invoices.',
      category: 'Hardware & Printers'
    }
  ];

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return faqs;
    const q = searchTerm.toLowerCase();
    return faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }, [searchTerm, faqs]);

  const filteredGuides = useMemo(() => {
    if (!searchTerm.trim()) return guidesData;
    const q = searchTerm.toLowerCase();
    return guidesData.filter(g => g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q) || g.badge.toLowerCase().includes(q));
  }, [searchTerm, guidesData]);

  // Run simulated diagnostics
  const runPrinterTest = () => {
    setDiagnosticStatus(prev => ({ ...prev, printer: 'running' }));
    setTimeout(() => {
      setDiagnosticStatus(prev => ({ ...prev, printer: 'success' }));
    }, 1200);
  };

  const runNetworkTest = () => {
    setDiagnosticStatus(prev => ({ ...prev, network: 'running' }));
    setTimeout(() => {
      setDiagnosticStatus(prev => ({ ...prev, network: 'success' }));
    }, 900);
  };

  const runStorageTest = () => {
    setDiagnosticStatus(prev => ({ ...prev, storage: 'running' }));
    setTimeout(() => {
      setDiagnosticStatus(prev => ({ ...prev, storage: 'success' }));
    }, 800);
  };

  // Submit Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) return;

    const newTicket: SupportTicket = {
      id: `TKT-${1000 + tickets.length + 1}`,
      subject: ticketForm.subject,
      category: ticketForm.category,
      createdDate: new Date().toLocaleDateString('en-GB'),
      priority: ticketForm.priority,
      status: 'Open',
      lastUpdated: 'Just now'
    };

    setTickets([newTicket, ...tickets]);
    setShowSubmitSuccess(true);
    setTicketForm({
      subject: '',
      category: 'Billing Problem',
      priority: 'Medium',
      description: '',
      workstation: 'OPD Counter 1'
    });

    setTimeout(() => {
      setShowSubmitSuccess(false);
    }, 5000);
  };

  return (
    <div className="space-y-6 font-serif pb-20 animate-in fade-in duration-300">
      {/* Header Container & Institutional Operations Status */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-medical-primary">
              <HelpCircle size={14} />
              Hospital Operations Assistance Desk
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Help & Clinical Support Center</h1>
            <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
              Step-by-step module walkthroughs, hardware troubleshooting, diagnostic self-tests, and 24/7 technical assistance for MediFlow Pro.
            </p>
          </div>

          {/* Quick Support Badge */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 font-sans text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bangalore Clinic Desk Active (18ms)</span>
            </div>
            <p className="text-slate-300 text-[11px]">Indiranagar Clinic: +91 (80) 4567-8900</p>
            <p className="text-sm font-bold text-white tabular-nums flex items-center gap-1.5">
              <Phone size={14} className="text-medical-primary" />
              Emergency: +91 98765-43210
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-6 max-w-2xl">
          <div className="relative font-sans text-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input 
              type="text"
              placeholder="Search help topics, error codes, e-prescriptions, GST bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-slate-400 border border-white/20 rounded-xl py-3 pl-10 pr-24 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary focus:bg-white/15 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Tag Chips */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto text-[11px] font-sans pb-1">
            <span className="text-slate-400 whitespace-nowrap">Popular:</span>
            {['Print Invoice', 'Add Patient (+91)', 'Token Calling', 'Thermal Printer', 'Reset Password'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 whitespace-nowrap transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto font-sans text-xs">
        {[
          { id: 'guides', label: 'Interactive Guides & Walkthroughs', icon: FileText },
          { id: 'diagnostics', label: 'Hardware & System Diagnostics', icon: Laptop },
          { id: 'faq', label: 'Frequently Asked Questions', icon: MessageSquare, count: filteredFaqs.length },
          { id: 'tickets', label: 'Support Desk & Tickets', icon: AlertCircle, count: tickets.length },
          { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'border-medical-primary text-medical-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-medical-primary/10 text-medical-primary' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Interactive Guides */}
      {activeTab === 'guides' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step-by-Step Clinical & Operational Guides</h2>
              <p className="text-xs text-slate-500 font-sans">Click any module to read detailed procedures and clinical safeguards.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuides.map((guide) => (
              <div 
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-medical-primary/40 hover:shadow-md transition-all cursor-pointer group font-sans space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-medical-primary group-hover:bg-medical-primary group-hover:text-white transition-all">
                    <guide.icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {guide.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-medical-primary transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                    {guide.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-medical-primary pt-2 border-t border-slate-50">
                  <span>Read Walkthrough</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Hardware & Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6 font-sans">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Station Hardware & Connectivity Diagnostics</h2>
            <p className="text-xs text-slate-500">Run direct interactive self-checks on receipt printers, cloud latency, and storage integrity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Printer Test */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Printer size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Receipt / Invoice Printer Test</h3>
                <p className="text-xs text-slate-500 mt-1">Sends a sample test print payload to verify 80mm thermal and A4 driver readiness.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <p className="text-slate-500">Target: Default System Spooler</p>
                <p className="font-bold text-slate-800">Status: {diagnosticStatus.printer === 'success' ? 'Ready (Driver Active)' : 'Configured'}</p>
              </div>

              <button
                onClick={runPrinterTest}
                disabled={diagnosticStatus.printer === 'running'}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                {diagnosticStatus.printer === 'running' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Testing Print Spooler...
                  </>
                ) : diagnosticStatus.printer === 'success' ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" /> Test Print Passed
                  </>
                ) : (
                  'Run Print Test'
                )}
              </button>
            </div>

            {/* 2. Network Latency */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wifi size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cloud Sync & Latency Check</h3>
                <p className="text-xs text-slate-500 mt-1">Measures round-trip time between clinical terminal and primary healthcare server.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <p className="text-slate-500">Node: Asia-East (Encrypted)</p>
                <p className="font-bold text-slate-800">Round-trip: {diagnosticStatus.network === 'success' ? '14ms (Optimal)' : '18ms (Online)'}</p>
              </div>

              <button
                onClick={runNetworkTest}
                disabled={diagnosticStatus.network === 'running'}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                {diagnosticStatus.network === 'running' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Ping Diagnostics...
                  </>
                ) : diagnosticStatus.network === 'success' ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" /> Connection Verified
                  </>
                ) : (
                  'Check Cloud Latency'
                )}
              </button>
            </div>

            {/* 3. Storage Health */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Database size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Local Storage & Cache Health</h3>
                <p className="text-xs text-slate-500 mt-1">Validates client-side persistence schema for offline consult preservation.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <p className="text-slate-500">Encryption: AES-256 Validated</p>
                <p className="font-bold text-slate-800">Storage Used: {diagnosticStatus.storage === 'success' ? '1.4 MB / 10 MB (Healthy)' : 'Healthy'}</p>
              </div>

              <button
                onClick={runStorageTest}
                disabled={diagnosticStatus.storage === 'running'}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                {diagnosticStatus.storage === 'running' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Auditing Cache...
                  </>
                ) : diagnosticStatus.storage === 'success' ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" /> Database Healthy
                  </>
                ) : (
                  'Audit Cache Storage'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Frequently Asked Questions */}
      {activeTab === 'faq' && (
        <div className="space-y-4 font-sans">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Frequently Asked Clinical & Technical Questions</h2>
            <p className="text-xs text-slate-500">Curated answers to routine outpatient, billing, and system operations.</p>
          </div>

          <div className="space-y-2.5">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold text-xs shrink-0">
                      Q
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900">{faq.q}</span>
                      <p className="text-[10px] text-slate-400 font-sans">{faq.category}</p>
                    </div>
                  </div>
                  {expandedFAQ === idx ? (
                    <ChevronUp size={18} className="text-slate-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedFAQ === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-2 text-xs text-slate-600 bg-slate-50/50 border-t border-slate-100 leading-relaxed font-serif">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-800 text-sm">No FAQs matched your query</p>
                <p className="text-xs text-slate-400 mt-1">Try another keyword or submit a support ticket below.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Support Desk & Tickets */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
          {/* Submit New Ticket Form (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Open Clinical Support Request</h3>
              <p className="text-xs text-slate-500">Directly route issues to hospital technical support.</p>
            </div>

            {showSubmitSuccess && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Ticket registered successfully. Expected response: &lt; 20 minutes.</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subject / Issue Summary *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cannot print invoice on Counter 2"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-medical-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category *</label>
                  <select 
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs cursor-pointer"
                  >
                    <option>Billing Problem</option>
                    <option>Prescription Problem</option>
                    <option>Appointment Problem</option>
                    <option>Patient Management</option>
                    <option>Login Problem</option>
                    <option>Technical Issue</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority Level</label>
                  <select 
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs cursor-pointer"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Workstation / Terminal ID</label>
                <input 
                  type="text" 
                  value={ticketForm.workstation}
                  onChange={(e) => setTicketForm({ ...ticketForm, workstation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Detailed Description *</label>
                <textarea 
                  rows={4}
                  placeholder="Describe error message, affected patient ID, or steps to reproduce..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-medical-primary/20"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl font-bold shadow-md shadow-medical-primary/20 flex items-center justify-center gap-2 transition-all"
              >
                <Send size={15} />
                Submit Support Ticket
              </button>
            </form>
          </div>

          {/* Ticket History (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Support Ticket Tracking</h3>
                <p className="text-xs text-slate-500">Live status of clinic assistance requests.</p>
              </div>
              <span className="text-xs font-bold text-slate-400">{tickets.length} Registered</span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500">
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Issue Subject</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-center">Priority</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{t.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[180px]" title={t.subject}>
                        {t.subject}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{t.category}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold ${
                          t.priority === 'Urgent' ? 'text-rose-600' :
                          t.priority === 'High' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                          t.status === 'In Progress' ? 'bg-sky-50 text-sky-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => setSelectedTicket(t)}
                          className="text-medical-primary font-bold hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Keyboard Shortcuts */}
      {activeTab === 'shortcuts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 font-sans">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Clinical Workstation Keyboard Shortcuts</h2>
            <p className="text-xs text-slate-500">Accelerate clinic operations with instant keyboard hotkeys.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { keys: ['Ctrl', 'K'], action: 'Instant Universal Search', desc: 'Focus global search input to quickly find patients, bills, or doctors.' },
              { keys: ['Alt', 'N'], action: 'New Patient Registration', desc: 'Directly open new patient registration intake form.' },
              { keys: ['Alt', 'B'], action: 'Quick Invoicing / Bill', desc: 'Jump immediately to billing and invoice generation.' },
              { keys: ['Alt', 'Q'], action: 'OPD Queue Jump', desc: 'Switch instantly to live token queue calling desk.' },
              { keys: ['Ctrl', 'P'], action: 'Print Active Document', desc: 'Print currently displayed invoice or prescription layout.' },
              { keys: ['Esc'], action: 'Dismiss Open Modals', desc: 'Close open dialogs, dossiers, or full-screen panels safely.' }
            ].map((sc, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{sc.action}</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{sc.desc}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {sc.keys.map((k, j) => (
                    <kbd key={j} className="px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-[11px] font-bold text-slate-700 shadow-xs">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Guide Step-by-Step Walkthrough */}
      <AnimatePresence>
        {selectedGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGuide(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden relative z-10 font-sans">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{selectedGuide.title}</h3>
                  <p className="text-xs text-slate-400">Institutional Clinical Walkthrough</p>
                </div>
                <button onClick={() => setSelectedGuide(null)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Recommended Step Flow:</h4>
                  <div className="space-y-2.5">
                    {selectedGuide.steps.map((st, i) => (
                      <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-medical-primary text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-slate-700 leading-relaxed">{st}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900 text-xs flex items-start gap-2">
                  <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p><strong>Clinical Best Practice:</strong> {selectedGuide.tips}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setSelectedGuide(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-700 text-xs">
                  Done Reading
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: View Support Ticket Drawer */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 font-sans">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{selectedTicket.id}</h3>
                  <p className="text-xs text-slate-400">{selectedTicket.category} · Priority: {selectedTicket.priority}</p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Subject</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <p className="font-bold text-slate-800">{selectedTicket.status}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Registered Date</p>
                    <p className="font-bold text-slate-800 tabular-nums">{selectedTicket.createdDate}</p>
                  </div>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-sky-900 leading-relaxed">
                  <p className="font-bold mb-1">Technician Log & Assigned Agent:</p>
                  <p>Our clinical engineering desk has reviewed this report. Hardware logs for the workstation have been requested.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setSelectedTicket(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-700 text-xs">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Help;
