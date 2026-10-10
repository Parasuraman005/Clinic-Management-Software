import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Calendar, Users, TrendingUp, 
  FileText, Download, Printer, Filter, 
  ArrowUpRight, ArrowDownRight, UserCheck, Clock,
  Activity, ChevronRight, 
  AlertCircle, ShieldCheck, Layers, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

type ReportTab = 'patient' | 'appointment' | 'revenue' | 'billing';

const REPORTS_PREFS_KEY = 'medflow_reports_preferences';

interface ReportsPreferences {
  activeReport: ReportTab;
  dateRange: { start: string; end: string };
  selectedDoctor: string;
  timeframe: 'today' | 'week' | 'month' | 'q4';
}

const getStoredReportsPrefs = (): ReportsPreferences => {
  try {
    const raw = localStorage.getItem(REPORTS_PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    activeReport: 'patient',
    dateRange: { start: '2023-10-01', end: '2023-12-31' },
    selectedDoctor: 'all',
    timeframe: 'q4'
  };
};

const Reports: React.FC = () => {
  const [initialPrefs] = useState<ReportsPreferences>(getStoredReportsPrefs);
  const [activeReport, setActiveReport] = useState<ReportTab>(initialPrefs.activeReport);
  const [dateRange, setDateRange] = useState(initialPrefs.dateRange);
  const [selectedDoctor, setSelectedDoctor] = useState(initialPrefs.selectedDoctor);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'q4'>(initialPrefs.timeframe);

  useEffect(() => {
    try {
      localStorage.setItem(REPORTS_PREFS_KEY, JSON.stringify({
        activeReport,
        dateRange,
        selectedDoctor,
        timeframe
      }));
    } catch (e) {
      console.error('Failed to save reports preferences to JSON', e);
    }
  }, [activeReport, dateRange, selectedDoctor, timeframe]);

  const handlePrint = async () => {
    const input = document.getElementById('report-container');
    if (!input) return;

    try {
      const imgData = await toPng(input, { 
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff'
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
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
    } catch (error) {
      console.error('Print generation failed:', error);
      window.print();
    }
  };

  const handleExport = async () => {
    const input = document.getElementById('report-container');
    if (!input) return;

    try {
      const imgData = await toPng(input, { 
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff'
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = imgData;
      await img.decode();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${activeReport}_report.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  // Detailed breakdown records per report category
  const breakdownData: Record<ReportTab, Array<{ label: string; value: string; progress: number; status: string; detail: string }>> = {
    patient: [
      { label: 'Pediatrics (0-17 yrs)', value: '312 files (37%)', progress: 74, status: 'Optimal', detail: '+14% surge' },
      { label: 'Adult Care (18-59 yrs)', value: '418 files (50%)', progress: 85, status: 'Stable', detail: 'Consistent OPD' },
      { label: 'Geriatric (60+ yrs)', value: '110 files (13%)', progress: 42, status: 'Growing', detail: 'Chronic reviews' },
      { label: 'Referral Patients', value: '88 files (10%)', progress: 58, status: 'Excellent', detail: 'Partner clinics' },
    ],
    appointment: [
      { label: 'General OPD Consultations', value: '740 slots', progress: 88, status: 'Optimal', detail: '94% attendance' },
      { label: 'Specialist Consultations', value: '320 slots', progress: 92, status: 'High Demand', detail: 'Zero backlog' },
      { label: 'Emergency / Walk-ins', value: '118 cases', progress: 65, status: 'Good', detail: 'Avg wait 8m' },
      { label: 'Virtual / Follow-up Visits', value: '62 slots', progress: 45, status: 'Developing', detail: 'Telemed channel' },
    ],
    revenue: [
      { label: 'OPD & Consultations', value: '₹2,14,000 (50%)', progress: 90, status: 'Target Met', detail: 'Primary driver' },
      { label: 'Diagnostic & Lab Tests', value: '₹1,22,500 (29%)', progress: 82, status: 'Healthy', detail: 'Hematology/X-Ray' },
      { label: 'Pharmacy & Dispensary', value: '₹68,400 (16%)', progress: 68, status: 'Optimal', detail: 'In-house script' },
      { label: 'Emergency & Daycare', value: '₹23,100 (5%)', progress: 40, status: 'Normal', detail: 'Observation beds' },
    ],
    billing: [
      { label: 'Cash / Digital UPI', value: '₹3,42,000 (80%)', progress: 95, status: 'Settled', detail: 'Instant clearance' },
      { label: 'Health Insurance (TPA)', value: '₹73,500 (17%)', progress: 72, status: 'In Review', detail: '3 insurers pending' },
      { label: 'Institutional Accounts', value: '₹12,500 (3%)', progress: 50, status: 'Due 15d', detail: 'Corporate clients' },
      { label: 'Audit Discrepancies', value: '₹0 (0.0%)', progress: 100, status: 'Clean', detail: '100% verified' },
    ]
  };

  // Monthly trend bars for compact visual graph
  const trendBars: Record<ReportTab, Array<{ month: string; value: number; label: string }>> = {
    patient: [
      { month: 'Jul', value: 65, label: '115 pts' },
      { month: 'Aug', value: 72, label: '128 pts' },
      { month: 'Sep', value: 80, label: '136 pts' },
      { month: 'Oct', value: 88, label: '142 pts' },
      { month: 'Nov', value: 94, label: '150 pts' },
      { month: 'Dec', value: 100, label: '168 pts' },
    ],
    appointment: [
      { month: 'Jul', value: 68, label: '980 slots' },
      { month: 'Aug', value: 75, label: '1,040 slots' },
      { month: 'Sep', value: 82, label: '1,120 slots' },
      { month: 'Oct', value: 90, label: '1,190 slots' },
      { month: 'Nov', value: 92, label: '1,210 slots' },
      { month: 'Dec', value: 96, label: '1,240 slots' },
    ],
    revenue: [
      { month: 'Jul', value: 60, label: '₹3.4L' },
      { month: 'Aug', value: 70, label: '₹3.7L' },
      { month: 'Sep', value: 82, label: '₹4.0L' },
      { month: 'Oct', value: 85, label: '₹4.1L' },
      { month: 'Nov', value: 92, label: '₹4.2L' },
      { month: 'Dec', value: 98, label: '₹4.28L' },
    ],
    billing: [
      { month: 'Jul', value: 70, label: '880 inv' },
      { month: 'Aug', value: 78, label: '940 inv' },
      { month: 'Sep', value: 84, label: '1,010 inv' },
      { month: 'Oct', value: 88, label: '1,080 inv' },
      { month: 'Nov', value: 94, label: '1,120 inv' },
      { month: 'Dec', value: 99, label: '1,150 inv' },
    ]
  };

  const ReportCard = ({ 
    title, 
    value, 
    trend, 
    trendType, 
    desc, 
    color 
  }: { 
    title: string; 
    value: string; 
    trend: string; 
    trendType: 'up' | 'down'; 
    desc: string; 
    color: string; 
  }) => (
    <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs hover:border-medical-primary/50 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-1 mb-1">
        <p className="text-[7.5pt] text-slate-500 font-bold uppercase tracking-wider truncate">{title}</p>
        <span className={`px-1.5 py-0.5 rounded text-[7.5pt] font-bold flex items-center gap-0.5 shrink-0 ${
          trendType === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {trendType === 'up' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {trend}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-lg font-bold text-slate-900 tabular-nums leading-none tracking-tight">{value}</p>
        <p className="text-[7.5pt] text-slate-600 font-medium truncate">{desc}</p>
      </div>
      <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: trendType === 'up' ? '78%' : '48%' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-2.5 font-serif pb-2 animate-in fade-in duration-300">
      {/* 1. Minimized Strategic Header Strip */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-medical-primary/10 text-medical-primary flex items-center justify-center font-bold text-sm shrink-0">
            <BarChart3 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">Institutional Analytics & Reports</h2>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[7.5pt] font-bold rounded-full border border-emerald-100 uppercase tracking-wide">
                Live Audit Active
              </span>
            </div>
            <p className="text-[8pt] text-slate-500">Q4 Clinical Performance, Diagnostic Throughput & Revenue Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['today', 'week', 'month', 'q4'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 text-[8pt] font-bold rounded-md transition-all uppercase ${
                  timeframe === t 
                    ? 'bg-white text-medical-primary shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'q4' ? 'Q4 (Quarter)' : t}
              </button>
            ))}
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
            title="Download PDF Summary"
          >
            <Download size={14} /> Export PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-medical-primary text-white rounded-lg text-xs font-bold hover:bg-medical-primary/90 shadow-xs transition-all"
            title="Print Full Audit Report"
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div id="report-container" className="space-y-2.5 print:p-0">
        {/* 2. Navigation Tabs & Quick Filter Strip in one compact row */}
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2 print:hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'patient', label: 'Patient Demographics', icon: Users, badge: '840 Files' },
              { id: 'appointment', label: 'Operations & Visits', icon: Calendar, badge: '1,240 Visits' },
              { id: 'revenue', label: 'Financial Summary', icon: TrendingUp, badge: '₹4.28L Gross' },
              { id: 'billing', label: 'Billing Integrity', icon: FileText, badge: '99.8% Audit' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as ReportTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeReport === tab.id 
                  ? 'bg-medical-primary text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
                <span className={`text-[7.5pt] px-1.5 py-0.2 rounded-full font-semibold ${
                  activeReport === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto text-xs">
            <div className="flex items-center gap-1 text-slate-500 text-[8pt] font-bold uppercase tracking-wider shrink-0">
              <Filter size={12} />
              <span>Range:</span>
            </div>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[8pt] text-slate-700 focus:outline-none focus:border-medical-primary" 
            />
            <span className="text-slate-400 text-xs">to</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[8pt] text-slate-700 focus:outline-none focus:border-medical-primary" 
            />
            <select 
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[8pt] text-slate-700 cursor-pointer focus:outline-none focus:border-medical-primary"
            >
              <option value="all">All Doctors</option>
              <option value="dr_sharma">Dr. Sharma (Cardio)</option>
              <option value="dr_patel">Dr. Patel (Pediatrics)</option>
              <option value="dr_verma">Dr. Verma (Orthopedics)</option>
            </select>
          </div>
        </div>

        {/* 3. Dynamic Report Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeReport}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-2.5"
          >
            {/* Top 4 Minimized KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {activeReport === 'patient' && (
                <>
                  <ReportCard title="New Registrations" value="142" trend="+12.5%" trendType="up" desc="vs last month" color="bg-blue-600" />
                  <ReportCard title="Active Files" value="840" trend="+5.2%" trendType="up" desc="Monthly engaged" color="bg-indigo-600" />
                  <ReportCard title="Revisit Rate" value="2.4" trend="-0.1" trendType="down" desc="Visits per patient" color="bg-amber-600" />
                  <ReportCard title="Patient Loyalty" value="88%" trend="+2.4%" trendType="up" desc="Follow-up success" color="bg-emerald-600" />
                </>
              )}
              {activeReport === 'appointment' && (
                <>
                  <ReportCard title="Total Bookings" value="1,240" trend="+18%" trendType="up" desc="Current quarter" color="bg-blue-600" />
                  <ReportCard title="Utilization Rate" value="92%" trend="+4%" trendType="up" desc="Slot efficiency" color="bg-indigo-600" />
                  <ReportCard title="Cancellation Rate" value="4.2%" trend="-1.5%" trendType="up" desc="Patient drop-off" color="bg-emerald-600" />
                  <ReportCard title="Avg. Wait Time" value="12m" trend="-3m" trendType="up" desc="Clinic throughput" color="bg-emerald-600" />
                </>
              )}
              {activeReport === 'revenue' && (
                <>
                  <ReportCard title="Gross Collections" value="₹4.28L" trend="+15%" trendType="up" desc="Operational revenue" color="bg-medical-primary" />
                  <ReportCard title="Avg. Ticket Size" value="₹1,850" trend="+₹120" trendType="up" desc="Per patient visit" color="bg-indigo-600" />
                  <ReportCard title="Outstandings" value="₹12.5k" trend="-10%" trendType="up" desc="Pending settlements" color="bg-amber-600" />
                  <ReportCard title="Refund Rate" value="0.2%" trend="Stable" trendType="up" desc="Policy compliance" color="bg-emerald-600" />
                </>
              )}
              {activeReport === 'billing' && (
                <>
                  <ReportCard title="Invoices Raised" value="1,150" trend="+20%" trendType="up" desc="Total billed" color="bg-blue-600" />
                  <ReportCard title="Audit Accuracy" value="99.8%" trend="Fixed" trendType="up" desc="System integrity" color="bg-emerald-600" />
                  <ReportCard title="Discounting" value="1.5%" trend="+0.2%" trendType="down" desc="Profit impact" color="bg-rose-600" />
                  <ReportCard title="Tax Liability" value="₹21.4k" trend="Accrued" trendType="up" desc="Monthly provision" color="bg-slate-600" />
                </>
              )}
            </div>

            {/* Desktop 2-Column Minimized Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
              {/* Left Column (8 cols): Trend Visualization & Breakdown Table */}
              <div className="lg:col-span-8 space-y-2.5">
                {/* Minimized Trend Bar Visualization */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-4 py-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={15} className="text-medical-primary" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                        {activeReport.toUpperCase()} Multi-Month Trajectory (H2 2023)
                      </h3>
                    </div>
                    <span className="text-[7.5pt] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                      Audited Series
                    </span>
                  </div>

                  {/* 6-Month Visual Bar Chart */}
                  <div className="grid grid-cols-6 gap-2 items-end h-20 pt-1 pb-1 px-1">
                    {trendBars[activeReport].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group">
                        <span className="text-[7pt] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-0.5 tabular-nums">
                          {item.label}
                        </span>
                        <div className="w-full bg-slate-100 rounded-t-sm h-12 flex items-end overflow-hidden p-0.5">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${item.value}%` }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className={`w-full rounded-t-sm ${
                              idx === 5 ? 'bg-medical-primary' : 'bg-slate-300 group-hover:bg-medical-primary/70'
                            } transition-colors`}
                          />
                        </div>
                        <span className="text-[7.5pt] text-slate-600 font-bold mt-1 uppercase tracking-tight">
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minimized Detailed Breakdown Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-slate-500" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                        Detailed Categorical Breakdown
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[7.5pt] font-bold rounded-full border border-emerald-100">
                      Live Database Sync
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white border-b border-slate-100 font-sans">
                          <th className="px-3 py-1.5 text-[7.5pt] font-bold text-slate-400 uppercase tracking-wider">Indicator / Segment</th>
                          <th className="px-3 py-1.5 text-[7.5pt] font-bold text-slate-400 uppercase tracking-wider text-right">Volume / Value</th>
                          <th className="px-3 py-1.5 text-[7.5pt] font-bold text-slate-400 uppercase tracking-wider text-center">Efficiency</th>
                          <th className="px-3 py-1.5 text-[7.5pt] font-bold text-slate-400 uppercase tracking-wider text-right">Audited Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {breakdownData[activeReport].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3 py-1.5">
                              <span className="font-bold text-slate-800">{row.label}</span>
                              <span className="block text-[7.5pt] text-slate-400 font-normal">{row.detail}</span>
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-slate-900 tabular-nums">
                              {row.value}
                            </td>
                            <td className="px-3 py-1.5 text-center min-w-[90px]">
                              <div className="w-18 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto">
                                <div className="h-full bg-medical-primary rounded-full" style={{ width: `${row.progress}%` }} />
                              </div>
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              <span className="inline-flex items-center gap-1 text-[7.5pt] font-bold uppercase text-emerald-600 bg-emerald-50/80 px-1.5 py-0.5 rounded">
                                <CheckCircle2 size={10} />
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Executive Insight, Activity Stream & System Notice */}
              <div className="lg:col-span-4 space-y-2">
                {/* Minimized Executive Insight Card */}
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 rounded-xl p-3 text-white shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-300">
                      <ShieldCheck size={15} />
                      <h4 className="text-[8pt] font-bold uppercase tracking-wider">Executive Insight</h4>
                    </div>
                    <span className="text-[7pt] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded uppercase font-bold">
                      AI Diagnostic
                    </span>
                  </div>
                  <p className="text-[8.5pt] text-indigo-100/90 leading-snug font-medium">
                    {activeReport === 'patient' && '"Pediatric inflow increased by 14% this quarter. Recommend opening another morning pediatrician slot on Tuesdays & Thursdays."'}
                    {activeReport === 'appointment' && '"Slot utilization is at 92%. Peak bottleneck occurs between 10:30 AM - 12:00 PM. Telemed follow-ups can relieve 15% pressure."'}
                    {activeReport === 'revenue' && '"Gross collections rose 15% to ₹4.28L. Diagnostic lab contributions grew +18%, establishing pathology as a high-margin pillar."'}
                    {activeReport === 'billing' && '"Audit accuracy achieved 99.8%. TPA insurance claims have ₹73.5k pending settlement within standard 30-day turnaround."'}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-indigo-800/60 flex items-center justify-between">
                    <span className="text-[7.5pt] text-indigo-300 font-semibold">Priority: High</span>
                    <button className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 rounded-lg text-[7.5pt] font-bold uppercase tracking-wider text-white transition-all">
                      Apply Protocol
                    </button>
                  </div>
                </div>

                {/* Minimized Activity Stream */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                    <h3 className="text-[8pt] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity size={12} className="text-medical-primary" />
                      Live Audit Stream
                    </h3>
                    <span className="text-[7pt] text-slate-400 font-semibold">Real-time</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { time: '10:42 AM', event: 'Daily Revenue Target Met', detail: '₹48k reached', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { time: '09:15 AM', event: 'Appointment Density High', detail: 'Waiting time: 12m', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { time: 'Yesterday', event: 'Monthly Audit Certified', detail: '1,150 bills verified', icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-md ${log.bg} ${log.color} flex items-center justify-center shrink-0`}>
                            <log.icon size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8pt] font-bold text-slate-800 truncate">{log.event}</p>
                            <p className="text-[7pt] text-slate-400 truncate">{log.detail}</p>
                          </div>
                        </div>
                        <span className="text-[7pt] text-slate-400 font-bold uppercase tabular-nums shrink-0">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minimized System Notice Banner */}
                <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2 shadow-xs">
                  <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-[8pt] font-bold uppercase tracking-tight text-amber-900">Settlement Notice</h4>
                      <button className="text-[7.5pt] font-bold text-amber-700 hover:text-amber-900 uppercase flex items-center gap-0.5 shrink-0">
                        Review <ChevronRight size={11} />
                      </button>
                    </div>
                    <p className="text-[7.5pt] text-amber-800 leading-snug">
                      Insurance provider 'HealthPlus' pending receivables: ₹42,000. Verification due in 3 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Reports;
