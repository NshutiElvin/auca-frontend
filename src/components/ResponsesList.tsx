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

    // Apply filter
    if (filterBy === 'internal') {
      filtered = filtered.filter(r => r.is_internal);
    } else if (filterBy === 'external') {
      filtered = filtered.filter(r => !r.is_internal);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.response_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.responder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.responder?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.responder?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
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
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
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

  if (visibleResponses.length === 0 && !searchQuery && filterBy === 'all') {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 t mb-4" />
          <p className=" font-medium mb-1">No responses yet</p>
          <p className=" text-sm">Be the first to respond to this claim!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Responses
            <Badge variant="secondary" className="ml-2">
              {visibleResponses.length}
            </Badge>
          </h3>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stats.total} Total
              </Badge>
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                {stats.internal} Internal
              </Badge>
              <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                {stats.external} External
              </Badge>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 " />
                  <Input
                    placeholder="Search responses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="role">By Role</option>
                </select>
              </div>

              {/* Filter */}
              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter</label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="all">All Responses</option>
                    <option value="internal">Internal Only</option>
                    <option value="external">External Only</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responses List */}
      {visibleResponses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Search className="h-10 w-10  mb-3" />
            <p className=" font-medium">No responses match your filters</p>
            <p className=" text-sm">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[60vh] pr-4 overflow-y-scroll">
          <div className="space-y-3">
            {visibleResponses.map((response, index) => {
              const isExpanded = expandedResponses.has(response.id);
              const responseText = response?.response_text || response?.message || '';
              const shouldTruncate = responseText.length > 200;
              const displayText = isExpanded || !shouldTruncate 
                ? responseText 
                : responseText.slice(0, 200) + '...';

              return (
                <Card 
                  key={response.id} 
                  className={cn(
                    'transition-all duration-200 hover:shadow-md',
                    response.is_internal && 'border-dashed bg-gradient-to-r  to-transparent',
                    onResponseClick && 'cursor-pointer'
                  )}
                  onClick={() => onResponseClick?.(response)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Avatar with online indicator */}
                        <div className="relative">
                          <Avatar className="h-10 w-10 border-2 shadow-sm">
                            <AvatarImage src={response.responder?.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                              {(response.responder?.first_name?.charAt(0) || '') + 
                               (response.responder?.last_name?.charAt(0) || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-sm font-semibold">
                              {`${response.responder?.first_name || ''} ${response.responder?.last_name || 'Unknown User'}`.trim()}
                            </CardTitle>
                            
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs font-medium", getRoleBadgeColor(response.responder?.role || ''))}
                            >
                              {response.responder?.role || 'User'}
                            </Badge>

                            {response.is_internal && (
                              <Badge variant="outline" className="text-xs border-blue-400 text-blue-700 bg-blue-50">
                                <Shield className="h-3 w-3 mr-1" />
                                Internal
                              </Badge>
                            )}

                            {index === 0 && (
                              <Badge variant="outline" className="text-xs border-green-400 text-green-700 bg-green-50">
                                Latest
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {response.responded_at
                                ? format(new Date(response.responded_at), 'MMM d, yyyy')
                                : 'Unknown date'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {response.responded_at
                                ? formatDistanceToNow(new Date(response.responded_at), { addSuffix: true })
                                : 'Unknown time'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm  whitespace-pre-wrap leading-relaxed">
                        {highlightText(displayText)}
                      </p>
                    </div>

                    {shouldTruncate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(response.id);
                        }}
                        className="gap-2 text-xs h-8"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            Show More
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};