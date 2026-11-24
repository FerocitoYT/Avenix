import {ImageResponse} from "next/og";
export const runtime="edge";
export async function GET(req:Request){
 const p=new URL(req.url).searchParams;
 const name=(p.get("name")||"Nuevo miembro").slice(0,64),server=(p.get("server")||"Discord").slice(0,64),count=(p.get("count")||"").slice(0,12);
 const color=/^#[0-9a-f]{6}$/i.test(p.get("color")||"")?p.get("color")!:"#2563eb";
 const avatar=p.get("avatar")||"";
 const safe=/^https:\/\/cdn\.discordapp\.com\/(?:avatars\/\d{17,22}\/[a-f0-9]+|embed\/avatars\/[0-5])\.png(?:\?size=\d+)?$/i.test(avatar);
 return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",padding:50,background:"linear-gradient(120deg,#0b1220,#1e293b)",color:"white",borderBottom:"12px solid "+color}}>
 {safe?<img src={avatar} width={150} height={150} style={{borderRadius:75,border:"5px solid "+color}}/>:<div style={{display:"flex",width:150,height:150,borderRadius:75,background:color,alignItems:"center",justifyContent:"center",fontSize:56}}>{name.slice(0,1)}</div>}
 <div style={{display:"flex",flexDirection:"column",marginLeft:32,maxWidth:680}}><div style={{fontSize:26,color:"#94a3b8"}}>¡BIENVENIDO/A!</div><div style={{fontSize:48,fontWeight:700,wordBreak:"break-word"}}>{name}</div><div style={{fontSize:25,color:"#cbd5e1"}}>{server}{count?" · Miembro #"+count:""}</div></div>
 </div>,{width:900,height:300,headers:{"Cache-Control":"public, max-age=300"}});
}
