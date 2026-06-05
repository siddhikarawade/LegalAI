import React,{useEffect,useState} from "react";
import {useParams} from "react-router-dom";
import {supabase} from "../src/supabaseClient";
import { summarizeJudgmentPdf,summarizeLegalDoc } from "../services/geminiService";
import CaseTimeline from "../components/CaseTimeline";
import AddHearingForm from "../components/AddHearingForm";
import { updateHearingOutcome } from "../services/hearingService";

interface Props{user:any;}

const CaseDetail:React.FC<Props> = ({user})=>{

const {id}=useParams<{id:string}>();

const [legalCase,setLegalCase]=useState<any>(null);
const [loading,setLoading]=useState(true);

const [judges,setJudges]=useState<any[]>([]);
const [selectedJudge,setSelectedJudge]=useState("");

const [documents,setDocuments]=useState<any[]>([]);
const [hearings,setHearings]=useState<any[]>([]);
const [history,setHistory]=useState<any[]>([]);

const [tab,setTab]=useState("timeline");
const [loadingAi, setLoadingAi] = useState(false);
const [aiSummary, setAiSummary] = useState<string>('');

const [extractedImages,setExtractedImages]=useState<any[]>([]);

const [docType,setDocType]=useState("");
const [customName,setCustomName]=useState("");
const [file,setFile]=useState<File|null>(null);


/* LOAD ALL DATA */

const loadAll=async()=>{

if(!id) return;

setLoading(true);

/* case */

const {data:caseData}=await supabase
.from("cases")
.select("*")
.eq("id",id)
.single();

/* documents */

const {data:docs}=await supabase
.from("documents")
.select("*")
.eq("case_id",id)
.order("created_at");

/* hearings */

const {data:hear}=await supabase
.from("hearings")
.select("*")
.eq("case_id",id)
.order("hearing_no");

/* history */

const {data:hist}=await supabase
.from("case_status_history")
.select("*")
.eq("case_id",id)
.order("created_at");

/* judge name */

let judgeName="";

if(caseData?.assigned_judge_id){

const {data:j}=await supabase
.from("users")
.select("name")
.eq("id",caseData.assigned_judge_id)
.single();

judgeName=j?.name;

}

/* load extracted images */

let imgs:any[]=[];

if(docs?.length){

const docIds = docs.map(d=>d.id);

const {data:imageData}=await supabase
.from("extracted_images")
.select("*")
.in("document_id",docIds);

imgs=imageData||[];

}

setLegalCase({...caseData,judgeName});
setDocuments(docs||[]);
setHearings(hear||[]);
setHistory(hist||[]);
setExtractedImages(imgs);

setLoading(false);

};

useEffect(()=>{

loadAll();

},[id]);

useEffect(() => {

  if (tab !== "images" || !id) return;

  const interval = setInterval(async () => {

    const { data: docs } = await supabase
      .from("documents")
      .select("id")
      .eq("case_id", id);

    if (!docs || docs.length === 0) return;

    const docIds = docs.map(d => d.id);

    const { data:imageData } = await supabase
      .from("extracted_images")
      .select("*")
      .in("document_id", docIds);

    setExtractedImages(imageData || []);

  }, 3000);

  return () => clearInterval(interval);

}, [tab, id]);

/* LOAD JUDGES */

useEffect(()=>{

if(user.role!=="REGISTRY") return;

const loadJudges=async()=>{

const {data}=await supabase
.from("users")
.select("id,name")
.eq("role","JUDGE");

setJudges(data||[]);

};

loadJudges();

},[user]);



/* SAVE HISTORY */

const saveHistory=async(status:string)=>{

await supabase
.from("case_status_history")
.insert({

case_id:id,
status,
updated_by:user.id

});

};
const handleReupload = async (doc:any, allVersions:any[]) => {

  const input = document.createElement("input");
  input.type = "file";

  input.onchange = async (e:any) => {

    const file = e.target.files[0];
    if (!file) return;

    const path = `${doc.case_id}/${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from("case-docs")
      .upload(path, file);

    if (error) {
      alert(error.message);
      return;
    }

    const { data:urlData } = supabase.storage
      .from("case-docs")
      .getPublicUrl(path);

    const newVersion =
      Math.max(...allVersions.map(d => d.version || 1)) + 1;

    await supabase.from("documents").insert({
      case_id: doc.case_id,
      name: doc.name,
      file_url: urlData.publicUrl,
      version: newVersion,
      doc_status: "PENDING",
      defect_reason: null,
      hearing_stage: doc.hearing_stage,
      uploaded_by: user.id,

      extracting_images:true,
      images_extracted:false
    });

    await supabase
      .from("documents")
      .update({ doc_status: "REPLACED" })
      .eq("id", doc.id)


    loadAll();
  };

  input.click();
};
const groupedDocs = documents.reduce((acc, doc) => {
  if (!acc[doc.name]) acc[doc.name] = [];
  acc[doc.name].push(doc);
  return acc;
}, {} as Record<string, any[]>);


Object.values(groupedDocs).forEach(group => {
  group.sort((a, b) => b.version - a.version);
});


/* SCRUTINY */

const updateScrutiny=async(status:string)=>{

await supabase
.from("cases")
.update({

status,
scrutiny_status:status,
scrutiny_by:user.id

})
.eq("id",id);

await saveHistory(status);

await loadAll();

};



/* ASSIGN JUDGE + HEARING 1 */

const assignJudge = async () => {

  if (!selectedJudge) {
    alert("select judge");
    return;
  }

  /* check filing docs completed */

  const filingDocs = documents.filter(d =>
    d.hearing_stage === "FILING"
  );

  // const required = ["PLAINT","AFFIDAVIT","EVIDENCE","VAKALATNAMA"];

  // const missing = required.filter(r =>
  //   !filingDocs.some(d => d.name === r)
  // );

  // if (missing.length > 0) {
  //   alert("Upload all filing documents first");
  //   return;
  // }

  /* ✅ assign judge ONLY */

  await supabase
    .from("cases")
    .update({
      assigned_judge_id: selectedJudge,
      status: "INSTITUTED",     // ✅ use enum value
      case_stage: "ADMISSION"   // ✅ NEW FIELD
    })
    .eq("id", id);

  /* ❌ REMOVE hearing creation from here */

  await saveHistory("JUDGE_ASSIGNED");

  await loadAll();
};



/* CURRENT HEARING */

const getCurrentHearing=()=>{

if(hearings.length===0)
return 0;

return Math.max(
...hearings.map(h=>h.hearing_no||0)
);

};



/* DOCUMENT TYPES */

const getDocTypes = () => {

// const hearingNo = getCurrentHearing();


const filingCompleted = filingDocsUploaded();

/* LITIGANT NEVER UPLOAD */

if(user.role === "LITIGANT"){
return [];
}


/* ================= FILING STAGE ================= */

if(!filingCompleted){

if(
user.role==="ADVOCATE"
|| user.role==="REGISTRY"
){

return [

"PLAINT",
"AFFIDAVIT",
"EVIDENCE",
"VAKALATNAMA",
"OTHER"

];

}

}


/* ================= SCRUTINY STAGE ================= */

if(
legalCase.status==="UNDER_SCRUTINY"
&& user.role==="REGISTRY"
){

return [

"ORDER_SHEET"

];

}

const currentHearing = hearings[hearings.length - 1];

if (!currentHearing) return [];

const stage = currentHearing.stage;

/* ================= ADVOCATE ================= */

if (user.role === "ADVOCATE") {

  if (stage === "ADMISSION") {
    return ["WRITTEN_STATEMENT","COUNTER_AFFIDAVIT","OTHER"];
  }

  if (stage === "EVIDENCE") {
    return ["DEFENSE_EVIDENCE","OTHER"];
  }

  if (stage === "ARGUMENT") {
    return ["WRITTEN_ARGUMENTS","CASE_LAWS"];
  }

}

/* ================= REGISTRY ================= */

if (user.role === "REGISTRY") {

  return ["SUMMONS","ORDER_SHEET"];

}

/* ================= JUDGE ================= */

if (user.role === "JUDGE") {

  // ✅ after disposal → only judgment
  if (legalCase.status === "DISPOSED") {
    return ["JUDGMENT"];
  }

  // ✅ otherwise always allow order
  return ["ORDER"];
}

return [];
/* ================= HEARING 1 ================= */

// if(hearingNo===1){

// /* advocate */

// if(user.role==="ADVOCATE"){

// return [

// "WRITTEN_STATEMENT",
// "COUNTER_AFFIDAVIT",
// "DEFENSE_EVIDENCE",
// "OTHER"

// ];

// }

// /* registry */

// if(user.role==="REGISTRY"){

// return [

// "SUMMONS"

// ];

// }

// }


/* ================= HEARING 2 ================= */

// if(hearingNo===2){

// /* advocate */

// if(user.role==="ADVOCATE"){

// return [

// "WRITTEN_ARGUMENTS",
// "CASE_LAWS"

// ];

// }

// /* judge */

// if(user.role==="JUDGE"){

// return [

// "JUDGMENT"

// ];

// }

// }


return [];

};

const filingDocsUploaded = () => {

const required = [
"PLAINT",
"AFFIDAVIT",
"EVIDENCE",
"VAKALATNAMA"
];

return required.every(r =>
documents.some(d =>
d.hearing_stage === "FILING"
&& d.name === r
)
);

};


/* UPLOAD DOCUMENT */

const uploadDoc=async()=>{

if(!file){

alert("select file");
return;

}

if(!docType){

alert("select document");
return;

}

const finalName=
docType==="OTHER"
?customName
:docType;

const currentHearing = hearings[hearings.length - 1];

let stage = currentHearing?.stage || "FILING";
const path=
`${id}/${Date.now()}_${file.name}`;



/* upload */

const {error:uploadError}=
await supabase.storage
.from("case-docs")
.upload(path,file);

if(uploadError){

alert(uploadError.message);
return;

}

/* url */

const {data:urlData}=
supabase.storage
.from("case-docs")
.getPublicUrl(path);



/* save document */

await supabase
.from("documents")
.insert({

case_id:id,
name:finalName,
type:docType,
party:user.role,
hearing_stage:stage,
file_url:urlData.publicUrl,
uploaded_by:user.id,
doc_status: "PENDING",
defect_reason: null,

extracting_images: true,
images_extracted: false
});

await saveHistory(`DOC_${finalName}`);

/* create hearing 1 automatically */

/* move from hearing 0 to hearing 1 ONLY after all filing docs uploaded */

// if(hearingNo === 0){
const hasNoHearing = hearings.length === 0;

if (hasNoHearing) {
const filingDocs =
documents.filter(d =>
d.hearing_stage === "FILING"
);

const required = [
"PLAINT",
"AFFIDAVIT",
"EVIDENCE",
"VAKALATNAMA"
];

const allUploaded =
required.every(r =>
[...filingDocs,{name:finalName}]
.some(d => d.name === r)
);

if(allUploaded){

await supabase
.from("cases")
.update({

status:"UNDER_SCRUTINY"

})
.eq("id",id);

await saveHistory("FILING_COMPLETED");

await saveHistory("UNDER_SCRUTINY");

}

}


/* create hearing 2 */

// if(
// docType==="WRITTEN_STATEMENT"
// && hearingNo===1
// ){

// await supabase
// .from("hearings")
// .insert({

// case_id:id,
// hearing_no:2,
// stage:"HEARING_2",
// purpose:"Final",
// hearing_date:new Date()

// });

// await supabase
// .from("cases")
// .update({

// status:"HEARING_2"

// })
// .eq("id",id);

// await saveHistory("HEARING_2");

// }


/* dispose */

// if(
// docType==="JUDGMENT"
// && user.role==="JUDGE"
// ){

// await supabase
// .from("cases")
// .update({

// status:"DISPOSED"

// })
// .eq("id",id);

// await saveHistory("DISPOSED");


// }

await loadAll();

setFile(null);

};

  /* ============== AI SUMMARY =============== */


const handleGenerateSummary = async () => {

  setLoadingAi(true);

  // 1. Fetch documents
  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  if (!docs || docs.length === 0) {
    setAiSummary("No documents uploaded yet");
    setLoadingAi(false);
    return;
  }

  // 2. Get PDFs only
  const pdfDocs = docs.filter(d =>
    d.file_url?.toLowerCase().endsWith(".pdf")
  );

  if (pdfDocs.length === 0) {
    setAiSummary("No PDF documents available");
    setLoadingAi(false);
    return;
  }

  // 🔥 3. STRICT RULE: check judgment FIRST
  const judgmentDoc = pdfDocs.find(d => d.name === "JUDGMENT");

  let summary = "";

  if (judgmentDoc) {

    // ✅ ALWAYS use judgment if present
    summary = await summarizeJudgmentPdf(
      judgmentDoc.file_url
    );

  } else {

    // ✅ OTHERWISE combine PDFs
    const selectedDocs = pdfDocs.slice(0, 3);

    let combinedText = "";

    selectedDocs.forEach(doc => {
      combinedText += `\n\nDocument: ${doc.name}\n`;
      combinedText += `Reference: ${doc.file_url}\n`;
    });

    summary = await summarizeLegalDoc(
      "Case Documents Summary",
      combinedText
    );
  }

  setAiSummary(summary);
  setLoadingAi(false);
};

/* UI */

if(loading)
return<div className="p-20">Loading...</div>;

if(!legalCase)
return<div>Case not found</div>;

const extractImages = async (docId:string) => {

const {error} = await supabase
.from("documents")
.update({

extracting_images:true,
images_extracted:false

})
.eq("id",docId);

if(error){

throw new Error(error.message);

}

/* wait worker */

let attempts = 0;

while(attempts < 20){

await new Promise(r=>setTimeout(r,2000));

const {data} = await supabase
.from("documents")
.select("images_extracted")
.eq("id",docId)
.single();

if(data?.images_extracted){

const {data:imgs} = await supabase
.from("extracted_images")
.select("*")
.eq("document_id",docId);

return imgs || [];

}

attempts++;

}

throw new Error("timeout");

};

const getPriorityBadge=(level:string)=>{

const colors:any={

HIGH:"bg-red-100 text-red-700 ring-red-200",

MEDIUM:"bg-yellow-100 text-yellow-700 ring-yellow-200",

ROUTINE:"bg-green-100 text-green-700 ring-green-200"

};

return(

<span className={`px-6 py-2 text-[11px] font-black rounded-lg ring-1 tracking-widest ${colors[level]}`}> PRIORITY: {level} </span>

);

};


return (

<div className="space-y-10 max-w-6xl mx-auto px-6 py-10">

{/* ================= HEADER ================= */}

<div className="bg-white px-8 py-6 rounded-3xl shadow-lg border border-slate-100">

{/* ROW 1 */}

<div className="flex justify-between items-start gap-6">

<div className="flex gap-2 flex-wrap">

<span className="text-xs font-black bg-blue-600 text-white px-3 py-2 rounded-md tracking-widest">{legalCase.case_no || id}</span>

<span className="text-xs font-black bg-slate-900 text-slate-300 px-3 py-1 rounded-md tracking-widest">{legalCase.type || "-"}</span>

<span className="text-xs font-black bg-slate-900 text-slate-300 px-3 py-1 rounded-md tracking-widest">{legalCase.matter || "-"}</span>

</div>


{/* PRIORITY RIGHT */}

{legalCase.priority_level && getPriorityBadge(legalCase.priority_level)}

</div>



{/* ROW 2 */}

<div className="flex justify-between items-center mt-3 gap-6 flex-wrap">

<h1 className="text-4xl font-black text-slate-900 tracking-tight"> {legalCase.plaintiff}

<span className="mx-2 text-slate-300 italic font-light"> v. </span>
{legalCase.respondent}

</h1>



</div>



{/* ROW 3 */}

<div className="mt-2">

<span className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-bold ring-1 ring-emerald-200"> {legalCase.status}</span>

</div>



{/* ROW 4 → DETAILS */}

<div className="grid md:grid-cols-3 gap-x-10 gap-y-3 mt-4 text-base">

{/* judge */}

<div>

<div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Judge</div>

<div className="font-bold text-slate-800"> {legalCase.judgeName || "Not Assigned"}

</div>

</div>



{/* advocate */}

<div>

<div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest"> Advocate</div>

<div className="font-bold text-slate-800">{legalCase.advocate_name || "Not Assigned"}

</div>

</div>



{/* court */}

<div>

<div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Court</div>

<div className="font-bold text-slate-800">{legalCase.court_name || "District Court"}</div>

</div>



{/* filed */}

<div>

<div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Filed</div>

<div className="font-bold text-slate-800">
  {new Date(legalCase.created_at + "Z").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</div>

</div>



{/* next hearing */}

<div>

<div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Next Hearing</div>

<div className="font-bold text-blue-600">

    {legalCase.next_hearing_date
      ? new Date(legalCase.next_hearing_date + "Z").toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Pending"}

</div>

</div>



{/* purpose */}

<div>

<div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Purpose</div>

<div className="font-bold text-slate-800">{legalCase.next_hearing_purpose || "Not Set"}</div>

</div>

</div>



{/* SUMMARY */}

{legalCase.summary && (

<div className="mt-4 text-base text-slate-700 bg-slate-50 border rounded-xl px-5 py-4 leading-relaxed">

<span className="font-bold text-slate-500 uppercase text-sm tracking-wider mr-2">Initial Case Summary:</span>

{legalCase.summary}

</div>

)}

</div>


{/* scrutiny */}

{user.role==="REGISTRY"
&&(

<div className="bg-white p-6 shadow rounded space-y-4">

<h3 className="font-semibold">Scrutiny</h3>

{(
legalCase.status==="SUBMITTED"
|| legalCase.status==="UNDER_SCRUTINY"|| legalCase.status==="INSTITUTED"
)&&(

<div>

<button onClick={()=>updateScrutiny("UNDER_SCRUTINY")} className="bg-yellow-200 px-4 py-2 mr-2">Under Scrutiny</button>

<button
  onClick={async () => {

    const hasDefects = documents.some(
      d => d.doc_status === "DEFECTIVE"
    );

    if (hasDefects) {
      alert("Fix defective documents first");
      return;
    }

    await updateScrutiny("INSTITUTED");

  }}
  className="bg-green-600 text-white px-4 py-2"
>
  Approve
</button>

</div>

)}

{(
!legalCase.assigned_judge_id &&
(
  legalCase.status === "INSTITUTED"
)
)&&(

<div>

<h4 className="font-medium mb-2">Assign Judge</h4>

<select value={selectedJudge} onChange={e=>setSelectedJudge(e.target.value)} className="border p-2">

<option>Select Judge</option>

{judges.map(j=>( <option key={j.id} value={j.id}> {j.name} </option>

))}

</select>

<button onClick={assignJudge} className="bg-blue-700 text-white px-4 py-2 ml-2">Assign Judge</button>

</div>

)}

</div>

)}


{/* tabs */}

<div className="bg-white px-8 py-6 rounded-3xl shadow-lg border border-slate-100">

<div className="flex bg-slate-50/50 border-b mb-6">

{[
{key:"timeline",label:"Timeline"},
{key:"form",label:"Hearings"},
{key:"documents",label:"Documents"},
{key:"summary",label:"Summary"}

].map(t=>{

const active = tab===t.key;

return(

<button key={t.key} onClick={()=>setTab(t.key)} className={` flex-1 py-6 font-black uppercase text-xs tracking-widest transition-all duration-200

${active ? "text-blue-600 border-b-4 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}> {t.label} </button>

);

})}

