import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStudents } from './hooks/useStudents';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { 
  Users, 
  ShieldAlert, 
  LayoutDashboard, 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  LogOut,
  Shield,
  Download,
  FileText,
  Edit2,
  Menu,
  X,
  Trash2,
  Camera,
  User as UserIcon,
  LogIn,
  BookOpen,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import StudentList from './features/students/StudentList';
import StudentsPage from './features/students/StudentsPage';
import { supabase } from './supabase';
import { seedStudents } from './data/seedData';
import { User } from '@supabase/supabase-js';
import { clsx, type ClassValue } from 'clsx';
import { Student } from './types';
import { twMerge } from 'tailwind-merge';
import { PrivacyMask } from './components/PrivacyMask';
import { Profiler } from 'react';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
  }
}

async function handleSupabaseError(error: any, operationType: OperationType, path: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  const errInfo: SupabaseErrorInfo = {
    error: error?.message || String(error),
    authInfo: {
      userId: user?.id,
      email: user?.email,
    },
    operationType,
    path
  }
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}



// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
      active 
        ? "bg-brand-accent/10 text-brand-accent font-semibold" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    )}
  >
    {active && <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-6 bg-brand-accent rounded-r-full" />}
    <Icon className={cn("w-5 h-5 transition-colors", active ? "text-brand-accent" : "group-hover:text-brand-accent")} />
    <span className="text-sm">{label}</span>
  </button>
);

const StatCard = React.memo(({ title, value, icon: Icon, color, onClick }: { title: string, value: string | number, icon: any, color: string, onClick?: () => void }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "glass-card p-6 flex items-center gap-5 transition-all",
      onClick && "cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
    )}
  >
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", color)}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 tabular-nums">{value}</h3>
    </div>
  </motion.div>
));

const SkeletonLoader = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="data-grid-row animate-pulse bg-white border border-slate-100 rounded-2xl p-6">
        <div className="col-span-3 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-100 skeleton" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 bg-slate-100 skeleton" />
            <div className="h-3 w-1/2 bg-slate-100 skeleton" />
          </div>
        </div>
        <div className="col-span-2 space-y-2">
          <div className="h-3 w-full bg-slate-100 skeleton" />
          <div className="h-3 w-2/3 bg-slate-100 skeleton" />
        </div>
        <div className="col-span-2 space-y-2">
          <div className="h-3 w-full bg-slate-100 skeleton" />
          <div className="h-3 w-3/4 bg-slate-100 skeleton" />
        </div>
        <div className="col-span-4 space-y-2">
          <div className="h-3 w-full bg-slate-100 skeleton" />
          <div className="h-3 w-5/6 bg-slate-100 skeleton" />
        </div>
      </div>
    ))}
  </div>
);

const ALL_GRADES = {
  preschool: ['PreKinder', 'Kinder A', 'Kinder B'],
  primary: [
    '1° Básico A', '1° Básico B', '2° Básico A', '2° Básico B', 
    '3° Básico A', '3° Básico B', '4° Básico A', '4° Básico B', 
    '5° Básico A', '5° Básico B', '6° Básico A', '6° Básico B'
  ],
  secondary: [
    '7° Básico A', '7° Básico B', '8° Básico A', '8° Básico B', 
    '1° Medio A', '1° Medio B', '2° Medio A', '2° Medio B', 
    '3° Medio A', '3° Medio B', '4° Medio A', '4° Medio B'
  ]
};

// ===== RETRY UTILITY =====
const retryAsync = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 500
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
};



