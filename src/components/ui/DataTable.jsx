import React from 'react';

export const DataTable = ({ columns = [], data = [], keyExtractor = (item, idx) => idx }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#64748B] bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-xs text-[#0F172A]">
        <thead>
          <tr className="border-b border-[#64748B] bg-slate-100 text-[#0F172A] font-bold text-[11px] tracking-wider uppercase">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3.5 text-left font-bold text-[#0F172A]">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[#475569] font-semibold">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr key={keyExtractor(item, rowIdx)} className="hover:bg-slate-50 transition-colors font-medium">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-3.5 whitespace-nowrap text-[#0F172A]">
                    {col.render ? col.render(item, rowIdx) : item[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
