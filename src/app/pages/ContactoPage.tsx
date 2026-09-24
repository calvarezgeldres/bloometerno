import React from "react";
import { MessageCircle, Instagram, Mail } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import { PageHeader } from "../components/PageHeader";

const contactChannels = [
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: "+56 9 1234 5678",
    href: "https://wa.me/56912345678",
  },
  {
    Icon: Instagram,
    label: "Instagram",
    value: "@bloometerno",
    href: "https://instagram.com",
  },
  {
    Icon: Mail,
    label: "Email",
    value: "hola@bloometerno.cl",
    href: "mailto:hola@bloometerno.cl",
  },
];

export const ContactoPage: React.FC = () => {
  return (
    <PageLayout>
      <main>
        <PageHeader
          eyebrow="Hablemos"
          title="Contacto"
          subtitle="Escríbenos por el canal que prefieras, te respondemos a la brevedad."
        />
        <section style={{ backgroundColor: "var(--background)", padding: "4rem 2rem 5rem" }}>
          <div
            style={{
              maxWidth: "760px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
            className="max-lg:grid-cols-1"
          >
            {contactChannels.map(({ Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.9rem",
                  padding: "2rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "0.85rem",
                  textDecoration: "none",
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} strokeWidth={1.5} color="var(--primary)" />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.14em",
                      color: "var(--gold)",
                      fontWeight: 600,
                      textTransform: "uppercase" as const,
                      margin: "0 0 0.4rem",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.05rem",
                      color: "var(--foreground)",
                      margin: 0,
                    }}
                  >
                    {value}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </PageLayout>
  );
};
