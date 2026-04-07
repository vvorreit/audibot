"use client";

export default function PrintButton({ accent }: { accent: string }) {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: accent,
        color: "white",
        border: "none",
        padding: "12px 28px",
        borderRadius: 12,
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      Imprimer / Sauvegarder en PDF
    </button>
  );
}
