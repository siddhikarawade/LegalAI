
import React, { useState } from 'react';
import { CaseCategory, SearchCriteria } from '../types';
import { CASE_CATEGORIES } from '../constants';
import DateRangeModal from './DateRangeModal';

interface SearchFiltersProps {
  criteria: SearchCriteria;
  onCriteriaChange: (newCriteria: SearchCriteria) => void;
  onAIRun: () => void;
  isSearching: boolean;
  layout?: 'horizontal' | 'vertical';
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ criteria, onCriteriaChange, onAIRun, isSearching, layout = 'vertical' }) => {
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const isHorizontal = layout === 'horizontal';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onCriteriaChange({ ...criteria, [name]: value });
  };

  const handleDateApply = (from: string, to: string) => {
    onCriteriaChange({ ...criteria, dateFrom: from, dateTo: to });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className={isHorizontal ? "w-full overflow-auto" : ""}>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
        <div className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white shadow-sm">
          Filter Panel
        </div>
        <div className="mt-3">
          <h2 className="text-2xl font-bold text-slate-900">Legal Intelligence Engine (Search & Semantic Match)</h2>
          <p>Search and analyze judicial precedents using contextual AI ranking.</p>
        </div>
      </div>

      <div className={isHorizontal ? "bg-white p-4 rounded-xl shadow-sm border border-slate-200" : "bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-4"}>
        <div className={isHorizontal ? "flex flex-nowrap gap-4 items-end w-full min-w-0" : "space-y-5"}>
          <div className={isHorizontal ? "flex-1 min-w-0" : ""}>
            <label className={isHorizontal ? "block text-sm font-semibold text-slate-700 mb-2" : "block text-sm font-semibold text-slate-700 mb-2"}>Search Text</label>
            <div className="relative">
              <input
                type="text"
                name="searchText"
                value={criteria.searchText}
                onChange={handleChange}
                placeholder="Enter your case query..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className={isHorizontal ? "flex-shrink min-w-0 max-w-[180px]" : ""}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Case Category</label>
            <select
              name="category"
              value={criteria.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="All">All Categories</option>
              {CASE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          

          <div className={isHorizontal ? "flex-shrink-0 min-w-[220px] flex justify-end items-end" : ""}>
            <button
              onClick={onAIRun}
              disabled={isSearching}
              className={isHorizontal ? "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50" : "w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"}
            >
              {isSearching ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : null}
              Find Semantic Matches
            </button>
          </div>
        </div>
      </div>

      <DateRangeModal 
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateApply}
        initialFrom={criteria.dateFrom}
        initialTo={criteria.dateTo}
      />
    </div>
  );
};

export default SearchFilters;
