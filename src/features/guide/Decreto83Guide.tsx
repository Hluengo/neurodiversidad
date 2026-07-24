import React from 'react';
import { m } from 'motion/react';
import { ShieldAlert, FileText } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const Decreto83Guide: React.FC<Props> = ({ onBack }) => {
  return (
    <m.div
      key="guide"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="glass-card p-8 md:p-12 overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 font-display">Diferencia entre Adecuación de Acceso y Curricular</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Según el Decreto 83 - Educación Inclusiva en Chile</p>
          </div>

          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100 aspect-[2/3] md:aspect-[3/4] lg:aspect-auto">
            <img 
              src="https://lh3.googleusercontent.com/d/1SiXUiigpXzFdcdCqlw0eV8EvHS3d2SHC" 
              alt="Infografía Decreto 83" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://i.ibb.co/L6vV7pG/infografia-decreto83.jpg";
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100">
              <h4 className="text-xl font-black text-emerald-800 mb-4 font-display flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" />
                Adecuación de Acceso
              </h4>
              <p className="text-emerald-700 leading-relaxed">
                Elimina barreras sin cambiar los objetivos curriculares. Se aplica tanto en el proceso de enseñanza-aprendizaje como en la evaluación. Ejemplos: Braille, tiempo adicional, espacios accesibles.
              </p>
            </div>
            <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100">
              <h4 className="text-xl font-black text-amber-800 mb-4 font-display flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Adecuación Curricular
              </h4>
              <p className="text-amber-700 leading-relaxed">
                Modifica metas y contenidos (OA). Implica priorización de aprendizajes esenciales, simplificación de temas complejos y ajuste de criterios de evaluación.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <button
              type="button"
              onClick={onBack}
              className="px-10 py-4 bg-slate-800 text-white rounded-2xl font-black shadow-xl hover:bg-slate-900 transition-colors active:scale-95"
            >
              Volver al Panel
            </button>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default Decreto83Guide;
