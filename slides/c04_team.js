/* 4장 「팀.md: 나뉘는 일은 팀에 맡긴다」 — 슬라이드 52~65(14장). 엔진 규약은 deck/engine.js 맨 위 주석.
 * 아트 디렉션: field(입자) 바탕 위 점과 선. 에이전트는 점, 일거리는 작은 네모 조각, 메시지는 선 위를 오가는 작은 점.
 *   53 점 하나에 조각이 쌓여 점이 커진다 → 54 점이 다섯으로 나뉘고 조각을 나눠 받는다 → 59 작업 목록 칸이 대기→진행→완료로 바뀐다
 *   → 60 구조 여섯 가지를 점과 선으로 그린다.
 *   색: accent(노랑) 조율 역할·핵심 낱말, accent2(파랑) 메시지·출처, ok(초록) 통과·맞는 일, bad(빨강) 실패·맞지 않는 일.
 * 52번은 영상 슬라이드(v04_team). 53번 첫 화면은 영상 마지막 프레임(assets/video/v04_team_poster.jpg)과 같다:
 *   field 바탕, 가운데(960, 540) accent2 파랑 점(반지름 25px)과 반지름 85px까지 옅어지는 파랑 빛. 링 없음.
 *   54번에서 이 점이 오케스트레이터(노랑)로 바뀌며 다섯으로 나뉜다.
 * 경로 줄·출처 줄은 엔진 공통 크롬(chrome.source). 65번 정리는 U.fileTree·U.mark. U.tag는 쓰지 않는다.
 */
