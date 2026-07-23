/**
 * Tipe pesan antara content script ↔ background service worker,
 * plus tipe API yang mirror dari src/lib/autofill/types.ts
 * (disalin agar extension bisa dibundel mandiri tanpa path alias app).
 */

export interface FormFieldInfo {
  selector: string;
  name?: string;
  id?: string;
  label?: string;
  type: string;
  required?: boolean;
  options?: string[];
  autocomplete?: string;
  placeholder?: string;
}

export interface FormSnapshot {
  url: string;
  pageTitle?: string;
  jobTitle?: string;
  company?: string;
  fields: FormFieldInfo[];
}

export interface FieldMapping {
  selector: string;
  value: string;
  confidence: number;
  source: "adapter" | "llm" | "saved";
  aiGenerated?: boolean;
}

export interface MapResult {
  portal: string | null;
  method: "adapter" | "llm" | "mixed" | "none";
  mappings: FieldMapping[];
  unmapped: string[];
}

export interface ReportPayload {
  url: string;
  status: "filled" | "submitted" | "error";
  portal?: string | null;
  method?: MapResult["method"];
  fieldsTotal: number;
  fieldsFilled: number;
}

// ---- pesan runtime ----

export type BgRequest =
  | { kind: "CONNECT" }
  | { kind: "DISCONNECT" }
  | { kind: "GET_STATUS" }
  | { kind: "MAP_FORM"; snapshot: FormSnapshot }
  | { kind: "REPORT"; payload: ReportPayload }
  | { kind: "GET_RESUME_FILE" }
  | { kind: "SAVE_ANSWERS"; answers: { question: string; answer: string }[] };

/** File CV yang dikirim background → content script (base64 agar serializable). */
export interface ResumeFilePayload {
  fileName: string;
  mimeType: string;
  /** Isi file, base64 (tanpa prefix data URL). */
  base64: string;
}

export type BgResponse<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const STORAGE_KEYS = {
  token: "kai_token",
  apiBase: "kai_api_base",
  enabled: "kai_enabled",
  user: "kai_user",
} as const;

export const DEFAULT_API_BASE = "http://localhost:3030";
