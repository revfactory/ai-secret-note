/* 6장 「사례.md: 결과물로 확인한다」 — 슬라이드 78~93 (slides/c06_cases.js)
 *   78 v-cases(영상) · 79 report-harness · 80 webtoon-team · 81 webtoon-ssot · 82 webtoon-result · 83 game-request
 *   84 game-v1v2 · 85 game-3d · 86 game-qa · 87 drama-team · 88 v-drama-teaser(영상) · 89 v-drama-team(영상) · 90 v-patent(영상)
 *   91 this-deck · 92 this-deck-review · 93 recap-cases  (2026-11-17: 결재 대기함 사례를 드라마 대본 사례와 영상 세 편으로 바꿈)
 * 검은 바탕(plain) 위에 실제 결과물 화면을 놓는다. 사진은 얇은 테두리로 두르고 앞·뒤 층에 나눠 시차로 움직이며, 주석 선이 그려진다.
 * 노트·카메라 값은 스토리보드에서 읽는다. 다만 79·81·83·84·85·86번 노트는 아래 NOTES(리더가 정한 문구, 2026-11-16)로 덮어쓰고,
 * 83번은 들어오는 전환을 평면 밀기(camera.enter push)로 바꾼다. 경로 줄은 엔진 공통 크롬(chrome)이 그린다.
 * 이 장의 근거는 모두 발표자 본인 자료(이전 발표, 이 프로젝트의 CLAUDE.md·.claude/ 폴더)라 출처 줄(chrome.source)을 두지 않는다.
 */
