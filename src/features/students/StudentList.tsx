import React from 'react';
import { Student } from '../../types';
import StudentListItem from './StudentListItem';
import { FixedSizeList as VirtualList } from 'react-window';
import { SkeletonLoader } from '../../components/SkeletonLoaderPlaceholder';

interface Props {
  filteredStudents: Student[];
  isDataLoading: boolean;
  isAdmin: boolean;
  privacyVisible: boolean;
  fetchFullStudent: (id: string) => Promise<Student | null>;
  startEditing: (s: Student) => void;
  setStudentToDelete: (s: Student) => void;
  setIsConfirmingDelete: (v: boolean) => void;
  setViewingStudent: (s: Student | null) => void;
  setStudents: (s: Student[]) => void;
}

export const StudentList: React.FC<Props> = ({ filteredStudents, isDataLoading, isAdmin, privacyVisible, fetchFullStudent, startEditing, setStudentToDelete, setIsConfirmingDelete, setViewingStudent, setStudents }) => {
  if (isDataLoading) return <SkeletonLoader />;

  if (filteredStudents.length === 0) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
        </div>
        <p className="text-slate-400 font-medium">No se encontraron estudiantes con esos criterios.</p>
      </div>
    );
  }

  return (
    <VirtualList height={600} itemCount={filteredStudents.length} itemSize={110} width={'100%'}>
      {({ index, style }) => {
        const student = filteredStudents[index];
        return (
          <div style={style} key={student.id}>
            <StudentListItem
              student={student}
              isAdmin={isAdmin}
              privacyVisible={privacyVisible}
              onView={async (s) => {
                if (!s.photoUrl) {
                  const fullStudent = await fetchFullStudent(s.id);
                  if (fullStudent) {
                    setViewingStudent(fullStudent);
                    setStudents(prev => prev.map(curr => curr.id === s.id ? fullStudent : curr));
                    return;
                  }
                }
                setViewingStudent(s);
              }}
              onEdit={startEditing}
              onDelete={(s) => {
                setStudentToDelete(s);
                setIsConfirmingDelete(true);
              }}
            />
          </div>
        );
      }}
    </VirtualList>
  );
};

export default StudentList;
