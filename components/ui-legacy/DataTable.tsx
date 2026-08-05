'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Papa from 'papaparse';
import { ArrowUp, ArrowDown, ArrowUpDown, Search, Columns3, Download } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from './Input';
import { IconButton } from './IconButton';
import { Checkbox } from './Checkbox';
import { Dropdown, DropdownTrigger, DropdownMenu } from './Dropdown';
import { EmptyState } from './States';
import { Pagination } from './Pagination';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  csvValue?: (row: T) => string;
  width?: number;
  minWidth?: number;
  hideByDefault?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  searchKeys?: (row: T) => string;
  searchPlaceholder?: string;
  selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  bulkActions?: (selectedIds: string[], clearSelection: () => void) => ReactNode;
  rowActions?: (row: T) => ReactNode;
  pageSize?: number;
  exportFilename?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchKeys,
  searchPlaceholder = 'Search...',
  selectable = false,
  onSelectionChange,
  bulkActions,
  rowActions,
  pageSize = 20,
  exportFilename = 'export.csv',
  emptyTitle = 'No results',
  emptyDescription,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.hideByDefault).map((c) => c.key))
  );
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [focusedRow, setFocusedRow] = useState(0);
  const resizing = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const visibleColumns = columns.filter((c) => !hiddenColumns.has(c.key));

  const filtered = useMemo(() => {
    if (!search.trim() || !searchKeys) return data;
    const needle = search.toLowerCase();
    return data.filter((row) => searchKeys(row).toLowerCase().includes(needle));
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search, sort]);
  useEffect(() => setFocusedRow(0), [page]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange?.(Array.from(next));
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      const pageIds = pageRows.map(getRowId);
      const allSelected = pageIds.every((id) => next.has(id));
      pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      onSelectionChange?.(Array.from(next));
      return next;
    });
  };

  const clearSelection = () => {
    setSelected(new Set());
    onSelectionChange?.([]);
  };

  const handleExport = () => {
    const csv = Papa.unparse(
      sorted.map((row) => {
        const record: Record<string, string> = {};
        visibleColumns.forEach((col) => {
          record[col.header] = col.csvValue ? col.csvValue(row) : String(col.accessor(row) ?? '');
        });
        return record;
      })
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startResize = (key: string, e: React.MouseEvent, currentWidth: number) => {
    resizing.current = { key, startX: e.clientX, startWidth: currentWidth };
    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const delta = ev.clientX - resizing.current.startX;
      setWidths((prev) => ({ ...prev, [resizing.current!.key]: Math.max(80, resizing.current!.startWidth + delta) }));
    };
    const onUp = () => {
      resizing.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedRow((r) => Math.min(r + 1, pageRows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedRow((r) => Math.max(r - 1, 0));
    } else if (e.key === ' ' && selectable) {
      e.preventDefault();
      const row = pageRows[focusedRow];
      if (row) toggleSelected(getRowId(row));
    } else if (e.key === 'Enter') {
      const row = pageRows[focusedRow];
      if (row && onRowClick) onRowClick(row);
    }
  };

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((row) => selected.has(getRowId(row)));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {searchKeys && (
          <Input placeholder={searchPlaceholder} leftIcon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" size="sm" />
        )}
        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 && bulkActions && (
            <div className="flex items-center gap-2 rounded-md bg-accent-subtle px-3 py-1.5 text-body-sm text-accent">
              <span>{selected.size} selected</span>
              {bulkActions(Array.from(selected), clearSelection)}
            </div>
          )}
          <Dropdown align="right">
            <DropdownTrigger className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-body-sm text-foreground-muted hover:bg-surface-hover">
              <Columns3 className="h-3.5 w-3.5" /> Columns
            </DropdownTrigger>
            <DropdownMenu>
              {columns.map((col) => (
                <label key={col.key} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-body-sm text-foreground hover:bg-surface-hover">
                  <Checkbox
                    checked={!hiddenColumns.has(col.key)}
                    onChange={() =>
                      setHiddenColumns((prev) => {
                        const next = new Set(prev);
                        if (next.has(col.key)) next.delete(col.key);
                        else next.add(col.key);
                        return next;
                      })
                    }
                  />
                  {col.header}
                </label>
              ))}
            </DropdownMenu>
          </Dropdown>
          <IconButton label="Export CSV" size="sm" variant="outline" onClick={handleExport}>
            <Download />
          </IconButton>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div ref={tableRef} className="overflow-x-auto rounded-lg border border-border" tabIndex={0} onKeyDown={handleKeyDown}>
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-surface">
              <tr>
                {selectable && (
                  <th className="w-10 border-b border-border p-3">
                    <Checkbox checked={allOnPageSelected} onChange={toggleSelectAllOnPage} aria-label="Select all rows on this page" />
                  </th>
                )}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className="relative border-b border-border p-3 text-label text-foreground-subtle"
                    style={{ width: widths[col.key] ?? col.width, minWidth: col.minWidth ?? 100 }}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        {col.header}
                        {sort?.key === col.key ? (
                          sort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                    <span
                      onMouseDown={(e) => startResize(col.key, e, widths[col.key] ?? col.width ?? 160)}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none hover:bg-accent/40"
                    />
                  </th>
                ))}
                {rowActions && <th className="w-10 border-b border-border p-3" />}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => {
                const id = getRowId(row);
                const isSelected = selected.has(id);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'border-b border-border transition-colors last:border-0',
                      onRowClick && 'cursor-pointer',
                      isSelected ? 'bg-accent-subtle' : i === focusedRow ? 'bg-surface-hover' : 'hover:bg-surface-hover'
                    )}
                  >
                    {selectable && (
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={() => toggleSelected(id)} aria-label={`Select row ${i + 1}`} />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="p-3 text-body-sm text-foreground" style={{ width: widths[col.key] ?? col.width }}>
                        {col.accessor(row)}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-caption text-foreground-subtle">
            {sorted.length} {sorted.length === 1 ? 'row' : 'rows'}
            {selected.size > 0 && ` · ${selected.size} selected`}
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
