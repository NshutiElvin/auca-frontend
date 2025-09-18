import { About } from "../components/About";
import { FAQ } from "../components/FAQ";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { Navbar } from "../components/Navbar";
 
import { ScrollToTop } from "../components/ScrollToTop";
 
import "./App.css";
import DotGrid from "../dotgrid";

function HomePage() {
  return (
    <>
   <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#5227FF"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <Features />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </>
  );
}

export default HomePage;
