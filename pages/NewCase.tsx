import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CASE_CATEGORIES } from '../types';
import { supabase } from "../src/supabaseClient";

const isValidCourtName = (name:string)=>{

const value=name.trim();

return (
/\b(Court|Tribunal|Commission|Authority)\b/i.test(value)
&&
/^[A-Za-z0-9 ,().-]{5,}$/.test(value)
);

};
const isValidAadhar = (val:string)=> /^\d{12}$/.test(val);
const isValidPAN = (val:string)=> /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val);
const isValidDL = (val:string)=> /^[A-Z]{2}[0-9]{2}[0-9]{11}$/.test(val);

const NewCase: React.FC = () => {

const navigate = useNavigate();
const [userRole,setUserRole]=useState("");
const [customType,setCustomType]=useState("");
const [customMatter,setCustomMatter]=useState("");
const [advocates,setAdvocates]=useState<any[]>([]);
const [selectedAdvocate,setSelectedAdvocate]=useState("");
const [errors,setErrors]=useState<any>({});
const [loading,setLoading]=useState(false);
const [formData, setFormData] = useState({
type:'CIVIL',
matter:'Contract Breach',
courtName:'',
plaintiff:'',
respondent:'',
plaintiffAadhar:'',
plaintiffIdType:'PAN',
plaintiffIdNo:'',
summary:''
});

/* load user + advocates */

useEffect(()=>{

const loadData=async()=>{

const {data:userData}=await supabase.auth.getUser();

if(!userData.user) return;
const {data:profile}=await supabase
.from("users")
.select("role")
.eq("id",userData.user.id)
.single();
setUserRole(profile?.role || "");

/* advocates */

const {data}=await supabase
.from("users")
.select("id,name")
.eq("role","ADVOCATE");
setAdvocates(data||[]);

};
loadData();
},[]);


/* submit */

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);   // start loader
/* validations */
try{
const newErrors:any={};

/* COURT NAME */
if(!isValidCourtName(formData.courtName)){
newErrors.courtName =
"Enter valid court name (Example: High Court of Delhi)";
}

/* AADHAR */
if(!isValidAadhar(formData.plaintiffAadhar)){
newErrors.aadhar="Aadhar must be 12 digits";
}

/* PAN */
if(
formData.plaintiffIdType==="PAN"
&&
!isValidPAN(formData.plaintiffIdNo)
){
newErrors.idNo="Invalid PAN format (ABCDE1234F)";
}

/* DRIVING LICENSE */
if(
formData.plaintiffIdType==="LICENSE"
&&
!isValidDL(formData.plaintiffIdNo)
){
newErrors.idNo="Invalid License format";
}

/* ADVOCATE REQUIRED */
if(
userRole==="REGISTRY"
&&
!selectedAdvocate
){
newErrors.advocate="Select Advocate";
}

/* show errors */
setErrors(newErrors);
if(Object.keys(newErrors).length>0){
return;
}

const {data:userData}=await supabase.auth.getUser();
if(!userData.user){
alert("login required");
return;
}

const userId=userData.user.id;

const {data:profile}=await supabase
.from("users")
.select("name,role")
.eq("id",userId)
.single();

let advocateId=null;
let advocateName="";

/* registry selects advocate */

if(profile.role==="REGISTRY"){

const selected=
advocates.find(a=>a.id===selectedAdvocate);
advocateId=selected?.id||null;
advocateName=selected?.name||"";

}

/* advocate files own case */

if(profile.role==="ADVOCATE"){
advocateId=userId;
advocateName=profile.name;
}

const finalType =
formData.type==="OTHER"
? customType
: formData.type;


const finalMatter =

formData.type==="OTHER"
? customMatter
: formData.matter==="OTHER"
? customMatter
: formData.matter;


/* create case */

const caseNumber=`CNR-${Date.now()}`;

const {data:newCase,error}=await supabase
.from("cases")
.insert({
case_no:caseNumber,
type: finalType,
matter: finalMatter,
court_name:formData.courtName,
plaintiff:formData.plaintiff,
respondent:formData.respondent,
plaintiff_aadhar:formData.plaintiffAadhar,
plaintiff_id_type:formData.plaintiffIdType,
plaintiff_id_no:formData.plaintiffIdNo,
summary:formData.summary,
status:"SUBMITTED",
filed_by:userId,
filed_by_name:profile.name,
advocate_id:advocateId,
advocate_name:advocateName
})
.select()
.single();

if(error){

if(error.message.includes("unique_case_final")){

setErrors({
submit:"Same case already filed for this litigant"
});

setLoading(false);

return;

}

alert(error.message);
setLoading(false);
return;

}

/* create hearing 0 */

await supabase
.from("hearings")
.insert({
case_id:newCase.id,
hearing_no:0,
stage:"FILING",
purpose:"Document Filing"
});
navigate("/dashboard");
}catch(err){

console.error(err);
alert("Error filing case");

}
finally{

setLoading(false);  // stop loader always

}

};


