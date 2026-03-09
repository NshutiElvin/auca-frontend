// src/components/claims/ResponsesList.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ClaimResponse } from '../lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Shield, 
  User, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Filter,
  Search,
  MessageSquare,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { Input } from './ui/input';
import { cn } from '../lib/utils';

interface ResponsesListProps {
  responses: ClaimResponse[];
  isAdmin?: boolean;
  onResponseClick?: (response: ClaimResponse) => void;
  highlightKeywords?: string[];
}

type SortOption = 'newest' | 'oldest' | 'role';
type FilterOption = 'all' | 'internal' | 'external';

export const ResponsesList: React.FC<ResponsesListProps> = ({ 
  responses, 
  isAdmin = false,
  onResponseClick,
  highlightKeywords = []
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedResponses, setExpandedResponses] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const visibleResponses = useMemo(() => {
    let filtered = isAdmin 
      ? responses 
      : responses.filter(r => !r.is_internal);

    if (filterBy === 'internal') {
      filtered = filtered.filter(r => r.is_internal);
    } else if (filterBy === 'external') {
      filtered = filtered.filter(r => !r.is_internal);
    }

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.response_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.responder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.responder?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.responder?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.responded_at || 0).getTime() - new Date(a.responded_at || 0).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.responded_at || 0).getTime() - new Date(b.responded_at || 0).getTime();
      } else {
        return (a.responder?.role || '').localeCompare(b.responder?.role || '');
      }
    });

    return sorted;
  }, [responses, isAdmin, filterBy, searchQuery, sortBy]);

  const stats = useMemo(() => ({
    total: responses.length,
    internal: responses.filter(r => r.is_internal).length,
    external: responses.filter(r => !r.is_internal).length,
  }), [responses]);

  const toggleExpanded = (id: number) => {
    setExpandedResponses(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const highlightText = (text: string) => {
    if (highlightKeywords.length === 0 && !searchQuery) return text;
    
    const keywords = [...highlightKeywords, searchQuery].filter(Boolean);
    let highlighted = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  const getRoleBadgeColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-800 border-red-300',
      'manager': 'bg-blue-100 text-blue-800 border-blue-300',
      'supervisor': 'bg-purple-100 text-purple-800 border-purple-300',
      'employee': 'bg-green-100 text-green-800 border-green-300',
    };
    return roleColors[role.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Generate a consistent soft color per user for their bubble
  const getBubbleStyle = (role: string, isInternal: boolean) => {
    if (isInternal) return 'bg-indigo-50 border border-indigo-100';
    const roleMap: Record<string, string> = {
      'admin':      'bg-rose-50 border border-rose-100',
      'manager':    'bg-sky-50 border border-sky-100',
      'supervisor': 'bg-violet-50 border border-violet-100',
      'employee':   'bg-emerald-50 border border-emerald-100',
    };
    return roleMap[role?.toLowerCase()] || 'bg-gray-50 border border-gray-200';
  };

  if (visibleResponses.length === 0 && !searchQuery && filterBy === 'all') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <MessageSquare className="h-7 w-7 text-gray-300" />
        </div>
        <p className="font-medium text-gray-500">No responses yet</p>
        <p className="text-sm text-gray-400">Be the first to respond to this claim!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            Responses
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5">
              {visibleResponses.length}
            </span>
          </h3>

          {isAdmin && (
            <div className="flex gap-1.5">
              <Badge variant="outline" className="text-[11px] gap-1 text-gray-500">
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
          className="gap-1.5 text-xs text-gray-500 hover:text-gray-800"
        >
          <Filter className="h-3.5 w-3.5" />
          {showFilters ? 'Hide' : 'Filter'}
        </Button>
      </div>

      {/* ── Filters ── */}
      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search responses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full h-8 px-3 border border-gray-200 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="role">By Role</option>
              </select>
            </div>

            {isAdmin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filter</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="w-full h-8 px-3 border border-gray-200 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
          <Search className="h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No responses match your filters</p>
          <p className="text-xs">Try adjusting your search or filters</p>
        </div>
      ) : (
        /* ── Chat thread ── */
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex flex-col gap-5 py-1">
            {visibleResponses.map((response, index) => {
              const isExpanded = expandedResponses.has(response.id);
              const responseText = response?.response_text || response?.message || '';
              const shouldTruncate = responseText.length > 200;
              const displayText = isExpanded || !shouldTruncate 
                ? responseText 
                : responseText.slice(0, 200) + '…';

              const firstName = response.responder?.first_name || '';
              const lastName  = response.responder?.last_name  || 'Unknown';
              const fullName  = `${firstName} ${lastName}`.trim();
              const initials  = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
              const role      = response.responder?.role || 'user';

              return (
                <div
                  key={response.id}
                  className={cn(
                    'flex gap-3 items-end group',
                    onResponseClick && 'cursor-pointer'
                  )}
                  onClick={() => onResponseClick?.(response)}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 self-end mb-1">
                    <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                      <AvatarImage src={response.responder?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {/* online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                  </div>

                  {/* Bubble + meta */}
                  <div className="flex flex-col gap-1 max-w-[82%] sm:max-w-[70%]">
                    {/* Name row */}
                    <div className="flex items-center gap-2 flex-wrap px-1">
                      <span className="text-xs font-semibold text-gray-700">{fullName}</span>

                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-medium py-0 px-1.5 h-4', getRoleBadgeColor(role))}
                      >
                        {role}
                      </Badge>

                      {response.is_internal && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-indigo-300 text-indigo-600 bg-indigo-50">
                          <Shield className="h-2.5 w-2.5 mr-0.5" />
                          Internal
                        </Badge>
                      )}

                      {index === 0 && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-emerald-300 text-emerald-600 bg-emerald-50">
                          Latest
                        </Badge>
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={cn(
                        'rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm transition-shadow group-hover:shadow-md',
                        getBubbleStyle(role, !!response.is_internal)
                      )}
                    >
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {highlightText(displayText)}
                      </p>

                      {shouldTruncate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(response.id);
                          }}
                          className="mt-2 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
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
                    <div className="flex items-center gap-2 px-1 text-[11px] text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {response.responded_at
                        ? format(new Date(response.responded_at), 'MMM d, yyyy')
                        : 'Unknown date'}
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      {response.responded_at
                        ? formatDistanceToNow(new Date(response.responded_at), { addSuffix: true })
                        : 'Unknown time'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};