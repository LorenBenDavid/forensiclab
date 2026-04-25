import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sceneId, score, maxScore, usedAutoScan, timeTaken, findings } = await req.json();
  const userId = session.user.id;

  const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
  if (!scene) return NextResponse.json({ error: "Scene not found" }, { status: 404 });

  await prisma.attempt.create({
    data: { userId, sceneId, score, maxScore, usedAutoScan, timeTaken, findingsJson: findings },
  });

  const allAttempts = await prisma.attempt.findMany({ where: { userId } });
  const uniqueScenes = new Set(allAttempts.map((a) => a.sceneId));
  const totalScore = allAttempts.reduce((sum, a) => sum + a.score, 0);
  const totalPossible = allAttempts.reduce((sum, a) => sum + a.maxScore, 0);
  const accuracyPct = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

  await prisma.userStats.upsert({
    where: { userId },
    update: { totalScore, scenesCompleted: uniqueScenes.size, accuracyPct, lastActive: new Date() },
    create: { userId, totalScore, scenesCompleted: uniqueScenes.size, accuracyPct, lastActive: new Date() },
  });

  return NextResponse.json({ ok: true });
}
