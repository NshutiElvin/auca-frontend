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
      "Start by uploading course lists and registered students. The system will link each student to their exams.",
  },
  {
    icon: <BetweenHorizontalStart className="ml-2 w-20 h-20"/>,
    title: "Define Time Slots & Rooms",
    description:
      "Choose exam times and assign rooms. You have full control over the schedule and room sizes.",
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
      "Check the final schedule, download it to Excel, and send emails to students and teachers.",
  },
];


export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-10 px-2"
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
