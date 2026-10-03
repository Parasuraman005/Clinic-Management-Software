import { Patient, Appointment, Doctor, QueueItem, Bill, Prescription, UserAccount, SystemNotification, SupportTicket } from './types';

export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'TKT-1001',
    subject: 'Cannot login with doctor account',
    category: 'Login Problem',
    createdDate: '25/09/2023',
    priority: 'High',
    status: 'Resolved',
    lastUpdated: '26/09/2023'
  },
  {
    id: 'TKT-1002',
    subject: 'Error when saving prescription',
    category: 'Prescription Problem',
    createdDate: '01/10/2023',
    priority: 'Urgent',
    status: 'In Progress',
    lastUpdated: '02/10/2023'
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: 'D-101',
    name: 'Dr. Sarah Chen',
    specialization: 'General Physician',
    qualification: 'MD, MBBS',
    experience: '12 Years',
    availability: 'Mon, Wed, Fri',
    image: '/src/assets/images/doctor_female_professional_1790961100983.jpg',
    status: 'Active',
    phone: '+91 98765-11111',
    email: 'sarah.chen@medflow.com',
    registrationNumber: 'REG-1234567',
    consultationFee: 500.00,
    workingDays: ['Monday', 'Wednesday', 'Friday'],
    workingHours: '09:00 AM - 05:00 PM',
    appointmentDuration: 20
  },
  {
    id: 'D-102',
    name: 'Dr. Michael Roberts',
    specialization: 'Cardiologist',
    qualification: 'MD, FACC',
    experience: '15 Years',
    availability: 'Tue, Thu',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    status: 'Active',
    phone: '+91 98765-22222',
    email: 'michael.r@medflow.com',
    registrationNumber: 'REG-7654321',
    consultationFee: 1500.00,
    workingDays: ['Tuesday', 'Thursday'],
    workingHours: '10:00 AM - 06:00 PM',
    appointmentDuration: 30
  }
];

