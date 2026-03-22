import { Link, Outlet } from "react-router-dom";
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
  Bell,
  BellDotIcon,
  BellIcon,
  BookOpen,
  Calendar,
  CalendarClock,
  Camera,
  FileQuestion,
  LayoutDashboard,
  ListCheck,
  LogOut,
  Settings,
  User,
  User2Icon,
  UserCircle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { jwtDecode } from "jwt-decode";
import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";
import useToast from "../hooks/useToast";

import { useNavigate } from "react-router-dom";

import { DecodedToken } from "../../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import useUserAxios from "../hooks/useUserAxios";
import { NotificationList } from "./notifications-list";
import useNotifications from "../hooks/useNotifications";
import { NotificationData } from "../contexts/NotificationContext";
import { Permissions } from "../lib/permissions";
import { hasPermission } from "../hooks/hasPermission";
import { QuestionMarkIcon } from "@radix-ui/react-icons";

function maskEmail(email: string): string {
  if (email.length <= 0) return "";
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

export default function StudentMainPage() {
  const data = {
    versions: ["1.0.1"],
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: LayoutDashboard,
        items: [
          {
            title: "My Enrollments",
            url: "enrollments",
            icon: BookOpen,
          },
          {
            title: "My Exams",
            url: "exams",
            icon: CalendarClock,
          },
          ...(hasPermission(Permissions.VIEW_EXAM)
            ? [
                {
                  title: "Auto Timetable",
                  url: "schedules",
                  icon: CalendarClock,
                },
                {
                  title: "Scheduled Exams",
                  url: "all-exams",
                  icon: ListCheck,
                },
              ]
            : []),
          ...(hasPermission(Permissions.CHANGE_EXAM)
            ? [
                {
                  title: "Manual Timetable",
                  url: "manual",
                  icon: Calendar,
                },
              ]
            : []),
           
          ...(hasPermission(Permissions.VIEW_COURSE)
            ? [
                {
                  title: "Courses",
                  url: "courses",
                  icon: CalendarClock,
                },
              ]
            : []),

          {
            title: "Claims",
            url: "claims",
            icon: FileQuestion,
          },
           {
          title: "Notifications",
          url: "notifications",
          icon:BellDotIcon,
        },
        ],
      },
      {
        title: "Authentication",
        url: "#",
        icon: UserCircle,
        items: [
          {
            title: "Profile",
            url: "profile",
            icon: UserCircle,
          },
          {
            title: "Logout",
            url: "/logout",
            icon: LogOut,
          },
        ],
      },
    ],
  };
  const { parentUrl, url, setSidebarPath } = useSidebar();
  const { auth } = useAuth();
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const navigate = useNavigate();
  const { setToastMessage } = useToast();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { notifications, setNotifications } = useNotifications();
  const axios = useUserAxios();
  const handleNotificationAction = (id: number) => {
    setNotifications((prev: NotificationData[]) =>
      prev.filter((n) => n.id !== id),
    );
  };

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
  useEffect(() => {
    try {
      const decoded = jwtDecode<DecodedToken>(auth);
      setDecodedToken(decoded);
    } catch (error) {
      setToastMessage({
        message: "Error of validating access token. Please login again.",
        variant: "danger",
      });
      navigate("/login");
    }
  }, [auth]);
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => n.is_read == false).length);
  }, [notifications]);

  return (
    <>
      <AppSidebar data={data} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sticky top-0 z-50">
          {/* Left: Sidebar trigger + breadcrumb */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <SidebarTrigger className="-ml-1 h-8 w-8 shrink-0" />
            <Separator
              orientation="vertical"
              className="h-4 shrink-0 opacity-50"
            />

            <Breadcrumb className="min-w-0">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem className="hidden md:flex">
                  <BreadcrumbLink
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm truncate max-w-[160px]"
                  >
                    {parentUrl}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:flex opacity-50" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-sm truncate max-w-[200px]">
                    {url}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Camera / Exam verification */}
            <Button
              onClick={() => navigate("exam-verification")}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Exam verification"
            >
              <Camera className="h-4 w-4" />
            </Button>

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
                <NotificationList
                  notifications={notifications}
                  onDismiss={handleNotificationAction}
                  onMarkRead={(id) =>
                    setNotifications((prev: NotificationData[]) =>
                      prev.map((n) =>
                        n.id === id ? { ...n, is_read: true } : n,
                      ),
                    )
                  }
                />
              </PopoverContent>
            </Popover>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 px-2 text-muted-foreground hover:text-foreground"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <User2Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="hidden sm:inline-block text-xs font-medium">
                    {decodedToken?.role.toLocaleUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-foreground">
                    {decodedToken?.role.toLocaleUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {maskEmail(decodedToken?.email.toLocaleLowerCase() || "")}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <Link to="/logout">Log out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-auto m-8">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
}
