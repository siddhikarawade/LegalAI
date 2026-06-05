
import React, { useState, useMemo } from 'react';
import { SearchCriteria, SimilarLegalCase } from '../types';
import { INITIAL_MOCK_CASES } from '../constants';
import { searchIntelligence } from '../services/geminiService';
import SearchFilters from '../components/SearchFilters';
import CaseCard from '../components/SimilarCaseCard';

const SearchPage = () => {
  const [cases] = useState<SimilarLegalCase[]>(INITIAL_MOCK_CASES);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    searchText: '',
    category: 'All',
    status: 'Closed'
  });
  const [aiResultIds, setAiResultIds] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [showAllCases, setShowAllCases] = useState(false);
  const INITIAL_VISIBLE = 5;

  // Enhanced filtering logic: Match any word from search text
  const filteredCases = useMemo(() => {
    // If AI has filtered the IDs, strictly show those
    if (aiResultIds !== null) {
      return cases.filter(c => aiResultIds.includes(c.id));
    }

    const searchTokens = criteria.searchText
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(token => token.length > 0);

    return cases.filter(c => {
      // Logic for "Any Word Match"
      const matchText = searchTokens.length === 0 || searchTokens.some(token => 
        c.title.toLowerCase().includes(token) ||
        c.summary.toLowerCase().includes(token) ||
        c.judgment.toLowerCase().includes(token) ||
        c.parties.some(p => p.toLowerCase().includes(token)) ||
        c.caseNumber.toLowerCase().includes(token)
      );
      
      const matchCategory = criteria.category === 'All' || c.category === criteria.category;
      const matchStatus = criteria.status === 'All' || c.status === criteria.status;
      
      const matchDateFrom = !criteria.dateFrom || new Date(c.dateFiled) >= new Date(criteria.dateFrom);
      const matchDateTo = !criteria.dateTo || new Date(c.dateFiled) <= new Date(criteria.dateTo);

      return matchText && matchCategory && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [cases, criteria, aiResultIds]);

  const visibleCases = showAllCases
  ? filteredCases
  : filteredCases.slice(0, INITIAL_VISIBLE);

  const handleCriteriaChange = (newCriteria: SearchCriteria) => {
    setCriteria(newCriteria);
    setAiResultIds(null); // Reset AI results when manual filter changes
  };

  const handleAISearch = async () => {
    if (!criteria.searchText && criteria.category === 'All') {
      alert("Please enter a query for AI analysis.");
      return;
    }
    
    setIsSearching(true);
    const query = `${criteria.searchText} in category ${criteria.category}`;
    const resultIds = await searchIntelligence(query, cases);
    setAiResultIds(resultIds);
    setIsSearching(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
      {/* Horizontal Filters under hero */}
      <div className="mb-8">
        <SearchFilters
          criteria={criteria}
          onCriteriaChange={handleCriteriaChange}
          onAIRun={handleAISearch}
          isSearching={isSearching}
          layout="horizontal"
        />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {aiResultIds ? 'AI Identified Relevance' : 'Search Results'}
          </h2>
         
        </div>
        {aiResultIds && (
          <button 
            onClick={() => setAiResultIds(null)}
            className="text-sm text-indigo-600 font-semibold hover:underline"
          >
            Clear AI Filter
          </button>
        )}
      </div>

      {/* Results List - stacked vertically */}
      {filteredCases.length > 0 ? (
  <>
    <div className="space-y-6">
      {visibleCases.map(c => (
        <div key={c.id} className="w-full">
          <CaseCard legalCase={c} />
        </div>
      ))}
    </div>

    {/* View More button BELOW cases */}
    {filteredCases.length > INITIAL_VISIBLE && (
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowAllCases(!showAllCases)}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
        >
          {showAllCases ? "Show Less" : "View More"}
        </button>
      </div>
    )}
  </>
) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-folder-open text-2xl text-slate-300"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-600">No matching cases found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
            Try adjusting your search criteria or use the AI Deep Analysis to find contextual matches in our legal archive.
          </p>
          <button 
             onClick={() => setCriteria({ searchText: '', category: 'All', status: 'Closed' })}
             className="mt-6 text-indigo-600 font-bold hover:text-indigo-800"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
