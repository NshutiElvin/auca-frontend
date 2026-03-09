// src/pages/AdminClaimsPage.tsx
import React, { useState, useMemo } from 'react';
import { RefreshCw, ChevronDown, ChevronRight, Inbox, Clock, CheckCircle2, XCircle, User, Hash, Building2, FileText } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, differenceInHours } from 'date-fns';

// ── Helpers ────────────────────────────────────────────────────────────────

const NEW_THRESHOLD_HOURS = 24;

function isNew(submittedAt: string | null | undefined): boolean {
  if (!submittedAt) return false;
  return differenceInHours(new Date(), new Date(submittedAt)) < NEW_THRESHOLD_HOURS;
}

function timeAgo(submittedAt: string | null | undefined): string {
  if (!submittedAt) return '—';
  return formatDistanceToNow(new Date(submittedAt), { addSuffix: true });
}

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  [ClaimStatus.PENDING]: {
    label: 'Pending',
    icon: Inbox,
    dot: 'bg-yellow-500',
    order: 0,
  },
  [ClaimStatus.IN_REVIEW]: {
    label: 'In Review',
    icon: Clock,
    dot: 'bg-blue-500',
    order: 1,
  },
  [ClaimStatus.RESOLVED]: {
    label: 'Resolved',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
    order: 2,
  },
  [ClaimStatus.REJECTED]: {
    label: 'Rejected',
    icon: XCircle,
    dot: 'bg-red-500',
    order: 3,
  },
} as const;

// ── Claim row ──────────────────────────────────────────────────────────────

interface ClaimRowProps {
  claim: any;
  onUpdateStatus: (id: number, status: ClaimStatus) => void;
}

const ClaimRow: React.FC<ClaimRowProps> = ({ claim, onUpdateStatus }) => {
  const navigate = useNavigate();
  const fresh = isNew(claim.submitted_at);
  const cfg = STATUS_CONFIG[claim.status as ClaimStatus];

  const studentName =
    claim.student_name ||
    `${claim.student?.user?.first_name ?? ''} ${claim.student?.user?.last_name ?? ''}`.trim();

  return (
    <div
      onClick={() => navigate(`/claims/${claim.id}`)}
      className="group flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors border-b last:border-b-0"
    >
      {/* Status dot */}
      <div className="flex-shrink-0 mt-[7px]">
        <span className={`block h-1.5 w-1.5 rounded-full ${cfg?.dot ?? 'bg-muted-foreground'}`} />
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">
            {claim.subject}
          </span>
          {fresh && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-inset ring-primary/25 leading-none flex-shrink-0 uppercase tracking-wide">
              New
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[110px]">{studentName}</span>
          </span>
          {claim.student?.reg_no && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="h-3 w-3 flex-shrink-0" />
              {claim.student.reg_no}
            </span>
          )}
          {claim.student?.department?.name && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[100px]">{claim.student.department.name}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3 flex-shrink-0" />
            {claim.claim_type}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2 ml-2">
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
          {timeAgo(claim.submitted_at)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-[10px] text-muted-foreground hover:text-foreground border border-border rounded-full px-2 py-0.5 bg-background transition-all"
            >
              Move ▾
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel className="text-xs">Change Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.values(ClaimStatus)
              .filter((s) => s !== claim.status)
              .map((s) => (
                <DropdownMenuItem
                  key={s}
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(claim.id, s);
                  }}
                >
                  {STATUS_CONFIG[s]?.label ?? s}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// ── Group section ──────────────────────────────────────────────────────────

interface GroupSectionProps {
  status: ClaimStatus;
  claims: any[];
  onUpdateStatus: (id: number, status: ClaimStatus) => void;
  defaultOpen?: boolean;
}

const GroupSection: React.FC<GroupSectionProps> = ({
  status,
  claims,
  onUpdateStatus,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const newCount = claims.filter((c) => isNew(c.submitted_at)).length;

  if (claims.length === 0) return null;

  return (
    <div className="border-b last:border-b-0">
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 transition-colors text-left sticky top-0 bg-background z-10 border-b"
      >
        {open
          ? <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        }
        <span className={`block h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
        <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 leading-none tabular-nums">
          {claims.length}
        </span>
        {newCount > 0 && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 ring-1 ring-inset ring-primary/25 rounded-full px-2 py-0.5 leading-none uppercase tracking-wide">
            {newCount} new
          </span>
        )}
      </button>

      {open && (
        <div>
          {claims.map((claim) => (
            <ClaimRow key={claim.id} claim={claim} onUpdateStatus={onUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────

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

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const claim of claims) {
      if (!map[claim.status]) map[claim.status] = [];
      map[claim.status].push(claim);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        const aNew = isNew(a.submitted_at) ? 1 : 0;
        const bNew = isNew(b.submitted_at) ? 1 : 0;
        if (aNew !== bNew) return bNew - aNew;
        return (
          new Date(b.submitted_at ?? 0).getTime() -
          new Date(a.submitted_at ?? 0).getTime()
        );
      });
    }
    return map;
  }, [claims]);

  const stats = {
    total: claims.length,
    pending: (grouped[ClaimStatus.PENDING] ?? []).length,
    inReview: (grouped[ClaimStatus.IN_REVIEW] ?? []).length,
    resolved: (grouped[ClaimStatus.RESOLVED] ?? []).length,
  };

  const totalNew = claims.filter((c) => isNew(c.submitted_at)).length;

  const CHIP_FILTERS = [
    { label: 'All', value: '', count: stats.total },
    { label: 'Pending', value: ClaimStatus.PENDING, count: stats.pending },
    { label: 'In Review', value: ClaimStatus.IN_REVIEW, count: stats.inReview },
    { label: 'Resolved', value: ClaimStatus.RESOLVED, count: stats.resolved },
  ];

  const orderedStatuses = Object.values(ClaimStatus).sort(
    (a, b) => (STATUS_CONFIG[a]?.order ?? 99) - (STATUS_CONFIG[b]?.order ?? 99),
  );

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-0 bg-background border-b">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold text-foreground tracking-tight leading-none">
              Claims
            </h1>
            {totalNew > 0 && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 ring-1 ring-inset ring-primary/25 rounded-full px-2 py-1 leading-none uppercase tracking-wide">
                {totalNew} new
              </span>
            )}
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-3">
          {CHIP_FILTERS.map(({ label, value, count }) => {
            const active = statusFilter === value;
            return (
              <button
                key={label}
                onClick={() => setStatusFilter(value)}
                className={`
                  flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 border
                  ${active
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                  }
                `}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[10px] font-semibold leading-none tabular-nums ${active ? 'opacity-60' : ''}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted border-t-foreground" />
          </div>
        ) : claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Inbox className="h-8 w-8 text-muted-foreground mb-3 opacity-40" />
            <p className="text-sm font-medium text-foreground">No claims</p>
            <p className="text-xs text-muted-foreground mt-1">
              {statusFilter
                ? `No ${statusFilter.replace('_', ' ')} claims right now.`
                : 'Nothing submitted yet.'}
            </p>
          </div>
        ) : statusFilter ? (
          /* Flat list when a filter is active */
          <div>
            {claims.map((claim) => (
              <ClaimRow key={claim.id} claim={claim} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        ) : (
          /* Grouped by status by default */
          <div>
            {orderedStatuses.map((status) => (
              <GroupSection
                key={status}
                status={status}
                claims={grouped[status] ?? []}
                onUpdateStatus={handleUpdateStatus}
                defaultOpen={
                  status === ClaimStatus.PENDING ||
                  status === ClaimStatus.IN_REVIEW
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};