</div>


{/* SUMMARY TAB */}

{tab === 'summary' && (
<div className="max-w-3xl mx-auto py-12">

{!aiSummary ? (

<div className="text-center">

<div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
<svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
<path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
</svg>
</div>

<h3 className="text-3xl font-black mb-4 text-slate-900 uppercase tracking-tight">AI Strategy Engine</h3>

<p className="text-slate-500 mb-10 text-lg leading-relaxed">Legal AI provides an intelligent review of the judgement, summarizing the court’s decision and key legal reasoning.</p>

<button onClick={handleGenerateSummary} disabled={loadingAi} className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black hover:bg-blue-600 transition disabled:opacity-50 flex items-center mx-auto space-x-3 shadow-2xl">

{loadingAi ? 'Scrutinizing Files...' : 'Synthesize Case Strategy'}

</button>

</div>

) : (

<div className="bg-indigo-50/50 border-2 border-indigo-100 p-10 rounded-[2.5rem] animate-in fade-in zoom-in duration-500 shadow-xl">

<div className="flex items-center space-x-3 text-indigo-600 mb-8">

<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
</svg>

<span className="font-black text-xs uppercase tracking-[0.3em]">AI Synthesized Insight</span>

</div>

<div className="prose prose-indigo max-w-none text-indigo-900 font-bold text-lg leading-relaxed whitespace-pre-wrap">{aiSummary}</div>

<button onClick={() => setAiSummary('')} className="mt-10 text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-[0.2em] underline underline-offset-4">Regenerate Analysis</button>

</div>

)}

</div>
)}


