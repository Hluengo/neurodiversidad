import React from 'react';
import { Shield, Menu, X } from 'lucide-react';

interface Props {
  isSidebarOpen: boolean;
  isLocalFallback: boolean;
  onToggleSidebar: () => void;
}

export const MobileHeader: React.FC<Props> = ({ isSidebarOpen, isLocalFallback, onToggleSidebar }) => {
  return (
    <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-white font-bold text-sm overflow-hidden">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-full h-full object-contain p-1 bg-white"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          EduGestion - NeuroDiversidad 2026
          {isLocalFallback && (
            <span className="px-1 py-0.5 text-[8px] bg-amber-50 text-amber-600 border border-amber-200 rounded font-bold uppercase tracking-wider">Local</span>
          )}
        </h2>
      </div>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default MobileHeader;