// Local storage key is handled inside studentsService; prefer using the students hook/service.

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
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
  // Integrate useStudents hook (local-first data layer)
  const studentsHook = useStudents();

  // Keep local `students` state in sync with the hook's storage-backed list.
  useEffect(() => {
    if (studentsHook.students && Array.isArray(studentsHook.students) && studentsHook.students.length > 0) {
      setStudents(studentsHook.students as Student[]);
    }
  }, [studentsHook.students]);
  const photoCache = React.useRef<Record<string, string | null>>({});
  const uniqueGrades = useMemo(() => {
    if (!students || students.length === 0) return [];
    
    let filteredGrades = students.map(s => s.grade);
    
    if (levelFilter === 'preschool') {
      filteredGrades = filteredGrades.filter(g => ALL_GRADES.preschool.includes(g));
    } else if (levelFilter === 'primary') {
      filteredGrades = filteredGrades.filter(g => ALL_GRADES.primary.includes(g));
    } else if (levelFilter === 'secondary') {
      filteredGrades = filteredGrades.filter(g => ALL_GRADES.secondary.includes(g));
    }

    const grades = new Set(filteredGrades);
    return Array.from(grades).sort();
  }, [students, levelFilter]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`[Toast] ${type.toUpperCase()}: ${message}`);
    setToast({ message, type });
  };

  const isAdmin = user?.email?.toLowerCase().trim() === "hluengo.ro@gmail.com";

  const fetchStudents = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsDataLoading(true);

    const hasMissingConfig = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    if (hasMissingConfig || isLocalFallback) {
      const local = studentsHook.students && studentsHook.students.length > 0 ? studentsHook.students : [];
      setStudents(local.sort((a, b) => 
        (a.fullName || '').localeCompare(b.fullName || '', 'es', { sensitivity: 'base' })
      ));
      setIsLocalFallback(true);
      if (!isBackground) setIsDataLoading(false);
      return;
    }

    try {
      // Optimized query: exclude photoUrl initially to avoid timeout
      const { data, error } = await supabase
        .from('students')
        .select('id,fullName,grade,diagnosis,resolution,accommodationType,createdAt', { count: 'exact' })
        .limit(1000)
        .order('fullName', { ascending: true });
      
      if (error) {
        throw error;
      }

      const sortedData = (data as Student[]).map(s => ({
        ...s,
        photoUrl: undefined
      }));
      
      setStudents(sortedData);
      if (!isBackground) setIsDataLoading(false);
      setGlobalError(null);
    } catch (err: any) {
      console.warn("Supabase fetch error, fallback to local storage:", err?.message);
      const local = studentsHook.students && studentsHook.students.length > 0 ? studentsHook.students : [];
      setStudents(local.sort((a, b) => 
        (a.fullName || '').localeCompare(b.fullName || '', 'es', { sensitivity: 'base' })
      ));
      setIsLocalFallback(true);
      if (!isBackground) setIsDataLoading(false);
      showToast("Funcionando en modo local. Los cambios se sincronizarán cuando haya conexión.", "info");
    }
  }, [isLocalFallback, studentsHook.students]);

  const fetchFullStudent = async (studentId: string): Promise<Student | null> => {
    if (isLocalFallback) {
      const local = studentsHook.students.find(s => s.id === studentId) || null;
      return local || null;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (error) throw error;
      return data as Student;
    } catch (err) {
      console.error("Error fetching full student, fallback to local:", err);
      const local = studentsHook.students.find(s => s.id === studentId) || null;
      return local || null;
    }
  };

  useEffect(() => {
    if (user) {
      console.log("Auth State:", { email: user.email, isAdmin });
    }
  }, [user, isAdmin]);

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
  }, [isAddingStudent]);
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
        // Clear local seeded data via service
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
      let totalDeleted = 0;

      for (const tableName of tables) {
        const { error, count } = await supabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
          console.error(`Error al borrar tabla ${tableName}:`, error);
          continue;
        }
        totalDeleted += count || 0;
      }
      
      if (totalDeleted === 0) {
        showToast("No se encontraron registros para eliminar.", "info");
      } else {
        showToast(`${totalDeleted} registros eliminados correctamente.`, "success");
        setStudents([]); // Optimistic clear
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
      // Optimistic update
      setStudents(prev => prev.filter(s => s.id !== id));
      if (viewingStudent?.id === id) setViewingStudent(null);
      
      if (isLocalFallback) {
        await studentsHook.remove(id);
        showToast(`✓ ${name} eliminado.`, "success");
        return;
      }

      await retryAsync(async () => {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }, 2, 800);

      showToast(`✓ ${name} eliminado.`, "success");
    } catch (error: any) {
      console.error("Error deleting student:", error?.message);
      // Revert on error
      fetchStudents();
      showToast("No se pudo eliminar. Intenta de nuevo.", "error");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) { // 2MB limit for raw file
        showToast("La imagen es demasiado grande (máx 2MB)", 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions for thumbnail
          const MAX_SIZE = 400;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Export as compressed JPEG
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
          if (viewingStudent?.id === studentId) {
            setViewingStudent({ ...viewingStudent, ...studentData });
          }
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
          await studentsHook.create(newLocalStudent as any);
          setStudents(prev => [newLocalStudent, ...prev]);
          showToast("✓ Estudiante registrado.", "success");
        }
        return;
      }

      // Supabase operations with retry logic
      if (isEditing && studentId) {
        await retryAsync(async () => {
          const { error } = await supabase
            .from('students')
            .update({
              fullName: studentData.fullName,
              grade: studentData.grade,
              diagnosis: studentData.diagnosis,
              resolution: studentData.resolution,
              accommodationType: studentData.accommodationType,
              photoUrl: studentData.photoUrl || null
            })
            .eq('id', studentId);

          if (error) throw error;
        }, 3, 1000);

        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...studentData } as Student : s));
        if (viewingStudent?.id === studentId) {
          setViewingStudent({ ...viewingStudent, ...studentData });
        }
        showToast("✓ Estudiante actualizado.", "success");
      } else {
        const { data, error } = await retryAsync(async () => {
          return await supabase
            .from('students')
            .insert([{
              fullName: studentData.fullName,
              grade: studentData.grade,
              diagnosis: studentData.diagnosis,
              resolution: studentData.resolution,
              accommodationType: studentData.accommodationType,
              photoUrl: studentData.photoUrl || null
            }])
            .select();
        }, 3, 1000);

        if (data && data[0]) {
          const createdStudent = data[0] as Student;
          setStudents(prev => [createdStudent, ...prev]);
          showToast("✓ Estudiante registrado.", "success");
        }
      }
    } catch (error: any) {
      console.error("Error saving student:", error?.message);
      showToast(error?.message?.includes('network') 
        ? "Error de conexión. Intenta de nuevo." 
        : "No se pudo guardar. Revisa los datos.", "error");
    }
  };

  const downloadCSV = () => {
    if (students.length === 0) {
      setToast({ message: "No hay datos para descargar", type: 'info' });
      return;
    }

    const headers = ["Nombre Completo", "Curso", "Diagnóstico", "Adecuación", "Orientaciones"];
    const rows = students.map(s => [
      s.fullName,
      s.grade,
      s.diagnosis,
      s.accommodationType,
      s.resolution
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell?.replace(/"/g, '""') || ''}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `estudiantes_neetp_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: "Listado descargado correctamente", type: 'success' });
  };

  const startEditing = (student: Student) => {
    setNewStudent({
      id: student.id,
      fullName: student.fullName,
      grade: student.grade,
      diagnosis: student.diagnosis,
      resolution: student.resolution,
      accommodationType: student.accommodationType,
      photoUrl: student.photoUrl || ''
    });
    setIsAddingStudent(true);
  };

  // Auth Listener
  useEffect(() => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    if (isPlaceholder || isLocalFallback) {
      if (!user) {
        // Auto login with admin privileges in sandbox / local fallback mode
        setUser({
          id: 'local-admin-uid',
          email: 'hluengo.ro@gmail.com',
          user_metadata: {
            full_name: 'Gestor Escolar (Local)'
          }
        } as any);
      }
      setLoading(false);
      setIsLocalFallback(true);
      return;
    }

    let subscription: any = null;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.warn("Auth session fetch error, switching to mock:", err);
        setUser({
          id: 'local-admin-uid',
          email: 'hluengo.ro@gmail.com',
          user_metadata: {
            full_name: 'Gestor Escolar (Local)'
          }
        } as any);
        setIsLocalFallback(true);
        setLoading(false);
        return;
      }

      try {
        const res = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });
        subscription = res.data?.subscription;
      } catch (err) {
        console.warn("Auth change subscription error:", err);
      }
    };

    initAuth();

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.warn("Unsubscribe failed:", e);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocalFallback]);

  // Supabase Listeners
  useEffect(() => {
    fetchStudents();

    if (isLocalFallback) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const handleStudentChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchStudents(true), 500);
    };

    const channel = supabase.channel('students_changes');
    const subscription = channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, handleStudentChange)
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      try {
        subscription.unsubscribe();
      } catch (e) {
        console.warn("Channel cleanup failed:", e);
      }
    };
  }, [fetchStudents, isLocalFallback]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast("Por favor ingresa correo y contraseña.", "error");
      return;
    }
    setIsLoggingIn(true);

    if (isLocalFallback) {
      setTimeout(() => {
        setUser({
          id: 'local-admin-uid',
          email: loginEmail,
          user_metadata: {
            full_name: 'Gestor Escolar (Local)'
          }
        } as any);
        setShowLoginForm(false);
        setLoginEmail('');
        setLoginPassword('');
        showToast("Sesión iniciada correctamente (Modo Local).", "success");
        setIsLoggingIn(false);
      }, 400);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      setShowLoginForm(false);
      setLoginEmail('');
      setLoginPassword('');
      showToast("Sesión iniciada correctamente.", "success");
    } catch (error: any) {
      console.error("Login failed", error);
      showToast(error.message || "Error al iniciar sesión.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast("Por favor ingresa correo y contraseña.", "error");
      return;
    }
    setIsLoggingIn(true);

    if (isLocalFallback) {
      setTimeout(() => {
        setUser({
          id: 'local-admin-uid',
          email: loginEmail,
          user_metadata: {
            full_name: 'Gestor Escolar (Local)'
          }
        } as any);
        setShowLoginForm(false);
        setLoginEmail('');
        setLoginPassword('');
        showToast("Registro y login automáticos correctos (Modo Local).", "success");
        setIsLoggingIn(false);
      }, 400);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) {
        if (error.message.includes("User already registered")) {
          showToast("Este usuario ya existe. Cambiando a modo Iniciar Sesión.", "info");
          setAuthMode('login');
          return;
        }
        throw error;
      }
      showToast("Registro exitoso. Revisa tu correo si es necesario.", "success");
      setAuthMode('login');
    } catch (error: any) {
      console.error("Sign up failed", error);
      showToast(error.message || "Error al registrarse.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (isLocalFallback) {
      setUser(null);
      setView('dashboard');
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
      // Level filtering logic
      if (levelFilter !== 'all') {
        const normalizedGrade = s.grade.replace(/\s+/g, '').toLowerCase();
        if (levelFilter === 'preschool' && !ALL_GRADES.preschool.some(g => g.replace(/\s+/g, '').toLowerCase() === normalizedGrade)) return false;
        if (levelFilter === 'primary' && !ALL_GRADES.primary.some(g => g.replace(/\s+/g, '').toLowerCase() === normalizedGrade)) return false;
        if (levelFilter === 'secondary' && !ALL_GRADES.secondary.some(g => g.replace(/\s+/g, '').toLowerCase() === normalizedGrade)) return false;
      }

      const matchesSearch = !lowerSearch ||
        s.fullName.toLowerCase().includes(lowerSearch) ||
        s.grade.toLowerCase().includes(lowerSearch) ||
        s.diagnosis.toLowerCase().includes(lowerSearch);
      
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
      if (accommodationFilter) {
        matchesAccommodation = s.accommodationType === accommodationFilter;
      }

      let matchesGrade = true;
      if (gradeFilter) {
        matchesGrade = s.grade.replace(/\s+/g, '').toLowerCase() === gradeFilter.replace(/\s+/g, '').toLowerCase();
      }

      return matchesSearch && matchesDiagnosis && matchesAccommodation && matchesGrade;
    });
  }, [students, debouncedSearch, diagnosisFilter, accommodationFilter, gradeFilter, levelFilter]);

  // 3. Fetch photos for filtered students that are missing them
  useEffect(() => {
    if (isLocalFallback || filteredStudents.length === 0 || isDataLoading) return;

    const studentsToFetch = filteredStudents
      .filter(s => s.photoUrl === undefined)
      .slice(0, 50); // Fetch in larger batches for speed

    if (studentsToFetch.length === 0) return;

    const fetchPhotosBatch = async () => {
      const ids = studentsToFetch.map(s => s.id);
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, photoUrl')
          .in('id', ids);

        if (!error && data) {
          // Update cache
          data.forEach(p => {
            photoCache.current[p.id] = p.photoUrl;
          });

          setStudents(prev => prev.map(s => {
            const photoMatch = data.find(p => p.id === s.id);
            // If found, set photoUrl (could be string or null). If not found in batch, keep as is.
            return photoMatch ? { ...s, photoUrl: photoMatch.photoUrl } : s;
          }));
        } else if (error) {
          console.error("Error fetching photo batch:", error);
        }
      } catch (err) {
        console.error("Error fetching photo batch:", err);
      }
    };

    const timer = setTimeout(fetchPhotosBatch, 100); // Faster debounce
    return () => clearTimeout(timer);
  }, [filteredStudents, isDataLoading, isLocalFallback]);

  const dashboardStats = useMemo(() => {
    let accessCount = 0;
    let curricularCount = 0;
    let noAccommodationCount = 0;
    const gradeData: Record<string, number> = {};
    const diagnosisCategories: Record<string, number> = {};
    const othersDiagnosisData: Record<string, number> = {};

    students.forEach(s => {
      const accType = s.accommodationType?.trim();
      // Accommodation counts
      if (accType === 'Adecuación de Acceso') accessCount++;
      else if (accType === 'Adecuación Curricular') curricularCount++;
      else noAccommodationCount++;

      // Grade distribution
      const grade = s.grade?.trim() || 'Sin Grado';
      gradeData[grade] = (gradeData[grade] || 0) + 1;

      // Diagnosis categorization
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg border border-red-100"
        >
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Error de Conexión</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {globalError}
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Reintentar
            </button>
            <p className="text-xs text-slate-400">
              Si el problema persiste, por favor contacta al administrador o verifica tu conexión a internet.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (isDataLoading && students.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Profiler id="App" onRender={(id, phase, actualDuration) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Performance] ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
      }
    }}>
      <div className="min-h-screen bg-brand-bg">
        {/* Toast Notification */}
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={cn(
                "fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 min-w-[300px]",
                toast.type === 'success' ? "bg-emerald-600 text-white" :
                toast.type === 'error' ? "bg-red-600 text-white" :
                "bg-slate-800 text-white"
              )}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'error' && <ShieldAlert className="w-5 h-5" />}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain p-1 bg-white" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }} 
            />
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            EduGestion - NeuroDiversidad 2026
            {isLocalFallback && (
              <span className="px-1 py-0.5 text-[8px] bg-amber-50 text-amber-600 border border-amber-200 rounded font-bold uppercase tracking-wider">Local</span>
            )}
          </h2>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
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
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={view === 'dashboard'} 
            onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} 
          />
          <div className="pt-4 pb-2 px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveles Educativos</p>
          </div>
          <SidebarItem 
            icon={Users} 
            label="Inicial" 
            active={view === 'students' && levelFilter === 'preschool'} 
            onClick={() => { setView('students'); setLevelFilter('preschool'); setGradeFilter(null); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={Users} 
            label="Primaria" 
            active={view === 'students' && levelFilter === 'primary'} 
            onClick={() => { setView('students'); setLevelFilter('primary'); setGradeFilter(null); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={Users} 
            label="Secundaria" 
            active={view === 'students' && levelFilter === 'secondary'} 
            onClick={() => { setView('students'); setLevelFilter('secondary'); setGradeFilter(null); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={Users} 
            label="Todos los Alumnos" 
            active={view === 'students' && levelFilter === 'all'} 
            onClick={() => { setView('students'); setLevelFilter('all'); setGradeFilter(null); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={BookOpen} 
            label="Guía Decreto 83" 
            active={view === 'guide'} 
            onClick={() => { setView('guide'); setIsSidebarOpen(false); }} 
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
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          ) : (
            <div className="space-y-3">
              {!showLoginForm ? (
                <button 
                  onClick={() => setShowLoginForm(true)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-brand-primary hover:bg-brand-accent/5 rounded-xl transition-colors font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  Acceso Super Usuario
                </button>
              ) : (
                <form onSubmit={authMode === 'login' ? handleLogin : handleSignUp} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setShowLoginForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input 
                    type="email"
                    placeholder="Correo"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all"
                    required
                  />
                  <input 
                    type="password"
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-brand-accent text-white py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Procesando...' : (authMode === 'login' ? 'Entrar' : 'Crear Cuenta')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        {isLocalFallback && (
          <div className="mb-6 px-4 py-3 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-center justify-between gap-3 text-amber-800 text-xs backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>
                <strong>Modo Local Autónomo Activo:</strong> El servidor de base de datos no está disponible. Las modificaciones se guardarán temporalmente en este navegador (localStorage).
              </span>
            </div>
            <button 
              className="px-2 py-1 bg-amber-100 hover:bg-amber-200/80 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
              onClick={() => {
                setIsLocalFallback(false);
                fetchStudents();
              }}
            >
              Reintentar Conexión
            </button>
          </div>
        )}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 font-display">
                {view === 'dashboard' && "Panel de Control"}
                {view === 'guide' && "Guía Decreto 83"}
                {view === 'students' && (
                  levelFilter === 'preschool' ? "Registro Inicial" :
                  levelFilter === 'primary' ? "Registro Primaria" :
                  levelFilter === 'secondary' ? "Registro Secundaria" :
                  "Registro de Estudiantes"
                )}
                {isDataLoading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full shrink-0"
                  />
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
            <button 
              onClick={() => setPrivacyVisible(!privacyVisible)}
              className={cn(
                "flex-1 sm:flex-none p-3 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium text-sm",
                privacyVisible ? "bg-white border-slate-200 text-slate-600" : "bg-brand-primary text-white border-brand-primary"
              )}
            >
              {privacyVisible ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
              <span className="hidden xs:inline">{privacyVisible ? "Ocultar" : "Privacidad"}</span>
            </button>
            <button 
              onClick={downloadCSV}
              className="bg-white border border-slate-200 p-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              title="Descargar listado CSV"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
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
                  onClick={() => {
                    setDiagnosisFilter(null);
                    setAccommodationFilter(null);
                    setView('students');
                  }}
                />
                <StatCard 
                  title="Adecuación Acceso" 
                  value={dashboardStats.accessCount} 
                  icon={CheckCircle2} 
                  color="bg-emerald-500" 
                  onClick={() => {
                    setAccommodationFilter('Adecuación de Acceso');
                    setDiagnosisFilter(null);
                    setView('students');
                  }}
                />
                <StatCard 
                  title="Adecuación Curricular" 
                  value={dashboardStats.curricularCount} 
                  icon={FileText} 
                  color="bg-amber-500" 
                  onClick={() => {
                    setAccommodationFilter('Adecuación Curricular');
                    setDiagnosisFilter(null);
                    setView('students');
                  }}
                />
                <StatCard 
                  title="Sin Adecuación" 
                  value={dashboardStats.noAccommodationCount} 
                  icon={Users} 
                  color="bg-blue-500" 
                  onClick={() => {
                    setAccommodationFilter('Sin adecuación');
                    setDiagnosisFilter(null);
                    setView('students');
                  }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-card p-8">
                    <h3 className="text-lg font-black text-slate-800 mb-6 font-display">Distribución por Curso</h3>
                    <div className="h-[400px] min-h-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardStats.chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f8fafc' }}
                          />
                          <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} onClick={(data) => {
                            setGradeFilter(data.name || null);
                            setView('students');
                          }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
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
                      onClick={() => setView('guide')}
                      className="w-full py-3 bg-brand-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-accent/20 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
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
                    <div className="h-[350px] min-h-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Acceso', value: dashboardStats.accessCount },
                              { name: 'Curricular', value: dashboardStats.curricularCount },
                              { name: 'Sin Adecuación', value: dashboardStats.totalStudents - (dashboardStats.accessCount + dashboardStats.curricularCount) }
                            ]}
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#e2e8f0" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Detalle de "Otros" Diagnósticos</h3>
                    <div className="h-[350px] min-h-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardStats.othersChartData}
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => (percent ?? 0) > 0.05 ? `${name}` : ''}
                        >
                          {dashboardStats.othersChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16'][index % 8]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

                <div className="lg:col-span-2">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Distribución por Diagnóstico</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {dashboardStats.diagnosisChartData.map((item) => (
                      <motion.div 
                        key={item.name}
                        whileHover={{ y: -5 }}
                        onClick={() => {
                          setDiagnosisFilter(item.name);
                          setView('students');
                        }}
                        className="glass-card p-6 text-center space-y-2 border-t-4 border-brand-accent cursor-pointer hover:shadow-xl transition-all"
                      >
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.name}</p>
                        <h4 className="text-3xl font-black text-slate-800">{item.value}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Estudiantes</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
          )}

          {view === 'guide' && (
            <motion.div 
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
                        // Fallback image if the link above fails
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
                      onClick={() => setView('dashboard')}
                      className="px-10 py-4 bg-slate-800 text-white rounded-2xl font-black shadow-xl hover:bg-slate-900 transition-all active:scale-95"
                    >
                      Volver al Panel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'students' && (
            <motion.div 
              key="students"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <StudentsPage
                filteredStudents={filteredStudents}
                isDataLoading={isDataLoading}
                isAdmin={isAdmin}
                privacyVisible={privacyVisible}
                fetchFullStudent={fetchFullStudent}
                startEditing={startEditing}
                setStudentToDelete={setStudentToDelete}
                setIsConfirmingDelete={setIsConfirmingDelete}
                setViewingStudent={setViewingStudent}
                setStudents={setStudents}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                gradeFilter={gradeFilter}
                setGradeFilter={setGradeFilter}
                diagnosisFilter={diagnosisFilter}
                setDiagnosisFilter={setDiagnosisFilter}
                accommodationFilter={accommodationFilter}
                setAccommodationFilter={setAccommodationFilter}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                uniqueGrades={uniqueGrades}
                setIsAddingStudent={setIsAddingStudent}
              />

              {/* Modal Confirmación Borrado */}
              <AnimatePresence>
                {isConfirmingClear && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6"
                    >
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
                        <Trash2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-800">¿Eliminar todos los datos?</h3>
                        <p className="text-slate-500">Esta acción eliminará permanentemente todos los registros de estudiantes. No se puede deshacer.</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setIsConfirmingClear(false)}
                          className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={clearAllData}
                          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                          Eliminar Todo
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Modal Confirmación Borrado Individual */}
              <AnimatePresence>
                {isConfirmingDelete && studentToDelete && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6"
                    >
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
                        <Trash2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-800">¿Eliminar estudiante?</h3>
                        <p className="text-slate-500">
                          ¿Estás seguro de que deseas eliminar a <strong>{studentToDelete.fullName}</strong>? Esta acción no se puede deshacer.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            setIsConfirmingDelete(false);
                            setStudentToDelete(null);
                          }}
                          className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleDeleteStudent}
                          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                          Eliminar
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Modal Detalle Estudiante */}
              <AnimatePresence>
                {viewingStudent && (
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
                              onClick={() => {
                                setStudentToDelete(viewingStudent);
                                setIsConfirmingDelete(true);
                              }}
                              className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                              title="Eliminar estudiante"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          )}
                          <button 
                            onClick={() => setViewingStudent(null)} 
                            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all active:scale-90"
                          >
                            <X className="w-7 h-7" />
                          </button>
                        </div>
                      </div>

                      <div className="p-8 md:p-12 space-y-12 overflow-y-auto custom-scrollbar">
                        <div className="flex flex-col lg:flex-row gap-12">
                          {/* Left Column: Photo & Status */}
                          <div className="flex flex-col items-center gap-8 shrink-0">
                            <div className="relative group">
                              <div className="w-72 h-72 md:w-80 md:h-80 rounded-[2.5rem] bg-slate-100 flex items-center justify-center overflow-hidden border-[12px] border-white shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                                {viewingStudent.photoUrl ? (
                                  <img 
                                    key={viewingStudent.photoUrl}
                                    src={viewingStudent.photoUrl} 
                                    alt={viewingStudent.fullName} 
                                    className={cn("w-full h-full object-cover transition-all duration-500 img-fade-in", privacyVisible && "blur-2xl scale-110")} 
                                    loading="lazy" 
                                  />
                                ) : (
                                  <UserIcon className="w-24 h-24 text-slate-300" />
                                )}
                              </div>
                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-2.5 rounded-full shadow-xl border-2 border-white whitespace-nowrap transition-all"
                                style={{ 
                                  backgroundColor: viewingStudent.accommodationType === 'Adecuación de Acceso' ? '#10b981' : 
                                                  viewingStudent.accommodationType === 'Adecuación Curricular' ? '#f59e0b' : '#64748b' 
                                }}
                              >
                                {viewingStudent.accommodationType === 'Adecuación de Acceso' ? <ShieldAlert className="w-4 h-4 text-white" /> :
                                 viewingStudent.accommodationType === 'Adecuación Curricular' ? <FileText className="w-4 h-4 text-white" /> :
                                 <UserIcon className="w-4 h-4 text-white" />}
                                <span className="text-xs font-black uppercase tracking-widest text-white">
                                  {viewingStudent.accommodationType}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Details */}
                          <div className="flex-1 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nombre Completo</label>
                                <p className="text-2xl font-black text-slate-800 leading-tight font-display">
                                  <PrivacyMask text={viewingStudent.fullName} visible={!privacyVisible} />
                                </p>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curso / Nivel</label>
                                <p className="text-2xl font-black text-slate-800 leading-tight font-display">{viewingStudent.grade}</p>
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
                                  <PrivacyMask text={viewingStudent.diagnosis} visible={!privacyVisible} />
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
                                  {viewingStudent.resolution}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 md:p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
                        <button 
                          onClick={() => setViewingStudent(null)}
                          className="px-10 py-4 bg-slate-800 text-white rounded-2xl font-black text-base shadow-xl shadow-slate-800/20 hover:bg-slate-900 hover:-translate-y-1 active:translate-y-0 transition-all"
                        >
                          Cerrar Expediente
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Modal Nuevo Estudiante */}
              <AnimatePresence>
                {isAddingStudent && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                      <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                        <h3 className="text-xl md:text-2xl font-black text-slate-800 font-display">
                          {newStudent.id ? "Editar Registro" : "Nuevo Registro Estudiantil"}
                        </h3>
                        <button 
                          onClick={() => {
                            setIsAddingStudent(false);
                            setNewStudent({ id: undefined, fullName: '', grade: '', diagnosis: '', resolution: '', accommodationType: 'Adecuación de Acceso', photoUrl: '' });
                          }} 
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <form onSubmit={handleAddStudent} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* Photo Upload Section */}
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                              <div className="w-48 h-48 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-accent">
                                {newStudent.photoUrl ? (
                                  <img 
                                    key={newStudent.photoUrl}
                                    src={newStudent.photoUrl} 
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
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
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
                                value={newStudent.fullName}
                                onChange={e => setNewStudent({...newStudent, fullName: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curso</label>
                              <select 
                                required
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all appearance-none"
                                value={newStudent.grade}
                                onChange={e => setNewStudent({...newStudent, grade: e.target.value})}
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
                              onClick={() => setView('guide')}
                              className="text-[10px] font-black text-brand-accent uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                              <Info className="w-3 h-3" />
                              Ver Guía
                            </button>
                          </div>
                          <select 
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all"
                            value={newStudent.accommodationType}
                            onChange={e => setNewStudent({...newStudent, accommodationType: e.target.value as any})}
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
                            value={newStudent.diagnosis}
                            onChange={e => setNewStudent({...newStudent, diagnosis: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orientaciones Pedagógicas</label>
                          <textarea 
                            rows={3}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all resize-none"
                            value={newStudent.resolution}
                            onChange={e => setNewStudent({...newStudent, resolution: e.target.value})}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 shrink-0">
                          <button 
                            type="button"
                            onClick={() => {
                              setIsAddingStudent(false);
                              setNewStudent({ id: undefined, fullName: '', grade: '', diagnosis: '', resolution: '', accommodationType: 'Adecuación de Acceso', photoUrl: '' });
                            }}
                            className="order-2 sm:order-1 flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit"
                            className="order-1 sm:order-2 flex-1 bg-brand-accent text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-accent/20 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                          >
                            {newStudent.id ? "Actualizar Registro" : "Guardar Registro"}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 z-[100]"
            >
              <div className={cn(
                "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
                toast.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" :
                toast.type === 'error' ? "bg-red-500/90 text-white border-red-400" :
                "bg-slate-800/90 text-white border-slate-700"
              )}>
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {toast.type === 'error' && <ShieldAlert className="w-5 h-5" />}
                <p className="font-bold text-sm tracking-wide">{toast.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
    </div>
    </Profiler>
  );
}
