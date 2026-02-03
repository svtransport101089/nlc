
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GroupHeaderData, Member, QuarterlyUpdate, CATEGORIES, NLCReport } from './types';
import GroupHeader from './components/GroupHeader';
import MembersTable from './components/MembersTable';
import QuarterlyMetrics from './components/QuarterlyMetrics';
import NLCReportManager from './components/NLCReportManager';
import { analyzeReport } from './services/geminiService';

const STORAGE_KEY = 'nlc_tracker_v2_fresher_edition';

// Safe check for Google Apps Script Environment
const google = (window as any).google;
const isGasEnv = !!(google && google.script && google.script.run);

const App: React.FC = () => {
  const [nlcReports, setNlcReports] = useState<NLCReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Helper: Create a fresh, empty report template ---
  const createBlankReport = (): NLCReport => ({
    id: `nlc-${Date.now()}`,
    header: {
      nlcNo: '001',
      region: 'Main Region',
      areaPastor: '',
      leaderName: 'New Leader',
      coLeader: '',
      year: new Date().getFullYear().toString()
    },
    members: [{ id: 'm1', sn: 1, name: '', regNo: 'Registered', phone: '' }],
    updates: CATEGORIES.map(cat => ({ category: cat, q1: '', q2: '', q3: '', q4: '' })),
  });

  // --- 1. Startup: Load Data from Cloud or Local ---
  useEffect(() => {
    const initApp = async () => {
      console.log("%c[NLC Tracker] Initializing App...", "color: #4f46e5; font-weight: bold;");
      setIsLoading(true);

      let savedData: any = null;

      // STEP A: Try to load from Google Apps Script (Cloud)
      if (isGasEnv) {
        console.log("[NLC Tracker] Attempting Cloud load...");
        try {
          const cloudResult = await new Promise<string | null>((resolve) => {
            google.script.run
              .withSuccessHandler(resolve)
              .withFailureHandler((err: any) => {
                console.error("[NLC Tracker] Cloud load failed:", err);
                resolve(null);
              })
              .loadReports();
          });
          if (cloudResult) {
            savedData = JSON.parse(cloudResult);
            console.log("[NLC Tracker] Cloud load successful.");
          }
        } catch (e) {
          console.error("[NLC Tracker] JSON parse error (Cloud):", e);
        }
      }

      // STEP B: Fallback to Browser Storage if Cloud is empty
      if (!savedData) {
        console.log("[NLC Tracker] Cloud empty or unavailable. Checking LocalStorage...");
        const localResult = localStorage.getItem(STORAGE_KEY);
        if (localResult) {
          try {
            savedData = JSON.parse(localResult);
            console.log("[NLC Tracker] Local load successful.");
          } catch (e) {
            console.error("[NLC Tracker] JSON parse error (Local):", e);
          }
        }
      }

      // STEP C: Apply Loaded Data or start fresh
      if (savedData && Array.isArray(savedData.nlcReports) && savedData.nlcReports.length > 0) {
        setNlcReports(savedData.nlcReports);
        // Ensure the ID we want to select actually exists
        const exists = savedData.nlcReports.some((r: any) => r.id === savedData.selectedReportId);
        setSelectedReportId(exists ? savedData.selectedReportId : savedData.nlcReports[0].id);
      } else {
        console.log("[NLC Tracker] No existing data found. Creating default report.");
        const initialReport = createBlankReport();
        setNlcReports([initialReport]);
        setSelectedReportId(initialReport.id);
      }

      setIsLoading(false);
    };

    initApp();
  }, []);

  // --- 2. Auto-Save: Persistent Sync ---
  useEffect(() => {
    if (isLoading) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const dataToSave = { nlcReports, selectedReportId };
      const jsonString = JSON.stringify(dataToSave);
      
      // Local Save
      localStorage.setItem(STORAGE_KEY, jsonString);

      // Cloud Save
      if (isGasEnv) {
        google.script.run
          .withSuccessHandler(() => setSaveStatus('saved'))
          .withFailureHandler(() => setSaveStatus('error'))
          .saveReports(jsonString);
      } else {
        setSaveStatus('saved');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [nlcReports, selectedReportId, isLoading]);

  // --- 3. Current Report Logic ---
  const currentReport = useMemo(() => {
    return nlcReports.find(r => r.id === selectedReportId) || null;
  }, [nlcReports, selectedReportId]);

  const updateCurrentReport = useCallback((field: keyof NLCReport, data: any) => {
    if (!selectedReportId) return;
    setNlcReports(prev => prev.map(r => r.id === selectedReportId ? { ...r, [field]: data } : r));
  }, [selectedReportId]);

  const handleAddReport = () => {
    const newReport = createBlankReport();
    setNlcReports(prev => [...prev, newReport]);
    setSelectedReportId(newReport.id);
    setAiResult(null);
  };

  const handleDeleteReport = (id: string) => {
    if (window.confirm("Delete this report permanently?")) {
      setNlcReports(prev => {
        const filtered = prev.filter(r => r.id !== id);
        if (selectedReportId === id) {
          setSelectedReportId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
      setAiResult(null);
    }
  };

  const handleRunAi = async () => {
    if (!currentReport) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeReport(currentReport.header, currentReport.members, currentReport.updates);
      setAiResult(result);
    } catch (e) {
      setAiResult("Analysis failed. Please check your network or API settings.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- 4. Loading State View ---
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-300">NLC Tracker Connecting...</p>
          <p className="text-[10px] text-slate-500 mt-2">Checking Google Properties Store</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Top Header Bar */}
        <header className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-indigo-200 shadow-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none">NLC MANAGER</h1>
              <p className="text-[10px] text-indigo-500 font-bold uppercase mt-1 tracking-widest">Leadership Performance Audit</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl border-2 border-slate-100 text-xs font-bold uppercase hover:bg-slate-50 transition-all active:scale-95">Print PDF</button>
            <button 
              onClick={handleRunAi}
              disabled={isAnalyzing || !currentReport}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? 'Processing...' : 'Run AI Audit'}
            </button>
          </div>
        </header>

        {/* Report Selector Section */}
        <NLCReportManager 
          reports={nlcReports}
          selectedReportId={selectedReportId}
          onSelectReport={setSelectedReportId}
          onAddReport={handleAddReport}
          onDeleteReport={handleDeleteReport}
        />

        {/* Main Editor Surface */}
        {currentReport ? (
          <main className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>

            <GroupHeader 
              data={currentReport.header} 
              onChange={data => updateCurrentReport('header', data)} 
              isEnabled={true} 
            />

            {aiResult && (
              <section className="bg-slate-900 text-slate-100 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 relative">
                <button onClick={() => setAiResult(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">AI Intelligence Report</h3>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-medium">
                  {aiResult}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 sticky top-6">
                <MembersTable 
                  members={currentReport.members} 
                  onUpdate={m => updateCurrentReport('members', m)} 
                  isEnabled={true} 
                />
              </div>
              <div className="lg:col-span-8">
                <QuarterlyMetrics 
                  updates={currentReport.updates} 
                  onUpdate={u => updateCurrentReport('updates', u)} 
                  isEnabled={true} 
                />
              </div>
            </div>
          </main>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <div className="mb-4 inline-flex w-16 h-16 bg-slate-50 rounded-full items-center justify-center text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Reports Available</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Get started by creating your first NLC Leadership report to track growth and performance.</p>
            <button 
              onClick={handleAddReport}
              className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold uppercase shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
            >
              Create New Report
            </button>
          </div>
        )}

        {/* Global Status Footer */}
        <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-2xl z-50 transition-all">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isGasEnv ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`}></span>
            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-tighter">
              {isGasEnv ? 'Cloud Storage Active' : 'Local Storage Mode'}
            </span>
          </div>
          <div className="h-3 w-[1px] bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'error' ? 'text-red-600' : 'text-indigo-600 animate-pulse'}`}>
              {saveStatus === 'saved' ? 'All Changes Saved' : saveStatus === 'error' ? 'Save Error' : 'Syncing...'}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
