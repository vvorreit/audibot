"use client";

export function FaviconWithFallback({ name, favicon }: { name: string; favicon: string }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 shrink-0">
      <img
        src={favicon}
        alt={name}
        width={32}
        height={32}
        className="rounded"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <span className="w-8 h-8 rounded bg-blue-100 text-blue-600 text-xs font-black items-center justify-center hidden">
        {name.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}
