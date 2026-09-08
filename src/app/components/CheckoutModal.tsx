import React, { useState } from "react";
import { X, CheckCircle2, Copy, Send, Truck, CreditCard, ShieldCheck, AlertCircle, Wallet } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { CHILE_REGIONS, SHIPPING_METHODS } from "../data/chileData";
import { formatRut, isValidRut } from "../../lib/rut";
import { db } from "../../lib/db";

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartTotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    createOrder,
    settings,
  } = useStore();

  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regionId, setRegionId] = useState("RM");
  const [comuna, setComuna] = useState("Providencia");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingMethodId, setShippingMethodId] = useState("private_courier");
  const [rutError, setRutError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Transferencia Bancaria" | "Mercado Pago">("Transferencia Bancaria");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  if (!isCheckoutOpen) return null;

  const currentRegion = CHILE_REGIONS.find((r) => r.id === regionId) || CHILE_REGIONS[0];
  const isRM = regionId === "RM";
  const freeShippingLimit = settings.freeShippingThreshold || 35000;
  const isFreeShipping = cartTotal >= freeShippingLimit;

  // Calcular costo de envío
  const selectedMethod = SHIPPING_METHODS.find((m) => m.id === shippingMethodId) || SHIPPING_METHODS[0];
  const rawShippingCost = isRM ? selectedMethod.costRM : selectedMethod.costRegions;
  const needsShippingCoordination = rawShippingCost === null;
  let calculatedShippingCost = rawShippingCost ?? 0;
  if (isFreeShipping && selectedMethod.id !== "pickup" && !needsShippingCoordination) {
    calculatedShippingCost = 0;
  }

  const grandTotal = cartTotal + calculatedShippingCost;

  const handleRegionChange = (newRegionId: string) => {
    setRegionId(newRegionId);
    const reg = CHILE_REGIONS.find((r) => r.id === newRegionId);
    if (reg && reg.comunas.length > 0) {
      setComuna(reg.comunas[0]);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rut || !email || !phone || !address) {
      alert("Por favor completa todos los campos requeridos para el despacho.");
      return;
    }

    if (!isValidRut(rut)) {
      setRutError("El RUT ingresado no es válido. Verifica el dígito verificador.");
      return;
    }
    setRutError("");

    setIsSubmitting(true);
    try {
      const shippingLabel = needsShippingCoordination
        ? `${selectedMethod.name} (a coordinar por WhatsApp)`
        : `${selectedMethod.name} (${selectedMethod.estimatedDays})`;

      if (paymentMethod === "Mercado Pago") {
        // El pedido real (y el descuento de stock) se crea recién cuando el
        // webhook de Mercado Pago confirma el pago aprobado — acá solo se
        // guarda el intento y se redirige al checkout.
        const orderNumber = `BLOOM-${Math.floor(1000 + Math.random() * 9000)}`;
        const { init_point } = await db.mercadopago.createPreference({
          order_number: orderNumber,
          customer_name: name,
          customer_rut: rut,
          customer_email: email,
          customer_phone: phone,
          region: currentRegion.name,
          comuna,
          address,
          notes,
          shipping_method: shippingLabel,
          shipping_cost: calculatedShippingCost,
          subtotal: cartTotal,
          total: grandTotal,
          payment_method: "Mercado Pago",
          items: cart.map((i) => ({
            product_id: typeof i.product.id === "string" && i.product.id.includes("-") ? i.product.id : null,
            product_name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            image: i.product.image,
          })),
        });
        window.location.href = init_point;
        return;
      }

      const order = await createOrder({
        customer: {
          name,
          rut,
          email,
          phone,
          region: currentRegion.name,
          comuna,
          address,
          notes,
        },
        shippingMethod: shippingLabel,
        shippingCost: calculatedShippingCost,
        subtotal: cartTotal,
        total: grandTotal,
        paymentMethod,
        items: cart.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image,
        })),
      });

      setCompletedOrder(order);
    } catch (err) {
      console.error("Error al crear el pedido:", err);
      alert("Hubo un problema al procesar el pedido. Por favor intenta de nuevo.");
      setIsSubmitting(false);
    }
  };

  const copyBankData = () => {
    const text = `Bloom Eterno SpA
Banco: ${settings.bankName}
Tipo: ${settings.accountType}
N° Cuenta: ${settings.accountNumber}
RUT: ${settings.accountRut}
Correo: ${settings.contactEmail}`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const generateWhatsAppUrl = () => {
    if (!completedOrder) return "#";
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, "");
    const itemsSummary = completedOrder.items
      .map((i: any) => `• ${i.quantity}x ${i.productName} (${formatCLP(i.price * i.quantity)})`)
      .join("\n");

    const message = `🌸 *Nuevo Pedido Bloom Eterno*
*N° Orden:* ${completedOrder.orderNumber}
*Cliente:* ${completedOrder.customer.name} (RUT: ${completedOrder.customer.rut})
*Dirección:* ${completedOrder.customer.address}, ${completedOrder.customer.comuna}, ${completedOrder.customer.region}
*Despacho:* ${completedOrder.shippingMethod}
*Total:* ${formatCLP(completedOrder.total)} CLP

*Productos:*
${itemsSummary}

Hola, adjunto comprobante de pago o deseo coordinar mi pedido. ¡Muchas gracias!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!isSubmitting) setIsCheckoutOpen(false);
        }}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(33, 28, 18, 0.65)",
          backdropFilter: "blur(5px)",
        }}
      />

      {/* Modal Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "92vh",
          backgroundColor: "var(--background)",
          borderRadius: "1rem",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 121,
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            backgroundColor: "var(--card)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                letterSpacing: "0.14em",
                color: "var(--gold)",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Chile · Despacho &amp; Pedido
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              {completedOrder ? "¡Pedido Confirmado!" : "Finalizar tu Compra"}
            </h2>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground)",
              padding: "0.4rem",
              borderRadius: "50%",
              opacity: 0.7,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.5rem 1.75rem", overflowY: "auto", flex: 1 }}>
          {completedOrder ? (
            /* Pantalla de Éxito / Confirmación */
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
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

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.6rem",
                  color: "var(--foreground)",
                  margin: "0 0 0.5rem",
                }}
              >
                ¡Gracias por tu pedido, {completedOrder.customer.name}!
              </h3>

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
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--primary)",
                  }}
                >
                  Orden: #{completedOrder.orderNumber}
                </span>
              </div>

              {/* Caja de Datos de Transferencia */}
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <CreditCard size={18} color="var(--gold)" />
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--foreground)" }}>
                      Datos para Transferencia Bancaria
                    </span>
                  </div>
                  <button
                    onClick={copyBankData}
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: "0.4rem",
                      padding: "0.25rem 0.6rem",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      color: "var(--foreground)",
                    }}
                  >
                    <Copy size={12} />
                    {copiedBank ? "¡Copiado!" : "Copiar datos"}
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem 1rem",
                    fontSize: "0.8rem",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <div>
                    <strong>Banco:</strong> {settings.bankName}
                  </div>
                  <div>
                    <strong>Tipo de Cuenta:</strong> {settings.accountType}
                  </div>
                  <div>
                    <strong>N° de Cuenta:</strong> {settings.accountNumber}
                  </div>
                  <div>
                    <strong>RUT:</strong> {settings.accountRut}
                  </div>
                  <div>
                    <strong>Titular:</strong> {settings.accountHolder}
                  </div>
                  <div>
                    <strong>Email Comprobante:</strong> {settings.contactEmail}
                  </div>
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
                  <span style={{ fontSize: "0.85rem", color: "var(--foreground)", fontWeight: 500 }}>
                    Monto Total a Transferir:
                  </span>
                  <span
                    style={{
                      fontSize: "1.3rem",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}
                  >
                    {formatCLP(completedOrder.total)} CLP
                  </span>
                </div>
              </div>

              {/* Botones de acción final */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <a
                  href={generateWhatsAppUrl()}
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
                    transition: "opacity 0.2s",
                  }}
                >
                  <Send size={18} />
                  Coordinar o Enviar Comprobante por WhatsApp
                </a>

                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    padding: "0.75rem",
                    borderRadius: "2rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Cerrar y seguir navegando
                </button>
              </div>
            </div>
          ) : (
            /* Formulario de Checkout */
            <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Sección 1: Datos Personales */}
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    margin: "0 0 0.8rem",
                    color: "var(--foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  1. Datos del Comprador
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.3rem", fontWeight: 500 }}>
                      Nombre Completo *
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Camila Soto"
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "0.4rem",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--input-background)",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.3rem", fontWeight: 500 }}>
                      RUT Chileno *
                    </label>
                    <input
                      required
                      type="text"
                      value={rut}
                      onChange={(e) => {
                        setRut(formatRut(e.target.value));
                        if (rutError) setRutError("");
                      }}
                      onBlur={() => {
                        if (rut && !isValidRut(rut)) {
                          setRutError("RUT inválido. Verifica el dígito verificador.");
                        }
                      }}
                      placeholder="Ej: 18.234.567-8"
                      maxLength={12}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "0.4rem",
                        border: rutError ? "1px solid var(--destructive)" : "1px solid var(--border)",
                        backgroundColor: "var(--input-background)",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                    {rutError && (
                      <span style={{ display: "block", fontSize: "0.68rem", color: "var(--destructive)", marginTop: "0.25rem" }}>
                        {rutError}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.3rem", fontWeight: 500 }}>
                      Correo Electrónico *
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-email@gmail.com"
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "0.4rem",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--input-background)",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.3rem", fontWeight: 500 }}>
                      Teléfono WhatsApp *
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+56 9 8765 4321"
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "0.4rem",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--input-background)",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Despacho en Chile */}
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    margin: "0 0 0.8rem",
                    color: "var(--foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  2. Dirección de Entrega en Chile
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.3rem", fontWeight: 500 }}>
                      Región *
                    </label>
                    <select
                      value={regionId}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "0.4rem",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--input-background)",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    >
                      {CHILE_REGIONS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.3rem", fontWeight: 500 }}>
                      Comuna *
                    </label>
                    <select
                      value={comuna}
                      onChange={(e) => setComuna(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "0.4rem",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--input-background)",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    >
                      {currentRegion.comunas.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.3rem", fontWeight: 500 }}>
                    Dirección (Calle, Número, Depto/Casa) *
                  </label>
                  <input
                    required
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. Providencia 1234, Depto 501"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "0.4rem",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--input-background)",
                      fontSize: "0.85rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.3rem", fontWeight: 500 }}>
                    Notas de entrega (opcional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Dejar en conserjería, timbre 4, etc."
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.8rem",
                      borderRadius: "0.4rem",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--input-background)",
                      fontSize: "0.82rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Sección 3: Opciones de Envío */}
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    margin: "0 0 0.8rem",
                    color: "var(--foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  3. Método de Despacho
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {SHIPPING_METHODS.map((method) => {
                    const isSelected = shippingMethodId === method.id;
                    const rawCost = isRM ? method.costRM : method.costRegions;
                    const isCoordinated = rawCost === null;
                    let cost = rawCost ?? 0;
                    if (isFreeShipping && method.id !== "pickup" && !isCoordinated) cost = 0;

                    return (
                      <label
                        key={method.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.75rem 1rem",
                          borderRadius: "0.5rem",
                          border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                          backgroundColor: isSelected ? "rgba(74, 92, 46, 0.05)" : "var(--card)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <input
                            type="radio"
                            name="shipping"
                            checked={isSelected}
                            onChange={() => setShippingMethodId(method.id)}
                            style={{ accentColor: "var(--primary)" }}
                          />
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                              {method.name}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                              {method.description} · <em>{method.estimatedDays}</em>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: isCoordinated ? "var(--gold)" : cost === 0 ? "var(--primary)" : "var(--foreground)",
                            }}
                          >
                            {isCoordinated ? "A coordinar" : cost === 0 ? "¡Gratis!" : formatCLP(cost)}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {needsShippingCoordination && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.85rem 1rem",
                      borderRadius: "0.5rem",
                      backgroundColor: "rgba(184, 144, 78, 0.12)",
                      border: "1px solid var(--gold)",
                      fontSize: "0.78rem",
                      color: "var(--foreground)",
                    }}
                  >
                    El despacho fuera de la Región Metropolitana se coordina directamente por WhatsApp (el costo no está incluido en el total). Podrás coordinarlo apenas confirmes tu pedido.
                  </div>
                )}
              </div>

              {/* Sección 4: Método de Pago */}
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    margin: "0 0 0.8rem",
                    color: "var(--foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  4. Método de Pago
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {(
                    [
                      { id: "Transferencia Bancaria" as const, label: "Transferencia Bancaria", desc: "Recibirás los datos y coordinas el envío del comprobante por WhatsApp.", icon: CreditCard },
                      { id: "Mercado Pago" as const, label: "Mercado Pago", desc: "Tarjeta de crédito, débito u otros medios. Confirmación de pago inmediata.", icon: Wallet },
                    ]
                  ).map((option) => {
                    const isSelected = paymentMethod === option.id;
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem 1rem",
                          borderRadius: "0.5rem",
                          border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                          backgroundColor: isSelected ? "rgba(74, 92, 46, 0.05)" : "var(--card)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={isSelected}
                          onChange={() => setPaymentMethod(option.id)}
                          style={{ accentColor: "var(--primary)" }}
                        />
                        <Icon size={18} color={isSelected ? "var(--primary)" : "var(--muted-foreground)"} />
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                            {option.label}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{option.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Resumen de Totales y Envío */}
              <div
                style={{
                  backgroundColor: "var(--card)",
                  padding: "1rem 1.25rem",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--muted-foreground)" }}>Subtotal ({cart.length} productos):</span>
                  <span style={{ fontWeight: 600 }}>{formatCLP(cartTotal)} CLP</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.6rem" }}>
                  <span style={{ color: "var(--muted-foreground)" }}>Costo de Despacho:</span>
                  <span style={{ fontWeight: 600, color: needsShippingCoordination ? "var(--gold)" : calculatedShippingCost === 0 ? "var(--primary)" : "inherit" }}>
                    {needsShippingCoordination ? "A coordinar" : calculatedShippingCost === 0 ? "¡Gratis!" : `${formatCLP(calculatedShippingCost)} CLP`}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "0.6rem",
                    fontSize: "1.1rem",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--foreground)" }}>
                    Total a Pagar:
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--primary)" }}>
                    {formatCLP(grandTotal)} CLP
                  </span>
                </div>
              </div>

              {/* Botón de Confirmación */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  padding: "1rem",
                  borderRadius: "2rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  cursor: isSubmitting ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 14px rgba(74, 92, 46, 0.3)",
                }}
              >
                <ShieldCheck size={18} />
                {isSubmitting
                  ? paymentMethod === "Mercado Pago"
                    ? "Redirigiendo a Mercado Pago..."
                    : "Generando Pedido..."
                  : paymentMethod === "Mercado Pago"
                  ? `Pagar con Mercado Pago · ${formatCLP(grandTotal)} CLP`
                  : `Confirmar Pedido · ${formatCLP(grandTotal)} CLP`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
