import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section
      id="inicio"
      style={{
        backgroundColor: "var(--background)",
        minHeight: "100svh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        position: "relative",
        overflow: "hidden",
      }}
      className="max-lg:flex max-lg:flex-col"
    >
      {/* LEFT — text panel */}
      <div
        style={{
          backgroundColor: "var(--olive-dark)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "clamp(2.5rem, 6vw, 5rem)",
          position: "relative",
          overflow: "hidden",
          minHeight: "60vmin",
        }}
      >
        {/* Grain overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />

        {/* Decorative monogram watermark */}
        <div
          style={{
            position: "absolute",
            top: "-1rem",
            right: "-2rem",
            width: "clamp(260px, 35vw, 440px)",
            opacity: 0.06,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          <img
            src="/logos/bloom-monogram-light.png"
            alt=""
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        {/* Content */}
        <div style={{ position: "relative" }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
            <div style={{ width: "2rem", height: "1px", backgroundColor: "var(--gold)" }} />
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
              Colección 2025
            </span>
          </div>

          {/* Main heading */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--background)",
              fontSize: "clamp(2.8rem, 5.5vw, 5.5rem)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Materiales
            <br />
            <em
              style={{
                fontStyle: "italic",
                color: "var(--gold-light)",
                fontWeight: 300,
              }}
            >
              que florecen
            </em>
            <br />
            en tus manos
          </h1>

          {/* Divider ornament */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              margin: "2rem 0",
            }}
          >
            <div style={{ flex: 1, maxWidth: "3rem", height: "1px", backgroundColor: "rgba(246,240,227,0.3)" }} />
            <span style={{ color: "var(--gold)", fontSize: "0.6rem" }}>✦</span>
            <div style={{ flex: 1, maxWidth: "3rem", height: "1px", backgroundColor: "rgba(246,240,227,0.3)" }} />
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(246,240,227,0.6)",
              fontSize: "0.9rem",
              lineHeight: 1.75,
              fontWeight: 300,
              maxWidth: "340px",
              margin: "0 0 2.5rem",
            }}
          >
            Piedras, mostacillas y accesorios seleccionados para crear piezas únicas con alma natural.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
            <a
              href="#productos"
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
              Ver productos <ArrowRight size={13} />
            </a>
            <a
              href="#categorias"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                fontWeight: 400,
                letterSpacing: "0.1em",
                color: "rgba(246,240,227,0.7)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(246,240,227,0.3)",
                paddingBottom: "2px",
              }}
            >
              Explorar colecciones
            </a>
          </div>
        </div>

        {/* Corner number */}
        <div
          style={{
            position: "absolute",
            top: "clamp(1.5rem, 3vw, 2.5rem)",
            right: "clamp(1.5rem, 3vw, 2.5rem)",
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            color: "rgba(246,240,227,0.25)",
            fontWeight: 400,
          }}
        >
          01 / 05
        </div>
      </div>

      {/* RIGHT — image panel */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "var(--cream-deep)",
          minHeight: "50vmin",
        }}
      >
        <img
          src="/gallery/ramo-mixto.webp"
          alt="Ramo mixto de flores en mostacillas hecho a mano"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />

        {/* Subtle vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 50%, rgba(58,74,34,0.15) 100%)",
          }}
        />

        {/* Floating stat card */}
        <div
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "2rem",
            backgroundColor: "var(--background)",
            borderRadius: "0.75rem",
            padding: "1.25rem 1.5rem",
            border: "1px solid rgba(33,28,18,0.08)",
            boxShadow: "0 16px 48px rgba(33,28,18,0.12)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 600,
              color: "var(--primary)",
              lineHeight: 1,
              margin: 0,
            }}
          >
            +200
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              color: "var(--muted-foreground)",
              margin: "0.3rem 0 0",
              textTransform: "uppercase" as const,
            }}
          >
            Materiales únicos
          </p>
        </div>

        {/* Gold accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "3px",
            height: "40%",
            backgroundColor: "var(--gold)",
            opacity: 0.6,
          }}
        />
      </div>
    </section>
  );
}
