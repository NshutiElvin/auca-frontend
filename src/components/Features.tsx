import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import image from "../assets/notify.png";
import image3 from "../assets/friendly.png";
import image4 from "../assets/timetable.png";

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: "Clash-Free Timetable Generation",
    description:
      "Our AI-powered algorithm ensures that no student is double-booked by automatically generating a timetable with no overlapping exams.",
    image: image4, // You can replace this with an appropriate image or screenshot
  },
  {
    title: "User-Friendly Interface",
    description:
      "Easy-to-navigate interface for both students and administrators, ensuring smooth scheduling and management without complex setups.",
    image: image3, // Replace with a relevant image
  },
  {
    title: "Automated Notifications",
    description:
      "Once the schedule is finalized, our system sends automated notifications to students and faculty, keeping everyone informed in real-time.",
    image: image,  
  },
];


 

export const Features = () => {
  return (
    <section
      id="features"
      className="container py-10 space-y-8 px-2"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Many{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Great Features
        </span>
      </h2>
        <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
      No Overlaps • Optimal Room Allocation • Admin Control • Easy Exports
    </p>

     

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image }: FeatureProps) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>

            <CardFooter>
              <img
                src={image}
                alt="About feature"
                className="w-[200px] lg:w-[300px] mx-auto"
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
