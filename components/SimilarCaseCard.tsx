
import React, { useState } from 'react';
import { SimilarLegalCase, CaseCategory, TimelineEvent, Precedent } from '../types';
import { summarizeCase } from '../services/geminiService';

interface CaseCardProps {
  legalCase: SimilarLegalCase;
}

const CategoryBadge: React.FC<{ category: CaseCategory }> = ({ category }) => {
  const colors: Record<string, string> = {
    [CaseCategory.CIVIL]: 'bg-blue-100 text-blue-700 border-blue-200',
    [CaseCategory.CRIMINAL]: 'bg-red-100 text-red-700 border-red-200',
    [CaseCategory.FAMILY]: 'bg-purple-100 text-purple-700 border-purple-200',
    [CaseCategory.CONSTITUTIONAL]: 'bg-amber-100 text-amber-700 border-amber-200',
    [CaseCategory.COMMERCIAL]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [CaseCategory.LABOR]: 'bg-orange-100 text-orange-700 border-orange-200',
    [CaseCategory.TAXATION]: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[category] || 'bg-slate-100'}`}>
      {category}
    </span>
  );
};

const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  return (
    <div className="mt-4 border-l-2 border-slate-200 ml-3 pl-6 space-y-4">
      {events.map((event, idx) => (
        <div key={idx} className="relative">
          <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase min-w-[70px]">{event.date}</span>
            <div>
              <h5 className="text-sm font-semibold text-slate-800">{event.topic}</h5>
              {event.details && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.details}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CaseCard: React.FC<CaseCardProps> = ({ legalCase }) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const handleSummarize = async () => {
    if (summary) {
      setSummary(null);
      return;
    }
    setIsSummarizing(true);
    const result = await summarizeCase(legalCase);
    setSummary(result);
    setIsSummarizing(false);
  };

  const lastEvent = legalCase.timeline[legalCase.timeline.length - 1];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-3">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <CategoryBadge category={legalCase.category} />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{legalCase.caseNumber}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {legalCase.title}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs px-2 py-1 rounded font-bold bg-slate-800 text-white">
            {legalCase.status}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Filed: {legalCase.dateFiled}</p>
          <p className="text-[11px] text-slate-600 font-bold mt-0.5">Closed: {lastEvent.date}</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Summary of Dispute</h4>
        <p className="text-sm text-slate-600 italic">
          {legalCase.summary}
        </p>
      </div>

      <div className="bg-indigo-50/50 border-l-4 border-indigo-500 rounded-r-lg p-3 mb-4">
        <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-1">Final Judgment</h4>
        <p className="text-sm text-slate-800 font-medium leading-relaxed">
          {legalCase.judgment}
        </p>
      </div>

      {legalCase.precedents && legalCase.precedents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Legal Precedents</h4>
          <div className="space-y-1.5">
            {legalCase.precedents.map((prec, idx) => (
              <div key={idx} className="bg-slate-50 rounded p-2 border-l-2 border-indigo-300">
                <p className="text-[11px] font-bold text-slate-800">{prec.caseName}</p>
                <p className="text-[10px] text-slate-500 italic leading-tight">{prec.relevance}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {legalCase.parties.map((p, idx) => (
          <span key={idx} className="text-[11px] bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-slate-500">
            {p}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          Court: {legalCase.court}
        </span>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowTimeline(!showTimeline)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            {showTimeline ? 'Hide History' : 'View Timeline'}
          </button>
          <button 
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            {isSummarizing ? (
              <span className="animate-spin h-3 w-3 border border-indigo-600 border-t-transparent rounded-full"></span>
            ) : (
               summary ? 'Close Brief' : 'AI Analysis'
            )}
          </button>
        </div>
      </div>

      {showTimeline && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Case Proceedings Timeline</h4>
          <Timeline events={legalCase.timeline} />
        </div>
      )}

      {summary && (
        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-xs font-bold uppercase text-indigo-900 mb-2">Intelligence Brief</h4>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseCard;
