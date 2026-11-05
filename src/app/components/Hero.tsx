import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Accent } from "./SectionHeading";

const SLIDES: {
  image: string;
  alt: string;
  focus: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  cta: { label: string; to: string };
}[] = [
  {
    image: "/gallery/ramo-mixto.webp",
    alt: "Ramo de flores tejidas en mostacillas: lirios, tulipanes y flor de nube",
    focus: "center 40%",
    eyebrow: "Colección 2026",
    title: (
      <>
        Materiales que <Accent>florecen</Accent> en tus manos
      </>
    ),
    subtitle: "Mostacillas, alambres y accesorios seleccionados para crear piezas únicas con alma natural.",
    cta: { label: "Ver productos", to: "/productos" },
  },
  {
    image: "/gallery/lilium-azul-lazo.webp",
    alt: "Ramo de lirios azules tejidos en mostacillas con lazo de regalo",
    focus: "center 30%",
    eyebrow: "Hecho a mano",
    title: (
      <>
        Piezas únicas, con <Accent>alma natural</Accent>
      </>
    ),
    subtitle: "Conoce la historia detrás de Bloom Eterno y por qué cada material está pensado con intención.",
    cta: { label: "Conócenos", to: "/nosotros" },
  },
];

const AUTOPLAY_MS = 6000;

export function Hero() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (index: number) => {
    setActive(index);
    resetAutoplay();
  };

  const goDelta = (delta: 1 | -1) => {
    setActive((prev) => (prev + delta + SLIDES.length) % SLIDES.length);
    resetAutoplay();
  };

  // Texto a la izquierda y foto a la derecha (en celular: foto arriba, texto abajo).
  // Las fotos son verticales: a todo el ancho se recortaban a ~1/4 y se pixelaban.
  return (
    <section id="inicio" style={{ backgroundColor: "var(--background)" }}>
      <div className="hero-grid">
        {/* Texto (las diapositivas se superponen y cambian con un fundido) */}
        <div className="hero-text">
          <div style={{ position: "relative" }} className="hero-text-slides">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.image}
                aria-hidden={i !== active}
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  inset: i === 0 ? undefined : 0,
                  opacity: i === active ? 1 : 0,
                  transition: "opacity 0.8s ease",
                  pointerEvents: i === active ? "auto" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <div style={{ width: "2rem", height: "1px", backgroundColor: "var(--gold)" }} />
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      color: "var(--gold)",
                      fontWeight: 500,
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {slide.eyebrow}
                  </span>
                </div>

                {/* Solo la diapositiva visible es el h1 de la página */}
                {React.createElement(
                  i === active ? "h1" : "p",
                  {
                    style: {
                      fontFamily: "var(--font-display)",
                      color: "var(--heading)",
                      fontSize: "clamp(2.1rem, 4vw, 3.4rem)",
                      fontWeight: 400,
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      margin: 0,
                    },
                  },
                  slide.title
                )}

                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--muted-foreground)",
                    fontSize: "0.95rem",
                    lineHeight: 1.75,
                    fontWeight: 300,
                    margin: "1.25rem 0 2rem",
                    maxWidth: "440px",
                  }}
                >
                  {slide.subtitle}
                </p>

                <Link
                  to={slide.cta.to}
                  tabIndex={i === active ? 0 : -1}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    padding: "0.9rem 1.75rem",
                    borderRadius: "2rem",
                    textDecoration: "none",
                  }}
                >
                  {slide.cta.label} <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>

          {/* Controles: flechas, puntos y contador */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginTop: "2.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => goDelta(d)}
                  aria-label={d === -1 ? "Anterior" : "Siguiente"}
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--heading)",
                  }}
                >
                  {d === -1 ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.image}
                  onClick={() => goTo(i)}
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                  style={{
                    width: i === active ? "1.75rem" : "0.5rem",
                    height: "0.5rem",
                    borderRadius: "1rem",
                    border: "none",
                    backgroundColor: i === active ? "var(--gold)" : "var(--border)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: "0.68rem", letterSpacing: "0.1em", color: "var(--muted-foreground)" }}>
              {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Foto: recuadro vertical, así el ramo se ve casi completo y nítido */}
        <div className="hero-photo">
          {SLIDES.map((slide, i) => (
            <img
              key={slide.image}
              src={slide.image}
              alt={i === active ? slide.alt : ""}
              aria-hidden={i !== active}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: slide.focus,
                display: "block",
                opacity: i === active ? 1 : 0,
                transition: "opacity 1s ease",
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .hero-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2.5rem 2rem 3.5rem;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: clamp(2rem, 5vw, 5rem);
        }
        .hero-text { padding: 1rem 0; }
        .hero-photo {
          position: relative;
          height: clamp(460px, 70vh, 620px);
          aspect-ratio: 4 / 5;
          border-radius: 1rem;
          overflow: hidden;
          background-color: var(--muted);
          border: 1px solid var(--border);
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; padding: 1.25rem 1rem 3rem; gap: 1.75rem; }
          .hero-photo { order: -1; height: auto; width: 100%; max-width: 520px; aspect-ratio: 4 / 5; max-height: 62vh; margin: 0 auto; }
          .hero-text { max-width: 520px; margin: 0 auto; width: 100%; }
          .hero-text { padding: 0; }
        }
      `}</style>
    </section>
  );
}
