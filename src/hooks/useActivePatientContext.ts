import { useState, useEffect } from 'react';
import { Patient, Doctor } from '../types';
import { getInitialPatients } from './useSharedPatients';
import { getInitialDoctors } from './useSharedDoctors';

const ACTIVE_PATIENT_STORAGE_KEY = 'medflow_active_patient_id';
const ACTIVE_DOCTOR_STORAGE_KEY = 'medflow_active_doctor_id';
const PENDING_BILL_ITEMS_KEY = 'medflow_pending_bill_items';

export interface PendingBillItem {
  id: number;
  desc: string;
  qty: number;
  price: number;
}

let activePatientListeners = new Set<(patient: Patient | null) => void>();
let activeDoctorListeners = new Set<(doctor: Doctor | null) => void>();
let pendingBillListeners = new Set<(items: PendingBillItem[]) => void>();

const getStoredActivePatient = (): Patient | null => {
  const patients = getInitialPatients();
  try {
    const savedId = localStorage.getItem(ACTIVE_PATIENT_STORAGE_KEY);
    if (savedId) {
      const found = patients.find(p => p.id === savedId);
      if (found) return found;
    }
  } catch (e) {
    console.error('Error reading active patient ID', e);
  }
  return patients[0] || null;
};

const getStoredActiveDoctor = (): Doctor | null => {
  const doctors = getInitialDoctors();
  try {
    const savedId = localStorage.getItem(ACTIVE_DOCTOR_STORAGE_KEY);
    if (savedId) {
      const found = doctors.find(d => d.id === savedId || d.name === savedId);
      if (found) return found;
    }
  } catch (e) {
    console.error('Error reading active doctor ID', e);
  }
  return doctors[0] || null;
};

const getStoredPendingBillItems = (): PendingBillItem[] => {
  try {
    const saved = localStorage.getItem(PENDING_BILL_ITEMS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading pending bill items', e);
  }
  return [];
};

let currentActivePatient: Patient | null = getStoredActivePatient();
let currentActiveDoctor: Doctor | null = getStoredActiveDoctor();
let currentPendingBillItems: PendingBillItem[] = getStoredPendingBillItems();

export const setActivePatientRecord = (patient: Patient | null) => {
  currentActivePatient = patient;
  try {
    if (patient) {
      localStorage.setItem(ACTIVE_PATIENT_STORAGE_KEY, patient.id);
    } else {
      localStorage.removeItem(ACTIVE_PATIENT_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save active patient ID', e);
  }
  activePatientListeners.forEach(listener => listener(currentActivePatient));
};

export const setActiveDoctorRecord = (doctor: Doctor | null) => {
  currentActiveDoctor = doctor;
  try {
    if (doctor) {
      localStorage.setItem(ACTIVE_DOCTOR_STORAGE_KEY, doctor.id || doctor.name);
    } else {
      localStorage.removeItem(ACTIVE_DOCTOR_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save active doctor ID', e);
  }
  activeDoctorListeners.forEach(listener => listener(currentActiveDoctor));
};

export const setPendingBillItems = (items: PendingBillItem[]) => {
  currentPendingBillItems = items;
  try {
    localStorage.setItem(PENDING_BILL_ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save pending bill items', e);
  }
  pendingBillListeners.forEach(listener => listener(currentPendingBillItems));
};

export const useActivePatientContext = () => {
  const [activePatient, setActivePatientState] = useState<Patient | null>(currentActivePatient);
  const [activeDoctor, setActiveDoctorState] = useState<Doctor | null>(currentActiveDoctor);
  const [pendingBillItems, setPendingBillItemsState] = useState<PendingBillItem[]>(currentPendingBillItems);

  useEffect(() => {
    const patientListener = (p: Patient | null) => setActivePatientState(p);
    const doctorListener = (d: Doctor | null) => setActiveDoctorState(d);
    const billListener = (items: PendingBillItem[]) => setPendingBillItemsState(items);

    activePatientListeners.add(patientListener);
    activeDoctorListeners.add(doctorListener);
    pendingBillListeners.add(billListener);

    return () => {
      activePatientListeners.delete(patientListener);
      activeDoctorListeners.delete(doctorListener);
      pendingBillListeners.delete(billListener);
    };
  }, []);

  const selectPatient = (patient: Patient | null) => {
    setActivePatientRecord(patient);
  };

  const selectDoctor = (doctor: Doctor | null) => {
    setActiveDoctorRecord(doctor);
  };

  const navigateWithPatient = (
    patient: Patient, 
    tab: 'prescriptions' | 'consultation' | 'billing' | 'appointments' | 'queue',
    setActiveTab?: (tab: string) => void,
    options?: { doctor?: Doctor; billItems?: PendingBillItem[] }
  ) => {
    setActivePatientRecord(patient);
    if (options?.doctor) {
      setActiveDoctorRecord(options.doctor);
    }
    if (options?.billItems) {
      setPendingBillItems(options.billItems);
    }
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  return {
    activePatient,
    setActivePatient: selectPatient,
    activeDoctor,
    setActiveDoctor: selectDoctor,
    pendingBillItems,
    setPendingBillItems,
    navigateWithPatient
  };
};
