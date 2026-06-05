import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "../src/supabaseClient";

interface LoginProps {
  onLogin:(user:any)=>void;
}

const Login:React.FC<LoginProps> = ({ onLogin })=>{

  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData,setFormData] = useState({
    identifier:"",
    password:""
  });

  const [error,setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {

  e.preventDefault();

  if (loading) return;

  setLoading(true);
  setError("");

  try {

    let emailToUse =
      formData.identifier.trim().toLowerCase();

    // if username entered, convert → email
    if (!emailToUse.includes("@")) {

      const { data, error } =
        await supabase
          .from("users")
          .select("email")
          .eq("username", emailToUse)
          .single();

      if (error || !data) {

        setError("Invalid username/email or password");
        setLoading(false);
        return;

      }

      emailToUse = data.email;

    }

    // LOGIN
    const { data: authData, error: loginError } =
      await supabase.auth.signInWithPassword({

        email: emailToUse,
        password: formData.password

      });

    if (loginError || !authData.user) {

      setError("Invalid username/email or password");
      setLoading(false);
      return;

    }

    // GET PROFILE
    const { data: profile, error: profileError } =
      await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

    if (profileError || !profile) {

      setError("User data missing");
      setLoading(false);
      return;

    }

    onLogin(profile);

    navigate("/dashboard");

  } catch (err) {

    console.log(err);

    setError("Login failed");

  }

  setLoading(false);

};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link to="/" className="text-4xl font-black text-slate-900 inline-block uppercase tracking-[0.2em]">
            Legal<span className="text-blue-600">AI</span>
          </Link>
        </div>

        <div className="bg-white p-12 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100">
          <h2 className="text-3xl font-black mb-10 text-center text-slate-900 uppercase tracking-tight">Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-rose-100 text-center">{error}</div>}
            
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Username</label>
              <input 
                type="text" 
                required
                className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition text-slate-900 font-black placeholder-slate-400"
                placeholder="advocate@court.gov"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition text-slate-900 font-black placeholder-slate-400"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-blue-600 transition transform hover:-translate-y-1 text-lg uppercase tracking-widest ring-offset-4 hover:ring-2 hover:ring-blue-400">
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-12 text-center text-xs font-bold text-slate-400">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-black hover:underline uppercase tracking-widest">Create Account</Link>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
