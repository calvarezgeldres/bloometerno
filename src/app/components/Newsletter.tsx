import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail("");
  };

  return (
    <section
      style={{
        backgroundColor: "var(--background)",
        padding: "5rem 2rem",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Hairline top */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "4rem",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
          <span style={{ color: "var(--gold)", fontSize: "0.6rem", letterSpacing: "0.01em" }}>✦</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
        </div>

        {/* Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }}
          className="max-lg:grid-cols-1 max-lg:gap-10"
        >
          {/* Left */}
          <div>
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
              Comunidad Bloom
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                fontWeight: 400,
                color: "var(--foreground)",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                margin: "0 0 1.25rem",
              }}
            >
              Inspírate con{" "}
              <em style={{ fontStyle: "italic", color: "var(--primary)" }}>
                Bloom Eterno
              </em>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--muted-foreground)",
                fontSize: "0.95rem",
                lineHeight: 1.8,
                fontWeight: 300,
                margin: "0",
                maxWidth: "400px",
              }}
            >
              Recibe novedades, ideas de combinaciones y lanzamientos especiales. Nos tomamos en serio la inspiración, no el spam.
            </p>
          </div>

          {/* Right */}
          <div>
            {done ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "2rem",
                  backgroundColor: "var(--card)",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={16} color="var(--primary-foreground)" strokeWidth={2} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "var(--primary)",
                      margin: "0 0 0.25rem",
                    }}
                  >
                    ¡Bienvenida a Bloom!
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      color: "var(--muted-foreground)",
                      margin: 0,
                      fontWeight: 300,
                    }}
                  >
                    Pronto recibirás novedades e inspiración directo en tu correo.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.7rem",
                      letterSpacing: "0.1em",
                      color: "var(--muted-foreground)",
                      marginBottom: "0.5rem",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    Tu correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.875rem 1.25rem",
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      color: "var(--foreground)",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    width: "100%",
                    padding: "0.875rem",
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase" as const,
                    cursor: "pointer",
                    marginBottom: "0.75rem",
                  }}
                >
                  Suscribirme <ArrowRight size={13} />
                </button>

                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.7rem",
                    color: "var(--muted-foreground)",
                    fontWeight: 300,
                    margin: 0,
                  }}
                >
                  Sin spam. Puedes darte de baja cuando quieras.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
