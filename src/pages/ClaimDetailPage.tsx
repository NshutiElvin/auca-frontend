// src/pages/ClaimDetailPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
  MapPin,
  Hash,
  GraduationCap,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import useUser from "../hooks/useUser";
import { ResponseForm } from "../components/ResponseForm";
import { ResponsesList } from "../components/ResponsesList";
import useToast from "../hooks/useToast";
import { ClaimStatus } from "../lib/types";
import { cn } from "../lib/utils";

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending:   { color: "bg-amber-100 text-amber-700 border-amber-200",  label: "Pending"    },
  in_review: { color: "bg-blue-100 text-blue-700 border-blue-200",    label: "In Review"  },
  resolved:  { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Resolved" },
  rejected:  { color: "bg-red-100 text-red-700 border-red-200",       label: "Rejected"   },
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="mt-0.5 text-gray-400 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium leading-none mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
    </div>
  </div>
);

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUser();
  const { data: claim, isLoading } = useClaim(Number(id));
  const { data: responses = [], refetch: refetchResponses } = useClaimResponses(Number(id));
  const { setToastMessage } = useToast();
  const addResponse = useAddResponse();
  const updateClaimStatus = useUpdateClaim();

  const isAdmin = user?.role === "admin";
  const isClosed =
    claim?.status === ClaimStatus.RESOLVED ||
    claim?.status === ClaimStatus.REJECTED;

  const handleUpdateStatus = (status: ClaimStatus) => {
    if (!id) return;
    updateClaimStatus.mutateAsync({ id: Number(id), status });
  };

  const handleAddResponse = async (data: { message: string; is_internal?: boolean }) => {
    if (!id) return;
    await addResponse.mutateAsync({ claimId: Number(id), ...data });
    await refetchResponses();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-gray-700" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold text-gray-700">Claim not found</p>
        <p className="text-sm text-gray-400 mt-1">This claim may have been removed or doesn't exist.</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-5 gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[claim.status] ?? { color: "bg-gray-100 text-gray-600 border-gray-200", label: claim.status };

  return (
    <div className="max-w-6xl mx-auto space-y-5 px-1">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Separator orientation="vertical" className="h-5" />

        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">
          {claim.subject}
        </h1>

        <Badge
          variant="outline"
          className={cn("text-xs font-semibold px-3 py-1 rounded-full border", statusCfg.color)}
        >
          {statusCfg.label}
        </Badge>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: claim info + responses ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Claim card */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-5 space-y-5">

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                  <FileText className="h-3.5 w-3.5" />
                  {claim.claim_type}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {claim.submitted_at && format(new Date(claim.submitted_at), "PP")}
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-1.5">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {claim.description}
                </p>
              </div>

              <Separator />

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoRow
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Student"
                  value={
                    claim.student_name ||
                    `${claim.student.user.first_name} ${claim.student.user.last_name}`
                  }
                />
                <InfoRow
                  icon={<Hash className="h-3.5 w-3.5" />}
                  label="Reg Number"
                  value={claim.student.reg_no}
                />
                <InfoRow
                  icon={<FileText className="h-3.5 w-3.5" />}
                  label="Claim Type"
                  value={claim.claim_type}
                />
                <InfoRow
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  label="Department"
                  value={claim.student.department.name}
                />
                <InfoRow
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Campus"
                  value={claim.student.department.location.name}
                />
                <InfoRow
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Status"
                  value={<span className="capitalize">{claim.status.replace("_", " ")}</span>}
                />
              </div>
            </CardContent>
          </Card>

          {/* Responses */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Responses</h2>
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {responses.length}
              </span>
            </div>
            <ResponsesList
              responses={responses}
              isAdmin={isAdmin}
            />
          </div>
        </div>

        {/* ── Right: reply + admin actions ── */}
        <div className="space-y-4">

          {/* Response form */}
          <ResponseForm
            onSubmit={handleAddResponse}
            isLoading={addResponse.isPending}
            isAdmin={isAdmin}
            isDisabled={isClosed}
          />

          {isClosed && (
            <p className="text-xs text-center text-gray-400">
              This claim is {claim.status} — responses are disabled.
            </p>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Update Status
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4 space-y-1.5">
                <button
                  onClick={() => handleUpdateStatus(ClaimStatus.IN_REVIEW)}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                >
                  <Clock className="h-4 w-4 text-blue-400" />
                  Mark as In Review
                </button>
                <button
                  onClick={() => handleUpdateStatus(ClaimStatus.RESOLVED)}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Mark as Resolved
                </button>
                <button
                  onClick={() => handleUpdateStatus(ClaimStatus.REJECTED)}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                >
                  <XCircle className="h-4 w-4 text-red-400" />
                  Mark as Rejected
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};