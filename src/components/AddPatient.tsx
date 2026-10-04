import React, { useState } from 'react';
import { 
  UserPlus, ArrowLeft, Save, CheckCircle2, AlertCircle, 
  ListOrdered, Phone, User, Calendar, MapPin, 
  Stethoscope, Clock, ShieldCheck, Mail, ArrowRight
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

  // Form State - with sensible defaults
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other' | '',
    phoneNumber: '',
    email: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    // Attendant (optional)
    attendantName: '',
    attendantPhone: '',
    attendantRelationship: '',
    // Queue Assignment (optional)
    assignedDoctor: 'Dr. Sarah Chen',
    triagePriority: 'Normal' as 'Normal' | 'Urgent' | 'Emergency',
    chiefComplaint: ''
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
      errs.age = 'Please enter a valid age (1-130)';
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
        gender: (formData.gender || 'Male') as 'Male' | 'Female' | 'Other',
        phone: formData.phoneNumber.trim() || '+91 98765-00000',
        address: formData.address.trim() || 'Bangalore, Karnataka',
        bloodGroup: formData.bloodGroup || undefined,
        attendantName: formData.attendantName.trim() || undefined,
        attendantPhone: formData.attendantPhone.trim() || undefined,
        attendantRelationship: formData.attendantRelationship.trim() || undefined,
        allergies: formData.allergies.trim() ? [formData.allergies.trim()] : undefined
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
      }, 1200);
    } catch (err) {
      console.error('Failed to register patient', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 font-serif pb-12 w-full max-w-5xl mx-auto space-y-6">
      {/* Top Header & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Return to Patient Directory"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
                New Patient Registration
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-medical-primary/10 text-medical-primary text-[10px] font-bold uppercase tracking-wider">
                NABH EHR
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Enter patient details. Only Full Name is strictly mandatory.
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold font-sans text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold font-sans shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>Save Patient</span>
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="px-4 py-2 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl text-xs font-bold font-sans shadow-md shadow-medical-primary/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ListOrdered size={15} />
            <span>Save and to Queue</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successInfo && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Patient Registered Successfully!</p>
                <p className="text-xs text-emerald-700 font-sans">
                  <strong>{successInfo.name}</strong> registered with ID <span className="font-mono font-bold">{successInfo.id}</span>.
                  {successInfo.queueToken && (
                    <span className="ml-1 text-emerald-800 font-bold">
                      Allocated OPD Token <span className="px-1.5 py-0.5 bg-emerald-200 rounded font-mono">#{successInfo.queueToken}</span> and sent to queue.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Page Registration Form Cards */}
      <div className="space-y-6">
        {/* Card 1: Primary Demographics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Patient Primary Identification</h2>
              <p className="text-[11px] text-slate-400 font-sans">Essential demographics and contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans text-xs">
            {/* Full Name (Mandatory) */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-2">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Full Name <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Legal or Official ID Name</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input 
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder="e.g. Ramesh Kumar / Ananya Sharma"
                  className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary/20 focus:border-medical-primary'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-[10px] text-rose-500 font-bold">{errors.fullName}</p>}
            </div>

            {/* Phone Number (Optional) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Primary Mobile Number</span>
                <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input 
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+91 98765-43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
                />
              </div>
            </div>

            {/* Age (Optional) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Age (Years)</span>
                <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
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
                  className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.age ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary/20 focus:border-medical-primary'
                  }`}
                />
              </div>
              {errors.age && <p className="text-[10px] text-rose-500 font-bold">{errors.age}</p>}
            </div>

            {/* Gender Chips (Optional) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Male', 'Female', 'Other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      formData.gender === g
                        ? 'bg-medical-primary text-white border-medical-primary shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Blood Group Dropdown (Optional) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Blood Group</span>
                <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all cursor-pointer"
              >
                <option value="">Select Blood Group...</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Address (Optional) */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Residential Address & Location</span>
                <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={15} />
                <textarea 
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House/Apartment, Street, Area, City, Pincode"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: OPD Doctor Queue & Triage Assignment */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Doctor Assignment & OPD Queue</h2>
                <p className="text-[11px] text-slate-400">Select doctor and priority for immediate queue allocation</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Token Generation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Assign Doctor */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Stethoscope size={14} className="text-medical-primary" />
                <span>Consulting Physician</span>
              </label>
              <select
                value={formData.assignedDoctor}
                onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 cursor-pointer"
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
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                <span>Triage Priority</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Normal', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                  { id: 'Urgent', bg: 'bg-amber-50 border-amber-200 text-amber-800' },
                  { id: 'Emergency', bg: 'bg-rose-50 border-rose-200 text-rose-800' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, triagePriority: p.id as any })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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

        {/* Card 3: Attendant & Emergency Contact Details (Optional) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Attendant & Emergency Contact</h2>
              <p className="text-[11px] text-slate-400 font-sans">Companion or guardian information (All optional)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
            {/* Attendant Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Attendant Name</label>
              <input 
                type="text"
                value={formData.attendantName}
                onChange={(e) => setFormData({ ...formData, attendantName: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
              />
            </div>

            {/* Attendant Phone */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Attendant Mobile</label>
              <input 
                type="tel"
                value={formData.attendantPhone}
                onChange={(e) => setFormData({ ...formData, attendantPhone: e.target.value })}
                placeholder="+91 99887-11223"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
              />
            </div>

            {/* Relationship Dropdown */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Relationship</label>
              <select
                value={formData.attendantRelationship}
                onChange={(e) => setFormData({ ...formData, attendantRelationship: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all cursor-pointer"
              >
                <option value="">Select Relationship...</option>
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 4: Clinical Allergies & Chief Complaint (Optional) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Clinical Safety & Symptoms</h2>
              <p className="text-[11px] text-slate-400 font-sans">Drug allergies and preliminary clinical complaints (Optional)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Known Drug Allergies</label>
              <input 
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g. Penicillin, NSAIDs, Sulfa (or None)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Chief Clinical Complaint / Symptoms</label>
              <input 
                type="text"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                placeholder="e.g. Acute fever, headache x 3 days"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold font-sans text-slate-600 hover:bg-slate-50 transition-all cursor-pointer text-center"
          >
            Cancel & Return
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold font-sans shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              <span>Save Patient</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl text-xs font-bold font-sans shadow-md shadow-medical-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ListOrdered size={16} />
              <span>Save and to Queue</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;
