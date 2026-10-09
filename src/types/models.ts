export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  lastVisit: string;
  status: 'Active' | 'Inactive';
  bloodGroup: string;
  address: string;
  allergies: string;
  emergencyContact: string;
  insuranceProvider: string;
  insuranceNumber: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No Show';
  reason: string;
  type: 'New Consultation' | 'Follow-up' | 'Emergency' | 'Routine Check-up' | 'Procedure' | 'Review';
  priority: 'Normal' | 'Urgent' | 'Emergency';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: string;
  availability: string;
  image: string;
  status: 'Active' | 'Away';
  phone: string;
  email: string;
  registrationNumber: string;
  consultationFee: number;
  workingDays: string[];
  workingHours: string;
  appointmentDuration: number; // in minutes
}

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  role: 'Administrator' | 'Doctor' | 'Receptionist' | 'Accountant' | 'Staff';
  phone: string;
  email: string;
  status: 'Active' | 'Disabled' | 'On Leave';
  lastLogin: string;
  password?: string;
  department?: string;
  shift?: string;
  employeeId?: string;
  qualification?: string;
  registrationNumber?: string;
  avatar?: string;
  photoUrl?: string;
  age?: number;
  bloodGroup?: string;
  address?: string;
  twoFactorEnabled?: boolean;
  accessLevel?: string;
  joinedDate?: string;
  emergencyContact?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'appointment_booked' | 'appointment_reminder' | 'appointment_cancelled' | 'payment_received' | 'payment_pending' | 'followup_reminder' | 'patient_registered';
  status: 'Read' | 'Unread';
  timestamp: string;
}

export interface QueueItem {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  queueNumber: string;
  doctorName: string;
  waitingTime: string;
  priority: 'Normal' | 'Urgent' | 'Emergency';
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Skipped';
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: { description: string; price: number; quantity: number }[];
  tax: number;
  discount: number;
  total: number;
}

export interface Prescription {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  chiefComplaint: string;
  clinicalNotes: string;
  medicines: PrescriptionMedicine[];
  additionalInstructions: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpInstructions?: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  type?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  durationDays?: number | string;
  quantity?: string;
  instructions?: string;
  foodTiming?: 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach' | string;
  morning?: string | number;
  lunch?: string | number;
  evening?: string | number;
  dinner?: string | number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Login Problem' | 'Patient Management' | 'Appointment Problem' | 'Prescription Problem' | 'Billing Problem' | 'Payment Problem' | 'Report Problem' | 'Technical Issue' | 'Other';
  createdDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting for Response' | 'Resolved' | 'Closed';
  lastUpdated: string;
}
