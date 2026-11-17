#!/usr/bin/env node
// 덱 스틸 촬영기 — render 모드 규약(?render=1, __ready, __seek, __meta)으로 덱을 열어 찍는다.
//
//   node tools/shoot.mjs --thumbs                         슬라이드마다 마지막 빌드 상태 → <__meta.thumbs>/NN.jpg(기본 thumbs/, 640×360)
//   node tools/shoot.mjs --holds [--slides 3,4] [--tag c03] 빌드(멈춤)마다 한 장 → qa/holds[_tag]/NN_id_k.jpg
//   node tools/shoot.mjs --trans                          슬라이드 경계마다 전환 진행률 15·35·50·65·85% → qa/trans[_tag]/NNtoMM_enter_PP.jpg
//   node tools/shoot.mjs --back 26,38                     ← 키로 26→25, 38→37 돌아가는 전환을 진행률 15·35·50·65·85%로 → qa/back[_tag]/NNtoMM_back_PP.jpg
//                                                         (평면 밀기 경계는 반대 방향 밀기, cut·영상 경계는 바로 바뀜. --fracs로 진행률을 바꾼다)
//   node tools/shoot.mjs --strip 5 --every 0.2            슬라이드 5의 들어오는 전환부터 끝 멈춤까지 간격마다 → qa/strip[_tag]_05/
//   node tools/shoot.mjs --at 5:2.4,7:0.8                 슬라이드:그 슬라이드 g0 뒤 초 → qa/at[_tag]/
//   node tools/shoot.mjs --settle                         빌드 멈춤 직전·직후 → qa/settle/
//   node tools/shoot.mjs --determinism                    같은 g를 순서를 바꿔 두 번 찍어 바이트 비교(결정성)
//   node tools/shoot.mjs --meta | --notes                 qa/meta.json | qa/notes.json(덱 전체일 때만 이 이름)
//                                                         --outdir가 있으면 <outdir>/meta.json·notes.json. --files(장 파일만)이면 qa/meta_<tag>.json
//                                                         (tag = --tag 또는 장 파일 이름, 예: qa/meta_c00_open.json). 덱 전체 qa/meta.json을 덮어쓰지 않는다.
//                                                         --page가 index.html이 아니면 qa/meta_<페이지 이름>.json. --metafile <경로>로 직접 정할 수도 있다
// 공통: [--page demo.html] [--files slides/c03_x.js,…](그 장 파일만 불러옴) [--scale 0.5] [--outdir qa/engine/holds](결과 폴더를 직접 지정)
// 페이지 오류가 있으면 종료 코드 2.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, args, launch, serve, watchErrors, nn, writeFiles } from './lib.mjs';

