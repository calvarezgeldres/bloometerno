export function BrandStory() {
  return (
    <section
      id="marca"
      style={{
        backgroundColor: "var(--olive-dark)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grain texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.07'/%3E%3C/svg%3E")`,
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />

      {/* Top section — oversized quote */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 2rem 0",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
          <div style={{ width: "2.5rem", height: "1px", backgroundColor: "var(--gold)" }} />
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
            Nuestra filosofía
          </span>
        </div>

        {/* Massive italic quote */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            color: "rgba(246,240,227,0.92)",
            fontSize: "clamp(2.5rem, 6vw, 6rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: 0,
            maxWidth: "900px",
          }}
        >
          "Crear también es
          <br />
          <span style={{ color: "var(--gold-light)" }}>florecer."</span>
        </h2>
      </div>

      {/* Bottom section — two columns */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 2rem 5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          marginTop: "4rem",
          alignItems: "end",
          position: "relative",
        }}
        className="max-lg:grid-cols-1 max-lg:gap-12"
      >
        {/* Left — photo */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              borderRadius: "0.75rem",
              overflow: "hidden",
              aspectRatio: "4/3",
              backgroundColor: "rgba(246,240,227,0.1)",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1613634127284-af02d62cb752?w=800&h=600&fit=crop&auto=format&q=80"
              alt="Artesana trabajando con materiales naturales"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Sticker overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "-1.5rem",
              right: "-1.5rem",
              width: "7rem",
              height: "7rem",
              borderRadius: "50%",
              backgroundColor: "var(--gold)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              border: "3px solid var(--olive-dark)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--olive-dark)",
                lineHeight: 1,
                margin: 0,
              }}
            >
              100%
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                color: "var(--olive-dark)",
                margin: "0.15rem 0 0",
                textTransform: "uppercase" as const,
              }}
            >
              Natural
            </p>
          </div>
        </div>

        {/* Right — text */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(246,240,227,0.55)",
              fontSize: "1rem",
              lineHeight: 1.85,
              fontWeight: 300,
              margin: "0 0 1.5rem",
            }}
          >
            En Bloom Eterno seleccionamos materiales delicados y llenos de intención para quienes disfrutan crear con sus manos.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "rgba(246,240,227,0.55)",
              fontSize: "1rem",
              lineHeight: 1.85,
              fontWeight: 300,
              margin: "0 0 2.5rem",
            }}
          >
            Cada piedra, color y detalle está pensado para inspirar piezas únicas, personales y eternas. Creemos que cada pieza que nace de tus manos lleva parte de ti.
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0",
              borderTop: "1px solid rgba(246,240,227,0.12)",
              paddingTop: "2rem",
            }}
          >
            {[
              { n: "+200", label: "Materiales" },
              { n: "+1k", label: "Creadoras" },
              { n: "5★", label: "Valoración" },
            ].map(({ n, label }, i) => (
              <div
                key={label}
                style={{
                  borderRight: i < 2 ? "1px solid rgba(246,240,227,0.12)" : "none",
                  paddingRight: "1.5rem",
                  paddingLeft: i > 0 ? "1.5rem" : "0",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: "var(--gold-light)",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {n}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: "rgba(246,240,227,0.4)",
                    margin: "0.4rem 0 0",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
