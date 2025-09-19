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
