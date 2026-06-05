import { supabase } from "../src/supabaseClient";

// Add a hearing and update the case
export const addHearing = async (
  caseId: string,
  hearing_date: string,
  purpose: string,
  stage: string,
  createdBy: string
) => {

  // 1️⃣ insert hearing
  const { data, error } = await supabase
    .from("hearings")
    .insert([
      {
        case_id: caseId,
        hearing_date,
        purpose,
        stage,
        created_by: createdBy
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // 2️⃣ check how many hearings exist
  const { data: hearings } = await supabase
    .from("hearings")
    .select("id")
    .eq("case_id", caseId);

   

    await supabase
      .from("cases")
      .update({
        status: "PENDING"
      })
      .eq("id", caseId);

  

  return data;
};

// Get hearings for a case
export const getHearings = async (caseId: string) => {
  const { data, error } = await supabase
    .from("hearings")
    .select("*")
    .eq("case_id", caseId)
    .order("hearing_date", { ascending: true });

  if (error) throw error;
  return data;
};

// Update hearing outcome and optionally update case
// export const updateHearingOutcome = async (
//   hearingId: string,
//   caseId: string,
//   outcome: string
// ) => {
//   const { data, error } = await supabase
//     .from("hearings")
//     .update({ outcome })
//     .eq("id", hearingId)
//     .select()
//     .single();

//   if (error) throw error;

//   // If HEARD or DISPOSED, update case next hearing date/purpose
//   if (outcome === "HEARD") {
//     await supabase
//       .from("cases")
//       .update({ next_hearing_date: null, next_hearing_purpose: null })
//       .eq("id", caseId);
//   }

//   return data;
// };

export const updateHearingOutcome = async (
  hearingId: string,
  outcome: string,
  remarks?: string
) => {
  const { data, error } = await supabase
    .from("hearings")
    .update({
      outcome,
      remarks,
      status: "COMPLETED"
    })
    .eq("id", hearingId)
    .select()
    .maybeSingle();

  if (error) throw error;

  return data;
};