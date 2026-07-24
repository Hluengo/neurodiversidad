import React from 'react';
import { m, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen,
  Shield,
  LogOut,
  LogIn,
  X,
  User as UserIcon
} from 'lucide-react';
import cn from '../../utils/classnames';
import type { User } from '@supabase/supabase-js';

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
      active 
        ? "bg-brand-accent/10 text-brand-accent font-semibold" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    )}
  >
    {active && <m.div layoutId="sidebar-active" className="absolute left-0 w-1 h-6 bg-brand-accent rounded-r-full" />}
    <Icon className={cn("w-5 h-5 transition-colors", active ? "text-brand-accent" : "group-hover:text-brand-accent")} />
    <span className="text-sm">{label}</span>
  </button>
);

interface Props {
  view: 'dashboard' | 'students' | 'guide';
  levelFilter: 'all' | 'preschool' | 'primary' | 'secondary';
  user: User | null;
  isAdmin: boolean;
  isLocalFallback: boolean;
  isSidebarOpen: boolean;
  showLoginForm: boolean;
  authMode: 'login' | 'signup';
  loginEmail: string;
  loginPassword: string;
  isLoggingIn: boolean;
  onNavigate: (view: 'dashboard' | 'students', levelFilter?: 'all' | 'preschool' | 'primary' | 'secondary') => void;
  onNavigateGuide: () => void;
  onCloseSidebar: () => void;
  onLogout: () => void;
  onToggleLoginForm: () => void;
  onToggleAuthMode: () => void;
  onSetLoginEmail: (email: string) => void;
  onSetLoginPassword: (password: string) => void;
  onLogin: (e?: React.FormEvent) => void;
  onSignUp: (e: React.FormEvent) => void;
}

export const Sidebar: React.FC<Props> = ({
  view,
  levelFilter,
  user,
  isAdmin,
  isLocalFallback,
  isSidebarOpen,
  showLoginForm,
  authMode,
  loginEmail,
  loginPassword,
  isLoggingIn,
  onNavigate,
  onNavigateGuide,
  onCloseSidebar,
  onLogout,
  onToggleLoginForm,
  onToggleAuthMode,
  onSetLoginEmail,
  onSetLoginPassword,
  onLogin,
  onSignUp
}) => {
  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseSidebar}
            onKeyDown={(e) => { if (e.key === 'Escape') onCloseSidebar(); }}
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white font-bold overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain p-1 bg-white" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} 
              />
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-slate-800 leading-tight text-sm">EduGestion</h2>
                {isLocalFallback && (
                  <span className="px-1.5 py-0.5 text-[8px] bg-amber-50 text-amber-600 border border-amber-200 rounded font-bold uppercase tracking-wider" title="Modo Local Activo (Base de Datos localStorage)">Local</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">NeuroDiversidad 2026</p>
            </div>
          </div>
          <button type="button" onClick={onCloseSidebar} className="md:hidden p-2 text-slate-400" aria-label="Cerrar menú">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={view === 'dashboard'} 
            onClick={() => { onNavigate('dashboard'); onCloseSidebar(); }} 
          />
          <div className="pt-4 pb-2 px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveles Educativos</p>
          </div>
          <SidebarItem 
            icon={Users} 
            label="Inicial" 
            active={view === 'students' && levelFilter === 'preschool'} 
            onClick={() => { onNavigate('students', 'preschool'); onCloseSidebar(); }} 
          />
          <SidebarItem 
            icon={Users} 
            label="Primaria" 
            active={view === 'students' && levelFilter === 'primary'} 
            onClick={() => { onNavigate('students', 'primary'); onCloseSidebar(); }} 
          />
          <SidebarItem 
            icon={Users} 
            label="Secundaria" 
            active={view === 'students' && levelFilter === 'secondary'} 
            onClick={() => { onNavigate('students', 'secondary'); onCloseSidebar(); }} 
          />
          <SidebarItem 
            icon={Users} 
            label="Todos los Alumnos" 
            active={view === 'students' && levelFilter === 'all'} 
            onClick={() => { onNavigate('students', 'all'); onCloseSidebar(); }} 
          />
          <SidebarItem 
            icon={BookOpen} 
            label="Guía Decreto 83" 
            active={view === 'guide'} 
            onClick={() => { onNavigateGuide(); onCloseSidebar(); }} 
          />
        </nav>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-3 px-2">
            {user ? (
              <>
                <img src={user.user_metadata?.avatar_url || ''} className="w-10 h-10 rounded-full border-2 border-slate-100" alt="Avatar" />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-slate-400 truncate">{isAdmin ? 'Super Usuario' : 'Acceso Lectura'}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full border-2 border-slate-100 bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">Usuario Público</p>
                  <p className="text-xs text-slate-400 truncate">Acceso Libre</p>
                </div>
              </>
            )}
          </div>
          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          ) : (
            <div className="space-y-3">
              {!showLoginForm ? (
                <button
                  type="button"
                  onClick={onToggleLoginForm}
                  className="flex items-center gap-3 w-full px-4 py-3 text-brand-primary hover:bg-brand-accent/5 rounded-xl transition-colors font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  Acceso Super Usuario
                </button>
              ) : (
                <form onSubmit={authMode === 'login' ? onLogin : onSignUp} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                    </span>
                    <button 
                      type="button"
                      onClick={onToggleLoginForm}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label htmlFor="login-email" className="sr-only">Correo</label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="Correo"
                      value={loginEmail}
                      onChange={(e) => onSetLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password" className="sr-only">Contraseña</label>
                    <input
                      id="login-password"
                      type="password"
                      placeholder="Contraseña"
                      value={loginPassword}
                      onChange={(e) => onSetLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-brand-accent text-white py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Procesando...' : (authMode === 'login' ? 'Entrar' : 'Crear Cuenta')}
                  </button>
                  <button 
                    type="button"
                    onClick={onToggleAuthMode}
                    className="w-full text-xs text-slate-500 hover:text-brand-accent transition-colors"
                  >
                    {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
