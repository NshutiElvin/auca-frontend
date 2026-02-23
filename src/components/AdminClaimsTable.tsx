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
  const [grouping, setGrouping] = useState<GroupingState>([]); // Fixed: Changed from ['student_name'] to empty array
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const navigate = useNavigate();

  // Fixed: Helper function to get student name consistently
  const getStudentName = (claim: StudentClaim): string => {
    return claim.student_name || 
      (claim.student?.user ? `${claim.student.user.first_name} ${claim.student.user.last_name}` : 'Unknown Student');
  };

  const columns: ColumnDef<StudentClaim>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div className="font-medium">#{row.getValue('id')}</div>,
      // Fixed: Added aggregation for grouped rows
      aggregationFn: 'count',
      aggregatedCell: () => <span>Count</span>,
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue('subject')}>
          {row.getValue('subject')}
        </div>
      ),
      // Fixed: Added aggregation for grouped rows
      aggregationFn: (columnId, leafRows) => {
        return `${leafRows.length} subjects`;
      },
      aggregatedCell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-muted-foreground">{value}</span>;
      },
    },
    {
      accessorKey: 'claim_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue('claim_type')}
        </Badge>
      ),
      // Fixed: Proper aggregation for claim_type
      aggregationFn: (columnId, leafRows) => {
        const types = leafRows.map(row => row.getValue(columnId));
        const uniqueTypes = [...new Set(types)];
        return uniqueTypes.join(', ');
      },
      aggregatedCell: ({ getValue }) => {
        const value = getValue() as string;
        return <Badge variant="secondary">{value}</Badge>;
      },
    },
    {
      // Fixed: Using accessorFn for computed student name
      id: 'student_name',
      accessorFn: (row) => getStudentName(row),
      header: 'Student',
      cell: ({ getValue }) => {
        const studentName = getValue() as string;
        return <div className="font-medium">{studentName}</div>;
      },
      // Fixed: Added aggregation for grouped rows
      aggregationFn: 'count',
      aggregatedCell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{row.groupingValue as string}</span>
            <Badge variant="secondary">{row.subRows.length}</Badge>
          </div>
        );
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
          <Badge className={`${colors[status]} text-white hover:${colors[status]}`}>
            {status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        );
      },
      // Fixed: Proper aggregation for status
      aggregationFn: (columnId, leafRows) => {
        const statuses = leafRows.map(row => row.getValue(columnId));
        const uniqueStatuses = [...new Set(statuses)];
        if (uniqueStatuses.length === 1) return uniqueStatuses[0];
        return 'mixed';
      },
      aggregatedCell: ({ getValue }) => {
        const status = getValue() as string;
        if (status === 'mixed') {
          return <Badge variant="secondary">Mixed Status</Badge>;
        }
        const colors = {
          [ClaimStatus.PENDING]: 'bg-yellow-500',
          [ClaimStatus.IN_REVIEW]: 'bg-blue-500',
          [ClaimStatus.RESOLVED]: 'bg-green-500',
          [ClaimStatus.REJECTED]: 'bg-red-500',
        };
        return (
          <Badge className={`${colors[status as ClaimStatus]} text-white`}>
            {status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted',
      cell: ({ row }) => {
        const date = row.getValue('submitted_at');
        return date ? format(new Date(date as string), 'PP') : 'N/A';
      },
      // Fixed: Added aggregation for dates
      aggregationFn: (columnId, leafRows) => {
        const dates = leafRows.map(row => row.getValue(columnId)).filter(Boolean);
        if (dates.length === 0) return 'No dates';
        const latestDate = new Date(Math.max(...dates.map(d => new Date(d as string).getTime())));
        return `Latest: ${format(latestDate, 'PP')}`;
      },
      aggregatedCell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-muted-foreground">{value}</span>;
      },
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
      // Fixed: Added aggregation for actions column (returns null for grouped rows)
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
    // Fixed: Added default column settings
    defaultColumn: {
      aggregationFn: 'count', // Default aggregation function
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      grouping,
      expanded,
    },
  });

  const exportToExcel = () => {
    // Fixed: Use consistent student name function
    const exportData = claims.map(claim => ({
      ID: claim.id,
      Subject: claim.subject,
      Type: claim.claim_type,
      Student: getStudentName(claim),
      'Registration Number': claim.student?.reg_no || 'N/A',
      Department: claim.student?.department?.name || 'N/A',
      Status: claim.status.replace(/_/g, ' ').toUpperCase(),
      Submitted: claim.submitted_at ? format(new Date(claim.submitted_at), 'PP') : 'N/A',
      Description: claim.description || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
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

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Claims');
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
        <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
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
            value={table.getColumn('status')?.getFilterValue() as string || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                table.getColumn('status')?.setFilterValue(undefined);
              } else {
                table.getColumn('status')?.setFilterValue(value);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(ClaimStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={grouping.length > 0 ? grouping[0] : 'none'}
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
                          <TableCell className="max-w-[200px] truncate" title={claim.subject}>
                            {claim.subject}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{claim.claim_type}</Badge>
                          </TableCell>
                          <TableCell>
                            {getStudentName(claim)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              claim.status === ClaimStatus.PENDING ? 'bg-yellow-500' :
                              claim.status === ClaimStatus.IN_REVIEW ? 'bg-blue-500' :
                              claim.status === ClaimStatus.RESOLVED ? 'bg-green-500' :
                              'bg-red-500'
                            } text-white`}>
                              {claim.status.replace(/_/g, ' ').toUpperCase()}
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
                <TableRow 
                  key={row.id}
                  className={row.getIsGrouped() ? 'bg-muted/50' : ''}
                >
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
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
          {grouping.length > 0 && ` (grouped by ${grouping[0].replace('_', ' ')})`}
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