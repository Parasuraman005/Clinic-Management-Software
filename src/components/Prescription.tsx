import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, Download, ArrowLeft, Pill, 
  ChevronDown, Plus, Trash2, Search, 
  Eye, Edit, X, CheckCircle2,
  User, AlertCircle, FileText, Check,
  Stethoscope, RefreshCw, ShieldCheck, CreditCard
} from 'lucide-react';
import clinicLogo from '../assets/images/medi-logo.jpg';
import { mockPrescriptions, mockMedicines } from '../mockData';
import { Prescription, PrescriptionMedicine, Patient, Doctor } from '../types';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedPatients } from '../hooks/useSharedPatients';
import { useSharedDoctors } from '../hooks/useSharedDoctors';
import { useActivePatientContext } from '../hooks/useActivePatientContext';
import { useSharedSettings } from '../hooks/useSharedSettings';

interface PrescriptionProps {
  setActiveTab?: (tab: string) => void;
}

export interface DrugItem {
  id: string;
  name: string;
  type: string;
  strength: string;
  category?: string;
  defaultTiming?: string;
  commonDosage?: string;
  indications?: string;
}

export const defaultDrugCatalog: DrugItem[] = [
  ...mockMedicines.map(m => ({
    id: m.id,
    name: m.name,
    type: m.type,
    strength: m.strength,
    category: m.type === 'Capsule' ? 'Antibiotic / GI' : 'General & Chronic',
    defaultTiming: 'After Food',
    commonDosage: '1-0-1',
    indications: 'Standard clinical indication'
  })),
  { id: 'M-21', name: 'Azithromycin 500mg', type: 'Tablet', strength: '500mg', category: 'Antibiotics', defaultTiming: 'Before Food', commonDosage: '1-0-0', indications: 'Upper & lower respiratory tract infections' },
  { id: 'M-22', name: 'Cefixime 200mg', type: 'Tablet', strength: '200mg', category: 'Antibiotics', defaultTiming: 'After Food', commonDosage: '1-0-1', indications: 'Bacterial ENT & urinary infections' },
  { id: 'M-23', name: 'Amoxicillin + Clavulanate 625mg', type: 'Tablet', strength: '625mg', category: 'Antibiotics', defaultTiming: 'After Food', commonDosage: '1-0-1', indications: 'Broad-spectrum anti-microbial therapy' },
  { id: 'M-24', name: 'Pantoprazole 40mg', type: 'Tablet', strength: '40mg', category: 'Antacids & PPI', defaultTiming: 'Before Food', commonDosage: '1-0-0', indications: 'GERD, acid peptic disorder, gastric ulcer' },
  { id: 'M-25', name: 'Rabeprazole + Levosulpiride', type: 'Capsule', strength: '20mg/75mg', category: 'Antacids & PPI', defaultTiming: 'Before Food', commonDosage: '1-0-0', indications: 'Severe acidity with dyspepsia' },
  { id: 'M-26', name: 'Paracetamol 650mg (Dolo)', type: 'Tablet', strength: '650mg', category: 'Analgesics & Antipyretic', defaultTiming: 'After Food', commonDosage: '1-1-1', indications: 'Fever, mild to moderate body pain' },
  { id: 'M-27', name: 'Aceclofenac + Paracetamol + Serratiopeptidase', type: 'Tablet', strength: '100/325/15mg', category: 'Pain & Inflammation', defaultTiming: 'After Food', commonDosage: '1-0-1', indications: 'Musculoskeletal swelling and pain' },
  { id: 'M-28', name: 'Metformin Hydrochloride 500mg SR', type: 'Tablet', strength: '500mg', category: 'Anti-Diabetic', defaultTiming: 'After Food', commonDosage: '1-0-1', indications: 'Type-2 Diabetes glycemic control' },
  { id: 'M-29', name: 'Glimepiride 1mg + Metformin 500mg', type: 'Tablet', strength: '1mg/500mg', category: 'Anti-Diabetic', defaultTiming: 'Before Food', commonDosage: '1-0-0', indications: 'Dual anti-diabetic therapy' },
  { id: 'M-30', name: 'Telmisartan 40mg', type: 'Tablet', strength: '40mg', category: 'Cardiovascular', defaultTiming: 'After Food', commonDosage: '1-0-0', indications: 'Essential arterial hypertension' },
  { id: 'M-31', name: 'Amlodipine 5mg + Atenolol 50mg', type: 'Tablet', strength: '5mg/50mg', category: 'Cardiovascular', defaultTiming: 'After Food', commonDosage: '1-0-0', indications: 'Hypertension with tachycardia' },
  { id: 'M-32', name: 'Atorvastatin 20mg', type: 'Tablet', strength: '20mg', category: 'Cardiovascular', defaultTiming: 'After Food', commonDosage: '0-0-1', indications: 'Dyslipidemia, primary CAD prevention' },
  { id: 'M-33', name: 'Rosuvastatin 10mg', type: 'Tablet', strength: '10mg', category: 'Cardiovascular', defaultTiming: 'After Food', commonDosage: '0-0-1', indications: 'Hypercholesterolemia' },
  { id: 'M-34', name: 'Montelukast 10mg + Levocetirizine 5mg', type: 'Tablet', strength: '10mg/5mg', category: 'Respiratory', defaultTiming: 'After Food', commonDosage: '0-0-1', indications: 'Allergic rhinitis & seasonal asthma' },
  { id: 'M-35', name: 'Budesonide + Formoterol Inhaler (200/6mcg)', type: 'Inhaler', strength: '200/6mcg', category: 'Respiratory', defaultTiming: 'After Food', commonDosage: '1-0-1', indications: 'Bronchial asthma & COPD management' },
  { id: 'M-36', name: 'Multivitamin with Zinc & Minerals', type: 'Capsule', strength: 'Standard', category: 'Vitamins & Supplements', defaultTiming: 'After Food', commonDosage: '1-0-0', indications: 'Nutritional immunity booster' },
  { id: 'M-37', name: 'Vitamin D3 60,000 IU', type: 'Capsule', strength: '60000 IU', category: 'Vitamins & Supplements', defaultTiming: 'After Food', commonDosage: 'Once Weekly', indications: 'Vitamin D deficiency & bone density' },
  { id: 'M-38', name: 'Oral Rehydration Salts (ORS)', type: 'Sachet', strength: '21.8g', category: 'Gastroenterology', defaultTiming: 'After Food', commonDosage: 'As directed', indications: 'Dehydration & diarrhea electrolyte balance' }
];

