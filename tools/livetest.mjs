#!/usr/bin/env node
// 발표 모드 점검: 실제 키 입력으로 넘기며 전환 중간·멈춤 상태를 찍고, 전환 구간 프레임 간격과 엔진 JS 시간을 재고,
// 발표자 창(P)·개관 화면(O)·도움말(H)을 찍고, 여러 바퀴 넘긴 뒤 JS 힙 크기를 비교한다.
//   node tools/livetest.mjs [--page demo.html] [--files slides/c03_x.js] [--steps 20] [--loops 3] [--back 8] [--outdir qa/live] [--headed]
//   --page    index.html#24 처럼 #번호를 붙이면 그 슬라이드에서 시작한다
//   --steps   키 입력 수(기본: 전체 빌드 수만큼 → 끝까지)
//   --back    앞으로 넘긴 뒤 ← 키를 이만큼 눌러 뒤로 가는 전환(평면 밀기 반대 방향)도 같은 방법으로 잰다(기본 0)
//   --loops   처음부터 끝까지 넘기기를 몇 바퀴 할지(메모리 점검, 기본 1). 바퀴마다 GC 뒤 힙 크기를 적는다
//   --headed  창을 띄워 실제 GPU로 잰다(헤드리스는 GPU가 없어 프레임 간격이 참고값이다)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, args, launch, serve, watchErrors, nn } from './lib.mjs';

const opt = args();
const S = await serve(opt);
const out = path.resolve(ROOT, opt.outdir || 'qa/live');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const browser = await launch([], opt.headed !== 'true');
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = [];
watchErrors(page, errs);
await page.goto(S.url(), { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
// 빌드 재생이 끝날 때까지 기다린다(재생 중 키 입력은 넘기지 않고 빠르게 감기만 하므로)
const settled = () => page.waitForFunction(() => { const L = window.__live, sl = window.DECK.slides[L.cur]; const st = [...(sl.holds || []), sl.dur]; return !L.trans && L.wait <= 0 && L.t >= st[L.k] - 0.02; }, null, { timeout: 120000 }).catch(() => null);
await settled();
await page.waitForTimeout(300);
const cdp = await ctx.newCDPSession(page);
await cdp.send('Performance.enable');
const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); const m = await cdp.send('Performance.getMetrics'); return (m.metrics.find(x => x.name === 'JSHeapUsedSize') || {}).value / 1048576; };
const meta = await page.evaluate(() => window.__meta);
const totalBuilds = meta.slides.reduce((a, s) => a + s.builds, 0);
await page.screenshot({ path: path.join(out, '00_start.jpg'), type: 'jpeg', quality: 80 });

