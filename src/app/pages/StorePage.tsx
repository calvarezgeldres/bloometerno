import React from "react";
import { Hero } from "../components/Hero";
import { Marquee } from "../components/Marquee";
import { Categories } from "../components/Categories";
import { Products } from "../components/Products";
import { BrandStory } from "../components/BrandStory";
import { PromoBanner } from "../components/PromoBanner";
import { Benefits } from "../components/Benefits";
import { Newsletter } from "../components/Newsletter";

export const StorePage: React.FC = () => {
  return (
    <main>
      <Hero />
      <Marquee />
      <Categories />
      <Products />
      <BrandStory />
      <PromoBanner />
      <Benefits />
      <Newsletter />
    </main>
  );
};
