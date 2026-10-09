import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Activity, Award, CheckCircle2, 
  Server, Lock, Phone, Mail, Clock,
  Cpu, HeartPulse, Stethoscope, Users, Receipt, Database,
  ArrowRight, X, HelpCircle, Scale
} from 'lucide-react';
import Help from './Help';
import TermsPolicies from './TermsPolicies';
import mediLogo from '../assets/images/medi-logo.jpg';

interface AboutMediFlowProps {
  onClose?: () => void;
  isModal?: boolean;
  initialSubTab?: 'overview' | 'help' | 'policies';
}

const AboutMediFlow: React.FC<AboutMediFlowProps> = ({ 
  onClose, 
  isModal = false, 
  initialSubTab = 'overview' 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'help' | 'policies'>(initialSubTab);

  const clinicalModules = [
    {
      title: 'Smart OPD & Token Queue',
      desc: 'Real-time patient check-in, automated token allocation, emergency triage prioritizing, and live waiting room display sync.',
      icon: Users,
      badge: 'Core OPD'
    },
    {
      title: 'NABH E-Prescriptions',
      desc: 'ICD-10 clinical diagnosis catalog, Schedule H/X medication safety check, automatic dosage calculations, and dual-format printing.',
      icon: Stethoscope,
      badge: 'Clinical EMR'
    },
    {
      title: 'GST & Cashless Invoicing',
      desc: 'Seamless INR (₹) itemized billing, multi-tender transactions (UPI, POS Cards, Cash), and downloadable tax-compliant PDF invoices.',
      icon: Receipt,
      badge: 'Financials'
    },
    {
      title: 'Physician Rostering & Scheduling',
      desc: 'Multi-specialty doctor schedule planner, consultation slot allocation, and real-time duty status monitoring.',
      icon: Clock,
      badge: 'Operations'
    },
    {
      title: 'Institutional Analytics',
      desc: 'Census tracking, revenue trends in Lakhs/Thousands, outpatient return velocity, and departmental productivity indices.',
      icon: Activity,
      badge: 'Intelligence'
    },
    {
      title: 'Encrypted Health Archive',
      desc: 'Longitudinal medical records, allergy registry, patient vitals history, and tamper-evident clinical audit logging.',
      icon: Database,
      badge: 'Data Vault'
    }
  ];

  const standards = [
    {
      name: 'NABH Digital Standards',
      desc: 'Adheres to National Accreditation Board for Hospitals guidelines for digital clinical records and patient safety documentation.',
      icon: Award
    },
    {
      name: 'DISHA & HIPAA Safeguards',
      desc: 'Full alignment with Digital Information Security in Healthcare principles and international patient confidentiality mandates.',
      icon: ShieldCheck
    },
    {
      name: 'AES-256 Vault Encryption',
      desc: 'End-to-end encrypted medical histories, biometric/password authentication, and encrypted backups at rest and in flight.',
      icon: Lock
    },
    {
      name: '99.98% High Availability',
      desc: 'Sub-30ms internal latency, multi-zone fault tolerant infrastructure with instant failover and automated state persistence.',
      icon: Server
    }
  ];

  const specifications = [
    { label: 'Platform Release', value: 'MediFlow Pro v3.4.2 Enterprise' },
    { label: 'Clinical EMR Architecture', value: 'Decoupled Client-Side Engine with Encrypted Storage' },
    { label: 'Operating Currency', value: 'Indian Rupee (INR ₹) — National Standard' },
    { label: 'Phone System Standard', value: 'Telecommunications Prefix (+91) Enforced' },
    { label: 'Data Encryption', value: 'AES-256-GCM / TLS 1.3' },
    { label: 'Audit Trail Retention', value: '7 Years Statutory Compliance' },
    { label: 'Printer Compatibility', value: 'Standard A4/A5 PDF & 80mm ESC/POS Thermal' },
    { label: 'Deployment Node', value: 'Asia-East Cloud Zone (Enterprise Primary)' }
  ];

  return (
    <div className={`font-serif ${isModal ? 'p-0' : 'space-y-6 animate-in fade-in duration-300 pb-16'}`}>
      {/* Sub-Navigation Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'overview'
                ? 'bg-medical-primary text-white shadow-xs shadow-medical-primary/20'
                : 'text-slate-600 hover:text-medical-primary hover:bg-slate-50'
            }`}
          >
            <Building2 size={16} />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('help')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'help'
                ? 'bg-medical-primary text-white shadow-xs shadow-medical-primary/20'
                : 'text-slate-600 hover:text-medical-primary hover:bg-slate-50'
            }`}
          >
            <HelpCircle size={16} />
            <span>Help & Support</span>
          </button>

          <button
            onClick={() => setActiveSubTab('policies')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'policies'
                ? 'bg-medical-primary text-white shadow-xs shadow-medical-primary/20'
                : 'text-slate-600 hover:text-medical-primary hover:bg-slate-50'
            }`}
          >
            <Scale size={16} />
            <span>Terms & Clinical Policies</span>
          </button>
        </div>

        {isModal && onClose && (
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Render Sub-Page Content */}
      {activeSubTab === 'help' && (
        <div className="animate-in fade-in duration-200">
          <Help />
        </div>
      )}

      {activeSubTab === 'policies' && (
        <div className="animate-in fade-in duration-200">
          <TermsPolicies onClose={onClose} isModal={isModal} />
        </div>
      )}

      {activeSubTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Container */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
            {/* Subtle background graphics */}
            <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-medical-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-12 top-10 opacity-10 pointer-events-none hidden md:block">
              <HeartPulse size={240} />
            </div>

            <div className="relative z-10 space-y-4 max-w-3xl">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-medical-primary">
                  <Building2 size={14} />
                  Hospital Information Management System
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg border border-slate-700/50 shrink-0">
                    <img src={mediLogo} alt="MediFlow Logo" className="w-full h-full object-contain rounded-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">About MediFlow Pro</h1>
                    <p className="text-xs text-slate-400 font-sans tracking-wide">Enterprise Healthcare Operations Suite · v3.4.2</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed font-sans pt-2">
                  MediFlow Pro is an institutional-grade clinic and hospital management solution engineered to unify outpatient registration, physician consultations, queue coordination, pharmacy e-prescriptions, and cashless billing into a seamless, paperless clinical workflow.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-sans text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 size={15} /> Accredited Enterprise License
                </span>
                <span className="text-slate-600">·</span>
                <span>Standardized for Indian Healthcare (+91 / ₹ INR)</span>
                <span className="text-slate-600">·</span>
                <span>Hospital-wide Role-Based Access Control</span>
              </div>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setActiveSubTab('help')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-medical-primary/50 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-medical-primary group-hover:text-white transition-colors">
                <HelpCircle size={22} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm group-hover:text-medical-primary transition-colors">
                  <span>Help & Support Center</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  Access comprehensive step-by-step user guides, interactive FAQ, ticketing desk, and diagnostic tools.
                </p>
              </div>
            </div>

            <div 
              onClick={() => setActiveSubTab('policies')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-medical-primary/50 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Scale size={22} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm group-hover:text-emerald-600 transition-colors">
                  <span>Terms & Clinical Policies</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  Review clinical governance frameworks, EHR data privacy charters, prescription guidelines, and printable policies.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Clinical Capabilities */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Core Clinical & Administrative Modules</h2>
                <p className="text-xs text-slate-500 font-sans">Designed for multi-specialty polyclinics, diagnostic centers, and hospital outpatient departments.</p>
              </div>
              <span className="text-xs font-sans font-bold text-medical-primary">6 Integrated Systems</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinicalModules.map((mod, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-medical-primary/40 hover:shadow-md transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-medical-primary group-hover:bg-medical-primary group-hover:text-white transition-all">
                      <mod.icon size={20} />
                    </div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {mod.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-medical-primary transition-colors">{mod.title}</h3>
                    <p className="text-xs text-slate-500 font-sans leading-relaxed mt-1">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance, Security & Standards */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Governance, Regulatory & Security Framework</h2>
              <p className="text-xs text-slate-500 font-sans">Safeguarding patient protected health information (PHI) with defense-in-depth architecture.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {standards.map((std, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <std.icon size={18} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{std.name}</h4>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">{std.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Specifications Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cpu size={18} className="text-medical-primary" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Specifications & Architecture</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {specifications.map((spec, i) => (
                <div key={i} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <p className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">{spec.label}</p>
                  <p className="text-xs font-sans font-bold text-slate-800 break-words">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bangalore Clinic & Campus Local Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 size={18} className="text-medical-primary" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Hospital Campus & Local Healthcare Clinic</h3>
                <p className="text-[11px] text-slate-500 font-sans">Primary Outpatient Department (OPD) & Healthcare Center in Bangalore, Karnataka.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Clinic Address</span>
                <p className="font-bold text-slate-900">MedFlow Pro Healthcare Center</p>
                <p className="text-slate-600 leading-relaxed">
                  #42, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bangalore, Karnataka - 560038, India
                </p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">OPD & Consultation Hours</span>
                <p className="font-bold text-slate-900">Mon – Sat: 08:00 AM – 08:00 PM</p>
                <p className="text-slate-600">Sunday: 09:00 AM – 02:00 PM</p>
                <p className="text-emerald-700 font-bold mt-1">24/7 Emergency Triage & Admissions</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contact & Appointments</span>
                <p className="font-bold text-slate-900">Telephone: +91 (80) 4567-8900</p>
                <p className="text-slate-600">Emergency: +91 98765-43210</p>
                <p className="text-medical-primary font-bold mt-1">Email: care@medflowclinic.com</p>
              </div>
            </div>
          </div>

          {/* Support & Contact Desk */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="text-[11px] font-sans font-bold text-medical-primary uppercase tracking-widest">Hospital Operations Desk</span>
              <h3 className="text-lg md:text-xl font-bold">MediFlow Technical Support & Infrastructure</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                For critical system disruptions, station deployments, thermal printer driver troubleshooting, or role elevation requests, contact our 24/7 hospital IT desk.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 font-sans text-xs">
              <div className="bg-white/10 px-4 py-3 rounded-xl flex items-center gap-3 border border-white/10">
                <Phone size={16} className="text-emerald-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Hotline (+91)</p>
                  <p className="font-bold text-white tabular-nums">+91 98765-43210</p>
                </div>
              </div>
              <div className="bg-white/10 px-4 py-3 rounded-xl flex items-center gap-3 border border-white/10">
                <Mail size={16} className="text-sky-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Clinical Ops Email</p>
                  <p className="font-bold text-white">support@medflowpro.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutMediFlow;
