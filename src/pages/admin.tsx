import { Link, Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "../components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Separator } from "../components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "../components/ui/sidebar";
import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  LogOut,
  LucideHistory,
  LucideLayoutDashboard,
  Settings,
  Table2,
  UploadCloud,
  User,
  User2Icon,
  UserCog,
  Users,
  Bell,
  ChevronDown,
  Shield,
  Sparkles,
  ListCheck,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { jwtDecode } from "jwt-decode";
import useAuth from "../hooks/useAuth";
import { useContext, useEffect, useState } from "react";
import useToast from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { DecodedToken } from "../../types";
import { NotificationList } from "./notifications-list";
import useNotifications from "../hooks/useNotifications";
import { NotificationData } from "../contexts/NotificationContext";
import LocationContext from "../contexts/LocationContext";
import { ModeToggle } from "../components/mode-toggle";
import { motion } from "framer-motion";
import useUserAxios from "../hooks/useUserAxios";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";

const data = {
  versions: ["1.0.1"],
  navMain: [
    {
      title: "Admin Portal",
      url: "#",
      items: [
        { title: "Dashboard",        url: "dashboard",    icon: LucideLayoutDashboard },
        { title: "Auto Timetable",   url: "schedules",    icon: CalendarClock },
        { title: "Manual Timetable", url: "manual",       icon: CalendarDays },
        { title: "Courses",          url: "courses",      icon: BookOpen },
        { title: "Students Exams",   url: "allocations",  icon: Users },
        { title: "Sitting Plan",     url: "occupancies",  icon: Table2 },
        { title: "Recent Timetables",url: "timetables",   icon: LucideHistory },
        { title: "Uploads",          url: "Uploads",      icon: UploadCloud },
        { title: "Claims",           url: "claims",       icon: ListCheck },
        { title: "Report",           url: "report",       icon: FileQuestion },
      ],
    },
    {
      title: "Users",
      url: "#",
      items: [
        { title: "Users", url: "users", icon: UserCog },
      ],
    },
    {
      title: "Authentication",
      url: "#",
      items: [
        { title: "Profile", url: "profile", icon: User },
        { title: "Logout",  url: "/Logout",  icon: LogOut },
      ],
    },
  ],
};

function maskEmail(email: string): string {
  if (!email || email.length <= 0) return "";
  const [user, domain] = email.split("@");
  const maskedUser =
    user.length <= 2
      ? "*".repeat(user.length)
      : user[0] + "*".repeat(user.length - 2) + user[user.length - 1];
  const [domainName, domainExt] = domain.split(".");
  const maskedDomain =
    domainName[0] + "*".repeat(domainName.length - 1) + "." + domainExt;
  return `${maskedUser}@${maskedDomain}`;
}

function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "AD";
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  admin:      { label: "Admin",      color: "bg-blue-100 text-blue-800 border-blue-200",    icon: Shield },
  instructor: { label: "Instructor", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: GraduationCap },
  student:    { label: "Student",    color: "bg-violet-100 text-violet-800 border-violet-200", icon: User },
};

export default function AdminMainPage() {
  const { parentUrl, url } = useSidebar();
  const { auth } = useAuth();
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const navigate = useNavigate();
  const { setToastMessage } = useToast();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { notifications, setNotifications } = useNotifications();
   const axios = useUserAxios();

   const markAllAsRead = async () => {
      try {
        await axios.post("/api/notifications/mark_all_as_read/");
        setUnreadCount(0);
        setNotifications(
          notifications.map((n: NotificationData) => ({ ...n, is_read: true })),
        );
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };

  // Current time for the header clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

   useEffect(() => {
    setUnreadCount(notifications.filter((n) => n.is_read == false).length);
  }, [notifications]);

  useEffect(() => {
    try {
      const decoded = jwtDecode<DecodedToken>(auth);
      setDecodedToken(decoded);
    } catch {
      setToastMessage({
        message: "Error validating access token. Please login again.",
        variant: "danger",
      });
      navigate("/login");
    }
  }, [auth]);

  const role       = decodedToken?.role?.toLowerCase() ?? "admin";
  const roleCfg    = ROLE_CONFIG[role] ?? ROLE_CONFIG["admin"];
  const RoleIcon   = roleCfg.icon;
  const initials   = getInitials(decodedToken?.email.split("@")[0], decodedToken?.email);
  const maskedMail = maskEmail(decodedToken?.email?.toLowerCase() ?? "");

  const dayName = time.toLocaleDateString("en-US", { weekday: "short" });
  const dateStr = time.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <AppSidebar data={data} />
      <main>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-0 border-b bg-background/95 backdrop-blur-sm px-3 w-full shadow-[0_1px_0_0_hsl(var(--border))]">

          {/* Left: trigger + breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 h-8 w-8 rounded-md hover:bg-muted transition-colors" />
            <Separator orientation="vertical" className="h-4 mx-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:flex items-center">
                  <BreadcrumbLink
                    href="#"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {parentUrl}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:flex text-muted-foreground/50" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-semibold capitalize">
                    {url}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: clock · role badge · notifications · user menu · theme */}
          <div className="flex items-center gap-1.5">

            {/* Live clock — hidden on small screens */}
            <div className="hidden lg:flex flex-col items-end mr-1">
              <span className="text-[11px] font-semibold leading-none text-foreground">
                {timeStr}
              </span>
              <span className="text-[10px] leading-none text-muted-foreground mt-0.5">
                {dayName}, {dateStr}
              </span>
            </div>

            <Separator orientation="vertical" className="h-5 mx-1 hidden lg:block" />

            {/* Role badge */}
            <Badge
              variant="outline"
              className={`hidden sm:flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleCfg.color}`}
            >
              <RoleIcon className="h-3 w-3" />
              {roleCfg.label}
            </Badge>

            {/* Notification bell — placeholder */}
             {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label="Notifications"
                  onClick={markAllAsRead}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-semibold leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <NotificationList notifications={notifications} />
              </PopoverContent>
            </Popover>

            {/* Theme toggle */}
            <ModeToggle />

            <Separator orientation="vertical" className="h-5 mx-0.5" />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-8 px-2 rounded-full hover:bg-muted transition-colors"
                >
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarFallback className="text-[11px] font-bold bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-xs font-semibold max-w-[100px] truncate">
                    {decodedToken?.email?.split("@")[0] || decodedToken?.email?.split("@")[0] || "Admin"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border" sideOffset={8}>
                {/* User info header */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate">
                      {decodedToken?.email?.split("@")[0] || "Administrator"}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {maskedMail}
                    </span>
                    <Badge
                      variant="outline"
                      className={`mt-1 w-fit text-[10px] px-1.5 py-0 rounded-full border ${roleCfg.color}`}
                    >
                      {roleCfg.label}
                    </Badge>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    to="/admin/profile"
                    className="flex items-center gap-2 cursor-pointer rounded-lg mx-1 px-2"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">My Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-2 cursor-pointer rounded-lg mx-1 px-2"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    to="/logout"
                    className="flex items-center gap-2 cursor-pointer rounded-lg mx-1 px-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Page content ───────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

      </main>
    </>
  );
}