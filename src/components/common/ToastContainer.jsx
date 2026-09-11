import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let colorClass = 'border-[#00f59b]/40 bg-[#0c1a24] text-[#00f59b]';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClass = 'border-[#ef4444]/40 bg-[#1c1117] text-[#ef4444]';
        } else if (toast.type === 'info') {
          Icon = Info;
          colorClass = 'border-[#8b5cf6]/40 bg-[#141228] text-[#c4b5fd]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl shadow-black/60 transition-all transform translate-y-0 ${colorClass}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white tracking-tight">{toast.title}</h4>
              {toast.message && <p className="text-xs text-[#94a3b8] mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
