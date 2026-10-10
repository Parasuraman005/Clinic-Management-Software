import { mockPatients, mockDoctors, mockAppointments, mockQueue, mockBills, mockPrescriptions, mockUsers, mockNotifications, mockSupportTickets } from '../mockData';
import { initialPayments } from '../hooks/useSharedPayments';

export interface StorageStats {
  patientsCount: number;
  doctorsCount: number;
  appointmentsCount: number;
  queueCount: number;
  billsCount: number;
  paymentsCount: number;
  prescriptionsCount: number;
  usersCount: number;
  notificationsCount: number;
  ticketsCount: number;
  consultationsCount: number;
  drugsCount: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  lastUpdated: string;
}

export const STORAGE_KEYS = {
  PATIENTS: 'medflow_patients_data',
  DOCTORS: 'medflow_doctors_data',
  APPOINTMENTS: 'medflow_appointments_data',
  QUEUE: 'medflow_queue_data_fifo',
  BILLS: 'medflow_bills_data',
  PAYMENTS: 'medflow_payments_data',
  PRESCRIPTIONS: 'medflow_prescriptions',
  USERS: 'medflow_users_data',
  NOTIFICATIONS: 'medflow_notifications_data',
  TICKETS: 'medflow_tickets_data',
  SETTINGS: 'medflow_system_settings',
  CONSULTATIONS: 'medflow_consultations_data',
  DRUGS: 'medflow_drug_catalog',
  REPORTS: 'medflow_reports_preferences',
  COMPLETED_CONSULTATIONS: 'medflow_completed_consultations'
} as const;

/**
 * Initializes and guarantees all JSON collections are seeded in LocalStorage
 */
export const initializeAllLocalStorage = () => {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(mockPatients));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(mockDoctors));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(mockAppointments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUEUE)) {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(mockQueue));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BILLS)) {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(mockBills));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) {
      const legacy = localStorage.getItem('medflow_prescriptions_data');
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, legacy || JSON.stringify(mockPrescriptions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(mockSupportTickets));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONSULTATIONS)) {
      localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DRUGS)) {
      localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify([
        { id: 'd-1', name: 'Paracetamol', dosage: '500mg', type: 'Tablet', category: 'Analgesic', stock: 120 },
        { id: 'd-2', name: 'Amoxicillin', dosage: '250mg', type: 'Capsule', category: 'Antibiotic', stock: 85 },
        { id: 'd-3', name: 'Metformin', dosage: '500mg', type: 'Tablet', category: 'Antidiabetic', stock: 200 },
        { id: 'd-4', name: 'Atorvastatin', dosage: '10mg', type: 'Tablet', category: 'Lipid-lowering', stock: 150 },
        { id: 'd-5', name: 'Cetirizine', dosage: '10mg', type: 'Tablet', category: 'Antihistamine', stock: 95 }
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify({
        activeReport: 'patient',
        dateRange: { start: '2023-10-01', end: '2023-12-31' },
        selectedDoctor: 'all',
        timeframe: 'q4'
      }));
    }
  } catch (e) {
    console.error('Failed to initialize local JSON storage:', e);
  }
};

/**
 * Calculates current real-time LocalStorage JSON metrics
 */
