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
];

export const getInitialPayments = (): PaymentRecord[] => {
  try {
    const saved = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load payments from storage', e);
  }
  return initialPayments;
};

let currentPayments: PaymentRecord[] = getInitialPayments();
const listeners = new Set<(payments: PaymentRecord[]) => void>();

const broadcast = () => {
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(currentPayments));
  } catch (e) {
    console.error('Failed to save payments', e);
  }
  listeners.forEach(listener => listener([...currentPayments]));
};

export const updatePaymentRecord = (id: string, updates: Partial<PaymentRecord>) => {
  currentPayments = currentPayments.map(p => p.id === id ? { ...p, ...updates } : p);
  broadcast();
};

export const addPaymentRecord = (payment: PaymentRecord) => {
  currentPayments = [payment, ...currentPayments];
  broadcast();
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
    addPayment: addPaymentRecord
  };
};
