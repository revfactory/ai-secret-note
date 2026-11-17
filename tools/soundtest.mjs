#!/usr/bin/env node
// 발표 모드 소리 점검: 실제 키 입력으로 덱을 넘기며
//   1) 어떤 소리가 어느 슬라이드·빌드에서 났는지(window.__sndLog),
//   2) 덱이 실제로 낸 소리(엔진 master 출력을 AudioWorklet로 녹음 → WAV),
//   3) 키를 누른 시각, 확인 표시(.ftree .fk)·밑줄(.ftree .mk)이 그려지기 시작한 시각
// 을 같은 시계(performance.now, AudioContext 시각)로 기록한다. 소리 자체는 듣지 않는다(분석은 video/deck_sound/analyze_soundtest.py).
//   node tools/soundtest.mjs [--from 1] [--to 102] [--settle 0.25] [--standby 8] [--out qa/sound]
//   node tools/soundtest.mjs --only 25,26,37 …   고른 슬라이드에만 앞 슬라이드에서 → 키로 들어간다(확인 표시·밑줄과 소리 시각 비교용)
//   순서: 1번에서 대기 음악 --standby초 → 끝까지 넘김(영상은 끝 프레임으로 건너뜀) → 빠르게 누르기 → ← 키 → M으로 끈 뒤 넘김 → 102번에서 대기 → 1번으로
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, args, launch, serve, watchErrors } from './lib.mjs';

const opt = args();
const outDir = path.resolve(ROOT, opt.out || 'qa/sound');
fs.mkdirSync(outDir, { recursive: true });
const S = await serve(opt);
const browser = await launch([], true);
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = [];
watchErrors(page, errs);

// 녹음: 16비트 스테레오 PCM을 그대로 파일에 이어 쓴다(첫 프레임 번호와 함께)
const rawPath = path.join(outDir, 'soundtest.pcm');
const raw = fs.openSync(rawPath, 'w');
const rec = { frames: 0, first: null, sr: 0, gaps: 0 };
await page.exposeFunction('__recPush', (b64, frame0, sr) => {
  const buf = Buffer.from(b64, 'base64');
  if (rec.first === null) { rec.first = frame0; rec.sr = sr; }
  const expect = rec.first + rec.frames;
  if (frame0 !== expect) rec.gaps++;
  fs.writeSync(raw, buf);
  rec.frames += buf.length / 4;
});

