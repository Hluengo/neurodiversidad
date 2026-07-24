import React from 'react';
import { Search } from 'lucide-react';
import { Filter, X, Plus } from 'lucide-react';
import cn from '../../utils/classnames';
import StudentList from './StudentList';
import { Student } from '../../types';

interface Props {
  filteredStudents: Student[];
  isDataLoading: boolean;
  isAdmin: boolean;
  privacyVisible: boolean;
  fetchFullStudent: (id: string) => Promise<Student | null>;
  startEditing: (s: Student) => void;
  setStudentToDelete: (s: Student | null) => void;
  setIsConfirmingDelete: (v: boolean) => void;
  setViewingStudent: (s: Student | null) => void;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;

  // Controls / filters
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  gradeFilter: string | null;
  setGradeFilter: (g: string | null) => void;
  diagnosisFilter: string | null;
  setDiagnosisFilter: (d: string | null) => void;
  accommodationFilter: string | null;
  setAccommodationFilter: (a: string | null) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  uniqueGrades: string[];
  setIsAddingStudent: (v: boolean) => void;
}

export const StudentsPage: React.FC<Props> = ({ filteredStudents, isDataLoading, isAdmin, privacyVisible, fetchFullStudent, startEditing, setStudentToDelete, setIsConfirmingDelete, setViewingStudent, setStudents, searchTerm, setSearchTerm, gradeFilter, setGradeFilter, diagnosisFilter, setDiagnosisFilter, accommodationFilter, setAccommodationFilter, showFilters, setShowFilters, uniqueGrades, setIsAddingStudent }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <label htmlFor="student-search" className="sr-only">Buscar estudiantes</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            id="student-search"
            type="text"
            placeholder="Buscar..."
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-colors text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <label htmlFor="grade-filter" className="sr-only">Filtrar por curso</label>
          <select
            id="grade-filter"
            className="w-full sm:w-48 px-4 py-3 md:py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-colors text-sm md:text-base appearance-none cursor-pointer"
            value={gradeFilter || ''}
            onChange={(e) => setGradeFilter(e.target.value || null)}
          >
            <option value="">Todos los cursos</option>
            {(uniqueGrades || []).map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Filter className="w-4 h-4" />
          </div>
        </div>
        {diagnosisFilter && (
          <div className="flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 px-4 py-2 rounded-2xl">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">Filtro: {diagnosisFilter}</span>
            <button
              type="button"
              onClick={() => setDiagnosisFilter(null)}
              className="p-1 hover:bg-brand-accent/20 rounded-full transition-colors"
              aria-label="Limpiar filtro de diagnóstico"
            >
              <X className="w-4 h-4 text-brand-accent" />
            </button>
          </div>
        )}
        {accommodationFilter && (
          <div className="flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 px-4 py-2 rounded-2xl">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">Filtro: {accommodationFilter}</span>
            <button
              type="button"
              onClick={() => setAccommodationFilter(null)}
              className="p-1 hover:bg-brand-accent/20 rounded-full transition-colors"
              aria-label="Limpiar filtro de adecuación"
            >
              <X className="w-4 h-4 text-brand-accent" />
            </button>
          </div>
        )}
        {gradeFilter && (
          <div className="flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 px-4 py-2 rounded-2xl">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">Curso: {gradeFilter}</span>
            <button
              type="button"
              onClick={() => setGradeFilter(null)}
              className="p-1 hover:bg-brand-accent/20 rounded-full transition-colors"
              aria-label="Limpiar filtro de curso"
            >
              <X className="w-4 h-4 text-brand-accent" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex-1 sm:flex-none px-4 md:px-6 py-3 md:py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors text-sm",
              showFilters ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            <Filter className="w-4 h-4 md:w-5 md:h-5" />
            Filtros
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddingStudent(true)}
              className="flex-1 sm:flex-none bg-brand-accent text-white px-4 md:px-8 py-3 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-brand-accent/20 text-sm"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              Nuevo
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="glass-card p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-brand-accent/20">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por Diagnóstico</span>
            <div className="flex flex-wrap gap-2">
              {['TEA', 'TDAH', 'TDA', 'Salud Mental', 'Otros'].map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setDiagnosisFilter(diagnosisFilter === cat ? null : cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border",
                    diagnosisFilter === cat
                      ? "bg-brand-accent text-white border-brand-accent shadow-md"
                      : "bg-white text-slate-500 border-slate-200 hover:border-brand-accent hover:text-brand-accent"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por Adecuación</span>
            <div className="flex flex-wrap gap-2">
              {['Adecuación de Acceso', 'Adecuación Curricular', 'Sin adecuación'].map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setAccommodationFilter(accommodationFilter === type ? null : type)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border",
                    accommodationFilter === type
                      ? "bg-brand-accent text-white border-brand-accent shadow-md"
                      : "bg-white text-slate-500 border-slate-200 hover:border-brand-accent hover:text-brand-accent"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="data-grid-header hidden lg:grid">
          <div className="col-span-3">Estudiante / Curso</div>
          <div className="col-span-2">Adecuación</div>
          <div className="col-span-2">Diagnóstico</div>
          <div className="col-span-4">Orientaciones Pedagógicas</div>
          <div className="col-span-1 text-right">Acciones</div>
        </div>

        <div className="bg-white rounded-b-2xl overflow-hidden">
          <StudentList
            filteredStudents={filteredStudents}
            isDataLoading={isDataLoading}
            isAdmin={isAdmin}
            privacyVisible={privacyVisible}
            fetchFullStudent={fetchFullStudent}
            startEditing={startEditing}
            setStudentToDelete={setStudentToDelete as any}
            setIsConfirmingDelete={setIsConfirmingDelete as any}
            setViewingStudent={setViewingStudent}
            setStudents={setStudents}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;
