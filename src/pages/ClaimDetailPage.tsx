// src/pages/ClaimDetailPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
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
  FileText,
  Calendar,
  XCircle,
  CheckCircle,
  MapPin,
  Hash,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import useUser from "../hooks/useUser";
import { ResponseForm } from "../components/ResponseForm";
import { ResponsesList } from "../components/ResponsesList";
import useToast from "../hooks/useToast";
import { ClaimStatus } from "../lib/types";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { hasPermission } from "../hooks/hasPermission";
import { Permissions } from "../lib/permissions";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="mt-0.5 text-muted-foreground flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium leading-none mb-0.5">
        {label}
      </p>
      <p className="text-xs text-foreground font-medium truncate">{value}</p>
    </div>
  </div>
);

const STATUS_CONFIG: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    label: string;
  }
> = {
  pending: { variant: "secondary", label: "Pending" },
  in_review: { variant: "default", label: "In Review" },
  resolved: { variant: "outline", label: "Resolved" },
  rejected: { variant: "destructive", label: "Rejected" },
};

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUser();
  const [expanded, setExpanded] = useState(false);
  const { data: claim, isLoading } = useClaim(Number(id));
  const { data: responses = [], refetch: refetchResponses } = useClaimResponses(
    Number(id),
  );
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

  const handleAddResponse = async (data: {
    message: string;
    is_internal?: boolean;
  }) => {
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
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mt-5 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[claim.status] ?? {
    variant: "outline" as const,
    label: claim.status,
  };

  return (
    <>
      {!hasPermission(Permissions.VIEW_STUDENTCLAIM) &&
      user.role !== "admin" &&
      claim.student.user.id != user.user_id ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </div>
      ) : (
        <div className="h-[90vh] flex flex-col w-full overflow-hidden">
          {/* ── Collapsible header panel ── */}
          <div className="flex-shrink-0 border-b bg-background">
            {/* Top bar — always visible */}
            <div className="flex items-center gap-2 px-4 py-2 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <Separator orientation="vertical" className="h-4 flex-shrink-0" />
              <h1 className="text-sm font-semibold text-foreground truncate flex-1 min-w-0">
                {claim.subject}
              </h1>
              <Badge
                variant={statusCfg.variant}
                className="rounded-full px-2.5 py-0.5 text-xs flex-shrink-0"
              >
                {statusCfg.label}
              </Badge>

              {/* Inline meta — desktop */}
              <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                <Badge>
                  <User className="h-3 w-3" />
                  {claim.student_name ||
                    `${claim.student.user.first_name} ${claim.student.user.last_name}`}
                </Badge>
                <Badge>
                  <Hash className="h-3 w-3" />
                  {claim.student.reg_no}
                </Badge>
                <Badge>
                  <FileText className="h-3 w-3" />
                  {claim.claim_type}
                </Badge>
                <Badge>
                  <Building2 className="h-3 w-3" />
                  {claim.student.department.name}
                </Badge>
                <Badge>
                  <MapPin className="h-3 w-3" />
                  {claim.student.department.location.name}
                </Badge>
              </div>

              {/* Admin actions — desktop inline */}
              {isAdmin ||
                (hasPermission(Permissions.CHANGE_CLAIMRESPONSE) && (
                  <div className="hidden lg:flex items-center gap-1 flex-shrink-0 ml-1">
                    <button
                      onClick={() => handleUpdateStatus(ClaimStatus.IN_REVIEW)}
                    >
                      <Badge variant="default"  >
                        <Clock className="h-3 w-3" /> In Review
                      </Badge>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ClaimStatus.RESOLVED)}
                    >
                      <Badge><CheckCircle className="h-3 w-3" /> Resolve</Badge>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ClaimStatus.REJECTED)}
                    >
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3" /> Reject
                      </Badge>
                    </button>
                  </div>
                ))}

              {/* Expand toggle */}
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-1"
                aria-label={expanded ? "Collapse details" : "Expand details"}
              >
                <DotsHorizontalIcon />
              </button>
            </div>

            {/* Expandable details panel */}
            {expanded && (
              <div className="px-4 pb-3 border-t">
                <div className="pt-3 space-y-2">
                  {/* Description */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                      Description
                    </p>
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-20 overflow-y-auto">
                      {claim.description}
                    </p>
                  </div>
                  {/* Mobile info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:hidden gap-2 pt-1">
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
                      icon={<Calendar className="h-3.5 w-3.5" />}
                      label="Submitted"
                      value={
                        claim.submitted_at
                          ? format(new Date(claim.submitted_at), "PP")
                          : "—"
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile admin actions bar ── */}
          {(isAdmin || hasPermission(Permissions.CHANGE_CLAIMRESPONSE)) && (
            <div className="lg:hidden flex-shrink-0 border-b bg-background px-4 py-1.5">
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex-shrink-0">
                  Status:
                </span>
                <button
                  onClick={() => handleUpdateStatus(ClaimStatus.IN_REVIEW)}
                >
                  <Badge>
                    <Clock className="h-3 w-3" /> In Review
                  </Badge>
                </button>
                <button
                  onClick={() => handleUpdateStatus(ClaimStatus.RESOLVED)}
                >
                  <Badge>
                    <CheckCircle className="h-3 w-3" /> Resolve
                  </Badge>
                </button>
                <button
                  onClick={() => handleUpdateStatus(ClaimStatus.REJECTED)}
                >
                  <Badge variant={"destructive"}>
                    <XCircle className="h-3 w-3" /> Reject
                  </Badge>
                </button>
              </div>
            </div>
          )}

          {/* ── Scrollable responses area — gets all remaining space ── */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Responses
                </h2>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {responses.length}
                </span>
              </div>
              <ResponsesList
                responses={responses}
                isAdmin={
                  isAdmin || hasPermission(Permissions.ADD_CLAIMRESPONSE)
                }
              />
            </div>
          </div>

          {/* ── Response form — pinned to bottom ── */}
          <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
            <div className="w-full px-4 py-3">
              <ResponseForm
                onSubmit={handleAddResponse}
                isLoading={addResponse.isPending}
                isAdmin={
                  isAdmin || hasPermission(Permissions.ADD_CLAIMRESPONSE)
                }
                isDisabled={isClosed}
              />
              {isClosed && (
                <p className="text-xs text-center text-muted-foreground mt-1.5">
                  This claim is {claim.status.replace("_", " ")} — responses are
                  disabled.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
