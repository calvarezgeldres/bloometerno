import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { useStore, mapDbOrder } from "../context/StoreContext";
import { db } from "../../lib/db";

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

export const PagoResultadoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const pendingId = searchParams.get("pending");
  // Mercado Pago agrega estos parámetros solos a la URL de retorno — nos
  // sirven para verificar el pago al toque, sin esperar al webhook (que según
  // su propia documentación puede demorar varios minutos en llegar).
  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
  const { settings, clearCart, refreshOrders } = useStore();

  const [estado, setEstado] = useState<"pendiente" | "aprobado" | "rechazado" | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [agotado, setAgotado] = useState(false);
  const didFinalize = useRef(false);

  useEffect(() => {
    if (!pendingId) return;
    let tries = 0;
    const maxTries = 8; // ~16s de polling
    let cancelled = false;

    const tick = async () => {
      try {
        const data = await db.mercadopago.getStatus(pendingId, paymentId);
        if (cancelled) return;
        if (data.estado !== "pendiente") {
          setEstado(data.estado);
          setOrder(data.order);
          return;
        }
      } catch {
        // sigue intentando
      }
      tries += 1;
      if (tries >= maxTries) {
        setAgotado(true);
        return;
      }
      setTimeout(tick, 2000);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [pendingId, paymentId]);

  useEffect(() => {
    if (estado === "aprobado" && !didFinalize.current) {
      didFinalize.current = true;
      clearCart();
      refreshOrders();
    }
  }, [estado, clearCart, refreshOrders]);

  const mappedOrder = order ? mapDbOrder(order) : null;

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
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
        {estado !== "aprobado" && (
          <>
            <Clock size={44} color="var(--gold)" style={{ margin: "0 auto 1.5rem" }} />
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", color: "var(--foreground)", margin: "0 0 0.75rem" }}>
              {agotado ? "Estamos confirmando tu pago" : "Confirmando tu pago…"}
            </h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              {agotado
                ? "Está tardando más de lo normal. Si Mercado Pago te confirmó el pago, tu pedido quedará registrado en breve."
                : "Esto toma solo unos segundos."}
            </p>
          </>
        )}

        {estado === "aprobado" && (
          <>
            <div
              style={{
                width: "4.5rem",
                height: "4.5rem",
                borderRadius: "50%",
                backgroundColor: "rgba(74, 92, 46, 0.15)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <CheckCircle2 size={42} />
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", color: "var(--foreground)", margin: "0 0 0.5rem" }}>
              ¡Gracias por tu pedido{mappedOrder ? `, ${mappedOrder.customer.name}` : ""}!
            </h1>

            {mappedOrder && (
              <>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "var(--cream-deep)",
                    padding: "0.4rem 1rem",
                    borderRadius: "2rem",
                    border: "1px solid var(--border)",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>
                    Orden: #{mappedOrder.orderNumber}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    padding: "1.25rem",
                    textAlign: "left",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "0.75rem" }}>
                    <strong style={{ color: "var(--foreground)" }}>Despacho:</strong> {mappedOrder.shippingMethod}
                    <br />
                    {mappedOrder.customer.address}, {mappedOrder.customer.comuna}, {mappedOrder.customer.region}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem", color: "var(--foreground)", borderTop: "1px dashed var(--border)", paddingTop: "0.75rem" }}>
                    {mappedOrder.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{item.quantity}x {item.productName}</span>
                        <span style={{ fontWeight: 600 }}>{formatCLP(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "0.85rem",
                      paddingTop: "0.75rem",
                      borderTop: "1px dashed var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "var(--foreground)", fontWeight: 500 }}>Total pagado:</span>
                    <span style={{ fontSize: "1.3rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--primary)" }}>
                      {formatCLP(mappedOrder.total)} CLP
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              backgroundColor: "#25D366",
              color: "#fff",
              textDecoration: "none",
              padding: "0.85rem",
              borderRadius: "2rem",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            <MessageCircle size={18} />
            Escribir por WhatsApp
          </a>

          <Link
            to="/"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              padding: "0.75rem",
              borderRadius: "2rem",
              fontSize: "0.8rem",
              fontFamily: "var(--font-body)",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
};
