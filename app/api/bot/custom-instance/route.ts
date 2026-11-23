import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptSecret, maskToken } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) {
      const instances = await prisma.customBotInstance.findMany({
        include: {
          guild: { select: { id: true, name: true, icon: true } },
          logs: { orderBy: { timestamp: "desc" }, take: 20 },
        },
      });
      return NextResponse.json({ success: true, instances });
    }

    const instance = await prisma.customBotInstance.findUnique({
      where: { guildId },
      include: {
        logs: { orderBy: { timestamp: "desc" }, take: 30 },
      },
    });

    return NextResponse.json({ success: true, instance });
  } catch (error: any) {
    console.error("Error al obtener instancias de bot personalizadas:", error);
    return NextResponse.json({ error: "Error al consultar instancias" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guildId, applicationId, botToken, botName, botAvatarUrl, statusText, activityType } = body;

    if (!guildId || !applicationId || !botName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (guildId, applicationId, botName)" },
        { status: 400 }
      );
    }

    const existing = await prisma.customBotInstance.findUnique({
      where: { guildId },
    });

    let encryptedToken = existing?.encryptedBotToken;
    let tokenMask = existing?.tokenMask;

    if (botToken) {
      encryptedToken = encryptSecret(botToken);
      tokenMask = maskToken(botToken);
    }

    if (!encryptedToken || !tokenMask) {
      return NextResponse.json(
        { error: "Debes ingresar el token de tu bot de Discord" },
        { status: 400 }
      );
    }

    // Ensure a default user id exists or link to system
    let defaultUserId = "system-admin";
    const firstUser = await prisma.user.findFirst();
    if (firstUser) defaultUserId = firstUser.id;

    const instance = await prisma.customBotInstance.upsert({
      where: { guildId },
      create: {
        guildId,
        userId: defaultUserId,
        applicationId,
        encryptedBotToken: encryptedToken,
        tokenMask,
        botName,
        botAvatarUrl: botAvatarUrl || null,
        statusText: statusText || "Avenix Control | /help",
        activityType: activityType || "WATCHING",
        status: "STOPPED",
      },
      update: {
        applicationId,
        encryptedBotToken: encryptedToken,
        tokenMask,
        botName,
        botAvatarUrl: botAvatarUrl || null,
        statusText: statusText || undefined,
        activityType: activityType || undefined,
      },
    });

    await prisma.instanceLog.create({
      data: {
        instanceId: instance.id,
        level: "INFO",
        message: `Configuración de aplicación personalizada actualizada desde el Panel Web Avenix Control.`,
      },
    });

    return NextResponse.json({ success: true, instance });
  } catch (error: any) {
    console.error("Error guardando instancia de bot personalizada:", error);
    return NextResponse.json(
      { error: "Error al guardar instancia personalizada" },
      { status: 500 }
    );
  }
}
