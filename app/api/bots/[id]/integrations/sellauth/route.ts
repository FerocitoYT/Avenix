import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { decryptSecret, encryptSecret, maskToken } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const settingKey = (botId: string) => `integration:sellauth:${botId}`;
const couponSchema = z.object({
  code: z.string().trim().min(3).max(255).regex(/^[A-Za-z0-9_-]+$/),
  type: z.enum(["PERCENTAGE", "AMOUNT"]),
  discount: z.number().min(1),
  store_wide: z.boolean().default(false),
  products: z.array(z.string().regex(/^\d+$/)).max(100).default([]),
  product_variants: z.array(z.string().regex(/^\d+$/)).max(200).default([]),
  limit: z.number().int().positive().max(100000).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  minimum_amount: z.number().min(1).nullable().optional(),
  applies_to: z.enum(["one_time", "subscriptions"]).default("one_time"),
  subscription_payments: z.number().int().min(1).max(36).nullable().optional(),
}).superRefine((value, ctx) => {
  if (value.type === "PERCENTAGE" && value.discount > 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount"], message: "El porcentaje no puede superar el 100%." });
  }
  if (value.applies_to === "subscriptions" && !value.subscription_payments) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["subscription_payments"], message: "Indica cuántos pagos de la suscripción tendrán descuento." });
  }
  if (value.applies_to === "subscriptions" && value.type === "PERCENTAGE" && value.discount >= 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount"], message: "Los cupones de suscripción no admiten un descuento del 100%." });
  }
  if (!value.store_wide && value.products.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["products"], message: "Selecciona productos o activa el ámbito de toda la tienda." });
  }
});

async function authorize(botId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Inicia sesión" }, { status: 401 }) };
  const now = new Date();
  const bot = await prisma.botInstance.findFirst({
    where: { id: botId, service: {
      userId: user.id, serviceType: "DISCORD_BOT", status: "ACTIVE",
      subscriptions: { some: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] }, currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } },
    } },
    select: { id: true },
  });
  if (!bot) return { error: NextResponse.json({ error: "Suscripción o instancia no disponible" }, { status: 403 }) };
  return { bot };
}

async function readConfig(botId: string) {
  const row = await prisma.setting.findUnique({ where: { key: settingKey(botId) } });
  if (!row) return null;
  try {
    return JSON.parse(row.value) as { apiKeyEncrypted: string; enabled: boolean; storeSlug?: string; lastValidatedAt?: string | null };
  } catch { return null; }
}