export const mockUsers: UserAccount[] = [
  {
    id: 'U-001',
    name: 'John Smith',
    username: 'jsmith_admin',
    role: 'Administrator',
    phone: '+91 98765-43210',
    email: 'admin@medflow.com',
    status: 'Active',
    lastLogin: '30/10/2023 08:30 AM',
    department: 'Hospital Administration',
    shift: 'General (09:00 AM - 06:00 PM)',
    employeeId: 'EMP-0101',
    qualification: 'MHA, B.Tech',
    twoFactorEnabled: true,
    accessLevel: 'Super Admin',
    joinedDate: '15/01/2021',
    emergencyContact: '+91 98765-00112'
  },
  {
    id: 'U-002',
    name: 'Emma Watson',
    username: 'ewatson_rec',
    role: 'Receptionist',
    phone: '+91 98765-12345',
    email: 'emma@medflow.com',
    status: 'Active',
    lastLogin: '30/10/2023 09:15 AM',
    department: 'Front Desk & OPD Registration',
    shift: 'Morning (08:00 AM - 04:00 PM)',
    employeeId: 'EMP-0204',
    qualification: 'B.Sc Healthcare Administration',
    twoFactorEnabled: true,
    accessLevel: 'Front Desk',
    joinedDate: '01/06/2022',
    emergencyContact: '+91 98765-33441'
  },
  {
    id: 'U-003',
    name: 'Dr. Sarah Chen',
    username: 'schen_md',
    role: 'Doctor',
    phone: '+91 98765-11111',
    email: 'sarah.chen@medflow.com',
    status: 'Active',
    lastLogin: '30/10/2023 08:45 AM',
    department: 'General Medicine & OPD',
    shift: 'Morning (09:00 AM - 05:00 PM)',
    employeeId: 'EMP-0301',
    qualification: 'MD, MBBS (Gold Medalist)',
    registrationNumber: 'MCI-98442-KA',
    twoFactorEnabled: true,
    accessLevel: 'Clinical Access',
    joinedDate: '10/03/2019',
    emergencyContact: '+91 98765-88990'
  },
  {
    id: 'U-004',
    name: 'Dr. Michael Roberts',
    username: 'mroberts_cardio',
    role: 'Doctor',
    phone: '+91 98765-22222',
    email: 'michael.r@medflow.com',
    status: 'Active',
    lastLogin: '29/10/2023 04:20 PM',
    department: 'Cardiology & Intensive Care',
    shift: 'Rotational (10:00 AM - 06:00 PM)',
    employeeId: 'EMP-0302',
    qualification: 'MD, DM Cardiology, FACC',
    registrationNumber: 'MCI-77112-DEL',
    twoFactorEnabled: true,
    accessLevel: 'Clinical Access',
    joinedDate: '12/08/2020',
    emergencyContact: '+91 98765-44221'
  },
  {
    id: 'U-005',
    name: 'Rajesh Sharma',
    username: 'rsharma_fin',
    role: 'Accountant',
    phone: '+91 98765-55443',
    email: 'accounts@medflow.com',
    status: 'Active',
    lastLogin: '30/10/2023 10:05 AM',
    department: 'Billing & Insurance Claims',
    shift: 'Day Shift (09:30 AM - 06:30 PM)',
    employeeId: 'EMP-0401',
    qualification: 'Chartered Accountant (CA), B.Com',
    twoFactorEnabled: true,
    accessLevel: 'Financial Access',
    joinedDate: '01/02/2021',
    emergencyContact: '+91 98765-77881'
  },
  {
    id: 'U-006',
    name: 'Priya Sundaram',
    username: 'psundaram_nurse',
    role: 'Staff',
    phone: '+91 98765-66778',
    email: 'priya.s@medflow.com',
    status: 'Active',
    lastLogin: '30/10/2023 07:55 AM',
    department: 'Nursing & Triage Station',
    shift: 'Morning Shift (07:30 AM - 03:30 PM)',
    employeeId: 'EMP-0501',
    qualification: 'B.Sc Nursing, Critical Care Cert.',
    registrationNumber: 'INC-RN-44321',
    twoFactorEnabled: false,
    accessLevel: 'Clinical Access',
    joinedDate: '15/09/2022',
    emergencyContact: '+91 98765-99002'
  },
  {
    id: 'U-007',
    name: 'Anand Verma',
    username: 'averma_pharm',
    role: 'Staff',
    phone: '+91 98765-33221',
    email: 'anand.v@medflow.com',
    status: 'On Leave',
    lastLogin: '25/10/2023 06:10 PM',
    department: 'In-House Pharmacy & Dispensing',
    shift: 'Evening Shift (02:00 PM - 10:00 PM)',
    employeeId: 'EMP-0502',
    qualification: 'B.Pharm, D.Pharm',
    registrationNumber: 'PCI-KA-11883',
    twoFactorEnabled: true,
    accessLevel: 'Restricted',
    joinedDate: '05/04/2023',
    emergencyContact: '+91 98765-11223'
  },
  {
    id: 'U-008',
    name: 'Devika Nair',
    username: 'dnair_rec',
    role: 'Receptionist',
    phone: '+91 98765-88776',
    email: 'devika.n@medflow.com',
    status: 'Active',
    lastLogin: '30/10/2023 01:15 PM',
    department: 'Front Desk & OPD Registration',
    shift: 'Afternoon Shift (01:00 PM - 09:00 PM)',
    employeeId: 'EMP-0205',
    qualification: 'Diploma in Hospital PR',
    twoFactorEnabled: true,
    accessLevel: 'Front Desk',
    joinedDate: '10/11/2023',
    emergencyContact: '+91 98765-55667'
  }
];

