import React, { useState } from 'react';
import { 
  ArrowLeft, Save, CheckCircle2, 
  ListOrdered, Phone, User, Calendar, MapPin, 
  Stethoscope, Clock, Droplets, Mail, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedPatients } from '../hooks/useSharedPatients';
import { addPatientToQueue } from '../hooks/useSharedQueue';
import { useSharedDoctors } from '../hooks/useSharedDoctors';

interface AddPatientProps {
  onBack: () => void;
  setActiveTab?: (tab: string) => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const RELATIONSHIPS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Guardian', 'Relative', 'Friend', 'Other'];

const AddPatient: React.FC<AddPatientProps> = ({ onBack, setActiveTab }) => {
  const { addPatient } = useSharedPatients();
  const { doctors } = useSharedDoctors();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    phoneNumber: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    // Attendant (optional)
    attendantName: '',
    attendantPhone: '',
    attendantRelationship: 'Spouse',
    // Queue Assignment (optional)
    assignedDoctor: 'Dr. Sarah Chen',
    triagePriority: 'Normal' as 'Normal' | 'Urgent' | 'Emergency'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ id: string; name: string; queueToken?: string } | null>(null);

  // Validation: Only Full Name is mandatory; age must be valid if entered
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Patient Full Name is required';
    }

    if (formData.age.trim() && (isNaN(Number(formData.age)) || Number(formData.age) <= 0 || Number(formData.age) > 130)) {
      errs.age = 'Enter valid age (1-130)';
    }

    if (formData.email.trim() && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (sendToQueue: boolean = false) => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1. Create Patient in Database
      const createdPatient = addPatient({
        name: formData.fullName.trim(),
        age: formData.age.trim() ? Number(formData.age) : 30,
        gender: formData.gender,
        phone: formData.phoneNumber.trim() || '+91 98765-00000',
        email: formData.email.trim(),
        address: formData.address.trim() || 'Bangalore, Karnataka',
        bloodGroup: formData.bloodGroup || 'O+',
        attendantName: formData.attendantName.trim() || undefined,
        attendantPhone: formData.attendantPhone.trim() || undefined,
        attendantRelationship: formData.attendantRelationship.trim() || undefined
      });

      let tokenNumber: string | undefined = undefined;

      // 2. If sendToQueue is checked, allocate token and push to Live OPD Queue
      if (sendToQueue) {
        const queueItem = addPatientToQueue(
          { name: createdPatient.name, id: createdPatient.id },
          { 
            doctorName: formData.assignedDoctor || 'Dr. Sarah Chen', 
            priority: formData.triagePriority || 'Normal' 
          }
        );
        tokenNumber = queueItem.queueNumber;
      }

      setSuccessInfo({ 
        id: createdPatient.id, 
        name: createdPatient.name,
        queueToken: tokenNumber
      });

      setTimeout(() => {
        setIsSubmitting(false);
        if (sendToQueue && setActiveTab) {
          setActiveTab('queue');
        } else {
          onBack();
        }
      }, 1000);
    } catch (err) {
      console.error('Failed to register patient', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-200 font-serif w-full max-w-5xl mx-auto space-y-3 pb-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Return to Patient Directory"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                New Patient Registration
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-medical-primary/10 text-medical-primary text-[9px] font-bold uppercase tracking-wider">
                EHR Record
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Enter patient information. Full Name is required.
            </p>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold font-sans text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold font-sans shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={13} />
            <span>Save Patient</span>
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="px-4 py-1.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl text-xs font-bold font-sans shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ListOrdered size={14} />
            <span>Save & to Queue</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successInfo && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-900 shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div className="text-xs font-sans">
                <span className="font-bold">{successInfo.name}</span> registered successfully (<span className="font-mono font-bold text-emerald-800">{successInfo.id}</span>).
                {successInfo.queueToken && (
                  <span className="ml-1 font-bold text-emerald-800">
                    Allocated Token <span className="px-1.5 py-0.5 bg-emerald-200 rounded font-mono">#{successInfo.queueToken}</span> in OPD Queue.
                  </span>
                )}
              </div>
            </div>
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Desktop-Optimized 2-Column Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Primary Demographics (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3 font-sans text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <User size={15} className="text-medical-primary" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Patient Demographics & Identification
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Full Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                <span>Full Name <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Official Legal Name</span>
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder="e.g. Ramesh Kumar"
                  className={`w-full bg-slate-50 border rounded-xl py-1.5 pl-8 pr-3 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                    errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-[10px] text-rose-500 font-bold">{errors.fullName}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Primary Mobile</label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+91 98765-43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="patient@gmail.com"
                  className={`w-full bg-slate-50 border rounded-xl py-1.5 pl-8 pr-3 text-xs focus:bg-white focus:outline-none focus:ring-1 ${
                    errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-500 font-bold">{errors.email}</p>}
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Age (Years)</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="number"
                  min="1"
                  max="130"
                  value={formData.age}
                  onChange={(e) => {
                    setFormData({ ...formData, age: e.target.value });
                    if (errors.age) setErrors({ ...errors, age: '' });
                  }}
                  placeholder="e.g. 34"
                  className={`w-full bg-slate-50 border rounded-xl py-1.5 pl-8 pr-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 ${
                    errors.age ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                  }`}
                />
              </div>
              {errors.age && <p className="text-[10px] text-rose-500 font-bold">{errors.age}</p>}
            </div>

            {/* Blood Group */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Blood Group</label>
              <div className="relative">
                <Droplets className="absolute left-2.5 top-1/2 -translate-y-1/2 text-rose-500" size={14} />
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary cursor-pointer"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender Selection */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 text-[11px] block">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Male', 'Female', 'Other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      formData.gender === g
                        ? 'bg-medical-primary text-white border-medical-primary shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Residential Address */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Residential Address</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2 text-slate-400" size={14} />
                <textarea 
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House/Apartment, Street, Area, Bangalore, Karnataka"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: OPD Queue Assignment + Attendant Details (5 cols) */}
        <div className="lg:col-span-5 space-y-3 font-sans text-xs">
          {/* Card 2: Doctor Assignment & OPD Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Stethoscope size={15} className="text-indigo-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. OPD Queue & Doctor Assignment
                </h2>
              </div>
            </div>

            <div className="space-y-2">
              {/* Consulting Doctor */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">Consulting Doctor</label>
                <select
                  value={formData.assignedDoctor}
                  onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary cursor-pointer"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Triage Priority */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                  <Clock size={12} className="text-amber-500" />
                  <span>Triage Priority</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'Normal', bg: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
                    { id: 'Urgent', bg: 'bg-amber-50 border-amber-300 text-amber-800' },
                    { id: 'Emergency', bg: 'bg-rose-50 border-rose-300 text-rose-800' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, triagePriority: p.id as any })}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.triagePriority === p.id 
                          ? `${p.bg} ring-2 ring-medical-primary shadow-2xs font-extrabold` 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Attendant / Emergency Contact (Optional) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <UserCheck size={15} className="text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Attendant & Emergency Contact
              </h2>
            </div>

            <div className="space-y-2">
              {/* Attendant Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">Attendant Name (Optional)</label>
                <input 
                  type="text"
                  value={formData.attendantName}
                  onChange={(e) => setFormData({ ...formData, attendantName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Attendant Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Attendant Phone</label>
                  <input 
                    type="tel"
                    value={formData.attendantPhone}
                    onChange={(e) => setFormData({ ...formData, attendantPhone: e.target.value })}
                    placeholder="+91 99887-11223"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary"
                  />
                </div>

                {/* Relationship Dropdown */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Relationship</label>
                  <select
                    value={formData.attendantRelationship}
                    onChange={(e) => setFormData({ ...formData, attendantRelationship: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary cursor-pointer"
                  >
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;
