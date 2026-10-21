import React, { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileUp, Loader2, X, XCircle } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { buildImportPlan, buildTemplateCsv, ImportPlan, parseCsv } from "../../../lib/productImport";
import { variantLabel } from "../../../lib/catalog";

type Result = { name: string; ok: boolean; error?: string };

function formatCLP(n: number) {
  return `$${n.toLocaleString("es-CL")}`;
}

/**
 * Carga masiva de productos desde CSV: descargar plantilla → subir archivo →
 * vista previa con errores por fila → importar (crea uno a uno con addProduct,
 * igual que el formulario, así la API aplica las mismas reglas).
 */
export const ProductImporter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { products, categories, addProduct } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Result[] | null>(null);

  const downloadTemplate = () => {
    const blob = new Blob([buildTemplateCsv(categories)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-productos-bloom-eterno.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    setResults(null);
    setFileName(file.name);
    const text = await file.text();
    setPlan(buildImportPlan(parseCsv(text), categories, products));
    if (inputRef.current) inputRef.current.value = "";
  };

  const ready = plan?.products.filter((p) => p.errors.length === 0) ?? [];
  const withErrors = plan?.products.filter((p) => p.errors.length > 0) ?? [];
  const generalErrors = plan?.general.filter((g) => g.level === "error") ?? [];

  const runImport = async () => {
    if (ready.length === 0 || importing) return;
    setImporting(true);
    setProgress(0);
    const out: Result[] = [];
    // El código correlativo sigue al último producto; se calcula acá porque
    // addProduct lo derivaría del catálogo antes de esta carga.
    let nextNum = products.length + 1;
    for (const p of ready) {
      try {
        // Con SKU, el código del producto es su SKU; si no, el correlativo
        await addProduct({ ...p.data, num: p.sku ?? String(nextNum).padStart(2, "0"), isActive: true });
        if (!p.sku) nextNum++;
        out.push({ name: p.data.name, ok: true });
      } catch (err: any) {
        out.push({ name: p.data.name, ok: false, error: err?.message || "Error desconocido" });
      }
      setProgress(out.length);
    }
    setResults(out);
    setPlan(null);
    setImporting(false);
  };

  const box: React.CSSProperties = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "1rem",
    padding: "1.75rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
  };
  const buttonStyle = (primary: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.6rem 1.2rem",
    borderRadius: "2rem",
    border: primary ? "none" : "1px solid var(--border)",
    backgroundColor: primary ? "var(--primary)" : "var(--card)",
    color: primary ? "var(--primary-foreground)" : "var(--foreground)",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <div style={box}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 500, margin: "0 0 0.35rem" }}>Importar productos</h3>
          <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: 0, maxWidth: "640px", lineHeight: 1.6 }}>
            Carga muchos productos de una vez desde una planilla. <strong>Una fila por variante:</strong> las filas con el mismo
            nombre y categoría forman un solo producto. Cada característica de la categoría (ej: Color) es una columna con su
            nombre. La columna <strong>sku</strong> es el SKU de la variante de esa fila, o del producto si no tiene variantes. En Excel, guarda como <strong>CSV (delimitado por punto y coma)</strong>; en Google Sheets, Archivo →
            Descargar → CSV.
          </p>
        </div>
        <button onClick={onClose} aria-label="Cerrar importador" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
          <X size={20} />
        </button>
      </div>

      {/* Paso 1: plantilla y archivo */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.25rem" }}>
        <button type="button" onClick={downloadTemplate} style={buttonStyle(false)}>
          <Download size={15} /> Descargar plantilla
        </button>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={importing} style={buttonStyle(true)}>
          <FileUp size={15} /> {fileName ? "Elegir otro archivo" : "Subir planilla CSV"}
        </button>
        {fileName && <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{fileName}</span>}
        <input ref={inputRef} type="file" accept=".csv,text/csv,.txt" onChange={(e) => readFile(e.target.files?.[0])} style={{ display: "none" }} />
      </div>

      {/* Paso 2: vista previa */}
      {plan && (
        <div>
          {plan.general.map((g, i) => (
            <Notice key={i} level={g.level}>
              {g.row ? `Fila ${g.row}: ` : ""}
              {g.message}
            </Notice>
          ))}

          {generalErrors.length === 0 && (
            <>
              <p style={{ fontSize: "0.85rem", margin: "0.5rem 0 1rem" }}>
                <strong>{ready.length}</strong> producto{ready.length === 1 ? "" : "s"} listo{ready.length === 1 ? "" : "s"} para importar
                {withErrors.length > 0 && (
                  <>
                    {" · "}
                    <span style={{ color: "var(--destructive)" }}>
                      <strong>{withErrors.length}</strong> con errores (no se importarán)
                    </span>
                  </>
                )}
              </p>

              <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "0.75rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--muted)", textAlign: "left" }}>
                      {["", "Producto", "Categoría", "Precio", "Stock / variantes", "Filas", "Observaciones"].map((h) => (
                        <th key={h} style={{ padding: "0.6rem 0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plan.products.map((p) => {
                      const cat = categories.find((c) => c.id === p.data.categoryId);
                      const ok = p.errors.length === 0;
                      return (
                        <tr key={p.key} style={{ borderTop: "1px solid var(--border)", verticalAlign: "top" }}>
                          <td style={{ padding: "0.6rem 0.75rem" }}>
                            {ok ? <CheckCircle2 size={16} color="var(--primary)" /> : <XCircle size={16} color="var(--destructive)" />}
                          </td>
                          <td style={{ padding: "0.6rem 0.75rem", fontWeight: 500, minWidth: "180px" }}>
                            {p.data.name || "—"}
                            {p.sku && <div style={{ fontWeight: 400, fontSize: "0.72rem", color: "var(--muted-foreground)" }}>SKU {p.sku}</div>}
                          </td>
                          <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>{p.data.category || "—"}</td>
                          <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>{formatCLP(p.data.price)}</td>
                          <td style={{ padding: "0.6rem 0.75rem", minWidth: "160px" }}>
                            {(p.data.variants ?? []).length > 0 ? (
                              <>
                                {(p.data.variants ?? []).length} variante{(p.data.variants ?? []).length === 1 ? "" : "s"} · {p.data.stock} un.
                                <div style={{ color: "var(--muted-foreground)", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                                  {(p.data.variants ?? []).map((v) => variantLabel(v, cat) + (v.sku ? ` (SKU ${v.sku})` : "")).join(" · ")}
                                </div>
                              </>
                            ) : (
                              `${p.data.stock} un.`
                            )}
                          </td>
                          <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap", color: "var(--muted-foreground)" }}>{p.rows.join(", ")}</td>
                          <td style={{ padding: "0.6rem 0.75rem", minWidth: "260px" }}>
                            {p.errors.map((e, i) => (
                              <div key={`e${i}`} style={{ color: "var(--destructive)", marginBottom: "0.2rem" }}>
                                {e}
                              </div>
                            ))}
                            {p.warnings.map((w, i) => (
                              <div key={`w${i}`} style={{ color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                                {w}
                              </div>
                            ))}
                            {ok && p.warnings.length === 0 && <span style={{ color: "var(--primary)" }}>Listo</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem", alignItems: "center" }}>
                {importing && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                    <Loader2 size={15} className="animate-spin" /> Importando {progress} de {ready.length}…
                  </span>
                )}
                <button type="button" onClick={runImport} disabled={ready.length === 0 || importing} style={{ ...buttonStyle(true), opacity: ready.length === 0 || importing ? 0.5 : 1 }}>
                  Importar {ready.length} producto{ready.length === 1 ? "" : "s"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Paso 3: resultado */}
      {results && (
        <div>
          <Notice level={results.every((r) => r.ok) ? "ok" : "warning"}>
            Se importaron {results.filter((r) => r.ok).length} de {results.length} productos.
            {results.some((r) => r.ok) && " Revisa en el inventario los que quedaron con foto provisoria y súbeles su foto desde Editar."}
          </Notice>
          {results
            .filter((r) => !r.ok)
            .map((r) => (
              <Notice key={r.name} level="error">
                {r.name}: {r.error}
              </Notice>
            ))}
        </div>
      )}
    </div>
  );
};

function Notice({ level, children }: { level: "error" | "warning" | "ok"; children: React.ReactNode }) {
  const color = level === "error" ? "var(--destructive)" : level === "ok" ? "var(--primary)" : "var(--gold)";
  const Icon = level === "error" ? XCircle : level === "ok" ? CheckCircle2 : AlertTriangle;
  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.82rem", marginBottom: "0.6rem", lineHeight: 1.5 }}>
      <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
      <span>{children}</span>
    </div>
  );
}
