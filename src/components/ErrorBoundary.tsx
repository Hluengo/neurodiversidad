import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { children } = (this as any).props;
    if (this.state.hasError) {
      let errorMessage = "Ha ocurrido un error inesperado.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Error de Permisos (${parsed.operationType}): No tienes autorización para realizar esta acción en ${parsed.path || 'la base de datos'}.`;
          }
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center space-y-6 border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto text-red-600">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">¡Ups! Algo salió mal</h2>
              <p className="text-slate-500 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors shadow-xl shadow-brand-primary/20"
            >
              <RefreshCcw className="w-5 h-5" />
              Recargar Aplicación
            </button>
            {isFirestoreError && (
              <p className="text-xs text-slate-400">
                Si crees que esto es un error, contacta al administrador del sistema.
              </p>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}
