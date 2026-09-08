import React from "react";
import { Link } from "react-router";
import { XCircle, MessageCircle } from "lucide-react";
import { useStore } from "../context/StoreContext";

export const PagoErrorPage: React.FC = () => {
  const { settings } = useStore();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        backgroundColor: "var(--background)",
      }}
    >
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <XCircle size={44} color="var(--destructive)" style={{ margin: "0 auto 1.5rem" }} />

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", color: "var(--foreground)", margin: "0 0 0.75rem" }}>
          El pago no se pudo procesar
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Tu carrito sigue guardado — podés volver a la tienda e intentarlo de nuevo, o escribirnos si el problema persiste.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            to="/"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              padding: "0.85rem",
              borderRadius: "2rem",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.85rem",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Volver a la tienda
          </Link>

          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              textDecoration: "none",
              padding: "0.75rem",
              borderRadius: "2rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
            }}
          >
            <MessageCircle size={16} />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};
