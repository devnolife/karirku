/**
 * Content script — deteksi form lamaran, ekstraksi struktur, pengisian,
 * dan overlay review. Tidak pernah men-submit form; submit selalu oleh user.
 */

import type {
  BgRequest,
  BgResponse,
  FieldMapping,
  FormFieldInfo,
  FormSnapshot,
  MapResult,
  ResumeFilePayload,
} from "./shared";

const ATTR = "data-kai-id";
const APPLY_KEYWORDS =
  /apply|application|lamar|lamaran|submit.*(application|cv|resume)|kirim.*lamaran/i;

let lastResult: MapResult | null = null;
let filledCount = 0;

// ---------- utilitas messaging ----------

function sendBg<T>(msg: BgRequest): Promise<BgResponse<T>> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(msg, (res: BgResponse<T>) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false, error: chrome.runtime.lastError.message ?? "runtime error" });
        } else {
          resolve(res ?? { ok: false, error: "Tidak ada respons dari background" });
        }
      });
    } catch (err) {
      resolve({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  });
}

// ---------- deteksi & ekstraksi form ----------

type Fillable = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function collectFillables(): Fillable[] {
  const nodes = document.querySelectorAll<Fillable>("input, textarea, select");
  const out: Fillable[] = [];
  for (const el of nodes) {
    if (el instanceof HTMLInputElement) {
      const skip = ["hidden", "submit", "button", "image", "reset", "password"];
      if (skip.includes(el.type)) continue;
    }
    if (!isVisible(el)) continue;
    out.push(el);
  }
  return out;
}

function labelFor(el: Fillable): string | undefined {
  if (el.id) {
    const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (lbl?.textContent?.trim()) return lbl.textContent.trim();
  }
  const wrapper = el.closest("label");
  if (wrapper?.textContent?.trim()) return wrapper.textContent.trim();
  const aria = el.getAttribute("aria-label");
  if (aria?.trim()) return aria.trim();
  // label visual terdekat di parent (pola umum form React)
  const parent = el.closest("div, fieldset, li");
  const candidate = parent?.querySelector("label, legend, span");
  if (candidate?.textContent?.trim()) return candidate.textContent.trim().slice(0, 200);
  return undefined;
}

function fieldType(el: Fillable): string {
  if (el instanceof HTMLTextAreaElement) return "textarea";
  if (el instanceof HTMLSelectElement) return "select";
  return el.type || "text";
}

function optionsFor(el: Fillable): string[] | undefined {
  if (el instanceof HTMLSelectElement) {
    const opts = [...el.options]
      .map((o) => o.textContent?.trim() ?? "")
      .filter((t) => t && !/^(pilih|select|choose|--)/i.test(t));
    return opts.length ? opts.slice(0, 100) : undefined;
  }
  if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
    const group = document.querySelectorAll<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(el.name)}"]`,
    );
    const opts = [...group]
      .map((r) => labelFor(r) ?? r.value)
      .filter(Boolean);
    return opts.length ? opts : undefined;
  }
  return undefined;
}

/** Tandai elemen dengan atribut unik dan buat FormFieldInfo. */
function extractFields(): { fields: FormFieldInfo[]; elements: Map<string, Fillable> } {
  const fillables = collectFillables();
  const fields: FormFieldInfo[] = [];
  const elements = new Map<string, Fillable>();
  const seenRadioGroups = new Set<string>();

  fillables.forEach((el, i) => {
    // radio: satu field per group
    if (el instanceof HTMLInputElement && el.type === "radio") {
      const key = el.name || `radio-${i}`;
      if (seenRadioGroups.has(key)) return;
      seenRadioGroups.add(key);
    }
    const id = String(i);
    el.setAttribute(ATTR, id);
    const selector = `[${ATTR}="${id}"]`;
    elements.set(selector, el);
    fields.push({
      selector,
      name: el.getAttribute("name") ?? undefined,
      id: el.id || undefined,
      label: labelFor(el),
      type: fieldType(el),
      required: el.hasAttribute("required") || el.getAttribute("aria-required") === "true",
      options: optionsFor(el),
      autocomplete: el.getAttribute("autocomplete") ?? undefined,
      placeholder: el.getAttribute("placeholder") ?? undefined,
    });
  });

  return { fields, elements };
}

/** Heuristik: apakah halaman ini form lamaran kerja? */
function looksLikeApplicationForm(fields: FormFieldInfo[]): boolean {
  if (fields.length < 3) return false;
  const hasEmail = fields.some(
    (f) => f.type === "email" || /e-?mail/i.test(`${f.name} ${f.label} ${f.autocomplete}`),
  );
  const hasFileOrKeyword =
    fields.some((f) => f.type === "file") ||
    APPLY_KEYWORDS.test(document.title) ||
    APPLY_KEYWORDS.test(document.body.innerText.slice(0, 4000));
  return hasEmail && hasFileOrKeyword;
}