export const mockNotifications: SystemNotification[] = [
  {
    id: 'N-001',
    title: 'New Appointment Booked',
    message: 'John Anderson (P-1001) has booked a Routine Check-up for 30/10/2023 at 10:30 AM.',
    type: 'appointment_booked',
    status: 'Unread',
    timestamp: '30/10/2023 08:45 AM'
  },
  {
    id: 'N-002',
    title: 'Payment Received',
    message: 'Payment of ₹12,500.00 received from John Anderson (P-1001).',
    type: 'payment_received',
    status: 'Read',
    timestamp: '30/10/2023 11:00 AM'
  },
  {
    id: 'N-003',
    title: 'Appointment Cancelled',
    message: 'Sarah Miller (P-1002) has cancelled their appointment for 31/10/2023.',
    type: 'appointment_cancelled',
    status: 'Unread',
    timestamp: '30/10/2023 09:30 AM'
  },
  {
    id: 'N-004',
    title: 'Follow-up Reminder',
    message: 'Robert Wilson (P-1003) is due for a follow-up consultation in 2 days.',
    type: 'followup_reminder',
    status: 'Unread',
    timestamp: '30/10/2023 07:00 AM'
  },
  {
    id: 'N-005',
    title: 'New Patient Registered',
    message: 'New patient Michael Brown (P-1004) has been added to the system.',
    type: 'patient_registered',
    status: 'Read',
    timestamp: '29/10/2023 04:30 PM'
  }
];

export const mockPatients: Patient[] = [
  {
    id: 'P-1001',
    name: 'John Anderson',
    age: 45,
    gender: 'Male',
    phone: '+91 99887-76655',
    email: 'john.a@example.com',
    lastVisit: '15/09/2023',
    status: 'Active',
    bloodGroup: 'O+',
    address: '123 MG Road, Bangalore, KA',
    allergies: 'None recorded',
    emergencyContact: 'Jane Anderson (+91 99887-55443)',
    insuranceProvider: 'Star Health',
    insuranceNumber: 'SH-998877',
  },
  {
    id: 'P-1002',
    name: 'Sarah Miller',
    age: 32,
    gender: 'Female',
    phone: '+91 88776-65544',
    email: 'sarah.m@example.com',
    lastVisit: '20/09/2023',
    status: 'Active',
    bloodGroup: 'A-',
    address: '456 Residency Road, Bangalore, KA',
    allergies: 'Penicillin, Dust',
    emergencyContact: 'Robert Miller (+91 88776-44332)',
    insuranceProvider: 'ICICI Lombard',
    insuranceNumber: 'IL-112233',
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'A-5001',
    patientId: 'P-1001',
    patientName: 'John Anderson',
    doctorId: 'd1',
    doctorName: 'Dr. Sarah Chen',
    date: '30/09/2023',
    time: '10:30 AM',
    status: 'Completed',
    reason: 'Routine Check-up',
    type: 'Routine Check-up',
    priority: 'Normal',
    paymentStatus: 'Paid',
    notes: 'Patient was early.'
  },
  {
    id: 'A-5002',
    patientId: 'P-1002',
    patientName: 'Sarah Miller',
    doctorId: 'd1',
    doctorName: 'Dr. Sarah Chen',
    date: '01/10/2023',
    time: '09:00 AM',
    status: 'Scheduled',
    reason: 'Follow-up',
    type: 'Follow-up',
    priority: 'Urgent',
    paymentStatus: 'Unpaid',
    notes: 'Follow up on hypertension medication.'
  },
  {
    id: 'A-5003',
    patientId: 'P-1003',
    patientName: 'Robert Wilson',
    doctorId: 'd2',
    doctorName: 'Dr. Michael Roberts',
    date: '01/10/2023',
    time: '11:15 AM',
    status: 'Scheduled',
    reason: 'Chest pain',
    type: 'Emergency',
    priority: 'Emergency',
    paymentStatus: 'Unpaid'
  }
];

export const mockQueue: QueueItem[] = [
  {
    id: 'Q-001',
    patientId: 'P-1005',
    patientName: 'Robert Wilson',
    appointmentId: 'A-5005',
    queueNumber: '01',
    doctorName: 'Dr. Sarah Chen',
    waitingTime: '15 mins',
    priority: 'Normal',
    status: 'Waiting',
  },
  {
    id: 'Q-002',
    patientId: 'P-1006',
    patientName: 'Emily Davis',
    appointmentId: 'A-5006',
    queueNumber: '02',
    doctorName: 'Dr. Sarah Chen',
    waitingTime: '5 mins',
    priority: 'Urgent',
    status: 'In Consultation',
  }
];

