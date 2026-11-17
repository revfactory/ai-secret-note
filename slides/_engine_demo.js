/* 엔진 시험 덱(demo.html). 스토리보드: slides/_engine_demo.storyboard.json
 * 전환 12종(push slide-l slide-r orbit-l orbit-r rise drop zoom-through pull-out whip cut video)과
 * 머묾 5종(drift dolly-in parallax track none)을 한 번 이상 쓴다. 영상 슬라이드는 없는 파일을 가리켜 대체 화면을 확인한다.
 * 노트·카메라 값은 스토리보드에서 읽는다(여기서는 쓰지 않는다).
 * 2차: 13번 U.fileTree·U.mark·chrome.source·예시 표시, 14번 종이 바탕 트리(어두운↔밝은 바탕 wipe), 15번 자리 표시 슬라이드(등록하지 않음)
 */
(function () {
  const { ease, prog, clamp, lerp, rand, css, h, s, show } = DECK;
  const TAU = Math.PI * 2;
  const rg = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${(+a).toFixed(3)})`;
  const pal = () => ({ ink: DECK.color('ink'), mut: DECK.color('mut'), acc: DECK.color('accent'), acc2: DECK.color('accent2'), pink: DECK.color('paperInk') });

  // 제목·본문 한 줄
  function heading(el, text, o = {}) {
    const d = h('div', 'a nw', el, text);
    css(d, { left: (o.x ?? 140) + 'px', top: (o.y ?? 150) + 'px', font: `800 ${o.size ?? 72}px/1.15 var(--display)`, letterSpacing: '-.02em', color: o.color || 'var(--ink)', opacity: 0 });
    return d;
  }
  function line(el, text, o = {}) {
    const d = h('div', o.wrap ? 'a' : 'a nw', el, text);
    css(d, { left: (o.x ?? 140) + 'px', top: (o.y ?? 260) + 'px', font: `${o.weight ?? 500} ${o.size ?? 40}px/1.35 ${o.font || 'var(--sans)'}`, color: o.color || 'var(--mut)', opacity: 0 });
    if (o.w) d.style.width = o.w + 'px';
    if (o.align === 'center') css(d, { left: '0px', right: '0px', width: 'fit-content', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' });   // 상자를 글자 폭만큼으로(확대될 때 화면 밖으로 재지지 않게)
    return d;
  }
  // 아래에서 올라오며 나타남
  function fadeUp(el, t, start, dur = 0.55, dy = 28) {
    const p = prog(t, start, dur);
    show(el, p);
    el.style.transform = `translateY(${((1 - p) * dy).toFixed(1)}px)`;
    return p;
  }
  // 점선 원(천천히 돈다)
  function ring(el, cx, cy, r, o = {}) {
    const sz = r * 2 + 40;
    const sv = s('svg', { width: sz, height: sz, viewBox: `${-sz / 2} ${-sz / 2} ${sz} ${sz}` }, el);
    css(sv, { position: 'absolute', left: cx - sz / 2 + 'px', top: cy - sz / 2 + 'px', overflow: 'visible' });
    const c = s('circle', { r, fill: 'none', stroke: o.stroke || DECK.rgba('accent', 0.5), 'stroke-width': o.sw ?? 2, 'stroke-dasharray': o.dash || '4 14' }, sv);
    return { sv, c };
  }

  // ─── 1. 제목(cut · drift) ───
  const NAMES = ['push', 'slide-l', 'slide-r', 'orbit-l', 'orbit-r', 'rise', 'drop', 'zoom-through', 'pull-out', 'whip', 'cut', 'video'];
  DECK.slide({
    id: 'demo-title', holds: [1.4], dur: 3.0,
    setup(el) {
      const $ = this.$; $.c = pal();
      $.r1 = ring(el, 1500, 330, 300, { stroke: DECK.rgba('accent', 0.55) });
      $.r2 = ring(el, 1500, 330, 210, { stroke: DECK.rgba('ink', 0.16), dash: '1 0', sw: 1.5 });
      $.dot = s('circle', { r: 12, fill: DECK.rgba('accent2', 1) }, $.r1.sv);
      $.kick = line(el, '엔진 시험 덱', { y: 250, size: 36, weight: 700, color: 'var(--accent)' });
      $.title = U.rise(el, '카메라 모션 엔진', { left: '134px', top: '304px', font: '900 132px/1.12 var(--display)', letterSpacing: '-.035em', whiteSpace: 'nowrap' });
      $.sub = line(el, '슬라이드를 3D 공간에 놓고, 넘길 때 카메라가 움직인다', { y: 490 });
      $.chips = NAMES.map((nm, i) => {
        const c = h('div', 'a nw', el, nm);
        css(c, { left: 140 + (i % 6) * 272 + 'px', top: 720 + Math.floor(i / 6) * 96 + 'px', width: '252px', height: '74px', lineHeight: '70px', textAlign: 'center',
          font: '600 30px var(--mono)', borderRadius: '14px', border: '2px solid var(--line)', background: 'var(--card)', color: 'var(--ink)', opacity: 0 });
        return c;
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      fadeUp($.kick, t, 0.0);
      $.title.render(t, 0.1, { each: 0.04 });
      fadeUp($.sub, t, 0.6);
      $.r1.sv.style.transform = `rotate(${(a * 7).toFixed(2)}deg) scale(${(0.85 + 0.15 * prog(t, 0, 1.2)).toFixed(4)})`;
      show($.r1.sv, prog(t, 0, 0.8)); show($.r2.sv, prog(t, 0.2, 0.8) * 0.9);
      const an = a * 0.5;
      $.dot.setAttribute('cx', (300 * Math.cos(an)).toFixed(1)); $.dot.setAttribute('cy', (300 * Math.sin(an)).toFixed(1));
      // 이름표: 빌드 2에서 차례로 나타나고, 그 뒤 강조가 하나씩 옮겨 간다
      const k = (a * 0.9) % 12;
      $.chips.forEach((c, i) => {
        const p = prog(t, 1.45 + i * 0.06, 0.5, ease.pop);
        show(c, prog(t, 1.45 + i * 0.06, 0.2, ease.linear));
        const d = Math.min(Math.abs(i - k), 12 - Math.abs(i - k)), hl = clamp(1 - d) * prog(t, 2.4, 0.4);
        c.style.transform = `translateY(${((1 - p) * 30 - hl * 8).toFixed(1)}px) scale(${lerp(0.8, 1, p).toFixed(4)})`;
        c.style.borderColor = hl > 0.01 ? rg($.c.acc, 0.25 + 0.75 * hl) : '';
        c.style.color = hl > 0.01 ? `color-mix(in srgb, var(--accent) ${(hl * 100).toFixed(0)}%, var(--ink))` : '';
      });
    },
  });

  // ─── 2. push · dolly-in ───
  DECK.slide({
    id: 'demo-push', holds: [1.2, 2.4], dur: 3.6,
    setup(el) {
      const $ = this.$; $.c = pal();
      $.tag = U.tag(el, '01', '카메라 전환 1');
      $.h = heading(el, 'push — 다음 단계로 나아간다', { y: 180 });
      const X = [420, 960, 1500];
      $.cards = [
        U.card(el, { x: X[0], y: 520, w: 420, hh: 128, icon: 'layers', title: '배치 계산', sub: 'layout · spacing' }),
        U.card(el, { x: X[1], y: 520, w: 420, hh: 128, icon: 'camera', title: '카메라 경로', sub: '물러났다 다가감' }),
        U.card(el, { x: X[2], y: 520, w: 420, hh: 128, icon: 'target', title: '머묾 움직임', sub: 'inner 다섯 가지' }),
      ];
      $.cards.forEach(c => { c.style.opacity = 0; });
      $.svg = s('svg', { width: 1920, height: 1080 }, el); css($.svg, { position: 'absolute', left: 0, top: 0 });
      $.links = [[X[0] + 214, X[1] - 214], [X[1] + 214, X[2] - 214]].map(([a0, a1]) => {
        const p = s('path', { d: `M${a0} 520 L${a1 - 10} 520`, stroke: DECK.rgba('accent', 0.8), 'stroke-width': 3, fill: 'none' }, $.svg);
        const head = s('path', { d: `M${a1 - 16} 510 L${a1} 520 L${a1 - 16} 530`, stroke: DECK.rgba('accent', 0.9), 'stroke-width': 3, fill: 'none' }, $.svg);
        const dot = s('circle', { r: 6, fill: DECK.rgba('accent2', 1) }, $.svg);
        return { p, head, dot, a0, a1 };
      });
      $.d1 = line(el, '빌드마다 카드가 하나씩 솟는다', { y: 700, size: 40, color: 'var(--ink)' });
      $.d2 = line(el, '머무는 동안 카메라가 조금씩 다가간다(dolly-in)', { y: 760, size: 40 });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.tag.render(t, 0);
      fadeUp($.h, t, 0.0);
      [0.15, 1.25, 2.45].forEach((st, i) => {
        const c = $.cards[i], p = prog(t, st, 0.6, ease.pop);
        show(c, prog(t, st, 0.25, ease.linear));
        c.style.transform = `translateY(${((1 - p) * 60 + 5 * Math.sin(a * 1.1 + i * 1.7)).toFixed(1)}px) scale(${lerp(0.85, 1, p).toFixed(4)})`;
      });
      $.links.forEach((L, i) => {
        const p = prog(t, 1.25 + i * 1.2, 0.6, ease.inOutCubic);
        U.draw(L.p, p); show(L.head, prog(t, 1.25 + i * 1.2 + 0.45, 0.2, ease.linear));
        const f = (a * 0.6 + i * 0.37) % 1;
        L.dot.setAttribute('cx', lerp(L.a0, L.a1 - 16, f).toFixed(1)); L.dot.setAttribute('cy', '520');
        show(L.dot, p >= 1 ? Math.sin(f * Math.PI) : 0);
      });
      fadeUp($.d1, t, 2.6); fadeUp($.d2, t, 2.75);
    },
  });

  // ─── 3. slide-r · parallax(층 셋) ───
  DECK.slide({
    id: 'demo-parallax', holds: [1.4], dur: 2.8,
    setup(el) {
      const $ = this.$; $.c = pal();
      $.back = h('div', 'full', el);
      const bs = s('svg', { width: 1920, height: 1080 }, $.back); css(bs, { position: 'absolute', left: 0, top: 0 });
      s('circle', { cx: 1360, cy: 540, r: 300, fill: DECK.rgba('accent', 0.1) }, bs);
      $.rings = [170, 300, 430, 560].map((r, i) => s('circle', { cx: 1360, cy: 540, r, fill: 'none', stroke: DECK.rgba('ink', 0.16 - i * 0.025), 'stroke-width': 2 }, bs));
      $.mid = h('div', 'full', el);
      $.tag = U.tag($.mid, '01', '카메라 전환 1');
      $.h = heading($.mid, 'parallax — 층마다 다르게 움직인다', { y: 360 });
      $.sub = line($.mid, '카메라가 조금만 움직여도 깊이가 생긴다', { y: 470 });
      $.front = h('div', 'full', el);
      $.dots = [];
      for (let i = 0; i < 34; i++) {
        const d = h('div', 'a', $.front), sz = 6 + rand(i, 3) * 14;
        const zone = rand(i, 9) < 0.75;
        const px = zone ? 1000 + rand(i, 1) * 800 : 160 + rand(i, 1) * 760, py = zone ? 140 + rand(i, 2) * 800 : 780 + rand(i, 2) * 170;
        css(d, { left: px + 'px', top: py + 'px', width: sz + 'px', height: sz + 'px', borderRadius: '50%', background: rand(i, 4) < 0.2 ? 'var(--accent2)' : 'var(--accent)', opacity: 0 });
        $.dots.push(d);
      }
      $.labs = ['뒤 층   k = −0.6', '가운데 층   k = 0', '앞 층   k = 1.4'].map((tx, i) => line($.mid, tx, { y: 640 + i * 64, size: 32, font: 'var(--mono)', weight: 600, color: i === 2 ? 'var(--accent)' : 'var(--ink)' }));
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.back.style.transform = U.depth(x, -0.6) + ` rotate(${(a * 0.6).toFixed(3)}deg)`;
      $.back.style.transformOrigin = '1360px 540px';
      // 바탕 층은 카메라가 다가오는 동안(x.arrive) 미리 보여 전환 중 빈 판이 되지 않게 한다
      show($.back, Math.max(prog(t, 0, 0.8), DECK.smooth(0.15, 0.6, x.arrive)));
      $.rings.forEach((r, i) => r.setAttribute('r', ([170, 300, 430, 560][i] + 10 * Math.sin(a * 0.7 + i)).toFixed(1)));
      $.tag.render(t, 0);
      fadeUp($.h, t, 0.05); fadeUp($.sub, t, 0.3);
      $.front.style.transform = U.depth(x, 1.4);
      $.dots.forEach((d, i) => {
        const p = prog(t, 0.2 + rand(i, 5) * 0.8, 0.5);
        show(d, p * (0.45 + 0.4 * rand(i, 6)));
        d.style.transform = `translateY(${(8 * Math.sin(a * 0.8 + i * 1.3) + (1 - p) * 30).toFixed(1)}px)`;
      });
      $.labs.forEach((l, i) => fadeUp(l, t, 1.45 + i * 0.12, 0.5, 20));
    },
  });

  // ─── 4. rise · none(표) ───
  const ROWS = [
    ['drift', 'x.a 기반 사인 이동', '±14px · ±0.25°'],
    ['dolly-in', '빌드가 진행될수록 다가감', '최대 120px'],
    ['parallax', 'drift 1.5배 + 층마다 x.cam', '±21px'],
    ['track', '빌드마다 camTrack 영역으로', '0.8초 보간'],
    ['none', '고정. 표·코드 화면에', '0'],
  ];
  DECK.slide({
    id: 'demo-table', holds: [], dur: 1.8,
    setup(el) {
      const $ = this.$;
      $.tag = U.tag(el, '01', '카메라 전환 1');
      $.h = heading(el, 'inner — 머무는 동안의 카메라', { y: 150 });
      $.band = h('div', 'a', el);
      css($.band, { left: '120px', top: '300px', width: '1680px', height: '104px', borderRadius: '16px', background: 'var(--accentSoft)', opacity: 0 });
      $.rows = ROWS.map((r, i) => {
        const row = h('div', 'a', el);
        css(row, { left: '120px', top: 300 + i * 124 + 'px', width: '1680px', height: '104px', borderBottom: '2px solid var(--line2)', opacity: 0 });
        const c0 = h('div', 'a nw', row, r[0]); css(c0, { left: '40px', top: '28px', font: '700 38px var(--mono)', color: 'var(--accent)' });
        const c1 = h('div', 'a nw', row, r[1]); css(c1, { left: '360px', top: '28px', font: '600 38px var(--sans)', color: 'var(--ink)' });
        const c2 = h('div', 'a nw', row, r[2]); css(c2, { right: '40px', top: '32px', font: '500 32px var(--mono)', color: 'var(--mut)' });
        return row;
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.tag.render(t, 0);
      fadeUp($.h, t, 0);
      $.rows.forEach((r, i) => fadeUp(r, t, 0.15 + i * 0.09, 0.5, 24));
      // 강조 띠가 줄 사이를 천천히 오르내린다
      const pos = 4 * (0.5 - 0.5 * Math.cos(a * 0.35));
      show($.band, prog(t, 0.7, 0.5) * 0.9);
      $.band.style.transform = `translateY(${(pos * 124).toFixed(1)}px)`;
    },
  });

  // ─── 5. slide-l · drift(큰 숫자) ───
  const DURS = [['cut', 0], ['whip', 0.5], ['video', 0.6], ['slide-l', 0.8], ['slide-r', 0.8], ['push', 0.9], ['rise', 0.9], ['drop', 0.9], ['orbit-l', 1.1], ['orbit-r', 1.1], ['zoom-through', 1.2], ['pull-out', 2.0]];
  DECK.slide({
    id: 'demo-counter', holds: [1.6], dur: 3.2,
    setup(el) {
      const $ = this.$; $.c = pal();
      $.tag = U.tag(el, '01', '카메라 전환 1');
      $.num = U.counter(el, { x: 150, y: 700, to: 12, size: 440, color: 'var(--accent)' });
      $.unit = line(el, '가지 전환', { y: 730, x: 160, size: 64, weight: 800, color: 'var(--ink)', font: 'var(--display)' });
      $.k = line(el, '기본 길이', { x: 1000, y: 300, size: 34 });
      $.big = line(el, '0초(cut)부터 2초(pull-out)까지', { x: 1000, y: 350, size: 46, weight: 700, color: 'var(--ink)' });
      $.axis = h('div', 'a', el);
      css($.axis, { left: '1000px', top: '600px', width: '760px', height: '520px', opacity: 0 });
      const ax = s('svg', { width: 760, height: 240, viewBox: '0 -160 760 240' }, $.axis); css(ax, { position: 'absolute', left: 0, top: '-160px', overflow: 'visible' });
      s('path', { d: 'M0 0 L760 0', stroke: DECK.rgba('ink', 0.35), 'stroke-width': 2 }, ax);
      [0, 1, 2].forEach(v => {
        s('path', { d: `M${v * 380} -8 L${v * 380} 10`, stroke: DECK.rgba('ink', 0.5), 'stroke-width': 2 }, ax);
        const tl = h('div', 'a nw', $.axis, `${v}초`); css(tl, { left: v * 380 - (v === 2 ? 60 : v === 1 ? 30 : 0) + 'px', top: '22px', font: '500 28px var(--mono)', color: 'var(--mut)' });
      });
      const stackN = {};
      $.dots = DURS.map(([nm, d]) => {
        const k = stackN[d] = (stackN[d] || 0) + 1;
        return s('circle', { cx: d * 380, cy: -18 - (k - 1) * 26, r: 10, fill: DECK.rgba('accent', 0.5) }, ax);
      });
      $.cursor = s('path', { d: 'M0 -130 L0 14', stroke: DECK.rgba('accent2', 0.9), 'stroke-width': 2.5 }, ax);
      $.src = U.source(el, 'deck/engine.js ENTER_DUR');
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.tag.render(t, 0);
      $.num.render(t, 0.05, 1.3);
      fadeUp($.unit, t, 0.5);
      fadeUp($.k, t, 1.65); fadeUp($.big, t, 1.75);
      show($.axis, prog(t, 1.95, 0.5));
      const cur = (a * 0.45) % 2.4;
      $.cursor.setAttribute('transform', `translate(${(Math.min(cur, 2) * 380).toFixed(1)} 0)`);
      $.cursor.style.opacity = (cur > 2 ? 1 - (cur - 2) / 0.4 : 1).toFixed(3);
      DURS.forEach(([nm, d], i) => {
        const on = cur >= d && cur <= 2.0 ? 1 : 0, p = prog(t, 2.0 + i * 0.05, 0.4, ease.pop);
        $.dots[i].setAttribute('r', (10 * p * (1 + 0.25 * on)).toFixed(2));
        $.dots[i].setAttribute('fill', on ? rg($.c.acc2, 0.95) : rg($.c.acc, 0.55));
      });
      $.src.render(t, 2.2);
    },
  });

  // ─── 6. drop · track(빌드마다 카메라가 다른 마디로) ───
  const NODES = [
    { x: 480, y: 520, icon: 'doc', t: '스토리보드', s: 'storyboard.json', d: ['chapters[].layout · world', 'slides[].camera.enter · inner'] },
    { x: 960, y: 330, icon: 'gear', t: '엔진', s: 'deck/engine.js', d: [] },
    { x: 1440, y: 600, icon: 'eye', t: '발표 화면', s: '발표 모드 · render 모드', d: ['발표자 창 · 개관 화면', '__seek · __meta'] },
  ];
  DECK.slide({
    id: 'demo-track', holds: [1.4, 2.8], dur: 4.2,
    camTrack: [[960, 540, 1], [560, 500, 1.8], [1380, 600, 1.8]],
    setup(el) {
      const $ = this.$; $.c = pal();
      $.h = heading(el, 'track — 큰 도식을 부분씩 본다', { y: 110 });
      $.svg = s('svg', { width: 1920, height: 1080 }, el); css($.svg, { position: 'absolute', left: 0, top: 0 });
      const A = NODES[0], B = NODES[1], C = NODES[2];
      $.paths = [
        s('path', { d: `M${A.x + 120} ${A.y - 90} C ${A.x + 200} ${B.y}, ${B.x - 300} ${B.y}, ${B.x - 190} ${B.y}`, stroke: DECK.rgba('accent', 0.6), 'stroke-width': 3, fill: 'none' }, $.svg),
        s('path', { d: `M${B.x + 190} ${B.y} C ${B.x + 320} ${B.y}, ${C.x - 160} ${C.y - 200}, ${C.x - 60} ${C.y - 90}`, stroke: DECK.rgba('accent', 0.6), 'stroke-width': 3, fill: 'none' }, $.svg),
      ];
      $.smp = $.paths.map(p => U.sampler(p, 120));
      $.flow = [0, 1, 2, 3, 4, 5].map(i => s('circle', { r: 6, fill: DECK.rgba(i % 3 ? 'accent' : 'accent2', 1) }, $.svg));
      $.nodes = NODES.map(n => {
        const box = h('div', 'a', el);
        css(box, { left: n.x - 190 + 'px', top: n.y - 85 + 'px', width: '380px', height: '170px', borderRadius: '22px', background: 'var(--card)', border: '2px solid var(--line)', boxShadow: '0 20px 44px rgba(0,0,0,.35)', opacity: 0 });
        const ic = h('div', 'a', box); css(ic, { left: '28px', top: '30px' }); U.icon(ic, n.icon, 44, 'var(--accent)', 1.8);
        const tt = h('div', 'a nw', box, n.t); css(tt, { left: '92px', top: '26px', font: '800 40px/1.2 var(--sans)', color: 'var(--ink)' });
        const st = h('div', 'a nw', box, n.s); css(st, { left: '30px', top: '104px', font: '500 28px var(--mono)', color: 'var(--mut)' });
        const det = n.d.map((tx, j) => { const dd = h('div', 'a nw', el, tx); css(dd, { left: n.x - 300 + 'px', width: '600px', textAlign: 'center', top: n.y + 112 + j * 44 + 'px', font: '500 28px var(--mono)', color: 'var(--ink)', opacity: 0 }); return dd; });
        return { box, txt: [tt, st, ic], det };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      // 빌드 1 전체 → 빌드 2 스토리보드 마디 → 빌드 3 발표 화면 마디. 초점 밖 마디의 글자는 지운다(확대 화면 밖으로 잘리지 않게)
      const f2 = prog(t, 1.4, 0.5), f3 = prog(t, 2.8, 0.5);
      const hOut = Math.max(f2, f3);
      show($.h, prog(t, 0, 0.55) * (1 - hOut)); $.h.style.transform = `translateY(${((1 - prog(t, 0, 0.55)) * 28).toFixed(1)}px)`;
      $.nodes.forEach((n, i) => {
        const p = prog(t, 0.15 + i * 0.15, 0.6, ease.pop);
        const keep = i === 0 ? 1 - f3 : i === 1 ? 1 - f2 : clamp(1 - f2 + f3);
        show(n.box, prog(t, 0.15 + i * 0.15, 0.25, ease.linear) * lerp(0.3, 1, keep));
        n.box.style.transform = `translateY(${((1 - p) * 40 + 4 * Math.sin(a * 0.9 + i * 2)).toFixed(1)}px) scale(${lerp(0.85, 1, p).toFixed(4)})`;
        n.txt.forEach(e => show(e, keep));
        n.box.style.borderColor = (i === 0 && f2 > 0.01 && f3 < 0.99) || (i === 2 && f3 > 0.01) ? 'var(--accent)' : '';
        const dIn = i === 0 ? f2 * (1 - f3) : i === 2 ? f3 : 0;
        n.det.forEach((d, j) => { show(d, prog(t, (i === 0 ? 1.5 : 2.9) + j * 0.12, 0.45) * (i === 0 ? 1 - f3 : 1)); d.style.transform = `translateY(${((1 - dIn) * 16).toFixed(1)}px)`; });
      });
      $.paths.forEach((p, i) => U.draw(p, prog(t, 0.5 + i * 0.25, 0.7, ease.inOutCubic)));
      $.flow.forEach((c, i) => {
        const which = i % 2, f = (a * 0.28 + i * 0.31) % 1, q = $.smp[which].at(f);
        c.setAttribute('cx', q[0].toFixed(1)); c.setAttribute('cy', q[1].toFixed(1));
        show(c, prog(t, 1.0, 0.4) * Math.sin(f * Math.PI));
      });
    },
  });

  // ─── 7. orbit-r · drift(다음 슬라이드가 파고들 원) ───
  DECK.slide({
    id: 'demo-orbit', holds: [1.3], dur: 2.6,
    zoomTarget: { x: 1380, y: 600 },
    setup(el) {
      const $ = this.$; $.c = pal();
      $.tag = U.tag(el, '01', '카메라 전환 1');
      $.h = heading(el, 'orbit — 같은 대상의 다른 면', { y: 300 });
      $.sub = line(el, '축을 중심으로 돌아 옆면으로 간다', { y: 410 });
      $.svg = s('svg', { width: 1920, height: 1080 }, el); css($.svg, { position: 'absolute', left: 0, top: 0 });
      $.waves = [0, 1, 2].map(() => s('circle', { cx: 1380, cy: 600, r: 150, fill: 'none', stroke: DECK.rgba('accent', 0.5), 'stroke-width': 2 }, $.svg));
      $.core = h('div', 'a', el);
      css($.core, { left: '1230px', top: '450px', width: '300px', height: '300px', borderRadius: '50%', opacity: 0,
        background: 'radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--accent) 70%, white), var(--accent) 55%, color-mix(in srgb, var(--accent) 60%, var(--bg0)))',
        boxShadow: '0 0 80px color-mix(in srgb, var(--accent) 45%, transparent)' });
      $.note = line(el, '다음 화면은 이 점 안에서 나온다', { y: 640, size: 40, color: 'var(--ink)', weight: 600 });
      $.arrow = s('path', { d: 'M800 664 C 940 664, 1080 640, 1205 615', stroke: DECK.rgba('accent2', 0.95), 'stroke-width': 3, fill: 'none' }, $.svg);
      $.head = s('path', { d: 'M1186 604 L1210 613 L1192 632', stroke: DECK.rgba('accent2', 0.95), 'stroke-width': 3, fill: 'none' }, $.svg);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.tag.render(t, 0);
      fadeUp($.h, t, 0.0); fadeUp($.sub, t, 0.25);
      const cp = prog(t, 0.2, 0.7, ease.pop);
      const early = DECK.smooth(0.2, 0.7, x.arrive);   // 전환 중에는 작은 원으로 먼저 보인다
      show($.core, Math.max(prog(t, 0.2, 0.3, ease.linear), early));
      $.core.style.transform = `scale(${(lerp(0.5, 1, Math.max(cp, early * 0.4)) * (1 + 0.03 * Math.sin(a * 1.6))).toFixed(4)})`;
      $.waves.forEach((w, i) => {
        const u = (a * 0.35 + i / 3) % 1;
        w.setAttribute('r', (150 + u * 260).toFixed(1));
        w.style.opacity = (prog(t, 0.6, 0.5) * 0.8 * (1 - u)).toFixed(3);
      });
      fadeUp($.note, t, 1.35);
      U.draw($.arrow, prog(t, 1.5, 0.6, ease.inOutCubic)); show($.head, prog(t, 2.0, 0.2, ease.linear));
    },
  });

  // ─── 8. zoom-through · dolly-in(예시·출처 표기) ───
  DECK.slide({
    id: 'demo-zoom', holds: [], dur: 1.8,
    setup(el) {
      const $ = this.$;
      $.glow = h('div', 'full', el);
      css($.glow, { background: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, color-mix(in srgb, var(--accent) 8%, transparent) 38%, transparent 62%)' });
      $.svg = s('svg', { width: 1920, height: 1080 }, el); css($.svg, { position: 'absolute', left: 0, top: 0 });
      $.rings = [0, 1, 2, 3].map(() => s('circle', { cx: 960, cy: 540, r: 100, fill: 'none', stroke: DECK.rgba('accent', 0.4), 'stroke-width': 2 }, $.svg));
      $.tag = U.tag(el, '01', '카메라 전환 1');
      $.h = line(el, 'zoom-through', { x: 0, w: 1920, align: 'center', y: 380, size: 128, weight: 900, color: 'var(--ink)', font: 'var(--display)' });
      $.sub = line(el, '앞 화면의 점 안에서 다음 장면이 나온다', { x: 0, w: 1920, align: 'center', y: 570, size: 44, color: 'var(--ink)' });
      $.ex = U.example(el);
      $.src = U.source(el, '엔진 시험용 문장(실제 자료 아님)');
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.tag.render(t, 0.1);
      $.rings.forEach((r, i) => {
        const u = (a * 0.18 + i / 4) % 1;
        r.setAttribute('r', (120 + u * 900).toFixed(1));
        r.style.opacity = ((1 - u) * 0.7 * prog(t, 0, 0.5)).toFixed(3);
      });
      const p = prog(t, 0.0, 0.7);
      show($.h, p); $.h.style.transform = `scale(${lerp(0.92, 1, p).toFixed(4)})`;
      fadeUp($.sub, t, 0.3);
      $.ex.render(t, 0.5);
      $.src.render(t, 0.7);
    },
  });

  // ─── 9. pull-out · drift(장 표지) ───
  U.coverSlide({ id: 'demo-chapter2', num: 2, kicker: '두 번째 장', title: '카메라 전환 2', sub: '장 경계는 pull-out으로 넘긴다' });

  // ─── 10. orbit-l · parallax(밝은 종이 바탕, 없는 이미지) ───
  DECK.slide({
    id: 'demo-paper', bg: 'paper', holds: [1.4], dur: 2.8,
    setup(el) {
      const $ = this.$;
      $.ringBox = h('div', 'full', el);
      $.r = ring($.ringBox, 470, 560, 330, { stroke: DECK.rgba('paperInk', 0.18), dash: '3 12' });
      $.tag = U.tag(el, '02', '카메라 전환 2', { light: true });
      $.h = heading(el, '밝은 종이 바탕', { y: 220, size: 80, color: 'var(--paperInk)' });
      $.p1 = line(el, '전환 중에는 종이 판이<br>공간에 떠서 들어온다', { y: 350, size: 40, color: 'var(--paperInk)', wrap: true, w: 760 });
      $.imgBox = h('div', 'full', el);
      $.im = U.image($.imgBox, 'assets/img/_demo_missing.png', { x: 1000, y: 220, w: 800, h: 450, light: true });
      $.im.el.style.opacity = 0;
      $.cap = line(el, '이미지 파일이 없으면 같은 크기의 자리 표시', { x: 1000, y: 700, size: 32, color: 'var(--paperInk2)' });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.ringBox.style.transform = U.depth(x, -0.5);
      $.r.sv.style.transform = `rotate(${(-a * 5).toFixed(2)}deg)`;
      show($.r.sv, prog(t, 0, 0.8));
      $.tag.render(t, 0);
      fadeUp($.h, t, 0.05); fadeUp($.p1, t, 0.3);
      const ip = prog(t, 0.4, 0.7);
      show($.im.el, ip);
      $.imgBox.style.transform = U.depth(x, 0.6) + ` translateY(${((1 - ip) * 40).toFixed(1)}px)`;
      fadeUp($.cap, t, 1.45);
    },
  });

  // ─── 11. video(없는 파일 → 영상 준비 중 화면) ───
  DECK.videoSlide({ id: 'demo-video', video: 'v99_engine_demo_missing' });

  // ─── 12. whip · drift(큰 숫자 + 막대) ───
  const BARS = [['whip', 0.5], ['video', 0.6], ['slide-l·r', 0.8], ['push', 0.9], ['rise·drop', 0.9], ['orbit-l·r', 1.1], ['zoom-through', 1.2], ['pull-out', 2.0]];
  DECK.slide({
    id: 'demo-whip', holds: [1.5], dur: 3.2,
    setup(el) {
      const $ = this.$;
      $.tag = U.tag(el, '02', '카메라 전환 2');
      $.num = U.counter(el, { x: 150, y: 560, to: 0.5, decimals: 1, suffix: '초', size: 340, color: 'var(--accent2)', suffixColor: 'var(--ink)' });
      $.cap = line(el, '가장 짧은 움직임, whip', { y: 600, x: 160, size: 48, weight: 700, color: 'var(--ink)' });
      $.ct = line(el, '전환별 기본 길이(초)', { x: 1000, y: 196, size: 32 });
      $.bars = BARS.map(([nm, v], i) => {
        const y = 270 + i * 80;
        const lb = h('div', 'a nw', el, nm); css(lb, { right: 1920 - 1250 + 'px', top: y + 2 + 'px', font: '600 28px var(--mono)', color: i === 0 ? 'var(--accent2)' : 'var(--ink)', opacity: 0 });
        const bar = h('div', 'a', el);
        const col = i === 0 ? 'var(--accent2)' : 'color-mix(in srgb, var(--accent) 70%, var(--bg0))';
        css(bar, { left: '1270px', top: y + 'px', width: (v / 2) * 440 + 'px', height: '40px', borderRadius: '8px', transformOrigin: '0 50%',
          backgroundImage: `linear-gradient(90deg, transparent 0, transparent 40%, rgba(255,255,255,.28) 50%, transparent 60%, transparent 100%), linear-gradient(${col}, ${col})`,
          backgroundSize: '600px 100%, 100% 100%', backgroundRepeat: 'repeat-x, no-repeat', transform: 'scaleX(0)' });
        const val = h('div', 'a nw tnum', el, v.toFixed(1)); css(val, { left: 1270 + (v / 2) * 440 + 14 + 'px', top: y + 2 + 'px', font: '500 28px var(--mono)', color: 'var(--mut)', opacity: 0 });
        return { lb, bar, val };
      });
      $.src = U.source(el, 'deck/engine.js ENTER_DUR');
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.tag.render(t, 0);
      $.num.render(t, 0.05, 1.0);
      fadeUp($.cap, t, 0.4);
      fadeUp($.ct, t, 1.55);
      $.bars.forEach((b, i) => {
        const st = 1.6 + i * 0.07, p = prog(t, st, 0.7, ease.outExpo);
        show(b.lb, prog(t, st, 0.3)); show(b.val, prog(t, st + 0.4, 0.3));
        b.bar.style.transform = `scaleX(${p.toFixed(4)})`;
        b.bar.style.backgroundPosition = `${(((a * 140 + i * 45) % 900) - 300).toFixed(1)}px 0, 0 0`;
      });
      $.src.render(t, 1.8);
    },
  });

  // ─── 13. push · drift — 콘셉트 부품: U.fileTree · U.mark · 공통 크롬(chrome.source, 스토리보드 example: true → 「예시」) ───
  // 빌드 1: 트리 일곱 줄이 타자로 찍힘 / 빌드 2: 지금 줄(구성.md) 밑줄 + 셋째 확인 표시 / 빌드 3: 낱말 「파일」 밑줄 + 덧붙이는 줄 + 출처 줄
  DECK.slide({
    id: 'demo-tree', holds: [1.6, 3.0], dur: 4.4,
    chrome: { source: { text: '출처: 엔진 시험용 문장(실제 자료 아님)', step: 2 } },
    setup(el) {
      const $ = this.$;
      $.tree = U.fileTree(el, { preset: 'side', current: 3, done: 3, at: 0, each: 0.1, markAt: 1.75, checkAt: 2.15 });
      $.k = line(el, '정리 · 구성.md', { x: 640, y: 340, size: 36, weight: 700, color: 'var(--accent)' });
      $.h = line(el, '역할·방법·순서를 파일에 적는다', { x: 640, y: 400, size: 68, weight: 900, color: 'var(--ink)', font: 'var(--display)' });
      $.mk = U.mark($.h, { word: '파일' });
      $.sub = line(el, '읽히는 곳에 두고, 도구와 읽을 것은 줄인다', { x: 640, y: 540, size: 44 });
    },
    render(t, x) {
      const $ = this.$;
      $.tree.render(t);
      fadeUp($.k, t, 0.25); fadeUp($.h, t, 0.35);
      $.mk.render(t, 3.15, 0.5);
      fadeUp($.sub, t, 3.3);
    },
  });

  // ─── 14. slide-r · none — 종이 바탕 트리(light), 일곱 줄 모두 확인 표시·밑줄이 위에서부터 0.15초 간격 ───
  // 어두운 바탕 → 종이 바탕 전환은 배경을 섞지 않고 카메라 방향(오른쪽)에서 밀려 들어온다(wipe)
  DECK.slide({
    id: 'demo-tree-paper', bg: 'paper', holds: [], dur: 2.6,
    setup(el) {
      const $ = this.$;
      $.tree = U.fileTree(el, { preset: 'full', light: true, done: 7, checkFrom: 1, marks: [1, 2, 3, 4, 5, 6, 7], markAt: 0.3, checkAt: 0.3, markEach: 0.15, checkEach: 0.15 });
      $.h = line(el, '파일 일곱 개를 모두 열었다', { x: 800, y: 470, size: 64, weight: 900, color: 'var(--paperInk)', font: 'var(--display)' });
    },
    render(t, x) {
      const $ = this.$;
      $.tree.render(t);
      fadeUp($.h, t, 1.4);
    },
  });

  // ─── 15. demo-ph: 코드로 등록하지 않음 → 엔진이 스토리보드를 보고 자리 표시 카드로 그린다(rise · track 기본 경로) ───

  // ─── 16. cut · none(마무리) ───
  DECK.slide({
    id: 'demo-end', holds: [], dur: 1.8,
    setup(el) {
      const $ = this.$;
      $.r1 = ring(el, 960, 540, 420, { stroke: DECK.rgba('accent', 0.35), dash: '2 16' });
      $.r2 = ring(el, 960, 540, 470, { stroke: DECK.rgba('ink', 0.1), dash: '40 30', sw: 1.5 });
      $.dot = s('circle', { r: 10, fill: DECK.rgba('accent2', 1) }, $.r1.sv);
      $.h = line(el, 'cut — 바로 바뀐다', { x: 0, w: 1920, align: 'center', y: 410, size: 104, weight: 900, color: 'var(--ink)', font: 'var(--display)' });
      $.sub = line(el, '전환 12종 · 머묾 5종 · 영상 슬라이드 시험 끝', { x: 0, w: 1920, align: 'center', y: 580, size: 40 });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.r1.sv.style.transform = `rotate(${(a * 4).toFixed(2)}deg)`; $.r2.sv.style.transform = `rotate(${(-a * 2.5).toFixed(2)}deg)`;
      show($.r1.sv, prog(t, 0, 0.8)); show($.r2.sv, prog(t, 0.1, 0.8));
      $.dot.setAttribute('cx', (420 * Math.cos(a * 0.6 - 1.2)).toFixed(1)); $.dot.setAttribute('cy', (420 * Math.sin(a * 0.6 - 1.2)).toFixed(1));
      fadeUp($.h, t, 0.0); fadeUp($.sub, t, 0.3);
    },
  });
})();
