"use client";

import type React from "react";
import { ms,teal } from "../../styles";

export function Field({ label, value, onChange, multi, dark, type = "text", placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multi?: boolean;
  dark: boolean;
  type?: string;
  placeholder?: string;
}) {
  const s = ms(dark);
  const base: React.CSSProperties = {
    background: s.ibg,
    border: "1px solid " + s.brd,
    borderRadius: 8,
    padding: "10px 13px",
    color: s.tx,
    fontSize: 14,
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "all 0.2s"
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
      {multi ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...base, resize: "vertical" }}
          onFocus={e => {
            e.currentTarget.style.borderColor = teal;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${teal}20`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = s.brd;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={base}
          onFocus={e => {
            e.currentTarget.style.borderColor = teal;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${teal}20`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = s.brd;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      )}
    </div>
  );
}
