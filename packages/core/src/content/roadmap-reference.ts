/**
 * Pemetaan target role → roadmap referensi di roadmap.sh.
 *
 * Lisensi roadmap.sh HANYA membolehkan share LINK ke situsnya (bukan
 * menyalin konten/gambar) — jadi kita tautkan sebagai referensi eksternal.
 */

const ROLE_TO_SLUG: Array<{ pattern: RegExp; slug: string }> = [
  { pattern: /full[\s-]?stack/i, slug: "full-stack" },
  { pattern: /front[\s-]?end|react/i, slug: "frontend" },
  { pattern: /back[\s-]?end|node/i, slug: "backend" },
  { pattern: /devops|sre|platform/i, slug: "devops" },
  { pattern: /android/i, slug: "android" },
  { pattern: /ios/i, slug: "ios" },
  { pattern: /flutter/i, slug: "flutter" },
  { pattern: /react\s*native|mobile/i, slug: "react-native" },
  { pattern: /data\s*analyst/i, slug: "data-analyst" },
  { pattern: /data\s*(engineer|engineering)/i, slug: "data-engineer" },
  { pattern: /machine\s*learning|ml\s*engineer/i, slug: "machine-learning" },
  { pattern: /\bai\b|artificial intelligence/i, slug: "ai-engineer" },
  { pattern: /data\s*scien/i, slug: "ai-data-scientist" },
  { pattern: /ui\/?ux|product\s*design/i, slug: "ux-design" },
  { pattern: /qa|quality|tester/i, slug: "qa" },
  { pattern: /cyber|security/i, slug: "cyber-security" },
  { pattern: /product\s*manager/i, slug: "product-manager" },
  { pattern: /blockchain|web3/i, slug: "blockchain" },
  { pattern: /game/i, slug: "game-developer" },
  { pattern: /python/i, slug: "python" },
  { pattern: /java\b/i, slug: "java" },
  { pattern: /golang|\bgo\b/i, slug: "golang" },
  // Fallback role umum — paling dekat dengan jalur full-stack.
  { pattern: /software\s*(developer|engineer)|web\s*developer|programmer/i, slug: "full-stack" },
];

/** URL roadmap.sh yang paling relevan untuk target role user (null bila tak ada). */
export function roadmapShUrl(targetRole: string): string | null {
  const match = ROLE_TO_SLUG.find((r) => r.pattern.test(targetRole));
  return match ? `https://roadmap.sh/${match.slug}` : null;
}
