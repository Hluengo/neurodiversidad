import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, User as UserIcon, Info } from 'lucide-react';
import { ALL_GRADES } from '../../constants/grades';

interface StudentFormData {
  id: string | undefined;
  fullName: string;
  grade: string;
  diagnosis: string;
  resolution: string;
  accommodationType: 'Adecuación de Acceso' | 'Adecuación Curricular' | 'Sin adecuación';
  photoUrl: string;
}

interface Props {
  isOpen: boolean;
  student: StudentFormData;
  onSetStudent: (student: StudentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewGuide: () => void;
}

export const StudentFormModal: React.FC<Props> = ({ 
  isOpen, 
  student, 
  onSetStudent, 
  onSubmit, 
  onClose,
  onPhotoUpload,
  onViewGuide
}) => {
  const handleClose = () => {
    onClose();
    onSetStudent({ id: undefined, fullName: '', grade: '', diagnosis: '', resolution: '', accommodationType: 'Adecuación de Acceso', photoUrl: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 font-display">
                {student.id ? "Editar Registro" : "Nuevo Registro Estudiantil"}
              </h3>
              <button 
                onClick={handleClose} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-48 h-48 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-accent">
                      {student.photoUrl ? (
                        <img 
                          key={student.photoUrl}
                          src={student.photoUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <UserIcon className="w-16 h-16" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Click o Pega</span>
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                      <Camera className="w-10 h-10 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
                    </label>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto</p>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                    <input 
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all"
                      value={student.fullName}
                      onChange={e => onSetStudent({...student, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curso</label>
                    <select 
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all appearance-none"
                      value={student.grade}
                      onChange={e => onSetStudent({...student, grade: e.target.value})}
                    >
                      <option value="">Seleccionar Curso</option>
                      <optgroup label="Inicial">
                        {ALL_GRADES.preschool.map(g => <option key={g} value={g}>{g}</option>)}
                      </optgroup>
                      <optgroup label="Primaria">
                        {ALL_GRADES.primary.map(g => <option key={g} value={g}>{g}</option>)}
                      </optgroup>
                      <optgroup label="Enseñanza Media">
                        {ALL_GRADES.secondary.map(g => <option key={g} value={g}>{g}</option>)}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Adecuación</label>
                  <button 
                    type="button"
                    onClick={onViewGuide}
                    className="text-[10px] font-black text-brand-accent uppercase tracking-widest flex items-center gap-1 hover:underline"
                  >
                    <Info className="w-3 h-3" />
                    Ver Guía
                  </button>
                </div>
                <select 
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all"
                  value={student.accommodationType}
                  onChange={e => onSetStudent({...student, accommodationType: e.target.value as any})}
                >
                  <option>Adecuación de Acceso</option>
                  <option>Adecuación Curricular</option>
                  <option>Sin adecuación</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnóstico Clínico</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all resize-none"
                  value={student.diagnosis}
                  onChange={e => onSetStudent({...student, diagnosis: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orientaciones Pedagógicas</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all resize-none"
                  value={student.resolution}
                  onChange={e => onSetStudent({...student, resolution: e.target.value})}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-6 shrink-0">
                <button 
                  type="button"
                  onClick={handleClose}
                  className="order-2 sm:order-1 flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="order-1 sm:order-2 flex-1 bg-brand-accent text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-accent/20 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                >
                  {student.id ? "Actualizar Registro" : "Guardar Registro"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StudentFormModal;
