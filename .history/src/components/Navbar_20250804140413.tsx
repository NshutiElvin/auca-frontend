import { useState, useTransition } from "react";
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
          setRoomInfo(resp.data.exam);
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
    
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
          <DialogTitle className="text-l font-bold leading-tight">
            {roomInfo ? "Exam Room Details" : "Enter your Registration Number"}
          </DialogTitle>

          <DialogDescription className="text-sm max-w-md mx-auto leading-relaxed text-center">
            {roomInfo
              ? "Here are your exam details"
              : "Enter your registration number to view your upcoming or ongoing exam room details."}
          </DialogDescription>
        </DialogHeader>

        {!roomInfo ? (
          <>
            <Input
              placeholder="Reg number"
              onChange={(e) => {
                setRegNumber(e.target.value.trim());
              }}
            />
            <Button onClick={checkRoom} disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Check /> check
                </>
              )}
            </Button>
          </>
        ) : (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">
                  {roomInfo.exam.group.course.title}
                </h3>
                <Badge variant={roomInfo.exam.status === "ONGOING" ? "destructive" : "default"}>
                  {roomInfo.exam.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {roomInfo.exam.group.course.code} - {roomInfo.exam.group.group_name}
              </p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Room</p>
                  <p className="text-sm text-muted-foreground">
                    {roomInfo.room.name} (Capacity: {roomInfo.room.capacity})
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(roomInfo.exam.date).toLocaleDateString()} •{" "}
                    {roomInfo.exam.start_time} - {roomInfo.exam.end_time}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Department</p>
                  <p className="text-sm text-muted-foreground">
                    {roomInfo.exam.group.course.department.name}
                  </p>
                </div>
              </div>
            </CardContent>
            <div className="px-6 pb-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setRoomInfo(null)}
              >
                Check Another Registration
              </Button>
            </div>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
