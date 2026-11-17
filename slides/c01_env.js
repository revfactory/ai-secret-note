/* c01 「환경.md: 모델이 아니라 환경을 바꾼다」 — 슬라이드 12~25(14장)
 * 바탕 plain(무늬 없는 어두운 바탕). 색은 숫자와 상태(사고 칸·막대)에만 쓴다.
 * 카메라 값은 스토리보드에서 읽는다. 노트도 스토리보드에서 읽되, 문구를 고친 20번(exp-result)·21번(exp-level)·22번(exp-limit)·25번(recap-env)만
 * DECK.slide의 notes로 덮어쓴다. 출처 줄은 chrome.source(엔진 공통 크롬). 외부 자료만 적고 발표자 본인 자료(19~22번 실험)는 적지 않는다.
 * 19~21번은 발표자가 직접 한 시험이라 chrome.example로 「자체 시험」을 작게 밝히고, 수치는 본문 크기로만 보인다(발표자 지시 2026-11-16).
 * 12번 영상(v02_env)의 마지막 프레임 = 어두운 바탕 가운데 serif 질문 두 줄(「혼자」 밑줄). 13번 첫 화면이 같은 질문에서 시작한다.
 */
(function () {
  const { ease, prog, clamp, lerp, rand, css, h, s, show, smooth } = DECK;
  const TAU = Math.PI * 2;
  const rg = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${(+a).toFixed(3)})`;
  const mix = (a, b, p) => [0, 1, 2].map(i => Math.round(lerp(a[i], b[i], clamp(p))));
  const pal = () => ({ ink: DECK.color('ink'), mut: DECK.color('mut'), acc: DECK.color('accent'), acc2: DECK.color('accent2'),
    bad: DECK.color('bad'), ok: DECK.color('ok'), bg0: DECK.color('bg0'), bg1: DECK.color('bg1') });

  // ───────── 장 전용 도우미 ─────────
  // 글자 한 덩어리(절대 위치). cx를 주면 가운데 정렬, rx를 주면 오른쪽 끝 정렬(배치 뒤 폭을 재서 맞춘다)
  function tx(el, html, o = {}) {
    const d = h('div', o.wrap ? 'a' : 'a nw', el, html);
    css(d, { left: (o.x ?? 0) + 'px', top: (o.y ?? 0) + 'px', font: `${o.w ?? 600} ${o.size ?? 44}px/${o.lh ?? 1.3} ${o.font || 'var(--sans)'}`,
      color: o.color || 'var(--ink)', letterSpacing: o.ls ?? '-0.01em' });
    if (o.width) d.style.width = o.width + 'px';
    if (o.cx != null) d.style.left = (o.cx - d.offsetWidth / 2).toFixed(1) + 'px';
    if (o.rx != null) d.style.left = (o.rx - d.offsetWidth).toFixed(1) + 'px';
    d.style.opacity = 0;
    return d;
  }
  // 마스크 안에서 솟는 한 줄. 막대 밑줄(U.mark)이 잘리지 않게 아래 여백을 둔다
  function mline(el, html, o = {}) {
    const size = o.size ?? 44, pT = Math.round(size * 0.16), pB = Math.round(size * 0.26), pX = Math.round(size * 0.12);
    const box = h('div', 'a', el);
    css(box, { left: ((o.x ?? 0) - pX) + 'px', top: ((o.y ?? 0) - pT) + 'px', padding: `${pT}px ${pX}px ${pB}px`, overflow: 'hidden', visibility: 'hidden' });
    const inner = h('div', 'nw', box, html);
    css(inner, { font: `${o.w ?? 600} ${size}px/${o.lh ?? 1.25} ${o.font || 'var(--sans)'}`, color: o.color || 'var(--ink)', letterSpacing: o.ls ?? '-0.01em',
      padding: '0.16em 0.12em', margin: '-0.16em -0.12em' });   // 밑줄 낱말 상자(U.mark)가 줄 상자 안에 들도록 여백만 넓힌다(배치는 그대로)
    if (o.cx != null) box.style.left = (o.cx - box.offsetWidth / 2).toFixed(1) + 'px';
    return { box, inner, size };
  }
  function mIn(m, t, start, dur = 0.6, e = ease.snap) {
    const p = prog(t, start, dur, e);
    m.inner.style.transform = `translateY(${((1 - p) * 118).toFixed(2)}%)`;
    const v = p > 0.001 ? 'inherit' : 'hidden';
    if (m.box.style.visibility !== v) m.box.style.visibility = v;
    return p;
  }
  // 아래에서 올라오며 나타남(보조)
  function up(el, t, start, dur = 0.5, dy = 30, e = ease.snap) {
    const p = prog(t, start, dur, e);
    show(el, prog(t, start, dur * 0.45, ease.linear));
    el.style.transform = `translateY(${((1 - p) * dy).toFixed(1)}px)`;
    return p;
  }
  // 평면 밀기로 들어오는 첫 프레임(x.arrive > 0)부터 다 나와 있는 글(제목처럼 미리 보여도 되는 줄).
  // 밀기 35%·50% 화면에서 들어오는 슬라이드가 빈 바탕으로 보이지 않게 한다. 이웃 미리보기(t<0, x.arrive 0)에서는 감춘다
  const early = (t, x) => t >= 0 || x.arrive > 0;
  function mPre(m, t, x, start, dur) {
    if (!early(t, x)) return mIn(m, t, start, dur);
    m.inner.style.transform = 'translateY(0%)';
    if (m.box.style.visibility !== 'inherit') m.box.style.visibility = 'inherit';
    return 1;
  }
  function upPre(el, t, x, start, dur, dy) {
    if (!early(t, x)) return up(el, t, start, dur, dy);
    show(el, 1); el.style.transform = 'translateY(0px)';
    return 1;
  }
  // 큰 숫자(Anton). cx 기준 가운데 정렬 상자. 기준선 ≈ top + 0.92em
  function bigNum(el, text, o = {}) {
    const size = o.size ?? 200, wd = o.box ?? 900;
    const d = h('div', 'a nw tnum', el);
    d.$t = h('span', '', d, text);
    css(d.$t, { display: 'inline-block', lineHeight: '1' });
    css(d, { left: ((o.cx ?? 960) - wd / 2) + 'px', top: (o.y ?? 300) + 'px', width: wd + 'px', textAlign: o.align || 'center', font: `400 ${size}px/1 var(--num)`,
      color: o.color || 'var(--ink)', letterSpacing: '-0.005em', transformOrigin: `50% 70%` });
    if (o.align === 'left') css(d, { left: (o.x ?? 0) + 'px', transformOrigin: '0 70%' });
    d.style.opacity = 0;
    return d;
  }
  // 직접 그린 아이콘(24 단위 경로)
  const PATHS = {
    rollback: 'M4.5 12a7.5 7.5 0 1 0 2.4-5.5 M4 4.5v4.2h4.2',
    loop: 'M5 12a7 7 0 0 1 12.2-4.7 M19 12a7 7 0 0 1-12.2 4.7 M17.6 3.5v4.1h-4.1 M6.4 20.5v-4.1h4.1',
    trash: 'M4 7h16 M9.5 7V4.5h5V7 M6.5 7l1 13h9l1-13 M10.5 11v5.5 M13.5 11v5.5',
  };
  function icon(parent, name, size, color, sw = 1.8) {
    const sv = s('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
    s('path', { d: PATHS[name] || U.ICON[name] || U.ICON.doc }, sv);
    return sv;
  }
  const svgFull = (el, w = 1920, hh = 1080) => { const sv = s('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, el); css(sv, { position: 'absolute', left: 0, top: 0, overflow: 'visible' }); return sv; };

  // ═════════ 12. 장 전환 영상 v02_env ═════════
  DECK.videoSlide({ id: 'v-env', video: 'v02_env' });

  // ═════════ 13. 지금까지 AI는 사람의 일을 보조했다(push · drift) ═════════
  // 첫 화면 = 영상 마지막 프레임(같은 자리·같은 크기의 질문). 질문이 위로 빠지면서 두 열이 나온다
  // 한 클릭 빌드(2026-11-16): 사람 열(0.45~) → AI 열(1.05~) → 묻고 답하기(1.6~)가 클릭 없이 이어서 나온다. 질문이 빠지는 시각은 그대로 둔다(영상 끝 프레임과 같은 첫 화면)
  const PEOPLE = [['flag', '방향 결정'], ['eye', '중간 판단'], ['shield', '품질 확인'], ['pen', '최종 책임']];
  const AIS = [['search', '검색과 요약'], ['doc', '초안 작성'], ['code', '코드 제안'], ['layers', '반복 작업']];
  DECK.slide({
    id: 'assist-era', holds: [], dur: 2.6,
    setup(el) {
      const $ = this.$; $.c = pal();
      // 영상 v02 closingLine과 같은 값: top 372, serif 700 92px/1.36, 자간 -0.025em, 가운데, 1.03배(기준 960, 492)
      // 질문은 머묾 카메라(drift)를 지운 층(U.pin)에 둔다. cut으로 들어온 첫 프레임에 drift 오프셋(전체 덱에서 약 6px)만큼 어긋나지 않게
      $.qL = h('div', 'full', el);
      $.q = h('div', 'a', $.qL);
      css($.q, { left: '0px', top: '372px', width: '1920px', textAlign: 'center', font: '700 92px/1.36 var(--serif)', letterSpacing: '-0.025em',
        color: 'var(--ink)', whiteSpace: 'nowrap', transformOrigin: '960px 120px', transform: 'scale(1.03)' });
      $.qRows = ['AI에게 혼자 일하게 하면', '어떤 일이 생길까요?'].map(line => { const row = h('div', '', $.q, line); css(row, { position: 'relative' }); return { row }; });
      // 「혼자」 밑줄: 영상 closingLine은 덱 U.mark 규칙을 따른다. 끝 프레임처럼 다 그어진 상태로 둔다
      $.qMk = U.mark($.qRows[0].row, { word: '혼자' }); $.qMk.set(1);
      // 제목 줄
      $.head = mline(el, '<span style="color:var(--mut)">지금까지:</span> 사람이 결정하고 AI가 보조', { x: 200, y: 178, size: 72, w: 'var(--displayW)', font: 'var(--display)', ls: '-0.025em' });
      $.mk = U.mark($.head.inner, { word: '보조' });
      // 가운데 세로선 + 위아래로 움직이는 밝은 띠
      $.div = h('div', 'a', el);
      css($.div, { left: '959px', top: '352px', width: '2px', height: '548px', background: 'var(--line)', transformOrigin: '50% 50%', overflow: 'hidden' });
      $.glint = h('div', 'a', $.div);
      css($.glint, { left: 0, top: 0, width: '2px', height: '90px', background: `linear-gradient(transparent, ${DECK.rgba('accent2', 0.9)}, transparent)` });
      // 두 열
      const col = (x0, label, items) => {
        const lab = mline(el, label, { x: x0, y: 356, size: 56, w: 'var(--displayW)', font: 'var(--display)', ls: '-0.02em' });
        const rows = items.map(([ic, name], i) => {
          const r = h('div', 'a', el);
          css(r, { left: x0 + 'px', top: 460 + i * 108 + 'px', width: '660px', height: '88px', opacity: 0 });
          const ib = h('div', 'a', r);
          css(ib, { left: 0, top: '10px', width: '68px', height: '68px', borderRadius: '18px', background: DECK.rgba('ink', 0.07), border: `1.5px solid ${DECK.rgba('ink', 0.14)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center' });
          icon(ib, ic, 36, 'var(--ink)', 1.7);
          const tt = h('div', 'a nw', r, name);
          css(tt, { left: '96px', top: '14px', font: '600 46px/1.3 var(--sans)', color: 'var(--ink)', letterSpacing: '-0.01em' });
          const rule = h('div', 'a', r);
          css(rule, { left: '96px', top: '86px', width: '520px', height: '1.5px', background: DECK.rgba('ink', 0.1), transformOrigin: '0 50%' });
          return { r, rule };
        });
        return { lab, rows };
      };
      $.L = col(200, '사람', PEOPLE);
      $.R = col(1040, 'AI', AIS);
      // 한 번 묻고 한 번 답: 가운데 두 화살표 사이를 점이 오간다
      $.sv = svgFull(el);
      $.arT = s('path', { d: 'M906 596 L1012 596 M1000 586 L1013 596 L1000 606', stroke: DECK.rgba('ink', 0.55), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $.sv);
      $.arB = s('path', { d: 'M1014 664 L908 664 M920 654 L907 664 L920 674', stroke: DECK.rgba('ink', 0.55), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $.sv);
      $.dot = s('circle', { r: 9, fill: DECK.rgba('accent2', 1) }, $.sv);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      // 질문(영상 끝 프레임) → 위로 빠짐
      $.qL.style.transform = U.pin(x);
      $.qRows.forEach((r, i) => {
        const p = prog(t, 0.02 + i * 0.07, 0.42, ease.inCubic);
        r.row.style.transform = `translateY(${(-p * 110).toFixed(1)}px)`;
        r.row.style.opacity = (1 - p).toFixed(3);
      });
      show($.q, 1 - prog(t, 0.55, 0.05, ease.linear));
      mIn($.head, t, 0.3, 0.65);
      $.mk.render(t, 1.75, 0.5);
      // 세로선: 가운데에서 위아래로 자람
      const dv = prog(t, 0.35, 0.7, ease.inOutCubic);
      show($.div, dv > 0 ? 1 : 0);
      $.div.style.transform = `scaleY(${dv.toFixed(4)})`;
      $.glint.style.transform = `translateY(${(((a * 70) % 640) - 90).toFixed(1)}px)`;
      // 사람 열(첫 묶음). 끝 화면에서 두 열이 모두 읽히도록 흐리게 하지 않는다
      mIn($.L.lab, t, 0.45, 0.55);
      $.L.rows.forEach((o, i) => {
        const st = 0.6 + i * 0.08, p = prog(t, st, 0.6, ease.pop);
        o.r.style.opacity = prog(t, st, 0.25, ease.linear).toFixed(3);
        o.r.style.transform = `translateX(${((1 - p) * -70).toFixed(1)}px)`;
        o.rule.style.transform = `scaleX(${prog(t, st + 0.15, 0.5).toFixed(4)})`;
      });
      // AI 열(둘째 묶음): 사람 열 줄이 자리 잡을 무렵 출발
      mIn($.R.lab, t, 1.05, 0.55);
      $.R.rows.forEach((o, i) => {
        const st = 1.2 + i * 0.08, p = prog(t, st, 0.6, ease.pop);
        o.r.style.opacity = prog(t, st, 0.25, ease.linear).toFixed(3);
        o.r.style.transform = `translateX(${((1 - p) * 70).toFixed(1)}px)`;
        o.rule.style.transform = `scaleX(${prog(t, st + 0.15, 0.5).toFixed(4)})`;
      });
      // 묻고 답하기
      const ap = prog(t, 1.65, 0.4);
      show($.arT, ap); show($.arB, ap);
      const f = (a * 0.42) % 1, top = f < 0.5, g = ease.inOutSine(top ? f * 2 : (f - 0.5) * 2);
      $.dot.setAttribute('cx', (top ? lerp(906, 1006, g) : lerp(1014, 914, g)).toFixed(1));
      $.dot.setAttribute('cy', top ? '596' : '664');
      show($.dot, ap * Math.min(1, Math.sin(g * Math.PI) * 3));
    },
  });

  // ═════════ 14. 더 오래 혼자 일하게 하려면(push · drift) ═════════
  // 질문 뒤로 큰 시계 눈금(반지름 720)이 화면 양옆에 걸치고, 빛나는 눈금이 1초에 한 칸씩 돈다
  DECK.slide({
    id: 'q-autonomy', holds: [], dur: 1.9,
    setup(el) {
      const $ = this.$; $.c = pal();
      $.ring = h('div', 'full', el);
      $.sv = svgFull($.ring);
      const CX = 960, CY = 560, R = 730;
      $.ticks = Array.from({ length: 60 }, (_, i) => {
        const an = (i / 60) * TAU - Math.PI / 2, major = i % 5 === 0, L = major ? 44 : 22;
        const x0 = CX + Math.cos(an) * R, y0 = CY + Math.sin(an) * R, x1 = CX + Math.cos(an) * (R - L), y1 = CY + Math.sin(an) * (R - L);
        const ln = s('line', { x1: x0.toFixed(1), y1: y0.toFixed(1), x2: x1.toFixed(1), y2: y1.toFixed(1), 'stroke-width': major ? 4 : 2.5, 'stroke-linecap': 'round' }, $.sv);
        return { ln, major };
      });
      $.l1 = mline(el, 'AI가 더 오래, 사람 없이 일하게 하려면', { cx: 960, y: 418, size: 76, w: 700, font: 'var(--serif)', ls: '-0.025em', lh: 1.3 });
      $.l2 = mline(el, '무엇이 필요할까요?', { cx: 960, y: 530, size: 76, w: 700, font: 'var(--serif)', ls: '-0.025em', lh: 1.3 });
      $.mk = U.mark($.l1.inner, { word: '더 오래, 사람 없이' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      // 눈금: 카메라가 들어오는 동안 미리 보인다. 빛나는 칸이 1초에 한 칸씩 돌고, 지나간 칸은 몇 초에 걸쳐 원래 밝기로 돌아간다
      const vis = Math.max(smooth(0.05, 0.6, x.arrive), prog(t, 0, 0.6));
      show($.ring, vis);
      const head = (a * 1.0 + 38) % 60;
      $.ticks.forEach((k, i) => {
        const back = (head - i + 60) % 60, glow = Math.exp(-back / 4.5);
        const base = k.major ? 0.26 : 0.13;
        k.ln.setAttribute('stroke', glow > 0.05 ? rg(mix(c.ink, c.acc, glow), base + (0.85 - base) * glow) : rg(c.ink, base));
      });
      $.ring.style.transform = `rotate(${(-a * 0.15).toFixed(3)}deg)`;
      $.ring.style.transformOrigin = '960px 560px';
      mIn($.l1, t, 0.12, 0.7);
      mIn($.l2, t, 0.26, 0.7);
      $.mk.render(t, 0.95, 0.6);
    },
  });

  // ═════════ 15. Replit 운영 데이터베이스 삭제 사고(평면 밀기 · none) ═════════
  // 서버실 사진을 어둡게 깔고, 가로 타임라인 네 칸. 사고 장면이므로 칸은 튀지 않고 짧게 열린다. 사진 속 표시등만 깜박인다
  // 스토리보드 enter는 cut이지만 영상 경계가 아니므로 평면 밀기로 들어온다(덱 비평 반영 회차 공통 규칙 5, 2026-11-16)
  // 한 클릭 빌드(2026-11-16): 빌드 0 = 1칸(0.15) → 2칸(0.75), 멈춤 1.4, 빌드 1 = 3칸(1.5) → 4칸(2.1). 노트는 스토리보드(삭제 뒤 [클릭] 하나)
  const STEPS = [
    { lines: ['코드와 작업을', '동결하라는 지시'], ic: 'lock', col: 'ink' },
    { lines: ['운영 데이터베이스', '삭제'], ic: 'trash', col: 'bad' },
    { lines: ['「복구할 수 없다」고', '잘못 보고'], ic: 'chat', col: 'bad' },
    { lines: ['사용자가 직접', '롤백해 복구'], ic: 'rollback', col: 'ok' },
  ];
  // inc_server.png(2400×1351)를 1920×1080에 채웠을 때 붉은 표시등 자리
  // 타임라인(y 487) 바로 아래 넷째 칸 마디 옆의 세 점(y 501)은 뺐다. 복구 칸 옆 오류 표시처럼 읽혔다
  // 제목 「2025년」 바로 위의 두 점(x 216·231, y 182·189)도 뺐다. 제목 옆 붉은 표시처럼 읽혔다(검수 r1)
  const LEDS = [[668, 312], [1374, 372], [1260, 658], [545, 917]];
  DECK.slide({
    id: 'replit-timeline', holds: [1.4], dur: 3.0,
    camera: { enter: 'push' },
    chrome: { source: '출처: Fortune 2025-07-23 · AI Incident Database #1152' },
    setup(el) {
      const $ = this.$; $.c = pal();
      $.ph = U.image(el, 'assets/img/inc_server.png', { x: 0, y: 0, w: 1920, h: 1080, radius: 0 });
      $.ph.el.style.opacity = 0.62;
      $.shade = h('div', 'full', el);
      css($.shade, { background: `linear-gradient(180deg, ${DECK.rgba('bg0', 0.5)} 0%, ${DECK.rgba('bg0', 0.35)} 40%, ${DECK.rgba('bg0', 0.62)} 100%)` });
      // 사진 자체에 찍힌 붉은 점 셋(x 1679~1715, y 496~506)을 어두운 타원으로 덮는다. 바탕선(y 487)은 이 위에 그린다
      $.cover = h('div', 'a', el);
      css($.cover, { left: '1647px', top: '481px', width: '100px', height: '40px', background: `radial-gradient(closest-side, ${DECK.rgba('bg0', 0.94)} 60%, ${DECK.rgba('bg0', 0)} 100%)` });
      // 제목 줄 위 사진 속 붉은 점 둘(x 204~238, y 176~195)도 같은 방식으로 덮는다. 제목 글자는 이 위에 그린다
      $.cover2 = h('div', 'a', el);
      css($.cover2, { left: '184px', top: '163px', width: '76px', height: '46px', background: `radial-gradient(closest-side, ${DECK.rgba('bg0', 0.94)} 60%, ${DECK.rgba('bg0', 0)} 100%)` });
      $.leds = LEDS.map(([lx, ly], i) => {
        const d = h('div', 'a', el);
        css(d, { left: lx - 4 + 'px', top: ly - 4 + 'px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--bad)', boxShadow: `0 0 14px 4px ${DECK.rgba('bad', 0.55)}` });
        return d;
      });
      $.head = tx(el, '<span style="color:var(--mut)">2025년 7월 ·</span> Replit AI 코딩 도구', { x: 160, y: 188, size: 56, w: 800, ls: '-0.02em' });
      // 칸 폭: 가장 긴 줄을 재서 정하고 남는 폭을 간격으로 나눈다(x 160~1760)
      const FS = 42, PAD = 30;
      const probe = h('div', 'a nw', el); css(probe, { font: `600 ${FS}px/1.3 var(--sans)`, letterSpacing: '-0.015em', visibility: 'hidden' });
      const need = STEPS.map(st => Math.max(...st.lines.map(l => { probe.textContent = l; return probe.offsetWidth; })) + PAD * 2);
      probe.remove();
      const ws = need.map(v => Math.max(330, Math.ceil(v)));
      const gap = Math.max(16, (1600 - ws.reduce((p, v) => p + v, 0)) / 3);
      let xx = 160;
      $.tl = h('div', 'a', el);
      css($.tl, { left: '160px', top: '487px', width: '1600px', height: '3px', background: DECK.rgba('ink', 0.18) });
      $.tlOn = h('div', 'a', el);
      css($.tlOn, { left: '160px', top: '487px', width: '1600px', height: '3px', background: DECK.rgba('ink', 0.85), transformOrigin: '0 50%', transform: 'scaleX(0)' });
      $.boxes = STEPS.map((st, i) => {
        const w = ws[i], cx = xx + w / 2, col = `var(--${st.col})`;
        const node = h('div', 'a', el);
        css(node, { left: cx - 13 + 'px', top: '475px', width: '26px', height: '26px', borderRadius: '50%', background: 'var(--bg0)', border: `5px solid ${col}`, opacity: 0 });
        const stem = h('div', 'a', el);
        css(stem, { left: cx - 1.5 + 'px', top: '501px', width: '3px', height: '49px', background: col, transformOrigin: '50% 0', transform: 'scaleY(0)' });
        const b = h('div', 'a', el);
        css(b, { left: xx + 'px', top: '550px', width: w + 'px', height: '290px', borderRadius: '18px', background: DECK.rgba('bg0', 0.78),
          border: st.col === 'ink' ? `2px solid ${DECK.rgba('ink', 0.55)}` : `3px solid ${col}`, visibility: 'hidden' });
        const n = h('div', 'a nw', b, String(i + 1));
        css(n, { left: PAD - 2 + 'px', top: '18px', font: '400 64px/1 var(--num)', color: col });
        const ic = h('div', 'a', b); css(ic, { right: PAD - 4 + 'px', top: '26px' });
        icon(ic, st.ic, 50, col, 1.9);
        const tt = h('div', 'a nw', b, st.lines.join('<br>'));
        css(tt, { left: PAD + 'px', top: '128px', font: `600 ${FS}px/1.3 var(--sans)`, letterSpacing: '-0.015em', color: 'var(--ink)' });
        const o = { node, stem, b, cx, x0: xx, w, col: st.col };
        xx += w + gap;
        return o;
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      // 이웃 미리보기(아직 들어오지 않은 다음 슬라이드: t<0, x.arrive 0)에서는 사진·표시등·바탕선·제목 줄을 모두 감춘다.
      // 평면 밀기로 들어오는 동안(x.arrive > 0)에는 사진과 제목 줄이 슬라이드와 함께 밀려 들어온다(밀기 35%·50% 화면이 빈 판이 되지 않게)
      const on = early(t, x) ? 1 : 0;
      $.ph.el.style.opacity = (0.62 * on).toFixed(3);
      show($.shade, on);
      show($.cover, on);
      show($.cover2, on);
      show($.tl, on);
      $.leds.forEach((d, k) => {
        const i = k + 2; // 앞의 두 점을 뺀 뒤에도 남은 네 점의 깜박임 박자를 그대로 유지한다
        const per = 2.2 + rand(i, 7) * 2.6, ph = rand(i, 8) * per, f = ((a + ph) % per) / per;
        const lit = f < 0.55 ? 1 : 0.18 + 0.1 * Math.sin(a * 3 + i);
        d.style.opacity = ((0.35 + 0.65 * lit * (0.75 + 0.25 * Math.sin(a * 5.1 + i))) * on).toFixed(3);
      });
      show($.head, on);
      const starts = [0.15, 0.75, 1.5, 2.1];
      const last = starts.reduce((k, st, i) => (t >= st ? i : k), 0);
      // 타임라인 진행선: 마지막으로 열린 칸의 마디까지(아직 열리지 않은 칸은 계산에 넣지 않는다)
      const reach = i => ($.boxes[i].cx - 160) / 1600;
      let sx = 0;
      starts.forEach((st, i) => { if (t >= st) sx = Math.max(sx, lerp(i ? reach(i - 1) : 0, reach(i), prog(t, st, 0.3, ease.outCubic))); });
      $.tlOn.style.transform = `scaleX(${sx.toFixed(4)})`;
      $.boxes.forEach((o, i) => {
        const st = starts[i] + 0.12;
        const np = prog(t, st, 0.18, ease.outCubic);
        show(o.node, np);
        o.stem.style.transform = `scaleY(${prog(t, st + 0.06, 0.16, ease.linear).toFixed(4)})`;
        const bp = prog(t, st + 0.16, 0.26, ease.outCubic);
        o.b.style.visibility = bp > 0 ? 'inherit' : 'hidden';
        o.b.style.clipPath = bp >= 1 ? 'none' : `inset(0 0 ${((1 - bp) * 100).toFixed(2)}% 0 round 18px)`;
        // 지금 칸: 테두리 바깥 옅은 빛의 밝기가 천천히 오르내린다(작은 면적, 섬광 아님)
        const cur = i === last && t >= st ? 1 : 0, cc = o.col === 'ink' ? c.ink : o.col === 'ok' ? c.ok : c.bad;
        const br = cur * (0.18 + 0.14 * Math.sin(a * 2.2));
        o.b.style.boxShadow = br > 0.01 ? `0 0 0 ${(6 + 4 * Math.sin(a * 2.2)).toFixed(1)}px ${rg(cc, br)}` : 'none';
        o.b.style.opacity = (i < last ? 0.82 : 1).toFixed(2);
      });
    },
  });

  // ═════════ 16. 삭제된 기록의 규모(push · dolly-in) ═════════
  // 숫자 뒤에 기록 한 건 = 작은 막대 하나(1,200개 · 1,190개). 숫자가 세어 올라가는 만큼 위에서부터 지워진다
  // 한 클릭 빌드(2026-11-16): 세기(0.35~1.55) → 숫자가 위로 물러남(1.3~) → 결론 한 줄(1.5~)이 클릭 없이 이어진다
  // 2026-11-16 발표자 지적: 숫자가 무엇인지 화면에 없었다. 위에 「에이전트가 지운 운영 데이터베이스」 제목 줄을 두고(밀기 중부터 보임),
  // 단위를 「명 넘게의 정보」「곳 넘게의 정보」로 풀었다(Fortune: data for more than 1,200 executives and over 1,190 companies)
  DECK.slide({
    id: 'replit-scale', holds: [], dur: 2.9,
    chrome: { source: '출처: Fortune 2025-07-23' },
    setup(el) {
      const $ = this.$; $.c = pal();
      const cv = h('canvas', '', el); cv.width = 1440; cv.height = 520;
      css(cv, { position: 'absolute', left: '240px', top: '262px', width: '1440px', height: '520px' });
      $.g = cv.getContext('2d'); $.cv = cv;
      $.head = mline(el, '<span style="color:var(--mut)">Replit 사고 ·</span> 에이전트가 지운 운영 데이터베이스', { cx: 960, y: 200, size: 46, w: 700, ls: '-0.02em' });
      // 왼쪽 1,200 = 40×30, 오른쪽 1,190 = 40×29 + 30
      const grid = (ox, n) => Array.from({ length: n }, (_, i) => [ox + (i % 40) * 15, 12 + Math.floor(i / 40) * 16]);
      $.G = [{ pts: grid(20, 1200), n: 1200 }, { pts: grid(820, 1190), n: 1190 }];
      $.grp = [0, 1].map(i => { const d = h('div', 'full', el); d.style.transformOrigin = `${i ? 1360 : 560}px 470px`; return d; });
      const mk = (g, cx, lab, to, unit) => ({
        lab: tx(g, lab, { cx, y: 312, size: 42, w: 700, color: 'var(--ink)' }),
        num: bigNum(g, '0', { cx, y: 372, size: 220, color: 'var(--bad)', box: 700 }),
        unit: tx(g, unit, { cx, y: 610, size: 42, w: 600, color: 'var(--ink)' }),
        to,
      });
      $.N = [mk($.grp[0], 560, '임원', 1200, '명 넘게의 정보'), mk($.grp[1], 1360, '회사', 1190, '곳 넘게의 정보')];
      $.end = mline(el, '말로 한 지시만으로는 막지 못했습니다', { cx: 960, y: 792, size: 60, w: 700, font: 'var(--serif)', ls: '-0.025em' });
      $.mk = U.mark($.end.inner, { word: '말로 한 지시' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c, g = $.g;
      const P = prog(t, 0.35, 1.2, ease.outQuart);
      const back = prog(t, 1.3, 0.6, ease.inOutCubic);
      mPre($.head, t, x, 0, 0.55);
      // 기록 막대
      const pre = Math.max(smooth(0.1, 0.6, x.arrive), prog(t, 0, 0.4));
      g.clearRect(0, 0, 1440, 520);
      g.globalAlpha = pre * (1 - 0.45 * back);
      const WIN = 90, flashOut = 1 - prog(t, 1.35, 0.5, ease.inOutCubic);
      $.G.forEach((G, gi) => {
        const n = P * G.n, ox = gi ? 808 : 8;
        // 표 테두리: 기록이 모두 지워진 뒤에도 빈 표로 남는다
        g.strokeStyle = rg(c.ink, 0.2); g.lineWidth = 2;
        g.strokeRect(ox + 0.5, 2.5, 620, 488);
        g.fillStyle = rg(c.ink, 0.3);
        for (let i = Math.ceil(n); i < G.n; i++) { const p = G.pts[i]; g.fillRect(p[0], p[1], 11, 6); }
        if (flashOut > 0) for (let i = Math.max(0, Math.floor(n - WIN)); i < Math.min(G.n, n); i++) {
          const k = clamp((n - i) / WIN), p = G.pts[i];
          g.fillStyle = rg(c.bad, 0.9 * (1 - k) * flashOut); g.fillRect(p[0], p[1], 11, 6);
        }
      });
      // 지운 뒤: 빈 표를 훑는 선
      const sc = prog(t, 1.7, 0.3, ease.linear);
      if (sc > 0) {
        const yy = 46 + ((a * 70) % 442), y0 = yy - 40;
        const gr = g.createLinearGradient(0, y0, 0, yy + 2);
        gr.addColorStop(0, rg(c.acc2, 0)); gr.addColorStop(1, rg(c.acc2, 0.24 * sc));
        g.fillStyle = gr;
        g.fillRect(10, y0, 616, 42); g.fillRect(810, y0, 616, 42);
      }
      g.globalAlpha = 1;
      // 숫자: 세어 올라감 → 결론 줄이 나올 자리를 비우며 줄어들고 mut
      $.N.forEach((o, i) => {
        up(o.lab, t, 0.15 + i * 0.06, 0.5, 24);
        const ap = prog(t, 0.3 + i * 0.06, 0.55, ease.pop);
        show(o.num, prog(t, 0.3 + i * 0.06, 0.2, ease.linear));
        o.num.style.transform = `translateY(${((1 - ap) * 40).toFixed(1)}px) scale(${lerp(0.86, 1, ap).toFixed(4)})`;
        o.num.$t.textContent = DECK.count(P, o.to);
        o.num.style.color = rg(mix(c.bad, c.mut, back), 1);
        up(o.unit, t, 0.55 + i * 0.06, 0.5, 24);
        $.grp[i].style.transform = `translateY(${(-16 * back).toFixed(1)}px) scale(${lerp(1, 0.84, back).toFixed(4)})`;   // 제목 줄이 생겨 위로 덜 물러난다(이름이 표 윗선에 닿지 않게)
      });
      mIn($.end, t, 1.5, 0.7);
      $.mk.render(t, 2.05, 0.5);
    },
  });

  // ═════════ 17. 쓰는 곳은 많고 재는 곳은 적다(slide-r · drift) ═════════
  // 점 36개(9열×4행). 35개가 왼쪽 열부터 채워지고(0.35~1.3), 한 박자(약 0.6초) 쉰 뒤 왼쪽 10개만 노랑으로 남고 나머지는 테두리(1.9~).
  // 한 클릭 빌드(2026-11-16): 클릭 없이 이어진다. 색이 빠진 25개는 내용이므로 끝 화면에서도 테두리로 둔다.
  // 위 문장(35개국)은 끝 화면에서도 읽히게 투명도는 그대로 두고 글자색만 mut로 바꾼다
  DECK.slide({
    id: 'oecd', holds: [], dur: 3.2,
    chrome: { source: '출처: OECD 보고서, 2026년 7월' },
    setup(el) {
      const $ = this.$; $.c = pal();
      // 큰 숫자: 「35」가 위로 빠지고 「10」이 올라온다(자리 고정 상자)
      $.nb = h('div', 'a nw', el);
      css($.nb, { left: '196px', top: '226px', height: '206px', font: '400 200px/1 var(--num)', color: 'var(--ink)', opacity: 0 });
      $.slot = h('span', '', $.nb);
      css($.slot, { display: 'inline-block', position: 'relative', overflow: 'hidden', verticalAlign: 'top', height: '206px', lineHeight: '206px', paddingRight: '4px' });
      $.n35 = h('span', '', $.slot, '35'); css($.n35, { display: 'block', color: 'var(--accent2)' });
      $.n10 = h('span', '', $.slot, '10'); css($.n10, { display: 'block', position: 'absolute', left: 0, top: 0, color: 'var(--accent)' });
      $.of = h('span', '', $.nb, '/ 36'); css($.of, { display: 'inline-block', lineHeight: '206px', verticalAlign: 'top', color: 'var(--mut)', marginLeft: '0.2em', wordSpacing: '0.05em' });
      $.s1 = [mline(el, '36개국 중 35개국이', { x: 200, y: 486, size: 46 }), mline(el, '정부 업무에 AI를 씁니다', { x: 200, y: 548, size: 46 })];
      $.s2 = [mline(el, '도입 효과를 측정한', { x: 200, y: 668, size: 46 }), mline(el, '나라는 10개국', { x: 200, y: 730, size: 46 })];
      $.mk = U.mark($.s2[0].inner, { word: '측정한' });
      $.sv = svgFull(el);
      // 열 우선 순서(왼쪽 열 위→아래, 다음 열)
      $.dots = [];
      for (let ci = 0; ci < 9; ci++) for (let ri = 0; ri < 4; ri++) {
        const k = ci * 4 + ri, cx = 940 + ci * 94, cy = 396 + ri * 94;
        const ring = s('circle', { cx, cy, r: 31, fill: 'none', stroke: DECK.rgba('ink', 0.18), 'stroke-width': 2, 'stroke-dasharray': k === 35 ? '5 7' : 'none' }, $.sv);
        const fill = s('circle', { cx, cy, r: 31, fill: DECK.rgba('accent2', 1) }, $.sv);
        $.dots.push({ k, ci, ri, cx, cy, ring, fill });
      }
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      const pre = Math.max(smooth(0.1, 0.6, x.arrive), prog(t, 0, 0.4));
      const B2 = 1.9, b2 = prog(t, B2, 0.5);
      // 숫자
      const np = prog(t, 0.1, 0.55, ease.pop);
      show($.nb, prog(t, 0.1, 0.2, ease.linear));
      $.nb.style.transform = `translateY(${((1 - np) * 40).toFixed(1)}px)`;
      const sw = prog(t, B2, 0.5, ease.inOutCubic);
      $.n35.style.transform = `translateY(${(-sw * 100).toFixed(2)}%)`;
      $.n10.style.transform = `translateY(${((1 - sw) * 100).toFixed(2)}%)`;
      $.n35.style.visibility = sw >= 1 ? 'hidden' : 'inherit';
      $.n10.style.visibility = sw <= 0 ? 'hidden' : 'inherit';
      $.s1.forEach((m, i) => { mIn(m, t, 0.3 + i * 0.08, 0.6); m.inner.style.color = b2 > 0.5 ? 'var(--mut)' : 'var(--ink)'; });
      $.s2.forEach((m, i) => mIn(m, t, B2 + 0.1 + i * 0.08, 0.55));
      $.mk.render(t, B2 + 0.55, 0.45);
      // 점
      $.dots.forEach(d => {
        show(d.ring, pre);
        const fp = d.k < 35 ? prog(t, 0.35 + d.k * 0.016, 0.4, ease.pop) : 0;
        const keep = d.k < 10;
        const fadeOut = keep ? 0 : prog(t, B2 + (d.k - 10) * 0.012, 0.35, ease.inOutCubic);
        const toAcc = keep ? prog(t, B2 + 0.05 + d.k * 0.03, 0.4, ease.inOutCubic) : 0;
        const wave = Math.sin(a * 1.7 - d.ci * 0.55);
        const breathe = 1 + (keep && b2 > 0 ? 0.07 * b2 : 0.035) * wave;
        d.fill.setAttribute('r', (31 * fp * (1 - fadeOut) * breathe).toFixed(2));
        d.fill.setAttribute('fill', rg(mix(c.acc2, c.acc, toAcc), 1));
        d.ring.setAttribute('stroke', d.k < 35 && fadeOut > 0 ? rg(c.acc2, 0.18 + 0.4 * fadeOut) : rg(c.ink, d.k === 35 ? 0.35 : 0.18));
      });
    },
  });

  // ═════════ 18. 프롬프트 → 컨텍스트 → 하네스(push · track) ═════════
  // 가로 세 칸. 칸이 오른쪽으로 갈수록 크고, 안에 든 아이콘(맡는 범위)이 늘어난다. 카메라: 1칸 → 1·2칸 → 전체
  // 한 클릭 빌드(2026-11-16): 빌드가 1개라 camTrack은 전체 화면 하나만 둔다. 묶음을 따라가는 카메라는 cameraHook이 t로 옮긴다
  // (1칸 1.45배 → 0.75~1.35 1·2칸 1.2배 → 1.55~2.25 전체 1.0배). 끝 화면은 camTrack 그대로(도식 전체)
  const STAGES = [
    { x: 150, y: 390, w: 450, h: 400, name: '프롬프트', desc: ['무엇을 어떻게 할지', '지시한다'], chips: ['chat'] },
    { x: 636, y: 372, w: 510, h: 436, name: '컨텍스트', desc: ['판단에 필요한 자료를', '고른다'], chips: ['chat', 'doc', 'book'] },
    { x: 1182, y: 340, w: 590, h: 500, name: '하네스', desc: ['도구 실행, 상태 기록,', '검증을 연결한다'], chips: ['chat', 'doc', 'tool', 'list', 'check'] },
  ];
  DECK.slide({
    id: 'three-stages', holds: [], dur: 3.2,
    camTrack: [[960, 590, 1.0]],
    cameraHook(t) {
      // 이전 camTrack 세 영역을 t에 따라 잇는다. 배율은 로그 공간에서 보간한다(엔진 track과 같은 방식). P = 2000(엔진 원근 거리)
      const m1 = ease.inOutCubic(clamp((t - 0.75) / 0.6)), m2 = ease.inOutCubic(clamp((t - 1.55) / 0.7));
      const cx = lerp(lerp(375, 850, m1), 960, m2), lz = lerp(lerp(Math.log(1.45), Math.log(1.2), m1), 0, m2);
      return { dx: cx - 960, dz: 2000 / Math.exp(lz) - 2000 };
    },
    setup(el) {
      const $ = this.$; $.c = pal();
      $.cells = STAGES.map((S, i) => {
        const last = i === 2;
        const ghost = h('div', 'a', el);
        css(ghost, { left: S.x + 'px', top: S.y + 'px', width: S.w + 'px', height: S.h + 'px', borderRadius: '24px', border: `2px dashed ${DECK.rgba('ink', 0.16)}` });
        const box = h('div', 'a', el);
        css(box, { left: S.x + 'px', top: S.y + 'px', width: S.w + 'px', height: S.h + 'px', borderRadius: '24px', background: DECK.rgba('bg1', 0.75),
          border: last ? '3px solid var(--accent)' : `2px solid ${DECK.rgba('ink', 0.3)}`, opacity: 0 });
        const name = tx(box, S.name, { x: 36, y: 30, size: 60, w: 'var(--displayW)', font: 'var(--display)', ls: '-0.025em', lh: 1.15 });
        const sub = tx(box, '엔지니어링', { x: 38, y: 104, size: 32, w: 600, color: 'var(--mut)' });
        const desc = tx(box, S.desc.join('<br>'), { x: 36, y: 166, size: 38, w: 500, lh: 1.32, color: 'var(--ink)' });
        const chips = S.chips.map((ic, j) => {
          const cp = h('div', 'a', box);
          css(cp, { left: 36 + j * 82 + 'px', top: S.h - 104 + 'px', width: '66px', height: '66px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: j >= (i === 0 ? 0 : STAGES[i - 1].chips.length) ? (last ? DECK.rgba('accent', 0.16) : DECK.rgba('accent2', 0.16)) : DECK.rgba('ink', 0.07),
            border: `1.5px solid ${DECK.rgba('ink', 0.14)}`, opacity: 0 });
          icon(cp, ic, 34, j >= (i === 0 ? 0 : STAGES[i - 1].chips.length) ? (last ? 'var(--accent)' : 'var(--accent2)') : 'var(--ink)', 1.8);
          return cp;
        });
        [name, sub, desc].forEach(e => { e.style.opacity = 1; });
        return { S, ghost, box, txt: [name, sub, desc], chips };
      });
      // 셋째 칸: 도구 실행 → 상태 기록 → 검증을 잇는 선과 선을 따라 움직이는 점
      const S3 = STAGES[2], cy = S3.y + S3.h - 71, x0 = S3.x + 36 + 2 * 82 + 33, x1 = S3.x + 36 + 4 * 82 + 33;
      $.sv = svgFull(el);
      $.link = s('path', { d: `M${x0} ${cy + 46} L${x0} ${cy + 58} L${x1} ${cy + 58} L${x1} ${cy + 46}`, stroke: DECK.rgba('accent', 0.7), 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }, $.sv);
      $.smp = U.sampler($.link, 80);
      $.pk = s('circle', { r: 8, fill: DECK.rgba('accent', 1) }, $.sv);
      // 칸 사이 꺾쇠
      $.chev = [618, 1164].map(xx => s('path', { d: `M${xx - 7} 576 L${xx + 7} 590 L${xx - 7} 604`, stroke: DECK.rgba('ink', 0.55), 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $.sv));
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = Math.max(smooth(0.05, 0.5, x.arrive), prog(t, 0, 0.3));
      const starts = [0.1, 1.0, 1.75];
      $.cells.forEach((o, i) => {
        const st = starts[i], p = prog(t, st, 0.6, ease.pop);
        show(o.ghost, pre * (1 - prog(t, st, 0.3)) * (i === 0 ? 0.9 : 0.75));
        show(o.box, prog(t, st, 0.25, ease.linear));
        o.box.style.transform = `translateY(${((1 - p) * 40).toFixed(1)}px) scale(${lerp(0.92, 1, p).toFixed(4)})`;
        // 끝 화면에서 세 칸이 모두 읽히도록 앞 칸을 흐리게 하지 않는다
        o.txt.forEach((e, j) => { e.style.opacity = prog(t, st + 0.12 + j * 0.07, 0.3, ease.linear).toFixed(3); e.style.transform = `translateY(${((1 - prog(t, st + 0.12 + j * 0.07, 0.5)) * 22).toFixed(1)}px)`; });
        o.chips.forEach((cp, j) => {
          const q = prog(t, st + 0.35 + j * 0.06, 0.45, ease.pop);
          cp.style.opacity = prog(t, st + 0.35 + j * 0.06, 0.2, ease.linear).toFixed(3);
          const cur = (i === 0 && t < starts[1]) || (i === 1 && t >= starts[1] && t < starts[2]) || i === 2;
          const isNew = j >= (i === 0 ? 0 : STAGES[i - 1].chips.length);
          const pulse = cur && isNew ? 0.05 * Math.sin(a * 2.4 - j * 0.6) : 0;
          cp.style.transform = `scale(${(lerp(0.6, 1, q) + pulse).toFixed(4)})`;
        });
      });
      $.chev.forEach((c, i) => show(c, prog(t, starts[i + 1] - 0.05, 0.3)));
      // 하네스 칸: 테두리 바깥 빛의 밝기가 천천히 오르내린다(멈춘 화면 방지)
      const gl = prog(t, 2.0, 0.6) * (0.5 + 0.5 * Math.sin(a * 2.1));
      $.cells[2].box.style.boxShadow = gl > 0.01 ? `0 0 ${(14 + 34 * gl).toFixed(1)}px ${(2 + 6 * gl).toFixed(1)}px ${DECK.rgba('accent', (0.1 + 0.22 * gl).toFixed(3))}` : 'none';
      const lp = prog(t, 2.35, 0.5, ease.inOutCubic);
      U.draw($.link, lp);
      const f = (a * 0.5) % 1, q = $.smp.at(f);
      $.pk.setAttribute('cx', q[0].toFixed(1)); $.pk.setAttribute('cy', q[1].toFixed(1));
      show($.pk, lp >= 1 ? Math.min(1, Math.sin(f * Math.PI) * 2.5) : 0);
      // 점이 지나가는 칸(도구 실행 → 상태 기록 → 검증)이 차례로 밝아진다
      [2, 3, 4].forEach(j => {
        const cp = $.cells[2].chips[j], cx = STAGES[2].x + 36 + j * 82 + 33;
        const on = lp >= 1 ? Math.exp(-(((q[0] - cx) / 46) ** 2)) * Math.min(1, Math.sin(f * Math.PI) * 2.5) : 0;
        cp.style.background = DECK.rgba('accent', (0.16 + 0.42 * on).toFixed(3));
      });
    },
  });

  // ═════════ 19. 실험: 같은 모델, 과제 15개(drop · none) ═════════
  // A와 B 두 상자. 같은 문서 한 장. B에만 .claude/ 폴더가 더해진다(다음 슬라이드가 이 폴더 안으로 zoom-through)
  // 한 클릭 빌드(2026-11-16): 조건 한 줄과 A(0.1~) → B(0.85~) → 폴더(1.15~)가 클릭 없이 이어진다
  const FOLDER = { x: 1520, y: 652 };
  DECK.slide({
    id: 'exp-setup', holds: [], dur: 2.4,
    zoomTarget: FOLDER,
    chrome: { example: '자체 시험' },      // 19~21번 공통 알약(엔진 예시 표시). 같은 글이라 19→20→21 밀기 동안 화면에 고정된다
    setup(el) {
      const $ = this.$; $.c = pal();
      $.head = mline(el, '같은 모델 · 소프트웨어 과제 <span style="color:var(--accent)">15</span>개', { x: 160, y: 178, size: 56, w: 800, ls: '-0.02em' });
      const panel = (x0, letter, label) => {
        const box = h('div', 'a', el);
        css(box, { left: x0 + 'px', top: '300px', width: '760px', height: '600px', borderRadius: '26px', background: DECK.rgba('bg1', 0.7), border: `2px solid ${DECK.rgba('ink', 0.18)}`, opacity: 0 });
        const L = h('div', 'a nw', box, letter); css(L, { left: '40px', top: '30px', font: '400 76px/1 var(--num)', color: 'var(--mut)' });
        const T = h('div', 'a nw', box, label); css(T, { left: '108px', top: '44px', font: '600 40px/1.3 var(--sans)', color: 'var(--ink)', letterSpacing: '-0.015em' });
        return { box, T };
      };
      const doc = (parent, cx, cy) => {
        const d = h('div', 'a', parent);
        css(d, { left: cx - 110 + 'px', top: cy - 140 + 'px', width: '220px', height: '280px', borderRadius: '14px', background: DECK.rgba('ink', 0.09), border: `2px solid ${DECK.rgba('ink', 0.24)}` });
        const ic = h('div', 'a', d); css(ic, { left: '22px', top: '20px' }); icon(ic, 'doc', 44, 'var(--ink)', 1.7);
        [0.82, 0.64, 0.74, 0.5, 0.68].forEach((wv, k) => { const ln = h('div', 'a', d); css(ln, { left: '24px', top: 92 + k * 32 + 'px', width: (172 * wv).toFixed(0) + 'px', height: '10px', borderRadius: '5px', background: DECK.rgba('ink', 0.22) }); });
        return d;
      };
      $.A = panel(160, 'A', '프롬프트만');
      $.B = panel(1000, 'B', '프롬프트 + <span style="font-family:var(--mono);font-weight:700">.claude/</span> 폴더(하네스)');
      if ($.B.T.offsetWidth > 610) css($.B.T, { fontSize: '36px', top: '48px' });
      $.docA = doc($.A.box, 230, 352);
      $.docB = doc($.B.box, 230, 352);
      // A의 빈 자리(점선 무늬가 천천히 움직인다)
      $.slotSv = s('svg', { width: 320, height: 300, viewBox: '0 0 320 300' }, $.A.box);
      css($.slotSv, { position: 'absolute', left: '360px', top: '202px', overflow: 'visible' });
      $.slot = s('rect', { x: 2, y: 2, width: 316, height: 296, rx: 20, fill: 'none', stroke: DECK.rgba('ink', 0.28), 'stroke-width': 2.5, 'stroke-dasharray': '10 10' }, $.slotSv);
      // B의 .claude/ 폴더(가운데 = FOLDER)
      $.fold = h('div', 'a', el);
      css($.fold, { left: FOLDER.x - 160 + 'px', top: FOLDER.y - 150 + 'px', width: '320px', height: '300px', borderRadius: '20px', background: DECK.rgba('accent', 0.08), border: '3px solid var(--accent)', opacity: 0 });
      const fi = h('div', 'a', $.fold); css(fi, { left: '26px', top: '28px' }); icon(fi, 'folder', 46, 'var(--accent)', 1.8);
      $.fName = tx($.fold, '.claude/', { x: 84, y: 30, size: 38, w: 700, font: 'var(--mono)', color: 'var(--ink)', ls: '0' });
      $.fRows = ['agents/', 'skills/'].map((nm, k) => {
        const r = h('div', 'a', $.fold); css(r, { left: '40px', top: 114 + k * 64 + 'px', height: '50px', opacity: 0 });
        const br = h('div', 'a', r); css(br, { left: 0, top: '-18px', width: '22px', height: '42px', borderLeft: `2.5px solid ${DECK.rgba('ink', 0.4)}`, borderBottom: `2.5px solid ${DECK.rgba('ink', 0.4)}` });
        const t2 = h('div', 'a nw', r, nm); css(t2, { left: '36px', top: '2px', font: '500 34px/1.3 var(--mono)', color: 'var(--ink)' });
        return r;
      });
      $.fName.style.opacity = 1;
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = Math.max(smooth(0.05, 0.55, x.arrive), prog(t, 0, 0.3));
      mPre($.head, t, x, 0.1, 0.6);
      // A
      const pa = prog(t, 0.3, 0.6, ease.pop);
      show($.A.box, Math.max(pre * 0.6, prog(t, 0.3, 0.25, ease.linear)));
      $.A.box.style.transform = `translateY(${((1 - pa) * 40).toFixed(1)}px)`;
      [$.A.box.children[0], $.A.T, $.docA, $.slotSv].forEach((e, i) => show(e, prog(t, 0.4 + i * 0.08, 0.35, ease.linear)));
      $.slot.setAttribute('stroke-dashoffset', (-a * 14).toFixed(1));
      // B: 오른쪽에서 밀려 들어옴, 폴더는 조금 늦게 튀어나옴
      const pb = prog(t, 0.85, 0.6, ease.pop);
      show($.B.box, prog(t, 0.85, 0.25, ease.linear));
      [$.B.box.children[0], $.B.T, $.docB].forEach((e, i) => show(e, prog(t, 0.9 + i * 0.08, 0.35, ease.linear)));
      $.B.box.style.transform = `translateX(${((1 - pb) * 90).toFixed(1)}px)`;
      const pf = prog(t, 1.15, 0.6, ease.pop);
      show($.fold, prog(t, 1.15, 0.2, ease.linear));
      const glow = prog(t, 1.7, 0.4) * (0.5 + 0.5 * Math.sin(a * 2.0));
      $.fold.style.transform = `translateX(${((1 - pb) * 90).toFixed(1)}px) scale(${lerp(0.7, 1, pf).toFixed(4)})`;
      $.fold.style.boxShadow = glow > 0.01 ? `0 0 ${(18 + 18 * glow).toFixed(0)}px ${DECK.rgba('accent', 0.25 * glow)}` : 'none';
      $.fRows.forEach((r, k) => up(r, t, 1.45 + k * 0.1, 0.45, 16));
    },
  });

  // ═════════ 20. 자체 시험 결과: 평균 점수 막대 두 개(dolly-in) ═════════
  // 발표자 지시(2026-11-16): 자체 시험 수치는 큰 숫자·세기·증가율 없이 본문 크기 막대 두 개와 한 줄로 담담하게 보인다.
  // 한 클릭 빌드(2026-11-16): A 막대(0.15~) → B 막대(0.75~) → 한 줄(1.4~)이 클릭 없이 이어진다. 끝 화면에서 두 줄을 흐리게 하지 않는다
  DECK.slide({
    id: 'exp-result', holds: [], dur: 2.4,
    chrome: { example: '자체 시험' },
    notes: '제가 직접 해 본 시험의 결과입니다. 백 점 만점 평균으로, 프롬프트만 준 A는 49.5점이었습니다. 같은 프롬프트에 하네스를 더한 B는 79.3점이었습니다. 열다섯 과제 모두에서 B가 높았고, 과제별 점수의 편차도 B 쪽이 작았습니다.',
    setup(el) {
      const $ = this.$;
      const X0 = 640, FULL = 1000, BH = 64;      // 막대 칸: 100점 = 1000px
      $.FULL = FULL;
      $.cap = tx(el, '100점 만점 평균', { x: 240, y: 314, size: 40, w: 500, color: 'var(--mut)' });
      const row = (y, letter, label, v, barCol, valCol) => {
        const g = h('div', 'full', el);          // 한 줄 묶음
        const L = tx(g, letter, { x: 240, y: y + 1, size: 52, w: 400, font: 'var(--num)', color: 'var(--mut)', ls: '0', lh: 1.15 });
        const T = tx(g, label, { x: 298, y: y + 7, size: 40, w: 600, color: 'var(--ink)' });
        const track = h('div', 'a', g);
        css(track, { left: X0 + 'px', top: y + 'px', width: FULL + 'px', height: BH + 'px', borderRadius: '12px', background: DECK.rgba('ink', 0.05), overflow: 'hidden', opacity: 0 });
        const bar = h('div', 'a', track);
        css(bar, { left: 0, top: 0, width: (FULL * v / 100) + 'px', height: BH + 'px', borderRadius: '12px 6px 6px 12px', background: barCol, transformOrigin: '0 50%', transform: 'scaleX(0)' });
        const sheen = h('div', 'a', track);
        css(sheen, { left: 0, top: 0, width: '260px', height: BH + 'px', background: `linear-gradient(90deg, transparent, ${DECK.rgba('ink', 0.1)}, transparent)`, opacity: 0 });
        const val = tx(g, `${v.toFixed(1)}<span style="font-size:.74em;margin-left:.06em">점</span>`, { x: X0 + FULL * v / 100 + 26, y: y + 1, size: 52, w: 600, color: valCol, lh: 1.15 });
        val.classList.add('tnum');
        return { g, L, T, track, bar, sheen, val };
      };
      $.A = row(424, 'A', '프롬프트만', 49.5, DECK.rgba('mut', 0.55), 'var(--mut)');
      $.B = row(548, 'B', '하네스 포함', 79.3, DECK.rgba('ink', 0.6), 'var(--ink)');
      $.line = mline(el, '과제 15개 모두 B가 높았다', { x: 240, y: 732, size: 48, w: 600, ls: '-0.015em' });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      // 밀려 들어오는 동안(x.arrive > 0)부터 설명 줄·행 이름·막대 칸이 보인다(밀기 35%·50% 화면이 빈 판이 되지 않게)
      const pre = Math.max(smooth(0.05, 0.45, x.arrive), prog(t, 0, 0.3));
      upPre($.cap, t, x, 0.05, 0.5, 18);
      [$.A, $.B].forEach((r, i) => {
        upPre(r.L, t, x, 0.08 + i * 0.05, 0.5, 18);
        upPre(r.T, t, x, 0.1 + i * 0.05, 0.5, 18);
        show(r.track, pre);
      });
      // A 막대 → B 막대. 막대가 0.6초 동안 자라고 점수는 막대 끝에 붙는다(숫자를 세지 않는다)
      const grow = (r, st) => {
        r.bar.style.transform = `scaleX(${prog(t, st, 0.6, ease.outCubic).toFixed(4)})`;
        up(r.val, t, st + 0.35, 0.4, 14);
      };
      grow($.A, 0.15);
      grow($.B, 0.75);
      // 한 줄
      mIn($.line, t, 1.4, 0.6);
      // 멈춘 화면 방지: 막대 칸 위로 옅은 빛이 천천히 지나간다(두 줄이 어긋나게). 글자는 움직이지 않는다
      [$.A, $.B].forEach((r, i) => {
        const f = (a * 0.16 + i * 0.4) % 1;
        r.sheen.style.transform = `translateX(${(f * ($.FULL + 260) - 260).toFixed(1)}px)`;
        r.sheen.style.opacity = prog(t, 0.6 + i * 0.6, 0.6).toFixed(3);
      });
    },
  });

  // ═════════ 21. 난이도별 점수: 작은 표(slide-r · none) ═════════
  // 발표자 지시(2026-11-16): 난이도별 점수는 큰 숫자로 두지 않는다. 본문 크기 표로 보이고 「어려운 과제일수록 차이가 컸다」만 전한다.
  // A·B 두 줄(0.2~) → 결론 한 줄(0.95~)이 클릭 없이 이어진다(한 클릭 빌드 2026-11-16). 차이 줄(+ 부호와 칸마다 길어지는 막대)은 자체 시험의 상승 폭을 강조해서 지웠다(덱 비평 반영 회차)
  // 멈춘 화면 방지: 점수 칸 뒤로 옅은 세로 띠가 기본 → 전문가 쪽으로 천천히 지나간다. 글자는 움직이지 않는다
  const LEVELS = [['기본', 52.0, 75.8], ['고급', 51.8, 81.4], ['전문가', 44.6, 80.8]];
  DECK.slide({
    id: 'exp-level', holds: [], dur: 2.0,
    chrome: { example: '자체 시험' },
    notes: '난이도별로 나눠 보면 이렇습니다. 기본, 고급, 전문가 과제입니다. 어려운 과제일수록 두 조건의 차이가 컸습니다. 프롬프트만 준 쪽은 전문가 과제에서 점수가 낮아졌고, 하네스를 더한 쪽은 비슷하게 유지됐습니다.',
    setup(el) {
      const $ = this.$;
      // Y: 차이 줄을 지운 만큼 표를 60px 내려 표와 결론 한 줄이 화면 가운데 쪽에 놓이게 한다
      const L0 = 200, R0 = 1720, COLS = [920, 1240, 1560], Y = 60;
      // 점수 칸 뒤 옅은 세로 띠(글자보다 먼저 만들어 뒤에 깐다). 띠가 다니는 상자(x 700~1780)의 양쪽 140px는 마스크로 서서히 사라져 끝이 잘려 보이지 않는다
      $.SW = { x0: 700, w: 1080, bw: 300 };
      $.swBox = h('div', 'a', el);
      const fade = 'linear-gradient(90deg, transparent 0, #000 140px, #000 940px, transparent 1080px)';
      css($.swBox, { left: $.SW.x0 + 'px', top: 286 + Y + 'px', width: $.SW.w + 'px', height: '284px', overflow: 'hidden', opacity: 0,
        maskImage: fade, webkitMaskImage: fade });   // 난이도 이름 줄부터 아래 구분선 앞까지
      $.sw = h('div', 'a', $.swBox);
      css($.sw, { left: 0, top: 0, width: $.SW.bw + 'px', height: '284px', borderRadius: '18px',
        background: `linear-gradient(90deg, transparent, ${DECK.rgba('ink', 0.065)} 32%, ${DECK.rgba('ink', 0.065)} 68%, transparent)` });
      $.cap = tx(el, '난이도별 평균 점수 · 100점 만점', { x: L0, y: 206 + Y, size: 36, w: 500, color: 'var(--mut)' });
      $.heads = LEVELS.map(([nm], i) => tx(el, nm, { cx: COLS[i], y: 300 + Y, size: 42, w: 600, color: 'var(--ink)' }));
      const rule = (y, al) => { const d = h('div', 'a', el); css(d, { left: L0 + 'px', top: y + 'px', width: R0 - L0 + 'px', height: '2px', background: DECK.rgba('ink', al), opacity: 0 }); return d; };
      $.rules = [rule(374 + Y, 0.24), rule(566 + Y, 0.12)];
      const rowLab = (y, letter, label) => [
        tx(el, letter, { x: L0, y: y - 3, size: 48, w: 400, font: 'var(--num)', color: 'var(--mut)', ls: '0', lh: 1.15 }),
        tx(el, label, { x: L0 + 54, y: y + 2, size: 38, w: 600, color: 'var(--ink)' }),
      ];
      $.labs = [rowLab(400 + Y, 'A', '프롬프트만'), rowLab(484 + Y, 'B', '하네스 포함')];
      const cells = (y, k, col) => LEVELS.map((L, i) => { const d = tx(el, L[k].toFixed(1), { cx: COLS[i], y, size: 44, w: 600, color: col }); d.classList.add('tnum'); return d; });
      $.vA = cells(398 + Y, 1, 'var(--mut)');
      $.vB = cells(482 + Y, 2, 'var(--ink)');
      // 결론 한 줄
      $.line = mline(el, '어려운 과제일수록 차이가 컸다', { x: L0, y: 720, size: 56, w: 700, ls: '-0.02em' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, W = $.SW;
      // 표 머리(설명 줄·난이도 이름·행 이름·구분선)는 밀려 들어올 때부터 보인다(밀기 중 빈 판 방지)
      const pre = Math.max(smooth(0.05, 0.45, x.arrive), prog(t, 0, 0.3));
      upPre($.cap, t, x, 0.05, 0.5, 16);
      $.heads.forEach((e, i) => upPre(e, t, x, 0.08 + i * 0.05, 0.5, 16));
      $.labs.forEach((r, i) => r.forEach(e => upPre(e, t, x, 0.12 + i * 0.06, 0.5, 16)));
      $.rules.forEach(r => show(r, pre));
      // 칸마다 A·B 점수
      LEVELS.forEach((_, i) => { up($.vA[i], t, 0.2 + i * 0.08, 0.45, 16); up($.vB[i], t, 0.3 + i * 0.08, 0.45, 16); });
      // 결론 한 줄. 끝 화면에서 점수 칸을 흐리게 하지 않는다
      mIn($.line, t, 0.95, 0.6);
      // 멈춘 화면 방지: 점수가 다 나온 뒤 세로 띠가 칸 영역 왼쪽 밖에서 오른쪽 밖까지 일정한 속도로 지나간다(5초에 한 번)
      show($.swBox, prog(t, 0.8, 0.5));
      const f = (a * 0.2) % 1;
      $.sw.style.transform = `translateX(${(lerp(-W.bw, W.w, f)).toFixed(1)}px)`;
    },
  });

  // ═════════ 22. 이 실험의 한계(slide-r · none) ═════════
  DECK.slide({
    id: 'exp-limit', holds: [], dur: 2.2,
    // 스토리보드 노트의 「다른 회사가 낸 결과」를 고친다. 뒤의 두 사례 중 Can Bölük은 회사가 아니라 개인 개발자다(검수 c01 r1)
    notes: '한계를 먼저 말씀드립니다. 이 실험은 제가 설계했고, 하네스 구성과 채점 기준을 같은 팀이 만들었습니다. 채점자끼리 점수가 얼마나 일치하는지도 재지 않았습니다. 그래서 다른 곳에서 낸 결과를 두 개 더 보겠습니다.',
    setup(el) {
      const $ = this.$;
      $.rule = h('div', 'a', el);
      css($.rule, { left: '199px', top: '318px', width: '5px', height: '400px', borderRadius: '3px', background: DECK.rgba('ink', 0.14), overflow: 'hidden', transformOrigin: '50% 0' });
      $.rg = h('div', 'a', $.rule); css($.rg, { left: 0, top: 0, width: '5px', height: '160px', background: `linear-gradient(transparent, ${DECK.rgba('accent2', 0.85)}, transparent)` });
      const o = { x: 250, size: 60, w: 600, font: 'var(--serif)', ls: '-0.025em', lh: 1.3 };
      $.l1 = mline(el, '이 실험은 제가 했고,', Object.assign({}, o, { y: 322 }));
      $.l2 = mline(el, '하네스와 채점 기준을 같은 팀이 만들었습니다.', Object.assign({}, o, { y: 412 }));
      $.mk = U.mark($.l2.inner, { word: '같은 팀이' });
      // 결론 줄 뒤의 옅은 띠. 밝은 부분이 화살표 쪽으로 거듭 지나간다
      $.hl = h('div', 'a', el);
      css($.hl, { left: '226px', top: '598px', height: '108px', borderRadius: '16px', background: DECK.rgba('accent2', 0.05), overflow: 'hidden', opacity: 0 });
      $.hb = h('div', 'a', $.hl);
      css($.hb, { left: 0, top: 0, width: '300px', height: '108px', background: `linear-gradient(90deg, transparent, ${DECK.rgba('accent2', 0.13)}, transparent)` });
      $.l3 = mline(el, '그래서 다른 곳의 결과를 함께 봅니다.', Object.assign({}, o, { y: 610, color: 'var(--accent2)' }));
      $.sv = svgFull(el);
      const ex = 250 + $.l3.inner.offsetWidth + 40;
      $.hlW = ex + 300 - 226;
      $.hl.style.width = $.hlW + 'px';
      $.arr = s('path', { d: `M${ex} 650 L${ex + 90} 650 M${ex + 66} 628 L${ex + 92} 650 L${ex + 66} 672`, stroke: DECK.rgba('accent2', 1), 'stroke-width': 5.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $.sv);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.rule.style.transform = `scaleY(${Math.max(smooth(0.1, 0.6, x.arrive), prog(t, 0, 0.6, ease.inOutCubic)).toFixed(4)})`;
      $.rg.style.transform = `translateY(${(((a * 90) % 560) - 160).toFixed(1)}px)`;
      // 한계 문장은 밀려 들어올 때부터 보인다(밀기 중 빈 판 방지). 첫 묶음의 움직임은 세로선과 「같은 팀이」 밑줄.
      // 한 클릭 빌드(2026-11-16): 다음으로 넘어가는 문장(1.0~)과 화살표(1.4~)가 클릭 없이 이어진다. 끝 화면에서 한계 문장을 흐리게 하지 않는다
      mPre($.l1, t, x, 0.1, 0.7);
      mPre($.l2, t, x, 0.22, 0.7);
      $.mk.render(t, 0.95, 0.5);
      mIn($.l3, t, 1.0, 0.7);
      show($.hl, prog(t, 1.1, 0.6));
      $.hb.style.transform = `translateX(${(((a * 0.42) % 1) * ($.hlW + 300) - 300).toFixed(1)}px)`;
      const ap = prog(t, 1.4, 0.4);
      show($.arr, ap);
      // 화살표가 오른쪽(다음 결과 쪽)으로 거듭 밀려 나간다
      const f = (a * 0.55) % 1, go = ap >= 1 ? ease.inOutSine(f) : 0;
      $.arr.style.transform = `translateX(${(go * 170 + (1 - ap) * -20).toFixed(1)}px)`;
      $.arr.style.opacity = (ap * (go < 0.8 ? 1 : 1 - (go - 0.8) / 0.2)).toFixed(3);
    },
  });

  // ═════════ 23. 모델은 그대로, 순위가 바뀌었다(push · drift) ═════════
  // 오른쪽 순위 세로줄(1~35위). 30위 밖의 점 하나가 5위 안으로 올라가고, 그 사이 점들은 한 칸씩 내려간다
  // 한 클릭 빌드(2026-11-16): 점수 변화(0.35~) → 순위 변화(1.2~) → 바꾼 세 가지(2.0~)가 클릭 없이 이어진다
  const RY = r => 232 + (r - 1) * 14;
  DECK.slide({
    id: 'langchain', holds: [], dur: 3.2,
    chrome: { source: '출처: LangChain 블로그, 2026-02-17' },
    setup(el) {
      const $ = this.$; $.c = pal();
      $.k = tx(el, 'LangChain, 2026년 2월', { x: 200, y: 176, size: 36, w: 600, color: 'var(--mut)' });
      $.tb = tx(el, 'Terminal Bench 2.0', { x: 200, y: 226, size: 50, w: 800, color: 'var(--ink)', ls: '-0.015em' });
      $.s0 = bigNum(el, '52.8', { align: 'left', x: 196, y: 318, size: 176, color: 'var(--mut)' });
      $.s0.style.width = 'auto';
      $.sv = svgFull(el);
      const w0 = $.s0.offsetWidth;
      $.ax0 = 196 + w0 + 26;
      $.ar = s('path', { d: `M${$.ax0} 420 L${$.ax0 + 84} 420 M${$.ax0 + 64} 400 L${$.ax0 + 86} 420 L${$.ax0 + 64} 440`, stroke: DECK.rgba('ink', 0.75), 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $.sv);
      $.s1 = bigNum(el, '66.5', { align: 'left', x: $.ax0 + 112, y: 318, size: 176, color: 'var(--accent)' });
      $.s1.style.width = 'auto';
      $.unit = tx(el, '점', { x: $.ax0 + 112 + $.s1.offsetWidth + 10, y: 418, size: 44, w: 700, color: 'var(--ink)' });
      $.rk = mline(el, '30위권 밖 <span style="color:var(--mut)">→</span> 5위 이내', { x: 200, y: 548, size: 56, w: 800, ls: '-0.02em' });
      $.mk = U.mark($.rk.inner, { word: '5위 이내' });
      // 순위 세로줄
      $.col = h('div', 'full', el);
      const AX = 1450;
      $.band = h('div', 'a', $.col);
      css($.band, { left: AX - 60 + 'px', top: RY(1) - 12 + 'px', width: '260px', height: RY(5) - RY(1) + 24 + 'px', borderRadius: '12px', background: DECK.rgba('accent', 0.12), border: `1.5px solid ${DECK.rgba('accent', 0.4)}` });
      $.axis = h('div', 'a', $.col); css($.axis, { left: AX - 1 + 'px', top: RY(1) - 18 + 'px', width: '2px', height: RY(35) - RY(1) + 36 + 'px', background: DECK.rgba('ink', 0.18) });
      $.cut30 = h('div', 'a', $.col); css($.cut30, { left: AX - 60 + 'px', top: (RY(30) + RY(31)) / 2 + 'px', width: '260px', height: '0', borderTop: `2px dashed ${DECK.rgba('ink', 0.3)}` });
      [[1, '1위'], [5, '5위'], [10, '10위'], [20, '20위'], [30, '30위']].forEach(([r, lb]) => {
        tx($.col, lb, { rx: AX - 78, y: RY(r) - 17, size: 28, w: 500, font: 'var(--mono)', color: 'var(--mut)', ls: '0' }).style.opacity = 1;
        const tk = h('div', 'a', $.col); css(tk, { left: AX - 66 + 'px', top: RY(r) - 1 + 'px', width: '16px', height: '2px', background: DECK.rgba('ink', 0.4) });
      });
      $.others = Array.from({ length: 34 }, (_, i) => {
        const d = h('div', 'a', $.col); css(d, { left: AX - 6 + 'px', top: '0px', width: '12px', height: '12px', borderRadius: '50%', background: DECK.rgba('ink', 0.34) });
        return d;
      });
      $.trail = h('div', 'a', $.col); css($.trail, { left: AX - 4 + 'px', width: '8px', borderRadius: '4px', background: `linear-gradient(${DECK.rgba('accent', 0.0)}, ${DECK.rgba('accent', 0.55)})` });
      $.me = h('div', 'a', $.col); css($.me, { left: AX - 17 + 'px', width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent)' });
      $.wave = h('div', 'a', $.col); css($.wave, { left: AX - 17 + 'px', width: '34px', height: '34px', borderRadius: '50%', border: '3px solid var(--accent)' });
      $.AX = AX;
      // 바꾼 세 가지
      $.chg = tx(el, '바꾼 것', { x: 200, y: 690, size: 36, w: 600, color: 'var(--mut)' });
      $.cards = [['check', '완료 전 검증'], ['loop', '반복 감지'], ['clock', '시간 예산 경고']].map(([ic, nm], i) => {
        const cd = h('div', 'a', el);
        css(cd, { left: 200 + i * 520 + 'px', top: '748px', width: '480px', height: '118px', borderRadius: '20px', background: DECK.rgba('bg1', 0.9), border: `2px solid ${DECK.rgba('ink', 0.2)}`, opacity: 0 });
        const ib = h('div', 'a', cd); css(ib, { left: '26px', top: '25px', width: '68px', height: '68px', borderRadius: '16px', background: DECK.rgba('accent', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' });
        icon(ib, ic, 38, 'var(--accent)', 2);
        const tt = h('div', 'a nw', cd, nm); css(tt, { left: '116px', top: '33px', font: '700 42px/1.25 var(--sans)', color: 'var(--ink)', letterSpacing: '-0.015em' });
        return cd;
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = Math.max(smooth(0.1, 0.6, x.arrive), prog(t, 0, 0.3));
      // 위 줄(LangChain, 2026년 2월)과 벤치마크 이름은 밀려 들어올 때부터 보인다(밀기 35% 화면에 왼쪽 글이 먼저 들어온다)
      upPre($.k, t, x, 0.1, 0.5, 20); upPre($.tb, t, x, 0.18, 0.5, 20);
      const p0 = prog(t, 0.35, 0.55, ease.pop);
      show($.s0, prog(t, 0.35, 0.2, ease.linear)); $.s0.style.transform = `translateY(${((1 - p0) * 36).toFixed(1)}px)`;
      U.draw($.ar, prog(t, 0.6, 0.35, ease.inOutCubic));
      const p1 = prog(t, 0.8, 0.6, ease.pop);
      show($.s1, prog(t, 0.8, 0.2, ease.linear)); $.s1.style.transform = `translateY(${((1 - p1) * 36).toFixed(1)}px) scale(${lerp(0.85, 1, p1).toFixed(4)})`;
      $.s1.$t.textContent = DECK.count(prog(t, 0.8, 1.0, ease.outQuart), 66.5, { decimals: 1, from: 52.8 });
      up($.unit, t, 1.0, 0.4, 16);
      // 순위 세로줄: 들어오는 동안 미리 보임
      show($.col, pre);
      const mv = prog(t, 1.2, 0.9, ease.pop), mvL = prog(t, 1.2, 0.9, ease.inOutCubic);
      const myR = lerp(33, 4, mv);
      // 다른 점: 1~32위 순서. 4~32위(31번째까지)는 내 점이 올라가면 한 칸씩 내려간다
      $.others.forEach((d, i) => {
        const r0 = i < 32 ? i + 1 : i + 2;            // 처음: 1..32, 34, 35 (33위 자리는 내 점)
        const r1 = i < 3 ? i + 1 : i < 32 ? i + 2 : i + 2;
        const rr = lerp(r0, r1, prog(t, 1.25 + (32 - i) * 0.008, 0.5, ease.inOutCubic));
        d.style.transform = `translateY(${(RY(rr) - 6).toFixed(1)}px)`;
      });
      const y = RY(myR);
      $.me.style.transform = `translateY(${(y - 17).toFixed(1)}px)`;
      const tTop = Math.min(y, RY(33)), tLen = Math.max(0, RY(33) - y) * (1 - prog(t, 2.0, 0.6));
      css($.trail, { top: tTop.toFixed(1) + 'px', height: tLen.toFixed(1) + 'px' });
      const wf = (a * 0.7) % 1;
      $.wave.style.transform = `translateY(${(y - 17).toFixed(1)}px) scale(${(1 + wf * 1.6).toFixed(3)})`;
      $.wave.style.opacity = ((1 - wf) * 0.7 * pre).toFixed(3);
      void mvL;
      mIn($.rk, t, 1.5, 0.6);
      $.mk.render(t, 2.0, 0.45);
      // 바꾼 세 가지
      up($.chg, t, 2.0, 0.4, 16);
      $.cards.forEach((cd, i) => {
        const p = prog(t, 2.1 + i * 0.08, 0.55, ease.pop);
        show(cd, prog(t, 2.1 + i * 0.08, 0.2, ease.linear));
        cd.style.transform = `translateY(${((1 - p) * 50).toFixed(1)}px) scale(${lerp(0.9, 1, p).toFixed(4)})`;
      });
    },
  });

  // ═════════ 24. 편집 형식 하나만 바꿨다(slide-r · drift) ═════════
  // 한 클릭 빌드(2026-11-16): 성공률 막대 두 개(0.45~) → 바꾼 것 한 줄(1.4~)이 클릭 없이 이어진다
  DECK.slide({
    id: 'hashline', holds: [], dur: 2.8,
    chrome: { source: '출처: Can Bölük, 「The Harness Problem」, 2026-02-12' },
    setup(el) {
      const $ = this.$; $.c = pal();
      $.k = tx(el, 'Can Bölük, 2026년 2월', { x: 200, y: 176, size: 36, w: 600, color: 'var(--mut)' });
      $.ti = mline(el, '편집 성공률', { x: 200, y: 226, size: 76, w: 'var(--displayW)', font: 'var(--display)', ls: '-0.025em' });
      const X0 = 200, FULL = 1300;
      $.X0 = X0; $.FULL = FULL;
      const track = y => { const d = h('div', 'a', el); css(d, { left: X0 + 'px', top: y + 'px', width: FULL + 'px', height: '92px', borderRadius: '14px', background: DECK.rgba('ink', 0.06), border: `1.5px solid ${DECK.rgba('ink', 0.1)}` }); return d; };
      $.t1 = track(410); $.t2 = track(566);
      $.b1 = h('div', 'a', el); css($.b1, { left: X0 + 'px', top: '410px', width: FULL * 0.067 + 'px', height: '92px', borderRadius: '14px 0 0 14px', background: DECK.rgba('mut', 0.85), transformOrigin: '0 50%', transform: 'scaleX(0)' });
      $.b2 = h('div', 'a', el);
      css($.b2, { left: X0 + 'px', top: '566px', width: '0px', height: '92px', borderRadius: '14px 6px 6px 14px', overflow: 'hidden',
        backgroundImage: `linear-gradient(90deg, transparent 0, transparent 40%, rgba(255,255,255,.2) 50%, transparent 60%, transparent 100%), linear-gradient(var(--accent), var(--accent))`,
        backgroundSize: '700px 100%, 100% 100%', backgroundRepeat: 'repeat-x, no-repeat' });
      $.n1 = h('div', 'a nw tnum', el, '6.7%'); css($.n1, { left: X0 + FULL * 0.067 + 30 + 'px', top: '392px', font: '400 120px/1.08 var(--num)', color: 'var(--mut)', opacity: 0 });
      $.n2 = h('div', 'a nw tnum', el, '6.7%'); css($.n2, { left: '0px', top: '548px', font: '400 120px/1.08 var(--num)', color: 'var(--accent)', opacity: 0 });
      // 6.7% 자리를 아래 막대 칸 윗변(y 566)까지만 내려 긋는 점선. 노란 막대 위로 넘어가지 않는다.
      // U.draw는 dasharray를 덮어써 실선이 되므로 쓰지 않고, render에서 끝점을 내려 긋는다(dashoffset -2: 마지막 점이 566에 닿는다)
      $.sv = svgFull(el);
      $.RX = X0 + FULL * 0.067;
      $.ref = s('path', { d: `M${$.RX} 506 L${$.RX} 506`, stroke: DECK.rgba('ink', 0.55), 'stroke-width': 2.5, 'stroke-dasharray': '6 7', 'stroke-dashoffset': -2, fill: 'none', opacity: 0 }, $.sv);
      $.ln = mline(el, '<span style="color:var(--mut)">바꾼 것:</span> 파일을 고치는 형식 하나', { x: 200, y: 762, size: 56, w: 700, ls: '-0.02em' });
      $.mk = U.mark($.ln.inner, { word: '형식 하나' });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = Math.max(smooth(0.1, 0.6, x.arrive), prog(t, 0, 0.3));
      up($.k, t, 0.08, 0.5, 20);
      mIn($.ti, t, 0.15, 0.6);
      show($.t1, pre); show($.t2, pre);
      $.b1.style.transform = `scaleX(${prog(t, 0.45, 0.5, ease.outCubic).toFixed(4)})`;
      up($.n1, t, 0.6, 0.4, 14);
      const rp = prog(t, 0.85, 0.35, ease.inOutCubic);
      $.ref.setAttribute('d', `M${$.RX} 506 L${$.RX} ${lerp(506, 566, rp).toFixed(1)}`);
      $.ref.style.opacity = rp > 0.001 ? '1' : '0';
      // 아래 막대: 6.7% 길이에서 출발해 68.3%까지 자라고, 숫자가 막대 끝을 따라간다
      const g = prog(t, 0.95, 1.1, ease.outQuart), v = lerp(6.7, 68.3, g);
      const wpx = $.FULL * v / 100;
      show($.b2, prog(t, 0.9, 0.1, ease.linear));
      $.b2.style.width = wpx.toFixed(1) + 'px';
      $.b2.style.backgroundPosition = `${(((a * 160) % 1100) - 400).toFixed(1)}px 0, 0 0`;
      show($.n2, prog(t, 0.9, 0.15, ease.linear));
      $.n2.textContent = DECK.count(g, 68.3, { decimals: 1, from: 6.7 }) + '%';
      $.n2.style.left = ($.X0 + wpx + 30).toFixed(1) + 'px';
      mIn($.ln, t, 1.4, 0.65);
      $.mk.render(t, 1.95, 0.45);
    },
  });

  // ═════════ 25. 정리: 환경.md(rise · none) ═════════
  // 한 클릭 빌드(2026-11-16): 파일 트리 시각(markAt 0.25, checkAt 0.55 = 효과음 check)은 그대로 두고, 요약 줄(0.15~) 뒤에 근거 숫자 두 쌍(1.0~)이 이어진다
  DECK.slide({
    id: 'recap-env', holds: [], dur: 2.1,
    notes: '첫 파일을 정리합니다. 모델이 아니라 환경을 바꿉니다. LangChain과 Can Bölük의 결과 모두 모델은 그대로 두고 환경을 바꾼 뒤에 숫자가 올랐습니다. 그러면 환경의 첫 부분, 요청부터 보겠습니다.',
    chrome: { source: { text: '출처: LangChain 2026-02 · Can Bölük 2026-02', step: 0, at: 1.0 } },
    setup(el) {
      const $ = this.$;
      $.tree = U.fileTree(el, { preset: 'side', current: 'c01', done: 1, markAt: 0.25, checkAt: 0.55 });
      // 오른쪽: 열린 파일 「환경.md」 창. 읽는 위치를 나타내는 옅은 띠가 천천히 내려간다(멈춘 화면 방지)
      $.pan = h('div', 'a', el);
      css($.pan, { left: '600px', top: '296px', width: '1160px', height: '484px', borderRadius: '22px', background: DECK.rgba('bg1', 0.6), border: `2px solid ${DECK.rgba('ink', 0.12)}`, overflow: 'hidden' });
      $.band = h('div', 'a', $.pan);
      css($.band, { left: 0, top: 0, width: '1160px', height: '90px', background: `linear-gradient(transparent, ${DECK.rgba('accent', 0.075)} 45%, ${DECK.rgba('accent', 0.075)} 55%, transparent)` });
      $.hdl = h('div', 'a', $.pan); css($.hdl, { left: 0, top: '94px', width: '1160px', height: '2px', background: DECK.rgba('ink', 0.1) });
      $.fn = tx(el, '환경.md', { x: 644, y: 318, size: 42, w: 700, font: 'var(--mono)', color: 'var(--accent)', ls: '0' });
      $.caret = h('div', 'a', el);
      css($.caret, { left: 644 + $.fn.offsetWidth + 8 + 'px', top: '326px', width: '14px', height: '40px', background: 'var(--accent)' });
      $.sum = mline(el, '모델이 아니라 환경을 바꾼다', { x: 644, y: 440, size: 72, w: 'var(--displayW)', font: 'var(--display)', ls: '-0.03em' });
      $.mk = U.mark($.sum.inner, { word: '환경을' });
      // 외부 결과 두 쌍만 둔다(자체 시험 점수는 빼라는 발표자 지시 2026-11-16). 창(x 600~1760) 가운데 x 1180을 기준으로
      // 좌우 같은 폭 칸의 가운데에 놓고, 쌍마다 아래에 출처 이름을 작게 붙인다
      const pairs = [['52.8', '66.5', 'LangChain'], ['6.7%', '68.3%', 'Can Bölük']];
      const CX = 1180, HALF = 270;
      $.pairs = pairs.map(([p, q, src], i) => {
        const cx = CX + (i ? HALF : -HALF);
        const d = h('div', 'a nw tnum', el, `<span style="color:var(--mut)">${p}</span><span class="ar" style="display:inline-block;color:var(--mut);font-family:var(--sans);font-size:.62em;margin:0 .46em;vertical-align:.18em">→</span><span style="color:var(--accent)">${q}</span>`);
        css(d, { top: '596px', font: '400 60px/1.1 var(--num)', opacity: 0 });
        d.style.left = (cx - d.offsetWidth / 2).toFixed(1) + 'px';
        const sr = tx(el, src, { cx, y: 684, size: 28, w: 500, color: 'var(--mut)', ls: '0' });
        return { d, ar: d.querySelector('.ar'), sr };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pre = Math.max(smooth(0.2, 0.7, x.arrive), prog(t, 0, 0.3));
      $.tree.render(t);
      show($.pan, pre);
      show($.fn, pre);
      $.band.style.transform = `translateY(${(100 + ((a * 70) % 470) - 45).toFixed(1)}px)`;
      $.band.style.opacity = prog(t, 0.4, 0.5).toFixed(3);
      $.caret.style.opacity = ((0.45 + 0.45 * Math.sin(a * 3.3)) * prog(t, 0.2, 0.2)).toFixed(3);
      mIn($.sum, t, 0.15, 0.7);
      $.mk.render(t, 0.75, 0.5);
      $.pairs.forEach((o, i) => {
        const p = prog(t, 1.0 + i * 0.1, 0.55, ease.pop);
        show(o.d, prog(t, 1.0 + i * 0.1, 0.2, ease.linear));
        o.d.style.transform = `translateY(${((1 - p) * 34).toFixed(1)}px)`;
        up(o.sr, t, 1.15 + i * 0.1, 0.45, 12);
        const f = (a * 0.6 - i * 0.33) % 1, nud = f > 0 ? Math.sin(Math.min(1, f * 3) * Math.PI) : 0;
        o.ar.style.transform = `translateX(${(nud * 6 * prog(t, 1.7, 0.3)).toFixed(1)}px)`;
      });
    },
  });
})();
