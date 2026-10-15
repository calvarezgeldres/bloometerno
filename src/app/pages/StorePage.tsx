import React from "react";
import { Hero } from "../components/Hero";
import { RealCreations } from "../components/RealCreations";
import { Categories } from "../components/Categories";
import { Testimonials } from "../components/Testimonials";
import { Benefits } from "../components/Benefits";
import { FAQ } from "../components/FAQ";
import { Newsletter } from "../components/Newsletter";
import { SectionDivider } from "../components/SectionDivider";

export const StorePage: React.FC = () => {
  return (
    <main>
      <Hero />
      <RealCreations />
      <SectionDivider />
      <Categories />
      <SectionDivider />
      <Testimonials />
      <SectionDivider />
      <Benefits />
      <SectionDivider />
      <FAQ />
      <SectionDivider />
      <Newsletter />
    </main>
  );
};
