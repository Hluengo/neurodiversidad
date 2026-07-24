import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStudents } from './hooks/useStudents';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useToast } from './hooks/useToast';
import { Toast } from './components/Toast';
import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { Decreto83Guide } from './features/guide/Decreto83Guide';
import { StudentDetailModal } from './features/students/StudentDetailModal';
import { StudentFormModal } from './features/students/StudentFormModal';
import { ConfirmDeleteModal } from './features/students/ConfirmDeleteModal';
import StudentsPage from './features/students/StudentsPage';
import { 
  ShieldAlert,
  Eye, 
  EyeOff, 
  Download,
  Menu
} from 'lucide-react';
import { m, AnimatePresence } from 'motion/react';
import { supabase } from './supabase';
import { Student } from './types';
import { Profiler } from 'react';
import cn from './utils/classnames';
import { retryAsync } from './utils/retry';
import { ALL_GRADES } from './constants/grades';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isLocalFallback, setIsLocalFallback] = useState<boolean>(false);
  const [view, setView] = useState<'dashboard' | 'students' | 'guide'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [diagnosisFilter, setDiagnosisFilter] = useState<string | null>(null);
  const [accommodationFilter, setAccommodationFilter] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<'all' | 'preschool' | 'primary' | 'secondary'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [students, setStudents] = useState<Student[]>([]);
  const studentsHook = useStudents();

  useEffect(() => {
    if (studentsHook.students && Array.isArray(studentsHook.students) && studentsHook.students.length > 0) {
      setStudents(studentsHook.students);
    }
  }, [studentsHook.students]);

  const photoCache = React.useRef<Record<string, string | null>>({});

  const gradeSets = useMemo(() => ({
    preschool: new Set(ALL_GRADES.preschool),
    primary: new Set(ALL_GRADES.primary),
    secondary: new Set(ALL_GRADES.secondary),
  }), []);

  const uniqueGrades = useMemo(() => {
    if (!students || students.length === 0) return [];
    let filteredGrades = students.map(s => s.grade);
    if (levelFilter === 'preschool') {
      filteredGrades = filteredGrades.filter(g => gradeSets.preschool.has(g));
    } else if (levelFilter === 'primary') {
      filteredGrades = filteredGrades.filter(g => gradeSets.primary.has(g));
    } else if (levelFilter === 'secondary') {
      filteredGrades = filteredGrades.filter(g => gradeSets.secondary.has(g));
    }
    const grades = new Set(filteredGrades);
    return Array.from(grades).sort();
  }, [students, levelFilter, gradeSets]);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { toast, showToast } = useToast();

  const isAdmin = user?.email?.toLowerCase().trim() === "hluengo.ro@gmail.com";

  const fetchStudents = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsDataLoading(true);
    const hasMissingConfig = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    if (hasMissingConfig || isLocalFallback) {
      const local = studentsHook.students && studentsHook.students.length > 0 ? studentsHook.students : [];
      setStudents(local.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'es', { sensitivity: 'base' })));
      setIsLocalFallback(true);
      if (!isBackground) setIsDataLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id,fullName,grade,diagnosis,resolution,accommodationType,createdAt', { count: 'exact' })
        .limit(1000)
        .order('fullName', { ascending: true });
      if (error) throw error;
      const sortedData = (data as Student[]).map(s => ({ ...s, photoUrl: undefined }));
      setStudents(sortedData);
      setGlobalError(null);
    } catch (err: any) {
      console.warn("Supabase fetch error, fallback to local storage:", err?.message);
      const local = studentsHook.students && studentsHook.students.length > 0 ? studentsHook.students : [];
      setStudents(local.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'es', { sensitivity: 'base' })));
      setIsLocalFallback(true);
      showToast("Funcionando en modo local. Los cambios se sincronizarán cuando haya conexión.", "info");
    } finally {
      if (!isBackground) setIsDataLoading(false);
    }
  }, [isLocalFallback, studentsHook.students, showToast]);

  const fetchFullStudent = async (studentId: string): Promise<Student | null> => {
    if (isLocalFallback) {
      const local = studentsHook.students.find(s => s.id === studentId) || null;
      return local || null;
    }
    try {
      const { data, error } = await supabase.from('students').select('*').eq('id', studentId).single();
      if (error) throw error;
      return data as Student;
    } catch (err) {
      console.error("Error fetching full student, fallback to local:", err);
      const local = studentsHook.students.find(s => s.id === studentId) || null;
      return local || null;
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isAddingStudent) return;
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              if (file.size > 500000) {
                showToast("La imagen es demasiado grande (máx 500KB)", 'error');
                return;
              }
              const reader = new FileReader();
              reader.onloadend = () => {
                setNewStudent(prev => ({ ...prev, photoUrl: reader.result as string }));
                showToast("Imagen pegada correctamente", 'success');
              };
              reader.readAsDataURL(file);
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isAddingStudent, showToast]);

  const [newStudent, setNewStudent] = useState({
    id: undefined as string | undefined,
    fullName: '',
    grade: '',
    diagnosis: '',
    resolution: '',
    accommodationType: 'Adecuación de Acceso' as any,
    photoUrl: ''
  });

  const clearAllData = async () => {
    setIsConfirmingClear(false);
    showToast("Iniciando eliminación masiva...", "info");
    if (isLocalFallback) {
      try {
        const { default: studentsSvc } = await import('./services/studentsService');
        await studentsSvc.clearLocal();
      } catch (err) {
        console.error('Error clearing local students:', err);
      }
      setStudents([]);
      showToast("Todos los registros locales han sido eliminados.", "success");
      return;
    }
    try {
      const tables = ['students', 'cases'];
      const results = await Promise.all(
        tables.map(tableName =>
          supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        )
      );
      let totalDeleted = 0;
      results.forEach((result, i) => {
        if (result.error) {
          console.error(`Error al borrar tabla ${tables[i]}:`, result.error);
        } else {
          totalDeleted += result.count || 0;
        }
      });
      if (totalDeleted === 0) {
        showToast("No se encontraron registros para eliminar.", "info");
      } else {
        showToast(`${totalDeleted} registros eliminados correctamente.`, "success");
        setStudents([]);
      }
    } catch (error) {
      console.error("Error crítico durante el borrado:", error);
      showToast("Error crítico al eliminar los registros.", "error");
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete || !isAdmin) {
      showToast("Acceso denegado.", "error");
      return;
    }
    const id = studentToDelete.id;
    const name = studentToDelete.fullName;
    setIsConfirmingDelete(false);
    setStudentToDelete(null);
    try {
      setStudents(prev => prev.filter(s => s.id !== id));
      if (viewingStudent?.id === id) setViewingStudent(null);
      if (isLocalFallback) {
        await studentsHook.remove(id);
        showToast(`✓ ${name} eliminado.`, "success");
        return;
      }
      await retryAsync(async () => {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
      }, 2, 800);
      showToast(`✓ ${name} eliminado.`, "success");
    } catch (error: any) {
      console.error("Error deleting student:", error?.message);
      fetchStudents();
      showToast("No se pudo eliminar. Intenta de nuevo.", "error");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) {
        showToast("La imagen es demasiado grande (máx 2MB)", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 400;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setNewStudent(prev => ({ ...prev, photoUrl: compressedBase64 }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Acceso denegado. Solo administradores pueden crear/editar.", "error");
      return;
    }
    const { id: _editId, ...studentData } = newStudent;
    const isEditing = !!_editId;
    const studentId = _editId;
    setIsAddingStudent(false);
    setNewStudent({ id: undefined, fullName: '', grade: '', diagnosis: '', resolution: '', accommodationType: 'Adecuación de Acceso', photoUrl: '' });
    try {
      if (isLocalFallback) {
        if (isEditing && studentId) {
          await studentsHook.update(studentId, studentData as any);
          setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...studentData } as Student : s));
          if (viewingStudent?.id === studentId) setViewingStudent({ ...viewingStudent, ...studentData } as Student);
          showToast("✓ Estudiante actualizado.", "success");
        } else {
          const newLocalStudent: Student = {
            id: `local-student-${Date.now()}`,
            fullName: studentData.fullName,
            grade: studentData.grade,
            diagnosis: studentData.diagnosis,
            resolution: studentData.resolution,
            accommodationType: studentData.accommodationType as any,
            photoUrl: studentData.photoUrl || undefined,
            createdAt: new Date().toISOString()
          };
          await studentsHook.create(newLocalStudent);
          setStudents(prev => [newLocalStudent, ...prev]);
          showToast("✓ Estudiante registrado.", "success");
        }
        return;
      }
      if (isEditing && studentId) {
        await retryAsync(async () => {
          const { error } = await supabase.from('students').update({
            fullName: studentData.fullName, grade: studentData.grade, diagnosis: studentData.diagnosis,
            resolution: studentData.resolution, accommodationType: studentData.accommodationType, photoUrl: studentData.photoUrl || null
          }).eq('id', studentId);
          if (error) throw error;
        }, 3, 1000);
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...studentData } as Student : s));
        if (viewingStudent?.id === studentId) setViewingStudent({ ...viewingStudent, ...studentData } as Student);
        showToast("✓ Estudiante actualizado.", "success");
      } else {
        const { data, error } = await retryAsync(async () => {
          return await supabase.from('students').insert([{
            fullName: studentData.fullName, grade: studentData.grade, diagnosis: studentData.diagnosis,
            resolution: studentData.resolution, accommodationType: studentData.accommodationType, photoUrl: studentData.photoUrl || null
          }]).select();
        }, 3, 1000);
        if (error) throw error;
        if (data && data[0]) {
          const createdStudent = data[0] as Student;
          setStudents(prev => [createdStudent, ...prev]);
          showToast("✓ Estudiante registrado.", "success");
        }
      }
    } catch (error: any) {
      console.error("Error saving student:", error?.message);
      showToast(error?.message?.includes('network') ? "Error de conexión. Intenta de nuevo." : "No se pudo guardar. Revisa los datos.", "error");
    }
  };

  const downloadCSV = () => {
    if (students.length === 0) {
      showToast("No hay datos para descargar", "info");
      return;
    }
    const headers = ["Nombre Completo", "Curso", "Diagnóstico", "Adecuación", "Orientaciones"];
    const rows = students.map(s => [s.fullName, s.grade, s.diagnosis, s.accommodationType, s.resolution]);
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell?.replace(/"/g, '""') || ''}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `estudiantes_neetp_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Listado descargado correctamente", "success");
  };

  const startEditing = (student: Student) => {
    setNewStudent({
      id: student.id, fullName: student.fullName, grade: student.grade, diagnosis: student.diagnosis,
      resolution: student.resolution, accommodationType: student.accommodationType, photoUrl: student.photoUrl || ''
    });
    setIsAddingStudent(true);
  };

  useEffect(() => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    if (isPlaceholder || isLocalFallback) {
      if (!user) {
        setUser({ id: 'local-admin-uid', email: 'hluengo.ro@gmail.com', user_metadata: { full_name: 'Gestor Escolar (Local)' } });
      }
      setLoading(false);
      setIsLocalFallback(true);
      return;
    }
    let subscription: any = null;
    let cancelled = false;
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!cancelled) setUser(session?.user ?? null);
      } catch (err) {
        console.warn("Auth session fetch error, switching to mock:", err);
        if (!cancelled) {
          setUser({ id: 'local-admin-uid', email: 'hluengo.ro@gmail.com', user_metadata: { full_name: 'Gestor Escolar (Local)' } });
          setIsLocalFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
      try {
        const res = supabase.auth.onAuthStateChange((_event, session) => {
          if (!cancelled) {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        });
        subscription = res.data?.subscription;
      } catch (err) { console.warn("Auth change subscription error:", err); }
    };
    initAuth();
    return () => {
      cancelled = true;
      if (subscription) { try { subscription.unsubscribe(); } catch (e) { console.warn("Unsubscribe failed:", e); } }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocalFallback]);

  useEffect(() => {
    fetchStudents();
    if (isLocalFallback) return;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    const handleStudentChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!cancelled) fetchStudents(true);
      }, 500);
    };
    const channel = supabase.channel('students_changes');
    const subscription = channel.on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, handleStudentChange).subscribe();
    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      try { subscription.unsubscribe(); } catch (e) { console.warn("Channel cleanup failed:", e); }
    };
  }, [fetchStudents, isLocalFallback]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail || !loginPassword) { showToast("Por favor ingresa correo y contraseña.", "error"); return; }
    setIsLoggingIn(true);
    if (isLocalFallback) {
      setTimeout(() => {
        setUser({ id: 'local-admin-uid', email: loginEmail, user_metadata: { full_name: 'Gestor Escolar (Local)' } });
        setShowLoginForm(false); setLoginEmail(''); setLoginPassword('');
        showToast("Sesión iniciada correctamente (Modo Local).", "success");
        setIsLoggingIn(false);
      }, 400);
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
      setShowLoginForm(false); setLoginEmail(''); setLoginPassword('');
      showToast("Sesión iniciada correctamente.", "success");
    } catch (error: any) {
      console.error("Login failed", error);
      showToast(error.message || "Error al iniciar sesión.", "error");
    } finally { setIsLoggingIn(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { showToast("Por favor ingresa correo y contraseña.", "error"); return; }
    setIsLoggingIn(true);
    if (isLocalFallback) {
      setTimeout(() => {
        setUser({ id: 'local-admin-uid', email: loginEmail, user_metadata: { full_name: 'Gestor Escolar (Local)' } });
        setShowLoginForm(false); setLoginEmail(''); setLoginPassword('');
        showToast("Registro y login automáticos correctos (Modo Local).", "success");
        setIsLoggingIn(false);
      }, 400);
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({ email: loginEmail, password: loginPassword });
      if (error) {
        if (error.message.includes("User already registered")) {
          showToast("Este usuario ya existe. Cambiando a modo Iniciar Sesión.", "info");
          setAuthMode('login'); return;
        }
        throw error;
      }
      showToast("Registro exitoso. Revisa tu correo si es necesario.", "success");
      setAuthMode('login');
    } catch (error: any) {
      console.error("Sign up failed", error);
      showToast(error.message || "Error al registrarse.", "error");
    } finally { setIsLoggingIn(false); }
  };

  const handleLogout = async () => {
    if (isLocalFallback) {
      setUser(null); setView('dashboard');
      showToast("Sesión cerrada correctamente (Modo Local).", "success");
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setView('dashboard');
    } catch (error) {
      console.error("Logout failed", error);
      showToast("Error al cerrar sesión.", "error");
    }
  };

  const filteredStudents = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase().trim();
    return students.filter(s => {
      if (levelFilter !== 'all') {
        const normalizedGrade = s.grade.replace(/\s+/g, '').toLowerCase();
        if (levelFilter === 'preschool' && !ALL_GRADES.preschool.some(g => g.replace(/\s+/g, '').toLowerCase() === normalizedGrade)) return false;
        if (levelFilter === 'primary' && !ALL_GRADES.primary.some(g => g.replace(/\s+/g, '').toLowerCase() === normalizedGrade)) return false;
        if (levelFilter === 'secondary' && !ALL_GRADES.secondary.some(g => g.replace(/\s+/g, '').toLowerCase() === normalizedGrade)) return false;
      }
      const matchesSearch = !lowerSearch || s.fullName.toLowerCase().includes(lowerSearch) || s.grade.toLowerCase().includes(lowerSearch) || s.diagnosis.toLowerCase().includes(lowerSearch);
      let matchesDiagnosis = true;
      if (diagnosisFilter) {
        const diag = s.diagnosis.toUpperCase();
        let category = 'Otros';
        if (diag.includes('TEA') || diag.includes('ESPECTRO AUTISTA')) category = 'TEA';
        else if (diag.includes('TDAH') || diag.includes('HIPERACTIVIDAD')) category = 'TDAH';
        else if (diag.includes('TDA') || diag.includes('ATENCIONAL')) category = 'TDA';
        else if (diag.includes('ANSIEDAD') || diag.includes('DEPRESIÓN') || diag.includes('ADAPTATIVO')) category = 'Salud Mental';
        matchesDiagnosis = category === diagnosisFilter;
      }
      let matchesAccommodation = true;
      if (accommodationFilter) matchesAccommodation = s.accommodationType === accommodationFilter;
      let matchesGrade = true;
      if (gradeFilter) matchesGrade = s.grade.replace(/\s+/g, '').toLowerCase() === gradeFilter.replace(/\s+/g, '').toLowerCase();
      return matchesSearch && matchesDiagnosis && matchesAccommodation && matchesGrade;
    });
  }, [students, debouncedSearch, diagnosisFilter, accommodationFilter, gradeFilter, levelFilter]);

  useEffect(() => {
    if (isLocalFallback || filteredStudents.length === 0 || isDataLoading) return;
    const studentsToFetch = filteredStudents.filter(s => s.photoUrl === undefined).slice(0, 50);
    if (studentsToFetch.length === 0) return;
    const fetchPhotosBatch = async () => {
      const ids = studentsToFetch.map(s => s.id);
      try {
        const { data, error } = await supabase.from('students').select('id, photoUrl').in('id', ids);
        if (!error && data) {
          data.forEach(p => { photoCache.current[p.id] = p.photoUrl; });
          setStudents(prev => prev.map(s => {
            const photoMatch = data.find(p => p.id === s.id);
            return photoMatch ? { ...s, photoUrl: photoMatch.photoUrl } : s;
          }));
        }
      } catch (err) { console.error("Error fetching photo batch:", err); }
    };
    const timer = setTimeout(fetchPhotosBatch, 100);
    return () => clearTimeout(timer);
  }, [filteredStudents, isDataLoading, isLocalFallback]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <m.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg border border-red-100">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Error de Conexión</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">{globalError}</p>
          <button type="button" onClick={() => window.location.reload()}
            className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors">Reintentar</button>
        </m.div>
      </div>
    );
  }

  if (isDataLoading && students.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <m.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Profiler id="App" onRender={(id, phase, actualDuration) => {
      if (process.env.NODE_ENV !== 'production') console.log(`[Performance] ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
    }}>
      <div className="min-h-screen bg-brand-bg">
        <Toast toast={toast} />
        <div className="flex flex-col md:flex-row min-h-screen">
          <MobileHeader isSidebarOpen={isSidebarOpen} isLocalFallback={isLocalFallback}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <Sidebar view={view} levelFilter={levelFilter} user={user} isAdmin={isAdmin}
            isLocalFallback={isLocalFallback} isSidebarOpen={isSidebarOpen} showLoginForm={showLoginForm}
            authMode={authMode} loginEmail={loginEmail} loginPassword={loginPassword} isLoggingIn={isLoggingIn}
            onNavigate={(v, lf) => { setView(v); if (lf) { setLevelFilter(lf); setGradeFilter(null); } }}
            onNavigateGuide={() => setView('guide')} onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout} onToggleLoginForm={() => setShowLoginForm(!showLoginForm)}
            onToggleAuthMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            onSetLoginEmail={setLoginEmail} onSetLoginPassword={setLoginPassword}
            onLogin={handleLogin} onSignUp={handleSignUp} />

          <main className="flex-1 overflow-y-auto p-4 md:p-10">
            {isLocalFallback && (
              <div className="mb-6 px-4 py-3 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-center justify-between gap-3 text-amber-800 text-xs backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span><strong>Modo Local Autónomo Activo:</strong> El servidor de base de datos no está disponible. Las modificaciones se guardarán temporalmente en este navegador (localStorage).</span>
                </div>
                <button type="button" className="px-2 py-1 bg-amber-100 hover:bg-amber-200/80 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  onClick={() => { setIsLocalFallback(false); fetchStudents(); }}>Reintentar Conexión</button>
              </div>
            )}

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menú de navegación"
                  className="md:hidden p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 font-display">
                    {view === 'dashboard' && "Panel de Control"}
                    {view === 'guide' && "Guía Decreto 83"}
                    {view === 'students' && (
                      levelFilter === 'preschool' ? "Registro Inicial" :
                      levelFilter === 'primary' ? "Registro Primaria" :
                      levelFilter === 'secondary' ? "Registro Secundaria" : "Registro de Estudiantes"
                    )}
                    {isDataLoading && (
                      <m.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full shrink-0" />
                    )}
                  </h1>
                  <p className="text-slate-500 mt-1 text-sm md:text-base">
                    {view === 'dashboard' && "Resumen estadístico del Programa de apoyo pedagógico."}
                    {view === 'guide' && "Orientación sobre Adecuaciones de Acceso y Curriculares."}
                    {view === 'students' && (
                      levelFilter === 'preschool' ? "Gestión de alumnos de PreKinder y Kinder." :
                      levelFilter === 'primary' ? "Gestión de alumnos de 1° a 6° Básico." :
                      levelFilter === 'secondary' ? "Gestión de alumnos de 7° Básico a 4° Medio." :
                      "Visualización y registro de adecuaciones curriculares."
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button type="button" onClick={() => setPrivacyVisible(!privacyVisible)} aria-label={privacyVisible ? "Mostrar datos sensibles" : "Ocultar datos sensibles"}
                  className={cn("flex-1 sm:flex-none p-3 rounded-xl border transition-colors flex items-center justify-center gap-2 font-medium text-sm",
                    privacyVisible ? "bg-white border-slate-200 text-slate-600" : "bg-brand-primary text-white border-brand-primary")}>
                  {privacyVisible ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                  <span className="hidden xs:inline">{privacyVisible ? "Ocultar" : "Privacidad"}</span>
                </button>
                <button type="button" onClick={downloadCSV} className="bg-white border border-slate-200 p-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors active:scale-95" title="Descargar listado CSV" aria-label="Descargar listado CSV">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </header>

            <AnimatePresence mode="wait">
              {view === 'dashboard' && (
                <DashboardPage students={students}
                  onNavigate={(v, filters) => {
                    setView(v);
                    if (filters?.accommodation) setAccommodationFilter(filters.accommodation);
                    if (filters?.diagnosis) setDiagnosisFilter(filters.diagnosis);
                    if (filters?.grade) setGradeFilter(filters.grade);
                  }} />
              )}
              {view === 'guide' && <Decreto83Guide onBack={() => setView('dashboard')} />}
              {view === 'students' && (
                <m.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <StudentsPage filteredStudents={filteredStudents} isDataLoading={isDataLoading} isAdmin={isAdmin}
                    privacyVisible={privacyVisible} fetchFullStudent={fetchFullStudent} startEditing={startEditing}
                    setStudentToDelete={setStudentToDelete} setIsConfirmingDelete={setIsConfirmingDelete}
                    setViewingStudent={setViewingStudent} setStudents={setStudents} searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm} gradeFilter={gradeFilter} setGradeFilter={setGradeFilter}
                    diagnosisFilter={diagnosisFilter} setDiagnosisFilter={setDiagnosisFilter}
                    accommodationFilter={accommodationFilter} setAccommodationFilter={setAccommodationFilter}
                    showFilters={showFilters} setShowFilters={setShowFilters} uniqueGrades={uniqueGrades}
                    setIsAddingStudent={setIsAddingStudent} />

                  <ConfirmDeleteModal open={isConfirmingClear} title="¿Eliminar todos los datos?"
                    message="Esta acción eliminará permanentemente todos los registros de estudiantes. No se puede deshacer."
                    confirmLabel="Eliminar Todo" onConfirm={clearAllData} onCancel={() => setIsConfirmingClear(false)} />

                  <ConfirmDeleteModal open={isConfirmingDelete && !!studentToDelete}
                    title="¿Eliminar estudiante?"
                    message={<><strong>{studentToDelete?.fullName}</strong> — Esta acción no se puede deshacer.</>}
                    onConfirm={handleDeleteStudent}
                    onCancel={() => { setIsConfirmingDelete(false); setStudentToDelete(null); }} />

                  <StudentDetailModal student={viewingStudent} privacyVisible={privacyVisible} isAdmin={isAdmin}
                    onClose={() => setViewingStudent(null)}
                    onDelete={(s) => { setStudentToDelete(s); setIsConfirmingDelete(true); }} />

                  <StudentFormModal isOpen={isAddingStudent} student={newStudent} onSetStudent={setNewStudent}
                    onSubmit={handleAddStudent} onClose={() => setIsAddingStudent(false)}
                    onPhotoUpload={handlePhotoUpload} onViewGuide={() => setView('guide')} />
                </m.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </Profiler>
  );
}
