import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { ACCEPT_ATTR, IMAGE_RULES, uploadImage } from "../../../lib/imageUpload";

/**
 * Foto de una variante en la tabla de variantes: versión compacta de ImageUploader
 * (una miniatura que se toca para subir), porque va en cada fila. Usa las mismas
 * reglas que la foto principal, ya que en la tienda reemplaza a esa foto.
 */
export const VariantImageInput: React.FC<{
  value?: string | null;
  onChange: (url: string | null) => void;
  label: string;
  /** Avisa al formulario mientras sube, para no guardar a medias */
  onUploadingChange?: (uploading: boolean) => void;
}> = ({ value, onChange, label, onUploadingChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    setError("");
    setUploading(true);
    onUploadingChange?.(true);
    try {
      onChange(await uploadImage(file, "productos", IMAGE_RULES.product));
    } catch (err: any) {
      setError(err.message || "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title={value ? `Cambiar foto de ${label}` : `Subir foto de ${label}`}
        style={{
          width: "44px",
          height: "58px",
          flexShrink: 0,
          padding: 0,
          borderRadius: "0.35rem",
          overflow: "hidden",
          border: value ? "1px solid var(--border)" : "1px dashed var(--border)",
          backgroundColor: "var(--muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: uploading ? "default" : "pointer",
          color: "var(--muted-foreground)",
        }}
      >
        {uploading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : value ? (
          <img src={value} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ImagePlus size={16} />
        )}
      </button>
      {value && !uploading && (
        <button
          type="button"
          onClick={() => onChange(null)}
          title={`Quitar foto de ${label}`}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--muted-foreground)", display: "flex" }}
        >
          <X size={14} />
        </button>
      )}
      {error && (
        <span style={{ fontSize: "0.68rem", color: "var(--destructive)", maxWidth: "160px", lineHeight: 1.3 }}>{error}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ display: "none" }}
      />
    </div>
  );
};