(function () {
  'use strict';
  const { ease, prog, clamp, lerp, css, h, s, show, smooth, set } = DECK;
  const CASE = 'assets/cases/';
  const f1 = v => v.toFixed(1), f3 = v => v.toFixed(3), f4 = v => v.toFixed(4);
  const nn = i => String(i + 1).padStart(2, '0');
  const PERSP = 2000;   // 엔진 원근 거리 P(deck/engine.js). cameraHook에서 확대 배율 z를 머묾 오프셋 dz로 바꿀 때 쓴다

  // 노트: 아래 여섯 장은 리더가 정한 문구(2026-11-16 덱 전체 비평 반영 회차, 84번은 장 검수 수정 1회차)로 스토리보드 notes를 덮어쓴다.
  // 앞 장은 장 번호 대신 파일 이름(요청서.md·팀.md·자동구성.md)으로 가리킨다. 나머지 슬라이드는 스토리보드 notes를 그대로 쓴다
  const NOTES = {
    'report-harness': '가장 익숙한 업무부터 보겠습니다. 요청서.md에서 모호하다고 했던 그 요청입니다. 하네스가 있으면 오케스트레이터가 범위와 순서를 정하고, 리서처가 자료를 모읍니다. 분석가가 표로 정리하고, 작성자가 초안을 쓰고, 편집·검토 담당이 확인합니다. 단계마다 넘겨주는 파일이 있습니다. 검토를 통과한 것만 결과로 나옵니다. 같은 한 줄이 들어와도 오케스트레이터가 먼저 범위 문서를 써서 요청서의 빈칸을 채우고 시작합니다.',
    'webtoon-ssot': '웹툰에서 어려운 점은 같은 인물이 컷마다 같은 얼굴로 나오는 것입니다. 등장인물이 다섯입니다. 인물마다 기준 자산을 폴더 한 곳에 둡니다. 설정 파일, 정면과 측면 초상, 표정, 대표 자세입니다. 그림을 생성하는 에이전트는 매번 이 폴더를 읽습니다. 앞 대화에 기대지 않고 이 폴더의 파일을 기준으로 그립니다.',
    'game-request': '자동구성.md에서 본 게임입니다. 요청은 한 줄이었습니다. 에이전트 열두 개가 게임 제작을 여섯 단계로 나눠 맡습니다. 기획, 구조 설계, 그림 자산 생성, 구현, 테스트, 품질 검사입니다.',
    'game-v1v2': '첫 판입니다. 길이 있고, 타워를 놓고, 기본 전투가 됩니다. 둘째 판입니다. 몬스터가 움직이는 동작, 타워의 공격 동작, 단계별로 모양이 바뀌는 진화가 들어갔습니다. 첫 판의 파일과 기록이 남아 있어서, 둘째 판은 그 파일을 고치고 기능을 더해 만들었습니다.',
    'game-3d': '여기서 한 번 더 요청했습니다. 3D 제작 도구 Blender를 연결해서 이 게임을 3D로 다시 만들어 달라는 한 줄입니다. 에이전트 팀이 약 세 시간 동안 제 개입 없이 진행했습니다. 새 폴더를 만들고, Blender를 연결하고, 3D 물체를 만들었습니다. 결과입니다. 3D로 다시 만드는 데 약 세 시간, 첫 판부터 3D까지는 주말 두 번이 걸렸습니다.',
    'game-qa': '이 사례에서 제가 가장 눈여겨본 점입니다. 품질 검사 에이전트가 게임을 직접 플레이하면서 난이도를 조정했습니다. 만드는 역할과 검사하는 역할이 따로 있었기 때문에 가능했습니다. 팀.md에서 본 생성 후 검토 구조입니다.',
  };

  // ───────────── 도우미(이 장 안에서만 씀) ─────────────
  const div = (p, html, st, cls = 'a') => { const e = h('div', cls, p, html); if (st) css(e, st); return e; };
  const txt = (p, html, st) => div(p, html, st, 'a nw');
  const layer = p => h('div', 'full', p);
  function svgLayer(p) {
    const sv = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, p);
    css(sv, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible' });
    return sv;
  }
  function fadeUp(el, t, start, dur = 0.55, dy = 30) {
    const p = prog(t, start, dur);
    show(el, p);
    set(el, 'transform', `translateY(${f1((1 - p) * dy)}px)`);
    return p;
  }
  function path(svg, d, o = {}) {
    const p = s('path', { d, fill: o.fill || 'none', stroke: o.color || DECK.rgba('accent', 0.85), 'stroke-width': o.sw ?? 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    p.style.opacity = '0';
    return p;
  }
  // 선 그리기: 그린 만큼만 보인다. remeasure면 길이를 다시 잰다(끝점이 움직이는 선)
  function draw(pa, p, remeasure) {
    if (pa.$L == null || remeasure) pa.$L = pa.getTotalLength() || 1;
    const v = clamp(p);
    pa.style.opacity = v > 0.001 ? '1' : '0';
    pa.style.strokeDasharray = v >= 1 ? 'none' : `${f1(pa.$L * v)} ${f1(pa.$L + 40)}`;
    return v;
  }
  function headAt(svg, pa, o = {}) {
    const L = pa.getTotalLength(), b = pa.getPointAtLength(L), q = pa.getPointAtLength(Math.max(0, L - 3));
    const an = Math.atan2(b.y - q.y, b.x - q.x), k = o.k ?? 14;
    const P = d => `${f1(b.x + k * Math.cos(an + Math.PI + d))} ${f1(b.y + k * Math.sin(an + Math.PI + d))}`;
    return path(svg, `M${P(-0.55)} L${f1(b.x)} ${f1(b.y)} L${P(0.55)}`, o);
  }
  function arrow(svg, d, o = {}) {
    const p = path(svg, d, o), hd = o.noHead ? null : headAt(svg, p, o);
    return { p, hd, set(v) { const r = draw(p, v); if (hd) hd.style.opacity = r >= 0.97 ? '1' : '0'; return r; } };
  }
  // 사진: 얇은 테두리 + 그림자. 파일이 없으면 U.image가 같은 크기의 자리 표시를 그린다
  function photo(p, src, o) {
    const im = U.image(p, src, { x: o.x, y: o.y, w: o.w, h: o.h, radius: o.radius ?? 12, fit: o.fit || 'cover' });
    if (!im.missing) {
      css(im.el, { border: o.border ?? '1.5px solid var(--line)', boxShadow: o.shadow ?? '0 26px 60px rgba(0,0,0,.5)' });
      if (o.pos) im.img.style.objectPosition = o.pos;
    }
    im.el.style.opacity = '0';
    return im;
  }
  // 누끼 PNG(투명 바탕). U.image는 상자 바탕을 칠하므로 따로 그린다
  function cutout(p, src, o) {
    const im = DECK.img(src);
    if (im.missing) return U.image(p, src, o);
    const box = div(p, '', { left: o.x + 'px', top: o.y + 'px', width: o.w + 'px', height: o.h + 'px' });
    css(im, { width: '100%', height: '100%', objectFit: 'contain', display: 'block' });
    box.appendChild(im);
    return { el: box, img: im, missing: false };
  }
  const kb = (im, sc) => { if (im && im.img && !im.missing) set(im.img, 'transform', `scale(${f4(sc)})`); };
  // 타자: 글자 단위로 보이게 한다(숨은 글자도 자리를 차지하므로 줄이 흔들리지 않는다)
  function typer(el) {
    const units = Array.isArray(el) ? el.flatMap(e => DECK.split(e, 'char')) : DECK.split(el, 'char');
    return {
      units,
      set(p) {
        const n = Math.round(clamp(p) * units.length);
        units.forEach((u, i) => { const v = i < n ? '' : 'hidden'; if (u.style.visibility !== v) u.style.visibility = v; });
        return n;
      },
    };
  }
  const cursorAt = (cur, units, n) => { const u = units[n - 1]; set(cur, 'left', (u ? u.offsetLeft + u.offsetWidth + 6 : 0) + 'px'); };
  const blink = a => (Math.floor(a * 2.2) % 2 ? 0 : 1);
  const rtf = (b, r) => `translate(${f1(r.x - b.x)}px, ${f1(r.y - b.y)}px) scale(${f4(r.w / b.w)})`;   // transform-origin 0 0
  const lrect = (A, B, p) => ({ x: lerp(A.x, B.x, p), y: lerp(A.y, B.y, p), w: lerp(A.w, B.w, p), h: lerp(A.h, B.h, p) });
  const dot = (svg, r, color) => { const c = s('circle', { r, cx: 0, cy: 0, fill: color }, svg); c.style.opacity = '0'; return c; };
  const place = (c, q) => { c.setAttribute('cx', f1(q[0])); c.setAttribute('cy', f1(q[1])); };

  // ─── 78. 장 전환 영상 ───
  // 영상 마지막 프레임: 검은 바탕, 79번 왼쪽 끝의 요청 문장 자리만 비어 있다 → 79번은 빈 검은 화면에서 요청 문장이 찍히며 시작한다
  DECK.videoSlide({ id: 'v-cases', video: 'v06_cases' });

  // ─── 79. 보고서 작성 하네스(push · track): 요청 한 줄 → 다섯 역할이 파일을 넘겨줌 → 검토를 통과한 보고서 ───
  const R79 = [
    { n: '오케스트레이터', sub: '범위와 순서', out: '범위 문서', icon: 'gear' },
    { n: '리서처', out: '자료 목록', icon: 'search' },
    { n: '분석가', out: '분석 표', icon: 'chart' },
    { n: '작성자', out: '초안', icon: 'pen' },
    { n: '편집·검토', out: '검토 의견', icon: 'eye' },
  ];
  // 빌드 1개(한 클릭 개편 2026-11-16). 묶음 시작 시각: 요청 한 줄 0.15 → 다섯 칸과 넘겨주기 G79[0] → 검토 통과와 보고서 G79[1]
  const G79 = [1.0, 2.55];
  // 카메라: 첫 화면은 요청 문장 자리를 1.35배로 본다(v06_cases 마지막 프레임과 같은 화면). CAM79.t0부터 0.8초 동안 도식 전체가 보이는 자리로 물러난다.
  // camTrack은 끝 자리 하나만 두고, cameraHook이 그 자리 기준 차이를 돌려준다(끝 화면에서는 0)
  const CAM79 = { from: [700, 300, 1.35], to: [1000, 525, 1], t0: 1.0, d: 0.8 };
  DECK.slide({
    id: 'report-harness', holds: [], dur: 4.2,
    camTrack: [CAM79.to],
    cameraHook(t) {
      const p = ease.inOutCubic(clamp((t - CAM79.t0) / CAM79.d)), [x0, y0, z0] = CAM79.from, [x1, y1, z1] = CAM79.to;
      const z = Math.exp(lerp(Math.log(z0), Math.log(z1), p));
      return { dx: (x0 - x1) * (1 - p), dy: (y0 - y1) * (1 - p), dz: PERSP / z - PERSP / z1 };
    },
    notes: NOTES['report-harness'],
    setup(el) {
      const $ = this.$;
      $.svg = svgLayer(el);
      $.req = txt(el, '「시장 조사해서 보고서 만들어줘」', { left: '180px', top: '214px', font: '700 60px/1.3 var(--serif)', color: 'var(--ink)' });
      $.ty = typer($.req);
      $.cur = div($.req, '', { left: '0px', top: '14px', width: '5px', height: '56px', background: 'var(--accent)' });
      const CW = 283, GAP = 36, CY = 516, CH = 170, CHY = 738;
      $.cells = R79.map((r, i) => {
        const x = 180 + i * (CW + GAP);
        const c = div(el, '', { left: x + 'px', top: CY + 'px', width: CW + 'px', height: CH + 'px', borderRadius: '18px', background: 'var(--card)', border: '2px solid var(--line)', boxShadow: '0 18px 40px rgba(0,0,0,.35)', transformOrigin: '50% 100%' });
        const ic = div(c, '', { left: '20px', top: '20px' }); U.icon(ic, r.icon, 40, 'var(--accent)', 1.8);
        const num = txt(c, nn(i), { right: '20px', top: '20px', font: '500 28px/1 var(--mono)', color: 'var(--mut)' });
        const nm = txt(c, r.n, { left: '20px', top: r.sub ? '76px' : '96px', font: '700 36px/1.2 var(--sans)', color: 'var(--ink)' });
        if (nm.offsetWidth > CW - 40) nm.style.fontSize = Math.floor((36 * (CW - 40)) / nm.offsetWidth) + 'px';
        if (r.sub) txt(c, r.sub, { left: '20px', top: '122px', font: '500 30px/1.2 var(--sans)', color: 'var(--mut)' });
        c.style.opacity = '0';
        return { el: c, x, cx: x + CW / 2, num };
      });
      // 통과 표시(5번 칸 오른쪽 위)
      const c5 = $.cells[4];
      $.ok5 = div(c5.el, '', { right: '14px', top: '14px', width: '46px', height: '46px', borderRadius: '50%', background: 'var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 });
      U.icon($.ok5, 'check', 30, 'var(--bg0)', 3);
      // 산출물 칩(칸 아래)
      $.chips = R79.map((r, i) => {
        const c = div(el, '', { top: CHY + 'px', height: '58px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px 0 14px', borderRadius: '12px',
          background: 'var(--bg1)', border: `1.5px solid ${DECK.rgba('accent', 0.55)}`, whiteSpace: 'nowrap', transformOrigin: '50% 0%' });
        U.icon(c, 'doc', 30, 'var(--accent)', 1.8);
        const tx = h('span', '', c, r.out); css(tx, { font: '600 30px var(--sans)', color: 'var(--ink)' });
        const w = c.offsetWidth, cx = $.cells[i].cx;
        c.style.left = f1(cx - w / 2) + 'px';
        c.style.opacity = '0';
        return { el: c, cx, r: cx + w / 2 };
      });
      $.c0 = arrow($.svg, `M240 306 C 240 392, 300 410, 300 ${CY - 8}`);
      $.stubs = $.chips.map(c => path($.svg, `M${c.cx} ${CY + CH + 2} V${CHY - 4}`, { color: DECK.rgba('accent', 0.55), sw: 2.5 }));
      $.hand = $.chips.map((c, i) => {
        const my = CHY + 29;
        if (i < 4) { const xn = $.cells[i + 1].x + 24; return arrow($.svg, `M${f1(c.r + 6)} ${my} H${xn - 20} Q${xn} ${my} ${xn} ${my - 20} V${CY + CH + 8}`); }
        return arrow($.svg, `M${f1(c.r + 6)} ${my} H1768 Q1792 ${my} 1792 ${my - 24} V324 Q1792 300 1768 300 H1724`);
      });
      $.smp = $.hand.map(a0 => U.sampler(a0.p, 80));
      $.dot = dot($.svg, 8, DECK.rgba('accent2', 1));
      // 완성된 보고서: 종이 한 장(obj_sheet) + 줄 + 통과 표시
      $.doc = cutout(el, 'assets/img/obj_sheet.png', { x: 1490, y: 140, w: 230, h: 307 });
      css($.doc.el, { transformOrigin: '50% 100%', opacity: 0, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.5))' });
      $.bars = [[0.22, 0.2, 0.42, 9], [0.22, 0.33, 0.6, 6], [0.22, 0.4, 0.55, 6], [0.22, 0.47, 0.6, 6], [0.22, 0.6, 0.3, 40], [0.58, 0.6, 0.2, 40], [0.22, 0.78, 0.5, 6]].map(([l, tp, w, hh]) =>
        div($.doc.el, '', { left: l * 100 + '%', top: tp * 100 + '%', width: w * 100 + '%', height: hh + 'px', borderRadius: '3px', background: 'rgba(27,29,26,.2)', transformOrigin: '0 50%', transform: 'scaleX(0)' }));
      $.badge = div(el, '', { left: '1652px', top: '352px', width: '72px', height: '72px', borderRadius: '50%', background: 'var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(0,0,0,.4)', opacity: 0 });
      U.icon($.badge, 'check', 46, 'var(--bg0)', 3);
      $.label = txt(el, '완성된 보고서', { right: '470px', top: '266px', font: '700 44px/1.2 var(--sans)', color: 'var(--ink)', opacity: 0 });
      // 「예시」 알약: 실제 보고서 결과 화면이 없는 흐름도라서 흐름도 왼쪽 아래에 단다.
      // 첫 화면(v06_cases 끝 프레임과 같은 빈 화면)에는 없고, 다섯 칸 묶음과 함께 나타난다
      $.ex = U.example(el, {});
      css($.ex.el, { right: 'auto', left: '180px', top: '850px', transformOrigin: '0 50%' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, [g1, g2] = G79;
      // 묶음 1: 요청 한 줄이 찍힌다
      const tp = prog(t, 0.15, 0.75, ease.linear), n = $.ty.set(tp);
      show($.req, t > 0 ? 1 : 0);
      cursorAt($.cur, $.ty.units, n);
      show($.cur, t > 0 && t < g1 + 0.3 ? (tp < 1 ? 1 : blink(a)) : 0);
      // 묶음 2: 카메라가 물러나는 동안 다섯 칸이 솟고 → 차례로 일하며 산출물을 다음 칸에 넘긴다
      $.c0.set(prog(t, g1 + 0.2, 0.45, ease.inOutCubic));
      const cyc = prog(t, 3.8, 0.5), kc = ((a * 0.8) % 5.8) - 0.4;   // 머무는 동안 강조 칸이 왼쪽부터 차례로 밝아진다
      $.cells.forEach((c, i) => {
        const st = g1 + 0.1 + i * 0.06, p = prog(t, st, 0.55, ease.pop);
        show(c.el, prog(t, st, 0.2, ease.linear));
        const A = g1 + 0.4 + i * 0.26;
        const on = prog(t, A, 0.15, ease.linear) * (1 - prog(t, A + 0.3, 0.3, ease.linear));
        const done = prog(t, A + 0.3, 0.3, ease.linear);
        set(c.el, 'transform', `translateY(${f1((1 - p) * 46 - on * 8)}px) scale(${f4(lerp(0.86, 1, p))})`);
        const hl = cyc * clamp(1 - Math.abs(i - kc));
        const al = Math.max(on, done * 0.45, hl);
        c.el.style.borderColor = al > 0.02 ? DECK.rgba('accent', 0.2 + 0.8 * al) : 'var(--line)';
        c.el.style.background = hl > 0.01 ? `color-mix(in srgb, var(--accent) ${f1(16 * hl)}%, var(--card))` : 'var(--card)';
        c.el.style.boxShadow = on > 0.02 ? `0 18px 40px rgba(0,0,0,.35), 0 0 0 ${f1(8 * on)}px ${DECK.rgba('accent', 0.16)}` : '0 18px 40px rgba(0,0,0,.35)';
        const cp = prog(t, A + 0.1, 0.45, ease.pop);
        show($.chips[i].el, prog(t, A + 0.1, 0.15, ease.linear));
        set($.chips[i].el, 'transform', `translateY(${f1((1 - cp) * -30)}px) scale(${f4(lerp(0.7, 1, cp))})`);
        draw($.stubs[i], prog(t, A + 0.02, 0.18, ease.linear));
        if (i < 4) $.hand[i].set(prog(t, A + 0.2, 0.35, ease.inOutCubic));
      });
      $.ex.render(t, g1 + 0.6);
      // 묶음 3: 다섯째 칸이 끝나면 검토를 통과한 결과만 나온다
      const okp = U.pop($.ok5, t, g2 + 0.05, 0.45, 0.4);
      show($.cells[4].num, 1 - okp);
      $.hand[4].set(prog(t, g2 + 0.1, 0.55, ease.inOutCubic));
      const sp = DECK.spring(t, g2 + 0.3, 1.5, 0.55);
      show($.doc.el, prog(t, g2 + 0.3, 0.2, ease.linear));
      set($.doc.el, 'transform', `translateY(${f1((1 - sp) * -170 + 5 * Math.sin(a * 1.3) * prog(t, g2 + 1.1, 0.5))}px) rotate(${f3(lerp(-16, 3, sp))}deg)`);
      $.bars.forEach((b, j) => set(b, 'transform', `scaleX(${f4(prog(t, g2 + 0.55 + j * 0.04, 0.3))})`));
      U.pop($.badge, t, g2 + 0.8, 0.5, 0.3);
      fadeUp($.label, t, g2 + 0.6, 0.5, 24);
      // 머무는 동안: 넘겨지는 산출물 선을 따라 점이 이동한다
      const nseg = t >= g2 + 0.75 ? 5 : 0;
      if (nseg) {
        const u = (a * 0.32) % 1, f = u * nseg, k = Math.min(nseg - 1, Math.floor(f)), q = f - k;
        place($.dot, $.smp[k].at(q));
        $.dot.style.opacity = f3(Math.sin(q * Math.PI));
      } else $.dot.style.opacity = '0';
    },
  });

  // ─── 80. 웹툰 하네스의 역할 아홉(push · drift): 이름표 아홉 개를 순서대로 잇는 선, 마지막 「일관성 QA」만 accent ───
  const R80 = ['캐릭터 디자이너', '씬 디렉터', '대사 작성', '이야기 점검', '프롬프트 엔지니어', '이미지 생성', '말풍선 아티스트', '패널 조립', '일관성 QA'];
  const G80 = 1.0;   // 빌드 1개. 뒤 네 역할 묶음이 시작하는 시각(앞 다섯 역할 선이 거의 다 그려질 때)
  DECK.slide({
    id: 'webtoon-team', holds: [], dur: 2.7,
    setup(el) {
      const $ = this.$;
      $.back = layer(el);
      $.bimg = photo($.back, CASE + 'webtoon.jpg', { x: 1000, y: 230, w: 1000, h: 700, radius: 0, border: 'none', shadow: 'none', pos: '50% 55%' });
      css($.bimg.el, { maskImage: 'radial-gradient(ellipse 60% 62% at 60% 46%, #000 35%, transparent 100%)', webkitMaskImage: 'radial-gradient(ellipse 60% 62% at 60% 46%, #000 35%, transparent 100%)' });
      $.title = txt(el, '웹툰 하네스 · 역할 <span style="color:var(--accent)">9</span>', { left: '180px', top: '170px', font: '900 76px/1.15 var(--display)', letterSpacing: '-.025em', color: 'var(--ink)', opacity: 0 });
      $.svg = svgLayer(el);
      const TH = 92, ROWY = [372, 600], G = 22;
      $.tags = R80.map((nm, i) => {
        const qa = i === 8;
        const tg = div(el, '', { top: ROWY[i < 5 ? 0 : 1] + 'px', height: TH + 'px', display: 'flex', alignItems: 'center', gap: '14px', padding: '0 28px 0 22px', whiteSpace: 'nowrap',
          borderRadius: '16px', background: 'var(--bg1)', border: `${qa ? 3 : 2}px solid ${qa ? 'var(--accent)' : 'var(--line)'}`, boxShadow: '0 16px 36px rgba(0,0,0,.45)', opacity: 0 });
        const num = h('span', '', tg, nn(i)); css(num, { font: '500 28px var(--mono)', color: qa ? 'var(--accent)' : 'var(--mut)' });
        const name = h('span', '', tg, nm); css(name, { font: '650 38px var(--sans)', color: 'var(--ink)' });
        return { el: tg, row: i < 5 ? 0 : 1, qa };
      });
      [0, 1].forEach(row => {
        const list = $.tags.filter(tg => tg.row === row);
        const ws = list.map(tg => tg.el.offsetWidth), tot = ws.reduce((m, w) => m + w, 0);
        const gap = Math.min(G, (1560 - tot) / Math.max(1, list.length - 1));
        let xx = 180;
        list.forEach((tg, j) => { tg.x = xx; tg.w = ws[j]; tg.cx = xx + ws[j] / 2; tg.el.style.left = f1(xx) + 'px'; xx += ws[j] + gap; });
      });
      const T = $.tags, y1 = ROWY[0] + TH / 2, y2 = ROWY[1] + TH / 2, lane = (ROWY[0] + TH + ROWY[1]) / 2, r = 30;
      $.y1 = y1; $.y2 = y2;
      $.pA = path($.svg, `M${f1(T[0].cx)} ${y1} H${f1(T[4].cx)}`, { color: DECK.rgba('accent', 0.7), sw: 3 });
      $.pB = path($.svg, `M${f1(T[4].cx)} ${y1} V${lane - r} Q${f1(T[4].cx)} ${lane} ${f1(T[4].cx - r)} ${lane} H${f1(T[5].cx + r)} Q${f1(T[5].cx)} ${lane} ${f1(T[5].cx)} ${lane + r} V${y2} H${f1(T[8].cx)}`, { color: DECK.rgba('accent', 0.7), sw: 3 });
      $.LA = $.pA.getTotalLength(); $.LB = $.pB.getTotalLength();
      $.sA = U.sampler($.pA, 60); $.sB = U.sampler($.pB, 120);
      // 이름표가 선에 닿는 진행률
      T.forEach((tg, i) => { tg.f = i < 5 ? (tg.cx - T[0].cx) / Math.max(1, T[4].cx - T[0].cx) : ($.LB - (T[8].cx - tg.cx)) / $.LB; });
      $.dot = dot($.svg, 7, DECK.rgba('accent2', 1));
      // 「일관성 QA」 둘레로 퍼지는 테두리
      const q = T[8];
      $.ring = div(el, '', { left: f1(q.x - 8) + 'px', top: ROWY[1] - 8 + 'px', width: f1(q.w + 16) + 'px', height: TH + 16 + 'px', borderRadius: '22px', border: '2px solid var(--accent)', opacity: 0 });
    },
    render(t, x) {
      const $ = this.$, a = x.a, h0 = G80;
      $.back.style.transform = U.depth(x, -0.5);
      show($.bimg.el, 0.25 * Math.max(smooth(0.1, 0.7, x.arrive), prog(t, 0, 0.6)));
      kb($.bimg, 1.04 + 0.03 * Math.sin(a * 0.12));
      // 제목은 밀려 들어오는 동안(x.arrive 0부터) 제자리에 보여 전환 중에도 슬라이드를 알아볼 수 있게 한다
      const tp = Math.max(prog(t, 0.05, 0.6), smooth(0, 0.3, x.arrive));
      show($.title, tp); set($.title, 'transform', `translateY(${f1((1 - tp) * 26)}px)`);
      const pa = prog(t, 0.3, 0.8, ease.inOutSine), pb = prog(t, h0 + 0.05, 0.85, ease.inOutSine);
      draw($.pA, pa); draw($.pB, pb);
      $.tags.forEach((tg, i) => {
        const st = i < 5 ? 0.3 + 0.8 * tg.f - 0.12 : h0 + 0.05 + 0.85 * tg.f - 0.14;
        const p = prog(t, st, 0.5, ease.pop);
        show(tg.el, prog(t, st, 0.18, ease.linear));
        set(tg.el, 'transform', `translateY(${f1((1 - p) * 34)}px) scale(${f4(lerp(0.82, 1, p))})`);
      });
      const qa = prog(t, h0 + 0.95, 0.4);
      const u = (a * 0.6) % 1;
      show($.ring, qa * (1 - u) * 0.9);
      set($.ring, 'transform', `scale(${f4(1 + u * 0.12)})`);
      // 머무는 동안: 그려진 선을 따라 점이 이동한다
      const both = t >= h0 + 0.9, one = t >= 1.1;
      if (one) {
        const L = both ? $.LA + $.LB : $.LA, d0 = ((a * 260) % L);
        const q = d0 < $.LA ? $.sA.at(d0 / $.LA) : $.sB.at((d0 - $.LA) / $.LB);
        place($.dot, q);
        $.dot.style.opacity = f3(Math.min(1, d0 / 60, (L - d0) / 60));
      } else $.dot.style.opacity = '0';
    },
  });

  // ─── 81. 등장인물 다섯의 기준 자산(slide-r · parallax): 인물 그림 다섯 장 → 줄어들며 올라가고, 아래 기준 자산 폴더로 선이 모인다 ───
  // 배치: parallax(±21px, ±13.5px, ±0.25°)로 움직여도 제목 왼쪽 끝이 화면 x 175 안쪽, 제목 글자 위가 y 163 아래, 파일 칩 아래 끝(884)이 905 위에 남는 자리
  const G81 = 1.1;   // 빌드 1개. 그림이 줄어들며 올라가고 기준 자산 폴더가 나오는 묶음의 시작 시각
  const K81 = [-0.45, 0.15, 0.85, 0.15, -0.45];
  const R81a = [0, 1, 2, 3, 4].map(i => ({ x: 192 + i * 313, y: 290, w: 283, h: 540 }));
  const R81b = [0, 1, 2, 3, 4].map(i => ({ x: 416 + i * 226, y: 294, w: 184, h: 350 }));
  [R81a, R81b].forEach(R => { const m = R[2], k = 1.07; R[2] = { x: m.x + (m.w * (1 - k)) / 2, y: m.y + (m.h * (1 - k)) / 2, w: m.w * k, h: m.h * k }; });
  const F81 = ['sheet.json', '정면·측면 초상', '표정', '대표 자세'];
  DECK.slide({
    id: 'webtoon-ssot', holds: [], dur: 3.1, notes: NOTES['webtoon-ssot'],
    setup(el) {
      const $ = this.$;
      $.title = txt(el, '등장인물 5명<span class="suf" style="display:inline-block">&nbsp;· 기준 자산은 한 곳에</span>', { left: '198px', top: '170px', font: '900 64px/1.2 var(--display)', letterSpacing: '-.02em', color: 'var(--ink)', opacity: 0 });
      $.suf = $.title.querySelector('.suf');
      $.mk = U.mark($.suf, { word: '한 곳에' });
      $.svg = svgLayer(el);
      $.lines = [0, 1, 2, 3, 4].map(() => path($.svg, 'M0 0 L1 1', { color: DECK.rgba('accent', 0.6), sw: 2.5 }));
      $.flow = [0, 1, 2, 3, 4].map(() => dot($.svg, 6, DECK.rgba('accent2', 1)));
      $.lay = K81.map(() => layer(el));
      $.pics = R81a.map((r, i) => {
        const im = photo($.lay[i], CASE + `webtoon_char${i + 1}.jpg`, { x: r.x, y: r.y, w: r.w, h: r.h, radius: 14, pos: '50% 15%' });
        css(im.el, { transformOrigin: '0 0', background: '#f4f1ec' });
        return im;
      });
      // 기준 자산 폴더: 경로 한 줄 + 파일 네 개
      $.head = div(el, '', { top: '714px', display: 'flex', alignItems: 'center', gap: '14px', whiteSpace: 'nowrap', opacity: 0 });
      U.icon($.head, 'folder', 40, 'var(--accent)', 1.9);
      const ht = h('span', '', $.head, 'characters/{이름}/'); css(ht, { font: '700 34px var(--mono)', color: 'var(--ink)' });
      const hw = $.head.offsetWidth; $.head.style.left = f1(960 - hw / 2) + 'px';
      $.chips = F81.map(nm => {
        const c = div(el, '', { top: '822px', height: '62px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 22px 0 16px', borderRadius: '12px', whiteSpace: 'nowrap',
          background: 'var(--bg1)', border: '1.5px solid var(--line)', opacity: 0 });
        U.icon(c, 'doc', 30, 'var(--mut)', 1.8);
        const tx = h('span', '', c, nm); css(tx, { font: '500 32px var(--mono)', color: 'var(--ink)' });
        return { el: c, w: c.offsetWidth };
      });
      const tot = $.chips.reduce((m, c) => m + c.w, 0) + 3 * 28;
      let xx = 960 - tot / 2;
      $.chips.forEach(c => { c.x = xx; c.cx = xx + c.w / 2; c.el.style.left = f1(xx) + 'px'; xx += c.w + 28; });
      const bus = 796;
      $.bus = path($.svg, `M960 766 V${bus} M${f1($.chips[0].cx)} ${bus + 26} V${bus} H${f1($.chips[3].cx)} V${bus + 26} M${f1($.chips[1].cx)} ${bus} V${bus + 26} M${f1($.chips[2].cx)} ${bus} V${bus + 26}`, { color: DECK.rgba('ink', 0.4), sw: 2 });
    },
    render(t, x) {
      const $ = this.$, a = x.a, h0 = G81;
      fadeUp($.title, t, 0.1, 0.6, 26);
      // 접미 문구는 둘째 묶음에서 왼쪽부터 열림
      const sp = prog(t, h0 + 0.15, 0.55, ease.outCubic);
      U.wipe($.suf, sp); $.suf.style.opacity = sp > 0 ? '1' : '0';
      $.mk.render(t, h0 + 0.75, 0.5);
      const m = prog(t, h0, 0.75, ease.inOutCubic);
      const early = smooth(0.15, 0.75, x.arrive);
      const ends = [];
      $.pics.forEach((im, i) => {
        $.lay[i].style.transform = U.depth(x, K81[i]);
        const r = lrect(R81a[i], R81b[i], prog(t, h0 + i * 0.03, 0.75, ease.inOutCubic));
        const rv = Math.max(early, prog(t, 0.1 + i * 0.06, 0.6));
        const bob = 5 * Math.sin(a * 0.9 + i * 1.3);
        im.el.style.transform = rtf(R81a[i], { x: r.x, y: r.y + (1 - rv) * 60 + bob, w: r.w });
        show(im.el, rv);
        im.el.style.clipPath = rv >= 1 ? 'none' : `inset(${f1((1 - rv) * 100)}% 0 0 0 round 14px)`;
        const c = x.cam || { dx: 0, dy: 0 };
        ends.push([r.x + r.w / 2 - c.dx * K81[i], r.y + r.h + bob - c.dy * K81[i] + 6]);
      });
      // 그림마다 선이 폴더로 모인다
      const lp = prog(t, h0 + 0.45, 0.6, ease.inOutCubic);
      $.lines.forEach((pa, i) => {
        const [sx, sy] = ends[i], ex = 960 + (i - 2) * 14, ey = 710;
        pa.setAttribute('d', `M${f1(sx)} ${f1(sy)} C${f1(sx)} ${f1(sy + 50)} ${f1(ex)} ${f1(ey - 50)} ${f1(ex)} ${ey}`);
        draw(pa, lp * (m >= 1 ? 1 : 0), true);
        const u = (a * 0.45 + i * 0.2) % 1, fl = $.flow[i];
        if (lp >= 1 && m >= 1) {
          const b = 1 - u, X = b * b * b * sx + 3 * b * b * u * sx + 3 * b * u * u * ex + u * u * u * ex, Y = b * b * b * sy + 3 * b * b * u * (sy + 50) + 3 * b * u * u * (ey - 50) + u * u * u * ey;
          place(fl, [X, Y]); fl.style.opacity = f3(Math.sin(u * Math.PI));
        } else fl.style.opacity = '0';
      });
      const hp = prog(t, h0 + 0.65, 0.5, ease.pop);
      show($.head, prog(t, h0 + 0.65, 0.2, ease.linear));
      set($.head, 'transform', `translateY(${f1((1 - hp) * 24)}px) scale(${f4(lerp(0.85, 1, hp))})`);
      draw($.bus, prog(t, h0 + 0.85, 0.4, ease.inOutCubic));
      $.chips.forEach((c, i) => {
        const p = prog(t, h0 + 1.0 + i * 0.06, 0.45, ease.pop);
        show(c.el, prog(t, h0 + 1.0 + i * 0.06, 0.18, ease.linear));
        set(c.el, 'transform', `translateY(${f1((1 - p) * -20)}px) scale(${f4(lerp(0.8, 1, p))})`);
      });
    },
  });

  // ─── 82. 웹툰 결과물(push · drift): 세로 컷이 위로 이동하고, 이어서 오른쪽으로 비켜나며 왼쪽에 세 단계 ───
  const G82 = 0.7;   // 빌드 1개. 컷 화면이 오른쪽으로 비켜나고 세 단계가 나오는 묶음의 시작 시각
  const ST82 = ['요청 하나로 팀 구성', '과정과 산출물이 이어짐', '완성 컷'];
  const X82 = 200;   // 단계 묶음 왼쪽 끝. drift(±14px, ±0.25°)로 움직여도 번호 글자가 화면 왼쪽 175px 안쪽에 남는 자리
  DECK.slide({
    id: 'webtoon-result', holds: [], dur: 2.8,
    setup(el) {
      const $ = this.$;
      $.box = div(el, '', { left: '660px', top: '0px', width: '600px', height: '1080px', overflow: 'hidden',
        maskImage: 'linear-gradient(to bottom, transparent 0, #000 10%, #000 90%, transparent 100%)', webkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 10%, #000 90%, transparent 100%)',
        borderLeft: '1.5px solid var(--line)', borderRight: '1.5px solid var(--line)', opacity: 0 });
      $.reel = div($.box, '', { left: '0px', top: '0px', width: '600px', height: '6098px' });
      $.ims = [0, 1].map(k => photo($.reel, CASE + 'webtoon_strip.jpg', { x: 0, y: k * 3049, w: 600, h: 3049, radius: 0, border: 'none', shadow: 'none' }));
      $.ims.forEach(im => { im.el.style.opacity = '1'; });
      $.svg = svgLayer(el);
      $.steps = ST82.map((s0, i) => {
        const y = 250 + i * 200;
        const g = div(el, '', { left: X82 + 'px', top: y + 'px', opacity: 0 });
        txt(g, nn(i), { left: '0px', top: '0px', font: '400 64px/1 var(--num)', color: 'var(--accent)' });
        const tx = txt(g, s0, { left: '96px', top: '8px', font: '650 46px/1.2 var(--sans)', color: 'var(--ink)' });
        return { g, tx, y };
      });
      $.arr = [0, 1].map(i => arrow($.svg, `M${X82 + 26} ${250 + i * 200 + 84} V${250 + (i + 1) * 200 - 18}`, { color: DECK.rgba('accent', 0.75), sw: 3, k: 12 }));
      const s3 = $.steps[2], ex = X82 + 96 + s3.tx.offsetWidth + 26, ey = s3.y + 36;
      $.lead = arrow($.svg, `M${f1(ex)} ${ey} H1046`, { color: DECK.rgba('accent', 0.85), sw: 3, noHead: true });
      $.brk = path($.svg, `M1062 ${ey - 110} H1046 V${ey + 110} H1062`, { color: DECK.rgba('accent', 0.95), sw: 4 });
      $.pin = s('circle', { cx: f1(ex), cy: ey, r: 6, fill: DECK.rgba('accent', 1) }, $.svg); $.pin.style.opacity = '0';
    },
    render(t, x) {
      const $ = this.$, a = x.a, h0 = G82;
      show($.box, Math.max(smooth(0.05, 0.5, x.arrive), prog(t, 0, 0.4)));
      set($.reel, 'transform', `translateY(${f1(-((a * 48 + 260) % 3049))}px)`);
      const m = prog(t, h0, 0.8, ease.inOutCubic);
      set($.box, 'transform', `translateX(${f1(m * 420)}px)`);
      $.steps.forEach((st, i) => {
        const p = prog(t, h0 + 0.3 + i * 0.22, 0.55, ease.snap);
        show(st.g, prog(t, h0 + 0.3 + i * 0.22, 0.25, ease.linear));
        set(st.g, 'transform', `translateX(${f1((1 - p) * -40)}px)`);
      });
      $.arr.forEach((ar, i) => ar.set(prog(t, h0 + 0.45 + i * 0.22, 0.3, ease.inOutCubic)));
      $.lead.set(prog(t, h0 + 0.95, 0.45, ease.inOutCubic));
      $.pin.style.opacity = t > h0 + 0.9 ? '1' : '0';
      draw($.brk, prog(t, h0 + 1.3, 0.4, ease.inOutCubic));
    },
  });

  // ─── 83. 게임: 한 줄 요청과 게임 제작 여섯 단계(push · none) ───
  // 첫 화면은 68번 one-line(c05_meta.js)과 같은 터미널 입력 상자(170,176 1580×178, 둥근 18, mono 34px 두 줄, › 프롬프트, accent2 커서)와
  // 같은 요청 문구다. 파일 사이 import 없이 이 장 안에 다시 쓴다. 타자 동안 상자가 화면 가운데(아래로 275px)에 있고, 타자가 끝나면 위로 비킨다.
  // 들어오는 전환은 평면 밀기(camera.enter push): 밀려 들어오는 동안(x.arrive 0부터) 상자 테두리와 프롬프트가 먼저 보인다
  const G83 = 1.1;   // 빌드 1개. 상자가 위로 비키고 여섯 단계가 나오는 묶음의 시작 시각(타자가 끝난 직후)
  const S83 = ['기획', '구조 설계', '그림 자산 생성', '구현', '테스트', '품질 검사'];
  const L83 = ['/harness HTML 캔버스를 이용하여 타워 디펜스 웹 게임을 만들고자 합니다.', '… 에이전트는 10개 이상으로 구성합니다.'];
  const rr83 = (x, y, w, hh, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + hh - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + hh}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + hh - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  // 한 줄 타자(68번과 같은 방식): 글자마다 span, 공백도 자리를 지킨다(white-space: pre)
  function typeLine83(p, text, st) {
    const el = div(p, '', Object.assign({ whiteSpace: 'pre' }, st));
    const seg = new Intl.Segmenter('ko', { granularity: 'grapheme' });
    const chars = [...seg.segment(text)].map(g => { const c = h('span', '', el); c.textContent = g.segment; return c; });
    const edges = chars.map(c => c.offsetLeft + c.offsetWidth);
    return {
      el, n: chars.length,
      set(k) { chars.forEach((c, j) => { const v = j < k ? '' : 'hidden'; if (c.style.visibility !== v) c.style.visibility = v; }); },
      edge(k) { return k <= 0 ? 0 : edges[Math.min(k, chars.length) - 1]; },
    };
  }
  DECK.slide({
    id: 'game-request', holds: [], dur: 3.0, notes: NOTES['game-request'],
    camera: { enter: 'push' },
    setup(el) {
      const $ = this.$;
      $.svg = svgLayer(el);
      // 터미널 입력 상자(68번과 같은 모양)
      $.term = layer(el);
      $.panelFill = div($.term, '', { left: '170px', top: '176px', width: '1580px', height: '178px', borderRadius: '18px', background: DECK.rgba('bg0', 0.8), opacity: 0 });
      $.panel = path(svgLayer($.term), rr83(170, 176, 1580, 178, 18), { color: DECK.rgba('ink', 0.5), sw: 2 });
      $.prompt = div($.term, '›', { left: '204px', top: '198px', font: '700 40px/1.4 var(--mono)', color: 'var(--accent2)', opacity: 0 });
      const LS = { font: '500 34px/50px var(--mono)', color: 'var(--ink)' };
      $.l1 = typeLine83($.term, L83[0], Object.assign({ left: '252px', top: '206px' }, LS));
      $.l2 = typeLine83($.term, L83[1], Object.assign({ left: '252px', top: '266px' }, LS));
      $.caret = div($.term, '', { left: '0px', top: '0px', width: '16px', height: '38px', background: 'var(--accent2)', opacity: 0 });
      // 둘째 묶음: 상자 아래 연결선 → 「게임 제작 단계」 머리글 → 여섯 단계
      const Y = 600, HH = 100, G = 56;
      $.boxes = S83.map((nm, i) => {
        const b = div(el, '', { top: Y + 'px', height: HH + 'px', display: 'flex', alignItems: 'center', padding: '0 30px', whiteSpace: 'nowrap', borderRadius: '18px',
          background: 'var(--bg1)', border: '2px solid var(--line)', boxShadow: '0 16px 36px rgba(0,0,0,.45)', opacity: 0 });
        const tx = h('span', '', b, nm); css(tx, { font: '650 40px var(--sans)', color: 'var(--ink)' });
        const num = txt(el, nn(i), { top: Y - 50 + 'px', font: '500 28px var(--mono)', color: 'var(--mut)', opacity: 0 });
        return { el: b, num, w: b.offsetWidth };
      });
      const tot = $.boxes.reduce((m, b) => m + b.w, 0) + G * 5;
      let xx = 960 - tot / 2;
      $.boxes.forEach(b => { b.x = xx; b.el.style.left = f1(xx) + 'px'; b.num.style.left = f1(xx + 4) + 'px'; xx += b.w + G; });
      $.X0 = $.boxes[0].x; $.X1 = xx - G;
      $.arr = $.boxes.slice(0, 5).map((b, i) => arrow($.svg, `M${f1(b.x + b.w + 12)} ${Y + HH / 2} H${f1($.boxes[i + 1].x - 12)}`, { color: DECK.rgba('accent', 0.85), sw: 3, k: 12 }));
      $.dots = $.arr.map(() => dot($.svg, 6, DECK.rgba('accent2', 1)));
      $.Y = Y + HH / 2;
      $.head = txt(el, '게임 제작 단계', { left: '0px', top: '448px', font: '700 42px/1.2 var(--sans)', color: 'var(--ink)', opacity: 0 });
      const hw = $.head.offsetWidth, hx = 960 - hw / 2, hy = 448 + 25;
      $.head.style.left = f1(hx) + 'px';
      $.link = arrow($.svg, 'M960 366 V436', { color: DECK.rgba('accent', 0.85), sw: 3, k: 12 });
      $.rules = [path($.svg, `M${f1(hx - 28)} ${hy} H${f1($.X0)}`, { color: DECK.rgba('ink', 0.28), sw: 2 }), path($.svg, `M${f1(hx + hw + 28)} ${hy} H${f1($.X1)}`, { color: DECK.rgba('ink', 0.28), sw: 2 })];
    },
    render(t, x) {
      const $ = this.$, a = x.a, h0 = G83;
      const pv = lerp(0.45, 1, smooth(0, 0.6, x.arrive));
      // 입력 상자가 화면 가운데 → 타자가 끝나면 위로 비켜 준다(68번과 같은 이동)
      set($.term, 'transform', `translateY(${f1(lerp(275, 0, prog(t, h0, 0.6, ease.inOutCubic)))}px)`);
      // 상자 테두리는 밀려 들어오는 동안 다 그려져 35% 칸부터 상자 모양으로 보인다
      draw($.panel, Math.max(smooth(0, 0.3, x.arrive), prog(t, 0, 0.6, ease.inOutCubic)));
      show($.panelFill, Math.max(pv, prog(t, 0, 0.4)));
      show($.prompt, Math.max(pv, prog(t, 0.05, 0.3)));
      // 타자: 두 줄을 이어서 0.1~1.0초에
      const N1 = $.l1.n, N = N1 + $.l2.n;
      const k = Math.floor(prog(t, 0.1, 0.9, ease.linear) * N + 1e-6);
      $.l1.set(k); $.l2.set(k - N1);
      const onL2 = k > N1, ck = onL2 ? $.l2 : $.l1, kk = onL2 ? k - N1 : k;
      const typing = t >= 0.1 && k < N;
      set($.caret, 'transform', `translate(${f1(252 + ck.edge(kk) + 4)}px, ${onL2 ? 272 : 212}px)`);
      $.caret.style.opacity = String(t >= 0.05 ? (typing ? 1 : blink(a)) * (1 - prog(t, h0, 0.3) * 0.7) : pv);
      // 둘째 묶음: 연결선 → 머리글과 양옆 줄 → 여섯 단계
      $.link.set(prog(t, h0 + 0.3, 0.3, ease.inOutCubic));
      const hp = prog(t, h0 + 0.45, 0.5, ease.pop);
      show($.head, prog(t, h0 + 0.45, 0.2, ease.linear));
      set($.head, 'transform', `translateY(${f1((1 - hp) * 22)}px) scale(${f4(lerp(0.88, 1, hp))})`);
      $.rules.forEach(r => draw(r, prog(t, h0 + 0.6, 0.5, ease.inOutCubic)));
      $.boxes.forEach((b, i) => {
        const st = h0 + 0.55 + i * 0.1, p = prog(t, st, 0.5, ease.pop);
        show(b.el, prog(t, st, 0.18, ease.linear));
        set(b.el, 'transform', `translateY(${f1((1 - p) * 40)}px) scale(${f4(lerp(0.85, 1, p))})`);
        fadeUp(b.num, t, st + 0.05, 0.4, 14);
        if (i < 5) $.arr[i].set(prog(t, st + 0.2, 0.25, ease.inOutCubic));
      });
      // 머무는 동안: 단계 사이 화살표를 따라 신호가 차례로 지나가고, 신호가 닿은 단계가 밝아진다
      const live = prog(t, h0 + 1.45, 0.3, ease.linear);
      const u = (Math.max(0, a) * 0.16) % 1, f = u * 5, kd = Math.floor(f), q = f - kd;
      $.boxes.forEach((b, j) => {
        const hl = live * clamp(1 - Math.abs(j - f) * 1.4);
        b.el.style.background = hl > 0.01 ? `color-mix(in srgb, var(--accent) ${f1(18 * hl)}%, var(--bg1))` : 'var(--bg1)';
        b.el.style.borderColor = hl > 0.01 ? DECK.rgba('accent', 0.3 + 0.7 * hl) : 'var(--line)';
      });
      $.dots.forEach((d, i) => {
        if (live <= 0 || i !== kd) { d.style.opacity = '0'; return; }
        const b = $.boxes[i], x0 = b.x + b.w + 12, x1 = $.boxes[i + 1].x - 12;
        place(d, [lerp(x0, x1, q), $.Y]); d.style.opacity = f3(live * Math.sin(q * Math.PI));
      });
    },
  });

  // ─── 84. 첫 판과 둘째 판(push · parallax): V1이 뒤로 비켜나고 V2가 앞 층에 더 크게. 85번 카메라가 V2 가운데로 들어간다 ───
  const G84 = 0.9;   // 빌드 1개. V1이 뒤로 비켜나고 V2가 들어오는 묶음의 시작 시각
  const V1a = { x: 400, y: 196, w: 1120, h: 626 }, V1b = { x: 180, y: 250, w: 820, h: 458 };
  const V2r = { x: 760, y: 267, w: 980, h: 547 };
  DECK.slide({
    id: 'game-v1v2', holds: [], dur: 2.5, notes: NOTES['game-v1v2'],
    zoomTarget: { x: 1250, y: 540 },
    setup(el) {
      const $ = this.$;
      $.l1 = layer(el); $.l2 = layer(el);
      $.v1 = photo($.l1, CASE + 'game_v1.jpg', { x: V1a.x, y: V1a.y, w: V1a.w, h: V1a.h, radius: 14 });
      $.v1.el.style.transformOrigin = '0 0';
      $.dim = div($.v1.el, '', { left: '0px', top: '0px', width: '100%', height: '100%', background: '#05070a', opacity: 0 });
      $.d1 = txt($.l1, '<span style="font:700 36px var(--mono);color:var(--accent)">V1:</span> 경로, 타워 배치, 기본 전투', { left: '0px', top: '0px', font: '600 36px/1.2 var(--sans)', color: 'var(--ink)', opacity: 0 });
      $.v2 = photo($.l2, CASE + 'game_v2.jpg', { x: V2r.x, y: V2r.y, w: V2r.w, h: V2r.h, radius: 14, shadow: '0 34px 80px rgba(0,0,0,.7)' });
      $.d2 = txt($.l2, '<span style="font:700 36px var(--mono);color:var(--accent)">V2:</span> 이동 애니메이션, 타워 동작, 단계별 진화', { left: V2r.x + 'px', top: V2r.y + V2r.h + 26 + 'px', font: '600 36px/1.2 var(--sans)', color: 'var(--ink)', opacity: 0 });
    },
    render(t, x) {
      const $ = this.$, a = x.a, h0 = G84;
      $.l1.style.transform = U.depth(x, -0.45);
      $.l2.style.transform = U.depth(x, 0.8);
      const m = prog(t, h0, 0.8, ease.inOutCubic);
      const r1 = lrect(V1a, V1b, m);
      const rv = Math.max(smooth(0.4, 0.8, x.arrive), prog(t, 0, 0.5));
      show($.v1.el, rv);
      $.v1.el.style.transform = rtf(V1a, { x: r1.x, y: r1.y + (1 - rv) * 40, w: r1.w });
      $.dim.style.opacity = f3(0.42 * m);
      kb($.v1, 1.02 + 0.02 * Math.sin(a * 0.25));
      // V1 설명: 그림 아래에 붙어 따라간다
      show($.d1, prog(t, 0.3, 0.45));
      set($.d1, 'transform', `translate(${f1(r1.x)}px, ${f1(r1.y + r1.h + 24 + (1 - prog(t, 0.3, 0.45)) * 20)}px)`);
      // V2: 오른쪽 앞 층으로 들어온다
      const sp = DECK.spring(t, h0 + 0.2, 1.4, 0.6);
      show($.v2.el, prog(t, h0 + 0.2, 0.25, ease.linear));
      set($.v2.el, 'transform', `translateX(${f1((1 - sp) * 380)}px) scale(${f4(lerp(0.86, 1, sp))})`);
      kb($.v2, 1.02 + 0.02 * Math.sin(a * 0.3 + 1.5));
      fadeUp($.d2, t, h0 + 0.65, 0.5, 20);
    },
  });

  // ─── 85. 3D로 다시 만들기(zoom-through · dolly-in): V2 화면 안에서 터미널 요청 → Blender 작업과 「약 3시간」 → 3D 결과가 화면 가득 ───
  // 빌드 1개. 묶음 시작 시각: 요청 타자 0.1 → Blender 작업과 「약 3시간」 G85[0] → 3D 결과 G85[1](클릭 없이 4초 안에 이어짐)
  const G85 = [1.15, 2.85];
  const BL = { x: 180, y: 440, w: 760, h: 517 };
  DECK.slide({
    id: 'game-3d', holds: [], dur: 4.35, notes: NOTES['game-3d'],
    setup(el) {
      const $ = this.$;
      $.bg = photo(el, CASE + 'game_v2.jpg', { x: 0, y: 0, w: 1920, h: 1080, radius: 0, border: 'none', shadow: 'none' });
      $.shade = div(el, '', { left: '0px', top: '0px', width: '1920px', height: '1080px', background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(14,16,19,.8), rgba(14,16,19,.95))', opacity: 0 });
      // 터미널 카드(둘째 묶음 자리 기준으로 만들고, 타자 동안에는 가운데에 1.25배)
      $.term = div(el, '', { left: '180px', top: '160px', borderRadius: '16px', background: '#0b0d10', border: '1.5px solid var(--line)', boxShadow: '0 30px 70px rgba(0,0,0,.6)', transformOrigin: '0 0', opacity: 0, overflow: 'hidden' });
      const bar = div($.term, '', { left: '0px', top: '0px', right: '0px', height: '46px', background: 'var(--bg1)', borderBottom: '1.5px solid var(--line2)' });
      ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => div(bar, '', { left: 20 + i * 24 + 'px', top: '16px', width: '14px', height: '14px', borderRadius: '50%', background: c, opacity: 0.85 }));
      const body = div($.term, '', { left: '0px', top: '46px', position: 'relative', padding: '26px 44px 30px 40px', display: 'flex', gap: '18px' });
      body.style.position = 'relative';
      const pr = h('div', '', body, '&gt;'); css(pr, { font: '700 30px/46px var(--mono)', color: 'var(--accent)' });
      $.cmd = h('div', '', body);
      css($.cmd, { font: '500 30px/46px var(--mono)', color: 'var(--ink)', whiteSpace: 'nowrap', position: 'relative' });
      $.ty = typer(['/harness blender mcp 를 이용해서', '../tower-defense 게임을 3d 게임으로', '리뉴얼하고자 합니다.'].map(l => h('div', '', $.cmd, l)));
      $.cur = div($.cmd, '', { left: '0px', top: '0px', width: '15px', height: '34px', background: 'var(--accent)' });
      $.TW = body.offsetWidth; $.TH = 46 + body.offsetHeight;
      css($.term, { width: $.TW + 'px', height: $.TH + 'px' });
      // Blender 작업 화면
      $.bl = photo(el, CASE + 'blender.jpg', { x: BL.x, y: BL.y, w: BL.w, h: BL.h, radius: 12 });
      // 약 3시간
      $.hrs = div(el, '', { left: '1040px', top: '452px', display: 'flex', alignItems: 'baseline', gap: '14px', whiteSpace: 'nowrap', opacity: 0 });
      const y1 = h('span', '', $.hrs, '약'); css(y1, { font: '700 56px var(--sans)', color: 'var(--ink)' });
      $.num = h('span', '', $.hrs, '3'); css($.num, { font: '400 132px/1 var(--num)', color: 'var(--accent)' });
      const y2 = h('span', '', $.hrs, '시간'); css(y2, { font: '700 56px var(--sans)', color: 'var(--ink)' });
      $.s1 = txt(el, '동안 에이전트 팀이', { left: '1040px', top: '620px', font: '600 42px/1.3 var(--sans)', color: 'var(--ink)', opacity: 0 });
      $.s2 = txt(el, '사람 없이 진행', { left: '1040px', top: '678px', font: '600 42px/1.3 var(--sans)', color: 'var(--ink)', opacity: 0 });
      $.mk = U.mark($.s2, { word: '사람 없이' });
      $.track = div(el, '', { left: '1040px', top: '800px', width: '600px', height: '8px', borderRadius: '4px', background: 'var(--line2)', opacity: 0 });
      $.fill = div($.track, '', { left: '0px', top: '0px', width: '600px', height: '8px', borderRadius: '4px', background: 'var(--accent)', transformOrigin: '0 50%', transform: 'scaleX(0)' });
      $.glint = div($.track, '', { left: '0px', top: '-6px', width: '90px', height: '20px', borderRadius: '10px', background: 'radial-gradient(closest-side, rgba(255,255,255,.75), rgba(255,255,255,0))', opacity: 0 });
      [0, 1, 2, 3].forEach(k => div($.track, '', { left: k * 200 - 1 + 'px', top: '-10px', width: '2px', height: '28px', background: 'var(--mut)', opacity: 0.6 }));
      // 3D 결과: Blender 자리에서 화면 가득 커진다
      $.g3 = photo(el, CASE + 'game_3d.jpg', { x: BL.x, y: BL.y, w: BL.w, h: BL.h, radius: 12 });
      $.top = div(el, '', { left: '0px', top: '0px', width: '1920px', height: '260px', background: 'linear-gradient(rgba(8,9,11,.72), rgba(8,9,11,0))', opacity: 0 });
      // 캡션은 dolly-in으로 약 1.064배 커진 뒤에도 화면 왼쪽에서 175px 이상, 아래 HUD 카드 줄(화면 y 약 920)에서 70px 이상 떨어진 자리
      $.bot = div(el, '', { left: '0px', top: '560px', width: '1920px', height: '520px', background: 'linear-gradient(rgba(8,9,11,0), rgba(8,9,11,.62) 52%, rgba(8,9,11,.9))', opacity: 0 });
      $.cap = txt(el, '3D 판 플레이 화면', { left: '240px', top: '770px', font: '700 46px/1.2 var(--sans)', color: 'var(--ink)', textShadow: '0 2px 14px rgba(0,0,0,.7)', opacity: 0 });
    },
    render(t, x) {
      const $ = this.$, a = x.a, [h0, h1] = G85;
      // V2 화면 안으로 들어온 뒤 어두워진다(앞 슬라이드의 V2 가운데에서 이어짐)
      show($.bg.el, 1 - prog(t, h1 + 0.4, 0.4, ease.linear));
      kb($.bg, 1.0 + 0.06 * prog(t, 0, 4, ease.linear));
      show($.shade, prog(t, 0.0, 0.8, ease.inOutSine));
      // 터미널: 타자 동안 가운데 1.25배 → 둘째 묶음에서 왼쪽 위
      const K = 1.25, B1 = { x: 960 - ($.TW * K) / 2, y: 540 - ($.TH * K) / 2, w: $.TW * K }, B2 = { x: 180, y: 160, w: $.TW };
      const mv = prog(t, h0, 0.6, ease.inOutCubic), tin = prog(t, 0.1, 0.5, ease.pop);
      const r = lrect(B1, B2, mv);
      show($.term, prog(t, 0.1, 0.2, ease.linear) * (1 - prog(t, h1 + 0.2, 0.35, ease.linear)));
      $.term.style.transform = rtf({ x: 180, y: 160, w: $.TW }, { x: r.x, y: r.y + (1 - tin) * 40, w: r.w * lerp(0.92, 1, tin) });
      const tp = prog(t, 0.35, 0.75, ease.linear), n = $.ty.set(tp);
      cursorAt($.cur, $.ty.units, n);
      const lu = $.ty.units[Math.max(0, n - 1)];
      set($.cur, 'top', (lu ? lu.offsetTop + 6 : 6) + 'px');
      show($.cur, t > 0.3 && t < h0 + 0.2 ? (tp < 1 ? 1 : blink(a)) : 0);
      // 둘째 묶음: Blender 작업 화면, 약 3시간
      const out = 1 - prog(t, h1 + 0.25, 0.35, ease.linear);
      const bp = prog(t, h0 + 0.15, 0.6, ease.snap);
      show($.bl.el, prog(t, h0 + 0.15, 0.25, ease.linear));
      set($.bl.el, 'transform', `translateY(${f1((1 - bp) * 70)}px)`);
      $.bl.el.style.clipPath = bp >= 1 ? 'none' : `inset(0 0 ${f1((1 - bp) * 100)}% 0 round 12px)`;
      const hp = prog(t, h0 + 0.3, 0.5, ease.pop);
      show($.hrs, prog(t, h0 + 0.3, 0.2, ease.linear) * out);
      set($.hrs, 'transform', `translateY(${f1((1 - hp) * 40)}px) scale(${f4(lerp(0.85, 1, hp))})`);
      show($.s1, prog(t, h0 + 0.5, 0.45) * out); set($.s1, 'transform', `translateY(${f1((1 - prog(t, h0 + 0.5, 0.45)) * 24)}px)`);
      show($.s2, prog(t, h0 + 0.6, 0.45) * out); set($.s2, 'transform', `translateY(${f1((1 - prog(t, h0 + 0.6, 0.45)) * 24)}px)`);
      $.mk.render(t, h0 + 0.9, 0.5);
      show($.track, prog(t, h0 + 0.6, 0.3) * out);
      const fp = prog(t, h0 + 0.65, 0.7, ease.inOutCubic);
      set($.fill, 'transform', `scaleX(${f4(fp)})`);
      const g = (a * 0.35) % 1;
      $.glint.style.opacity = fp >= 1 ? f3(Math.sin(g * Math.PI) * 0.9) : '0';
      set($.glint, 'transform', `translateX(${f1(-45 + g * 600)}px)`);
      // 셋째 묶음: 3D 플레이 화면이 Blender 자리에서 화면 가득 커진다
      const gp = prog(t, h1, 0.8, ease.inOutCubic);
      show($.g3.el, prog(t, h1, 0.15, ease.linear));
      const R = lrect(BL, { x: -12, y: -12, w: 1944, h: 1104 }, gp);
      css($.g3.el, { left: f1(R.x) + 'px', top: f1(R.y) + 'px', width: f1(R.w) + 'px', height: f1(R.h) + 'px', borderRadius: f1(12 * (1 - gp)) + 'px' });
      kb($.g3, 1.0 + 0.04 * Math.sin(a * 0.2));
      show($.top, gp); show($.bot, prog(t, h1 + 0.1, 0.5, ease.inOutSine));
      fadeUp($.cap, t, h1 + 0.6, 0.5, 24);
    },
  });

  // ─── 86. 에이전트가 직접 플레이하며 검사했다(push · drift): serif 두 덩어리, 「직접 플레이」 형광 밑줄, 뒤에 3D 화면 15% ───
  const G86 = 1.0;   // 빌드 1개. 짧은 선과 셋째 문장이 나오는 묶음의 시작 시각(「직접 플레이」 밑줄이 거의 다 그어질 때)
  DECK.slide({
    id: 'game-qa', holds: [], dur: 2.8, notes: NOTES['game-qa'],
    setup(el) {
      const $ = this.$;
      $.back = layer(el);
      $.bimg = photo($.back, CASE + 'game_3d.jpg', { x: -60, y: -40, w: 2040, h: 1160, radius: 0, border: 'none', shadow: 'none' });
      div(el, '', { left: '0px', top: '0px', width: '1920px', height: '1080px', background: 'linear-gradient(90deg, rgba(14,16,19,.75) 0%, rgba(14,16,19,.35) 70%, rgba(14,16,19,.2) 100%)' });
      const st = { left: '200px', font: '700 64px/1.3 var(--serif)', color: 'var(--ink)', opacity: 0 };
      $.b1 = div(el, '', { left: '0px', top: '0px', width: '1920px', height: '1080px' });
      $.l1 = txt($.b1, '에이전트가 게임을 직접 플레이하며', Object.assign({ top: '300px' }, st));
      $.l2 = txt($.b1, '난이도를 조정했습니다.', Object.assign({ top: '392px' }, st));
      $.mk = U.mark($.l1, { word: '직접 플레이' });
      $.l3 = txt(el, '만드는 역할과 검사하는 역할이 따로 있었습니다.', Object.assign({ top: '620px' }, st));
      $.rule = div(el, '', { left: '200px', top: '560px', width: '120px', height: '4px', background: 'var(--accent)', transformOrigin: '0 50%', transform: 'scaleX(0)' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, h0 = G86;
      $.back.style.transform = U.depth(x, -0.4);
      show($.bimg.el, 0.15 * Math.max(smooth(0.05, 0.6, x.arrive), prog(t, 0, 0.6)));
      kb($.bimg, 1.06 + 0.05 * Math.sin(a * 0.1));
      // 두 줄은 밀려 들어오는 동안(x.arrive 0부터) 제자리에 보인다. 도착 뒤 처음 움직이는 요소는 「직접 플레이」 형광 밑줄이다
      const pre = smooth(0, 0.3, x.arrive);
      [$.l1, $.l2].forEach((l, i) => {
        const p = Math.max(prog(t, 0.1 + i * 0.18, 0.6, ease.snap), pre);
        show(l, p); set(l, 'transform', `translateY(${f1((1 - p) * 34)}px)`);
      });
      $.mk.render(t, 0.7, 0.55);
      // 셋째 문장이 올라오는 동안 위 두 줄을 50%로 낮춰 시선을 옮기고, 끝 화면에서는 다시 100%로 올려 세 문장이 모두 읽히게 한다
      const dim = prog(t, h0, 0.4, ease.inOutSine) * (1 - prog(t, h0 + 0.95, 0.5, ease.inOutSine));
      $.b1.style.opacity = f3(lerp(1, 0.5, dim));
      set($.rule, 'transform', `scaleX(${f4(prog(t, h0 + 0.05, 0.5, ease.outCubic))})`);
      const p3 = prog(t, h0 + 0.15, 0.6, ease.snap);
      show($.l3, p3); set($.l3, 'transform', `translateY(${f1((1 - p3) * 34)}px)`);
    },
  });

  // ─── 87. 드라마 대본 하네스의 에이전트 구성(push · drift): 기획·구조 넷 → 집필(지문 작가, 대화 지휘 → 인물 페르소나 15 → 대본 조립) → 점검·검수 넷 ───
  // 2026-11-17 사용자 지시로 옛 결재 대기함(approval) 사례 자리에 넣었다. 구성은 drama 프로젝트의 .claude/agents(역할 11 + 페르소나 15, 처음 쓰던 대사 작가 1개는 폐기)
  const D88 = {
    left: [['총괄 작가', '톤·주제, 단계별 승인'], ['인물 설계', '인물 21명과 관계도'], ['구조 설계', '12부작·회차 끝 장면'], ['씬 분해', '회차를 장면 목록으로']],
    right: [['대사 코치', '인물별 대사 분포 점검'], ['대본 포맷', '방송 표준 대본 형식'], ['자연스러움 검수', '번역투 검사(Codex)'], ['연속성 검수', '복선·시간선 확인']],
    LX: 200, CX: 640, RX: 1340, CW: 380, MW: 640, Y0: 390, STEP: 126, CH: 92,
  };
  DECK.slide({
    // 한 클릭 빌드: 제목(0) → 왼쪽 넷(0.3~) → 집필: 지문 작가·대화 지휘(0.75~) → 페르소나 15개가 퍼짐(1.05~1.6) → 대본 조립(1.6) → 오른쪽 넷(1.75~) → 화살표
    id: 'drama-team', holds: [], dur: 2.9,
    notes: '이번에는 창작입니다. 12부작 드라마 극본을 하네스로 썼습니다. 장면 657개, 대본 18,230줄입니다. 구성은 세 덩어리입니다. 총괄 작가, 인물 설계, 구조 설계, 씬 분해가 기획과 구조를 정합니다. 지문 작가는 지문만 씁니다. 대사는 인물마다 따로 둔 페르소나 에이전트 15개가 각자 자기 대사만 말하고, 대화 지휘 에이전트가 그 대사를 모아 장면으로 만듭니다. 처음에는 대사 작가 하나가 모든 인물의 대사를 썼는데, 한 사람이 쓴 대화처럼 평면적이라는 피드백을 받고 이 구조로 바꿨습니다. 마지막에 대사 분포, 대본 형식, 번역투, 회차 간 연속성을 따로 검사합니다. 영상 두 편을 보겠습니다. 먼저 티저입니다. (연사 확인)',
    setup(el) {
      const $ = this.$, D = D88;
      $.title = txt(el, '드라마 대본 · <span style="color:var(--accent)">인물마다 에이전트 하나</span>', { left: '200px', top: '186px', font: '900 64px/1.15 var(--display)', letterSpacing: '-.025em', color: 'var(--ink)', opacity: 0 });
      $.sub = txt(el, '12부작 〈언리얼 아이돌〉 · 장면 657개 · 대본 18,230줄', { left: '202px', top: '274px', font: '500 32px/1.3 var(--sans)', color: 'var(--mut)', opacity: 0 });
      $.svg = svgLayer(el);
      const head = (x, html) => txt(el, html, { left: x + 'px', top: D.Y0 - 52 + 'px', font: '700 30px/1.3 var(--sans)', color: 'var(--ink2)', opacity: 0 });
      $.hL = head(D.LX, '기획 · 구조 <span style="font-family:var(--mono);color:var(--accent2)">4</span>');
      $.hC = head(D.CX, '집필 <span style="font-family:var(--mono);color:var(--accent)">3 + 15</span>');
      $.hR = head(D.RX, '점검 · 검수 <span style="font-family:var(--mono);color:var(--accent2)">4</span>');
      const card = (x, y, w, name, desc, hot) => {
        const c = div(el, '', { left: x + 'px', top: y + 'px', width: w + 'px', height: D.CH + 'px', borderRadius: '14px', background: 'var(--bg1)',
          border: `2px solid ${hot ? 'color-mix(in srgb, var(--accent) 70%, transparent)' : 'var(--line)'}`, boxShadow: '0 14px 30px rgba(0,0,0,.4)', opacity: 0 });
        txt(c, name, { left: '22px', top: '9px', font: '700 32px/1.25 var(--sans)', color: 'var(--ink)' });
        txt(c, desc, { left: '22px', top: '50px', font: '500 28px/1.2 var(--sans)', color: 'var(--mut)' });
        return c;
      };
      $.L = D.left.map(([n, d], i) => card(D.LX, D.Y0 + i * D.STEP, D.CW, n, d));
      $.R = D.right.map(([n, d], i) => card(D.RX, D.Y0 + i * D.STEP, D.CW, n, d));
      $.cAct = card(D.CX, D.Y0, D.MW, '지문 작가', '지문만 쓰고 대사 자리는 비운다', true);
      $.cCon = card(D.CX, D.Y0 + 104, D.MW, '대화 지휘', '장면마다 등장인물 페르소나를 동시에 부른다');
      // 퍼지는 선 위에 얹는 띠: 배경을 채워 선이 글자를 가로지르지 않게 한다(선은 띠 뒤로 지나 위아래로만 보인다)
      $.pLab = txt(el, '인물 페르소나 <span style="font-family:var(--mono);color:var(--accent)">15</span> · 각자 자기 대사만', { left: D.CX + 60 + 'px', top: D.Y0 + 210 + 'px', width: D.MW - 120 + 'px', height: '40px', textAlign: 'center', boxSizing: 'border-box',
        font: '600 28px/36px var(--sans)', color: 'var(--ink)', background: 'var(--bg1)', border: '2px solid color-mix(in srgb, var(--accent2) 55%, transparent)', borderRadius: '20px', opacity: 0 });
      // 페르소나 15개: 두 줄(8 + 7), 지름 48, 간격 16, 집필 칸 가운데 맞춤
      const PD = 48, PG = 16, py0 = D.Y0 + 262;
      $.P = Array.from({ length: 15 }, (_, i) => {
        const row = i < 8 ? 0 : 1, k = row ? i - 8 : i, n = row ? 7 : 8;
        const w = n * PD + (n - 1) * PG, x = D.CX + (D.MW - w) / 2 + k * (PD + PG), y = py0 + row * (PD + PG);
        const c = div(el, '', { left: f1(x) + 'px', top: y + 'px', width: PD + 'px', height: PD + 'px', borderRadius: '50%',
          background: 'color-mix(in srgb, var(--accent2) 30%, var(--bg1))', border: '2px solid color-mix(in srgb, var(--accent2) 80%, transparent)', opacity: 0 });
        return { el: c, cx: x + PD / 2, top: y, bot: y + PD, i };
      });
      $.cAsm = card(D.CX, D.Y0 + 386, D.MW, '대본 조립', '지문과 대사를 한 회차 대본으로 합친다');
      // 대화 지휘 → 페르소나(퍼짐), 페르소나 → 대본 조립(모임): 가는 선
      const cx = D.CX + D.MW / 2, conB = D.Y0 + 104 + D.CH, asmT = D.Y0 + 386;
      $.fan = $.P.map(p => path($.svg, p.i < 8 ? `M${f1(cx)} ${conB} L${f1(p.cx)} ${p.top}` : `M${f1(p.cx)} ${p.bot} L${f1(cx)} ${asmT}`, { color: DECK.rgba('accent2', 0.45), sw: 2 }));
      // 덩어리 사이 화살표
      const ay = D.Y0 + 1.5 * D.STEP + D.CH / 2;
      $.a1 = arrow($.svg, `M${D.LX + D.CW + 8} ${ay} H${D.CX - 10}`, { color: DECK.rgba('accent', 0.9), sw: 3, k: 12 });
      $.a2 = arrow($.svg, `M${D.CX + D.MW + 8} ${ay} H${D.RX - 10}`, { color: DECK.rgba('accent', 0.9), sw: 3, k: 12 });
      $.dot = dot($.svg, 6, DECK.rgba('accent', 1));
      $.cx = cx; $.conB = conB; $.asmT = asmT;
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const tp = Math.max(prog(t, 0.0, 0.55), smooth(0, 0.3, x.arrive));
      show($.title, tp); set($.title, 'transform', `translateY(${f1((1 - tp) * 24)}px)`);
      fadeUp($.sub, t, 0.15, 0.5, 18);
      fadeUp($.hL, t, 0.25, 0.45, 14); fadeUp($.hC, t, 0.7, 0.45, 14); fadeUp($.hR, t, 1.7, 0.45, 14);
      $.L.forEach((c, i) => fadeUp(c, t, 0.3 + i * 0.1, 0.5, 26));
      fadeUp($.cAct, t, 0.75, 0.5, 26); fadeUp($.cCon, t, 0.88, 0.5, 26);
      fadeUp($.pLab, t, 1.0, 0.45, 14);
      $.P.forEach(p => {
        const st = 1.05 + p.i * 0.035, q = prog(t, st, 0.4, ease.pop);
        show(p.el, prog(t, st, 0.15, ease.linear));
        // 머무는 동안: 페르소나가 돌아가며 밝아진다(동시에 여러 인물이 말하는 모습)
        const talk = 0.5 + 0.5 * Math.sin(a * 2.3 + p.i * 2.4);
        p.el.style.transform = `scale(${f4(lerp(0.3, 1, q) * (1 + 0.08 * talk * prog(t, 1.9, 0.5)))})`;
        p.el.style.background = `color-mix(in srgb, var(--accent2) ${Math.round(30 + 45 * talk * prog(t, 1.9, 0.5))}%, var(--bg1))`;
        draw($.fan[p.i], prog(t, st - 0.05, 0.3));
      });
      fadeUp($.cAsm, t, 1.6, 0.5, 26);
      $.R.forEach((c, i) => fadeUp(c, t, 1.75 + i * 0.1, 0.5, 26));
      $.a1.set(prog(t, 0.65, 0.35, ease.inOutCubic)); $.a2.set(prog(t, 1.65, 0.35, ease.inOutCubic));
      // 머무는 동안: 점 하나가 대화 지휘 → 페르소나 → 대본 조립 순서로 오간다
      const on = prog(t, 2.2, 0.4);
      if (on > 0) {
        const k = (a * 0.5) % 1, j = Math.floor(a * 0.5) % 15, p = $.P[j];
        const P0 = [$.cx, $.conB], P1 = [p.cx, (p.top + p.bot) / 2], P2 = [$.cx, $.asmT];
        const q = k < 0.5 ? [lerp(P0[0], P1[0], k * 2), lerp(P0[1], P1[1], k * 2)] : [lerp(P1[0], P2[0], k * 2 - 1), lerp(P1[1], P2[1], k * 2 - 1)];
        place($.dot, q); $.dot.style.opacity = f3(on * Math.min(1, k * 8, (1 - k) * 8));
      } else $.dot.style.opacity = '0';
    },
  });

  // ─── 88~90. 드라마 티저 · 드라마 하네스 메이킹 · 특허 하네스 소개(영상) ───
  // 2026-11-17 사용자 제공 영상(1920×1080, H.264·AAC, 약 -14 LUFS로 다른 영상과 같은 크기). 포스터는 제목이 다 보이는 끝 무렵 프레임
  DECK.videoSlide({ id: 'v-drama-teaser', video: 'v07_drama_teaser', notes: '(영상 60초, 소리 있음. 하네스로 쓴 극본의 홍보 티저다. 끝나면: 이번에는 이 극본을 쓴 에이전트 팀이 어떻게 일했는지 보겠습니다.)' });
  DECK.videoSlide({ id: 'v-drama-team', video: 'v08_drama_team', notes: '(영상 60초. 드라마 하네스의 작업 과정. 영상의 「27」은 처음 쓰던 대사 작가까지 센 에이전트 파일 수다. 끝나면: 다음은 업무 사례입니다. 아이디어 메모를 넣으면 특허 출원 준비 서류를 만드는 하네스입니다.)' });
  DECK.videoSlide({ id: 'v-patent', video: 'v09_patent', notes: '(영상 96초. 에이전트 15개가 선행기술 검증부터 청구항·명세서·모의 심사·출원 일정까지 맡는 순서를 보여 준다. 끝나면 바로 다음 슬라이드로 넘긴다.)' });

  // ─── 91. 이 발표 자료를 만든 하네스(push · track): 한 줄 소개 → 숫자 셋과 실제 폴더 → 다섯 단계(클릭 없이 이어짐, 카메라가 물러난 뒤 아래로) ───
  // 빌드 1개. 묶음 시작 시각: 한 줄 소개 0.05 → 숫자 셋과 실제 폴더 G88[0] → 다섯 단계 G88[1]
  const G88 = [0.95, 2.0];
  // 카메라: 한 줄 소개를 1.45배로 본 자리(A) → CAM88.t1부터 0.8초 동안 폴더 셋 전체(B) → CAM88.t2부터 0.8초 동안 아래로 내려가 다섯 단계까지(C, 끝 자리).
  // camTrack은 끝 자리 C 하나만 두고, cameraHook이 C 기준 차이를 돌려준다(끝 화면에서는 0)
  const CAM88 = { A: [600, 184, 1.45], B: [960, 518, 1], C: [960, 640, 1], t1: 0.7, t2: 2.0, d: 0.8 };
  const COL88 = [
    { label: '에이전트', n: '7', dir: '.claude/agents/', icon: 'doc', files: ['deck-director.md', 'deck-engine-builder.md', 'deck-reviewer.md', 'lecture-researcher.md', 'motion-video-maker.md', 'slide-builder.md', 'visual-asset-maker.md'] },
    { label: '스킬', n: '8', dir: '.claude/skills/', icon: 'folder', files: ['camera-deck-engine/', 'deck-orchestrator/', 'deck-qa/', 'deck-storyboard/', 'deck-video/', 'deck-visuals/', 'lecture-research/', 'slide-motion-craft/'] },
    { label: '워크플로', n: '2', dir: '.claude/workflows/', icon: 'code', files: ['deck-build-chapters.js', 'deck-research.js'] },
  ];
  const ST88 = ['리서치', '스토리보드', '엔진·이미지·영상', '장별 제작과 검수', '통합 검수'];
  DECK.slide({
    id: 'this-deck', holds: [], dur: 3.5,
    camTrack: [CAM88.C],
    cameraHook(t) {
      const { A, B, C, t1, t2, d } = CAM88;
      const p1 = ease.inOutCubic(clamp((t - t1) / d)), p2 = ease.inOutCubic(clamp((t - t2) / d));
      const lz = (u, v, p) => Math.exp(lerp(Math.log(u), Math.log(v), p));
      const cx = lerp(lerp(A[0], B[0], p1), C[0], p2), cy = lerp(lerp(A[1], B[1], p1), C[1], p2), z = lz(lz(A[2], B[2], p1), C[2], p2);
      return { dx: cx - C[0], dy: cy - C[1], dz: PERSP / z - PERSP / C[2] };
    },
    setup(el) {
      const $ = this.$;
      $.intro = txt(el, '지금 보시는 이 발표 자료', { left: '180px', top: '140px', font: '900 72px/1.2 var(--display)', letterSpacing: '-.02em', color: 'var(--ink)', opacity: 0 });
      const RH = 46, CY = 420;
      $.cols = COL88.map((c, i) => {
        const x = 180 + i * 540;
        const hd = div(el, '', { left: x + 'px', top: '258px', display: 'flex', alignItems: 'baseline', gap: '18px', whiteSpace: 'nowrap', opacity: 0 });
        const lb = h('span', '', hd, c.label); css(lb, { font: '700 42px var(--sans)', color: 'var(--ink)' });
        const nb = h('span', '', hd, c.n); css(nb, { font: '400 130px/1 var(--num)', color: 'var(--accent)' });
        const card = div(el, '', { left: x + 'px', top: CY + 'px', width: '480px', height: 64 + 8 * RH + 26 + 'px', borderRadius: '16px', background: 'var(--bg1)', border: '1.5px solid var(--line)', boxShadow: '0 20px 44px rgba(0,0,0,.4)', overflow: 'hidden', opacity: 0 });
        const ch = div(card, '', { left: '0px', top: '0px', right: '0px', height: '62px', borderBottom: '1.5px solid var(--line2)', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px', whiteSpace: 'nowrap' });
        U.icon(ch, 'folder', 30, 'var(--accent)', 1.9);
        const dn = h('span', '', ch, c.dir); css(dn, { font: '700 28px var(--mono)', color: 'var(--ink)' });
        const sel = div(card, '', { left: '8px', right: '8px', top: '74px', height: RH - 4 + 'px', borderRadius: '8px', background: 'var(--accentSoft)', opacity: 0 });
        const rows = c.files.map((f, j) => {
          const r = div(card, '', { left: '22px', top: 74 + j * RH + 'px', height: RH - 4 + 'px', display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap', opacity: 0 });
          U.icon(r, c.icon, 26, 'var(--mut)', 1.8);
          const nm = h('span', '', r, f); css(nm, { font: '500 28px var(--mono)', color: 'var(--ink)' });
          return r;
        });
        return { hd, card, rows, sel, ch };
      });
      // 다섯 단계 줄(카메라가 내려가면 보인다)
      $.svg = svgLayer(el);
      const Y = 936, HH = 68, G = 52;
      $.steps = ST88.map(nm => {
        const b = div(el, '', { top: Y + 'px', height: HH + 'px', display: 'flex', alignItems: 'center', padding: '0 26px', whiteSpace: 'nowrap', borderRadius: '14px', background: 'var(--bg1)', border: '2px solid var(--line)', opacity: 0 });
        const tx = h('span', '', b, nm); css(tx, { font: '650 36px var(--sans)', color: 'var(--ink)' });
        return { el: b, w: b.offsetWidth };
      });
      let tot = $.steps.reduce((m, b) => m + b.w, 0) + G * 4;
      if (tot > 1560) { const k = (1560 - G * 4) / (tot - G * 4); $.steps.forEach(b => { b.el.querySelector('span').style.fontSize = Math.floor(36 * k) + 'px'; b.w = b.el.offsetWidth; }); tot = $.steps.reduce((m, b) => m + b.w, 0) + G * 4; }
      let xx = 960 - tot / 2;
      $.steps.forEach(b => { b.x = xx; b.el.style.left = f1(xx) + 'px'; xx += b.w + G; });
      $.arr = $.steps.slice(0, 4).map((b, i) => arrow($.svg, `M${f1(b.x + b.w + 10)} ${Y + HH / 2} H${f1($.steps[i + 1].x - 10)}`, { color: DECK.rgba('accent', 0.85), sw: 3, k: 11 }));
    },
    render(t, x) {
      const $ = this.$, a = x.a, [h0, h1] = G88;
      // 묶음 1: 한 줄 소개(카메라가 다섯 단계로 내려가면 비킨다. 이전 마지막 빌드 끝 화면과 같다). 들어오는 이동 중에는 옅게 먼저 보여 빈 판을 피한다
      const ip = prog(t, 0.05, 0.6);
      show($.intro, Math.max(ip, 0.4 * smooth(0.15, 0.7, x.arrive)) * (1 - prog(t, CAM88.t2, 0.4, ease.linear)));
      set($.intro, 'transform', `translateY(${f1((1 - ip) * 30)}px)`);
      // 묶음 2: 숫자 셋과 실제 폴더(카메라가 물러나는 동안)
      $.cols.forEach((c, i) => {
        const st = h0 + i * 0.12;
        const hp = prog(t, st, 0.55, ease.pop);
        show(c.hd, prog(t, st, 0.2, ease.linear));
        set(c.hd, 'transform', `translateY(${f1((1 - hp) * 36)}px)`);
        const cp = prog(t, st + 0.1, 0.55, ease.snap);
        show(c.card, cp);
        show(c.ch, cp);
        set(c.card, 'transform', `translateY(${f1((1 - cp) * 40)}px)`);
        c.rows.forEach((r, j) => { const rp = prog(t, st + 0.3 + j * 0.05, 0.35); show(r, rp); set(r, 'transform', `translateX(${f1((1 - rp) * -16)}px)`); });
        // 머무는 동안: 선택 줄이 목록을 천천히 오르내린다(에이전트 열만)
        if (i === 0) {
          const u = a * 0.55, sq = Math.floor(u) % 12, k0 = sq <= 6 ? sq : 12 - sq, k1 = sq + 1 <= 6 ? sq + 1 : 12 - (sq + 1);
          const pos = lerp(k0, k1, ease.inOutCubic(clamp((u - Math.floor(u) - 0.7) / 0.3)));
          show(c.sel, prog(t, h0 + 1.05, 0.4) * 0.9);
          set(c.sel, 'transform', `translateY(${f1(pos * 46)}px)`);
        }
      });
      // 묶음 3: 다섯 단계(카메라가 아래로 내려가는 동안)
      $.steps.forEach((b, i) => {
        const st = h1 + 0.25 + i * 0.1, p = prog(t, st, 0.5, ease.pop);
        show(b.el, prog(t, st, 0.18, ease.linear));
        set(b.el, 'transform', `translateY(${f1((1 - p) * 30)}px) scale(${f4(lerp(0.85, 1, p))})`);
        if (i < 4) $.arr[i].set(prog(t, st + 0.18, 0.25, ease.inOutCubic));
        const k = (a * 0.5) % 5, d = Math.min(Math.abs(i - k), 5 - Math.abs(i - k)), hl = clamp(1 - d) * prog(t, h1 + 1.2, 0.4);
        b.el.style.borderColor = hl > 0.02 ? DECK.rgba('accent', 0.25 + 0.75 * hl) : 'var(--line)';
      });
    },
  });

  // ─── 92. 장마다 제작 → 독립 검수 → 수정(slide-r · none): 세 칸 순환 + 검수 칸에서 세 판정이 갈라짐 → 검수 담당의 조건 ───
  const G89 = 1.5;   // 빌드 1개. 검수 담당의 조건 문장이 나오는 시각(세 판정 상자가 자리 잡을 무렵)
  const C89 = { x: 660, y: 500, r: 250 };
  const N89 = [['제작', -90], ['독립 검수', 30], ['수정', 150]];
  const V89 = [['유지', 'check', 'var(--ok)', 'ok'], ['고침', 'pen', 'var(--accent)', 'accent'], ['다시 만듦', 'x', 'var(--bad)', 'bad']];
  DECK.slide({
    id: 'this-deck-review', holds: [], dur: 3.0,
    setup(el) {
      const $ = this.$;
      $.svg = svgLayer(el);
      const P = deg => [C89.x + C89.r * Math.cos((deg * Math.PI) / 180), C89.y + C89.r * Math.sin((deg * Math.PI) / 180)];
      $.ring = s('circle', { cx: C89.x, cy: C89.y, r: C89.r, fill: 'none', stroke: DECK.rgba('ink', 0.08), 'stroke-width': 2 }, $.svg);
      $.ring.style.opacity = '0';
      const D = 23;
      $.arcs = N89.map(([, d0], i) => {
        const d1 = N89[(i + 1) % 3][1] + (i === 2 ? 360 : 0);
        const A = P(d0 + D), B = P(d1 - D);
        return arrow($.svg, `M${f1(A[0])} ${f1(A[1])} A${C89.r} ${C89.r} 0 0 1 ${f1(B[0])} ${f1(B[1])}`, { color: DECK.rgba('accent', 0.9), sw: 4, k: 16 });
      });
      $.nodes = N89.map(([nm, d], i) => {
        const [cx, cy] = P(d);
        const b = div(el, '', { top: cy - 50 + 'px', height: '100px', display: 'flex', alignItems: 'center', gap: '14px', padding: '0 34px', whiteSpace: 'nowrap', borderRadius: '50px',
          background: 'var(--bg1)', border: `${i === 1 ? 3 : 2}px solid ${i === 1 ? 'var(--accent2)' : 'var(--line)'}`, boxShadow: '0 18px 40px rgba(0,0,0,.45)', opacity: 0 });
        if (i === 1) U.icon(b, 'eye', 40, 'var(--accent2)', 2);
        const tx = h('span', '', b, nm); css(tx, { font: '900 50px var(--display)', color: 'var(--ink)', letterSpacing: '-.02em' });
        const w = b.offsetWidth; b.style.left = f1(cx - w / 2) + 'px';
        return { el: b, cx, cy, w };
      });
      const R = $.nodes[1], sx = R.cx + R.w / 2;
      $.verd = V89.map(([nm, ic, col, key], j) => {
        const y = 420 + j * 160;
        const b = div(el, '', { left: '1240px', top: y - 40 + 'px', height: '80px', display: 'flex', alignItems: 'center', gap: '14px', padding: '0 30px 0 22px', whiteSpace: 'nowrap', borderRadius: '16px',
          background: 'var(--bg1)', border: `2px solid ${DECK.rgba(key, 0.7)}`, opacity: 0 });
        U.icon(b, ic, 36, col, 2.4);
        const tx = h('span', '', b, nm); css(tx, { font: '700 42px var(--sans)', color: 'var(--ink)' });
        const ln = arrow($.svg, `M${f1(sx + 10)} ${R.cy} C${f1(sx + 120)} ${R.cy}, 1110 ${y}, 1226 ${y}`, { color: DECK.rgba(key, 0.8), sw: 3, k: 12 });
        return { el: b, ln };
      });
      $.dot = dot($.svg, 9, DECK.rgba('accent2', 1));
      $.cond = txt(el, '검수 담당은 만든 과정을 모르는 상태에서 화면만 보고 판정한다', { left: '180px', top: '868px', font: '600 40px/1.3 var(--sans)', color: 'var(--ink)', opacity: 0 });
      $.mk = U.mark($.cond, { word: '화면만 보고' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, h0 = G89;
      $.ring.style.opacity = f3(Math.max(smooth(0.1, 0.6, x.arrive), prog(t, 0, 0.4)));
      // 세 노드는 밀려 들어오는 동안(x.arrive 0부터) 제자리에 보인다. 도착 뒤 노드 사이 화살표가 차례로 그려진다
      const pre = smooth(0, 0.3, x.arrive);
      $.nodes.forEach((n, i) => {
        const st = 0.1 + i * 0.25, p = Math.max(prog(t, st, 0.5, ease.pop), pre);
        show(n.el, Math.max(prog(t, st, 0.18, ease.linear), pre));
        set(n.el, 'transform', `scale(${f4(lerp(0.7, 1, p))})`);
        $.arcs[i].set(prog(t, st + 0.25, 0.4, ease.inOutCubic));
      });
      $.verd.forEach((v, j) => {
        const st = 1.0 + j * 0.12;
        v.ln.set(prog(t, st, 0.4, ease.inOutCubic));
        const p = prog(t, st + 0.25, 0.5, ease.pop);
        show(v.el, prog(t, st + 0.25, 0.18, ease.linear));
        set(v.el, 'transform', `translateX(${f1((1 - p) * -30)}px) scale(${f4(lerp(0.85, 1, p))})`);
        // 머무는 동안 세 판정이 차례로 밝아진다
        const u = a * 0.8, kk = Math.floor(u) % 3, fr = u - Math.floor(u);
        const hl = (kk === j ? smooth(0, 0.18, fr) * (1 - smooth(0.82, 1, fr)) : 0) * prog(t, 1.8, 0.4);
        v.el.style.background = hl > 0.01 ? `color-mix(in srgb, ${V89[j][2]} ${f1(28 * hl)}%, var(--bg1))` : 'var(--bg1)';
      });
      // 머무는 동안: 점이 순환을 계속 돈다
      if (t >= 0.95) {
        const ang = -90 + 23 + ((a * 42) % 360);
        place($.dot, [C89.x + C89.r * Math.cos((ang * Math.PI) / 180), C89.y + C89.r * Math.sin((ang * Math.PI) / 180)]);
        $.dot.style.opacity = '1';
      } else $.dot.style.opacity = '0';
      fadeUp($.cond, t, h0 + 0.05, 0.55, 24);
      $.mk.render(t, h0 + 0.6, 0.5);
    },
  });

  // ─── 93. 정리: 사례.md(rise · none): 왼쪽 파일 트리 여섯 줄째까지 확인 표시, 오른쪽 요약 → 공통점 ───
  // 빌드 1개. 파일 트리 시각(checkAt 0.2, markAt 0.35, 효과음 tools/make_sound.py EVENTS와 맞춤)은 그대로 두고,
  // 이전 둘째 빌드였던 공통점 문장을 G90부터 이어서 보인다
  const G90 = 0.9;
  DECK.slide({
    id: 'recap-cases', holds: [], dur: 2.0,
    setup(el) {
      const $ = this.$;
      $.kv = photo(el, 'assets/img/kv_cases.png', { x: 1000, y: 200, w: 1240, h: 698, radius: 0, border: 'none', shadow: 'none' });
      css($.kv.el, { maskImage: 'linear-gradient(90deg, transparent 0%, #000 55%)', webkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 55%)' });
      $.tree = U.fileTree(el, { preset: 'side', current: 'c06', done: 6, checkFrom: 6, checkAt: 0.2, markAt: 0.35 });
      // 다음 파일(사람.md) 줄: 머무는 동안 줄 뒤 상자의 불투명도가 0~15% 사이로 오르내린다(마지막 파일이 남았다)
      const r7 = $.tree.rows[6], P = U.TREE_PRESETS.side;
      $.next = div(el, '', { left: P.x - 12 + 'px', top: P.y + 7 * $.tree.R - 4 + 'px', width: $.tree.width + 40 + 'px', height: $.tree.R + 8 + 'px', borderRadius: '12px', background: 'var(--ink)', opacity: 0 });
      el.insertBefore($.next, $.tree.el);
      if (!r7) $.next.remove();
      $.k = txt(el, '사례.md', { left: '640px', top: '330px', font: '700 40px/1.2 var(--mono)', color: 'var(--accent)', opacity: 0 });
      $.h = txt(el, '결과물로 확인한다', { left: '640px', top: '392px', font: '900 68px/1.2 var(--display)', letterSpacing: '-.02em', color: 'var(--ink)', opacity: 0 });
      $.mk = U.mark($.h, { word: '결과물' });
      $.sub = div(el, '<span style="color:var(--accent)">공통점:</span> 중간 산출물이 파일로 남고,<br>검사하는 역할이 따로 있다', { left: '640px', top: '560px', font: '500 42px/1.45 var(--sans)', color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 });
    },
    render(t, x) {
      const $ = this.$, a = x.a, h0 = G90;
      show($.kv.el, (0.19 + 0.05 * Math.sin(a * 0.9)) * Math.max(smooth(0.1, 0.7, x.arrive), prog(t, 0, 0.6)));
      set($.kv.el, 'transform', `translate(${f1(-70 * Math.sin(a * 0.2))}px, ${f1(-24 * Math.sin(a * 0.17 + 1))}px)`);
      kb($.kv, 1.04 + 0.03 * Math.sin(a * 0.13 + 1));
      $.tree.render(t);
      $.next.style.opacity = f3(0.15 * (0.5 - 0.5 * Math.cos(a * 2.1)) * prog(t, h0 + 0.6, 0.5));
      fadeUp($.k, t, 0.15, 0.5, 20);
      fadeUp($.h, t, 0.25, 0.6, 26);
      $.mk.render(t, 0.75, 0.5);
      fadeUp($.sub, t, h0 + 0.1, 0.55, 24);
    },
  });
})();
