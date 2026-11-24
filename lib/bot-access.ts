import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Authorize a guild using the authenticated user's actual Discord membership or bot ownership. */
export async function authorizeGuild(guildId: string) {
 const user = await getCurrentUser();
 if (!user) return { ok: false as const, status: 401, error: "Inicia sesión" };
 if (user.role === "ADMIN") {
  const guild = await prisma.guild.findUnique({ where: { id: guildId }, select: { id: true } });
  return guild ? { ok: true as const, user } : { ok: false as const, status: 404, error: "Servidor no encontrado" };
 }
 const now = new Date();
 const managedBot = await prisma.botInstance.findFirst({
   where: { guildId, service: { userId: user.id, serviceType: "DISCORD_BOT", status: "ACTIVE", subscriptions: { some: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] }, currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } } } },
   select: { id: true }
 });
 if (!managedBot) return { ok: false as const, status: 403, error: "No tienes acceso a este servidor" };
 const guild = await prisma.guild.findUnique({where:{id:guildId},select:{id:true}});
 if(!guild)return {ok:false as const,status:404,error:"Servidor no encontrado"};
 return { ok: true as const, user };
}
