import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, 
  Mail, Phone, Clock, Key, Eye, Edit, 
  Slash, CheckCircle2,
  ShieldCheck, AlertCircle,
  Download, LayoutGrid, List, Building,
  Stethoscope, Receipt, X
} from 'lucide-react';
import { mockUsers } from '../mockData';
import { UserAccount } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { formatIndianPhone } from '../utils/formatters';

const Staff: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(mockUsers);
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'matrix' | 'shifts' | 'audit'>('directory');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserAccount | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{
    type: 'delete' | 'resetPassword' | 'toggleStatus';
    user: UserAccount;
    newStatus?: 'Active' | 'Disabled' | 'On Leave';
  } | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Add User Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'Staff' as UserAccount['role'],
    department: 'General Medicine & OPD',
    email: '',
    phone: '',
    shift: 'General (09:00 AM - 06:00 PM)',
    qualification: '',
    registrationNumber: '',
    initialPassword: '',
    twoFactorEnabled: true
  });

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
    'General Medicine & OPD',
    'Cardiology & Intensive Care',
    'Nursing & Triage Station',
    'Billing & Insurance Claims',
    'In-House Pharmacy & Dispensing'
  ];

  const roles = ['All Roles', 'Administrator', 'Doctor', 'Receptionist', 'Accountant', 'Staff'];
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

  // Handle Form Submission
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    const newId = `U-${String(users.length + 1).padStart(3, '0')}`;
    const newEmpId = `EMP-0${users.length + 100}`;
    const newUser: UserAccount = {
      id: newId,
      name: formData.name,
      username: formData.username || formData.email.split('@')[0],
      role: formData.role,
      phone: formatIndianPhone(formData.phone),
      email: formData.email,
      status: 'Active',
      lastLogin: 'Never logged in',
      department: formData.department,
      shift: formData.shift,
      employeeId: newEmpId,
      qualification: formData.qualification || 'Certified Healthcare Professional',
      registrationNumber: formData.registrationNumber,
      twoFactorEnabled: formData.twoFactorEnabled,
      accessLevel: formData.role === 'Administrator' ? 'Super Admin' : formData.role === 'Doctor' ? 'Clinical Access' : 'Standard',
      joinedDate: new Date().toLocaleDateString('en-GB')
    };

    setUsers(prev => [newUser, ...prev]);
    setShowAddModal(false);
    // Reset form
    setFormData({
      name: '',
      username: '',
      role: 'Staff',
      department: 'General Medicine & OPD',
      email: '',
      phone: '',
      shift: 'General (09:00 AM - 06:00 PM)',
      qualification: '',
      registrationNumber: '',
      initialPassword: '',
      twoFactorEnabled: true
    });

    showToast('Personnel Registered', `${newUser.name} has been added to ${newUser.department}.`);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers(prev => prev.map(u => u.id === editingUser.id ? {
      ...editingUser,
      phone: formatIndianPhone(editingUser.phone)
    } : u));
    showToast('Record Updated', `Staff details for ${editingUser.name} have been updated.`);
    setEditingUser(null);
  };

  const handleConfirmAction = () => {
    if (!actionConfirm) return;
    const { type, user, newStatus } = actionConfirm;

    if (type === 'delete') {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Disabled' } : u));
      showToast('Account Suspended', `${user.name}'s system credentials have been disabled.`, 'warning');
    } else if (type === 'resetPassword') {
      showToast('Reset Link Dispatched', `A secure 1-time password reset token sent to ${user.email}.`, 'info');
    } else if (type === 'toggleStatus' && newStatus) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      showToast('Status Updated', `${user.name} status updated to ${newStatus}.`);
    }

    setActionConfirm(null);
  };

  const handleExportRoster = () => {
    const headers = ['ID', 'Employee ID', 'Name', 'Username', 'Role', 'Department', 'Phone', 'Email', 'Status', 'Shift'];
    const rows = users.map(u => [
      u.id,
      u.employeeId || 'N/A',
      `"${u.name}"`,
      u.username,
      u.role,
      `"${u.department || 'N/A'}"`,
      u.phone,
      u.email,
      u.status,
      `"${u.shift || 'General'}"`
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

  // Permissions Matrix Definition
  const permissionsList = [
    { domain: 'Patient Directory & Registration', admin: 'Full Control', doctor: 'View / Consult', rec: 'Register / Edit', acc: 'View Demographics', staff: 'Triage Entry' },
    { domain: 'Electronic Prescriptions & Diagnosis', admin: 'Audit Only', doctor: 'Full Prescribe', rec: 'No Access', acc: 'Bill Item Sync', staff: 'View Instructions' },
    { domain: 'Appointment Scheduling & Calendar', admin: 'Full Control', doctor: 'Manage Own Slots', rec: 'Book / Reschedule', acc: 'View Schedule', staff: 'View Schedule' },
    { domain: 'OPD Waiting Queue & Calling', admin: 'Full Control', doctor: 'Call / Complete', rec: 'Token Issue / Checkin', acc: 'Queue Tracker', staff: 'Vitals Entry' },
    { domain: 'Cashless Billing, Tax & Invoicing', admin: 'Full Control', doctor: 'View Service Cost', rec: 'Collect Co-pay', acc: 'Full Invoicing & GST', staff: 'No Access' },
    { domain: 'Financial Reports & Revenue Audit', admin: 'Full Control', doctor: 'No Access', rec: 'No Access', acc: 'Audit Reports', staff: 'No Access' },
    { domain: 'Staff Accounts & System Settings', admin: 'Full Control', doctor: 'Profile Settings', rec: 'Profile Settings', acc: 'Profile Settings', staff: 'Profile Settings' }
  ];

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
            Clinical Governance & Access Control
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Staff & User Management</h1>
          <p className="text-xs md:text-sm text-slate-500 font-sans">
            Institutional directory of clinical practitioners, nursing teams, accounts officers, and role-based permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
          <button 
            onClick={handleExportRoster}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-xs"
            title="Download CSV personnel roster"
          >
            <Download size={15} />
            Export Roster
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-medical-primary text-white rounded-xl font-bold hover:bg-medical-primary/90 shadow-md shadow-medical-primary/20 transition-all shrink-0"
          >
            <UserPlus size={16} />
            Register Personnel
          </button>
        </div>
      </div>

      {/* Quick KPI Metric Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Personnel', value: users.length, sub: 'All departments', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Clinical Team', value: users.filter(u => u.role === 'Doctor' || u.role === 'Staff').length, sub: 'Physicians & Nurses', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Front Office & Billing', value: users.filter(u => u.role === 'Receptionist' || u.role === 'Accountant').length, sub: 'OPD & Cash Desk', icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Security & 2FA', value: users.filter(u => u.twoFactorEnabled).length, sub: `${Math.round((users.filter(u => u.twoFactorEnabled).length / users.length) * 100)}% 2FA Adoption`, icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
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
            { id: 'matrix', label: 'Role Permissions Matrix' },
            { id: 'shifts', label: 'Department Rostering' },
            { id: 'audit', label: 'Security & Access Log' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-3 font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
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
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Cards View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Personnel Directory */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Dynamic Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 font-sans text-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search by name, employee ID, email, department..."
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
                  className="font-bold text-rose-600 hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Directory Content (Table or Card View) */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="px-5 py-3.5">Personnel Profile</th>
                      <th className="px-5 py-3.5">Role & Department</th>
                      <th className="px-5 py-3.5">Contact Details (+91)</th>
                      <th className="px-5 py-3.5">Duty Shift</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const theme = roleTheme[user.role] || roleTheme['Staff'];
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                          {/* Personnel Profile */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                                {user.name.charAt(0)}
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

                          {/* Role & Department */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] border ${theme.badge}`}>
                              {user.role}
                            </span>
                            <p className="text-[11px] text-slate-600 font-medium mt-1 truncate max-w-[200px]" title={user.department}>
                              {user.department || 'General Services'}
                            </p>
                            {user.registrationNumber && (
                              <p className="text-[10px] text-slate-400 font-mono">Reg: {user.registrationNumber}</p>
                            )}
                          </td>

                          {/* Contact Details */}
                          <td className="px-5 py-3.5 space-y-0.5">
                            <p className="font-medium text-slate-800 tabular-nums flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" />
                              {user.phone}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[190px] flex items-center gap-1">
                              <Mail size={12} className="text-slate-400" />
                              {user.email}
                            </p>
                          </td>

                          {/* Duty Shift */}
                          <td className="px-5 py-3.5">
                            <p className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5">
                              <Clock size={12} className="text-slate-400" />
                              {user.shift || 'General Shift'}
                            </p>
                            <p className="text-[10px] text-slate-400">Last login: {user.lastLogin}</p>
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

                          {/* Actions */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => setViewingUser(user)}
                                className="p-1.5 text-slate-600 hover:text-medical-primary hover:bg-slate-100 rounded-lg transition-colors"
                                title="View Dossier"
                              >
                                <Eye size={15} />
                              </button>
                              <button 
                                onClick={() => setEditingUser(user)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Personnel"
                              >
                                <Edit size={15} />
                              </button>
                              <button 
                                onClick={() => setActionConfirm({ type: 'resetPassword', user })}
                                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Reset Password"
                              >
                                <Key size={15} />
                              </button>
                              <button 
                                onClick={() => setActionConfirm({ 
                                  type: 'toggleStatus', 
                                  user, 
                                  newStatus: user.status === 'Active' ? 'Disabled' : 'Active' 
                                })}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title={user.status === 'Active' ? 'Disable Account' : 'Reactivate Account'}
                              >
                                <Slash size={15} />
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
                          <p className="text-xs text-slate-400 mt-1">Try modifying your search or clearing department filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between font-sans text-xs text-slate-500">
                <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> registered staff members</span>
                <span className="text-[11px] text-slate-400">MedFlow Clinical Workforce Registry · Updated Today</span>
              </div>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const theme = roleTheme[user.role] || roleTheme['Staff'];
                return (
                  <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all font-sans space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-base">
                          {user.name.charAt(0)}
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
                        <Building size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{user.department || 'Clinical Support'}</span>
                      </p>
                      <p className="flex items-center gap-2 tabular-nums">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span>{user.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span className="text-[11px]">{user.shift || 'General Shift'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] font-mono text-slate-400">{user.employeeId || user.id}</span>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setViewingUser(user)}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold text-xs"
                        >
                          Dossier
                        </button>
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="px-2.5 py-1 bg-medical-primary/10 text-medical-primary hover:bg-medical-primary hover:text-white rounded-lg font-bold text-xs transition-colors"
                        >
                          Edit
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

      {/* Tab 2: Role Permissions Matrix (RBAC) */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 font-sans">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h2>
              <p className="text-xs text-slate-500">Formal privileges enforced across all MedFlow Pro clinical and financial subsystems.</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-700"><CheckCircle2 size={14} /> Full Access</span>
              <span className="flex items-center gap-1 font-semibold text-sky-700"><Eye size={14} /> View Only</span>
              <span className="flex items-center gap-1 font-semibold text-slate-400"><Slash size={14} /> Restricted</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <th className="p-3.5">Subsystem / Functional Scope</th>
                  <th className="p-3.5 text-center">Administrator</th>
                  <th className="p-3.5 text-center">Doctor / Consultant</th>
                  <th className="p-3.5 text-center">Receptionist</th>
                  <th className="p-3.5 text-center">Accountant</th>
                  <th className="p-3.5 text-center">Nursing Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsList.map((perm, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{perm.domain}</td>
                    
                    {/* Admin */}
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                        {perm.admin}
                      </span>
                    </td>

                    {/* Doctor */}
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        perm.doctor.includes('Full') ? 'bg-emerald-50 text-emerald-700' :
                        perm.doctor.includes('No') ? 'bg-slate-100 text-slate-400' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {perm.doctor}
                      </span>
                    </td>

                    {/* Receptionist */}
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        perm.rec.includes('Register') || perm.rec.includes('Book') || perm.rec.includes('Token') ? 'bg-emerald-50 text-emerald-700' :
                        perm.rec.includes('No') ? 'bg-slate-100 text-slate-400' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {perm.rec}
                      </span>
                    </td>

                    {/* Accountant */}
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        perm.acc.includes('Full') || perm.acc.includes('Audit') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        perm.acc.includes('No') ? 'bg-slate-100 text-slate-400' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {perm.acc}
                      </span>
                    </td>

                    {/* Staff */}
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        perm.staff.includes('No') ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {perm.staff}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>Privileges are cryptographically bound to session authentication cookies.</span>
            <span className="font-bold text-medical-primary">NABH Standard Compliant</span>
          </div>
        </div>
      )}

      {/* Tab 3: Department Rostering */}
      {activeSubTab === 'shifts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
          {departments.filter(d => d !== 'All Departments').map((dept, idx) => {
            const deptStaff = users.filter(u => u.department === dept);
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-medical-primary" />
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-[180px]" title={dept}>{dept}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                    {deptStaff.length} Staff
                  </span>
                </div>

                <div className="space-y-2">
                  {deptStaff.map(member => (
                    <div key={member.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{member.name}</p>
                        <p className="text-[10px] text-slate-400">{member.shift || 'General Shift'}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        member.status === 'Active' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  ))}

                  {deptStaff.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No staff allocated currently.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Security & Access Log */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 font-sans text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Security Audit Trail & Session Log</h3>
            <p className="text-xs text-slate-500">Immutable chronological events of personnel authentication and role adjustments.</p>
          </div>

          <div className="space-y-3">
            {[
              { time: 'Today, 10:05 AM', actor: 'Rajesh Sharma (EMP-0401)', event: 'Successful Session Login via 2FA', ip: '192.168.1.104 (Billing Station)', status: 'Success' },
              { time: 'Today, 09:15 AM', actor: 'Emma Watson (EMP-0204)', event: 'Successful Session Login', ip: '192.168.1.12 (Front Desk 1)', status: 'Success' },
              { time: 'Today, 08:45 AM', actor: 'Dr. Sarah Chen (EMP-0301)', event: 'Clinical Consult Engine Initiated', ip: '192.168.1.45 (OPD Room 3)', status: 'Success' },
              { time: 'Today, 08:30 AM', actor: 'John Smith (EMP-0101)', event: 'Super Admin Security Check Complete', ip: '192.168.1.2 (Hospital Server)', status: 'Success' },
              { time: 'Yesterday, 06:10 PM', actor: 'Anand Verma (EMP-0502)', event: 'Leave Status Marked by Administration', ip: '192.168.1.2 (Admin Desk)', status: 'Audit' },
            ].map((log, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.actor}</span>
                    <span className="text-[10px] text-slate-400">· {log.time}</span>
                  </div>
                  <p className="text-slate-600">{log.event}</p>
                </div>
                <div className="text-right sm:shrink-0 font-mono text-[11px] text-slate-400">
                  {log.ip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: View Staff Dossier */}
      <AnimatePresence>
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingUser(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden relative z-10 font-sans">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xl text-white">
                    {viewingUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{viewingUser.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{viewingUser.employeeId || viewingUser.id} · {viewingUser.role}</p>
                  </div>
                </div>
                <button onClick={() => setViewingUser(null)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                    <p className="font-bold text-slate-800 mt-0.5">{viewingUser.department || 'General Clinical'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone (+91)</p>
                    <p className="font-bold text-slate-800 mt-0.5 tabular-nums">{viewingUser.phone}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                    <p className="font-bold text-slate-800 mt-0.5 truncate">{viewingUser.email}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Duty Shift</p>
                    <p className="font-bold text-slate-800 mt-0.5">{viewingUser.shift || 'General Shift'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Qualifications</p>
                    <p className="font-bold text-slate-800 mt-0.5">{viewingUser.qualification || 'Certified Staff'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Medical Registration #</p>
                    <p className="font-bold text-slate-800 mt-0.5 font-mono">{viewingUser.registrationNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-emerald-800">
                  <span>Two-Factor Authentication (2FA)</span>
                  <span className="font-bold">{viewingUser.twoFactorEnabled ? 'Enabled & Active' : 'Not Configured'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setViewingUser(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-700 text-xs transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Staff Record */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingUser(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 font-sans">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Edit Staff Record</h3>
                <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input 
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-medical-primary/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">System Role</label>
                    <select 
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    >
                      <option>Administrator</option>
                      <option>Doctor</option>
                      <option>Receptionist</option>
                      <option>Accountant</option>
                      <option>Staff</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Status</label>
                    <select 
                      value={editingUser.status}
                      onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    >
                      <option>Active</option>
                      <option>On Leave</option>
                      <option>Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Department</label>
                  <select 
                    value={editingUser.department || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  >
                    {departments.filter(d => d !== 'All Departments').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone (+91)</label>
                    <input 
                      type="tel"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Shift</label>
                    <input 
                      type="text"
                      value={editingUser.shift || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, shift: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-medical-primary text-white rounded-xl font-bold shadow-md">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Action Confirm (Reset Password / Disable) */}
      <AnimatePresence>
        {actionConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActionConfirm(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative z-10 font-sans space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  {actionConfirm.type === 'delete' ? 'Disable User Account?' :
                   actionConfirm.type === 'resetPassword' ? 'Reset Password Token?' :
                   'Update Account Status?'}
                </h4>
                <p className="text-xs text-slate-500">
                  {actionConfirm.type === 'resetPassword'
                    ? `Generate and dispatch a temporary password reset link to ${actionConfirm.user.email}.`
                    : `Are you sure you want to update ${actionConfirm.user.name}'s account status?`}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => setActionConfirm(null)} className="flex-1 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 text-xs">
                  Cancel
                </button>
                <button onClick={handleConfirmAction} className="flex-1 py-2 bg-medical-primary text-white rounded-xl font-bold text-xs shadow-md">
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Register New Personnel */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 font-sans max-h-[90vh] flex flex-col">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <UserPlus size={20} className="text-medical-primary" />
                  <div>
                    <h3 className="font-bold text-base text-white">Register Clinical Personnel</h3>
                    <p className="text-xs text-slate-400">Add doctor, nursing, accounts, or front desk staff</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4 overflow-y-auto text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-medical-primary/20"
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">System Role *</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                      required
                    >
                      <option>Administrator</option>
                      <option>Doctor</option>
                      <option>Receptionist</option>
                      <option>Accountant</option>
                      <option>Staff</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Department *</label>
                    <select 
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                      required
                    >
                      {departments.filter(d => d !== 'All Departments').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Official Email *</label>
                    <input 
                      type="email" 
                      placeholder="ramesh@medflow.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-medical-primary/20"
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Mobile Number (+91) *</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <span className="px-3 py-2.5 bg-slate-100 text-slate-600 font-bold border-r border-slate-200 text-xs">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        placeholder="98765-43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-transparent px-3 py-2 text-xs focus:outline-none"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Duty Shift Schedule</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Morning (08:00 AM - 04:00 PM)"
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Qualifications</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MBBS, MD, B.Sc Nursing"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Medical Council Reg # (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MCI-12345-KA"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    New accounts will receive an automated invitation link with temporary one-time password credentials, requiring mandatory password rotation and 2FA setup on first login.
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-medical-primary text-white rounded-xl font-bold shadow-md shadow-medical-primary/20 hover:bg-medical-primary/90 flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    Register Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Staff;
