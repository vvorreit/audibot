"use client";
/** State management hook for the tiers-payant dossiers page.
 * Exports: useTiersPayant. ~160 lignes */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/Toast";
import { createDossierTP, getDossiersTP } from "../actions";
import { todayString } from "../_components/constants";
import type { DossierTP, SortKey } from "../_components/types";

export function useTiersPayant() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  /* --- dossiers data --- */
  const [dossiers, setDossiers] = useState<DossierTP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --- UI state --- */
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { toasts, showToast, dismissToast } = useToast();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ dossier: DossierTP; statut: string } | null>(null);
  const [showNoemie, setShowNoemie] = useState(false);

  /* --- filters --- */
  const [filterSearch, setFilterSearch] = useState("");
  const [filterMutuelle, setFilterMutuelle] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  /* --- sort --- */
  const [sortKey, setSortKey] = useState<SortKey>("montant");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "montant" || key === "dateEnvoi" ? "desc" : "asc");
    }
  };

  /* --- form fields --- */
  const [mutuelle, setMutuelle] = useState("");
  const [montant, setMontant] = useState("");
  const [dateEnvoi, setDateEnvoi] = useState(todayString());
  const [numeroAdherent, setNumeroAdherent] = useState("");
  const [referenceInterne, setReferenceInterne] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [doublonAlerte, setDoublonAlerte] = useState<{
    reference: string;
    dateEnvoi: string;
    statut: string;
    montant: number;
  } | null>(null);
  const [doublonConfirme, setDoublonConfirme] = useState(false);

  /* --- data loading --- */
  const loadDossiers = () => {
    getDossiersTP()
      .then((result) => setDossiers(result.dossiers as DossierTP[]))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDossiers(); }, []);

  /* --- form helpers --- */
  const resetForm = () => {
    setMutuelle("");
    setMontant("");
    setDateEnvoi(todayString());
    setNumeroAdherent("");
    setReferenceInterne("");
    setFormError(null);
    setDoublonAlerte(null);
    setDoublonConfirme(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!mutuelle) { setFormError("Veuillez sélectionner une mutuelle."); return; }
    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) { setFormError("Le montant doit être supérieur à 0."); return; }
    if (!dateEnvoi) { setFormError("La date d'envoi est requise."); return; }
    const dateObj = new Date(dateEnvoi);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateObj > today) { setFormError("La date d'envoi ne peut pas être dans le futur."); return; }

    if (!doublonConfirme && numeroAdherent) {
      try {
        const res = await fetch("/api/tiers-payant/check-doublon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mutuelle, numeroAdherent, montant: montantNum }),
        });
        const data = await res.json();
        if (data.doublon && data.dossier) {
          setDoublonAlerte(data.dossier);
          return;
        }
      } catch {
        /* En cas d'erreur de vérification, on laisse passer */
      }
    }

    setSubmitting(true);
    try {
      const result = await createDossierTP({
        mutuelle,
        montant: montantNum,
        dateEnvoi,
        numeroAdherent: numeroAdherent || undefined,
        referenceInterne: referenceInterne || undefined,
      });
      showToast(`Dossier ${result.reference} enregistré`, "success");
      setSuccess(null);
      resetForm();
      setShowForm(false);
      setLoading(true);
      loadDossiers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSuccess = (msg: string) => {
    setStatusModal(null);
    showToast(msg, "success");
    setSuccess(null);
    setLoading(true);
    loadDossiers();
  };

  /* --- filtering & sorting (derived) --- */
  const filteredDossiers = dossiers.filter((d) => {
    if (filterSearch && !d.reference.toLowerCase().includes(filterSearch.toLowerCase()) &&
        !d.numeroAdherent?.toLowerCase().includes(filterSearch.toLowerCase()) &&
        !d.referenceInterne?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    if (filterMutuelle && d.mutuelle !== filterMutuelle) return false;
    if (filterStatut && d.statut !== filterStatut) return false;
    if (filterMode && d.mode !== filterMode) return false;
    if (filterMinAmount && d.montant < parseFloat(filterMinAmount)) return false;
    if (filterDateStart && d.dateEnvoi < filterDateStart) return false;
    if (filterDateEnd && d.dateEnvoi > filterDateEnd) return false;
    return true;
  });

  const sortedDossiers = [...filteredDossiers].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "reference": cmp = a.reference.localeCompare(b.reference); break;
      case "mutuelle": cmp = a.mutuelle.localeCompare(b.mutuelle); break;
      case "montant": cmp = a.montant - b.montant; break;
      case "dateEnvoi": cmp = new Date(a.dateEnvoi).getTime() - new Date(b.dateEnvoi).getTime(); break;
      case "statut": cmp = a.statut.localeCompare(b.statut); break;
      case "mode": cmp = (a.mode || "").localeCompare(b.mode || ""); break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const resetFilters = () => {
    setFilterSearch("");
    setFilterMutuelle("");
    setFilterStatut("");
    setFilterMode("");
    setFilterMinAmount("");
    setFilterDateStart("");
    setFilterDateEnd("");
  };

  return {
    /* session */
    isAdmin,
    /* data */
    dossiers, loading, error,
    filteredDossiers, sortedDossiers,
    /* sort */
    sortKey, sortDir, toggleSort,
    /* filters */
    filterSearch, setFilterSearch,
    filterMutuelle, setFilterMutuelle,
    filterStatut, setFilterStatut,
    filterMode, setFilterMode,
    filterMinAmount, setFilterMinAmount,
    filterDateStart, setFilterDateStart,
    filterDateEnd, setFilterDateEnd,
    resetFilters,
    /* form */
    showForm, setShowForm, resetForm,
    submitting, formError,
    mutuelle, setMutuelle,
    montant, setMontant,
    dateEnvoi, setDateEnvoi,
    numeroAdherent, setNumeroAdherent,
    referenceInterne, setReferenceInterne,
    doublonAlerte, setDoublonAlerte,
    doublonConfirme, setDoublonConfirme,
    handleSubmit,
    /* status */
    success,
    statusModal, setStatusModal,
    handleStatusSuccess,
    /* UI */
    expandedRow, setExpandedRow,
    showNoemie, setShowNoemie,
    toasts, dismissToast,
  };
}
