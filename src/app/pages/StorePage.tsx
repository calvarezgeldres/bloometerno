import React from "react";
import { Hero } from "../components/Hero";
import { RealCreations } from "../components/RealCreations";
import { Marquee } from "../components/Marquee";
import { Categories } from "../components/Categories";
import { Products } from "../components/Products";
import { BrandStory } from "../components/BrandStory";
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
      <Products />
      <BrandStory />
      <PromoBanner />
      <Testimonials />
      <Benefits />
      <FAQ />
      <Newsletter />
    </main>
  );
};
