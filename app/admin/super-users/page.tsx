"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getAllUsersAdmin } from "@/app/admin/actions";
import { Search, Shield, Eye, Landmark } from "lucide-react";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  plan: string;
  features: { bilanAuditif: boolean; rapprochement: boolean };
}

export default function SuperUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsersAdmin();
      // Fetch features for all users in parallel
      const usersWithFeatures: UserRow[] = await Promise.all(
        allUsers.map(async (u: { id: string; name: string | null; email: string | null; plan: string }) => {
          const res = await fetch(`/api/admin/user-features/${u.id}`);
          const features = await res.json();
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            plan: u.plan,
            features: {
              bilanAuditif: features.bilanAuditif ?? false,
              rapprochement: features.rapprochement ?? false,
            },
          };
        })
      );
      setUsers(usersWithFeatures);
    } catch (err) {
      console.error("Erreur chargement users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleFeature = async (
    userId: string,
    feature: "bilanAuditif" | "rapprochement",
    value: boolean
  ) => {
    setTogglingId(`${userId}-${feature}`);
    try {
      const res = await fetch(`/api/admin/user-features/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [feature]: value }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, features: { ...u.features, [feature]: value } }
              : u
          )
        );
      }
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(q) ?? false) ||
      (u.email?.toLowerCase().includes(q) ?? false)
    );
  });

  const superUserCount = users.filter(
    (u) => u.features.bilanAuditif || u.features.rapprochement
  ).length;

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 font-medium">Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Super Users — Accès Beta</h1>
            <p className="text-sm text-slate-600 font-medium">
              Gérer les accès spéciaux indépendamment du plan
            </p>
          </div>
        </div>
        {superUserCount > 0 && (
          <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-black rounded-full">
            {superUserCount} super user{superUserCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Chargement des utilisateurs...</p>
        </div>
      )}

      {/* User list */}
      {!loading && (
        <div className="space-y-2">
          {filtered.map((u) => {
            const isSuperUser = u.features.bilanAuditif || u.features.rapprochement;
            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl border p-5 transition-all ${
                  isSuperUser ? "border-green-200 bg-green-50/30" : "border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 truncate">
                        {u.name || "Sans nom"}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                        {u.plan}
                      </span>
                      {isSuperUser && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                          Super User
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                      {u.email}
                    </p>
                  </div>

                  {/* Feature toggles */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Bilan Visuel toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600 hidden sm:inline">Bilan visuel</span>
                      <button
                        role="switch"
                        aria-checked={u.features.bilanAuditif}
                        aria-label="Bilan visuel"
                        disabled={togglingId === `${u.id}-bilanAuditif`}
                        onClick={() => toggleFeature(u.id, "bilanAuditif", !u.features.bilanAuditif)}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          u.features.bilanAuditif ? "bg-blue-600" : "bg-slate-200"
                        } disabled:opacity-50`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            u.features.bilanAuditif ? "translate-x-4" : ""
                          }`}
                        />
                      </button>
                    </label>

                    {/* Rapprochement toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Landmark className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600 hidden sm:inline">Rapprochement</span>
                      <button
                        role="switch"
                        aria-checked={u.features.rapprochement}
                        aria-label="Rapprochement bancaire"
                        disabled={togglingId === `${u.id}-rapprochement`}
                        onClick={() => toggleFeature(u.id, "rapprochement", !u.features.rapprochement)}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          u.features.rapprochement ? "bg-blue-600" : "bg-slate-200"
                        } disabled:opacity-50`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            u.features.rapprochement ? "translate-x-4" : ""
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-600 font-medium">Aucun utilisateur trouvé.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
