import React, { useState, useRef, useEffect } from 'react';
import { 
  ListOrdered, Play, CheckCircle2, MoreVertical, 
  Clock, AlertCircle, User, ArrowRight, UserCheck, Trash2,
  Plus, X, Filter, ChevronDown, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useSharedQueue, ExtendedQueueItem } from '../hooks/useSharedQueue';
import { useSharedDoctors } from '../hooks/useSharedDoctors';
import { useSharedPatients } from '../hooks/useSharedPatients';

interface QueueProps {
  setActiveTab: (tab: string) => void;
}

const Queue: React.FC<QueueProps> = ({ setActiveTab }) => {
  const { queue, addToQueue: addSharedQueue, updateStatus, removeItem } = useSharedQueue();
  const { doctors } = useSharedDoctors();
  const { patients } = useSharedPatients();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autocomplete suggestions containing registered patient names ONLY
  const suggestions = useSearchSuggestions(searchTerm, ['patient']);
  const searchRef = useRef<HTMLDivElement>(null);

  // Selected doctor and priority for adding
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah Chen');
  const [selectedPriority, setSelectedPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');

  // Confirmation dialog for delete/remove
  const [itemToDelete, setItemToDelete] = useState<ExtendedQueueItem | null>(null);

  // Toast
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

  // Selecting a patient from the suggestion list adds that patient to the queue immediately
  const handleSelectSuggestion = (item: SuggestionItem) => {
    const patientObj = item.payload || patients.find(p => p.id === item.id) || { name: item.title, id: item.id };
    const added = addSharedQueue(
      { name: patientObj.name, id: patientObj.id },
      { doctorName: selectedDoctor, priority: selectedPriority }
    );
    showToast(`${added.patientName} added to Queue at Position #${added.queueNumber} (FIFO Order)`);
    setSearchTerm('');
    setShowSuggestions(false);
    setShowAddModal(false);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const matchedPatient = patients.find(
      p => p.name.toLowerCase() === searchTerm.trim().toLowerCase() || p.id.toLowerCase() === searchTerm.trim().toLowerCase()
    );

    const added = addSharedQueue(
      matchedPatient ? { name: matchedPatient.name, id: matchedPatient.id } : { name: searchTerm.trim() },
      { doctorName: selectedDoctor, priority: selectedPriority }
    );

    showToast(`${added.patientName} added to Queue at Position #${added.queueNumber} (FIFO Order)`);
    setSearchTerm('');
    setShowSuggestions(false);
    setShowAddModal(false);
  };

  const startConsultation = (id: string, patientName: string) => {
    updateStatus(id, 'In Consultation');
    showToast(`Consultation started for ${patientName}`);
    setTimeout(() => setActiveTab('consultation'), 500);
  };

  const completeQueueItem = (id: string, patientName: string) => {
    updateStatus(id, 'Completed');
    showToast(`Visit completed for ${patientName}`);
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
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
          >
            <UserCheck size={15} />
            <span>Call Next Patient</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 shadow-sm transition-all"
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue Strategy</p>
            <p className="text-xs font-bold text-slate-800">Strict FIFO</p>
            <span className="text-[9px] text-slate-400">Entry time prioritized</span>
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
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'In Consultation' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'In Consultation' ? 'bg-purple-500 animate-pulse' :
                          item.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-100">
                        {item.status === 'Waiting' ? (
                          <button 
                            onClick={() => startConsultation(item.id, item.patientName)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-xs shadow-xs transition-all"
                            title="Start Consultation"
                          >
                            <Play size={11} /> Start
                          </button>
                        ) : item.status === 'In Consultation' ? (
                          <button 
                            onClick={() => completeQueueItem(item.id, item.patientName)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs shadow-xs transition-all"
                            title="Complete Consultation"
                          >
                            <CheckCircle2 size={11} /> Finish
                          </button>
                        ) : null}

                        {/* Delete / Remove with Confirmation Dialog */}
                        <button 
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-md transition-all"
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
                      Click the "Add to Queue" button above or select a patient from the Patient Directory.
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

      {/* ADD TO QUEUE MODAL WITH PATIENT-ONLY AUTOCOMPLETE */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Add Patient to Queue</h3>
                    <p className="text-[10px] text-slate-500">Strict FIFO: Patient will be queued at end of line</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-4 text-xs">
                {/* Search field with patient-only autocomplete suggestions */}
                <div className="space-y-1.5" ref={searchRef}>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                    <span>Patient Name / ID</span>
                    <span className="text-slate-400 font-normal">Registered Patients Only</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type="text" 
                      required
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Type patient name or ID to auto-suggest..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary"
                    />
                    <SearchSuggestions 
                      isVisible={showSuggestions} 
                      suggestions={suggestions} 
                      onSelect={handleSelectSuggestion} 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    💡 Clicking a suggested patient will add them directly to the queue.
                  </p>
                </div>

                {/* Consulting Doctor Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Assign Consulting Doctor</label>
                  <select 
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs cursor-pointer focus:outline-none focus:border-medical-primary"
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
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          selectedPriority === p
                            ? p === 'Emergency' ? 'bg-rose-600 text-white border-rose-600'
                            : p === 'Urgent' ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-medical-primary text-white border-medical-primary'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-1.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-lg font-bold shadow-xs"
                  >
                    Confirm & Queue (FIFO)
                  </button>
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
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                >
                  Keep in Queue
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
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
