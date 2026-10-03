import React, { useState } from 'react';
import { 
  Receipt, Search, Filter, Download, Printer, 
  ChevronDown, CreditCard, Banknote, Smartphone, 
  Wallet, CheckCircle2, Clock, MoreVertical, Trash2,
  Eye, Edit, X, Save, AlertCircle, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { useSharedPayments, PaymentRecord } from '../hooks/useSharedPayments';
import { InvoicePrintModal, InvoicePrintData } from './InvoicePrintModal';

const Payments: React.FC = () => {
  const { payments, updatePayment } = useSharedPayments();

  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [viewingPayment, setViewingPayment] = useState<PaymentRecord | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [printInvoiceData, setPrintInvoiceData] = useState<InvoicePrintData | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    method: 'Card' as PaymentRecord['method'],
    status: 'Completed' as PaymentRecord['status'],
    receivedBy: '',
    date: '',
    notes: ''
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePrintInvoice = (payment: PaymentRecord) => {
    setPrintInvoiceData({
      invoiceNumber: payment.invoice,
      transactionId: payment.id,
      date: payment.date,
      patientName: payment.patient,
      patientId: payment.patientId,
      patientPhone: '+91 99887-76655',
      patientAddress: '123 MG Road, Bangalore, Karnataka',
      paymentMethod: payment.method,
      paymentStatus: payment.status,
      receivedBy: payment.receivedBy,
      amount: payment.amount,
      notes: payment.notes
    });
    setShowPrintModal(true);
  };

  const handlePrint = async () => {
    const input = document.getElementById('payments-table-container');
    if (!input) return;

    try {
      const imgData = await toPng(input, { 
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff'
      });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = imgData;
      await img.decode();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const blob = pdf.output('bloburl');
      const printWindow = window.open(blob);
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } catch (err) {
      console.error('Print generation failed:', err);
      window.print();
    }
  };

  const handleExportPDF = async () => {
    const input = document.getElementById('payments-table-container');
    if (!input) return;

    try {
      const imgData = await toPng(input, { 
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff'
      });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = imgData;
      await img.decode();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Transaction_History.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Card': return <CreditCard size={14} />;
      case 'UPI': return <Smartphone size={14} />;
      case 'Cash': return <Banknote size={14} />;
      case 'Bank': return <Wallet size={14} />;
      default: return <Receipt size={14} />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const openEditModal = (p: PaymentRecord) => {
    setEditingPayment(p);
    setEditFormData({
      amount: p.amount.replace(/,/g, ''),
      method: p.method,
      status: p.status,
      receivedBy: p.receivedBy,
      date: p.date,
      notes: p.notes || ''
    });
    setEditErrors({});
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    const errs: Record<string, string> = {};
    const numAmount = parseFloat(editFormData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }
    if (!editFormData.receivedBy.trim()) {
      errs.receivedBy = 'Received By officer/counter is required';
    }
    if (!editFormData.date.trim()) {
      errs.date = 'Payment date is required';
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    // Format amount with comma separator
    const formattedAmount = numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    updatePayment(editingPayment.id, {
      amount: formattedAmount,
      method: editFormData.method,
      status: editFormData.status,
      receivedBy: editFormData.receivedBy.trim(),
      date: editFormData.date.trim(),
      notes: editFormData.notes.trim()
    });

    showToast(`Payment ${editingPayment.id} updated successfully!`);
    setEditingPayment(null);
  };

  // Filtered Payments
  const filteredPayments = payments.filter(p => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch = !q || 
      p.patient.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) || 
      p.invoice.toLowerCase().includes(q) ||
      p.receivedBy.toLowerCase().includes(q);
    const matchFilter = filter === 'All' || p.status === filter || p.method === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-serif pb-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:text-emerald-950">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Payment & Transaction Management</h2>
          <p className="text-xs text-slate-500">Track all clinical receipts, modify transactions, and inspect audit records</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportPDF}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 text-xs shadow-xs transition-all"
          >
            <Download size={14} /> Export PDF
          </button>
          <button 
            onClick={handlePrint}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 text-xs shadow-xs transition-all"
          >
            <Printer size={14} /> Print List
          </button>
        </div>
      </div>

      {/* Stats Mini Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
        {[
          { label: "Today's Gross Total", value: '₹44,550.50', color: 'text-medical-primary' },
          { label: 'UPI / Digital Receipts', value: '₹1,650.00', color: 'text-indigo-600' },
          { label: 'Card Swipes / POS', value: '₹34,150.50', color: 'text-blue-600' },
          { label: 'Cash & Direct Counter', value: '₹8,750.00', color: 'text-slate-700' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
            <p className={`text-base font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar: Search & Method/Status Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 print:hidden">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by transaction ID, invoice, patient name, or received by..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-medical-primary"
            >
              <option value="All">All Transactions</option>
              <option value="Completed">Status: Completed</option>
              <option value="Pending">Status: Pending</option>
              <option value="Failed">Status: Failed</option>
              <option value="Card">Method: Card</option>
              <option value="UPI">Method: UPI</option>
              <option value="Cash">Method: Cash</option>
              <option value="Bank">Method: Bank</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div id="payments-table-container" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Txn ID & Invoice</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Patient Details</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Payment Date</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Received By</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                  {/* Txn ID & Invoice */}
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 tabular-nums">{p.id}</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">{p.invoice}</span>
                  </td>

                  {/* Patient Details */}
                  <td className="px-4 py-3 font-bold text-slate-800">
                    <p>{p.patient}</p>
                    {p.patientId && <span className="text-[10px] text-slate-400 font-normal">ID: {p.patientId}</span>}
                  </td>

                  {/* Payment Date */}
                  <td className="px-4 py-3 tabular-nums text-slate-600">{p.date}</td>

                  {/* Amount */}
                  <td className="px-4 py-3 font-bold text-slate-900 tabular-nums text-sm">
                    ₹{p.amount} <span className="text-[10px] text-slate-400 font-semibold">INR</span>
                  </td>

                  {/* Method */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      {getMethodIcon(p.method)}
                      <span>{p.method}</span>
                    </div>
                  </td>

                  {/* Received By */}
                  <td className="px-4 py-3 text-slate-600 text-[11px]">
                    {p.receivedBy}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getStatusStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </td>

                  {/* Action Buttons - Fully Functional View and Edit */}
                  <td className="px-4 py-3 text-right print:hidden">
                    <div className="flex items-center justify-end gap-1.5 opacity-100">
                      {/* VIEW BUTTON - Opens Detailed Payment Modal */}
                      <button 
                        onClick={() => setViewingPayment(p)}
                        className="p-1.5 text-medical-primary bg-medical-primary/10 hover:bg-medical-primary hover:text-white rounded-lg transition-all" 
                        title="View Detailed Transaction"
                      >
                        <Eye size={14} />
                      </button>

                      {/* EDIT BUTTON - Opens Modal to modify permitted information */}
                      <button 
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all" 
                        title="Edit Payment Information"
                      >
                        <Edit size={14} />
                      </button>

                      {/* Print Invoice Button */}
                      <button 
                        onClick={() => handlePrintInvoice(p)} 
                        className="p-1.5 text-slate-600 bg-slate-100 hover:bg-medical-primary hover:text-white rounded-lg transition-all cursor-pointer" 
                        title="Print Invoice"
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Receipt size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No payment records found.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting search term or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>Total {filteredPayments.length} transactions displayed</span>
          <span className="font-semibold text-slate-600">MedFlow Financial Audit Ledger</span>
        </div>
      </div>

      {/* VIEW PAYMENT / TRANSACTION MODAL */}
      <AnimatePresence>
        {viewingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Payment Transaction Receipt</h3>
                    <p className="text-[10px] text-slate-500">Official transaction audit verification</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePrintInvoice(viewingPayment)}
                    className="px-3 py-1 bg-medical-primary text-white hover:bg-medical-primary/90 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Generate and print official invoice"
                  >
                    <Printer size={13} />
                    <span>Print Invoice</span>
                  </button>
                  <button onClick={() => setViewingPayment(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body: All requested fields */}
              <div className="p-5 space-y-4 text-xs">
                {/* Highlighted Amount & Status */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount (INR)</span>
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">₹{viewingPayment.amount} <span className="text-sm font-semibold text-slate-500">INR</span></span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(viewingPayment.status)}`}>
                    {viewingPayment.status}
                  </span>
                </div>

                {/* 2-Column Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Transaction ID</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{viewingPayment.id}</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Number</span>
                    <span className="text-sm font-bold text-slate-900 uppercase">{viewingPayment.invoice}</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Patient Name</span>
                    <span className="text-sm font-bold text-slate-900">{viewingPayment.patient}</span>
                    {viewingPayment.patientId && <span className="text-[10px] text-slate-400 block">ID: {viewingPayment.patientId}</span>}
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Payment Date</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{viewingPayment.date}</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Payment Method</span>
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold mt-0.5">
                      {getMethodIcon(viewingPayment.method)}
                      <span>{viewingPayment.method}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Received By</span>
                    <span className="text-sm font-bold text-slate-900">{viewingPayment.receivedBy}</span>
                  </div>
                </div>

                {viewingPayment.notes && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Audit Remarks</span>
                    <p className="text-slate-700 italic">{viewingPayment.notes}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const p = viewingPayment;
                      setViewingPayment(null);
                      openEditModal(p);
                    }}
                    className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit size={13} /> Edit Record
                  </button>
                  <button 
                    onClick={() => handlePrintInvoice(viewingPayment)}
                    className="px-3.5 py-1.5 bg-medical-primary text-white hover:bg-medical-primary/90 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Generate and print official invoice"
                  >
                    <Printer size={13} />
                    <span>Print Invoice</span>
                  </button>
                </div>
                <button 
                  onClick={() => setViewingPayment(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PAYMENT MODAL */}
      <AnimatePresence>
        {editingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Edit size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Modify Payment: {editingPayment.id}</h3>
                    <p className="text-[10px] text-slate-500">Invoice: {editingPayment.invoice} • Patient: {editingPayment.patient}</p>
                  </div>
                </div>
                <button onClick={() => setEditingPayment(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  {/* Amount */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Amount (INR ₹) *</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-medical-primary/20 focus-within:border-medical-primary">
                      <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                        ₹ INR
                      </span>
                      <input 
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={editFormData.amount}
                        onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                        className={`w-full bg-transparent p-2 text-xs font-bold tabular-nums focus:outline-none ${
                          editErrors.amount ? 'border-rose-400' : ''
                        }`}
                      />
                    </div>
                    {editErrors.amount && <p className="text-[10px] text-rose-500">{editErrors.amount}</p>}
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Payment Method *</label>
                    <select 
                      value={editFormData.method}
                      onChange={(e) => setEditFormData({ ...editFormData, method: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Card">Card / POS</option>
                      <option value="UPI">UPI / Digital QR</option>
                      <option value="Cash">Cash Counter</option>
                      <option value="Bank">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Payment Status *</label>
                    <select 
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  {/* Payment Date */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Payment Date *</label>
                    <input 
                      type="text"
                      required
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      placeholder="e.g. 30/10/2023"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs tabular-nums"
                    />
                    {editErrors.date && <p className="text-[10px] text-rose-500">{editErrors.date}</p>}
                  </div>

                  {/* Received By */}
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-slate-700">Received By (Staff / Officer) *</label>
                    <input 
                      type="text"
                      required
                      value={editFormData.receivedBy}
                      onChange={(e) => setEditFormData({ ...editFormData, receivedBy: e.target.value })}
                      placeholder="e.g. Emma Watson (Receptionist)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                    {editErrors.receivedBy && <p className="text-[10px] text-rose-500">{editErrors.receivedBy}</p>}
                  </div>

                  {/* Notes / Remarks */}
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-slate-700">Audit Remarks / Notes</label>
                    <textarea 
                      rows={2}
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      placeholder="Reason for modification or payment reference..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setEditingPayment(null)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-1.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    <span>Save & Update Record</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Professional Printable Invoice Modal */}
      <InvoicePrintModal 
        isOpen={showPrintModal} 
        onClose={() => setShowPrintModal(false)} 
        data={printInvoiceData} 
      />
    </div>
  );
};

export default Payments;