// ---------- pengisian ----------

/** Set nilai + dispatch event agar form React/Vue mendeteksi perubahan. */
function setNativeValue(el: Fillable, value: string): void {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  desc?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function fillSelect(el: HTMLSelectElement, value: string): boolean {
  const target = value.toLowerCase().trim();
  const opt = [...el.options].find(
    (o) =>
      (o.textContent?.toLowerCase().trim() ?? "") === target ||
      o.value.toLowerCase().trim() === target,
  );
  if (!opt) return false;
  setNativeValue(el, opt.value);
  return true;
}

function fillRadio(el: HTMLInputElement, value: string): boolean {
  if (!el.name) return false;
  const group = document.querySelectorAll<HTMLInputElement>(
    `input[type="radio"][name="${CSS.escape(el.name)}"]`,
  );
  const target = value.toLowerCase().trim();
  for (const radio of group) {
    const lbl = (labelFor(radio) ?? radio.value).toLowerCase().trim();
    if (lbl === target || lbl.includes(target)) {
      radio.click();
      return true;
    }
  }
  return false;
}

const STYLE_OK = "2px solid #10b981"; // hijau: adapter, yakin
const STYLE_REVIEW = "2px solid #f59e0b"; // kuning: LLM / perlu review
const STYLE_EMPTY = "2px dashed #ef4444"; // merah: sengaja kosong

function applyMappings(
  result: MapResult,
  elements: Map<string, Fillable>,
): number {
  let filled = 0;
  for (const m of result.mappings) {
    const el = elements.get(m.selector) ?? document.querySelector<Fillable>(m.selector);
    if (!el) continue;

    let ok = false;
    if (el instanceof HTMLSelectElement) ok = fillSelect(el, m.value);
    else if (el instanceof HTMLInputElement && el.type === "radio") ok = fillRadio(el, m.value);
    else if (el instanceof HTMLInputElement && el.type === "checkbox") continue; // tidak menebak persetujuan
    else {
      setNativeValue(el, m.value);
      ok = true;
    }
    if (!ok) continue;

    filled++;
    const needsReview = m.source === "llm" || m.aiGenerated || m.confidence < 0.8;
    el.style.outline = needsReview ? STYLE_REVIEW : STYLE_OK;
    el.style.outlineOffset = "1px";
    if (m.aiGenerated) el.title = "✨ Jawaban dibuat AI — mohon review sebelum submit";
  }
  for (const selector of result.unmapped) {
    const el = elements.get(selector) ?? document.querySelector<Fillable>(selector);
    if (el) {
      el.style.outline = STYLE_EMPTY;
      el.style.outlineOffset = "1px";
      el.title = "Karirku tidak yakin — isi manual";
    }
  }
  return filled;
}

// ---------- injeksi file CV ----------

/** Isi input[type=file] dengan CV dari server via DataTransfer. */
async function attachResume(elements: Map<string, Fillable>): Promise<number> {
  const fileInputs: HTMLInputElement[] = [];
  for (const el of elements.values()) {
    if (el instanceof HTMLInputElement && el.type === "file") {
      const hay = `${el.name} ${el.id} ${el.accept} ${labelFor(el) ?? ""}`.toLowerCase();
      // hanya field yang jelas untuk CV/resume; cover letter file dilewati
      if (/resume|cv|curriculum/.test(hay) || fileInputs.length === 0) fileInputs.push(el);
    }
  }
  if (fileInputs.length === 0) return 0;

  const res = await sendBg<ResumeFilePayload>({ kind: "GET_RESUME_FILE" });
  if (!res.ok) return 0;

  const { fileName, mimeType, base64 } = res.data;
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const file = new File([bytes], fileName, { type: mimeType });

  let attached = 0;
  for (const input of fileInputs) {
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.style.outline = STYLE_OK;
      input.style.outlineOffset = "1px";
      input.title = `CV terpasang: ${fileName} — cek sebelum submit`;
      attached++;
    } catch {
      // input file bisa menolak set programatik di beberapa portal — biarkan manual
    }
  }
  return attached;
}

// ---------- overlay UI ----------

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  css: Partial<CSSStyleDeclaration>,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node.style, css);
  if (text) node.textContent = text;
  return node;
}

const BTN_ID = "kai-autofill-btn";
const PANEL_ID = "kai-autofill-panel";

function removeOverlay(): void {
  document.getElementById(BTN_ID)?.remove();
  document.getElementById(PANEL_ID)?.remove();
}

