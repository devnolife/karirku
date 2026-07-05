/**
 * Engine autofill — orkestrasi tiga lapis mapping sesuai spec:
 *   1. Adapter portal (deterministik, confidence 1.0)
 *   2. Aturan generik lintas portal (deterministik)
 *   3. LLM fallback (field sisa + pertanyaan esai)
 *
 * Error handling: LLM gagal → field hasil lapisan deterministik tetap
 * dikembalikan; sisanya masuk `unmapped` (extension menandai merah).
 */

import { findAdapter } from "./adapters";
import { applyRules, GENERIC_RULES } from "./rules";
import { mapWithLlm, type LlmMapperOptions } from "./mapper";
import type { FormSnapshot, MapResult, ProfileData } from "./types";

export interface MapFormOptions {
  /** Matikan LLM fallback (mis. saat Ollama down atau untuk testing). */
  useLlm?: boolean;
  llm?: LlmMapperOptions;
}

export async function mapForm(
  snapshot: FormSnapshot,
  profile: ProfileData,
  opts: MapFormOptions = {},
): Promise<MapResult> {
  const adapter = findAdapter(snapshot.url);

  // Lapis 1: adapter portal
  const layer1 = adapter
    ? applyRules(snapshot.fields, adapter.rules, profile)
    : { mappings: [], remaining: snapshot.fields };

  // Lapis 2: aturan generik untuk sisa field
  const layer2 = applyRules(layer1.remaining, GENERIC_RULES, profile);

  const deterministic = [...layer1.mappings, ...layer2.mappings];

  // Lapis 3: LLM fallback
  const useLlm = opts.useLlm ?? true;
  const llmMappings = useLlm
    ? await mapWithLlm(layer2.remaining, profile, snapshot, opts.llm)
    : [];

  const mappedSelectors = new Set(
    [...deterministic, ...llmMappings].map((m) => m.selector),
  );
  const unmapped = snapshot.fields
    .filter((f) => f.type !== "file" && !mappedSelectors.has(f.selector))
    .map((f) => f.selector);

  const method: MapResult["method"] =
    deterministic.length && llmMappings.length
      ? "mixed"
      : deterministic.length
        ? "adapter"
        : llmMappings.length
          ? "llm"
          : "none";

  return {
    portal: adapter?.id ?? null,
    method,
    mappings: [...deterministic, ...llmMappings],
    unmapped,
  };
}
