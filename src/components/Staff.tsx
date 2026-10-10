import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, 
  Mail, Phone, Key, Eye, 
  Trash2, CheckCircle2, Droplets, MapPin,
  ShieldCheck, AlertCircle, ArrowLeft,
  Download, LayoutGrid, List,
  Receipt, X, Lock, Upload, User
} from 'lucide-react';
import { UserAccount } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { formatIndianPhone } from '../utils/formatters';
import { useSharedUsers } from '../hooks/useSharedUsers';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const ALLOWED_ROLES = ['Staff', 'Administrator', 'Receptionist'] as const;
type AllowedPersonnelRole = typeof ALLOWED_ROLES[number];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
];

const Staff: React.FC = () => {
  const { users, addUser, deleteUser } = useSharedUsers();

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'register' | 'matrix' | 'shifts' | 'audit'>('directory');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Modals state
  const [viewingUser, setViewingUser] = useState<UserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Dedicated Register Personnel Form State
  const [regForm, setRegForm] = useState({
    name: '',
    username: '',
    password: '',
    age: '',
    email: '',
    bloodGroup: 'O+',
    role: 'Staff' as AllowedPersonnelRole,
    photoUrl: AVATAR_PRESETS[0],
    address: '',
    phone: '',
    department: 'General Administration & Operations'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const departments = [
    'All Departments',
    'Hospital Administration',
    'Front Desk & OPD Registration',
    'General Administration & Operations',
    'Billing & Insurance Claims',
    'Nursing & Patient Services',
    'Pharmacy & Inventory'
  ];

  const roles = ['All Roles', 'Administrator', 'Receptionist', 'Staff', 'Accountant', 'Doctor'];
  const statuses = ['All Status', 'Active', 'On Leave', 'Disabled'];

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        u.name.toLowerCase().includes(q) || 
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));
      
      const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter;
      const matchesDept = departmentFilter === 'All Departments' || u.department === departmentFilter;
      const matchesStatus = statusFilter === 'All Status' || u.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, departmentFilter, statusFilter]);

  // Robust Email Validation Regex: Supports Gmail, Outlook, Yahoo, Hotmail, iCloud, enterprise domains
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
  };

  const validatePersonnelForm = () => {
    const errs: Record<string, string> = {};

    if (!regForm.name.trim()) errs.name = 'Full Name is required';
    if (!regForm.username.trim()) errs.username = 'Username is required';
    if (!regForm.password.trim() || regForm.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!regForm.age.trim() || isNaN(Number(regForm.age)) || Number(regForm.age) < 18 || Number(regForm.age) > 85) {
      errs.age = 'Enter a valid working age (18 - 85 years)';
    }
    if (!regForm.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!validateEmail(regForm.email)) {
      errs.email = 'Please provide a valid email (e.g. user@gmail.com, user@outlook.com, user@yahoo.com)';
    }
    if (!regForm.address.trim()) {
      errs.address = 'Address is required';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Register Personnel Submission
  const handleRegisterPersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePersonnelForm()) return;

    setIsSubmitting(true);

    const newId = `U-${String(users.length + 1).padStart(3, '0')}`;
    const newEmpId = `EMP-0${users.length + 100}`;
    const newUser: UserAccount = {
      id: newId,
      name: regForm.name.trim(),
      username: regForm.username.trim().toLowerCase(),
      password: regForm.password.trim(),
      role: regForm.role,
      age: Number(regForm.age),
      bloodGroup: regForm.bloodGroup,
      address: regForm.address.trim(),
      photoUrl: regForm.photoUrl,
      avatar: regForm.photoUrl,
      phone: regForm.phone.trim() ? formatIndianPhone(regForm.phone.trim()) : '+91 98765-00000',
      email: regForm.email.trim(),
      status: 'Active',
      lastLogin: 'Never logged in',
      department: regForm.role === 'Administrator' ? 'Hospital Administration' : regForm.role === 'Receptionist' ? 'Front Desk & OPD Registration' : 'General Administration & Operations',
      shift: 'General (09:00 AM - 06:00 PM)',
      employeeId: newEmpId,
      qualification: regForm.role === 'Administrator' ? 'Master in Health Administration' : regForm.role === 'Receptionist' ? 'Front Desk Executive' : 'Healthcare Operations Staff',
      twoFactorEnabled: true,
      accessLevel: regForm.role === 'Administrator' ? 'Super Admin' : 'Standard Operations',
      joinedDate: new Date().toLocaleDateString('en-GB')
    };

    addUser(newUser);
    setIsSubmitting(false);

    // Reset Form
    setRegForm({
      name: '',
      username: '',
      password: '',
      age: '',
      email: '',
      bloodGroup: 'O+',
      role: 'Staff',
      photoUrl: AVATAR_PRESETS[0],
      address: '',
      phone: '',
      department: 'General Administration & Operations'
    });
    setFormErrors({});

    showToast('Personnel Registered Successfully', `${newUser.name} has been onboarded as ${newUser.role}.`);
    setActiveSubTab('directory');
  };

  // Handle Permanent Delete User
  const handleConfirmPermanentDelete = () => {
    if (!userToDelete) return;

    const targetName = userToDelete.name;
    deleteUser(userToDelete.id);
    setUserToDelete(null);
    showToast('Personnel Removed', `${targetName} has been permanently deleted from staff records.`, 'warning');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRegForm({ ...regForm, photoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportRoster = () => {
    const headers = ['ID', 'Employee ID', 'Name', 'Username', 'Role', 'Age', 'Blood Group', 'Department', 'Phone', 'Email', 'Address', 'Status'];
    const rows = users.map(u => [
      u.id,
      u.employeeId || 'N/A',
      `"${u.name}"`,
      u.username,
      u.role,
      u.age || 'N/A',
      u.bloodGroup || 'N/A',
      `"${u.department || 'N/A'}"`,
      u.phone,
      u.email,
      `"${u.address || 'N/A'}"`,
      u.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medflow_personnel_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Roster Exported', 'Personnel directory exported as CSV file.');
  };

  const roleTheme: Record<string, { badge: string; text: string; bg: string }> = {
    'Administrator': { badge: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', bg: 'bg-rose-50' },
    'Doctor': { badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', bg: 'bg-blue-50' },
    'Receptionist': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    'Accountant': { badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', bg: 'bg-amber-50' },
    'Staff': { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', bg: 'bg-indigo-50' }
  };

  return (
    <div className="space-y-6 font-serif pb-20 animate-in fade-in duration-300">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 font-sans text-xs max-w-md ${
              toastMessage.type === 'warning' 
                ? 'bg-amber-50 border-amber-200 text-amber-900' 
                : toastMessage.type === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-slate-900">{toastMessage.title}</p>
              <p className="text-slate-600 text-[11px]">{toastMessage.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Container */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-wider text-medical-primary">
            <ShieldCheck size={14} />
            Clinical Governance & Personnel Administration
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Staff & User Management</h1>
          <p className="text-xs md:text-sm text-slate-500 font-sans">
            Institutional directory of administrative staff, receptionists, nursing teams, and role-based permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
          <button 
            onClick={handleExportRoster}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            title="Download CSV personnel roster"
          >
            <Download size={15} />
            Export Roster
          </button>

          <button 
            onClick={() => setActiveSubTab('register')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold shadow-md transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'register'
                ? 'bg-slate-900 text-white shadow-slate-900/20'
                : 'bg-medical-primary text-white hover:bg-medical-primary/90 shadow-medical-primary/20'
            }`}
          >
            <UserPlus size={16} />
            Register Personnel
          </button>
        </div>
      </div>

      {/* Quick KPI Metric Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Personnel', value: users.length, sub: 'All non-clinical & admin staff', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Administrative & Staff', value: users.filter(u => u.role === 'Administrator' || u.role === 'Staff').length, sub: 'Governance & Ops', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Reception & Front Desk', value: users.filter(u => u.role === 'Receptionist').length, sub: 'OPD Check-in Team', icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Security & 2FA', value: users.filter(u => u.twoFactorEnabled).length, sub: `${Math.round((users.filter(u => u.twoFactorEnabled).length / users.length) * 100)}% 2FA Active`, icon: Lock, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
              <kpi.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">{kpi.value}</p>
              <p className="text-[10px] font-sans text-slate-500">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Structured Sub-Tabs Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-1 font-sans text-xs overflow-x-auto pb-px">
          {[
            { id: 'directory', label: 'Personnel Directory', count: filteredUsers.length },
            { id: 'register', label: 'Register Personnel' },
            { id: 'matrix', label: 'Role Permissions Matrix' },
            { id: 'shifts', label: 'Department Rostering' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeSubTab === tab.id
                  ? 'border-medical-primary text-medical-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeSubTab === tab.id ? 'bg-medical-primary/10 text-medical-primary' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeSubTab === 'directory' && (
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-xl font-sans text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Cards View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBPAGE 1: DEDICATED REGISTER PERSONNEL PAGE */}
      {/* ========================================================================= */}
      {activeSubTab === 'register' && (
        <div className="animate-in fade-in duration-200 font-serif w-full max-w-4xl mx-auto space-y-4 pb-8">
          {/* Top Banner */}
          <div className="flex items-center justify-between gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Return to Directory"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Register Healthcare Personnel
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider border border-indigo-200">
                    Non-Doctor Roles
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Onboard Staff, Administrator, or Receptionist accounts. (Doctors are registered exclusively in Doctor Management).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('directory')}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold font-sans text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Back to Directory
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegisterPersonnel} className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5 font-sans text-xs">
            {/* Roles Info Box */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-blue-900">
              <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">Important Policy:</span> This portal registers only <strong>Staff</strong>, <strong>Administrator</strong>, and <strong>Receptionist</strong> personnel. Doctors must not be added here; physicians are registered exclusively through the Doctor Management section.
              </div>
            </div>

            {/* Profile Photo Section */}
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                Profile Photo Upload
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-medical-primary/20 bg-slate-100 shrink-0 shadow-2xs">
                  {regForm.photoUrl ? (
                    <img src={regForm.photoUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                      <User size={24} />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 text-xs">
                      <Upload size={13} />
                      <span>Upload Photo File</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <span className="text-[11px] text-slate-400">or pick sample avatar:</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRegForm({ ...regForm, photoUrl: preset })}
                        className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          regForm.photoUrl === preset ? 'border-medical-primary ring-2 ring-medical-primary/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Responsive Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                  <span>Full Name <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Official Name</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={regForm.name}
                  onChange={(e) => {
                    setRegForm({ ...regForm, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  className={`w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                    formErrors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-rose-500 font-bold">{formErrors.name}</p>}
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                  <span>Username <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">System Login ID</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. ramesh.admin"
                  value={regForm.username}
                  onChange={(e) => {
                    setRegForm({ ...regForm, username: e.target.value.toLowerCase().replace(/\s+/g, '.') });
                    if (formErrors.username) setFormErrors({ ...formErrors, username: '' });
                  }}
                  className={`w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                    formErrors.username ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                  }`}
                />
                {formErrors.username && <p className="text-[10px] text-rose-500 font-bold">{formErrors.username}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                  <span>Password <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Min 6 characters</span>
                </label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regForm.password}
                  onChange={(e) => {
                    setRegForm({ ...regForm, password: e.target.value });
                    if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                  }}
                  className={`w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                    formErrors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                  }`}
                />
                {formErrors.password && <p className="text-[10px] text-rose-500 font-bold">{formErrors.password}</p>}
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                  <span>Age (Years) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">18 - 85 Y</span>
                </label>
                <input 
                  type="number"
                  min="18"
                  max="85"
                  required
                  placeholder="e.g. 29"
                  value={regForm.age}
                  onChange={(e) => {
                    setRegForm({ ...regForm, age: e.target.value });
                    if (formErrors.age) setFormErrors({ ...formErrors, age: '' });
                  }}
                  className={`w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                    formErrors.age ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                  }`}
                />
                {formErrors.age && <p className="text-[10px] text-rose-500 font-bold">{formErrors.age}</p>}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                  <span>Email Address <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Gmail, Outlook, Yahoo, etc.</span>
                </label>
                <input 
                  type="email"
                  required
                  placeholder="ramesh@gmail.com / outlook.com"
                  value={regForm.email}
                  onChange={(e) => {
                    setRegForm({ ...regForm, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                  className={`w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                    formErrors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                  }`}
                />
                {formErrors.email && <p className="text-[10px] text-rose-500 font-bold">{formErrors.email}</p>}
              </div>

              {/* Blood Group */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                  <Droplets size={13} className="text-rose-500" />
                  <span>Blood Group</span>
                </label>
                <select
                  value={regForm.bloodGroup}
                  onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-medical-primary cursor-pointer"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Role Selection (Staff, Administrator, Receptionist ONLY) */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700 text-[11px] block">
                  Assign Personnel Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ALLOWED_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRegForm({ ...regForm, role })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        regForm.role === role
                          ? 'bg-medical-primary text-white border-medical-primary shadow-2xs font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <p className="text-xs font-bold">{role}</p>
                      <p className={`text-[10px] mt-0.5 ${regForm.role === role ? 'text-white/80' : 'text-slate-400'}`}>
                        {role === 'Administrator' ? 'Full Control' : role === 'Receptionist' ? 'OPD & Patient Desk' : 'Clinical Support Ops'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                  <span>Residential / Clinic Address <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Full Postal Address</span>
                </label>
                <textarea 
                  rows={2}
                  required
                  placeholder="House/Apartment #, Street, Area, Bangalore, Karnataka - 560001"
                  value={regForm.address}
                  onChange={(e) => {
                    setRegForm({ ...regForm, address: e.target.value });
                    if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                  }}
                  className={`w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                    formErrors.address ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-medical-primary'
                  }`}
                />
                {formErrors.address && <p className="text-[10px] text-rose-500 font-bold">{formErrors.address}</p>}
              </div>
            </div>

            {/* Footer Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl font-bold shadow-md shadow-medical-primary/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>Register & Save Personnel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBPAGE 2: PERSONNEL DIRECTORY (TABLE & CARDS VIEW) */}
      {/* ========================================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Dynamic Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 font-sans text-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search by name, employee ID, email, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:bg-white"
                />
              </div>

              {/* Role filter */}
              <div className="md:col-span-3">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Department filter */}
              <div className="md:col-span-3">
                <select 
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Status filter */}
              <div className="md:col-span-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Filter pills & Reset */}
            {(searchTerm || roleFilter !== 'All Roles' || departmentFilter !== 'All Departments' || statusFilter !== 'All Status') && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Filtering {filteredUsers.length} of {users.length} staff records</span>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('All Roles');
                    setDepartmentFilter('All Departments');
                    setStatusFilter('All Status');
                  }}
                  className="font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Directory Content (Table or Card View) */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="px-5 py-3.5">Personnel Profile</th>
                      <th className="px-5 py-3.5">Role & Age</th>
                      <th className="px-5 py-3.5">Contact & Email</th>
                      <th className="px-5 py-3.5">Blood Group</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const theme = roleTheme[user.role] || roleTheme['Staff'];
                      const displayPhoto = user.photoUrl || user.avatar;
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                          {/* Personnel Profile */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                                {displayPhoto ? (
                                  <img src={displayPhoto} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  user.name.charAt(0)
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {user.twoFactorEnabled && (
                                    <span title="2FA Enabled" className="text-emerald-600"><ShieldCheck size={13} /></span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  <span>{user.employeeId || user.id}</span>
                                  <span className="mx-1">·</span>
                                  <span>@{user.username}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Age */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] border ${theme.badge}`}>
                              {user.role}
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {user.age ? `${user.age} Years` : '32 Years'}
                            </p>
                          </td>

                          {/* Contact & Email */}
                          <td className="px-5 py-3.5 space-y-0.5">
                            <p className="font-medium text-slate-800 tabular-nums flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" />
                              {user.phone}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[200px] flex items-center gap-1">
                              <Mail size={12} className="text-slate-400" />
                              {user.email}
                            </p>
                          </td>

                          {/* Blood Group */}
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              <Droplets size={12} />
                              {user.bloodGroup || 'O+'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              user.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : user.status === 'On Leave'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'Active' ? 'bg-emerald-500' : user.status === 'On Leave' ? 'bg-amber-500' : 'bg-rose-500'
                              }`} />
                              {user.status}
                            </span>
                          </td>

                          {/* Actions: View and Delete */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Button */}
                              <button 
                                onClick={() => setViewingUser(user)}
                                className="px-2.5 py-1 bg-medical-primary/10 text-medical-primary hover:bg-medical-primary hover:text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                title="View Complete User Dossier"
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </button>

                              {/* Delete Button */}
                              <button 
                                onClick={() => setUserToDelete(user)}
                                className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                title="Permanently Delete User"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Users size={24} />
                          </div>
                          <p className="font-bold text-slate-800 text-sm">No personnel matched your filter</p>
                          <p className="text-xs text-slate-400 mt-1">Try modifying your search query or reset filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between font-sans text-xs text-slate-500">
                <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> registered staff members</span>
                <span className="text-[11px] text-slate-400">MedFlow Workforce Registry · Live State</span>
              </div>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
              {filteredUsers.map((user) => {
                const theme = roleTheme[user.role] || roleTheme['Staff'];
                const displayPhoto = user.photoUrl || user.avatar;
                return (
                  <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-base shrink-0">
                          {displayPhoto ? (
                            <img src={displayPhoto} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${theme.badge}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {user.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-y border-slate-100 py-3">
                      <p className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </p>
                      <p className="flex items-center gap-2 tabular-nums">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span>{user.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Droplets size={14} className="text-rose-500 shrink-0" />
                        <span>Blood Group: <strong>{user.bloodGroup || 'O+'}</strong> • Age: <strong>{user.age || 30}Y</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] font-mono text-slate-400">{user.employeeId || user.id}</span>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setViewingUser(user)}
                          className="px-2.5 py-1 bg-medical-primary/10 text-medical-primary hover:bg-medical-primary hover:text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => setUserToDelete(user)}
                          className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBPAGE 3: ROLE PERMISSIONS MATRIX (RBAC) */}
      {/* ========================================================================= */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6 font-sans">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h2>
              <p className="text-xs text-slate-500">Formal privileges enforced across MedFlow Pro clinical and administrative subsystems.</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-700"><CheckCircle2 size={14} /> Full Access</span>
              <span className="flex items-center gap-1 font-semibold text-sky-700"><Eye size={14} /> View Only</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">System Domain / Module</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Receptionist</th>
                  <th className="py-3 px-4">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { domain: 'Patient Registration & Intake', admin: 'Full Control', rec: 'Full Registration & Edit', staff: 'Triage Entry' },
                  { domain: 'Appointments & Scheduling', admin: 'Full Control', rec: 'Book / Reschedule / Cancel', staff: 'View Schedule' },
                  { domain: 'OPD Live Queue Calling', admin: 'Full Control', rec: 'Token Issuance', staff: 'Vitals & Queue Calling' },
                  { domain: 'Billing & Cash Payments', admin: 'Full Control', rec: 'Collect Co-pay & Receipts', staff: 'Restricted' },
                  { domain: 'Doctor Management', admin: 'Full Control', rec: 'View Roster', staff: 'View Roster' },
                  { domain: 'User & Staff Personnel Registry', admin: 'Full Control', rec: 'View Only', staff: 'Profile Settings' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.domain}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{row.admin}</td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">{row.rec}</td>
                    <td className="py-3 px-4 text-slate-600">{row.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBPAGE 4: DEPARTMENT ROSTERING */}
      {/* ========================================================================= */}
      {activeSubTab === 'shifts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 font-sans text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Shift & Department Duty Rostering</h2>
            <p className="text-slate-500">Active roster breakdown across clinical reception and support desks.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900 text-xs">Morning Shift (08:00 AM - 04:00 PM)</p>
              <p className="text-slate-500 text-[11px]">Covers early morning registrations, lab sample collections, and token queuing.</p>
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">4 Active Staff</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900 text-xs">General Shift (09:00 AM - 06:00 PM)</p>
              <p className="text-slate-500 text-[11px]">Primary OPD hours, billing reconciliation, patient discharge processing.</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">8 Active Staff</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900 text-xs">Evening Shift (02:00 PM - 10:00 PM)</p>
              <p className="text-slate-500 text-[11px]">Late consultations, evening pharmacy dispensing, emergency triage intake.</p>
              <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">3 Active Staff</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW COMPLETE USER DOSSIER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingUser(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 font-sans">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center font-bold text-xl text-white shrink-0">
                    {viewingUser.photoUrl || viewingUser.avatar ? (
                      <img src={viewingUser.photoUrl || viewingUser.avatar} alt={viewingUser.name} className="w-full h-full object-cover" />
                    ) : (
                      viewingUser.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{viewingUser.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {viewingUser.employeeId || viewingUser.id} · @{viewingUser.username} · {viewingUser.role}
                    </p>
                  </div>
                </div>
                <button onClick={() => setViewingUser(null)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">System Role</p>
                    <p className="font-bold text-slate-900 mt-0.5">{viewingUser.role}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Age / Blood Group</p>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {viewingUser.age ? `${viewingUser.age} Y` : '32 Y'} • {viewingUser.bloodGroup || 'O+'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone (+91)</p>
                    <p className="font-bold text-slate-900 mt-0.5 tabular-nums">{viewingUser.phone}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                    <p className="font-bold text-slate-900 mt-0.5 truncate">{viewingUser.email}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Residential / Clinic Address</p>
                    <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>{viewingUser.address || 'MedFlow Central Healthcare Campus, Bangalore, Karnataka'}</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                    <p className="font-bold text-slate-900 mt-0.5">{viewingUser.department || 'General Administration'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Duty Shift</p>
                    <p className="font-bold text-slate-900 mt-0.5">{viewingUser.shift || 'General Shift'}</p>
                  </div>
                </div>

                {/* Login Credentials & Authentication Dossier */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                      <Key size={14} className="text-blue-600" />
                      <span>System Login Credentials (JSON Registry)</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                      Authorized Staff
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Login Username:</span>
                      <span className="font-mono font-bold text-slate-800">@{viewingUser.username}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Active Password:</span>
                      <span className="font-mono font-bold text-slate-800">{viewingUser.password || 'password123'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Employee ID:</span>
                      <span className="font-mono font-bold text-slate-800">{viewingUser.employeeId || viewingUser.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Last Session Login:</span>
                      <span className="font-medium text-slate-700">{viewingUser.lastLogin || 'Never logged in'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Account Security & 2FA Status</span>
                  </div>
                  <span className="font-bold text-emerald-700">{viewingUser.twoFactorEnabled ? 'Active & Enforced' : 'Active'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setViewingUser(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-700 text-xs transition-colors cursor-pointer">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUserToDelete(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative z-10 font-sans space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div className="text-center space-y-1.5">
                <h4 className="font-bold text-slate-900 text-base">
                  Delete Personnel Record?
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete <span className="font-bold text-slate-800">{userToDelete.name}</span> ({userToDelete.role}) from the staff registry? This action will revoke all system credentials immediately.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setUserToDelete(null)} 
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleConfirmPermanentDelete} 
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Yes, Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Staff;
