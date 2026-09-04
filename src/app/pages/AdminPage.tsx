import React, { useState } from "react";
import { Link } from "react-router";
import {
  Package,
  ShoppingCart,
  Settings,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Search,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
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

export const AdminPage: React.FC = () => {
  const {
    products,
    orders,
    settings,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);

  // Formulario de Producto
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Mostacillas");
  const [newPrice, setNewPrice] = useState("2990");
  const [newStock, setNewStock] = useState("15");
  const [newImage, setNewImage] = useState(PRESET_IMAGES[0].url);
  const [newBadge, setNewBadge] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Formulario de Configuración
  const [bankName, setBankName] = useState(settings.bankName);
  const [accountType, setAccountType] = useState(settings.accountType);
  const [accountNumber, setAccountNumber] = useState(settings.accountNumber);
  const [accountRut, setAccountRut] = useState(settings.accountRut);
  const [accountHolder, setAccountHolder] = useState(settings.accountHolder);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(settings.freeShippingThreshold));
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const categories = ["Todas", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "Todas" || p.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newImage) {
      alert("Por favor completa nombre, precio e imagen");
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
    window.scrollTo({ top: 200, behavior: "smooth" });
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
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", display: "flex", flexDirection: "column" }}>
      {/* Top Header Bar */}
      <header
        style={{
          backgroundColor: "var(--olive-dark)",
          color: "var(--primary-foreground)",
          borderBottom: "1px solid rgba(246, 240, 227, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0.85rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand & Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", color: "inherit" }}>
              <img src="/logos/bloom-monogram-light.png" alt="Bloom" style={{ height: "34px", width: "auto" }} />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, lineHeight: 1 }}>
                  Bloom <em style={{ color: "var(--gold-light)", fontStyle: "italic" }}>Eterno</em>
                </div>
                <div style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.8, marginTop: "0.15rem" }}>
                  Panel de Administración
                </div>
              </div>
            </Link>

            {/* Cloud indicator badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                padding: "0.3rem 0.75rem",
                borderRadius: "2rem",
                fontSize: "0.72rem",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isCloudConnected ? "#4ade80" : "#fbbf24",
                }}
              />
              <span style={{ opacity: 0.9 }}>
                {isCloudConnected ? "Supabase PostgreSQL (Cloud)" : "Modo Local (Navegador Activo)"}
              </span>
            </div>
          </div>

          {/* Action button to return to store */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              color: "var(--primary-foreground)",
              textDecoration: "none",
              backgroundColor: "rgba(246, 240, 227, 0.12)",
              padding: "0.5rem 1.1rem",
              borderRadius: "2rem",
              fontSize: "0.78rem",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              transition: "background-color 0.2s",
            }}
          >
            <ArrowLeft size={16} />
            Volver a la Tienda
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", width: "100%", padding: "2rem", boxSizing: "border-box", flex: 1 }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            borderBottom: "1px solid var(--border)",
            marginBottom: "2rem",
          }}
        >
          {[
            { id: "inventory", label: "Inventario & Productos", icon: Package, count: products.length },
            { id: "orders", label: "Historial de Pedidos", icon: ShoppingCart, count: orders.length },
            { id: "settings", label: "Datos Bancarios & Configuración", icon: Settings },
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
                  padding: "0.85rem 1.5rem",
                  background: "none",
                  border: "none",
                  borderBottom: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                }}
              >
                <Icon size={18} />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      backgroundColor: isActive ? "var(--primary)" : "var(--muted)",
                      color: isActive ? "var(--primary-foreground)" : "var(--foreground)",
                      padding: "0.15rem 0.55rem",
                      borderRadius: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: INVENTARIO & PRODUCTOS                                        */}
        {/* ==================================================================== */}
        {activeTab === "inventory" && (
          <div>
            {/* Metric KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.25rem",
                marginBottom: "2rem",
              }}
            >
              <div style={{ padding: "1.25rem", backgroundColor: "var(--card)", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  Total en Catálogo
                </span>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 700, color: "var(--foreground)", marginTop: "0.2rem" }}>
                  {products.length} productos
                </div>
              </div>

              <div style={{ padding: "1.25rem", backgroundColor: "var(--card)", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  Stock Disponible Total
                </span>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 700, color: "var(--primary)", marginTop: "0.2rem" }}>
                  {totalStockUnits} unidades
                </div>
              </div>

              <div style={{ padding: "1.25rem", backgroundColor: "var(--card)", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  Productos Agotados
                </span>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    color: outOfStockCount > 0 ? "var(--destructive)" : "var(--muted-foreground)",
                    marginTop: "0.2rem",
                  }}
                >
                  {outOfStockCount} productos
                </div>
              </div>
            </div>

            {/* Controls Bar: Search, Filters & Add Product Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, maxWidth: "600px" }}>
                {/* Search Bar */}
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o material..."
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem 0.6rem 2.2rem",
                      borderRadius: "2rem",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      fontSize: "0.85rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Category Dropdown */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "2rem",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                  }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "Todas" ? "Todas las categorías" : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Product Button */}
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
                  padding: "0.65rem 1.4rem",
                  borderRadius: "2rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 12px rgba(74, 92, 46, 0.25)",
                }}
              >
                <Plus size={18} />
                {showAddForm ? "Cerrar Formulario" : "➕ Cargar Nuevo Producto"}
              </button>
            </div>

            {/* Formulario de Carga / Edición */}
            {showAddForm && (
              <form
                onSubmit={handleSaveProduct}
                style={{
                  backgroundColor: "var(--card)",
                  padding: "1.75rem",
                  borderRadius: "1rem",
                  border: "2px solid var(--primary)",
                  marginBottom: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
                    {editingProductId ? "Editar Producto" : "Nuevo Producto para Bloom Eterno"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingProductId(null);
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}
                  >
                    ✕ Cancelar
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Nombre del Producto *
                    </label>
                    <input
                      required
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ej: Amatista natural rodada 8mm"
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Categoría *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
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
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Precio CLP *
                    </label>
                    <input
                      required
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="3500"
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Stock Inicial *
                    </label>
                    <input
                      required
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      placeholder="10"
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    URL de la Imagen *
                  </label>
                  <input
                    required
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box", marginBottom: "0.5rem" }}
                  />

                  {/* Fotos Temáticas */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Fotos de muestra sugeridas:</span>
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewImage(preset.url)}
                        style={{
                          fontSize: "0.72rem",
                          padding: "0.25rem 0.65rem",
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Insignia Promocional
                    </label>
                    <select
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                    >
                      <option value="">Sin insignia</option>
                      <option value="Nuevo">Nuevo</option>
                      <option value="Más vendido">Más vendido</option>
                      <option value="Ed. Limitada">Ed. Limitada</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Detalles sobre materiales, procedencia o dimensiones..."
                      style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                      padding: "0.65rem 1.75rem",
                      border: "none",
                      borderRadius: "2rem",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    {editingProductId ? "Guardar Modificaciones" : "Guardar Producto"}
                  </button>
                </div>
              </form>
            )}

            {/* Tabla de Productos */}
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                overflow: "hidden",
                backgroundColor: "var(--card)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--cream-deep)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "0.9rem 1.25rem" }}>Producto</th>
                    <th style={{ padding: "0.9rem" }}>Categoría</th>
                    <th style={{ padding: "0.9rem" }}>Precio (CLP)</th>
                    <th style={{ padding: "0.9rem" }}>Stock Disponible</th>
                    <th style={{ padding: "0.9rem" }}>Estado</th>
                    <th style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const isOutOfStock = p.stock <= 0;
                    const isLowStock = p.stock > 0 && p.stock <= 3;

                    return (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        {/* Image & Title */}
                        <td style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: "46px", height: "46px", borderRadius: "0.4rem", objectFit: "cover", backgroundColor: "var(--muted)" }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{p.name}</div>
                            {p.badge && (
                              <span style={{ fontSize: "0.65rem", color: "var(--gold)", fontWeight: 600 }}>
                                ★ {p.badge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: "0.75rem 0.9rem", color: "var(--muted-foreground)" }}>
                          {p.category}
                        </td>

                        {/* Price */}
                        <td style={{ padding: "0.75rem 0.9rem", fontWeight: 600, fontFamily: "var(--font-display)", fontSize: "1rem" }}>
                          {formatCLP(p.price)}
                        </td>

                        {/* Stock Controls */}
                        <td style={{ padding: "0.75rem 0.9rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <button
                              onClick={() => updateStock(p.id, p.stock - 1)}
                              style={{
                                padding: "0.25rem 0.55rem",
                                border: "1px solid var(--border)",
                                background: "var(--background)",
                                borderRadius: "0.3rem",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={p.stock}
                              onChange={(e) => updateStock(p.id, parseInt(e.target.value, 10) || 0)}
                              style={{
                                width: "54px",
                                textAlign: "center",
                                padding: "0.25rem",
                                borderRadius: "0.3rem",
                                border: "1px solid var(--border)",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                              }}
                            />
                            <button
                              onClick={() => updateStock(p.id, p.stock + 1)}
                              style={{
                                padding: "0.25rem 0.55rem",
                                border: "1px solid var(--border)",
                                background: "var(--background)",
                                borderRadius: "0.3rem",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "0.75rem 0.9rem" }}>
                          {isOutOfStock ? (
                            <span style={{ fontSize: "0.72rem", backgroundColor: "var(--destructive)", color: "#fff", padding: "0.2rem 0.65rem", borderRadius: "1rem", fontWeight: 600 }}>
                              Agotado
                            </span>
                          ) : isLowStock ? (
                            <span style={{ fontSize: "0.72rem", backgroundColor: "var(--gold)", color: "#fff", padding: "0.2rem 0.65rem", borderRadius: "1rem", fontWeight: 600 }}>
                              ¡Solo {p.stock} un!
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(74, 92, 46, 0.15)", color: "var(--primary)", padding: "0.2rem 0.65rem", borderRadius: "1rem", fontWeight: 600 }}>
                              En Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "0.75rem 1.25rem", textAlign: "right" }}>
                          <button
                            onClick={() => startEditProduct(p)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "0.4rem", color: "var(--primary)" }}
                            title="Editar producto"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar ${p.name}?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "0.4rem", color: "var(--muted-foreground)" }}
                            title="Eliminar producto"
                          >
                            <Trash2 size={16} />
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

        {/* ==================================================================== */}
        {/* TAB 2: HISTORIAL DE PEDIDOS                                          */}
        {/* ==================================================================== */}
        {activeTab === "orders" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", margin: "0 0 1.25rem" }}>
              Pedidos Recibidos ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--muted-foreground)", backgroundColor: "var(--card)", borderRadius: "1rem", border: "1px solid var(--border)" }}>
                <ShoppingCart size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.4 }} />
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--foreground)" }}>
                  No hay pedidos registrados aún
                </h3>
                <p style={{ fontSize: "0.85rem", maxWidth: "360px", margin: "0 auto" }}>
                  Cuando los clientes finalicen compras desde la tienda, aparecerán aquí con sus datos de despacho y comprobantes.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {orders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      padding: "1.5rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid var(--border)",
                        paddingBottom: "0.85rem",
                        marginBottom: "1rem",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <div>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "1rem", fontWeight: 700, color: "var(--primary)" }}>
                          Orden #{o.orderNumber}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginLeft: "1rem" }}>
                          {new Date(o.createdAt).toLocaleString("es-CL")}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Estado del Pedido:</span>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                          style={{
                            padding: "0.35rem 0.8rem",
                            borderRadius: "0.4rem",
                            border: "1px solid var(--border)",
                            fontSize: "0.8rem",
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

                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", fontSize: "0.85rem" }}>
                      <div>
                        <p style={{ margin: "0 0 0.3rem", fontWeight: 600, color: "var(--foreground)", fontSize: "0.95rem" }}>
                          Cliente: {o.customer.name} (RUT: {o.customer.rut})
                        </p>
                        <p style={{ margin: "0 0 0.3rem", color: "var(--muted-foreground)" }}>
                          📧 {o.customer.email} · 📱 {o.customer.phone}
                        </p>
                        <p style={{ margin: "0 0 0.3rem", color: "var(--muted-foreground)" }}>
                          📍 {o.customer.address}, {o.customer.comuna}, {o.customer.region}
                        </p>
                        {o.customer.notes && (
                          <p style={{ margin: "0.4rem 0 0", fontStyle: "italic", color: "var(--gold)" }}>
                            Nota: "{o.customer.notes}"
                          </p>
                        )}
                      </div>

                      <div>
                        <p style={{ margin: "0 0 0.3rem" }}>
                          <strong>Despacho:</strong> {o.shippingMethod}
                        </p>
                        <p style={{ margin: "0 0 0.3rem" }}>
                          <strong>Método de Pago:</strong> {o.paymentMethod}
                        </p>
                        <p style={{ margin: "0.5rem 0 0", fontSize: "1.25rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--primary)" }}>
                          Total: {formatCLP(o.total)} CLP
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div
                      style={{
                        marginTop: "1rem",
                        paddingTop: "0.75rem",
                        borderTop: "1px dashed var(--border)",
                        display: "flex",
                        gap: "1.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {o.items.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                          {item.image && (
                            <img src={item.image} alt="" style={{ width: "28px", height: "28px", borderRadius: "0.25rem", objectFit: "cover" }} />
                          )}
                          <span><strong>{item.quantity}x</strong> {item.productName}</span>
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

        {/* ==================================================================== */}
        {/* TAB 3: CONFIGURACIÓN & DATOS BANCARIOS                                */}
        {/* ==================================================================== */}
        {activeTab === "settings" && (
          <div style={{ maxWidth: "720px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", margin: "0 0 0.4rem" }}>
              Datos Bancarios &amp; Parámetros de Bloom Eterno
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: "0 0 2rem" }}>
              Esta información es la que se presenta automáticamente al comprador al seleccionar Transferencia Bancaria en el checkout.
            </p>

            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Nombre del Banco
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Tipo de Cuenta
                  </label>
                  <input
                    type="text"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    N° de Cuenta
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    RUT Empresa / Titular
                  </label>
                  <input
                    type="text"
                    value={accountRut}
                    onChange={(e) => setAccountRut(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Email para Recibir Comprobantes
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Teléfono WhatsApp Oficial
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+56912345678"
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Monto Meta para Envío Gratis (CLP)
                  </label>
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "0.4rem", border: "1px solid var(--border)", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    border: "none",
                    padding: "0.75rem 1.75rem",
                    borderRadius: "2rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Guardar Configuración
                </button>
                {savedSettingsMsg && (
                  <span style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600 }}>
                    ✓ Parámetros guardados con éxito
                  </span>
                )}
              </div>
            </form>

            {/* Zona de Restablecimiento */}
            <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--destructive)", margin: "0 0 0.4rem" }}>
                Zona de Restablecimiento
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", margin: "0 0 1rem" }}>
                Puedes restablecer el catálogo de productos y los datos a sus valores iniciales si deseas reiniciar las pruebas.
              </p>
              <button
                onClick={() => {
                  if (confirm("¿Estás seguro de que deseas restablecer el catálogo y pedidos al estado original?")) {
                    resetCatalog();
                  }
                }}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid var(--destructive)",
                  color: "var(--destructive)",
                  padding: "0.55rem 1.25rem",
                  borderRadius: "2rem",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                Restablecer Catálogo Original
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
