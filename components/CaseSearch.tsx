
import React, { useState } from 'react';
import { CASE_CATEGORIES } from '../constants';

interface CaseSearchProps {
  onSearch: (filters: { query?: string; category?: string; matter?: string }) => void;
  compact?: boolean;
}

const CaseSearch: React.FC<CaseSearchProps> = ({ onSearch, compact = false }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [matter, setMatter] = useState<string>('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({ query, category, matter });
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cases..."
          className="px-4 py-2 rounded-lg border border-slate-200 w-full"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200">
          <option value="All">All</option>
          {CASE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg">Search</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter case number, party, or keyword"
          className="w-full px-4 py-3 rounded-xl border border-slate-200"
        />
      </div>
      <div className="flex gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 px-3 py-3 rounded-xl border border-slate-200">
          <option value="All">All Categories</option>
          {CASE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={matter} onChange={(e) => setMatter(e.target.value)} placeholder="Matter" className="px-3 py-3 rounded-xl border border-slate-200" />
        <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl">Search</button>
      </div>
    </form>
  );
};

export default CaseSearch;
