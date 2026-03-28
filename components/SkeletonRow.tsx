export default function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-100 rounded-xl" style={{ width: i === 0 ? "40%" : i === cols - 1 ? "25%" : "60%" }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3 p-6 rounded-2xl bg-white border border-slate-100">
      <div className="h-3 bg-slate-100 rounded-xl w-1/3" />
      <div className="h-6 bg-slate-100 rounded-xl w-2/3" />
      <div className="h-3 bg-slate-100 rounded-xl w-1/2" />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-4 py-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4 px-6 py-4 rounded-2xl bg-white border border-slate-50">
          <div className="h-4 bg-slate-100 rounded-xl flex-1" />
          <div className="h-4 bg-slate-100 rounded-xl w-24" />
          <div className="h-4 bg-slate-100 rounded-xl w-16" />
        </div>
      ))}
    </div>
  );
}
