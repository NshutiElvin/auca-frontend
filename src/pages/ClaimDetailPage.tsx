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
  ArrowLeft, Clock, FileText, Calendar,
  XCircle, CheckCircle, MapPin, Hash, User, Building2,
} from "lucide-react";
import { format } from "date-fns";
import useUser from "../hooks/useUser";
import { ResponseForm } from "../components/ResponseForm";
import { ResponsesList } from "../components/ResponsesList";
import useToast from "../hooks/useToast";
import { ClaimStatus } from "../lib/types";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="mt-0.5 text-muted-foreground flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium leading-none mb-0.5">
        {label}
      </p>
      <p className="text-sm text-foreground font-medium truncate">{value}</p>
    </div>
  </div>
);

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending:   { variant: "secondary",   label: "Pending"   },
  in_review: { variant: "default",     label: "In Review" },
  resolved:  { variant: "outline",     label: "Resolved"  },
  rejected:  { variant: "destructive", label: "Rejected"  },
};

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
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold text-foreground">Claim not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          This claim may have been removed or doesn't exist.
        </p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-5 gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[claim.status] ?? { variant: "outline" as const, label: claim.status };

  return (
    // Outer shell: fill entire viewport height, no overflow
    <div className="h-[94vh] flex flex-col w-full overflow-hidden">

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">

          {/* Inline page header (replaces the fixed header) */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-xl font-bold text-foreground flex-1 truncate">
              {claim.subject}
            </h1>
            <Badge variant={statusCfg.variant} className="rounded-full px-3">
              {statusCfg.label}
            </Badge>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Left / main column ── */}
            <div className="lg:col-span-2 space-y-5">
              <Card>
                <CardContent className="pt-5 space-y-5">
                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                      <FileText className="h-3.5 w-3.5" />
                      {claim.claim_type}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {claim.submitted_at && format(new Date(claim.submitted_at), "PP")}
                    </span>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">
                      Description
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {claim.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Student"
                      value={claim.student_name || `${claim.student.user.first_name} ${claim.student.user.last_name}`} />
                    <InfoRow icon={<Hash className="h-3.5 w-3.5" />} label="Reg Number" value={claim.student.reg_no} />
                    <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="Claim Type" value={claim.claim_type} />
                    <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Department" value={claim.student.department.name} />
                    <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Campus" value={claim.student.department.location.name} />
                    <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Status"
                      value={<span className="capitalize">{claim.status.replace("_", " ")}</span>} />
                  </div>
                </CardContent>
              </Card>

              {/* Responses list */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-foreground">Responses</h2>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {responses.length}
                  </span>
                </div>
                <ResponsesList responses={responses} isAdmin={isAdmin} />
              </div>
            </div>

            {/* ── Right / sidebar column (desktop only) ── */}
            <div className="hidden lg:block space-y-4">
              {isAdmin && (
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Update Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-4 space-y-1">
                    <button
                      onClick={() => handleUpdateStatus(ClaimStatus.IN_REVIEW)}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Mark as In Review
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ClaimStatus.RESOLVED)}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    >
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ClaimStatus.REJECTED)}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <XCircle className="h-4 w-4 text-destructive" />
                      Mark as Rejected
                    </button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile status actions ── */}
      {isAdmin && (
        <div className="lg:hidden flex-shrink-0 border-t bg-background px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleUpdateStatus(ClaimStatus.IN_REVIEW)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs bg-accent text-accent-foreground whitespace-nowrap"
            >
              <Clock className="h-3.5 w-3.5" />
              In Review
            </button>
            <button
              onClick={() => handleUpdateStatus(ClaimStatus.RESOLVED)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs bg-accent text-accent-foreground whitespace-nowrap"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Resolved
            </button>
            <button
              onClick={() => handleUpdateStatus(ClaimStatus.REJECTED)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs bg-destructive/10 text-destructive whitespace-nowrap"
            >
              <XCircle className="h-3.5 w-3.5" />
              Rejected
            </button>
          </div>
        </div>
      )}

      {/* ── Response form — always pinned to bottom ── */}
      <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
        <div className="w-full px-4 py-4">
          <ResponseForm
            onSubmit={handleAddResponse}
            isLoading={addResponse.isPending}
            isAdmin={isAdmin}
            isDisabled={isClosed}
          />
          {isClosed && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              This claim is {claim.status.replace("_", " ")} — responses are disabled.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};