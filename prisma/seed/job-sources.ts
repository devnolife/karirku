import type { PrismaClient } from "@prisma/client";
import { DEFAULT_JOB_SOURCE_SEEDS } from "../../src/lib/scraper/source-seed";

export async function seedJobSources(prisma: PrismaClient): Promise<void> {
  for (const source of DEFAULT_JOB_SOURCE_SEEDS) {
    await prisma.jobSource.upsert({
      where: { careersUrl: source.careersUrl },
      create: {
        name: source.name,
        provider: source.provider,
        careersUrl: source.careersUrl,
        region: source.region,
        enabled: source.enabled,
      },
      update: {
        name: source.name,
        provider: source.provider,
        region: source.region,
      },
    });
  }

  console.log(`✅ Job source registry: ${DEFAULT_JOB_SOURCE_SEEDS.length} defaults ensured`);
}
