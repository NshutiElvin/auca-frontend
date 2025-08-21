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
    <div className="relative w-full h-screen overflow-hidden">
  <img
    src={"/hero.jpg"}
    alt="Bright Hotel exterior"
    className="w-full h-full object-cover scale-110 animate-float"
  />
  
  {/* Overlay with text */}
  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in-down">
        Welcome to Bright Hotel
      </h1>
      <p className="text-xl md:text-2xl mb-8 animate-fade-in-up">
        Luxury and comfort in the heart of the city
      </p>
      <button className="px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors animate-pulse">
        Book Your Stay
      </button>
    </div>
  </div>
</div>

<style jsx>{`
  @keyframes float {
    0%, 100% {
      transform: scale(1.1) translateY(0px);
    }
    50% {
      transform: scale(1.1) translateY(-20px);
    }
  }
  
  @keyframes fade-in-down {
    0% {
      opacity: 0;
      transform: translateY(-50px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fade-in-up {
    0% {
      opacity: 0;
      transform: translateY(50px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  .animate-float {
    animation: float 10s ease-in-out infinite;
  }
  
  .animate-fade-in-down {
    animation: fade-in-down 1.5s ease-out forwards;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 1.5s ease-out 0.5s forwards;
    opacity: 0;
  }
  
  .animate-pulse {
    animation: pulse 2s ease-in-out infinite 1s;
  }
`}</style>

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