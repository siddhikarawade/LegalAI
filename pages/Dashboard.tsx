import React, { useState, useEffect } from 'react';
import { UserRole, CaseStatus, LegalCase, PriorityLevel } from '../types';
import { Link, Navigate } from 'react-router-dom';
import CaseSearch from '../components/CaseSearch';
import { calculateCasePriority } from '../services/legalPriorityService';
import { supabase } from "../src/supabaseClient";

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {

  if (user.role === UserRole.ADMIN) {
    return <Navigate to="/admin" />;
  }

  const [allCases, setAllCases] = useState<LegalCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<LegalCase[]>([]);
  const [priorityCases, setPriorityCases] = useState<LegalCase[]>([]);
  const [activeTab,setActiveTab] = useState<"all"|"priority">("all");

  useEffect(() => {

    const loadCases = async () => {

      let query =
        supabase
          .from("cases")
          .select("*")
          .order("created_at",{ascending:false});

      if(user.role===UserRole.ADVOCATE){
        query=query.eq(
          "advocate_id",
          user.id
        );
      }

      if(user.role===UserRole.JUDGE){
        query=query.eq(
          "assigned_judge_id",
          user.id
        );
      }

      if(user.role===UserRole.LITIGANT){
        query=query.or(
          `plaintiff.ilike.%${user.name}%,
          respondent.ilike.%${user.name}%`
        );
      }

      const {data,error}=await query;
      if(error){
        console.log(error);
        return;
      }

      const formatted =
      await Promise.all(
        data.map(async(c:any)=>{
          const legalCase:LegalCase={
            id:c.id,
            caseNo:c.case_no,
            type:c.type,
            matter:c.matter,
            courtName:c.court_name||"Unknown Court",
            status:c.status,
            plaintiff:c.plaintiff,
            respondent:c.respondent,
            plaintiff_aadhar:c.plaintiff_aadhar||"",
            plaintiff_id_type:c.plaintiff_id_type||"PAN",
            plaintiff_id_no:c.plaintiff_id_no||"",
            advocatePlaintiff:c.advocate_plaintiff||"",
            advocateRespondent:c.advocate_respondent||"",
            judgeName:c.judge_name||"",
            nextHearingDate:c.next_hearing_date||"",
            filed_by_name:c.filed_by_name||"",
            documents:c.documents||[],
            hearings:c.hearings||[],
            summary:c.summary||"",
            createdAt:c.created_at,
            priorityScore:0,
            priorityLevel:PriorityLevel.ROUTINE
          };

          const {score,level}= calculateCasePriority(legalCase);
          await supabase
          .from("cases")
          .update({
            priority_score:score,
            priority_level:level
          })
          .eq("id",c.id);
          return{
            ...legalCase,
            priorityScore:score,
            priorityLevel:level
          };
        })
      );

      /* newest first */

      const newest = [...formatted].sort((a,b)=>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      /* priority first */

      const priority = [...formatted].sort(
        (a,b)=>{
          if(b.priorityScore !== a.priorityScore)
          {
            return(b.priorityScore||0) - (a.priorityScore||0);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      );
      setAllCases(newest);
      setPriorityCases(priority);
      setFilteredCases(newest);
    };
    loadCases();
  },[user]);


  useEffect(()=>{

    if(activeTab==="all"){
      setFilteredCases(allCases);
    }else{
      setFilteredCases(priorityCases);
    }
  },[
    activeTab,allCases,priorityCases
  ]);

  const getStatusBadge=(status:CaseStatus)=>{

    const colors:any={
      SUBMITTED: 'bg-amber-100 text-amber-800 border-amber-200',
      UNDER_SCRUTINY: 'bg-orange-100 text-orange-800 border-orange-200',
      INSTITUTED: 'bg-blue-100 text-blue-800 border-blue-200',
      DISPOSED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      WRONG_DOCS: 'bg-rose-100 text-rose-800 border-rose-200'
    };

    return(
      <span className={` px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${ colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {
        status.replace("_", " ")
      }
      </span>
    );
  };


  const getPriorityBadge= (legalCase:LegalCase)=>{
    const level= legalCase.priorityLevel || PriorityLevel.ROUTINE;
    const colors:any={
      HIGH: 'bg-red-100 text-red-800 border-red-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ROUTINE:'bg-green-100 text-green-800 border-green-200'
    };
    return(
      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border${ colors[level] || 'bg-gray-100 text-gray-800'}`}> {level} </span>
    );
  };


  const renderDashboardUI=
  (
    title:string,
    subtitle:string,
    showNewCase=false
  )=>(
    
    <div className="space-y-10">
      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 bottom-0 p-12 opacity-10"></div>
      <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter leading-none">{title}</h2>
          <p className="text-blue-400 font-black tracking-[0.3em] uppercase text-xs">{subtitle}</p>
      </div>
    </div>

    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Active Case Registry</h3>
          {showNewCase&&(
            <Link to="/new-case" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700">E-File New Case</Link>
          )}
      </div>

        {/* tabs */}

        <div className="flex gap-4 px-10 pt-6">
          <button onClick={()=>setActiveTab("all")}
            className={` px-5 py-2 text-xs font-black rounded-xl ${activeTab==="all"?"bg-blue-600 text-white": "bg-slate-100"}`}> All Cases </button>
          <button onClick={()=>setActiveTab("priority")} 
            className={`px-5 py-2 text-xs font-black rounded-xl ${activeTab==="priority"?"bg-blue-600 text-white":"bg-slate-100"}`}>Priority View</button>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className=" bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest ">
                <th className="px-10 py-5"> CNR / Case ID</th>
                <th className="px-10 py-5"> Matter / Type</th>
                <th className="px-10 py-5"> Parties Involved</th>
                <th className="px-10 py-5"> Current Status</th>
                <th className="px-10 py-5"> Priority</th>
                <th className="px-10 py-5"> Filed Date</th>
                <th className="px-10 py-5 text-right pr-12"> Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {
              filteredCases.map(c=>(
                <tr key={c.id} className="hover:bg-blue-50/30 transition-all">
                  <td className="px-10 py-6 font-black text-slate-900">{c.caseNo}
                  </td>
                  <td className="px-10 py-6">
                  <div className="text-slate-900 font-black">{c.type}
                  </div>
                  <div className=" text-[10px] text-blue-600 font-black uppercase tracking-widest">{c.matter||"General"}
                  </div>
                  </td>
                  <td className="px-10 py-6">
                  <div className="text-slate-900 font-black">{c.plaintiff}</div>
                  <div className=" text-slate-400 text-[10px] font-black uppercase tracking-widest ">vs {c.respondent}</div>
                  </td>
                  <td className="px-10 py-6">{getStatusBadge(c.status)}</td>
                  <td className="px-10 py-6">{getPriorityBadge(c)}</td>
                  <td className="px-10 py-6 text-slate-700 font-semibold">
                  {
                    new Date(c.createdAt).toLocaleDateString(
                      "en-GB",
                      {
                        day:"2-digit",
                        month:"short",
                        year:"numeric"
                      }
                    )
                  }
                  </td>
                  <td className="px-10 py-6 text-right pr-12">
                    <Link to={`/case/${c.id}`} className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600">Open File</Link>
                  </td> 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  switch(user.role){
    case UserRole.ADVOCATE:
      return renderDashboardUI('ADVOCATE PORTAL','Digital Case Management & E-Filing',true);
    case UserRole.REGISTRY:
      return renderDashboardUI('REGISTRY PORTAL','Automated Scrutiny & Institution',true);
    case UserRole.JUDGE:
      return renderDashboardUI('JUDICIAL PORTAL','Bench Management & Draft Review');
    case UserRole.LITIGANT:
      return renderDashboardUI('CITIZEN PORTAL','Live Case Tracking & Access');
    default:
      return renderDashboardUI('DASHBOARD','Overview');
  }
};

export default Dashboard;