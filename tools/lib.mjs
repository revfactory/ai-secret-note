// 도구 공용: 인자 읽기, playwright-core 찾기, 크롬 실행, 덱 정적 서버(--page·--files), deck/files.json 갱신
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function args(argv = process.argv.slice(2)) {
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]; if (!k.startsWith('--')) continue;
    const v = argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    opt[k.slice(2)] = v;
  }
  return opt;
}

// showreel 스킬이 설치한 playwright-core를 쓴다(사용자 홈 기준 경로)
export function chromium() {
  const anchor = path.join(os.homedir(), '.claude/skills/showreel/scripts/render.mjs');
  try { return createRequire(anchor)('playwright-core').chromium; }
  catch (e) {
    console.error(`playwright-core를 찾지 못했습니다: ${anchor} 옆 node_modules\n한 번만: cd ${path.dirname(anchor)} && npm install`);
    process.exit(1);
  }
}
export async function launch(extra = [], headless = true) {
  const pw = chromium();
  const a = ['--force-color-profile=srgb', '--hide-scrollbars', '--font-render-hinting=none', '--disable-lcd-text', '--autoplay-policy=no-user-gesture-required', ...extra];
  let last;
  for (const t of [{ channel: 'chrome' }, { channel: 'chromium' }, {}]) {
    try { return await pw.launch({ headless, args: a, ...t }); } catch (e) { last = e; }
  }
  throw last;
}

// deck/files.json: assets/·thumbs/·audio/ 아래 파일 목록. 엔진은 이 목록에 없는 파일을 요청하지 않는다(404 방지)
export function writeFiles(root = ROOT) {
  const out = [];
  const walk = (rel) => {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) return;
    for (const n of fs.readdirSync(abs).sort()) {
      if (n.startsWith('.')) continue;
      const r = rel + '/' + n, st = fs.statSync(path.join(root, r));
      if (st.isDirectory()) walk(r); else out.push(r);
    }
  };
  for (const d of ['assets', 'thumbs', 'audio']) walk(d);
  const body = JSON.stringify({ note: 'tools/files.mjs가 만든다. 직접 고치지 않는다', files: out }, null, 0) + '\n';
  const file = path.join(root, 'deck/files.json');
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === body) return out.length;
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, body);
  fs.renameSync(tmp, file);          // 여러 도구가 동시에 돌아도 반쯤 쓴 파일을 읽지 않게
  return out.length;
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.json': 'application/json' };

// --page(기본 index.html), --files slides/a.js,slides/b.js(그 장 파일만 불러오는 _only.html)
export async function serve(opt = {}) {
  const page = opt.page || 'index.html';
  const only = opt.files ? opt.files.split(',').map(x => x.trim()).filter(Boolean) : null;
  let onlyHtml = null;
  if (only) {
    const src = fs.readFileSync(path.join(ROOT, page.split('?')[0]), 'utf8');
    onlyHtml = src.replace(/<script src="slides\/[^"]+"><\/script>\s*/g, '').replace('</body>', only.map(f => `<script src="${f}"></script>\n`).join('') + '</body>');
  }
  writeFiles();
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/favicon.ico') { res.writeHead(204); return res.end(); }
    if (p === '/_only.html' && onlyHtml) { res.writeHead(200, { 'Content-Type': MIME['.html'] }); return res.end(onlyHtml); }
    const f = path.join(ROOT, p === '/' ? '/' + page : p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
    const st = fs.statSync(f), type = MIME[path.extname(f).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {          // 영상 탐색(seek)용
      const [a, b] = range.replace('bytes=', '').split('-');
      const start = Number(a), end = b ? Number(b) : st.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return fs.createReadStream(f, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const pagePath = only ? '_only.html' : page.split('?')[0];
  const extra = page.includes('?') ? page.split('?')[1] : '';
  const url = (q = '') => `${base}${pagePath}${q || extra ? '?' : ''}${[extra, q].filter(Boolean).join('&')}`;
  return { server, base, url, page, only };
}

export function watchErrors(page, errors, tag = '') {
  page.on('pageerror', e => { errors.push(String(e)); console.error(`[pageerror]${tag}`, String(e)); });
  page.on('console', m => {
    const t = m.text();
    if (m.type() === 'error' && !t.startsWith('Failed to load resource')) { errors.push('[console] ' + t); console.error(`[console]${tag}`, t); }
    else if (m.type() === 'warning' && t.startsWith('[DECK]')) console.error(`[경고]${tag}`, t);
  });
  page.on('response', r => { if (r.status() >= 400) { const u = new URL(r.url()); if (u.pathname !== '/favicon.ico') { errors.push(`자원 없음 ${r.status()}: ${decodeURIComponent(u.pathname)}`); console.error('[404]', decodeURIComponent(u.pathname)); } } });
}
export const nn = n => String(n).padStart(2, '0');
