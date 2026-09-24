import React from "react";
import { Hero } from "../components/Hero";
import { RealCreations } from "../components/RealCreations";
import { Marquee } from "../components/Marquee";
import { Categories } from "../components/Categories";
import { PromoBanner } from "../components/PromoBanner";
import { Testimonials } from "../components/Testimonials";
import { Benefits } from "../components/Benefits";
import { FAQ } from "../components/FAQ";
import { Newsletter } from "../components/Newsletter";

export const StorePage: React.FC = () => {
  return (
    <main>
      <Hero />
      <RealCreations />
      <Marquee />
      <Categories />
      <Testimonials />
      <PromoBanner />
      <Benefits />
      <FAQ />
      <Newsletter />
    </main>
  );
};
