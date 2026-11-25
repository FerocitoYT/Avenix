import {prisma} from "@/lib/prisma";
import {decryptSecret} from "@/lib/crypto";
export const roleKey=(guildId:string)=>"tickets:transcript-roles:"+guildId;
export async function ticketRoles(guildId:string):Promise<string[]>{
 const row=await prisma.setting.findUnique({where:{key:roleKey(guildId)}});
 if(!row)return [];
 const roles:unknown=JSON.parse(row.value);
 return Array.isArray(roles)?roles.filter((r):r is string=>typeof r==="string"&&/^\d{17,22}$/.test(r)&&r!==guildId):[];
}
export async function guildBotToken(guildId:string){
 const instance=await prisma.botInstance.findFirst({where:{guildId,configuration:{is:{tokenSecretRef:{not:null}}}},select:{configuration:{select:{tokenSecretRef:true}}}});
 if(instance?.configuration?.tokenSecretRef)return decryptSecret(instance.configuration.tokenSecretRef);
 const custom=await prisma.customBotInstance.findUnique({where:{guildId},select:{encryptedBotToken:true}});
 if(custom)return decryptSecret(custom.encryptedBotToken);
 return guildId==="1574110968584077454"?(process.env.TICKET_ROLE_CHECK_BOT_TOKEN||process.env.DISCORD_BOT_TOKEN||""):"";
}
export async function discordGuildRoles(guildId:string){
 const token=await guildBotToken(guildId);if(!token)throw Error("Bot no configurado");
 const r=await fetch("https://discord.com/api/v10/guilds/"+guildId+"/roles",{headers:{Authorization:"Bot "+token},cache:"no-store",signal:AbortSignal.timeout(6000)});
 if(!r.ok)throw Error("No se pudieron consultar roles de Discord");
 const roles=await r.json() as {id:string;name:string;position:number}[];
 return roles.filter(r=>r.id!==guildId).sort((a,b)=>b.position-a.position).map(({id,name})=>({id,name}));
}
