/**
 * MOCK MODE — tidak ada koneksi DB.
 * Export stub `prisma` supaya import lama ga crash.
 * Semua call akan melempar error yang jelas.
 */

const STUB_MESSAGE =
  "[karir.ai] Running in UI/UX mock mode — prisma tidak tersedia. " +
  "Gunakan helper di src/lib/mock/ untuk data.";

// Loose typing: banyak consumer lama memakai method chain prisma.xxx.yyy().
// Proxy rekursif yang selalu throw begitu dipanggil.
function makeStub(): any {
  return new Proxy(function () {
    throw new Error(STUB_MESSAGE);
  }, {
    get: () => makeStub(),
    apply: () => {
      throw new Error(STUB_MESSAGE);
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = makeStub();
