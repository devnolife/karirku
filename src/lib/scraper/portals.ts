/**
 * Compatibility entrypoint for deterministic first-run data. Runtime scans
 * load JobSource rows through `loadEnabledPortalRegistry()` instead.
 */
export { DEFAULT_JOB_SOURCE_SEEDS, fallbackPortals } from "./source-seed";