(function () {
  const { ease, prog, clamp, lerp, rand, css, h, s, show, smooth, bezier } = DECK;
  const TAU = Math.PI * 2;
  const MOVE = bezier(0.6, -0.3, 0.25, 1.22);          // 살짝 물러났다가 출발해 넘친 뒤 멈춤
  const fr = v => v - Math.floor(v);
  const mod = (v, n) => ((v % n) + n) % n;
  const F = v => String(Math.round(v * 10) / 10);
  let PC = null;
  const C = () => PC || (PC = Object.fromEntries(['ink', 'mut', 'accent', 'accent2', 'ok', 'bad', 'bg0', 'bg1'].map(k => [k, DECK.color(k)])));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`;
  const DISP = 'var(--display)';
  const SRC = {
    research: '출처: Anthropic, How we built our multi-agent research system (2025-06-13)',
    workflows: '출처: Claude Code 문서 code.claude.com/docs/en/workflows',
    teams: '출처: Claude Code 문서 code.claude.com/docs/en/agent-teams',
    harness: '출처: Anthropic, Harness design for long-running application development (2026-03-24)',
    compiler: '출처: Anthropic, Building a C compiler with parallel Claudes (2026-02-05)',
    // 56번: 두 글(위 research·harness). 영문 제목을 다 쓰면 줄이 x 120까지 늘어나 짧게 적는다
    fit: '출처: Anthropic 멀티에이전트 리서치 글(2025-06-13) · 하네스 설계 글(2026-03-24)',
  };

  // ───────────────────────── 글자 ─────────────────────────
  // 글자 한 덩어리. 가로 위치는 x(왼쪽 끝) | right(오른쪽 끝) | cx(가운데) 중 하나, y는 위 끝
  function tx(parent, html, o = {}) {
    const el = h('div', o.width ? 'a' : 'a nw', parent, html);
    const st = { top: o.y + 'px', font: `${o.w ?? 600} ${o.size ?? 42}px/${o.lh ?? 1.25} ${o.font || 'var(--sans)'}`, color: o.color || 'var(--ink)', opacity: 0 };
    if (o.ls != null) st.letterSpacing = o.ls;
    if (o.width) st.width = o.width + 'px';
    if (o.align) st.textAlign = o.align;
    css(el, st);
    if (o.right != null) el.style.right = (1920 - o.right) + 'px';
    else if (o.cx != null) el.style.left = Math.round(o.cx - el.offsetWidth / 2) + 'px';
    else el.style.left = (o.x ?? 0) + 'px';
    return el;
  }
  // 아래에서 솟으며 나타남. op는 다 나온 뒤 불투명도(앞 빌드 요소를 흐리게 할 때).
  // pre(0~1, x.arrive로 만듦)를 주면 들어오는 평면 밀기 동안 미리 나타난다(진행률 = max(빌드 진행률, pre))
  function up(el, t, st, o = {}) {
    const p = Math.max(prog(t, st, o.dur ?? 0.55, o.e || ease.snap), o.pre ?? 0);
    show(el, Math.min(1, p * 1.6) * (o.op ?? 1));
    el.style.transform = `translate(${F((1 - p) * (o.dx ?? 0))}px, ${F((1 - p) * (o.dy ?? 34))}px)`;
    return p;
  }
  // 한 줄이 한쪽에서부터 열림(from 'l' | 'r') + 그 방향으로 조금 밀려 들어옴. pre는 up과 같다
  function wipe(el, t, st, o = {}) {
    const p = Math.max(prog(t, st, o.dur ?? 0.6, o.e || ease.snap), o.pre ?? 0);
    const q = (100 - 100 * p).toFixed(2);
    el.style.clipPath = p >= 1 ? 'none' : o.from === 'r' ? `inset(-30% 0 -30% ${q}%)` : `inset(-30% ${q}% -30% 0)`;
    show(el, (p > 0 ? 1 : 0) * (o.op ?? 1));
    el.style.transform = `translateX(${F((1 - p) * (o.from === 'r' ? 30 : -30))}px)`;
    return p;
  }
  // 큰 숫자 + 작은 단위를 한 줄로(숫자 Anton, 단위 Pretendard)
  const numH = (pre, n, unit, ns, us, col) =>
    (pre ? `<span style="font:700 ${us}px var(--sans);color:${col || 'inherit'}">${pre}</span>` : '') +
    `<span style="display:inline-block;font:400 ${ns}px/1 var(--num);letter-spacing:.005em">${n}</span>` +
    (unit ? `<span style="font:700 ${us}px var(--sans);margin-left:.12em">${unit}</span>` : '');

  // ───────────────────────── SVG 점·선 ─────────────────────────
  function svgFull(parent, w = 1920, hh = 1080, x = 0, y = 0) {
    const sv = s('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent);
    css(sv, { position: 'absolute', left: x + 'px', top: y + 'px', overflow: 'visible' });
    return sv;
  }
  const vis = (el, on) => { const d = on ? '' : 'none'; if (el.style.display !== d) el.style.display = d; };

  // 에이전트 점: 옅은 빛 + 링 + 속. pul(0~1)이 크면 링이 벌어지고 밝아진다
  function mkDot(parent, col, o = {}) {
    const g = s('g', {}, parent);
    const glow = s('circle', { r: 1, fill: rgba(col, o.glow ?? 0.14) }, g);
    const halo = s('circle', { r: 1, fill: 'none', stroke: rgba(col, 0.9), 'stroke-width': o.sw ?? 2 }, g);
    const core = s('circle', { r: 1, fill: o.hollow ? 'none' : rgba(col, 1), stroke: o.hollow ? rgba(col, 0.8) : 'none', 'stroke-width': 2.5, 'stroke-dasharray': o.hollow ? '4 5' : 'none' }, g);
    vis(g, false);
    return { g, glow, halo, core, col, ring: o.ring ?? 7 };
  }
  function setDot(d, x, y, r, op = 1, pul = 0) {
    if (op <= 0.004 || r <= 0.3) { vis(d.g, false); return; }
    vis(d.g, true);
    d.g.setAttribute('transform', `translate(${F(x)},${F(y)})`);
    d.g.style.opacity = clamp(op).toFixed(3);
    d.core.setAttribute('r', F(r));
    d.glow.setAttribute('r', F(r * 2.1 + pul * r * 0.9));
    d.halo.setAttribute('r', F(r + d.ring + pul * 12));
    d.halo.style.opacity = (0.3 + 0.7 * clamp(pul)).toFixed(3);
  }
  function mkLn(parent, col, a = 0.5, w = 2, dash) {
    const p = s('path', { fill: 'none', stroke: rgba(col, a), 'stroke-width': w, 'stroke-linecap': 'round' }, parent);
    if (dash) p.setAttribute('stroke-dasharray', dash);
    vis(p, false);
    return p;
  }
  function seg(p, x0, y0, x1, y1, op = 1) {
    if (op <= 0.003) { vis(p, false); return; }
    vis(p, true);
    p.setAttribute('d', `M${F(x0)},${F(y0)} L${F(x1)},${F(y1)}`);
    p.style.opacity = clamp(op).toFixed(3);
  }
  // 두 점 사이 2차 곡선(bend: 수직 방향으로 휘는 정도). 양 끝을 반지름만큼 잘라 낸다
  function curve(A, B, bend = 0, ra = 0, rb = 0) {
    const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const mx = (A.x + B.x) / 2 + nx * bend * d, my = (A.y + B.y) / 2 + ny * bend * d;
    const u1 = Math.hypot(mx - A.x, my - A.y) || 1, u2 = Math.hypot(B.x - mx, B.y - my) || 1;
    const x0 = A.x + ((mx - A.x) / u1) * ra, y0 = A.y + ((my - A.y) / u1) * ra;
    const x2 = B.x - ((B.x - mx) / u2) * rb, y2 = B.y - ((B.y - my) / u2) * rb;
    const at = u => { const v = 1 - u; return [v * v * x0 + 2 * v * u * mx + u * u * x2, v * v * y0 + 2 * v * u * my + u * u * y2]; };
    let L = 0, p = at(0);
    for (let i = 1; i <= 16; i++) { const q = at(i / 16); L += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; }
    return { d: `M${F(x0)},${F(y0)} Q${F(mx)},${F(my)} ${F(x2)},${F(y2)}`, L, at };
  }
  function mkPath(parent, geo, col, a = 0.5, w = 2) {
    const p = s('path', { d: geo.d, fill: 'none', stroke: rgba(col, a), 'stroke-width': w, 'stroke-linecap': 'round' }, parent);
    p.$L = geo.L; p.$at = geo.at;
    vis(p, false);
    return p;
  }
  function drawP(p, q, op = 1) {
    q = clamp(q);
    if (q <= 0.002 || op <= 0.003) { vis(p, false); return; }
    vis(p, true);
    p.style.strokeDasharray = `${(p.$L * q).toFixed(1)} ${(p.$L + 20).toFixed(1)}`;
    p.style.opacity = clamp(op).toFixed(3);
  }
  function mkHead(parent, col, a = 0.9, w = 2.5, sz = 11) {
    const p = s('path', { d: `M${-sz},${F(-sz * 0.62)} L0,0 L${-sz},${F(sz * 0.62)}`, fill: 'none', stroke: rgba(col, a), 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
    vis(p, false);
    return p;
  }
  function headOn(hd, path, q, op = 1) {
    q = clamp(q);
    if (q < 0.08 || op <= 0.01) { vis(hd, false); return; }
    vis(hd, true);
    const [x2, y2] = path.$at(q), [x1, y1] = path.$at(Math.max(0, q - 0.04));
    hd.setAttribute('transform', `translate(${F(x2)},${F(y2)}) rotate(${F(Math.atan2(y2 - y1, x2 - x1) * 57.2958)})`);
    hd.style.opacity = clamp(op).toFixed(3);
  }
  // 메시지 점
  function mkPk(parent, col, r = 6) {
    const g = s('g', {}, parent);
    s('circle', { r: F(r * 2.2), fill: rgba(col, 0.22) }, g);
    s('circle', { r, fill: rgba(col, 1) }, g);
    vis(g, false);
    return g;
  }
  function setPk(g, x, y, op = 1, sc = 1) {
    if (op <= 0.01) { vis(g, false); return; }
    vis(g, true);
    g.setAttribute('transform', `translate(${F(x)},${F(y)})${sc !== 1 ? ` scale(${sc.toFixed(3)})` : ''}`);
    g.style.opacity = clamp(op).toFixed(3);
  }
  const pkOn = (g, path, u, op = 1) => { const [x, y] = path.$at(clamp(u)); setPk(g, x, y, op * clamp(u * 8) * clamp((1 - u) * 8)); };
  // 경로 반복: steps = [[[선 번호, 거꾸로?, 색], …], …](한 단계 안의 선은 동시에 움직임). 지금 움직이는 단계와 막 도착한 단계를 돌려준다
  function runRoute(steps, a, sd = 0.7, dw = 0.25, gap = 0.5) {
    const per = steps.length * (sd + dw) + gap, tau = fr(a / per) * per, cyc = Math.floor(a / per);
    const j = Math.floor(tau / (sd + dw)), s0 = j * (sd + dw);
    const moving = j < steps.length && tau - s0 < sd ? { step: steps[j], u: ease.inOutSine((tau - s0) / sd), j } : null;
    const jj = j < steps.length && tau - s0 < sd ? j - 1 : Math.min(j, steps.length - 1);
    const hit = jj >= 0 ? { step: steps[jj], dt: tau - (jj * (sd + dw) + sd), j: jj } : null;
    return { moving, hit, cyc };
  }

  // 작업 조각 대기열: 조각 i가 ta(i)에 점 둘레 나선 자리에 도착하고, 처리된 개수만큼 한 칸씩 안쪽으로 당겨지다가 점에 흡수된다
  function mkPile(parent, n, o = {}) {
    const c = C(), els = [];
    for (let i = 0; i < n; i++) {
      const r = s('rect', { x: -6, y: -6, width: 12, height: 12, rx: 2.5, fill: i % 6 === 2 ? rgba(c.accent2, 0.95) : rgba(o.col || c.ink, 0.85) }, parent);
      vis(r, false); els.push(r);
    }
    return { els, stamp: new Int32Array(n), frame: 0 };
  }
  // 처리된 개수(정수 경계에서 0.3초 동안 한 칸씩 넘어감)
  function pileP(a, o) {
    const p0 = o.p0 ?? 0, raw = a < p0 ? 0 : (a - p0) / o.dP, k = fr(raw);
    return { raw, k, P: Math.floor(raw) + ease.inOutCubic(clamp((k * o.dP) / 0.3)) };
  }
  function drawPile(pl, a, o) {
    const { cx, cy, r0, dA, dP, pre = 0, capI = 1e9, gap = 14, step = 3.4, ang = 0.62, spin = 0, size = 12, op = 1, fly = 0.8, from } = o;
    const { P } = pileP(a, o);
    const ta = i => (i < capI ? (i - pre) * dA : (capI - pre) * dA + (i - capI) * dP);
    const n = pl.els.length;
    pl.frame++;
    let used = 0, count = 0;
    if (op > 0.003) for (let i = Math.max(0, Math.floor(P) - 1); used < n; i++) {
      const t0 = ta(i);
      if (t0 - fly > a) break;
      const q = i - P;
      if (q <= -1) continue;
      const el = pl.els[i % n];
      used++; pl.stamp[i % n] = pl.frame;
      if (q >= 0 && t0 <= a) count++;
      const qq = Math.max(0, q), th = spin + qq * ang, rr = r0 + gap + qq * step;
      let x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr, sc = size / 12, al = op, rot = th * 57.3;
      if (q < 0) { const k = -q; x = lerp(x, cx, ease.inCubic(k)); y = lerp(y, cy, ease.inCubic(k)); sc *= 1 - k; al *= 1 - k * 0.5; }
      const fp = clamp((a - (t0 - fly)) / fly);
      if (fp < 1) {
        const st = from ? from(i) : [cx + Math.cos(rand(i, 7) * TAU) * 600, cy + Math.sin(rand(i, 7) * TAU) * 600];
        const e = ease.outCubic(fp);
        x = lerp(st[0], x, e); y = lerp(st[1], y, e); rot += (1 - e) * 180; al *= smooth(0, 0.3, fp);
      }
      vis(el, al > 0.01);
      el.setAttribute('transform', `translate(${F(x)},${F(y)}) rotate(${F(rot)}) scale(${sc.toFixed(3)})`);
      el.style.opacity = clamp(al).toFixed(3);
    }
    for (let j = 0; j < n; j++) if (pl.stamp[j] !== pl.frame) vis(pl.els[j], false);
    return { P, count };
  }

  // x.cam으로 만든 층 이동을 숫자로(U.depth와 같은 식). 점 좌표를 층에 맞춰 옮길 때 쓴다
  function depthOf(x, k) {
    const c = (x && x.cam) || { dx: 0, dy: 0, dz: 0 };
    return { dx: -c.dx * k, dy: -c.dy * k, sc: Math.pow(DECK.P / Math.max(100, DECK.P + (c.dz || 0)), k) };
  }
  const ptD = (D, x, y) => [960 + (x - 960) * D.sc + D.dx, 540 + (y - 540) * D.sc + D.dy];
  // setup에서 만든 자식(before에 없던 것)을 1920×1080 한 겹으로 모은다. 슬라이드 내용 전체에 머묾 카메라 보정을 걸 때 쓴다
  function gather(el, before) {
    const kids = [...el.children].filter(ch => !before.has(ch));
    const w = h('div', 'full', el);
    kids.forEach(ch => w.appendChild(ch));
    return w;
  }
  // 머묾 카메라 지우기(4차 U.pin): w = 1이면 U.pin(x) 그대로, 0이면 지우지 않음. 그 사이는 이동·회전·확대를 w만큼만 되돌린다
  //   (U.pin과 같은 순서·같은 식. 층의 transform-origin은 슬라이드 가운데 960·540 = 1920×1080 전체 층의 기본값)
  function pinW(x, w) {
    if (w >= 1) return U.pin(x);
    if (w <= 0) return '';
    const c = (x && x.cam) || { dx: 0, dy: 0, dz: 0, rz: 0 };
    const k = DECK.P / Math.max(50, DECK.P + (c.dz || 0));
    return `translate(${((c.dx || 0) * w).toFixed(2)}px, ${((c.dy || 0) * w).toFixed(2)}px) rotate(${((c.rz || 0) * w).toFixed(4)}deg) scale(${Math.pow(k, -w).toFixed(5)})`;
  }
  // 들어오는 평면 밀기 동안 미리 보이게 할 요소의 진행률(밀기 위치 79%에서 t가 0이 되기 전에 다 나온다)
  const preOf = x => smooth(0.05, 0.5, x.arrive);
  // track 슬라이드 한 클릭 개편: camTrack에는 끝 자리 하나만 두고, 그 오프셋에 더할 차이를 t에 따라 돌려준다.
  // A·B = [cx, cy, zoom]. t0 이전은 A, t1 이후는 B(엔진 track과 같은 식: dx = cx − 960, dy = cy − 540, dz = P/zoom − P, 확대는 로그 보간)
  function trackHook(t, A, B, t0, t1) {
    const e = ease.inOutSine(clamp((t - t0) / (t1 - t0)));
    const cx = lerp(A[0], B[0], e), cy = lerp(A[1], B[1], e), z = Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), e));
    return { dx: cx - B[0], dy: cy - B[1], dz: DECK.P / z - DECK.P / B[2] };
  }

  // ═════════════════════ 52 v-team: 장 전환 영상 ═════════════════════
  DECK.videoSlide({ id: 'v-team', video: 'v04_team', notes: '(영상 14초. 끝나면: 에이전트를 여럿 쓰면 더 좋을까요. 먼저 하나로 할 때와 여럿으로 나눌 때를 비교하고, 숫자를 보겠습니다.)' });

  // ═════════════════════ 53 single: 에이전트 하나로 할 때 ═════════════════════
  // 가운데 점(영상 마지막 프레임과 같은 자리)에 작업 조각이 계속 도착해 나선으로 쌓이고, 한 번에 하나씩 흡수되며 점이 커진다.
  // 빌드 1개(한 클릭 개편): 왼쪽 장점 두 줄(ok, t 0.22~) → 오른쪽 한계 네 줄(bad, t 1.05~2.48). 줄마다 점에서 선이 뻗어 나간다
  DECK.slide({
    id: 'single', holds: [], dur: 2.85,
    setup(el) {
      const $ = this.$, c = C(), before = new Set(el.children);
      // 영상 마지막 프레임의 점 둘레 빛(반지름 85px)과, 조각이 쌓일수록 밝아지는 넓은 빛
      $.near = h('div', 'full', el);
      css($.near, { background: `radial-gradient(circle at 960px 540px, ${rgba(c.accent2, 0.24)} 24px, ${rgba(c.accent2, 0.1)} 58px, rgba(0,0,0,0) 86px)` });
      $.back = h('div', 'full', el);
      css($.back, { opacity: 0, background: `radial-gradient(circle at 960px 540px, ${rgba(c.accent2, 0.08)} 0px, ${rgba(c.accent2, 0.025)} 240px, rgba(0,0,0,0) 440px)` });
      $.sv = svgFull(el);
      const gL = s('g', {}, $.sv);
      $.ring = s('circle', { cx: 960, cy: 540, r: 200, fill: 'none', stroke: rgba(c.ink, 1), 'stroke-width': 1.5, 'stroke-dasharray': '2 10' }, $.sv);
      $.pile = mkPile(s('g', {}, $.sv), 60);
      $.dot = mkDot(s('g', {}, $.sv), c.accent2, { glow: 0, ring: 8 });
      $.title = tx(el, '에이전트 하나', { cx: 960, y: 166, size: 76, w: 900, font: DISP, ls: '-.03em' });
      const L0 = 443, R0 = 373;
      $.hL = tx(el, '장점', { right: 700, y: L0, size: 48, w: 900, font: DISP, color: 'var(--ok)' });
      $.hR = tx(el, '한계', { x: 1220, y: R0, size: 48, w: 900, font: DISP, color: 'var(--bad)' });
      const item = (text, i, side) => {
        const y = (side === 'l' ? L0 : R0) + 72 + i * 70, col = side === 'l' ? c.ok : c.bad, bx = side === 'l' ? 726 : 1194, by = y + 27;
        return {
          el: tx(el, text, side === 'l' ? { right: 700, y, size: 42 } : { x: 1220, y, size: 42 }),
          ln: mkPath(gL, curve({ x: 960, y: 540 }, { x: bx, y: by }, 0, 0, 10), col, 0.4, 2),
          b: mkPk(gL, col, 7), bx, by,
        };
      };
      $.pros = ['구조가 단순하다', '작게 시작하기 쉽다'].map((v, i) => item(v, i, 'l'));
      $.cons = ['컨텍스트가 한곳에 몰린다', '순서대로만 처리한다', '실수 하나의 영향이 크다', '품질이 고르지 않다'].map((v, i) => item(v, i, 'r'));
      // 조각은 위·아래 가장자리에서 날아온다(양옆 글자 위를 지나지 않게)
      $.from = i => { const th = (rand(i, 3) < 0.5 ? -1 : 1) * Math.PI / 2 + (rand(i, 4) - 0.5) * 1.1; return [960 + Math.cos(th) * 640, 540 + Math.sin(th) * 640]; };
      // 모든 층을 한 겹에 모은다: 영상(v04_team) 마지막 프레임과 같은 자리에서 시작하도록 머묾 카메라(drift)를 지웠다가 푼다
      $.pin = gather(el, before);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      // cut으로 들어온 첫 화면은 drift를 모두 지워(U.pin) 점이 영상 끝 프레임의 (960, 540)에 놓인다.
      // a 0.3~2.1초에 지우기를 푼다(제목·장점 줄이 나오는 동안이라 이동이 눈에 띄지 않는다). 그 뒤는 슬라이드 전체가 drift를 따른다
      $.pin.style.transform = pinW(x, 1 - prog(a, 0.3, 1.8, ease.inOutSine));
      const PO ={ cx: 960, cy: 540, dA: 0.5, dP: 0.85, p0: 1.4, capI: 60, step: 3.5, ang: 0.6, gap: 16, from: $.from, spin: a * 0.12 };
      const a2 = a - 0.9, pp = pileP(a2, PO);
      const r = 25 + 3 * Math.sqrt(Math.max(0, pp.P));
      PO.r0 = r; PO.op = smooth(0.55, 1, x.arrive);
      const pl = drawPile($.pile, a2, PO);
      const pul = a2 > PO.p0 ? Math.exp(-(pp.k * PO.dP) / 0.22) : 0;
      setDot($.dot, 960, 540, r, 1, pul);
      $.dot.halo.style.opacity = (0.85 * pul).toFixed(3);          // 영상 마지막 프레임처럼 평소에는 링이 없다
      $.ring.style.opacity = (PO.op * (0.1 + 0.32 * clamp(pl.count / 24))).toFixed(3);
      $.ring.setAttribute('r', F(200 + 3 * Math.sin(a * 1.3)));
      $.ring.style.strokeDashoffset = F(-a * 8);
      $.back.style.opacity = clamp(pl.count / 20).toFixed(3);

      up($.title, t, 0.05, { dy: 30 });
      // 끝 화면에서 장점·한계가 모두 읽히게 장점 쪽을 흐리지 않는다(이전 2빌드에서는 0.5로 흐렸다)
      const itemR = (it, st, side, op) => {
        drawP(it.ln, prog(t, st, 0.4, ease.outCubic), op);
        const bp = prog(t, st + 0.28, 0.4, ease.pop);
        setPk(it.b, it.bx, it.by, (bp > 0 ? 1 : 0) * op, Math.max(0.01, bp));
        wipe(it.el, t, st + 0.32, { from: side === 'l' ? 'r' : 'l', op });
      };
      wipe($.hL, t, 0.22, { from: 'r' });
      $.pros.forEach((it, i) => itemR(it, 0.36 + i * 0.16, 'l', 1));
      wipe($.hR, t, 1.05, { from: 'l' });
      $.cons.forEach((it, i) => itemR(it, 1.2 + i * 0.12, 'r', 1));
    },
  });

  // ═════════════════════ 54 team-roles: 여럿으로 나눌 때 ═════════════════════
  // 53의 점 하나가 다섯으로 나뉜다. 가운데 오케스트레이터가 조각을 네 역할에 나눠 보내고, 처리된 결과(ok 점)가 돌아온다.
  // 빌드 1개(한 클릭 개편): 역할 다섯(t 0~1.56) → 아래 효과 세 낱말(t 1.2~2.08)
  const ROLES = [['리서처', 600, 275, 'l'], ['실행', 1320, 275, 'r'], ['정리', 600, 585, 'l'], ['검토', 1320, 585, 'r']];
  const OX = 960, OY = 430;
  DECK.slide({
    id: 'team-roles', holds: [], dur: 2.5,
    setup(el) {
      const $ = this.$, c = C();
      $.sv = svgFull(el);
      const gL = s('g', {}, $.sv), gP = s('g', {}, $.sv), gK = s('g', {}, $.sv), gD = s('g', {}, $.sv);
      $.nodes = ROLES.map(([name, x, y, side]) => ({
        x, y, side,
        ln: mkLn(gL, c.ink, 0.3, 2),
        pile: mkPile(gP, 6),
        back: mkPk(gK, c.ok, 6),
        dot: mkDot(gD, c.ink),
        lab: tx(el, name, side === 'l' ? { right: x - 48, y: y - 24, size: 38, w: 700 } : { x: x + 48, y: y - 24, size: 38, w: 700 }),
        // 들어오는 밀기 동안 역할 자리에 보이는 점선 고리(점이 도착하면 사라진다)
        ghost: s('circle', { cx: x, cy: y, r: 15, fill: 'none', stroke: rgba(c.ink, 0.6), 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: 0 }, gL),
      }));
      $.o0 = mkDot(gD, c.accent2, { glow: 0, ring: 8 });          // 53번의 파랑 점이 노랑 오케스트레이터로 바뀐다
      $.o = mkDot(gD, c.accent);
      $.oLab = tx(el, '오케스트레이터', { cx: OX, y: OY + 46, size: 38, w: 700, color: 'var(--accent)' });
      $.rule = h('div', 'a', el);
      css($.rule, { left: '200px', top: '716px', width: '1520px', height: '2px', background: 'var(--line)', transformOrigin: '50% 50%', transform: 'scaleX(0)' });
      $.ef = tx(el, '효과', { x: 200, y: 778, size: 36, w: 600, color: 'var(--mut)' });
      $.words = ['전문화', '병렬 작업', '명확한 책임'].map((w, i) => tx(el, w, { x: 420 + i * 450, y: 756, size: 58, w: 900, font: DISP, ls: '-.02em' }));
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const mv = prog(t, 0, 0.6, ease.inOutCubic);
      const px = OX, py = lerp(540, OY, mv);
      const dimD = 1;                                             // 끝 화면에서 역할 도식도 읽히게 흐리지 않는다(이전 2빌드: 0.62)
      const ready = prog(t, 0.9, 0.5, ease.linear);
      const pv = preOf(x);                                        // 밀기 동안: 역할 이름과 점선 고리가 먼저 보인다
      let opul = 0;
      $.nodes.forEach((n, i) => {
        const st = 0.1 + i * 0.06, p = prog(t, st, 0.85, MOVE), on = t > st ? 1 : 0;
        const nx = lerp(px, n.x, p), ny = lerp(py, n.y, p);
        // 조각은 오케스트레이터에서 날아와 역할 점 둘레에 쌓이고, 처리될 때마다 결과(ok 점)가 오케스트레이터로 돌아간다
        const ai = a + i * 0.37, PO = { cx: nx, cy: ny, r0: 15, dA: 1.4, dP: 1.4, pre: 4, gap: 9, step: 2.4, ang: 1.05, spin: a * 0.25 + i, size: 9, op: ready * dimD, from: () => [px, py] };
        drawPile(n.pile, ai, PO);
        const pp = pileP(ai, PO), dt = pp.k * PO.dP;
        const u = clamp(dt / 0.75), pul = Math.exp(-dt / 0.2);
        setPk(n.back, lerp(nx, px, ease.inOutCubic(u)), lerp(ny, py, ease.inOutCubic(u)), ready * dimD * Math.sin(Math.PI * Math.min(1, u)));
        opul = Math.max(opul, ready * Math.exp(-Math.max(0, dt - 0.75) / 0.2) * (dt >= 0.75 ? 1 : 0));
        setDot(n.dot, nx, ny, 15, on * dimD, ready * pul * 0.8);
        seg(n.ln, px, py, nx, ny, on * smooth(0, 0.25, p) * dimD);
        wipe(n.lab, t, 0.75 + i * 0.07, { from: n.side === 'l' ? 'r' : 'l', op: dimD, pre: pv });
        n.ghost.style.opacity = (pv * (1 - smooth(0.5, 0.95, p))).toFixed(3);
      });
      const cm = prog(t, 0.05, 0.5, ease.inOutSine);
      setDot($.o0, px, py, lerp(25, 20, mv), 1 - cm, 0);
      $.o0.halo.style.opacity = '0';
      setDot($.o, px, py, lerp(25, 20, mv), cm, opul);
      up($.oLab, t, 0.6, { dy: 20, op: dimD });
      $.rule.style.transform = `scaleX(${prog(t, 1.2, 0.7, ease.outExpo).toFixed(4)})`;
      up($.ef, t, 1.25);
      $.words.forEach((w, i) => up(w, t, 1.35 + i * 0.09, { dy: 46, e: ease.pop }));
    },
  });

  // ═════════════════════ 55 token-cost: 토큰 15배, 평가 90.2% 높음 ═════════════════════
  // 가로 막대 셋(1 : 4 : 15). 막대 안에서 토큰 줄무늬가 길이에 비례한 속도로 흐른다.
  // 빌드 1개(한 클릭 개편): 1과 약 4배(t 0~1.6) → 약 15배(t 1.2~2.4) → 위에 90.2%(ok, t 2.15~3.35)
  DECK.slide({
    id: 'token-cost', holds: [], dur: 3.7,
    notes: '여럿이 일하면 얼마나 나아지고 얼마나 더 들까요. 토큰은 AI가 읽고 쓰는 글의 단위이고, 사용료가 이 단위로 붙습니다. Anthropic이 자기 시스템에서 잰 값입니다. 채팅이 쓰는 토큰을 1로 두면 에이전트 하나는 약 4배를 씁니다. 여럿이 함께 일하는 멀티에이전트는 약 15배를 씁니다. 얻는 것도 같은 글에 있습니다. 리서치 과제에서 멀티에이전트가 단일 에이전트보다 90.2퍼센트 높은 평가를 받았습니다. Anthropic 내부 평가입니다. 리서치처럼 나뉘는 일에서는 15배를 낼 만큼 결과가 좋아졌습니다.',
    chrome: { source: SRC.research },
    setup(el) {
      const $ = this.$, c = C(), before = new Set(el.children);
      const X0 = 560, U = 77, ROWS = [604, 722, 840];
      $.X0 = X0; $.U = U;
      $.k = tx(el, 'Anthropic, 2025년 6월', { x: 200, y: 180, size: 36, w: 600, color: 'var(--accent2)' });
      $.hd = tx(el, '토큰 사용량', { x: 196, y: 226, size: 92, w: 900, font: DISP, ls: '-.03em' });
      $.grid = svgFull(el);
      $.ticks = Array.from({ length: 16 }, (_, k) => s('line', { x1: X0 + k * U, x2: X0 + k * U, y1: 552, y2: 892, stroke: rgba(c.ink, k === 0 ? 0.35 : 0.08), 'stroke-width': k === 0 ? 2 : 1.5 }, $.grid));
      const BARS = [['채팅', 1, c.ink, 0.42, ['', '1', '']], ['에이전트', 4, c.accent2, 0.95, ['약 ', '4', '배']], ['멀티에이전트', 15, c.bad, 0.95, ['약 ', '15', '배']]];
      $.bars = BARS.map(([name, v, col, al, val], i) => {
        const y = ROWS[i];
        const lab = tx(el, name, { right: 526, y: y - 26, size: 40, w: 700 });
        const bar = h('div', 'a', el);
        css(bar, { left: X0 + 'px', top: y - 34 + 'px', width: v * U + 'px', height: '68px', borderRadius: '4px 8px 8px 4px', transformOrigin: '0 50%', transform: 'scaleX(0)',
          backgroundColor: rgba(col, al), backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0) 0 13px, rgba(255,255,255,.2) 13px 19px)' });
        const inside = i === 2;
        const vl = tx(el, numH(val[0], val[1], val[2], 62, 34), inside ? { right: X0 + v * U - 24, y: y - 38, size: 34, w: 700, lh: 1.1, color: 'var(--bg0)' } : { x: X0 + v * U + 22, y: y - 38, size: 34, w: 700, lh: 1.1 });
        return { lab, bar, vl, v, speed: [26, 70, 190][i] };
      });
      // 빌드 3: 막대 위쪽 오른쪽에 90.2%
      $.a1 = tx(el, '같은 글: 멀티에이전트가', { right: 1720, y: 182, size: 38, w: 600 });
      $.a2 = tx(el, '단일 에이전트보다 내부 평가', { right: 1720, y: 232, size: 38, w: 600 });
      $.big = h('div', 'a nw', el);
      css($.big, { right: '200px', top: '286px', color: 'var(--ok)', opacity: 0, lineHeight: '1.1' });
      $.num = h('span', 'tnum', $.big, '90.2%');
      css($.num, { display: 'inline-block', font: '400 156px/1 var(--num)', letterSpacing: '.005em' });
      $.unit = h('span', '', $.big, '높음');
      css($.unit, { font: '800 52px var(--sans)', marginLeft: '18px', color: 'var(--ink)' });
      $.conn = mkPath($.grid, curve({ x: 1640, y: 470 }, { x: X0 + 15 * U - 20, y: 800 }, -0.12, 0, 6), c.ok, 0.75, 2.5);
      $.conn.setAttribute('stroke-dasharray', '6 8');
      $.connDot = mkPk($.grid, c.ok, 6);
      // 내용 전체를 한 겹에: dolly-in 확대(최대 1.064배)를 이 층에서 절반만 받는다(최대 1.031배).
      // 오른쪽 끝 x 1720 글자(같은 글…·높음)가 끝 화면에서 1769 → 1744로 175px 여백 안에 든다
      $.wrap = gather(el, before);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = smooth(0.1, 0.7, x.arrive), pv = preOf(x);
      $.wrap.style.transform = pinW(x, 0.5);
      up($.k, t, 0.05, { pre: pv }); up($.hd, t, 0.12, { dy: 40, pre: pv });   // 제목은 밀기와 함께 들어온다
      $.ticks.forEach((l, k) => { l.style.opacity = Math.max(pre * 0.6, prog(t, 0.2 + k * 0.02, 0.4, ease.linear)).toFixed(3); });
      // 끝 화면에서 세 막대의 이름·값이 모두 읽히게 앞 막대를 흐리지 않는다(이전 3빌드에서는 0.42~0.7로 흐렸다).
      // 막대 안 15배 글자는 막대 색 위라 bg0 그대로 둔다
      $.bars[2].vl.style.color = 'var(--bg0)';
      // [이름 열림, 막대 자람 시작, 길이, 곡선, 값 등장]: 1·4배 → 15배가 클릭 없이 이어진다
      const GS = [[0.3, 0.4, 0.5, ease.snap, 0.7], [0.45, 0.75, 0.7, ease.snap, 1.15], [1.2, 1.3, 1.0, ease.outExpo, 1.95]];
      $.bars.forEach((b, i) => {
        const [lt, gt, gd, ge, vt] = GS[i];
        wipe(b.lab, t, lt, { from: 'r' });
        const g = prog(t, gt, gd, ge);
        css(b.bar, { transform: `scaleX(${g.toFixed(4)})`, opacity: g > 0 ? 1 : 0, backgroundPosition: `${F(a * b.speed)}px 0` });
        const vp = prog(t, vt, 0.45, ease.pop);
        show(b.vl, prog(t, vt, 0.15, ease.linear));
        b.vl.style.transform = `scale(${lerp(0.6, 1, vp).toFixed(4)})`;
        b.vl.style.transformOrigin = i === 2 ? '100% 60%' : '0 60%';
      });
      wipe($.a1, t, 2.15, { from: 'r' }); wipe($.a2, t, 2.25, { from: 'r' });
      const np = prog(t, 2.3, 0.9, ease.outQuart);
      $.num.textContent = DECK.count(np, 90.2, { decimals: 1 }) + '%';
      const bp = prog(t, 2.3, 0.5, ease.pop);
      show($.big, prog(t, 2.3, 0.2, ease.linear));
      $.big.style.transform = `translateY(${F((1 - bp) * 40)}px)`;
      $.unit.style.opacity = prog(t, 2.85, 0.4, ease.linear).toFixed(3);
      const cp = prog(t, 2.8, 0.55, ease.inOutCubic);
      drawP($.conn, cp, 1);
      $.conn.style.strokeDasharray = cp > 0 ? '6 8' : '';
      $.conn.style.clipPath = '';
      if (cp > 0) $.conn.style.strokeDashoffset = F(-a * 14);
      const f = fr(a * 0.45);
      pkOn($.connDot, $.conn, f, cp >= 1 ? 1 : 0);
    },
  });

  // ═════════════════════ 56 fit: 팀이 맞는 일과 맞지 않는 일 ═════════════════════
  // 좌우 두 열, 세 줄씩. 맞는 일: 선이 갈라져 나란히 간다(조각이 동시에 흐름), 만든 쪽 → 검토하는 쪽으로 갔다가 결과가 돌아온다.
  // 맞지 않는 일: 선들이 한 점·한 파일에 겹친다(조각이 한 점에 몰림), 세 점 사이를 메시지가 쉬지 않고 오간다
  const FIT = [['나눠서 동시에 할 수 있는 일'], ['한 컨텍스트에', '다 들어가지 않는 일'], ['만든 것을 따로', '검토해야 하는 일']];
  const UNFIT = [['모두가 같은 자료를', '봐야 하는 일'], ['같은 파일을 고치는 일'], ['에이전트끼리 계속', '맞춰 가야 하는 일']];
  // d 문자열로 경로를 만들고 길이·위치 함수를 붙인다(getTotalLength는 화면에 붙은 뒤에 잰다)
  function fitPath(parent, d, col) {
    const p = s('path', { d, fill: 'none', stroke: rgba(col, 0.6), 'stroke-width': 2.5, 'stroke-linecap': 'round' }, parent);
    const L = p.$L = p.getTotalLength();
    p.$at = u => { const q = p.getPointAtLength(L * clamp(u)); return [q.x, q.y]; };
    vis(p, false);
    return p;
  }
  const MESH_V = [[14, 14], [14, 70], [142, 42]], MESH_E = [[0, 1], [0, 2], [1, 2]];
  function fitIcon(parent, kind, col) {
    const c = C(), g = s('g', {}, parent), gE = s('g', {}, g), gK = s('g', {}, g), gN = s('g', {}, g);
    let paths = [], ends = [], pk = [];
    if (kind === 'split3' || kind === 'split4') {
      const ys = kind === 'split3' ? [14, 42, 70] : [10, 31, 53, 74];
      paths = ys.map(y => fitPath(gE, `M14,42 C 44,42 44,${y} 74,${y} L 140,${y}`, col));
      ends = ys.map(y => kind === 'split4' ? s('rect', { x: 132, y: y - 8, width: 20, height: 16, rx: 3, fill: 'none', stroke: rgba(col, 0.9), 'stroke-width': 2 }, gN) : s('circle', { cx: 144, cy: y, r: 6, fill: rgba(col, 1) }, gN));
      s('circle', { cx: 14, cy: 42, r: 8, fill: rgba(c.ink, 1) }, gN);
      pk = ys.map(() => mkPk(gK, col, 4.5));
    } else if (kind === 'review') {
      // 왼쪽 만든 쪽(ink) → 위 호 → 오른쪽 검토하는 쪽(col). 검토 결과는 아래 호로 돌아온다
      paths = [fitPath(gE, 'M22,34 C 56,8 100,8 132,34', col), fitPath(gE, 'M132,50 C 100,76 56,76 22,50', col)];
      s('circle', { cx: 14, cy: 42, r: 8, fill: rgba(c.ink, 1) }, gN);
      ends = [s('circle', { cx: 140, cy: 42, r: 8, fill: rgba(col, 1) }, gN)];
      pk = [mkPk(gK, c.ink, 4.5), mkPk(gK, col, 4.5)];
    } else if (kind === 'mesh') {
      // 세 점을 모두 잇는 선. 메시지가 세 선 위를 쉬지 않고 오간다
      paths = MESH_E.map(([i, j]) => fitPath(gE, `M${MESH_V[i][0]},${MESH_V[i][1]} L${MESH_V[j][0]},${MESH_V[j][1]}`, col));
      ends = MESH_V.map(([x, y]) => s('circle', { cx: x, cy: y, r: 6, fill: rgba(c.ink, 1) }, gN));
      pk = MESH_E.map(() => mkPk(gK, col, 4.5));
    } else {
      const ys = [12, 42, 72];
      paths = ys.map(y => fitPath(gE, `M12,${y} C 60,${y} 80,42 128,42`, col));
      ys.forEach(y => s('circle', { cx: 12, cy: y, r: 6, fill: rgba(c.ink, 1) }, gN));
      if (kind === 'file') ends = [s('rect', { x: 128, y: 28, width: 24, height: 28, rx: 3, fill: rgba(c.bg1, 1), stroke: rgba(col, 1), 'stroke-width': 2.5 }, gN)];
      else ends = [s('circle', { cx: 132, cy: 42, r: 10, fill: rgba(col, 1) }, gN)];
      pk = ys.map(() => mkPk(gK, col, 4.5));
    }
    return { g, gN, paths, ends, pk, kind };
  }
  function fitIconRender(ic, a, p, op) {
    ic.g.style.opacity = clamp(op).toFixed(3);
    ic.paths.forEach((pt, i) => drawP(pt, prog(p, i * 0.08, 0.8, ease.inOutCubic), 1));
    ic.gN.style.opacity = smooth(0.3, 0.8, p).toFixed(3);
    const on = p >= 1 ? 1 : 0;
    if (ic.kind === 'split3' || ic.kind === 'split4') {
      // 나란히: 조각이 동시에 출발해 동시에 도착한다
      const u = fr(a * 0.55);
      ic.pk.forEach((g, i) => pkOn(g, ic.paths[i], ease.inOutSine(u), on));
    } else if (ic.kind === 'review') {
      // 만든 것이 위 호로 가고(1.0초), 검토하는 점이 받을 때 커졌다가, 결과가 아래 호로 돌아온다(1.0초)
      const per = 3.0, tau = fr(a / per) * per, u0 = clamp(tau / 1.0), u1 = clamp((tau - 1.35) / 1.0);
      pkOn(ic.pk[0], ic.paths[0], ease.inOutSine(u0), on * (u0 > 0 && u0 < 1 ? 1 : 0));
      pkOn(ic.pk[1], ic.paths[1], ease.inOutSine(u1), on * (u1 > 0 && u1 < 1 ? 1 : 0));
      const hit = tau >= 1.0 ? Math.exp(-(tau - 1.0) * 5) : 0;
      ic.ends[0].setAttribute('r', F(8 + 3.5 * hit * on));
    } else if (ic.kind === 'mesh') {
      // 세 선마다 메시지 하나가 양 끝을 오간다(선마다 박자가 다름). 메시지가 닿는 점이 커진다
      const pul = [0, 0, 0];
      ic.pk.forEach((g, i) => {
        const ph = fr(a * [0.62, 0.5, 0.55][i] + i * 0.31), v = ph < 0.5 ? ph * 2 : 2 - ph * 2, u = ease.inOutSine(v);
        pkOn(g, ic.paths[i], u, on);
        const [e0, e1] = MESH_E[i];
        pul[e0] = Math.max(pul[e0], clamp(1 - u * 7)); pul[e1] = Math.max(pul[e1], clamp(1 - (1 - u) * 7));
      });
      ic.ends.forEach((d, k) => d.setAttribute('r', F(6 + 3 * pul[k] * on)));
    } else {
      // 한 점에 몰린다: 세 조각이 한꺼번에 도착하고 끝점이 커진다
      const u = fr(a * 0.5), e = ease.inOutSine(clamp(u / 0.75));
      ic.pk.forEach((g, i) => pkOn(g, ic.paths[i], e * 0.999, on * (u < 0.75 ? 1 : 0)));
      const hit = u >= 0.75 ? Math.exp(-(u - 0.75) * 6) : 0;
      ic.ends[0].style.transform = `scale(${(1 + 0.35 * hit).toFixed(3)})`;
      ic.ends[0].style.transformOrigin = ic.kind === 'file' ? '140px 42px' : '132px 42px';
    }
  }
  DECK.slide({
    id: 'fit', holds: [], dur: 2.85,
    notes: '판단 기준입니다. 팀이 맞는 일은 나눠서 동시에 할 수 있는 일, 자료가 많아 한 컨텍스트에 다 들어가지 않는 일, 그리고 만든 것을 따로 검토해야 하는 일입니다. 여러 기관의 공고를 따로따로 조사하는 일이 여기에 듭니다. 보고서 초안을 쓰고 다른 에이전트가 검토하게 하는 일도 팀에 맞습니다. 맞지 않는 일은 모두가 같은 자료를 봐야 하는 일, 같은 파일을 여럿이 고치는 일, 에이전트끼리 계속 맞춰 가야 하는 일입니다. 보고서 한 편의 문장을 다듬는 일은 하나가 낫습니다.',
    chrome: { source: SRC.fit },
    setup(el) {
      const $ = this.$, c = C();
      $.div = h('div', 'a', el);
      css($.div, { left: '959px', top: '230px', width: '2px', height: '600px', background: 'var(--line)', transformOrigin: '50% 0', transform: 'scaleY(0)' });
      const col = (X, title, colr, items, kinds) => {
        const hd = tx(el, title, { x: X, y: 232, size: 62, w: 900, font: DISP, ls: '-.03em', color: `var(--${colr})` });
        const bar = h('div', 'a', el);
        css(bar, { left: X + 'px', top: '320px', width: '120px', height: '6px', borderRadius: '3px', background: `var(--${colr})`, transformOrigin: '0 50%', transform: 'scaleX(0)' });
        const rows = items.map((lines, i) => {
          const top = 380 + i * 150, sv = svgFull(el, 187, 101, X, top + 10);
          sv.setAttribute('viewBox', '0 0 156 84');
          return { ic: fitIcon(sv, kinds[i], c[colr]), el: tx(el, lines.join('<br>'), { x: X + 214, y: top + (lines.length > 1 ? 8 : 34), size: 40, w: 600, lh: 1.3 }) };
        });
        return { hd, bar, rows };
      };
      $.L = col(200, '팀이 맞는 일', 'ok', FIT, ['split3', 'split4', 'review']);
      $.R = col(1020, '맞지 않는 일', 'bad', UNFIT, ['conv', 'file', 'mesh']);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = smooth(0.1, 0.8, x.arrive);
      $.div.style.transform = `scaleY(${Math.max(pre * 0.5, prog(t, 0, 0.9, ease.inOutCubic)).toFixed(4)})`;
      // 빌드 1개(한 클릭 개편): 왼쪽 맞는 일(t 0.05~1.49) → 오른쪽 맞지 않는 일(t 1.05~2.49).
      // 끝 화면에서 두 열이 모두 읽히게 왼쪽 열을 흐리지 않는다(이전 2빌드: 0.6)
      // pv: 들어오는 밀기 동안 미리 보이는 정도(왼쪽 열 제목과 밑 막대만)
      const colR = (C2, st, op, pv = 0) => {
        wipe(C2.hd, t, st, { op, pre: pv });
        C2.bar.style.transform = `scaleX(${Math.max(pv, prog(t, st + 0.15, 0.5, ease.outExpo)).toFixed(4)})`;
        C2.bar.style.opacity = op.toFixed(3);
        C2.rows.forEach((r, i) => {
          const s0 = st + 0.3 + i * 0.17;
          fitIconRender(r.ic, a + i * 0.3, prog(t, s0, 0.7, ease.linear), op);
          wipe(r.el, t, s0 + 0.2, { op });
        });
      };
      colR($.L, 0.05, 1, preOf(x));
      colR($.R, 1.05, 1);
    },
  });

  // ═════════════════════ 57 effort-scale: 일의 크기에 맞는 에이전트 수 ═════════════════════
  // 세 줄. 왼쪽 일의 종류, 가운데 점 개수(1개 · 2~4개 · 10개 넘게), 오른쪽 숫자.
  // 빌드 1개(한 클릭 개편): 한 줄씩 0.64초 간격으로 이어서 나온다(t 0.08 · 0.72 · 1.36, 마지막 점 2.5)
  DECK.slide({
    id: 'effort-scale', holds: [], dur: 2.9,
    chrome: { source: SRC.research },
    setup(el) {
      const $ = this.$, c = C();
      const YC = [330, 560, 790];
      $.sv = svgFull(el);
      $.seps = [445, 675].map(y => { const d = h('div', 'a', el); css(d, { left: '200px', top: y + 'px', width: '1520px', height: '2px', background: 'var(--line2)', transformOrigin: '0 50%', transform: 'scaleX(0)' }); return d; });
      const KIND = ['단순 조회', '비교', '복잡한 조사'];
      const BL = [[['에이전트', '1', '개'], ['도구 호출', '3~10', '회']], [['하위 에이전트', '2~4', '개']], [['', '10', '개 초과']]];
      $.rows = YC.map((yc, r) => {
        const kind = tx(el, KIND[r], { x: 200, y: yc - 30, size: 48, w: 700 });
        const blocks = BL[r].map(([lab, n, u], j) => {
          const X = 1150 + j * 300;
          return { lab: lab ? tx(el, lab, { x: X, y: yc - 86, size: 30, w: 600, color: 'var(--mut)' }) : null, num: tx(el, numH('', n, u, 88, 40), { x: X, y: yc - 46, size: 40, w: 700, lh: 1.1 }) };
        });
        return { kind, blocks, yc, g: s('g', {}, $.sv) };
      });
      // 1줄: 점 하나 + 오른쪽 도구 칸 열 개. 호출마다 점에서 칸으로 호를 그리고 칸이 켜진다(3~10회)
      const R1 = $.rows[0];
      R1.dot = mkDot(R1.g, c.accent);
      R1.tools = Array.from({ length: 10 }, (_, i) => {
        const x = 728 + i * 34, y = 330;
        return { arc: mkPath(R1.g, curve({ x: 640, y: 330 }, { x, y: y - 12 }, -0.32 - 0.6 / (i + 2), 22, 2), c.accent2, 0.8, 2), sq: s('rect', { x: F(x - 10), y: F(y - 10), width: 20, height: 20, rx: 4, fill: 'none', stroke: rgba(c.ink, 0.5), 'stroke-width': 2 }, R1.g), x, y };
      });
      // 2줄: 조율 점 + 하위 점 네 개(2~4개 사이로 늘었다 줄었다)
      const R2 = $.rows[1];
      R2.lead = mkDot(R2.g, c.accent);
      R2.subs = [-0.75, -0.25, 0.25, 0.75].map(th => ({ x: 640 + Math.cos(th) * 230, y: 560 + Math.sin(th) * 150, ln: mkLn(R2.g, c.ink, 0.3, 2), d: mkDot(R2.g, c.ink) }));
      // 3줄: 조율 점 + 2줄 7칸(14개) + 더 늘어나는 흐린 점
      const R3 = $.rows[2];
      R3.lead = mkDot(R3.g, c.accent);
      R3.subs = Array.from({ length: 21 }, (_, i) => {
        const col = i % 7, row = Math.floor(i / 7);
        return { x: 760 + col * 44, y: 790 + (row - 1) * 52, ln: mkLn(R3.g, c.ink, 0.16, 1.5), d: mkDot(R3.g, c.ink, { glow: 0.08, ring: 5 }), extra: i >= 10 };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = C();
      const ST = [0.08, 0.72, 1.36];
      const pv = preOf(x);                                        // 밀기 동안: 첫 줄(단순 조회·점·도구 칸)이 먼저 보인다
      const dimOf = () => 1;                                      // 끝 화면에서 세 줄이 모두 읽히게 앞 줄을 흐리지 않는다(이전 3빌드: 0.4)
      $.seps.forEach((d, i) => { d.style.transform = `scaleX(${prog(t, ST[i + 1] - 0.05, 0.6, ease.outExpo).toFixed(4)})`; });
      $.rows.forEach((R, r) => {
        const st = ST[r], op = dimOf(r);
        wipe(R.kind, t, st, { op, pre: r === 0 ? pv : 0 });
        R.blocks.forEach((b, j) => { if (b.lab) up(b.lab, t, st + 0.25 + j * 0.12, { op, dy: 20 }); up(b.num, t, st + 0.3 + j * 0.12, { op, dy: 40, e: ease.pop }); });
        R.g.style.opacity = op.toFixed(3);
      });
      // 1줄
      const R1 = $.rows[0], p1 = Math.max(pv, prog(t, ST[0] + 0.1, 0.5, ease.pop));
      const per = 3.4, cyc = Math.floor(a / per), tau = a - cyc * per, nCall = 3 + Math.floor(rand(cyc, 9) * 8), CD = 0.24;
      const live = prog(t, ST[0] + 0.5, 0.3, ease.linear);
      let callPul = 0;
      R1.tools.forEach((tl, i) => {
        const u = i < nCall ? (tau - i * CD) / CD : -1;
        const lit = u >= 0.85 && tau < per - 0.45 ? 1 : 0;
        tl.sq.setAttribute('fill', lit ? rgba(c.accent2, 0.9) : 'none');
        tl.sq.style.opacity = Math.max(live * (0.45 + 0.55 * lit), pv * 0.4).toFixed(3);
        drawP(tl.arc, Math.min(1, u * 1.25), live * (u < 1 ? 1 : clamp(1 - (u - 1) / 0.8)));
        if (u > 0 && u < 0.5) callPul = 1 - u * 2;
      });
      setDot(R1.dot, 640, 330, 18 * Math.max(0.01, p1), p1 > 0 ? 1 : 0, live * callPul * 0.7);
      // 2줄
      const R2 = $.rows[1], p2 = prog(t, ST[1] + 0.1, 0.5, ease.pop), on2 = p2 > 0 ? 1 : 0;
      setDot(R2.lead, 640, 560, 14 * Math.max(0.01, p2), on2, 0);
      const ph = fr(a / 4.8), nSub = 2 + [0, 1, 2, 1][Math.floor(ph * 4)];
      R2.subs.forEach((sb, i) => {
        const want = i === 0 || i === 3 ? 1 : (i === 1 ? (nSub >= 3 ? 1 : 0) : (nSub >= 4 ? 1 : 0));
        const order = [0, 2, 3, 1][i];
        const ap = prog(t, ST[1] + 0.25 + order * 0.08, 0.5, ease.pop);
        const fade = want ? 1 : 0;
        const q = ap * lerp(0.2, 1, fade);
        setDot(sb.d, sb.x, sb.y, 12 * Math.max(0.01, ap), on2 * (want ? 1 : 0.25), 0);
        seg(sb.ln, 640, 560, sb.x, sb.y, on2 * q * 0.9);
      });
      // 3줄
      const R3 = $.rows[2], p3 = prog(t, ST[2] + 0.1, 0.5, ease.pop), on3 = p3 > 0 ? 1 : 0;
      setDot(R3.lead, 640, 790, 14 * Math.max(0.01, p3), on3, 0);
      R3.subs.forEach((sb, i) => {
        const ap = prog(t, ST[2] + 0.2 + i * 0.025, 0.45, ease.pop);
        // 열 번째 뒤의 점은 흐리게 늘었다 줄었다 한다(10개 초과)
        const ex = sb.extra ? 0.25 + 0.6 * Math.max(0, Math.sin(a * 1.1 - i * 0.45)) : 1;
        setDot(sb.d, sb.x, sb.y, 9 * Math.max(0.01, ap), on3 * ex, sb.extra ? 0 : 0.15 * (0.5 + 0.5 * Math.sin(a * 2 + i)));
        seg(sb.ln, 640, 790, sb.x, sb.y, on3 * ap * ex * 0.8);
      });
    },
  });

  // ═════════════════════ 58 four-ways: 일을 나누는 네 가지 방식 ═════════════════════
  // 네 줄 표. 한 줄씩 채워지고 카메라가 그 줄을 따라 내려가며 조금씩 물러난다(채운 줄이 모두 화면 안에 남게).
  // 빌드 1개(한 클릭 개편): 줄 시작 t 0.05 · 0.75 · 1.45 · 2.15, 마지막 칸 3.26. 지금 채우는 줄에 노랑 바탕이 옮겨 가고
  // 끝 화면에서는 네 줄 모두 ink(이전 4빌드에서는 앞 줄을 mut로 흐렸다). 이름 칸 왼쪽에 방식마다 작은 점 도식.
  // 카메라: camTrack은 끝 화면 자리 하나([960, 590, 1.04], 이전 마지막 빌드와 같음). cameraHook으로 첫 줄 자리
  // [960, 420, 1.14]에서 t 0.25~2.9에 끝 자리로 옮긴다
  const WAYS = [
    { name: '서브에이전트', cells: ['Claude가 매번 정함', '작은 규모', '결과는 대화로 돌아옴'] },
    { name: '스킬', cells: ['Claude가 적힌 지침을 따름'] },
    { name: '에이전트 팀', cells: ['리더가 정함', '오래 함께 일하는 소수', '공유 작업 목록'] },
    { name: '워크플로', cells: ['스크립트가 정함', '수십~수백 에이전트', '결과는 스크립트 변수에'] },
  ];
  const TCOL = [300, 650, 1040, 1390], TROW = k => 330 + k * 140;
  function wayGlyph(parent, k) {
    const c = C(), g = s('g', {}, parent), o = { g, k };
    if (k === 0) { o.a = mkDot(g, c.accent, { ring: 5 }); o.b = mkDot(g, c.ink, { ring: 4 }); o.ln = mkLn(g, c.ink, 0.35, 2); o.pk = mkPk(g, c.accent2, 4); }
    if (k === 1) {
      o.a = mkDot(g, c.accent, { ring: 5 });
      s('rect', { x: 4, y: -22, width: 30, height: 40, rx: 4, fill: 'none', stroke: rgba(c.ink, 0.7), 'stroke-width': 2 }, g);
      o.lines = [-12, -4, 4, 12].map(y => s('line', { x1: 10, x2: 28, y1: y, y2: y, stroke: rgba(c.ink, 0.6), 'stroke-width': 2, 'stroke-linecap': 'round' }, g));
    }
    if (k === 2) { o.a = mkDot(g, c.accent, { ring: 5 }); o.m = [-26, 0, 26].map(() => mkDot(g, c.ink, { ring: 4 })); o.lns = [0, 1, 2].map(() => mkLn(g, c.ink, 0.3, 1.5)); o.pk = mkPk(g, c.accent2, 3.5); }
    if (k === 3) {
      s('rect', { x: -34, y: -20, width: 22, height: 40, rx: 4, fill: 'none', stroke: rgba(c.accent, 0.9), 'stroke-width': 2 }, g);
      o.ds = Array.from({ length: 16 }, (_, i) => s('circle', { cx: -2 + (i % 4) * 11, cy: -16 + Math.floor(i / 4) * 11, r: 3.6, fill: rgba(c.ink, 1) }, g));
    }
    return o;
  }
  function wayGlyphRender(o, a, p) {
    o.g.style.opacity = p.toFixed(3);
    o.g.style.transform = `scale(${lerp(0.6, 1, ease.pop(clamp(p))).toFixed(3)})`;
    if (o.k === 0) {
      setDot(o.a, -16, 0, 9, 1, 0); setDot(o.b, 24, 0, 6, 1, 0); seg(o.ln, -16, 0, 24, 0, 1);
      const u = fr(a * 0.6), v = u < 0.5 ? u * 2 : 2 - u * 2;   // 맡기고 결과를 돌려받음
      setPk(o.pk, lerp(-6, 17, ease.inOutSine(v)), 0, 1);
    }
    if (o.k === 1) { setDot(o.a, -18, 0, 9, 1, 0.3 + 0.3 * Math.sin(a * 2)); const j = Math.floor(fr(a * 0.5) * 4); o.lines.forEach((l, i) => l.setAttribute('stroke', rgba(C().accent, i === j ? 1 : 0.0) )); o.lines.forEach((l, i) => { if (i !== j) l.setAttribute('stroke', rgba(C().ink, 0.55)); }); }
    if (o.k === 2) {
      setDot(o.a, 0, -18, 8, 1, 0);
      o.m.forEach((d, i) => { setDot(d, -26 + i * 26, 16, 6, 1, 0); seg(o.lns[i], 0, -18, -26 + i * 26, 16, 1); });
      const u = fr(a * 0.5), i0 = Math.floor(fr(a * 0.5 / 3) * 3), x0 = -26 + i0 * 26, x1 = -26 + ((i0 + 1) % 3) * 26;
      setPk(o.pk, lerp(x0, x1, ease.inOutSine(u)), 16 - 12 * Math.sin(Math.PI * u), 1);
    }
    if (o.k === 3) o.ds.forEach((d, i) => { const w = Math.sin(a * 3 - (i % 4) * 0.8 - Math.floor(i / 4) * 0.3); d.style.opacity = (0.35 + 0.65 * Math.max(0, w)).toFixed(3); });
  }
  DECK.slide({
    id: 'four-ways', holds: [], dur: 3.65,
    notes: 'Claude Code에는 일을 나누는 방식이 네 가지 있습니다. 공식 문서의 표입니다. 서브에이전트는 Claude가 그때그때 정해 작은 일을 맡기고 결과만 돌려받습니다. 스킬은 에이전트를 늘리지 않고 Claude가 적힌 지침을 따릅니다. 에이전트 팀은 리더가 계획을 정하고, 팀원 몇이 오래 같이 일하며 작업 목록을 공유합니다. 워크플로는 스크립트가 순서를 정합니다. 수십에서 수백 에이전트를 돌릴 수 있습니다. 누가 계획을 정하는지가 다릅니다.',
    camTrack: [[960, 590, 1.04]],
    // 첫 줄 자리에서 끝 자리로: 엔진 track 오프셋(끝 자리)에 더할 차이를 돌려준다
    cameraHook(t) { return trackHook(t, [960, 420, 1.14], [960, 590, 1.04], 0.25, 2.9); },
    chrome: { source: SRC.workflows },
    setup(el) {
      const $ = this.$;
      $.heads = ['이름', '누가 계획을 정하는가', '규모', '중간 결과가 남는 곳'].map((v, j) => tx(el, v, { x: TCOL[j], y: 262, size: 28, w: 600, color: 'var(--mut)' }));
      $.hline = h('div', 'a', el);
      css($.hline, { left: '190px', top: '312px', width: '1540px', height: '2px', background: 'var(--line)', transformOrigin: '0 50%', transform: 'scaleX(0)' });
      $.sv = svgFull(el);
      $.rows = WAYS.map((w, k) => {
        const top = TROW(k);
        const band = h('div', 'a', el);
        css(band, { left: '190px', top: top + 'px', width: '1540px', height: '128px', borderRadius: '16px', border: '2px dashed var(--line2)', opacity: 0 });
        const bar = h('div', 'a', band);
        css(bar, { left: '-2px', top: '18px', width: '6px', height: '88px', borderRadius: '3px', background: 'var(--accent)', transformOrigin: '50% 50%', transform: 'scaleY(0)' });
        const name = tx(el, w.name, { x: TCOL[0], y: top + 36, size: 44, w: 900, font: DISP, ls: '-.02em' });
        const cells = w.cells.map((v, j) => tx(el, v, { x: TCOL[j + 1], y: top + 42, size: 34, w: 600 }));
        const gl = wayGlyph(s('g', { transform: `translate(244,${top + 64})` }, $.sv), k);
        return { band, bar, name, cells, gl, top };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = smooth(0.1, 0.8, x.arrive);
      // 마지막 값(3.0)은 넷째 줄의 노랑 바탕이 빠지는 시각: 끝 화면은 강조 없이 네 줄이 같은 무게로 남는다
      const ST = [0.05, 0.75, 1.45, 2.15, 3.0];
      $.heads.forEach((hd, j) => up(hd, t, 0.02 + j * 0.05, { dy: 16 }));
      $.hline.style.transform = `scaleX(${Math.max(pre * 0.6, prog(t, 0, 0.7, ease.outExpo)).toFixed(4)})`;
      $.rows.forEach((R, r) => {
        const st = ST[r], fill = prog(t, st, 0.45, ease.linear), cur = prog(t, st, 0.5) * (1 - prog(t, ST[r + 1], 0.5));
        // 줄 테두리: 채우기 전에는 점선, 채우면 옅은 바탕. 지금 줄은 노랑 바탕과 왼쪽 막대.
        // 점선 줄은 채우기 0.3초 전에 위에서 내려앉는다(셋째·넷째 줄). 그때 카메라가 이미 내려와 있어
        // 점선 아래 변(넷째 줄: 화면 y 약 911)이 출처 줄(y 940~970)에 닿지 않는다
        const nv = r <= 1 ? 1 : prog(t, st - 0.3, 0.3, ease.snap);
        show(R.band, nv);
        R.band.style.transform = nv < 1 ? `translateY(${F((1 - nv) * -22)}px)` : '';
        R.band.style.borderStyle = fill > 0 ? 'solid' : 'dashed';
        R.band.style.background = fill > 0 ? `color-mix(in srgb, var(--accent) ${(cur * 13).toFixed(1)}%, color-mix(in srgb, var(--ink) ${(fill * 4).toFixed(1)}%, transparent))` : 'transparent';
        R.band.style.borderColor = cur > 0.01 ? `color-mix(in srgb, var(--accent) ${(cur * 55).toFixed(0)}%, var(--line2))` : '';
        R.bar.style.transform = `scaleY(${cur.toFixed(3)})`;
        wipe(R.name, t, st + 0.05);
        R.cells.forEach((cl, j) => wipe(cl, t, st + 0.25 + j * 0.13));
        wayGlyphRender(R.gl, a + r, prog(t, st, 0.5, ease.linear));
      });
    },
  });

  // ═════════════════════ 59 team-structure: 에이전트 팀의 구조 ═════════════════════
  // 위 리더 점, 아래 팀원 점 넷(앞 층). 가운데 뒤 층에 작업 목록 세 칸(대기·진행·완료) — 카드가 왼쪽에서 오른쪽으로 옮겨 간다.
  // 진행 칸 카드는 맡은 팀원과 선으로 이어진다. 팀원 사이 메시지 선과 점. 층마다 시차(parallax)
  // 빌드 1개(한 클릭 개편): 리더와 팀원(t 0.05~1.4) → 작업 목록 세 칸(t 0.95~1.8) → 메시지 선과 캡션(t 1.75~2.6)
  // 팀원 줄 MY와 캡션 y(CAPY)는 parallax 이동(±13.5px)을 받아도 캡션 글자 아래 끝이 y 905 안에 들게 정했다(5회차: 770 → 744, 874 → 852)
  const BCOL = [600, 845, 1090], BW = 230, LEAD = [960, 282], MEM = [600, 840, 1080, 1320], MY = 744, CAPY = 852;
  const CARD_D = 1.5, CARD_S = 4.5;
  DECK.slide({
    id: 'team-structure', holds: [], dur: 2.95,
    chrome: { source: SRC.teams },
    setup(el) {
      const $ = this.$, c = C();
      // 뒤 층: 작업 목록
      $.back = h('div', 'full', el);
      $.bsv = svgFull($.back);
      $.bLab = tx($.back, '공유 작업 목록', { x: 600, y: 352, size: 36, w: 700, color: 'var(--accent2)' });
      $.cols = BCOL.map((X, k) => {
        const box = h('div', 'a', $.back);
        css(box, { left: X + 'px', top: '408px', width: BW + 'px', height: '238px', borderRadius: '14px', border: '2px solid var(--line)', background: 'color-mix(in srgb, var(--bg1) 70%, transparent)', opacity: 0 });
        const hd = tx($.back, ['대기', '진행', '완료'][k], { x: X + 20, y: 414, size: 32, w: 700, color: ['var(--mut)', 'var(--accent2)', 'var(--ok)'][k] });
        return { box, hd };
      });
      $.cards = Array.from({ length: 12 }, () => {
        const g = s('g', {}, $.bsv);
        const r = s('rect', { x: 0, y: 0, width: 200, height: 44, rx: 8, 'stroke-width': 2 }, g);
        const l1 = s('rect', { x: 16, y: 13, width: 110, height: 6, rx: 3 }, g), l2 = s('rect', { x: 16, y: 25, width: 70, height: 6, rx: 3 }, g);
        const ck = s('path', { d: 'M168,22 l7,7 l13,-14', fill: 'none', stroke: rgba(c.ok, 1), 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        vis(g, false);
        return { g, r, l1, l2, ck };
      });
      // 가운데 층: 제목·리더
      $.mid = h('div', 'full', el);
      $.hd = tx($.mid, '리더 1 + 팀원 3~5', { x: 196, y: 162, size: 66, w: 900, font: DISP, ls: '-.03em' });
      $.lLab = tx($.mid, '리더', { x: LEAD[0] + 42, y: LEAD[1] - 24, size: 38, w: 700, color: 'var(--accent)' });
      // 캡션은 따로 한 겹: 머묾 카메라의 이동(dx, dy)을 지운다(U.depth(x, -1). ±0.25° 회전만 남는다)
      $.capL = h('div', 'full', el);
      $.cap = tx($.capL, '팀원끼리 직접 메시지를 주고받는다', { cx: 960, y: CAPY, size: 42, w: 700 });
      // 앞 층: 팀원
      $.front = h('div', 'full', el);
      $.mLab = tx($.front, '팀원', { right: MEM[0] - 46, y: MY - 24, size: 38, w: 700 });
      // 층을 잇는 선(층마다 다른 이동을 계산해 그림)
      $.sv = svgFull(el);
      const gL = s('g', {}, $.sv), gM = s('g', {}, $.sv), gK = s('g', {}, $.sv), gD = s('g', {}, $.sv);
      $.toMem = MEM.map(() => mkLn(gL, c.ink, 0.22, 1.5, '3 7'));
      $.toBoard = mkLn(gL, c.accent, 0.6, 2, '4 6');
      $.claims = MEM.map(() => mkLn(gL, c.accent2, 0.75, 2));
      $.lead = mkDot(gD, c.accent);
      $.mem = MEM.map(() => mkDot(gD, c.ink));
      const PAIRS = [[0, 1], [1, 2], [2, 3], [0, 2], [1, 3], [0, 3]];
      // 메시지 선: 이웃 쌍은 점 위로 50px, 두 칸 떨어진 쌍은 아래로 50px, 세 칸 떨어진 쌍은 아래로 76px 호
      // (가장 깊은 호 아래 끝 744 + 76 = 820, 앞 층 이동 ±27px를 더해도 캡션 글자 위 끝 약 858 위에서 멈춤).
      // 색은 ink(선)·accent(메시지 점)로 진행 카드 연결선(accent2)과 구분한다
      const SAG = { 1: -50, 2: 50, 3: 76 };
      $.msgs = PAIRS.map(([i, j], n) => ({ i, j, sag: SAG[j - i], p: mkLn(gM, c.ink, 1, 3), pk: mkPk(gK, c.accent, 8), n }));
      $.newPk = mkPk(gK, c.accent, 5);
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = C();
      const pre = smooth(0.1, 0.8, x.arrive);
      const DB = depthOf(x, -0.45), DF = depthOf(x, 1.0);
      $.back.style.transform = U.depth(x, -0.45);
      $.front.style.transform = U.depth(x, 1.0);
      $.capL.style.transform = U.depth(x, -1);
      // 빌드 1: 리더·팀원. 제목은 들어오는 밀기와 함께 들어온다
      up($.hd, t, 0.05, { dy: 36, pre: preOf(x) });
      const lp = prog(t, 0.2, 0.5, ease.pop);
      const mp = MEM.map((_, i) => prog(t, 0.4 + i * 0.07, 0.5, ease.pop));
      const B2 = prog(t, 0.95, 0.6, ease.linear), B3 = prog(t, 1.75, 0.5, ease.linear);
      up($.lLab, t, 0.45, { dx: -16, dy: 0 });
      up($.mLab, t, 0.7, { dx: 16, dy: 0 });
      const [lx, ly] = LEAD;
      const memPt = i => ptD(DF, MEM[i], MY);
      $.toMem.forEach((l, i) => { const [mx, my] = memPt(i); const q = prog(t, 0.75 + i * 0.05, 0.5, ease.outCubic); seg(l, lx, ly + 24, lerp(lx, mx, q), lerp(ly + 24, my - 22, q), q * lerp(1, 0.25, B2)); });
      // 둘째 묶음: 작업 목록
      show($.bLab, prog(t, 1.05, 0.4, ease.linear));
      $.bLab.style.transform = `translateY(${F((1 - prog(t, 1.05, 0.5)) * 16)}px)`;
      $.cols.forEach((cl, k) => {
        const p = prog(t, 1.0 + k * 0.09, 0.55, ease.pop);
        show(cl.box, Math.max(pre * 0.3, prog(t, 1.0 + k * 0.09, 0.2, ease.linear)));
        cl.box.style.transform = `translateY(${F((1 - p) * 30)}px)`;
        up(cl.hd, t, 1.15 + k * 0.09, { dy: 14 });
      });
      const [bx0, by0] = ptD(DB, 960, 408);
      const tbq = prog(t, 1.25, 0.5, ease.outCubic);
      seg($.toBoard, lx, ly + 24, lx, lerp(ly + 24, by0 - 6, tbq), tbq);
      // 카드: j번째 카드는 cj에 대기 칸으로 들어와 S초마다 다음 칸으로 옮겨 간다. 칸 안에서는 앞 카드가 빠지면 한 칸 올라간다
      const board = prog(t, 1.3, 0.5, ease.linear);
      const X = k => BCOL[k] + 15, Y = sl => 470 + sl * 58;
      const step = v => Math.floor(v) + ease.inOutCubic(clamp(fr(v) / 0.27));
      const jHi = Math.floor((a + 0.5) / CARD_D) + 6, used = new Set();
      const owner = j => ((j % 4) + 4) % 4;
      const claimTo = [null, null, null, null];
      let newU = -1, memPul = [0, 0, 0, 0];
      for (let j = jHi; j > jHi - 12; j--) {
        const cj = j * CARD_D - 6, u = a - cj;
        if (u < -0.5 || u > 3 * CARD_S + 0.5) continue;
        const cd = $.cards[((j % 12) + 12) % 12]; used.add(cd);
        const k = clamp(Math.floor(u / CARD_S), 0, 2), uk = u - k * CARD_S;
        let cx = X(k), cy = Y(2 - clamp(step(uk / CARD_D), 0, 2)), op = 1;
        if (k > 0 && uk < 0.7) {                          // 앞 칸 맨 위에서 이 칸 맨 아래로
          const e = MOVE(clamp(uk / 0.7));
          cx = lerp(X(k - 1), X(k), e); cy = lerp(Y(0), Y(2), ease.inOutCubic(clamp(uk / 0.7)));
        }
        if (u < 0.4) { op = clamp(u / 0.4); cx -= (1 - op) * 30; if (u >= 0) newU = u; }
        if (u > 3 * CARD_S) { const q = clamp((u - 3 * CARD_S) / 0.4); op = 1 - q; cx = X(2) + q * 40; cy = Y(0); }
        op *= board;
        vis(cd.g, op > 0.01);
        cd.g.setAttribute('transform', `translate(${F(cx)},${F(cy)})`);
        cd.g.style.opacity = clamp(op).toFixed(3);
        const colr = k === 0 ? c.mut : k === 1 ? c.accent2 : c.ok;
        cd.r.setAttribute('fill', rgba(colr, k === 1 ? 0.2 : 0.1)); cd.r.setAttribute('stroke', rgba(colr, 0.85));
        cd.l1.setAttribute('fill', rgba(c.ink, 0.5)); cd.l2.setAttribute('fill', rgba(c.ink, 0.3));
        cd.ck.style.opacity = k === 2 ? '1' : '0';
        if (k === 1 && uk >= 0.5) claimTo[owner(j)] = [cx + 100, cy + 44];
        if (k === 2 && uk < 0.6) memPul[owner(j)] = Math.max(memPul[owner(j)], 1 - uk / 0.6);
      }
      $.cards.forEach(cd => { if (!used.has(cd)) vis(cd.g, false); });
      // 진행 칸 카드 ↔ 맡은 팀원
      $.claims.forEach((l, i) => {
        const tgt = claimTo[i];
        if (!tgt) { vis(l, false); return; }
        const [ex, ey] = ptD(DB, tgt[0], tgt[1]), [mx, my] = memPt(i);
        seg(l, mx, my - 22, ex, ey, board * lerp(0.9, 0.3, B3));
      });
      // 새 카드가 들어올 때 리더에서 작업 목록으로 점 하나
      if (newU >= 0) setPk($.newPk, lx, lerp(ly + 24, by0, ease.inOutCubic(clamp(newU / 0.4))), board * Math.sin(Math.PI * clamp(newU / 0.4)));
      else vis($.newPk, false);
      setDot($.lead, lx, ly, 22 * Math.max(0.01, lp), Math.max(pre * 0.5, lp > 0 ? 1 : 0), newU >= 0 ? 0.6 * (1 - newU / 0.4) : 0);
      // 셋째 묶음: 메시지
      let mPul = [0, 0, 0, 0];
      $.msgs.forEach(m => {
        const [ax, ay] = memPt(m.i), [bx, by] = memPt(m.j);
        const dp = prog(t, 1.8 + m.n * 0.06, 0.5, ease.outCubic);
        if (dp <= 0) { vis(m.p, false); vis(m.pk, false); return; }
        // 두 팀원 점을 잇는 호. 휨은 층 배율에 맞춰 sag px(가운데에서 점 줄로부터 떨어진 거리)
        const dd = Math.hypot(bx - ax, by - ay) || 1, rr = 27 * DF.sc;
        const geo = curve({ x: ax, y: ay }, { x: bx, y: by }, (2 * m.sag * DF.sc) / dd, rr, rr);
        m.p.setAttribute('d', geo.d); m.p.$L = geo.L; m.p.$at = geo.at;
        drawP(m.p, dp, 0.75);
        const per = 2.6, ph = (a + m.n * 0.83) / per, u = fr(ph) * per / 1.1;
        if (u < 1 && dp >= 1) {
          const e = ease.inOutSine(u), rev = Math.floor(ph) % 2 === 1;
          const [qx, qy] = geo.at(rev ? 1 - e : e);
          setPk(m.pk, qx, qy, B3 * Math.sin(Math.PI * u));
          if (u > 0.85) mPul[rev ? m.i : m.j] = Math.max(mPul[rev ? m.i : m.j], (u - 0.85) / 0.15);
        } else vis(m.pk, false);
      });
      $.mem.forEach((d, i) => { const [mx, my] = memPt(i); setDot(d, mx, my, 18 * Math.max(0.01, mp[i]), Math.max(pre * 0.5, mp[i] > 0 ? 1 : 0), Math.max(memPul[i] * board, mPul[i] * B3)); });
      up($.cap, t, 1.95, { dy: 24 });
    },
  });

  // ═════════════════════ 60 patterns: 팀 구조 여섯 가지 ═════════════════════
  // 2열 3줄 여섯 칸. 칸마다 점과 선 도식(조각이 경로를 따라 움직임)과 이름. 한 줄(두 칸)씩 그려지고 카메라가 그 줄을 따라 내려간다.
  // 끝에 「생성 후 검토」에 형광 밑줄(노트: 처음이라면 넷째부터 권함)
  // 빌드 1개(한 클릭 개편): 줄 시작 t 0.1 · 0.8 · 1.5, 마지막 칸 도식 2.88, 밑줄 2.75~3.25.
  // 카메라: camTrack은 끝 화면 자리 하나([960, 580, 1.05], 이전 마지막 빌드와 같음). cameraHook으로 첫 줄 자리
  // [960, 330, 1.2]에서 t 0.2~2.6에 끝 자리로 옮긴다
  const PATS = [
    { ko: '순차', en: 'Pipeline' }, { ko: '병렬 후 통합', en: 'Fan-out/Fan-in' },
    { ko: '전문가 선택', en: 'Expert Pool' }, { ko: '생성 후 검토', en: 'Producer-Reviewer' },
    { ko: '중앙 분배', en: 'Supervisor' }, { ko: '단계적 위임', en: 'Hierarchical Delegation' },
  ];
  const PCX = [240, 980], PCY = [200, 460, 720], PCW = 700, PCH = 240;
  function patNet(parent, k) {
    const c = C(), g = s('g', {}, parent), gE = s('g', {}, g), gK = s('g', {}, g), gN = s('g', {}, g);
    const n = (x, y, col = 'ink', r = 11) => ({ x, y, col, r });
    let N, E, steps;
    if (k === 0) { N = [n(20, 90, 'accent'), n(100, 90), n(180, 90), n(262, 90, 'ok')]; E = [[0, 1], [1, 2], [2, 3]]; steps = [[[0]], [[1]], [[2]]]; }
    if (k === 1) { N = [n(20, 90, 'accent'), n(140, 24), n(140, 90), n(140, 156), n(262, 90, 'ok')]; E = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4]]; steps = [[[0], [1], [2]], [[3], [4], [5]]]; }
    if (k === 2) { N = [n(30, 90, 'accent'), n(250, 24, 'accent2'), n(250, 90, 'ok'), n(250, 156, 'bad')]; E = [[0, 1, -0.1], [0, 2], [0, 3, 0.1]]; steps = null; }
    if (k === 3) { N = [n(60, 90, 'accent'), n(200, 90), n(275, 90, 'ok', 8)]; E = [[0, 1, -0.38, 'ink'], [1, 0, -0.38, 'bad'], [1, 2, 0, 'ok']]; steps = [[[0, 0, 'accent2']], [[1, 0, 'bad']], [[0, 0, 'accent2']], [[2, 0, 'ok']]]; }
    if (k === 4) { N = [n(140, 90, 'accent', 13), n(30, 24), n(250, 24), n(30, 156), n(250, 156)]; E = [[0, 1], [0, 2], [0, 3], [0, 4]]; steps = [[[0], [1], [2], [3]], [[0, 1, 'ok'], [1, 1, 'ok'], [2, 1, 'ok'], [3, 1, 'ok']]]; }
    if (k === 5) { N = [n(140, 18, 'accent'), n(70, 90), n(210, 90), n(30, 162, 'ink', 9), n(110, 162, 'ink', 9), n(170, 162, 'ink', 9), n(250, 162, 'ink', 9)]; E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]]; steps = [[[0], [1]], [[2], [3], [4], [5]]]; }
    const nodes = N.map(q => ({ ...q, d: mkDot(gN, c[q.col], { glow: 0.1, sw: 1.5, ring: 5 }) }));
    const edges = E.map(([i, j, bend = 0, col = 'ink']) => {
      const p = mkPath(gE, curve(N[i], N[j], bend, N[i].r + 5, N[j].r + 8), c[col], col === 'ink' ? 0.45 : 0.8, 2.2);
      return { p, hd: mkHead(gE, c[col], col === 'ink' ? 0.6 : 0.9, 2.2, 8), i, j };
    });
    const pk = [0, 1, 2, 3].map(() => mkPk(gK, c.accent2, 5));
    const pkOk = [0, 1, 2, 3].map(() => mkPk(gK, c.ok, 5));
    const pkBad = mkPk(gK, c.bad, 5);
    return { g, nodes, edges, steps, pk, pkOk, pkBad, k };
  }
  function patRender(o, a, p) {
    const pulse = new Array(o.nodes.length).fill(0);
    o.edges.forEach((e, i) => { const q = prog(p, 0.25 + i * 0.06, 0.55, ease.inOutCubic); drawP(e.p, q, 1); headOn(e.hd, e.p, q, 1); });
    const live = p >= 1 ? 1 : 0;
    [...o.pk, ...o.pkOk, o.pkBad].forEach(g => vis(g, false));
    if (live && o.k === 2) {
      // 전문가 선택: 매번 한 명만 고른다
      const per = 1.6, cyc = Math.floor(a / per), u = fr(a / per), pick = [0, 2, 1][mod(cyc, 3)], e = o.edges[pick];
      if (u < 0.6) pkOn(o.pk[0], e.p, ease.inOutSine(u / 0.6), 1);
      else pulse[e.j] = Math.exp(-(u - 0.6) * per / 0.25);
      o.edges.forEach((ed, i) => { ed.p.style.opacity = i === pick ? '1' : '0.35'; });
    } else if (live) {
      const R = runRoute(o.steps, a, 0.65, 0.2, 0.45);
      if (R.moving) R.moving.step.forEach(([ei, rev, col], m) => {
        const e = o.edges[ei], g = col === 'ok' ? o.pkOk[m] : col === 'bad' ? o.pkBad : o.pk[m];
        pkOn(g, e.p, rev ? 1 - R.moving.u : R.moving.u, 1);
      });
      if (R.hit) R.hit.step.forEach(([ei, rev]) => { const e = o.edges[ei]; pulse[rev ? e.i : e.j] = Math.max(pulse[rev ? e.i : e.j], Math.exp(-R.hit.dt / 0.22)); });
    }
    o.nodes.forEach((nd, i) => { const q = prog(p, i * 0.05, 0.45, ease.pop); setDot(nd.d, nd.x, nd.y, nd.r * Math.max(0.01, q), q > 0 ? 1 : 0, pulse[i] * live); });
  }
  DECK.slide({
    id: 'patterns', holds: [], dur: 3.55,
    notes: '팀의 구조는 여섯 가지로 정리됩니다. 앞 단계 결과를 다음 단계가 받는 순차 구조, 여럿이 동시에 하고 하나로 모으는 병렬 구조입니다. 일에 따라 맞는 전문가를 고르는 구조, 만드는 쪽과 검토하는 쪽을 짝지은 구조입니다. 가운데에서 일을 나눠 주는 구조, 위에서 아래로 단계마다 맡기는 구조입니다. 처음이라면 넷째, 생성 후 검토부터 권합니다. 가장 작은 팀입니다.',
    camTrack: [[960, 580, 1.05]],
    cameraHook(t) { return trackHook(t, [960, 330, 1.2], [960, 580, 1.05], 0.2, 2.6); },
    setup(el) {
      const $ = this.$;
      $.cells = PATS.map((pt, i) => {
        const X = PCX[i % 2], Y = PCY[Math.floor(i / 2)];
        const frame = h('div', 'a', el);
        css(frame, { left: X + 'px', top: Y + 'px', width: PCW - 20 + 'px', height: PCH - 20 + 'px', borderRadius: '20px', border: '2px dashed var(--line2)', opacity: 0 });
        const sv = svgFull(el, 290, 180, X + 26, Y + 20);
        const net = patNet(sv, i);
        const ko = tx(el, pt.ko, { x: X + 340, y: Y + 54, size: 46, w: 900, font: DISP, ls: '-.02em' });
        const en = tx(el, pt.en, { x: X + 342, y: Y + 122, size: 28, w: 500, font: 'var(--mono)', color: 'var(--mut)', width: 320, lh: 1.25 });
        return { frame, net, ko, en };
      });
      $.mk = U.mark($.cells[3].ko);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = smooth(0.1, 0.8, x.arrive);
      const ST = [0.1, 0.8, 1.5];
      $.cells.forEach((cl, i) => {
        const r = Math.floor(i / 2), st = ST[r] + (i % 2) * 0.18, p = prog(t, st, 1.2, ease.linear);
        const on = prog(t, st, 0.4, ease.linear);
        show(cl.frame, Math.max(pre * 0.7, 0.7 + 0.3 * on));
        cl.frame.style.borderStyle = on > 0 ? 'solid' : 'dashed';
        cl.frame.style.background = `color-mix(in srgb, var(--bg1) ${(on * 55).toFixed(0)}%, transparent)`;
        patRender(cl.net, a + i * 0.4, p);
        wipe(cl.ko, t, st + 0.3, { pre: i < 2 ? preOf(x) : 0 });   // 첫 줄 두 이름은 들어오는 밀기와 함께 보인다
        up(cl.en, t, st + 0.45, { dy: 14 });
      });
      $.mk.render(t, 2.75, 0.5);
    },
  });

  // ═════════════════════ 61 pge: 만드는 쪽과 평가하는 쪽을 나눈다 ═════════════════════
  // 세 칸(기획자 → 생성자 → 평가자). 평가자에서 생성자로 돌아가는 「실패」 화살표(bad)와 앞으로 가는 「통과」(ok).
  // 평가자 아래 브라우저 창(커서가 눌러 봄)과 설명. 조각이 경로를 따라 돈다
  // 빌드 1개(한 클릭 개편): 세 역할(t 0.05~1.25) → 실패·통과 화살표(t 1.0~2.15) → 브라우저 창과 설명(t 1.75~2.69), 밑줄 2.5~3.0
  const PGE = [['기획자', 420], ['생성자', 860], ['평가자', 1300]], PY = 470;
  DECK.slide({
    id: 'pge', holds: [], dur: 3.3,
    chrome: { source: SRC.harness },
    setup(el) {
      const $ = this.$, c = C();
      $.k = tx(el, 'Anthropic, 2026년 3월', { x: 200, y: 182, size: 36, w: 600, color: 'var(--accent2)' });
      $.sv = svgFull(el);
      const gE = s('g', {}, $.sv), gK = s('g', {}, $.sv);
      $.cards = PGE.map(([name, cx], i) => {
        const box = h('div', 'a', el);
        css(box, { left: cx - 150 + 'px', top: PY - 76 + 'px', width: '300px', height: '152px', borderRadius: '22px', background: 'var(--card)', border: '2px solid var(--line)', boxShadow: '0 18px 40px rgba(0,0,0,.35)', opacity: 0 });
        const dsv = svgFull(box, 60, 60, 30, 46);
        const dot = mkDot(dsv, i === 2 ? c.accent : c.ink, { ring: 6 });
        const nm = tx(box, name, { x: 104, y: 44, size: 50, w: 900, font: DISP, ls: '-.02em' });
        return { box, dot, nm, cx };
      });
      const P2 = (x, y) => ({ x, y });
      $.e1 = mkPath(gE, curve(P2(574, PY), P2(706, PY)), c.ink, 0.6, 3); $.h1 = mkHead(gE, c.ink, 0.8, 3);
      $.e2 = mkPath(gE, curve(P2(1014, PY), P2(1146, PY)), c.ink, 0.6, 3); $.h2 = mkHead(gE, c.ink, 0.8, 3);
      $.fail = mkPath(gE, curve(P2(1270, PY - 80), P2(890, PY - 80), 0.42), c.bad, 0.95, 3.5); $.hf = mkHead(gE, c.bad, 1, 3.5, 13);
      $.pass = mkPath(gE, curve(P2(1454, PY), P2(1596, PY)), c.ok, 0.95, 3.5); $.hp = mkHead(gE, c.ok, 1, 3.5, 13);
      $.okDot = mkDot(gE, c.ok, { ring: 6 });
      $.okCk = s('path', { d: 'M-9,0 l6,6 l12,-13', fill: 'none', stroke: rgba(c.bg0, 1), 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: `translate(1640,${PY})` }, gE);
      $.lFail = tx(el, '실패', { cx: 1080, y: 238, size: 40, w: 800, color: 'var(--bad)' });
      $.lPass = tx(el, '통과', { cx: 1525, y: 400, size: 40, w: 800, color: 'var(--ok)' });
      $.pk = mkPk(gK, c.accent2, 7); $.pkB = mkPk(gK, c.bad, 7); $.pkO = mkPk(gK, c.ok, 7);
      // 빌드 3: 평가자 아래 브라우저 창 + 설명
      $.conn = mkPath(gE, curve(P2(1300, PY + 80), P2(1300, 612)), c.accent, 0.8, 2.5);
      $.win = h('div', 'a', el);
      css($.win, { left: '1090px', top: '614px', width: '420px', height: '270px', borderRadius: '14px', background: 'var(--bg1)', border: '2px solid var(--line)', overflow: 'hidden', opacity: 0, boxShadow: '0 18px 40px rgba(0,0,0,.4)' });
      const bar = h('div', 'a', $.win); css(bar, { left: 0, top: 0, width: '420px', height: '34px', background: 'color-mix(in srgb, var(--ink) 8%, transparent)' });
      [0, 1, 2].forEach(i => { const d = h('div', 'a', bar); css(d, { left: 16 + i * 20 + 'px', top: '12px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--mut)', opacity: 0.6 }); });
      const addr = h('div', 'a', bar); css(addr, { left: '86px', top: '9px', width: '300px', height: '16px', borderRadius: '8px', background: 'color-mix(in srgb, var(--ink) 10%, transparent)' });
      const blk = (l, t2, w, hh, bg) => { const d = h('div', 'a', $.win); css(d, { left: l + 'px', top: t2 + 'px', width: w + 'px', height: hh + 'px', borderRadius: '6px', background: bg }); return d; };
      blk(24, 56, 240, 18, 'color-mix(in srgb, var(--ink) 22%, transparent)');
      blk(24, 86, 360, 10, 'color-mix(in srgb, var(--ink) 10%, transparent)');
      blk(24, 104, 300, 10, 'color-mix(in srgb, var(--ink) 10%, transparent)');
      $.btns = [[24, 140], [164, 140], [24, 196]].map(([l, t2]) => blk(l, t2, 120, 40, 'color-mix(in srgb, var(--accent2) 30%, transparent)'));
      $.ripple = h('div', 'a', $.win); css($.ripple, { width: '60px', height: '60px', marginLeft: '-30px', marginTop: '-30px', borderRadius: '50%', border: '3px solid var(--accent2)', opacity: 0 });
      $.res = svgFull($.win, 40, 40, 360, 200);
      $.resX = s('path', { d: 'M8,8 L32,32 M32,8 L8,32', stroke: rgba(c.bad, 1), 'stroke-width': 5, 'stroke-linecap': 'round' }, $.res);
      $.resK = s('path', { d: 'M6,21 l9,9 l19,-21', fill: 'none', stroke: rgba(c.ok, 1), 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $.res);
      $.cur = svgFull($.win, 30, 40, 0, 0);
      s('path', { d: 'M2,2 L2,30 L10,23 L15,35 L20,33 L15,21 L25,21 Z', fill: rgba(c.ink, 1), stroke: rgba(c.bg0, 1), 'stroke-width': 2, 'stroke-linejoin': 'round' }, $.cur);
      $.d = ['평가자는 실행 중인 앱을', '사용자 방식으로 테스트하고,', '기준에 못 미치면 실패로 처리한다'].map((v, i) => tx(el, v, { right: 1040, y: 636 + i * 62, size: 42, w: 600 }));
      $.mk = U.mark($.d[1], { word: '사용자 방식으로' });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = smooth(0.1, 0.8, x.arrive);
      up($.k, t, 0.05);
      $.cards.forEach((cd, i) => {
        const p = prog(t, 0.15 + i * 0.12, 0.55, ease.pop);
        show(cd.box, Math.max(pre * 0.5, prog(t, 0.15 + i * 0.12, 0.2, ease.linear)));
        cd.box.style.transform = `translateY(${F((1 - p) * 40)}px) scale(${lerp(0.9, 1, p).toFixed(4)})`;
        wipe(cd.nm, t, 0.3 + i * 0.12);
      });
      const q1 = prog(t, 0.55, 0.45, ease.inOutCubic), q2 = prog(t, 0.8, 0.45, ease.inOutCubic);
      drawP($.e1, q1); headOn($.h1, $.e1, q1); drawP($.e2, q2); headOn($.h2, $.e2, q2);
      const qf = prog(t, 1.0, 0.6, ease.inOutCubic), qp = prog(t, 1.35, 0.45, ease.inOutCubic);
      drawP($.fail, qf); headOn($.hf, $.fail, qf); drawP($.pass, qp); headOn($.hp, $.pass, qp);
      const okp = prog(t, 1.65, 0.45, ease.pop);
      up($.lFail, t, 1.3, { dy: 18 }); up($.lPass, t, 1.6, { dy: 18 });
      // 조각 경로: 실패하면 생성자로 돌아가고 세 번째에 통과. 화살표가 모두 그려진 뒤(t 1.6) 나타난다
      // (이전 2빌드의 「앞 두 칸만 도는 경로 → 전체 경로」 전환은 빌드가 하나라 0.6초 만에 바뀌어 지웠다)
      const EDG = { 1: $.e1, 2: $.e2, f: $.fail, p: $.pass };
      const steps = [['1'], ['2'], ['f'], ['2'], ['f'], ['2'], ['p']];
      const R = runRoute(steps, a - 1.6, 0.7, 0.3, 0.8);
      vis($.pk, false); vis($.pkB, false); vis($.pkO, false);
      const live = prog(t, 1.6, 0.3, ease.linear);
      let pul = [0, 0, 0], okPul = 0;
      if (R.moving) { const id = R.moving.step[0], g = id === 'f' ? $.pkB : id === 'p' ? $.pkO : $.pk; pkOn(g, EDG[id], R.moving.u, live); }
      if (R.hit) { const id = R.hit.step[0], v = Math.exp(-R.hit.dt / 0.25) * live; if (id === '1') pul[1] = v; if (id === '2') pul[2] = v; if (id === 'f') pul[1] = v; if (id === 'p') okPul = v; }
      $.cards.forEach((cd, i) => setDot(cd.dot, 30, 30, 13, 1, pul[i]));
      setDot($.okDot, 1640, PY, 22 * Math.max(0.01, okp), okp > 0 ? 1 : 0, okPul);
      $.okCk.style.opacity = okp.toFixed(3);
      // 셋째 묶음: 브라우저 창과 설명
      const cq = prog(t, 1.75, 0.4, ease.inOutCubic);
      drawP($.conn, cq);
      const wp = prog(t, 1.85, 0.55, ease.pop);
      show($.win, prog(t, 1.85, 0.2, ease.linear));
      $.win.style.transform = `translateY(${F((1 - wp) * 40)}px) scale(${lerp(0.92, 1, wp).toFixed(4)})`;
      $.d.forEach((d, i) => wipe(d, t, 1.85 + i * 0.12, { from: 'r' }));
      $.mk.render(t, 2.5, 0.5);
      // 커서: 버튼 세 개를 차례로 누르고, 결과 표시가 실패 → 실패 → 통과
      const per = 1.5, cyc = Math.floor(a / per), u = fr(a / per), bi = mod(cyc, 3), nb = mod(cyc + 1, 3);
      const [bx0, by0] = [[84, 160], [224, 160], [84, 216]][bi], [bx1, by1] = [[84, 160], [224, 160], [84, 216]][nb];
      const mvq = ease.inOutCubic(clamp((u - 0.55) / 0.45));
      const cx = lerp(bx0, bx1, mvq), cy = lerp(by0, by1, mvq) - 30 * Math.sin(Math.PI * mvq);
      $.cur.style.transform = `translate(${F(cx - 2)}px, ${F(cy - 2)}px) scale(${(1 - 0.12 * Math.exp(-u / 0.08)).toFixed(3)})`;
      css($.ripple, { left: bx0 + 'px', top: by0 + 'px', opacity: (0.9 * (1 - clamp(u / 0.5))).toFixed(3), transform: `scale(${(0.3 + 1.2 * clamp(u / 0.5)).toFixed(3)})` });
      $.btns.forEach((b, i) => { b.style.background = i === bi && u < 0.4 ? 'color-mix(in srgb, var(--accent2) 65%, transparent)' : 'color-mix(in srgb, var(--accent2) 30%, transparent)'; });
      const pass = mod(cyc, 3) === 2, rv = clamp((u - 0.12) / 0.15) * (1 - clamp((u - 1.0) / 0.1));
      $.resX.style.opacity = (pass ? 0 : rv).toFixed(3); $.resK.style.opacity = (pass ? rv : 0).toFixed(3);
    },
  });

  // ═════════════════════ 62 cost-quality: 20분 9달러와 6시간 200달러 ═════════════════════
  // 좌우 두 카드. 시간은 선 길이(1분 = 1.1px), 비용은 점 개수(1달러 = 점 하나). 오른쪽 카드가 더 크게 나온다
  // 빌드 1개(한 클릭 개편): 왼쪽 단독 에이전트(t 0.15~1.8) → 오른쪽 전체 하네스(t 1.0~2.65)
  function costCard(el, o) {
    const c = C(), box = h('div', 'a', el), k = o.k;
    css(box, { left: o.x + 'px', top: o.y + 'px', width: o.w + 'px', height: o.hh + 'px', borderRadius: '26px', background: 'var(--card)', border: `2px solid ${o.border}`, boxShadow: '0 22px 50px rgba(0,0,0,.4)', opacity: 0, transformOrigin: '50% 60%' });
    const lab = tx(box, o.label, { x: 44, y: 34, size: 42 * k, w: 800, color: o.labCol });
    const tn = tx(box, numH('', o.tN, o.tU, 150 * k, 58 * k), { x: 40, y: 98, size: 58 * k, w: 800, lh: 1.1 });
    const mn = tx(box, numH('', o.mN, '', 150 * k, 58 * k), { x: o.mx, y: 98, size: 58 * k, w: 800, lh: 1.1 });
    const sv = svgFull(box, o.w, o.hh);
    const ty = 98 + 190 * k;
    const track = s('line', { x1: 44, x2: 44 + 396, y1: ty, y2: ty, stroke: rgba(c.ink, 0.18), 'stroke-width': 10, 'stroke-linecap': 'round' }, sv);
    if (!o.track) track.style.display = 'none';
    const tl = s('line', { x1: 44, x2: 44 + o.minutes * 1.1, y1: ty, y2: ty, stroke: rgba(c.accent2, 1), 'stroke-width': 10, 'stroke-linecap': 'round' }, sv);
    const tick = s('circle', { cx: 44, cy: ty, r: 9, fill: rgba(c.ink, 1) }, sv);
    const dots = Array.from({ length: o.dollars }, (_, i) => s('circle', { cx: o.mx + 8 + (i % o.cols) * 18, cy: ty - 2 + Math.floor(i / o.cols) * 18, r: 5.5, fill: rgba(c.ink, 0.9) }, sv));
    return { box, lab, tn, mn, tl, tick, ty, dots, o };
  }
  function costRender(cd, t, a, st, op) {
    const p = prog(t, st, 0.6, ease.pop);
    show(cd.box, prog(t, st, 0.2, ease.linear) * op);
    cd.box.style.transform = `translateY(${F((1 - p) * 50)}px) scale(${(lerp(0.88, 1, p) * lerp(0.96, 1, op)).toFixed(4)})`;
    wipe(cd.lab, t, st + 0.15);
    up(cd.tn, t, st + 0.25, { dy: 40, e: ease.pop }); up(cd.mn, t, st + 0.35, { dy: 40, e: ease.pop });
    const L = cd.o.minutes * 1.1, lq = prog(t, st + 0.5, 0.9, ease.outCubic);
    cd.tl.setAttribute('x2', F(44 + Math.max(0.5, L * lq))); cd.tl.style.opacity = (lq > 0 ? 1 : 0).toFixed(3);
    cd.tick.setAttribute('cx', F(44 + L * lq + 0)); cd.tick.style.opacity = (lq > 0 ? 1 : 0).toFixed(3);
    cd.tick.setAttribute('r', F(9 + 1.5 * Math.sin(a * 3)));
    const n = cd.dots.length, wave = fr(a * 0.35) * (cd.o.cols + 8) - 4;
    cd.dots.forEach((d, i) => {
      const q = prog(t, st + 0.55 + (i / n) * 0.9, 0.2, ease.linear), col = i % cd.o.cols;
      const w = Math.max(0, 1 - Math.abs(col - wave) / 2.5);
      d.style.opacity = (q * (0.55 + 0.45 * w)).toFixed(3);
    });
  }
  DECK.slide({
    id: 'cost-quality', holds: [], dur: 3.0,
    chrome: { source: SRC.harness },
    setup(el) {
      const $ = this.$;
      $.k = tx(el, '같은 글 · 레트로 게임 제작', { x: 200, y: 176, size: 40, w: 700, color: 'var(--ink)' });
      // 두 카드는 같은 짜임: 왼쪽에 시간(숫자 + 396px 트랙 = 6시간), 오른쪽 x 470부터 비용(숫자 + 점). 세로 가운데 y 572에 맞춤
      $.L = costCard(el, { x: 200, y: 397, w: 660, hh: 350, k: 1, label: '단독 에이전트', labCol: 'var(--ink)', tN: '20', tU: '분', mN: '$9', mx: 470, minutes: 20, dollars: 9, cols: 9, track: true, border: 'var(--line)' });
      $.R = costCard(el, { x: 900, y: 312, w: 860, hh: 520, k: 1.14, label: '전체 하네스', labCol: 'var(--accent)', tN: '6', tU: '시간', mN: '$200', mx: 470, minutes: 360, dollars: 200, cols: 20, track: true, border: 'color-mix(in srgb, var(--accent) 55%, var(--line))' });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = smooth(0.1, 0.8, x.arrive);
      up($.k, t, 0.05, { pre: preOf(x) });                        // 위 줄은 들어오는 밀기와 함께 들어온다
      // 끝 화면에서 두 카드가 모두 읽히게 왼쪽 카드를 흐리거나 줄이지 않는다(이전 2빌드: 0.62)
      costRender($.L, t, a, 0.15, 1);
      if (t < 0.15) show($.L.box, pre * 0.35);
      costRender($.R, t, a, 1.0, 1);
    },
  });

  // ═════════════════════ 63 c-compiler: 병렬 에이전트 16개로 2주 ═════════════════════
  // 숫자 넷이 차례로 찍힌다(16개 아래 점 16개가 동시에 깜빡임). 결과 한 줄과 길게 자라는 코드 줄 막대.
  // 「Linux 6.9를 빌드」 + 형광 밑줄, 막대 끝에 확인 표시
  // 빌드 1개(한 클릭 개편): 숫자 넷(t 0.25~1.46) → 결과와 코드 막대(t 1.2~2.4) → Linux 6.9·확인 표시(t 1.95~2.55), 밑줄 2.4~2.9
  DECK.slide({
    id: 'c-compiler', holds: [], dur: 3.3,
    notes: '규모를 키운 사례입니다. C 컴파일러는 사람이 쓴 프로그램을 컴퓨터가 실행하는 형태로 바꾸는 프로그램입니다. Anthropic 연구자가 이것을 만들려고 Claude 열여섯 개를 동시에 돌렸습니다. 2주 동안 약 이천 번의 세션, 비용은 2만 달러 미만이었습니다. 나온 것은 약 10만 줄짜리 C 컴파일러입니다. 이 컴파일러로 리눅스 커널을 빌드했습니다. 사람은 코드를 쓰지 않고 테스트와 작업 규칙을 만들었습니다.',
    chrome: { source: SRC.compiler },
    setup(el) {
      const $ = this.$, c = C(), before = new Set(el.children);
      $.k = tx(el, 'Anthropic, 2026년 2월 · C 컴파일러 제작', { x: 200, y: 176, size: 38, w: 600, color: 'var(--accent2)' });
      const B = [['병렬 Claude', '', '16', '개'], ['', '', '2', '주'], ['', '약 ', '2,000', '세션'], ['', '', '2', '만 달러 미만']];
      $.blocks = B.map(([lab, pre2, n, u]) => ({
        lab: lab ? tx(el, lab, { x: 0, y: 262, size: 34, w: 600, color: 'var(--mut)' }) : null,
        num: tx(el, numH(pre2, n, u, 136, 44), { x: 0, y: 312, size: 44, w: 700, lh: 1.1 }),
      }));
      // 네 덩어리를 200~1720 사이에 같은 간격으로
      const ws = $.blocks.map(b => b.num.offsetWidth), gapW = (1520 - ws.reduce((p, q) => p + q, 0)) / 3;
      let X = 200;
      $.blocks.forEach((b, i) => { b.num.style.left = X + 'px'; if (b.lab) b.lab.style.left = X + 'px'; b.x = X; X += ws[i] + gapW; });
      $.sv = svgFull(el);
      $.d16 = Array.from({ length: 16 }, (_, i) => s('circle', { cx: 210 + (i % 8) * 22, cy: 498 + Math.floor(i / 8) * 22, r: 6, fill: rgba(c.accent, 1) }, $.sv));
      $.res = tx(el, '약 10만 줄 컴파일러,', { x: 200, y: 590, size: 66, w: 900, font: DISP, ls: '-.02em' });
      $.res2 = tx(el, 'Linux 6.9를 빌드', { x: 200 + $.res.offsetWidth + 22, y: 590, size: 66, w: 900, font: DISP, ls: '-.02em' });
      $.mk = U.mark($.res2);
      // 코드 줄 막대: 짧은 가로선 묶음(설정할 때 한 번 그림)
      $.code = h('canvas', '', el); $.code.width = 1520; $.code.height = 90;
      css($.code, { position: 'absolute', left: '200px', top: '720px', width: '1520px', height: '90px', clipPath: 'inset(0 100% 0 0)' });
      const g = $.code.getContext('2d');
      for (let col = 0; col < 380; col++) for (let r = 0; r < 9; r++) {
        const L = 3 + rand(col * 9 + r, 5) * 9 * (rand(col, 6) < 0.15 ? 0.3 : 1);
        g.fillStyle = rgba(rand(col * 9 + r, 8) < 0.12 ? c.accent2 : c.ink, 0.25 + rand(col * 9 + r, 7) * 0.45);
        g.fillRect(col * 4, 4 + r * 9.5, Math.max(1, L * 0.36), 3.2);
      }
      $.scan = h('div', 'a', el);
      css($.scan, { left: '200px', top: '714px', width: '120px', height: '102px', background: `linear-gradient(90deg, rgba(0,0,0,0), ${rgba(c.accent2, 0.2)}, rgba(0,0,0,0))`, opacity: 0 });
      $.end = mkDot($.sv, c.ok, { ring: 7 });
      $.endCk = s('path', { d: 'M-9,0 l6,6 l12,-13', fill: 'none', stroke: rgba(c.bg0, 1), 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(1720,765)' }, $.sv);
      // 내용 전체를 한 겹에: dolly-in 확대(최대 1.064배)를 이 층에서 절반만 받는다(최대 1.031배).
      // 숫자 줄(x 200~1720)과 결과 줄이 끝 화면에서 x 151~1769 → 176~1744로 175px 여백 안에 든다
      $.wrap = gather(el, before);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = smooth(0.1, 0.8, x.arrive);
      $.wrap.style.transform = pinW(x, 0.5);
      up($.k, t, 0.05, { pre: preOf(x) });                        // 위 줄은 들어오는 밀기와 함께 들어온다
      const dim1 = 1;                                             // 끝 화면에서 숫자 넷이 읽히게 흐리지 않는다(이전 3빌드: 0.55)
      $.blocks.forEach((b, i) => {
        const st = 0.3 + i * 0.22;
        if (b.lab) up(b.lab, t, st - 0.05, { dy: 16, op: dim1 });
        const p = prog(t, st, 0.5, ease.pop);
        show(b.num, prog(t, st, 0.15, ease.linear) * dim1);
        b.num.style.transform = `translateY(${F((1 - p) * 50)}px) scale(${lerp(0.85, 1, p).toFixed(4)})`;
        b.num.style.transformOrigin = '0 80%';
      });
      $.d16.forEach((d, i) => {
        const q = prog(t, 0.4 + i * 0.02, 0.3, ease.linear);
        d.style.opacity = (q * dim1 * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a * 2.4 + i * 1.7)))).toFixed(3);
      });
      wipe($.res, t, 1.2);
      const bq = prog(t, 1.3, 1.1, ease.outCubic);
      $.code.style.clipPath = `inset(0 ${(100 - 100 * bq).toFixed(2)}% 0 0)`;
      $.code.style.opacity = Math.max(pre * 0.2, bq > 0 ? 1 : 0).toFixed(3);
      if (pre < 1 && bq <= 0) $.code.style.clipPath = `inset(0 ${(100 - 30 * pre).toFixed(2)}% 0 0)`;
      const sx = fr(a * 0.22) * 1640 - 120;
      css($.scan, { opacity: (bq >= 1 ? 1 : 0).toFixed(3), transform: `translateX(${F(sx)}px)` });
      wipe($.res2, t, 1.95);
      $.mk.render(t, 2.4, 0.5);
      const ep = prog(t, 2.05, 0.45, ease.pop);
      setDot($.end, 1720, 765, 22 * Math.max(0.01, ep), ep > 0 ? 1 : 0, 0.3 + 0.3 * Math.sin(a * 2));
      $.endCk.style.opacity = ep.toFixed(3);
    },
  });

  // ═════════════════════ 64 c-compiler-limit: 같은 글에 적힌 한계 ═════════════════════
  // 꾸밈 없이 글자만. serif, 왼쪽 정렬, 왼쪽에 mut 세로선(선 위로 옅은 빛이 천천히 내려감). 한계 두 줄, 빌드 1개
  //   제목 y 336 · 두 줄 y 492·600 · 세로선 336~708: 글 덩어리(336~668)의 세로 가운데가 화면 가운데(약 500)에 오게 내렸다
  const LIM_Y = 336;
  DECK.slide({
    id: 'c-compiler-limit', holds: [], dur: 2.4,
    notes: '한계도 같은 글에 적혀 있습니다. 일부 기능은 완성하지 못했고, 만든 결과는 기존 컴파일러보다 느립니다. 성과와 한계를 같은 글에 적었기 때문에 이 사례를 골랐습니다.',
    chrome: { source: SRC.compiler },
    setup(el) {
      const $ = this.$, c = C();
      $.line = h('div', 'a', el);
      css($.line, { left: '236px', top: LIM_Y + 'px', width: '3px', height: '372px', background: 'var(--mut)', opacity: 0.6, transformOrigin: '50% 0', transform: 'scaleY(0)' });
      $.glow = h('div', 'a', el);
      css($.glow, { left: '233px', top: LIM_Y + 'px', width: '9px', height: '90px', borderRadius: '5px', background: `linear-gradient(${rgba(c.ink, 0)}, ${rgba(c.ink, 0.55)}, ${rgba(c.ink, 0)})`, opacity: 0 });
      $.h = tx(el, '같은 글에 적힌 한계', { x: 290, y: LIM_Y, size: 64, w: 900, font: 'var(--serif)', ls: '-.02em' });
      $.lines = ['일부 기능은 완성하지 못했다', '만든 결과는 기존 컴파일러보다 느리다'].map((v, i) => tx(el, v, { x: 290, y: LIM_Y + 156 + i * 108, size: 52, w: 500, font: 'var(--serif)', color: 'var(--ink)' }));
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = smooth(0.1, 0.8, x.arrive);
      $.line.style.transform = `scaleY(${Math.max(pre * 0.35, prog(t, 0, 0.9, ease.inOutCubic)).toFixed(4)})`;
      wipe($.h, t, 0.1, { dur: 0.7, pre: preOf(x) });            // 제목은 들어오는 밀기와 함께 열린다
      $.lines.forEach((l, i) => up(l, t, 0.55 + i * 0.25, { dy: 26, dur: 0.6 }));
      const g = fr(a * 0.12);
      css($.glow, { opacity: (prog(t, 1.2, 0.6, ease.linear) * Math.sin(Math.PI * g)).toFixed(3), transform: `translateY(${F(g * 282)}px)` });
    },
  });

  // ═════════════════════ 65 recap-team: 정리 — 팀.md ═════════════════════
  // 왼쪽 파일 트리(네 줄째까지 확인 표시, 「팀.md」에 형광 밑줄). 오른쪽 요약(display 68px)과 「팀에 맡긴다」 밑줄(시각 1.45·0.55는 효과음에 맞춤).
  // 아래 두 줄. 오른쪽에 kv_team 사진(가운데 노랑 카드 하나와 둘레 카드 넷)을 액자로 둔다
  // 빌드 1개(한 클릭 개편): 파일 트리·확인 표시(1.3)·밑줄(1.45~2.0) 시각은 그대로 두고, 이전 2빌드의 두 줄을 그 뒤 t 1.7·1.82에 잇는다(~2.37)
  DECK.slide({
    id: 'recap-team', holds: [], dur: 2.75,
    notes: '넷째 파일 정리입니다. 나뉘는 일은 팀에 맡깁니다. 만드는 쪽과 확인하는 쪽을 나누는 것부터 시작합니다. 그런데 이 팀을 매번 직접 구성하기는 번거롭습니다.',
    setup(el) {
      const $ = this.$;
      // 사진의 카드 다섯 장은 왼쪽 절반에 있다: cover로 채우고 왼쪽 끝에 맞춘다(380×420 칸에 원본 x 0~1222가 들어옴)
      $.kv = U.image(el, 'assets/img/kv_team.png', { x: 1380, y: 330, w: 380, h: 420, radius: 18 });
      css($.kv.el, { border: '2px solid var(--line)', boxShadow: '0 24px 60px rgba(0,0,0,.5)', opacity: 0 });
      if (!$.kv.missing) css($.kv.img, { objectPosition: '0% 50%', transformOrigin: '32% 52%', filter: 'brightness(.94)' });
      $.tree = U.fileTree(el, { preset: 'side', current: 'c04', done: 4, at: 0, each: 0.1 });
      $.k = tx(el, '팀.md', { x: 640, y: 336, size: 38, w: 700, font: 'var(--mono)', color: 'var(--accent)' });
      $.h = tx(el, '나뉘는 일은 팀에 맡긴다', { x: 636, y: 396, size: 68, w: 900, font: DISP, ls: '-.03em' });
      $.mk = U.mark($.h, { word: '팀에 맡긴다' });
      $.s = ['만드는 쪽과 확인하는 쪽을', '나누는 것부터 시작한다'].map((v, i) => tx(el, v, { x: 640, y: 540 + i * 62, size: 42, w: 600, color: 'var(--ink)' }));
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = smooth(0.0, 0.7, x.arrive);
      const kp = prog(t, 0.45, 0.7, ease.outCubic);
      show($.kv.el, Math.max(pre * 0.35, kp));
      $.kv.el.style.transform = `translateY(${F((1 - kp) * 36)}px)`;
      if (!$.kv.missing) $.kv.img.style.transform = `scale(${(1.03 + 0.025 * Math.sin(a * 0.35)).toFixed(4)}) translateX(${F(-4 * Math.sin(a * 0.22))}px)`;
      $.tree.render(t);
      // 「팀.md」와 요약 제목은 들어오는 밀기와 함께 들어온다(파일 트리와 밑줄 시각은 그대로: 효과음 시각과 맞춰 둠)
      const pv = preOf(x);
      up($.k, t, 0.25, { dy: 20, pre: pv });
      up($.h, t, 0.35, { dy: 40, pre: pv });
      $.mk.render(t, 1.45, 0.55);
      $.s.forEach((v, i) => up(v, t, 1.7 + i * 0.12, { dy: 30 }));
    },
  });
})();
