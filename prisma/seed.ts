import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedUsers } from "./seed/users";
import { seedMarketplace } from "./seed/marketplace";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Seed taksonomi skill untuk Bahasa Indonesia + internasional
// Tidak eksaustif — ditambah dari hasil AI enrichment jobs seiring waktu.
const SKILLS: Array<{ name: string; category: string; aliases?: string[] }> = [
  // Programming languages
  { name: "Python", category: "programming", aliases: ["python3"] },
  { name: "JavaScript", category: "programming", aliases: ["JS", "ECMAScript"] },
  { name: "TypeScript", category: "programming", aliases: ["TS"] },
  { name: "Java", category: "programming" },
  { name: "Kotlin", category: "programming" },
  { name: "Go", category: "programming", aliases: ["Golang"] },
  { name: "Rust", category: "programming" },
  { name: "PHP", category: "programming" },
  { name: "C#", category: "programming", aliases: ["CSharp", "dotnet"] },
  { name: "Ruby", category: "programming" },
  { name: "Swift", category: "programming" },
  { name: "Dart", category: "programming" },

  // Frontend
  { name: "React", category: "frontend", aliases: ["ReactJS"] },
  { name: "Next.js", category: "frontend", aliases: ["NextJS"] },
  { name: "Vue.js", category: "frontend", aliases: ["Vue", "VueJS"] },
  { name: "Nuxt.js", category: "frontend" },
  { name: "Angular", category: "frontend" },
  { name: "Svelte", category: "frontend" },
  { name: "HTML", category: "frontend" },
  { name: "CSS", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend", aliases: ["Tailwind", "TailwindCSS"] },
  { name: "Sass", category: "frontend", aliases: ["SCSS"] },

  // Backend
  { name: "Node.js", category: "backend", aliases: ["NodeJS"] },
  { name: "Express.js", category: "backend", aliases: ["Express"] },
  { name: "NestJS", category: "backend" },
  { name: "Django", category: "backend" },
  { name: "FastAPI", category: "backend" },
  { name: "Flask", category: "backend" },
  { name: "Laravel", category: "backend" },
  { name: "Spring Boot", category: "backend" },
  { name: "Ruby on Rails", category: "backend", aliases: ["Rails"] },

  // Mobile
  { name: "React Native", category: "mobile" },
  { name: "Flutter", category: "mobile" },
  { name: "Android", category: "mobile" },
  { name: "iOS", category: "mobile" },

  // Data & AI
  { name: "SQL", category: "data" },
  { name: "PostgreSQL", category: "data", aliases: ["Postgres"] },
  { name: "MySQL", category: "data" },
  { name: "MongoDB", category: "data" },
  { name: "Redis", category: "data" },
  { name: "Elasticsearch", category: "data" },
  { name: "Apache Kafka", category: "data", aliases: ["Kafka"] },
  { name: "Apache Spark", category: "data", aliases: ["Spark"] },
  { name: "Airflow", category: "data" },
  { name: "dbt", category: "data" },
  { name: "Snowflake", category: "data" },
  { name: "BigQuery", category: "data" },
  { name: "Pandas", category: "data" },
  { name: "NumPy", category: "data" },
  { name: "Scikit-learn", category: "data" },
  { name: "PyTorch", category: "data" },
  { name: "TensorFlow", category: "data" },
  { name: "Machine Learning", category: "data", aliases: ["ML"] },
  { name: "Deep Learning", category: "data" },
  { name: "Natural Language Processing", category: "data", aliases: ["NLP"] },
  { name: "Computer Vision", category: "data" },
  { name: "LLM", category: "data", aliases: ["Large Language Model"] },
  { name: "Prompt Engineering", category: "data" },

  // DevOps / Cloud
  { name: "Docker", category: "devops" },
  { name: "Kubernetes", category: "devops", aliases: ["k8s"] },
  { name: "AWS", category: "devops", aliases: ["Amazon Web Services"] },
  { name: "Google Cloud Platform", category: "devops", aliases: ["GCP"] },
  { name: "Microsoft Azure", category: "devops", aliases: ["Azure"] },
  { name: "Terraform", category: "devops" },
  { name: "Ansible", category: "devops" },
  { name: "CI/CD", category: "devops" },
  { name: "Git", category: "devops" },
  { name: "Linux", category: "devops" },
  { name: "Nginx", category: "devops" },

  // Design
  { name: "Figma", category: "design" },
  { name: "Adobe XD", category: "design" },
  { name: "Photoshop", category: "design" },
  { name: "Illustrator", category: "design" },
  { name: "UI Design", category: "design" },
  { name: "UX Design", category: "design" },
  { name: "UX Research", category: "design" },
  { name: "Design System", category: "design" },
  { name: "Prototyping", category: "design" },

  // Marketing
  { name: "SEO", category: "marketing" },
  { name: "SEM", category: "marketing" },
  { name: "Google Ads", category: "marketing" },
  { name: "Meta Ads", category: "marketing", aliases: ["Facebook Ads", "Instagram Ads"] },
  { name: "Content Marketing", category: "marketing" },
  { name: "Social Media Marketing", category: "marketing" },
  { name: "Copywriting", category: "marketing" },
  { name: "Email Marketing", category: "marketing" },
  { name: "Google Analytics", category: "marketing" },

  // Business / Management
  { name: "Product Management", category: "business" },
  { name: "Project Management", category: "business" },
  { name: "Scrum", category: "business" },
  { name: "Agile", category: "business" },
  { name: "Business Analysis", category: "business" },
  { name: "Data Analysis", category: "business" },
  { name: "Power BI", category: "business" },
  { name: "Tableau", category: "business" },
  { name: "Microsoft Excel", category: "business", aliases: ["Excel"] },

  // Soft skills (penting untuk role Indonesia)
  { name: "Komunikasi", category: "soft", aliases: ["Communication"] },
  { name: "Problem Solving", category: "soft" },
  { name: "Kepemimpinan", category: "soft", aliases: ["Leadership"] },
  { name: "Kerja Tim", category: "soft", aliases: ["Teamwork"] },
  { name: "Bahasa Inggris", category: "soft", aliases: ["English"] },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log(`🌱 Seeding ${SKILLS.length} skills...`);

  for (const skill of SKILLS) {
    await prisma.skillTaxonomy.upsert({
      where: { slug: slugify(skill.name) },
      create: {
        name: skill.name,
        slug: slugify(skill.name),
        category: skill.category,
        aliases: skill.aliases ?? [],
      },
      update: {
        name: skill.name,
        category: skill.category,
        aliases: skill.aliases ?? [],
      },
    });
  }

  const total = await prisma.skillTaxonomy.count();
  console.log(`✅ Skill taxonomy: ${total} rows`);

  await seedUsers(prisma);
  await seedMarketplace(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
