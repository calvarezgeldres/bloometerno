import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    image: "/gallery/ramo-mixto.webp",
    focus: "center 38%",
    eyebrow: "Colección 2026",
    title: "Materiales que florecen en tus manos",
    subtitle: "Piedras, mostacillas y accesorios seleccionados para crear piezas únicas con alma natural.",
    cta: { label: "Ver productos", to: "/productos" },
  },
  {
    image: "/gallery/suculentas-macetero.webp",
    focus: "center 35%",
    eyebrow: "Kits creativos",
    title: "Arma tu primera pieza hoy mismo",
    subtitle: "Kits completos con todo lo necesario para empezar a crear, incluso si es tu primera vez.",
    cta: { label: "Ver kits", to: "/kits" },
  },
  {
    image: "/gallery/lilium-azul-lazo.webp",
    focus: "center 18%",
    eyebrow: "Hecho a mano",
    title: "Piezas únicas, con alma natural",
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

  return (
    <section
      id="inicio"
      style={{
        position: "relative",
        overflow: "hidden",
        height: "clamp(520px,78vh,680px)",
        backgroundColor: "var(--olive-dark)",
      }}
    >
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === active ? 1 : 0,
            transition: "opacity 1s ease",
            pointerEvents: i === active ? "auto" : "none",
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: slide.focus,
              display: "block",
            }}
          />
          {/* Content — sin degradado sobre la foto; la sombra del texto mantiene la legibilidad */}
          <div
            style={{
              position: "relative",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 clamp(1.5rem, 5vw, 4rem)",
              textShadow: "0 2px 12px rgba(20,35,24,0.65), 0 1px 3px rgba(20,35,24,0.5)",
            }}
          >
            <div style={{ maxWidth: "480px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "2rem", height: "1px", backgroundColor: "var(--gold-light)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.2em",
                    color: "var(--gold-muted)",
                    fontWeight: 500,
                    textTransform: "uppercase" as const,
                  }}
                >
                  {slide.eyebrow}
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--background)",
                  fontSize: "clamp(2rem, 4vw, 3.25rem)",
                  fontWeight: 400,
                  lineHeight: 1.12,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {slide.title}
              </h1>

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  color: "rgba(255,252,249,0.75)",
                  fontSize: "0.9rem",
                  lineHeight: 1.75,
                  fontWeight: 300,
                  margin: "1.5rem 0 2rem",
                }}
              >
                {slide.subtitle}
              </p>

              <Link
                to={slide.cta.to}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "var(--gold)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  padding: "0.875rem 1.75rem",
                  borderRadius: "2rem",
                  textDecoration: "none",
                }}
              >
                {slide.cta.label} <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button
        onClick={() => goDelta(-1)}
        aria-label="Anterior"
        style={{
          position: "absolute",
          top: "50%",
          left: "clamp(1rem, 3vw, 2rem)",
          transform: "translateY(-50%)",
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "50%",
          border: "1px solid rgba(255,252,249,0.35)",
          backgroundColor: "rgba(255,252,249,0.1)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          zIndex: 2,
        }}
      >
        <ArrowLeft size={16} />
      </button>
      <button
        onClick={() => goDelta(1)}
        aria-label="Siguiente"
        style={{
          position: "absolute",
          top: "50%",
          right: "clamp(1rem, 3vw, 2rem)",
          transform: "translateY(-50%)",
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "50%",
          border: "1px solid rgba(255,252,249,0.35)",
          backgroundColor: "rgba(255,252,249,0.1)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          zIndex: 2,
        }}
      >
        <ArrowRight size={16} />
      </button>

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "clamp(1.5rem, 4vw, 2.5rem)",
          left: "clamp(1.5rem, 5vw, 4rem)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          zIndex: 2,
        }}
      >
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
              backgroundColor: i === active ? "var(--gold-light)" : "rgba(255,252,249,0.4)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Corner counter */}
      <div
        style={{
          position: "absolute",
          top: "clamp(1.5rem, 3vw, 2.5rem)",
          right: "clamp(1.5rem, 3vw, 2.5rem)",
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          color: "rgba(255,252,249,0.5)",
          fontWeight: 400,
          zIndex: 2,
        }}
      >
        {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
      </div>
    </section>
  );
}
