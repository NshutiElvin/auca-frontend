// src/pages/AdminClaimsPage.tsx
import React, { useState, useMemo } from "react";
import {
  RefreshCw,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutList,
} from "lucide-react";
import { useClaims, useUpdateClaim } from "../hooks/useClaims";
import { ClaimStatus } from "../lib/types";
import { AdminClaimsTable } from "../components/AdminClaimsTable";
import { differenceInHours } from "date-fns";
import { hasPermission } from "../hooks/hasPermission";
import { Permissions } from "../lib/permissions";
import useUser from "../hooks/useUser";
``;
// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const NEW_THRESHOLD_HOURS = 24;

function isNew(submittedAt?: string | null): boolean {
  if (!submittedAt) return false;
  return (
    differenceInHours(new Date(), new Date(submittedAt)) < NEW_THRESHOLD_HOURS
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status pill config
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_PILLS = [
  {
    value: "" as const,
    label: "All",
    icon: LayoutList,
    dot: null,
  },
  {
    value: ClaimStatus.PENDING,
    label: "Pending",
    icon: Inbox,
    dot: "bg-yellow-500",
  },
  {
    value: ClaimStatus.IN_REVIEW,
    label: "In Review",
    icon: Clock,
    dot: "bg-blue-500",
  },
  {
    value: ClaimStatus.RESOLVED,
    label: "Resolved",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
  },
  {
    value: ClaimStatus.REJECTED,
    label: "Rejected",
    icon: XCircle,
    dot: "bg-red-500",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export const AdminClaimsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const user = useUser();
  // Always fetch all claims for accurate pill counts
  const { data: allClaims = [], refetch: refetchAll } = useClaims({});

  // Fetch filtered subset passed to the table
  const {
    data: filteredClaims = [],
    isLoading,
    refetch: refetchFiltered,
  } = useClaims({
    status: statusFilter as ClaimStatus,
  });

  const updateClaim = useUpdateClaim();

  const handleUpdateStatus = async (id: number, status: ClaimStatus) => {
    try {
      await updateClaim.mutateAsync({ id, status });
    } catch (error) {
      console.error("Failed to update claim status:", error);
    }
  };

  const handleRefresh = () => {
    refetchAll();
    refetchFiltered();
  };

  // Counts per status from full list
  const counts = useMemo(() => {
    const map: Record<string, number> = { "": allClaims.length };
    for (const c of allClaims) {
      map[c.status] = (map[c.status] ?? 0) + 1;
    }
    return map;
  }, [allClaims]);

  // "New" badge: claims submitted in last 24h
  const newPerStatus = useMemo(() => {
    const map: Record<string, number> = { "": 0 };
    for (const c of allClaims) {
      if (isNew(c.submitted_at)) {
        map[""] = (map[""] ?? 0) + 1;
        map[c.status] = (map[c.status] ?? 0) + 1;
      }
    }
    return map;
  }, [allClaims]);
  console.log(hasPermission(Permissions.VIEW_STUDENTCLAIM))
  console.log(user.role)
console.log((!hasPermission(Permissions.VIEW_STUDENTCLAIM) || user.role !== "admin") ? "No permission" : "Has permission");

  return (
    <>
      {(!hasPermission(Permissions.VIEW_STUDENTCLAIM) || user.role !== "admin") ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0">
          {/* ── Status pills — very top ─────────────────────────────────────── */}
          <div className="flex-shrink-0 border-b bg-background px-4 pt-4 pb-3">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-foreground tracking-tight leading-none">
                  Claims
                </h1>
                {(newPerStatus[""] ?? 0) > 0 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 ring-1 ring-inset ring-primary/25 rounded-full px-2 py-0.5 leading-none uppercase tracking-wide">
                    {newPerStatus[""]} new
                  </span>
                )}
              </div>
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {STATUS_PILLS.map(({ value, label, icon: Icon, dot }) => {
                const active = statusFilter === value;
                const count = counts[value] ?? 0;
                const newCount = newPerStatus[value] ?? 0;

                return (
                  <button
                    key={label}
                    onClick={() => setStatusFilter(value)}
                    className={`
                  relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
                  whitespace-nowrap flex-shrink-0 transition-all
                  ${
                    active
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
                  >
                    {/* Colored dot for status pills */}
                    {dot && (
                      <span
                        className={`block h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot}`}
                      />
                    )}

                    {label}

                    {/* Count badge */}
                    {count > 0 && (
                      <span
                        className={`tabular-nums text-[10px] font-semibold leading-none ${active ? "opacity-60" : ""}`}
                      >
                        {count}
                      </span>
                    )}

                    {/* "New" indicator dot on pending (when not active) */}
                    {value === ClaimStatus.PENDING &&
                      newCount > 0 &&
                      !active && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                      )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Table area ─────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-auto p-4 min-h-0">
            <AdminClaimsTable
              claims={filteredClaims}
              onUpdateStatus={handleUpdateStatus}
              isLoading={isLoading || updateClaim.isPending}
            />
          </div>
        </div>
      )}
    </>
  );
};
