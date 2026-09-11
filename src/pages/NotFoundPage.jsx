import React from 'react';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center animate-fadeIn">
      <div className="max-w-md bg-[#111927] border border-[#22334d] p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0df2c9]/10 border border-[#0df2c9]/30 flex items-center justify-center text-[#0df2c9]">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white font-mono">404</h2>
          <h3 className="text-lg font-bold text-white">Academic Route Not Found</h3>
          <p className="text-xs text-slate-400">
            The arena, deck, or question page you are trying to access does not exist or has been relocated.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0df2c9] hover:bg-[#00e1ba] text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-[#0df2c9]/20"
        >
          <Home className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
