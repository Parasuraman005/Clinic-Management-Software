import { useState, useEffect } from 'react';
import { QueueItem, Patient } from '../types';

export interface ExtendedQueueItem extends QueueItem {
  addedTime: string;
  entryTimestamp: number;
}

const STORAGE_KEY = 'medflow_queue_data_fifo';

const defaultQueue: ExtendedQueueItem[] = [
  {
    id: 'Q-001',
    patientId: 'P-1001',
    patientName: 'John Anderson',
    appointmentId: 'A-5001',
    queueNumber: '01',
    doctorName: 'Dr. Sarah Chen',
    waitingTime: '15 mins',
    priority: 'Normal',
    status: 'Waiting',
    addedTime: '09:30 AM',
    entryTimestamp: Date.now() - 15 * 60 * 1000
  },
  {
    id: 'Q-002',
    patientId: 'P-1002',
    patientName: 'Sarah Miller',
    appointmentId: 'A-5002',
    queueNumber: '02',
    doctorName: 'Dr. Sarah Chen',
    waitingTime: '5 mins',
    priority: 'Urgent',
    status: 'In Consultation',
    addedTime: '09:45 AM',
    entryTimestamp: Date.now() - 5 * 60 * 1000
  }
];

const getInitialQueue = (): ExtendedQueueItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce FIFO order by entry timestamp
        return parsed.sort((a, b) => (a.entryTimestamp || 0) - (b.entryTimestamp || 0));
      }
    }
  } catch (e) {
    console.error('Failed to load queue from storage', e);
  }
  return defaultQueue;
};

let currentQueue: ExtendedQueueItem[] = getInitialQueue();
const listeners = new Set<(queue: ExtendedQueueItem[]) => void>();

const broadcast = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentQueue));
  } catch (e) {
    console.error('Failed to save queue', e);
  }
  listeners.forEach(listener => listener([...currentQueue]));
};

export const addPatientToQueue = (
  patient: Partial<Patient> & { name: string; id?: string },
  options?: { doctorName?: string; priority?: 'Normal' | 'Urgent' | 'Emergency' }
) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // In FIFO, next queue number is current length + 1 or max queueNumber + 1
  const nextNum = currentQueue.length > 0 
    ? Math.max(...currentQueue.map(q => parseInt(q.queueNumber) || 0)) + 1 
    : 1;

  const newItem: ExtendedQueueItem = {
    id: `Q-${Date.now().toString().slice(-4)}`,
    queueNumber: nextNum.toString().padStart(2, '0'),
    patientName: patient.name,
    patientId: patient.id || `P-${Math.floor(1000 + Math.random() * 9000)}`,
    appointmentId: `A-${Math.floor(5000 + Math.random() * 5000)}`,
    doctorName: options?.doctorName || 'Dr. Sarah Chen',
    waitingTime: '0 mins',
    priority: options?.priority || 'Normal',
    status: 'Waiting',
    addedTime: timeStr,
    entryTimestamp: Date.now()
  };

  // Strict FIFO: Append to the END of the queue!
  currentQueue = [...currentQueue.filter(q => q.patientId !== newItem.patientId), newItem];
  broadcast();
  return newItem;
};

export const updateQueueItemStatus = (id: string, status: QueueItem['status']) => {
  currentQueue = currentQueue.map(item => item.id === id ? { ...item, status } : item);
  broadcast();
};

export const removeQueueItem = (id: string) => {
  currentQueue = currentQueue.filter(item => item.id !== id);
  broadcast();
};

export const clearQueueExceptAdded = (patientId?: string) => {
  if (patientId) {
    currentQueue = currentQueue.filter(item => item.patientId === patientId);
  }
  broadcast();
};

export const useSharedQueue = () => {
  const [queue, setQueue] = useState<ExtendedQueueItem[]>(currentQueue);

  useEffect(() => {
    const handleUpdate = (updatedQueue: ExtendedQueueItem[]) => {
      setQueue(updatedQueue);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    queue,
    addToQueue: addPatientToQueue,
    updateStatus: updateQueueItemStatus,
    removeItem: removeQueueItem,
    clearExcept: clearQueueExceptAdded
  };
};
