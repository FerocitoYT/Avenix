import Link from "next/link";
import { AlertTriangle } from "lucide-react";
export function BotTokenWarning({botId,health}:{botId:string;health?:string|null}){
 const messages:Record<string,{title:string;detail:string}> = {
 INVALID:{title:"Token del bot inválido o revocado",detail:"Discord ha rechazado las credenciales. Introduce un token vigente para recuperar la conexión."},
 MISSING:{title:"Token sin configurar",detail:"Configura las credenciales de tu bot para poder conectarlo."},
 MISMATCH:{title:"Token de otra aplicación",detail:"El token no corresponde al ID de aplicación configurado."},
 UNREADABLE:{title:"No se pudo leer el token",detail:"Las credenciales almacenadas no se pudieron descifrar. Vuelve a introducir el token o contacta con soporte."},
 UNAVAILABLE:{title:"No se pudo comprobar el token",detail:"Discord no respondió correctamente. Esto no confirma que el token sea inválido. Vuelve a comprobarlo más tarde."}
 };
 const issue=health?messages[health]:null;if(!issue)return null;
 const uncertain=health==="UNAVAILABLE";
 return <div role="status" className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start gap-3 ${uncertain?"border-amber-500/30 bg-amber-950/20 text-amber-200":"border-red-500/30 bg-red-950/20 text-red-200"}`}><AlertTriangle className="w-5 h-5 shrink-0 mt-0.5"/><div className="flex-1 min-w-0"><p className="font-bold text-sm">{issue.title}</p><p className="mt-1 text-xs text-slate-300">{issue.detail}</p></div><Link href={`/dashboard/bots/configuracion?botId=${encodeURIComponent(botId)}`} className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-bold shrink-0 ${uncertain?"bg-amber-500 text-slate-950 hover:bg-amber-400":"bg-red-600 text-white hover:bg-red-500"}`}>Cambiar Tok3n</Link></div>;
}
