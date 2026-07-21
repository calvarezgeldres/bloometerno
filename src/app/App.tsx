import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { Categories } from "./components/Categories";
import { Products } from "./components/Products";
import { BrandStory } from "./components/BrandStory";
import { PromoBanner } from "./components/PromoBanner";
import { Benefits } from "./components/Benefits";
import { Newsletter } from "./components/Newsletter";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        overflowX: "hidden",
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

        @media (max-width: 768px) {
          .bento-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }
          .bento-card-featured {
            grid-column: 1 / -1 !important;
            grid-row: auto !important;
          }
          .bento-card-small {
            grid-column: span 1 !important;
          }
        }

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

      <Header />
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
      <Footer />
    </div>
  );
}