// 프레임 기록기: rAF 간격과 엔진이 남긴 __perf(엔진 JS·render)를 모은다
await page.evaluate(() => {
  window.__rec = { on: false, gaps: [], eng: [], ren: [] };
  let last = 0;
  const f = t => { const R = window.__rec; if (R.on) { if (last) R.gaps.push(t - last); R.eng.push(window.__perf.engine); R.ren.push(window.__perf.render); } last = t; requestAnimationFrame(f); };
  requestAnimationFrame(f);
});
const stat = a => { if (!a.length) return { n: 0 }; const s = [...a].sort((x, y) => x - y); const q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))]; return { n: a.length, p50: q(0.5), p95: q(0.95), max: s[s.length - 1], avg: a.reduce((x, y) => x + y, 0) / a.length }; };
const transRec = [];
const steps = Number(opt.steps || totalBuilds - 1);
async function press(i, shotIt, loop = 0, key = 'ArrowRight') {
  const before = await page.evaluate(() => ({ cur: window.__live.cur, k: window.__live.k }));
  await page.evaluate(() => { const R = window.__rec; R.gaps = []; R.eng = []; R.ren = []; R.on = true; });
  await page.keyboard.press(key);
  const info = await page.evaluate(() => ({ cur: window.__live.cur, trans: window.__live.trans ? { type: window.__live.trans.type, dur: window.__live.trans.dur, dir: window.__live.trans.dir || 1 } : null }));
  const tag = info.trans ? `${info.trans.type}${info.trans.dir < 0 ? '_back' : ''}` : '';
  if (info.trans && shotIt) { await page.waitForTimeout(Math.max(80, info.trans.dur * 450)); await page.screenshot({ path: path.join(out, `${key === 'ArrowLeft' ? 'b' : ''}${nn(i)}_a_mid_${tag}.jpg`), type: 'jpeg', quality: 75 }); }
  const wait = info.trans ? info.trans.dur * 1000 + 250 : 300;
  await page.waitForTimeout(shotIt && info.trans ? Math.max(0, wait - info.trans.dur * 450) : wait);
  const rec = await page.evaluate(() => { const R = window.__rec; R.on = false; return { gaps: R.gaps, eng: R.eng, ren: R.ren }; });
  if (info.trans) transRec.push({ loop, from: before.cur + 1, to: info.cur + 1, type: tag, gap: stat(rec.gaps), jank: rec.gaps.filter(g => g > 25).length, eng: stat(rec.eng), ren: stat(rec.ren) });
  // 빌드 재생이 끝날 때까지 기다린 뒤 멈춤 상태를 찍는다
  await settled();
  await page.waitForTimeout(250);
  if (shotIt) { const h = await page.evaluate(() => location.hash); await page.screenshot({ path: path.join(out, `${key === 'ArrowLeft' ? 'b' : ''}${nn(i)}_b_${h.replace('#', '')}.jpg`), type: 'jpeg', quality: 75 }); }
}
const heaps = [await heap()];
const loops = Number(opt.loops || 1);
for (let L = 0; L < loops; L++) {
  if (L > 0) { await page.keyboard.press('Home'); await settled(); await page.waitForTimeout(300); }
  for (let i = 1; i <= steps; i++) await press(i, L === 0, L);
  heaps.push(await heap());
}
// 뒤로 가는 전환(← 키). 빌드가 여럿인 슬라이드는 빌드부터 되돌리므로 키 수 = 되돌린 빌드 + 슬라이드
for (let i = 1; i <= Number(opt.back || 0); i++) await press(i, true, 'back', 'ArrowLeft');
console.log('전환 구간(헤드리스면 참고값): 프레임 간격 ms p50/p95/최대 · 끊김(>25ms) · 엔진 JS ms 평균/최대 · render JS ms 최대');
for (const r of transRec.filter(r => r.loop === 0 || r.loop === 'back')) {
  console.log(`  ${nn(r.from)}→${nn(r.to)} ${r.type.padEnd(12)} 간격 ${r.gap.p50?.toFixed(1)}/${r.gap.p95?.toFixed(1)}/${r.gap.max?.toFixed(1)} · 끊김 ${r.jank} · 엔진 ${r.eng.avg?.toFixed(2)}/${r.eng.max?.toFixed(2)} · render ${r.ren.max?.toFixed(2)}`);
}
const allGaps = transRec.flatMap(r => r.gap.n ? [r.gap.max] : []);
const allEng = transRec.flatMap(r => r.eng.n ? [r.eng.max] : []);
console.log(`엔진 JS 최대 ${Math.max(0, ...allEng).toFixed(2)}ms · 전환 프레임 간격 최대 ${Math.max(0, ...allGaps).toFixed(1)}ms`);
console.log(`JS 힙(MB, GC 뒤): ${heaps.map(x => x.toFixed(1)).join(' → ')}`);
// 뒤로 두 번
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400);
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400);
console.log('뒤로 두 번 뒤 위치:', await page.evaluate(() => location.hash));
// 발표자 창
const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null), page.keyboard.press('p')]);
if (popup) {
  await popup.setViewportSize({ width: 1400, height: 900 });
  await popup.waitForTimeout(1200);
  await popup.screenshot({ path: path.join(out, 'presenter.jpg'), type: 'jpeg', quality: 80 });
  await popup.keyboard.press('ArrowRight'); await popup.waitForTimeout(1500);
  console.log('발표자 창에서 넘긴 뒤 위치:', await page.evaluate(() => location.hash));
  await popup.screenshot({ path: path.join(out, 'presenter_2.jpg'), type: 'jpeg', quality: 80 });
} else console.log('발표자 창이 열리지 않음');
// 개관 화면·도움말
await page.bringToFront();
await page.keyboard.press('o'); await page.waitForTimeout(1300);
await page.screenshot({ path: path.join(out, 'overview.jpg'), type: 'jpeg', quality: 80 });
await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
await page.screenshot({ path: path.join(out, 'overview_sel.jpg'), type: 'jpeg', quality: 80 });
await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
console.log('개관 화면에서 고른 뒤 위치:', await page.evaluate(() => location.hash));
await page.screenshot({ path: path.join(out, 'overview_landed.jpg'), type: 'jpeg', quality: 80 });
await page.keyboard.press('h'); await page.waitForTimeout(300);
await page.screenshot({ path: path.join(out, 'help.jpg'), type: 'jpeg', quality: 75 });
fs.writeFileSync(path.join(out, 'live.json'), JSON.stringify({ transitions: transRec, heapMB: heaps }, null, 1));
await browser.close(); S.server.close();
console.log('저장:', path.relative(ROOT, out), errs.length ? `페이지 오류 ${errs.length}건` : '페이지 오류 없음');
if (errs.length) process.exit(2);
