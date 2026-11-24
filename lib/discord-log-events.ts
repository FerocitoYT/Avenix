import { prisma } from "@/lib/prisma";

export type DiscordLogCategory="GENERAL"|"MODERATION"|"TICKETS"|"PAYMENTS"|"BOTS";

export async function queueDiscordLog(input:{guildId:string;category:DiscordLogCategory;title:string;description:string;metadata?:Record<string,unknown>}){
  if(!input.guildId)return null;
  return prisma.discordLogEvent.create({data:{
    guildId:input.guildId,category:input.category,title:input.title,description:input.description,metadata:(input.metadata as any)||undefined
  }}).catch(()=>null);
}

export async function queuePaymentLogsForUser(input:{userId:string;title:string;description:string;metadata?:Record<string,unknown>}){
  const instances=await prisma.botInstance.findMany({
    where:{guildId:{not:null},service:{userId:input.userId,serviceType:"DISCORD_BOT",status:"ACTIVE"}},
    select:{guildId:true}
  });
  const guildIds=Array.from(new Set(instances.flatMap(i=>i.guildId?[i.guildId]:[])));
  await Promise.all(guildIds.map(guildId=>queueDiscordLog({guildId,category:"PAYMENTS",title:input.title,description:input.description,metadata:input.metadata})));
}