const opt = args();
const S = await serve(opt);
const scale = Number(opt.scale || (opt.thumbs ? 1 / 3 : 0.5));
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
const page = await ctx.newPage();
const errors = [];
watchErrors(page, errors);
await page.goto(S.url('render=1&hold=1.2&finalhold=1.6'), { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
const meta = await page.evaluate(() => window.__meta);
const tag = opt.tag ? `_${opt.tag}` : '';
const pick = opt.slides ? new Set(opt.slides.split(',').map(Number)) : null;
const slides = meta.slides.filter(s => !pick || pick.has(s.n));
const outDir = def => path.resolve(ROOT, opt.outdir || def);
async function seek(g) {
  await page.evaluate(t => Promise.resolve(window.__seek(t)), g);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}
async function shot(g, file, type = 'jpeg') {
  await seek(g);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return page.screenshot({ path: file, type, ...(type === 'jpeg' ? { quality: 88 } : {}), clip: { x: 0, y: 0, width: 1920, height: 1080 } });
}
console.log(`페이지 ${S.only ? '_only.html(' + S.only.join(',') + ')' : S.page} · 슬라이드 ${meta.slides.length}장 · 한 줄 길이 ${meta.duration.toFixed(1)}초 · 폰트 ${meta.fonts.length}종`);

if (opt.thumbs) {
  if (S.only) console.log('--files 와 --thumbs 는 함께 쓰지 않는다(번호가 덱 전체와 달라짐). 건너뜀');
  else {
    const dir = path.join(ROOT, meta.thumbs || 'thumbs');
    for (const s of slides) await shot(s.holds[s.holds.length - 1] + 0.8, path.join(dir, `${nn(s.n)}.jpg`));
    console.log(`thumbs 저장: ${slides.length}장 → ${path.relative(ROOT, dir)}/ · deck/files.json 파일 ${writeFiles()}개`);
  }
}
if (opt.holds) {
  const dir = outDir(`qa/holds${tag}`);
  if (!opt.slides) fs.rmSync(dir, { recursive: true, force: true });
  for (const s of slides) for (let k = 0; k < s.holds.length; k++) await shot(s.holds[k] + 0.6, path.join(dir, `${nn(s.n)}_${s.id}_${k + 1}.jpg`));
  console.log('holds 저장:', path.relative(ROOT, dir));
}
if (opt.trans) {
  const dir = outDir(`qa/trans${tag}`);
  fs.rmSync(dir, { recursive: true, force: true });
  let n = 0;
  for (const s of slides) {
    if (s.n === 1 || !(s.trans > 0)) continue;
    for (const f of (opt.fracs ? opt.fracs.split(',').map(Number) : [0.15, 0.35, 0.5, 0.65, 0.85])) { await shot(s.g0 + s.trans * f, path.join(dir, `${nn(s.n - 1)}to${nn(s.n)}_${s.enter}_${String(Math.round(f * 100)).padStart(2, '0')}.jpg`)); n++; }
  }
  console.log(`trans 저장: ${n}장 →`, path.relative(ROOT, dir));
}
if (opt.back) {
  const dir = outDir(`qa/back${tag}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const m of opt.back.split(',').map(Number).filter(x => x > 1)) {
    for (const f of (opt.fracs ? opt.fracs.split(',').map(Number) : [0.15, 0.35, 0.5, 0.65, 0.85])) {
      await page.evaluate(([a, b]) => Promise.resolve(window.__seekBack(a, b)), [m, f]);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      await page.screenshot({ path: path.join(dir, `${nn(m)}to${nn(m - 1)}_back_${String(Math.round(f * 100)).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
      n++;
    }
  }
  console.log(`back 저장: ${n}장 →`, path.relative(ROOT, dir));
}
if (opt.strip) {
  const s = meta.slides.find(x => x.n === Number(opt.strip)), every = Number(opt.every || 0.2);
  const end = s.holds[s.holds.length - 1] + 1.6 + 0.6;
  const dir = outDir(`qa/strip${tag}_${nn(s.n)}`);
  fs.rmSync(dir, { recursive: true, force: true });
  let k = 0;
  for (let g = s.g0; g <= end; g += every) await shot(g, path.join(dir, `${String(k++).padStart(3, '0')}_${(g - s.g0).toFixed(2)}.jpg`));
  console.log('strip 저장:', path.relative(ROOT, dir), k);
}
if (opt.cuts) {
  const dir = outDir(`qa/cuts${tag}`); fs.rmSync(dir, { recursive: true, force: true });
  for (let i = 1; i < meta.slides.length; i++) {
    const s = meta.slides[i];
    for (const d of [0.1, 0.25, 0.45]) await shot(s.g0 + d, path.join(dir, `${nn(s.n - 1)}to${nn(s.n)}_${d.toFixed(2)}.jpg`));
  }
  console.log('cuts 저장:', path.relative(ROOT, dir));
}
if (opt.settle) {
  const dir = outDir('qa/settle'); fs.rmSync(dir, { recursive: true, force: true });
  for (const s of slides) for (let k = 0; k < s.holds.length; k++) {
    await shot(s.holds[k] - 0.06, path.join(dir, `${nn(s.n)}_${s.id}_${k + 1}_a.jpg`));
    await shot(s.holds[k] + 0.001, path.join(dir, `${nn(s.n)}_${s.id}_${k + 1}_b.jpg`));
  }
  console.log('settle 저장:', path.relative(ROOT, dir));
}
if (opt.at) {
  for (const pair of opt.at.split(',')) {
    const [n, lt] = pair.split(':').map(Number), s = meta.slides.find(x => x.n === n);
    await shot(s.g0 + lt, path.join(outDir(`qa/at${tag}`), `${nn(n)}_${lt.toFixed(2)}.jpg`));
  }
}
if (opt.determinism) {
  // 시각 목록: 슬라이드마다 전환 중간, 첫 멈춤, 끝 멈춤. 1차는 앞에서부터, 2차는 뒤에서부터 찍어 탐색 이력을 바꾼다
  const ts = [];
  for (const s of slides) { if (s.trans > 0) ts.push(s.g0 + s.trans * 0.5); ts.push(s.holds[0] + 0.3, s.holds[s.holds.length - 1] + 0.9); }
  const a = [], b = [];
  for (const g of ts) a.push(await shot(g, path.join(ROOT, 'qa/_det/a.png'), 'png'));
  for (const g of [...ts].reverse()) b.unshift(await shot(g, path.join(ROOT, 'qa/_det/b.png'), 'png'));
  fs.rmSync(path.join(ROOT, 'qa/_det'), { recursive: true, force: true });
  // 바이트가 다르면 화소 차이를 잰다. 채널 값 차이가 2 이하이거나, 2를 넘는 채널 값이 30개 미만이면 래스터 잡음(가장자리 반올림)으로 센다
  const pxDiff = (x, y) => page.evaluate(async ([sa, sb]) => {
    const load = src => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = src; });
    const [A, B] = await Promise.all([load(sa), load(sb)]);
    const c = document.createElement('canvas'); c.width = A.width; c.height = A.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data;
    g.clearRect(0, 0, c.width, c.height); g.drawImage(B, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
    let mx = 0, n = 0;
    for (let i = 0; i < da.length; i++) { const d = Math.abs(da[i] - db[i]); if (d > mx) mx = d; if (d > 2) n++; }
    return { mx, n };
  }, ['data:image/png;base64,' + x.toString('base64'), 'data:image/png;base64,' + y.toString('base64')]);
  const rows = [];
  for (let i = 0; i < ts.length; i++) rows.push(a[i].equals(b[i]) ? { g: ts[i], mx: 0, n: 0, same: 'byte' } : { g: ts[i], ...(await pxDiff(a[i], b[i])) });
  const isNoise = r => r.mx <= 2 || r.n < 30;
  const noise = rows.filter(r => !r.same && isNoise(r)), bad = rows.filter(r => !r.same && !isNoise(r));
  console.log(`결정성: ${ts.length}개 시각 중 바이트 같음 ${rows.length - noise.length - bad.length} · 래스터 잡음 ${noise.length}${noise.length ? `(최대 채널 차 ${Math.max(...noise.map(r => r.mx))})` : ''} · 다름 ${bad.length}${bad.length ? ' → ' + bad.map(r => `${r.g.toFixed(2)}(최대 ${r.mx}, ${r.n}화소)`).join(', ') : ''}`);
  if (opt.out) fs.writeFileSync(path.resolve(ROOT, opt.out), JSON.stringify({ times: ts, rows }, null, 1));
}
// --meta·--notes 저장 위치: --outdir > --files(장 파일만: 이름에 tag를 붙임) > qa/ (덱 전체).
// 장 하나만 불러온 메타로 덱 전체 qa/meta.json을 덮어쓰는 일이 검수 중 여러 번 있었다(4차에서 고침)
function infoFile(base) {
  if (base === 'meta' && opt.metafile) return path.resolve(ROOT, opt.metafile);        // tools/sheets.sh가 쓴다
  if (opt.outdir) return path.join(outDir('.'), `${base}.json`);
  if (S.only || opt.page && opt.page !== 'index.html') {
    const t = opt.tag || (S.only ? S.only.map(f => path.basename(f, '.js')).join('+') : path.basename(String(opt.page).split('?')[0], '.html'));
    return path.join(ROOT, 'qa', `${base}_${t}.json`);
  }
  return path.join(ROOT, 'qa', `${base}.json`);
}
if (opt.meta) {
  const f = infoFile('meta');
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(meta, null, 1));
  console.log('meta 저장:', path.relative(ROOT, f), `(${meta.slides.length}장)`);
}
if (opt.notes) {
  const notes = meta.slides.map(s => ({ n: s.n, id: s.id, title: s.title, section: s.section, builds: s.builds, notes: s.notes || '' }));
  const f = infoFile('notes');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(notes, null, 1));
  console.log('notes 저장:', path.relative(ROOT, f), notes.length);
}
await browser.close(); S.server.close();
if (errors.length) { console.error(`페이지 오류 ${errors.length}건`); process.exit(2); }
