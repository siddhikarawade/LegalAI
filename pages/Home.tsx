import React from 'react';
import { Link } from 'react-router-dom';
import SearchPrecedence from './SearchPrecedence';
import { ShieldCheck,Gavel,ClipboardList,Scale,User,Brain,FileText,Search,Landmark } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="bg-white min-h-screen text-slate-900 flex flex-col">

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[75vh] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden pt-20 pb-24">

        {/* Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-black/70"></div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Justice Accelerated by <span className="text-blue-500">Legal AI</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Intelligent judicial case management platform with AI-powered
            categorization, prioritization, summarization and semantic precedent analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-sm uppercase tracking-wide shadow-md transition-all hover:-translate-y-1">Get Started</Link>

            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all">Login to Portal</Link>
          </div>

        </div>
      </section>

      {/* ================= SEARCH SECTION ================= */}
      <section className="bg-slate-100 py-20 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10">

            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Legal Intelligence Engine</h2>
              <p className="text-slate-600 mt-3 max-w-2xl mx-auto">Search and analyze judicial precedents using contextual AI ranking.</p>
            </div>

            <div className="border-t border-slate-200 pt-8"><SearchPrecedence /></div>

          </div>
        </div>
      </section>

      {/* ================= ROLE BASED SYSTEM ================= */}
      <section className="bg-white py-24 border-t border-slate-200 ">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Role-Based Judicial Access</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">Secure, hierarchical access ensuring accountability and efficient judicial workflows.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">

            {/* ADMIN */}
            <RoleCard
              icon={<ShieldCheck className="text-blue-600" size={24} />}
              bg="bg-blue-100"
              title="ADMIN"
              desc="System configuration, user management and oversight."
            />

            {/* JUDGE */}
            <RoleCard
              icon={<Gavel className="text-purple-600" size={24} />}
              bg="bg-purple-100"
              title="JUDGE"
              desc="Case review, AI summaries and judicial decision workflow."
            />

            {/* REGISTRY */}
            <RoleCard
              icon={<ClipboardList className="text-amber-600" size={24} />}
              bg="bg-amber-100"
              title="REGISTRY"
              desc="Filing validation, document scrutiny and scheduling."
            />

            {/* ADVOCATE */}
            <RoleCard
              icon={<Scale className="text-green-600" size={24} />}
              bg="bg-green-100"
              title="ADVOCATE"
              desc="Case submissions, research and document management."
            />

            {/* LITIGANT */}
            <RoleCard
              icon={<User className="text-slate-700" size={24} />}
              bg="bg-slate-200"
              title="LITIGANT"
              desc="Case tracking, notifications and order access."
            />

          </div>
        </div>
      </section>

      {/* ================= BUILT FOR MODERN COURTS ================= */}
      <section className="bg-slate-50 py-28 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Landmark className="text-blue-600" size={28} />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Built for Modern Courts</h2>

            <p className="text-slate-600 mt-5 max-w-3xl mx-auto">
              Designed to integrate with national judicial systems, enabling digital filings,
              AI-assisted research and intelligent workload distribution.
            </p>
            
          </div>

          <div className="grid md:grid-cols-3 gap-10">

            <FeatureCard
              icon={<Brain className="text-purple-600" size={24} />}
              bg="bg-purple-100"
              title="AI Case Prioritization"
              desc="Automated urgency detection and intelligent case classification."
            />

            <FeatureCard
              icon={<FileText className="text-amber-600" size={24} />}
              bg="bg-amber-100"
              title="Digital Document Workflow"
              desc="Secure filings, validation and AI-powered summarization."
            />

            <FeatureCard
              icon={<Search className="text-green-600" size={24} />}
              bg="bg-green-100"
              title="Semantic Precedent Search"
              desc="Context-aware ranking using advanced legal AI models."
            />

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h4 className="text-xl font-extrabold text-white mb-4 tracking-widest">
            LEGALAI
          </h4>
          <p className="text-sm mb-6">
            Transforming Judicial Infrastructure with Responsible Artificial Intelligence.
          </p>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} LegalAI. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

/* ================= REUSABLE ROLE CARD ================= */
const RoleCard = ({ icon, bg, title, desc }: any) => (
  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-6`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-slate-600">{desc}</p>
  </div>
);

/* ================= REUSABLE FEATURE CARD ================= */
const FeatureCard = ({ icon, bg, title, desc }: any) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-6`}>
      {icon}
    </div>
    <h4 className="font-bold text-slate-800 mb-3 text-lg">{title}</h4>
    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default Home;
