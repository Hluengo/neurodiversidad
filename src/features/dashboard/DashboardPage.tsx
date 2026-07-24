import React, { useMemo, lazy, Suspense } from 'react';
import { m } from 'motion/react';
import {
  Users,
  Shield,
  CheckCircle2,
  FileText,
  BookOpen,
  Eye
} from 'lucide-react';
import { StatCard } from './StatCard';
import type { Student } from '../../types';

const BarChartComponent = lazy(() => import('./charts/BarChartComponent'));
const PieChartComponent = lazy(() => import('./charts/PieChartComponent'));

interface Props {
  students: Student[];
  onNavigate: (view: 'students' | 'guide', filters?: { accommodation?: string | null; diagnosis?: string | null; grade?: string | null }) => void;
}

export const DashboardPage: React.FC<Props> = ({ students, onNavigate }) => {
  const dashboardStats = useMemo(() => {
    let accessCount = 0;
    let curricularCount = 0;
    let noAccommodationCount = 0;
    const gradeData: Record<string, number> = {};
    const diagnosisCategories: Record<string, number> = {};
    const othersDiagnosisData: Record<string, number> = {};

    students.forEach(s => {
      const accType = s.accommodationType?.trim();
      if (accType === 'Adecuación de Acceso') accessCount++;
      else if (accType === 'Adecuación Curricular') curricularCount++;
      else noAccommodationCount++;

      const grade = s.grade?.trim() || 'Sin Grado';
      gradeData[grade] = (gradeData[grade] || 0) + 1;

      const diag = (s.diagnosis || '').toUpperCase();
      let category = 'Otros';
      let isMainCategory = false;

      if (diag.includes('TEA') || diag.includes('ESPECTRO AUTISTA')) {
        category = 'TEA';
        isMainCategory = true;
      } else if (diag.includes('TDAH') || diag.includes('HIPERACTIVIDAD')) {
        category = 'TDAH';
        isMainCategory = true;
      } else if (diag.includes('TDA') || diag.includes('ATENCIONAL')) {
        category = 'TDA';
        isMainCategory = true;
      } else if (diag.includes('ANSIEDAD') || diag.includes('DEPRESIÓN') || diag.includes('ADAPTATIVO')) {
        category = 'Salud Mental';
        isMainCategory = true;
      }

      diagnosisCategories[category] = (diagnosisCategories[category] || 0) + 1;

      if (!isMainCategory) {
        const trimmedDiag = s.diagnosis?.trim() || 'Sin Diagnóstico';
        othersDiagnosisData[trimmedDiag] = (othersDiagnosisData[trimmedDiag] || 0) + 1;
      }
    });

    const chartData = Object.entries(gradeData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }));

    const othersChartData = Object.entries(othersDiagnosisData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const diagnosisChartData = Object.entries(diagnosisCategories).map(([name, value]) => ({ name, value }));

    return { 
      neetCount: accessCount + curricularCount, 
      totalStudents: students.length,
      accessCount, 
      curricularCount, 
      noAccommodationCount,
      chartData, 
      diagnosisChartData, 
      othersChartData 
    };
  }, [students]);

  return (
    <m.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Estudiantes" 
          value={dashboardStats.totalStudents} 
          icon={Shield} 
          color="bg-slate-800" 
          onClick={() => onNavigate('students')}
        />
        <StatCard 
          title="Adecuación Acceso" 
          value={dashboardStats.accessCount} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
          onClick={() => onNavigate('students', { accommodation: 'Adecuación de Acceso' })}
        />
        <StatCard 
          title="Adecuación Curricular" 
          value={dashboardStats.curricularCount} 
          icon={FileText} 
          color="bg-amber-500" 
          onClick={() => onNavigate('students', { accommodation: 'Adecuación Curricular' })}
        />
        <StatCard 
          title="Sin Adecuación" 
          value={dashboardStats.noAccommodationCount} 
          icon={Users} 
          color="bg-blue-500" 
          onClick={() => onNavigate('students', { accommodation: 'Sin adecuación' })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-lg font-black text-slate-800 mb-6 font-display">Distribución por Curso</h3>
            <BarChartComponent
              data={dashboardStats.chartData}
              height={400}
              onBarClick={(data) => onNavigate('students', { grade: data.name || null })}
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 bg-brand-accent/5 border-brand-accent/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 font-display">Guía Decreto 83</h3>
                <p className="text-xs text-slate-500">Orientación Técnica</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              ¿Conoces la diferencia entre Adecuación de Acceso y Adecuación Curricular? Consulta nuestra guía rápida basada en el Decreto 83.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('guide')}
              className="w-full py-3 bg-brand-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-accent/20 hover:bg-emerald-600 transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              Ver Guía de Orientación
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tipos de Adecuación</h3>
          <PieChartComponent
            data={[
              { name: 'Acceso', value: dashboardStats.accessCount },
              { name: 'Curricular', value: dashboardStats.curricularCount },
              { name: 'Sin Adecuación', value: dashboardStats.totalStudents - (dashboardStats.accessCount + dashboardStats.curricularCount) }
            ]}
            colors={['#10b981', '#f59e0b', '#e2e8f0']}
          />
        </div>

        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Detalle de "Otros" Diagnósticos</h3>
          <PieChartComponent
            data={dashboardStats.othersChartData}
            paddingAngle={2}
            label={({ name, percent }) => (percent ?? 0) > 0.05 ? `${name}` : ''}
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Distribución por Diagnóstico</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {dashboardStats.diagnosisChartData.map((item) => (
            <m.div
              key={item.name}
              whileHover={{ y: -5 }}
              onClick={() => onNavigate('students', { diagnosis: item.name })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('students', { diagnosis: item.name }); }}
              role="button"
              tabIndex={0}
              className="glass-card p-6 text-center space-y-2 border-t-4 border-brand-accent cursor-pointer hover:shadow-xl transition-colors"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.name}</p>
              <h4 className="text-3xl font-black text-slate-800">{item.value}</h4>
              <p className="text-[10px] text-slate-500 font-medium">Estudiantes</p>
            </m.div>
          ))}
        </div>
      </div>
    </m.div>
  );
};

export default DashboardPage;
