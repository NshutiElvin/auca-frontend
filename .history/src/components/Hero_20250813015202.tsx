import { Button } from "./ui/button";
import { buttonVariants } from "./ui/button";
import { HeroCards } from "./HeroCards";
import { ShieldUser } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={"/hero.jpg"}
          alt="Bright Hotel exterior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container grid lg:grid-cols-2 place-items-center py-20 gap-16 relative z-10 px-6 md:px-10">
        
        {/* Hero Content */}
        <div className="text-center lg:text-start space-y-8 max-w-2xl">
          
          {/* Main Heading */}
          <main className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              <span className="inline-block">
                <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                  Say
                </span>{" "}
                <span className="text-white">Goodbye</span>
              </span>
              <br />
              <span className="inline-block mt-2">
                <span className="text-white">to</span>{" "}
                <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
                  Exam
                </span>{" "}
                <span className="text-white">Clashes</span>
              </span>
            </h1>
          </main>

          {/* Description */}
          <p className="text-lg md:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0 text-white">
            A smart, automated system that generates conflict-free, student-friendly exam timetables in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button className="px-8 py-3 text-base">
              Get Started
            </Button>

            <Link
              rel="noreferrer noopener"
              to="/login"
              className={`px-8 py-3 text-base inline-flex items-center justify-center ${buttonVariants({
                variant: "outline",
              })}`}
            >
              Login
              <ShieldUser className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Hero Cards Section */}
        <div className="w-full flex justify-center lg:justify-end">
          <HeroCards />
        </div>
      </div>
    </section>
  );
};