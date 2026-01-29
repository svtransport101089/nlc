
import React, { useState, useEffect } from 'react';
import { GroupHeaderData, Member, QuarterlyUpdate, CATEGORIES } from './types';
import GroupHeader from './components/GroupHeader';
import MembersTable from './components/MembersTable';
import QuarterlyMetrics from './components/QuarterlyMetrics';
import { analyzeReport } from './services/geminiService';

const STORAGE_KEY = 'nlc_tracker_data_v1';

const App: React.FC = () => {
  // Initial state logic: Try to load from localStorage first
  const [header, setHeader] = useState<GroupHeaderData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).header;
      } catch (e) { console.error(e); }
    }
    return {
      nlcNo: '102',
      region: 'South Dist',
      areaPastor: 'Rev. Smith',
      leaderName: 'John Doe',
      coLeader: 'Jane Roe',
      year: '2026'
    };
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).members;
      } catch (e) { console.error(e); }
    }
    return [
      { id: '1', sn: 1, name: 'Judah', regNo: 'Registered', phone: '555-0101' },
      { id: '2', sn: 2, name: 'Isak', regNo: 'Registered', phone: '555-0102' },
      { id: '3', sn: 3, name: 'Arul Rithis', regNo: 'Irregular', phone: '555-0103' },
      { id: '4', sn: 4, name: 'Akash', regNo: 'Registered', phone: '555-0104' },
      { id: '5', sn: 5, name: 'Sam Alwino', regNo: 'Registered', phone: '555-0105' },
    ];
  });

  const [updates, setUpdates] = useState<QuarterlyUpdate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).updates;
      } catch (e) { console.error(e); }
    }
    return CATEGORIES.map(cat => ({ category: cat, q1: '', q2: '', q3: '', q4: '' }));
  });

  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Persist to localStorage whenever state changes
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const dataToSave = { header, members, updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setSaveStatus('saved');
    }, 500); // Debounce save to avoid excessive writes
    return () => clearTimeout(timer);
  }, [header, members, updates]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeReport(header, members, updates);
    setAiResult(result);
    setIsAnalyzing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 transition-all">
      {/* Landscape Print Engine */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 5mm;
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 9pt;
          }
          .min-h-screen {
            padding: 0 !important;
            background: #ffffff !important;
          }
          .max-w-screen-2xl, .max-w-\\[1800px\\] {
            max-width: none !important;
            width: 100% !important;
          }
          .print-grid-layout {
            display: grid !important;
            grid-template-columns: 3.5fr 8.5fr !important;
            gap: 10px !important;
            align-items: start !important;
          }
          .shadow-2xl, .shadow-sm, .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          .rounded-3xl, .rounded-2xl {
            border-radius: 4px !important;
            border: 1px solid #cbd5e1 !important;
          }
          .bg-white {
            background: white !important;
          }
          button, .print-hidden {
            display: none !important;
          }
          input, select, textarea {
            border: none !important;
            background: transparent !important;
            padding: 1px !important;
            font-weight: 500 !important;
          }
          textarea {
            height: auto !important;
            min-height: unset !important;
          }
          .bg-indigo-900 { background-color: #1e1b4b !important; }
          .section-block {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="max-w-[1920px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 px-4 print-hidden">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">NLC Leadership Tracker</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase transition-all ${saveStatus === 'saved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 animate-pulse'}`}>
                  {saveStatus === 'saved' ? '✓ Saved' : '... Saving'}
                </span>
              </div>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mt-1">Full Landscape Reporting Method</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-slate-400 hover:text-red-500 px-4 py-2 text-xs font-bold transition-all uppercase tracking-widest"
              title="Clear all saved data"
            >
              Reset Form
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl border border-slate-200 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 bg-indigo-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {isAnalyzing ? 'Analyzing...' : 'AI Audit'}
            </button>
          </div>
        </header>

        {/* Main Landscape Ledger Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 lg:p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-900 print:h-1"></div>
          
          <div className="section-block">
            <GroupHeader data={header} onChange={setHeader} />
          </div>

          {aiResult && (
            <div className="section-block bg-indigo-50/30 border-l-4 border-indigo-900 rounded-r-xl p-6 relative animate-in fade-in slide-in-from-top-2 duration-300 print:bg-white print:border-slate-200">
              <button onClick={() => setAiResult(null)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 print:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-indigo-900 font-bold text-sm mb-2 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                AI Performance Analysis
              </h3>
              <div className="prose prose-slate prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                {aiResult}
              </div>
            </div>
          )}

          {/* Adjacent Side-by-Side Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print-grid-layout">
            <div className="lg:col-span-4 section-block h-full">
              <MembersTable members={members} onUpdate={setMembers} />
            </div>
            <div className="lg:col-span-8 section-block h-full">
              <QuarterlyMetrics updates={updates} onUpdate={setUpdates} />
            </div>
          </div>
        </div>

        <footer className="flex flex-col md:flex-row justify-between items-center py-6 px-4 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] print:mt-4">
          <p>NLC LEADERSHIP TRACKER • LANDSCAPE MODE</p>
          <p className="mt-2 md:mt-0">© {new Date().getFullYear()} CONFIDENTIAL • Data saved to browser</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
