import React from 'react';

export const DataTable = ({ columns = [], data = [], keyExtractor = (item, idx) => idx }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-xs text-[#111827]">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-[#374151] font-semibold tracking-wider uppercase">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[#6B7280] font-medium">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr key={keyExtractor(item, rowIdx)} className="hover:bg-[#F8FAFC] transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-3 whitespace-nowrap">
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