export const getStorageStats = (): StorageStats => {
  let totalBytes = 0;
  const getCount = (key: string, defaultData: any[]): number => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        totalBytes += new Blob([raw]).size;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      // fallback
    }
    return defaultData.length;
  };

  const patientsCount = getCount(STORAGE_KEYS.PATIENTS, mockPatients);
  const doctorsCount = getCount(STORAGE_KEYS.DOCTORS, mockDoctors);
  const appointmentsCount = getCount(STORAGE_KEYS.APPOINTMENTS, mockAppointments);
  const queueCount = getCount(STORAGE_KEYS.QUEUE, mockQueue);
  const billsCount = getCount(STORAGE_KEYS.BILLS, mockBills);
  const paymentsCount = getCount(STORAGE_KEYS.PAYMENTS, initialPayments);
  const prescriptionsCount = getCount(STORAGE_KEYS.PRESCRIPTIONS, mockPrescriptions);
  const usersCount = getCount(STORAGE_KEYS.USERS, mockUsers);
  const notificationsCount = getCount(STORAGE_KEYS.NOTIFICATIONS, mockNotifications);
  const ticketsCount = getCount(STORAGE_KEYS.TICKETS, mockSupportTickets);
  const consultationsCount = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONSULTATIONS);
      if (raw) {
        totalBytes += new Blob([raw]).size;
        const obj = JSON.parse(raw);
        if (typeof obj === 'object' && obj !== null) return Object.keys(obj).length;
      }
    } catch { /* ignore */ }
    return 0;
  })();
  const drugsCount = getCount(STORAGE_KEYS.DRUGS, []);

  const totalSizeFormatted = totalBytes < 1024 
    ? `${totalBytes} Bytes` 
    : totalBytes < 1024 * 1024 
      ? `${(totalBytes / 1024).toFixed(2)} KB` 
      : `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;

  return {
    patientsCount,
    doctorsCount,
    appointmentsCount,
    queueCount,
    billsCount,
    paymentsCount,
    prescriptionsCount,
    usersCount,
    notificationsCount,
    ticketsCount,
    consultationsCount,
    drugsCount,
    totalSizeBytes: totalBytes,
    totalSizeFormatted,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
};

/**
 * Exports all local collections into a structured JSON string backup
 */
export const exportFullDatabaseJson = (): string => {
  const getParsed = (key: string, fallback: any) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const backupPayload = {
    app: 'MedFlow Pro EHR',
    version: '3.4.2',
    exportTimestamp: new Date().toISOString(),
    exportDateFormatted: new Date().toLocaleString(),
    collections: {
      patients: getParsed(STORAGE_KEYS.PATIENTS, mockPatients),
      doctors: getParsed(STORAGE_KEYS.DOCTORS, mockDoctors),
      appointments: getParsed(STORAGE_KEYS.APPOINTMENTS, mockAppointments),
      queue: getParsed(STORAGE_KEYS.QUEUE, mockQueue),
      bills: getParsed(STORAGE_KEYS.BILLS, mockBills),
      payments: getParsed(STORAGE_KEYS.PAYMENTS, initialPayments),
      prescriptions: getParsed(STORAGE_KEYS.PRESCRIPTIONS, mockPrescriptions),
      users: getParsed(STORAGE_KEYS.USERS, mockUsers),
      notifications: getParsed(STORAGE_KEYS.NOTIFICATIONS, mockNotifications),
      tickets: getParsed(STORAGE_KEYS.TICKETS, mockSupportTickets),
      settings: getParsed(STORAGE_KEYS.SETTINGS, null),
      consultations: getParsed(STORAGE_KEYS.CONSULTATIONS, {}),
      drugs: getParsed(STORAGE_KEYS.DRUGS, []),
      reports: getParsed(STORAGE_KEYS.REPORTS, null),
      completedConsultations: getParsed(STORAGE_KEYS.COMPLETED_CONSULTATIONS, [])
    }
  };

  return JSON.stringify(backupPayload, null, 2);
};

/**
 * Downloads a complete JSON backup file to the user's browser
 */
export const downloadDatabaseJsonFile = () => {
  const jsonString = exportFullDatabaseJson();
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `medflow_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Restores all collections from an imported JSON backup file
 */
export const importDatabaseFromJson = (jsonString: string): { success: boolean; message: string; count?: number } => {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON file structure.' };
    }

    const collections = data.collections || data;
    let importedCollectionsCount = 0;

    if (collections.patients && Array.isArray(collections.patients)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(collections.patients));
      importedCollectionsCount++;
    }
    if (collections.doctors && Array.isArray(collections.doctors)) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(collections.doctors));
      importedCollectionsCount++;
    }
    if (collections.appointments && Array.isArray(collections.appointments)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(collections.appointments));
      importedCollectionsCount++;
    }
    if (collections.queue && Array.isArray(collections.queue)) {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(collections.queue));
      importedCollectionsCount++;
    }
    if (collections.bills && Array.isArray(collections.bills)) {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(collections.bills));
      importedCollectionsCount++;
    }
    if (collections.payments && Array.isArray(collections.payments)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(collections.payments));
      importedCollectionsCount++;
    }
    if (collections.prescriptions && Array.isArray(collections.prescriptions)) {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(collections.prescriptions));
      importedCollectionsCount++;
    }
    if (collections.users && Array.isArray(collections.users)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(collections.users));
      importedCollectionsCount++;
    }
    if (collections.notifications && Array.isArray(collections.notifications)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(collections.notifications));
      importedCollectionsCount++;
    }
    if (collections.tickets && Array.isArray(collections.tickets)) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(collections.tickets));
      importedCollectionsCount++;
    }
    if (collections.settings && typeof collections.settings === 'object') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(collections.settings));
      importedCollectionsCount++;
    }
    if (collections.consultations && typeof collections.consultations === 'object') {
      localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(collections.consultations));
      importedCollectionsCount++;
    }
    if (collections.drugs && Array.isArray(collections.drugs)) {
      localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(collections.drugs));
      importedCollectionsCount++;
    }
    if (collections.reports && typeof collections.reports === 'object') {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(collections.reports));
      importedCollectionsCount++;
    }
    if (collections.completedConsultations && Array.isArray(collections.completedConsultations)) {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_CONSULTATIONS, JSON.stringify(collections.completedConsultations));
      importedCollectionsCount++;
    }

    // Trigger local storage event so all hooks update
    window.dispatchEvent(new Event('storage'));

    return { 
      success: true, 
      message: `Successfully imported and restored ${importedCollectionsCount} clinical collections into Local JSON storage.`,
      count: importedCollectionsCount 
    };
  } catch (err) {
    return { success: false, message: `JSON parse error: ${err instanceof Error ? err.message : 'Invalid JSON file'}` };
  }
};

/**
 * Resets all Local JSON storage back to default seed state
 */
export const resetToSeedDatabase = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(mockPatients));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(mockDoctors));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(mockAppointments));
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(mockQueue));
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(mockBills));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(mockPrescriptions));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(mockSupportTickets));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to reset local database', e);
  }
};
