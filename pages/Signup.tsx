import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { supabase } from "../src/supabaseClient";

// const isValidName = (val:string)=> /^[A-Za-z ]{3,}$/.test(val);
const isValidUsername = (val:string)=> /^[a-z0-9_]{4,20}$/.test(val);
const isValidEmail = (val:string)=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isStrongPassword = (val:string)=>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(val);

const Signup: React.FC = () => {

  const navigate = useNavigate();
  const [errors,setErrors]=useState<any>({});

  const [formData,setFormData] = useState({
    name:"",
    username:"",
    email:"",
    password:"",
    role:UserRole.ADVOCATE
  });

  const validateField = (name:string,value:string)=>{

  let message="";

  // if(name==="name" && !isValidName(value))
  // message="Only letters, min 3 chars";

  if(name==="username" && !isValidUsername(value))
  message="4-20 lowercase letters/numbers only";

  if(name==="email" && !isValidEmail(value))
  message="Invalid email";

  if(name==="password" && !isStrongPassword(value))
  message="Min 8 chars, 1 uppercase, 1 number, 1 special char";

  setErrors((prev:any)=>({
  ...prev,
  [name]:message
  }));

  };

  const validateAll = () => {
  const newErrors: any = {};

  if (!formData.name.trim()) {
    newErrors.name = "Name required";
  }

  if (!/^[a-z0-9_]{4,20}$/.test(formData.username)) {
    newErrors.username = "4-20 lowercase letters/numbers only";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Invalid email";
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(formData.password)) {
    newErrors.password =
      "Min 8 chars, 1 uppercase, 1 number, 1 special char";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();

    if (!validateAll()) {
  alert("Please fix errors");
  return;
}

    const email = formData.email.trim().toLowerCase();
    const username = formData.username.trim().toLowerCase();

    try {
      // check username exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("username")
        .eq("username", username)
        .maybeSingle();

      if(existingUser){
        alert("Username already exists");
        return;
      }

      // create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password
      });

      if(error){
        alert(error.message);
        return;
      }

      if(!data.user){
        alert("Signup failed");
        return;
      }

      // save profile
      const { error: insertError } =
      await supabase
        .from("users")
        .insert({
          id: data.user.id,
          name: formData.name,
          username: username,
          email: email,
          role: formData.role
        })
        .select()
        .single();
        
          if(insertError){
            alert(insertError.message);
            return;
          }

          alert("Account created");
          navigate("/login");
        } catch {
          alert("Signup failed");
        }
      };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <Link to="/" className="text-4xl font-black text-slate-900 inline-block uppercase tracking-[0.2em]">
            LEGAL<span className="text-blue-600">AI</span>
          </Link>
        </div>

        <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100">
          <h2 className="text-4xl font-black mb-12 text-center text-slate-900 uppercase tracking-tight">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Full Identity Name</label>
                <input type="text" required value={formData.name} onChange={(e)=>{setFormData({...formData,name:e.target.value});validateField("name",e.target.value);}} 
                className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition text-slate-900 font-bold placeholder-slate-300"/>
                {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Username</label>
                <input type="text" required value={formData.username} onChange={(e)=>{const val=e.target.value.toLowerCase();setFormData({...formData,username:val});validateField("username",val);}} 
                className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition text-slate-900 font-bold placeholder-slate-300"/> 
                {errors.username && <p className="text-red-500 text-xs font-bold mt-1">{errors.username}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={(e)=>{setFormData({...formData,email:e.target.value});validateField("email",e.target.value);}} 
              className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition text-slate-900 font-bold placeholder-slate-300"/> 
              {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Password</label>
             <input type="password" required value={formData.password} onChange={(e)=>{setFormData({...formData,password:e.target.value});validateField("password",e.target.value);}} 
             className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition text-slate-900 font-bold placeholder-slate-300"/>
            {errors.password && <p className="text-red-500 text-xs font-bold mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 ml-1">Designated System Role</label>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[UserRole.ADVOCATE, UserRole.JUDGE, UserRole.REGISTRY, UserRole.ADMIN].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition ${
                      formData.role === role ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-slate-50 text-slate-900 border-slate-100 hover:border-blue-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-blue-600 transition transform hover:-translate-y-1 text-xl uppercase tracking-[0.2em]">
              Create Account
            </button>
          </form>

          <div className="mt-12 text-center text-xs font-bold text-slate-400">
            Already have an account? <Link to="/login" className="text-blue-600 font-black hover:underline uppercase">Sign In Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;