/**
 * Daftar portal default untuk scanner.
 *
 * Tiap entry cukup punya `careersUrl` — provider yang cocok (Greenhouse/Ashby/
 * Lever) dideteksi otomatis dari pola URL. Set `provider` + `api` kalau mau
 * eksplisit. Entry contoh di bawah sengaja `enabled: false`; ganti slug dengan
 * perusahaan target lalu set `enabled: true`.
 *
 * Pola URL yang dikenali:
 *   - Greenhouse: https://job-boards.greenhouse.io/<slug>
 *   - Ashby:      https://jobs.ashbyhq.com/<slug>
 *   - Lever:      https://jobs.lever.co/<slug>
 */

import type { PortalEntry } from "./providers";

export const DEFAULT_PORTALS: PortalEntry[] = [
  {
    name: "GitLab",
    careersUrl: "https://job-boards.greenhouse.io/gitlab",
    enabled: true,
  },
  {
    name: "Figma",
    careersUrl: "https://job-boards.greenhouse.io/figma",
    enabled: true,
  },
  {
    name: "Dropbox",
    careersUrl: "https://job-boards.greenhouse.io/dropbox",
    enabled: true,
  },
  {
    name: "Contoh Ashby",
    careersUrl: "https://jobs.ashbyhq.com/example",
    enabled: false,
  },
  {
    name: "Contoh Lever",
    careersUrl: "https://jobs.lever.co/example",
    enabled: false,
  },
];
