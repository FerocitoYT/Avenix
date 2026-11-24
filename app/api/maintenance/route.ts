import {maintenanceState} from "@/lib/maintenance";
import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(){try{return NextResponse.json(await maintenanceState(),{headers:{"Cache-Control":"no-store"}});}catch{return NextResponse.json({error:"Estado no disponible"},{status:503});}}