return (

<div className="max-w-4xl mx-auto py-10 px-4">

<div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">

<h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase leading-none">E-File new Case</h1>

<p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em] mb-12">Indian Electronic Judicial System</p>

<form onSubmit={handleSubmit} className="space-y-10 text-slate-900">

{/* CASE TYPE */}

<div className="grid md:grid-cols-2 gap-8">

{/* TYPE */}

<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">

Case Jurisdiction Type

</label>

<select
className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black"
value={formData.type}

onChange={(e)=>{

const val=e.target.value;

setFormData({

...formData,

type:val,

/* reset matter safely */

matter:
val==="OTHER"
? "OTHER"
: CASE_CATEGORIES[
val as keyof typeof CASE_CATEGORIES
]?.[0] || ""

});

}}

>

{Object.keys(CASE_CATEGORIES).map(cat=>(

<option key={cat} value={cat}>

{cat}

</option>

))}

<option value="OTHER">

OTHER

</option>

</select>


{/* custom type */}

{formData.type==="OTHER" && (

<input

required

placeholder="Enter Case Type"

value={customType}

onChange={(e)=>

setCustomType(e.target.value.toUpperCase())

}

className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-bold"

/>

)}

</div>



{/* MATTER */}

<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">

Matter / Nature of Dispute

</label>


{/* show dropdown only when predefined type */}

{formData.type!=="OTHER" && (

<select

className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black"

value={formData.matter}

onChange={(e)=>{

setFormData({

...formData,

matter:e.target.value

});

}}

>

{

CASE_CATEGORIES[
formData.type as keyof typeof CASE_CATEGORIES
]?.map((m:string)=>(

<option key={m} value={m}>

{m}

</option>

))

}

<option value="OTHER">

OTHER

</option>

</select>

)}



{/* show input when OTHER */}

{

formData.type==="OTHER"

||

formData.matter==="OTHER"

? (

<input

required

placeholder="Enter Matter"

value={customMatter}

onChange={(e)=>

setCustomMatter(e.target.value)

}

className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-bold"

/>

)

: null

}

</div>

</div>


{/* COURT NAME */}

<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Court Name</label>

<input
required
className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition"
placeholder="High Court of Bombay"
value={formData.courtName}
onChange={(e)=>{
const value=e.target.value;
setFormData({
...formData,
courtName:value
});
/* live validation */
if(value.trim().length>0){
if(!isValidCourtName(value)){
setErrors((prev:any)=>({
...prev,
courtName:"Enter valid court name (Example: High Court of Bombay)"
}));
}
else{
setErrors((prev:any)=>({
...prev,
courtName:null
}));
}
}
}}
onBlur={()=>{
/* optional: validate when user leaves field */
if(!isValidCourtName(formData.courtName)){
setErrors((prev:any)=>({
...prev,
courtName:"Enter valid court name (Example: High Court of Bombay)"
}));
}
}}
/>
{errors.courtName && (
<p className="text-red-500 text-xs font-bold mt-1">
{errors.courtName}
</p>
)}
</div>


