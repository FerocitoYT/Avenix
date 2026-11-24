import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
export const dynamic="force-dynamic";
export async function GET(){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"No autorizado"},{status:401});const [items,unread]=await Promise.all([prisma.notification.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:100}),prisma.notification.count({where:{userId:user.id,isRead:false}})]);return NextResponse.json({items,unread},{headers:{"Cache-Control":"no-store"}});}
export async function PATCH(req:Request){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"No autorizado"},{status:401});const p=z.union([z.object({all:z.literal(true)}),z.object({id:z.string().min(1).max(100)})]).safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"Solicitud inválida"},{status:400});await prisma.notification.updateMany({where:{userId:user.id,isRead:false,...("id" in p.data?{id:p.data.id}:{})},data:{isRead:true}});return NextResponse.json({success:true});}
