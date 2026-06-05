import React, { useEffect, useState } from "react";
import { supabase } from "../src/supabaseClient";

interface Props{
  caseId:string;
}

const CaseTimeline:React.FC<Props> = ({caseId}) => {

  const [events,setEvents] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const loadTimeline = async() => {

      setLoading(true);

      const {data:historyData,error:hError} = await supabase
      .from("case_status_history")
      .select("*")
      .eq("case_id",caseId)
      .order("created_at");

      const {data:hearingData,error:hrError} = await supabase
      .from("hearings")
      .select("*")
      .eq("case_id",caseId)
      .order("hearing_no");

      if(hError) console.log("history error",hError);
      if(hrError) console.log("hearing error",hrError);

      const history = historyData || [];
      const hearings = hearingData || [];

      const getStatusDetails = (status:string) => {

        const map:any = {

          SUBMITTED:"Case filed",
          FILING_COMPLETED:"Filing completed",
          UNDER_SCRUTINY:"Registry reviewing",
          WRONG_DOCS:"Corrections required",
          INSTITUTED:"Case accepted",
          REGISTERED:"Case registered",
          JUDGE_ASSIGNED:"Judge assigned",
          HEARING_1:"Admission hearing",
          HEARING_2:"Final hearing",
          DISPOSED:"Judgment delivered"

        };

        return map[status] || "";

      };

const timelineEvents = [

  ...history
    .filter(h => !h.status?.startsWith("DOC_"))
    .map(h => ({

      rawDate: new Date(h.created_at),

      date: new Date(h.created_at).toLocaleDateString(),

      topic: h.status.replaceAll("_", " "),

      details: getStatusDetails(h.status)

    })),

  ...hearings.map(h => ({

      rawDate: new Date(h.created_at || h.hearing_date),

      date: new Date(h.hearing_date).toLocaleDateString(),

      topic: `Hearing ${h.hearing_no}`,

      details: h.purpose

  }))

]

.sort(
  (a, b) =>
    a.rawDate.getTime() - b.rawDate.getTime()
);

      setEvents(timelineEvents);
      setLoading(false);

    };

    if(caseId){
      loadTimeline();
    }

  },[caseId]);


  if(loading)
  return <div className="p-6">Loading timeline...</div>;

  if(events.length===0)
  return <div className="p-6 text-slate-400">No timeline yet</div>;


  return(

    <div className="mt-4 border-l-2 border-slate-200 ml-3 pl-6 space-y-4">

      {events.map((event, idx)=>(

        <div key={idx} className="relative">

          <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>

          <div className="flex gap-4">

            <span className="text-[10px] font-bold text-slate-400 min-w-[90px]">
              {event.date}
            </span>

            <div>

              <h5 className="text-sm font-semibold">
                {event.topic}
              </h5>

              {event.details && (
                <p className="text-xs text-slate-500">
                  {event.details}
                </p>
              )}

            </div>

          </div>

        </div>

      ))}

    </div>

  );

};

export default CaseTimeline;