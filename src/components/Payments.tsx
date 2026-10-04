import React, { useState, useMemo } from 'react';
import { 
  Receipt, Search, Download, Printer, 
  ChevronDown, CreditCard, Banknote, Smartphone, 
  Wallet, CheckCircle2, 
  Eye, Edit, X, Save, 
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { useSharedPayments, PaymentRecord } from '../hooks/useSharedPayments';
import { InvoicePrintModal, InvoicePrintData } from './InvoicePrintModal';

// Robust amount parser removing any commas or currency formatting
const parseAmount = (val: string | number | undefined | null): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const clean = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Formatter for Indian Rupee currency
const formatINR = (val: number): string => {
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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

  // Dynamic Financial Aggregations across all records
  const financialStats = useMemo(() => {
    let grossTotal = 0;
    let upiTotal = 0;
    let cardTotal = 0;
    let cashTotal = 0;
    let pendingTotal = 0;
    let totalCount = payments.length;

    payments.forEach(p => {
      const amt = parseAmount(p.amount);
      if (p.status === 'Completed') {
        grossTotal += amt;
        if (p.method === 'UPI') upiTotal += amt;
        else if (p.method === 'Card') cardTotal += amt;
        else if (p.method === 'Cash' || p.method === 'Bank') cashTotal += amt;
      } else if (p.status === 'Pending') {
        pendingTotal += amt;
      }
    });

    return {
      grossTotal,
      upiTotal,
      cardTotal,
      cashTotal,
      pendingTotal,
      totalCount
    };
  }, [payments]);

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
      amount: String(parseAmount(p.amount)),
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

    // Format amount with accurate comma separator
    const formattedAmount = formatINR(numAmount);

    updatePayment(editingPayment.id, {
      amount: formattedAmount,
      method: editFormData.method,
      status: editFormData.status,
      receivedBy: editFormData.receivedBy.trim(),
      date: editFormData.date.trim(),
      notes: editFormData.notes.trim()
    });

    showToast(`Payment ${editingPayment.id} updated to ₹${formattedAmount} successfully!`);
    setEditingPayment(null);
  };

  // Filtered Payments List
  const filteredPayments = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return payments.filter(p => {
      const matchSearch = !q || 
        p.patient.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) || 
        p.invoice.toLowerCase().includes(q) ||
        p.receivedBy.toLowerCase().includes(q);
      const matchFilter = filter === 'All' || p.status === filter || p.method === filter;
      return matchSearch && matchFilter;
    });
  }, [payments, searchTerm, filter]);

  // Total sum of filtered transactions
  const filteredSum = useMemo(() => {
    return filteredPayments.reduce((acc, p) => acc + parseAmount(p.amount), 0);
  }, [filteredPayments]);

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
          <p className="text-xs text-slate-500">Live ledger calculation, itemized receipts, and audit adjustments</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportPDF}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 text-xs shadow-xs transition-all"
          >
            <Download size={14} /> Export PDF
          </button>
          <button 
            onClick={handlePrint}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 text-xs shadow-xs transition-all"
          >
            <Printer size={14} /> Print List
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Financial Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Settled Gross Total</span>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-medical-primary tabular-nums">
            ₹{formatINR(financialStats.grossTotal)}
          </p>
          <p className="text-[10px] text-slate-400 font-sans">
            {payments.filter(p => p.status === 'Completed').length} completed receipts
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">UPI / QR Collections</span>
            <Smartphone size={14} className="text-indigo-500" />
          </div>
          <p className="text-lg font-bold text-indigo-600 tabular-nums">
            ₹{formatINR(financialStats.upiTotal)}
          </p>
          <p className="text-[10px] text-slate-400 font-sans">Instant digital tender</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Card Swipes / POS</span>
            <CreditCard size={14} className="text-blue-500" />
          </div>
          <p className="text-lg font-bold text-blue-600 tabular-nums">
            ₹{formatINR(financialStats.cardTotal)}
          </p>
          <p className="text-[10px] text-slate-400 font-sans">Debit / Credit POS terminals</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cash & Bank Counter</span>
            <Banknote size={14} className="text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-slate-800 tabular-nums">
            ₹{formatINR(financialStats.cashTotal)}
          </p>
          <p className="text-[10px] text-slate-400 font-sans">Physical cash vault & NEFT</p>
        </div>
      </div>

      {/* Toolbar: Search & Method/Status Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by transaction ID, invoice number, patient name, or cashier..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary font-sans"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="relative">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-medical-primary font-sans"
            >
              <option value="All">All Statuses & Modes</option>
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

          <span className="text-xs font-bold text-slate-500 font-sans tabular-nums whitespace-nowrap">
            {filteredPayments.length} txns (₹{formatINR(filteredSum)})
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div id="payments-table-container" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Txn ID & Invoice</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Patient Details</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Payment Date</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Amount (INR)</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Received By</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No transactions matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const numAmt = parseAmount(p.amount);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Txn ID & Invoice */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 tabular-nums">{p.id}</span>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">{p.invoice}</span>
                      </td>

                      {/* Patient Details */}
                      <td className="px-4 py-3 font-bold text-slate-800 font-sans">
                        <p>{p.patient}</p>
                        {p.patientId && <span className="text-[10px] text-slate-400 font-normal">ID: {p.patientId}</span>}
                      </td>

                      {/* Payment Date */}
                      <td className="px-4 py-3 tabular-nums text-slate-600 font-sans">{p.date}</td>

                      {/* Amount with accurate Rupee formatting */}
                      <td className="px-4 py-3 font-bold text-slate-900 tabular-nums font-mono text-sm">
                        ₹{formatINR(numAmt)}
                      </td>

                      {/* Method */}
                      <td className="px-4 py-3 font-sans">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          {getMethodIcon(p.method)}
                          <span>{p.method}</span>
                        </div>
                      </td>

                      {/* Received By */}
                      <td className="px-4 py-3 text-slate-600 text-[11px] font-sans">
                        {p.receivedBy}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getStatusStyle(p.status)}`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-right print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setViewingPayment(p)}
                            className="p-1.5 text-medical-primary bg-medical-primary/10 hover:bg-medical-primary hover:text-white rounded-lg transition-all" 
                            title="View Detailed Transaction"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => handlePrintInvoice(p)}
                            className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all" 
                            title="Print Official Invoice"
                          >
                            <Printer size={14} />
                          </button>
                          <button 
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all" 
                            title="Edit Payment Record"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-sans gap-2">
          <span>Showing {filteredPayments.length} of {payments.length} total hospital receipts</span>
          <span className="font-bold text-slate-800">
            Total Filtered Value: <span className="font-mono text-medical-primary">₹{formatINR(filteredSum)}</span>
          </span>
        </div>
      </div>

      {/* View Detailed Payment Modal */}
      <AnimatePresence>
        {viewingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 font-sans"
            >
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-medical-primary font-bold">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Transaction Record: {viewingPayment.id}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Invoice Ref: {viewingPayment.invoice}</p>
                  </div>
                </div>
                <button onClick={() => setViewingPayment(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Name</span>
                    <p className="text-sm font-bold text-slate-900">{viewingPayment.patient}</p>
                    {viewingPayment.patientId && <p className="text-slate-500">ID: {viewingPayment.patientId}</p>}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount Settled</span>
                    <p className="text-base font-bold text-medical-primary font-mono">
                      ₹{formatINR(parseAmount(viewingPayment.amount))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Payment Method</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5">
                      {getMethodIcon(viewingPayment.method)}
                      <span>{viewingPayment.method}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block mt-0.5 ${getStatusStyle(viewingPayment.status)}`}>
                      {viewingPayment.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Date Recorded</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{viewingPayment.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Received By</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{viewingPayment.receivedBy}</p>
                  </div>
                </div>

                {viewingPayment.notes && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Audit Remarks</span>
                    <p className="text-slate-700">{viewingPayment.notes}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => {
                      const p = viewingPayment;
                      setViewingPayment(null);
                      handlePrintInvoice(p);
                    }}
                    className="px-4 py-2 bg-medical-primary text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-xs"
                  >
                    <Printer size={14} /> Print Tax Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Payment Modal */}
      <AnimatePresence>
        {editingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 font-sans"
            >
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit size={16} className="text-amber-400" />
                  <h3 className="text-sm font-bold">Edit Payment: {editingPayment.id}</h3>
                </div>
                <button onClick={() => setEditingPayment(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  {/* Amount Input */}
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="font-bold text-slate-700">Amount (₹ INR) *</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold font-mono focus:ring-2 focus:ring-medical-primary/20"
                    />
                    {editErrors.amount && <p className="text-[10px] text-rose-500 font-semibold">{editErrors.amount}</p>}
                  </div>

                  {/* Method Select */}
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="font-bold text-slate-700">Payment Method *</label>
                    <select 
                      value={editFormData.method}
                      onChange={(e) => setEditFormData({ ...editFormData, method: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>

                  {/* Status Select */}
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="font-bold text-slate-700">Status *</label>
                    <select 
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>

                  {/* Payment Date */}
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="font-bold text-slate-700">Payment Date *</label>
                    <input 
                      type="text"
                      required
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      placeholder="e.g. 30/10/2023"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs tabular-nums"
                    />
                    {editErrors.date && <p className="text-[10px] text-rose-500 font-semibold">{editErrors.date}</p>}
                  </div>

                  {/* Received By */}
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-slate-700">Received By *</label>
                    <input 
                      type="text"
                      required
                      value={editFormData.receivedBy}
                      onChange={(e) => setEditFormData({ ...editFormData, receivedBy: e.target.value })}
                      placeholder="e.g. Emma Watson (Receptionist)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                    />
                    {editErrors.receivedBy && <p className="text-[10px] text-rose-500 font-semibold">{editErrors.receivedBy}</p>}
                  </div>

                  {/* Notes */}
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-slate-700">Audit Remarks</label>
                    <textarea 
                      rows={2}
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      placeholder="Reason for modification or payment reference..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setEditingPayment(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
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
