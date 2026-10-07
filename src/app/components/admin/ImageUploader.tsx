import React, { useRef, useState } from "react";
import { Upload, ImageOff, Link2 } from "lucide-react";
import { ACCEPT_ATTR, ImageRules, uploadImage } from "../../../lib/imageUpload";

/**
 * Campo de imagen del panel: subir desde el computador/celular (validada y
 * optimizada antes de subir) o, como alternativa, pegar una URL.
 */
export const ImageUploader: React.FC<{
  value: string;
  onChange: (url: string) => void;
  folder: "productos" | "categorias";
  rules: ImageRules;
  /** Avisa al formulario mientras sube, para no guardar a medias */
  onUploadingChange?: (uploading: boolean) => void;
}> = ({ value, onChange, folder, rules, onUploadingChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [previewBroken, setPreviewBroken] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    setError("");
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadImage(file, folder, rules);
      setPreviewBroken(false);
      onChange(url);
    } catch (err: any) {
      setError(err.message || "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "stretch" }}>
        {/* Vista previa */}
        <div
          style={{
            width: "96px",
            height: "128px",
            flexShrink: 0,
            borderRadius: "0.5rem",
            overflow: "hidden",
            backgroundColor: "var(--muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border)",
          }}
        >
          {value && !previewBroken ? (
            <img
              src={value}
              alt="Vista previa"
              onError={() => setPreviewBroken(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <ImageOff size={22} style={{ color: "var(--muted-foreground)" }} />
          )}
        </div>

        {/* Zona de carga */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          style={{
            flex: 1,
            border: `2px dashed ${dragOver ? "var(--primary)" : "var(--border)"}`,
            borderRadius: "0.5rem",
            backgroundColor: dragOver ? "rgba(74, 92, 46, 0.06)" : "var(--background)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem",
            padding: "0.75rem",
            cursor: uploading ? "default" : "pointer",
            textAlign: "center",
          }}
        >
          <Upload size={20} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
            {uploading ? "Optimizando y subiendo…" : value ? "Cambiar imagen" : "Subir imagen"}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
            Haz clic o arrastra una foto aquí
          </span>
          <span style={{ fontSize: "0.66rem", color: "var(--muted-foreground)" }}>{rules.hint}</span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={(e) => handleFile(e.target.files?.[0])}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.78rem",
            color: "var(--destructive)",
            backgroundColor: "rgba(220,38,38,0.08)",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.4rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Alternativa: pegar una URL */}
      <button
        type="button"
        onClick={() => setShowUrl((s) => !s)}
        style={{
          marginTop: "0.5rem",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontSize: "0.72rem",
          color: "var(--muted-foreground)",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        <Link2 size={12} />
        {showUrl ? "Ocultar URL" : "o pegar una URL de imagen"}
      </button>
      {showUrl && (
        <input
          type="url"
          value={value}
          onChange={(e) => {
            setPreviewBroken(false);
            onChange(e.target.value);
          }}
          placeholder="https://..."
          style={{
            display: "block",
            marginTop: "0.4rem",
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.4rem",
            border: "1px solid var(--border)",
            fontSize: "0.8rem",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
};
