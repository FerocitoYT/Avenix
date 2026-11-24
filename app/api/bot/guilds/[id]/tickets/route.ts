import {withBotChange} from "@/lib/bot-change-signal";
import { authorizeGuild } from "@/lib/bot-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";
const snowflake = z.string().regex(/^\d{17,22}$/, "Introduce un ID válido de Discord");
const optionalUrl = z.union([z.string().url().max(2000).refine(v => v.startsWith("https://"), "Solo HTTPS"), z.literal("")]).optional();
const panelSchema = z.object({
  id: z.string().optional(),
  channelId: snowflake,
  title: z.string().trim().min(1).max(256),
  description: z.string().trim().min(1).max(4000),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  imageUrl: optionalUrl,
  thumbnailUrl: optionalUrl,
  footerText: z.string().max(2048).optional(),
  componentType: z.enum(["BUTTON", "SELECT"]),
});
const questionSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,70}$/),
  label: z.string().trim().min(1).max(45),
  placeholder: z.string().max(100).optional(),
  required: z.boolean().default(true),
  style: z.enum(["SHORT", "PARAGRAPH"]).default("SHORT"),
});
const categorySchema = z.object({
  id: z.string().optional(),
  panelId: z.string().nullable().optional(),
  name: z.string().trim().min(1).max(80),
  description: z.string().max(100).default(""),
  emoji: z.string().max(20).default("📩"),
  discordCategoryId: snowflake,
  supportRoleIds: z.array(snowflake).max(12).default([]),
  maxOpenPerUser: z.number().int().min(1).max(20).default(1),
  welcomeMessage: z.string().max(2000).default("¡Gracias por contactar con soporte!"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  formFields: z.array(questionSchema).max(5).default([]),
});

function invalid(error: z.ZodError) {
  return NextResponse.json({ error: "Comprueba los campos de la configuración", fields: error.flatten().fieldErrors }, { status: 400 });
}

async function allowed(guildId: string) {
  const access = await authorizeGuild(guildId);
  if (!access.ok) return { error: NextResponse.json({ error: access.error }, { status: access.status }) };
  if (access.user.role === "ADMIN") return {};
  const now = new Date();
  const entitlement = await prisma.botInstance.findFirst({
    where: {
      guildId,
      service: {
        userId: access.user.id,
        serviceType: "DISCORD_BOT",
        status: "ACTIVE",
        subscriptions: { some: { userId: access.user.id, status: { in: ["ACTIVE", "TRIALING"] }, currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } },
      },
    },
    select: { id: true },
  });
  return entitlement ? {} : { error: NextResponse.json({ error: "No tienes una suscripción de bot vigente para este servidor" }, { status: 403 }) };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const check = await allowed(params.id);
  if (check.error) return check.error;
  try {
    const [categories, panels, tickets] = await Promise.all([
      prisma.ticketCategory.findMany({ where: { guildId: params.id }, orderBy: { createdAt: "asc" } }),
      prisma.ticketPanel.findMany({ where: { guildId: params.id }, include: { categories: true }, orderBy: { createdAt: "asc" } }),
      prisma.ticket.findMany({ where: { guildId: params.id }, include: { category: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    ]);
    return NextResponse.json({ success: true, categories, panels, tickets });
  } catch (error) {
    console.error("[Tickets] Error al cargar la configuración", error);
    return NextResponse.json({ error: "No se pudo cargar la configuración de tickets" }, { status: 500 });
  }
}

async function handlePOST(req: Request, { params }: { params: { id: string } }) {
  const check = await allowed(params.id);
  if (check.error) return check.error;
  const guildId = params.id;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.action !== "string") return NextResponse.json({ error: "Acción inválida" }, { status: 400 });

  try {
    if (body.action === "SAVE_PANEL") {
      const result = panelSchema.safeParse(body.panel);
      if (!result.success) return invalid(result.error);
      const { id, ...fields } = result.data;
      const data = { ...fields, imageUrl: fields.imageUrl || null, thumbnailUrl: fields.thumbnailUrl || null, footerText: fields.footerText || null };
      if (id) {
        const existing = await prisma.ticketPanel.findFirst({ where: { id, guildId } });
        if (!existing) return NextResponse.json({ error: "Panel no encontrado" }, { status: 404 });
        const panel = await prisma.ticketPanel.update({ where: { id }, data });
        return NextResponse.json({ success: true, panel, message: "Panel guardado. Discloud actualizará el embed en Discord." });
      }
      const panel = await prisma.ticketPanel.create({ data: { guildId, ...data } });
      return NextResponse.json({ success: true, panel, message: "Panel guardado. Se publicará cuando haya categorías asociadas." });
    }

    if (body.action === "DELETE_PANEL") {
      const id = String(body.panelId || "");
      const existing = await prisma.ticketPanel.findFirst({ where: { id, guildId } });
      if (!existing) return NextResponse.json({ error: "Panel no encontrado" }, { status: 404 });
      await prisma.ticketPanel.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Configuración eliminada. El mensaje antiguo en Discord debe retirarse manualmente." });
    }

    if (body.action === "SAVE_CATEGORY" || body.action === "CREATE_CATEGORY") {
      const raw = body.category ?? body;
      const input = {
        name: raw.name,
        emoji: raw.emoji || "📩",
        description: raw.description || "",
        discordCategoryId: raw.discordCategoryId,
        panelId: raw.panelId || null,
        supportRoleIds: typeof raw.supportRoleIds === "string" ? raw.supportRoleIds.split(",").map((s: string) => s.trim()).filter(Boolean) : raw.supportRoleIds || [],
        maxOpenPerUser: Number(raw.maxOpenPerUser ?? 1),
        welcomeMessage: raw.welcomeMessage || "¡Gracias por contactar con soporte!",
        priority: raw.priority || "MEDIUM",
        formFields: raw.formFields || [],
        ...(raw.id ? { id: raw.id } : {}),
      };
      const result = categorySchema.safeParse(input);
      if (!result.success) return invalid(result.error);
      const { id, ...data } = result.data;
      if (data.panelId && !await prisma.ticketPanel.findFirst({ where: { id: data.panelId, guildId } })) {
        return NextResponse.json({ error: "El panel no pertenece a este servidor" }, { status: 400 });
      }
      if (id) {
        const current = await prisma.ticketCategory.findFirst({ where: { id, guildId } });
        if (!current) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
        const category = await prisma.ticketCategory.update({ where: { id }, data });
        return NextResponse.json({ success: true, category });
      }
      const category = await prisma.ticketCategory.create({ data: { guildId, ...data } });
      return NextResponse.json({ success: true, category });
    }

    if (body.action === "DELETE_CATEGORY") {
      const id = String(body.categoryId || "");
      const category = await prisma.ticketCategory.findFirst({ where: { id, guildId }, select: { id: true, tickets: { select: { id: true }, take: 1 } } });
      if (!category) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
      if (category.tickets.length) return NextResponse.json({ error: "No puedes eliminar una categoría con tickets históricos. Edítala en su lugar." }, { status: 409 });
      await prisma.ticketCategory.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (error) {
    console.error("[Tickets] No se pudo guardar la configuración", error);
    return NextResponse.json({ error: "No se pudieron guardar los cambios" }, { status: 500 });
  }
}

export const POST=withBotChange("tickets",handlePOST);
