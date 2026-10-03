import React, { useState } from 'react';
import { 
  Building2, User, Users, Calendar, ListOrdered, 
  CreditCard, Bell, ShieldCheck, Sliders, Save, 
  Upload, Phone, Mail, MapPin, Hash, Clock, 
  Lock, CheckCircle2, X, Plus, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SettingsCategory = 
  | 'clinic'
  | 'profile'
  | 'roles'
  | 'appointments'
  | 'queue'
  | 'billing'
  | 'notifications'
  | 'security'
  | 'preferences';

const SETTINGS_STORAGE_KEY = 'medflow_system_settings';

const defaultSettings = {
  // 1. Clinic Information
  clinicName: 'MedFlow Pro Healthcare Clinic',
  tagline: 'Evidence-Based Outpatient & Specialty Care',
  phone: '+91 98765-43210',
  email: 'admin@medflowpro.com',
  address: '123 Healthcare Boulevard, Medical District, Bangalore, KA 560001',
  regNumber: 'CLINIC-REG-889922',
  taxNumber: 'GSTIN29AAACM1234F1Z5',

  // 2. Profile & Account
  adminName: 'Dr. Sarah Chen (Chief Administrator)',
  adminEmail: 'sarah.chen@medflow.com',
  adminPhone: '+91 99887-11223',
  designation: 'Medical Director & Administrator',
  accountBio: 'Senior clinical director overseeing hospital throughput, patient experience and electronic medical records.',

  // 3. Appointment Settings
  slotDuration: '20',
  bufferTime: '5',
  maxOverbooking: '2',
  autoConfirm: true,
  dailyStartTime: '09:00 AM',
  dailyEndTime: '06:00 PM',

  // 4. Queue Settings
  strictFifo: true,
  autoCallNext: false,
  maxQueueCapacity: '50',
  avgConsultationTime: '15',
  displayWaitTime: true,

  // 5. Billing & Payment Settings
  currency: 'INR (₹)',
  taxRate: '5',
  discountCap: '15',
  invoicePrefix: 'INV-2023-',
  enableUpi: true,
  enableCard: true,
  enableCash: true,

  // 6. Notification Settings
  smsAlerts: true,
  emailReports: true,
  patientRegistrationToast: true,
  queueAudibleBeep: false,
  dailyRevenueAlert: true,

  // 7. Security & Password
  twoFactorAuth: true,
  sessionTimeout: '30',
  requireComplexPassword: true,

  // 8. System Preferences
  dateFormat: 'DD/MM/YYYY',
  compactDensity: true,
  highContrast: false,
  autoRefreshInterval: '60'
};

const Settings: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('clinic');

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return defaultSettings;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = (e: React.FormEvent, categoryName: string) => {
    e.preventDefault();
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
    showToast(`${categoryName} updated and saved successfully!`);
  };

  const categories: Array<{ id: SettingsCategory; label: string; desc: string; icon: any }> = [
    { id: 'clinic', label: 'Clinic Information', desc: 'Hospital name, logo, contact & tax credentials', icon: Building2 },
    { id: 'profile', label: 'Profile & Account', desc: 'Administrator details and personal preferences', icon: User },
    { id: 'roles', label: 'User & Role Management', desc: 'Access permissions for staff and doctors', icon: Users },
    { id: 'appointments', label: 'Appointment Settings', desc: 'Slot durations, daily hours, and booking rules', icon: Calendar },
    { id: 'queue', label: 'Queue Settings', desc: 'FIFO queue rules, waiting room parameters', icon: ListOrdered },
    { id: 'billing', label: 'Billing & Payment Settings', desc: 'Currency, GST tax rates, invoice numbering', icon: CreditCard },
    { id: 'notifications', label: 'Notification Settings', desc: 'Alerts, SMS reminders and email broadcasts', icon: Bell },
    { id: 'security', label: 'Security & Password', desc: 'Authentication, 2FA and session timeouts', icon: ShieldCheck },
    { id: 'preferences', label: 'System Preferences', desc: 'Date formats, interface density and defaults', icon: Sliders },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-serif pb-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:text-emerald-950">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Clinic Configuration & System Settings</h2>
        <p className="text-xs text-slate-500">Configure clinic defaults, security standards, operational rules, and workflows</p>
      </div>

      {/* Layout: Sidebar Navigation on Desktop & Tablet, Horizontal Scroller / Stack on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Category Navigation (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-2">
          {/* Mobile Horizontal Tab Scroller */}
          <div className="flex lg:hidden overflow-x-auto gap-1 pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-medical-primary text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <cat.icon size={14} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop & Tablet Sidebar Navigation */}
          <div className="hidden lg:flex flex-col space-y-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-2.5 ${
                    isActive 
                      ? 'bg-medical-primary text-white shadow-xs' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <cat.icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate leading-tight">{cat.label}</p>
                    <p className={`text-[10px] truncate leading-tight mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {cat.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Setting Form Container (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <AnimatePresence mode="wait">
            {/* 1. CLINIC INFORMATION */}
            {activeCategory === 'clinic' && (
              <motion.form 
                key="clinic"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={(e) => handleSave(e, 'Clinic Information')}
                className="p-5 space-y-4 text-xs"
              >
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Clinic Information & Branding</h3>
                  <p className="text-[10px] text-slate-500">Configure public clinic metadata, address, contact and registration certificates</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Official Clinic Name</label>
                    <input 
                      type="text" 
                      value={settings.clinicName}
                      onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Clinic Tagline / Specialty</label>
                    <input 
                      type="text" 
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Primary Phone (+91)</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary">
                      <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                        +91
                      </span>
                      <input 
                        type="text" 
                        value={settings.phone.replace(/^\+91\s*/, '')}
                        onChange={(e) => setSettings({ ...settings, phone: `+91 ${e.target.value.replace(/^\+91\s*/, '')}` })}
                        placeholder="98765-43210"
                        className="w-full bg-transparent p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Official Email</label>
                    <input 
                      type="email" 
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Physical Address</label>
                    <textarea 
                      rows={2}
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Clinic Registration Number</label>
                    <input 
                      type="text" 
                      value={settings.regNumber}
                      onChange={(e) => setSettings({ ...settings, regNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">GST / Tax Identification</label>
                    <input 
                      type="text" 
                      value={settings.taxNumber}
                      onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1.5 shadow-xs">
                    <Save size={13} /> Save Clinic Information
                  </button>
                </div>
              </motion.form>
            )}

            {/* 2. PROFILE & ACCOUNT */}
            {activeCategory === 'profile' && (
              <motion.form 
                key="profile"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={(e) => handleSave(e, 'Profile & Account')}
                className="p-5 space-y-4 text-xs"
              >
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Administrator Profile & Credentials</h3>
                  <p className="text-[10px] text-slate-500">Manage administrator profile, designation, contact info and biography</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Full Name</label>
                    <input 
                      type="text" 
                      value={settings.adminName}
                      onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Designation / Role</label>
                    <input 
                      type="text" 
                      value={settings.designation}
                      onChange={(e) => setSettings({ ...settings, designation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Contact Number (+91)</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary">
                      <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        value={settings.adminPhone.replace(/^\+91\s*/, '')}
                        onChange={(e) => setSettings({ ...settings, adminPhone: `+91 ${e.target.value.replace(/^\+91\s*/, '')}` })}
                        placeholder="99887-11223"
                        className="w-full bg-transparent p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Admin Email</label>
                    <input 
                      type="email" 
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Administrative Bio</label>
                    <textarea 
                      rows={2}
                      value={settings.accountBio}
                      onChange={(e) => setSettings({ ...settings, accountBio: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1.5 shadow-xs">
                    <Save size={13} /> Update Profile
                  </button>
                </div>
              </motion.form>
            )}

            {/* 3. USER & ROLE MANAGEMENT */}
            {activeCategory === 'roles' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">User Accounts & Role Permissions</h3>
                    <p className="text-[10px] text-slate-500">Configure role-based access control (RBAC) across clinic departments</p>
                  </div>
                  <button 
                    onClick={() => showToast('Role invitation link generated!')}
                    className="px-3 py-1.5 bg-medical-primary text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus size={13} /> Add User
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { role: 'Administrator', access: 'Full system control, financial audit, reports and configuration', count: '1 User', active: true },
                    { role: 'Doctor / Specialist', access: 'Patient consultation, prescriptions, medical records, and appointment slots', count: '4 Users', active: true },
                    { role: 'Receptionist', access: 'Patient directory registration, appointment booking, queue management', count: '2 Users', active: true },
                    { role: 'Accountant', access: 'Billing creation, invoice generation, transaction ledger and payouts', count: '1 User', active: true },
                    { role: 'Clinical Staff', access: 'Vital stats capture, nursing assistance, queue call status', count: '3 Users', active: true },
                  ].map((r, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{r.role}</p>
                          <span className="px-2 py-0.2 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-600">{r.count}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{r.access}</p>
                      </div>
                      <button 
                        onClick={() => showToast(`Permissions updated for ${r.role}`)}
                        className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white"
                      >
                        Permissions
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. APPOINTMENT SETTINGS */}
            {activeCategory === 'appointments' && (
              <motion.form 
                key="appointments"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={(e) => handleSave(e, 'Appointment Settings')}
                className="p-5 space-y-4 text-xs"
              >
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Appointment Scheduling Rules</h3>
                  <p className="text-[10px] text-slate-500">Slot duration, buffer intervals, working hours and auto-confirmation</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Default Slot Duration (Minutes)</label>
                    <select 
                      value={settings.slotDuration}
                      onChange={(e) => setSettings({ ...settings, slotDuration: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="15">15 Minutes / Slot</option>
                      <option value="20">20 Minutes / Slot</option>
                      <option value="30">30 Minutes / Slot</option>
                      <option value="45">45 Minutes / Slot</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Buffer Interval Between Visits</label>
                    <select 
                      value={settings.bufferTime}
                      onChange={(e) => setSettings({ ...settings, bufferTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="0">0 Minutes (Back-to-back)</option>
                      <option value="5">5 Minutes</option>
                      <option value="10">10 Minutes</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Clinic Start Time</label>
                    <input 
                      type="text" 
                      value={settings.dailyStartTime}
                      onChange={(e) => setSettings({ ...settings, dailyStartTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Clinic End Time</label>
                    <input 
                      type="text" 
                      value={settings.dailyEndTime}
                      onChange={(e) => setSettings({ ...settings, dailyEndTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Auto-Confirm Patient Bookings</p>
                      <p className="text-[10px] text-slate-500">Automatically mark online bookings as Scheduled without receptionist review</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.autoConfirm}
                      onChange={(e) => setSettings({ ...settings, autoConfirm: e.target.checked })}
                      className="w-4 h-4 text-medical-primary rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1.5 shadow-xs">
                    <Save size={13} /> Save Appointment Rules
                  </button>
                </div>
              </motion.form>
            )}

            {/* 5. QUEUE SETTINGS */}
            {activeCategory === 'queue' && (
              <motion.form 
                key="queue"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={(e) => handleSave(e, 'Queue Settings')}
                className="p-5 space-y-4 text-xs"
              >
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Queue Management Parameters</h3>
                  <p className="text-[10px] text-slate-500">FIFO algorithm enforcement, capacity caps and display options</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Strict FIFO (First In, First Out) Enforcement</p>
                      <p className="text-[10px] text-slate-500">Orders patients based on exact arrival time in queue sequence</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.strictFifo}
                      onChange={(e) => setSettings({ ...settings, strictFifo: e.target.checked })}
                      className="w-4 h-4 text-medical-primary rounded cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Max Queue Capacity</label>
                      <input 
                        type="number"
                        value={settings.maxQueueCapacity}
                        onChange={(e) => setSettings({ ...settings, maxQueueCapacity: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Estimated Consult Duration (Mins)</label>
                      <input 
                        type="number"
                        value={settings.avgConsultationTime}
                        onChange={(e) => setSettings({ ...settings, avgConsultationTime: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Display Live Wait Duration in Waiting Room</p>
                      <p className="text-[10px] text-slate-500">Show elapsed wait timers on public patient monitor screens</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.displayWaitTime}
                      onChange={(e) => setSettings({ ...settings, displayWaitTime: e.target.checked })}
                      className="w-4 h-4 text-medical-primary rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1.5 shadow-xs">
                    <Save size={13} /> Save Queue Settings
                  </button>
                </div>
              </motion.form>
            )}

            {/* 6. BILLING & PAYMENT SETTINGS */}
            {activeCategory === 'billing' && (
              <motion.form 
                key="billing"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={(e) => handleSave(e, 'Billing Settings')}
                className="p-5 space-y-4 text-xs"
              >
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Billing & Payment Configuration</h3>
                  <p className="text-[10px] text-slate-500">Default invoice prefix, GST tax brackets, discount boundaries</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Operating Currency (INR ₹)</label>
                    <select 
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                    >
                      <option value="INR (₹)">Indian Rupee (INR ₹) — System Standard</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Standard GST Tax Rate (%)</label>
                    <input 
                      type="number" 
                      value={settings.taxRate}
                      onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Invoice Number Prefix</label>
                    <input 
                      type="text" 
                      value={settings.invoicePrefix}
                      onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Maximum Discount Allowed (%)</label>
                    <input 
                      type="number" 
                      value={settings.discountCap}
                      onChange={(e) => setSettings({ ...settings, discountCap: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1.5 shadow-xs">
                    <Save size={13} /> Save Billing Settings
                  </button>
                </div>
              </motion.form>
            )}

            {/* 7. NOTIFICATION SETTINGS */}
            {activeCategory === 'notifications' && (
              <motion.form 
                key="notifications"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={(e) => handleSave(e, 'Notification Settings')}
                className="p-5 space-y-4 text-xs"
              >
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Notification & Alert Channels</h3>
                  <p className="text-[10px] text-slate-500">Configure appointment reminders, registration alerts, and SMS integrations</p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Patient SMS Appointment Reminders</p>
                      <p className="text-[10px] text-slate-500">Send automatic SMS 2 hours before scheduled consultation</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.smsAlerts}
                      onChange={(e) => setSettings({ ...settings, smsAlerts: e.target.checked })}
                      className="w-4 h-4 text-medical-primary rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Daily Financial Audit Email</p>
                      <p className="text-[10px] text-slate-500">Dispatch end-of-day summary reports to administrator email</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.emailReports}
                      onChange={(e) => setSettings({ ...settings, emailReports: e.target.checked })}
                      className="w-4 h-4 text-medical-primary rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Real-Time Patient Registration Toasts</p>
                      <p className="text-[10px] text-slate-500">Display onscreen notifications when reception registers a new file</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.patientRegistrationToast}
                      onChange={(e) => setSettings({ ...settings, patientRegistrationToast: e.target.checked })}
                      className="w-4 h-4 text-medical-primary rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1.5 shadow-xs">
                    <Save size={13} /> Save Notification Preferences
                  </button>
                </div>
              </motion.form>
            )}

            {/* 8. SECURITY & PASSWORD */}
            {activeCategory === 'security' && (
              <motion.form 
                key="security"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={(e) => handleSave(e, 'Security & Password')}
                className="p-5 space-y-4 text-xs"
              >
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Security, 2FA & Password Policy</h3>
                  <p className="text-[10px] text-slate-500">Two-factor authentication, session expiration and credential updates</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
                      <p className="text-[10px] text-slate-500">Require OTP verification upon signing into administrative portal</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.twoFactorAuth}
                      onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                      className="w-4 h-4 text-medical-primary rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Inactivity Session Timeout (Minutes)</label>
                    <select 
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">60 Minutes</option>
                      <option value="120">2 Hours</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="font-bold text-slate-900">Change Password</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="password" placeholder="New Password" className="bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                      <input type="password" placeholder="Confirm Password" className="bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1.5 shadow-xs">
                    <Save size={13} /> Update Security Settings
                  </button>
                </div>
              </motion.form>
            )}

            {/* 9. SYSTEM PREFERENCES */}
            {activeCategory === 'preferences' && (
              <motion.form 
                key="preferences"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={(e) => handleSave(e, 'System Preferences')}
                className="p-5 space-y-4 text-xs"
              >
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">System Preferences & Viewport Formatting</h3>
                  <p className="text-[10px] text-slate-500">Date standards, compact density controls and auto-refresh</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Display Date Format</label>
                    <select 
                      value={settings.dateFormat}
                      onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 30/10/2023)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/30/2023)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Auto-Refresh Interval (Seconds)</label>
                    <select 
                      value={settings.autoRefreshInterval}
                      onChange={(e) => setSettings({ ...settings, autoRefreshInterval: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="30">30 Seconds</option>
                      <option value="60">60 Seconds</option>
                      <option value="120">2 Minutes</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Compact Density Mode</p>
                      <p className="text-[10px] text-slate-500">Reduces vertical row padding to maximize onscreen records</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.compactDensity}
                      onChange={(e) => setSettings({ ...settings, compactDensity: e.target.checked })}
                      className="w-4 h-4 text-medical-primary rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1.5 shadow-xs">
                    <Save size={13} /> Save System Preferences
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
