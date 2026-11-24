import {z} from "zod";
import {prisma} from "@/lib/prisma";
export const paypalKey="payments:paypal:ipn";
export const paypalSchema=z.object({enabled:z.boolean(),email:z.string().trim().email().max(254).transform(s=>s.toLowerCase())}).strict();
export async function paypalSettings(){const row=await prisma.setting.findUnique({where:{key:paypalKey}});return row?paypalSchema.parse(JSON.parse(row.value)):{enabled:false,email:""};}
