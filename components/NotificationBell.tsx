"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, AlertTriangle, RefreshCw, CreditCard, Clock, CheckCheck } from "lucide-react";
import Link from "next/link";
import { getNotifications, markAllAsRead, markAsRead } from "@/app/actions/notifications";

type Notif = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
};

function getIcon(type: string) {
  switch (type) {
    case "alerte_expiration":
      return <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />;
    case "rejet_tp":
      return <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
    case "relance_tp":
      return <RefreshCw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
    case "paiement":
      return <CreditCard className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
    default:
      return <Bell className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />;
  }
}

function relativeTime(date: Date): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const badge = unreadCount === 0 ? null : unreadCount > 9 ? "9+" : String(unreadCount);

  const fetchNotifs = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifs(data as Notif[]);
    } catch {
      /* silencieux */
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    intervalRef.current = setInterval(fetchNotifs, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifs]);

  /* Fermer en cliquant dehors */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      await markAllAsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setLoading(false);
    }
  };

  const handleClickNotif = async (notif: Notif) => {
    if (!notif.read) {
      await markAsRead(notif.id);
      setNotifs((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton cloche */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-500" />
        {badge && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-2xs font-black rounded-full flex items-center justify-center leading-none">
            {badge}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-black text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Bell className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">Aucune notification</p>
              </div>
            ) : (
              notifs.map((notif) => {
                const inner = (
                  <div
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 cursor-pointer ${
                      notif.read ? "opacity-60" : ""
                    }`}
                    onClick={() => handleClickNotif(notif)}
                  >
                    {getIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold text-slate-900 truncate ${!notif.read ? "" : "font-medium"}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span className="text-2xs text-slate-400 font-medium">{relativeTime(notif.createdAt)}</span>
                      </div>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                );

                return notif.link ? (
                  <Link key={notif.id} href={notif.link} className="block">
                    {inner}
                  </Link>
                ) : (
                  <div key={notif.id}>{inner}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
