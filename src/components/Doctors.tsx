import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Plus, Eye, Edit, 
  Calendar, MoreVertical, Phone, Mail, Clock, 
  Award, Receipt, ArrowLeft,
  CheckCircle2, Trash2, X,
  CalendarDays, ChevronDown, Save
} from 'lucide-react';
import { Doctor } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useSharedDoctors } from '../hooks/useSharedDoctors';
import { useSharedSettings } from '../hooks/useSharedSettings';

interface DoctorsProps {
  setActiveTab?: (tab: string) => void;
}

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SPECIALIZATION_OPTIONS = [
  'General Physician',
  'Cardiology & Intensive Care',
  'Pediatrics & Neonatology',
  'Orthopedics & Joint Surgery',
  'Neurology',
  'Dermatology & Cosmetology',
  'Gynecology & Obstetrics',
  'ENT & Head-Neck Surgery',
  'Ophthalmology',
  'Psychiatry & Behavioral Health',
  'Pulmonology & Respiratory Care',
  'Dental Surgery'
];

const Doctors: React.FC<DoctorsProps> = ({ setActiveTab }) => {
  const { currencySymbol } = useSharedSettings();
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useSharedDoctors();

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [view, setView] = useState<'list' | 'profile' | 'register'>('list');
  const [isEditingInProfile, setIsEditingInProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autocomplete suggestions for DOCTOR NAMES ONLY
  const suggestions = useSearchSuggestions(searchTerm, ['doctor']);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dropdown menu state per doctor card
  const [activeMenuDoctorId, setActiveMenuDoctorId] = useState<string | null>(null);

  // Delete doctor modal
  const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dedicated Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    specialization: 'General Physician',
    qualification: '',
    phone: '',
    email: '',
    registrationNumber: '',
    consultationFee: '500',
    appointmentDuration: '15',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: '09:00 AM - 05:00 PM',
    status: 'Active' as 'Active' | 'Away',
    experience: '8 Years',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
  });

  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Inline Profile Edit State
  const [profileEditForm, setProfileEditForm] = useState<{
    name: string;
    specialization: string;
    qualification: string;
    phone: string;
    email: string;
    registrationNumber: string;
    consultationFee: number;
    appointmentDuration: number;
    workingDays: string[];
    workingHours: string;
    status: 'Active' | 'Away';
    experience: string;
  } | null>(null);

  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      setActiveMenuDoctorId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setSearchTerm(item.title);
    setShowSuggestions(false);
  };

  const validateRegistration = () => {
    const errs: Record<string, string> = {};
    if (!regForm.name.trim()) errs.name = 'Doctor Full Name is required';
    if (!regForm.qualification.trim()) errs.qualification = 'Medical Qualification is required';
    if (!regForm.phone.trim()) errs.phone = 'Phone number is required';
    if (regForm.email.trim() && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(regForm.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!regForm.consultationFee || isNaN(Number(regForm.consultationFee)) || Number(regForm.consultationFee) < 0) {
      errs.consultationFee = 'Enter valid consultation fee';
    }
    if (regForm.workingDays.length === 0) {
      errs.workingDays = 'Select at least one available working day';
    }
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegistration()) return;

    const formattedName = regForm.name.trim().startsWith('Dr.') 
      ? regForm.name.trim() 
      : `Dr. ${regForm.name.trim()}`;

    const created = addDoctor({
      name: formattedName,
      specialization: regForm.specialization.trim(),
      qualification: regForm.qualification.trim(),
      phone: regForm.phone.trim().startsWith('+91') ? regForm.phone.trim() : `+91 ${regForm.phone.trim()}`,
      email: regForm.email.trim() || `${regForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@medflowclinic.com`,
      registrationNumber: regForm.registrationNumber.trim() || `MCI-${Math.floor(10000 + Math.random() * 90000)}-KA`,
      consultationFee: Number(regForm.consultationFee) || 500,
      appointmentDuration: Number(regForm.appointmentDuration) || 15,
      workingDays: regForm.workingDays,
      workingHours: regForm.workingHours,
      status: regForm.status,
      experience: regForm.experience || '5 Years',
      image: regForm.image
    });

    showToast(`${created.name} registered successfully in directory!`);
    setSelectedDoctor(created);
    setIsEditingInProfile(false);
    setView('profile');

    // Reset registration form
    setRegForm({
      name: '',
      specialization: 'General Physician',
      qualification: '',
      phone: '',
      email: '',
      registrationNumber: '',
      consultationFee: '500',
      appointmentDuration: '15',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: '09:00 AM - 05:00 PM',
      status: 'Active',
      experience: '8 Years',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
    });
  };

  const startInlineEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setProfileEditForm({
      name: doctor.name,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      phone: doctor.phone,
      email: doctor.email,
      registrationNumber: doctor.registrationNumber,
      consultationFee: doctor.consultationFee,
      appointmentDuration: doctor.appointmentDuration || 15,
      workingDays: [...doctor.workingDays],
      workingHours: doctor.workingHours,
      status: doctor.status,
      experience: doctor.experience
    });
    setEditErrors({});
    setIsEditingInProfile(true);
    setView('profile');
  };

  const handleSaveInlineEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !profileEditForm) return;

    const errs: Record<string, string> = {};
    if (!profileEditForm.name.trim()) errs.name = 'Doctor Name is required';
    if (!profileEditForm.qualification.trim()) errs.qualification = 'Qualification is required';
    if (!profileEditForm.phone.trim()) errs.phone = 'Phone number is required';
    if (profileEditForm.workingDays.length === 0) errs.workingDays = 'Select at least one day';

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    const updated: Doctor = {
      ...selectedDoctor,
      ...profileEditForm,
      name: profileEditForm.name.trim().startsWith('Dr.') ? profileEditForm.name.trim() : `Dr. ${profileEditForm.name.trim()}`
    };

    updateDoctor(selectedDoctor.id, updated);
    setSelectedDoctor(updated);
    setIsEditingInProfile(false);
    showToast(`Doctor details for ${updated.name} updated successfully!`);
  };

  const handleConfirmDelete = () => {
    if (deleteDoctorId) {
      deleteDoctor(deleteDoctorId);
      showToast('Doctor record removed from clinic directory');
      if (selectedDoctor?.id === deleteDoctorId) {
        setSelectedDoctor(null);
        setView('list');
      }
      setDeleteDoctorId(null);
    }
  };

  // Filter doctors by search & specialization
  const filteredDoctors = doctors.filter(doc => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch = !q || doc.name.toLowerCase().includes(q) || doc.specialization.toLowerCase().includes(q);
    const matchSpec = specializationFilter === 'All' || doc.specialization === specializationFilter;
    return matchSearch && matchSpec;
  });

  const specializations = Array.from(new Set(doctors.map(d => d.specialization)));

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-serif pb-6">
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
            <button onClick={() => setToastMessage(null)} className="p-1 hover:text-emerald-950 cursor-pointer">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* VIEW 1: DEDICATED NEW DOCTOR REGISTRATION PAGE */}
      {/* ========================================================================= */}
      {view === 'register' && (
        <div className="animate-in fade-in duration-200 font-serif w-full max-w-5xl mx-auto space-y-4 pb-8">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setView('list')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Return to Doctor Directory"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 leading-tight">
                    Register New Doctor / Specialist
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-medical-primary/10 text-medical-primary text-[9px] font-bold uppercase tracking-wider">
                    Medical Roster
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Onboard clinical practitioner, consulting fees, working hours, and license details.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold font-sans text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegisterSubmit}
                className="px-4 py-1.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl text-xs font-bold font-sans shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>Save & Register Doctor</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-sans text-xs">
            {/* Left Column: Personal & Credentials (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Award size={16} className="text-medical-primary" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Clinical Identity & Professional Credentials
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Doctor Full Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                    <span>Doctor Full Name <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. Dr. Kavita Nair</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => {
                      setRegForm({ ...regForm, name: e.target.value });
                      if (regErrors.name) setRegErrors({ ...regErrors, name: '' });
                    }}
                    placeholder="Dr. Full Name"
                    className={`w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                      regErrors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                    }`}
                  />
                  {regErrors.name && <p className="text-[10px] text-rose-500 font-bold">{regErrors.name}</p>}
                </div>

                {/* Specialization */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Specialization *</label>
                  <select
                    value={regForm.specialization}
                    onChange={(e) => setRegForm({ ...regForm, specialization: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary cursor-pointer"
                  >
                    {SPECIALIZATION_OPTIONS.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Medical Qualification */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Qualifications *</label>
                  <input 
                    type="text"
                    required
                    value={regForm.qualification}
                    onChange={(e) => {
                      setRegForm({ ...regForm, qualification: e.target.value });
                      if (regErrors.qualification) setRegErrors({ ...regErrors, qualification: '' });
                    }}
                    placeholder="e.g. MBBS, MD (Cardiology)"
                    className={`w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 ${
                      regErrors.qualification ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                    }`}
                  />
                  {regErrors.qualification && <p className="text-[10px] text-rose-500 font-bold">{regErrors.qualification}</p>}
                </div>

                {/* Registration Number */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Medical Council Reg #</label>
                  <input 
                    type="text"
                    value={regForm.registrationNumber}
                    onChange={(e) => setRegForm({ ...regForm, registrationNumber: e.target.value })}
                    placeholder="e.g. MCI-98442-KA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Clinical Practice Experience</label>
                  <input 
                    type="text"
                    value={regForm.experience}
                    onChange={(e) => setRegForm({ ...regForm, experience: e.target.value })}
                    placeholder="e.g. 10 Years"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Contact Phone (+91) *</label>
                  <input 
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => {
                      setRegForm({ ...regForm, phone: e.target.value });
                      if (regErrors.phone) setRegErrors({ ...regErrors, phone: '' });
                    }}
                    placeholder="+91 98765-43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                  />
                  {regErrors.phone && <p className="text-[10px] text-rose-500 font-bold">{regErrors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Official Email Address</label>
                  <input 
                    type="email"
                    value={regForm.email}
                    onChange={(e) => {
                      setRegForm({ ...regForm, email: e.target.value });
                      if (regErrors.email) setRegErrors({ ...regErrors, email: '' });
                    }}
                    placeholder="doctor@medflowclinic.com"
                    className={`w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 ${
                      regErrors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                    }`}
                  />
                  {regErrors.email && <p className="text-[10px] text-rose-500 font-bold">{regErrors.email}</p>}
                </div>
              </div>
            </div>

            {/* Right Column: Schedule & Fees (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Fees & Slot Duration */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Receipt size={16} className="text-emerald-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. Consultation Fee & Slot
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px]">Consultation Fee ({currencySymbol})</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      value={regForm.consultationFee}
                      onChange={(e) => setRegForm({ ...regForm, consultationFee: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px]">Slot Duration (Mins)</label>
                    <input 
                      type="number"
                      min="5"
                      max="60"
                      value={regForm.appointmentDuration}
                      onChange={(e) => setRegForm({ ...regForm, appointmentDuration: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="font-bold text-slate-700 text-[11px]">Duty Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Active', 'Away'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setRegForm({ ...regForm, status: st })}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          regForm.status === st
                            ? st === 'Active' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Working Hours & Available Days */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Clock size={16} className="text-indigo-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    3. OPD Working Hours & Days
                  </h2>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Daily OPD Hours</label>
                  <input 
                    type="text"
                    value={regForm.workingHours}
                    onChange={(e) => setRegForm({ ...regForm, workingHours: e.target.value })}
                    placeholder="09:00 AM - 05:00 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-700 text-[11px] block">Available Days ({regForm.workingDays.length})</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ALL_DAYS.map((day) => {
                      const isSelected = regForm.workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const next = isSelected 
                              ? regForm.workingDays.filter(d => d !== day)
                              : [...regForm.workingDays, day];
                            setRegForm({ ...regForm, workingDays: next });
                          }}
                          className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-medical-primary text-white border-medical-primary shadow-2xs'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                  {regErrors.workingDays && <p className="text-[10px] text-rose-500 font-bold">{regErrors.workingDays}</p>}
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DOCTOR DETAILS PAGE (READ-ONLY & INLINE EDIT ON THE SAME PAGE) */}
      {/* ========================================================================= */}
      {view === 'profile' && selectedDoctor && (
        <div className="animate-in slide-in-from-right duration-300 font-serif space-y-4 pb-8">
          {/* Back button and quick actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button 
              onClick={() => {
                setIsEditingInProfile(false);
                setView('list');
              }}
              className="flex items-center gap-2 text-medical-primary font-bold text-xs sm:text-sm hover:translate-x-[-2px] transition-transform cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to Doctor Directory
            </button>
            <div className="flex items-center gap-2">
              {!isEditingInProfile ? (
                <>
                  <button 
                    onClick={() => startInlineEdit(selectedDoctor)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Edit size={14} />
                    <span>Edit Doctor Info</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab?.('appointments')}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-medical-primary text-white rounded-xl text-xs font-bold hover:bg-medical-primary/90 shadow-2xs transition-all cursor-pointer"
                  >
                    <Calendar size={14} />
                    <span>Book Consultation</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button"
                    onClick={() => setIsEditingInProfile(false)}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveInlineEdit}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-medical-primary text-white hover:bg-medical-primary/90 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* EDITABLE FORM ON SAME DOCTOR DETAILS PAGE */}
          {isEditingInProfile && profileEditForm ? (
            <form onSubmit={handleSaveInlineEdit} className="space-y-4 font-sans text-xs">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Edit size={16} className="text-medical-primary" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Editing Doctor Details: {selectedDoctor.name}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    Doctor ID: {selectedDoctor.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left Column (6 cols) */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">Doctor Name *</label>
                      <input 
                        type="text"
                        required
                        value={profileEditForm.name}
                        onChange={(e) => setProfileEditForm({ ...profileEditForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                      />
                      {editErrors.name && <p className="text-[10px] text-rose-500 font-bold">{editErrors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">Specialization *</label>
                      <select
                        value={profileEditForm.specialization}
                        onChange={(e) => setProfileEditForm({ ...profileEditForm, specialization: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary cursor-pointer"
                      >
                        {SPECIALIZATION_OPTIONS.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-[11px]">Qualification *</label>
                        <input 
                          type="text"
                          required
                          value={profileEditForm.qualification}
                          onChange={(e) => setProfileEditForm({ ...profileEditForm, qualification: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-[11px]">Experience</label>
                        <input 
                          type="text"
                          value={profileEditForm.experience}
                          onChange={(e) => setProfileEditForm({ ...profileEditForm, experience: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">Medical Registration Number</label>
                      <input 
                        type="text"
                        value={profileEditForm.registrationNumber}
                        onChange={(e) => setProfileEditForm({ ...profileEditForm, registrationNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                      />
                    </div>
                  </div>

                  {/* Right Column (6 cols) */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-[11px]">Phone (+91) *</label>
                        <input 
                          type="tel"
                          required
                          value={profileEditForm.phone}
                          onChange={(e) => setProfileEditForm({ ...profileEditForm, phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-[11px]">Email</label>
                        <input 
                          type="email"
                          value={profileEditForm.email}
                          onChange={(e) => setProfileEditForm({ ...profileEditForm, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-[11px]">Fee (₹ INR)</label>
                        <input 
                          type="number"
                          required
                          min="0"
                          value={profileEditForm.consultationFee}
                          onChange={(e) => setProfileEditForm({ ...profileEditForm, consultationFee: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-[11px]">Slot (Mins)</label>
                        <input 
                          type="number"
                          min="5"
                          max="60"
                          value={profileEditForm.appointmentDuration}
                          onChange={(e) => setProfileEditForm({ ...profileEditForm, appointmentDuration: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-[11px]">Status</label>
                        <select
                          value={profileEditForm.status}
                          onChange={(e) => setProfileEditForm({ ...profileEditForm, status: e.target.value as any })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Away">Away</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">Daily Working Hours</label>
                      <input 
                        type="text"
                        value={profileEditForm.workingHours}
                        onChange={(e) => setProfileEditForm({ ...profileEditForm, workingHours: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                      />
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="font-bold text-slate-700 text-[11px] block">Available Days</label>
                      <div className="flex flex-wrap gap-1">
                        {ALL_DAYS.map((day) => {
                          const isSelected = profileEditForm.workingDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const next = isSelected 
                                  ? profileEditForm.workingDays.filter(d => d !== day)
                                  : [...profileEditForm.workingDays, day];
                                setProfileEditForm({ ...profileEditForm, workingDays: next });
                              }}
                              className={`py-1 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-medical-primary text-white border-medical-primary shadow-2xs'
                                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingInProfile(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Updated Details</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* READ-ONLY STRUCTURED DOCTOR DETAILS VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Section 1 & 2: Top Profile Banner Card (12 cols) */}
              <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col md:flex-row items-center md:items-start gap-5">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-slate-100 overflow-hidden border-2 border-medical-primary/20 shrink-0 shadow-2xs">
                  <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{selectedDoctor.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedDoctor.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {selectedDoctor.status}
                    </span>
                  </div>
                  <p className="text-medical-primary font-bold text-sm uppercase tracking-wide">{selectedDoctor.specialization}</p>
                  <p className="text-xs text-slate-500 font-medium">Registration ID: <span className="font-bold text-slate-700">{selectedDoctor.registrationNumber}</span></p>
                  <p className="text-xs text-slate-600 max-w-xl pt-1">
                    Experienced medical practitioner with {selectedDoctor.experience} in clinical diagnostic care, patient therapeutics, and ongoing outpatient management.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center shrink-0 w-full md:w-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Fee</span>
                  <span className="text-2xl font-bold text-medical-primary tabular-nums">{currencySymbol}{selectedDoctor.consultationFee.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{selectedDoctor.appointmentDuration || 15} Mins / Slot</span>
                </div>
              </div>

              {/* Section 1: Personal & Professional Information (6 cols) */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Award size={16} className="text-medical-primary" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Professional Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Medical Degree</span>
                    <span className="font-bold text-slate-800">{selectedDoctor.qualification}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Clinical Practice</span>
                    <span className="font-bold text-slate-800">{selectedDoctor.experience}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Council Registration</span>
                    <span className="font-bold text-slate-800">{selectedDoctor.registrationNumber}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Specialty Area</span>
                    <span className="font-bold text-medical-primary">{selectedDoctor.specialization}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information (6 cols) */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Phone size={16} className="text-medical-primary" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Contact Information</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="font-medium">Direct Phone Line</span>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">{selectedDoctor.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="font-medium">Official Email Address</span>
                    </div>
                    <span className="font-bold text-slate-900">{selectedDoctor.email}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Consultation Details (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Receipt size={16} className="text-medical-primary" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Consultation Details</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Fee per Consultation</span>
                    <span className="text-base font-bold text-slate-900">{currencySymbol}{selectedDoctor.consultationFee.toFixed(2)} <span className="text-xs text-slate-500 font-semibold">INR</span></span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Slot Duration</span>
                    <span className="font-bold text-slate-800">{selectedDoctor.appointmentDuration || 15} Minutes per patient</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Follow-up Policy</span>
                    <span className="font-bold text-slate-800">Free within 7 days of visit</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Working Schedule (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Clock size={16} className="text-medical-primary" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Working Schedule</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Daily Clinic Hours</span>
                    <span className="font-bold text-slate-900">{selectedDoctor.workingHours}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">Available Days</span>
                    <div className="flex flex-wrap gap-1">
                      {ALL_DAYS.map(day => {
                        const isAvailable = selectedDoctor.workingDays.some(d => d.toLowerCase().includes(day.toLowerCase()));
                        return (
                          <span 
                            key={day}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isAvailable 
                                ? 'bg-medical-primary/10 text-medical-primary border-medical-primary/30' 
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Appointment Summary (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CalendarDays size={16} className="text-medical-primary" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Clinic Summary</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                    <span className="font-medium text-blue-900">Today's Scheduled</span>
                    <span className="text-base font-bold text-blue-700">12 Consultations</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <span className="font-medium text-emerald-900">Total Consulted Files</span>
                    <span className="text-base font-bold text-emerald-700">428 Patients</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">Average Rating</span>
                    <span className="text-sm font-bold text-slate-900">4.9 / 5.0 ⭐</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: MAIN DOCTOR DIRECTORY LIST */}
      {/* ========================================================================= */}
      {view === 'list' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Doctor & Specialist Management</h2>
              <p className="text-xs text-slate-500">View roster, edit schedules, and register consulting physicians</p>
            </div>
            <button 
              onClick={() => setView('register')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-medical-primary text-white rounded-xl text-xs font-bold hover:bg-medical-primary/90 shadow-2xs transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Register New Doctor</span>
            </button>
          </div>

          {/* Search Bar - Autocomplete suggestions for doctor names only */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search doctor by name or specialization..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
              />
              <SearchSuggestions 
                isVisible={showSuggestions} 
                suggestions={suggestions} 
                onSelect={handleSelectSuggestion} 
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select 
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-medical-primary"
                >
                  <option value="All">All Specializations</option>
                  {specializations.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
              </div>
            </div>
          </div>

          {/* DOCTORS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between relative"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div 
                      onClick={() => { setSelectedDoctor(doc); setIsEditingInProfile(false); setView('profile'); }}
                      className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 
                        onClick={() => { setSelectedDoctor(doc); setIsEditingInProfile(false); setView('profile'); }}
                        className="text-sm font-bold text-slate-900 hover:text-medical-primary transition-colors cursor-pointer truncate"
                      >
                        {doc.name}
                      </h3>
                      <p className="text-medical-primary font-bold text-[10px] uppercase tracking-wider truncate">{doc.specialization}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Award size={12} />
                        <span>{doc.qualification}</span>
                      </p>
                    </div>

                    {/* Three-dot Menu (⋮) */}
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuDoctorId(activeMenuDoctorId === doc.id ? null : doc.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      <AnimatePresence>
                        {activeMenuDoctorId === doc.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 z-30 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 overflow-hidden"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuDoctorId(null);
                                startInlineEdit(doc);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit size={13} className="text-blue-600" />
                              <span>Edit Doctor</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuDoctorId(null);
                                setDeleteDoctorId(doc.id);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                            >
                              <Trash2 size={13} className="text-rose-600" />
                              <span>Delete Doctor</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 border-t border-slate-100 pt-2.5">
                    <p className="flex items-center gap-1 truncate">
                      <Phone size={11} className="text-slate-400" />
                      <span>{doc.phone}</span>
                    </p>
                    <p className="flex items-center gap-1 truncate justify-end">
                      <Receipt size={11} className="text-slate-400" />
                      <span className="font-bold text-slate-800">{currencySymbol}{doc.consultationFee}</span>
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setIsEditingInProfile(false);
                      setView('profile');
                    }}
                    className="text-slate-700 font-bold hover:text-medical-primary transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>View Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startInlineEdit(doc)}
                    className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Edit Doctor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* DELETE DOCTOR CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteDoctorId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Remove Doctor Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this doctor from the clinic directory? Existing appointments will remain archived.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button 
                  onClick={() => setDeleteDoctorId(null)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Doctors;