await page.addInitScript(() => {
  const AC = window.AudioContext;
  const worklet = `class R extends AudioWorkletProcessor{constructor(){super();this.b=[];this.n=0;this.f0=-1}
    process(inp){const i=inp[0];if(this.f0<0)this.f0=currentFrame;if(!i||!i.length){this.b.push(new Int16Array(256));this.n+=128;}else{const L=i[0],Rr=i[1]||i[0];
    const q=new Int16Array(L.length*2);for(let k=0;k<L.length;k++){q[2*k]=Math.max(-1,Math.min(1,L[k]))*32767;q[2*k+1]=Math.max(-1,Math.min(1,Rr[k]))*32767}
    this.b.push(q);this.n+=L.length;}if(this.n>=4800){const out=new Int16Array(this.n*2);let o=0;for(const c of this.b){out.set(c,o);o+=c.length}
    this.port.postMessage({f0:this.f0,pcm:out},[out.buffer]);this.b=[];this.n=0;this.f0=-1}return true}}
    registerProcessor('rec',R)`;
  window.__keys = []; window.__vis = []; window.__recState = 'none';
  class Wrapped extends AC {
    constructor(...a) {
      super(...a);
      window.__actx = this;
      const url = URL.createObjectURL(new Blob([worklet], { type: 'text/javascript' }));
      this.__recReady = this.audioWorklet.addModule(url).then(() => {
        const n = new AudioWorkletNode(this, 'rec', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
        const z = this.createGain(); z.gain.value = 0; z.__isZero = true; n.connect(z); z.connect(this.destination);
        let q = Promise.resolve();
        n.port.onmessage = e => {
          const u8 = new Uint8Array(e.data.pcm.buffer); let s = '';
          for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
          const b64 = btoa(s);
          q = q.then(() => window.__recPush(b64, e.data.f0, this.sampleRate));
        };
        this.__rec = n; window.__recState = 'ready';
        if (this.__pendingSrc) this.__pendingSrc.connect(n);
      });
    }
  }
  window.AudioContext = Wrapped; window.webkitAudioContext = Wrapped;
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = orig.call(this, dest, ...rest);
    if (dest instanceof AudioDestinationNode && !this.__isZero) {
      const c = this.context;
      if (c.__rec) orig.call(this, c.__rec); else if (!c.__pendingSrc && this.constructor.name === 'GainNode') c.__pendingSrc = this;
    }
    return r;
  };
  // 소리 기록: 엔진이 window.__sndLog.push([hash, 이름])를 부른다. 시각을 덧붙인다
  const log = []; log.push = function (x) { return Array.prototype.push.call(this, [...x, performance.now(), window.__actx ? window.__actx.currentTime : null]); };
  window.__sndLog = log;
  addEventListener('keydown', e => { window.__keys.push([e.key, performance.now(), location.hash, window.__live ? window.__live.cur : null]); }, true);
  // 확인 표시·밑줄이 그려지기 시작한 시각(슬라이드에 들어올 때마다 초기화)
  let cur = -1, seen = {};
  const op = el => { let v = 1; for (let e = el; e && !(e.classList && e.classList.contains('ftree')); e = e.parentElement) { const o = e.style && e.style.opacity; if (o !== '' && o != null) v *= Number(o); } return v; };
  const tick = () => {
    const L = window.__live, D = window.DECK;
    if (L && D && D.slides && D.slides[L.cur]) {
      if (L.cur !== cur) { cur = L.cur; seen = {}; }
      const el = D.slides[L.cur].el;
      el.querySelectorAll('.ftree .fk').forEach((k, j) => {
        const p = k.querySelector('path'); const off = p ? Number(p.style.strokeDashoffset || 0) : 0;
        const on = k.style.opacity !== '' && op(k) > 0.5 && off < 0.97;
        if (on && seen['c' + j] === 0) window.__vis.push(['check', j, performance.now(), L.cur, L.k]);   // 안 보임 → 보임으로 바뀐 순간만
        seen['c' + j] = on ? 1 : 0;
      });
      el.querySelectorAll('.ftree .mk').forEach((m, j) => {
        const v = parseFloat(m.style.backgroundSize || '0');
        const on = v > 1;
        if (on && seen['m' + j] === 0) window.__vis.push(['mark', j, performance.now(), L.cur, L.k]);
        seen['m' + j] = on ? 1 : 0;
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

await page.goto(S.url(), { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true && window.__live, null, { timeout: 180000 });
const wait = ms => page.waitForTimeout(ms);
const settled = () => page.waitForFunction(() => { const L = window.__live, sl = window.DECK.slides[L.cur]; const st = [...(sl.holds || []), sl.dur]; return !L.trans && L.wait <= 0 && L.t >= st[L.k] - 0.02; }, null, { timeout: 120000 }).catch(() => null);
const state = () => page.evaluate(() => ({ cur: window.__live.cur, k: window.__live.k, hash: location.hash, n: window.DECK.slides.length, video: !!window.DECK.slides[window.__live.cur].$isVideo, snd: window.DECK.soundOn(), ctx: window.__actx ? window.__actx.state : 'none', rec: window.__recState }));
const marks = [];
const mark = async label => marks.push([label, await page.evaluate(() => performance.now())]);
const go = async n => { for (const ch of String(n)) await page.keyboard.press(ch); await page.keyboard.press('Enter'); await settled(); };

const from = Number(opt.from || 1), to = Number(opt.to || 102), settle = Number(opt.settle || 0.25) * 1000;
await page.keyboard.press('h'); await page.keyboard.press('h');             // 첫 키 입력으로 오디오를 켠다(도움말을 열었다 닫음)
await wait(800);
if (from > 1) await go(from);
let st = await state();
console.log('오디오', st.ctx, '녹음', st.rec, '소리', st.snd ? '켬' : '끔', '시작', st.hash || '#1');
await mark('standby');
if (from === 1) await wait(Number(opt.standby || 8) * 1000);
await mark('walk');
let presses = 0;
const only = opt.only ? String(opt.only).split(',').map(Number) : null;
if (only) {
  for (const n of only) {
    await go(n - 1); await wait(300);
    for (let i = 0; i < 12; i++) {
      const c = await page.evaluate(() => window.__live.cur + 1);
      if (c >= n) break;
      await page.keyboard.press('ArrowRight'); presses++; await settled(); await wait(settle);
    }
    await wait(1500);
  }
}
while (!only && presses < 400) {
  const s = await page.evaluate(() => { const L = window.__live, sl = window.DECK.slides[L.cur]; return { n: L.cur + 1, k: L.k, last: (sl.holds || []).length, video: !!sl.$isVideo, t: L.t, dur: sl.dur }; });
  if (s.n > to || (s.n === to && s.k >= s.last && !(s.video && s.t < s.dur - 0.06))) break;
  await page.keyboard.press('ArrowRight'); presses++;
  const v = await page.evaluate(() => { const L = window.__live, sl = window.DECK.slides[L.cur]; return !!sl.$isVideo && L.t < sl.dur - 0.06; });
  if (v) { await wait(1500); continue; }                  // 영상: 1.5초 재생 뒤 다음 키로 끝 프레임
  await settled(); await wait(settle);
}
await wait(1200);
console.log('넘김', presses, '번, 지금', (await state()).hash);
// 빠르게 누르기: 40번 근처에서 0.15초 간격 12번
await mark('rapid'); await go(40); await wait(900);
for (let i = 0; i < 12; i++) { await page.keyboard.press('ArrowRight'); await wait(150); }
await settled(); await wait(1500);
// ← 키 6번(평면 밀기 반대 방향)
await mark('back');
for (let i = 0; i < 6; i++) { await page.keyboard.press('ArrowLeft'); await wait(900); }
await wait(800);
// M으로 끈 뒤 넘김 → 다시 켬
await mark('mute');
await page.keyboard.press('m'); await wait(600);
for (let i = 0; i < 4; i++) { await page.keyboard.press('ArrowRight'); await settled(); await wait(300); }
const soundOff = (await state()).snd;
await page.keyboard.press('m'); await wait(600);
await mark('unmute');
// 102번(질문 시간) 대기, 1번(대기 화면)으로 돌아감
await mark('qa'); await go(102); await wait(6000);
await mark('standby2'); await go(1); await wait(6000);
await mark('end');

const res = await page.evaluate(() => ({ log: Array.from(window.__sndLog), keys: window.__keys, vis: window.__vis, sr: window.__actx && window.__actx.sampleRate, baseLatency: window.__actx && window.__actx.baseLatency, nowPair: [performance.now(), window.__actx && window.__actx.currentTime], meta: window.__meta && window.__meta.slides.map(s => ({ n: s.n, id: s.id })) }));
res.marks = marks; res.only = only; res.rec = rec; res.soundOffDuringMute = soundOff === false; res.errors = errs; res.presses = presses;
fs.closeSync(raw);
fs.writeFileSync(path.join(outDir, 'soundtest.json'), JSON.stringify(res));
console.log(`소리 ${res.log.length}번 · 키 ${res.keys.length}번 · 확인/밑줄 ${res.vis.length}번 · 녹음 ${(rec.frames / (rec.sr || 48000)).toFixed(1)}초(${rec.sr}Hz, 끊김 ${rec.gaps}) · 오류 ${errs.length}`);
console.log(`→ ${path.relative(ROOT, outDir)}/soundtest.json, soundtest.pcm`);
await browser.close(); S.server.close();
