import React from "react";
import { X, Printer } from "lucide-react";
import { Order, StoreSettings } from "../types/store";

interface Props {
  order: Order;
  settings: StoreSettings;
  onClose: () => void;
}

/**
 * Etiqueta de despacho genérica (no integrada con Blueexpress/Correos de
 * Chile — esas empresas asignan su propio número de seguimiento cuando
 * reciben el paquete). Pensada para imprimirse en una Phomemo PM-241-BT u
 * otra impresora de etiquetas de 100x150mm (4x6"), conectada como impresora
 * normal de Windows (vía USB o Bluetooth ya emparejada).
 */
export const EtiquetaDespachoModal: React.FC<Props> = ({ order, settings, onClose }) => {
  return (
    <div
      className="etiqueta-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .etiqueta-print-area, .etiqueta-print-area * { visibility: visible; }
          .etiqueta-print-area {
            position: absolute;
            top: 0;
            left: 0;
            box-shadow: none !important;
            border: none !important;
          }
          .etiqueta-no-print { display: none !important; }
          @page { size: 100mm 150mm; margin: 0; }
        }
      `}</style>

      <div className="etiqueta-no-print" onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(33, 28, 18, 0.65)" }} />

      <div
        style={{
          position: "relative",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <div
          className="etiqueta-print-area"
          style={{
            width: "100mm",
            minHeight: "150mm",
            backgroundColor: "#fff",
            color: "#000",
            padding: "5mm",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Arial, sans-serif",
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "3mm", marginBottom: "3mm" }}>
            <div style={{ fontSize: "14pt", fontWeight: 700 }}>BLOOM ETERNO</div>
            <div style={{ fontSize: "8pt" }}>Contacto: {settings.whatsappNumber}</div>
          </div>

          <div style={{ fontSize: "7pt", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1mm" }}>
            Destinatario
          </div>
          <div style={{ fontSize: "13pt", fontWeight: 700, lineHeight: 1.3 }}>{order.customer.name}</div>
          <div style={{ fontSize: "11pt", lineHeight: 1.4, marginTop: "1mm" }}>
            {order.customer.address}
            <br />
            {order.customer.comuna}, {order.customer.region}
          </div>
          <div style={{ fontSize: "11pt", marginTop: "1mm" }}>Tel: {order.customer.phone}</div>

          <div style={{ borderTop: "1px dashed #000", margin: "3mm 0" }} />

          <div style={{ fontSize: "7pt", textTransform: "uppercase", letterSpacing: "1px" }}>Método de despacho</div>
          <div style={{ fontSize: "10pt", fontWeight: 600 }}>{order.shippingMethod}</div>

          <div style={{ borderTop: "1px dashed #000", margin: "3mm 0" }} />

          <div style={{ fontSize: "7pt", textTransform: "uppercase", letterSpacing: "1px" }}>Contenido</div>
          <div style={{ fontSize: "9pt", lineHeight: 1.5 }}>
            {order.items.map((item, i) => (
              <div key={i}>
                {item.quantity}x {item.productName}
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ borderTop: "2px solid #000", paddingTop: "2mm", textAlign: "center" }}>
            <div style={{ fontSize: "16pt", fontWeight: 700, letterSpacing: "1px" }}>#{order.orderNumber}</div>
            <div style={{ fontSize: "7pt" }}>{new Date(order.createdAt).toLocaleDateString("es-CL")}</div>
          </div>
        </div>

        <div className="etiqueta-no-print" style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => window.print()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "2rem",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <Printer size={16} />
            Imprimir
          </button>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#fff",
              border: "1px solid var(--border)",
              padding: "0.75rem 1.5rem",
              borderRadius: "2rem",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <X size={16} />
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
