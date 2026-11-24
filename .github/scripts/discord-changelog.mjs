import {execFileSync} from 'node:child_process';
const sha=process.env.GITHUB_SHA||'HEAD';
let before=process.env.GITHUB_EVENT_BEFORE||'';
if(!before||/^0+$/.test(before))before=execFileSync('git',['rev-parse',sha+'^'],{encoding:'utf8'}).trim();
const commits=execFileSync('git',['log','--format=%s','--no-merges',before+'..'+sha],{encoding:'utf8'}).split('\n');
// Explicit opt-in: only customer-facing major changes with curated release titles.
const major=commits.filter(s=>/^\[major\]\s+[^\s]/i.test(s));
if(!major.length){console.log('Sin novedades importantes marcadas para Discord.');process.exit(0);}
const webhook=process.env.DISCORD_CHANGELOG_WEBHOOK;
if(!webhook)throw Error('Falta DISCORD_CHANGELOG_WEBHOOK');
const sensitive=/token|secret|password|passwd|credential|bearer|database.?url|private.?key|api.?key|https?:|\d{17,}/i;
const lines=[...new Set(major.map(s=>s.replace(/^\[major\]\s+/i,'').trim()).filter(s=>!sensitive.test(s)).map(s=>s.replace(/[@<>]/g,'').slice(0,180)))].slice(0,8);
const payload={username:'Axyon · Actualizaciones',allowed_mentions:{parse:[]},embeds:[{title:'Novedades importantes de Axyon',description:(lines.length?lines.map(s=>'• '+s).join('\n'):'Se han incorporado mejoras importantes.')+'\n\n[Consultar todas las novedades](https://axyon.es/changelogs)',color:0x3b82f6,timestamp:new Date().toISOString()}]};
for(let i=0;i<5;i++){const r=await fetch(webhook,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});if(r.ok){console.log('Aviso importante enviado.');process.exit(0);}if(r.status!==429)throw Error('Discord HTTP '+r.status);await new Promise(resolve=>setTimeout(resolve,Math.min(15000,Math.max(1000,(Number(r.headers.get('retry-after'))||2)*1000))));}
throw Error('Discord limitó los avisos');
