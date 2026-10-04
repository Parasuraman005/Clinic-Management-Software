import { useMemo } from 'react';
import { getInitialPatients } from './useSharedPatients';
import { getInitialDoctors } from './useSharedDoctors';
import { mockUsers, mockAppointments, mockBills, mockPrescriptions, mockMedicines, mockServices } from '../mockData';
import { SuggestionItem } from '../components/SearchSuggestions';

export type SuggestionType = 'patient' | 'doctor' | 'staff' | 'appointment' | 'billing' | 'prescription' | 'medicine' | 'service';

interface ScoredSuggestion {
  item: SuggestionItem;
  score: number;
}

/**
 * Calculates a strict relevance score for a given target string against query q.
 * Returns 0 if no relevant match is found.
 */
const getRelevanceScore = (target: string, q: string): number => {
  if (!target || !q) return 0;
  const lowerTarget = target.toLowerCase().trim();
  const lowerQuery = q.toLowerCase().trim();

  // 1. Exact match
  if (lowerTarget === lowerQuery) return 100;

  // 2. Starts with query (Prefix match on whole string)
  if (lowerTarget.startsWith(lowerQuery)) return 80;

  // 3. Word starts with query (e.g., "Ramesh Kumar" matches "Ku" with score 70)
  const words = lowerTarget.split(/[\s\-_\/]+/);
  const wordPrefixMatch = words.some(w => w.startsWith(lowerQuery));
  if (wordPrefixMatch) return 70;

  // 4. Substring match (only allowed if query is 2+ chars to prevent 1-char noise)
  if (lowerQuery.length >= 2 && lowerTarget.includes(lowerQuery)) {
    return 40;
  }

  return 0;
};

