import React, { useState } from "react";
import {
  X,
  Package,
  ShoppingCart,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Database,
  Cloud,
  Check,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Product } from "../types/store";

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

const PRESET_IMAGES = [
  { label: "Piedras Amatista", url: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=600&h=700&fit=crop&auto=format&q=80" },
  { label: "Perlas Naturales", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=700&fit=crop&auto=format&q=80" },
  { label: "Mostacillas Doradas", url: "https://images.unsplash.com/photo-1611591475883-9b63a03fb7b9?w=600&h=700&fit=crop&auto=format&q=80" },
  { label: "Ágata Turquesa", url: "https://images.unsplash.com/photo-1617042375876-a13e36732a04?w=600&h=700&fit=crop&auto=format&q=80" },
  { label: "Kit Macramé", url: "https://images.unsplash.com/photo-1620656798579-1984d9e87dfa?w=600&h=700&fit=crop&auto=format&q=80" },
];

export const AdminModal: React.FC = () => {
  const {
    products,
    orders,
    settings,
    isAdminOpen,
    setIsAdminOpen,
    isCloudConnected,
    addProduct,
    updateStock,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateSettings,
    resetCatalog,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"inventory" | "orders" | "settings">("inventory");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);

  // Form states for new product
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Mostacillas");
  const [newPrice, setNewPrice] = useState("2990");
  const [newStock, setNewStock] = useState("15");
  const [newImage, setNewImage] = useState(PRESET_IMAGES[0].url);
  const [newBadge, setNewBadge] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Settings form states
  const [bankName, setBankName] = useState(settings.bankName);
  const [accountType, setAccountType] = useState(settings.accountType);
  const [accountNumber, setAccountNumber] = useState(settings.accountNumber);
  const [accountRut, setAccountRut] = useState(settings.accountRut);
  const [accountHolder, setAccountHolder] = useState(settings.accountHolder);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(settings.freeShippingThreshold));
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  if (!isAdminOpen) return null;

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newImage) {
      alert("Completa el nombre, precio e imagen");
      return;
    }

    let badgeType: Product["badgeType"] = null;
    if (newBadge === "Nuevo") badgeType = "new";
    if (newBadge === "Más vendido") badgeType = "hot";
    if (newBadge === "Ed. Limitada") badgeType = "limited";

    if (editingProductId) {
      await updateProduct(editingProductId, {
        name: newName,
        category: newCategory,
        price: parseInt(newPrice, 10) || 0,
        stock: parseInt(newStock, 10) || 0,
        image: newImage,
        badge: newBadge || null,
        badgeType,
        description: newDescription,
      });
      setEditingProductId(null);
    } else {
      await addProduct({
        name: newName,
        category: newCategory,
        price: parseInt(newPrice, 10) || 0,
        stock: parseInt(newStock, 10) || 0,
        image: newImage,
        num: String(products.length + 1).padStart(2, "0"),
        badge: newBadge || null,
        badgeType,
        description: newDescription,
        isActive: true,
      });
    }

    // Reset form
    setNewName("");
    setNewPrice("2990");
    setNewStock("15");
    setNewBadge("");
    setNewDescription("");
    setShowAddForm(false);
  };

  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setNewName(p.name);
    setNewCategory(p.category);
    setNewPrice(String(p.price));
    setNewStock(String(p.stock));
    setNewImage(p.image);
    setNewBadge(p.badge || "");
    setNewDescription(p.description || "");
    setShowAddForm(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      bankName,
      accountType,
      accountNumber,
      accountRut,
      accountHolder,
      contactEmail,
      whatsappNumber,
      freeShippingThreshold: parseInt(freeShippingThreshold, 10) || 35000,
    });
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 2500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsAdminOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(33, 28, 18, 0.7)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Admin Window */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "960px",
          height: "90vh",
          backgroundColor: "var(--background)",
          borderRadius: "1rem",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 131,
          border: "1px solid var(--border)",
        }}
      >
        {/* Top Navbar */}
        <div
          style={{
            padding: "1rem 1.75rem",
            backgroundColor: "var(--olive-dark)",
            color: "var(--primary-foreground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img src="/logos/bloom-monogram-light.png" alt="Bloom" style={{ height: "30px" }} />
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", margin: 0, fontWeight: 600 }}>
                Panel de Administración · Bloom Eterno
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.15rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: isCloudConnected ? "#4ade80" : "#fbbf24",
                  }}
                />
                <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-body)", opacity: 0.85 }}>
                  {isCloudConnected ? "Conectado a Supabase (Cloud)" : "Modo Local Resiliente (Storage Activo)"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAdminOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--primary-foreground)",
              padding: "0.4rem",
              borderRadius: "50%",
              opacity: 0.8,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            padding: "0 1.75rem",
          }}
        >
          {[
            { id: "inventory", label: "Inventario & Productos", icon: Package, count: products.length },
            { id: "orders", label: "Historial de Pedidos", icon: ShoppingCart, count: orders.length },
            { id: "settings", label: "Datos Bancarios & Ajustes", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setShowAddForm(false);
                  setEditingProductId(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.9rem 1.25rem",
                  background: "none",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                }}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      backgroundColor: isActive ? "var(--primary)" : "var(--muted)",
                      color: isActive ? "var(--primary-foreground)" : "var(--foreground)",
                      padding: "0.1rem 0.45rem",
                      borderRadius: "1rem",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.75rem" }}>
          {/* TAB 1: INVENTARIO */}
          {activeTab === "inventory" && (
            <div>
              {/* Metric Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ padding: "1rem", backgroundColor: "var(--card)", borderRadius: "0.6rem", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>Total Catálogo</span>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", fontWeight: 700, color: "var(--foreground)" }}>
                    {products.length} productos
                  </div>
                </div>

                <div style={{ padding: "1rem", backgroundColor: "var(--card)", borderRadius: "0.6rem", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>Unidades en Stock</span>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", fontWeight: 700, color: "var(--primary)" }}>
                    {totalStockUnits} un.
                  </div>
                </div>

                <div style={{ padding: "1rem", backgroundColor: "var(--card)", borderRadius: "0.6rem", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>Agotados</span>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", fontWeight: 700, color: outOfStockCount > 0 ? "var(--destructive)" : "var(--muted-foreground)" }}>
                    {outOfStockCount} productos
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", margin: 0 }}>
                  Lista de Productos &amp; Control de Stock
                </h3>

                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setEditingProductId(null);
                    setNewName("");
                  }}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    border: "none",
                    padding: "0.55rem 1.1rem",
                    borderRadius: "2rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <Plus size={16} />
                  {showAddForm ? "Cancelar Carga" : "➕ Cargar Nuevo Producto"}
                </button>
              </div>

              {/* Formulario de Carga / Edición */}
              {showAddForm && (
                <form
                  onSubmit={handleSaveProduct}
                  style={{
                    backgroundColor: "var(--card)",
                    padding: "1.25rem",
                    borderRadius: "0.75rem",
                    border: "2px solid var(--primary)",
                    marginBottom: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <h4 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                    {editingProductId ? "Editar Producto" : "Nuevo Producto para Bloom Eterno"}
                  </h4>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                        Nombre del Producto *
                      </label>
                      <input
                        required
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ej: Amatista natural rodada"
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                        Categoría *
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                      >
                        <option value="Mostacillas">Mostacillas</option>
                        <option value="Piedras">Piedras</option>
                        <option value="Cristales">Cristales</option>
                        <option value="Kits">Kits</option>
                        <option value="Herramientas">Herramientas</option>
                        <option value="Dijes">Dijes</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                        Precio CLP *
                      </label>
                      <input
                        required
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="3500"
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                        Stock Inicial *
                      </label>
                      <input
                        required
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        placeholder="10"
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      URL de Imagen del Producto *
                    </label>
                    <input
                      required
                      type="url"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box", marginBottom: "0.4rem" }}
                    />

                    {/* Presets rápidos */}
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>Fotos de muestra:</span>
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setNewImage(preset.url)}
                          style={{
                            fontSize: "0.68rem",
                            padding: "0.2rem 0.5rem",
                            border: "1px solid var(--border)",
                            borderRadius: "1rem",
                            background: newImage === preset.url ? "var(--primary)" : "var(--background)",
                            color: newImage === preset.url ? "#fff" : "inherit",
                            cursor: "pointer",
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                        Insignia / Etiqueta
                      </label>
                      <select
                        value={newBadge}
                        onChange={(e) => setNewBadge(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                      >
                        <option value="">Sin insignia</option>
                        <option value="Nuevo">Nuevo</option>
                        <option value="Más vendido">Más vendido</option>
                        <option value="Ed. Limitada">Ed. Limitada</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                        Descripción corta
                      </label>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Detalles sobre materiales y dimensiones..."
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingProductId(null);
                      }}
                      style={{ padding: "0.5rem 1rem", border: "1px solid var(--border)", background: "none", borderRadius: "1.5rem", cursor: "pointer", fontSize: "0.78rem" }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", padding: "0.5rem 1.4rem", border: "none", borderRadius: "1.5rem", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                    >
                      {editingProductId ? "Guardar Cambios" : "Guardar Producto en Catálogo"}
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table */}
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "0.6rem",
                  overflow: "hidden",
                  backgroundColor: "var(--card)",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--cream-deep)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "0.75rem 1rem" }}>Producto</th>
                      <th style={{ padding: "0.75rem" }}>Categoría</th>
                      <th style={{ padding: "0.75rem" }}>Precio</th>
                      <th style={{ padding: "0.75rem" }}>Stock Disponible</th>
                      <th style={{ padding: "0.75rem" }}>Estado</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const isOutOfStock = p.stock <= 0;
                      const isLowStock = p.stock > 0 && p.stock <= 3;

                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          {/* Image & Title */}
                          <td style={{ padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <img
                              src={p.image}
                              alt={p.name}
                              style={{ width: "40px", height: "40px", borderRadius: "0.3rem", objectFit: "cover" }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{p.name}</div>
                              {p.badge && (
                                <span style={{ fontSize: "0.62rem", color: "var(--gold)", fontWeight: 600 }}>
                                  ★ {p.badge}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td style={{ padding: "0.65rem 0.75rem", color: "var(--muted-foreground)" }}>
                            {p.category}
                          </td>

                          {/* Price */}
                          <td style={{ padding: "0.65rem 0.75rem", fontWeight: 600 }}>
                            {formatCLP(p.price)}
                          </td>

                          {/* Stock Controls */}
                          <td style={{ padding: "0.65rem 0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <button
                                onClick={() => updateStock(p.id, p.stock - 1)}
                                style={{
                                  padding: "0.2rem 0.45rem",
                                  border: "1px solid var(--border)",
                                  background: "var(--background)",
                                  borderRadius: "0.25rem",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={p.stock}
                                onChange={(e) => updateStock(p.id, parseInt(e.target.value, 10) || 0)}
                                style={{
                                  width: "48px",
                                  textAlign: "center",
                                  padding: "0.2rem",
                                  borderRadius: "0.25rem",
                                  border: "1px solid var(--border)",
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                }}
                              />
                              <button
                                onClick={() => updateStock(p.id, p.stock + 1)}
                                style={{
                                  padding: "0.2rem 0.45rem",
                                  border: "1px solid var(--border)",
                                  background: "var(--background)",
                                  borderRadius: "0.25rem",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                }}
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: "0.65rem 0.75rem" }}>
                            {isOutOfStock ? (
                              <span style={{ fontSize: "0.68rem", backgroundColor: "var(--destructive)", color: "#fff", padding: "0.15rem 0.5rem", borderRadius: "1rem", fontWeight: 600 }}>
                                Agotado
                              </span>
                            ) : isLowStock ? (
                              <span style={{ fontSize: "0.68rem", backgroundColor: "var(--gold)", color: "#fff", padding: "0.15rem 0.5rem", borderRadius: "1rem", fontWeight: 600 }}>
                                ¡{p.stock} un!
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.68rem", backgroundColor: "rgba(74, 92, 46, 0.15)", color: "var(--primary)", padding: "0.15rem 0.5rem", borderRadius: "1rem", fontWeight: 600 }}>
                                En Stock
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "0.65rem 1rem", textAlign: "right" }}>
                            <button
                              onClick={() => startEditProduct(p)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.3rem", color: "var(--primary)" }}
                              title="Editar producto"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar ${p.name}?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.3rem", color: "var(--muted-foreground)" }}
                              title="Eliminar producto"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PEDIDOS */}
          {activeTab === "orders" && (
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", margin: "0 0 1rem" }}>
                Historial de Pedidos Recibidos ({orders.length})
              </h3>

              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--muted-foreground)" }}>
                  <ShoppingCart size={32} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
                  <p>Aún no hay pedidos registrados.</p>
                  <p style={{ fontSize: "0.75rem" }}>
                    Cuando los clientes completen compras en la tienda, aparecerán aquí con sus datos de despacho.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        padding: "1.25rem",
                        borderRadius: "0.75rem",
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          borderBottom: "1px solid var(--border)",
                          paddingBottom: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              color: "var(--primary)",
                            }}
                          >
                            Orden #{o.orderNumber}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginLeft: "0.75rem" }}>
                            {new Date(o.createdAt).toLocaleString("es-CL")}
                          </span>
                        </div>

                        {/* Status selector */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Estado:</span>
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                            style={{
                              padding: "0.3rem 0.6rem",
                              borderRadius: "0.4rem",
                              border: "1px solid var(--border)",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor:
                                o.status === "Enviado"
                                  ? "rgba(74, 92, 46, 0.15)"
                                  : o.status === "Comprobante recibido"
                                  ? "rgba(184, 144, 78, 0.2)"
                                  : "var(--background)",
                            }}
                          >
                            <option value="Pendiente de transferencia">Pendiente de transferencia</option>
                            <option value="Comprobante recibido">Comprobante recibido</option>
                            <option value="En preparación">En preparación</option>
                            <option value="Enviado">Enviado</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer & Delivery details */}
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem", fontSize: "0.8rem" }}>
                        <div>
                          <p style={{ margin: "0 0 0.2rem", fontWeight: 600, color: "var(--foreground)" }}>
                            Cliente: {o.customer.name} ({o.customer.rut})
                          </p>
                          <p style={{ margin: "0 0 0.2rem", color: "var(--muted-foreground)" }}>
                            📧 {o.customer.email} · 📱 {o.customer.phone}
                          </p>
                          <p style={{ margin: "0 0 0.2rem", color: "var(--muted-foreground)" }}>
                            📍 {o.customer.address}, {o.customer.comuna}, {o.customer.region}
                          </p>
                          {o.customer.notes && (
                            <p style={{ margin: "0.3rem 0 0", fontStyle: "italic", color: "var(--gold)" }}>
                              Nota: "{o.customer.notes}"
                            </p>
                          )}
                        </div>

                        <div>
                          <p style={{ margin: "0 0 0.2rem" }}>
                            <strong>Despacho:</strong> {o.shippingMethod}
                          </p>
                          <p style={{ margin: "0 0 0.2rem" }}>
                            <strong>Pago:</strong> {o.paymentMethod}
                          </p>
                          <p style={{ margin: "0.4rem 0 0", fontSize: "1.1rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--primary)" }}>
                            Total: {formatCLP(o.total)} CLP
                          </p>
                        </div>
                      </div>

                      {/* Items list */}
                      <div
                        style={{
                          marginTop: "0.75rem",
                          paddingTop: "0.5rem",
                          borderTop: "1px dashed var(--border)",
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {o.items.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem" }}>
                            {item.image && (
                              <img src={item.image} alt="" style={{ width: "24px", height: "24px", borderRadius: "0.2rem", objectFit: "cover" }} />
                            )}
                            <span>{item.quantity}x {item.productName}</span>
                            <span style={{ color: "var(--muted-foreground)" }}>({formatCLP(item.price * item.quantity)})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONFIGURACIÓN */}
          {activeTab === "settings" && (
            <div style={{ maxWidth: "600px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", margin: "0 0 0.4rem" }}>
                Datos Bancarios &amp; Parámetros de la Tienda
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", margin: "0 0 1.5rem" }}>
                Estos datos son los que se le muestran al cliente al elegir Transferencia Bancaria en el checkout.
              </p>

              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      Nombre del Banco
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      Tipo de Cuenta
                    </label>
                    <input
                      type="text"
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      N° de Cuenta
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      RUT Empresa
                    </label>
                    <input
                      type="text"
                      value={accountRut}
                      onChange={(e) => setAccountRut(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      Nombre del Titular
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      Email para Comprobantes
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      Teléfono WhatsApp de la Tienda
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+56912345678"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      Meta para Envío Gratis (CLP)
                    </label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--border)", fontSize: "0.82rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                      border: "none",
                      padding: "0.65rem 1.4rem",
                      borderRadius: "2rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Guardar Parámetros
                  </button>
                  {savedSettingsMsg && (
                    <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>
                      ✓ Guardado correctamente
                    </span>
                  )}
                </div>
              </form>

              {/* Reset option */}
              <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
                <h4 style={{ fontSize: "0.85rem", color: "var(--destructive)", margin: "0 0 0.3rem" }}>
                  Zona de Restablecimiento
                </h4>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", margin: "0 0 0.75rem" }}>
                  Si deseas volver al catálogo y configuración inicial por defecto, puedes reiniciar los datos locales.
                </p>
                <button
                  onClick={() => {
                    if (confirm("¿Seguro que deseas reiniciar el catálogo a su estado original?")) {
                      resetCatalog();
                    }
                  }}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid var(--destructive)",
                    color: "var(--destructive)",
                    padding: "0.45rem 1rem",
                    borderRadius: "2rem",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                  }}
                >
                  Restablecer Catálogo de Fábrica
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
