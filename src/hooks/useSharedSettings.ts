import { useState, useEffect, useCallback } from 'react';

export const SETTINGS_STORAGE_KEY = 'medflow_system_settings';
export const SETTINGS_UPDATED_EVENT = 'medflow_settings_updated';

export interface SystemSettings {
  // 1. Clinic Information
  clinicName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  regNumber: string;
  taxNumber: string;

  // 2. Profile & Account
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  designation: string;
  accountBio: string;

  // 3. Appointment Settings
  slotDuration: string;
  bufferTime: string;
  maxOverbooking: string;
  autoConfirm: boolean;
  dailyStartTime: string;
  dailyEndTime: string;

  // 4. Queue Settings
  strictFifo: boolean;
  autoCallNext: boolean;
  maxQueueCapacity: string;
  avgConsultationTime: string;
  displayWaitTime: boolean;

  // 5. Billing & Payment Settings
  currency: string;
  taxRate: string;
  discountCap: string;
  invoicePrefix: string;
  enableUpi: boolean;
  enableCard: boolean;
  enableCash: boolean;

  // 6. Notification Settings
  smsAlerts: boolean;
  emailReports: boolean;
  patientRegistrationToast: boolean;
  queueAudibleBeep: boolean;
  dailyRevenueAlert: boolean;

  // 7. Security & Password
  twoFactorAuth: boolean;
  sessionTimeout: string;
  requireComplexPassword: boolean;

  // 8. System Preferences
  dateFormat: string;
  compactDensity: boolean;
  highContrast: boolean;
  autoRefreshInterval: string;
}

export const defaultSystemSettings: SystemSettings = {
  // 1. Clinic Information
  clinicName: 'MedFlow Pro Healthcare Clinic',
  tagline: 'Evidence-Based Outpatient & Specialty Care',
  phone: '+91 98765-43210',
  email: 'admin@medflowpro.com',
  address: '123 Healthcare Boulevard, Medical District, Bangalore, KA 560001',
  regNumber: 'CLINIC-REG-889922',
  taxNumber: 'GSTIN29AAACM1234F1Z5',

  // 2. Profile & Account
  adminName: 'Dr. Sarah Chen (Chief Administrator)',
  adminEmail: 'sarah.chen@medflow.com',
  adminPhone: '+91 99887-11223',
  designation: 'Medical Director & Administrator',
  accountBio: 'Senior clinical director overseeing hospital throughput, patient experience and electronic medical records.',

  // 3. Appointment Settings
  slotDuration: '20',
  bufferTime: '5',
  maxOverbooking: '2',
  autoConfirm: true,
  dailyStartTime: '09:00 AM',
  dailyEndTime: '06:00 PM',

  // 4. Queue Settings
  strictFifo: true,
  autoCallNext: false,
  maxQueueCapacity: '50',
  avgConsultationTime: '15',
  displayWaitTime: true,

  // 5. Billing & Payment Settings
  currency: 'INR (₹)',
  taxRate: '5',
  discountCap: '15',
  invoicePrefix: 'INV-2023-',
  enableUpi: true,
  enableCard: true,
  enableCash: true,

  // 6. Notification Settings
  smsAlerts: true,
  emailReports: true,
  patientRegistrationToast: true,
  queueAudibleBeep: false,
  dailyRevenueAlert: true,

  // 7. Security & Password
  twoFactorAuth: true,
  sessionTimeout: '30',
  requireComplexPassword: true,

  // 8. System Preferences
  dateFormat: 'DD/MM/YYYY',
  compactDensity: true,
  highContrast: false,
  autoRefreshInterval: '60'
};

export const extractCurrencySymbol = (currencyStr: string = 'INR (₹)'): string => {
  if (!currencyStr) return '₹';
  if (currencyStr.includes('₹') || currencyStr.toUpperCase().includes('INR')) return '₹';
  if (currencyStr.includes('$') || currencyStr.toUpperCase().includes('USD')) return '$';
  if (currencyStr.includes('€') || currencyStr.toUpperCase().includes('EUR')) return '€';
  if (currencyStr.includes('£') || currencyStr.toUpperCase().includes('GBP')) return '£';
  if (currencyStr.includes('¥') || currencyStr.toUpperCase().includes('JPY')) return '¥';
  if (currencyStr.toUpperCase().includes('AED')) return 'AED ';
  const match = currencyStr.match(/\(([^)]+)\)/);
  if (match) return match[1];
  return '₹';
};

export const formatCurrencyAmount = (amount: number, symbol: string = '₹'): string => {
  const num = Number(amount || 0);
  return `${symbol}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const getStoredSystemSettings = (): SystemSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultSystemSettings, ...parsed };
    }
  } catch (err) {
    console.error('Failed reading settings from storage', err);
  }
  return defaultSystemSettings;
};

export const saveSystemSettingsToStorage = (updated: SystemSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch global event for in-tab reactive syncing
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: updated }));
  } catch (err) {
    console.error('Failed saving settings to storage', err);
  }
};

export function useSharedSettings() {
  const [settings, setSettingsState] = useState<SystemSettings>(() => getStoredSystemSettings());

  useEffect(() => {
    // 1. In-tab custom event listener
    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<SystemSettings>;
      if (customEvent.detail) {
        setSettingsState(customEvent.detail);
      } else {
        setSettingsState(getStoredSystemSettings());
      }
    };

    // 2. Cross-tab storage listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettingsState({ ...defaultSystemSettings, ...parsed });
        } catch {
          setSettingsState(getStoredSystemSettings());
        }
      }
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SystemSettings> | ((prev: SystemSettings) => SystemSettings)) => {
    setSettingsState((prev) => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
      saveSystemSettingsToStorage(updated);
      return updated;
    });
  }, []);

  const currencySymbol = extractCurrencySymbol(settings.currency);

  const formatCurrency = useCallback((amount: number) => {
    return formatCurrencyAmount(amount, currencySymbol);
  }, [currencySymbol]);

  return {
    settings,
    updateSettings,
    currencySymbol,
    formatCurrency,
    // Convenience getters
    clinicName: settings.clinicName,
    tagline: settings.tagline,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    regNumber: settings.regNumber,
    taxNumber: settings.taxNumber,
    adminName: settings.adminName,
    designation: settings.designation,
    taxRate: Number(settings.taxRate) || 5,
    slotDuration: Number(settings.slotDuration) || 20,
    dailyHours: `${settings.dailyStartTime} - ${settings.dailyEndTime}`
  };
}
