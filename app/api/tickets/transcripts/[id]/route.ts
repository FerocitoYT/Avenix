import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentUser} from "@/lib/auth";
export const dynamic="force-dynamic";
export async function GET(req:Request,{params}:{params:{id:string}}){
 const session=await getCurrentUser();if(!session)return NextResponse.json({error:"Inicia sesión en www.axyon.es para consultar la transcripción."},{status:401});
 const user=await prisma.user.findFirst({where:{id:session.id,isActive:true},select:{id:true,role:true,discordId:true}});
 if(!user)return new NextResponse(null,{status:403});
 const record=await prisma.ticketTranscript.findUnique({where:{id:params.id},include:{ticket:{select:{guildId:true,creatorDiscordId:true,creatorId:true}}}});
 if(!record)return new NextResponse(null,{status:404});
 const t=record.ticket;
 const allowed=user.role==="ADMIN"||t.creatorId===user.id||(!!user.discordId&&t.creatorDiscordId===user.discordId)||!!await prisma.botInstance.findFirst({where:{guildId:t.guildId,service:{userId:user.id}},select:{id:true}});
 if(!allowed)return new NextResponse(null,{status:404});
 return new NextResponse(record.htmlContent,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","Content-Security-Policy":"sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src https://cdn.discordapp.com https://media.discordapp.net; base-uri 'none'; form-action 'none'; frame-ancestors 'none'","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"}});
}
