import {prisma} from "@/lib/prisma";
export const MAINTENANCE_KEY="system:maintenance";
export type Maintenance={mode:"OFF"|"WEB"|"ALL";until:number;reason:string};
export async function maintenanceState():Promise<Maintenance>{
 const row=await prisma.setting.findUnique({where:{key:MAINTENANCE_KEY}});
 const off:Maintenance={mode:"OFF",until:0,reason:""};
 if(!row)return off;
 try{const m=JSON.parse(row.value);return ["WEB","ALL"].includes(m.mode)&&Number.isFinite(m.until)&&m.until>Date.now()?{mode:m.mode,until:m.until,reason:String(m.reason||"Mantenimiento programado")}:off;}catch{return off;}
}
