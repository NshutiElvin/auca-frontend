// src/pages/StudentDashboard.tsx
import React, { useState } from 'react';
import { ClaimCard } from '../components/ClaimCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useClaims, useClaimResponses } from '../hooks/useClaims';
import { Plus, AlertCircle, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClaimStatus } from '../lib/types';

export const StudentClaims: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: claims = [], isLoading } = useClaims();

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === ClaimStatus.PENDING).length,
    inReview: claims.filter(c => c.status === ClaimStatus.IN_REVIEW).length,
    resolved: claims.filter(c => c.status === ClaimStatus.RESOLVED).length,
    rejected: claims.filter(c => c.status === ClaimStatus.REJECTED).length,
  };

  const filteredClaims = statusFilter === 'all' 
    ? claims 
    : claims.filter(claim => claim.status === statusFilter);

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Claims</h1>
            <p className="text-gray-600">Track and manage your submitted claims</p>
          </div>
          <Button onClick={() => navigate('/student/claims/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Review</p>
                  <p className="text-2xl font-bold">{stats.inReview}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Claims</CardTitle>
                <CardDescription>Your submitted claims and their status</CardDescription>
              </div>
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value={ClaimStatus.PENDING}>Pending</TabsTrigger>
                  <TabsTrigger value={ClaimStatus.IN_REVIEW}>In Review</TabsTrigger>
                  <TabsTrigger value={ClaimStatus.RESOLVED}>Resolved</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {statusFilter === 'all' 
                  ? "You haven't submitted any claims yet."
                  : `No ${statusFilter} claims found.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClaims.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} variant="student" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};