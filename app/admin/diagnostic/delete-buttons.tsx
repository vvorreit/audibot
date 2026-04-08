"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteLogButton({ logId }: { logId: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Supprimer ce log ?")) return;
    setPending(true);
    try {
      await fetch("/api/admin/diagnostic", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: logId }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50"
    >
      {pending ? "..." : "Supprimer"}
    </button>
  );
}

export function DeleteAllLogsButton({
  hostname,
  trigger,
  count,
}: {
  hostname?: string;
  trigger?: string;
  count: number;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDeleteAll() {
    const filters = [
      hostname && `hostname="${hostname}"`,
      trigger && `trigger="${trigger}"`,
    ].filter(Boolean);
    const desc = filters.length
      ? `Supprimer les ${count} logs (${filters.join(", ")}) ?`
      : `Supprimer TOUS les ${count} logs ?`;

    if (!confirm(desc)) return;
    setPending(true);
    try {
      await fetch("/api/admin/diagnostic", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, hostname: hostname || undefined, trigger: trigger || undefined }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (count === 0) return null;

  return (
    <button
      onClick={handleDeleteAll}
      disabled={pending}
      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
    >
      {pending ? "Suppression..." : `Supprimer ${count} logs`}
    </button>
  );
}
