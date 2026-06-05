
import React, { useState, useEffect, useMemo } from 'react';
import { getUsers, getCases } from '../store';
import { UserRole, CaseStatus, LegalCase, PriorityLevel, User } from '../types';
import { calculateCasePriority } from '../services/legalPriorityService';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../services/caseService';
import { supabase } from '../src/supabaseClient';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [allCases, setAllCases] = useState<LegalCase[]>([]);
  const [priorityCases, setPriorityCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [caseStatusFilter, setCaseStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'priority'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, caseRows] = await Promise.all([
          getAllUsers(),
          supabase
            .from('cases')
            .select('*')
            .order('created_at', { ascending: false })
        ]);

        setUsers(usersData || []);

        const mappedCases: LegalCase[] = (caseRows.data || []).map((c: any) => {
          const legalCase: LegalCase = {
            id: c.id,
            caseNo: c.case_no,
            type: c.type,
            matter: c.matter,
            courtName: c.court_name || 'Unknown Court',
            status: c.status,
            plaintiff: c.plaintiff,
            respondent: c.respondent,
            plaintiff_aadhar: c.plaintiff_aadhar || '',
            plaintiff_id_type: c.plaintiff_id_type || 'PAN',
            plaintiff_id_no: c.plaintiff_id_no || '',
            advocatePlaintiff: c.advocate_plaintiff || '',
            advocateRespondent: c.advocate_respondent || '',
            judgeName: c.judge_name || '',
            nextHearingDate: c.next_hearing_date || '',
            summary: c.summary || '',
            filed_by_name: c.filed_by_name || '',
            documents: c.documents || [],
            hearings: c.hearings || [],
            createdAt: c.created_at,
            priorityScore: 0,
            priorityLevel: PriorityLevel.ROUTINE,
          };

          const { score, level } = calculateCasePriority(legalCase);
          return {
            ...legalCase,
            priorityScore: score,
            priorityLevel: level,
          };
        });

        setCases(mappedCases);

        const newest = [...mappedCases].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllCases(newest);

        const priority = [...mappedCases].sort((a, b) => {
          const priorityA = calculateCasePriority(a).score || 0;
          const priorityB = calculateCasePriority(b).score || 0;
          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setPriorityCases(priority);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to store data if API fails
        const fallbackUsers = getUsers();
        const fallbackCases = getCases();
        setUsers(fallbackUsers);
        setCases(fallbackCases);

        const newest = [...fallbackCases].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllCases(newest);

        const priority = [...fallbackCases].sort((a, b) => {
          const priorityA = calculateCasePriority(a).score || 0;
          const priorityB = calculateCasePriority(b).score || 0;
          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setPriorityCases(priority);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    return userRoleFilter === 'ALL' 
      ? users 
      : users.filter(u => u.role === userRoleFilter);
  }, [users, userRoleFilter]);

  const baseFilteredCases = useMemo(() => {
    const source = activeTab === 'all' ? allCases : priorityCases;
    return source.filter(c => {
      const matchesStatus = caseStatusFilter === 'ALL' || c.status === caseStatusFilter;
      return matchesStatus;
    });
  }, [activeTab, allCases, priorityCases, caseStatusFilter]);

  const filteredCases = baseFilteredCases;

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalCases = cases.length;
    const activeJudges = users.filter(u => u.role === UserRole.JUDGE).length;
    const activeAdvocates = users.filter(u => u.role === UserRole.ADVOCATE).length;
    const activeCases = cases.filter(c => c.status !== CaseStatus.DISPOSED).length;
    const disposedCases = cases.filter(c => c.status === CaseStatus.DISPOSED).length;
    const highPriorityCases = cases.filter(c => calculateCasePriority(c).level === PriorityLevel.HIGH).length;

    return {
      totalUsers,
      totalCases,
      activeJudges,
      activeAdvocates,
      activeCases,
      disposedCases,
      highPriorityCases
    };
  }, [users, cases]);

  const getStatusBadge = (status: CaseStatus) => {
    const colors: Record<string, string> = {
      [CaseStatus.SUBMITTED]: 'bg-amber-100 text-amber-800 border-amber-200',
      [CaseStatus.UNDER_SCRUTINY]: 'bg-orange-100 text-orange-800 border-orange-200',
      [CaseStatus.INSTITUTED]: 'bg-blue-100 text-blue-800 border-blue-200',
      [CaseStatus.DISPOSED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      [CaseStatus.WRONG_DOCS]: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (legalCase: LegalCase) => {
    const { level } = calculateCasePriority(legalCase);
    const colors: Record<string, string> = {
      [PriorityLevel.HIGH]: 'bg-red-100 text-red-800 border-red-200',
      [PriorityLevel.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [PriorityLevel.ROUTINE]: 'bg-green-100 text-green-800 border-green-200',
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colors[level] || 'bg-gray-100 text-gray-800'}`}>
        {level}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-12 animate-in fade-in duration-500">
        <div className="bg-slate-900 p-12 rounded-[3rem] text-white">
          <h2 className="text-4xl font-black uppercase tracking-widest mb-2">Admin Panel</h2>
          <p className="text-blue-400 text-xs font-black tracking-[0.4em] uppercase">Loading system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-12 rounded-[3rem] text-white">
        <h2 className="text-4xl font-black uppercase tracking-widest mb-2">Admin Panel</h2>
        <p className="text-blue-400 text-xs font-black tracking-[0.4em] uppercase">System-wide Management & Oversight</p>
      </div>

      <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Users', val: stats.totalUsers, icon: '👥', color: 'bg-blue-50 border-blue-200' },
          { label: 'Total Cases', val: stats.totalCases, icon: '📂', color: 'bg-green-50 border-green-200' },
          { label: 'Active Cases', val: stats.activeCases, icon: '⏳', color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Disposed Cases', val: stats.disposedCases, icon: '✅', color: 'bg-emerald-50 border-emerald-200' },
          { label: 'High Priority', val: stats.highPriorityCases, icon: '🚨', color: 'bg-red-50 border-red-200' }
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-8 rounded-[2rem] shadow-xl border ${stat.color} hover:shadow-2xl transition-all duration-300`}>
             <div className="text-3xl mb-3">{stat.icon}</div>
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</h3>
             <p className="text-3xl font-black text-slate-900">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-widest">Active User Registry</h3>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-600">Filter by Role:</label>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value as UserRole | 'ALL')}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.JUDGE}>Judge</option>
              <option value={UserRole.ADVOCATE}>Advocate</option>
              <option value={UserRole.REGISTRY}>Registry</option>
              <option value={UserRole.LITIGANT}>Litigant</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-10 py-5">Full Name</th>
                <th className="px-10 py-5">Role Type</th>
                <th className="px-10 py-5">Email</th>
                <th className="px-10 py-5">Login ID</th>
                <th className="px-10 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-10 py-6 font-black text-slate-900">{u.name}</td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      u.role === UserRole.JUDGE ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                      u.role === UserRole.ADVOCATE ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      u.role === UserRole.ADMIN ? 'bg-red-100 text-red-700 border-red-200' :
                      u.role === UserRole.REGISTRY ? 'bg-green-100 text-green-700 border-green-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-slate-600">{u.email}</td>
                  <td className="px-10 py-6 font-mono text-slate-500">{u.username}</td>
                  <td className="px-10 py-6 text-right">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block shadow-sm ring-4 ring-emerald-100"></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No users found for the selected role.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-widest">Active Case Registry</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">Status:</label>
            <select
              value={caseStatusFilter}
              onChange={(e) => setCaseStatusFilter(e.target.value as CaseStatus | 'ALL')}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value={CaseStatus.SUBMITTED}>Submitted</option>
              <option value={CaseStatus.UNDER_SCRUTINY}>Under Scrutiny</option>
              <option value={CaseStatus.INSTITUTED}>Instituted</option>
              <option value={CaseStatus.DISPOSED}>Disposed</option>
              <option value={CaseStatus.WRONG_DOCS}>Wrong Docs</option>
            </select>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-4 px-10 pt-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 text-xs font-black rounded-xl ${
              activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100'
            }`}
          >
            All Cases
          </button>
          <button
            onClick={() => setActiveTab('priority')}
            className={`px-5 py-2 text-xs font-black rounded-xl ${
              activeTab === 'priority' ? 'bg-blue-600 text-white' : 'bg-slate-100'
            }`}
          >
            Priority View
          </button>
        </div>
        
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-10 py-5">CNR / Case ID</th>
                <th className="px-10 py-5">Matter / Type</th>
                <th className="px-10 py-5">Parties Involved</th>
                <th className="px-10 py-5">Current Status</th>
                <th className="px-10 py-5">Priority</th>
                <th className="px-10 py-5 text-right pr-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map(c => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-all">
                  <td className="px-10 py-6 font-black text-slate-900">{c.caseNo}</td>
                  <td className="px-10 py-6">
                    <div className="text-slate-900 font-black">{c.type}</div>
                    <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{c.matter || 'General'}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="text-slate-900 font-black">{c.plaintiff}</div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">vs {c.respondent}</div>
                  </td>
                  <td className="px-10 py-6">{getStatusBadge(c.status)}</td>
                  <td className="px-10 py-6">{getPriorityBadge(c)}</td>
                  <td className="px-10 py-6 text-right pr-12">
                    <Link to={`/case/${c.id}`} className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600">Open File</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCases.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No cases found matching the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
