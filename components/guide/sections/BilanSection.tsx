import React from "react";
import { ClipboardList, Eye, CheckCircle, Star, Layers, BarChart2, Share2, Palette, PieChart } from "lucide-react";
import { SectionAnchor, SectionHeader, Card, SubSection, CheckItem, Divider, InfoBox, TipBox } from "../GuideComponents";

export default function BilanSection() {
  return (
    <>
      <SectionAnchor id="bilan" />
      <section>
        <SectionHeader step="Étape 3" label="Bilan" icon={ClipboardList} title="Bilan auditif — questionnaire patient" color="purple" />

        <Card className="space-y-8">
          <SubSection title="Qu'est-ce que le bilan auditif ?" icon={Eye} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Le bilan auditif est un questionnaire en <strong>7 étapes</strong> que vos patients remplissent avant leur rendez-vous ou directement en magasin. Il évalue leurs besoins auditifs, leurs habitudes, leur santé auditive et leurs préférences pour vous fournir un profil patient complet avant même la consultation.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-black text-purple-700 mb-2 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Avantages pour l&apos;audioprothésiste</p>
                <ul className="space-y-1.5">
                  <CheckItem>Consultation mieux préparée — gain de temps en magasin</CheckItem>
                  <CheckItem>Score de complexité pour anticiper les besoins</CheckItem>
                  <CheckItem>Recommandations de verres automatiques</CheckItem>
                  <CheckItem>Opportunités d&apos;upsell identifiées</CheckItem>
                  <CheckItem>Filtres de montures adaptés au profil</CheckItem>
                </ul>
              </div>
              <div>
                <p className="text-xs font-black text-purple-700 mb-2 flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Avantages pour le patient</p>
                <ul className="space-y-1.5">
                  <CheckItem>Questionnaire simple et guidé (5–8 minutes)</CheckItem>
                  <CheckItem>Remplissable depuis son téléphone ou en magasin</CheckItem>
                  <CheckItem>Pas de jargon technique — questions adaptées</CheckItem>
                  <CheckItem>Expérience moderne et professionnelle</CheckItem>
                </ul>
              </div>
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Les 7 étapes du questionnaire" icon={Layers} iconColor="text-purple-500">
            <div className="space-y-3">
              {[
                { step: "1. Vous", icon: "👤", desc: "Identité du patient : nom, prénom, date de naissance, coordonnées. Ces informations permettent de retrouver le bilan et de le rattacher au dossier patient." },
                { step: "2. Audition", icon: "👓", desc: "Corrections actuelles : port d'appareils auditifs, type de correction (contour, intra-auriculaire, RIC), ancienneté de l'équipement, satisfaction actuelle." },
                { step: "3. Gênes", icon: "⚠️", desc: "Plaintes auditives : fatigue auditive, acouphènes, hyperacousie, difficultés de compréhension, difficultés en environnement bruyant, acouphènes." },
                { step: "4. Usages", icon: "💻", desc: "Activités quotidiennes : temps d'écran, conduite, sport, lecture, travail de précision, loisirs en extérieur. Permet d'adapter le type de verres recommandé." },
                { step: "5. Santé", icon: "🏥", desc: "Antécédents de santé auditive : pathologies connues (glaucome, DMLA, cataracte), traitements en cours, diabète, hypertension, dernière visite ophtalmologique." },
                { step: "6. Style", icon: "✨", desc: "Préférences esthétiques : forme de monture souhaitée, matériaux préférés, couleurs, marques favorites, budget monture. Permet de filtrer le catalogue." },
                { step: "7. Budget", icon: "💰", desc: "Enveloppe budgétaire globale : fourchette de prix acceptable, couverture mutuelle connue, sensibilité au prix vs qualité, intérêt pour les options premium." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <span className="text-xl shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-xs font-black text-purple-800 mb-1">{s.step}</p>
                    <p className="text-xs text-purple-700 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Résultats et score de complexité" icon={BarChart2} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              À la fin du questionnaire, AudiBot calcule automatiquement un <strong>score de complexité de 1 à 5</strong> et génère des recommandations exploitables :
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              {[
                { output: "Score de complexité (1–5)", desc: "1 = correction simple standard, 5 = cas complexe (forte amétropie, multi-pathologie, prismes). Aide à anticiper la durée de consultation et le niveau d'expertise requis." },
                { output: "Recommandations de verres", desc: "Type de verre suggéré (unifocal, progressif, dégressif, mi-distance), traitements recommandés (anti-reflet, anti-lumière bleue, photochromique) basés sur les usages déclarés." },
                { output: "Opportunités d'upsell", desc: "Options premium pertinentes identifiées : deuxième paire solaire, lentilles de contact, verres anti-fatigue pour utilisateurs d'écrans intensifs, traitement hydrophobe pour sportifs." },
                { output: "Filtres montures", desc: "Présélection de montures adaptées au profil : forme de visage déclarée, style préféré, matériaux souhaités, fourchette de prix. Prêt à afficher dans votre catalogue." },
              ].map((o) => (
                <div key={o.output} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-black text-slate-800 mb-1">{o.output}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{o.desc}</p>
                </div>
              ))}
            </div>
            <TipBox>
              Le score de complexité est visible dès la liste des bilans dans le dashboard, avec un code couleur : <strong>vert</strong> (1–2), <strong>orange</strong> (3), <strong>rouge</strong> (4–5). Vous pouvez trier et filtrer vos rendez-vous par complexité.
            </TipBox>
          </SubSection>

          <Divider />

          <SubSection title="Créer et diffuser un bilan" icon={Share2} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Trois méthodes pour faire remplir un bilan à vos patients :
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <p className="text-xs font-black text-purple-800 mb-1">1. Depuis le dashboard</p>
                <p className="text-xs text-purple-700 leading-relaxed">Dashboard → <strong>Bilans</strong> → <strong>Nouveau bilan</strong>. Entrez le nom du patient et envoyez-lui le lien par email ou SMS. Le patient remplit le questionnaire sur son téléphone ou ordinateur.</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <p className="text-xs font-black text-purple-800 mb-1">2. QR code en magasin (mode tablette)</p>
                <p className="text-xs text-purple-700 leading-relaxed">Dashboard → <strong>Bilans</strong> → <strong>Mode magasin</strong>. Un QR code s&apos;affiche sur votre tablette ou écran de comptoir. Le patient scanne avec son téléphone et remplit le questionnaire sur place pendant l&apos;attente.</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <p className="text-xs font-black text-purple-800 mb-1">3. Partage de lien</p>
                <p className="text-xs text-purple-700 leading-relaxed">Dashboard → <strong>Bilans</strong> → <strong>Lien de partage</strong>. Copiez le lien unique de votre magasin et intégrez-le dans vos emails de confirmation de rendez-vous, votre site web ou vos réseaux sociaux.</p>
              </div>
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Configuration du bilan — personnalisation" icon={Palette} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Personnalisez l&apos;apparence du questionnaire pour correspondre à votre identité visuelle. Dashboard → <strong>Bilans</strong> → <strong>Configuration</strong> :
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { param: "Nom du magasin", desc: "Affiché en en-tête du questionnaire et dans les emails d'invitation envoyés aux patients." },
                { param: "Logo", desc: "Votre logo apparaît en haut du questionnaire. Formats acceptés : PNG, SVG, JPG. Taille recommandée : 200x80px." },
                { param: "Couleur d'accent", desc: "Couleur principale du questionnaire (boutons, barres de progression, liens). Sélecteur de couleur ou code hexadécimal." },
                { param: "Message d'accueil", desc: "Texte personnalisé affiché sur la première page du questionnaire. Exemple : « Bienvenue chez Optique Dupont, merci de prendre quelques minutes pour remplir ce questionnaire. »" },
              ].map((p) => (
                <div key={p.param} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-800 mb-0.5">{p.param}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <Divider />

          <SubSection title="Rapport et analytics" icon={PieChart} iconColor="text-purple-500">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Dashboard → <strong>Bilans</strong> → <strong>Rapport</strong>. Tableau de bord analytique avec KPIs et graphiques pour piloter votre activité :
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { kpi: "Bilans complétés", desc: "Nombre total de bilans terminés sur la période, taux de complétion (démarrés vs terminés)." },
                { kpi: "Score moyen", desc: "Complexité moyenne de vos patients. Tendance sur 30/60/90 jours pour suivre l'évolution de votre patientèle." },
                { kpi: "Temps moyen", desc: "Durée moyenne de remplissage du questionnaire. Indicateur de fluidité de l'expérience patient." },
                { kpi: "Démographie", desc: "Répartition par âge, type de correction, première visite vs renouvellement. Graphiques camembert et barres." },
                { kpi: "Top gênes déclarées", desc: "Classement des plaintes auditives les plus fréquentes chez vos patients. Aide à adapter votre offre." },
                { kpi: "Conversion upsell", desc: "Taux d'acceptation des options premium suggérées par le bilan. Mesure l'efficacité des recommandations." },
              ].map((k) => (
                <div key={k.kpi} className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-xs font-black text-purple-700 mb-1">{k.kpi}</p>
                  <p className="text-xs text-purple-600 leading-relaxed">{k.desc}</p>
                </div>
              ))}
            </div>
            <InfoBox>
              Les données du rapport sont anonymisées et agrégées. Aucune donnée de santé individuelle n&apos;est visible dans les analytics — uniquement des statistiques globales pour votre magasin.
            </InfoBox>
          </SubSection>
        </Card>
      </section>
    </>
  );
}
