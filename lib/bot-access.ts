import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Authorize a guild using the authenticated user's actual Discord membership or bot ownership. */
export async function authorizeGuild(guildId: string) {
 const user = await getCurrentUser();
 if (!user) return { ok: false as const, status: 401, error: "Inicia sesión" };
 const guild = await prisma.guild.findUnique({ where: { id: guildId }, select: { ownerId: true } });
 if (!guild) return { ok: false as const, status: 404, error: "Servidor no encontrado" };
 if (user.role === "ADMIN") return { ok: true as const, user };
 const instance = await prisma.customBotInstance.findUnique({ where: { guildId }, select: { userId: true } });
 const owner = !!user.discordId && guild.ownerId === user.discordId;
 const managedBot = await prisma.botInstance.findFirst({
   where: { guildId, service: { userId: user.id, serviceType: "DISCORD_BOT" } },
   select: { id: true }
 });
 const permitted = owner || instance?.userId === user.id || !!managedBot;
 if (!permitted) return { ok: false as const, status: 403, error: "No tienes acceso a este servidor" };
 return { ok: true as const, user };
}
