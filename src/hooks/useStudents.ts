import { useEffect, useState, useCallback } from 'react';
import studentsService, { StudentDTO } from '../services/studentsService';

export function useStudents() {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const local = await studentsService.listLocal();
      setStudents(local);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (s: StudentDTO) => {
    await studentsService.createLocal(s);
    setStudents(prev => [s, ...prev]);
  }, []);

  const update = useCallback(async (id: string, data: Partial<StudentDTO>) => {
    await studentsService.updateLocal(id, data);
    setStudents(prev => prev.map(p => p.id === id ? { ...p, ...data } as StudentDTO : p));
  }, []);

  const remove = useCallback(async (id: string) => {
    await studentsService.deleteLocal(id);
    setStudents(prev => prev.filter(p => p.id !== id));
  }, []);

  return { students, loading, load, create, update, remove };
}

export default useStudents;
