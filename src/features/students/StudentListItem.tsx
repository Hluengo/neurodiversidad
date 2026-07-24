import React from 'react';
import { Eye, Edit2, X, FileText, ShieldAlert, User as UserIcon } from 'lucide-react';
import { cn } from '../../utils/classnames';
import { PrivacyMask } from '../../components/PrivacyMask';
import { Student } from '../../types';

interface Props {
  student: Student;
  isAdmin: boolean;
  privacyVisible: boolean;
  onView: (s: Student) => void;
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
}

export const StudentListItem: React.FC<Props> = React.memo(({ student, isAdmin, privacyVisible, onView, onEdit, onDelete }) => (
  <div className="data-grid-row group">
    {/* Mobile Layout */}
    <div className="lg:hidden space-y-4 col-span-12">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="relative group/photo">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 shadow-sm transition-transform duration-300 hover:scale-[3] hover:z-50 hover:shadow-2xl cursor-zoom-in">
              {student.photoUrl === undefined ? (
                <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-slate-300" />
                </div>
              ) : student.photoUrl ? (
                <img src={student.photoUrl} alt="" className="w-full h-full object-cover img-fade-in" loading="lazy" />
              ) : (
                <UserIcon className="w-10 h-10 text-slate-300" />
              )}
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-7 h-7 rounded-xl border-2 border-white flex items-center justify-center shadow-lg",
              student.accommodationType === 'Adecuación de Acceso' ? "bg-emerald-500" :
              student.accommodationType === 'Adecuación Curricular' ? "bg-amber-500" :
              "bg-slate-400"
            )}>
              {student.accommodationType === 'Adecuación de Acceso' ? <ShieldAlert className="w-3.5 h-3.5 text-white" /> :
                student.accommodationType === 'Adecuación Curricular' ? <FileText className="w-3.5 h-3.5 text-white" /> :
                <UserIcon className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">
              <PrivacyMask text={student.fullName} visible={!privacyVisible} />
            </h4>
            <div className="flex flex-col gap-1 mt-1">
              <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-black w-fit">
                {student.grade}
              </span>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider",
                student.accommodationType === 'Adecuación de Acceso' ? "text-emerald-600" :
                student.accommodationType === 'Adecuación Curricular' ? "text-amber-600" :
                "text-slate-400"
              )}>
                {student.accommodationType}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onView(student)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-brand-accent rounded-xl shadow-sm group relative" aria-label="Ver ficha del estudiante">
            <Eye className="w-4 h-4" />
          </button>
          {isAdmin && (
            <div className="flex gap-2">
              <button type="button" onClick={() => onEdit(student)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-brand-accent rounded-xl shadow-sm group relative" aria-label="Editar estudiante">
                <Edit2 className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => onDelete(student)} className="p-2 bg-white border border-slate-200 text-red-400 hover:text-red-600 rounded-xl shadow-sm group relative" aria-label="Eliminar estudiante">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnóstico</p>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{student.diagnosis}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estrategias</p>
          <p className="text-sm text-slate-500 italic leading-relaxed line-clamp-2">{student.resolution}</p>
        </div>
      </div>
    </div>

    {/* Desktop Layout */}
    <div className="hidden lg:flex lg:col-span-3 items-center gap-5 font-bold text-slate-800">
      <div className="relative group/photo">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-md transition-transform duration-300 hover:scale-[3] hover:z-50 hover:shadow-2xl cursor-zoom-in origin-left">
          {student.photoUrl === undefined ? (
            <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-slate-300" />
            </div>
          ) : student.photoUrl ? (
            <img src={student.photoUrl} alt="" className="w-full h-full object-cover img-fade-in" loading="lazy" />
          ) : (
            <UserIcon className="w-7 h-7 text-slate-300" />
          )}
        </div>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center shadow-lg",
          student.accommodationType === 'Adecuación de Acceso' ? "bg-emerald-500" :
          student.accommodationType === 'Adecuación Curricular' ? "bg-amber-500" :
          "bg-slate-400"
        )}>
          {student.accommodationType === 'Adecuación de Acceso' ? <ShieldAlert className="w-3 h-3 text-white" /> :
            student.accommodationType === 'Adecuación Curricular' ? <FileText className="w-3 h-3 text-white" /> :
            <UserIcon className="w-3 h-3 text-white" />}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm tracking-tight">
          <PrivacyMask text={student.fullName} visible={!privacyVisible} />
        </span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.grade}</span>
      </div>
    </div>

    <div className="hidden lg:flex lg:col-span-2 items-center">
      <span className={cn(
        "status-pill",
        student.accommodationType === 'Adecuación de Acceso' ? "bg-emerald-50/50 text-emerald-600 border-emerald-100" :
        student.accommodationType === 'Adecuación Curricular' ? "bg-amber-50/50 text-amber-600 border-amber-100" :
        "bg-slate-50 text-slate-400 border-slate-100"
      )}>
        {student.accommodationType}
      </span>
    </div>

    <div className="hidden lg:flex lg:col-span-2 items-center pr-4">
      <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">{student.diagnosis}</p>
    </div>

    <div className="hidden lg:flex lg:col-span-4 items-center pr-4">
      <p className="text-xs text-slate-500 italic line-clamp-2 leading-relaxed">{student.resolution}</p>
    </div>

    <div className="hidden lg:flex lg:col-span-1 items-center justify-end gap-1">
      <button type="button" onClick={() => onView(student)} className="p-2 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-xl transition-colors" title="Ver Ficha" aria-label="Ver ficha del estudiante">
        <Eye className="w-4 h-4" />
      </button>
      {isAdmin && (
        <>
          <button type="button" onClick={() => onEdit(student)} className="p-2 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-xl transition-colors" title="Editar" aria-label="Editar estudiante">
            <Edit2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onDelete(student)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar" aria-label="Eliminar estudiante">
            <X className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  </div>
));

export default StudentListItem;
