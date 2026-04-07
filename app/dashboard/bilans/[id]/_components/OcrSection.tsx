"use client";

import { Dispatch, SetStateAction } from "react";
import {
  Save, ClipboardList, Download, Pencil, X, FileText, CreditCard,
} from "lucide-react";
import type { OrdonnanceData, CorrectionOeil, CorrectionLentille } from "@/lib/parsers";
import type { OcrDataPayload } from "./types";
import { isSafeImageSrc } from "./constants";

/* ── OCR Field ─────────────────────────────────────────────────── */

function OcrField({ label, value, field, low, fieldBg, editing, onChange }: {
  label: string; value: string; field: string; low: boolean; fieldBg: string;
  editing: boolean; onChange: (field: string, value: string) => void;
}) {
  if (!value && !editing) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 flex items-center gap-1">
        {label}
        {low && <span className="text-yellow-500 text-[9px]">⚠</span>}
      </p>
      {editing ? (
        <input
          value={value || ""}
          onChange={e => onChange(field, e.target.value)}
          className={`w-full px-2 py-1 text-xs rounded border ${fieldBg} text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors`}
        />
      ) : (
        <p className={`text-xs font-medium px-2 py-1 rounded border ${low ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-slate-50 border-transparent text-slate-700"}`}>
          {value || "—"}
        </p>
      )}
    </div>
  );
}

/* ── OCR Section ───────────────────────────────────────────────── */

