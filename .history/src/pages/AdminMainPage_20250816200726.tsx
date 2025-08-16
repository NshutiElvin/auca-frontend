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
  BookOpen,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LogOut,
  LucideHistory,
  LucideLayoutDashboard,
  Settings,
  Table2,
  User,
  User2Icon,
  UserCog,
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
import { useContext, useEffect, useState } from "react";
import useToast from "../hooks/useToast";

import { useNavigate } from "react-router-dom";

import { DecodedToken } from "../../types";
import LocationContext from "../contexts/LocationContext";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";

const data = {
  versions: ["1.0.1"],
  navMain: [
    {
      title: "Admin Portal",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "dashboard",
          icon: LucideLayoutDashboard,
        },
        {
          title: "Auto Timetable",
          url: "schedules",
          icon: CalendarClock,
        },
        {
          title: "Manual Timetable",
          url: "manual",
          icon: CalendarDays,
        },
        {
          title: "Courses",
          url: "courses",
          icon: BookOpen,
        },

        {
          title: "Scheduled Exams",
          url: "exams",
          icon: ClipboardList,
        },
        {
          title: "Students Exams",
          url: "allocations",
          icon: Users,
        },

        {
          title: "Room Allocations",
          url: "occupancies",
          icon: Table2,
        },
        {
          title: "Recent Timetables",
          url: "timetables",
          icon: LucideHistory,
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      items: [
        {
          title: "Users",
          url: "#",
          icon: UserCog,
        },
      ],
    },
    {
      title: "Authentication",
      url: "#",
      items: [
        {
          title: "Profile ",
          url: "#",
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

export default function AdminMainPage() {
  const { parentUrl, url } = useSidebar();
  const { auth } = useAuth();
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const navigate = useNavigate();
  const { setToastMessage } = useToast();
  const { locations, setLocations } = useContext(LocationContext);

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

          <div className="flex flex-1 space-x-2 justify-between">
            <div className="flex flex-row justify-around border shadow-md border-foreground rounded-md">
              {locations &&
                locations.map((loc, idx) => {
                  return (
                    <div className="flex justify-around items-center p-2 space-x-1" key={idx}>
                      <Checkbox className="p-0 m-0 border border-foreground" id={loc.id.toString()}/>
                      <Label className="p-0 m-0" htmlFor={loc.id.toString()}>{loc.name}</Label>
                    </div>
                  );
                })}
            </div>
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
                  <span>
                    My Profile (
                    {maskEmail(decodedToken?.email.toLocaleLowerCase() || "")})
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 size-4" />
                  <Link to={"/logout"}>Log out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
}
