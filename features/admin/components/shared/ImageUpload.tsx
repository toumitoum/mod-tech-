"use client";

import { Image as ImageIcon,RefreshCw,X } from "lucide-react";
import { useEffect,useRef,useState } from "react";
import { uploadSiteImage } from "../../services/storage.service";
import { ms } from "../../styles";

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
  const [uploadError, setUploadError] = useState("");
  const [preview, setPreview] = useState(cur);
  const ref = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    void Promise.resolve().then(() => setPreview(cur));
  }, [cur]);
  
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const publicUrl = await uploadSiteImage(file, path);
      setUploadError("");
      setPreview(publicUrl); onDone(publicUrl);
    } catch (error) {
      setUploadError("Upload error: " + (error instanceof Error ? error.message : String(error)));
    }
    setUploading(false);
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: s.space.xs }}>
      <label style={{
        ...s.typography.label,
        color: s.mut,
        letterSpacing: 0,
      }}>
        {label}
      </label>
      <div>
        {preview ? (
          <div style={{
            marginBottom: 10,
            borderRadius: s.radius.lg,
            overflow: "hidden",
            border: "1px solid " + s.brd,
            position: "relative",
            boxShadow: s.softShadow
          }}>
            <img src={preview} alt="" style={{ width: "100%", height, objectFit: "cover", display: "block" }} />
            <button type="button"
              onClick={() => { setPreview(""); onDone(""); }}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: s.error,
                border: "none",
                borderRadius: s.radius.sm,
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
            borderRadius: s.radius.lg,
            border: "1px dashed " + s.colors.borderStrong,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: s.sub,
            fontSize: 12,
            flexDirection: "column",
            gap: 6,
            background: s.primarySoft
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
        <button type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          style={s.button("secondary", uploading)}
        >
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {uploading ? "Upload..." : "Choisir image"}
        </button>
        {uploadError && (
          <div style={{
            marginTop: 8,
            background: s.errorSoft,
            color: s.error,
            border: "1px solid " + s.brd,
            borderRadius: s.radius.md,
            padding: "10px 12px",
            fontSize: 12,
            fontWeight: 750,
            lineHeight: 1.45
          }}>
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
}
