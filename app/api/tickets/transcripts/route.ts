import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {timingSafeEqual} from "node:crypto";
import {z} from "zod";
import {ticketReference} from "@/lib/ticket-reference";
export const dynamic="force-dynamic";
const schema=z.object({ticketId:z.string().min(1).max(100),guildId:z.string().regex(/^\d{17,22}$/),channelId:z.string().regex(/^\d{17,22}$/),html:z.string().min(1).max(3000000)}).strict();
export async function POST(req:Request){try{
 const secret=process.env.TICKET_TRANSCRIPT_SECRET||"";const provided=req.headers.get("authorization")||"";
 const expected=Buffer.from("Bearer "+secret),actual=Buffer.from(provided);
 if(secret.length<32||expected.length!==actual.length||!timingSafeEqual(expected,actual))return NextResponse.json({error:"Unauthorized"},{status:401});
 const raw=await req.text();if(Buffer.byteLength(raw)>4000000)return NextResponse.json({error:"Transcript too large"},{status:413});
 const p=schema.safeParse(JSON.parse(raw));if(!p.success)return NextResponse.json({error:"Invalid transcript"},{status:400});
 const d=p.data;const ticket=await prisma.ticket.findFirst({where:{id:d.ticketId,guildId:d.guildId,channelId:d.channelId},select:{id:true,status:true}});
 if(!ticket)return NextResponse.json({error:"Ticket not found"},{status:404});
 const saved=await prisma.ticketTranscript.upsert({where:{ticketId:ticket.id},create:{ticketId:ticket.id,htmlContent:d.html,fileSize:Buffer.byteLength(d.html)},update:{}});
 return NextResponse.json({success:true,reference:ticketReference(ticket.id),url:"https://www.axyon.es/api/tickets/transcripts/"+ticketReference(ticket.id)});
 }catch{return NextResponse.json({error:"Could not save transcript"},{status:500});}}
