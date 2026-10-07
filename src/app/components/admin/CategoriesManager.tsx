import React, { useState } from "react";
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, X } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { Category, CategoryAttribute } from "../../types/store";
import { newLocalId } from "../../../lib/catalog";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.8rem",
  borderRadius: "0.4rem",
  border: "1px solid var(--border)",
  fontSize: "0.85rem",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  marginBottom: "0.3rem",
};

type FormState = {
  name: string;
  description: string;
  image: string;
  attributes: CategoryAttribute[];
};

const EMPTY_FORM: FormState = { name: "", description: "", image: "", attributes: [] };

/** Pestaña "Categorías" del panel: crear, editar, ordenar y eliminar categorías y sus características. */
export const CategoriesManager: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const countProducts = (c: Category) =>
    products.filter((p) => p.categoryId === c.id || (!p.categoryId && p.category === c.name)).length;

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, attributes: [] });
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description ?? "",
      image: c.image ?? "",
      attributes: c.attributes.map((a) => ({ ...a })),
    });
    setShowForm(true);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const setAttr = (id: string, changes: Partial<CategoryAttribute>) =>
    setForm((f) => ({ ...f, attributes: f.attributes.map((a) => (a.id === id ? { ...a, ...changes } : a)) }));

  const removeAttr = (attr: CategoryAttribute) => {
    if (editingId && attr.name.trim()) {
      const ok = confirm(
        `¿Quitar la característica "${attr.name}"? Los productos de esta categoría dejarán de mostrarla` +
          (attr.isVariant ? " y sus variantes quedarán sin esa opción." : ".")
      );
      if (!ok) return;
    }
    setForm((f) => ({ ...f, attributes: f.attributes.filter((a) => a.id !== attr.id) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    const attributes = form.attributes
      .map((a) => ({ ...a, name: a.name.trim() }))
      .filter((a) => a.name);
    const names = attributes.map((a) => a.name.toLowerCase());
    if (new Set(names).size !== names.length) {
      alert("Hay características con el mismo nombre. Cada característica debe tener un nombre distinto.");
      return;
    }

    const data = {
      name,
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      attributes,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, data);
      } else {
        await addCategory(data);
      }
      closeForm();
    } catch (err: any) {
      alert(err.message || "No se pudo guardar la categoría");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    const n = countProducts(c);
    if (n > 0) {
      alert(`La categoría "${c.name}" tiene ${n} producto(s). Muévelos a otra categoría o elimínalos antes de borrarla.`);
      return;
    }
    if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return;
    try {
      await deleteCategory(c.id);
      if (editingId === c.id) closeForm();
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar la categoría");
    }
  };

  // Intercambia el orden con la categoría vecina (define el orden en la tienda y la portada)
  const move = async (index: number, dir: -1 | 1) => {
    const a = sorted[index];
    const b = sorted[index + dir];
    if (!a || !b) return;
    try {
      // Si había órdenes repetidos, se normalizan con la posición en la lista
      const orderA = a.sortOrder === b.sortOrder ? index + 1 : a.sortOrder;
      const orderB = a.sortOrder === b.sortOrder ? index + 1 + dir : b.sortOrder;
      await updateCategory(a.id, { sortOrder: orderB });
      await updateCategory(b.id, { sortOrder: orderA });
    } catch (err: any) {
      alert(err.message || "No se pudo cambiar el orden");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", margin: "0 0 0.3rem" }}>
            Categorías ({categories.length})
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: 0, maxWidth: "640px" }}>
            Cada categoría define las <strong>características</strong> que se cargan en sus productos. Marca una
            característica como <strong>variante</strong> cuando un mismo producto viene en varias opciones que el cliente
            elige al comprar (ej: el <em>Color</em> de un alambre), cada una con su propio stock.
          </p>
        </div>
        <button
          onClick={() => (showForm && !editingId ? closeForm() : openNew())}
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
          {showForm && !editingId ? "Cerrar Formulario" : "Nueva Categoría"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
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
              {editingId ? `Editar Categoría` : "Nueva Categoría"}
            </h3>
            <button type="button" onClick={closeForm} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
              ✕ Cancelar
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Alambres"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Descripción corta</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ej: Cobre, aluminio y alpaca en varios calibres"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>URL de la imagen (portada)</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                style={inputStyle}
              />
              <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                Las categorías con imagen aparecen en la portada de la tienda (hasta 5, en el orden de esta lista).
              </span>
            </div>
            {form.image && (
              <img src={form.image} alt="" style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "0.5rem", backgroundColor: "var(--muted)" }} />
            )}
          </div>

          {/* Características */}
          <div>
            <label style={labelStyle}>Características de los productos</label>
            {form.attributes.length === 0 && (
              <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", margin: "0 0 0.6rem" }}>
                Sin características. Agrega por ejemplo "Calibre", "Material" o "Color".
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {form.attributes.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    backgroundColor: "var(--background)",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    value={a.name}
                    onChange={(e) => setAttr(a.id, { name: e.target.value })}
                    placeholder="Nombre (ej: Color)"
                    style={{ ...inputStyle, flex: "1 1 200px", width: "auto" }}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={a.isVariant} onChange={(e) => setAttr(a.id, { isVariant: e.target.checked })} />
                    Es variante <span style={{ color: "var(--muted-foreground)" }}>(el cliente elige una opción, con stock propio)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeAttr(a)}
                    title="Quitar característica"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "0.3rem", marginLeft: "auto" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, attributes: [...f.attributes, { id: newLocalId("attr"), name: "", isVariant: false }] }))
              }
              style={{
                marginTop: "0.6rem",
                fontSize: "0.78rem",
                padding: "0.4rem 0.9rem",
                border: "1px dashed var(--primary)",
                borderRadius: "2rem",
                background: "transparent",
                color: "var(--primary)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Agregar característica
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                padding: "0.65rem 1.75rem",
                border: "none",
                borderRadius: "2rem",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              {saving ? "Guardando…" : editingId ? "Guardar Cambios" : "Crear Categoría"}
            </button>
          </div>
        </form>
      )}

      {/* Listado */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "var(--card)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--cream-deep)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "0.9rem 1.25rem" }}>Orden</th>
              <th style={{ padding: "0.9rem" }}>Categoría</th>
              <th style={{ padding: "0.9rem" }}>Características</th>
              <th style={{ padding: "0.9rem" }}>Productos</th>
              <th style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--muted-foreground)" }}>
                  Aún no hay categorías. Crea la primera con el botón "Nueva Categoría".
                </td>
              </tr>
            )}
            {sorted.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem 1.25rem", whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Subir"
                    style={{ background: "none", border: "none", cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.25 : 1, padding: "0.2rem" }}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === sorted.length - 1}
                    title="Bajar"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: i === sorted.length - 1 ? "default" : "pointer",
                      opacity: i === sorted.length - 1 ? 0.25 : 1,
                      padding: "0.2rem",
                    }}
                  >
                    <ArrowDown size={15} />
                  </button>
                </td>
                <td style={{ padding: "0.75rem 0.9rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {c.image ? (
                      <img src={c.image} alt="" style={{ width: "40px", height: "40px", borderRadius: "0.4rem", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "40px", height: "40px", borderRadius: "0.4rem", backgroundColor: "var(--muted)" }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      {c.description && <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{c.description}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "0.75rem 0.9rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                    {c.attributes.length === 0 && <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>—</span>}
                    {c.attributes.map((a) => (
                      <span
                        key={a.id}
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.15rem 0.55rem",
                          borderRadius: "1rem",
                          backgroundColor: a.isVariant ? "rgba(184, 144, 78, 0.18)" : "var(--muted)",
                          fontWeight: 500,
                        }}
                        title={a.isVariant ? "Variante: el cliente elige una opción" : "Característica fija"}
                      >
                        {a.name}
                        {a.isVariant && " · variante"}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "0.75rem 0.9rem", color: "var(--muted-foreground)" }}>{countProducts(c)}</td>
                <td style={{ padding: "0.75rem 1.25rem", textAlign: "right", whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => openEdit(c)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0.4rem", color: "var(--primary)" }}
                    title="Editar categoría"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0.4rem", color: "var(--muted-foreground)" }}
                    title="Eliminar categoría"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
