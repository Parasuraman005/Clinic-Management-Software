import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, Download, ArrowLeft, Pill, 
  MapPin, Phone, Mail, Globe, Hash,
  ChevronDown, Plus, Trash2, Search, Filter, 
  Eye, Edit, Copy, MoreVertical, X, CheckCircle2,
  Calendar, User, AlertCircle, FileText
} from 'lucide-react';
import { mockPatients, mockPrescriptions, mockDoctors } from '../mockData';
import { Prescription, PrescriptionMedicine, Patient } from '../types';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';

interface PrescriptionProps {
  setActiveTab: (tab: string) => void;
}

const PrescriptionPage: React.FC<PrescriptionProps> = ({ setActiveTab }) => {
  const [view, setView] = useState<'list' | 'create' | 'view' | 'edit'>('list');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchBar] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = useSearchSuggestions(searchTerm);
  const searchRef = useRef<HTMLDivElement>(null);

  // Patient Search State
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const patientSuggestions = useSearchSuggestions(patientSearch);
  const patientSearchRef = useRef<HTMLDivElement>(null);

  // Doctor Search State
  const [doctorSearch, setDoctorSearch] = useState('');
  const [showDoctorSuggestions, setShowDoctorSuggestions] = useState(false);
  const doctorSuggestions = useSearchSuggestions(doctorSearch);
  const doctorSearchRef = useRef<HTMLDivElement>(null);

  // Medicine Search State
  const [activeMedSearchId, setActiveMedSearchId] = useState<string | null>(null);
  const [medSearch, setMedSearch] = useState('');
  const medSuggestions = useSearchSuggestions(medSearch);
  const medSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (patientSearchRef.current && !patientSearchRef.current.contains(event.target as Node)) {
        setShowPatientSuggestions(false);
      }
      if (doctorSearchRef.current && !doctorSearchRef.current.contains(event.target as Node)) {
        setShowDoctorSuggestions(false);
      }
      if (medSearchRef.current && !medSearchRef.current.contains(event.target as Node)) {
        setActiveMedSearchId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setSearchBar('');
    setShowSuggestions(false);
    if (item.tab) setActiveTab(item.tab);
  };

  const handleSelectPatientSuggestion = (item: SuggestionItem) => {
    if (item.type === 'patient') {
      const patient = mockPatients.find(p => p.id === item.id);
      if (patient) {
        setSelectedPatient(patient);
        setPatientSearch('');
        setShowPatientSuggestions(false);
      }
    }
  };

  const handleSelectDoctorSuggestion = (item: SuggestionItem) => {
    if (item.type === 'doctor') {
      setFormData({...formData, doctorName: item.title});
      setDoctorSearch('');
      setShowDoctorSuggestions(false);
    }
  };

  const handleSelectMedSuggestion = (item: SuggestionItem) => {
    if (item.type === 'medicine' && activeMedSearchId) {
      const med = item.payload;
      updateMedicine(activeMedSearchId, 'name', med.name);
      updateMedicine(activeMedSearchId, 'type', med.type);
      updateMedicine(activeMedSearchId, 'strength', med.strength);
      setActiveMedSearchId(null);
      setMedSearch('');
    }
  };

  const [filters, setFilters] = useState({
    date: '',
    doctor: 'All',
    patient: 'All',
    status: 'All'
  });

  // Form State
  const [formData, setFormData] = useState<Partial<Prescription>>({
    date: new Date().toLocaleDateString('en-GB'),
    medicines: [],
    status: 'Active',
    followUpRequired: false,
    additionalInstructions: 'Take medicines after food. Drink sufficient water. Take adequate rest. Follow the doctor\'s instructions.'
  });

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Handle Success Messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDoctor = filters.doctor === 'All' || p.doctorName === filters.doctor;
    const matchesStatus = filters.status === 'All' || p.status === filters.status;
    
    return matchesSearch && matchesDoctor && matchesStatus;
  });

  const handlePrint = async () => {
    const input = document.getElementById(view === 'view' ? 'prescription-print-container' : 'prescription-list-container');
    if (!input) {
      window.print();
      return;
    }

    try {
      const imgData = await toPng(input, { 
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = imgData;
      await img.decode();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const blob = pdf.output('bloburl');
      const printWindow = window.open(blob);
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } catch (err) {
      console.error('Print generation failed:', err);
      window.print();
    }
  };

  const handleDownloadPDF = async (elementId: string, filename: string) => {
    const input = document.getElementById(elementId);
    if (!input) return;

    try {
      const imgData = await toPng(input, { 
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Calculate height maintaining aspect ratio
      const img = new Image();
      img.src = imgData;
      await img.decode();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Unable to download PDF. Please try again.');
    }
  };

  const savePrescription = (statusOverride?: Prescription['status']) => {
    if (!selectedPatient) {
      setError('Please select a patient first.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newPrescription: Prescription = {
        ...(formData as any),
        id: formData.id || `RX-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        status: statusOverride || formData.status || 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (view === 'edit') {
        setPrescriptions(prev => prev.map(p => p.id === newPrescription.id ? newPrescription : p));
      } else {
        setPrescriptions(prev => [newPrescription, ...prev]);
      }

      setIsLoading(false);
      setSuccessMessage('Prescription created successfully.');
      setSelectedPrescription(newPrescription);
      setView('view');
    }, 1000);
  };

  const addMedicine = () => {
    const newMed: PrescriptionMedicine = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'Tablet',
      strength: '',
      dosage: '',
      frequency: '',
      route: 'Oral',
      duration: '',
      quantity: '',
      instructions: ''
    };
    setFormData(prev => ({
      ...prev,
      medicines: [...(prev.medicines || []), newMed]
    }));
  };

  const updateMedicine = (id: string, field: keyof PrescriptionMedicine, value: string) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines?.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const removeMedicine = (id: string) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines?.filter(m => m.id !== id)
    }));
  };

  const duplicateMedicine = (medicine: PrescriptionMedicine) => {
    const newMed = { ...medicine, id: Math.random().toString(36).substr(2, 9) };
    setFormData(prev => ({
      ...prev,
      medicines: [...(prev.medicines || []), newMed]
    }));
  };

  // Views
  if (view === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 font-serif">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[14pt] font-bold text-slate-900 uppercase tracking-tight">Prescriptions</h2>
            <p className="text-[12pt] text-slate-500">Create, manage, view, and print patient prescriptions.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[12pt] font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Search size={18} />
              Search Prescription
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[12pt] font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Filter size={18} />
              Filter
            </button>
            <button 
              onClick={() => {
                setFormData({
                  date: new Date().toLocaleDateString('en-GB'),
                  medicines: [],
                  status: 'Active',
                  followUpRequired: false,
                  additionalInstructions: 'Take medicines after food. Drink sufficient water. Take adequate rest. Follow the doctor\'s instructions.'
                });
                setSelectedPatient(null);
                setView('create');
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-medical-primary text-white rounded-lg text-[12pt] font-bold hover:bg-medical-primary/90 shadow-md transition-all shrink-0"
            >
              <Plus size={20} />
              New Prescription
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between text-rose-700 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <span className="font-bold text-[12pt]">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 rounded-full"><X size={16} /></button>
          </div>
        )}

        {/* Search & Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative" ref={searchRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by patient name, patient ID, prescription ID..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchBar(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-[12pt] focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary"
                  />
                  <SearchSuggestions 
                    isVisible={showSuggestions} 
                    suggestions={suggestions} 
                    onSelect={handleSelectSuggestion} 
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <input 
                      type="date" 
                      value={filters.date}
                      onChange={(e) => setFilters({...filters, date: e.target.value})}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[12pt] focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
                    />
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.patient}
                      onChange={(e) => setFilters({...filters, patient: e.target.value})}
                      className="bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-[12pt] focus:outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-medical-primary/20"
                    >
                      <option value="All">All Patients</option>
                      {mockPatients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.doctor}
                      onChange={(e) => setFilters({...filters, doctor: e.target.value})}
                      className="bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-[12pt] focus:outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-medical-primary/20"
                    >
                      <option value="All">All Doctors</option>
                      {mockDoctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-[12pt] focus:outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-medical-primary/20"
                    >
                      <option value="All">All Status</option>
                      <option>Draft</option>
                      <option>Active</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  <div className="flex gap-1">
                    <button className="px-4 py-2 bg-medical-primary text-white rounded-lg font-bold text-[12pt] hover:bg-medical-primary/90 transition-colors">
                      Search
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[12pt] hover:bg-slate-50 transition-colors">
                      Filter
                    </button>
                    <button 
                      onClick={() => { setSearchBar(''); setFilters({ date: '', doctor: 'All', patient: 'All', status: 'All' }); }}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-[12pt] hover:bg-slate-200 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prescription List */}
        <div id="prescription-list-container" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredPrescriptions.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <FileText size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-[14pt] font-bold text-slate-900">No prescriptions found.</h3>
                <p className="text-[12pt] text-slate-500">Create a new prescription to get started.</p>
              </div>
              <button 
                onClick={() => setView('create')}
                className="inline-flex items-center gap-2 px-6 py-2 bg-medical-primary text-white rounded-lg font-bold"
              >
                <Plus size={18} /> New Prescription
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[12pt] font-bold text-slate-600">Prescription ID</th>
                      <th className="px-6 py-4 text-[12pt] font-bold text-slate-600">Date</th>
                      <th className="px-6 py-4 text-[12pt] font-bold text-slate-600">Patient</th>
                      <th className="px-6 py-4 text-[12pt] font-bold text-slate-600">Doctor</th>
                      <th className="px-6 py-4 text-[12pt] font-bold text-slate-600">Diagnosis</th>
                      <th className="px-6 py-4 text-[12pt] font-bold text-slate-600">Medicines</th>
                      <th className="px-6 py-4 text-[12pt] font-bold text-slate-600">Follow-up</th>
                      <th className="px-6 py-4 text-[12pt] font-bold text-slate-600 text-center">Status</th>
                      <th className="px-6 py-4 text-[12pt] font-bold text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrescriptions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 tabular-nums text-slate-500 font-medium">{p.id}</td>
                        <td className="px-6 py-4 tabular-nums text-slate-600">{p.date}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{p.patientName}</div>
                          <div className="text-[10pt] text-slate-400 tabular-nums">{p.patientId}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{p.doctorName}</td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">{p.diagnosis}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{p.medicines.length} Items</td>
                        <td className="px-6 py-4 text-slate-600 tabular-nums">{p.followUpDate || 'N/A'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10pt] font-bold uppercase tracking-wider ${
                            p.status === 'Active' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            p.status === 'Draft' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-100">
                            <button 
                              onClick={() => { setSelectedPrescription(p); setView('view'); }}
                              className="p-1.5 text-medical-primary bg-medical-primary/10 hover:bg-medical-primary hover:text-white rounded-lg transition-all shadow-xs"
                              title="View Prescription"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => { setFormData(p); setSelectedPatient(mockPatients.find(pat => pat.id === p.patientId) || null); setView('edit'); }}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-xs"
                              title="Edit Prescription"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-all shadow-xs" 
                              title="Print Prescription" 
                              onClick={() => { setSelectedPrescription(p); handlePrint(); }}
                            >
                              <Printer size={16} />
                            </button>
                            <button 
                              className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-all shadow-xs" 
                              title="Delete Prescription"
                              onClick={() => setPrescriptions(prev => prev.filter(rx => rx.id !== p.id))}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredPrescriptions.map((p) => (
                  <div key={p.id} className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10pt] text-slate-400 font-bold uppercase tracking-tighter">{p.id} · {p.date}</div>
                        <h4 className="text-[13pt] font-bold text-slate-900">{p.patientName}</h4>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8pt] font-bold uppercase tracking-wider ${
                          p.status === 'Active' ? 'bg-blue-50 text-blue-700' : 
                          p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                          p.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {p.status}
                        </span>
                        <button 
                          onClick={() => setPrescriptions(prev => prev.filter(rx => rx.id !== p.id))}
                          className="text-rose-400 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[11pt]">
                      <div>
                        <p className="text-slate-400 font-bold text-[9pt] uppercase">Doctor</p>
                        <p className="text-slate-700">{p.doctorName}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold text-[9pt] uppercase">Follow-up</p>
                        <p className="text-slate-700">{p.followUpDate || 'None'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => { setSelectedPrescription(p); setView('view'); }}
                        className="flex-1 py-2 bg-slate-50 text-slate-700 rounded-lg font-bold text-[11pt] border border-slate-200"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => { setFormData(p); setSelectedPatient(mockPatients.find(pat => pat.id === p.patientId) || null); setView('edit'); }}
                        className="flex-1 py-2 bg-medical-primary/5 text-medical-primary rounded-lg font-bold text-[11pt] border border-medical-primary/20"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => { setSelectedPrescription(p); handlePrint(); }}
                        className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg font-bold border border-slate-200"
                      >
                        <Printer size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Create / Edit Form View
  if (view === 'create' || view === 'edit') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300 font-serif pb-24">
        {/* Form Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('list')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-[14pt] font-bold text-slate-900">{view === 'create' ? 'New Prescription' : 'Edit Prescription'}</h2>
              <p className="text-[12pt] text-slate-500">Draft patient consultation notes and medicine list.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => setView('list')}
              className="px-6 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-all text-[12pt]"
            >
              Cancel
            </button>
            <button 
              onClick={() => savePrescription()}
              disabled={isLoading}
              className="px-6 py-2.5 bg-white border-2 border-medical-primary text-medical-primary rounded-lg font-bold hover:bg-medical-primary/5 transition-all text-[12pt] disabled:opacity-50"
            >
              Save
            </button>
            <button 
              onClick={() => savePrescription()}
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-all text-[12pt] disabled:opacity-50"
            >
              Save & Print
            </button>
            <button 
              onClick={() => savePrescription()}
              disabled={isLoading}
              className="px-6 py-2.5 bg-medical-primary text-white rounded-lg font-bold shadow-md hover:bg-medical-primary/90 transition-all text-[12pt] disabled:opacity-50"
            >
              Save & Download PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-700 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <span className="font-bold text-[12pt]">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded-full"><X size={16} /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Patient Search & Selection */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[14pt] font-bold text-slate-900 flex items-center gap-2">
                  <User size={20} className="text-medical-primary" />
                  Patient Information
                </h3>
                {selectedPatient && (
                  <button 
                    onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}
                    className="text-medical-primary text-[11pt] font-bold hover:underline"
                  >
                    Change Patient
                  </button>
                )}
              </div>

              {!selectedPatient ? (
                <div className="relative" ref={patientSearchRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name, patient ID or phone..." 
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientSuggestions(true);
                    }}
                    onFocus={() => setShowPatientSuggestions(true)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-[12pt] focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
                  />
                  <SearchSuggestions 
                    isVisible={showPatientSuggestions} 
                    suggestions={patientSuggestions.filter(s => s.type === 'patient')} 
                    onSelect={handleSelectPatientSuggestion} 
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[9pt] text-slate-400 font-bold uppercase mb-0.5">Name / ID</p>
                    <p className="text-[12pt] font-bold text-slate-900">{selectedPatient.name}</p>
                    <p className="text-[11pt] text-slate-500 tabular-nums">{selectedPatient.id}</p>
                  </div>
                  <div>
                    <p className="text-[9pt] text-slate-400 font-bold uppercase mb-0.5">Age / Gender / Blood</p>
                    <p className="text-[12pt] font-bold text-slate-900">{selectedPatient.age}Y / {selectedPatient.gender}</p>
                    <p className="text-[11pt] text-slate-500">Group: {selectedPatient.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-[9pt] text-slate-400 font-bold uppercase mb-0.5">Phone / Allergies</p>
                    <p className="text-[12pt] font-bold text-slate-900 tabular-nums">{selectedPatient.phone}</p>
                    <p className="text-[11pt] text-rose-600 font-bold">{selectedPatient.allergies}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Consultation Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="text-[14pt] font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle size={20} className="text-medical-primary" />
                Consultation Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11pt] font-bold text-slate-700">Treating Doctor *</label>
                  <div className="relative" ref={doctorSearchRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search doctor..." 
                        value={formData.doctorName || doctorSearch}
                        onChange={(e) => {
                          setDoctorSearch(e.target.value);
                          setFormData({...formData, doctorName: e.target.value});
                          setShowDoctorSuggestions(true);
                        }}
                        onFocus={() => setShowDoctorSuggestions(true)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-[12pt] focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
                      />
                    </div>
                    <SearchSuggestions 
                      isVisible={showDoctorSuggestions} 
                      suggestions={doctorSuggestions.filter(s => s.type === 'doctor')} 
                      onSelect={handleSelectDoctorSuggestion} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11pt] font-bold text-slate-700">Date *</label>
                  <input 
                    type="text" 
                    value={formData.date}
                    readOnly
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-[12pt] focus:outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11pt] font-bold text-slate-700">Chief Complaint *</label>
                  <input 
                    type="text" 
                    value={formData.chiefComplaint || ''}
                    onChange={(e) => setFormData({...formData, chiefComplaint: e.target.value})}
                    placeholder="e.g., Persistent dry cough for 3 days..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-[12pt] focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11pt] font-bold text-slate-700">Final Diagnosis *</label>
                  <input 
                    type="text" 
                    value={formData.diagnosis || ''}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    placeholder="e.g., Acute Upper Respiratory Tract Infection..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-[12pt] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11pt] font-bold text-slate-700">Clinical Notes</label>
                  <textarea 
                    value={formData.clinicalNotes || ''}
                    onChange={(e) => setFormData({...formData, clinicalNotes: e.target.value})}
                    placeholder="Additional clinical findings, vitals recorded during visit..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-[12pt] min-h-[100px] focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Medicines Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[14pt] font-bold text-slate-900 flex items-center gap-2">
                  <Pill size={20} className="text-medical-primary" />
                  Medicine List
                </h3>
                <button 
                  onClick={addMedicine}
                  className="flex items-center gap-1 text-medical-primary font-bold hover:bg-medical-primary/5 px-3 py-1 rounded transition-colors text-[12pt]"
                >
                  <Plus size={18} /> Add Medicine
                </button>
              </div>

              <div className="space-y-4">
                {formData.medicines?.map((med, idx) => (
                  <div key={med.id} className="relative bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden group">
                    <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10pt] font-bold text-slate-500 uppercase">Medicine Name *</label>
                        <div className="relative" ref={activeMedSearchId === med.id ? medSearchRef : null}>
                          <input 
                            id={`med-name-${med.id}`}
                            type="text" 
                            value={med.name}
                            onChange={(e) => {
                              updateMedicine(med.id, 'name', e.target.value);
                              setMedSearch(e.target.value);
                              setActiveMedSearchId(med.id);
                            }}
                            onFocus={() => {
                              setActiveMedSearchId(med.id);
                              setMedSearch(med.name);
                            }}
                            placeholder="e.g., Paracetamol"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12pt] font-bold focus:outline-none focus:ring-2 focus:ring-medical-primary/10"
                          />
                          <SearchSuggestions 
                            isVisible={activeMedSearchId === med.id} 
                            suggestions={medSuggestions.filter(s => s.type === 'medicine')} 
                            onSelect={handleSelectMedSuggestion} 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10pt] font-bold text-slate-500 uppercase">Type</label>
                        <div className="relative">
                          <select 
                            value={med.type}
                            onChange={(e) => updateMedicine(med.id, 'type', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-[12pt] focus:outline-none appearance-none"
                          >
                            <option>Tablet</option>
                            <option>Capsule</option>
                            <option>Syrup</option>
                            <option>Injection</option>
                            <option>Ointment</option>
                            <option>Drop</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10pt] font-bold text-slate-500 uppercase">Strength</label>
                        <input 
                          type="text" 
                          value={med.strength}
                          onChange={(e) => updateMedicine(med.id, 'strength', e.target.value)}
                          placeholder="500 mg"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12pt] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10pt] font-bold text-slate-500 uppercase">Dosage</label>
                        <input 
                          type="text" 
                          value={med.dosage}
                          onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                          placeholder="1 Tablet"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12pt] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10pt] font-bold text-slate-500 uppercase">Frequency</label>
                        <input 
                          type="text" 
                          value={med.frequency}
                          onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}
                          placeholder="Morning / Night"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12pt] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10pt] font-bold text-slate-500 uppercase">Duration</label>
                        <input 
                          type="text" 
                          value={med.duration}
                          onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                          placeholder="5 Days"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12pt] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10pt] font-bold text-slate-500 uppercase">Quantity</label>
                        <input 
                          type="text" 
                          value={med.quantity}
                          onChange={(e) => updateMedicine(med.id, 'quantity', e.target.value)}
                          placeholder="10"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12pt] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10pt] font-bold text-slate-500 uppercase">Route</label>
                        <div className="relative">
                          <select 
                            value={med.route}
                            onChange={(e) => updateMedicine(med.id, 'route', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-[12pt] focus:outline-none appearance-none"
                          >
                            <option>Oral</option>
                            <option>Topical</option>
                            <option>IV</option>
                            <option>IM</option>
                            <option>Sublingual</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                      <div className="md:col-span-4 space-y-2">
                        <label className="text-[10pt] font-bold text-slate-500 uppercase">Instructions</label>
                        <input 
                          type="text" 
                          value={med.instructions}
                          onChange={(e) => updateMedicine(med.id, 'instructions', e.target.value)}
                          placeholder="After food / Before sleep..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12pt] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="bg-slate-100/50 px-5 py-2 flex items-center justify-end gap-3 border-t border-slate-200">
                      <button 
                        onClick={() => {
                          const input = document.getElementById(`med-name-${med.id}`);
                          input?.focus();
                        }}
                        className="flex items-center gap-1.5 text-slate-600 font-bold text-[11pt] hover:text-medical-primary"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <span className="w-px h-4 bg-slate-300"></span>
                      <button 
                        onClick={() => duplicateMedicine(med)}
                        className="flex items-center gap-1.5 text-slate-600 font-bold text-[11pt] hover:text-medical-primary"
                      >
                        <Copy size={14} /> Duplicate
                      </button>
                      <span className="w-px h-4 bg-slate-300"></span>
                      <button 
                        onClick={() => removeMedicine(med.id)}
                        className="flex items-center gap-1.5 text-rose-500 font-bold text-[11pt] hover:text-rose-700"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                {(!formData.medicines || formData.medicines.length === 0) && (
                  <div 
                    onClick={addMedicine}
                    className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <Pill size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-[12pt] text-slate-500">No medicines added. Click to add the first medicine.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Additional Instructions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-[14pt] font-bold text-slate-900">Additional Instructions</h3>
              <textarea 
                value={formData.additionalInstructions || ''}
                onChange={(e) => setFormData({...formData, additionalInstructions: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[12pt] min-h-[120px] focus:outline-none"
              ></textarea>
            </div>

            {/* Follow-Up */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="text-[14pt] font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={20} className="text-medical-primary" />
                Follow-Up
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-[12pt] font-bold text-slate-700">Required</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.followUpRequired}
                      onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-primary"></div>
                  </label>
                </div>
                {formData.followUpRequired && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11pt] font-bold text-slate-500 uppercase tracking-tighter">Follow-up Date</label>
                      <input 
                        type="date" 
                        value={formData.followUpDate || ''}
                        onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[12pt] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11pt] font-bold text-slate-500 uppercase tracking-tighter">Instructions</label>
                      <input 
                        type="text" 
                        value={formData.followUpInstructions || ''}
                        onChange={(e) => setFormData({...formData, followUpInstructions: e.target.value})}
                        placeholder="Follow up if pain persists..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[12pt] focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Prescription Status */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-[14pt] font-bold text-slate-900">Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Draft', 'Active', 'Completed', 'Cancelled'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setFormData({...formData, status: s as any})}
                    className={`py-2 px-3 rounded-lg font-bold text-[11pt] border transition-all ${
                      formData.status === s 
                      ? 'bg-medical-primary text-white border-medical-primary shadow-sm' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Sticky Footer for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 md:hidden flex gap-2">
          <button 
             onClick={() => savePrescription()}
             className="flex-1 py-3 bg-medical-primary text-white rounded-xl font-bold text-[12pt]"
          >
            Save
          </button>
          <button 
             onClick={() => savePrescription('Active')}
             className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-[12pt]"
          >
            Print
          </button>
          <button className="p-3 bg-slate-100 text-slate-600 rounded-xl"><MoreVertical size={24} /></button>
        </div>
      </div>
    );
  }

  // View / Print Preview View
  if (view === 'view' && selectedPrescription) {
    const patient = mockPatients.find(p => p.id === selectedPrescription.patientId) || mockPatients[0];
    const doctor = mockDoctors.find(d => d.name === selectedPrescription.doctorName) || mockDoctors[0];

    return (
      <div className="space-y-6 animate-in fade-in duration-500 font-serif pb-12">
        {/* View Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('list')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-[14pt] font-bold text-slate-900">Prescription Details</h2>
              <p className="text-[12pt] text-slate-500">ID: {selectedPrescription.id} · Issued on {selectedPrescription.date}</p>
              <div className="flex gap-4 mt-1 text-[10pt] text-slate-400 font-bold uppercase tracking-tight">
                <span>Created: {new Date(selectedPrescription.createdAt).toLocaleDateString('en-GB')}</span>
                <span>Last Updated: {new Date(selectedPrescription.updatedAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('list')}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 text-[12pt]"
            >
              Back
            </button>
            <button 
              onClick={() => { setFormData(selectedPrescription); setSelectedPatient(patient); setView('edit'); }}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-blue-600 hover:bg-blue-50 text-[12pt] flex items-center gap-2"
            >
              <Edit size={18} /> Edit
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 text-[12pt] flex items-center gap-2"
            >
              <Printer size={18} /> Print
            </button>
            <button 
              onClick={() => handleDownloadPDF('prescription-print-container', `Prescription_${selectedPrescription.id}`)}
              className="px-4 py-2 bg-medical-primary text-white rounded-lg font-bold hover:bg-medical-primary/90 text-[12pt] flex items-center gap-2"
            >
              <Download size={18} /> PDF
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-700 print:hidden">
            <CheckCircle2 size={20} />
            <span className="font-bold text-[12pt]">{successMessage}</span>
          </div>
        )}

        <div className="flex justify-center py-6">
          <div 
            id="prescription-print-container"
            className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl border border-slate-200 p-[15mm] flex flex-col print:shadow-none print:border-none print:p-0"
          >
            {/* Clinic Header */}
            <div className="flex justify-between items-start border-b-2 border-medical-primary pb-8 mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-medical-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
                  MF
                </div>
                <div className="space-y-1">
                  <h1 className="text-[26pt] font-bold text-medical-primary leading-none">MedFlow Pro Clinic</h1>
                  <p className="text-[12pt] text-slate-500 font-sans tracking-widest uppercase">Excellence in Clinical Care</p>
                </div>
              </div>
              <div className="text-right text-[11pt] text-slate-500 font-sans space-y-1">
                <div className="flex items-center justify-end gap-2"><MapPin size={14} /> 123 Healthcare Blvd, Bangalore, KA 560001</div>
                <div className="flex items-center justify-end gap-2"><Phone size={14} /> +91 98765 43210 / 080-22334455</div>
                <div className="flex items-center justify-end gap-2"><Mail size={14} /> appointments@medflowpro.com</div>
                <div className="flex items-center justify-end gap-2"><Globe size={14} /> www.medflowproclinic.com</div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 px-6 py-3 rounded-lg border border-slate-100 mb-8 font-sans">
               <div className="text-[12pt] font-bold text-slate-700 uppercase tracking-widest">Prescription</div>
               <div className="flex gap-8 text-[11pt] font-bold text-slate-500 tabular-nums">
                 <span>ID: {selectedPrescription.id}</span>
                 <span>DATE: {selectedPrescription.date}</span>
               </div>
            </div>

            {/* Doctor & Patient Info Row */}
            <div className="grid grid-cols-2 gap-12 mb-10 pb-8 border-b border-slate-100">
               <div className="space-y-4">
                 <h4 className="text-[11pt] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Patient Details</h4>
                 <div className="space-y-1.5">
                   <p className="text-[14pt] font-bold text-slate-900">{patient.name}</p>
                   <p className="text-[12pt] text-slate-600">ID: <span className="tabular-nums">{patient.id}</span></p>
                   <p className="text-[12pt] text-slate-600">{patient.age}Y / {patient.gender}</p>
                   <p className="text-[12pt] text-slate-600 tabular-nums">{patient.phone}</p>
                   {patient.email && <p className="text-[11pt] text-slate-500">{patient.email}</p>}
                   <p className="text-[11pt] text-rose-600 font-bold mt-2">Allergies: {patient.allergies}</p>
                 </div>
               </div>
               <div className="space-y-4 text-right">
                 <h4 className="text-[11pt] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Consultant</h4>
                 <div className="space-y-1.5">
                   <p className="text-[14pt] font-bold text-slate-900">{doctor.name}</p>
                   <p className="text-[12pt] text-slate-600 font-bold italic">{doctor.qualification}</p>
                   <p className="text-[12pt] text-slate-600">{doctor.specialization}</p>
                   <p className="text-[11pt] text-slate-500 mt-2">Reg. No: {doctor.registrationNumber || 'KMC-123456'}</p>
                 </div>
               </div>
            </div>

            {/* Diagnosis Section */}
            <div className="mb-10 space-y-4">
               <div className="space-y-2">
                 <h4 className="text-[13pt] font-bold text-slate-900 flex items-center gap-2">
                   Diagnosis:
                 </h4>
                 <p className="text-[14pt] font-bold text-slate-800 ml-2">{selectedPrescription.diagnosis}</p>
               </div>
               {selectedPrescription.chiefComplaint && (
                 <div className="ml-2">
                   <p className="text-[11pt] text-slate-400 font-bold uppercase tracking-tight">Chief Complaint:</p>
                   <p className="text-[12pt] text-slate-600 italic">"{selectedPrescription.chiefComplaint}"</p>
                 </div>
               )}
            </div>

            {/* Rx Content */}
            <div className="flex-1 space-y-10">
               <div>
                 <div className="flex items-end gap-2 mb-6">
                   <h3 className="text-[28pt] font-bold text-slate-900 italic leading-none">Rx,</h3>
                   <div className="h-px bg-slate-200 flex-1 mb-2"></div>
                 </div>
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b-2 border-slate-200 text-slate-600 font-sans uppercase text-[10pt] tracking-widest">
                       <th className="py-3 font-bold">Medicine / Strength</th>
                       <th className="py-3 font-bold text-center">Dosage</th>
                       <th className="py-3 font-bold text-center">Frequency</th>
                       <th className="py-3 font-bold text-center">Duration</th>
                       <th className="py-3 font-bold text-right">Instructions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {selectedPrescription.medicines.map((med, i) => (
                       <tr key={i}>
                         <td className="py-5 pr-4">
                           <p className="text-[13pt] font-bold text-slate-900">{med.name}</p>
                           <p className="text-[11pt] text-slate-500 font-sans">{med.type} · {med.strength}</p>
                         </td>
                         <td className="py-5 text-center text-[12pt] font-medium">{med.dosage}</td>
                         <td className="py-5 text-center text-[12pt] font-medium">{med.frequency}</td>
                         <td className="py-5 text-center text-[12pt] font-medium tabular-nums">{med.duration}</td>
                         <td className="py-5 text-right text-[11pt] text-slate-600 italic leading-snug max-w-[200px]">{med.instructions}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                   <h4 className="text-[13pt] font-bold text-slate-900 border-l-4 border-medical-primary pl-3">Additional Instructions:</h4>
                   <p className="text-[12pt] text-slate-700 leading-relaxed whitespace-pre-line ml-4">
                     {selectedPrescription.additionalInstructions}
                   </p>
                 </div>
                 {selectedPrescription.followUpRequired && (
                   <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                     <h4 className="text-[13pt] font-bold text-slate-900 flex items-center gap-2">
                       <Calendar size={18} className="text-medical-primary" />
                       Follow-up Appointment
                     </h4>
                     <div className="space-y-1 ml-6">
                       <p className="text-[12pt] font-bold text-slate-800">Date: <span className="tabular-nums">{selectedPrescription.followUpDate}</span></p>
                       <p className="text-[11pt] text-slate-600 italic">"{selectedPrescription.followUpInstructions}"</p>
                     </div>
                   </div>
                 )}
               </div>
            </div>

            {/* Footer / Signature Area */}
            <div className="mt-16 pt-12 border-t border-slate-100 flex justify-between items-end">
              <div className="text-[10pt] text-slate-400 font-sans max-w-[300px]">
                <p className="font-bold mb-2">Notice:</p>
                <p>This is a digital prescription. In case of emergency, please visit the nearest hospital immediately. Follow the dosage instructions strictly.</p>
                <p className="mt-4 tabular-nums">Issued: {new Date(selectedPrescription.createdAt).toLocaleString('en-GB')}</p>
              </div>
              <div className="text-center w-64">
                <div className="mb-4 h-20 flex items-center justify-center">
                   {/* Placeholder for Signature */}
                   <div className="w-48 border-b border-slate-300 relative">
                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-handwriting text-slate-400 opacity-50 italic text-[18pt]">
                       {doctor.name.split(' ')[1]}
                     </span>
                   </div>
                </div>
                <p className="text-[14pt] font-bold text-slate-900 leading-none">{doctor.name}</p>
                <p className="text-[11pt] text-slate-500 font-bold italic mb-1">{doctor.qualification}</p>
                <p className="text-[10pt] text-slate-400 font-sans">Reg. No: {doctor.registrationNumber || 'KMC-123456'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-slate-400">
         <div className="w-12 h-12 border-4 border-slate-200 border-t-medical-primary rounded-full animate-spin"></div>
         <p className="text-[12pt] font-bold animate-pulse">Loading prescriptions...</p>
      </div>
    </div>
  );
};

export default PrescriptionPage;