function showPanel(lines: string[], tone: "info" | "error" = "info"): void {
  document.getElementById(PANEL_ID)?.remove();
  const panel = el("div", {
    position: "fixed",
    bottom: "76px",
    right: "20px",
    zIndex: "2147483647",
    background: "#ffffff",
    color: "#111827",
    border: `1px solid ${tone === "error" ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,.16)",
    padding: "12px 16px",
    maxWidth: "320px",
    font: "13px/1.5 system-ui, sans-serif",
  });
  panel.id = PANEL_ID;
  for (const line of lines) panel.appendChild(el("div", { margin: "2px 0" }, line));
  const close = el(
    "button",
    {
      marginTop: "8px",
      border: "none",
      background: "#f3f4f6",
      borderRadius: "8px",
      padding: "4px 10px",
      cursor: "pointer",
      font: "12px system-ui, sans-serif",
    },
    "Tutup",
  );
  close.addEventListener("click", () => panel.remove());
  panel.appendChild(close);
  document.body.appendChild(panel);
}

const SOURCE_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  adapter: { label: "profil", bg: "#d1fae5", fg: "#065f46" },
  saved: { label: "tersimpan", bg: "#e0e7ff", fg: "#3730a3" },
  llm: { label: "AI", bg: "#fef3c7", fg: "#92400e" },
};

/**
 * Panel review per-field: nilai yang diisi, badge sumber, edit inline,
 * dan simpan jawaban ke answer bank. Submit tetap 100% oleh user.
 */
function showReviewPanel(
  result: MapResult,
  elements: Map<string, Fillable>,
  fields: FormFieldInfo[],
  extra: string[],
): void {
  document.getElementById(PANEL_ID)?.remove();
  const byselector = new Map(fields.map((f) => [f.selector, f]));

  const panel = el("div", {
    position: "fixed",
    bottom: "76px",
    right: "20px",
    zIndex: "2147483647",
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,.16)",
    padding: "12px 14px",
    width: "340px",
    maxHeight: "60vh",
    overflowY: "auto",
    font: "13px/1.5 system-ui, sans-serif",
  });
  panel.id = PANEL_ID;

  panel.appendChild(
    el("div", { fontWeight: "700", marginBottom: "6px" }, `Review isian (${result.mappings.length} field)`),
  );
  for (const line of extra) panel.appendChild(el("div", { margin: "2px 0", color: "#4b5563", fontSize: "12px" }, line));

  for (const m of result.mappings) {
    const field = byselector.get(m.selector);
    const target = elements.get(m.selector) ?? document.querySelector<Fillable>(m.selector);
    const row = el("div", {
      borderTop: "1px solid #f3f4f6",
      padding: "8px 0 6px",
    });

    const head = el("div", { display: "flex", alignItems: "center", gap: "6px" });
    const badge = SOURCE_BADGE[m.source] ?? SOURCE_BADGE.llm;
    const badgeEl = el(
      "span",
      {
        background: badge.bg,
        color: badge.fg,
        borderRadius: "6px",
        padding: "1px 6px",
        fontSize: "10px",
        fontWeight: "700",
        flexShrink: "0",
      },
      m.aiGenerated ? "✨ AI" : badge.label,
    );
    const labelEl = el(
      "span",
      { fontSize: "11px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
      field?.label || field?.name || m.selector,
    );
    labelEl.title = field?.label ?? "";
    head.appendChild(badgeEl);
    head.appendChild(labelEl);
    row.appendChild(head);

    const isLong = m.value.length > 60 || field?.type === "textarea";
    const input = document.createElement(isLong ? "textarea" : "input") as
      | HTMLInputElement
      | HTMLTextAreaElement;
    input.value = m.value;
    Object.assign(input.style, {
      width: "100%",
      marginTop: "4px",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      padding: "4px 6px",
      font: "12px system-ui, sans-serif",
      background: "#fafafa",
    } satisfies Partial<CSSStyleDeclaration>);
    if (isLong) (input as HTMLTextAreaElement).rows = 3;
    // Edit inline → langsung diterapkan ke field form.
    input.addEventListener("input", () => {
      if (!target) return;
      if (target instanceof HTMLSelectElement) return; // select diubah di form langsung
      setNativeValue(target, input.value);
    });
    row.appendChild(input);

    // Simpan jawaban pertanyaan (label panjang = kemungkinan screening question).
    const label = field?.label ?? "";
    if (label.trim().length >= 12) {
      const saveBtn = el(
        "button",
        {
          marginTop: "4px",
          border: "none",
          background: "#eef2ff",
          color: "#3730a3",
          borderRadius: "6px",
          padding: "2px 8px",
          cursor: "pointer",
          font: "11px system-ui, sans-serif",
        },
        "💾 Simpan jawaban",
      );
      saveBtn.addEventListener("click", () => {
        void sendBg({ kind: "SAVE_ANSWERS", answers: [{ question: label.trim(), answer: input.value }] }).then(
          (r) => {
            saveBtn.textContent = r.ok ? "✓ Tersimpan" : "Gagal menyimpan";
          },
        );
      });
      row.appendChild(saveBtn);
    }

    panel.appendChild(row);
  }

  if (result.unmapped.length) {
    panel.appendChild(
      el(
        "div",
        { borderTop: "1px solid #f3f4f6", padding: "8px 0 2px", color: "#b91c1c", fontSize: "12px" },
        `⬜ ${result.unmapped.length} field kosong (merah) — isi manual.`,
      ),
    );
  }

  panel.appendChild(
    el("div", { marginTop: "8px", fontSize: "12px", color: "#4b5563" }, "Periksa semua isian, lalu submit sendiri."),
  );

  const close = el(
    "button",
    {
      marginTop: "8px",
      border: "none",
      background: "#f3f4f6",
      borderRadius: "8px",
      padding: "4px 10px",
      cursor: "pointer",
      font: "12px system-ui, sans-serif",
    },
    "Tutup",
  );
  close.addEventListener("click", () => panel.remove());
  panel.appendChild(close);
  document.body.appendChild(panel);
}

async function runAutofill(): Promise<void> {
  const btn = document.getElementById(BTN_ID) as HTMLButtonElement | null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Mengisi…";
  }

  const { fields, elements } = extractFields();
  const snapshot: FormSnapshot = {
    url: location.href,
    pageTitle: document.title,
    fields,
  };

  const res = await sendBg<MapResult>({ kind: "MAP_FORM", snapshot });
  if (!res.ok) {
    showPanel(["Gagal memetakan form:", res.error], "error");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Isi dengan Karirku";
    }
    return;
  }

  lastResult = res.data;
  filledCount = applyMappings(res.data, elements);
  const cvAttached = await attachResume(elements);

  const aiCount = res.data.mappings.filter((m) => m.aiGenerated).length;
  const savedCount = res.data.mappings.filter((m) => m.source === "saved").length;
  showReviewPanel(res.data, elements, fields, [
    `✅ ${filledCount} dari ${fields.length} field terisi.`,
    cvAttached ? `📎 CV terpasang otomatis — cek field upload.` : "",
    savedCount ? `💾 ${savedCount} dari jawaban tersimpanmu.` : "",
    aiCount ? `✨ ${aiCount} jawaban dibuat AI (kuning) — mohon review.` : "",
  ].filter(Boolean));

  void sendBg({
    kind: "REPORT",
    payload: {
      url: location.href,
      status: "filled",
      portal: res.data.portal,
      method: res.data.method,
      fieldsTotal: fields.length,
      fieldsFilled: filledCount,
    },
  });

  if (btn) {
    btn.disabled = false;
    btn.textContent = "Isi ulang";
  }
}

function mountButton(): void {
  if (document.getElementById(BTN_ID)) return;
  const btn = el(
    "button",
    {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "2147483647",
      background: "#4f46e5",
      color: "#ffffff",
      border: "none",
      borderRadius: "9999px",
      padding: "12px 20px",
      font: "600 14px system-ui, sans-serif",
      cursor: "pointer",
      boxShadow: "0 6px 18px rgba(79,70,229,.4)",
    },
    "Isi dengan Karirku",
  );
  btn.id = BTN_ID;
  btn.addEventListener("click", () => void runAutofill());
  document.body.appendChild(btn);
}

// laporkan submit oleh user (capture di document — sebelum halaman pindah)
document.addEventListener(
  "submit",
  () => {
    if (!lastResult) return;
    void sendBg({
      kind: "REPORT",
      payload: {
        url: location.href,
        status: "submitted",
        portal: lastResult.portal,
        method: lastResult.method,
        fieldsTotal: lastResult.mappings.length + lastResult.unmapped.length,
        fieldsFilled: filledCount,
      },
    });
  },
  { capture: true },
);

// ---------- bootstrap ----------

async function init(): Promise<void> {
  const status = await sendBg<{ connected: boolean; enabled: boolean }>({ kind: "GET_STATUS" });
  if (!status.ok || !status.data.enabled) return;

  const check = (): void => {
    const { fields } = extractFields();
    if (looksLikeApplicationForm(fields)) mountButton();
    else removeOverlay();
  };

  check();
  // form SPA sering muncul belakangan — pantau perubahan DOM (debounced)
  let timer: number | undefined;
  new MutationObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(check, 800);
  }).observe(document.body, { childList: true, subtree: true });
}

void init();
