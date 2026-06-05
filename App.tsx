import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { User, UserRole } from './types';
import { supabase } from './src/supabaseClient';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CaseDetail = React.lazy(() => import('./pages/CaseDetail'));
const SearchPrecedence = React.lazy(() => import('./pages/SearchPrecedence'));
const NewCase = React.lazy(() => import('./pages/NewCase'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const HearingsPage = React.lazy(() => import('./pages/MockDashboardPages').then(module => ({ default: module.HearingsPage })));

const App: React.FC = () => {

const [user,setUser] = useState<User | null>(null);
const [loadingSession,setLoadingSession] = useState(true);


/* restore session */

useEffect(()=>{

const restore = async()=>{
const { data:{ user } } =
await supabase.auth.getUser();
if(user){
const { data:profile } =
await supabase
.from("users")
.select("*")
.eq("id",user.id)
.single();
if(profile){
setUser(profile);
}
}
setLoadingSession(false);
};
restore();
},[]);


/* login */

const handleLogin=(u:User)=>{
setUser(u);
};


/* logout */

const handleLogout=async()=>{
await supabase.auth.signOut();
setUser(null);
};


/* WAIT until session restored */

if(loadingSession){
return (
<div className="h-screen flex items-center justify-center font-bold">
Loading !! Please wait ...
</div>
);

}



return (
<Router>
<Layout user={user} onLogout={handleLogout}>
<Suspense fallback={
  <div className="h-screen flex items-center justify-center font-bold">
    Loading page...
  </div>
}>
<Routes>

<Route path="/" element={user?<Navigate to="/dashboard" replace/>:<Home/>}/>

<Route path="/login" element={user?<Navigate to="/dashboard" replace/>:<Login onLogin={handleLogin}/>}/>

<Route path="/signup" element={user?<Navigate to="/dashboard" replace/>:<Signup/>}/>

<Route path="/dashboard" element={user?<Dashboard user={user}/>:<Login onLogin={handleLogin}/>}/>

<Route path="/admin" element={user&&user.role===UserRole.ADMIN?<AdminDashboard/>:<Login onLogin={handleLogin}/>}/>

<Route path="/case/:id" element={user?<CaseDetail user={user}/>:<Login onLogin={handleLogin}/>}/>

<Route path="/search" element={user?<SearchPrecedence/>:<Login onLogin={handleLogin}/>}/>

<Route path="/new-case" element={user?<NewCase/>:<Login onLogin={handleLogin}/>}/>

<Route path="/hearings" element={user?<HearingsPage/>:<Login onLogin={handleLogin}/>}/>

<Route path="*" element={user?<Navigate to="/dashboard" replace/>:<Home/>}/>

</Routes>
</Suspense>
</Layout>
</Router>
);

};

export default App;