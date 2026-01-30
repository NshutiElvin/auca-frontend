// src/pages/ClaimDetailPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  useClaim,
  useAddResponse,
  useClaimResponses,
  useUpdateClaim,
} from "../hooks/useClaims";
import {
  ArrowLeft,
  Clock,
  User,
  FileText,
  Calendar,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { format, set } from "date-fns";
import useUser from "../hooks/useUser";

import { ResponseForm } from "../components/ResponseForm";
import { ResponsesList } from "../components/ResponsesList";
import useToast from "../hooks/useToast";
import { ClaimStatus } from "../lib/types";

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUser();
  const { data: claim, isLoading } = useClaim(Number(id));
  const { data: responses = [], refetch: refetchResponses } = useClaimResponses(Number(id));
  const{setToastMessage}= useToast()
  const addResponse = useAddResponse();
    const updateClaimStatus= useUpdateClaim();
    const handleUpdateStatus = (status: ClaimStatus) => {
      if (!id) return;
      updateClaimStatus.mutateAsync({ id: Number(id), status });
    }

  const statusColors = {
    pending: "bg-yellow-500",
    in_review: "bg-blue-500",
    resolved: "bg-green-500",
    rejected: "bg-red-500",
  };

  const handleAddResponse = async (data: {
    message: string;
    is_internal?: boolean;
  }) => {
    if (!id) return;
    await addResponse.mutateAsync({
      claimId: Number(id),
      ...data,
    });
      await refetchResponses();

  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Claim not found</h2>
        <p className="text-gray-600 mt-2">
          The claim you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Claim Details</h1>
        <Badge className={`${statusColors[claim.status]} text-white`}>
          {claim.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Claim Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{claim.subject}</CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {claim.claim_type}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {claim.submitted_at &&
                    format(new Date(claim.submitted_at), "PP")}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {claim.description}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Claim Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Claim Type</p>
                    <p className="font-medium">{claim.claim_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium capitalize">
                      {claim.status.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    {" "}
                    <p className="text-xs text-gray-500">Student Names</p>
                    <p className="font-medium">
                      {claim.student_name ||
                        `${claim.student.user.first_name} ${claim.student.user.last_name}`}
                    </p>
                  </div>
                  <div>
                    {" "}
                    <p className="text-xs text-gray-500">Reg Number</p>
                    <p className="font-medium">{claim.student.reg_no}</p>
                  </div>

                     <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">
                      {claim.student.department.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Campus</p>
                    <p className="font-medium">
                      {claim.student.department.location.name}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responses Section */}
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">
              Responses ({responses.length})
            </h2>
            <ResponsesList
              responses={responses}
              isAdmin={user.role === "admin"}
            />
          </div>
        </div>

        {/* Right Column - Add Response & Actions */}
        <div className="space-y-6">
          <ResponseForm
            onSubmit={handleAddResponse}
            isLoading={addResponse.isPending}
            isAdmin={user?.role === "admin"}
          />

          {user?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={()=>handleUpdateStatus(ClaimStatus.IN_REVIEW)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as In Review
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={()=>handleUpdateStatus(ClaimStatus.RESOLVED)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={()=>handleUpdateStatus(ClaimStatus.REJECTED)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Rejected
                </Button>
                
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
