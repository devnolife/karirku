/**
 * Kontrak tipe untuk fitur auto-fill form lamaran.
 * Spec: docs/superpowers/specs/2026-07-06-autofill-extension-design.md
 *
 * Alur: extension mengekstrak FormSnapshot → server memetakan via adapter
 * deterministik (confidence 1.0) lalu LLM fallback → extension mengisi
 * berdasarkan FieldMapping[]. Field tanpa mapping meyakinkan dibiarkan kosong.
 */

/** Satu field pada form, hasil ekstraksi content script. */
export interface FormFieldInfo {
  /** CSS selector unik yang dibuat extension — kunci pengisian. */
  selector: string;
  name?: string;
  id?: string;
  /** Teks label yang terasosiasi (label[for], aria-label, teks terdekat). */
  label?: string;
  /** text | email | tel | url | number | textarea | select | radio | checkbox | file | date */
  type: string;
  required?: boolean;
  /** Opsi untuk select/radio (teks yang terlihat user). */
  options?: string[];
  autocomplete?: string;
  placeholder?: string;
}

/** Snapshot form lamaran yang dikirim extension ke server. */
export interface FormSnapshot {
  /** URL halaman form. */
  url: string;
  /** Judul halaman (document.title). */
  pageTitle?: string;
  /** Judul lowongan bila terdeteksi. */
  jobTitle?: string;
  /** Nama perusahaan bila terdeteksi. */
  company?: string;
  fields: FormFieldInfo[];
}

/** Hasil mapping satu field. */
export interface FieldMapping {
  selector: string;
  value: string;
  /** 0..1 — adapter selalu 1.0; LLM sesuai keyakinannya. */
  confidence: number;
  source: "adapter" | "llm";
  /** true untuk jawaban esai yang dibuat AI — wajib highlight review. */
  aiGenerated?: boolean;
}

/** Hasil pemetaan keseluruhan form. */
export interface MapResult {
  /** id adapter yang match (greenhouse/lever/...), null bila tidak ada. */
  portal: string | null;
  method: "adapter" | "llm" | "mixed" | "none";
  mappings: FieldMapping[];
  /** selector field yang sengaja dibiarkan kosong (tidak menebak). */
  unmapped: string[];
}

/** Data profil user yang menjadi sumber nilai pengisian. */
export interface ProfileData {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  headline?: string;
  summary?: string;
  skills: string[];
  currentTitle?: string;
  currentCompany?: string;
  yearsExperience?: number;
  expectedSalaryIdr?: number;
  /** Json bebas dari Profile.experience / Profile.education. */
  experience?: unknown;
  education?: unknown;
}

/** Aturan mapping deterministik: pola teks field → nilai dari profil. */
export interface AdapterRule {
  /** Dicocokkan ke "name id label autocomplete placeholder" (lowercase). */
  match: RegExp;
  get: (p: ProfileData) => string | undefined;
}

/** Adapter per portal — deterministik, tanpa LLM. */
export interface AutofillAdapter {
  id: string;
  /** Dicocokkan ke URL halaman form. */
  matchUrl: RegExp;
  rules: AdapterRule[];
}
