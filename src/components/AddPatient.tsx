import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Save, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSharedPatients } from '../hooks/useSharedPatients';

interface AddPatientProps {
  onBack: () => void;
}

const AddPatient: React.FC<AddPatientProps> = ({ onBack }) => {
  const { addPatient } = useSharedPatients();

  // Form State - strictly requested fields only
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '' as 'Male' | 'Female' | 'Other' | '',
    phoneNumber: '',
    address: '',
    bloodGroup: '',
    attendantName: '',
    attendantPhone: '',
    attendantRelationship: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ id: string; name: string } | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }
    if (!formData.age.trim() || isNaN(Number(formData.age)) || Number(formData.age) <= 0 || Number(formData.age) > 130) {
      errs.age = 'Please enter a valid age (1-130)';
    }
    if (!formData.gender) {
      errs.gender = 'Gender selection is required';
    }
    if (!formData.phoneNumber.trim()) {
      errs.phoneNumber = 'Phone Number is required';
    } else if (formData.phoneNumber.trim().length < 7) {
      errs.phoneNumber = 'Please enter a valid phone number';
    }
    if (!formData.address.trim()) {
      errs.address = 'Residential Address is required';
    }
    if (!formData.attendantName.trim()) {
      errs.attendantName = 'Attendant Name is required';
    }
    if (!formData.attendantPhone.trim()) {
      errs.attendantPhone = 'Attendant Contact Number is required';
    }
    if (!formData.attendantRelationship.trim()) {
      errs.attendantRelationship = 'Relationship with patient is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const created = addPatient({
        name: formData.fullName.trim(),
        age: Number(formData.age),
        gender: formData.gender as 'Male' | 'Female' | 'Other',
        phone: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        bloodGroup: formData.bloodGroup || undefined,
        attendantName: formData.attendantName.trim(),
        attendantPhone: formData.attendantPhone.trim(),
        attendantRelationship: formData.attendantRelationship.trim()
      });

      setSuccessInfo({ id: created.id, name: created.name });

      setTimeout(() => {
        setIsSubmitting(false);
        onBack(); // Return to patient directory with newly registered patient
      }, 1200);
    } catch (err) {
      console.error('Failed to register patient', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 max-w-4xl mx-auto pb-10">
      {/* Top Navigation */}
      <button 
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-medical-primary font-bold mb-4 hover:translate-x-[-2px] transition-transform text-sm"
      >
        <ArrowLeft size={18} />
        Back to Patient Directory
      </button>

      {/* Success Notification */}
      {successInfo && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Patient Registered Successfully!</p>
            <p className="text-xs text-emerald-700">
              {successInfo.name} has been assigned ID <span className="font-bold">{successInfo.id}</span> and is now available in the directory, queue, and appointments.
            </p>
          </div>
        </div>
      )}

      {/* Main Registration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-primary/10 text-medical-primary flex items-center justify-center shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">Patient Registration</h2>
              <p className="text-xs md:text-sm text-slate-500">Enter essential patient details and attendant information</p>
            </div>
          </div>
          <span className="text-[10pt] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
            Step 1 of 1
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 md:p-8 space-y-6">
          {/* Section 1: Patient Details */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-medical-primary/10 text-medical-primary text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Patient Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <label className="text-xs font-bold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder="e.g. John Anderson"
                  className={`w-full bg-slate-50 border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary/20 focus:border-medical-primary'
                  }`}
                />
                {errors.fullName && <p className="text-[11px] text-rose-500 font-medium">{errors.fullName}</p>}
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="130"
                  value={formData.age}
                  onChange={(e) => {
                    setFormData({ ...formData, age: e.target.value });
                    if (errors.age) setErrors({ ...errors, age: '' });
                  }}
                  placeholder="e.g. 45"
                  className={`w-full bg-slate-50 border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.age ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary/20 focus:border-medical-primary'
                  }`}
                />
                {errors.age && <p className="text-[11px] text-rose-500 font-medium">{errors.age}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={formData.gender}
                  onChange={(e) => {
                    setFormData({ ...formData, gender: e.target.value as any });
                    if (errors.gender) setErrors({ ...errors, gender: '' });
                  }}
                  className={`w-full bg-slate-50 border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                    errors.gender ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary/20 focus:border-medical-primary'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-[11px] text-rose-500 font-medium">{errors.gender}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Phone Number (+91) <span className="text-rose-500">*</span>
                </label>
                <div className={`flex rounded-xl overflow-hidden bg-slate-50 border transition-all ${
                  errors.phoneNumber ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-200' : 'border-slate-200 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary'
                }`}>
                  <span className="inline-flex items-center px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, phoneNumber: e.target.value });
                      if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
                    }}
                    placeholder="98765-43210"
                    className="w-full bg-transparent p-2.5 text-sm focus:outline-none"
                  />
                </div>
                {errors.phoneNumber && <p className="text-[11px] text-rose-500 font-medium">{errors.phoneNumber}</p>}
              </div>

              {/* Blood Group — Optional */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Blood Group</label>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Optional</span>
                </div>
                <select 
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all cursor-pointer"
                >
                  <option value="">Select Blood Group (Optional)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Address */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-bold text-slate-700">
                  Address <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  rows={2}
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: '' });
                  }}
                  placeholder="Street address, city, state, postal code"
                  className={`w-full bg-slate-50 border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.address ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary/20 focus:border-medical-primary'
                  }`}
                />
                {errors.address && <p className="text-[11px] text-rose-500 font-medium">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Attendant Information */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-medical-primary/10 text-medical-primary text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Attendant Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Attendant Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Attendant Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.attendantName}
                  onChange={(e) => {
                    setFormData({ ...formData, attendantName: e.target.value });
                    if (errors.attendantName) setErrors({ ...errors, attendantName: '' });
                  }}
                  placeholder="e.g. Jane Anderson"
                  className={`w-full bg-slate-50 border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.attendantName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary/20 focus:border-medical-primary'
                  }`}
                />
                {errors.attendantName && <p className="text-[11px] text-rose-500 font-medium">{errors.attendantName}</p>}
              </div>

              {/* Attendant Contact Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Attendant Contact Number (+91) <span className="text-rose-500">*</span>
                </label>
                <div className={`flex rounded-xl overflow-hidden bg-slate-50 border transition-all ${
                  errors.attendantPhone ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-200' : 'border-slate-200 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary'
                }`}>
                  <span className="inline-flex items-center px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    value={formData.attendantPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, attendantPhone: e.target.value });
                      if (errors.attendantPhone) setErrors({ ...errors, attendantPhone: '' });
                    }}
                    placeholder="99887-55443"
                    className="w-full bg-transparent p-2.5 text-sm focus:outline-none"
                  />
                </div>
                {errors.attendantPhone && <p className="text-[11px] text-rose-500 font-medium">{errors.attendantPhone}</p>}
              </div>

              {/* Relationship with Patient */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Relationship with Patient <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.attendantRelationship}
                  onChange={(e) => {
                    setFormData({ ...formData, attendantRelationship: e.target.value });
                    if (errors.attendantRelationship) setErrors({ ...errors, attendantRelationship: '' });
                  }}
                  placeholder="e.g. Spouse, Parent, Sibling"
                  className={`w-full bg-slate-50 border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.attendantRelationship ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary/20 focus:border-medical-primary'
                  }`}
                />
                {errors.attendantRelationship && <p className="text-[11px] text-rose-500 font-medium">{errors.attendantRelationship}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-2.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl text-sm font-bold shadow-md shadow-medical-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {isSubmitting ? 'Registering...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;
