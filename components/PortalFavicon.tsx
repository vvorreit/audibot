"use client";

export default function PortalFavicon({ name, favicon }: { name: string; favicon: string }) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all">
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
        <span className="w-8 h-8 rounded bg-blue-100 text-blue-600 text-sm font-black items-center justify-center hidden">
          {name.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <span className="text-xs font-bold text-slate-600 text-center">{name}</span>
    </div>
  );
}