export function OcrSection({ ocrData, editingOcr, setEditingOcr, ocrEditing, setOcrEditing, saving, handleSave }: {
  ocrData: OcrDataPayload;
  editingOcr: OcrDataPayload | null;
  setEditingOcr: Dispatch<SetStateAction<OcrDataPayload | null>>;
  ocrEditing: boolean;
  setOcrEditing: Dispatch<SetStateAction<boolean>>;
  saving: boolean;
  handleSave: () => void;
}) {
  if (!ocrData.mutuelle && !ocrData.ordonnance) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" /> Documents scannés
        </p>
        <button
          onClick={() => {
            if (ocrEditing) {
              setEditingOcr(JSON.parse(JSON.stringify(ocrData)));
              setOcrEditing(false);
            } else {
              setOcrEditing(true);
            }
          }}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            ocrEditing ? "bg-slate-200 text-slate-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
        >
          {ocrEditing ? <><X className="w-3 h-3" /> Annuler</> : <><Pencil className="w-3 h-3" /> Modifier</>}
        </button>
      </div>

      {/* ── Carte mutuelle ── */}
      {(ocrEditing ? editingOcr?.mutuelle : ocrData.mutuelle) && (() => {
        const mut = ocrEditing ? editingOcr!.mutuelle! : ocrData.mutuelle!;
        const conf = mut.fieldConfidence ?? {};
        const isLow = (field: string) => typeof conf[field] === "number" && conf[field] < 0.7;
        const fieldBg = (field: string) => isLow(field) ? "bg-yellow-50 border-yellow-300" : "bg-white border-slate-200";
        const setMut = (field: string, value: string) => {
          if (!editingOcr) return;
          setEditingOcr(prev => {
            if (!prev?.mutuelle) return prev;
            return { ...prev, mutuelle: { ...prev.mutuelle, [field]: value } };
          });
        };

        return (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-slate-800">Carte mutuelle</span>
              {ocrData.images?.mutuelle && isSafeImageSrc(ocrData.images.mutuelle) && (
                <a href={ocrData.images.mutuelle} download="carte_mutuelle.jpg" className="ml-auto flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                  <Download className="w-3 h-3" /> Image
                </a>
              )}
            </div>

            {/* Image preview */}
            {ocrData.images?.mutuelle && isSafeImageSrc(ocrData.images.mutuelle) ? (
              <div className="rounded-lg overflow-hidden border border-slate-200 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ocrData.images.mutuelle} alt="Carte mutuelle" className="w-full h-auto max-h-48 object-contain bg-slate-50" />
              </div>
            ) : ocrData.images?.mutuelle ? (
              <div className="rounded-lg border border-slate-200 mb-3 p-4 bg-slate-50 text-xs text-slate-400 text-center">Image non disponible (source non sécurisée)</div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <OcrField label="Organisme" value={mut.organisme} field="organisme" low={isLow("organisme")} fieldBg={fieldBg("organisme")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="N° AMC" value={mut.numeroAMC} field="numeroAMC" low={isLow("numeroAMC")} fieldBg={fieldBg("numeroAMC")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="N° Adhérent" value={mut.numeroAdherent} field="numeroAdherent" low={isLow("numeroAdherent")} fieldBg={fieldBg("numeroAdherent")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="N° Télétransmission" value={mut.numeroTeletransmission} field="numeroTeletransmission" low={isLow("numeroTeletransmission")} fieldBg={fieldBg("numeroTeletransmission")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="Type Conv." value={mut.typeConv} field="typeConv" low={isLow("typeConv")} fieldBg={fieldBg("typeConv")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="N° Sécu" value={mut.numeroSecuriteSociale} field="numeroSecuriteSociale" low={isLow("numeroSecuriteSociale")} fieldBg={fieldBg("numeroSecuriteSociale")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="Début validité" value={mut.dateDebutValidite} field="dateDebutValidite" low={isLow("dateDebutValidite")} fieldBg={fieldBg("dateDebutValidite")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="Fin validité" value={mut.dateFinValidite} field="dateFinValidite" low={isLow("dateFinValidite")} fieldBg={fieldBg("dateFinValidite")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="Nom" value={mut.nom} field="nom" low={isLow("nom")} fieldBg={fieldBg("nom")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="Prénom" value={mut.prenom} field="prenom" low={isLow("prenom")} fieldBg={fieldBg("prenom")} editing={ocrEditing} onChange={setMut} />
              <OcrField label="Date naissance" value={mut.dateNaissance} field="dateNaissance" low={isLow("dateNaissance")} fieldBg={fieldBg("dateNaissance")} editing={ocrEditing} onChange={setMut} />
            </div>

            {mut.personnes && mut.personnes.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Personnes couvertes</p>
                <div className="space-y-1">
                  {mut.personnes.map((p, i) => (
                    <div key={i} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                      {p.prenom} {p.nom} {p.dateNaissance ? `(${p.dateNaissance})` : ""} {p.numeroSecuriteSociale ? `— ${p.numeroSecuriteSociale}` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Ordonnance ── */}
      {(ocrEditing ? editingOcr?.ordonnance : ocrData.ordonnance) && (() => {
        const ord = ocrEditing ? editingOcr!.ordonnance! : ocrData.ordonnance!;
        const conf = ord.fieldConfidence ?? {};
        const isLow = (field: string) => typeof conf[field] === "number" && conf[field] < 0.7;
        const fieldBg = (field: string) => isLow(field) ? "bg-yellow-50 border-yellow-300" : "bg-white border-slate-200";
        const setOrd = (field: string, value: string) => {
          if (!editingOcr) return;
          setEditingOcr(prev => {
            if (!prev?.ordonnance) return prev;
            return { ...prev, ordonnance: { ...prev.ordonnance, [field]: value } as OrdonnanceData };
          });
        };
        const setOrdCorrection = (eye: "lunettesOD" | "lunettesOG", field: keyof CorrectionOeil, value: string) => {
          if (!editingOcr) return;
          setEditingOcr(prev => {
            if (!prev?.ordonnance) return prev;
            return { ...prev, ordonnance: { ...prev.ordonnance, [eye]: { ...prev.ordonnance[eye], [field]: value } } };
          });
        };
        const setOrdLentille = (eye: "lentillesOD" | "lentillesOG", field: keyof CorrectionLentille, value: string) => {
          if (!editingOcr) return;
          setEditingOcr(prev => {
            if (!prev?.ordonnance) return prev;
            return { ...prev, ordonnance: { ...prev.ordonnance, [eye]: { ...prev.ordonnance[eye], [field]: value } } };
          });
        };

        return (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-800">Ordonnance</span>
              {ocrData.images?.ordonnance && isSafeImageSrc(ocrData.images.ordonnance) && (
                <a href={ocrData.images.ordonnance} download="ordonnance.jpg" className="ml-auto flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                  <Download className="w-3 h-3" /> Image
                </a>
              )}
            </div>

            {/* Image preview */}
            {ocrData.images?.ordonnance && isSafeImageSrc(ocrData.images.ordonnance) ? (
              <div className="rounded-lg overflow-hidden border border-slate-200 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ocrData.images.ordonnance} alt="Ordonnance" className="w-full h-auto max-h-48 object-contain bg-slate-50" />
              </div>
            ) : ocrData.images?.ordonnance ? (
              <div className="rounded-lg border border-slate-200 mb-3 p-4 bg-slate-50 text-xs text-slate-400 text-center">Image non disponible (source non sécurisée)</div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <OcrField label="Ophtalmologue" value={ord.nomOphtalmologue} field="nomOphtalmologue" low={isLow("nomOphtalmologue")} fieldBg={fieldBg("nomOphtalmologue")} editing={ocrEditing} onChange={setOrd} />
              <OcrField label="RPPS" value={ord.rpps} field="rpps" low={isLow("rpps")} fieldBg={fieldBg("rpps")} editing={ocrEditing} onChange={setOrd} />
              <OcrField label="Date ordonnance" value={ord.dateOrdonnance} field="dateOrdonnance" low={isLow("dateOrdonnance")} fieldBg={fieldBg("dateOrdonnance")} editing={ocrEditing} onChange={setOrd} />
              <OcrField label="Date validité" value={ord.dateValidite} field="dateValidite" low={isLow("dateValidite")} fieldBg={fieldBg("dateValidite")} editing={ocrEditing} onChange={setOrd} />
              <OcrField label="Patient" value={`${ord.prenomPatient} ${ord.nomPatient}`} field="nomPatient" low={isLow("nomPatient")} fieldBg={fieldBg("nomPatient")} editing={false} onChange={() => {}} />
              <OcrField label="Distance pupillaire" value={ord.distancePupillaire} field="distancePupillaire" low={isLow("distancePupillaire")} fieldBg={fieldBg("distancePupillaire")} editing={ocrEditing} onChange={setOrd} />
            </div>

            {/* Correction lunettes */}
            {(ord.lunettesOD?.sphere || ord.lunettesOG?.sphere) && (
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Correction lunettes</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 font-semibold">
                        <th className="text-left py-1 pr-2"></th>
                        <th className="text-center py-1 px-1">Sphère</th>
                        <th className="text-center py-1 px-1">Cylindre</th>
                        <th className="text-center py-1 px-1">Axe</th>
                        <th className="text-center py-1 px-1">Addition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(["OD", "OG"] as const).map(eye => {
                        const c = eye === "OD" ? ord.lunettesOD : ord.lunettesOG;
                        const eyeKey = eye === "OD" ? "lunettesOD" : "lunettesOG";
                        if (!c) return null;
                        return (
                          <tr key={eye}>
                            <td className="font-bold text-slate-600 py-1 pr-2">{eye}</td>
                            {(["sphere", "cylindre", "axe", "addition"] as const).map(f => {
                              const confKey = `${eyeKey}.${f}`;
                              const low = isLow(confKey);
                              return (
                                <td key={f} className="text-center py-1 px-1">
                                  {ocrEditing ? (
                                    <input
                                      value={c[f] || ""}
                                      onChange={e => setOrdCorrection(eyeKey, f, e.target.value)}
                                      className={`w-full text-center px-1 py-0.5 text-xs rounded border ${low ? "bg-yellow-50 border-yellow-300" : "bg-white border-slate-200"} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                    />
                                  ) : (
                                    <span className={`inline-block px-1.5 py-0.5 rounded ${low ? "bg-yellow-100 text-yellow-800" : "text-slate-700"}`}>
                                      {c[f] || "—"}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Correction lentilles */}
            {(ord.lentillesOD?.sphere || ord.lentillesOG?.sphere) && (
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Correction lentilles</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 font-semibold">
                        <th className="text-left py-1 pr-2"></th>
                        <th className="text-center py-1 px-1">Sphère</th>
                        <th className="text-center py-1 px-1">Cylindre</th>
                        <th className="text-center py-1 px-1">Axe</th>
                        <th className="text-center py-1 px-1">Add.</th>
                        <th className="text-center py-1 px-1">Rayon</th>
                        <th className="text-center py-1 px-1">Diam.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(["OD", "OG"] as const).map(eye => {
                        const c = eye === "OD" ? ord.lentillesOD : ord.lentillesOG;
                        const eyeKey = eye === "OD" ? "lentillesOD" : "lentillesOG";
                        if (!c) return null;
                        return (
                          <tr key={eye}>
                            <td className="font-bold text-slate-600 py-1 pr-2">{eye}</td>
                            {(["sphere", "cylindre", "axe", "addition", "rayonCourbure", "diametre"] as const).map(f => {
                              const confKey = `${eyeKey}.${f}`;
                              const low = isLow(confKey);
                              return (
                                <td key={f} className="text-center py-1 px-1">
                                  {ocrEditing ? (
                                    <input
                                      value={c[f] || ""}
                                      onChange={e => setOrdLentille(eyeKey, f, e.target.value)}
                                      className={`w-full text-center px-1 py-0.5 text-xs rounded border ${low ? "bg-yellow-50 border-yellow-300" : "bg-white border-slate-200"} focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                    />
                                  ) : (
                                    <span className={`inline-block px-1.5 py-0.5 rounded ${low ? "bg-yellow-100 text-yellow-800" : "text-slate-700"}`}>
                                      {c[f] || "—"}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {ord.remarques && (
              <div className="mt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Remarques</p>
                {ocrEditing ? (
                  <textarea value={ord.remarques} onChange={e => setOrd("remarques", e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" rows={2} />
                ) : (
                  <p className="text-xs text-slate-600 bg-slate-50 px-2 py-1.5 rounded">{ord.remarques}</p>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Save OCR button */}
      {ocrEditing && (
        <div className="pt-3 border-t border-slate-100 flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors disabled:opacity-50">
            <Save className="w-3.5 h-3.5" /> {saving ? "..." : "Sauvegarder les modifications"}
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 pt-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 inline-block" /> À vérifier (confiance faible)</span>
      </div>
    </div>
  );
}
