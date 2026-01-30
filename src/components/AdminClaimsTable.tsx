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
  FileSpreadsheet,
  List
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

export const AdminClaimsTable: React.FC<AdminClaimsTableProps> = ({ 
  claims, 
  onUpdateStatus,
  isLoading = false 
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [grouping, setGrouping] = useState<GroupingState>(['student_name']);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const navigate = useNavigate();

  const columns: ColumnDef<StudentClaim>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div className="font-medium">#{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.getValue('subject')}
        </div>
      ),
    },
    {
      accessorKey: 'claim_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue('claim_type')}
        </Badge>
      ),
      aggregatedCell: ({ getValue }) => {
        const value = getValue() as string;
        return <Badge variant="outline">{value}</Badge>;
      },
    },
    {
      accessorKey: 'student_name',
      header: 'Student',
      cell: ({ row }) => {
        const claim = row.original;
        return claim.student_name || 
          (claim.student?.user ? `${claim.student.user.first_name} ${claim.student.user.last_name}` : 'N/A');
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as ClaimStatus;
        const colors = {
          [ClaimStatus.PENDING]: 'bg-yellow-500',
          [ClaimStatus.IN_REVIEW]: 'bg-blue-500',
          [ClaimStatus.RESOLVED]: 'bg-green-500',
          [ClaimStatus.REJECTED]: 'bg-red-500',
        };
        
        return (
          <Badge className={`${colors[status]} text-white`}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      },
      aggregatedCell: ({ getValue }) => {
        const status = getValue() as ClaimStatus;
        const colors = {
          [ClaimStatus.PENDING]: 'bg-yellow-500',
          [ClaimStatus.IN_REVIEW]: 'bg-blue-500',
          [ClaimStatus.RESOLVED]: 'bg-green-500',
          [ClaimStatus.REJECTED]: 'bg-red-500',
        };
        return (
          <Badge className={`${colors[status]} text-white`}>
            {status }
          </Badge>
        );
      },
    },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted',
      cell: ({ row }) => format(new Date(row.getValue('submitted_at')), 'PP'),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const claim = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/admin/claims/${claim.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUpdateStatus?.(claim.id, ClaimStatus.IN_REVIEW)}>
                Mark as In Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus?.(claim.id, ClaimStatus.RESOLVED)}>
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onUpdateStatus?.(claim.id, ClaimStatus.REJECTED)}
                className="text-red-600"
              >
                Mark as Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
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
    state: {
      sorting,
      columnFilters,
      globalFilter,
      grouping,
      expanded,
    },
  });

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = claims.map(claim => ({
      ID: claim.id,
      Subject: claim.subject,
      Type: claim.claim_type,
      Student: claim.student_name || 
        (claim.student?.user ? `${claim.student.user.first_name} ${claim.student.user.last_name}` : 'N/A'),
      'Registration Number': claim.student?.reg_no || 'N/A',
      Department: claim.student?.department?.name || 'N/A',
      Status: claim.status.replace('_', ' ').toUpperCase(),
      Submitted: claim.submitted_at ? format(new Date(claim.submitted_at), 'PP') : 'N/A',
      Description: claim.description || '',
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 8 },  // ID
      { wch: 30 }, // Subject
      { wch: 15 }, // Type
      { wch: 25 }, // Student
      { wch: 15 }, // Registration Number
      { wch: 20 }, // Department
      { wch: 15 }, // Status
      { wch: 15 }, // Submitted
      { wch: 50 }, // Description
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Claims');

    // Generate file
    XLSX.writeFile(wb, `claims_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search claims..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={table.getColumn('status')?.getFilterValue() as string || 'All'}
            onValueChange={(value) => table.getColumn('status')?.setFilterValue(value === 'All' ? undefined : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {Object.values(ClaimStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={grouping[0] || 'student_name'}
            onValueChange={(value) => setGrouping(value === 'none' ? [] : [value])}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Grouping</SelectItem>
              <SelectItem value="status">Group by Status</SelectItem>
              <SelectItem value="claim_type">Group by Type</SelectItem>
              <SelectItem value="student_name">Group by Student</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isViewAllOpen} onOpenChange={setIsViewAllOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <List className="h-4 w-4 mr-2" />
                View All
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>All Claims ({claims.length})</DialogTitle>
                <DialogDescription>
                  Complete list of all student claims in the system
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-md border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.length > 0 ? (
                      claims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">#{claim.id}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{claim.subject}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{claim.claim_type}</Badge>
                          </TableCell>
                          <TableCell>
                            {claim.student_name || 
                              (claim.student?.user ? `${claim.student.user.first_name} ${claim.student.user.last_name}` : 'N/A')}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              claim.status === ClaimStatus.PENDING ? 'bg-yellow-500' :
                              claim.status === ClaimStatus.IN_REVIEW ? 'bg-blue-500' :
                              claim.status === ClaimStatus.RESOLVED ? 'bg-green-500' :
                              'bg-red-500'
                            } text-white`}>
                              {claim.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{claim.submitted_at ? format(new Date(claim.submitted_at), 'PP') : 'N/A'}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsViewAllOpen(false);
                                navigate(`/admin/claims/${claim.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No claims found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.getIsGrouped() ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={row.getToggleExpandedHandler()}
                            className="p-0 h-6 w-6"
                          >
                            {row.getIsExpanded() ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="font-semibold">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {row.subRows.length}
                          </Badge>
                        </div>
                      ) : cell.getIsAggregated() ? (
                        flexRender(
                          cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      ) : cell.getIsPlaceholder() ? null : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No claims found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {table.getRowModel().rows.length} of {claims.length} claims
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};