async function sellAuthRequest(apiKey: string, storeSlug: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`https://sell.app/api${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(storeSlug ? { "X-STORE": storeSlug } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const body = await response.text();
  let data: any = null;
  try { data = body ? JSON.parse(body) : null; } catch { data = { message: body.slice(0, 500) }; }
  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : `SellAuth respondió ${response.status}`;
    throw Object.assign(new Error(message), { status: response.status });
  }
  return data;
}

async function getApiKey(botId: string) {
  const config = await readConfig(botId);
  if (!config?.apiKeyEncrypted || !config.enabled) throw new Error("La integración SellAuth no está configurada o está desactivada.");
  return { apiKey: decryptSecret(config.apiKeyEncrypted), storeSlug: config.storeSlug || "" };
}

type Context = { params: { id: string } };

export async function GET(_request: Request, { params }: Context) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const config = await readConfig(params.id);
  if (!config) return NextResponse.json({ configured: false, enabled: false, storeSlug: "" });
  let maskedKey = "••••••••";
  try { maskedKey = maskToken(decryptSecret(config.apiKeyEncrypted)); } catch {}
  return NextResponse.json({
    configured: Boolean(config.apiKeyEncrypted),
    enabled: Boolean(config.enabled),
    storeSlug: config.storeSlug || "",
    maskedKey,
    lastValidatedAt: config.lastValidatedAt || null,
  });
}

export async function PUT(request: Request, { params }: Context) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const schema = z.object({
    apiKey: z.string().trim().min(12).max(500).optional().or(z.literal("")),
    storeSlug: z.string().trim().max(100).regex(/^[a-z0-9-]*$/).default(""),
    enabled: z.boolean().default(true),
  });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Configuración inválida", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const old = await readConfig(params.id);
  if (!parsed.data.apiKey && !old?.apiKeyEncrypted) return NextResponse.json({ error: "Introduce la API Key de SellAuth." }, { status: 400 });
  const config = {
    apiKeyEncrypted: parsed.data.apiKey ? encryptSecret(parsed.data.apiKey) : old!.apiKeyEncrypted,
    storeSlug: parsed.data.storeSlug,
    enabled: parsed.data.enabled,
    lastValidatedAt: old?.lastValidatedAt || null,
  };
  await prisma.setting.upsert({
    where: { key: settingKey(params.id) },
    create: { key: settingKey(params.id), category: "INTEGRATION_SELLAUTH", value: JSON.stringify(config) },
    update: { category: "INTEGRATION_SELLAUTH", value: JSON.stringify(config) },
  });
  return NextResponse.json({ success: true, configured: true, enabled: config.enabled, message: "Credenciales guardadas de forma cifrada." });
}

export async function POST(request: Request, { params }: Context) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const body = await request.json().catch(() => null);
  const operation = z.object({ operation: z.enum(["test", "products", "create-coupon"]), coupon: couponSchema.optional() }).safeParse(body);
  if (!operation.success) return NextResponse.json({ error: "Operación no válida." }, { status: 400 });
  try {
    const { apiKey, storeSlug } = await getApiKey(params.id);
    if (operation.data.operation === "test") {
      await sellAuthRequest(apiKey, storeSlug, "/v2/products?limit=1");
      const config = await readConfig(params.id);
      if (config) await prisma.setting.update({ where: { key: settingKey(params.id) }, data: { value: JSON.stringify({ ...config, lastValidatedAt: new Date().toISOString() }) } });
      return NextResponse.json({ success: true, message: "Conexión con SellAuth verificada." });
    }
    if (operation.data.operation === "products") {
      const products: any[] = [];
      let lastPage = 1;
      for (let page = 1; page <= Math.min(lastPage, 50); page++) {
        const result = await sellAuthRequest(apiKey, storeSlug, `/v2/products?limit=100&page=${page}&with_drafts=true`);
        if (Array.isArray(result?.data)) products.push(...result.data);
        lastPage = Math.max(1, Number(result?.meta?.last_page) || 1);
      }
      return NextResponse.json({ success: true, products: products.map((product: any) => ({
        id: String(product.id ?? ""),
        name: String(product.title ?? "Producto sin nombre"),
        variants: Array.isArray(product.variants) ? product.variants.map((variant: any) => ({ id: String(variant.id ?? ""), name: String(variant.title ?? "Variante") })) : [],
      })).filter((product: any) => product.id) });
    }
    if (!operation.data.coupon) return NextResponse.json({ error: "Faltan los datos del cupón." }, { status: 400 });
    const coupon = couponSchema.safeParse(operation.data.coupon);
    if (!coupon.success) return NextResponse.json({ error: "Datos del cupón inválidos.", fields: coupon.error.flatten().fieldErrors }, { status: 400 });
    const result = await sellAuthRequest(apiKey, storeSlug, "/v2/coupons", {
      method: "POST",
      body: JSON.stringify({ ...coupon.data, products: coupon.data.products.map(Number), product_variants: coupon.data.product_variants.map(Number) }),
    });
    return NextResponse.json({ success: true, coupon: result?.data ?? result });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number((error as any).status) : 502;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error conectando con SellAuth." }, { status: status >= 400 && status < 600 ? status : 502 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  await prisma.setting.deleteMany({ where: { key: settingKey(params.id) } });
  return NextResponse.json({ success: true });
}
