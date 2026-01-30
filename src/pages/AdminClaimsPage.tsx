// src/pages/AdminClaimsPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, Filter, RefreshCw } from 'lucide-react';
import { useClaims, useUpdateClaim } from '../hooks/useClaims';
 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { ClaimStatus } from '../lib/types';
import { AdminClaimsTable } from '../components/AdminClaimsTable';

export const AdminClaimsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: claims = [], isLoading, refetch } = useClaims({
    status: statusFilter as ClaimStatus,
  });
  const updateClaim = useUpdateClaim();

  const handleUpdateStatus = async (id: number, status: ClaimStatus) => {
    try {
      await updateClaim.mutateAsync({ id, status });
    } catch (error) {
      console.error('Failed to update claim status:', error);
    }
  };

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === ClaimStatus.PENDING).length,
    inReview: claims.filter(c => c.status === ClaimStatus.IN_REVIEW).length,
    resolved: claims.filter(c => c.status === ClaimStatus.RESOLVED).length,
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Claims Management</h1>
            <p className="text-gray-600">Manage and review all student claims</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('')}>
                  All Claims
                </DropdownMenuItem>
                {Object.values(ClaimStatus).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Claims</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.inReview}</p>
                <p className="text-sm text-gray-600">In Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Claims</CardTitle>
            <CardDescription>
              Review, update, and manage student claims
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminClaimsTable
              claims={claims}
              onUpdateStatus={handleUpdateStatus}
              isLoading={isLoading || updateClaim.isPending}
            />
          </CardContent>
        </Card>
      </div>
  );
};