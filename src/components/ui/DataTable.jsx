import React from 'react';
import clsx from 'clsx';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns = [],
  data = [],
  keyExtractor = (item, idx) => item.id || idx,
  isLoading = false,
  emptyMessage = "No records found.",
  className
}) => {
  return (
    <div className={clsx("w-full overflow-x-auto rounded-[14px] border border-[#CBD8D1] bg-white shadow-[0_1px_2px_rgba(20,50,35,0.08),0_6px_16px_rgba(20,50,35,0.07)]", className)}>
      <table className="w-full text-left border-collapse text-sm text-[#12201A]">
        <thead>
          <tr className="border-b border-[#BCCBC3] bg-[#F3F7F5] text-[#5A6A61] font-semibold text-[12px] tracking-[0.04em] uppercase h-[44px] sticky top-0 z-10">
            {columns.map((col, i) => (
              <th
                key={i}
                className={clsx(
                  "px-4 py-2.5 font-semibold text-[#5A6A61]",
                  col.align === 'right' ? "text-right" : col.align === 'center' ? "text-center" : "text-left",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E1E9E4] bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-[#5A6A61]">
                <div className="inline-flex items-center gap-2 font-medium">
                  <span className="w-4 h-4 rounded-full border-2 border-[#167C63] border-t-transparent animate-spin" />
                  <span>Loading table records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-6 text-center">
                <EmptyState title="No table records" description={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr key={keyExtractor(item, rowIdx)} className="hover:bg-[#F4F8F5] transition-colors h-[52px] font-normal">
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={clsx(
                      "px-4 py-3 whitespace-nowrap text-[#12201A]",
                      col.align === 'right' ? "text-right tabular-nums font-mono" : col.align === 'center' ? "text-center" : "text-left",
                      col.isNet && "font-semibold text-[#167C63]",
                      col.className
                    )}
                  >
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
