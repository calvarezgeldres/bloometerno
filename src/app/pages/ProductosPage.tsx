import React from "react";
import { PageLayout } from "../components/PageLayout";
import { PageHeader } from "../components/PageHeader";
import { Products } from "../components/Products";

export const ProductosPage: React.FC = () => {
  return (
    <PageLayout>
      <main>
        <PageHeader
          eyebrow="Catálogo"
          title="Todos nuestros productos"
          subtitle="Piedras, mostacillas, cristales, kits y herramientas seleccionadas para tus creaciones."
        />
        <Products />
      </main>
    </PageLayout>
  );
};