export const useSearchSuggestions = (query: string, allowedTypes?: SuggestionType[]) => {
  const suggestions = useMemo(() => {
    if (!query || query.trim().length === 0) return [];

    const q = query.toLowerCase().trim();
    const scoredResults: ScoredSuggestion[] = [];

    const isAllowed = (type: SuggestionType) => {
      if (!allowedTypes || allowedTypes.length === 0) return true;
      return allowedTypes.includes(type);
    };

    // 1. Search Patients (From dynamic registered patient store)
    if (isAllowed('patient')) {
      const activePatients = getInitialPatients();
      activePatients.forEach(p => {
        const nameScore = getRelevanceScore(p.name, q);
        const idScore = getRelevanceScore(p.id, q);
        const phoneScore = p.phone ? getRelevanceScore(p.phone.replace(/\D/g, ''), q.replace(/\D/g, '')) : 0;
        const maxScore = Math.max(nameScore, idScore, phoneScore);

        if (maxScore > 0) {
          scoredResults.push({
            score: maxScore + 10, // Give high priority to patient records
            item: {
              id: p.id,
              title: p.name,
              subtitle: `ID: ${p.id} • ${p.age}Y (${p.gender}) • ${p.phone}`,
              type: 'patient',
              tab: 'patients',
              payload: p
            }
          });
        }
      });
    }

    // 2. Search Doctors (From dynamic registered doctor store)
    if (isAllowed('doctor')) {
      const activeDoctors = getInitialDoctors();
      activeDoctors.forEach(d => {
        const nameScore = getRelevanceScore(d.name, q);
        const specScore = getRelevanceScore(d.specialization, q);
        const idScore = getRelevanceScore(d.id, q);
        const maxScore = Math.max(nameScore, specScore, idScore);

        if (maxScore > 0) {
          scoredResults.push({
            score: maxScore + 5,
            item: {
              id: d.id,
              title: d.name,
              subtitle: `${d.specialization} • Fee: ₹${d.consultationFee} INR`,
              type: 'doctor',
              tab: 'doctors',
              payload: d
            }
          });
        }
      });
    }

    // 3. Search Staff
    if (isAllowed('staff')) {
      mockUsers.forEach(u => {
        const nameScore = getRelevanceScore(u.name, q);
        const roleScore = getRelevanceScore(u.role, q);
        const maxScore = Math.max(nameScore, roleScore);

        if (maxScore > 0) {
          scoredResults.push({
            score: maxScore,
            item: { id: u.id, title: u.name, subtitle: u.role, type: 'staff', tab: 'staff' }
          });
        }
      });
    }

    // 4. Search Appointments
    if (isAllowed('appointment')) {
      mockAppointments.forEach(a => {
        const nameScore = getRelevanceScore(a.patientName, q);
        const idScore = getRelevanceScore(a.id, q);
        const maxScore = Math.max(nameScore, idScore);

        if (maxScore > 0) {
          scoredResults.push({
            score: maxScore,
            item: { id: a.id, title: `Apt: ${a.patientName}`, subtitle: `${a.date} at ${a.time}`, type: 'appointment', tab: 'appointments' }
          });
        }
      });
    }

    // 5. Search Bills
    if (isAllowed('billing')) {
      mockBills.forEach(b => {
        const nameScore = getRelevanceScore(b.patientName, q);
        const idScore = getRelevanceScore(b.id, q);
        const maxScore = Math.max(nameScore, idScore);

        if (maxScore > 0) {
          scoredResults.push({
            score: maxScore,
            item: { id: b.id, title: `Bill: ${b.patientName}`, subtitle: `Total: ₹${b.total} INR`, type: 'billing', tab: 'billing' }
          });
        }
      });
    }

    // 6. Search Prescriptions
    if (isAllowed('prescription')) {
      mockPrescriptions.forEach(pr => {
        const nameScore = getRelevanceScore(pr.patientName, q);
        const diagScore = getRelevanceScore(pr.diagnosis, q);
        const idScore = getRelevanceScore(pr.id, q);
        const maxScore = Math.max(nameScore, diagScore, idScore);

        if (maxScore > 0) {
          scoredResults.push({
            score: maxScore,
            item: { id: pr.id, title: `Rx: ${pr.patientName}`, subtitle: pr.diagnosis, type: 'prescription', tab: 'prescriptions' }
          });
        }
      });
    }

    // 7. Search Medicines
    if (isAllowed('medicine')) {
      mockMedicines.forEach(m => {
        const score = getRelevanceScore(m.name, q);
        if (score > 0) {
          scoredResults.push({
            score: score,
            item: { id: m.id, title: m.name, subtitle: `${m.type} • ${m.strength}`, type: 'medicine', payload: m }
          });
        }
      });
    }

    // 8. Search Services
    if (isAllowed('service')) {
      mockServices.forEach(s => {
        const score = getRelevanceScore(s.name, q);
        if (score > 0) {
          scoredResults.push({
            score: score,
            item: { id: s.id, title: s.name, subtitle: `₹${s.price} INR`, type: 'service', payload: s }
          });
        }
      });
    }

    // 9. Search System Pages (Only when explicitly matched by keywords of 3+ chars)
    if (!allowedTypes || allowedTypes.length === 0) {
      if (q.length >= 3) {
        if ('about mediflow'.startsWith(q) || 'mediflow pro'.startsWith(q) || q === 'about' || q === 'mediflow') {
          scoredResults.push({
            score: 50,
            item: { id: 'sys-about', title: 'About MediFlow Pro', subtitle: 'Platform Architecture & Accreditations', type: 'service', tab: 'about' }
          });
        }
        if ('terms & clinical policies'.toLowerCase().includes(q) || q.startsWith('term') || q.startsWith('polic') || q.startsWith('privac') || q.startsWith('governan')) {
          scoredResults.push({
            score: 50,
            item: { id: 'sys-policies', title: 'Terms & Clinical Policies', subtitle: 'EHR Privacy, Prescribing & Governance', type: 'service', tab: 'policies' }
          });
        }
        if ('help & clinical support'.toLowerCase().includes(q) || q.startsWith('help') || q.startsWith('supp') || q.startsWith('ticket') || q.startsWith('desk')) {
          scoredResults.push({
            score: 50,
            item: { id: 'sys-help', title: 'Help & Clinical Support', subtitle: 'Module Guides, Diagnostics & Desk', type: 'service', tab: 'help' }
          });
        }
      }
    }

    // Sort strictly by relevance score descending
    scoredResults.sort((a, b) => b.score - a.score);

    // Return top 8 matching related suggestions
    return scoredResults.map(r => r.item).slice(0, 8);
  }, [query, allowedTypes]);

  return suggestions;
};
