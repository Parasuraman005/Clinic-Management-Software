import React, { useState, useRef, useEffect } from 'react';
import { 
  Stethoscope, Printer, Download, Plus, Trash2, Eye, 
  Thermometer, Activity, 
  Brain, Heart, Pill, Calendar, CheckCircle2, FileText,
  ChevronDown, User, CreditCard
} from 'lucide-react';
import { mockPatients } from '../mockData';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useSharedPatients } from '../hooks/useSharedPatients';
import { useActivePatientContext } from '../hooks/useActivePatientContext';
import { useSharedQueue } from '../hooks/useSharedQueue';
import { hasPatientCompletedPayment } from '../hooks/useSharedPayments';

interface ConsultationProps {
  setActiveTab: (tab: string) => void;
}

const CONSULTATIONS_STORAGE_KEY = 'medflow_consultations_data';

export interface ClinicalFindingsData {
  chiefComplaint: string;
  symptoms: string;
  bp: string;
  heartRate: string;
  temp: string;
  oxygen: string;
  diagnosis: string;
  followUpDate: string;
  notes: string;
}

const getStoredClinicalFindings = (): Record<string, ClinicalFindingsData> => {
  try {
    const raw = localStorage.getItem(CONSULTATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse consultations from JSON', e);
  }
  return {};
};

const Consultation: React.FC<ConsultationProps> = ({ setActiveTab }) => {
  const { patients } = useSharedPatients();
  const { queue, updateStatus, removeItem, markConsultationCompleted } = useSharedQueue();
  const { activePatient, setActivePatient: setGlobalActivePatient } = useActivePatientContext();
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const [selectedPatient, setSelectedPatient] = useState(activePatient || patients[0] || mockPatients[0]);
  const patient = selectedPatient;

  // JSON-backed clinical findings per patient
  const [allFindings, setAllFindings] = useState<Record<string, ClinicalFindingsData>>(getStoredClinicalFindings);
  
  const currentFindings: ClinicalFindingsData = allFindings[patient.id] || {
    chiefComplaint: '',
    symptoms: '',
    bp: '120/80',
    heartRate: '72 bpm',
    temp: '98.6',
    oxygen: '98',
    diagnosis: '',
    followUpDate: '',
    notes: ''
  };

  const updateFinding = (field: keyof ClinicalFindingsData, value: string) => {
    setAllFindings(prev => {
      const updated = {
        ...prev,
        [patient.id]: {
          ...(prev[patient.id] || currentFindings),
          [field]: value
        }
      };
      try {
        localStorage.setItem(CONSULTATIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save findings to JSON', e);
      }
      return updated;
    });
  };

  // Sync if activePatient changes
  useEffect(() => {
    if (activePatient) {
      setSelectedPatient(activePatient);
    }
  }, [activePatient]);

  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientSearchRef = useRef<HTMLDivElement>(null);

  const [diagnosisQuery, setDiagnosisQuery] = useState(currentFindings.diagnosis || '');
  
  useEffect(() => {
    setDiagnosisQuery(currentFindings.diagnosis || '');
  }, [patient.id]);
  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false);
  const diagnosisSuggestions = useSearchSuggestions(diagnosisQuery);
  const diagnosisRef = useRef<HTMLDivElement>(null);

  const [activeMedSearchId, setActiveMedSearchId] = useState<string | null>(null);
  const [medQuery, setMedQuery] = useState('');
  const medSuggestions = useSearchSuggestions(medQuery);
  const medRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (diagnosisRef.current && !diagnosisRef.current.contains(event.target as Node)) {
        setShowDiagnosisSuggestions(false);
      }
      if (medRef.current && !medRef.current.contains(event.target as Node)) {
        setActiveMedSearchId(null);
      }
      if (patientSearchRef.current && !patientSearchRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDiagnosis = (item: SuggestionItem) => {
    setDiagnosisQuery(item.title);
    updateFinding('diagnosis', item.title);
    setShowDiagnosisSuggestions(false);
  };

  const handleSelectMedicine = (item: SuggestionItem) => {
    if (item.type === 'medicine' && activeMedSearchId) {
      const input = document.getElementById(activeMedSearchId) as HTMLInputElement;
      if (input) input.value = item.title;
      setActiveMedSearchId(null);
      setMedQuery('');
    }
  };

  const handleComplete = () => {
    markConsultationCompleted(patient.id, patient.name);
    const isPaid = hasPatientCompletedPayment(patient.id, patient.name);
    const queueItem = queue.find(q => q.patientId === patient.id);

    if (queueItem) {
      if (isPaid) {
        // Both consultation completed AND payment complete -> remove patient from queue!
        removeItem(queueItem.id);
        setStatusBanner({
          type: 'success',
          message: `Consultation completed & Payment verified! ${patient.name} has been removed from the queue.`
        });
      } else {
        updateStatus(queueItem.id, 'Completed');
        setStatusBanner({
          type: 'info',
          message: `Consultation completed for ${patient.name}. Patient remains in queue until payment is completed at Billing.`
        });
      }
    } else {
      setStatusBanner({
        type: 'success',
        message: `Consultation completed for ${patient.name}. You can proceed to write a prescription or generate an invoice.`
      });
    }
    setGlobalActivePatient(patient);
  };

  const handlePrint = async () => {
    const input = document.getElementById('consultation-container');
    if (!input) return;
    
    try {
      const imgData = await toPng(input, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
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
    } catch (error) {
      console.error('Print generation failed:', error);
      window.print();
    }
  };

  const handleDownload = async () => {
    const input = document.getElementById('consultation-container');
    if (!input) return;
    
    try {
      const imgData = await toPng(input, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = imgData;
      await img.decode();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Consultation_${patient.id}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF.');
    }
  };

  return (
    <div id="consultation-container" className="space-y-6 animate-in slide-in-from-bottom duration-500 print:p-0">
      {statusBanner && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-xs print:hidden ${
          statusBanner.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className={statusBanner.type === 'success' ? 'text-emerald-600' : 'text-amber-600'} />
            <span className="text-xs font-bold">{statusBanner.message}</span>
          </div>
          <div className="flex items-center gap-2">
            {statusBanner.type === 'info' && (
              <button
                onClick={() => setActiveTab('billing')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold transition-all"
              >
                Go to Billing
              </button>
            )}
            <button
              onClick={() => setStatusBanner(null)}
              className="text-xs opacity-60 hover:opacity-100 font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-medical-primary/10 text-medical-primary rounded-xl">
            <Stethoscope size={24} />
          </div>
          <div>
            <h2 className="text-[14pt] font-bold text-slate-900">Active Consultation</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12pt] text-slate-500">Currently seeing:</span>
              <div className="relative" ref={patientSearchRef}>
                <button 
                  onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                  className="font-bold text-slate-800 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
                >
                  <User size={13} className="text-medical-primary" />
                  <span>{patient.name} ({patient.id})</span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {showPatientDropdown && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 max-h-60 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="Search patient..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg mb-2 focus:ring-1 focus:ring-medical-primary"
                    />
                    <div className="space-y-1">
                      {patients
                        .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.id.toLowerCase().includes(patientSearch.toLowerCase()))
                        .map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPatient(p);
                              setGlobalActivePatient(p);
                              setShowPatientDropdown(false);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between hover:bg-medical-primary/10 ${
                              p.id === patient.id ? 'bg-medical-primary/10 font-bold text-medical-primary' : 'text-slate-700'
                            }`}
                          >
                            <span>{p.name}</span>
                            <span className="font-mono text-[10px] text-slate-400">{p.id}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Write Prescription for this Patient */}
          <button
            onClick={() => {
              setGlobalActivePatient(patient);
              setActiveTab('prescriptions');
            }}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Pill size={15} /> Write Rx
          </button>

          {/* Create Bill for this Patient */}
          <button
            onClick={() => {
              setGlobalActivePatient(patient);
              setActiveTab('billing');
            }}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <CreditCard size={15} /> Bill Patient
          </button>

          <button 
            onClick={handlePrint}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Printer size={15} /> Print
          </button>
          <button 
            onClick={handleDownload}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Download size={15} /> PDF
          </button>
          <button 
            onClick={handleComplete}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-2xs hover:bg-emerald-700 flex items-center gap-1.5"
          >
            <CheckCircle2 size={15} />
            Complete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Consultation Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-[14pt] font-bold text-slate-900">Clinical Findings</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[12pt] font-bold text-slate-700">Chief Complaint</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[12pt] focus:ring-2 focus:ring-medical-primary/20 min-h-[100px]"
                    placeholder="Describe the primary reason for visit..."
                    value={currentFindings.chiefComplaint}
                    onChange={(e) => updateFinding('chiefComplaint', e.target.value)}
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-[12pt] font-bold text-slate-700">Symptoms</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[12pt] focus:ring-2 focus:ring-medical-primary/20 min-h-[100px]"
                    placeholder="List symptoms observed or reported..."
                    value={currentFindings.symptoms}
                    onChange={(e) => updateFinding('symptoms', e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[12pt] font-bold text-slate-700">Vital Signs</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'BP (mmHg)', key: 'bp' as const, icon: Activity, placeholder: '120/80', color: 'text-rose-500' },
                    { label: 'Heart Rate', key: 'heartRate' as const, icon: Heart, placeholder: '72 bpm', color: 'text-rose-500' },
                    { label: 'Temp (°F)', key: 'temp' as const, icon: Thermometer, placeholder: '98.6', color: 'text-amber-500' },
                    { label: 'Oxygen (%)', key: 'oxygen' as const, icon: Brain, placeholder: '98', color: 'text-blue-500' },
                  ].map((vital) => (
                    <div key={vital.label} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <vital.icon size={16} className={vital.color} />
                        <span className="text-[10pt] font-bold text-slate-500 uppercase">{vital.label}</span>
                      </div>
                      <input 
                        type="text" 
                        placeholder={vital.placeholder}
                        value={currentFindings[vital.key]}
                        onChange={(e) => updateFinding(vital.key, e.target.value)}
                        className="w-full bg-transparent font-bold text-[14pt] text-slate-900 focus:outline-none tabular-nums"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[12pt] font-bold text-slate-700">Diagnosis</label>
                  <div className="relative" ref={diagnosisRef}>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[12pt] focus:ring-2 focus:ring-medical-primary/20" 
                      placeholder="Primary diagnosis..."
                      value={diagnosisQuery}
                      onChange={(e) => {
                        setDiagnosisQuery(e.target.value);
                        updateFinding('diagnosis', e.target.value);
                        setShowDiagnosisSuggestions(true);
                      }}
                      onFocus={() => setShowDiagnosisSuggestions(true)}
                    />
                    <SearchSuggestions 
                      isVisible={showDiagnosisSuggestions} 
                      suggestions={diagnosisSuggestions.filter(s => s.type === 'prescription')} 
                      onSelect={handleSelectDiagnosis} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[12pt] font-bold text-slate-700">Follow-up Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date" 
                      value={currentFindings.followUpDate}
                      onChange={(e) => updateFinding('followUpDate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-[12pt]" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12pt] font-bold text-slate-700">Clinical Notes</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[12pt] min-h-[120px]"
                  placeholder="Internal notes, observations, or detailed treatment plan..."
                  value={currentFindings.notes}
                  onChange={(e) => updateFinding('notes', e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Prescription Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[14pt] font-bold text-slate-900 flex items-center gap-2">
                <Pill size={20} className="text-medical-primary" />
                Prescription
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveTab('prescription')}
                  className="flex items-center gap-1 text-emerald-600 font-bold hover:bg-emerald-50 px-3 py-1 rounded border border-emerald-100"
                >
                  <Eye size={18} /> View Prescription
                </button>
                <button className="flex items-center gap-1 text-medical-primary font-bold hover:bg-medical-primary/5 px-3 py-1 rounded">
                  <Plus size={18} /> Add Medicine
                </button>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3 text-[12pt] font-bold text-slate-600">Medicine</th>
                    <th className="px-6 py-3 text-[12pt] font-bold text-slate-600">Dosage</th>
                    <th className="px-6 py-3 text-[12pt] font-bold text-slate-600">Frequency</th>
                    <th className="px-6 py-3 text-[12pt] font-bold text-slate-600">Duration</th>
                    <th className="px-6 py-3 text-[12pt] font-bold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="relative" ref={activeMedSearchId === 'med-1' ? medRef : null}>
                        <input 
                          id="med-1"
                          type="text" 
                          defaultValue="Lisinopril" 
                          className="w-full bg-transparent focus:outline-none font-medium" 
                          onChange={(e) => {
                            setMedQuery(e.target.value);
                            setActiveMedSearchId('med-1');
                          }}
                          onFocus={() => {
                            setActiveMedSearchId('med-1');
                            setMedQuery('Lisinopril');
                          }}
                        />
                        <SearchSuggestions 
                          isVisible={activeMedSearchId === 'med-1'} 
                          suggestions={medSuggestions.filter(s => s.type === 'medicine')} 
                          onSelect={handleSelectMedicine} 
                        />
                      </div>
                      <div className="text-[10pt] text-slate-400">Oral Tablet</div>
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" defaultValue="10mg" className="w-full bg-transparent focus:outline-none tabular-nums" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select className="bg-transparent focus:outline-none w-full appearance-none cursor-pointer pr-8 focus:ring-2 focus:ring-medical-primary/20 rounded-md transition-all">
                          <option>Once Daily</option>
                          <option>Twice Daily</option>
                          <option>Before Meals</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" defaultValue="30 Days" className="w-full bg-transparent focus:outline-none tabular-nums" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-[14pt] font-bold text-slate-900 mb-4">Patient Quick Info</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <img 
                  src="/src/assets/images/patient_male_portrait_1790961113192.jpg" 
                  alt={patient.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${patient.name}&background=0284c7&color=fff`;
                  }}
                />
              </div>
              <div>
                <p className="font-bold text-slate-900">{patient.name}</p>
                <p className="text-[12pt] text-slate-500">{patient.age}Y, {patient.gender}</p>
                <p className="text-[10pt] text-rose-600 font-bold">Blood Group: {patient.bloodGroup}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-[12pt]">Last Visit</span>
                <span className="font-medium text-slate-700 tabular-nums">{patient.lastVisit}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-[12pt]">Chronic Cond.</span>
                <span className="font-medium text-slate-700">Hypertension</span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10pt] text-slate-500 font-bold uppercase mb-2">Recent Vitals</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2 rounded text-center">
                    <p className="text-[9pt] text-slate-400">BP</p>
                    <p className="font-bold text-slate-700">118/76</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded text-center">
                    <p className="text-[9pt] text-slate-400">Weight</p>
                    <p className="font-bold text-slate-700">78 kg</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2 border border-medical-primary text-medical-primary rounded-lg font-bold hover:bg-medical-primary/5 transition-colors">
              View Full History
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-[14pt] font-bold text-slate-900 mb-4">Past Records</h3>
            <div className="space-y-3">
              {[
                { date: '15/08/2023', type: 'Lab Report', file: 'Blood_Panel.pdf' },
                { date: '10/06/2023', type: 'Imaging', file: 'X-Ray_Chest.jpg' },
                { date: '05/05/2023', type: 'Consultation', file: 'Notes_Dr_Sarah.pdf' }
              ].map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-slate-400 group-hover:text-medical-primary" />
                    <div>
                      <p className="font-medium text-slate-700 text-[12pt]">{rec.type}</p>
                      <p className="text-[10pt] text-slate-400">{rec.date}</p>
                    </div>
                  </div>
                  <Download size={16} className="text-slate-300 group-hover:text-slate-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;
