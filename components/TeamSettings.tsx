"use client";

import { useState } from "react";
import { createTeam, inviteMember, removeMember } from "@/app/actions/team";
import { useRouter } from "next/navigation";
import { ToastContainer, useToast } from "@/components/Toast";

interface TeamData {
  id: string;
  name: string;
  users: Array<{
    id: string;
    name: string | null;
    email: string | null;
    teamRole: string | null;
    image: string | null;
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
  }>;
  currentUserRole: string | null;
  seatsLimit: number;
}

export default function TeamSettings({ initialTeam }: { initialTeam: TeamData | null }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [team, setTeam] = useState<TeamData | null>(initialTeam);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const { toasts, showToast, dismissToast } = useToast();
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const isOwner = team?.currentUserRole === "OWNER";
  const isAdmin = team?.currentUserRole === "ADMIN" || isOwner;
  const seatsUsed = team ? team.users.length + team.invitations.length : 0;
  const seatsLimit = team?.seatsLimit ?? 1;
  const isFull = seatsUsed >= seatsLimit;

  async function handleCreateTeam() {
    if (!teamName) return;
    setLoading(true);
    try {
      await createTeam(teamName);
      showToast("Équipe créée !", "success");
      router.refresh();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail) return;
    setLoading(true);
    try {
      const res = await inviteMember(inviteEmail);
      if (res.success) {
        showToast(res.link ? `Lien d'invitation : ${res.link}` : "Invitation envoyée !", "success");
        setInviteEmail("");
        router.refresh();
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(userId: string) {
    setLoading(true);
    setConfirmRemoveId(null);
    try {
      await removeMember(userId);
      showToast("Membre retiré.", "success");
      router.refresh();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!team) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20">
        <div className="max-w-md mx-auto px-4 py-10">
          <div className="bg-white p-10 rounded-card shadow-sm border border-slate-100 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-3">Créer une équipe</h2>
            <p className="text-slate-500 font-medium mb-8 text-sm">
              Rassemblez vos collaborateurs et centralisez la facturation.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nom de l'équipe (ex: Cabinet Optique X)"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <button
                onClick={handleCreateTeam}
                disabled={loading || !teamName}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Création..." : "Créer l'équipe"}
              </button>
            </div>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{team.name}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Gérez vos membres et accès.</p>
          </div>
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-2xs font-black rounded-full uppercase tracking-wider">
            {team.currentUserRole}
          </span>
        </div>

        {/* Members */}
        <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Membres ({team.users.length})
            </h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isFull ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>
              {seatsUsed} / {seatsLimit} postes
            </span>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">Nom</th>
                <th className="px-8 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">Email</th>
                <th className="px-8 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">Rôle</th>
                <th className="px-8 py-4 text-2xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {team.users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-900">{user.name || "—"}</td>
                  <td className="px-8 py-5 text-slate-500 font-medium text-sm">{user.email}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 text-2xs font-black rounded-full uppercase tracking-tighter ${
                      user.teamRole === "OWNER"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {user.teamRole}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {isOwner && user.teamRole !== "OWNER" && (
                      confirmRemoveId === user.id ? (
                        <div className="inline-flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-3 py-2 shadow-md">
                          <span className="text-xs text-slate-600 font-medium">Confirmer ?</span>
                          <button
                            onClick={() => handleRemove(user.id)}
                            disabled={loading}
                            className="text-xs font-bold px-3 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Oui
                          </button>
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRemoveId(user.id)}
                          disabled={loading}
                          className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          Retirer
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Invite + Pending */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invite Form */}
            <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Inviter un membre</h2>
              {isFull ? (
                <p className="text-sm font-semibold text-red-500">
                  Tous les postes sont occupés ({seatsLimit}/{seatsLimit}). Passez à un plan supérieur pour inviter davantage.
                </p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="email@exemple.com"
                      className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium text-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    />
                    <button
                      onClick={handleInvite}
                      disabled={loading || !inviteEmail}
                      className="px-5 py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "..." : "Inviter"}
                    </button>
                  </div>

                </>
              )}
            </div>

            {/* Pending Invites */}
            <div className="bg-white p-8 rounded-card shadow-sm border border-slate-100">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Invitations en attente</h2>
              {team.invitations.length === 0 ? (
                <p className="text-slate-400 text-sm font-medium">Aucune invitation en cours.</p>
              ) : (
                <ul className="space-y-3">
                  {team.invitations.map((inv) => (
                    <li key={inv.id} className="flex justify-between items-center">
                      <span className="text-slate-700 font-semibold text-sm">{inv.email}</span>
                      <span className="text-2xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        En attente
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}
