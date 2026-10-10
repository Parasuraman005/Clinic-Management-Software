import { useState, useEffect } from 'react';
import { Doctor } from '../types';
import { mockDoctors } from '../mockData';
import { formatIndianPhone } from '../utils/formatters';

const DOCTORS_STORAGE_KEY = 'medflow_doctors_data';

export const getInitialDoctors = (): Doctor[] => {
  try {
    const saved = localStorage.getItem(DOCTORS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((d: Doctor) => d.id));
        const merged = [...parsed];
        mockDoctors.forEach(md => {
          if (!existingIds.has(md.id)) {
            merged.push(md);
          }
        });
        return merged.map((d: Doctor) => ({
          ...d,
          phone: formatIndianPhone(d.phone)
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load doctors from storage', e);
  }
  return mockDoctors.map(d => ({
    ...d,
    phone: formatIndianPhone(d.phone)
  }));
};

let currentDoctors: Doctor[] = getInitialDoctors();
const listeners = new Set<(doctors: Doctor[]) => void>();

const broadcast = () => {
  try {
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(currentDoctors));
  } catch (e) {
    console.error('Failed to save doctors', e);
  }
  listeners.forEach(listener => listener([...currentDoctors]));
};

export const addDoctorRecord = (data: {
  name: string;
  specialization: string;
  qualification: string;
  phone: string;
  email: string;
  registrationNumber: string;
  consultationFee: number;
  workingDays: string[];
  workingHours: string;
  status: 'Active' | 'Away';
  experience?: string;
  image?: string;
  appointmentDuration?: number;
}): Doctor => {
  const nextIdNum = currentDoctors.length > 0
    ? Math.max(...currentDoctors.map(d => {
        const num = parseInt(d.id.replace(/\D/g, ''));
        return isNaN(num) ? 100 : num;
      })) + 1
    : 101;

  const newDoctor: Doctor = {
    id: `D-${nextIdNum}`,
    name: data.name.startsWith('Dr.') ? data.name.trim() : `Dr. ${data.name.trim()}`,
    specialization: data.specialization.trim(),
    qualification: data.qualification.trim(),
    experience: data.experience || '8 Years',
    availability: data.workingDays.map(d => d.slice(0, 3)).join(', '),
    image: data.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    status: data.status,
    phone: formatIndianPhone(data.phone),
    email: data.email.trim(),
    registrationNumber: data.registrationNumber.trim(),
    consultationFee: Number(data.consultationFee) || 500,
    workingDays: data.workingDays,
    workingHours: data.workingHours.trim() || '09:00 AM - 05:00 PM',
    appointmentDuration: data.appointmentDuration || 20
  };

  currentDoctors = [newDoctor, ...currentDoctors];
  broadcast();
  return newDoctor;
};

export const updateDoctorRecord = (id: string, updates: Partial<Doctor>) => {
  const sanitizedUpdates = { ...updates };
  if (sanitizedUpdates.phone) {
    sanitizedUpdates.phone = formatIndianPhone(sanitizedUpdates.phone);
  }
  currentDoctors = currentDoctors.map(d => d.id === id ? { ...d, ...sanitizedUpdates } : d);
  broadcast();
};

export const deleteDoctorRecord = (id: string) => {
  currentDoctors = currentDoctors.filter(d => d.id !== id);
  broadcast();
};

export const useSharedDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>(currentDoctors);

  useEffect(() => {
    const handleUpdate = (updated: Doctor[]) => {
      setDoctors(updated);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    doctors,
    addDoctor: addDoctorRecord,
    updateDoctor: updateDoctorRecord,
    deleteDoctor: deleteDoctorRecord
  };
};
