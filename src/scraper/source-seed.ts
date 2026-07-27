import type { PortalEntry } from "./providers/index.js";

export interface JobSourceSeed {
  name: string;
  provider: string;
  careersUrl: string;
  region: string | null;
  enabled: boolean;
}

/**
 * Bootstrap registry used by `prisma db seed` and only as a runtime fallback
 * when the JobSource table cannot be reached.
 */
export const DEFAULT_JOB_SOURCE_SEEDS: readonly JobSourceSeed[] = [
  {
    name: "Xendit",
    provider: "greenhouse",
    careersUrl: "https://job-boards.greenhouse.io/xendit",
    region: "Indonesia",
    enabled: true,
  },
  {
    name: "GitLab",
    provider: "greenhouse",
    careersUrl: "https://job-boards.greenhouse.io/gitlab",
    region: "Global remote",
    enabled: true,
  },
  {
    name: "Figma",
    provider: "greenhouse",
    careersUrl: "https://job-boards.greenhouse.io/figma",
    region: "Global",
    enabled: true,
  },
  {
    name: "Dropbox",
    provider: "greenhouse",
    careersUrl: "https://job-boards.greenhouse.io/dropbox",
    region: "Global",
    enabled: true,
  },
  {
    name: "Contoh Ashby",
    provider: "ashby",
    careersUrl: "https://jobs.ashbyhq.com/example",
    region: null,
    enabled: false,
  },
  {
    name: "Contoh Lever",
    provider: "lever",
    careersUrl: "https://jobs.lever.co/example",
    region: null,
    enabled: false,
  },
];

export function fallbackPortals(): PortalEntry[] {
  return DEFAULT_JOB_SOURCE_SEEDS.filter((source) => source.enabled).map(
    (source) => ({
      name: source.name,
      provider: source.provider,
      careersUrl: source.careersUrl,
      region: source.region,
      enabled: source.enabled,
    }),
  );
}
