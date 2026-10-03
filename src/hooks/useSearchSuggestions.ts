import { useMemo } from 'react';
import { getInitialPatients } from './useSharedPatients';
import { getInitialDoctors } from './useSharedDoctors';
import { mockUsers, mockAppointments, mockBills, mockPrescriptions, mockMedicines, mockServices } from '../mockData';
import { SuggestionItem } from '../components/SearchSuggestions';

export type SuggestionType = 'patient' | 'doctor' | 'staff' | 'appointment' | 'billing' | 'prescription' | 'medicine' | 'service';

export const useSearchSuggestions = (query: string, allowedTypes?: SuggestionType[]) => {
  const suggestions = useMemo(() => {
    if (!query || query.trim().length < 1) return [];

    const q = query.toLowerCase().trim();
    const results: SuggestionItem[] = [];

    const isAllowed = (type: SuggestionType) => {
      if (!allowedTypes || allowedTypes.length === 0) return true;
      return allowedTypes.includes(type);
    };

    // 1. Search Patients (From dynamic registered patient store)
    if (isAllowed('patient')) {
      const activePatients = getInitialPatients();
      activePatients.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) {
          results.push({
            id: p.id,
            title: p.name,
            subtitle: `ID: ${p.id} • ${p.age}Y (${p.gender}) • ${p.phone}`,
            type: 'patient',
            tab: 'patients',
            payload: p
          });
        }
      });
    }

    // 2. Search Doctors (From dynamic registered doctor store)
    if (isAllowed('doctor')) {
      const activeDoctors = getInitialDoctors();
      activeDoctors.forEach(d => {
        if (d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)) {
          results.push({
            id: d.id,
            title: d.name,
            subtitle: `${d.specialization} • Fee: ₹${d.consultationFee} INR`,
            type: 'doctor',
            tab: 'doctors',
            payload: d
          });
        }
      });
    }

    // 3. Search Staff
    if (isAllowed('staff')) {
      mockUsers.forEach(u => {
        if (u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)) {
          results.push({ id: u.id, title: u.name, subtitle: u.role, type: 'staff', tab: 'staff' });
        }
      });
    }

    // 4. Search Appointments
    if (isAllowed('appointment')) {
      mockAppointments.forEach(a => {
        if (a.patientName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) {
          results.push({ id: a.id, title: `Apt: ${a.patientName}`, subtitle: `${a.date} at ${a.time}`, type: 'appointment', tab: 'appointments' });
        }
      });
    }

    // 5. Search Bills
    if (isAllowed('billing')) {
      mockBills.forEach(b => {
        if (b.patientName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)) {
          results.push({ id: b.id, title: `Bill: ${b.patientName}`, subtitle: `Total: ₹${b.total} INR`, type: 'billing', tab: 'billing' });
        }
      });
    }

    // 6. Search Prescriptions
    if (isAllowed('prescription')) {
      mockPrescriptions.forEach(pr => {
        if (pr.patientName.toLowerCase().includes(q) || pr.id.toLowerCase().includes(q)) {
          results.push({ id: pr.id, title: `Rx: ${pr.patientName}`, subtitle: pr.diagnosis, type: 'prescription', tab: 'prescriptions' });
        }
      });
    }

    // 7. Search Medicines (Only when explicitly allowed or general)
    if (isAllowed('medicine')) {
      mockMedicines.forEach(m => {
        if (m.name.toLowerCase().includes(q)) {
          results.push({ id: m.id, title: m.name, subtitle: `${m.type} • ${m.strength}`, type: 'medicine', payload: m });
        }
      });
    }

    // 8. Search Services (Only when explicitly allowed or general)
    if (isAllowed('service')) {
      mockServices.forEach(s => {
        if (s.name.toLowerCase().includes(q)) {
          results.push({ id: s.id, title: s.name, subtitle: `₹${s.price} INR`, type: 'service', payload: s });
        }
      });
    }

    // 9. Search System & Governance Pages
    if ('about mediflow'.includes(q) || 'mediflow'.includes(q) || 'version'.includes(q)) {
      results.push({ id: 'sys-about', title: 'About MediFlow Pro', subtitle: 'Platform Architecture & Accreditations', type: 'service', tab: 'about' });
    }
    if ('terms'.includes(q) || 'policies'.includes(q) || 'privacy'.includes(q) || 'governance'.includes(q)) {
      results.push({ id: 'sys-policies', title: 'Terms & Clinical Policies', subtitle: 'EHR Privacy, Prescribing & Governance', type: 'service', tab: 'policies' });
    }
    if ('help'.includes(q) || 'support'.includes(q) || 'faq'.includes(q) || 'ticket'.includes(q)) {
      results.push({ id: 'sys-help', title: 'Help & Clinical Support', subtitle: 'Module Guides, Diagnostics & Desk', type: 'service', tab: 'help' });
    }

    return results.slice(0, 10);
  }, [query, allowedTypes]);

  return suggestions;
};
