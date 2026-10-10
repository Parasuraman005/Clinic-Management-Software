import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ListOrdered, Play, CheckCircle2, 
  Clock, AlertCircle, User, Trash2,
  Plus, X, Search, UserPlus, ShieldAlert,
  ChevronRight, UserCheck, Pill, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useSharedQueue, ExtendedQueueItem } from '../hooks/useSharedQueue';
import { hasPatientCompletedPayment } from '../hooks/useSharedPayments';
import { useSharedDoctors } from '../hooks/useSharedDoctors';
import { useSharedPatients } from '../hooks/useSharedPatients';
import { useActivePatientContext } from '../hooks/useActivePatientContext';
import { Patient } from '../types';

interface QueueProps {
  setActiveTab: (tab: string) => void;
}

const Queue: React.FC<QueueProps> = ({ setActiveTab }) => {
  const { queue, addToQueue: addSharedQueue, updateStatus, removeItem } = useSharedQueue();
  const { doctors } = useSharedDoctors();
  const { patients } = useSharedPatients();
  const { navigateWithPatient } = useActivePatientContext();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Suggestions strictly for registered patients only
  const suggestions = useSearchSuggestions(searchTerm, ['patient']);
  const searchRef = useRef<HTMLDivElement>(null);

  // Selected doctor and priority for adding
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah Chen');
  const [selectedPriority, setSelectedPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');

  // Confirmation dialog for delete/remove
  const [itemToDelete, setItemToDelete] = useState<ExtendedQueueItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter registered patients for quick list
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients.slice(0, 5);
    const q = searchTerm.toLowerCase().trim();
    return patients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    ).slice(0, 6);
  }, [patients, searchTerm]);

  // Check if search query exactly matches any patient
  const exactMatchPatient = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const q = searchTerm.toLowerCase().trim();
    return patients.find(p => p.name.toLowerCase() === q || p.id.toLowerCase() === q);
  }, [patients, searchTerm]);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    const matched = item.payload || patients.find(p => p.id === item.id);
    if (matched) {
      setSelectedPatient(matched);
      setSearchTerm(matched.name);
      setValidationError(null);
    }
    setShowSuggestions(false);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.name);
    setValidationError(null);
    setShowSuggestions(false);
  };

  // Submit Handler: Strict enforcement - Only registered patients can be added
  const handleConfirmAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. If not selected, check if searchTerm matches an existing patient
    let patientToQueue = selectedPatient;
    if (!patientToQueue && searchTerm.trim()) {
      const matched = patients.find(
        p => p.name.toLowerCase() === searchTerm.trim().toLowerCase() || p.id.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (matched) {
        patientToQueue = matched;
      }
    }

    // 2. Strict check: Patient MUST be registered
    if (!patientToQueue) {
      setValidationError('Patient not found in directory. Only registered patients can be added to the queue. Please register the patient first.');
      return;
    }

    // 3. Add to FIFO queue
    const added = addSharedQueue(
      { name: patientToQueue.name, id: patientToQueue.id },
      { doctorName: selectedDoctor, priority: selectedPriority }
    );

    showToast(`${added.patientName} (ID: ${added.patientId}) added to Queue at Position #${added.queueNumber}`);
    setSearchTerm('');
    setSelectedPatient(null);
    setValidationError(null);
    setShowAddModal(false);
  };

  const startConsultation = (id: string, patientName: string) => {
    updateStatus(id, 'In Consultation');
    showToast(`Consultation started for ${patientName}`);
  };

  const completeQueueItem = (id: string, patientName: string) => {
    const item = queue.find(q => q.id === id);
    const isPaid = item ? hasPatientCompletedPayment(item.patientId, item.patientName) : false;
    updateStatus(id, 'Completed');
    if (isPaid) {
      showToast(`Consultation & payment complete — ${patientName} removed from queue.`);
    } else {
      showToast(`Consultation completed for ${patientName}. Settle payment in Billing to clear queue.`);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.id);
      showToast(`${itemToDelete.patientName} removed from queue`);
      setItemToDelete(null);
    }
  };

  // Strict FIFO order: sort by entryTimestamp or queueNumber
  const sortedQueue = [...queue].sort((a, b) => {
    const timeA = a.entryTimestamp || 0;
    const timeB = b.entryTimestamp || 0;
    if (timeA !== timeB) return timeA - timeB;
    return parseInt(a.queueNumber) - parseInt(b.queueNumber);
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-serif pb-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-indigo-600" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:text-indigo-950">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Live Queue Management</h2>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 uppercase tracking-wider">
              Strict FIFO Order
            </span>
          </div>
          <p className="text-xs text-slate-500">First In, First Out operational clinic queue with real-time tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const next = sortedQueue.find(q => q.status === 'Waiting');
              if (next) startConsultation(next.id, next.patientName);
              else showToast('No waiting patients in queue');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <UserCheck size={15} />
            <span>Call Next Patient</span>
          </button>
          <button 
            onClick={() => {
              setSelectedPatient(null);
              setSearchTerm('');
              setValidationError(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add to Queue</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue Length</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums">{sortedQueue.length} Patients</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ListOrdered size={16} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waiting Room</p>
            <p className="text-lg font-bold text-amber-600 tabular-nums">
              {sortedQueue.filter(q => q.status === 'Waiting').length} Waiting
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={16} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Consultation</p>
            <p className="text-lg font-bold text-purple-600 tabular-nums">
              {sortedQueue.filter(q => q.status === 'In Consultation').length} Active
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <User size={16} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue Policy</p>
            <p className="text-xs font-bold text-slate-800">Registered Patients Only</p>
            <span className="text-[9px] text-slate-400">Strict FIFO Allocation</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={16} />
          </div>
        </div>
      </div>

      {/* CURRENT QUEUE TABLE - STRICT FIFO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ListOrdered size={16} className="text-medical-primary" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">
              Current Patient Queue (Ordered by Entry Time)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
            Auto-sequencing: #01 to #{sortedQueue.length.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider text-center">Queue #</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Patient Name & ID</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Added Time</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Doctor / Appointment Info</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider text-center">Current Status</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedQueue.map((item, idx) => {
                const isNextInLine = idx === 0 && item.status === 'Waiting';
                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50/70 transition-colors ${
                      item.status === 'In Consultation' ? 'bg-purple-50/30' : isNextInLine ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Queue Number */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm tabular-nums ${
                        isNextInLine ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-800'
                      }`}>
                        #{item.queueNumber}
                      </span>
                    </td>

                    {/* Patient Name & Patient ID */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{item.patientName}</span>
                        {isNextInLine && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                            NEXT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 tabular-nums font-medium">
                        Patient ID: <span className="text-slate-700 font-bold">{item.patientId}</span>
                      </div>
                    </td>

                    {/* Added Time */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 tabular-nums">
                        <Clock size={13} className="text-slate-400" />
                        <span>{item.addedTime || 'Just Now'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">Wait: {item.waitingTime}</span>
                    </td>

                    {/* Appointment / Doctor Information */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{item.doctorName}</div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        Apt Ref: {item.appointmentId || 'Walk-in'}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.priority === 'Urgent' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        item.priority === 'Emergency' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {item.priority}
                      </span>
                    </td>

                    {/* Current Status */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'In Consultation' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          item.status === 'Completed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'In Consultation' ? 'bg-purple-500 animate-pulse' :
                            item.status === 'Completed' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          {item.status === 'Completed' ? 'Consultation Done' : item.status}
                        </span>
                        {item.status === 'Completed' && (
                          <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5">
                            <Clock size={10} /> Awaiting Payment
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-100">
                        {/* Quick Direct Interconnected Rx */}
                        <button
                          onClick={() => {
                            const patient = patients.find(p => p.id === item.patientId || p.name === item.patientName);
                            if (patient) {
                              navigateWithPatient(patient, 'prescriptions', setActiveTab);
                            } else {
                              navigateWithPatient({
                                id: item.patientId,
                                name: item.patientName,
                                age: 35,
                                gender: 'Male',
                                phone: '+91 98765-00000',
                                lastVisit: 'Today',
                                status: 'Active',
                                bloodGroup: 'O+',
                                address: 'Bangalore, Karnataka',
                                email: '',
                                allergies: 'None',
                                emergencyContact: 'None Provided',
                                insuranceProvider: 'None',
                                insuranceNumber: 'N/A'
                              }, 'prescriptions', setActiveTab);
                            }
                          }}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded text-xs font-bold flex items-center gap-1 transition-all"
                          title="Generate Prescription for this Patient"
                        >
                          <Pill size={11} />
                          <span>Rx</span>
                        </button>

                        {/* Quick Direct Interconnected Bill */}
                        <button
                          onClick={() => {
                            const patient = patients.find(p => p.id === item.patientId || p.name === item.patientName);
                            if (patient) {
                              navigateWithPatient(patient, 'billing', setActiveTab);
                            } else {
                              navigateWithPatient({
                                id: item.patientId,
                                name: item.patientName,
                                age: 35,
                                gender: 'Male',
                                phone: '+91 98765-00000',
                                lastVisit: 'Today',
                                status: 'Active',
                                bloodGroup: 'O+',
                                address: 'Bangalore, Karnataka',
                                email: '',
                                allergies: 'None',
                                emergencyContact: 'None Provided',
                                insuranceProvider: 'None',
                                insuranceNumber: 'N/A'
                              }, 'billing', setActiveTab);
                            }
                          }}
                          className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 rounded text-xs font-bold flex items-center gap-1 transition-all"
                          title="Create Bill for this Patient"
                        >
                          <CreditCard size={11} />
                          <span>Bill</span>
                        </button>

                        {item.status === 'Waiting' ? (
                          <button 
                            onClick={() => {
                              startConsultation(item.id, item.patientName);
                              const patient = patients.find(p => p.id === item.patientId || p.name === item.patientName);
                              if (patient) {
                                navigateWithPatient(patient, 'consultation', setActiveTab);
                              }
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-xs shadow-xs transition-all cursor-pointer"
                            title="Start Consultation"
                          >
                            <Play size={11} /> Start
                          </button>
                        ) : item.status === 'In Consultation' ? (
                          <button 
                            onClick={() => completeQueueItem(item.id, item.patientName)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs shadow-xs transition-all cursor-pointer"
                            title="Complete Consultation"
                          >
                            <CheckCircle2 size={11} /> Finish
                          </button>
                        ) : item.status === 'Completed' ? (
                          <button 
                            onClick={() => {
                              const patient = patients.find(p => p.id === item.patientId || p.name === item.patientName);
                              if (patient) {
                                navigateWithPatient(patient, 'billing', setActiveTab);
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-xs shadow-xs transition-all cursor-pointer"
                            title="Consultation completed — Settle payment in Billing to clear queue"
                          >
                            <CreditCard size={11} /> Settle Bill
                          </button>
                        ) : null}

                        {/* Delete / Remove with Confirmation Dialog */}
                        <button 
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-md transition-all cursor-pointer"
                          title="Remove from Queue"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedQueue.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-400">
                    <Clock size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No patients currently in queue.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click the "Add to Queue" button above to select an existing registered patient.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{sortedQueue.length} patient{sortedQueue.length === 1 ? '' : 's'} in queue sequence</span>
          <span className="font-semibold text-slate-600">FIFO Queue Controller Active</span>
        </div>
      </div>

      {/* STRICT ADD TO QUEUE MODAL (ONLY REGISTERED PATIENTS ALLOWED) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 overflow-hidden max-h-[90vh] flex flex-col font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold">
                    <ListOrdered size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Add Registered Patient to Queue</h3>
                    <p className="text-[10px] text-slate-500">Select an existing patient from directory (Strict FIFO order)</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleConfirmAddToQueue} className="space-y-4 text-xs overflow-y-auto pr-1">
                {/* Search / Select Patient Input */}
                <div className="space-y-1.5" ref={searchRef}>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                    <span>Select Patient from Directory</span>
                    <span className="text-medical-primary font-bold">Registered Patients Only</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedPatient(null);
                        setValidationError(null);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search patient by name, ID or mobile..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary"
                    />
                    <SearchSuggestions 
                      isVisible={showSuggestions} 
                      suggestions={suggestions} 
                      onSelect={handleSelectSuggestion} 
                    />
                  </div>
                </div>

                {/* Selected Patient Preview Card */}
                {selectedPatient ? (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                        {selectedPatient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 text-xs">{selectedPatient.name}</p>
                          <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-800 text-[9px] font-bold rounded">
                            VERIFIED EHR
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-mono">
                          ID: <span className="font-bold">{selectedPatient.id}</span> • {selectedPatient.age} Yrs ({selectedPatient.gender}) • {selectedPatient.phone}
                        </p>
                        {selectedPatient.bloodGroup && (
                          <span className="text-[9px] text-slate-500 font-medium">
                            Blood Group: <strong className="text-slate-700">{selectedPatient.bloodGroup}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(null);
                        setSearchTerm('');
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title="Clear Selection"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : searchTerm.trim() ? (
                  /* Matching Patient Selector Chips from Directory when searching */
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Matching Registered Patients:
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {filteredPatients.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => handleSelectPatient(p)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold text-[10px]">
                              {p.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs group-hover:text-medical-primary transition-colors">{p.name}</p>
                              <p className="text-[9px] text-slate-400 font-mono">ID: {p.id} • {p.phone}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-medical-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            Select <ChevronRight size={12} />
                          </span>
                        </div>
                      ))}

                      {filteredPatients.length === 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <AlertCircle size={15} className="text-amber-600 shrink-0" />
                            <span>Patient Not Registered Yet</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            "{searchTerm}" was not found in the patient directory. Only registered patients can be added to the queue.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddModal(false);
                              setActiveTab('patients');
                            }}
                            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <UserPlus size={14} />
                            <span>Register New Patient First</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Validation Error Banner if user tries to submit unregistered name */}
                {validationError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldAlert size={15} className="text-rose-600 shrink-0" />
                      <span>Registration Required</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      {validationError}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setActiveTab('patients');
                      }}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <UserPlus size={14} />
                      <span>Go to Patient Registration</span>
                    </button>
                  </div>
                )}

                {/* Consulting Doctor Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Assign Consulting Doctor</label>
                  <select 
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs cursor-pointer focus:outline-none focus:border-medical-primary font-medium text-slate-800"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name} — {d.specialization}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Priority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Normal', 'Urgent', 'Emergency'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPriority(p)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          selectedPriority === p
                            ? p === 'Emergency' ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : p === 'Urgent' ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-medical-primary text-white border-medical-primary shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Modal Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setActiveTab('patients');
                    }}
                    className="text-xs font-bold text-medical-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus size={13} />
                    <span>New Patient Intake?</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={!selectedPatient && !exactMatchPatient}
                      className="px-5 py-2 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl font-bold shadow-md shadow-medical-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm & Add to Queue
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG BEFORE PERMANENTLY REMOVING A PATIENT FROM QUEUE */}
      <AnimatePresence>
        {itemToDelete && (
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
              <h3 className="text-sm font-bold text-slate-900">Remove Patient from Queue?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-800">{itemToDelete.patientName}</span> (#{itemToDelete.queueNumber}) from the active waiting queue?
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Keep in Queue
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Queue;
