// src/Home.js
import React from 'react';
import Hero from "../components/Hero";
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';


function HomePage() {
  return (
    <div className="font-sans">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
    </div>
  );
}

export default HomePage;