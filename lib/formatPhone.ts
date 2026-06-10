/**
 * Formats a raw digit string as a Korean phone number.
 * 010-XXXX-XXXX (11 digits)  →  "010-1234-5678"
 * 02-XXXX-XXXX  (10 digits)  →  "02-1234-5678"
 * 0XX-XXX-XXXX  (10 digits)  →  "031-123-4567"
 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");

  // 010/011/016/017/018/019 — 11 digits: 3-4-4
  if (/^01[016789]/.test(d)) {
    const s = d.slice(0, 11);
    if (s.length <= 3) return s;
    if (s.length <= 7) return `${s.slice(0, 3)}-${s.slice(3)}`;
    return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`;
  }

  // 02 (Seoul) — 9–10 digits: 2-3/4-4
  if (/^02/.test(d)) {
    const s = d.slice(0, 10);
    if (s.length <= 2) return s;
    if (s.length <= 6) return `${s.slice(0, 2)}-${s.slice(2)}`;
    if (s.length === 9) return `${s.slice(0, 2)}-${s.slice(2, 5)}-${s.slice(5)}`;
    return `${s.slice(0, 2)}-${s.slice(2, 6)}-${s.slice(6)}`;
  }

  // Other area codes — 10 digits: 3-3-4
  const s = d.slice(0, 11);
  if (s.length <= 3) return s;
  if (s.length <= 6) return `${s.slice(0, 3)}-${s.slice(3)}`;
  if (s.length <= 10) return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6)}`;
  return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`;
}
