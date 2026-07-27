import React from 'react';
import { Trash2 } from 'lucide-react';

const StudentTable = ({ students, onRemoveStudent }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100">
              Student ID
            </th>
            <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100">
              Name
            </th>
            <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100">
              Data
            </th>
            <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr 
              key={student.id} 
              className="hover:bg-slate-50/50 transition-colors duration-150 group"
            >
              <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-sm font-mono text-slate-500">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">
                  {student.id}
                </span>
              </td>
              <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-sm font-semibold text-slate-800">
                {student.name}
              </td>
              <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-sm text-slate-600">
                <span className="inline-block text-xs bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-md font-medium">
                  {student.data}
                </span>
              </td>
              <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-right text-sm">
                <button
                  onClick={() => onRemoveStudent(student.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-all duration-150 cursor-pointer inline-flex items-center justify-center"
                  title="Remove Student"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
