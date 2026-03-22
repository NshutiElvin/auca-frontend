// src/pages/NotificationsPage.tsx
import React, { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Search,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import type { NotificationData } from "../contexts/NotificationContext";
import useUserAxios from "../hooks/useUserAxios";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "/api/notifications";
const PAGE_SIZE = 10;
type FilterTab = "all" | "unread" | "read";

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 border-b last:border-b-0">
      <Skeleton className="h-2 w-2 rounded-full mt-2 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-7 w-7 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </div>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────

interface NotificationRowProps {
  notification: NotificationData;
  onMarkRead: (id: number, value: boolean) => Promise<void>;
  onDismiss: (id: number) => Promise<void>;
}

function NotificationRow({ notification, onMarkRead, onDismiss }: NotificationRowProps) {
  const [loading, setLoading] = useState(false);

  const handleToggleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    await onMarkRead(notification.id, !notification.is_read);
    setLoading(false);
  };

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    await onDismiss(notification.id);
    setLoading(false);
  };

  return (
    <div
      className={`group flex items-start gap-4 p-4 border-b last:border-b-0 transition-colors cursor-pointer hover:bg-muted/40 ${
        !notification.is_read ? "bg-blue-50/60 dark:bg-blue-950/20" : ""
      }`}
      onClick={() => !notification.is_read && onMarkRead(notification.id, true)}
    >
      {/* Unread dot */}
      <div className="mt-2 shrink-0">
        <span
          className={`block h-2 w-2 rounded-full ${
            !notification.is_read ? "bg-blue-500" : "bg-transparent"
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug truncate ${
            !notification.is_read ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1.5">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={loading}
                onClick={handleToggleRead}
              >
                {notification.is_read ? (
                  <BellOff className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {notification.is_read ? "Mark as unread" : "Mark as read"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                disabled={loading}
                onClick={handleDismiss}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const NotificationsPage: React.FC = () => {
  const axios = useUserAxios();

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/`);
        // Support both plain array and { data: [...] } envelope
        setNotifications(Array.isArray(data) ? data : (data.data ?? []));
      } catch {
        setError("Failed to load notifications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleMarkRead = async (id: number, value: boolean) => {
    await axios.post(`${API_BASE}/${id}/mark_as_read/`, { is_read: value });
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, is_read: value, read_at: value ? new Date().toISOString() : null }
          : n
      )
    );
  };

  const handleDismiss = async (id: number) => {
    await axios.delete(`${API_BASE}/${id}/`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    await axios.post(`${API_BASE}/mark_all_as_read/`);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
  };

  const handleDeleteAll = async () => {
    await Promise.all(notifications.map((n) => axios.delete(`${API_BASE}/${n.id}/`)));
    setNotifications([]);
  };

  const handleTabChange = (value: string) => {
    setTab(value as FilterTab);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter((n) => !n.is_read).length,
      read: notifications.filter((n) => n.is_read).length,
    }),
    [notifications]
  );

  const filtered = useMemo(() => {
    let result = notifications;
    if (tab === "unread") result = result.filter((n) => !n.is_read);
    else if (tab === "read") result = result.filter((n) => n.is_read);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q)
      );
    }

    return [...result].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notifications, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-2">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-7 w-7" />
            {stats.unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {stats.unread > 9 ? "9+" : stats.unread}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {stats.unread > 0
                ? `${stats.unread} unread notification${stats.unread !== 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stats.unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}

          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {notifications.length} notifications.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDeleteAll}
                  >
                    Delete all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-4">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-bold text-blue-500">{stats.unread}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Unread</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-bold text-green-500">{stats.read}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Read</p>
        </Card>
      </div>

      {/* Filters + Search + List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Tabs value={tab} onValueChange={handleTabChange} className="flex-1">
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-1.5 text-xs">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {stats.unread > 0 && (
                    <Badge className="ml-1.5 text-xs bg-blue-500">{stats.unread}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={search}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <Bell className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <Inbox className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {search
                    ? `No results for "${search}"`
                    : tab === "unread"
                    ? "No unread notifications"
                    : tab === "read"
                    ? "No read notifications"
                    : "No notifications yet"}
                </p>
                {search && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1 h-auto p-0"
                    onClick={() => setSearch("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </div>
          ) : (
            paginated.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDismiss={handleDismiss}
              />
            ))
          )}
        </CardContent>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of <span className="font-medium">{filtered.length}</span>
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
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
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`e-${idx}`} className="px-2 text-muted-foreground text-sm">
                        …
                      </span>
                    ) : (
                      <Button
                        key={item}
                        variant={currentPage === item ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(item as number)}
                      >
                        {item}
                      </Button>
                    )
                  )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};