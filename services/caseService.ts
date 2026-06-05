import { supabase } from "../src/supabaseClient";
import { LegalCase, User } from "../types";

export const getJudgeCases = async ( judgeId:string )=>{

const { data,error } = await supabase
.from("cases")
.select("*")
.eq("assigned_judge_id",judgeId
)
.order("next_hearing_date",{ ascending:true }
);

if(error)
throw error;
return data;
};

export const getAllCases = async (): Promise<LegalCase[]> => {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as LegalCase[];
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) throw error;
  return data as User[];
};