{/* TIMELINE TAB */}

{tab==="timeline"&&(

<div>

<h3 className="text-sm font-bold text-slate-600 mb-3">Case Progress Timeline</h3>

<CaseTimeline caseId={id!}/>

</div>

)}

{tab === "form" && (

<div className="space-y-6">

  {/* 🔥 ADD HEARING FORM */}
  {user?.role === "JUDGE" && legalCase?.status !== "DISPOSED" && (
    <AddHearingForm
      caseId={id!}
      onAdded={loadAll}
      user={user}
      caseStatus={legalCase?.status}
    />
  )}

  {/* 🔥 SHOW EXISTING HEARINGS */}
  <div className="space-y-3">

    {hearings.length === 0 && (
      <div className="text-sm text-gray-400">
        No hearings scheduled yet
      </div>
    )}

    {hearings.map(h => (

  <div key={h.id} className="border p-4 rounded-lg bg-white shadow-sm">

    <div className="font-bold">
      Hearing #{h.hearing_no} - {h.stage}
    </div>

    <div className="text-sm text-gray-600">
      {h.hearing_date} | {h.purpose}
    </div>

    <div className="text-xs mt-1 font-semibold">
      Status: {h.status} | Outcome: {h.outcome}
    </div>

    {/* 🔥 OUTCOME BUTTONS */}
    {user?.role === "JUDGE" && h.outcome === "PENDING" && (

      <div className="flex gap-2 mt-3">

        <button
          onClick={async () => {
            await updateHearingOutcome(h.id, "ADJOURNED");
            loadAll();
          }}
          className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
        >
          Adjourn
        </button>

        <button
          onClick={async () => {
            await updateHearingOutcome(h.id, "RESOLVED");
            loadAll();
          }}
          className="bg-green-600 text-white px-3 py-1 rounded text-xs"
        >
          Resolve
        </button>

        <button
          onClick={async () => {
            await updateHearingOutcome(h.id, "CANCELLED");
            loadAll();
          }}
          className="bg-red-600 text-white px-3 py-1 rounded text-xs"
        >
          Cancel
        </button>

      </div>

    )}

  </div>

))}

  </div>

</div>

)}
{/* DOCUMENTS TAB */}

