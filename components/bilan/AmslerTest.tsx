import React, { useState, useEffect, useRef } from "react";
import { Grid3X3 } from "lucide-react";

export default function AmslerTest({ onComplete, accent }: { onComplete: () => void; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const gridSize = 20;
    const cellSize = size / gridSize;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cellSize); ctx.lineTo(size, i * cellSize); ctx.stroke();
    }
    ctx.fillStyle = "#dc2626";
    ctx.beginPath(); ctx.arc(size / 2, size / 2, 5, 0, Math.PI * 2); ctx.fill();
  }, []);

  useEffect(() => {
    if (seconds <= 0) { onComplete(); return; }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onComplete]);

  const pct = ((30 - seconds) / 30) * 100;

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: accent + "15", color: accent }}>
          <Grid3X3 className="w-4 h-4" />
          Test de la grille d&apos;Amsler
        </div>
        <h2 className="text-2xl font-black text-slate-900">Fixez le point rouge</h2>
        <p className="text-slate-500 max-w-xs mx-auto text-base">
          Les lignes vous semblent-elles déformées ou manquantes ? Signalez-le à votre audioprothésiste.
        </p>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100">
        <canvas ref={canvasRef} width={280} height={280} className="block rounded-xl" />
      </div>
      <div className="w-full max-w-xs space-y-2">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: accent }} />
        </div>
        <div className="text-center">
          <span className="text-3xl font-black tabular-nums" style={{ color: accent }}>{seconds}s</span>
        </div>
      </div>
      <button onClick={onComplete} className="text-sm text-slate-400 hover:text-slate-600 font-medium">
        Passer ce test
      </button>
    </div>
  );
}
