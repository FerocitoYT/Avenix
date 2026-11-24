import {requireAdmin} from "@/lib/auth";
import {maintenanceState,MAINTENANCE_KEY} from "@/lib/maintenance";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
export const dynamic="force-dynamic";
const schema=z.object({mode:z.enum(["OFF","WEB","ALL"]),minutes:z.number().int().min(1).max(10080),reason:z.string().trim().max(300)});
export async function GET(){try{await requireAdmin();return NextResponse.json(await maintenanceState());}catch{return NextResponse.json({error:"Acceso no autorizado o servicio no disponible"},{status:403});}}
export async function PUT(req:Request){try{const admin=await requireAdmin();const p=schema.safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"Configuración inválida"},{status:400});const d=p.data;const state={mode:d.mode,until:d.mode==="OFF"?0:Date.now()+d.minutes*60000,reason:d.reason,updatedBy:admin.id};const value=JSON.stringify(state);await prisma.setting.upsert({where:{key:MAINTENANCE_KEY},create:{key:MAINTENANCE_KEY,value,category:"SYSTEM",isPublic:false},update:{value}});return NextResponse.json(state);}catch(e){console.error("[Maintenance]",e);return NextResponse.json({error:"No se pudo modificar el mantenimiento"},{status:403});}}
