import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Receipt, Printer, Download, Plus, Trash2, 
  CreditCard, Banknote, Smartphone, Wallet, Check,
  CheckCircle2, Search,
  Calculator
} from 'lucide-react';
import { mockPatients } from '../mockData';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { Patient } from '../types';
import { InvoicePrintModal } from './InvoicePrintModal';
import { addPaymentRecord } from '../hooks/useSharedPayments';
import { useSharedPatients } from '../hooks/useSharedPatients';
import { checkAndRemoveCompletedPatientFromQueue } from '../hooks/useSharedQueue';
import { useActivePatientContext } from '../hooks/useActivePatientContext';
import { useSharedSettings } from '../hooks/useSharedSettings';

interface BillingProps {
  setActiveTab: (tab: string) => void;
}

interface LineItem {
  id: number;
  desc: string;
  qty: number;
  price: number;
}

const Billing: React.FC<BillingProps> = ({ setActiveTab }) => {
  const { clinicName, address, taxNumber, currencySymbol, taxRate: defaultTaxRate } = useSharedSettings();
  const { patients } = useSharedPatients();
  const { activePatient, setActivePatient: setGlobalActivePatient, pendingBillItems } = useActivePatientContext();

  const [selectedPatient, setSelectedPatient] = useState<Patient>(() => activePatient || patients[0] || mockPatients[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash' | 'upi' | 'bank'>('card');
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Patient Search State
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const patientSuggestions = useSearchSuggestions(patientSearch);
  const patientSearchRef = useRef<HTMLDivElement>(null);

  // Service Search State
  const [activeItemSearchId, setActiveItemSearchId] = useState<number | null>(null);
  const [itemSearch, setItemSearch] = useState('');
  const itemSuggestions = useSearchSuggestions(itemSearch);
  const itemSearchRef = useRef<HTMLDivElement>(null);

  // Line items state - prefill from pendingBillItems if present
  const [lineItems, setLineItems] = useState<LineItem[]>(() => {
    if (pendingBillItems && pendingBillItems.length > 0) {
      return pendingBillItems;
    }
    return [
      { id: 1, desc: 'Consultation Fee (Dr. Sarah Chen)', qty: 1, price: 800 },
      { id: 2, desc: 'Complete Blood Count (CBC) Test', qty: 1, price: 450 },
      { id: 3, desc: 'Chest X-Ray Digital View', qty: 1, price: 1200 },
    ];
  });

  // Sync when activePatient or pendingBillItems update
  useEffect(() => {
    if (activePatient) {
      setSelectedPatient(activePatient);
    }
  }, [activePatient]);

  useEffect(() => {
    if (pendingBillItems && pendingBillItems.length > 0) {
      setLineItems(pendingBillItems);
    }
  }, [pendingBillItems]);

  // Financial inputs state
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(defaultTaxRate || 5); // From clinic settings
  const [notes, setNotes] = useState<string>('');
  const [customAmountPaid, setCustomAmountPaid] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientSearchRef.current && !patientSearchRef.current.contains(event.target as Node)) {
        setShowPatientSuggestions(false);
      }
      if (itemSearchRef.current && !itemSearchRef.current.contains(event.target as Node)) {
        setActiveItemSearchId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPatientSuggestion = (item: SuggestionItem) => {
    if (item.type === 'patient') {
      const patient = patients.find(p => p.id === item.id) || mockPatients.find(p => p.id === item.id);
      if (patient) {
        setSelectedPatient(patient);
        setGlobalActivePatient(patient);
        setPatientSearch('');
        setShowPatientSuggestions(false);
      }
    }
  };

  const handleSelectItemSuggestion = (item: SuggestionItem) => {
    if (item.type === 'service' && activeItemSearchId) {
      const service = item.payload;
      updateItem(activeItemSearchId, 'desc', service.name);
      updateItem(activeItemSearchId, 'price', service.price);
      setActiveItemSearchId(null);
      setItemSearch('');
    }
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now(),
      desc: 'Clinical Service / Medication',
      qty: 1,
      price: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeItem = (id: number) => {
    if (lineItems.length <= 1) {
      setLineItems([{ id: Date.now(), desc: 'General OPD Consultation', qty: 1, price: 0 }]);
      return;
    }
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        if (field === 'qty') {
          const num = typeof value === 'number' ? value : parseInt(value) || 0;
          return { ...item, qty: Math.max(0, num) };
        }
        if (field === 'price') {
          const num = typeof value === 'number' ? value : parseFloat(value) || 0;
          return { ...item, price: Math.max(0, num) };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Accurate Financial Calculations
  const calculations = useMemo(() => {
    // 1. Gross Subtotal
    const subtotal = lineItems.reduce((acc, item) => {
      const itemTotal = (Math.max(0, item.qty) * Math.max(0, item.price));
      return acc + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);

    // 2. Discount
    let discountAmount = 0;
    if (discountType === 'percent') {
      const pct = Math.min(100, Math.max(0, discountInput || 0));
      discountAmount = (subtotal * pct) / 100;
    } else {
      discountAmount = Math.min(subtotal, Math.max(0, discountInput || 0));
    }

    // 3. Taxable Subtotal after Discount
    const taxableAmount = Math.max(0, subtotal - discountAmount);

    // 4. GST Breakdown (5% -> 2.5% CGST + 2.5% SGST)
    const validTaxRate = Math.max(0, taxRate || 0);
    const taxAmount = (taxableAmount * validTaxRate) / 100;
    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;

    // 5. Net Payable Total
    const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

    // 6. Tendered / Amount Paid
    const amountPaid = customAmountPaid !== null 
      ? Math.max(0, customAmountPaid) 
      : grandTotal;

    // 7. Balance Due and Change Returned
    const balanceDue = Math.max(0, grandTotal - amountPaid);
    const changeReturn = Math.max(0, amountPaid - grandTotal);

    // 8. Payment Status
    let paymentStatus: 'Completed' | 'Pending' | 'Partial' = 'Completed';
    if (grandTotal === 0) {
      paymentStatus = 'Completed';
    } else if (amountPaid >= grandTotal) {
      paymentStatus = 'Completed';
    } else if (amountPaid > 0) {
      paymentStatus = 'Partial';
    } else {
      paymentStatus = 'Pending';
    }

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      cgstAmount,
      sgstAmount,
      grandTotal,
      amountPaid,
      balanceDue,
      changeReturn,
      paymentStatus
    };
  }, [lineItems, discountType, discountInput, taxRate, customAmountPaid]);

  const handleProcess = () => {
    setIsProcessing(true);
    const methodLabel = selectedMethod === 'card' ? 'Card' 
      : selectedMethod === 'upi' ? 'UPI' 
      : selectedMethod === 'bank' ? 'Bank' 
      : 'Cash';

    const newTxnId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setTimeout(() => {
      // Save to shared payments store
      addPaymentRecord({
        id: newTxnId,
        invoice: newInvoiceNo,
        patient: selectedPatient.name,
        patientId: selectedPatient.id,
        date: dateStr,
        amount: calculations.amountPaid.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        method: methodLabel as 'Card' | 'UPI' | 'Cash' | 'Bank',
        status: calculations.paymentStatus === 'Completed' ? 'Completed' : 'Pending',
        receivedBy: 'Billing Desk 01 (Emma Watson)',
        notes: `Settled ${lineItems.length} items. Total: ₹${calculations.grandTotal.toFixed(2)}, Paid: ₹${calculations.amountPaid.toFixed(2)}${calculations.balanceDue > 0 ? `, Balance: ₹${calculations.balanceDue.toFixed(2)}` : ''}`
      });

      // Save Bill into medflow_bills_data JSON storage
      const newBill = {
        id: newInvoiceNo,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        date: dateStr,
        amount: calculations.amountPaid,
        status: calculations.paymentStatus === 'Completed' ? 'Paid' : 'Pending',
        items: lineItems.map(item => ({
          description: item.desc,
          price: item.price,
          quantity: item.qty
        })),
        tax: calculations.taxAmount,
        discount: calculations.discountAmount,
        total: calculations.grandTotal
      };
      try {
        const rawBills = localStorage.getItem('medflow_bills_data');
        const existingBills = rawBills ? JSON.parse(rawBills) : [];
        localStorage.setItem('medflow_bills_data', JSON.stringify([newBill, ...(Array.isArray(existingBills) ? existingBills : [])]));
      } catch (err) {
        console.error('Failed to save bill to JSON storage', err);
      }

      let queueCleared = false;
      if (calculations.paymentStatus === 'Completed') {
        queueCleared = checkAndRemoveCompletedPatientFromQueue(selectedPatient.id, selectedPatient.name);
      }

      setIsProcessing(false);
      setSuccessMessage(
        `Invoice ${newInvoiceNo} settled for ₹${calculations.amountPaid.toFixed(2)} (${methodLabel})${
          queueCleared ? ' — Consultation & Payment complete: Patient cleared from Queue!' : ''
        }`
      );
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setActiveTab('payments');
      }, 1600);
    }, 800);
  };

  const handleDownload = async () => {
    const input = document.getElementById('invoice-container');
    if (!input) return;
    
    try {
      const imgData = await toPng(input, { 
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = imgData;
      await img.decode();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${selectedPatient.id || 'PATIENT'}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation encountered an error. Please use the Print button.');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-serif print:p-0">
      {/* Toast Notification */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs print:hidden border border-emerald-400"
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Outpatient Billing & POS Checkout</h2>
          <p className="text-xs text-slate-500">Calculate itemized fees, statutory GST, discounts, and generate official receipts</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-1.5 bg-medical-primary text-white rounded-xl font-bold shadow-xs hover:bg-medical-primary/90 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
            title="Generate and print official invoice"
          >
            <Printer size={14} /> Print Invoice
          </button>
          <button 
            onClick={handleDownload}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs shadow-2xs transition-all cursor-pointer"
            title="Quick PDF Export"
          >
            <Download size={14} /> Export PDF
          </button>
          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl font-bold shadow-xs hover:bg-emerald-700 flex items-center gap-1.5 disabled:opacity-50 text-xs transition-all cursor-pointer"
          >
            {isProcessing ? 'Settling...' : (
              <>
                <Receipt size={14} /> Save & Settle
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Invoice Sheet */}
        <div className="lg:col-span-8">
          <div id="invoice-container" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Invoice Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-medical-primary to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0">
                    {(clinicName || 'M').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {clinicName || 'MedFlow Healthcare Center'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {address || '123 Healthcare Blvd, Bangalore, KA'} • GSTIN: {taxNumber || '29AAACM1234F1Z5'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient Details</p>
                  <div className="relative" ref={patientSearchRef}>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{selectedPatient.name}</h4>
                      <button 
                        onClick={() => setShowPatientSuggestions(!showPatientSuggestions)}
                        className="text-xs text-medical-primary font-bold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-mono text-slate-600 font-medium">{selectedPatient.id}</span>
                    </div>

                    {showPatientSuggestions && (
                      <div className="absolute top-0 left-0 w-72 z-50">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input 
                            type="text" 
                            autoFocus
                            placeholder="Search registered patients..." 
                            value={patientSearch}
                            onChange={(e) => {
                              setPatientSearch(e.target.value);
                              setShowPatientSuggestions(true);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-medical-primary/20 shadow-xl"
                          />
                        </div>
                        <SearchSuggestions 
                          isVisible={showPatientSuggestions} 
                          suggestions={patientSuggestions.filter(s => s.type === 'patient')} 
                          onSelect={handleSelectPatientSuggestion} 
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-sans">{selectedPatient.phone} • {selectedPatient.address}</p>
                </div>
              </div>

              <div className="text-left md:text-right space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invoice Metadata</p>
                <p className="text-xs font-bold font-mono text-slate-900">INV-{new Date().getFullYear()}-0421</p>
                <p className="text-xs text-slate-500 tabular-nums">
                  Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                    calculations.paymentStatus === 'Completed' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : calculations.paymentStatus === 'Partial'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {calculations.paymentStatus === 'Completed' ? 'Fully Paid' : calculations.paymentStatus === 'Partial' ? 'Partially Paid' : 'Pending Settle'}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600">
                    <th className="px-5 py-3">Description & Service Name</th>
                    <th className="px-3 py-3 text-center w-20">Qty</th>
                    <th className="px-3 py-3 text-right w-28">Rate ({currencySymbol})</th>
                    <th className="px-4 py-3 text-right w-32">Total ({currencySymbol})</th>
                    <th className="px-4 py-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {lineItems.map((item) => {
                    const itemTotal = (Math.max(0, item.qty) * Math.max(0, item.price));
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-2.5 font-medium text-slate-900">
                          <div className="relative" ref={activeItemSearchId === item.id ? itemSearchRef : null}>
                            <input 
                              type="text" 
                              value={item.desc}
                              onChange={(e) => {
                                updateItem(item.id, 'desc', e.target.value);
                                setItemSearch(e.target.value);
                                setActiveItemSearchId(item.id);
                              }}
                              onFocus={() => {
                                setActiveItemSearchId(item.id);
                                setItemSearch(item.desc);
                              }}
                              placeholder="Type service name or catalog item..."
                              className="w-full bg-transparent focus:outline-none focus:border-b-2 border-medical-primary text-xs py-1"
                            />
                            <SearchSuggestions 
                              isVisible={activeItemSearchId === item.id} 
                              suggestions={itemSuggestions.filter(s => s.type === 'service')} 
                              onSelect={handleSelectItemSuggestion} 
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input 
                            type="number" 
                            min="1"
                            step="1"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                            className="w-14 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 text-xs font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-medical-primary"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400 font-mono">{currencySymbol}</span>
                            <input 
                              type="number" 
                              min="0"
                              step="0.5"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-20 text-right bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 text-xs font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-medical-primary"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums font-mono text-xs">
                          {currencySymbol}{itemTotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Remove Line Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={5} className="px-5 py-2.5 bg-slate-50/40">
                      <button 
                        onClick={addItem}
                        className="text-medical-primary font-bold text-xs flex items-center gap-1.5 hover:underline cursor-pointer"
                      >
                        <Plus size={14} /> Add Line Item
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Breakdown Section */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between gap-6 font-sans">
              {/* Left Column: Notes & GST selector */}
              <div className="md:w-1/2 space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    GST / Tax Scheme
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'Exempt (0%)', val: 0 },
                      { label: 'Standard (5%)', val: 5 },
                      { label: 'Clinical (12%)', val: 12 },
                      { label: 'Specialty (18%)', val: 18 },
                    ].map((tax) => (
                      <button
                        key={tax.val}
                        type="button"
                        onClick={() => setTaxRate(tax.val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                          taxRate === tax.val 
                            ? 'bg-medical-primary text-white border-medical-primary shadow-xs' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tax.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Payment Notes & Clinical Diagnostic Reference
                  </label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs min-h-[60px] focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
                    placeholder="e.g. Health checkup package discount applied. Doctor consultation approved."
                  />
                </div>
              </div>

              {/* Right Column: Precise Financial Computations */}
              <div className="md:w-1/2 lg:w-5/12 space-y-2 text-xs">
                {/* 1. Subtotal */}
                <div className="flex justify-between items-center text-slate-600">
                  <span>Gross Subtotal</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {currencySymbol}{calculations.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* 2. Discount Line */}
                <div className="flex justify-between items-center text-slate-600 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span>Discount</span>
                    <button
                      type="button"
                      onClick={() => setDiscountType(discountType === 'flat' ? 'percent' : 'flat')}
                      className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700 uppercase"
                      title={`Toggle Flat (${currencySymbol}) vs Percent (%)`}
                    >
                      {discountType === 'flat' ? `${currencySymbol} Flat` : '% Pct'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">-</span>
                    <input 
                      type="number"
                      min="0"
                      step={discountType === 'percent' ? '1' : '10'}
                      value={discountInput === 0 ? '' : discountInput}
                      onChange={(e) => setDiscountInput(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-20 text-right bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono font-bold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 3. Taxable Subtotal (if discount applied) */}
                {calculations.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-slate-500 text-[11px] italic">
                    <span>Taxable Base</span>
                    <span className="font-mono tabular-nums">{currencySymbol}{calculations.taxableAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* 4. GST Breakdown */}
                {taxRate > 0 && (
                  <>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>CGST ({(taxRate / 2).toFixed(1)}%)</span>
                      <span className="font-mono tabular-nums">{currencySymbol}{calculations.cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>SGST ({(taxRate / 2).toFixed(1)}%)</span>
                      <span className="font-mono tabular-nums">{currencySymbol}{calculations.sgstAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {/* 5. Grand Total */}
                <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center text-sm font-bold text-slate-900 bg-slate-100/80 p-2 rounded-xl">
                  <span>Grand Total</span>
                  <span className="font-mono text-base text-medical-primary tabular-nums">
                    {currencySymbol}{calculations.grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* 6. Balance Due or Change Return */}
                {calculations.balanceDue > 0 && (
                  <div className="flex justify-between items-center text-rose-600 font-bold text-xs pt-1">
                    <span>Balance Due</span>
                    <span className="font-mono tabular-nums">{currencySymbol}{calculations.balanceDue.toFixed(2)}</span>
                  </div>
                )}
                {calculations.changeReturn > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold text-xs pt-1">
                    <span>Change to Return</span>
                    <span className="font-mono tabular-nums">{currencySymbol}{calculations.changeReturn.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Checkout / Payment Tender Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calculator size={16} className="text-medical-primary" />
                Payment Tender
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">POS Settle</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Tender Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'card' as const, label: 'Card / POS', icon: CreditCard },
                  { id: 'upi' as const, label: 'UPI / QR', icon: Smartphone },
                  { id: 'cash' as const, label: 'Cash Counter', icon: Banknote },
                  { id: 'bank' as const, label: 'Bank Transfer', icon: Wallet },
                ].map((method) => (
                  <button 
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                      selectedMethod === method.id 
                        ? 'border-medical-primary bg-medical-primary/10 text-medical-primary font-bold shadow-xs' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <method.icon size={18} className="mb-1" />
                    <span className="text-xs">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Paid Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Amount Tendered (₹)
                </label>
                <button
                  type="button"
                  onClick={() => setCustomAmountPaid(calculations.grandTotal)}
                  className="text-[10px] text-medical-primary font-bold hover:underline"
                >
                  Pay Exact (₹{calculations.grandTotal.toFixed(2)})
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  value={customAmountPaid !== null ? customAmountPaid : calculations.grandTotal}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCustomAmountPaid(isNaN(val) ? 0 : val);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 font-bold font-mono text-base text-slate-900 focus:bg-white focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary tabular-nums outline-none"
                />
              </div>
            </div>

            {/* Quick Quick Actions */}
            <div className="space-y-2 pt-1">
              <button 
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-2xs transition-all cursor-pointer"
              >
                <Printer size={14} className="text-slate-500" />
                Preview & Print Official Invoice
              </button>

              <button 
                type="button"
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-2.5 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl font-bold shadow-md shadow-medical-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 text-xs transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm & Record Payment
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Insurance Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 font-sans space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Third-Party Healthcare Coverage</h3>
            <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <CreditCard size={15} />
                </div>
                <p className="font-bold text-xs text-slate-800 truncate">{selectedPatient.insuranceProvider || 'Star Health TPA'}</p>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Policy ID: {selectedPatient.insuranceNumber || 'POL-778899-KA'}</p>
              <div className="pt-1 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-bold">✓ Pre-Auth Eligible</span>
                <span className="text-slate-400">Cashless Cap: ₹50,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Printable Invoice Modal */}
      <InvoicePrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        data={{
          invoiceNumber: `INV-${new Date().getFullYear()}-0421`,
          transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          patientName: selectedPatient.name,
          patientId: selectedPatient.id,
          patientPhone: selectedPatient.phone,
          patientAddress: selectedPatient.address,
          paymentMethod: selectedMethod.toUpperCase(),
          paymentStatus: calculations.paymentStatus === 'Completed' ? 'Paid' : 'Pending',
          receivedBy: 'Billing Desk 01 (Emma Watson)',
          amount: calculations.amountPaid,
          notes: notes || undefined,
          items: lineItems.map(it => ({
            desc: it.desc,
            qty: it.qty,
            price: it.price
          }))
        }}
      />
    </div>
  );
};

export default Billing;
