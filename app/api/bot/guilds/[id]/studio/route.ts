import { authorizeGuild } from "@/lib/bot-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const embedSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1).max(100).default("Nuevo diseño"),
  content: z.string().max(2000).nullable().optional(),
  embedData: z.record(z.unknown()).default({}),
  components: z.array(z.unknown()).max(5).default([]),
  isDraft: z.boolean().default(true),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const access = await authorizeGuild(params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  try {
    const embeds = await prisma.studioEmbed.findMany({
      where: { guildId: params.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ success: true, embeds });
  } catch (error) {
    console.error("[Studio] Error cargando diseños", error);
    return NextResponse.json({ error: "No se pudieron cargar los diseños" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const access = await authorizeGuild(params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  const parsed = embedSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Diseño inválido", fields: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { id, ...data } = parsed.data;
  const safeData = { ...data, embedData: data.embedData as Prisma.InputJsonObject, components: data.components as Prisma.InputJsonArray };
  try {
    if (id) {
      // Never upsert a user-supplied ID: it could belong to another guild.
      const existing = await prisma.studioEmbed.findFirst({ where: { id, guildId: params.id }, select: { id: true } });
      if (!existing) return NextResponse.json({ error: "Diseño no encontrado en este servidor" }, { status: 404 });
      const result = await prisma.studioEmbed.updateMany({
        where: { id, guildId: params.id },
        data: { ...safeData, version: { increment: 1 } },
      });
      if (!result.count) return NextResponse.json({ error: "El diseño ya no está disponible" }, { status: 409 });
      const embed = await prisma.studioEmbed.findUnique({ where: { id } });
      return NextResponse.json({ success: true, embed });
    }
    const embed = await prisma.studioEmbed.create({ data: { guildId: params.id, ...safeData } });
    return NextResponse.json({ success: true, embed });
  } catch (error) {
    console.error("[Studio] Error guardando diseño", error);
    return NextResponse.json({ error: "No se pudo guardar el diseño" }, { status: 500 });
  }
}
