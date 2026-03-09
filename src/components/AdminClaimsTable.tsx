// src/components/AdminClaimsTable.tsx
import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  GroupingState,
  ExpandedState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  MoreVertical,
  Search,
  Download,
  List,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ClaimStatus, StudentClaim } from '../lib/types';
import * as XLSX from 'xlsx';

interface AdminClaimsTableProps {
  claims: StudentClaim[];
  onUpdateStatus?: (id: number, status: ClaimStatus) => void;
  isLoading?: boolean;
}

const STATUS_BADGE: Record<ClaimStatus, string> = {
  [ClaimStatus.PENDING]:   'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-1 ring-inset ring-yellow-500/20',
  [ClaimStatus.IN_REVIEW]: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20',
  [ClaimStatus.RESOLVED]:  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  [ClaimStatus.REJECTED]:  'bg-red-500/10 text-red-500 ring-1 ring-inset ring-red-500/20',
};

export const AdminClaimsTable: React.FC<AdminClaimsTableProps> = ({
  claims,
  onUpdateStatus,
  isLoading = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'submitted_at', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const navigate = useNavigate();

  const getStudentName = (claim: StudentClaim): string =>
    claim.student_name ||
    (claim.student?.user
      ? `${claim.student.user.first_name} ${claim.student.user.last_name}`
      : 'Unknown Student');

  const columns: ColumnDef<StudentClaim>[] = [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums font-medium">
          #{row.getValue('id')}
        </span>
      ),
      aggregationFn: 'count',
      aggregatedCell: () => null,
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => (
        <span
          className="block max-w-[200px] truncate text-sm font-medium text-foreground"
          title={row.getValue('subject')}
        >
          {row.getValue('subject')}
        </span>
      ),
      aggregationFn: (_, leafRows) => `${leafRows.length} claims`,
      aggregatedCell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'claim_type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {row.getValue('claim_type')}
        </span>
      ),
      aggregationFn: (columnId, leafRows) => {
        const types = [...new Set(leafRows.map(r => r.getValue(columnId)))];
        return types.join(', ');
      },
      aggregatedCell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      id: 'student_name',
      accessorFn: (row) => getStudentName(row),
      header: 'Student',
      cell: ({ getValue }) => (
        <span className="text-sm text-foreground font-medium">{getValue() as string}</span>
      ),
      aggregationFn: 'count',
      aggregatedCell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground uppercase flex-shrink-0">
            {String(row.groupingValue ?? '').split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
          </span>
          <span className="text-sm font-semibold text-foreground">{row.groupingValue as string}</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {row.subRows.length}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as ClaimStatus;
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? ''}`}>
            {status.replace(/_/g, ' ')}
          </span>
        );
      },
      aggregationFn: (columnId, leafRows) => {
        const statuses = [...new Set(leafRows.map(r => r.getValue(columnId)))];
        return statuses.length === 1 ? statuses[0] : 'mixed';
      },
      aggregatedCell: ({ getValue }) => {
        const v = getValue() as string;
        return v === 'mixed'
          ? <span className="text-xs text-muted-foreground">Mixed</span>
          : <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[v as ClaimStatus] ?? ''}`}>{v.replace(/_/g, ' ')}</span>;
      },
    },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted',
      cell: ({ row }) => {
        const date = row.getValue('submitted_at');
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {date ? format(new Date(date as string), 'PP') : '—'}
          </span>
        );
      },
      aggregationFn: (columnId, leafRows) => {
        const dates = leafRows.map(r => r.getValue(columnId)).filter(Boolean);
        if (!dates.length) return '—';
        return format(new Date(Math.max(...dates.map(d => new Date(d as string).getTime()))), 'PP');
      },
      aggregatedCell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const claim = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
              <DropdownMenuItem className="text-xs" onClick={() => navigate(`/admin/claims/${claim.id}`)}>
                <Eye className="h-3.5 w-3.5 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs" onClick={() => onUpdateStatus?.(claim.id, ClaimStatus.IN_REVIEW)}>
                Mark as In Review
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => onUpdateStatus?.(claim.id, ClaimStatus.RESOLVED)}>
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-destructive focus:text-destructive" onClick={() => onUpdateStatus?.(claim.id, ClaimStatus.REJECTED)}>
                Mark as Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      aggregationFn: () => null,
      aggregatedCell: () => null,
    },
  ];

  const table = useReactTable({
    data: claims,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    defaultColumn: { aggregationFn: 'count' },
    state: { sorting, columnFilters, globalFilter, grouping, expanded },
  });

  const exportToExcel = () => {
    const exportData = claims.map(claim => ({
      ID: claim.id,
      Subject: claim.subject,
      Type: claim.claim_type,
      Student: getStudentName(claim),
      'Reg Number': claim.student?.reg_no || '—',
      Department: claim.student?.department?.name || '—',
      Status: claim.status.replace(/_/g, ' '),
      Submitted: claim.submitted_at ? format(new Date(claim.submitted_at), 'PP') : '—',
      Description: claim.description || '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [8, 30, 15, 25, 15, 20, 15, 15, 50].map(wch => ({ wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Claims');
    XLSX.writeFile(wb, `claims_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search claims…"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted border-transparent focus:border-border focus:bg-background"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Group by */}
          <Select
            value={grouping.length > 0 ? grouping[0] : 'none'}
            onValueChange={(v) => setGrouping(v === 'none' ? [] : [v])}
          >
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">No grouping</SelectItem>
              <SelectItem value="status" className="text-xs">By Status</SelectItem>
              <SelectItem value="claim_type" className="text-xs">By Type</SelectItem>
              <SelectItem value="student_name" className="text-xs">By Student</SelectItem>
            </SelectContent>
          </Select>

          {/* View All dialog */}
          <Dialog open={isViewAllOpen} onOpenChange={setIsViewAllOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <List className="h-3.5 w-3.5" />
                View All
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base">All Claims ({claims.length})</DialogTitle>
                <DialogDescription className="text-xs">
                  Complete list of all student claims
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-md border mt-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Subject</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Student</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Submitted</TableHead>
                      <TableHead className="text-xs w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.length > 0 ? (
                      claims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="text-xs text-muted-foreground">#{claim.id}</TableCell>
                          <TableCell className="max-w-[180px] truncate text-sm" title={claim.subject}>
                            {claim.subject}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                              {claim.claim_type}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{getStudentName(claim)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[claim.status] ?? ''}`}>
                              {claim.status.replace(/_/g, ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {claim.submitted_at ? format(new Date(claim.submitted_at), 'PP') : '—'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground"
                              onClick={() => { setIsViewAllOpen(false); navigate(`/admin/claims/${claim.id}`); }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-20 text-center text-sm text-muted-foreground">
                          No claims found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          {/* Export */}
          <Button onClick={exportToExcel} variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide h-9">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`
                    ${row.getIsGrouped() ? 'bg-muted/20 hover:bg-muted/30' : 'hover:bg-muted/30'}
                    transition-colors
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {cell.getIsGrouped() ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={row.getToggleExpandedHandler()}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {row.getIsExpanded()
                              ? <ChevronDown className="h-3.5 w-3.5" />
                              : <ChevronRight className="h-3.5 w-3.5" />
                            }
                          </button>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ) : cell.getIsAggregated() ? (
                        flexRender(
                          cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      ) : cell.getIsPlaceholder() ? null : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  No claims found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          Showing{' '}
          <span className="font-medium text-foreground">{table.getRowModel().rows.length}</span>
          {' '}of{' '}
          <span className="font-medium text-foreground">{claims.length}</span>
          {' '}claim{claims.length !== 1 ? 's' : ''}
          {grouping.length > 0 && (
            <span className="text-muted-foreground"> · grouped by {grouping[0].replace('_', ' ')}</span>
          )}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-7 px-2.5 text-xs"
          >
            Prev
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums px-1">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-7 px-2.5 text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};