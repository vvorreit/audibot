"use client";

import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-6 md:p-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-10 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>
        <div className="flex items-center gap-4 mb-8 text-blue-600">
          <Landmark className="w-12 h-12" />
          <h1 className="text-4xl font-black">Mentions Légales</h1>
        </div>
        <p className="text-sm text-slate-400 mb-10">Conformément à la loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique (LCEN)</p>

        <div className="prose prose-slate max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Éditeur du site</h2>
            <p className="text-slate-600 leading-relaxed">
              Le site <strong>audibot.fr</strong> est édité par :<br /><br />
              <strong>Vorreiter Activities</strong><br />
              Forme juridique : Société par Actions Simplifiée Unipersonnelle (SASU)<br />
              Adresse : 54 rue Marcel et Ida Demia, 01500 Ambérieu-en-Bugey<br />
              SIRET : 92252355000023<br />
              Numéro de TVA intracommunautaire : FR30922523550<br />
              Email : <a href="mailto:contact@audibot.fr" className="text-blue-600 underline">contact@audibot.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Directeur de la publication</h2>
            <p className="text-slate-600 leading-relaxed">
              Le directeur de la publication est :<br /><br />
              <strong>Vincent Vorreiter</strong><br />
              Email : <a href="mailto:contact@audibot.fr" className="text-blue-600 underline">contact@audibot.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">3. Hébergeur</h2>
            <p className="text-slate-600 leading-relaxed">
              Le site est hébergé par :<br /><br />
              <strong>Scaleway SAS</strong><br />
              BP 438 — 75366 Paris CEDEX 08, France<br />
              Certifié HDS (Hébergeur de Données de Santé)<br />
              Site web : <a href="https://www.scaleway.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">www.scaleway.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">4. Propriété intellectuelle</h2>
            <p className="text-slate-600 leading-relaxed">
              L&apos;ensemble du contenu de ce site (textes, images, logotypes, interface) est la propriété exclusive de Vorreiter Activities. Toute reproduction, représentation ou diffusion, en tout ou partie, est interdite sans autorisation préalable écrite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">5. Responsabilité</h2>
            <p className="text-slate-600 leading-relaxed">
              Vorreiter Activities s&apos;efforce de maintenir les informations publiées sur ce site à jour et exactes. Toutefois, nous ne pouvons garantir l&apos;exactitude, la complétude ou l&apos;actualité des informations diffusées. L&apos;utilisation des informations et des outils disponibles sur ce site se fait sous l&apos;entière responsabilité de l&apos;utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">6. Données personnelles</h2>
            <p className="text-slate-600 leading-relaxed">
              Le traitement des données personnelles collectées via ce site est détaillé dans notre{" "}
              <Link href="/legal/confidentialite" className="text-blue-600 underline">Politique de Confidentialité</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">7. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              Pour toute question relative à ces mentions légales : <a href="mailto:contact@audibot.fr" className="text-blue-600 underline">contact@audibot.fr</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