{/* PARTIES */}

<div className="grid md:grid-cols-2 gap-8">

<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Plaintiff / Appellant Name</label>

<input
required
className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition"
placeholder="Name of party filing case"
value={formData.plaintiff}
onChange={(e)=>
setFormData({
...formData,
plaintiff:e.target.value
})
}
/>

</div>


<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Respondent / Defendant Name</label>

<input
required
className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition"
placeholder="Name of Opposing party"
value={formData.respondent}
onChange={(e)=>
setFormData({
...formData,
respondent:e.target.value
})
}
/>

</div>

</div>


{/* ID SECTION */}

<div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 space-y-8">

<div className="flex items-center gap-2">

<div className="w-6 h-6 bg-blue-600 text-white rounded-md flex items-center justify-center text-[10px] font-black">ID</div>

<span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Litigant Identity Verification</span>

</div>


<div className="grid md:grid-cols-3 gap-6">

<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Aadhar Number</label>

<input
required
maxLength={12}
className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-100"
placeholder="123456789012"
value={formData.plaintiffAadhar}
onChange={(e)=>
setFormData({
...formData,
plaintiffAadhar:e.target.value.replace(/\D/g,'')
})
}
/>
{errors.aadhar&&(
<p className="text-red-500 text-xs font-bold">
{errors.aadhar}
</p>
)}
</div>

<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secondary ID Type</label>

<select
className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-100"
value={formData.plaintiffIdType}
onChange={(e)=>
setFormData({
...formData,
plaintiffIdType:e.target.value
})
}
>

<option>PAN</option>
<option>LICENSE</option>

</select>

</div>


<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Number</label>

<input
required
className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-100"
placeholder="Document Number"
value={formData.plaintiffIdNo}
onChange={(e)=>
setFormData({
...formData,
plaintiffIdNo:e.target.value.toUpperCase()
})
}
/>
{errors.idNo&&(
<p className="text-red-500 text-xs font-bold">
{errors.idNo}
</p>
)}
</div>
</div>
</div>


{/* ADVOCATE SELECT */}

{userRole==="REGISTRY"&&(

<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign Advocate</label>

<select
value={selectedAdvocate}
onChange={(e)=>setSelectedAdvocate(e.target.value)}
className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-100"
>
<option value="">Select Advocate</option>

{advocates.map(a=>(
<option key={a.id} value={a.id}>{a.name}</option>
))}

</select>
{errors.advocate&&(
<p className="text-red-500 text-xs font-bold">
{errors.advocate}
</p>
)}
</div>
)}


{/* SUMMARY */}

<div className="space-y-3">

<label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Case Description</label>

<p className="text-xs text-slate-400 ml-1 -mt-1">Provide a short description of the case issue (2–3 lines)</p>

<textarea
rows={4}
placeholder="Example: Dispute related to breach of contract for delayed delivery of goods..."
value={formData.summary}
onChange={(e)=>
setFormData({
...formData,
summary:e.target.value
})
}
className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-100"
/>
</div>


{/* BUTTONS */}

<div className="flex justify-end gap-6 pt-10">

<button
type="submit"
disabled={loading}
className={`px-16 py-6 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-2xl transition transform
${loading
? "bg-blue-300 cursor-not-allowed"
: "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 ring-offset-4 hover:ring-2 hover:ring-blue-400"
}`}
>

{loading ? (

<div className="flex items-center gap-3">

<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

Filing Case...

</div>

) : (

"Institute Case File"

)}

</button>
{errors.submit && (

<p className="text-red-600 font-bold text-sm text-right">

{errors.submit}

</p>

)}
</div>

</form>
</div>
</div>
);
};
export default NewCase;