// src/pages/StudentDashboard.tsx
import React, { useState, useMemo } from "react";
import { ClaimCard } from "../components/ClaimCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useClaims } from "../hooks/useClaims";
import {
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ClaimStatus } from "../lib/types";
import { hasPermission } from "../hooks/hasPermission";
import { Permissions } from "../lib/permissions";
import useUser from "../hooks/useUser";
import { Badge } from "../components/ui/badge";

const PAGE_SIZE = 9;

export const StudentClaims: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data: claims = [], isLoading } = useClaims();
  const user = useUser();

  const stats = {
    total: claims.length,
    pending: claims.filter((c) => c.status === ClaimStatus.PENDING).length,
    inReview: claims.filter((c) => c.status === ClaimStatus.IN_REVIEW).length,
    resolved: claims.filter((c) => c.status === ClaimStatus.RESOLVED).length,
    rejected: claims.filter((c) => c.status === ClaimStatus.REJECTED).length,
  };

  // Reset to page 1 whenever filters change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredClaims = useMemo(() => {
    let result = statusFilter === "all"
      ? claims
      : claims.filter((claim) => claim.status === statusFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (claim) =>
          claim.claim_type?.toLowerCase().includes(q) ||
          claim.description?.toLowerCase().includes(q) ||
          claim.subject?.toLowerCase().includes(q) ||
          claim.student?.user?.first_name?.toLowerCase().includes(q) ||
          claim.student?.user?.last_name?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [claims, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / PAGE_SIZE));
  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Claims</h1>
          <p className="text-gray-600">
            Track and manage your submitted claims
          </p>
        </div>
        <Button onClick={() => navigate("/student/claims/new")}>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>
                Your submitted claims and their status
              </CardDescription>
            </div>
            <Tabs value={statusFilter} onValueChange={handleStatusChange}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value={ClaimStatus.PENDING}>Pending</TabsTrigger>
                <TabsTrigger value={ClaimStatus.IN_REVIEW}>In Review</TabsTrigger>
                <TabsTrigger value={ClaimStatus.RESOLVED}>Resolved</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by type, subject, description or name..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : paginatedClaims.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery
                ? `No claims match "${searchQuery}".`
                : statusFilter === "all"
                ? "You haven't submitted any claims yet."
                : `No ${statusFilter} claims found.`}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedClaims.map((claim) => (
                  <div key={claim.id} className="flex flex-col px-1">
                    {hasPermission(Permissions.VIEW_STUDENTCLAIM) && (
                      <Badge variant="default" className="relative top-2 right-2">
                        {claim.student.user.id == user.user_id
                          ? "Mine"
                          : claim.student.user.first_name +
                            " " +
                            claim.student.user.last_name}
                      </Badge>
                    )}
                    <ClaimCard claim={claim} variant="student" />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * PAGE_SIZE + 1}–
                      {Math.min(currentPage * PAGE_SIZE, filteredClaims.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredClaims.length}</span>{" "}
                    claims
                  </p>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                        if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                          acc.push("...");
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                            …
                          </span>
                        ) : (
                          <Button
                            key={item}
                            variant={currentPage === item ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCurrentPage(item as number)}
                          >
                            {item}
                          </Button>
                        )
                      )}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};