import {getCurrentUser} from "@/lib/auth";
import {maintenanceState} from "@/lib/maintenance";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function POST(_req:Request,{params}:{params:{id:string}}){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 if((await maintenanceState()).mode!=="OFF")return NextResponse.json({error:"MAINTENANCE"},{status:503});
 const now=new Date();
 const bot=await prisma.botInstance.findFirst({where:{id:params.id,service:{...(user.role==="ADMIN"?{}:{userId:user.id}),serviceType:"DISCORD_BOT",status:"ACTIVE",subscriptions:{some:{status:{in:["ACTIVE","TRIALING"]},currentPeriodStart:{lte:now},currentPeriodEnd:{gt:now}}}}},include:{configuration:true}});
 if(!bot)return NextResponse.json({error:"NOT_FOUND"},{status:404});
 if(!bot.botClientId||!bot.guildId||!bot.configuration?.tokenSecretRef)return NextResponse.json({error:"NOT_CONFIGURED"},{status:409});
 const result=await prisma.$transaction(async tx=>{
   const changed=await tx.botInstance.updateMany({where:{id:bot.id,status:{in:["RUNNING","ERROR","STOPPED"]},updatedAt:bot.updatedAt},data:{status:"RESTARTING"}});
   if(!changed.count)return false;
   await tx.auditLog.create({data:{userId:user.id,action:"BOT_RESTART_REQUESTED",entityType:"BOT",entityId:bot.id}});
   return true;
 });
 return result?NextResponse.json({success:true,status:"RESTARTING"},{status:202}):NextResponse.json({error:"ALREADY_PENDING"},{status:409});
}
