import React from 'react';
import StudentTable from './StudentTable';

// Props: students - array of unique student objects {id, name, data}
const GlobalStudents = ({ students }) => {
  return (
    <section className="flex flex-col gap-5 mt-8">
      <h2 className="text-xl font-bold text-slate-800 mb-2">All Students Directory</h2>
      <StudentTable students={students} onRemoveStudent={() => {}} />
    </section>
  );
};

export default GlobalStudents;
