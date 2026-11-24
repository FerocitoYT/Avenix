import { execFileSync } from 'node:child_process';

const webhook = process.env.DISCORD_CHANGELOG_WEBHOOK;
if (!webhook) {
  console.error('Falta DISCORD_CHANGELOG_WEBHOOK. La notificación NO se ha enviado.');
  process.exit(1);
}

const repo = process.env.GITHUB_REPOSITORY || 'FerocitoYT/Avenix';
const server = process.env.GITHUB_SERVER_URL || 'https://github.com';
const sha = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
let before = process.env.GITHUB_EVENT_BEFORE || '';
if (!before || /^0+$/.test(before)) {
  before = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim();
}

const changed = execFileSync('git', ['diff', '--name-only', '-z', before, sha], {
  encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
}).split('\0').filter(Boolean);

const relevant = file => /^(app\/|components\/|lib\/|prisma\/|public\/|middleware\.|next\.config|package(-lock)?\.json$)/.test(file);
const privateFile = file => /(^|\/)(\.env(?:\.|$)|secrets?\b|credentials?\b|.*\.(?:pem|key|p12|pfx)$)/i.test(file);
const files = changed.filter(file => relevant(file) && !privateFile(file));

if (!files.length) {
  console.log('No hay modificaciones de Axyon Control que notificar.');
  process.exit(0);
}

const areas = [
  [/^app\/api\//, 'API y backend'],
  [/^app\/dashboard\//, 'Panel de cliente'],
  [/^app\/admin\//, 'Panel de administración'],
  [/^app\//, 'Aplicación web'],
  [/^components\//, 'Componentes de interfaz'],
  [/^lib\//, 'Lógica compartida'],
  [/^prisma\//, 'Base de datos'],
  [/^public\//, 'Recursos públicos'],
  [/^middleware\./, 'Seguridad y middleware'],
  [/^next\.config/, 'Configuración de Next.js'],
  [/^package(-lock)?\.json$/, 'Dependencias'],
];

const touched = [...new Set(files.map(file =>
  areas.find(([pattern]) => pattern.test(file))?.[1] ?? 'Otros cambios de la web'
))];

const subjectOutput = execFileSync('git', [
  'log', '--format=%s', '--no-merges', '-n', '30', `${before}..${sha}`, '--', ...files,
], { encoding: 'utf8', maxBuffer: 256 * 1024 });

const sensitiveSubject = /token|secret|password|passwd|credential|bearer|webhook.{0,20}https?:|database.?url|private.?key|api.?key/i;
const descriptions = [...new Set(subjectOutput.split('\n')
  .map(subject => subject.replace(/[\u0000-\u001f\u007f]/g, ' ').trim())
  .filter(Boolean)
  .map(subject => sensitiveSubject.test(subject)
    ? 'Se actualizaron componentes internos de seguridad y configuración.'
    : subject.replace(/@/g, '＠').slice(0, 180)))].slice(0, 8);

const summary = descriptions.length
  ? descriptions.map(message => `• ${message}`).join('\n')
  : 'Se han actualizado componentes internos de Axyon Control.';

const payload = JSON.stringify({
  username: 'Axyon Control · GitHub',
  allowed_mentions: { parse: [] },
  embeds: [{
    title: '🌐 Novedades de Axyon Control',
    description: `**Resumen de cambios**\n${summary}\n\n[Consultar cambios en GitHub](${server}/${repo}/compare/${before.slice(0,12)}...${sha.slice(0,12)})`,
    color: 0x3b82f6,
    fields: [
      { name: 'Áreas actualizadas', value: touched.slice(0, 12).map(area => `• ${area}`).join('\n').slice(0, 1000) },
      { name: 'Archivos relevantes', value: String(files.length), inline: true },
    ],
    footer: { text: `Axyon Control · main · ${sha.slice(0,7)}` },
    timestamp: new Date().toISOString(),
  }],
  components: [{
    type: 1,
    components: [{
      type: 2,
      style: 5,
      label: 'Ver Cambios',
      emoji: { name: '🔎' },
      url: `${server}/${repo}/compare/${before.slice(0,12)}...${sha.slice(0,12)}`,
    }],
  }],
});

let delivered = false;
for (let attempt = 0; attempt < 5; attempt++) {
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
  });
  if (response.ok) { delivered = true; break; }
  if (response.status === 429) {
    const retry = Number(response.headers.get('retry-after')) || 2;
    await new Promise(resolve => setTimeout(resolve, Math.min(15000, Math.max(1000, retry * 1000))));
    continue;
  }
  throw new Error(`Discord rechazó la notificación (HTTP ${response.status})`);
}
if (!delivered) throw new Error('Discord limitó repetidamente las notificaciones');
console.log(`Notificación enviada: ${files.length} archivos modificados.`);
