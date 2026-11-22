import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { OFFICIAL_CATALOG } from "./catalog";

export type Role = "CLIENT" | "EMPLOYEE" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  discordId?: string | null;
  discordUsername?: string | null;
  companyName?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || "avenix-secure-jwt-key-2026-production";
const COOKIE_NAME = "avenix_session_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  try {
    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (e) {
    // May happen in certain serverless environments where response cookies are used
    console.warn("Cookie set note:", e);
  }
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

// In-memory fallback user session for local demo/development if Prisma is offline or initial
let inMemoryDevUsers: Array<SessionUser & { passwordHash: string }> = [];

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.id) return null;

    // Verify against DB if DB is accessible
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          discordId: true,
          discordUsername: true,
          companyName: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        companyName: user.companyName,
      };
    } catch {
      // In case DB is not yet connected during local design inspection, return the verified signed token payload
      const found = inMemoryDevUsers.find((u) => u.id === payload.id);
      if (found) return found;
      return payload;
    }
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "EMPLOYEE") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// Helper to seed initial catalog in Prisma if empty
export async function ensureCatalogInitialized() {
  try {
    const count = await prisma.product.count();
    if (count === 0) {
      for (const prod of OFFICIAL_CATALOG) {
        const created = await prisma.product.create({
          data: {
            id: prod.id,
            slug: prod.slug,
            name: prod.name,
            tagline: prod.tagline,
            description: prod.description,
            category: prod.category,
            features: prod.features,
            badge: prod.badge,
            isAvailable: prod.isAvailable,
            isFeatured: prod.isFeatured ?? false,
          },
        });

        for (const price of prod.prices) {
          await prisma.productPrice.create({
            data: {
              id: price.id,
              productId: created.id,
              name: price.name,
              billingType: price.billingType,
              interval: price.interval,
              priceCents: price.priceCents,
              currency: "EUR",
              vatIncluded: price.vatIncluded,
              vatRatePercent: price.vatRatePercent,
              isPopular: price.isPopular ?? false,
              isAvailable: price.isAvailable,
            },
          });
        }
      }
    }
  } catch (err) {
    // If DB is offline, handled gracefully
    console.warn("Could not check or seed catalog in DB:", err);
  }
}
