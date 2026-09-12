const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.evenementStatistique.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  console.log(JSON.stringify(events, null, 2));
}
main().finally(() => prisma.$disconnect());
