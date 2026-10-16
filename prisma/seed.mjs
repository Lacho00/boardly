// Fills the database with fictional sites and 30 days of fake metrics.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DAY = 86_400_000;

const sites = [
  { name: "Acme Shop", url: "https://shop.acme.test", base: 88, seo: 92, a11y: 95, ssl: 62 },
  { name: "Northwind Blog", url: "https://blog.northwind.test", base: 94, seo: 97, a11y: 98, ssl: 74 },
  { name: "Globex Portal", url: "https://portal.globex.test", base: 71, seo: 80, a11y: 84, ssl: 9 },
  { name: "Initech Docs", url: "https://docs.initech.test", base: 82, seo: 88, a11y: 90, ssl: 41 },
];

// Deterministic pseudo-noise so reseeding gives the same charts.
const noise = (i, k) => Math.sin(i * 12.9898 + k * 78.233) * 0.5;
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

async function main() {
  await prisma.alert.deleteMany();
  await prisma.monthlyReport.deleteMany();
  await prisma.sslCheck.deleteMany();
  await prisma.accessibilityScore.deleteMany();
  await prisma.seoAudit.deleteMany();
  await prisma.performanceSnapshot.deleteMany();
  await prisma.healthCheck.deleteMany();
  await prisma.site.deleteMany();

  const now = Date.now();
  const today = new Date();

  for (const [k, s] of sites.entries()) {
    const site = await prisma.site.create({ data: { name: s.name, url: s.url } });

    for (let d = 29; d >= 0; d--) {
      const checkedAt = new Date(now - d * DAY);
      const score = clamp(s.base + noise(d, k) * 12);
      await prisma.performanceSnapshot.create({
        data: {
          siteId: site.id,
          score,
          bestPractices: clamp(s.base + 4 + noise(d, k + 7) * 6),
          lcp: +(1.2 + (100 - score) / 25 + noise(d, k + 1)).toFixed(2),
          cls: +Math.abs(0.02 + (100 - score) / 900 + noise(d, k + 2) / 40).toFixed(3),
          ttfb: Math.round(180 + (100 - score) * 6 + noise(d, k + 3) * 80),
          checkedAt,
        },
      });
      await prisma.healthCheck.create({
        data: {
          siteId: site.id,
          status: d === 12 && k === 2 ? "down" : "up",
          wpVersion: "6.8.1",
          plugins: 14 + k * 3,
          responseTime: Math.round(220 + (100 - score) * 7 + noise(d, k + 4) * 90),
          checkedAt,
        },
      });
    }

    await prisma.seoAudit.create({
      data: {
        siteId: site.id,
        title: s.name,
        description: `Demo description for ${s.name}`,
        h1Count: 1,
        imgNoAlt: Math.max(0, Math.round((100 - s.seo) / 4)),
        score: s.seo,
      },
    });
    await prisma.accessibilityScore.create({
      data: { siteId: site.id, score: s.a11y, issues: Math.round((100 - s.a11y) / 3) },
    });
    await prisma.sslCheck.create({
      data: {
        siteId: site.id,
        valid: true,
        daysRemaining: s.ssl,
        expiresAt: new Date(now + s.ssl * DAY).toISOString(),
        issuer: "Let's Encrypt",
      },
    });
    await prisma.monthlyReport.create({
      data: {
        siteId: site.id,
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        avgPerformance: s.base,
        avgSeo: s.seo,
        avgAccessibility: s.a11y,
        uptime: k === 2 ? 99.1 : 99.98,
      },
    });

    if (s.ssl < 14) {
      await prisma.alert.create({
        data: {
          siteId: site.id,
          type: "ssl",
          severity: "critical",
          message: `SSL certificate expires in ${s.ssl} days`,
        },
      });
    }
    if (s.base < 75) {
      await prisma.alert.create({
        data: {
          siteId: site.id,
          type: "performance",
          severity: "warning",
          message: `Performance score dropped to ${s.base}`,
        },
      });
    }
  }
  console.log(`Seeded ${sites.length} demo sites.`);
}

main().finally(() => prisma.$disconnect());
