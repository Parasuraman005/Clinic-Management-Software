import React, { useState, useRef, useEffect } from 'react';
import { 
  UserRound, Search, Filter, Plus, Eye, Edit, 
  Calendar, MoreVertical, Phone, Mail, Clock, 
  Award, ShieldCheck, Receipt, ArrowLeft,
  CheckCircle2, Users, Trash2, X, Briefcase,
  CalendarDays, FileText, ChevronDown, Sparkles
} from 'lucide-react';
import { Doctor } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useSharedDoctors } from '../hooks/useSharedDoctors';

interface DoctorsProps {
  setActiveTab?: (tab: string) => void;
}

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Doctors: React.FC<DoctorsProps> = ({ setActiveTab }) => {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useSharedDoctors();

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autocomplete suggestions for DOCTOR NAMES ONLY
  const suggestions = useSearchSuggestions(searchTerm, ['doctor']);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dropdown menu state per doctor card
  const [activeMenuDoctorId, setActiveMenuDoctorId] = useState<string | null>(null);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    specialization: 'General Physician',
    qualification: '',
    phone: '',
    email: '',
    registrationNumber: '',
    consultationFee: '500',
    workingDays: ['Monday', 'Wednesday', 'Friday'],
    workingHours: '09:00 AM - 05:00 PM',
    status: 'Active' as 'Active' | 'Away',
    experience: '8 Years'
  });

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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.qualification.trim() || !regForm.phone.trim()) {
      alert('Please fill out all required doctor fields.');
      return;
    }

    const created = addDoctor({
      name: regForm.name.trim(),
      specialization: regForm.specialization.trim(),
      qualification: regForm.qualification.trim(),
      phone: regForm.phone.trim(),
      email: regForm.email.trim(),
      registrationNumber: regForm.registrationNumber.trim() || `REG-${Math.floor(1000000 + Math.random() * 9000000)}`,
      consultationFee: Number(regForm.consultationFee) || 500,
      workingDays: regForm.workingDays,
      workingHours: regForm.workingHours,
      status: regForm.status,
      experience: regForm.experience
    });

    showToast(`Dr. ${created.name.replace(/^Dr\.\s*/, '')} registered successfully!`);
    setShowRegisterModal(false);
    setRegForm({
      name: '',
      specialization: 'General Physician',
      qualification: '',
      phone: '',
      email: '',
      registrationNumber: '',
      consultationFee: '500',
      workingDays: ['Monday', 'Wednesday', 'Friday'],
      workingHours: '09:00 AM - 05:00 PM',
      status: 'Active',
      experience: '8 Years'
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    updateDoctor(editingDoctor.id, editingDoctor);
    if (selectedDoctor?.id === editingDoctor.id) {
      setSelectedDoctor(editingDoctor);
    }
    showToast(`Details for ${editingDoctor.name} updated`);
    setEditingDoctor(null);
  };

  const handleConfirmDelete = () => {
    if (deleteDoctorId) {
      deleteDoctor(deleteDoctorId);
      showToast('Doctor record removed from directory');
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

  // RESTRUCTURED DOCTOR DETAILS PAGE
  const DoctorDetailsPage = ({ doctor }: { doctor: Doctor }) => (
    <div className="animate-in slide-in-from-right duration-300 font-serif space-y-4 pb-8">
      {/* Back button and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button 
          onClick={() => setView('list')}
          className="flex items-center gap-2 text-medical-primary font-bold text-xs sm:text-sm hover:translate-x-[-2px] transition-transform"
        >
          <ArrowLeft size={16} />
          Back to Doctor Directory
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setEditingDoctor(doctor)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Edit size={14} />
            Edit Doctor Info
          </button>
          <button 
            onClick={() => setActiveTab?.('appointments')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 shadow-xs transition-all"
          >
            <Calendar size={14} />
            Book Consultation
          </button>
        </div>
      </div>

      {/* Structured Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Section 1 & 2: Top Profile Banner Card (12 cols) */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row items-center md:items-start gap-5">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-slate-100 overflow-hidden border-2 border-medical-primary/20 shrink-0 shadow-xs">
            <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                doctor.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {doctor.status}
              </span>
            </div>
            <p className="text-medical-primary font-bold text-sm uppercase tracking-wide">{doctor.specialization}</p>
            <p className="text-xs text-slate-500 font-medium">Registration ID: <span className="font-bold text-slate-700">{doctor.registrationNumber}</span></p>
            <p className="text-xs text-slate-600 max-w-xl pt-1">
              Experienced medical practitioner with {doctor.experience} in clinical diagnostic care, patient therapeutics, and ongoing outpatient management.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center shrink-0 w-full md:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Fee</span>
            <span className="text-2xl font-bold text-medical-primary tabular-nums">₹{doctor.consultationFee.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{doctor.appointmentDuration} Mins / Slot</span>
          </div>
        </div>

        {/* Section 1: Personal & Professional Information (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Award size={16} className="text-medical-primary" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Professional Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Medical Degree</span>
              <span className="font-bold text-slate-800">{doctor.qualification}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Clinical Practice</span>
              <span className="font-bold text-slate-800">{doctor.experience}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Council Registration</span>
              <span className="font-bold text-slate-800">{doctor.registrationNumber}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Specialty Area</span>
              <span className="font-bold text-medical-primary">{doctor.specialization}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Contact Information (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
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
              <span className="font-bold text-slate-900 tabular-nums">{doctor.phone}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={14} className="text-slate-400" />
                <span className="font-medium">Official Email Address</span>
              </div>
              <span className="font-bold text-slate-900">{doctor.email}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Consultation Details (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Receipt size={16} className="text-medical-primary" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Consultation Details</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Fee per Consultation</span>
              <span className="text-base font-bold text-slate-900">₹{doctor.consultationFee.toFixed(2)} <span className="text-xs text-slate-500 font-semibold">INR</span></span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Slot Duration</span>
              <span className="font-bold text-slate-800">{doctor.appointmentDuration} Minutes per patient</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Follow-up Policy</span>
              <span className="font-bold text-slate-800">Free within 7 days of visit</span>
            </div>
          </div>
        </div>

        {/* Section 5: Working Schedule (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock size={16} className="text-medical-primary" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Working Schedule</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Daily Clinic Hours</span>
              <span className="font-bold text-slate-900">{doctor.workingHours}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">Available Days</span>
              <div className="flex flex-wrap gap-1">
                {ALL_DAYS.map(day => {
                  const isAvailable = doctor.workingDays.some(d => d.toLowerCase().includes(day.toLowerCase()));
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

        {/* Section 6: Appointment Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CalendarDays size={16} className="text-medical-primary" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Appointment Summary</h3>
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
    </div>
  );

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
            <button onClick={() => setToastMessage(null)} className="p-1 hover:text-emerald-950">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'profile' && selectedDoctor ? (
        <DoctorDetailsPage doctor={selectedDoctor} />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Doctor & Specialist Management</h2>
              <p className="text-xs text-slate-500">View roster, edit schedules, and register consulting physicians</p>
            </div>
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>Register New Doctor</span>
            </button>
          </div>

          {/* Search Bar - Autocomplete suggestions for doctor names only */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
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
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
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
                  className="bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-medical-primary"
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
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between relative"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div 
                      onClick={() => { setSelectedDoctor(doc); setView('profile'); }}
                      className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 
                        onClick={() => { setSelectedDoctor(doc); setView('profile'); }}
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

                    {/* Functional Three-dot Menu (⋮) */}
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuDoctorId(activeMenuDoctorId === doc.id ? null : doc.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown containing Edit and Delete */}
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
                                setEditingDoctor(doc);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
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
                              className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                            >
                              <Trash2 size={13} className="text-rose-600" />
                              <span>Delete Doctor</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Fee</span>
                      <span className="font-bold text-slate-900 tabular-nums">₹{doc.consultationFee.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                      <span className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        doc.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hours & Availability</span>
                      <span className="text-[11px] text-slate-600 truncate block">{doc.workingHours} ({doc.availability})</span>
                    </div>
                  </div>
                </div>

                {/* Bottom card action */}
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <button 
                    onClick={() => { setSelectedDoctor(doc); setView('profile'); }}
                    className="text-medical-primary hover:underline flex items-center gap-1"
                  >
                    <Eye size={13} />
                    View Details
                  </button>
                  <button 
                    onClick={() => setEditingDoctor(doc)}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Edit size={13} />
                    Quick Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* REGISTER NEW DOCTOR MODAL */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold">
                    <UserRound size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Register New Doctor</h3>
                    <p className="text-[10px] text-slate-500">Add consulting physician to clinical roster</p>
                  </div>
                </div>
                <button onClick={() => setShowRegisterModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Doctor Name */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Doctor Name *</label>
                    <input 
                      type="text" 
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  {/* Specialization */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Specialization *</label>
                    <select 
                      value={regForm.specialization}
                      onChange={(e) => setRegForm({ ...regForm, specialization: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Neurologist">Neurologist</option>
                    </select>
                  </div>

                  {/* Qualification */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Qualification *</label>
                    <input 
                      type="text" 
                      required
                      value={regForm.qualification}
                      onChange={(e) => setRegForm({ ...regForm, qualification: e.target.value })}
                      placeholder="e.g. MBBS, MD (Med)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone Number (+91) *</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary">
                      <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        required
                        value={regForm.phone.replace(/^\+91\s*/, '')}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="98765-11223"
                        className="w-full bg-transparent p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email Address</label>
                    <input 
                      type="email" 
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="doctor@medflow.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  {/* Registration Number */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Registration Number</label>
                    <input 
                      type="text" 
                      value={regForm.registrationNumber}
                      onChange={(e) => setRegForm({ ...regForm, registrationNumber: e.target.value })}
                      placeholder="e.g. REG-889922"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  {/* Consultation Fee */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Consultation Fee (INR ₹) *</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary">
                      <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                        ₹ INR
                      </span>
                      <input 
                        type="number" 
                        min="0"
                        required
                        value={regForm.consultationFee}
                        onChange={(e) => setRegForm({ ...regForm, consultationFee: e.target.value })}
                        placeholder="500"
                        className="w-full bg-transparent p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Working Hours *</label>
                    <input 
                      type="text" 
                      required
                      value={regForm.workingHours}
                      onChange={(e) => setRegForm({ ...regForm, workingHours: e.target.value })}
                      placeholder="09:00 AM - 05:00 PM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Status</label>
                    <select 
                      value={regForm.status}
                      onChange={(e) => setRegForm({ ...regForm, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Away">Away</option>
                    </select>
                  </div>

                  {/* Working Days */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Working Days</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_DAYS.map(day => {
                        const isChecked = regForm.workingDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setRegForm(prev => ({
                                ...prev,
                                workingDays: isChecked 
                                  ? prev.workingDays.filter(d => d !== day)
                                  : [...prev.workingDays, day]
                              }));
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all ${
                              isChecked 
                                ? 'bg-medical-primary text-white border-medical-primary' 
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-1.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-lg font-bold shadow-xs"
                  >
                    Register Doctor
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT DOCTOR MODAL */}
      <AnimatePresence>
        {editingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <Edit size={16} className="text-medical-primary" />
                  <h3 className="text-sm font-bold text-slate-900">Edit Doctor: {editingDoctor.name}</h3>
                </div>
                <button onClick={() => setEditingDoctor(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-5 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-slate-700">Doctor Name</label>
                    <input 
                      type="text"
                      required
                      value={editingDoctor.name}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Specialization</label>
                    <input 
                      type="text"
                      required
                      value={editingDoctor.specialization}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Consultation Fee (INR ₹)</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary">
                      <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                        ₹ INR
                      </span>
                      <input 
                        type="number"
                        required
                        value={editingDoctor.consultationFee}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, consultationFee: Number(e.target.value) })}
                        className="w-full bg-transparent p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone Number (+91)</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary">
                      <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                        +91
                      </span>
                      <input 
                        type="tel"
                        required
                        value={editingDoctor.phone.replace(/^\+91\s*/, '')}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                        className="w-full bg-transparent p-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email</label>
                    <input 
                      type="email"
                      value={editingDoctor.email}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Working Hours</label>
                    <input 
                      type="text"
                      value={editingDoctor.workingHours}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, workingHours: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Status</label>
                    <select 
                      value={editingDoctor.status}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Away">Away</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setEditingDoctor(null)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-lg font-bold shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
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
