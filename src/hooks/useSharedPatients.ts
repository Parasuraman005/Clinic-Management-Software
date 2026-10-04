import { useState, useEffect } from 'react';
import { Patient } from '../types';
import { mockPatients } from '../mockData';
import { formatIndianPhone } from '../utils/formatters';

const PATIENTS_STORAGE_KEY = 'medflow_patients_data';

export const getInitialPatients = (): Patient[] => {
  try {
    const saved = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with mock patients to ensure all rich demo records are available
        const existingIds = new Set(parsed.map((p: Patient) => p.id));
        const merged = [...parsed];
        mockPatients.forEach(mp => {
          if (!existingIds.has(mp.id)) {
            merged.push(mp);
          }
        });
        return merged.map((p: Patient) => ({
          ...p,
          phone: formatIndianPhone(p.phone)
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load patients from storage', e);
  }
  return mockPatients.map(p => ({
    ...p,
    phone: formatIndianPhone(p.phone)
  }));
};

let currentPatients: Patient[] = getInitialPatients();
const listeners = new Set<(patients: Patient[]) => void>();

const broadcast = () => {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(currentPatients));
  } catch (e) {
    console.error('Failed to save patients', e);
  }
  listeners.forEach(listener => listener([...currentPatients]));
};

export const addPatientRecord = (data: {
  name: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  phone?: string;
  address?: string;
  bloodGroup?: string;
  attendantName?: string;
  attendantPhone?: string;
  attendantRelationship?: string;
  allergies?: string | string[];
  email?: string;
}): Patient => {
  const nextIdNum = currentPatients.length > 0
    ? Math.max(...currentPatients.map(p => {
        const num = parseInt(p.id.replace(/\D/g, ''));
        return isNaN(num) ? 1000 : num;
      })) + 1
    : 1001;

  const formattedPhone = formatIndianPhone(data.phone || '+91 98765-00000');
  const formattedAttendantPhone = data.attendantPhone ? formatIndianPhone(data.attendantPhone) : '';

  const emergencyContactStr = data.attendantName 
    ? `${data.attendantName} (${data.attendantRelationship || 'Attendant'})${formattedAttendantPhone ? ` - ${formattedAttendantPhone}` : ''}`
    : 'None Provided';

  const allergiesStr = Array.isArray(data.allergies) 
    ? data.allergies.join(', ') 
    : (data.allergies || 'None recorded');

  const newPatient: Patient = {
    id: `P-${nextIdNum}`,
    name: data.name.trim(),
    age: data.age || 30,
    gender: data.gender || 'Male',
    phone: formattedPhone,
    email: data.email || '',
    lastVisit: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    status: 'Active',
    bloodGroup: data.bloodGroup || 'Not Specified',
    address: (data.address || 'Bangalore, Karnataka').trim(),
    allergies: allergiesStr,
    emergencyContact: emergencyContactStr,
    insuranceProvider: 'None',
    insuranceNumber: 'N/A'
  };

  currentPatients = [newPatient, ...currentPatients];
  broadcast();
  return newPatient;
};

export const updatePatientRecord = (id: string, updates: Partial<Patient>) => {
  const sanitizedUpdates = { ...updates };
  if (sanitizedUpdates.phone) {
    sanitizedUpdates.phone = formatIndianPhone(sanitizedUpdates.phone);
  }
  currentPatients = currentPatients.map(p => p.id === id ? { ...p, ...sanitizedUpdates } : p);
  broadcast();
};

export const deletePatientRecord = (id: string) => {
  currentPatients = currentPatients.filter(p => p.id !== id);
  broadcast();
};

export const useSharedPatients = () => {
  const [patients, setPatients] = useState<Patient[]>(currentPatients);

  useEffect(() => {
    const handleUpdate = (updated: Patient[]) => {
      setPatients(updated);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    patients,
    addPatient: addPatientRecord,
    updatePatient: updatePatientRecord,
    deletePatient: deletePatientRecord
  };
};
