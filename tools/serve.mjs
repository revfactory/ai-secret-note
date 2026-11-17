#!/usr/bin/env node
// 발표용 로컬 서버. start.command가 node가 있으면 이 서버로 덱을 연다.
// python3 -m http.server는 부분 요청(Range)에 답하지 않아, 영상 슬라이드로 돌아가 끝 프레임을 보이거나 탐색할 때
// 크롬이 원하는 시각으로 옮기지 못할 수 있다. 검수·촬영 도구(tools/lib.mjs)와 같은 방식으로 206을 돌려준다.
//   node tools/serve.mjs [포트(기본 8765)]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2]) || 8765;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.flac': 'audio/flac', '.m4a': 'audio/mp4',
};

const server = http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end(); }
  if (p === '/favicon.ico') { res.writeHead(204); return res.end(); }
  const f = path.join(ROOT, p.endsWith('/') ? p + 'index.html' : p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
  const size = fs.statSync(f).size, type = MIME[path.extname(f).toLowerCase()] || 'application/octet-stream';
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (m && (m[1] || m[2])) {
    let start, end;
    if (m[1]) { start = Number(m[1]); end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1; }
    else { start = Math.max(0, size - Number(m[2])); end = size - 1; }        // bytes=-N: 끝에서 N바이트
    if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); return res.end(); }
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(f, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(f).pipe(res);
});
server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? `포트 ${PORT}을 이미 쓰고 있습니다` : e.message); process.exit(1); });
server.listen(PORT, '127.0.0.1', () => console.log(`http://127.0.0.1:${PORT}/`));
