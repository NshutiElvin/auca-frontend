 import { useEffect, useState, useTransition, useRef } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import { Button, buttonVariants } from "./ui/button";
import { Check, Loader2, Menu } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { LogoIcon } from "./Icons";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge"; // Assuming you have a Badge component
import { Card, CardHeader, CardContent } from "./ui/card"; // Assuming you have Card components

import axios from "../API/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "./ui/input";
import useToast from "../hooks/useToast";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {href:"#hero",
    label:"Home"
  },
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#howItWorks",
    label: "How It Works",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [roomInfo, setRoomInfo] = useState<any | null>(null);
  const [regNumber, setRegNumber] = useState<string>("");
  const { setToastMessage } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
   const [isScrolled, setIsScrolled] = useState<boolean>(false);
     useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (dialogOpen && !roomInfo) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dialogOpen, roomInfo]);

  const checkRoom = () => {
    if (regNumber.length <= 0) {
      setToastMessage({
        message: "Please, Enter Valid regnumber 🤨",
        variant: "danger",
      });
      inputRef.current?.focus();
      return;
    }
    startTransition(async () => {
      try {
        const resp = await axios.post("/api/rooms/verify/", { regNumber });
        if (resp.data.success) {
          setRoomInfo({ exam: resp.data.exam, room: resp.data.room });
        } else {
          setToastMessage({ message: resp.data.message, variant: "danger" });
          inputRef.current?.focus();
        }
      } catch (error) {
        setToastMessage({ message: String(error), variant: "danger" });
        inputRef.current?.focus();
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isPending) {
      e.preventDefault();
      checkRoom();
    }
    // Clear error states on new input
    if (e.key !== "Enter" && e.key !== "Tab") {
      // Reset any error styling if needed
    }
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPending) {
      checkRoom();
    }
  };

  // Reset form when dialog closes
  const handleDialogOpenChange = () => {
    setDialogOpen(!dialogOpen);
    if (dialogOpen) {
      // Dialog is closing
      setRoomInfo(null);
      setRegNumber("");
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <header  className="bg-white dark:bg-gray-900 fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-300 ease-in-out  text-black">
        <NavigationMenu className="mx-auto">
          <NavigationMenuList className={`container h-14 px-4 w-screen flex justify-between items-center  `}>
            <NavigationMenuItem className="font-bold flex">
              <Link
                rel="noreferrer noopener"
                to="/"
                className="ml-2 font-bold text-xl flex"
              >
                <img src="/logo.png" alt="logo" className="h-[55px] mb-5 mt-5"/>
              </Link>
            </NavigationMenuItem>

            {/* mobile */}
            <span className="flex md:hidden">
              <Button onClick={() => setDialogOpen(true)}>Check Room</Button>
              <ModeToggle />

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger className="px-2">
                  <Menu
                    className="flex md:hidden h-5 w-5"
                    onClick={() => setIsOpen(true)}
                  >
                    <span className="sr-only">Menu Icon</span>
                  </Menu>
                </SheetTrigger>

                <SheetContent side={"left"}>
                  <SheetHeader>
                    <SheetTitle className="font-bold text-xl">
                        <img src="/logo.png" alt="logo" className="h-[75px] mb-5 mt-5"/>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                    {routeList.map(({ href, label }: RouteProps) => (
                      <a
                        rel="noreferrer noopener"
                        key={label}
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className={buttonVariants({ variant: "ghost" })}
                      >
                        {label}
                      </a>
                    ))}

                    <Link
                      rel="noreferrer noopener"
                      to="/login"
                      target="_blank"
                      className={`w-[110px] border ${buttonVariants({
                        variant: "secondary",
                      })}`}
                    >
                      <LogIn />
                      Sign in
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </span>

            {/* desktop */}
            <nav className="hidden md:flex gap-2">
              {routeList.map((route: RouteProps, i) => (
                <a
                  rel="noreferrer noopener"
                  href={route.href}
                  key={i}
                  className={`text-[17px] ${buttonVariants({
                    variant: "ghost",
                  })}`}
                >
                  {route.label}
                </a>
              ))}
              <Button onClick={() => setDialogOpen(true)}>Check Room</Button>
            </nav>

            <div className="hidden md:flex gap-2">
              <Link
                rel="noreferrer noopener"
                to="/login"
                className={`border ${buttonVariants({ variant: "secondary" })}`}
              >
                <LogIn className="mr-2 w-5 h-5" />
                Sign in
              </Link>

              <ModeToggle />
            </div>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4 pb-2">
          <DialogTitle className="text-xl font-bold">
            {roomInfo ? "Exam Room Details" : "Enter Registration Number"}
          </DialogTitle>
          <DialogDescription>
            {roomInfo
              ? "Here are your exam details"
              : "Enter your registration number to view your exam information"}
          </DialogDescription>
        </DialogHeader>

        {!roomInfo ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="regNumber" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Registration Number
              </label>
              <Input
                ref={inputRef}
                id="regNumber"
                name="regNumber"
                placeholder="Enter your registration number"
                maxLength={100}
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.trim())}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                autoComplete="off"
                aria-describedby="regNumber-hint"
                className="w-full"
              />
               
            </div>
            <Button 
              type="submit" 
              disabled={isPending || regNumber.length === 0} 
              className="w-full"
              aria-describedby="check-button-hint"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <Check className="mr-2" />
                  Check Details
                </>
              )}
            </Button>
            <p id="check-button-hint" className="sr-only">
              Submit the form to check your exam room details
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Student Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">
                Student Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {roomInfo.exam.student.user.first_name}{" "}
                    {roomInfo.exam.student.user.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Registration No.
                  </p>
                  <p className="font-medium">{roomInfo.exam.student.reg_no}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">
                    {roomInfo.exam.student.department.name} (
                    {roomInfo.exam.student.department.code})
                  </p>
                </div>
              </div>
            </div>
            {/* Room Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Room Assignment</h3>
              {roomInfo.room ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Room Number</p>
                    <p className="font-medium text-2xl">{roomInfo.room.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-medium">
                      {roomInfo.room.capacity} students
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Room assignment pending</p>
              )}
            </div>

            {/* Exam Information */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">Exam Information</h3>
                <Badge
                  variant={
                    roomInfo.exam.exam.status === "ONGOING"
                      ? "destructive"
                      : "default"
                  }
                >
                  {roomInfo.exam.exam.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">
                    {roomInfo.exam.exam.group.course.code} -{" "}
                    {roomInfo.exam.exam.group.course.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Group</p>
                  <p className="font-medium">
                    {roomInfo.exam.exam.group.group_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(roomInfo.exam.exam.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {roomInfo.exam.exam.start_time} -{" "}
                    {roomInfo.exam.exam.end_time}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Course Department
                </p>
                <p className="font-medium">
                  {roomInfo.exam.exam.group.course.department.name}
                </p>
                <p className="text-sm text-muted-foreground">Semester</p>
                <p className="font-medium">
                  {roomInfo.exam.exam.group.course.semester.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};