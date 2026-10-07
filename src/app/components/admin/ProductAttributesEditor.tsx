import React, { useState } from "react";
import { X } from "lucide-react";
import { Category, ProductVariant } from "../../types/store";
import { combineOptions, fixedAttributes, newLocalId, sameOptions, variantAttributes } from "../../../lib/catalog";

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

const sectionStyle: React.CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: "0.75rem",
  border: "1px solid var(--border)",
  backgroundColor: "var(--background)",
};

/**
 * Parte del formulario de producto que depende de la categoría: valores de las
 * características fijas y, para las características variantes, las opciones del
 * producto (ej: colores de un alambre) con el stock y precio de cada combinación.
 *
 * Se debe montar con key = producto + categoría: el estado inicial sale de las props.
 */
export const ProductAttributesEditor: React.FC<{
  category?: Category;
  attributes: Record<string, string>;
  onAttributesChange: (attrs: Record<string, string>) => void;
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice: number;
  /** Valores ya usados en otros productos de la categoría, para sugerir */
  suggestions: Record<string, string[]>;
}> = ({ category, attributes, onAttributesChange, variants, onVariantsChange, basePrice, suggestions }) => {
  const fixed = fixedAttributes(category);
  const variantAttrs = variantAttributes(category);

  // Opciones cargadas por característica variante, en el orden en que aparecen en las variantes
  const [values, setValues] = useState<Record<string, string[]>>(() => {
    const out: Record<string, string[]> = {};
    for (const a of variantAttrs) {
      out[a.id] = Array.from(new Set(variants.map((v) => v.options[a.id]).filter(Boolean)));
    }
    return out;
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Regenera las combinaciones conservando stock/precio (y el id) de las que ya existían
  const applyValues = (next: Record<string, string[]>) => {
    setValues(next);
    const combos = combineOptions(variantAttrs, next);
    onVariantsChange(
      combos.map(
        (options) => variants.find((v) => sameOptions(v.options, options)) ?? { id: newLocalId("var"), options, stock: 0, price: null }
      )
    );
  };

  const addValues = (attrId: string) => {
    const typed = (drafts[attrId] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (typed.length === 0) return;
    const current = values[attrId] ?? [];
    const merged = [...current];
    for (const t of typed) {
      if (!merged.some((m) => m.toLowerCase() === t.toLowerCase())) merged.push(t);
    }
    setDrafts((d) => ({ ...d, [attrId]: "" }));
    applyValues({ ...values, [attrId]: merged });
  };

  const removeValue = (attrId: string, value: string) => {
    const affected = variants.filter((v) => v.options[attrId] === value && v.stock > 0);
    if (affected.length > 0 && !confirm(`"${value}" tiene stock cargado. ¿Quitar esta opción de todas formas?`)) return;
    applyValues({ ...values, [attrId]: (values[attrId] ?? []).filter((v) => v !== value) });
  };

  const setVariant = (id: string, changes: Partial<ProductVariant>) =>
    onVariantsChange(variants.map((v) => (v.id === id ? { ...v, ...changes } : v)));

  if (!category) return null;

  if (fixed.length === 0 && variantAttrs.length === 0) {
    return (
      <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", margin: 0 }}>
        La categoría "{category.name}" no tiene características. Puedes agregarlas en la pestaña Categorías.
      </p>
    );
  }

  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {fixed.length > 0 && (
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.75rem" }}>Características de {category.name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {fixed.map((a) => (
              <div key={a.id}>
                <label style={labelStyle}>{a.name}</label>
                <input
                  type="text"
                  list={`sug-${a.id}`}
                  value={attributes[a.id] ?? ""}
                  onChange={(e) => onAttributesChange({ ...attributes, [a.id]: e.target.value })}
                  style={inputStyle}
                />
                <datalist id={`sug-${a.id}`}>
                  {(suggestions[a.id] ?? []).map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            ))}
          </div>
        </div>
      )}

      {variantAttrs.length > 0 && (
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.25rem" }}>Variantes</div>
          <p style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", margin: "0 0 0.85rem" }}>
            Carga las opciones que tienes de este producto (puedes escribir varias separadas por coma). El cliente elegirá una
            al comprar y cada opción lleva su propio stock. Si no cargas opciones, el producto se vende sin variantes.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {variantAttrs.map((a) => (
              <div key={a.id}>
                <label style={labelStyle}>{a.name}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                  {(values[a.id] ?? []).map((v) => (
                    <span
                      key={v}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.78rem",
                        padding: "0.25rem 0.4rem 0.25rem 0.7rem",
                        borderRadius: "1rem",
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {v}
                      <button
                        type="button"
                        onClick={() => removeValue(a.id, v)}
                        title={`Quitar ${v}`}
                        style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, display: "flex" }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    list={`sug-${a.id}`}
                    value={drafts[a.id] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addValues(a.id);
                      }
                    }}
                    placeholder={`Agregar ${a.name.toLowerCase()} (ej: Dorado, Plateado)`}
                    style={{ ...inputStyle, width: "260px", padding: "0.4rem 0.7rem" }}
                  />
                  <datalist id={`sug-${a.id}`}>
                    {(suggestions[a.id] ?? [])
                      .filter((s) => !(values[a.id] ?? []).includes(s))
                      .map((s) => (
                        <option key={s} value={s} />
                      ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={() => addValues(a.id)}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.4rem 0.85rem",
                      border: "1px solid var(--primary)",
                      borderRadius: "2rem",
                      background: "transparent",
                      color: "var(--primary)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {variants.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", marginTop: "1rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                  {variantAttrs.map((a) => (
                    <th key={a.id} style={{ padding: "0.5rem 0.4rem" }}>
                      {a.name}
                    </th>
                  ))}
                  <th style={{ padding: "0.5rem 0.4rem" }}>Stock</th>
                  <th style={{ padding: "0.5rem 0.4rem" }}>Precio CLP (opcional)</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    {variantAttrs.map((a) => (
                      <td key={a.id} style={{ padding: "0.4rem" }}>
                        {v.options[a.id] ?? "—"}
                      </td>
                    ))}
                    <td style={{ padding: "0.4rem" }}>
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => setVariant(v.id, { stock: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        style={{ ...inputStyle, width: "90px", padding: "0.35rem 0.5rem" }}
                      />
                    </td>
                    <td style={{ padding: "0.4rem" }}>
                      <input
                        type="number"
                        min={0}
                        value={v.price ?? ""}
                        onChange={(e) =>
                          setVariant(v.id, { price: e.target.value === "" ? null : Math.max(0, parseInt(e.target.value, 10) || 0) })
                        }
                        placeholder={`${basePrice} (precio base)`}
                        style={{ ...inputStyle, width: "170px", padding: "0.35rem 0.5rem" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={variantAttrs.length} style={{ padding: "0.5rem 0.4rem", fontWeight: 600, textAlign: "right" }}>
                    Stock total:
                  </td>
                  <td colSpan={2} style={{ padding: "0.5rem 0.4rem", fontWeight: 700 }}>
                    {totalStock} un.
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
