import { BrowserRouter, Routes, Route } from "react-router";
import { StoreProvider } from "./context/StoreContext";
import { PageLayout } from "./components/PageLayout";
import { ScrollToTop } from "./components/ScrollToTop";
import { StorePage } from "./pages/StorePage";
import { ProductosPage } from "./pages/ProductosPage";
import { ProductoDetallePage } from "./pages/ProductoDetallePage";
import { NosotrosPage } from "./pages/NosotrosPage";
import { ContactoPage } from "./pages/ContactoPage";
import { AdminPage } from "./pages/AdminPage";
import { PagoResultadoPage } from "./pages/PagoResultadoPage";
import { PagoErrorPage } from "./pages/PagoErrorPage";

function StoreLayout() {
  return (
    <PageLayout>
      <StorePage />
    </PageLayout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            // "clip" y no "hidden": hidden convierte este div en contenedor de scroll y el
            // encabezado sticky deja de quedarse fijo arriba al bajar.
            overflowX: "clip",
            minHeight: "100vh",
          }}
        >
          <style>{`
            *, *::before, *::after { box-sizing: border-box; }

            ::selection {
              background-color: var(--gold-light);
              color: var(--foreground);
            }

            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 3px; }
            ::-webkit-scrollbar-thumb:hover { background: var(--muted-foreground); }

            @media (max-width: 1024px) {
              .max-lg\\:grid-cols-1 { grid-template-columns: 1fr !important; }
              .max-lg\\:grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
              .max-lg\\:gap-12 { gap: 3rem !important; }
            }

            @media (max-width: 640px) {
              .max-sm\\:grid-cols-1 { grid-template-columns: 1fr !important; }
              .max-sm\\:grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
            }
          `}</style>

          <Routes>
            <Route path="/" element={<StoreLayout />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/producto/:id" element={<ProductoDetallePage />} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pago-resultado" element={<PagoResultadoPage />} />
            <Route path="/pago-error" element={<PagoErrorPage />} />
            <Route path="*" element={<StoreLayout />} />
          </Routes>
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
