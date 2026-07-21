import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, FileText, CheckCircle2, Trash2, X, User as UserIcon } from 'lucide-react';
import cn from '../../utils/classnames';
import { PrivacyMask } from '../../components/PrivacyMask';
import type { Student } from '../../types';

interface Props {
  student: Student | null;
  privacyVisible: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onDelete: (student: Student) => void;
}

export const StudentDetailModal: React.FC<Props> = ({ 
  student, 
  privacyVisible, 
  isAdmin, 
  onClose, 
  onDelete 
}) => {
  return (
    <AnimatePresence>
      {student && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden max-h-[95vh] flex flex-col border border-white/20"
          >
            <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent shadow-inner">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-display">
                    Ficha del Estudiante
                  </h3>
                  <p className="text-slate-500 font-medium text-sm">Expediente</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button 
                    onClick={() => onDelete(student)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                    title="Eliminar estudiante"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                )}
                <button 
                  onClick={onClose} 
                  className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all active:scale-90"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-12 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex flex-col items-center gap-8 shrink-0">
                  <div className="relative group">
                    <div className="w-72 h-72 md:w-80 md:h-80 rounded-[2.5rem] bg-slate-100 flex items-center justify-center overflow-hidden border-[12px] border-white shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                      {student.photoUrl ? (
                        <img 
                          key={student.photoUrl}
                          src={student.photoUrl} 
                          alt={student.fullName} 
                          className={cn("w-full h-full object-cover transition-all duration-500 img-fade-in", privacyVisible && "blur-2xl scale-110")} 
                          loading="lazy" 
                        />
                      ) : (
                        <UserIcon className="w-24 h-24 text-slate-300" />
                      )}
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-2.5 rounded-full shadow-xl border-2 border-white whitespace-nowrap transition-all"
                      style={{ 
                        backgroundColor: student.accommodationType === 'Adecuación de Acceso' ? '#10b981' : 
                                        student.accommodationType === 'Adecuación Curricular' ? '#f59e0b' : '#64748b' 
                      }}
                    >
                      {student.accommodationType === 'Adecuación de Acceso' ? <ShieldAlert className="w-4 h-4 text-white" /> :
                       student.accommodationType === 'Adecuación Curricular' ? <FileText className="w-4 h-4 text-white" /> :
                       <UserIcon className="w-4 h-4 text-white" />}
                      <span className="text-xs font-black uppercase tracking-widest text-white">
                        {student.accommodationType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nombre Completo</label>
                      <p className="text-2xl font-black text-slate-800 leading-tight font-display">
                        <PrivacyMask text={student.fullName} visible={!privacyVisible} />
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curso / Nivel</label>
                      <p className="text-2xl font-black text-slate-800 leading-tight font-display">{student.grade}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-brand-accent" />
                      Diagnóstico Clínico
                    </label>
                    <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-accent/20" />
                      <p className="text-slate-700 text-lg font-medium leading-relaxed whitespace-pre-line">
                        <PrivacyMask text={student.diagnosis} visible={!privacyVisible} />
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Orientaciones y Estrategias Pedagógicas
                    </label>
                    <div className="p-8 bg-emerald-50/20 rounded-[2rem] border border-emerald-100 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/20" />
                      <p className="text-slate-800 text-lg font-medium leading-relaxed whitespace-pre-line italic">
                        {student.resolution}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-slate-800 text-white rounded-2xl font-black text-base shadow-xl shadow-slate-800/20 hover:bg-slate-900 hover:-translate-y-1 active:translate-y-0 transition-all"
              >
                Cerrar Expediente
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StudentDetailModal;
