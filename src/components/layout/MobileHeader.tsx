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
        <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
          <img
            src="/logo.svg"
            alt="Logo EduGestion"
            className="w-7 h-7 object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <Shield className="w-5 h-5 text-white" />
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
