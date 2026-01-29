
import React, { useState } from 'react';
import { GroupHeaderData, Member, QuarterlyUpdate, CATEGORIES } from './types';
import GroupHeader from './components/GroupHeader';
import MembersTable from './components/MembersTable';
import QuarterlyMetrics from './components/QuarterlyMetrics';
import { analyzeReport } from './services/geminiService';

const App: React.FC = () => {
  const [header, setHeader] = useState<GroupHeaderData>({
    nlcNo: '102',
    region: 'South Dist',
    areaPastor: 'Rev. Smith',
    leaderName: 'John Doe',
    coLeader: 'Jane Roe',
    year: '2026'
  });

  const [members, setMembers] = useState<Member[]>([
    { id: '1', sn: 1, name: 'Judah', regNo: 'REG001', phone: '555-0101' },
    { id: '2', sn: 2, name: 'Isak', regNo: 'REG002', phone: '555-0102' },
    { id: '3', sn: 3, name: 'Arul Rithis', regNo: 'REG003', phone: '555-0103' },
    { id: '4', sn: 4, name: 'Akash', regNo: 'REG004', phone: '555-0104' },
    { id: '5', sn: 5, name: 'Sam Alwino', regNo: 'REG005', phone: '555-0105' },
  ]);

  const [updates, setUpdates] = useState<QuarterlyUpdate[]>(
    CATEGORIES.map(cat => ({ category: cat, q1: '', q2: '', q3: '', q4: '' }))
  );

  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeReport(header, members, updates);
    setAiResult(result);
    setIsAnalyzing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 transition-colors">
      {/* Enhanced Print Styles */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .min-h-screen {
            padding: 0 !important;
            background: #ffffff !important;
          }
          .max-w-\\[1600px\\] {
            max-width: none !important;
            width: 100% !important;
          }
          /* Ensure the grid keeps side-by-side layout in landscape print */
          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            gap: 1.5rem !important;
          }
          .print-col-5 { grid-column: span 5 / span 5 !important; }
          .print-col-7 { grid-column: span 7 / span 7 !important; }
          
          .shadow-2xl, .shadow-sm, .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          .border-2 {
            border-width: 1px !important;
            border-color: #e2e8f0 !important;
          }
          .rounded-3xl {
            border-radius: 0.5rem !important;
          }
          button, .print-hidden {
            display: none !important;
          }
          input, textarea {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            color: #1e293b !important;
          }
          textarea {
            height: auto !important;
            min-height: unset !important;
          }
          .bg-indigo-600 { background-color: #4f46e5 !important; }
          .bg-slate-100, .bg-slate-50 { background-color: #f8fafc !important; }
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 px-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg print:bg-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                NLC Leadership Tracker
              </h1>
            </div>
            <p className="text-slate-500 font-medium">Quarterly Data Entry & Performance Review Portal</p>
          </div>
          
          <div className="flex gap-3 print:hidden">
            <button 
              onClick={handlePrint}
              title="Print current report in landscape"
              className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 transition-all flex items-center gap-2 font-semibold shadow-sm active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-semibold shadow-lg shadow-indigo-200 active:scale-95 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get AI Insights
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Bordered Content Area */}
        <div id="printable-area" className="bg-white border-2 border-slate-200 rounded-3xl shadow-2xl shadow-slate-200/50 p-6 md:p-10 space-y-10 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600 print:h-1"></div>

          <section>
            <GroupHeader data={header} onChange={setHeader} />
          </section>

          {aiResult && (
            <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl p-6 relative animate-in fade-in slide-in-from-top-4 duration-500 print:bg-white print:border-slate-200">
              <button 
                onClick={() => setAiResult(null)}
                className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600 transition-colors print:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-indigo-900 font-bold text-lg mb-3 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Performance Analysis
              </h3>
              <div className="prose prose-indigo prose-sm max-w-none text-indigo-800 whitespace-pre-wrap leading-relaxed">
                {aiResult}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print-grid">
            <div className="lg:col-span-5 print-col-5">
              <MembersTable members={members} onUpdate={setMembers} />
            </div>
            <div className="lg:col-span-7 print-col-7">
              <QuarterlyMetrics updates={updates} onUpdate={setUpdates} />
            </div>
          </div>
          
          <div className="flex justify-center pt-8 print:hidden">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Finalize & Print Landscape Report
            </button>
          </div>
        </div>

        <footer className="text-center text-slate-400 text-xs py-10 print:mt-10 font-medium tracking-wide uppercase">
          <p>© {new Date().getFullYear()} National Leadership Council • Confidential Internal Report</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
