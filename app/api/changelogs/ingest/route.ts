import {createPublicKey,verify} from "node:crypto";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {categories} from "@/lib/changelog-categories";
import {z} from "zod";
export const dynamic="force-dynamic";
const issuer="https://token.actions.githubusercontent.com";
const audience="https://axyon.es/api/changelogs/ingest";
const repos=["FerocitoYT/Avenix","FerocitoYT/Axyon-Bot"];
const schema=z.object({sha:z.string().regex(/^[a-f0-9]{40}$/),important:z.boolean(),areas:z.array(z.enum(Object.keys(categories) as [keyof typeof categories,...(keyof typeof categories)[]])).min(1).max(16),date:z.string().datetime(),notes:z.object({es:z.array(z.string().max(400)).max(12),en:z.array(z.string().max(400)).max(12)}).optional()}).strict();
async function identity(req:Request){
 const token=req.headers.get("authorization")?.replace(/^Bearer /,"")||"";
 if(token.length>20000)return null;
 const [a,b,c,...rest]=token.split(".");if(!a||!b||!c||rest.length)return null;
 const h=JSON.parse(Buffer.from(a,"base64url").toString()),p=JSON.parse(Buffer.from(b,"base64url").toString());
 if(h.alg!=="RS256"||p.iss!==issuer||p.aud!==audience||!repos.includes(p.repository)||p.ref!=="refs/heads/main"||p.event_name!=="push"||p.workflow_ref!==p.repository+"/.github/workflows/discord-changelog.yml@refs/heads/main"||p.sub!=="repo:"+p.repository+":ref:refs/heads/main"||!Number.isFinite(p.exp)||p.exp<=Date.now()/1000||!Number.isFinite(p.nbf)||p.nbf>Date.now()/1000+30)return null;
 const response=await fetch(issuer+"/.well-known/jwks",{next:{revalidate:300}});if(!response.ok)throw Error("OIDC unavailable");
 const jwk=(await response.json()).keys.find((k:any)=>k.kid===h.kid&&k.kty==="RSA");if(!jwk)return null;
 return verify("RSA-SHA256",Buffer.from(a+"."+b),createPublicKey({key:jwk,format:"jwk"}),Buffer.from(c,"base64url"))?p:null;
}
export async function POST(req:Request){try{
 const p=await identity(req);if(!p)return NextResponse.json({error:"Unauthorized"},{status:401});
 const d=schema.safeParse(await req.json());if(!d.success||d.data.sha!==p.sha)return NextResponse.json({error:"Invalid release"},{status:400});
 const v=d.data;const key="changelog:auto:"+p.repository.split("/")[1]+":"+v.sha;
 const value=JSON.stringify({...v,area:p.repository.endsWith("/Avenix")?"web":"bot"});
 // Retried workflows overwrite the same record rather than adding duplicates.
 await prisma.setting.upsert({where:{key},create:{key,value,category:"CHANGELOG",isPublic:false},update:{value}});
 return NextResponse.json({success:true});
}catch(e){console.error("[Changelog ingest]",e instanceof Error?e.message:"Error");return NextResponse.json({error:"Unable to ingest"},{status:503});}}
