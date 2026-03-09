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
  CalendarClock,
  Camera,
  CheckCircle,
  ClipboardList,
  LogOut,
  Settings,
  Table2,
  User,
  Bell,
  User2Icon,
  Users,
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
import { NotificationList } from "./notifications-list";
import useNotifications from "../hooks/useNotifications";
import { NotificationData } from "../contexts/NotificationContext";
import { ModeToggle } from "../components/mode-toggle";
import useUserAxios from "../hooks/useUserAxios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

const data = {
  versions: ["1.0.1"],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      items: [
        {
          title: "Verification",
          url: "exam-verification",
          icon: CheckCircle,
        },
        {
          title: "Allocations",
          url: "allocations",
          icon: Users,
        },
        {
          title: "Exams",
          url: "exams",
          icon: ClipboardList,
        },
      ],
    },
    {
      title: "Authentication",
      url: "#",
      items: [
        {
          title: "Profile",
          url: "profile",
          icon: User,
        },
        {
          title: "Logout",
          url: "/Logout",
          icon: LogOut,
        },
      ],
    },
  ],
};
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

export default function InstructorMainPage() {
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

  return (
    <>
      <AppSidebar data={data} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">{parentUrl}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{url}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex-1"></div>
          <Button
            onClick={() => {
              navigate("exam-verification");
              setSidebarPath("Verification");
            }}
          >
            <Camera className="h-12 w-12" />
          </Button>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="p-4">
                <User2Icon /> {decodedToken?.role.toLocaleUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuSeparator className="md:hidden" />

              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 size-4" />
                <Link to={"/profile"}>
                  My Profile (
                  {maskEmail(decodedToken?.email.toLocaleLowerCase() || "")})
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 size-4" />
                <Link to={"/logout"}>Log out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="flex-1 overflow-auto m-8">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
}
