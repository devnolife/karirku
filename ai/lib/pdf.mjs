#!/usr/bin/env node
/**
 * ai/lib/pdf.mjs — render HTML → PDF A4 via Chrome headless (playwright-core).
 * Pola sesuai aturan ATS di AGENTS.md.
 */

import path from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export async function htmlToPdf(htmlPath, pdfPath) {
  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ executablePath: findChrome() });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.resolve(htmlPath)).href, { waitUntil: 'networkidle' });
    await page.pdf({ path: path.resolve(pdfPath), format: 'A4', printBackground: true });
  } finally {
    await browser.close();
  }
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  ].filter(Boolean);
  for (const p of candidates) if (existsSync(p)) return p;
  throw new Error('Chrome tidak ditemukan; set env CHROME_PATH');
}
