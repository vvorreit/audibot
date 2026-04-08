import type { MutuelleData, OrdonnanceData } from '@/lib/parsers'
import type { BilanResult } from '@/types/bilan'

export async function generateDocumentPdf(data: {
  bilanId: string
  mutuelle?: MutuelleData | null
  ordonnance?: OrdonnanceData | null
  bilanResult?: BilanResult | null
  generatedAt?: Date
}): Promise<Uint8Array> {
  const date = data.generatedAt ?? new Date()
  const dateStr = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  const shortId = data.bilanId.slice(0, 12)

  const lines: string[] = []

  // Header
  lines.push('AUDIBOT — Compte-rendu bilan visuel')
  lines.push(`Date : ${dateStr}`)
  lines.push(`Bilan : ${shortId}`)
  lines.push('')

  // Mutuelle
  if (data.mutuelle) {
    const m = data.mutuelle
    lines.push('--- MUTUELLE ---')
    if (m.organisme) lines.push(`Organisme : ${m.organisme}`)
    if (m.numeroAdherent) lines.push(`N° adherent : ${m.numeroAdherent}`)
    if (m.dateDebutValidite || m.dateFinValidite) {
      lines.push(`Validite : ${m.dateDebutValidite || '?'} - ${m.dateFinValidite || '?'}`)
    }
    lines.push('')
  }

  // Ordonnance
  if (data.ordonnance) {
    const o = data.ordonnance
    lines.push('--- ORDONNANCE ---')

    const formatOeil = (label: string, oeil: { sphere: string; cylindre: string; axe: string; addition: string }) => {
      const parts: string[] = []
      if (oeil.sphere) parts.push(`Sph ${oeil.sphere}`)
      if (oeil.cylindre) parts.push(`Cyl ${oeil.cylindre}`)
      if (oeil.axe) parts.push(`Axe ${oeil.axe}`)
      if (oeil.addition) parts.push(`Add ${oeil.addition}`)
      if (parts.length > 0) lines.push(`${label} : ${parts.join('  ')}`)
    }

    formatOeil('OD', o.lunettesOD)
    formatOeil('OG', o.lunettesOG)
    if (o.nomOphtalmologue) lines.push(`Prescripteur : ${o.nomOphtalmologue}`)
    if (o.dateOrdonnance) lines.push(`Date ordo : ${o.dateOrdonnance}`)
    lines.push('')
  }

  // Bilan
  if (data.bilanResult) {
    const b = data.bilanResult
    lines.push('--- BILAN ---')
    if (b.profileText) lines.push(b.profileText)
    lines.push('')
    if (b.lensRecommendations && b.lensRecommendations.length > 0) {
      lines.push('Recommandations :')
      for (const rec of b.lensRecommendations) {
        lines.push(`  - ${rec.label} (${rec.priority}) : ${rec.reason}`)
      }
      lines.push('')
    }
  }

  // Footer
  lines.push('---')
  lines.push('Document confidentiel AudiBot — Donnees transmises de facon chiffree')

  return buildPdf(lines)
}

// Minimal PDF 1.4 builder — text only, A4
function buildPdf(lines: string[]): Uint8Array {
  const PAGE_W = 595.28 // A4 points
  const PAGE_H = 841.89
  const MARGIN = 50
  const LINE_H = 14
  const MAX_CHARS = 85
  const FONT_SIZE = 10

  // Word-wrap lines
  const wrapped: string[] = []
  for (const line of lines) {
    if (line.length <= MAX_CHARS) {
      wrapped.push(line)
    } else {
      let remaining = line
      while (remaining.length > MAX_CHARS) {
        let cut = remaining.lastIndexOf(' ', MAX_CHARS)
        if (cut <= 0) cut = MAX_CHARS
        wrapped.push(remaining.slice(0, cut))
        remaining = remaining.slice(cut).trimStart()
      }
      if (remaining) wrapped.push(remaining)
    }
  }

  // Split into pages
  const maxLinesPerPage = Math.floor((PAGE_H - 2 * MARGIN) / LINE_H)
  const pages: string[][] = []
  for (let i = 0; i < wrapped.length; i += maxLinesPerPage) {
    pages.push(wrapped.slice(i, i + maxLinesPerPage))
  }
  if (pages.length === 0) pages.push(['(vide)'])

  // PDF escape
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

  const objects: string[] = []
  const offsets: number[] = []

  // obj 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj')

  // obj 2: Pages (placeholder — we'll fill kids later)
  const pageObjStart = 3
  const kids = pages.map((_, i) => `${pageObjStart + i} 0 R`).join(' ')
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj`)

  // Font object
  const fontObjNum = pageObjStart + pages.length
  objects.push(`${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`)

  // Page + content stream pairs
  for (let p = 0; p < pages.length; p++) {
    const pageLines = pages[p]
    const contentObjNum = fontObjNum + 1 + p

    // Build text stream
    let stream = `BT\n/F1 ${FONT_SIZE} Tf\n`
    let y = PAGE_H - MARGIN
    for (const line of pageLines) {
      stream += `${MARGIN} ${y.toFixed(2)} Td\n(${esc(line)}) Tj\n`
      // Reset position for next line (absolute positioning)
      stream += `${-MARGIN} ${-y.toFixed(2)} Td\n`
      y -= LINE_H
    }
    stream += 'ET'
    const streamBytes = new TextEncoder().encode(stream)

    // Content stream object
    objects.push(`${contentObjNum} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream\nendobj`)

    // Page object
    const pageObjNum = pageObjStart + p
    objects.push(`${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> >>\nendobj`)
  }

  // Sort objects by obj number
  objects.sort((a, b) => {
    const numA = parseInt(a.split(' ')[0])
    const numB = parseInt(b.split(' ')[0])
    return numA - numB
  })

  // Build final PDF
  let pdf = '%PDF-1.4\n'
  for (const obj of objects) {
    offsets.push(pdf.length)
    pdf += obj + '\n'
  }

  const xrefOffset = pdf.length
  pdf += 'xref\n'
  pdf += `0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (const off of offsets) {
    pdf += off.toString().padStart(10, '0') + ' 00000 n \n'
  }
  pdf += 'trailer\n'
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdf += 'startxref\n'
  pdf += `${xrefOffset}\n`
  pdf += '%%EOF'

  return new TextEncoder().encode(pdf)
}
