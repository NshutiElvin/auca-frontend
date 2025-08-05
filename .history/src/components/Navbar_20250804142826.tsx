import { useEffect, useState, useTransition } from "react";
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
  const[regNumber, setRegNumber]= useState<string>("")
  const { setToastMessage } = useToast();
  const checkRoom = () => {
    if(regNumber.length<=0){
      setToastMessage({message:"Please, Enter Valid regnumber 🤨", variant:"danger"})
      return;
    }
    startTransition(async () => {
      try {
        const resp = await axios.post("/api/rooms/verify/", {regNumber});
        if (resp.data.success) {
          setRoomInfo({exam:resp.data.exam, room: resp.data.room});
        } else {
          setToastMessage({ message: resp.data.message, variant: "danger" });
        }
      } catch (error) {
        setToastMessage({ message: String(error), variant: "danger" });
      }
    });
  };


  
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={() => {
        setDialogOpen(!dialogOpen);
        setRoomInfo(null)
      }}
    >
      <header className="sticky border-b-[1px] top-0 z-40 w-full bg-dark dark:border-b-slate-700 dark:bg-background">
        <NavigationMenu className="mx-auto">
          <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
            <NavigationMenuItem className="font-bold flex">
              <Link
                rel="noreferrer noopener"
                to="/"
                className="ml-2 font-bold text-xl flex"
              >
                <LogoIcon />
                AUCA ES&RA System
              </Link>
            </NavigationMenuItem>

            {/* mobile */}
            <span className="flex md:hidden">
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
                      AUCA ES&RA System
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
          <div className="space-y-4">
            <Input
              placeholder="Registration Number"
              onChange={(e) => setRegNumber(e.target.value.trim())}
            />
            <Button onClick={checkRoom} disabled={isPending} className="w-full">
              {isPending ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Check className="mr-2" />
              )}
              Check Details
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Student Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {roomInfo.exam.student.user.first_name} {roomInfo.exam.student.user.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration No.</p>
                  <p className="font-medium">{roomInfo.exam.student.reg_no}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">
                    {roomInfo.exam.student.department.name} ({roomInfo.exam.student.department.code})
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
                    <p className="font-medium">{roomInfo.room.capacity} students</p>
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
                <Badge variant={roomInfo.exam.exam.status === "ONGOING" ? "destructive" : "default"}>
                  {roomInfo.exam.exam.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">
                    {roomInfo.exam.exam.group.course.code} - {roomInfo.exam.exam.group.course.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Group</p>
                  <p className="font-medium">{roomInfo.exam.exam.group.group_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(roomInfo.exam.exam.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {roomInfo.exam.exam.start_time} - {roomInfo.exam.exam.end_time}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Course Department</p>
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
