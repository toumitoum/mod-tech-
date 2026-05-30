"use client";

import { Image as ImageIcon,RefreshCw,X } from "lucide-react";
import { useEffect,useRef,useState } from "react";
import { uploadSiteImage } from "../../services/storage.service";
import { ms,teal } from "../../styles";

export function ImgUpload({ label, cur, path, onDone, dark, height = 100 }: {
  label: string;
  cur: string;
  path: string;
  onDone: (url: string) => void;
  dark: boolean;
  height?: number;
}) {
  const s = ms(dark);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(cur);
  const ref = useRef<HTMLInputElement>(null);
  
  useEffect(() => { setPreview(cur); }, [cur]);
  
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const publicUrl = await uploadSiteImage(file, path);
      setPreview(publicUrl); onDone(publicUrl);
    } catch (error) {
      alert("Upload error: " + (error instanceof Error ? error.message : String(error)));
    }
    setUploading(false);
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 11,
        fontWeight: 700,
        color: s.mut,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontFamily: "monospace"
      }}>
        {label}
      </label>
      <div>
        {preview ? (
          <div style={{
            marginBottom: 10,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid " + s.brd,
            position: "relative"
          }}>
            <img src={preview} alt="" style={{ width: "100%", height, objectFit: "cover", display: "block" }} />
            <button
              onClick={() => { setPreview(""); onDone(""); }}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "rgba(239,68,68,0.9)",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 8px"
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div style={{
            marginBottom: 10,
            borderRadius: 10,
            border: "1px dashed " + s.brd,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: s.sub,
            fontSize: 12,
            flexDirection: "column",
            gap: 4
          }}>
            <ImageIcon className="w-6 h-6" />
            <span>Aucune image</span>
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <button
          onClick={() => ref.current?.click()}
          disabled={uploading}
          style={{
            background: "rgba(13,148,136,0.1)",
            border: "1px dashed rgba(13,148,136,0.4)",
            borderRadius: 8,
            padding: "8px 16px",
            color: teal,
            fontSize: 13,
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {uploading ? "Upload..." : "Choisir image"}
        </button>
      </div>
    </div>
  );
}
