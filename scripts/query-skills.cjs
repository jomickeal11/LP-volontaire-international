const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const skills = await p.skill.findMany({ select: { slug: true, nameEn: true, nameFr: true } });
  console.log(JSON.stringify(skills, null, 2));
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
