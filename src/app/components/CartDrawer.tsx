import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useStore } from "../context/StoreContext";

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeFromCart,
    settings,
  } = useStore();

  if (!isCartOpen) return null;

  const freeShippingLimit = settings.freeShippingThreshold || 35000;
  const missingForFreeShipping = Math.max(0, freeShippingLimit - cartTotal);
  const progressPercent = Math.min(100, Math.round((cartTotal / freeShippingLimit) * 100));

  const handleGoToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(33, 28, 18, 0.55)",
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "var(--background)",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.18)",
          display: "flex",
          flexDirection: "column",
          zIndex: 101,
          animation: "slideInRight 0.28s ease-out forwards",
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ShoppingBag size={20} color="var(--primary)" strokeWidth={2} />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 600,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              Tu Bolsa de Compras
            </h2>
            <span
              style={{
                fontSize: "0.7rem",
                fontFamily: "var(--font-body)",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                padding: "0.15rem 0.55rem",
                borderRadius: "1rem",
                fontWeight: 600,
              }}
            >
              {cartCount}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground)",
              padding: "0.4rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.7,
              transition: "opacity 0.2s, background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Bar (Estilo helene.cl) */}
        <div
          style={{
            padding: "0.85rem 1.5rem",
            backgroundColor: "var(--cream-deep)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <Truck size={15} color="var(--primary)" />
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                fontFamily: "var(--font-body)",
                color: "var(--foreground)",
                fontWeight: 500,
              }}
            >
              {missingForFreeShipping > 0 ? (
                <>
                  Agrega <strong>{formatCLP(missingForFreeShipping)}</strong> para{" "}
                  <span style={{ color: "var(--primary)", fontWeight: 600 }}>Envío Gratis</span> en Chile
                </>
              ) : (
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                  🎉 ¡Genial! Tu pedido califica para Envío Gratis
                </span>
              )}
            </p>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "rgba(33, 28, 18, 0.1)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                backgroundColor: missingForFreeShipping === 0 ? "var(--primary)" : "var(--gold)",
                borderRadius: "3px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "3rem 1rem",
                color: "var(--muted-foreground)",
              }}
            >
              <div
                style={{
                  width: "4rem",
                  height: "4rem",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.2rem",
                }}
              >
                <ShoppingBag size={28} color="var(--gold)" />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  color: "var(--foreground)",
                  marginBottom: "0.4rem",
                }}
              >
                Tu bolsa está vacía
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  maxWidth: "240px",
                  lineHeight: 1.5,
                  margin: "0 0 1.5rem",
                }}
              >
                Descubre nuestra colección de piedras naturales, cristales y kits hechos a mano.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  const el = document.getElementById("productos");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  padding: "0.75rem 1.6rem",
                  borderRadius: "2rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => {
              const maxStock = product.stock;
              const isAtMax = quantity >= maxStock;

              return (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    padding: "0.85rem",
                    borderRadius: "0.6rem",
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    alignItems: "center",
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "0.4rem",
                      overflow: "hidden",
                      backgroundColor: "var(--muted)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.6rem",
                        letterSpacing: "0.1em",
                        color: "var(--gold)",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {product.category}
                    </p>
                    <h4
                      style={{
                        margin: "0.15rem 0 0.35rem",
                        fontSize: "0.88rem",
                        fontFamily: "var(--font-display)",
                        color: "var(--foreground)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 500,
                      }}
                    >
                      {product.name}
                    </h4>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          color: "var(--primary)",
                        }}
                      >
                        {formatCLP(product.price * quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid var(--border)",
                          borderRadius: "1.5rem",
                          backgroundColor: "var(--background)",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "0.25rem 0.5rem",
                            cursor: "pointer",
                            color: "var(--foreground)",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontFamily: "var(--font-body)",
                            fontWeight: 600,
                            padding: "0 0.3rem",
                            minWidth: "18px",
                            textAlign: "center",
                          }}
                        >
                          {quantity}
                        </span>
                        <button
                          disabled={isAtMax}
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "0.25rem 0.5rem",
                            cursor: isAtMax ? "not-allowed" : "pointer",
                            opacity: isAtMax ? 0.3 : 1,
                            color: "var(--foreground)",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title={isAtMax ? "No hay más stock disponible" : "Sumar 1"}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {isAtMax && (
                      <span style={{ fontSize: "0.6rem", color: "var(--destructive)", marginTop: "0.2rem", display: "block" }}>
                        Stock máx. disponible ({maxStock} un.)
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted-foreground)",
                      padding: "0.3rem",
                      opacity: 0.6,
                      transition: "opacity 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.color = "var(--destructive)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.6";
                      e.currentTarget.style.color = "var(--muted-foreground)";
                    }}
                    title="Eliminar de la bolsa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Totals and Checkout CTA */}
        {cart.length > 0 && (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderTop: "1px solid var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "0.3rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "var(--foreground)",
                  fontWeight: 500,
                }}
              >
                Subtotal
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "var(--primary)",
                }}
              >
                {formatCLP(cartTotal)} CLP
              </span>
            </div>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.68rem",
                color: "var(--muted-foreground)",
                margin: "0 0 1rem",
              }}
            >
              El costo de envío a tu región o comuna se calcula en el siguiente paso.
            </p>

            <button
              onClick={handleGoToCheckout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "2rem",
                padding: "0.9rem",
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background-color 0.2s, transform 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--olive-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
            >
              Iniciar Pedido
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
