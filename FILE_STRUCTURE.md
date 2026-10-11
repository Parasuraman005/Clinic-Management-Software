# MedFlow Pro - Complete File and Folder Structure

This document outlines the complete directory structure, components, hooks, utilities, and architecture of the **MedFlow Pro** Enterprise Clinical Operating System and Hospital Management Platform.

---

## 📂 Directory Tree

```text
/
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── server.ts
├── FILE_STRUCTURE.md
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   ├── mockData.ts
│   ├── assets/
│   │   └── images/
│   │       ├── medi-logo.jpg
│   │       └── doctor_female_professional_1790961100983.jpg
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useActivePatientContext.tsx
│   │   ├── useSearchSuggestions.ts
│   │   ├── useSharedDoctors.ts
│   │   ├── useSharedPatients.ts
│   │   ├── useSharedPayments.ts
│   │   ├── useSharedQueue.ts
│   │   ├── useSharedSettings.ts
│   │   └── useSharedUsers.ts
│   ├── utils/
│   │   ├── index.ts
│   │   ├── localJsonStorage.ts
│   │   └── seo.ts
│   └── components/
│       ├── index.ts
│       ├── AboutMediFlow.tsx
│       ├── AddPatient.tsx
│       ├── Appointments.tsx
│       ├── Billing.tsx
│       ├── Consultation.tsx
│       ├── Dashboard.tsx
│       ├── Doctors.tsx
│       ├── Footer.tsx
│       ├── Header.tsx
│       ├── Help.tsx
│       ├── InvoicePrintModal.tsx
│       ├── KeyboardShortcutsModal.tsx
│       ├── LoginPage.tsx
│       ├── NotFound.tsx
│       ├── Notifications.tsx
│       ├── Patients.tsx
│       ├── Payments.tsx
│       ├── Prescription.tsx
│       ├── Queue.tsx
│       ├── Reports.tsx
│       ├── SearchSuggestions.tsx
│       ├── ServerError.tsx
│       ├── Settings.tsx
│       ├── Sidebar.tsx
│       ├── SplashScreen.tsx
│       ├── Staff.tsx
│       ├── TermsPolicies.tsx
│       ├── ThankYou.tsx
│       ├── Toast.tsx
│       └── UpdateModal.tsx
```

---

## 🏗️ Core Architecture & Module Breakdown

### 1. Entry Points & Configuration
- **`src/main.tsx`**: React DOM mounting root entry point.
- **`src/App.tsx`**: Main application state controller handling splash screen, authentication state, global hotkeys (`Alt + D`, `Alt + P`, `Alt + A`, `Alt + Q`, `Alt + C`, `Alt + R`, `Alt + B`, `Alt + N`, `Alt + S`, `Ctrl + K`, `?`), tab routing, and toast container notifications.
- **`src/index.css`**: Tailwind CSS v4 import statement (`@import "tailwindcss";`) and custom global design rules.
- **`metadata.json`**: Applet metadata config (MedFlow Pro).

### 2. State Hooks (`src/hooks/`)
- **`useSharedSettings.ts`**: Reactive hook for global clinic settings (Name, Tagline, Address, Phone, Email, Reg No, Tax/GSTIN, Currency, Tax Rate, Working Hours, Administrator details) with cross-tab and in-tab event syncing.
- **`useSharedPatients.ts`**: Manages patient records across sessions with localStorage persistence.
- **`useSharedDoctors.ts`**: Manages consulting doctors, schedules, and consultation fees.
- **`useSharedQueue.ts`**: Manages real-time FIFO OPD waiting room queue, token allocation, status transitions (Waiting $\rightarrow$ In Consultation $\rightarrow$ Completed).
- **`useSharedPayments.ts`**: Manages payment transactions, ledger history, and settlement statuses.
- **`useActivePatientContext.tsx`**: Context provider tracking currently selected active patient and pending billing items across views.
- **`useSearchSuggestions.ts`**: Global fuzzy search index for patients, doctors, drugs, and navigation tabs.

### 3. Key Components (`src/components/`)
- **`Header.tsx`**: Top navigation header featuring global search (`Ctrl + K`), station status badge, keyboard shortcuts button (`?`), notification drawer toggle, and user profile lockup.
- **`Sidebar.tsx`**: Collapsible/pinned enterprise navigation sidebar with icons, active indicators, and version tag.
- **`Footer.tsx`**: Bottom status bar displaying live date/time, branch location, contact phone, and developer credit.
- **`Dashboard.tsx`**: Command center providing executive KPI cards, quick actions, today's schedule preview, waiting room meter, and collection pulse.
- **`Patients.tsx` & `AddPatient.tsx`**: Comprehensive patient database, medical history archive, intake forms, and vital signs logging.
- **`Appointments.tsx`**: Calendar and list view for OPD slot booking, doctor availability, and fee calculation.
- **`Queue.tsx`**: Live token queue manager with emergency triage priority and status progression.
- **`Consultation.tsx`**: Electronic Medical Record (EMR) workspace for clinical notes, ICD-10 diagnoses, and vital sign recording.
- **`Prescription.tsx`**: NABH-compliant E-Prescription builder with drug catalog search, dosage frequency builders, and dual-format printing.
- **`Billing.tsx` & `InvoicePrintModal.tsx`**: Itemized fee calculator, multi-tender payment processing (UPI, Cards, Cash), tax breakdown (CGST/SGST), and official A4 tax invoice generation with PDF download.
- **`Payments.tsx`**: Financial ledger tracking all paid and pending transactions.
- **`Doctors.tsx`**: Roster manager for specialty physicians, timetables, and consultation fees.
- **`Reports.tsx`**: Institutional analytics, patient volume trends, department revenue velocity, and downloadable reports.
- **`Staff.tsx`**: Role-based access control (RBAC) user list for administrators, doctors, receptionists, and accountants.
- **`Settings.tsx`**: Comprehensive configuration center for clinic metadata, security rules, billing defaults, and local JSON database backup/restore.
- **`KeyboardShortcutsModal.tsx`**: Cheat sheet modal displaying all available keyboard navigation hotkeys.
- **`LoginPage.tsx` & `SplashScreen.tsx`**: Secure role-based login gateway and loading splash screen.

### 4. Utilities (`src/utils/`)
- **`localJsonStorage.ts`**: Local JSON storage engine supporting database export, JSON file import, reset to seed, and storage statistics.
- **`seo.ts`**: Dynamic document title and meta description updater based on active tab.
- **`index.ts`**: Helper formatters for currency, dates, and validation.
