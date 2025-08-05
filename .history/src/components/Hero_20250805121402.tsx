import { Button } from "./ui/button";
import { buttonVariants } from "./ui/button";
import { HeroCards } from "./HeroCards";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import backgroundImage1 from '../assets/background.png';  
import { ShieldUser } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section
    id="hero"
      className="container grid lg:grid-cols-2 place-items-center py-5 md:py-16 gap-10 relative overflow-hidden px-10"
      style={{
        backgroundImage: `url(${backgroundImage1}), linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.3))`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
       

      <div className="text-center lg:text-start space-y-6 z-10 relative">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              Say
            </span>{" "}
            Goodbye
          </h1>{" "}
          to{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              Exam
            </span>{" "}
            Clashes
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          A smart, automated system that generates conflict-free, student-friendly exam timetables in seconds.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Button className="w-full md:w-1/3">Get Started</Button>

          <Link
            rel="noreferrer noopener"
            to="/login"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "outline",
            })}`}
          >
            Admin Login
            <ShieldUser  className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10 relative">
        <HeroCards />
      </div>
 
    </section>
  );
};