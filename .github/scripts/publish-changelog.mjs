import {execFileSync} from 'node:child_process';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:8*1024*1024});
const sha=process.env.GITHUB_SHA||git('rev-parse','HEAD').trim();
let before=process.env.GITHUB_EVENT_BEFORE||'';
if(!before||/^0+$/.test(before))before=git('rev-parse',sha+'^').trim();
const files=git('diff','--name-only','-z',before,sha).split('\0').filter(f=>/^(app\/|components\/|lib\/|prisma\/|public\/|apps\/|packages\/|middleware\.|next\.config|package(-lock)?\.json$|discloud\.config$)/.test(f));
const rules=[['welcome',/welcome|bienvenida/],['security',/security|verification|moderation|permission/],['tickets',/ticket|support/],['billing',/invoice|billing|factur|stripe|paypal|checkout|subscription|fulfillment/],['account',/account|cuenta|auth/],['notifications',/notification/],['status',/service-status|status-chart/],['maintenance',/maintenance|mantenimiento|hosted-service-manager/],['performance',/performance|config-cache|config-change|sync/],['voice',/voice/],['community',/invite|poll|event|employee|absence|recruitment|application|scheduled-message/],['privacy',/cookie|privacy|legal/],['changelogs',/changelog/],['database',/prisma|database/],['interface',/page\.tsx|layout\.tsx|components\//]];
const areas=[...new Set(files.map(f=>rules.find(([,r])=>r.test(f.toLowerCase()))?.[0]||'internal'))];
const subjects=git('log','--format=%s','--no-merges',before+'..'+sha).split('\n');
const important=subjects.some(s=>/^\[major\]\s+\S/i.test(s));
const endpoint='https://axyon.es/api/changelogs/ingest';
// Only explicitly authored bilingual release notes may be published verbatim, not raw commit text.
let notes;
const noteFiles=git('diff','--name-only','--diff-filter=A','-z',before,sha).split('\0').filter(f=>/^release-notes\/[a-z0-9-]+\.json$/.test(f));
if(!noteFiles.length){console.log('No approved customer release notes');process.exit(0);}
if(noteFiles.length){notes={es:[],en:[]};for(const f of noteFiles){const n=JSON.parse(git('show',sha+':'+f));if(n.audience!=='customer')continue;for(const l of ['es','en']){if(!Array.isArray(n[l])||!n[l].length||n[l].some(s=>typeof s!=='string'||s.length>400))throw Error('Invalid bilingual release note');notes[l].push(...n[l]);}}if(notes.es.length>12||notes.en.length>12)throw Error('Too many release notes');}
if(!notes?.es.length||!notes?.en.length){console.log('No customer-facing notes');process.exit(0);}
const tokenUrl=new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);tokenUrl.searchParams.set('audience',endpoint);
const id=await fetch(tokenUrl,{headers:{Authorization:'Bearer '+process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}});if(!id.ok)throw Error('GitHub OIDC HTTP '+id.status);
const token=(await id.json()).value;
const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({audience:'customer',sha,important,areas:['interface'],date:new Date(git('show','-s','--format=%cI',sha).trim()).toISOString(),...(notes?{notes}:{})})});
if(!response.ok)throw Error('Changelog ingestion HTTP '+response.status);
console.log('Changelog published');
