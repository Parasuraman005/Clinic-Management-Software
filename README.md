# 🏥 MediFlow — Clinic Management Software

> **A modern, responsive clinic management system designed to simplify patient management, appointments, queue handling, medical records, prescriptions, billing, payments, and day-to-day clinic operations.**

![MediFlow](https://img.shields.io/badge/MediFlow-Clinic%20Management-2F6B8F?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)

---

## 📌 Overview

**MediFlow** is a responsive Clinic Management Software designed to bring essential clinic operations into one centralized interface.

The system provides dedicated modules for managing patients, appointments, waiting queues, doctors, consultations, medical records, prescriptions, billing, payments, reports, staff, notifications, and system settings.

The application follows a structured workflow:

**Patient Registration → Appointment → Queue → Consultation → Medical Record → Prescription → Billing → Payment → Follow-up**

The interface is designed to work across **desktop, tablet, and mobile screen sizes**, making it suitable for different clinic environments and workflows.

---

## ✨ Key Features

### 📊 Dashboard

Provides a centralized overview of clinic activity, including:

* Total patients
* Today's appointments
* Waiting patients
* Completed consultations
* Billing information
* Payment activity
* Recent patients
* Recent transactions
* Quick actions

---

### 👤 Patient Management

Manage patient information through a dedicated Patient Directory.

Features include:

* Patient registration
* Patient ID management
* Patient search
* Patient profile
* Personal information
* Emergency/attendant details
* Blood group information
* Medical information
* Appointment history
* Medical records
* Prescription history
* Billing history

---

### 📅 Appointment Management

Manage the complete appointment workflow.

Features include:

* Create appointments
* View appointments
* Appointment calendar
* Day-based appointment view
* Doctor assignment
* Appointment status management
* Rescheduling
* Cancellation
* Appointment details

Supported appointment statuses include:

* Scheduled
* Waiting
* In Consultation
* Completed
* Cancelled
* No Show

---

### 🔢 Queue Management

A dedicated queue-management module for handling patients waiting for consultation.

Features include:

* Add patient to queue
* Patient autocomplete
* Queue number
* FIFO-based queue ordering
* Waiting status
* Call next patient
* Start consultation
* Complete consultation
* Remove patient from queue

The queue is designed around a **First In, First Out (FIFO)** workflow.

---

### 👨‍⚕️ Doctor Management

Manage clinic doctors and their professional information.

Features include:

* Doctor directory
* Register new doctor
* Doctor profile
* Specialization
* Qualification
* Contact information
* Consultation details
* Working schedule
* Doctor search
* Edit doctor
* Delete doctor
* Appointment information

---

### 🩺 Consultation & Medical Records

Provide a structured consultation workflow for recording patient clinical information.

The consultation module supports information such as:

* Chief complaint
* Symptoms
* Vital signs
* Diagnosis
* Clinical findings
* Treatment plan
* Follow-up information
* Consultation notes

Medical records can be organized around the patient's consultation history.

---

### 💊 Prescription Management

Create and manage digital prescriptions.

Prescription information can include:

* Medicine name
* Dosage
* Frequency
* Duration
* Route
* Instructions
* Prescription date
* Doctor
* Patient

---

### 🧾 Billing & Invoicing

Manage clinic billing and invoice-related workflows.

Features include:

* Create bills
* Add services/items
* Quantity
* Unit price
* Discount
* Tax
* Total amount
* Amount paid
* Outstanding balance
* Payment status
* Invoice details

---

### 💳 Payment Management

Track patient payment transactions.

Payment information includes:

* Transaction ID
* Invoice number
* Patient
* Payment date
* Amount
* Payment method
* Payment status
* Received by

Supported payment methods can include:

* Cash
* UPI
* Card
* Bank Transfer
* Other

---

### 📈 Reports

Provide a centralized reporting section for monitoring clinic operations.

Potential reporting areas include:

* Patient statistics
* Appointment statistics
* Queue activity
* Consultation activity
* Billing
* Payments
* Revenue
* Doctor-related statistics

---

### 🔔 Notifications

Centralized notification and alert interface for important clinic activities.

Examples include:

* New appointment
* Appointment updates
* Payment notifications
* Patient-related alerts
* System notifications

---

### 👥 Staff & User Management

Manage users and clinic staff according to their roles.

Supported roles include:

* Administrator
* Doctor
* Receptionist
* Accountant
* Staff

Role-based navigation determines the initial workspace after login.

---

### ⚙️ Settings

Centralized settings interface for configuring the application.

Settings can include:

* Clinic information
* User settings
* Appointment configuration
* Billing configuration
* Notification preferences
* Security settings
* System preferences

---

### 🔐 Role-Based Login

MediFlow starts with a splash screen followed by a role-based login interface.

Available roles:

```text
Administrator
Doctor
Receptionist
Accountant
Staff
```

After authentication, users are directed to an appropriate starting module based on their role.

For example:

```text
Administrator → Dashboard
Doctor        → Queue
Receptionist  → Patients
Accountant    → Billing
Staff         → Dashboard
```

---

## 🖥️ Responsive Design

MediFlow is designed to provide a consistent experience across different screen sizes.

### Desktop

* Sidebar navigation
* Multi-column dashboard
* Detailed tables
* Calendar views
* Expanded forms

### Tablet

* Responsive sidebar
* Adaptive cards
* Responsive forms
* Touch-friendly controls

### Mobile

* Compact navigation
* Single-column forms
* Responsive cards
* Touch-friendly buttons
* Mobile-friendly patient and appointment workflows

---

## 🧭 Application Navigation

```text
Dashboard
│
├── Patients
├── Appointments
├── Queue
├── Doctors
├── Medical Records
├── Prescriptions
├── Billing
├── Payments
├── Reports
│
├── Notifications
├── Staff & Users
│
├── Settings
├── Help & Support
├── About MediFlow
├── Terms & Policies
│
└── Logout
```

---

## 🔄 Core Clinic Workflow

```text
Patient Registration
        ↓
Appointment Booking
        ↓
Patient Check-In
        ↓
Queue Management
        ↓
Call Next Patient
        ↓
Doctor Consultation
        ↓
Medical Record
        ↓
Prescription
        ↓
Billing
        ↓
Payment
        ↓
Invoice / Receipt
        ↓
Follow-Up
```

This workflow is designed to reduce unnecessary navigation and keep patient-related information connected throughout the clinic process.

---

## 🎨 UI & Design

MediFlow follows a clean and professional healthcare dashboard design.

### Design Principles

* Minimal interface
* Clear visual hierarchy
* Responsive layouts
* Consistent spacing
* Professional healthcare styling
* Accessible controls
* Clear status indicators
* Touch-friendly interactions
* Responsive tables and cards
* Consistent icons and buttons

The application uses **Times New Roman** as the primary typography system, with approximately **14px/pt-style sizing for headings and 12px/pt-style sizing for body/interface text**, according to the project's design requirements.

---

## 🧩 Application States

The interface includes dedicated UI states for:

* Loading
* Empty data
* Success
* Error
* Offline / No Internet
* 404 Page
* 500 Server Error
* Confirmation
* Form validation
* Toast notifications

Example messages:

```text
Patient registered successfully.

Appointment booked successfully.

Payment recorded successfully.

No patients found.

No internet connection. Please check your network.

Page Not Found.
```

---

## 🛠️ Technology Stack

### Frontend

* **React 19**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Lucide React**
* **Motion / Framer Motion**

### Development

* TypeScript
* Vite development server
* ESLint/TypeScript type checking workflow

The repository's current package configuration includes React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Motion/Framer Motion, Express, and related tooling.

---

## 📁 Project Structure

```text
Clinic-Management-Software/
│
├── src/
│   ├── components/
│   │   ├── Dashboard
│   │   ├── Patients
│   │   ├── Appointments
│   │   ├── Queue
│   │   ├── Doctors
│   │   ├── Consultation
│   │   ├── Prescription
│   │   ├── Billing
│   │   ├── Payments
│   │   ├── Reports
│   │   ├── Staff
│   │   ├── Settings
│   │   ├── Notifications
│   │   ├── Help
│   │   ├── AboutMediFlow
│   │   ├── TermsPolicies
│   │   ├── LoginPage
│   │   ├── SplashScreen
│   │   └── ...
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── metadata.json
├── bun.lock
└── README.md
```

The current application entry point wires together the major modules, including Dashboard, Patients, Appointments, Queue, Doctors, Consultation, Billing, Reports, Staff, Settings, Notifications, Prescriptions, Payments, Help, About MediFlow, Terms & Policies, Splash Screen, and Login.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Parasuraman005/Clinic-Management-Software.git
```

### 2. Navigate into the project

```bash
cd Clinic-Management-Software
```

### 3. Install dependencies

Using npm:

```bash
npm install
```

Or, if you use Bun:

```bash
bun install
```

### 4. Start the development server

```bash
npm run dev
```

Or:

```bash
bun run dev
```

The project is configured to run the Vite development server on port `3000`.

### 5. Open the application

```text
http://localhost:3000
```

---

## 🏗️ Build for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run the project's TypeScript check:

```bash
npm run lint
```

These scripts are defined in the repository's current `package.json`.

---

## 🔒 Security & Privacy

MediFlow is intended as a clinic-management software project and should be configured appropriately before being used with real patient information.

For a production deployment, additional security measures should be implemented, including:

* Secure authentication
* Role-based authorization
* Encrypted data transmission
* Secure database storage
* Password hashing
* Session management
* Audit logging
* Data backup and recovery
* Access control
* Privacy and regulatory compliance

**Do not use real patient or medical information in development or demonstration environments.**

---

## 🚧 Project Status

**Status: Active Development**

MediFlow is currently being developed as a modern clinic-management platform.

Current focus areas include:

* Responsive UI
* Patient management
* Appointment management
* Queue management
* Doctor management
* Consultation workflow
* Prescription management
* Billing
* Payments
* Reports
* Staff management
* Settings
* Healthcare-oriented UX

Future development can extend the system with a production backend, persistent database, advanced authentication, automated reminders, reporting analytics, document management, and additional clinic integrations.

---

## 🔮 Future Enhancements

Planned or potential improvements include:

* Secure backend API
* Database integration
* JWT/session authentication
* Advanced role-based permissions
* Patient portal
* Doctor portal
* Online appointment booking
* SMS/WhatsApp appointment reminders
* Email notifications
* PDF invoice generation
* Digital prescription PDF
* Advanced financial analytics
* Laboratory management
* Pharmacy/inventory management
* Patient document uploads
* Multi-branch clinic support
* Automated backups
* Audit logs
* Cloud deployment
* PWA/mobile application support

---

## 🎯 Project Objectives

The primary objectives of MediFlow are to:

* Digitize clinic administration.
* Reduce manual patient record management.
* Simplify appointment scheduling.
* Improve patient queue management.
* Organize medical records.
* Simplify prescription management.
* Streamline billing and payment tracking.
* Provide useful operational reports.
* Improve the overall efficiency of clinic staff.
* Provide a responsive interface across desktop, tablet, and mobile devices.

---

## 👨‍💻 Developer

**Parasuraman**

Full Stack Developer
B.E. Computer Science & Engineering
Specialization: Artificial Intelligence & Machine Learning

GitHub:
https://github.com/Parasuraman005

---

## 📄 License

This project is currently intended for **educational, development, and portfolio purposes**.

Add an appropriate open-source license such as MIT if you intend to make the project officially open source.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

**MediFlow — Simplifying Clinic Management, One Workflow at a Time.**
