#!/usr/bin/env node
// 프레임 비용 측정(render 모드). 슬라이드마다 들어오는 전환 시작(g0)부터 끝 멈춤까지 촘촘히 탐색하며 잰다.
//   엔진 JS   __seek 한 번의 JS 시간에서 슬라이드 render·배경 render를 뺀 값(window.__perf.engine). 기준 8ms 미만
//   render    슬라이드 render 함수 합계(window.__perf.render)
//   bg        배경 층 render(window.__perf.bg)
//   프레임    탐색 + 스타일·레이아웃·페인트까지(다음 rAF) 걸린 시간
//   node tools/perf.mjs [--page demo.html] [--files slides/a.js] [--samples 24] [--out qa/perf.json]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, args, launch, serve, watchErrors, nn } from './lib.mjs';

const opt = args();
const S = await serve(opt);
const browser = await launch(['--enable-gpu-rasterization', '--ignore-gpu-blocklist']);
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
const errs = [];
watchErrors(page, errs);
await page.goto(S.url('render=1'), { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
const N = Number(opt.samples || 24);
const res = await page.evaluate(async N => {
  const out = [];
  const raf = () => new Promise(r => requestAnimationFrame(() => r()));
  const sl = window.__meta.slides;
  // 1회차: 탑재(setup)와 이미지 로드를 끝내 둔다
  for (const s of sl) { const end = s.holds[s.holds.length - 1] + 1.5; for (let i = 0; i < N; i++) await Promise.resolve(window.__seek(s.g0 + (end - s.g0) * (i / (N - 1)))); }
  for (const s of sl) {
    const end = s.holds[s.holds.length - 1] + 1.5;
    const r = { n: s.n, id: s.id, enter: s.enter, inner: s.inner, eng: [], ren: [], bg: [], fr: [], engT: [] };
    for (let i = 0; i < N; i++) {
      const g = s.g0 + (end - s.g0) * (i / (N - 1));
      const t0 = performance.now(); const p = window.__seek(g); if (p && p.then) await p; const t1 = performance.now();
      document.body.offsetHeight; await raf(); const t2 = performance.now();
      const pf = window.__perf;
      r.eng.push(pf.engine); r.ren.push(pf.render); r.bg.push(pf.bg); r.fr.push(t2 - t0);
      if (s.trans > 0 && g < s.g0 + s.trans) r.engT.push(pf.engine);
    }
    out.push(r);
  }
  return out;
}, N);
const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0), mx = a => (a.length ? Math.max(...a) : 0);
const rows = res.map(r => ({ n: r.n, id: r.id, enter: r.enter, inner: r.inner, engAvg: avg(r.eng), engMax: mx(r.eng), engTransMax: mx(r.engT), renAvg: avg(r.ren), renMax: mx(r.ren), bgMax: mx(r.bg), frAvg: avg(r.fr), frMax: mx(r.fr) }));
console.log('번호 id                   enter        | 엔진 JS 평균/최대(전환 중 최대) | render 평균/최대 | bg 최대 | 프레임 평균/최대 (ms)');
for (const r of rows) console.log(`${nn(r.n)} ${r.id.padEnd(20)} ${String(r.enter).padEnd(12)} | ${r.engAvg.toFixed(2).padStart(5)} / ${r.engMax.toFixed(2).padStart(5)} (${r.engTransMax.toFixed(2).padStart(5)}) | ${r.renAvg.toFixed(2).padStart(5)} / ${r.renMax.toFixed(2).padStart(5)} | ${r.bgMax.toFixed(2).padStart(5)} | ${r.frAvg.toFixed(1).padStart(5)} / ${r.frMax.toFixed(1).padStart(5)}${r.engMax >= 8 ? '  ← 엔진 8ms 넘음' : ''}${r.renMax > 8 ? '  ← render 무거움' : ''}`);
const engMax = Math.max(...rows.map(r => r.engMax));
console.log(`엔진 JS 최대 ${engMax.toFixed(2)}ms (기준 8ms 미만: ${engMax < 8 ? '통과' : '넘음'})`);
const outFile = path.resolve(ROOT, opt.out || 'qa/perf.json');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ page: S.page, files: S.only, samples: N, engMax, rows }, null, 1));
console.log('저장:', path.relative(ROOT, outFile));
await browser.close(); S.server.close();
if (errs.length) { console.error(`페이지 오류 ${errs.length}건`); process.exit(2); }
