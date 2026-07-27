import React from 'react';
import { ArrowRight } from 'lucide-react';
import StudentTable from './StudentTable';

const ClassCard = ({ classData, onViewStudents, onRemoveStudent }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
      <div className="p-5 px-6 border-b border-slate-100 flex justify-between items-center">
        <div className="flex flex-col text-left">
          <h3 className="text-[1.15rem] font-bold text-slate-800">{classData.name}</h3>
          <span className="text-[11px] text-slate-500 font-semibold tracking-wide">
            {classData.students.length} Enrolled (Min: 5)
          </span>
        </div>
        <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Active
        </div>
      </div>
      <div className="p-5 px-6 flex-1">
        <div className="mb-2 text-sm text-slate-600">
          Showing {Math.min(5, classData.students.length)} of {classData.students.length} students
        </div>
        <StudentTable 
          students={classData.students.slice(0,5)} 
          onRemoveStudent={(studentId) => onRemoveStudent(classData.id, studentId)}
        />
      </div>
      <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50">
        <button 
          className="w-full bg-white border border-slate-200 py-2.5 px-4 rounded-lg text-slate-600 font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 group"
          onClick={() => onViewStudents(classData)}
        >
          <span>View Students</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default ClassCard;
