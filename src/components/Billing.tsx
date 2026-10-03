import React, { useState, useRef, useEffect } from 'react';
import { 
  Receipt, Printer, Download, Mail, Plus, Trash2, 
  CreditCard, Banknote, Smartphone, Wallet, Check,
  CheckCircle2, Search, User, ChevronDown
} from 'lucide-react';
import { mockPatients } from '../mockData';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import SearchSuggestions, { SuggestionItem } from './SearchSuggestions';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { Patient } from '../types';
import { InvoicePrintModal, InvoicePrintData } from './InvoicePrintModal';

interface BillingProps {
  setActiveTab: (tab: string) => void;
}

const Billing: React.FC<BillingProps> = ({ setActiveTab }) => {
  const [selectedPatient, setSelectedPatient] = React.useState<Patient>(mockPatients[0]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState('card');
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
      const patient = mockPatients.find(p => p.id === item.id);
      if (patient) {
        setSelectedPatient(patient);
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

  const [lineItems, setLineItems] = React.useState([
    { id: 1, desc: 'Consultation Fee (Dr. Sarah Chen)', qty: 1, price: 100 },
    { id: 2, desc: 'Complete Blood Count (CBC) Test', qty: 1, price: 45 },
    { id: 3, desc: 'Chest X-Ray', qty: 1, price: 85 },
  ]);

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handlePrint = async () => {
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
      
      // Open print dialog directly
      const blob = pdf.output('bloburl');
      const printWindow = window.open(blob);
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } catch (error) {
      console.error('Print generation failed:', error);
      window.print(); // Fallback
    }
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
      pdf.save(`Invoice_${selectedPatient.id}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try printing to PDF instead.');
    }
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      desc: 'New Item',
      qty: 1,
      price: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setActiveTab('dashboard');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 print:p-0">
      {isSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-bold text-[12pt] print:hidden"
        >
          <CheckCircle2 size={20} />
          Invoice Processed Successfully!
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 print:hidden">
        <div>
          <h2 className="text-[13pt] font-bold text-slate-900">Billing & Invoicing</h2>
          <p className="text-[11pt] text-slate-500">Manage patient payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-1.5 bg-medical-primary text-white rounded-lg font-bold shadow-sm hover:bg-medical-primary/90 flex items-center gap-2 text-xs transition-all cursor-pointer"
            title="Generate and print official invoice"
          >
            <Printer size={15} /> Print Invoice
          </button>
          <button 
            onClick={handleDownload}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
            title="Quick PDF Export"
          >
            <Download size={14} /> Quick PDF
          </button>
          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold shadow-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 text-xs transition-all cursor-pointer"
          >
            {isProcessing ? 'Processing...' : (
              <>
                <Receipt size={15} /> Save & Settle
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Invoice Body */}
        <div className="lg:col-span-8">
          <div id="invoice-container" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/30">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-medical-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                    MF
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">MedFlow Healthcare Clinic</h3>
                    <p className="text-[10px] text-slate-500">123 Healthcare Blvd, Bangalore, KA • +91 98765-43210</p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8pt] text-slate-400 font-bold uppercase">Bill To</p>
                  <div className="relative" ref={patientSearchRef}>
                    <div className="flex items-center gap-2 group">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{selectedPatient.name}</h4>
                      <button 
                        onClick={() => setShowPatientSuggestions(!showPatientSuggestions)}
                        className="text-[9pt] text-medical-primary font-bold hover:underline opacity-100 flex items-center gap-1 cursor-pointer"
                      >
                        Change
                      </button>
                      <button 
                        onClick={() => setShowPrintModal(true)}
                        className="ml-auto px-2.5 py-1 bg-medical-primary/10 text-medical-primary hover:bg-medical-primary hover:text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Print Invoice"
                      >
                        <Printer size={12} /> Print Invoice
                      </button>
                    </div>
                    {showPatientSuggestions && (
                      <div className="absolute top-0 left-0 w-64 z-50">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input 
                            type="text" 
                            autoFocus
                            placeholder="Search patient..." 
                            value={patientSearch}
                            onChange={(e) => {
                              setPatientSearch(e.target.value);
                              setShowPatientSuggestions(true);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-[10pt] focus:outline-none focus:ring-2 focus:ring-medical-primary/20 shadow-lg"
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
                  <p className="text-[10pt] text-slate-500">{selectedPatient.address}</p>
                </div>
              </div>
              <div className="text-left md:text-right space-y-2">
                <div className="space-y-0.5">
                  <p className="text-[8pt] text-slate-400 font-bold uppercase">Invoice Details</p>
                  <p className="text-[11pt] font-bold text-slate-900">INV-2023-10-001</p>
                  <p className="text-[10pt] text-slate-500 tabular-nums">Date: 30/10/2023</p>
                </div>
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-[8pt] font-bold rounded-full uppercase">Pending</span>
              </div>
            </div>

            <div className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-2.5 text-[10pt] font-bold text-slate-600">Description</th>
                    <th className="px-4 py-2.5 text-[10pt] font-bold text-slate-600 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-[10pt] font-bold text-slate-600 text-right">Price</th>
                    <th className="px-4 py-2.5 text-[10pt] font-bold text-slate-600 text-right">Total</th>
                    <th className="px-6 py-2.5 text-[10pt] font-bold text-slate-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10pt]">
                  {lineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30">
                      <td className="px-6 py-2.5 font-medium text-slate-900">
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
                            className="w-full bg-transparent focus:outline-none focus:border-b border-medical-primary/20"
                          />
                          <SearchSuggestions 
                            isVisible={activeItemSearchId === item.id} 
                            suggestions={itemSuggestions.filter(s => s.type === 'service')} 
                            onSelect={handleSelectItemSuggestion} 
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center tabular-nums">
                        <input 
                          type="number" 
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                          className="w-12 text-center bg-transparent focus:outline-none focus:border-b border-medical-primary/20"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        <div className="flex items-center justify-end gap-1">
                          <span>₹</span>
                          <input 
                            type="number" 
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-20 text-right bg-transparent focus:outline-none focus:border-b border-medical-primary/20"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">₹{(item.qty * item.price).toFixed(2)}</td>
                      <td className="px-6 py-2.5 text-right">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-all opacity-100"
                          title="Delete Item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="px-6 py-2">
                      <button 
                        onClick={addItem}
                        className="text-medical-primary font-bold text-[9pt] flex items-center gap-1 hover:underline"
                      >
                        <Plus size={14} /> Add Line Item
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-6">
              <div className="md:w-1/2 space-y-1.5">
                <p className="text-[8pt] text-slate-400 font-bold uppercase">Payment Notes</p>
                <textarea 
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10pt] min-h-[60px] focus:outline-none focus:ring-1 focus:ring-medical-primary/30"
                  placeholder="Notes..."
                ></textarea>
              </div>
              <div className="md:w-1/3 space-y-2">
                <div className="flex justify-between text-slate-600 text-[10pt]">
                  <span>Subtotal</span>
                  <span className="font-medium tabular-nums">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10pt]">
                  <span>Tax (5%)</span>
                  <span className="font-medium tabular-nums">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10pt]">
                  <span>Discount</span>
                  <input type="text" defaultValue="-₹0.00" className="w-16 text-right bg-transparent border-b border-dashed border-slate-300 focus:outline-none" />
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[13pt] font-bold text-slate-900">
                  <span>Total</span>
                  <span className="tabular-nums">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-[12pt] font-bold text-slate-900 mb-4">Record Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[8pt] text-slate-400 font-bold uppercase block mb-1.5">Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cash', label: 'Cash', icon: Banknote },
                    { id: 'card', label: 'Card', icon: CreditCard },
                    { id: 'upi', label: 'UPI', icon: Smartphone },
                    { id: 'bank', label: 'Bank', icon: Wallet },
                  ].map((method) => (
                    <button 
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        selectedMethod === method.id ? 'border-medical-primary bg-medical-primary/5 text-medical-primary ring-1 ring-medical-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <method.icon size={18} className="mb-0.5" />
                      <span className="text-[9pt] font-bold">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[8pt] text-slate-400 font-bold uppercase block mb-1.5">Amount Paid</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-[11pt]">₹</span>
                  <input 
                    type="text" 
                    defaultValue="24150.50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-7 pr-3 font-bold text-[12pt] text-slate-900 focus:ring-1 focus:ring-medical-primary/30 tabular-nums outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <button 
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="w-full py-2 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 rounded-lg font-bold flex items-center justify-center gap-2 text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Printer size={14} className="text-slate-600" />
                  Print Invoice
                </button>
                <button 
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50 text-[11pt] cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-[12pt] font-bold text-slate-900 mb-3">Insurance</h3>
            <div className="p-3 rounded-lg border-2 border-dashed border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                  <CreditCard size={16} />
                </div>
                <p className="font-bold text-[10pt] text-slate-700 truncate">{selectedPatient.insuranceProvider}</p>
              </div>
              <p className="text-[10pt] text-slate-500 tabular-nums">ID: {selectedPatient.insuranceNumber}</p>
              <button className="text-medical-primary text-[9pt] font-bold mt-2 hover:underline">Verify Eligibility</button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Printable Invoice Modal */}
      <InvoicePrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        data={{
          invoiceNumber: 'INV-2023-001',
          transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          patientName: selectedPatient.name,
          patientId: selectedPatient.id,
          patientPhone: selectedPatient.phone,
          patientAddress: selectedPatient.address,
          paymentMethod: selectedMethod.toUpperCase(),
          paymentStatus: 'Paid',
          receivedBy: 'Hospital Cash Counter',
          amount: total,
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
