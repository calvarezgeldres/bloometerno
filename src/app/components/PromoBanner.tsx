import { ArrowRight } from "lucide-react";

export function PromoBanner() {
  return (
    <section
      style={{
        backgroundColor: "var(--background)",
        padding: "5rem 2rem",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            overflow: "hidden",
            borderRadius: "1rem",
            border: "1px solid var(--border)",
          }}
          className="max-lg:grid-cols-1"
        >
          {/* Left — image */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: "360px",
              backgroundColor: "var(--muted)",
            }}
          >
            <img
              src="/gallery/lilium-azul-lazo.webp"
              alt="Ramo de lirios azules en mostacillas con lazo de regalo"
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to right, transparent 60%, var(--cream-deep) 100%)",
              }}
              className="max-lg:hidden"
            />
          </div>

          {/* Right — text */}
          <div
            style={{
              backgroundColor: "var(--cream-deep)",
              padding: "clamp(2rem, 5vw, 4rem)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: "var(--gold)",
                fontWeight: 500,
                textTransform: "uppercase" as const,
                marginBottom: "1rem",
              }}
            >
              Kit exclusivo
            </p>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.5vw, 3.2rem)",
                fontWeight: 400,
                color: "var(--foreground)",
                lineHeight: 1.1,
                margin: "0 0 1.25rem",
              }}
            >
              Arma tu primer
              <br />
              <em style={{ fontStyle: "italic", color: "var(--primary)", fontWeight: 600 }}>kit creativo</em>
            </h2>

            <div
              style={{
                width: "2.5rem",
                height: "1px",
                backgroundColor: "var(--gold)",
                marginBottom: "1.25rem",
              }}
            />

            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--muted-foreground)",
                fontSize: "0.9rem",
                lineHeight: 1.75,
                fontWeight: 300,
                margin: "0 0 2.25rem",
                maxWidth: "380px",
              }}
            >
              Elige tus piedras, mostacillas y accesorios favoritos para comenzar a crear. Todo lo que necesitas en un solo lugar.
            </p>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
              {["Materiales premium seleccionados", "Incluye guía de inicio", "Envío gratuito en kits"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      backgroundColor: "var(--gold)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 300,
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="#productos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                padding: "0.875rem 1.75rem",
                borderRadius: "2rem",
                textDecoration: "none",
                alignSelf: "flex-start",
              }}
            >
              Crear mi kit <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
