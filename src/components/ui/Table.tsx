import { ReactNode } from 'react'

interface TableProps {
  columns: string[]
  children: ReactNode
  columnWidths?: string[]
  tableClassName?: string
}

export function Table({ columns, children, columnWidths, tableClassName }: TableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className={`min-w-full text-left text-sm ${tableClassName ?? ''}`}>
        {columnWidths ? (
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={`${width}-${index}`} style={{ width }} />
            ))}
          </colgroup>
        ) : null}
        <thead className="bg-panel">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-dim">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
