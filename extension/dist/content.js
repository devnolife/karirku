"use strict";
(() => {
  // extension/src/content.ts
  var ATTR = "data-kai-id";
  var APPLY_KEYWORDS = /apply|application|lamar|lamaran|submit.*(application|cv|resume)|kirim.*lamaran/i;
  var lastResult = null;
  var filledCount = 0;
  function sendBg(msg) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(msg, (res) => {
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
  function isVisible(el2) {
    const style = window.getComputedStyle(el2);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = el2.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
  function collectFillables() {
    const nodes = document.querySelectorAll("input, textarea, select");
    const out = [];
    for (const el2 of nodes) {
      if (el2 instanceof HTMLInputElement) {
        const skip = ["hidden", "submit", "button", "image", "reset", "password"];
        if (skip.includes(el2.type)) continue;
      }
      if (!isVisible(el2)) continue;
      out.push(el2);
    }
    return out;
  }
  function labelFor(el2) {
    if (el2.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el2.id)}"]`);
      if (lbl?.textContent?.trim()) return lbl.textContent.trim();
    }
    const wrapper = el2.closest("label");
    if (wrapper?.textContent?.trim()) return wrapper.textContent.trim();
    const aria = el2.getAttribute("aria-label");
    if (aria?.trim()) return aria.trim();
    const parent = el2.closest("div, fieldset, li");
    const candidate = parent?.querySelector("label, legend, span");
    if (candidate?.textContent?.trim()) return candidate.textContent.trim().slice(0, 200);
    return void 0;
  }
  function fieldType(el2) {
    if (el2 instanceof HTMLTextAreaElement) return "textarea";
    if (el2 instanceof HTMLSelectElement) return "select";
    return el2.type || "text";
  }
  function optionsFor(el2) {
    if (el2 instanceof HTMLSelectElement) {
      const opts = [...el2.options].map((o) => o.textContent?.trim() ?? "").filter((t) => t && !/^(pilih|select|choose|--)/i.test(t));
      return opts.length ? opts.slice(0, 100) : void 0;
    }
    if (el2 instanceof HTMLInputElement && el2.type === "radio" && el2.name) {
      const group = document.querySelectorAll(
        `input[type="radio"][name="${CSS.escape(el2.name)}"]`
      );
      const opts = [...group].map((r) => labelFor(r) ?? r.value).filter(Boolean);
      return opts.length ? opts : void 0;
    }
    return void 0;
  }
  function extractFields() {
    const fillables = collectFillables();
    const fields = [];
    const elements = /* @__PURE__ */ new Map();
    const seenRadioGroups = /* @__PURE__ */ new Set();
    fillables.forEach((el2, i) => {
      if (el2 instanceof HTMLInputElement && el2.type === "radio") {
        const key = el2.name || `radio-${i}`;
        if (seenRadioGroups.has(key)) return;
        seenRadioGroups.add(key);
      }
      const id = String(i);
      el2.setAttribute(ATTR, id);
      const selector = `[${ATTR}="${id}"]`;
      elements.set(selector, el2);
      fields.push({
        selector,
        name: el2.getAttribute("name") ?? void 0,
        id: el2.id || void 0,
        label: labelFor(el2),
        type: fieldType(el2),
        required: el2.hasAttribute("required") || el2.getAttribute("aria-required") === "true",
        options: optionsFor(el2),
        autocomplete: el2.getAttribute("autocomplete") ?? void 0,
        placeholder: el2.getAttribute("placeholder") ?? void 0
      });
    });
    return { fields, elements };
  }
  function looksLikeApplicationForm(fields) {
    if (fields.length < 3) return false;
    const hasEmail = fields.some(
      (f) => f.type === "email" || /e-?mail/i.test(`${f.name} ${f.label} ${f.autocomplete}`)
    );
    const hasFileOrKeyword = fields.some((f) => f.type === "file") || APPLY_KEYWORDS.test(document.title) || APPLY_KEYWORDS.test(document.body.innerText.slice(0, 4e3));
    return hasEmail && hasFileOrKeyword;
  }
  function setNativeValue(el2, value) {
    const proto = el2 instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el2 instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    desc?.set?.call(el2, value);
    el2.dispatchEvent(new Event("input", { bubbles: true }));
    el2.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function fillSelect(el2, value) {
    const target = value.toLowerCase().trim();
    const opt = [...el2.options].find(
      (o) => (o.textContent?.toLowerCase().trim() ?? "") === target || o.value.toLowerCase().trim() === target
    );
    if (!opt) return false;
    setNativeValue(el2, opt.value);
    return true;
  }
  function fillRadio(el2, value) {
    if (!el2.name) return false;
    const group = document.querySelectorAll(
      `input[type="radio"][name="${CSS.escape(el2.name)}"]`
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
  var STYLE_OK = "2px solid #10b981";
  var STYLE_REVIEW = "2px solid #f59e0b";
  var STYLE_EMPTY = "2px dashed #ef4444";
  function applyMappings(result, elements) {
    let filled = 0;
    for (const m of result.mappings) {
      const el2 = elements.get(m.selector) ?? document.querySelector(m.selector);
      if (!el2) continue;
      let ok = false;
      if (el2 instanceof HTMLSelectElement) ok = fillSelect(el2, m.value);
      else if (el2 instanceof HTMLInputElement && el2.type === "radio") ok = fillRadio(el2, m.value);
      else if (el2 instanceof HTMLInputElement && el2.type === "checkbox") continue;
      else {
        setNativeValue(el2, m.value);
        ok = true;
      }
      if (!ok) continue;
      filled++;
      const needsReview = m.source === "llm" || m.aiGenerated || m.confidence < 0.8;
      el2.style.outline = needsReview ? STYLE_REVIEW : STYLE_OK;
      el2.style.outlineOffset = "1px";
      if (m.aiGenerated) el2.title = "\u2728 Jawaban dibuat AI \u2014 mohon review sebelum submit";
    }
    for (const selector of result.unmapped) {
      const el2 = elements.get(selector) ?? document.querySelector(selector);
      if (el2) {
        el2.style.outline = STYLE_EMPTY;
        el2.style.outlineOffset = "1px";
        el2.title = "Karirku tidak yakin \u2014 isi manual";
      }
    }
    return filled;
  }
  function el(tag, css, text) {
    const node = document.createElement(tag);
    Object.assign(node.style, css);
    if (text) node.textContent = text;
    return node;
  }
  var BTN_ID = "kai-autofill-btn";
  var PANEL_ID = "kai-autofill-panel";
  function removeOverlay() {
    document.getElementById(BTN_ID)?.remove();
    document.getElementById(PANEL_ID)?.remove();
  }
  function showPanel(lines, tone = "info") {
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
      font: "13px/1.5 system-ui, sans-serif"
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
        font: "12px system-ui, sans-serif"
      },
      "Tutup"
    );
    close.addEventListener("click", () => panel.remove());
    panel.appendChild(close);
    document.body.appendChild(panel);
  }
  async function runAutofill() {
    const btn = document.getElementById(BTN_ID);
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Mengisi\u2026";
    }
    const { fields, elements } = extractFields();
    const snapshot = {
      url: location.href,
      pageTitle: document.title,
      fields
    };
    const res = await sendBg({ kind: "MAP_FORM", snapshot });
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
    const aiCount = res.data.mappings.filter((m) => m.aiGenerated).length;
    showPanel([
      `\u2705 ${filledCount} dari ${fields.length} field terisi.`,
      aiCount ? `\u2728 ${aiCount} jawaban dibuat AI (kuning) \u2014 mohon review.` : "",
      res.data.unmapped.length ? `\u2B1C ${res.data.unmapped.length} field dibiarkan kosong (merah) \u2014 isi manual.` : "",
      "Periksa semua isian, lalu submit sendiri."
    ].filter(Boolean));
    void sendBg({
      kind: "REPORT",
      payload: {
        url: location.href,
        status: "filled",
        portal: res.data.portal,
        method: res.data.method,
        fieldsTotal: fields.length,
        fieldsFilled: filledCount
      }
    });
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Isi ulang";
    }
  }
  function mountButton() {
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
        boxShadow: "0 6px 18px rgba(79,70,229,.4)"
      },
      "Isi dengan Karirku"
    );
    btn.id = BTN_ID;
    btn.addEventListener("click", () => void runAutofill());
    document.body.appendChild(btn);
  }
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
          fieldsFilled: filledCount
        }
      });
    },
    { capture: true }
  );
  async function init() {
    const status = await sendBg({ kind: "GET_STATUS" });
    if (!status.ok || !status.data.enabled) return;
    const check = () => {
      const { fields } = extractFields();
      if (looksLikeApplicationForm(fields)) mountButton();
      else removeOverlay();
    };
    check();
    let timer;
    new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(check, 800);
    }).observe(document.body, { childList: true, subtree: true });
  }
  void init();
})();
