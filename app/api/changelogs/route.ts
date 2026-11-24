import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {categories,type Category} from "@/lib/changelog-categories";
import {type Change} from "@/lib/changelog-data";
export const dynamic="force-dynamic";
export async function GET(){try{
 const rows=await prisma.setting.findMany({where:{category:"CHANGELOG",key:{startsWith:"changelog:auto:"}},orderBy:{updatedAt:"desc"},take:200});
 const entries:Change[]=rows.flatMap(row=>{try{const v=JSON.parse(row.value);const areas=(v.areas as Category[]).filter(a=>Object.prototype.hasOwnProperty.call(categories,a));const title=v.area==="bot"?{es:"Actualización de Axyon Bot",en:"Axyon Bot update"}:{es:"Actualización de Axyon Control",en:"Axyon Control update"};return [{id:row.key,date:v.date.slice(0,10),area:v.area==="bot"?"bot":"web",important:!!v.important,es:{title:title.es,details:[...areas.map(a=>"Área actualizada: "+categories[a].es),...(v.notes?.es||[])]},en:{title:title.en,details:[...areas.map(a=>"Updated area: "+categories[a].en),...(v.notes?.en||[])]}} as Change]}catch{return []}});
 return NextResponse.json({entries},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=120"}});
 }catch{return NextResponse.json({error:"Changelog unavailable"},{status:503});}}