{tab==="documents" && (

<div>

{getDocTypes().length>0 && (

<div>

<select value={docType} onChange={e=>setDocType(e.target.value)} className="border p-2">

<option value="">Select document</option>

{getDocTypes().map(d=>( 
  
<option key={d}> {d}</option>

))}

</select>


{docType==="OTHER"&&(

<input placeholder="Enter Name" value={customName} onChange={e=>setCustomName(e.target.value)} className="border p-2 ml-2"/>

)}


<input type="file" onChange={e=>setFile( e.target.files ? e.target.files[0] :null )} className="ml-2"/>

<button onClick={uploadDoc} className="bg-black text-white px-4 py-2 ml-2">Upload</button>

</div>

)}

<div className="space-y-3 mt-4">





{Object.entries(groupedDocs).map(([name, docs]) => {

  const latest = docs[0]; // highest version

  return (

    <div key={name} className="border rounded-xl p-4 bg-white shadow-sm">

      {/* HEADER */}
      <div className="font-semibold text-slate-800 mb-2">
        {name}
      </div>

      {/* LATEST VERSION */}
      <div className="p-3 border rounded-lg mb-2 bg-slate-50">

        <div className="text-sm font-bold">
          v{latest.version} (Latest)
        </div>

        <div className="text-xs text-gray-500">
          {latest.hearing_stage}
        </div>

        {/* STATUS */}
        <div className="text-xs mt-1">
          Status:
          <span className={`ml-1 font-bold ${
            (latest.doc_status || "PENDING") === "DEFECTIVE"
              ? "text-red-600"
              : latest.doc_status === "VERIFIED"
              ? "text-green-600"
              : "text-gray-500"
          }`}>
            {latest.doc_status||"PENDING"}
          </span>
        </div>

        {/* DEFECT REASON */}
        {latest.defect_reason && (
          <div className="text-xs text-red-500">
            Reason: {latest.defect_reason}
          </div>
        )}

        {/* ACTIONS */}
        {/* ACTIONS */}
<div className="flex gap-2 mt-2">

  {/* VIEW */}
  <button
    onClick={() => window.open(latest.file_url)}
    className="px-3 py-1 text-xs bg-slate-800 text-white rounded"
  >
    View
  </button>

  {/* 🔥 REGISTRY ACTIONS ONLY FOR PENDING */}
  {user.role === "REGISTRY" &&
    (latest.doc_status || "PENDING") === "PENDING" && (

    <>
      <button
        onClick={async () => {
          await supabase
            .from("documents")
            .update({
              doc_status: "VERIFIED",
              defect_reason: null
            })
            .eq("id", latest.id);

          loadAll();
        }}
        className="bg-green-600 text-white px-2 py-1 rounded text-xs"
      >
        Verify
      </button>

      <button
        onClick={async () => {
          const reason = prompt("Enter defect reason");
          if (!reason) return;

          await supabase
            .from("documents")
            .update({
              doc_status: "DEFECTIVE",
              defect_reason: reason
            })
            .eq("id", latest.id);

          loadAll();
        }}
        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
      >
        Defective
      </button>
    </>
  )}

  {/* 🔁 REUPLOAD ONLY IF DEFECTIVE */}
  {(latest.doc_status || "PENDING") === "DEFECTIVE" && (
    <button
      onClick={() => handleReupload(latest, docs)}
      className="bg-orange-500 text-white px-2 py-1 rounded text-xs"
    >
      Re-upload
    </button>
  )}

</div>
      </div>

      {/* OLD VERSIONS */}
      {docs.length > 1 && (
        <div className="text-xs text-gray-500 mb-1">Previous Versions</div>
      )}

      {docs.slice(1).map(old => (

        <div key={old.id} className="text-xs border p-2 rounded mb-1 flex justify-between">

          <div>
            v{old.version} — {old.doc_status}
          </div>

          <button
            onClick={() => window.open(old.file_url)}
            className="text-blue-600"
          >
            View
          </button>

        </div>

      ))}

    </div>

  );

})}

</div>

</div>

)}


