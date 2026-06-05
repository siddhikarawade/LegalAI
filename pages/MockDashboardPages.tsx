import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../src/supabaseClient";
import { getHearings, updateHearingOutcome } from "../services/hearingService";
import AddHearingForm from "../components/AddHearingForm";

export const HearingsPage: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming">("all");
  const [expandedHistory, setExpandedHistory] = useState<{ [key: string]: boolean }>({});

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: judgeCases, error } = await supabase
      .from("cases")
      .select("*")
      .eq("assigned_judge_id", user.id);

    if (error) return console.error(error);

    const withHearings = await Promise.all(
      (judgeCases || []).map(async (c) => {
        const hearings = await getHearings(c.id);
        const sortedHearings = hearings.sort(
          (a: any, b: any) => new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime()
        );
        return {
          ...c,
          hearings: sortedHearings,
          nextHearing: sortedHearings.find(
            (h: any) => !h.outcome || h.outcome === "PENDING"
          ),
        };
      })
    );

    setCases(withHearings);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRecordOutcome = async (caseId: string, hearingId: string) => {
    try {
      await updateHearingOutcome(hearingId, caseId, "HEARD");
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to record outcome");
    }
  };

  const outcomeColor = (outcome: string) => {
    switch (outcome) {
      case "HEARD": return "bg-green-500 text-white";
      case "ADJOURNED": return "bg-yellow-500 text-white";
      case "DISPOSED": return "bg-red-500 text-white";
      case "RESERVED_FOR_ORDERS": return "bg-purple-500 text-white";
      default: return "bg-gray-300 text-gray-800";
    }
  };

  const purposeColor = () => "bg-blue-100 text-blue-800";

  const filterUpcoming = (c: any) => {
    if (!c.nextHearing) return false;
    const today = new Date();
    const weekLater = new Date();
    weekLater.setDate(today.getDate() + 7);
    const nextDate = new Date(c.nextHearing.hearing_date);
    return nextDate >= today && nextDate <= weekLater;
  };

  const displayedCases = activeTab === "all" ? cases : cases.filter(filterUpcoming);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-slate-900 p-12 rounded-[3rem] text-white">
        <h2 className="text-4xl font-black uppercase tracking-widest mb-2">Judicial Hearings</h2>
        <p className="text-blue-400 text-xs font-black tracking-[0.4em] uppercase">Today's Cause List & Schedule</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 text-sm font-bold uppercase tracking-wider mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-2 rounded-lg ${activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>All Cases
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-2 rounded-lg ${activeTab === "upcoming" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>Upcoming (1 week)
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-6">
        {displayedCases.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No cases found for this filter.</p>
        )}

        {displayedCases.map((c) => (
          <div
            key={c.id}
            className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between gap-6"
          >
            <div className="flex-1 flex flex-col gap-4">
              {/* Case Header */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-lg uppercase">{c.caseNo}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.type}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">{c.plaintiff} v. {c.respondent}</h3>

              {/* Next Hearing */}
              {c.nextHearing && (
                <div className="bg-blue-50 border-l-8 border-blue-600 p-3 rounded-lg flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">Next Hearing:</span>
                  <span className="font-bold text-slate-900">{c.nextHearing.hearing_date}</span>
                  <span className={`${purposeColor()} px-2 py-0.5 rounded text-xs font-semibold`}>{c.nextHearing.purpose}</span>
                  <span className={`${outcomeColor(c.nextHearing.outcome || "PENDING")} px-2 py-0.5 rounded text-xs font-semibold`}>{c.nextHearing.outcome || "PENDING"}</span>
                </div>
              )}

              {/* Past Hearings */}
              {c.hearings.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedHistory((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                    className="text-sm font-bold uppercase text-slate-700 mb-2"
                  >
                    {expandedHistory[c.id] ? "Hide Past Hearings ▲" : "Show Past Hearings ▼"}
                  </button>
                  {expandedHistory[c.id] && (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg p-2">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-3 py-1 text-left font-semibold">Date</th>
                            <th className="px-3 py-1 text-left font-semibold">Purpose</th>
                            <th className="px-3 py-1 text-left font-semibold">Outcome</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.hearings.map((h: any) => (
                            <tr key={h.id} className="border-t border-slate-200">
                              <td className="px-3 py-1">{h.hearing_date}</td>
                              <td className="px-3 py-1">
                                <span className={`${purposeColor()} px-2 py-0.5 rounded text-xs font-semibold`}>{h.purpose}</span>
                              </td>
                              <td className="px-3 py-1">
                                <span className={`${outcomeColor(h.outcome || "PENDING")} px-2 py-0.5 rounded text-xs font-semibold`}>{h.outcome || "PENDING"}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Add Hearing Form */}
              <AddHearingForm caseId={c.id} onAdded={() => load()} />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap md:flex-col gap-2 md:gap-3 mt-4 md:mt-0 justify-end">
              <Link
                to={`/case/${c.id}`}
                className="bg-slate-100 text-slate-900 px-4 py-2 md:px-8 md:py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition"
              >
                View File
              </Link>
              {c.nextHearing && (
                <button
                  onClick={() => handleRecordOutcome(c.id, c.nextHearing.id)}
                  disabled={c.nextHearing?.outcome === "HEARD"}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded whitespace-nowrap text-[10px] font-semibold ${c.nextHearing?.outcome === "HEARD" ? "bg-gray-400" : "bg-blue-600 text-white"}`}
                >
                  {c.nextHearing?.outcome === "HEARD" ? "Recorded" : "Record Outcome"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
