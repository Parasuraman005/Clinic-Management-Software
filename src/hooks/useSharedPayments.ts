import { useState, useEffect } from 'react';

export interface PaymentRecord {
  id: string; // Transaction ID
  invoice: string; // Invoice Number
  patient: string; // Patient Name
  patientId?: string;
  date: string; // Payment Date
  amount: string; // Formatted amount e.g. "24,150.50"
  method: 'Card' | 'UPI' | 'Cash' | 'Bank';
  status: 'Completed' | 'Pending' | 'Failed';
  receivedBy: string;
  notes?: string;
}

const PAYMENTS_STORAGE_KEY = 'medflow_payments_data';

export const initialPayments: PaymentRecord[] = [
  { id: 'PAY-001', invoice: 'INV-2023-001', patient: 'John Anderson', patientId: 'P-1001', date: '30/10/2023', amount: '24,150.50', method: 'Card', status: 'Completed', receivedBy: 'Emma Watson (Receptionist)', notes: 'Full settlement for consultation and lab blood test.' },
  { id: 'PAY-002', invoice: 'INV-2023-002', patient: 'Sarah Miller', patientId: 'P-1002', date: '29/10/2023', amount: '1,200.00', method: 'UPI', status: 'Completed', receivedBy: 'Emma Watson (Receptionist)', notes: 'UPI Ref #88997723.' },
  { id: 'PAY-003', invoice: 'INV-2023-003', patient: 'Robert Wilson', patientId: 'P-1003', date: '29/10/2023', amount: '5,500.00', method: 'Cash', status: 'Completed', receivedBy: 'John Smith (Admin)', notes: 'Cash counter receipt #4421.' },
  { id: 'PAY-004', invoice: 'INV-2023-004', patient: 'Emily Davis', patientId: 'P-1006', date: '28/10/2023', amount: '3,250.00', method: 'Bank', status: 'Pending', receivedBy: 'Accounts Dept', notes: 'Awaiting NEFT bank clearance.' },
  { id: 'PAY-005', invoice: 'INV-2023-005', patient: 'Michael Brown', patientId: 'P-1004', date: '28/10/2023', amount: '10,000.00', method: 'Card', status: 'Completed', receivedBy: 'Emma Watson (Receptionist)', notes: 'POS machine swipe approved.' },
  { id: 'PAY-006', invoice: 'INV-2023-006', patient: 'Jane Doe', patientId: 'P-1005', date: '27/10/2023', amount: '450.00', method: 'UPI', status: 'Failed', receivedBy: 'System Gateway', notes: 'UPI transaction timed out.' },
  { id: 'PAY-007', invoice: 'INV-2023-007', patient: 'Kavita Menon', patientId: 'P-1008', date: '30/10/2023', amount: '8,190.00', method: 'UPI', status: 'Completed', receivedBy: 'Emma Watson (Receptionist)', notes: 'GPay Transaction #GP-994411' },
  { id: 'PAY-008', invoice: 'INV-2023-008', patient: 'Ananya Sharma', patientId: 'P-1010', date: '27/10/2023', amount: '2,940.00', method: 'Card', status: 'Completed', receivedBy: 'Rajesh Sharma (Accountant)', notes: 'HDFC Bank Visa debit card payment' },
  { id: 'PAY-009', invoice: 'INV-2023-009', patient: 'Arjun Patel', patientId: 'P-1007', date: '26/10/2023', amount: '1,850.00', method: 'Cash', status: 'Completed', receivedBy: 'Devika Nair (Receptionist)', notes: 'Consultation & allergy medication counter cash' },
  { id: 'PAY-010', invoice: 'INV-2023-010', patient: 'Ramesh Kumar', patientId: 'P-1009', date: '26/10/2023', amount: '3,400.00', method: 'UPI', status: 'Completed', receivedBy: 'Emma Watson (Receptionist)', notes: 'PhonePe Ref #PP-442211' },
  { id: 'PAY-011', invoice: 'INV-2023-011', patient: 'Meenakshi Sundaram', patientId: 'P-1012', date: '25/10/2023', amount: '1,500.00', method: 'Card', status: 'Completed', receivedBy: 'Rajesh Sharma (Accountant)', notes: 'ICICI Bank POS terminal swipe' },
  { id: 'PAY-012', invoice: 'INV-2023-012', patient: 'Devraj Sengupta', patientId: 'P-1011', date: '24/10/2023', amount: '950.00', method: 'Cash', status: 'Completed', receivedBy: 'Devika Nair (Receptionist)', notes: 'General checkup & prescription charge' }
];

export const getInitialPayments = (): PaymentRecord[] => {
  try {
    const saved = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: PaymentRecord) => p.id));
        const merged = [...parsed];
        initialPayments.forEach(ip => {
          if (!existingIds.has(ip.id)) {
            merged.push(ip);
          }
        });
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to load payments from storage', e);
  }
  return initialPayments;
};

let currentPayments: PaymentRecord[] = getInitialPayments();
const listeners = new Set<(payments: PaymentRecord[]) => void>();

type PaymentStatusListener = (patientId?: string, patientName?: string, status?: string) => void;
const paymentStatusListeners = new Set<PaymentStatusListener>();

export const registerPaymentStatusListener = (fn: PaymentStatusListener) => {
  paymentStatusListeners.add(fn);
  return () => {
    paymentStatusListeners.delete(fn);
  };
};

const notifyPaymentStatusChange = (patientId?: string, patientName?: string, status?: string) => {
  paymentStatusListeners.forEach(listener => {
    try {
      listener(patientId, patientName, status);
    } catch (e) {
      console.error('Error in payment status listener', e);
    }
  });
};

export const hasPatientCompletedPayment = (patientId?: string, patientName?: string): boolean => {
  const normName = patientName?.toLowerCase().trim();
  const normId = patientId?.toLowerCase().trim();
  return currentPayments.some(p => {
    if (p.status !== 'Completed') return false;
    if (normId && p.patientId && p.patientId.toLowerCase().trim() === normId) return true;
    if (normName && p.patient && p.patient.toLowerCase().trim() === normName) return true;
    return false;
  });
};

const broadcast = () => {
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(currentPayments));
  } catch (e) {
    console.error('Failed to save payments', e);
  }
  listeners.forEach(listener => listener([...currentPayments]));
};

export const updatePaymentRecord = (id: string, updates: Partial<PaymentRecord>) => {
  currentPayments = currentPayments.map(p => {
    if (p.id === id) {
      const updated = { ...p, ...updates };
      if (updates.status) {
        notifyPaymentStatusChange(updated.patientId, updated.patient, updated.status);
      }
      return updated;
    }
    return p;
  });
  broadcast();
};

export const addPaymentRecord = (payment: PaymentRecord) => {
  currentPayments = [payment, ...currentPayments];
  broadcast();
  notifyPaymentStatusChange(payment.patientId, payment.patient, payment.status);
};

export const useSharedPayments = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>(currentPayments);

  useEffect(() => {
    const handleUpdate = (updated: PaymentRecord[]) => {
      setPayments(updated);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    payments,
    updatePayment: updatePaymentRecord,
    addPayment: addPaymentRecord,
    hasCompletedPayment: hasPatientCompletedPayment
  };
};
