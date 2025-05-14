import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MedalIcon, MapIcon, PlaneIcon, GiftIcon } from "../components/Icons";
import { Bell, BetweenHorizontalStart, CalendarSync, Upload } from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <Upload className="ml-2 w-20 h-20" />,
    title: "Upload Courses & Students",
    description:
      "Start by uploading course lists and registered students. The system matches each student to their enrolled exams.",
  },
  {
    icon: <BetweenHorizontalStart className="ml-2 w-20 h-20"/>,
    title: "Define Time Slots & Rooms",
    description:
      "Set up available exam time slots and allocate room capacities — flexible inputs for total control.",
  },
  {
    icon: <CalendarSync className="ml-2 w-20 h-20" />,
    title: "Auto-Schedule Exams",
    description:
      "With one click, generate a clash-free timetable that assigns exams, time slots, and rooms without overlap.",
  },
  {
    icon: <Bell className="ml-2 w-20 h-20"/>,
    title: "Review, Export & Notify",
    description:
      "Preview the final schedule, export to Excel, and instantly notify students and faculty via email.",
  },
];


export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
        Step-by-Step Guide
      </h2>
     <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
      From setup to notification — here’s how AUCA’s exam scheduling system
      simplifies every step of the process.
    </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-muted/50"
          >
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
