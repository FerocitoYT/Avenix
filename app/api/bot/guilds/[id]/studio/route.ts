import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guildId = params.id;
    const embeds = await prisma.studioEmbed.findMany({
      where: { guildId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ success: true, embeds });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al obtener diseños de Studio" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guildId = params.id;
    const body = await req.json();

    const embed = await prisma.studioEmbed.upsert({
      where: { id: body.id || "new-embed-id" },
      create: {
        guildId,
        name: body.name || "Nuevo Diseño",
        content: body.content || null,
        embedData: body.embedData || {},
        components: body.components || [],
        isDraft: !!body.isDraft,
      },
      update: {
        name: body.name,
        content: body.content,
        embedData: body.embedData,
        components: body.components,
        isDraft: body.isDraft,
        version: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, embed });
  } catch (error: any) {
    console.error("Error guardando diseño de studio:", error);
    return NextResponse.json({ error: "Error al guardar diseño de embed" }, { status: 500 });
  }
}
