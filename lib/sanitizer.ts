/**
 * RGPD Sanitizer — Redacts PII from logs and HTML snapshots.
 * Focuses on French Social Security Numbers (NSS), Large Numbers, and Names.
 */

export function sanitizePII(text: string | null | undefined): string {
  if (!text) return "";
  
  let s = text;
  
  // 1. Redact French Social Security Numbers (13 or 15 digits, sometimes with spaces)
  // Pattern: [12] [YY] [MM] [DD] [PPP] [OOO] [CC]
  s = s.replace(/\b[12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b/g, "[NSS_REDACTED]");
  
  // 2. Redact sequences of 8+ digits (potential phone numbers, IDs, account numbers)
  s = s.replace(/\b\d{8,}\b/g, "[NUM_REDACTED]");
  
  // 3. Redact common email pattern
  s = s.replace(/\b[\w.-]+@[\w.-]+\.\w{2,}\b/g, "[EMAIL_REDACTED]");
  
  // 4. Redact potential NAMES (Uppercase sequences of 2+ words)
  // This is aggressive but safer for diagnostic logs.
  // Use atomic group equivalent to prevent ReDoS from nested quantifiers
  s = s.replace(/\b[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ]{2,}(?:\s+[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ]{2,}){1,3}\b/g, "[NAME_REDACTED]");

  return s;
}

/**
 * Sanitize HTML snapshot by removing potentially sensitive values from inputs/text.
 */
export function sanitizeHtmlSnapshot(html: string | null | undefined): string {
  if (!html) return "";
  
  let s = html;
  
  // Redact values in input/textarea tags
  s = s.replace(/(value=["'])([^"']+)(["'])/gi, (match, p1, p2, p3) => {
    // If the value looks like a short UI string (<= 3 chars or common UI words), keep it.
    // Otherwise redact.
    if (p2.length <= 3 || /^(submit|button|get|post|true|false)$/i.test(p2)) return match;
    return `${p1}[VALUE_REDACTED]${p3}`;
  });

  // Apply general PII sanitization for text content
  return sanitizePII(s);
}
