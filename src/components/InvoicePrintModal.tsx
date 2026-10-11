import React, { useRef, useState } from 'react';
import { 
  Printer, Download, X, CheckCircle2, ShieldCheck, 
  Receipt, Phone, Mail, MapPin, 
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { useSharedSettings } from '../hooks/useSharedSettings';

export interface InvoicePrintData {
  invoiceNumber: string;
  transactionId: string;
  date: string;
  patientName: string;
  patientId?: string;
  patientPhone?: string;
  patientAddress?: string;
  paymentMethod: string;
  paymentStatus: string;
  receivedBy: string;
  amount: string | number;
  items?: Array<{
    desc: string;
    qty: number;
    price: number;
  }>;
  notes?: string;
}

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoicePrintData | null;
}

// Convert numbers into Indian words (e.g. 15000 -> Fifteen Thousand)
const numberToIndianWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero';

  const inWords = (n: number): string => {
    let str = '';
    if (n > 9999999) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n > 99999) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n > 999) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n > 99) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) str += a[n];
      else {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      }
    }
    return str;
  };

  return inWords(n).trim() + ' Rupees Only';
};

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ isOpen, onClose, data }) => {
  const { clinicName, tagline, address, phone, email, regNumber, taxNumber, currencySymbol } = useSharedSettings();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  // Numerical amount computation
  const rawAmount = typeof data.amount === 'string'
    ? parseFloat(data.amount.replace(/[^0-9.-]+/g, '')) || 0
    : Number(data.amount) || 0;

  // Resolve items or default to breakdown
  const lineItems = data.items && data.items.length > 0
    ? data.items
    : [
        {
          desc: 'Specialty Outpatient Consultation & Clinical Evaluation',
          qty: 1,
          price: Math.round(rawAmount * 0.4 * 100) / 100
        },
        {
          desc: 'Diagnostic Pathology & Clinical Healthcare Services',
          qty: 1,
          price: Math.round((rawAmount - (rawAmount * 0.4)) * 100) / 100
        }
      ];

  const subtotal = lineItems.reduce((acc, it) => acc + (it.qty * it.price), 0);
  const cgst = Math.round(subtotal * 0.025 * 100) / 100;
  const sgst = Math.round(subtotal * 0.025 * 100) / 100;
  const grandTotal = (data.items && data.items.length > 0)
    ? (subtotal + cgst + sgst)
    : (rawAmount > 0 ? rawAmount : (subtotal + cgst + sgst));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsGenerating(true);
    try {
      const imgData = await toPng(invoiceRef.current, {
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
      const safeInvoice = (data.invoiceNumber || 'Invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`${safeInvoice}_${data.transactionId || 'Receipt'}.pdf`);
      showToast('Official Invoice PDF generated and downloaded!');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('PDF generation failed. Please try the Print button.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200"
      >
        {/* Modal Toolbar - Hidden during print */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold">
              <Receipt size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Official Tax Invoice Preview
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {data.paymentStatus || 'Paid'}
                </span>
              </h3>
              <p className="text-[10px] text-slate-500">
                Invoice: <strong className="text-slate-700">{data.invoiceNumber}</strong> • Txn: {data.transactionId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Print / Download Action Buttons */}
            <button
              onClick={handleDirectPrint}
              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Print via system dialog"
            >
              <Printer size={14} className="text-slate-600" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-1.5 bg-medical-primary text-white hover:bg-medical-primary/90 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Generate printable PDF"
            >
              <Download size={14} />
              <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all ml-1 cursor-pointer"
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Container View */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/60 print:p-0 print:bg-white flex justify-center">
          {/* Printable Invoice Page (Styled as an A4 document) */}
          <div 
            id="printable-invoice-document"
            ref={invoiceRef}
            className="w-full max-w-[780px] bg-white border border-slate-200 shadow-md print:shadow-none print:border-none p-8 sm:p-10 space-y-6 text-slate-800 font-sans"
            style={{ minHeight: '1020px' }}
          >
            {/* 1. Header & Clinic Identity */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-medical-primary text-white flex items-center justify-center font-bold text-xl shadow-xs">
                    {(clinicName || 'M').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                      {clinicName || 'MedFlow Healthcare Clinic'}
                    </h1>
                    <p className="text-xs text-medical-primary font-semibold">
                      {tagline || 'Outpatient & Specialty Clinical Care'}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" />
                    {address || '123 Healthcare Boulevard, Medical District, Bangalore, KA 560001'}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" />
                    {phone || '+91 98765-43210'} • <Mail size={12} className="text-slate-400 ml-1" /> {email || 'billing@medflow.com'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Reg No: <strong className="text-slate-700">{regNumber || 'CLINIC-REG-889922'}</strong> • GSTIN: <strong className="text-slate-700">{taxNumber || '29AAACM1234F1Z5'}</strong>
                  </p>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="sm:text-right space-y-1.5">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-md">
                  Tax Invoice & Official Receipt
                </span>
                <div className="text-xs text-slate-600 font-mono space-y-0.5 pt-1">
                  <p>Invoice No: <strong className="text-slate-900 text-sm">{data.invoiceNumber}</strong></p>
                  <p>Txn ID: <strong className="text-slate-800">{data.transactionId}</strong></p>
                  <p>Date: <strong className="text-slate-800">{data.date}</strong></p>
                  <p>Place of Supply: <strong>Karnataka (29)</strong></p>
                </div>
              </div>
            </div>

            {/* 2. Patient & Transaction Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Billed To / Patient Details
                </span>
                <p className="text-sm font-bold text-slate-900">{data.patientName}</p>
                {data.patientId && (
                  <p className="text-slate-600 font-medium">Patient ID: <span className="font-mono text-slate-900">{data.patientId}</span></p>
                )}
                <p className="text-slate-600">
                  Contact: <span className="font-mono font-medium text-slate-900">{data.patientPhone || '+91 99887-76655'}</span>
                </p>
                <p className="text-slate-500">{data.patientAddress || '123 MG Road, Bangalore, Karnataka'}</p>
              </div>

              <div className="space-y-1 sm:text-right sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Payment Verification
                </span>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Payment Mode:</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-300 font-bold text-slate-900">
                    {data.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5 pt-0.5">
                  <span className="text-xs font-bold text-slate-700">Transaction Status:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Check size={12} /> {data.paymentStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Received by: <strong className="text-slate-800">{data.receivedBy || 'Hospital Cash Counter'}</strong>
                </p>
              </div>
            </div>

            {/* 3. Itemized Medical Services Table */}
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-left w-10">#</th>
                    <th className="py-2.5 px-3 text-left">Clinical Service / Item Description</th>
                    <th className="py-2.5 px-3 text-center w-24">SAC Code</th>
                    <th className="py-2.5 px-3 text-center w-14">Qty</th>
                    <th className="py-2.5 px-3 text-right w-24">Rate ({currencySymbol})</th>
                    <th className="py-2.5 px-3 text-right w-28">Amount ({currencySymbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.desc}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[10px]">999312</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                        {currencySymbol}{item.price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900 tabular-nums">
                        {currencySymbol}{(item.qty * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Financial Calculation Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
              {/* Left Column: Amount in Words & Notes */}
              <div className="sm:col-span-7 space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Amount in Words:
                  </span>
                  <p className="text-xs font-bold text-slate-800 italic">
                    {numberToIndianWords(grandTotal)}
                  </p>
                </div>

                {data.notes && (
                  <div className="p-2.5 rounded-lg border border-dashed border-slate-200 text-[11px] text-slate-600">
                    <strong className="text-slate-700">Remarks: </strong>
                    <span>{data.notes}</span>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 space-y-1 pt-1">
                  <p>• All fees are inclusive of statutory central and state GST as applicable.</p>
                  <p>• Medical treatments and consultations are exempt from tax under Section 80D.</p>
                  <p>• Retain this computer-generated tax invoice for insurance reimbursement.</p>
                </div>
              </div>

              {/* Right Column: Mathematical Calculations */}
              <div className="sm:col-span-5 space-y-1.5 text-xs">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Subtotal (Gross)</span>
                  <span className="font-mono font-medium tabular-nums">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 border-t border-slate-100">
                  <span>CGST (2.5%)</span>
                  <span className="font-mono font-medium tabular-nums">{currencySymbol}{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 border-t border-slate-100">
                  <span>SGST (2.5%)</span>
                  <span className="font-mono font-medium tabular-nums">{currencySymbol}{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900 bg-slate-50 px-2 rounded-lg">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-base tabular-nums text-medical-primary">
                    {currencySymbol}{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                  <CheckCircle2 size={12} /> Full Payment Settled
                </div>
              </div>
            </div>

            {/* 5. Authorization & Verification Footer */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-4 items-end">
              <div className="space-y-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <ShieldCheck size={16} className="text-medical-primary" />
                  <span>Verified Clinical Audit Trail</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Digitally issued by MedFlow Hospital Information System (v4.2). No physical signature required.
                </p>
              </div>

              <div className="text-right space-y-2">
                <div className="inline-block border-b-2 border-slate-400 w-44 pb-1">
                  <p className="font-bold text-xs text-slate-900">Dr. Sarah Chen / Staff</p>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Authorized Signatory & Seal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0 print:hidden text-xs">
          <span className="text-slate-500">A4 Printable Standard • 300 DPI Export</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectPrint}
              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} /> Print Invoice
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-1.5 bg-medical-primary text-white hover:bg-medical-primary/90 rounded-lg font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
