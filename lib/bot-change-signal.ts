import {prisma} from "@/lib/prisma";
import {randomUUID} from "node:crypto";
type Context={params:{id:string}};
type Handler<C extends Context>=(request:Request,context:C)=>Promise<Response>;
/** Emit a revision only after a successful authorized write. The regular
 * bot reconciliation remains the fallback if this best-effort signal fails. */
export function withBotChange<C extends Context>(module:string,handler:Handler<C>):Handler<C>{
 return async(request,context)=>{
  const started=Date.now();
  const response=await handler(request,context);
  const savedAt=Date.now();
  if(response.ok){
   const key="sync:revision:"+context.params.id+":"+module;
   const value=JSON.stringify({revision:randomUUID(),at:Date.now(),apiMs:savedAt-started});
   try{await prisma.setting.upsert({where:{key},create:{key,value,category:"BOT_SYNC",isPublic:false},update:{value}});}
   catch(e){console.error("[Bot change signal]",module,e);}
  }
  return response;
 };
}