export const mockBills: Bill[] = [
  {
    id: 'INV-2023-001',
    patientId: 'P-1001',
    patientName: 'John Anderson',
    date: '30/09/2023',
    amount: 15000.00,
    status: 'Paid',
    items: [
      { description: 'Consultation Fee', price: 1000.00, quantity: 1 },
      { description: 'Blood Test', price: 500.00, quantity: 1 }
    ],
    tax: 1500.00,
    discount: 0,
    total: 16500.00
  }
];

export const mockPrescriptions: Prescription[] = [
  {
    id: 'RX-9901',
    date: '30/09/2023',
    patientId: 'P-1001',
    patientName: 'John Anderson',
    doctorId: 'D-101',
    doctorName: 'Dr. Sarah Chen',
    diagnosis: 'Mild hypertension and seasonal allergies',
    chiefComplaint: 'Occasional headaches and sneezing',
    clinicalNotes: 'Blood pressure slightly elevated at 145/90.',
    medicines: [
      {
        id: 'm1',
        name: 'Lisinopril',
        type: 'Tablet',
        strength: '10mg',
        dosage: '1 Tablet',
        frequency: 'Once Daily (Morning)',
        route: 'Oral',
        duration: '30 Days',
        quantity: '30',
        instructions: 'After food'
      },
      {
        id: 'm2',
        name: 'Loratadine',
        type: 'Tablet',
        strength: '10mg',
        dosage: '1 Tablet',
        frequency: 'As Needed',
        route: 'Oral',
        duration: '14 Days',
        quantity: '14',
        instructions: 'For allergy symptoms'
      }
    ],
    additionalInstructions: 'Take medicines after food. Drink sufficient water. Follow the doctor\'s instructions.',
    followUpRequired: true,
    followUpDate: '15/10/2023',
    followUpInstructions: 'Return if headaches persist.',
    status: 'Active',
    createdAt: '2023-09-30T10:00:00Z',
    updatedAt: '2023-09-30T10:00:00Z'
  }
];

export const mockMedicines = [
  { id: 'M-1', name: 'Paracetamol', type: 'Tablet', strength: '500mg' },
  { id: 'M-2', name: 'Amoxicillin', type: 'Capsule', strength: '250mg' },
  { id: 'M-3', name: 'Ibuprofen', type: 'Tablet', strength: '400mg' },
  { id: 'M-4', name: 'Cetirizine', type: 'Tablet', strength: '10mg' },
  { id: 'M-5', name: 'Metformin', type: 'Tablet', strength: '500mg' },
  { id: 'M-6', name: 'Atorvastatin', type: 'Tablet', strength: '20mg' },
  { id: 'M-7', name: 'Omeprazole', type: 'Capsule', strength: '20mg' },
  { id: 'M-8', name: 'Amlodipine', type: 'Tablet', strength: '5mg' },
  { id: 'M-9', name: 'Azithromycin', type: 'Tablet', strength: '500mg' },
  { id: 'M-10', name: 'Pantoprazole', type: 'Tablet', strength: '400mg' },
];

export const mockServices = [
  { id: 'S-1', name: 'Consultation Fee (GP)', price: 500 },
  { id: 'S-2', name: 'Consultation Fee (Specialist)', price: 1500 },
  { id: 'S-3', name: 'Complete Blood Count (CBC)', price: 450 },
  { id: 'S-4', name: 'Chest X-Ray', price: 850 },
  { id: 'S-5', name: 'ECG / EKG', price: 600 },
  { id: 'S-6', name: 'Lipid Profile', price: 750 },
  { id: 'S-7', name: 'Liver Function Test (LFT)', price: 900 },
  { id: 'S-8', name: 'Urine Analysis', price: 200 },
  { id: 'S-9', name: 'Blood Sugar (Fasting)', price: 100 },
  { id: 'S-10', name: 'Injection Charges', price: 50 },
];
