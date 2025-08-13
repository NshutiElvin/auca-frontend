import { Button } from "./ui/button";
import { buttonVariants } from "./ui/button";
import { HeroCards } from "./HeroCards";
import { ShieldUser, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image with Enhanced Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={"/hero.jpg"}
          alt="Modern exam scheduling system"
          className="w-full h-full object-cover"
        />
        {/* Multi-layer gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="container grid lg:grid-cols-2 place-items-center py-20 gap-16 relative z-10 px-6 md:px-10">
        
        {/* Hero Content */}
        <div className="text-center lg:text-start space-y-8 max-w-2xl">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            AI-Powered Scheduling
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Main Heading */}
          <main className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="inline-block">
                <span className="inline bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 text-transparent bg-clip-text animate-pulse">
                  Say
                </span>{" "}
                <span className="text-white">Goodbye</span>
              </span>
              <br />
              <span className="inline-block mt-2">
                <span className="text-white/90">to</span>{" "}
                <span className="inline bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-transparent bg-clip-text">
                  Exam
                </span>{" "}
                <span className="text-white">Clashes</span>
              </span>
            </h1>
          </main>

          {/* Description */}
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">
            A smart, automated system that generates 
            <span className="text-cyan-300 font-medium"> conflict-free</span>, 
            <span className="text-pink-300 font-medium"> student-friendly</span> exam 
            timetables in seconds.
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Zero Conflicts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>Instant Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <span>Smart Optimization</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg"
              className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Link
              to="/login"
              className={`group ${buttonVariants({
                variant: "outline",
                size: "lg"
              })} bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105`}
            >
              <ShieldUser className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              Login
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-white/20">
            <div className="flex items-center justify-center lg:justify-start gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full" />
                <span>50K+ Exams Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-purple-400 rounded-full" />
                <span>500+ Universities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Cards Section */}
        <div className="relative">
          {/* Glow effect behind cards */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl transform rotate-6 scale-110" />
          <div className="relative z-10">
            <HeroCards />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-5" />
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};