import { PrismaClient } from "@prisma/client";
import { SCENES } from "../src/lib/scenes-data";

const prisma = new PrismaClient();

async function main() {
  for (const scene of SCENES) {
    await prisma.scene.upsert({
      where: { id: scene.id },
      update: {
        title: scene.title,
        category: scene.category,
        difficulty: scene.difficulty,
        scenario: scene.scenario,
        filesJson: scene.files as object[],
        solutionJson: scene.solution as object,
        timelineJson: scene.timeline as object[],
        networkJson: scene.network_log as object,
      },
      create: {
        id: scene.id,
        title: scene.title,
        category: scene.category,
        difficulty: scene.difficulty,
        scenario: scene.scenario,
        filesJson: scene.files as object[],
        solutionJson: scene.solution as object,
        timelineJson: scene.timeline as object[],
        networkJson: scene.network_log as object,
      },
    });
    console.log(`✓ Seeded scene ${scene.id}: ${scene.title}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
