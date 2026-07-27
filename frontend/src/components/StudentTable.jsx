import React from 'react';
import { Trash2 } from 'lucide-react';

const StudentTable = ({ students, onRemoveStudent }) => {
  return (
    <div className="w-full overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-3 px-3 border-b border-slate-100 whitespace-nowrap">
                Student ID
              </th>
              <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-3 px-3 border-b border-slate-100 whitespace-nowrap">
                Name
              </th>
              <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-3 px-3 border-b border-slate-100 whitespace-nowrap">
                Data
              </th>
              <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-3 px-3 border-b border-slate-100 text-right whitespace-nowrap">
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
                <td className="py-3 px-3 border-b border-slate-100 border-dashed text-sm font-mono text-slate-500 whitespace-nowrap">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {student.id}
                  </span>
                </td>
                <td className="py-3 px-3 border-b border-slate-100 border-dashed text-sm font-semibold text-slate-800 whitespace-nowrap">
                  {student.name}
                </td>
                <td className="py-3 px-3 border-b border-slate-100 border-dashed text-sm text-slate-600 whitespace-nowrap">
                  <span className="inline-block text-xs bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-md font-medium max-w-[150px] md:max-w-none truncate">
                    {student.data}
                  </span>
                </td>
                <td className="py-3 px-3 border-b border-slate-100 border-dashed text-right text-sm whitespace-nowrap">
                  <button
                    onClick={() => onRemoveStudent(student.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-all duration-150 cursor-pointer inline-flex items-center justify-center"
                    title="Remove Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
