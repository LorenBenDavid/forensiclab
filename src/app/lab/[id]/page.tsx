import { SCENES } from "@/lib/scenes-data";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import LabClient from "@/components/lab/lab-client";

export function generateStaticParams() {
  return SCENES.map((s) => ({ id: s.id }));
}

export default async function LabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scene = SCENES.find((s) => s.id === id);
  if (!scene) notFound();

  const session = await auth();

  return <LabClient scene={scene} userId={session?.user?.id ?? null} />;
}
