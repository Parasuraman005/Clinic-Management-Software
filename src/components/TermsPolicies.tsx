import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Scale, AlertTriangle, 
  CheckCircle2, Printer, X, ChevronRight,
  Stethoscope, Receipt
} from 'lucide-react';

interface TermsPoliciesProps {
  onClose?: () => void;
  isModal?: boolean;
}

const TermsPolicies: React.FC<TermsPoliciesProps> = ({ onClose, isModal = false }) => {
  const [activeSection, setActiveSection] = useState<'clinical' | 'privacy' | 'prescribing' | 'billing' | 'security'>('clinical');

  const sections = [
    { id: 'clinical', title: 'Clinical Governance & EULA', icon: Scale },
    { id: 'privacy', title: 'EHR Privacy & Patient Consent', icon: Lock },
    { id: 'prescribing', title: 'Schedule Medication & Rx Safety', icon: Stethoscope },
    { id: 'billing', title: 'Billing, Tariff & GST Policy', icon: Receipt },
    { id: 'security', title: 'Access Control & Audit Trails', icon: ShieldCheck }
  ];

  const handlePrintPolicy = () => {
    window.print();
  };

  return (
    <div className={`font-serif ${isModal ? 'p-0' : 'space-y-8 animate-in fade-in duration-300 pb-16'}`}>
      {/* Header Container */}
      <div className="bg-slate-900 text-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-medical-primary">
            <Scale size={14} />
            Institutional Governance & Legal Architecture
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrintPolicy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-sans font-bold text-slate-200 transition-colors"
              title="Print Policy Document"
            >
              <Printer size={14} />
              Print Policy
            </button>
            {isModal && onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Terms & Clinical Policies</h1>
          <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
            Institutional terms of service, patient data protection mandates, electronic health records governance, and statutory medical compliance standards for MediFlow Pro.
          </p>
          <div className="flex items-center gap-3 pt-2 text-[11px] font-sans text-slate-400">
            <span>Effective Date: 01 October 2023</span>
            <span>·</span>
            <span>Last Audited: October 2026</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold">Statutory Compliant</span>
          </div>
        </div>
      </div>

      {/* Main Content with Navigation Sidebar & Policy Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
              Policy Modules
            </p>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-sans font-bold transition-all ${
                    isActive 
                      ? 'bg-medical-primary text-white shadow-xs' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{sec.title}</span>
                  </div>
                  <ChevronRight size={14} className={isActive ? 'text-white' : 'text-slate-300'} />
                </button>
              );
            })}
          </div>

          {/* Quick Notice Card */}
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 space-y-2 font-sans text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              Statutory Clinical Duty
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800/90">
              All registered medical practitioners and nursing staff using MediFlow Pro are legally responsible for verifying clinical dosages, patient allergy histories, and ensuring valid patient identity confirmation prior to treatment.
            </p>
          </div>
        </div>

        {/* Policy Detail Body (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 font-sans">
          {activeSection === 'clinical' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-medical-primary">Section 1.0</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Clinical Governance & System License (EULA)</h2>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>1.1 Authorized Clinical Access:</strong> Access to the MediFlow Pro platform is strictly limited to authorized healthcare personnel with verified medical credentials or administrative assignments granted by hospital governance. Credentials are personal, non-transferable, and subject to automatic revocation upon separation.
                </p>
                <p>
                  <strong>1.2 Clinical Autonomy & Final Decision:</strong> While MediFlow Pro provides dosage guidance, ICD-10 suggestions, and allergy alerts, the attending registered physician maintains 100% legal, diagnostic, and ethical autonomy over all diagnoses, treatment orders, and surgical referrals.
                </p>
                <p>
                  <strong>1.3 Electronic Signature & Timestamping:</strong> Consultations, prescriptions, and lab orders finalized within the system carry cryptographic timestamps and are legally recognized under the Information Technology Act and National Medical Commission guidelines.
                </p>
                <p>
                  <strong>1.4 Downtime & Emergency Protocols:</strong> In the rare event of local hardware or power interruptions, clinical staff must initiate the physical Paper Backup Protocol immediately, with subsequent electronic reconciliation within 12 hours of system restoration.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Applicable Regulation: Indian Medical Council (Professional Conduct) Regulations</span>
                <span className="text-[11px] font-bold text-emerald-600">Verified</span>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-medical-primary">Section 2.0</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Electronic Health Records (EHR) Privacy & Patient Consent</h2>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>2.1 Patient Data Confidentiality:</strong> All patient protected health information (PHI), including demographic records, contact details (+91), vital signs, diagnostic imaging, and consultation notes are classified as strictly confidential under the Digital Information Security in Healthcare Act (DISHA) and Digital Personal Data Protection Act.
                </p>
                <p>
                  <strong>2.2 Explicit Patient Consent:</strong> Explicit or implied consent must be established prior to registration, diagnostic testing, or transmission of medical reports via electronic channels (SMS, WhatsApp API, or Email). Patients reserve the statutory right to request digital copies of their health records.
                </p>
                <p>
                  <strong>2.3 Zero-Third-Party Commercialization:</strong> MediFlow Pro does not sell, lease, or monetize anonymized or identifiable patient records to pharmaceutical companies, insurance underwriters, or advertisers.
                </p>
                <p>
                  <strong>2.4 Retention Period:</strong> Outpatient and inpatient clinical records are securely retained for a minimum statutory period of seven (7) years from the last consultation date, in full accordance with national healthcare archival directives.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 text-xs text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Encrypted with AES-256 at rest and transmitted strictly via TLS 1.3 cryptographic protocols.</span>
              </div>
            </div>
          )}

          {activeSection === 'prescribing' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-medical-primary">Section 3.0</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Schedule Medication & E-Prescription Safety Protocols</h2>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>3.1 Schedule H & X Compliance:</strong> Electronic orders for Schedule H, H1, and Schedule X pharmaceuticals (antibiotics, sedatives, controlled substances) require mandatory physician identity validation and state medical council registration number inclusion on printed and digital outputs.
                </p>
                <p>
                  <strong>3.2 Generic Drug Name Mandate:</strong> In accordance with National Medical Commission directives, physicians are prompted to specify international generic pharmaceutical names alongside proprietary brand names to ensure patient affordability.
                </p>
                <p>
                  <strong>3.3 Allergy & Drug Interaction Screening:</strong> The system automatically flags reported drug allergies (e.g. Penicillin, NSAIDs) recorded in the patient dossier. Physicians overriding alerts must record written clinical justification in the session notes.
                </p>
                <p>
                  <strong>3.4 Prescription Tamper-Evidence:</strong> All generated prescriptions feature a unique identifier code and issuing clinic credentials to prevent illicit re-dispensing or alterations.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-medical-primary">Section 4.0</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Financial Operations, Tariff Transparency & GST Billing</h2>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>4.1 Currency Standard:</strong> All financial entries, fee schedules, consultation charges, pathology rates, and payment receipts are denominated in Indian Rupees (₹ INR).
                </p>
                <p>
                  <strong>4.2 Itemized Transparency:</strong> Invoices must explicitly delineate doctor consultation fees, diagnostic investigations, pharmacy charges, and applicable Goods and Services Tax (GST) compliant line items.
                </p>
                <p>
                  <strong>4.3 Multi-Tender Reconciliation:</strong> Digital receipts generated for Cash, POS Debit/Credit cards, or UPI QR code transfers are reconciled against official daily registers. Unpaid or partial balance accounts are tracked with automated alerts.
                </p>
                <p>
                  <strong>4.4 Refund Policy:</strong> Consultation fees for appointments cancelled by the clinic or physician are refunded 100% via the original payment method within 3 business days. Completed medical consultations and executed laboratory tests are non-refundable.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-medical-primary">Section 5.0</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Access Control, Role-Based Privileges & Audit Logs</h2>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>5.1 Role-Based Access Control (RBAC):</strong> User accounts are partitioned strictly into five operational tiers: Administrator, Doctor, Receptionist, Accountant, and Staff. No role is permitted access outside its predefined operational scope.
                </p>
                <p>
                  <strong>5.2 Immutable Audit Logging:</strong> Every record creation, clinical edit, patient data export, and payment modification triggers an indelible audit trail recording user ID, timestamp, and IP address.
                </p>
                <p>
                  <strong>5.3 Session Security & Timeout:</strong> User workstations automatically terminate active sessions following 15 minutes of idle time at nursing stations and clinical consult desks to prevent unauthorized observation.
                </p>
                <p>
                  <strong>5.4 Credential Governance:</strong> Passwords must contain a minimum of 8 characters with alphanumeric complexity and require mandatory rotation every 90 days.
                </p>
              </div>
            </div>
          )}

          {/* Footer of the policy page */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
            <span>MediFlow Pro Compliance Office · Bengaluru, India</span>
            <span className="font-bold text-slate-700">For Legal Inquiries: legal@medflowpro.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPolicies;
