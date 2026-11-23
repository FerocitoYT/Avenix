import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
 const user = await getCurrentUser();
 if (!user) return NextResponse.json({error:"No autorizado"},{status:401});
 const bots = await prisma.botInstance.findMany({where:{service:{userId:user.id,subscriptions:{some:{status:{in:["ACTIVE","TRIALING"]},currentPeriodEnd:{gt:new Date()}}}}},select:{id:true,name:true,status:true,service:{select:{renewalDate:true}}}});
 return NextResponse.json({bots});
}
