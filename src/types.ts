export interface Student {
  id: string;
  fullName: string;
  grade: string;
  diagnosis: string;
  resolution: string;
  accommodationType: 'Adecuación de Acceso' | 'Adecuación Curricular' | 'Sin adecuación';
  photoUrl?: string | null;
  createdAt: string;
}


