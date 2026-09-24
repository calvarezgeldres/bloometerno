import React from "react";
import { PageLayout } from "../components/PageLayout";
import { PageHeader } from "../components/PageHeader";
import { Products } from "../components/Products";

export const KitsPage: React.FC = () => {
  return (
    <PageLayout>
      <main>
        <PageHeader
          eyebrow="Kits creativos"
          title="Arma tu propio kit"
          subtitle="Todo lo que necesitas en un solo lugar, listo para empezar a crear."
        />
        <Products initialCategory="Kits" />
      </main>
    </PageLayout>
  );
};
