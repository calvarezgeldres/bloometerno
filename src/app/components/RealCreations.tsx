import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Accent, SectionHeading } from "./SectionHeading";

const PIECES = [
  {
    src: "/gallery/ramo-mixto.webp",
    alt: "Ramo mixto de flores en mostacillas: lirios, tulipanes y flor de nube",
    title: "Arreglo Floral | Tamaño M",
  },
  {
    src: "/gallery/lilium-azul-mano.webp",
    alt: "Ramo de lirios azules tejidos en mostacillas",
    title: "Arreglo Floral | Tamaño S",
  },
  {
    src: "/gallery/suculentas-macetero.webp",
    alt: "Macetero con suculentas tejidas en mostacillas",
    title: "Suculentas | Tamaño M",
  },
  {
    src: "/gallery/lengua-de-suegra.webp",
    alt: "Lengua de suegra tejida en mostacillas verdes, en macetero rosado con el isotipo de Bloom Eterno",
    title: "Lengua de Suegra | Tamaño S",
  },
  {
    src: "/gallery/suculenta-s.webp",
    alt: "Suculenta tejida en mostacillas verdes en un macetero de cemento gris con pintas blancas",
    title: "Suculenta | Tamaño S",
  },
];

export function RealCreations() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Qué flechas sirven según dónde va el carrusel (la que no sirve se ve apagada)
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 300) + 20;
    el.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  return (
    <section
      id="creaciones"
      style={{
        backgroundColor: "var(--background)",
        padding: "5rem 0",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
        <SectionHeading eyebrow="Productos destacados">
          Hecho a <Accent>mano</Accent>. Hecho para <Accent>siempre</Accent>
        </SectionHeading>

        {/* Carrusel con flechas a los costados (como "Featured Products" de johnbead.com):
            centradas en la altura de la foto y apagadas cuando no hay más hacia ese lado */}
        <div style={{ position: "relative" }}>
          <CarouselArrow direction="prev" enabled={canPrev} onClick={() => scrollByCard(-1)} />
          <CarouselArrow direction="next" enabled={canNext} onClick={() => scrollByCard(1)} />

          {/* Scroll-snap carousel */}
          <div
            ref={scrollerRef}
            onScroll={updateArrows}
            style={{
              display: "flex",
              gap: "1.25rem",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              paddingBottom: "0.5rem",
              scrollbarWidth: "none",
            }}
          >
            {PIECES.map((piece) => (
              <div
                key={piece.src}
                data-card
                style={{
                  flex: "0 0 auto",
                  width: CARD_WIDTH,
                  scrollSnapAlign: "start",
                }}
              >
                <div
                  style={{
                    borderRadius: "0.9rem",
                    overflow: "hidden",
                    aspectRatio: "3/4",
                    backgroundColor: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <img
                    src={piece.src}
                    alt={piece.alt}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    margin: "0.85rem 0 0",
                  }}
                >
                  {piece.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Alto de la foto = ancho de la tarjeta × 4/3; la flecha va a la mitad de esa altura
const CARD_WIDTH = "min(78vw, 300px)";

function CarouselArrow({ direction, enabled, onClick }: { direction: "prev" | "next"; enabled: boolean; onClick: () => void }) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const style: React.CSSProperties = {
    position: "absolute",
    top: `calc(${CARD_WIDTH} * 2 / 3)`,
    [direction === "prev" ? "left" : "right"]: "-0.6rem",
    transform: "translateY(-50%)",
    zIndex: 2,
    width: "2.75rem",
    height: "2.75rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: enabled ? "none" : "1px solid var(--border)",
    backgroundColor: enabled ? "var(--primary)" : "var(--background)",
    color: enabled ? "var(--primary-foreground)" : "var(--muted-foreground)",
    opacity: enabled ? 1 : 0.6,
    cursor: enabled ? "pointer" : "default",
    boxShadow: enabled ? "0 4px 14px rgba(5,60,41,0.25)" : "none",
    transition: "background-color 0.2s ease, opacity 0.2s ease",
  };
  return (
    <button type="button" onClick={onClick} disabled={!enabled} aria-label={direction === "prev" ? "Anterior" : "Siguiente"} style={style}>
      <Icon size={20} strokeWidth={1.75} />
    </button>
  );
}
