import React from "react";
import { PageLayout } from "../components/PageLayout";
import { PageHeader } from "../components/PageHeader";
import { BrandStory } from "../components/BrandStory";

export const NosotrosPage: React.FC = () => {
  return (
    <PageLayout>
      <main>
        <PageHeader eyebrow="Nuestra historia" title="Sobre Bloom Eterno" />
        <BrandStory />
      </main>
    </PageLayout>
  );
};