const createInitialMedicine = (): PrescriptionMedicine => ({
  id: Math.random().toString(36).substring(2, 9),
  name: '',
  foodTiming: 'After Food',
  morning: '1',
  lunch: '0',
  evening: '0',
  dinner: '1',
  durationDays: 5,
  type: 'Tablet',
  strength: '',
  instructions: ''
});

const PrescriptionPage: React.FC<PrescriptionProps> = ({ setActiveTab }) => {
  const { clinicName, tagline, address, phone, email, regNumber, taxNumber } = useSharedSettings();
  // Navigation view: 'prescription' (main builder), 'preview' (A4 document preview), 'drugs' (drug list), 'records' (past prescriptions)
  const [activeView, setActiveView] = useState<'prescription' | 'preview' | 'drugs' | 'records'>('prescription');
  
  const { patients } = useSharedPatients();
  const { doctors } = useSharedDoctors();
  const { 
    activePatient, 
    activeDoctor, 
    setActivePatient: setGlobalActivePatient, 
    setActiveDoctor: setGlobalActiveDoctor, 
    setPendingBillItems 
  } = useActivePatientContext();

  // Stored prescriptions state
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('medflow_prescriptions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse prescriptions from storage', e);
      }
    }
    return mockPrescriptions;
  });

  // Drug formulary catalog state
  const [drugCatalog, setDrugCatalog] = useState<DrugItem[]>(() => {
    const saved = localStorage.getItem('medflow_drug_catalog');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse drugs from storage', e);
      }
    }
    return defaultDrugCatalog;
  });

  // Prescription Form State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => activePatient || patients[0] || null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(() => activeDoctor || doctors[0] || null);

  // Sync when activePatient or activeDoctor updates from another page
  useEffect(() => {
    if (activePatient) {
      setSelectedPatient(activePatient);
    }
  }, [activePatient]);

  useEffect(() => {
    if (activeDoctor) {
      setSelectedDoctor(activeDoctor);
    }
  }, [activeDoctor]);

  const [diagnosis, setDiagnosis] = useState('Acute Upper Respiratory Tract Infection & Pharyngitis');
  const [chiefComplaint, setChiefComplaint] = useState('Sore throat, mild dry cough for 3 days, body ache');
  const [clinicalNotes, setClinicalNotes] = useState('BP 120/80, Pulse 74, SpO2 98%, Temp 99.0°F');
  const [prescriptionDate, setPrescriptionDate] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [generalAdvice, setGeneralAdvice] = useState('Drink warm fluids, steam inhalation twice daily, adequate rest. Avoid cold foods.');
  const [followUpDays, setFollowUpDays] = useState('5 Days');
  const [signatureStampEnabled, setSignatureStampEnabled] = useState(true);

  // Structured Medicines List
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      id: 'm-1',
      name: 'Amoxicillin + Clavulanic Acid 625mg',
      type: 'Tablet',
      foodTiming: 'After Food',
      morning: '1',
      lunch: '0',
      evening: '0',
      dinner: '1',
      durationDays: 5,
      instructions: 'Complete full 5-day antibiotic course'
    },
    {
      id: 'm-2',
      name: 'Paracetamol 650mg (Dolo)',
      type: 'Tablet',
      foodTiming: 'After Food',
      morning: '1',
      lunch: '0',
      evening: '1',
      dinner: '1',
      durationDays: 3,
      instructions: 'Take SOS for fever or severe body pain'
    },
    {
      id: 'm-3',
      name: 'Pantoprazole 40mg',
      type: 'Tablet',
      foodTiming: 'Before Food',
      morning: '1',
      lunch: '0',
      evening: '0',
      dinner: '0',
      durationDays: 5,
      instructions: 'Take 30 mins before morning breakfast'
    }
  ]);

  // UI state
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [activeDrugSearchIndex, setActiveDrugSearchIndex] = useState<number | null>(null);
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Drug Catalog page state
  const [drugFilterCategory, setDrugFilterCategory] = useState('All');
  const [drugPageSearch, setDrugPageSearch] = useState('');
  const [showAddDrugModal, setShowAddDrugModal] = useState(false);
  const [newDrugForm, setNewDrugForm] = useState({
    name: '',
    type: 'Tablet',
    strength: '',
    category: 'General & Chronic',
    defaultTiming: 'After Food',
    commonDosage: '1-0-1',
    indications: ''
  });

  // Refs
  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('medflow_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('medflow_drug_catalog', JSON.stringify(drugCatalog));
  }, [drugCatalog]);

  // Click outside listener for patient search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // Filtered Patients for patient search field
  const filteredPatients = patients.filter((p: Patient) => 
    p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    p.phone.includes(patientSearchQuery)
  );

  // Select patient handler
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setGlobalActivePatient(patient);
    setPatientSearchQuery('');
    setIsPatientDropdownOpen(false);
    triggerToast(`Loaded patient: ${patient.name} (${patient.id})`, 'info');
  };

  // Medicine Table Handlers
  const handleAddMedicineRow = () => {
    setMedicines(prev => [...prev, createInitialMedicine()]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (medicines.length <= 1) {
      triggerToast('At least one medicine row is required.', 'info');
      return;
    }
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMedicineRow = (index: number, field: keyof PrescriptionMedicine, value: any) => {
    setMedicines(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectDrugFromFormulary = (index: number, drug: DrugItem) => {
    setMedicines(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        name: `${drug.name} ${drug.strength ? `(${drug.strength})` : ''}`.trim(),
        type: drug.type,
        strength: drug.strength,
        foodTiming: drug.defaultTiming || 'After Food',
        instructions: drug.indications ? `Indication: ${drug.indications}` : ''
      };
      return updated;
    });
    setActiveDrugSearchIndex(null);
    setDrugSearchQuery('');
  };

  // Fast Dosage Preset Helper
  const applyDosagePreset = (index: number, m: string, l: string, e: string, d: string, timing?: string) => {
    setMedicines(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        morning: m,
        lunch: l,
        evening: e,
        dinner: d,
        ...(timing ? { foodTiming: timing } : {})
      };
      return updated;
    });
  };

  // Clear / Cancel Action
  const handleClearCancel = () => {
    if (window.confirm('Clear current prescription form? Entered medications will be reset.')) {
      setSelectedPatient(patients[0] || null);
      setSelectedDoctor(doctors[0] || null);
      setDiagnosis('');
      setChiefComplaint('');
      setClinicalNotes('');
      setGeneralAdvice('Drink warm fluids, steam inhalation twice daily, adequate bed rest.');
      setFollowUpDays('5 Days');
      setMedicines([createInitialMedicine()]);
      triggerToast('Prescription cleared.', 'info');
    }
  };

  // Build current prescription object
  const buildCurrentPrescription = (idOverride?: string): Prescription => {
    const rxId = idOverride || `RX-${Math.floor(10000 + Math.random() * 90000)}`;
    return {
      id: rxId,
      date: prescriptionDate,
      patientId: selectedPatient?.id || 'P-UNKNOWN',
      patientName: selectedPatient?.name || 'Walk-in Patient',
      doctorId: selectedDoctor?.id || 'D-101',
      doctorName: selectedDoctor?.name || 'Dr. Sarah Chen',
      diagnosis: diagnosis || 'General Clinical Consultation',
      chiefComplaint: chiefComplaint || 'Routine Medical Evaluation',
      clinicalNotes: clinicalNotes || '',
      medicines: medicines.filter(m => m.name.trim() !== ''),
      additionalInstructions: generalAdvice,
      followUpRequired: true,
      followUpDate: followUpDays,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Save Prescription Action
  const handleSavePrescription = () => {
    if (!selectedPatient) {
      triggerToast('Please select a patient first.', 'error');
      return;
    }
    if (!selectedDoctor) {
      triggerToast('Please select a consulting doctor.', 'error');
      return;
    }
    const validMeds = medicines.filter(m => m.name.trim() !== '');
    if (validMeds.length === 0) {
      triggerToast('Please add at least one medication to save.', 'error');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const rx = buildCurrentPrescription();
      const updated = [rx, ...prescriptions];
      setPrescriptions(updated);
      try {
        localStorage.setItem('medflow_prescriptions', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save prescription to storage', e);
      }
      setIsSaving(false);
      triggerToast(`Prescription ${rx.id} saved for ${selectedPatient.name}!`, 'success');
    }, 300);
  };

  // Send to Billing Action: Interconnects prescription meds with billing module
  const handleSendToBilling = () => {
    if (!selectedPatient) {
      triggerToast('Please select a patient first.', 'error');
      return;
    }
    const validMeds = medicines.filter(m => m.name.trim() !== '');
    const billItems = [
      {
        id: 1,
        desc: `Doctor Consultation - ${selectedDoctor?.name || 'Physician'} (${selectedDoctor?.specialization || 'General'})`,
        qty: 1,
        price: 500
      },
      ...validMeds.map((med, idx) => ({
        id: idx + 2,
        desc: `${med.name} (${med.type || 'Medicine'}, ${med.foodTiming || 'Oral'})`,
        qty: parseInt(String(med.durationDays || '5'), 10) || 5,
        price: 45
      }))
    ];

    setPendingBillItems(billItems);
    setGlobalActivePatient(selectedPatient);
    if (selectedDoctor) {
      setGlobalActiveDoctor(selectedDoctor);
    }
    triggerToast(`Sent ${validMeds.length} prescription medicines to Billing for ${selectedPatient.name}`, 'success');
    if (setActiveTab) {
      setActiveTab('billing');
    }
  };

  // Print Prescription Action
  const handlePrintPrescription = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Download PDF Action
  const handleDownloadPDF = async () => {
    const element = document.getElementById('prescription-printable-document');
    if (!element) {
      triggerToast('Document element not found.', 'error');
      return;
    }

    setIsGeneratingPdf(true);
    triggerToast('Generating Prescription PDF...', 'info');

    try {
      // Small pause to ensure layout, images, and fonts are ready
      await new Promise(r => setTimeout(r, 100));

      const imgData = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const img = new Image();
      img.src = imgData;
      await img.decode();
      
      const imgHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
      
      const cleanPatientName = (selectedPatient?.name || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanRxId = (selectedPatient?.id || 'RX').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Prescription_${cleanPatientName}_${cleanRxId}.pdf`;

      pdf.save(filename);
      triggerToast('Prescription PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF export failed:', err);
      triggerToast('PDF export error. Try Print -> Save as PDF.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Add new drug to formulary
  const handleAddNewDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrugForm.name.trim()) return;

    const newDrug: DrugItem = {
      id: `M-${Date.now()}`,
      name: newDrugForm.name.trim(),
      type: newDrugForm.type,
      strength: newDrugForm.strength.trim(),
      category: newDrugForm.category || 'General & Chronic',
      defaultTiming: newDrugForm.defaultTiming,
      commonDosage: newDrugForm.commonDosage,
      indications: newDrugForm.indications.trim()
    };

    setDrugCatalog(prev => [newDrug, ...prev]);
    setShowAddDrugModal(false);
    setNewDrugForm({
      name: '',
      type: 'Tablet',
      strength: '',
      category: 'General & Chronic',
      defaultTiming: 'After Food',
      commonDosage: '1-0-1',
      indications: ''
    });
    triggerToast(`Added ${newDrug.name} to formulary.`, 'success');
  };

  // Add drug from Drug List Page directly into prescription
  const handleUseDrugInPrescription = (drug: DrugItem) => {
    const newMed: PrescriptionMedicine = {
      id: Math.random().toString(36).substring(2, 9),
      name: `${drug.name} ${drug.strength ? `(${drug.strength})` : ''}`.trim(),
      type: drug.type,
      strength: drug.strength,
      foodTiming: drug.defaultTiming || 'After Food',
      morning: '1',
      lunch: '0',
      evening: '0',
      dinner: '1',
      durationDays: 5,
      instructions: drug.indications ? `Indication: ${drug.indications}` : ''
    };

    setMedicines(prev => [...prev, newMed]);
    setActiveView('prescription');
    triggerToast(`Added ${drug.name} to prescription.`, 'success');
  };

  const drugCategories = [
    'All',
    'Antibiotics',
    'Antacids & PPI',
    'Analgesics & Antipyretic',
    'Pain & Inflammation',
    'Anti-Diabetic',
    'Cardiovascular',
    'Respiratory',
    'Vitamins & Supplements',
    'Gastroenterology'
  ];

  return (
    <div className="w-full max-w-7xl mx-auto font-sans flex flex-col justify-start space-y-3 pb-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold text-white border ${
              showToast.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
              showToast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-slate-900 border-slate-800'
            }`}
          >
            {showToast.type === 'success' && <CheckCircle2 size={16} className="shrink-0" />}
            {showToast.type === 'error' && <AlertCircle size={16} className="shrink-0" />}
            {showToast.type === 'info' && <FileText size={16} className="shrink-0" />}
            <span>{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. ULTRA-COMPACT DESKTOP TOP ACTION BAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Title + Mode Toggle Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold">
              <Pill size={18} />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight hidden sm:inline">
              Prescription Studio
            </span>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveView('prescription')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'prescription'
                  ? 'bg-white text-medical-primary shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit size={13} />
              <span>Builder</span>
            </button>

            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'preview'
                  ? 'bg-white text-medical-primary shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={13} />
              <span>A4 Print</span>
            </button>

            <button
              onClick={() => setActiveView('records')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'records'
                  ? 'bg-white text-medical-primary shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={13} />
              <span>Past RX ({prescriptions.length})</span>
            </button>
          </div>
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Drug List Button */}
          <button
            onClick={() => setActiveView('drugs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
              activeView === 'drugs'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60'
            }`}
            title="Open drug formulary & medicine directory"
          >
            <Pill size={14} />
            <span>Drug List</span>
          </button>

          {/* Print Prescription */}
          <button
            onClick={handlePrintPrescription}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Print A4 prescription"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
            title="Download PDF document"
          >
            <Download size={14} />
            <span>{isGeneratingPdf ? '...' : 'PDF'}</span>
          </button>

          {/* Save Prescription */}
          <button
            onClick={handleSavePrescription}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
            title="Save prescription"
          >
            <Check size={14} />
            <span>{isSaving ? 'Saving' : 'Save'}</span>
          </button>

          {/* Send to Billing */}
          <button
            onClick={handleSendToBilling}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Send prescription medicines directly to Billing / Pharmacy checkout"
          >
            <CreditCard size={14} />
            <span className="hidden md:inline">To Billing</span>
          </button>

          {/* Clear / Cancel */}
          <button
            onClick={handleClearCancel}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            title="Reset form"
          >
            <RefreshCw size={13} />
            <span className="hidden md:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: PRESCRIPTION BUILDER (COMPACT FIT-ALL-IN-DESKTOP) */}
      {/* ========================================================================= */}
      {activeView === 'prescription' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* A. CONSOLIDATED CLINICAL HEADER ROW (Patient & Doctor in 2 Balanced Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Column 1: Patient Information (Cols 1-6) */}
            <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <User size={14} className="text-medical-primary" />
                  <span>Patient Details</span>
                </div>
                {selectedPatient && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
                    {selectedPatient.id}
                  </span>
                )}
              </div>

              {/* Patient Name Search Field */}
              <div className="relative" ref={patientDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search / Select Patient (Name, ID, Phone)..."
                    value={patientSearchQuery || (selectedPatient ? `${selectedPatient.name}` : '')}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      setIsPatientDropdownOpen(true);
                    }}
                    onFocus={() => setIsPatientDropdownOpen(true)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
                  />
                  {selectedPatient && (
                    <button
                      onClick={() => {
                        setSelectedPatient(null);
                        setPatientSearchQuery('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Dropdown suggestions */}
                {isPatientDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredPatients.slice(0, 5).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <div>
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{p.id} • {p.age}Y • {p.gender}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{p.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Patient Quick Info Pills */}
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-0.5">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 truncate">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Age / Gender</span>
                  <span className="font-bold text-slate-800">{selectedPatient ? `${selectedPatient.age}Y / ${selectedPatient.gender}` : '--'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 truncate">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Phone (+91)</span>
                  <span className="font-bold text-slate-800 tabular-nums">{selectedPatient?.phone || '--'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 truncate">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Blood Group</span>
                  <span className="font-bold text-indigo-700">{selectedPatient?.bloodGroup || 'O+'}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Consulting Doctor & Date (Cols 7-12) */}
            <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Stethoscope size={14} className="text-indigo-600" />
                  <span>Consulting Doctor & Issue Date</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {selectedDoctor?.registrationNumber || 'MCI-98442-KA'}
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const doc = doctors.find((d: Doctor) => d.id === e.target.value) || null;
                    setSelectedDoctor(doc);
                    if (doc) setGlobalActiveDoctor(doc);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-medical-primary/20 appearance-none pr-7 cursor-pointer"
                >
                  {doctors.map((d: Doctor) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Medical License #</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{selectedDoctor?.registrationNumber || 'MCI-98442-KA'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Prescription Issue Date</span>
                  <input
                    type="text"
                    value={prescriptionDate}
                    onChange={(e) => setPrescriptionDate(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-800 text-[11px] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* B. STRUCTURED MEDICINE TABLE SECTION (COMPACT DESKTOP VIEWPORT FIT) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-serif italic text-medical-primary font-bold">℞</span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Prescription Medicine Table
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {medicines.length} Rows
                </span>
              </div>

              {/* Quick Preset Shortcuts Bar */}
              <div className="flex items-center gap-1.5">
                <div className="hidden lg:flex items-center gap-1 text-[10px] font-bold text-slate-500 mr-1">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyDosagePreset(medicines.length - 1, '1', '0', '0', '1', 'After Food')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    1-0-1 (BD)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDosagePreset(medicines.length - 1, '1', '1', '0', '1', 'After Food')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    1-1-1 (TDS)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDosagePreset(medicines.length - 1, '1', '0', '0', '0', 'Before Food')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    1-0-0 (B.F)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="px-3 py-1 bg-medical-primary text-white hover:bg-medical-primary/90 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all"
                >
                  <Plus size={14} /> Add Medicine
                </button>
              </div>
            </div>

            {/* High-Density Compact Table Container with Max-Height Scrolling to Guarantee Desktop Fit */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-[220px] 2xl:max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-2.5 w-8 text-center bg-slate-100">#</th>
                      <th className="py-2 px-3 min-w-[200px] bg-slate-100">Drug Name</th>
                      <th className="py-2 px-2.5 min-w-[140px] bg-slate-100">Before / After Food</th>
                      <th className="py-2 px-1 text-center w-16 bg-slate-100" title="Morning">Morning</th>
                      <th className="py-2 px-1 text-center w-16 bg-slate-100" title="Lunch">Lunch</th>
                      <th className="py-2 px-1 text-center w-16 bg-slate-100" title="Evening">Evening</th>
                      <th className="py-2 px-1 text-center w-16 bg-slate-100" title="Dinner">Dinner</th>
                      <th className="py-2 px-2.5 text-center w-24 bg-slate-100">Duration (Days)</th>
                      <th className="py-2 px-2 text-right w-12 bg-slate-100">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {medicines.map((med, index) => (
                      <tr key={med.id || index} className="hover:bg-slate-50/60 transition-colors">
                        {/* Index */}
                        <td className="py-1.5 px-2.5 text-center font-bold text-slate-400 text-[11px]">
                          {index + 1}
                        </td>

                        {/* Drug Name with Autocomplete */}
                        <td className="py-1.5 px-3 relative">
                          <input
                            type="text"
                            placeholder="Enter drug name (e.g. Paracetamol 650mg)..."
                            value={med.name}
                            onChange={(e) => {
                              handleUpdateMedicineRow(index, 'name', e.target.value);
                              setDrugSearchQuery(e.target.value);
                              setActiveDrugSearchIndex(index);
                            }}
                            onFocus={() => {
                              setActiveDrugSearchIndex(index);
                              setDrugSearchQuery(med.name);
                            }}
                            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-medical-primary/30"
                          />

                          {/* Autocomplete Dropdown */}
                          {activeDrugSearchIndex === index && drugSearchQuery && (
                            <div className="absolute left-3 right-3 top-full mt-1 z-40 bg-white rounded-xl shadow-xl border border-slate-200 max-h-40 overflow-y-auto divide-y divide-slate-100">
                              {drugCatalog
                                .filter(d => d.name.toLowerCase().includes(drugSearchQuery.toLowerCase()))
                                .slice(0, 5)
                                .map((drug) => (
                                  <button
                                    key={drug.id}
                                    type="button"
                                    onClick={() => handleSelectDrugFromFormulary(index, drug)}
                                    className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800"
                                  >
                                    <span>{drug.name} <span className="text-slate-400 font-normal">({drug.strength})</span></span>
                                    <span className="text-[10px] text-medical-primary bg-medical-primary/10 px-1.5 py-0.5 rounded">Pick</span>
                                  </button>
                                ))}
                            </div>
                          )}
                        </td>

                        {/* Before / After Food */}
                        <td className="py-1.5 px-2.5">
                          <div className="relative">
                            <select
                              value={med.foodTiming || 'After Food'}
                              onChange={(e) => handleUpdateMedicineRow(index, 'foodTiming', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none appearance-none pr-5"
                            >
                              <option value="After Food">After Food</option>
                              <option value="Before Food">Before Food</option>
                              <option value="With Food">With Food</option>
                              <option value="Empty Stomach">Empty Stomach</option>
                              <option value="At Bedtime">At Bedtime</option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                          </div>
                        </td>

                        {/* Morning */}
                        <td className="py-1.5 px-1 text-center">
                          <input
                            type="text"
                            placeholder="1"
                            value={med.morning ?? ''}
                            onChange={(e) => handleUpdateMedicineRow(index, 'morning', e.target.value)}
                            className="w-12 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg py-1 text-center font-bold text-slate-900 text-xs mx-auto"
                          />
                        </td>

                        {/* Lunch */}
                        <td className="py-1.5 px-1 text-center">
                          <input
                            type="text"
                            placeholder="0"
                            value={med.lunch ?? ''}
                            onChange={(e) => handleUpdateMedicineRow(index, 'lunch', e.target.value)}
                            className="w-12 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg py-1 text-center font-bold text-slate-900 text-xs mx-auto"
                          />
                        </td>

                        {/* Evening */}
                        <td className="py-1.5 px-1 text-center">
                          <input
                            type="text"
                            placeholder="0"
                            value={med.evening ?? ''}
                            onChange={(e) => handleUpdateMedicineRow(index, 'evening', e.target.value)}
                            className="w-12 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg py-1 text-center font-bold text-slate-900 text-xs mx-auto"
                          />
                        </td>

                        {/* Dinner */}
                        <td className="py-1.5 px-1 text-center">
                          <input
                            type="text"
                            placeholder="1"
                            value={med.dinner ?? ''}
                            onChange={(e) => handleUpdateMedicineRow(index, 'dinner', e.target.value)}
                            className="w-12 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg py-1 text-center font-bold text-slate-900 text-xs mx-auto"
                          />
                        </td>

                        {/* Duration (Days) */}
                        <td className="py-1.5 px-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            placeholder="5"
                            value={med.durationDays || ''}
                            onChange={(e) => handleUpdateMedicineRow(index, 'durationDays', e.target.value)}
                            className="w-16 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg py-1 text-center font-bold text-indigo-700 text-xs mx-auto"
                          />
                        </td>

                        {/* Delete Action */}
                        <td className="py-1.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(index)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* C. BOTTOM SECTION: ADVICE & DOCTOR SIGNATURE/SEAL ROW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Advice & Follow-up Box (Cols 1-7) */}
            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">General Advice & Instructions</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-500">Review:</span>
                  <input
                    type="text"
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(e.target.value)}
                    placeholder="e.g. 5 Days"
                    className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-indigo-700"
                  />
                </div>
              </div>

              <textarea
                rows={2}
                value={generalAdvice}
                onChange={(e) => setGeneralAdvice(e.target.value)}
                placeholder="Dietary advice, fluid intake, precautions, rest..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-medical-primary/30"
              />
            </div>

            {/* Doctor Signature & Seal Area (Cols 8-12) */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center justify-between gap-3">
              {/* Doctor Details */}
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Authorized Signatory</span>
                <h4 className="text-xs font-bold text-slate-900">{selectedDoctor?.name || 'Dr. Sarah Chen'}</h4>
                <p className="text-[10px] font-mono font-bold text-indigo-700">
                  Reg No: {selectedDoctor?.registrationNumber || 'MCI-98442-KA'}
                </p>
                <span className="text-[9px] text-slate-500 block">
                  {selectedDoctor?.qualification || 'MD, MBBS'} • {selectedDoctor?.specialization}
                </span>
              </div>

              {/* Seal Stamp Badge */}
              <div className="flex flex-col items-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setSignatureStampEnabled(!signatureStampEnabled)}
                  title="Toggle official clinic seal stamp"
                  className="text-[9px] text-slate-400 hover:text-medical-primary flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ShieldCheck size={11} className={signatureStampEnabled ? "text-emerald-500" : "text-slate-300"} />
                  <span>{signatureStampEnabled ? "Seal Enabled" : "Seal Disabled"}</span>
                </button>
                {signatureStampEnabled && (
                  <div className="border border-dashed border-medical-primary/70 bg-medical-primary/5 rounded-xl px-2.5 py-1 text-center rotate-[-3deg]">
                    <span className="text-[8px] font-black uppercase tracking-wider text-medical-primary block">
                      MEDIFLOW SEAL
                    </span>
                    <span className="text-[7px] font-mono text-slate-700 block">
                      {selectedDoctor?.registrationNumber || 'MCI-98442-KA'}
                    </span>
                  </div>
                )}

                <div className="w-28 h-6 border-b border-slate-700 flex items-end justify-center pb-0.5">
                  <span className="text-xs font-serif italic text-slate-800 font-bold">
                    {selectedDoctor?.name?.replace('Dr. ', '') || 'Sarah Chen'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: DRUG LIST FORMULARY DIRECTORY */}
      {/* ========================================================================= */}
      {activeView === 'drugs' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('prescription')}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Back"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Clinic Drug Formulary ({drugCatalog.length} Molecules)
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddDrugModal(true)}
                  className="px-3 py-1.5 bg-medical-primary text-white rounded-xl text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1 shadow-2xs"
                >
                  <Plus size={14} /> Add Custom Drug
                </button>
                <button
                  onClick={() => setActiveView('prescription')}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Back to Prescription
                </button>
              </div>
            </div>

            {/* Search & Categories Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={drugPageSearch}
                  onChange={(e) => setDrugPageSearch(e.target.value)}
                  placeholder="Search drug generic name, strength, or indication..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs focus:ring-1 focus:ring-medical-primary/30"
                />
                {drugPageSearch && (
                  <button onClick={() => setDrugPageSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={drugFilterCategory}
                onChange={(e) => setDrugFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {drugCategories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Drug Grid Layout (Compact) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {drugCatalog
              .filter(d => {
                const matchQuery = d.name.toLowerCase().includes(drugPageSearch.toLowerCase()) ||
                                   d.strength.toLowerCase().includes(drugPageSearch.toLowerCase()) ||
                                   (d.category && d.category.toLowerCase().includes(drugPageSearch.toLowerCase())) ||
                                   (d.indications && d.indications.toLowerCase().includes(drugPageSearch.toLowerCase()));
                const matchCategory = drugFilterCategory === 'All' || d.category?.toLowerCase().includes(drugFilterCategory.toLowerCase());
                return matchQuery && matchCategory;
              })
              .map((drug) => (
                <div
                  key={drug.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:border-medical-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {drug.type}
                      </span>
                      <span className="text-[10px] font-bold text-medical-primary bg-medical-primary/10 px-2 py-0.5 rounded-full">
                        {drug.strength || 'Std'}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-medical-primary transition-colors">
                      {drug.name}
                    </h3>

                    {drug.indications && (
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {drug.indications}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                      <span>Timing: <strong>{drug.defaultTiming || 'After Food'}</strong></span>
                      <span>Dose: <strong>{drug.commonDosage || '1-0-1'}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUseDrugInPrescription(drug)}
                    className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-[11px] font-bold transition-all shadow-2xs flex items-center justify-center gap-1"
                  >
                    <Plus size={13} />
                    Insert in Prescription
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW: PAST PRESCRIPTIONS RECORDS */}
      {/* ========================================================================= */}
      {activeView === 'records' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Historical Prescriptions ({prescriptions.length})</h2>
            <button
              onClick={() => setActiveView('prescription')}
              className="px-3 py-1.5 bg-medical-primary text-white rounded-xl text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1"
            >
              <Plus size={14} /> New Prescription
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Rx Number</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Patient</th>
                    <th className="px-4 py-2.5">Doctor</th>
                    <th className="px-4 py-2.5">Diagnosis</th>
                    <th className="px-4 py-2.5">Items</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-800 tabular-nums">{rx.id}</td>
                      <td className="px-4 py-2.5 text-slate-600">{rx.date}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">{rx.patientName}</td>
                      <td className="px-4 py-2.5 text-slate-700">{rx.doctorName}</td>
                      <td className="px-4 py-2.5 text-slate-600 truncate max-w-xs">{rx.diagnosis}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                          {rx.medicines?.length || 0} Drugs
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedPatient(patients.find((p: Patient) => p.id === rx.patientId) || null);
                              setSelectedDoctor(doctors.find((d: Doctor) => d.name === rx.doctorName) || null);
                              setDiagnosis(rx.diagnosis || '');
                              setChiefComplaint(rx.chiefComplaint || '');
                              setClinicalNotes(rx.clinicalNotes || '');
                              setMedicines(rx.medicines && rx.medicines.length > 0 ? rx.medicines : [createInitialMedicine()]);
                              setActiveView('preview');
                            }}
                            className="p-1.5 text-medical-primary hover:bg-medical-primary/10 rounded-lg"
                            title="View A4 Print"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(patients.find((p: Patient) => p.id === rx.patientId) || null);
                              setSelectedDoctor(doctors.find((d: Doctor) => d.name === rx.doctorName) || null);
                              setDiagnosis(rx.diagnosis || '');
                              setChiefComplaint(rx.chiefComplaint || '');
                              setClinicalNotes(rx.clinicalNotes || '');
                              setMedicines(rx.medicines && rx.medicines.length > 0 ? rx.medicines : [createInitialMedicine()]);
                              setActiveView('prescription');
                              triggerToast(`Loaded ${rx.id}`, 'info');
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. A4 PRINT DOCUMENT (RENDERED IN PREVIEW OR OFFSCREEN FOR INSTANT PDF GENERATION) */}
      {/* ========================================================================= */}
      {activeView === 'preview' && (
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Eye size={16} className="text-medical-primary" />
            <span>A4 Document Print & PDF Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('prescription')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Builder
            </button>
            <button
              onClick={handlePrintPrescription}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs disabled:opacity-50 transition-colors"
            >
              <Download size={14} /> {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      )}

      <div 
        id="prescription-printable-document" 
        ref={printAreaRef}
        className={`bg-white text-slate-900 font-serif ${
          activeView === 'preview'
            ? 'block rounded-3xl border border-slate-200 shadow-xl p-8 space-y-5 max-w-4xl mx-auto'
            : 'fixed -left-[9999px] top-0 pointer-events-none w-[794px] p-8 space-y-5 border-none shadow-none z-[-100]'
        }`}
        style={{ minHeight: '800px', backgroundColor: '#ffffff' }}
      >
        {/* DOCUMENT HEADER */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
          <div className="flex items-center gap-3.5">
            <img 
              src={clinicLogo} 
              alt="Clinic Logo" 
              className="w-14 h-14 object-contain rounded-xl border border-slate-200"
            />
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-tight">
                {clinicName || 'MEDIFLOW CLINIC & OPD CENTER'}
              </h2>
              <p className="text-[11px] text-slate-600 font-sans leading-tight mt-0.5">
                {tagline || 'Multi-Speciality Outpatient Hospital & Diagnostic Center'}
              </p>
              <p className="text-[9px] text-slate-500 font-sans mt-0.5">
                Reg No: {regNumber || 'CLINIC-REG-889922'} • GSTIN: {taxNumber || '29AAACM1234F1Z5'}
              </p>
            </div>
          </div>

          <div className="text-right text-[9px] text-slate-600 font-sans space-y-0.5 leading-tight max-w-[220px]">
            <p className="font-bold text-slate-900">{address ? address.split(',')[0] : '100 Feet Road, Indiranagar'}</p>
            <p className="truncate">{address ? address.split(',').slice(1).join(',') : 'Bangalore, Karnataka - 560038'}</p>
            <p>Phone: {phone || '+91 98765-43210'}</p>
            <p>Email: {email || 'opd@medflowcare.com'}</p>
          </div>
        </div>

        {/* DOCTOR DETAILS */}
        <div className="flex justify-between items-start text-xs font-sans bg-slate-50/80 p-3 rounded-xl border border-slate-200">
          <div>
            <p className="text-slate-400 text-[9px] uppercase font-bold">Consulting Doctor</p>
            <p className="font-bold text-slate-900 text-xs">{selectedDoctor?.name || 'Dr. Sarah Chen'}</p>
            <p className="text-[10px] text-slate-600">{selectedDoctor?.qualification || 'MD, MBBS'}</p>
            <p className="text-[10px] text-indigo-700 font-bold">{selectedDoctor?.specialization || 'General Physician'}</p>
          </div>

          <div className="text-right">
            <p className="text-slate-400 text-[9px] uppercase font-bold">Medical Reg. Number</p>
            <p className="font-mono font-bold text-slate-900 text-xs">{selectedDoctor?.registrationNumber || 'MCI-98442-KA'}</p>
            <p className="text-slate-400 text-[9px] uppercase font-bold mt-1">Date</p>
            <p className="font-bold text-slate-900 text-xs">{prescriptionDate}</p>
          </div>
        </div>

        {/* PATIENT DETAILS */}
        <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-xs font-sans grid grid-cols-4 gap-2">
          <div>
            <span className="text-[9px] uppercase text-slate-500 font-bold block">Patient Name</span>
            <span className="font-bold text-slate-900 text-xs truncate block">{selectedPatient?.name || 'Walk-in Patient'}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-500 font-bold block">Age / Gender</span>
            <span className="font-bold text-slate-900 text-xs block">{selectedPatient ? `${selectedPatient.age} Y / ${selectedPatient.gender}` : '--'}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-500 font-bold block">Phone</span>
            <span className="font-semibold text-slate-900 text-xs block tabular-nums">{selectedPatient?.phone || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-500 font-bold block">Patient ID</span>
            <span className="font-mono font-bold text-indigo-700 text-xs block">{selectedPatient?.id || 'P-NEW'}</span>
          </div>
        </div>

        {/* MEDICINE TABLE */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
            <span className="text-base text-medical-primary font-serif italic">℞</span>
            <span className="font-sans text-[11px] uppercase tracking-wider text-slate-600">Prescribed Medication Regimen</span>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden font-sans">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[10px]">
                <tr>
                  <th className="py-2 px-2.5">#</th>
                  <th className="py-2 px-2.5">Drug Name</th>
                  <th className="py-2 px-2.5 text-center">Before / After Food</th>
                  <th className="py-2 px-1.5 text-center" title="Morning">M</th>
                  <th className="py-2 px-1.5 text-center" title="Lunch">L</th>
                  <th className="py-2 px-1.5 text-center" title="Evening">E</th>
                  <th className="py-2 px-1.5 text-center" title="Dinner">D</th>
                  <th className="py-2 px-2.5 text-center">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {medicines.filter(m => m.name.trim() !== '').map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5 text-slate-500 font-semibold text-[11px]">{idx + 1}</td>
                    <td className="py-2 px-2.5">
                      <div className="font-bold text-slate-900 text-xs">{m.name}</div>
                      {m.instructions && (
                        <div className="text-[9px] text-slate-500 italic mt-0.5">{m.instructions}</div>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-center font-medium text-slate-700">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        m.foodTiming === 'Before Food' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {m.foodTiming || 'After Food'}
                      </span>
                    </td>
                    <td className="py-2 px-1.5 text-center font-bold text-slate-900 tabular-nums text-xs">{m.morning || '0'}</td>
                    <td className="py-2 px-1.5 text-center font-bold text-slate-900 tabular-nums text-xs">{m.lunch || '0'}</td>
                    <td className="py-2 px-1.5 text-center font-bold text-slate-900 tabular-nums text-xs">{m.evening || '0'}</td>
                    <td className="py-2 px-1.5 text-center font-bold text-slate-900 tabular-nums text-xs">{m.dinner || '0'}</td>
                    <td className="py-2 px-2.5 text-center font-bold text-indigo-900 tabular-nums text-xs">{m.durationDays || '5'} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADVICE */}
        {generalAdvice && (
          <div className="text-xs font-sans bg-slate-50/80 p-3 rounded-xl border border-slate-200 space-y-1">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">General Advice & Precautions:</p>
            <p className="text-slate-800 text-[10px] leading-relaxed">{generalAdvice}</p>
            {followUpDays && (
              <p className="text-[9px] font-bold text-indigo-700 pt-0.5">
                Review: {followUpDays}
              </p>
            )}
          </div>
        )}

        {/* DOCTOR SIGNATURE & SEAL */}
        <div className="pt-6 mt-4 border-t border-slate-300 font-sans flex items-end justify-between">
          <div className="space-y-1 text-[8px] text-slate-400 max-w-[200px] leading-tight">
            <div className="flex items-center gap-1 text-slate-700 font-bold">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Digitally Validated EHR Document</span>
            </div>
            <p>Valid with authorized stamp. For emergency: +91 80 2528 9000.</p>
          </div>

          <div className="text-right space-y-1 relative">
            {signatureStampEnabled && (
              <div className="inline-block mb-1 border border-dashed border-medical-primary/70 bg-medical-primary/5 rounded-xl px-3 py-1 text-center rotate-[-3deg]">
                <span className="text-[8px] font-bold uppercase tracking-wider text-medical-primary block">
                  MEDIFLOW CLINIC SEAL
                </span>
                <span className="text-[7px] font-mono text-slate-600 block">
                  {selectedDoctor?.registrationNumber || 'MCI-98442-KA'}
                </span>
              </div>
            )}

            <div className="w-36 h-8 border-b border-slate-800 ml-auto flex items-end justify-center pb-0.5">
              <span className="text-xs font-serif italic text-slate-800 font-bold">
                {selectedDoctor?.name?.replace('Dr. ', '') || 'Sarah Chen'}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900">{selectedDoctor?.name || 'Dr. Sarah Chen'}</p>
              <p className="text-[9px] text-slate-600 font-mono">Reg No: {selectedDoctor?.registrationNumber || 'MCI-98442-KA'}</p>
              <p className="text-[8px] text-slate-400 uppercase font-semibold">Authorized Signature & Seal</p>
            </div>
          </div>
        </div>
      </div>

      {/* ADD CUSTOM DRUG MODAL */}
      <AnimatePresence>
        {showAddDrugModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Pill size={16} className="text-medical-primary" /> Add Molecule to Formulary
                </h3>
                <button
                  onClick={() => setShowAddDrugModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddNewDrug} className="mt-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Drug Name / Molecule *</label>
                  <input
                    type="text"
                    required
                    value={newDrugForm.name}
                    onChange={(e) => setNewDrugForm({ ...newDrugForm, name: e.target.value })}
                    placeholder="e.g. Montelukast + Levocetirizine"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-medical-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Dosage Form</label>
                    <select
                      value={newDrugForm.type}
                      onChange={(e) => setNewDrugForm({ ...newDrugForm, type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs"
                    >
                      {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler', 'Drops', 'Ointment', 'Cream'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Strength</label>
                    <input
                      type="text"
                      value={newDrugForm.strength}
                      onChange={(e) => setNewDrugForm({ ...newDrugForm, strength: e.target.value })}
                      placeholder="e.g. 10mg / 5mg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Timing</label>
                    <select
                      value={newDrugForm.defaultTiming}
                      onChange={(e) => setNewDrugForm({ ...newDrugForm, defaultTiming: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs"
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                    <input
                      type="text"
                      value={newDrugForm.category}
                      onChange={(e) => setNewDrugForm({ ...newDrugForm, category: e.target.value })}
                      placeholder="e.g. Respiratory"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Indications / Uses</label>
                  <input
                    type="text"
                    value={newDrugForm.indications}
                    onChange={(e) => setNewDrugForm({ ...newDrugForm, indications: e.target.value })}
                    placeholder="e.g. Allergic rhinitis, seasonal allergy"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDrugModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-medical-primary text-white rounded-xl text-xs font-bold hover:bg-medical-primary/90 flex items-center gap-1 shadow-2xs"
                  >
                    <Check size={14} /> Add to Formulary
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRINT-ONLY CSS RULES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #prescription-printable-document, #prescription-printable-document * {
            visibility: visible;
          }
          #prescription-printable-document {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 12mm !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrescriptionPage;