{/* IMAGES TAB */}

{tab === "images" && (

<div className="space-y-6">

{Object.values(groupedDocs).map((docs:any[]) => {

  const latest = docs[0];

  const imgs = extractedImages.filter(
    i =>
      String(i.document_id) ===
      String(latest.id)
  );

  return (

    <div
      key={latest.id}
      className="bg-white rounded-xl shadow border p-5"
    >

      <div className="flex justify-between items-center mb-4">

        <div>

          <div className="font-semibold text-slate-800">
            {latest.name}
          </div>

          <div className="text-xs text-slate-500">
            {latest.hearing_stage}
          </div>

          <div className="text-xs text-slate-400 mt-1">
            Version {latest.version || 1}
          </div>

        </div>

        <button
          onClick={() =>
            window.open(latest.file_url)
          }
          className="text-xs px-3 py-1 bg-slate-100 rounded-lg"
        >
          View PDF
        </button>

      </div>

      {imgs.length === 0 && (

        <div className="text-sm text-slate-400 border border-dashed p-6 rounded-lg text-center">

          No images extracted for this document

        </div>

      )}

      {imgs.length > 0 && (

        <div className="grid grid-cols-4 gap-4">

          {imgs.map((img:any) => (

            <div
              key={img.id}
              className="group border rounded-lg overflow-hidden bg-slate-50 hover:shadow"
            >

              <img
                src={img.image_url}
                className="w-full h-40 object-contain bg-white"
              />

              <div className="p-2 flex justify-between text-xs">

                <a
                  href={img.image_url}
                  target="_blank"
                  className="text-blue-600"
                >
                  Preview
                </a>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

})}

</div>

)}

</div>

</div>

)};

export default CaseDetail; 