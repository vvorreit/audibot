"use client";

import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import type { ReactNode } from "react";

interface DropZoneProps {
  label: string;
  icon: ReactNode;
  onFile: (file: File) => void;
  isLoading: boolean;
  progress: number;
  fileName?: string;
  hint?: string;
  emptyHint?: string;
  ariaLabel?: string;
  onExample?: () => void;
}

export default function DropZone({ label, icon, onFile, isLoading, progress, fileName, hint, emptyHint, ariaLabel, onExample }: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <>
    <div
      {...getRootProps()}
      role="button"
      tabIndex={isLoading ? -1 : 0}
      aria-label={isLoading ? `Chargement — ${label}` : (ariaLabel ?? label)}
      aria-busy={isLoading ? "true" : undefined}
      aria-disabled={isLoading ? "true" : undefined}
      className={`
        relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed
        cursor-pointer transition-all duration-200 min-h-[180px] select-none
        ${isDragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"}
        ${isLoading ? "cursor-not-allowed opacity-80" : ""}
      `}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <>
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-blue-600">Analyse en cours... {progress}%</p>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">{icon}</div>
          <p className="text-base font-semibold text-slate-700 text-center">{label}</p>
          {emptyHint && !fileName && (
            <p className="text-slate-500 font-medium text-xs text-center mt-1">{emptyHint}</p>
          )}
          {hint && !fileName && (
            <p className="text-2xs text-slate-500 font-medium text-center -mt-1">{hint}</p>
          )}
          {fileName ? (
            <p className="text-xs text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">
              ✓ {fileName}
            </p>
          ) : (
            <p className="text-xs text-slate-400 text-center">
              {isDragActive ? "Déposez ici !" : "Glissez un fichier ou cliquez pour choisir"}
              <br />JPG, PNG ou PDF
            </p>
          )}
        </>
      )}
    </div>
    {onExample && (
      <button type="button" onClick={onExample} className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors block mx-auto">
        ou utiliser un exemple
      </button>
    )}
    </>
  );
}
