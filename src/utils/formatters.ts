/**
 * Standard Phone & Currency Formatters for MedFlow Clinic Management Software
 * Enforces Indian Country Code (+91) and Indian Rupee (INR / ₹) across the application.
 */

export const formatIndianPhone = (ph: string | undefined | null): string => {
  if (!ph) return '+91 ';
  const trimmed = ph.trim();
  if (!trimmed) return '+91 ';

  // Extract pure digits
  const digits = trimmed.replace(/\D/g, '');

  // If starts with 91 and has 12 digits
  if (digits.startsWith('91') && digits.length === 12) {
    const raw = digits.slice(2);
    return `+91 ${raw.slice(0, 5)}-${raw.slice(5)}`;
  }

  // If exactly 10 digits
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  // If already starts with +91
  if (trimmed.startsWith('+91')) {
    // Check if rest has 10 digits
    const restDigits = trimmed.replace('+91', '').replace(/\D/g, '');
    if (restDigits.length === 10) {
      return `+91 ${restDigits.slice(0, 5)}-${restDigits.slice(5)}`;
    }
    return trimmed;
  }

  // If starts with + (e.g. international), replace with +91
  if (trimmed.startsWith('+')) {
    const withoutCode = trimmed.replace(/^\+\d+\s*/, '');
    const cleanDigits = withoutCode.replace(/\D/g, '');
    if (cleanDigits.length === 10) {
      return `+91 ${cleanDigits.slice(0, 5)}-${cleanDigits.slice(5)}`;
    }
    return `+91 ${withoutCode}`;
  }

  return `+91 ${trimmed}`;
};

export const formatINR = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatINRLac = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};
