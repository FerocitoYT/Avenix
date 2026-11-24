import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {type Change} from "@/lib/changelog-data";
export const dynamic="force-dynamic";
export async function GET(){try{
 const rows=await prisma.setting.findMany({where:{category:"CHANGELOG",key:{startsWith:"changelog:auto:"}},orderBy:{updatedAt:"desc"},take:200});
 const entries:Change[]=rows.flatMap(row=>{try{
 const v=JSON.parse(row.value);
 // Fail closed: legacy inferred updates and private operational changes are never public.
 if(v.audience!=="customer"||!v.notes||!["es","en"].every(l=>Array.isArray(v.notes[l])&&v.notes[l].length>0&&v.notes[l].every((s:unknown)=>typeof s==="string"&&s.length<=400)))return [];
 const title=v.area==="bot"?{es:"Novedades de Axyon Bot",en:"What's new in Axyon Bot"}:{es:"Novedades de Axyon Control",en:"What's new in Axyon Control"};
 return [{id:createHash("sha256").update(row.key).digest("hex").slice(0,24),date:v.date.slice(0,10),area:v.area==="bot"?"bot":"web",important:!!v.important,es:{title:title.es,details:v.notes.es},en:{title:title.en,details:v.notes.en}} as Change];
 }catch{return []}});
 return NextResponse.json({entries},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Changelog unavailable"},{status:503});}}
