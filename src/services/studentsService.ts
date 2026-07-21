import { supabase } from '../supabase';
import { seedStudents } from '../data/seedData';
import type { Student } from '../types';

const LOCAL_STORAGE_KEY = 'edugestion_local_students';

function readLocal(): Student[] {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Student[]; } catch { return []; }
}

function writeLocal(list: Student[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

export const studentsService = {
  async listLocal(): Promise<Student[]> {
    const existing = readLocal();
    if (existing && existing.length > 0) return existing;

    // Initialize defaults from seed data for first-time use
    const defaults: Student[] = seedStudents.map((s, idx) => ({
      id: `local-student-${idx}`,
      fullName: s.fullName,
      grade: s.grade,
      diagnosis: s.diagnosis,
      resolution: s.resolution,
      accommodationType: (s.accommodationType === 'Adecuación de Acceso' || s.accommodationType === 'Adecuación Curricular') ? s.accommodationType : 'Sin adecuación',
      photoUrl: undefined,
      createdAt: new Date(Date.now() - idx * 12 * 60 * 60 * 1000).toISOString()
    }));
    writeLocal(defaults);
    return defaults;
  },

  async getLocal(id: string): Promise<Student | undefined> {
    return readLocal().find(s => s.id === id);
  },

  async createLocal(student: Student): Promise<void> {
    const list = readLocal();
    writeLocal([student, ...list]);
  },

  async updateLocal(id: string, data: Partial<Student>): Promise<void> {
    const list = readLocal().map(s => s.id === id ? { ...s, ...data } : s);
    writeLocal(list);
  },

  async deleteLocal(id: string): Promise<void> {
    const list = readLocal().filter(s => s.id !== id);
    writeLocal(list);
  },

  async clearLocal(): Promise<void> {
    writeLocal([]);
  },

  // Supabase placeholders — to be implemented with server-side validation + RLS
  async listRemote() {
    const { data, error } = await supabase.from('students').select('*');
    if (error) throw error;
    return data;
  }
};

export default studentsService;
