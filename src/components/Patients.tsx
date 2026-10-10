import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Plus, Eye, Edit, 
  UserPlus, 
  ArrowLeft, Mail, Phone, MapPin, Droplets, ShieldCheck, 
  Clock, Trash2,
  ChevronDown, CheckCircle2, Play, X, Pill, Stethoscope, CreditCard
} from 'lucide-react';
import { mockDoctors } from '../mockData';
import { Patient } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import AddPatient from './AddPatient';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useSharedQueue } from '../hooks/useSharedQueue';
import { useSharedPatients } from '../hooks/useSharedPatients';
import { useActivePatientContext } from '../hooks/useActivePatientContext';

interface PatientsProps {
  setActiveTab: (tab: string) => void;
}

const Patients: React.FC<PatientsProps> = ({ setActiveTab }) => {
  const { patients, deletePatient: deletePatientFromStore, updatePatient } = useSharedPatients();
  const { navigateWithPatient } = useActivePatientContext();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [view, setView] = useState<'list' | 'profile' | 'add'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Restrict suggestions strictly to registered patient names only
  const suggestions = useSearchSuggestions(searchTerm, ['patient']);
  const searchRef = useRef<HTMLDivElement>(null);
  const [profileTab, setProfileTab] = useState('Overview');

  // Edit Patient Modal State
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Shared Queue Integration
  const { queue, addToQueue, updateStatus, removeItem } = useSharedQueue();
  const [queueModalPatient, setQueueModalPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah Chen');
  const [queuePriority, setQueuePriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [queueSuccess, setQueueSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setSearchTerm(item.title);
    setShowSuggestions(false);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deletePatientFromStore(deleteConfirmId);
      setDeleteConfirmId(null);
      if (selectedPatient?.id === deleteConfirmId) {
        setSelectedPatient(null);
        setView('list');
      }
    }
  };

  const handleConfirmAddToQueue = () => {
    if (!queueModalPatient) return;
    const addedItem = addToQueue(queueModalPatient, {
      doctorName: selectedDoctor,
      priority: queuePriority
    });
    setQueueSuccess(`${queueModalPatient.name} added to Queue at position #${addedItem.queueNumber}`);
    setQueueModalPatient(null);
    setTimeout(() => {
      setQueueSuccess(null);
    }, 4000);
  };

  const getPatientQueueItem = (patientId: string) => {
    return queue.find(q => q.patientId === patientId);
  };

  // Filter patients by search term and status
  const filteredPatients = patients.filter(p => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (view === 'add') {
    return <AddPatient onBack={() => setView('list')} setActiveTab={setActiveTab} />;
  }

  if (view === 'profile' && selectedPatient) {
    const patientQueueItem = getPatientQueueItem(selectedPatient.id);

    return (
      <div className="animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setView('list')}
          className="flex items-center gap-2 text-medical-primary font-medium mb-6 hover:translate-x-1 transition-transform"
        >
          <ArrowLeft size={20} />
          Back to Patient List
        </button>

        {/* Patient Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden border-2 border-medical-primary/10">
               <img 
                 src="/src/assets/images/patient_male_portrait_1790961113192.jpg" 
                 alt={selectedPatient.name} 
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   e.currentTarget.src = `https://ui-avatars.com/api/?name=${selectedPatient.name}&background=0284c7&color=fff`;
                 }}
               />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h2 className="text-[18pt] font-bold text-slate-900">{selectedPatient.name}</h2>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase self-center">
                  {selectedPatient.status}
                </span>
                {patientQueueItem && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase flex items-center gap-1.5 self-center border border-amber-200">
                    <Clock size={12} className="animate-spin text-amber-600" />
                    In Queue: #{patientQueueItem.queueNumber} ({patientQueueItem.status})
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-8 text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-400">ID:</span>
                  <span className="tabular-nums font-medium">{selectedPatient.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span className="tabular-nums font-medium">{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span className="font-medium">{selectedPatient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="font-medium">{selectedPatient.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets size={14} className="text-rose-500" />
                  <span className="font-medium">Blood Group: {selectedPatient.bloodGroup}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-500" />
                  <span className="font-medium">Insurance: {selectedPatient.insuranceProvider}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => navigateWithPatient(selectedPatient, 'prescriptions', setActiveTab)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
                title="Generate digital prescription for this patient"
              >
                <Pill size={18} />
                <span>Write Rx</span>
              </button>
              <button 
                onClick={() => navigateWithPatient(selectedPatient, 'consultation', setActiveTab)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-sm"
                title="Start clinical consultation for this patient"
              >
                <Stethoscope size={18} />
                <span>Consult</span>
              </button>
              <button 
                onClick={() => setQueueModalPatient(selectedPatient)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-amber-600 transition-all shadow-sm"
              >
                <Clock size={18} />
                {patientQueueItem ? 'Update Queue' : 'Add to Queue'}
              </button>
              <button 
                onClick={() => navigateWithPatient(selectedPatient, 'appointments', setActiveTab)}
                className="px-4 py-2 bg-medical-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-medical-primary/90"
              >
                <Plus size={18} /> New Appointment
              </button>
              <button 
                onClick={() => navigateWithPatient(selectedPatient, 'billing', setActiveTab)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50 text-slate-700 shadow-2xs"
              >
                <CreditCard size={18} /> Create Bill
              </button>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {['Overview', 'Queue Status', 'Appointments', 'Medical Records', 'Prescriptions', 'Bills', 'Payments', 'Documents', 'Notes'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setProfileTab(tab)}
                className={`px-6 py-4 text-[12pt] font-medium whitespace-nowrap border-b-2 transition-colors ${
                  profileTab === tab ? 'border-medical-primary text-medical-primary bg-medical-primary/5 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
                {tab === 'Queue Status' && patientQueueItem && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                    #{patientQueueItem.queueNumber}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-8">
            {profileTab === 'Queue Status' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-[14pt] font-bold text-slate-900 flex items-center gap-2">
                      <Clock size={20} className="text-amber-500" />
                      Queue Status for {selectedPatient.name}
                    </h3>
                    <p className="text-[11pt] text-slate-500">Showing only this patient in the active queue</p>
                  </div>
                  {!patientQueueItem && (
                    <button
                      onClick={() => setQueueModalPatient(selectedPatient)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={16} /> Add to Queue Now
                    </button>
                  )}
                </div>

                {patientQueueItem ? (
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="p-4 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[9pt] font-bold text-slate-400 uppercase tracking-wider block">Queue Number</span>
                        <span className="text-3xl font-bold text-amber-600 tabular-nums">#{patientQueueItem.queueNumber}</span>
                      </div>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[9pt] font-bold text-slate-400 uppercase tracking-wider block">Assigned Doctor</span>
                        <span className="text-base font-bold text-slate-900">{patientQueueItem.doctorName}</span>
                      </div>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[9pt] font-bold text-slate-400 uppercase tracking-wider block">Wait Duration</span>
                        <span className="text-base font-bold text-slate-700">{patientQueueItem.waitingTime}</span>
                      </div>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[9pt] font-bold text-slate-400 uppercase tracking-wider block">Priority</span>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                          patientQueueItem.priority === 'Urgent' ? 'bg-amber-100 text-amber-800' :
                          patientQueueItem.priority === 'Emergency' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {patientQueueItem.priority}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-sm font-bold text-slate-700">Status: {patientQueueItem.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            updateStatus(patientQueueItem.id, 'In Consultation');
                            setActiveTab('consultation');
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5"
                        >
                          <Play size={14} /> Start Consultation
                        </button>
                        <button 
                          onClick={() => removeItem(patientQueueItem.id)}
                          className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs hover:bg-rose-100"
                        >
                          Remove from Queue
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Clock size={36} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">{selectedPatient.name} is currently not in the queue.</p>
                    <p className="text-xs text-slate-400 mt-1">Add them to the queue to assign a queue number and doctor.</p>
                    <button
                      onClick={() => setQueueModalPatient(selectedPatient)}
                      className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow-sm inline-flex items-center gap-1.5"
                    >
                      <Plus size={16} /> Add to Queue
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-[14pt] font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-medical-primary" />
                    Recent History
                  </h3>
                  <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {[
                      { title: 'Regular Checkup', date: '30/09/2023', dr: 'Dr. Sarah Chen', status: 'Completed' },
                      { title: 'Follow-up Consultation', date: '15/08/2023', dr: 'Dr. Michael Roberts', status: 'Completed' },
                      { title: 'Blood Test Results', date: '10/08/2023', dr: 'Lab Assistant', status: 'Completed' }
                    ].map((item, idx) => (
                      <div key={idx} className="relative pl-10">
                        <div className="absolute left-0 top-1.5 w-6.5 h-6.5 rounded-full bg-white border-4 border-medical-primary flex items-center justify-center z-10"></div>
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[12pt] text-slate-500">{item.date} · {item.dr}</p>
                          <span className="text-[10pt] text-emerald-600 font-bold mt-1 inline-block">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[14pt] font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-medical-primary" />
                    Medical Information
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10pt] text-slate-500 font-bold uppercase mb-1">Emergency Contact</p>
                      <p className="font-medium text-slate-900">{selectedPatient.emergencyContact}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10pt] text-slate-500 font-bold uppercase mb-1">Allergies</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Penicillin', 'Dust', 'Peanuts'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10pt] rounded font-medium border border-rose-100">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10pt] text-slate-500 font-bold uppercase mb-1">Active Medications</p>
                      <p className="font-medium text-slate-900">Lisinopril 10mg, Loratadine 10mg</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Add to Queue */}
        <AnimatePresence>
          {queueModalPatient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
                    <Clock size={20} className="text-amber-600" />
                    Add Patient to Queue
                  </div>
                  <button onClick={() => setQueueModalPatient(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Shows ONLY the added patient */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="text-[10pt] font-bold text-slate-400 uppercase tracking-wider">Patient To Add</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-slate-900">{queueModalPatient.name}</p>
                        <p className="text-xs text-slate-500">ID: {queueModalPatient.id} · {queueModalPatient.age}Y, {queueModalPatient.gender} · Blood: {queueModalPatient.bloodGroup}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                        Next in Queue
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assign Consulting Doctor</label>
                    <select 
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      {mockDoctors.map(doc => (
                        <option key={doc.id} value={doc.name}>{doc.name} — {doc.specialization}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Priority Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Normal', 'Urgent', 'Emergency'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setQueuePriority(lvl)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            queuePriority === lvl
                              ? lvl === 'Emergency' ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : lvl === 'Urgent' ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-medical-primary text-white border-medical-primary shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setQueueModalPatient(null)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={handleConfirmAddToQueue}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Clock size={16} /> Confirm & Add to Queue
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast Notification */}
      <AnimatePresence>
        {queueSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-800 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-amber-600" />
              <span className="font-bold text-sm">{queueSuccess}</span>
            </div>
            <button 
              onClick={() => setActiveTab('queue')}
              className="text-xs font-bold underline hover:text-amber-950"
            >
              View in Queue →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[14pt] font-bold text-slate-900">Patient Directory</h2>
          <p className="text-[12pt] text-slate-500">Manage and view your patient database</p>
        </div>
        <button 
          onClick={() => setView('add')}
          className="flex items-center gap-2 px-4 py-2 bg-medical-primary text-white rounded-lg text-[12pt] font-medium hover:bg-medical-primary/90 shadow-sm"
        >
          <UserPlus size={18} />
          Register New Patient
        </button>
      </div>

      {/* Search & Status Filter (Filter button removed as requested) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search patient by name, ID or phone..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
          />
          <SearchSuggestions 
            isVisible={showSuggestions} 
            suggestions={suggestions} 
            onSelect={handleSelectSuggestion} 
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto bg-white border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-sm focus:outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all font-medium text-slate-700"
            >
              <option value="All">Status: All Patients</option>
              <option value="Active">Status: Active Only</option>
              <option value="Inactive">Status: Inactive Only</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Age / Gender</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((p) => {
                const itemInQueue = getPatientQueueItem(p.id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-medical-primary border border-slate-200 shrink-0 text-sm">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <span 
                            className="font-bold text-slate-900 hover:text-medical-primary transition-colors cursor-pointer block text-sm" 
                            onClick={() => { setSelectedPatient(p); setView('profile'); }}
                          >
                            {p.name}
                          </span>
                          {itemInQueue && (
                            <span className="inline-flex items-center gap-1 text-[8pt] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                              <Clock size={10} /> Queued #{itemInQueue.queueNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 tabular-nums text-slate-500 font-medium text-sm">{p.id}</td>
                    <td className="px-6 py-3.5 text-slate-600 text-sm">{p.age}Y / {p.gender}</td>
                    <td className="px-6 py-3.5 tabular-nums text-slate-600 text-sm">{p.phone}</td>
                    <td className="px-6 py-3.5 tabular-nums text-slate-600 text-sm">{p.lastVisit}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {/* ALL ACTION BUTTONS PERMANENTLY VISIBLE */}
                      <div className="flex items-center justify-end gap-1.5 opacity-100">
                        <button 
                          onClick={() => navigateWithPatient(p, 'prescriptions', setActiveTab)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                          title="Write Prescription"
                        >
                          <Pill size={12} />
                          <span>Rx</span>
                        </button>
                        <button 
                          onClick={() => navigateWithPatient(p, 'consultation', setActiveTab)}
                          className="px-2 py-1 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                          title="Start Consultation"
                        >
                          <Stethoscope size={12} />
                          <span>Consult</span>
                        </button>
                        <button 
                          onClick={() => setQueueModalPatient(p)}
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                          title="Add to Queue"
                        >
                          <Clock size={12} />
                          <span>Queue</span>
                        </button>
                        <button 
                          onClick={() => { setSelectedPatient(p); setView('profile'); }}
                          className="p-1.5 text-medical-primary bg-medical-primary/10 hover:bg-medical-primary hover:text-white rounded-lg transition-all"
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => setEditingPatient(p)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all" 
                          title="Edit Patient"
                        >
                          <Edit size={15} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(p.id)} 
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-all" 
                          title="Delete Patient"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <p className="text-sm font-bold text-slate-700">No patient records found matching your search.</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching with a different patient name or register a new patient.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <p>Showing {filteredPatients.length} of {patients.length} registered patients</p>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Patient Directory (Active Sync)</span>
          </div>
        </div>
      </div>

      {/* Delete Patient Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Patient Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently remove this patient from the directory? This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Yes, Delete Patient
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Patient Modal */}
      <AnimatePresence>
        {editingPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Edit size={18} className="text-medical-primary" />
                  Edit Patient Details: {editingPatient.name}
                </div>
                <button onClick={() => setEditingPatient(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                updatePatient(editingPatient.id, editingPatient);
                setEditingPatient(null);
              }} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <input 
                      type="text" 
                      value={editingPatient.name} 
                      onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Age</label>
                    <input 
                      type="number" 
                      value={editingPatient.age} 
                      onChange={(e) => setEditingPatient({ ...editingPatient, age: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Gender</label>
                    <select 
                      value={editingPatient.gender} 
                      onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number (+91)</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary">
                      <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        value={editingPatient.phone.replace(/^\+91\s*/, '')} 
                        onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                        placeholder="98765-43210"
                        className="w-full bg-transparent p-2 text-sm focus:outline-none" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Blood Group</label>
                    <select 
                      value={editingPatient.bloodGroup} 
                      onChange={(e) => setEditingPatient({ ...editingPatient, bloodGroup: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                    >
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-slate-700">Address</label>
                    <textarea 
                      rows={2}
                      value={editingPatient.address} 
                      onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm" 
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select 
                      value={editingPatient.status} 
                      onChange={(e) => setEditingPatient({ ...editingPatient, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setEditingPatient(null)} 
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add to Queue from Table */}
      <AnimatePresence>
        {queueModalPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
                  <Clock size={20} className="text-amber-600" />
                  Add Patient to Waiting Queue
                </div>
                <button onClick={() => setQueueModalPatient(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Shows ONLY the added patient */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="text-[10pt] font-bold text-slate-400 uppercase tracking-wider">Patient To Add</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">{queueModalPatient.name}</p>
                      <p className="text-xs text-slate-500">ID: {queueModalPatient.id} · {queueModalPatient.age}Y, {queueModalPatient.gender} · Blood: {queueModalPatient.bloodGroup}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                      Next in Queue
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assign Consulting Doctor</label>
                  <select 
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {mockDoctors.map(doc => (
                      <option key={doc.id} value={doc.name}>{doc.name} — {doc.specialization}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Priority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Normal', 'Urgent', 'Emergency'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setQueuePriority(lvl)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          queuePriority === lvl
                            ? lvl === 'Emergency' ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : lvl === 'Urgent' ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-medical-primary text-white border-medical-primary shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setQueueModalPatient(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirmAddToQueue}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Clock size={16} /> Confirm & Add to Queue
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Patients;
