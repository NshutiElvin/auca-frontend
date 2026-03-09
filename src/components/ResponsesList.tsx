// src/components/claims/ResponsesList.tsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { ClaimResponse } from '../lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  MessageSquare,
  Calendar,
  TrendingUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import useUser from '../hooks/useUser';

interface ResponsesListProps {
  responses: ClaimResponse[];
  isAdmin?: boolean;
  onResponseClick?: (response: ClaimResponse) => void;
  highlightKeywords?: string[];
  autoScroll?: boolean;
}

type SortOption = 'oldest' | 'newest' | 'role';
type FilterOption = 'all' | 'internal' | 'external';

export const ResponsesList: React.FC<ResponsesListProps> = ({
  responses,
  isAdmin = false,
  onResponseClick,
  highlightKeywords = [],
  autoScroll = true,
}) => {
  const currentUser = useUser();

  const [sortBy, setSortBy] = useState<SortOption>('oldest'); // chat default: oldest first
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedResponses, setExpandedResponses] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Derived list ────────────────────────────────────────────────
  const visibleResponses = useMemo(() => {
    let filtered = isAdmin
      ? responses
      : responses.filter((r) => !r.is_internal);

    if (filterBy === 'internal') filtered = filtered.filter((r) => r.is_internal);
    else if (filterBy === 'external') filtered = filtered.filter((r) => !r.is_internal);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.response_text?.toLowerCase().includes(q) ||
          r.message?.toLowerCase().includes(q) ||
          r.responder_name?.toLowerCase().includes(q) ||
          r.responder?.first_name?.toLowerCase().includes(q) ||
          r.responder?.last_name?.toLowerCase().includes(q),
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest')
        return new Date(b.responded_at || 0).getTime() - new Date(a.responded_at || 0).getTime();
      if (sortBy === 'oldest')
        return new Date(a.responded_at || 0).getTime() - new Date(b.responded_at || 0).getTime();
      return (a.responder?.role || '').localeCompare(b.responder?.role || '');
    });
  }, [responses, isAdmin, filterBy, searchQuery, sortBy]);

  // ── Scroll helpers ───────────────────────────────────────────────
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(nearBottom);
    setShowScrollButton(!nearBottom);
  }, []);

  // Scroll to bottom on mount and when new messages arrive (only if already at bottom)
  useEffect(() => {
    scrollToBottom('auto');
  }, []); // on mount

  useEffect(() => {
    if (!autoScroll) return;
    if (isAtBottom) scrollToBottom('smooth');
    else setShowScrollButton(true);
  }, [visibleResponses.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stats ────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: responses.length,
      internal: responses.filter((r) => r.is_internal).length,
      external: responses.filter((r) => !r.is_internal).length,
    }),
    [responses],
  );

  // ── Helpers ──────────────────────────────────────────────────────
  const toggleExpanded = (id: number) => {
    setExpandedResponses((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const highlightText = (text: string) => {
    const keywords = [...highlightKeywords, searchQuery].filter(Boolean);
    if (!keywords.length) return text;
    let html = text;
    keywords.forEach((kw) => {
      html = html.replace(
        new RegExp(`(${kw})`, 'gi'),
        '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>',
      );
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const getRoleBadgeColor = (role: string) => {
    const map: Record<string, string> = {
      admin: 'bg-red-100 text-red-800 border-red-300',
      manager: 'bg-blue-100 text-blue-800 border-blue-300',
      supervisor: 'bg-purple-100 text-purple-800 border-purple-300',
      employee: 'bg-green-100 text-green-800 border-green-300',
    };
    return map[role.toLowerCase()] || 'bg-muted text-muted-foreground border-border';
  };

  // Determine if a response is "mine" (sent by the currently logged-in user)
  const isMine = (response: ClaimResponse) => {
    if (!currentUser) return false;
    return (
      response.responder?.id == currentUser.user_id  
    );
  };

  // ── Empty state ──────────────────────────────────────────────────
  if (visibleResponses.length === 0 && !searchQuery && filterBy === 'all') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground w-full">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <MessageSquare className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <p className="font-medium text-foreground/60">No responses yet</p>
        <p className="text-sm text-muted-foreground">Be the first to respond to this claim!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Responses
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5">
              {visibleResponses.length}
            </span>
          </h3>

          {isAdmin && (
            <div className="flex gap-1.5">
              <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {stats.total}
              </Badge>
              <Badge variant="outline" className="text-[11px] border-indigo-300 text-indigo-600">
                {stats.internal} Internal
              </Badge>
              <Badge variant="outline" className="text-[11px] border-emerald-300 text-emerald-600">
                {stats.external} External
              </Badge>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Filter className="h-3.5 w-3.5" />
          {showFilters ? 'Hide' : 'Filter'}
        </Button>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-muted/50 p-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search responses…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm bg-background"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Sort
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full h-8 px-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="oldest">Oldest First</option>
                <option value="newest">Newest First</option>
                <option value="role">By Role</option>
              </select>
            </div>

            {isAdmin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Filter
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="w-full h-8 px-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Responses</option>
                  <option value="internal">Internal Only</option>
                  <option value="external">External Only</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Empty filtered state ── */}
      {visibleResponses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground w-full">
          <Search className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground/60">No responses match your filters</p>
          <p className="text-xs">Try adjusting your search or filters</p>
        </div>
      ) : (
        /* ── Chat thread ── */
        <div className="relative w-full">
          {/* Scrollable message container — plain div, no ScrollArea wrapper */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex flex-col gap-4 overflow-y-auto  whitespace-nowrap scrollbar-hide max-h-[55vh] w-full py-3 px-1"
          >
            {visibleResponses.map((response) => {
              const mine = isMine(response);
              const isExpanded = expandedResponses.has(response.id);
              const responseText = response?.response_text || response?.message || '';
              const shouldTruncate = responseText.length > 200;
              const displayText =
                isExpanded || !shouldTruncate ? responseText : responseText.slice(0, 200) + '…';

              const firstName = response.responder?.first_name || '';
              const lastName = response.responder?.last_name || 'Unknown';
              const fullName = `${firstName} ${lastName}`.trim();
              const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
              const role = response.responder?.role || 'user';

              return (
                <div
                  key={response.id}
                  className={cn(
                    'flex gap-2.5 items-end w-full animate-in fade-in slide-in-from-bottom-1 duration-200',
                    mine ? 'flex-row-reverse' : 'flex-row',
                    onResponseClick && 'cursor-pointer',
                  )}
                  onClick={() => onResponseClick?.(response)}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mb-1">
                    <Avatar className="h-7 w-7 ring-2 ring-background shadow-sm">
                      <AvatarImage src={response.responder?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-[10px] font-bold">
                        {initials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Bubble + meta */}
                  <div
                    className={cn(
                      'flex flex-col gap-1 max-w-[75%]',
                      mine ? 'items-end' : 'items-start',
                    )}
                  >
                    {/* Name + badges */}
                    <div
                      className={cn(
                        'flex items-center gap-1.5 flex-wrap',
                        mine ? 'flex-row-reverse' : 'flex-row',
                      )}
                    >
                      <span className="text-[11px] font-semibold text-foreground/70">
                        {mine ? 'You' : fullName || 'Unknown'}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-medium py-0 px-1.5 h-4', getRoleBadgeColor(role))}
                      >
                        {role}
                      </Badge>
                      {response.is_internal && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 h-4 border-indigo-300 text-indigo-600 bg-indigo-50"
                        >
                          <Shield className="h-2.5 w-2.5 mr-0.5" />
                          Internal
                        </Badge>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words',
                        // Shape: tail on the correct corner
                        mine
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                          : response.is_internal
                          ? 'bg-indigo-50 border border-indigo-200 text-foreground rounded-2xl rounded-bl-sm'
                          : 'bg-muted text-foreground rounded-2xl rounded-bl-sm',
                      )}
                    >
                      {highlightText(displayText)}

                      {shouldTruncate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(response.id);
                          }}
                          className={cn(
                            'mt-1.5 flex items-center gap-1 text-xs font-medium transition-colors',
                            mine
                              ? 'text-primary-foreground/70 hover:text-primary-foreground'
                              : 'text-primary hover:text-primary/80',
                          )}
                        >
                          {isExpanded ? (
                            <><ChevronUp className="h-3 w-3" /> Show less</>
                          ) : (
                            <><ChevronDown className="h-3 w-3" /> Show more</>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {response.responded_at
                        ? format(new Date(response.responded_at), 'MMM d, yyyy')
                        : 'Unknown date'}
                      <span>·</span>
                      <Clock className="h-2.5 w-2.5" />
                      {response.responded_at
                        ? formatDistanceToNow(new Date(response.responded_at), { addSuffix: true })
                        : 'Unknown time'}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll-to-bottom FAB */}
          {showScrollButton && (
            <Button
              onClick={() => scrollToBottom('smooth')}
              size="icon"
              className="absolute bottom-3 right-3 h-8 w-8 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground z-10"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};