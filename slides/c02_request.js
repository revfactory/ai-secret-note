/* c02 요청서.md: 요청은 문서로 쓴다 — 슬라이드 26~36(11장). 종이 바탕(paper) 장.
 * 글자는 paperInk, 강조는 형광 밑줄(U.mark), 교정 표시는 bad 색을 paperInk 쪽으로 섞은 빨강.
 * 서식(29·30·32)은 같은 모양의 종이 한 장(tex_paper 결)이고, 빈칸은 점선 테두리, 채울 때는 한 글자씩 찍힌다.
 * 모든 슬라이드가 빌드 1개다(발표자 지시 2026-11-16). 이전에 클릭마다 나오던 묶음은 클릭 없이 0.4~0.8초 간격으로 이어서 나온다.
 * 29·30·35는 inner track이지만 camTrack은 끝 화면 한 자리뿐이고, cameraHook이 t에 따라 지금 칸·줄을 따라간 뒤 끝 화면에서
 * 그 슬라이드의 칸·줄이 모두 보이는 자리로 돌아온다.
 * 노트는 스토리보드 notes를 옮긴다(33·34·35번은 2026-11-16 맥락 보완 문구). 36번이던 광진구청 사례는 발표자 지시로 지웠다.
 * 경로 줄·출처 줄·예시 표시는 엔진 공통 크롬이 그린다.
 */
(function () {
  'use strict';
  const { ease, prog, clamp, lerp, rand, css, h, s, show, set, smooth } = DECK;
  const TAU = Math.PI * 2;

  const NOTES = {
    'cover-request': '다음 파일은 요청서.md입니다. 요청을 말로 하지 않고 문서로 씁니다.',
    'vague': '가장 흔한 요청입니다. 시장 조사해서 보고서 만들어 줘. 이 문장에는 네 가지가 없습니다. 어느 시장인지, 어느 기간인지, 누가 읽는지, 무엇을 기준으로 판단하는지. 사람 직원이라면 되묻습니다. 에이전트는 되묻지 않고 빠진 조건을 임의로 채워 넣습니다.',
    'clear': '고쳐 쓰면 이렇습니다. 국내 기업용 AI 서비스를 비교해 경영진 검토용 다섯 쪽 보고서를 작성해 줘. 대상, 방법, 독자, 분량이 들어갔습니다. 한 문장으로도 많이 달라집니다. 하지만 몇 시간 걸리는 일을 맡기려면 한 문장으로는 부족합니다.',
    'seven-a': '그래서 요청서를 씁니다. 칸은 일곱 개입니다. 첫째는 자료 범위입니다. 어떤 자료를 먼저 쓰고 무엇을 기록할지 적습니다. 둘째는 독자입니다. 누가 읽고 무엇을 판단하는지 적습니다. 셋째는 완료 기준입니다. 무엇이 채워지면 끝인지 적습니다. 넷째는 제외입니다. 넣지 말아야 할 것을 적습니다. 에이전트는 하지 말라는 말이 없으면 추정값도 본문에 넣습니다.',
    'seven-b': '다섯째는 권한입니다. 혼자 해도 되는 일과 승인을 받아야 하는 일을 나눕니다. Replit 사고에 없던 칸이 이것입니다. 여섯째는 막혔을 때입니다. 자료를 못 열면 지어내지 말고 어디까지 확인했는지 알려 달라고 적습니다. 일곱째는 한도입니다. 시간이나 비용의 상한을 적습니다.',
    'three-groups': '일곱 칸이 많으면 세 묶음으로 기억하셔도 됩니다. 누가 읽나. 무엇으로, 무엇을 빼고. 언제 끝내고 어디서 멈추나. 이 세 가지가 있으면 요청서입니다.',
    'request-example': '여러분 업무로 옮겨 보겠습니다. 제가 만든 예시입니다. 올해 ICT 지원사업 공고를 표로 정리해 달라는 요청입니다. 자료는 각 기관 누리집의 공고문 원문만 쓰고, 독자는 처음 지원하는 기업 담당자입니다. 완료 기준은 공고마다 대상, 기간, 금액, 문의처가 채워지는 것이고, 마감된 공고는 뺍니다. 표를 저장하는 것까지만 하고, 열리지 않는 공고는 주소와 함께 표시하고, 공고 서른 건에서 멈춥니다. 이 정도면 결과를 받아서 검토할 수 있습니다.',
    'done-first': '요청서 일곱 칸을 다 채우기 어렵다면, 저는 완료 기준 하나만은 먼저 적습니다. 무엇이 채워지면 일이 끝난 것인지 정하는 칸입니다. 이 칸이 비어 있으면 끝났는지를 에이전트가 정합니다. 이 칸을 파일로 만든 사례를 보겠습니다.',
    'passes': '완료 기준을 파일로 만든 사례입니다. Anthropic이 작년 11월에 공개한 방법인데, 에이전트가 여러 세션에 걸쳐 앱 하나를 만드는 긴 작업입니다. 일을 맡기기 전에 만들 기능을 목록 파일에 적습니다. 예시 앱에서는 이백 개가 넘었습니다. 항목마다 passes, 곧 테스트를 통과했는지를 적는 칸이 있고, 처음에는 모두 false, 통과 못 함입니다. 에이전트는 테스트를 통과시킨 뒤에만 이 값을 true로 바꿉니다. 규칙은 두 가지입니다. 에이전트는 이 값만 바꿀 수 있고, 테스트를 지우거나 고칠 수 없습니다. 목록이 전부 true가 되기 전에는 끝났다고 말할 수 없습니다.',
    'four-failures': '같은 글은 긴 작업에서 에이전트가 실패하는 방식을 네 가지로 정리했습니다. 이 에이전트는 세션이 바뀌면 앞에서 한 일을 기억하지 못합니다. 첫째, 너무 일찍 끝났다고 선언합니다. 방금 본 기능 목록 파일로 막습니다. 둘째, 버그를 남기고 기록도 안 남깁니다. git, 곧 파일 변경 이력을 남기는 도구의 기록과 진행 기록 파일을 쓰게 합니다. 셋째, 확인 없이 완료로 표시합니다. 테스트를 통과한 뒤에만 값을 바꾸게 합니다. 넷째, 앱을 실행하는 방법을 몰라 시간을 씁니다. 실행 스크립트를 미리 둡니다. 네 가지 대응은 모두 파일과 그 파일을 다루는 규칙입니다.',
    'recap-request': '요청서.md 정리입니다. 요청서에는 일곱 칸이 있고, 그중 완료 기준을 먼저 적습니다. 다음은 이 요청을 받아 일하는 쪽의 구성입니다.',
  };

  // ── 색(종이 바탕) ──
  const C = {
    ink: 'var(--paperInk)', ink2: 'var(--paperInk2)', line: 'var(--paperLine)', ok: 'var(--okInk)', mark: 'var(--mark)',
    red: 'color-mix(in srgb, var(--bad) 80%, var(--paperInk))',       // 교정 선
    redInk: 'color-mix(in srgb, var(--bad) 60%, var(--paperInk))',    // 교정 글자(종이 위 대비 5:1)
    sheet: 'color-mix(in srgb, var(--paper) 42%, #ffffff)',           // 서식 종이(바탕보다 밝게)
    chip: 'color-mix(in srgb, var(--paper) 70%, #ffffff)',
    band: 'color-mix(in srgb, var(--mark) 24%, transparent)',         // 지금 칸 띠
  };
  const SRC_ANT = '출처: Anthropic 엔지니어링 블로그(2025-11-26)';

  // ── 도우미 ──
  const div = (parent, html, style, cls = 'a') => { const d = h('div', cls, parent, html); if (style) css(d, style); return d; };
  const svgBox = (parent, w = 1920, hh = 1080, style) => { const sv = s('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); css(sv, Object.assign({ position: 'absolute', left: '0px', top: '0px', overflow: 'visible' }, style || {})); return sv; };
  function fadeUp(el, t, start, dur = 0.5, dy = 26, k = 1) {
    const p = prog(t, start, dur);
    show(el, p * k); set(el, 'transform', `translateY(${((1 - p) * dy).toFixed(1)}px)`);
    return p;
  }
  const blink = a => (Math.floor(a * 2.2) % 2 === 0 ? 1 : 0);
  const drawP = (path, p) => { set(path, 'strokeDashoffset', (1 - clamp(p)).toFixed(4)); };   // pathLength=1 경로
  // 띠 안을 가로지르는 옅은 밝은 줄(머무는 동안 x.a로 왼쪽에서 오른쪽으로 움직인다). 띠 요소는 overflow hidden
  function sheen(band, w = 300) {
    css(band, { overflow: 'hidden' });
    return div(band, null, { left: '0px', top: '0px', width: w + 'px', height: '100%',
      background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--mark) 75%, transparent) 50%, transparent)' });
  }
  function renderSheen(el, a, span, period = 3.4, w = 300) {
    const u = (Math.max(0, a) / period) % 1;
    set(el, 'transform', `translateX(${(lerp(-w, span, u)).toFixed(1)}px)`);
  }
  // 바깥으로 퍼지며 사라지는 테두리(맥동 강조). 2초 주기라 1초 떨어진 두 순간이 항상 다르다
  function ripple(parent, x0, y0, w, hh, r = 14) {
    return div(parent, null, { left: x0 + 'px', top: y0 + 'px', width: w + 'px', height: hh + 'px', borderRadius: r + 'px',
      border: '4px solid var(--mark)', opacity: 0 });
  }
  function renderRipple(el, a, k = 1, period = 2, amp = 0.12) {
    const u = (Math.max(0, a) / period) % 1;
    set(el, 'transform', `scale(${(1 + amp * ease.outCubic(u)).toFixed(4)})`);
    set(el, 'opacity', (k * (1 - u) * 0.95).toFixed(3));
  }
  const roundRectD = (x, y, w, hh, r) => `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + hh - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + hh} H${x + r} A${r} ${r} 0 0 1 ${x} ${y + hh - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
  // 시작 시각(starts[1]부터)마다 값이 dur초 동안 옮겨 간다(엔진 track 보간과 같은 곡선). 간격이 dur보다 짧으면 이어서 흐른다
  function stepVal(t, starts, vals, dur = 0.8) {
    let v = vals[0];
    for (let k = 1; k < starts.length; k++) v = lerp(v, vals[k], ease.inOutCubic(clamp((t - starts[k]) / dur)));
    return v;
  }
  // 지금 카메라(x.cam)로 슬라이드 좌표 y를 화면 y로
  const screenY = (x, y) => { const c = x.cam || { dy: 0, dz: 0 }, z = 2000 / Math.max(100, 2000 + (c.dz || 0)); return (y - (540 + (c.dy || 0))) * z + 540; };
  const inView = (x, y0, y1, top = 150, bot = 1000) => Math.min(clamp((screenY(x, y0) - top) / 40), clamp((bot - screenY(x, y1)) / 40));

  // 한 글자씩 찍히는 글 상자(줄 배열). 커서는 마지막 글자 뒤
  function typer(parent, lines, style, o = {}) {
    const box = div(parent, null, style);
    const chars = [], lineEls = [], lineOf = [];
    lines.forEach((ln, li) => {
      const d = h('div', '', box); css(d, { position: 'relative', whiteSpace: 'nowrap' });
      for (const ch of [...ln]) { const sp = h('span', '', d); sp.textContent = ch; chars.push(sp); lineOf.push(li); }
      lineEls.push(d);
    });
    const caret = div(box, null, { left: '0px', top: '0px', width: (o.cw || 3) + 'px', background: o.caretColor || C.ink, borderRadius: '2px', opacity: 0 });
    let pos = null, lastN = -1, lh = 0, chH = 0;
    const T = {
      box, chars, lineEls, caret, N: chars.length,
      measure() {
        const fs = parseFloat(getComputedStyle(box).fontSize) || 36;
        lh = lineEls[0].offsetHeight; chH = Math.round(fs * 1.0);
        pos = chars.map((sp, i) => [sp.offsetLeft + sp.offsetWidth, lineEls[lineOf[i]].offsetTop]);
        css(caret, { height: chH + 'px' });
      },
      setN(n) {
        if (n === lastN) return;
        lastN = n;
        for (let i = 0; i < chars.length; i++) set(chars[i], 'visibility', i < n ? 'inherit' : 'hidden');
      },
      // caret: 0 끔, 1 찍는 동안만, 2 찍은 뒤 깜박임
      render(t, start, cps, a, caretMode = 1) {
        if (!pos) T.measure();
        const n = t < start ? 0 : Math.floor(clamp((t - start) * cps, 0, T.N) + 1e-6);
        T.setN(n);
        let cv = 0;
        if (caretMode && t >= start - 0.12) cv = n < T.N ? 1 : caretMode === 2 ? blink(a) : 0;
        const k = n - 1;
        const cx = k < 0 ? 0 : pos[k][0] + 4, cy = (k < 0 ? 0 : pos[k][1]) + (lh - chH) / 2;
        set(caret, 'transform', `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`);
        set(caret, 'opacity', String(cv));
        return T.N ? n / T.N : 1;
      },
      done: (t, start, cps) => t >= start + T.N / cps,
    };
    return T;
  }
  // U.rise 결과에서 글자 i~j의 상자(슬라이드 좌표)
  function riseBox(R, i, j) {
    const el = R.el, a = R.chars[i].parentNode, b = R.chars[j].parentNode;
    return { x0: el.offsetLeft + a.offsetLeft, x1: el.offsetLeft + b.offsetLeft + b.offsetWidth, y0: el.offsetTop, y1: el.offsetTop + el.offsetHeight };
  }
  // 빨간 교정 선: 점 목록 → 경로. f(정수)가 바뀔 때마다 점 위치가 1px 안팎으로 바뀐다
  const wob = (i, f, seed, amp = 1.3) => [amp * Math.sin(i * 0.47 + f * 2.31 + seed), amp * Math.cos(i * 0.39 + f * 1.87 + seed * 1.3)];
  const polyD = pts => 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  function loopPts(cx, cy, rx, ry, seed, f) {
    const pts = [], N = 46, a0 = -2.35 + rand(seed, 1) * 0.5, span = TAU + 0.6;
    for (let i = 0; i <= N; i++) {
      const u = i / N, an = a0 + span * u, k = 1 + 0.03 * Math.sin(an * 3 + seed) + 0.07 * u, w = wob(i, f, seed);
      pts.push([cx + Math.cos(an) * rx * k + w[0], cy + Math.sin(an) * ry * k + w[1]]);
    }
    return pts;
  }
  function curvePts(x0, y0, x1, y1, bend, seed, f, N = 18) {
    const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2, pts = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, w = wob(i, f, seed, 0.9);
      pts.push([(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx + u * u * x1 + w[0], (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my + u * u * y1 + w[1]]);
    }
    return pts;
  }
  function wavePts(x0, x1, y, seed, f) {
    const pts = [], N = Math.round((x1 - x0) / 6);
    for (let i = 0; i <= N; i++) { const u = i / N, w = wob(i, f, seed, 0.8); pts.push([lerp(x0, x1, u) + w[0], y + 7 * Math.sin(u * (x1 - x0) / 13) + w[1]]); }
    return pts;
  }
  const redPath = (sv, sw = 4.5) => s('path', { fill: 'none', stroke: C.red, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, sv);

  // ── 요청서 일곱 칸(29·30·31·36) ──
  const FIELDS = [
    ['자료 범위', ['공식 가격표와 제품 문서를 우선 사용하고,', '확인한 날짜를 남겨줘']],
    ['독자', ['비개발 임원이 도입 여부를 판단할 수 있도록', '비용과 적용 조건을 설명해줘']],
    ['완료 기준', ['비교 항목을 빠짐없이 채우고,', '확인되지 않은 내용은 구분해줘']],
    ['제외', ['추정 가격과 출처를 확인할 수 없는', '성능 수치는 본문에 넣지 마']],
    ['권한', ['초안 작성과 저장은 진행하고,', '외부 발송은 승인 후에 해줘']],
    ['막힘', ['자료 접근이 막히면', '확인한 범위와 필요한 도움을 알려줘']],
    ['한도', ['정해진 예산 안에서 진행하고,', '초과가 예상되면 먼저 알려줘']],
  ];

  // 서식 종이 한 장(29·30): 일곱 줄 표. 왼쪽 칸 이름(display 44px), 오른쪽 문장(serif 36px)
  const FM = { x: 220, w: 1480, padT: 56, rh: 232, numX: 46, nameX: 104, colX: 404, sentX: 444, sentW: 980 };
  const FM_H = FM.padT * 2 + 7 * FM.rh;
  // 서식 가림은 화면 기준이다: 카메라가 다가가거나 물러나도 화면 y 120 위(경로 줄 자리)와 990 아래에서는 종이가 투명하다.
  // 29·30번에는 출처 줄이 없고, 끝 화면에서 그 슬라이드의 칸이 모두 들어가야 해서 아래 경계를 화면 끝 가까이 둔다
  const FMASK = [120, 160, 925, 990];
  const FORM_MASK = `linear-gradient(to bottom, transparent ${FMASK[0]}px, #000 ${FMASK[1]}px, #000 ${FMASK[2]}px, transparent ${FMASK[3]}px)`;
  function formMask(x) {
    const c = x.cam || { dy: 0, dz: 0 }, z = 2000 / Math.max(100, 2000 + (c.dz || 0));
    const y = sy => ((sy - 540) / z + 540 + (c.dy || 0)).toFixed(0);
    return `linear-gradient(to bottom, transparent ${y(FMASK[0])}px, #000 ${y(FMASK[1])}px, #000 ${y(FMASK[2])}px, transparent ${y(FMASK[3])}px)`;
  }
  function paperSheet(parent, style) {
    const sh = div(parent, null, Object.assign({ background: C.sheet, borderRadius: '12px', overflow: 'hidden',
      border: '1.5px solid var(--paperLine)', boxShadow: '0 26px 60px rgba(27,29,26,.13), 0 3px 8px rgba(27,29,26,.08)' }, style));
    const tex = DECK.img('assets/img/tex_paper.png');
    if (!tex.missing) { css(tex, { position: 'absolute', left: '0px', top: '0px', width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.42, pointerEvents: 'none' }); sh.appendChild(tex); }
    return sh;
  }
  function makeForm(el, o = {}) {
    const F = { rows: [] };
    F.clip = div(el, null, { left: '0px', top: '0px', width: '1920px', height: '1080px', webkitMaskImage: FORM_MASK, maskImage: FORM_MASK });
    F.sheet = paperSheet(F.clip, { left: FM.x + 'px', top: '0px', width: FM.w + 'px', height: FM_H + 'px' });
    F.band = div(F.sheet, null, { left: '18px', top: '0px', width: FM.w - 36 + 'px', height: FM.rh - 20 + 'px', borderRadius: '16px', background: C.band, opacity: 0 });
    F.sheen = sheen(F.band, 340);
    const sv = svgBox(F.sheet, FM.w, FM_H);
    for (let k = 0; k < 7; k++) {
      const top = FM.padT + k * FM.rh;
      if (k > 0) s('path', { d: `M30 ${top} H${FM.w - 30}`, stroke: DECK.rgba('paperInk', 0.16), 'stroke-width': 2 }, sv);
      const col = s('path', { d: `M${FM.colX} ${top + 34} V${top + FM.rh - 34}`, stroke: DECK.rgba('paperInk', 0.14), 'stroke-width': 2 }, sv);
      const dash = s('rect', { x: FM.sentX - 18, y: top + 30, width: FM.sentW + 36, height: FM.rh - 60, rx: 14, fill: 'none', stroke: DECK.rgba('paperInk', 0.34), 'stroke-width': 2.5, 'stroke-dasharray': '12 10' }, sv);
      // 번호는 29번 끝 화면(0.9배)에서도 28px 넘게 보이도록 32px
      const num = div(F.sheet, String(k + 1), { left: FM.numX + 'px', top: top + 62 + 'px', font: '700 32px/1 var(--mono)', color: C.ink2 }, 'a nw');
      const name = div(F.sheet, FIELDS[k][0], { left: FM.nameX + 'px', top: top + 52 + 'px', font: 'var(--displayW) 44px/1.2 var(--display)', letterSpacing: '-.02em', color: C.ink2 }, 'a nw');
      const ty = typer(F.sheet, FIELDS[k][1], { left: FM.sentX + 'px', top: top + 56 + 'px', font: '500 36px/58px var(--serif)', color: C.ink, letterSpacing: '-.005em' });
      F.rows.push({ k, top, col, dash, num, name, ty });
    }
    return F;
  }

  // ═════════════════════ 26. 장 표지 ═════════════════════
  DECK.slide({
    id: 'cover-request', bg: 'paper', holds: [], dur: 2.4, notes: NOTES['cover-request'],
    setup(el) {
      const $ = this.$;
      // 뒤 층: 빈 서식과 펜 사진(40%). 왼쪽(트리 쪽)은 가려 둔다
      $.photo = div(el, null, { left: '0px', top: '0px', width: '1920px', height: '1080px', overflow: 'hidden',
        webkitMaskImage: 'linear-gradient(90deg, transparent 520px, #000 940px)', maskImage: 'linear-gradient(90deg, transparent 520px, #000 940px)' });
      $.im = U.image($.photo, 'assets/img/kv_request.png', { x: 560, y: -50, w: 2140, h: 1204, radius: 0, light: true });
      $.im.el.style.transformOrigin = '60% 50%';
      // 가운데 층: 파일 트리(요청서.md 줄 밑줄, 환경.md 확인 표시)
      $.tree = U.fileTree(el, { preset: 'side', x: 176, light: true, current: 'c02', done: 1, checkFrom: 2, markAt: 0.35, markDur: 0.5 });
      const row = $.tree.rows[1], cy = 308 + 2 * $.tree.R + $.tree.R / 2;
      const x0 = 176 + Math.round(2.5 * 34) + row.nameEl.offsetWidth + 22;
      // 트리 줄과 제목을 잇는 점선
      $.lead = div(el, null, { left: x0 + 'px', top: cy - 3 + 'px', width: 640 - x0 + 'px', height: '6px',
        backgroundImage: `radial-gradient(circle, ${DECK.rgba('paperInk', 0.55)} 2.4px, transparent 2.9px)`, backgroundSize: '14px 6px', backgroundRepeat: 'repeat-x' });
      $.front = div(el, null, { left: '0px', top: '0px', width: '1920px', height: '1080px' });
      $.kick = div($.front, '요청서.md', { left: '660px', top: cy - 32 + 'px', font: '700 60px/64px var(--mono)', color: C.ink, letterSpacing: '-.01em' }, 'a nw');
      $.title = U.rise($.front, '요청은 문서로 쓴다', { left: '654px', top: '512px', font: 'var(--displayW) 96px/1.12 var(--display)', letterSpacing: '-.035em', color: C.ink, whiteSpace: 'nowrap' });
      $.mk = U.mark($.title, { word: '문서', light: true });
    },
    render(t, x) {
      const $ = this.$, a = x.a, arr = smooth(0.0, 0.5, x.arrive);
      // 사진: 비행 중부터 보이고, 머무는 동안 아주 느리게 밀린다
      show($.photo, 0.4 * Math.max(arr, prog(t, 0, 0.6)));
      $.photo.style.transform = U.depth(x, -0.45);
      $.im.el.style.transform = `translateX(${(-22 * Math.sin(a * 0.06)).toFixed(2)}px) scale(${(1.0 + 0.025 * (1 - Math.cos(a * 0.07))).toFixed(5)})`;
      $.tree.render(t);
      U.wipe($.lead, prog(t, 0.55, 0.45, ease.inOutCubic));
      const kp = prog(t, 0.75, 0.5);
      U.wipe($.kick, kp); set($.kick, 'transform', `translateX(${((1 - kp) * -24).toFixed(1)}px)`);
      $.title.render(t, 0.95, { each: 0.045, dur: 0.6 });
      $.mk.render(t, 1.6, 0.5);
      $.front.style.transform = U.depth(x, 0.3);
    },
  });

  // ═════════════════════ 27. 모호한 요청 ═════════════════════
  // 요청 문장(음절이 솟음, 1.25초에 다 나옴) → 약 0.7초 뒤 빠진 것 네 가지가 빨간 교정 표시로(S부터)
  DECK.slide({
    id: 'vague', bg: 'paper', holds: [], dur: 3.95, notes: NOTES.vague,
    setup(el) {
      const $ = this.$;
      $.rule = div(el, null, { left: '0px', top: '0px', height: '2px', background: DECK.rgba('paperInk', 0.2), transformOrigin: '50% 50%' });
      $.s = U.rise(el, '「시장 조사해서 보고서 만들어줘」', { left: '0px', width: '1920px', top: '444px', textAlign: 'center', font: '700 80px/1.3 var(--serif)', letterSpacing: '-.01em', color: C.ink, whiteSpace: 'nowrap' });
      const N = $.s.chars.length;
      const all = riseBox($.s, 0, N - 1);
      css($.rule, { left: all.x0 - 30 + 'px', top: '572px', width: all.x1 - all.x0 + 60 + 'px' });
      const W = { market: riseBox($.s, 1, 2), survey: riseBox($.s, 3, 6), report: riseBox($.s, 7, 9) };
      const gx = W.market.x0 - 4;                       // 「와 시장 사이(기간이 들어갈 자리)
      const yc = 498;                                    // 글자 가운데
      $.sv = svgBox(el);
      const lab = (txt, cx, top, rot) => {
        const d = div(el, txt, { top: top + 'px', font: '700 38px/1.2 var(--sans)', color: C.redInk, letterSpacing: '-.01em', opacity: 0 }, 'a nw');
        d.style.left = cx - d.offsetWidth / 2 + 'px'; d.$rot = rot; return d;
      };
      const mc = (W.market.x0 + W.market.x1) / 2, rc = (W.report.x0 + W.report.x1) / 2, sc = (W.survey.x0 + W.survey.x1) / 2;
      // 표시 네 개: 그리는 선(모양), 잇는 선, 글자, 시작 시각
      $.marks = [
        { kind: 'loop', g: [mc, yc, (W.market.x1 - W.market.x0) / 2 + 26, 62], c: [mc - 8, yc - 70, mc - 60, 356], lab: lab('어느 시장?', mc - 60, 304, -3), at: 0.15 },
        { kind: 'caret', g: [gx, 552], c: [gx, 598, gx - 50, 656], lab: lab('어느 기간?', gx - 70, 662, 2), at: 0.4 },
        { kind: 'loop', g: [rc, yc, (W.report.x1 - W.report.x0) / 2 + 26, 62], c: [rc + 10, yc - 70, rc + 70, 356], lab: lab('누가 읽나?', rc + 70, 304, 2.5), at: 0.65 },
        { kind: 'wave', g: [W.survey.x0 + 4, W.survey.x1 - 4, 586], c: [sc + 20, 600, sc + 80, 656], lab: lab('무엇으로 판단하나?', sc + 90, 662, -2), at: 0.9 },
      ];
      $.marks.forEach((m, i) => { m.p = redPath($.sv); m.l = redPath($.sv, 3.5); m.seed = i * 3.7 + 1; });
    },
    render(t, x) {
      const $ = this.$, a = x.a, S = 1.8;
      const early = smooth(0.15, 0.7, x.arrive);
      // 밑줄 자리와 「 」는 비행 중부터 보인다
      set($.rule, 'transform', `scaleX(${Math.max(early, prog(t, 0, 0.6)).toFixed(4)})`);
      $.s.render(t, 0.1, { each: 0.035, dur: 0.55 });
      const N = $.s.chars.length;
      [0, N - 1].forEach(i => { const c = $.s.chars[i], p = Math.max(prog(t, 0.1 + i * 0.035, 0.55), early); c.style.opacity = p > 0 ? '1' : '0'; c.style.transform = `translateY(${((1 - p) * 120).toFixed(1)}%)`; });
      // 교정 표시 묶음: 문장이 조금 흐려지고(끝 화면에서도 읽히는 0.62) 교정 표시가 붙는다
      set($.s.el, 'opacity', lerp(1, 0.62, prog(t, S, 0.4)).toFixed(3));
      const f = Math.floor(a * 6);
      $.marks.forEach(m => {
        const t0 = S + m.at, pg = prog(t, t0, 0.42, ease.inOutCubic), pl = prog(t, t0 + 0.32, 0.22, ease.outCubic);
        const g = m.g, c = m.c;
        let pts;
        if (m.kind === 'loop') pts = loopPts(g[0], g[1], g[2], g[3], m.seed, f);
        else if (m.kind === 'caret') { const w1 = wob(1, f, m.seed, 1), w2 = wob(2, f, m.seed, 1); pts = [[g[0] - 24 + w1[0], g[1] + 34], [g[0] + w2[0] * 0.5, g[1] + w2[1] * 0.5], [g[0] + 24 + w1[1], g[1] + 34]]; }
        else pts = wavePts(g[0], g[1], g[2], m.seed, f);
        if (pg > 0) m.p.setAttribute('d', polyD(pts));
        drawP(m.p, pg); show(m.p, pg > 0 ? 1 : 0);
        if (pl > 0) m.l.setAttribute('d', polyD(curvePts(c[0], c[1], c[2], c[3], m.kind === 'loop' ? 0 : 18, m.seed + 9, f, 14)));
        drawP(m.l, pl); show(m.l, pl > 0 ? 1 : 0);
        const lp = prog(t, t0 + 0.42, 0.45, ease.pop);
        show(m.lab, prog(t, t0 + 0.42, 0.15, ease.linear));
        set(m.lab, 'transform', `rotate(${m.lab.$rot}deg) scale(${lerp(0.6, 1, lp).toFixed(4)})`);
      });
    },
  });

  // ═════════════════════ 28. 명확한 요청 ═════════════════════
  // 고쳐 쓴 문장이 왼쪽부터 쓰인다 → (둘째 줄이 거의 다 쓰일 때 S) 네 부분에 형광 밑줄 + 이름표(대상·방법·독자·분량)
  DECK.slide({
    id: 'clear', bg: 'paper', holds: [], dur: 3.3, notes: NOTES.clear,
    setup(el) {
      const $ = this.$;
      const LT = [326, 520];
      $.rules = LT.map(y => div(el, null, { left: '0px', top: y + 92 + 'px', height: '2px', background: DECK.rgba('paperInk', 0.18), transformOrigin: '0 50%' }));
      // 줄을 조각 span으로 나눠 둔다(밑줄 낱말과 나머지 글자가 한 요소 안에서 겹쳐 재지지 않게)
      const SEG = [['「', '국내 기업용 AI 서비스', '를 ', '비교', '해'], ['경영진 검토용', ' ', '5쪽', ' 보고서를 작성해줘.」']];
      $.focus = div(el, null, { left: '0px', top: '0px', width: '10px', height: '10px', borderRadius: '14px', background: 'color-mix(in srgb, var(--mark) 46%, transparent)', opacity: 0 });
      $.lines = SEG.map((segs, i) => {
        const d = div(el, segs.map(x => `<span>${x}</span>`).join(''), { top: LT[i] + 'px', font: '700 64px/1.3 var(--serif)', letterSpacing: '-.01em', color: C.ink }, 'a nw');
        d.style.left = Math.round(960 - d.offsetWidth / 2) + 'px';
        return d;
      });
      $.lines.forEach((d, i) => css($.rules[i], { left: d.offsetLeft - 24 + 'px', width: d.offsetWidth + 48 + 'px' }));
      const parts = [[0, '국내 기업용 AI 서비스', '대상'], [0, '비교', '방법'], [1, '경영진 검토용', '독자'], [1, '5쪽', '분량']];
      $.marks = parts.map(([li, w]) => U.mark($.lines[li], { word: w, light: true }));
      $.tags = parts.map(([li, , tag], i) => {
        const sp = $.marks[i].el, ln = $.lines[li];
        const cx = ln.offsetLeft + sp.offsetLeft + sp.offsetWidth / 2, y = LT[li] + 104;
        const tick = div(el, null, { left: cx - 1.5 + 'px', top: y + 'px', width: '3px', height: '20px', background: DECK.rgba('paperInk', 0.55), transformOrigin: '50% 0' });
        const d = div(el, tag, { top: y + 22 + 'px', font: '800 34px/1 var(--sans)', color: C.ink, padding: '9px 20px 10px', borderRadius: '999px',
          background: 'color-mix(in srgb, var(--mark) 62%, var(--paper))', border: '2px solid color-mix(in srgb, var(--mark) 40%, var(--paperInk))', opacity: 0 }, 'a nw');
        d.style.left = Math.round(cx - d.offsetWidth / 2) + 'px';
        return { tick, d, cx, y: LT[li], x0: ln.offsetLeft + sp.offsetLeft, w: sp.offsetWidth };
      });
      $.pen = div(el, null, { left: '0px', top: '0px', width: '4px', height: '72px', background: C.ink, borderRadius: '2px', opacity: 0 });
    },
    render(t, x) {
      const $ = this.$, a = x.a, S = 1.2;
      const early = smooth(0.1, 0.65, x.arrive);
      $.rules.forEach((r, i) => set(r, 'transform', `scaleX(${Math.max(early, prog(t, i * 0.2, 0.5)).toFixed(4)})`));
      // 줄마다 왼쪽에서 오른쪽으로 드러나고, 드러나는 끝에 세로 커서가 붙어 움직인다
      const wp = [prog(t, 0.05, 0.7, ease.inOutCubic), prog(t, 0.6, 0.75, ease.inOutCubic)];
      $.lines.forEach((d, i) => { U.wipe(d, wp[i]); show(d, wp[i] > 0 ? 1 : 0); });
      const li = wp[0] < 1 ? 0 : 1, ln = $.lines[li], pw = wp[li];
      const px = ln.offsetLeft + ln.offsetWidth * pw + 6, py = ln.offsetTop + 6;
      set($.pen, 'transform', `translate(${px.toFixed(1)}px, ${py}px)`);
      set($.pen, 'opacity', String(t < 0.05 ? 0 : pw < 1 || li === 0 ? 1 : blink(a) * (1 - prog(t, S, 0.3))));
      $.marks.forEach((m, i) => m.render(t, S + 0.1 + i * 0.28, 0.4));
      // 머무는 동안: 옅은 띠가 대상 → 방법 → 독자 → 분량 순서로 천천히 옮겨 간다(낱말과 이름표를 함께 감쌈)
      // 머무는 시간은 x.a로 센다(t는 dur에서 멈춘다). 1.5초 주기로 한 칸에 0.9초 머물고 0.6초 동안 옆 칸으로 옮긴다
      // (머묾이 1초보다 짧아 1초 떨어진 두 순간은 늘 띠 자리가 다르다)
      const u = (Math.max(0, a) / 1.5) % 4, k0 = Math.floor(u), fr = ease.inOutCubic(clamp((u - k0 - 0.6) / 0.4));
      const A = $.tags[k0], B = $.tags[(k0 + 1) % 4];
      const fx = lerp(A.x0, B.x0, fr) - 14, fw = lerp(A.w, B.w, fr) + 28, fy = lerp(A.y, B.y, fr) - 4;
      css($.focus, { transform: `translate(${fx.toFixed(1)}px, ${fy.toFixed(1)}px)`, width: fw.toFixed(1) + 'px', height: '182px' });
      // 띠는 한 칸에 머무는 동안에도 옅게 숨 쉬듯 진해졌다 옅어진다(멈춘 화면 방지. 글자는 움직이지 않음)
      show($.focus, prog(t, S + 1.3, 0.35) * (0.77 + 0.1 * Math.sin(a * 2.3)));
      $.tags.forEach((g, i) => {
        const t0 = S + 0.3 + i * 0.28;
        set(g.tick, 'transform', `scaleY(${prog(t, t0, 0.2).toFixed(4)})`); show(g.tick, prog(t, t0, 0.05, ease.linear));
        const p = prog(t, t0 + 0.12, 0.45, ease.pop);
        show(g.d, prog(t, t0 + 0.12, 0.15, ease.linear));
        set(g.d, 'transform', `translateY(${((1 - p) * -16).toFixed(1)}px) scale(${lerp(0.7, 1, p).toFixed(4)})`);
      });
    },
  });

  // ═════════════════════ 29·30. 요청서의 일곱 칸 ═════════════════════
  // 클릭 없이 칸이 차례로 채워진다: 노란 띠가 그 줄로 옮겨 가고, 점선이 사라지며 문장이 한 글자씩 찍힌다.
  // 서식 종이는 제자리에 있고 카메라(cameraHook)가 띠를 따라 조금 다가가 내려간 뒤, back부터 끝 자리(camTrack 한 자리)로 물러나
  // 끝 화면에서 이 슬라이드가 채운 칸이 모두 읽힌다(글자 위아래 끝이 화면 175~905 안)
  const PERSP = 2000;                              // 엔진 원근 거리 P(deck/engine.js). 화면 배율 = P / (P + dz)
  const FORM_VIS = { top: 130, bot: 960 };         // 줄을 지우는 화면 경계: 가림 띠 안에 반쯤 걸친 줄 이름·문장 토막이 남지 않게
  const FORM_CPS = 64, BAND_LEAD = 0.2, BAND_MOVE = 0.4, CAM_MOVE = 0.7;
  function formSlide(def) {
    // rows: 이 슬라이드에서 채우는 줄, at: 줄마다 글자가 찍히기 시작하는 t, focus: 끝 화면 가운데(y 540)에 오는 서식 세로 위치(서식 좌표)
    // zEnd: 끝 화면 배율, lean: 따라가는 동안 더하는 배율, follow: 카메라가 띠 쪽으로 옮겨 가는 비율, back: 끝 자리로 물러나기 시작하는 t
    const { rows, filledBefore, at, focus, zEnd, lean, follow, back, marks } = def;
    const top = 540 - focus;                                                     // 서식 종이 top(슬라이드 좌표, 고정)
    const bandStarts = at.map((s0, i) => (i === 0 ? 0 : s0 - BAND_LEAD));         // 띠는 글자보다 조금 먼저 그 줄로 간다
    const rowMid = k => top + FM.padT + (k + 0.5) * FM.rh;
    const camStarts = [...bandStarts, back];
    const camCy = [...rows.map(k => 540 + follow * (rowMid(k) - 540)), 540];
    const camLz = [...rows.map(() => Math.log(zEnd + lean)), Math.log(zEnd)];
    const camAt = t => ({ cy: stepVal(t, camStarts, camCy, CAM_MOVE), z: Math.exp(stepVal(t, camStarts, camLz, CAM_MOVE)) });
    return DECK.slide({
      id: def.id, bg: 'paper', holds: [], dur: def.dur, notes: NOTES[def.id],
      camTrack: [[960, 540, zEnd]],
      cameraHook(t) { const c = camAt(t); return { dy: c.cy - 540, dz: PERSP / c.z - PERSP / zEnd }; },
      setup(el) {
        const $ = this.$;
        $.F = makeForm(el);
        $.mk = {};
        // 밑줄은 36px 글자의 기본 두께(4px)로는 노란 띠 위에서 보이지 않아 8px로 긋는다
        for (const [k, li, w] of marks || []) $.mk[k] = U.mark($.F.rows[k].ty.lineEls[li], { word: w, light: true, thick: 8 });
        $.F.rows.forEach(r => r.ty.measure());
        set($.F.sheet, 'transform', `translateY(${top}px)`);
      },
      render(t, x) {
        const $ = this.$, a = x.a, F = $.F, cps = FORM_CPS;
        // 가림 위치를 지금 카메라에 맞춰 화면 기준으로 다시 잡는다
        const m = formMask(x);
        if (F.maskS !== m) { F.maskS = m; F.clip.style.webkitMaskImage = m; F.clip.style.maskImage = m; }
        // 비행 중에도 서식이 보이게: 종이·줄·칸 이름은 x.arrive로 먼저
        show(F.clip, Math.max(smooth(0.05, 0.5, x.arrive), prog(t, 0, 0.3)));
        const step = clamp(bandStarts.filter(s0 => t >= s0).length - 1, 0, rows.length - 1);
        const bandY = stepVal(t, bandStarts, rows.map(k => FM.padT + k * FM.rh + 10), BAND_MOVE);
        set(F.band, 'transform', `translateY(${bandY.toFixed(1)}px)`);
        // 형광 밑줄을 긋는 줄에서는 밑줄이 띠와 구분되도록 띠를 옅게 하고, 띠가 다음 줄로 넘어가면 되돌린다
        let dim = 0;
        rows.forEach((k, i) => {
          if (!$.mk[k]) return;
          const ms = at[i] + F.rows[k].ty.N / cps + 0.1;
          dim = Math.max(dim, prog(t, ms, 0.4) * (1 - prog(t, i + 1 < bandStarts.length ? bandStarts[i + 1] : 1e9, 0.35)));
        });
        // 띠 바탕만 옅게 한다(불투명도 0.95→0.3과 같은 색). 안쪽 빛줄기는 머무는 동안의 움직임이라 거의 그대로 둔다
        show(F.band, prog(t, 0.1, 0.35) * 0.95);
        set(F.band, 'background', `color-mix(in srgb, var(--mark) ${(24 * lerp(1, 0.32, dim)).toFixed(1)}%, transparent)`);
        show(F.sheen, lerp(1, 0.8, dim));
        renderSheen(F.sheen, a, FM.w - 36, 3.6, 340);
        F.rows.forEach(r => {
          const bi = rows.indexOf(r.k), pre = filledBefore.includes(r.k);
          const s0 = bi >= 0 ? at[bi] : null;
          // 글자: 미리 채워진 줄은 다 보이고, 이 슬라이드에서 채우는 줄은 제 시각에 찍힌다. 커서는 띠가 있는 줄에서 찍은 뒤 깜박인다
          if (pre) r.ty.render(99, 0, cps, a, 0);
          else if (s0 != null) r.ty.render(t, s0, cps, a, bi === step ? 2 : 1);
          else r.ty.render(-1, 0, cps, a, 0);
          const filling = pre ? 1 : s0 != null ? prog(t, s0 - 0.1, 0.3) : 0;
          // 점선: 채우기 시작하면 사라지고, 빈칸이면 점선 무늬가 천천히 옆으로 움직인다
          set(r.dash, 'opacity', (1 - filling).toFixed(3));
          set(r.dash, 'strokeDashoffset', (-(a * 9) % 22).toFixed(2));
          set(r.name, 'color', filling > 0.5 ? 'var(--paperInk)' : 'var(--paperInk2)');
          if ($.mk[r.k]) $.mk[r.k].render(t, s0 != null ? s0 + r.ty.N / cps + 0.1 : 0, 0.45);
          // 칸 이름 위 끝이 화면 FORM_VIS.top 위로 올라간 줄은 번호·이름·문장·세로 칸선을 함께 지우고,
          // 아래쪽은 FORM_VIS.bot에서 자른다(카메라가 다가간 동안 가림 띠에 걸친 줄)
          const yy = top + r.top;
          const vTop = clamp((screenY(x, yy + 52) - FORM_VIS.top) / 40);
          const vn = Math.min(vTop, clamp((FORM_VIS.bot - screenY(x, yy + 108)) / 40));
          const vs = Math.min(vTop, clamp((FORM_VIS.bot - screenY(x, yy + 56 + 2 * 58)) / 40));
          show(r.num, vn); show(r.name, vn); show(r.ty.box, vs); show(r.col, vTop);
        });
      },
    });
  }
  // 29: 1~4번 줄. 끝 화면은 0.9배로 물러나 네 줄(글자 y 약 180~900)이 모두 보인다. 4번 줄 글자는 약 2.78초에 다 찍힌다
  formSlide({
    id: 'seven-a', dur: 3.8,
    rows: [0, 1, 2, 3], filledBefore: [], at: [0.3, 0.95, 1.6, 2.25],
    focus: 516, zEnd: 0.9, lean: 0.06, follow: 0.3, back: 2.75,
  });
  // 30: 5~7번 줄. 끝 화면은 1배로 세 줄과 서식 아래 끝이 보인다. 7번 줄 밑줄이 약 2.63초, 카메라가 2.95초에 자리를 잡는다
  formSlide({
    id: 'seven-b', dur: 3.3,
    rows: [4, 5, 6], filledBefore: [0, 1, 2, 3], at: [0.3, 0.95, 1.6],
    marks: [[4, 1, '승인 후에'], [6, 1, '먼저 알려줘']],
    focus: 1370, zEnd: 1, lean: 0.03, follow: 0.12, back: 2.25,
  });

  // ═════════════════════ 31. 일곱 칸을 세 묶음으로 ═════════════════════
  // 묶음 이름은 질문 세 개다. 칸 소속(m)은 FIELDS 번호이고, 36번 일곱 칸 순서(FIELDS 순서)와 따로 움직이지 않는다
  const GROUPS = [
    { name: ['누가 읽나'], m: [1] },                                  // 독자
    { name: ['무엇으로,', '무엇을 빼고'], m: [0, 3] },                // 자료 범위, 제외
    { name: ['언제 끝내고', '어디서 멈추나'], m: [2, 4, 5, 6] },      // 완료 기준, 권한, 막힘, 한도
  ];
  // 상자 묶음(y 330~722)의 세로 가운데를 화면 가운데에 맞춘다. 칸 띠는 y 856(아래 끝 886, 출처 줄과 54px)
  const BOX = { y: 330, w: 470, h: 392, xs: [196, 725, 1254] };
  const STRIP_Y = 856, FLY_Y = 790;
  DECK.slide({
    id: 'three-groups', bg: 'paper', holds: [], dur: 3.3, notes: NOTES['three-groups'],
    setup(el) {
      const $ = this.$;
      $.sv = svgBox(el);
      $.boxes = GROUPS.map((g, b) => {
        const x0 = BOX.xs[b], d = roundRectD(x0, BOX.y, BOX.w, BOX.h, 24);
        const fill = s('path', { d, fill: C.sheet, opacity: 0 }, $.sv);
        const dash = s('path', { d, fill: 'none', stroke: DECK.rgba('paperInk', 0.3), 'stroke-width': 2.5, 'stroke-dasharray': '12 10' }, $.sv);
        const solid = s('path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 2, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, $.sv);
        const names = g.name.map((ln, i) => U.rise(el, ln, { left: x0 + 40 + 'px', top: BOX.y + 36 + i * 64 + 'px', font: 'var(--displayW) 56px/1.12 var(--display)', letterSpacing: '-.03em', color: C.ink, whiteSpace: 'nowrap' }));
        return { x0, fill, dash, solid, names, smp: U.sampler(solid, 160) };
      });
      $.dot = s('circle', { r: 7, fill: DECK.rgba('paperInk', 0.85) }, $.sv);
      // 칸 일곱 개(속한 칸 이름 body 30px)
      $.chips = FIELDS.map(([nm], i) => {
        const d = div(el, nm, { left: '0px', top: '0px', font: '600 30px/1 var(--sans)', color: C.ink2, padding: '12px 24px 13px', borderRadius: '12px',
          background: C.chip, border: '2px solid var(--paperLine)', transformOrigin: '50% 50%' }, 'a nw');
        return { el: d, w: d.offsetWidth, hh: d.offsetHeight, i };
      });
      // 묶음마다 남은 칸 줄(아래 띠)의 배치
      const stripX = list => { const gap = 18, W = list.reduce((s0, i) => s0 + $.chips[i].w, 0) + gap * (list.length - 1); let x0 = 960 - W / 2; const o = {}; list.forEach(i => { o[i] = x0; x0 += $.chips[i].w + gap; }); return o; };
      let left = [0, 1, 2, 3, 4, 5, 6];
      $.strips = [stripX(left)];
      GROUPS.forEach(g => { left = left.filter(i => !g.m.includes(i)); $.strips.push(stripX(left)); });
      $.home = {};
      // 칸 자리: 묶음 이름 마지막 줄 아래 32px에서 시작한다(이름이 한 줄이면 위로 64px 올라간다)
      GROUPS.forEach((g, b) => { let cx = 0; const y0 = BOX.y + 36 + g.name.length * 64 + 32; g.m.forEach((i, j) => { const col = j % 2; if (col === 0) cx = BOX.xs[b] + 40; $.home[i] = { b, j, x: cx, y: y0 + Math.floor(j / 2) * 70 }; cx += $.chips[i].w + 14; }); });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      // 묶음이 클릭 없이 0.75초 간격으로 이어서 채워진다. 마지막 칸(셋째 묶음 넷째)이 약 2.9초에 자리를 잡는다
      const starts = [0, 0.75, 1.5];
      const early = smooth(0.1, 0.6, x.arrive);
      // 칸 일곱 개: 비행 중에는 가운데 한 줄로 크게, 처음 0.6초 동안 작아지며 아래로 내려간다
      const sp = prog(t, 0.0, 0.6, ease.inOutCubic);
      $.chips.forEach(c => {
        const H0 = $.home[c.i], st = starts[H0.b];
        // 띠 위치: 묶음이 채워질 때마다 남은 칸끼리 모인다
        let sx = $.strips[0][c.i];
        for (let b = 0; b < 3; b++) if ($.strips[b + 1][c.i] != null) sx = lerp(sx, $.strips[b + 1][c.i], prog(t, starts[b] + 0.75, 0.5, ease.inOutCubic));
        const s0x = lerp(960 + (sx + c.w / 2 - 960) * 1.22 - c.w / 2, sx, sp), s0y = lerp(FLY_Y - c.hh / 2, STRIP_Y - c.hh / 2, sp), sc0 = lerp(1.22, 1, sp);
        const fl = prog(t, st + 0.55 + H0.j * 0.08, 0.6, ease.snap);
        const px = lerp(s0x, H0.x, fl), py = lerp(s0y, H0.y, fl) - Math.sin(Math.PI * fl) * 90;
        const pop = fl >= 1 ? 1 : lerp(sc0, 1, fl) * (1 + 0.08 * Math.sin(Math.PI * fl));
        set(c.el, 'transform', `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) scale(${pop.toFixed(4)})`);
        show(c.el, Math.max(early, prog(t, 0, 0.2)));
        set(c.el, 'color', fl > 0.5 ? 'var(--paperInk)' : 'var(--paperInk2)');
      });
      $.boxes.forEach((B, b) => {
        const st = starts[b];
        show(B.dash, Math.max(early, prog(t, 0, 0.3)) * 0.9 * (1 - prog(t, st + 0.5, 0.3)));
        set(B.dash, 'strokeDashoffset', (-(a * 9) % 22).toFixed(2));
        drawP(B.solid, prog(t, st + 0.1, 0.65, ease.inOutCubic)); show(B.solid, t >= st + 0.1 ? 1 : 0);
        show(B.fill, prog(t, st + 0.3, 0.5) * 0.9);
        B.names.forEach((R, i) => R.render(t, st + 0.25 + i * 0.12, { each: 0.035 }));
      });
      // 마지막으로 채운 묶음 테두리를 따라 점 하나가 돈다
      const cur = clamp(starts.filter(s0 => t >= s0).length - 1, 0, 2), Bc = $.boxes[cur];
      const q = Bc.smp.at((Math.max(0, a) * 0.07) % 1);
      $.dot.setAttribute('cx', q[0].toFixed(1)); $.dot.setAttribute('cy', q[1].toFixed(1));
      show($.dot, prog(t, starts[cur] + 0.8, 0.4));
    },
  });

  // ═════════════════════ 32. 예시: 지원사업 공고 정리 요청서 ═════════════════════
  const HONAM = [
    ['자료 범위', '각 기관 누리집 공고문 원문만'],
    ['독자', '처음 지원하는 기업 담당자'],
    ['완료 기준', '공고마다 대상·기간·금액·문의처'],
    ['제외', '마감된 공고'],
    ['권한', '표 저장까지'],
    ['막힘', '열리지 않는 공고는 주소와 함께 표시'],
    ['한도', '공고 30건'],
  ];
  const HF = { x: 240, y: 290, w: 1440, padT: 22, rh: 86, colX: 340, valX: 380 };
  DECK.slide({
    id: 'request-example', bg: 'paper', holds: [], dur: 3.35, notes: NOTES['request-example'],
    setup(el) {
      const $ = this.$;
      $.req = div(el, null, { left: '0px', top: '0px', width: '1920px', height: '1080px' });
      $.pill = div($.req, '요청', { left: '240px', top: '190px', font: '800 32px/1 var(--sans)', color: C.ink, padding: '10px 22px 11px', borderRadius: '999px', border: '2.5px solid var(--paperInk)' }, 'a nw');
      $.rq = typer($.req, ['올해 ICT 지원사업 공고를 표로 정리해줘'], { left: '384px', top: '178px', font: '700 48px/68px var(--serif)', color: C.ink, letterSpacing: '-.01em' }, { cw: 4 });
      $.sheet = paperSheet(el, { left: HF.x + 'px', top: HF.y + 'px', width: HF.w + 'px', height: HF.padT * 2 + 7 * HF.rh + 'px' });
      $.band = div($.sheet, null, { left: '14px', top: '0px', width: HF.w - 28 + 'px', height: '10px', borderRadius: '14px', background: C.band, opacity: 0 });
      $.sheen = sheen($.band, 320);
      const sv = svgBox($.sheet, HF.w, HF.padT * 2 + 7 * HF.rh);
      $.rows = HONAM.map(([nm, val], k) => {
        const top = HF.padT + k * HF.rh;
        if (k > 0) s('path', { d: `M26 ${top} H${HF.w - 26}`, stroke: DECK.rgba('paperInk', 0.15), 'stroke-width': 2 }, sv);
        s('path', { d: `M${HF.colX} ${top + 16} V${top + HF.rh - 16}`, stroke: DECK.rgba('paperInk', 0.14), 'stroke-width': 2 }, sv);
        const dash = s('rect', { x: HF.valX - 14, y: top + 12, width: HF.w - HF.valX - 26, height: HF.rh - 24, rx: 12, fill: 'none', stroke: DECK.rgba('paperInk', 0.32), 'stroke-width': 2.2, 'stroke-dasharray': '10 9' }, sv);
        const num = div($.sheet, String(k + 1), { left: '36px', top: top + 29 + 'px', font: '700 28px/1 var(--mono)', color: C.ink2 }, 'a nw');
        const name = div($.sheet, nm, { left: '86px', top: top + 20 + 'px', font: 'var(--displayW) 38px/1.2 var(--display)', letterSpacing: '-.02em', color: C.ink2 }, 'a nw');
        const ty = typer($.sheet, [val], { left: HF.valX + 'px', top: top + 17 + 'px', font: '500 36px/52px var(--serif)', color: C.ink });
        return { k, top, dash, num, name, ty };
      });
      $.rows.forEach(r => r.ty.measure());
      $.rq.measure();
    },
    render(t, x) {
      // 요청 한 줄(0.2~1.0초) → 앞 네 칸(S1) → 뒤 세 칸(S2)이 클릭 없이 이어서 채워진다. 마지막 칸이 약 2.95초에 다 찍힌다
      const $ = this.$, a = x.a, S1 = 0.85, S2 = 2.1;
      const early = smooth(0.05, 0.5, x.arrive);
      show($.sheet, Math.max(early, prog(t, 0, 0.3)));
      show($.pill, Math.max(early, prog(t, 0, 0.3)));
      const rqT = 0.2;
      $.rq.render(t, rqT, 34, a, t < S1 ? 2 : 0);
      // 칸 채우기: S1부터 앞 네 칸, S2부터 뒤 세 칸
      const at = k => (k < 4 ? S1 + 0.15 + k * 0.28 : S2 + 0.15 + (k - 4) * 0.28);
      const last = t >= S2 ? 6 : t >= S1 ? 3 : -1;
      $.rows.forEach(r => {
        const s0 = at(r.k);
        r.ty.render(t, s0, 46, a, r.k === last ? 2 : 1);
        const filling = prog(t, s0 - 0.1, 0.25);
        set(r.dash, 'opacity', (1 - filling).toFixed(3));
        set(r.dash, 'strokeDashoffset', (-(a * 9) % 19).toFixed(2));
        set(r.name, 'color', filling > 0.5 ? 'var(--paperInk)' : 'var(--paperInk2)');
      });
      // 지금 채우는 묶음을 감싸는 띠(앞 네 칸 → 뒤 세 칸)
      const b1 = prog(t, S1, 0.5), b2 = prog(t, S2, 0.6);
      const by = HF.padT + 4 + lerp(0, 4 * HF.rh, b2), bh = lerp(4 * HF.rh - 8, 3 * HF.rh - 8, b2);
      css($.band, { transform: `translateY(${by.toFixed(1)}px)`, height: bh.toFixed(1) + 'px' });
      show($.band, b1 * 0.9);
      renderSheen($.sheen, a, HF.w - 28, 3.4, 320);
    },
  });

  // ═════════════════════ 33. 완료 기준을 먼저 적는다 ═════════════════════
  // 전환은 평면 밀기다. zoomTarget은 ?transitions=3d로 열 때만 쓰인다
  DECK.slide({
    id: 'done-first', bg: 'paper', holds: [], dur: 2.6, notes: NOTES['done-first'],
    zoomTarget: { x: 1180, y: 600 },
    setup(el) {
      const $ = this.$;
      $.l1 = U.rise(el, '요청서 일곱 칸 중 하나만 먼저 쓴다면', { left: '300px', top: '372px', font: '500 76px/1.25 var(--serif)', letterSpacing: '-.015em', color: C.ink, whiteSpace: 'nowrap' });
      $.l2 = U.rise(el, '완료 기준입니다.', { left: '0px', top: '0px', font: '700 76px/1.25 var(--serif)', letterSpacing: '-.015em', color: C.ink, whiteSpace: 'nowrap' });
      const wb = riseBox($.l2, 0, 3), lh = $.l2.el.offsetHeight;
      const l2x = Math.round(1180 - (wb.x0 + wb.x1) / 2), l2y = Math.round(600 - lh / 2 - 4);
      css($.l2.el, { left: l2x + 'px', top: l2y + 'px' });
      $.mk = U.mark($.l2, { word: '완료 기준', light: true });
      // 셋째 줄: 「완료 기준」 칸이 무엇인지(「완료 기준입니다.」 왼쪽 끝에 맞춘 설명)
      $.l3 = div(el, '무엇이 채워지면 일이 끝난 것인지 정하는 칸', { left: l2x + wb.x0 + 'px', top: l2y + lh + 26 + 'px', font: '500 36px/1.3 var(--sans)', letterSpacing: '-.01em', color: C.ink2 }, 'a nw');
      // 일곱 칸 그림: 셋째 칸만 노랗게 채워진다
      $.cells = [0, 1, 2, 3, 4, 5, 6].map(i => div(el, null, { left: 300 + i * 66 + 'px', top: '574px', width: '52px', height: '52px', borderRadius: '9px',
        border: `2.5px solid ${i === 2 ? 'var(--paperInk)' : DECK.rgba('paperInk', 0.35)}`, background: 'transparent' }));
      $.fill = div(el, null, { left: 300 + 2 * 66 + 3 + 'px', top: '577px', width: '46px', height: '46px', borderRadius: '6px', background: C.mark, transformOrigin: '0 50%' });
      // 셋째 칸(x 432~484) 바깥 4px에서 시작하는 테두리. 1.2배까지 커져도 좌우 끝이 422~494라 옆 칸(~418, 498~)에 닿지 않는다
      $.rip = ripple(el, 300 + 2 * 66 - 4, 570, 60, 60, 13);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const early = smooth(0.1, 0.6, x.arrive);
      $.l1.render(t, 0.05, { each: 0.03 });
      $.cells.forEach((c, i) => { const p = Math.max(early, prog(t, 0.3 + i * 0.05, 0.45, ease.pop)); show(c, Math.min(1, p * 1.5)); set(c, 'transform', `scale(${lerp(0.5, 1, p).toFixed(4)})`); });
      $.l2.render(t, 0.75, { each: 0.04 });
      $.mk.render(t, 1.45, 0.5);
      set($.fill, 'transform', `scaleX(${prog(t, 1.45, 0.45, ease.outCubic).toFixed(4)})`);
      $.cells.forEach((c, i) => { if (i !== 2) set(c, 'opacity', (1 - 0.5 * prog(t, 1.5, 0.4)).toFixed(3)); });
      // 셋째 줄: 밑줄이 그어지는 동안 왼쪽부터 열리며 올라온다(약 2.1초에 자리)
      const p3 = prog(t, 1.6, 0.5);
      U.wipe($.l3, p3); set($.l3, 'transform', `translateY(${((1 - p3) * 18).toFixed(1)}px)`);
      // 머무는 동안: 노랗게 채운 셋째 칸 둘레로 테두리가 퍼져 나간다(36번과 같은 방식)
      renderRipple($.rip, a, prog(t, 1.9, 0.4), 2, 0.2);
    },
  });

  // ═════════════════════ 34. 완료 기준을 파일로 적어 둔다(기능 목록 사례) ═════════════════════
  // 머묾 카메라 dolly-in(끝에 약 1.064배)에서도 글자 위아래가 화면 175~905 안에 들도록 글자 띠를 슬라이드 y 200~872, x 240~1690에 둔다.
  // 위부터 맥락 줄(28px) · 제목(58px) · 설명(34px) · 코드 창(passes 풀이 칩 + 기능 일곱 줄 + 「… 200여 개」) · 규칙 두 칸 · 결론 줄(serif 44px).
  // 오른쪽 열은 테스트를 통과한 기능 수(창과 같은 높이 가운데)
  const N_FEAT = 7, FLIP = 6, PX = 240, LH = 36;
  const PWIN = { y: 366, w: 930, codeX: 36, codeY: 64 };
  PWIN.h = PWIN.codeY + (N_FEAT + 1) * LH + 14;                 // 366 → 732
  const PY = { kick: 196, title: 232, desc: 312, rule: 748, end: 826 };
  // 묶음 시각: 맥락 줄·제목(0.05~1.0) → 설명(0.45) → 창과 false 목록(0.55~1.25)·passes 풀이(0.95) → S1부터 true로 바뀜·세기 → S2 규칙 → S3 결론
  const PS = { desc: 0.45, list: 0.55, chip: 0.95, S1: 1.25, S2: 2.05, S3: 2.4 };
  DECK.slide({
    id: 'passes', bg: 'paper', holds: [], dur: 3.75, notes: NOTES.passes,
    chrome: { source: SRC_ANT },
    setup(el) {
      const $ = this.$;
      // 1. 맥락 줄 2. 제목 3. 설명
      $.kick = div(el, '사례 · Anthropic, 2025년 11월 · 여러 세션에 걸쳐 앱 하나를 만드는 긴 작업', { left: PX + 'px', top: PY.kick + 'px', font: '600 28px/34px var(--sans)', letterSpacing: '-.005em', color: C.ink2 }, 'a nw');
      $.title = U.rise(el, '완료 기준을 파일로 적어 둔다', { left: PX - 2 + 'px', top: PY.title + 'px', font: '800 58px/70px var(--sans)', letterSpacing: '-.025em', color: C.ink, whiteSpace: 'nowrap' });
      $.desc = div(el, `기능 목록 파일 — 만들 기능 200여 개를 모두 <span style="font:600 32px var(--mono);color:${C.redInk}">"passes": false</span>(미통과)로 시작`,
        { left: PX + 'px', top: PY.desc + 'px', font: '500 34px/42px var(--sans)', letterSpacing: '-.01em', color: C.ink }, 'a nw');
      // 코드 창
      $.win = div(el, null, { left: PX + 'px', top: PWIN.y + 'px', width: PWIN.w + 'px', height: PWIN.h + 'px', borderRadius: '18px', background: 'var(--bg1)',
        boxShadow: '0 28px 60px rgba(27,29,26,.28), 0 4px 10px rgba(27,29,26,.18)', overflow: 'hidden' });
      $.code = div($.win, null, { left: PWIN.codeX + 'px', top: PWIN.codeY + 'px', font: `500 28px/${LH}px var(--mono)`, color: 'var(--ink)' });
      $.rowsBg = []; $.vals = []; $.checks = []; $.lineEls = [];
      const P = c => `<span style="color:var(--mut)">${c}</span>`;
      const lines = [];
      for (let i = 1; i <= N_FEAT; i++) lines.push(i);
      lines.push('…');
      lines.forEach((ln, li) => {
        const d = h('div', '', $.code); css(d, { position: 'relative', whiteSpace: 'nowrap', height: LH + 'px' });
        const ly = PWIN.codeY + li * LH;
        if (typeof ln === 'number') {
          const bg = div($.win, null, { left: '0px', top: ly + 'px', width: PWIN.w + 'px', height: LH + 'px', background: 'var(--ok)', opacity: 0 });
          $.win.insertBefore(bg, $.code);
          d.innerHTML = `${P('{')} "id": <span style="color:var(--accent2)">${ln}</span>${P(',')} <span class="bar" style="display:inline-block;vertical-align:middle;height:12px;border-radius:6px;width:200px;background:color-mix(in srgb, var(--mut) 42%, transparent);margin:0 14px 4px 4px"></span><span class="k">"passes":</span> <span class="v" style="display:inline-block;width:5ch;color:var(--bad)">false</span>${P(' },')}`;
          const ck = s('svg', { width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none' }, $.win);
          css(ck, { position: 'absolute', left: '866px', top: ly + (LH - 30) / 2 + 'px' });
          const cp = s('path', { d: U.ICON.check, stroke: 'var(--ok)', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, ck);
          $.rowsBg.push(bg); $.vals.push(d.querySelector('.v')); $.checks.push(cp);
        } else d.innerHTML = `<span style="color:var(--mut)">… 200여 개</span>`;
        $.lineEls.push(d);
      });
      $.work = div($.win, null, { left: '10px', top: '0px', width: PWIN.w - 20 + 'px', height: LH + 'px', borderRadius: '8px', border: '2px solid var(--accent2)', opacity: 0 });
      // 4. passes 열(키와 값)을 감싸는 노란 점선 + 그 위 풀이 칩
      const k0 = $.code.querySelector('.k'), v0 = $.vals[0];
      const colX = PWIN.codeX + k0.offsetLeft - 12, colW = v0.offsetLeft + v0.offsetWidth - k0.offsetLeft + 24;
      $.colBox = div($.win, null, { left: colX + 'px', top: PWIN.codeY - 6 + 'px', width: colW + 'px', height: N_FEAT * LH + 12 + 'px', borderRadius: '10px', border: '3px dashed var(--accent)', opacity: 0 });
      $.chip = div($.win, `<span style="font:700 28px var(--mono)">passes</span> = 테스트를 통과했는가`, { left: '0px', top: '12px', height: '42px', padding: '0 16px', lineHeight: '42px',
        borderRadius: '9px', background: 'var(--accent)', color: 'var(--paperInk)', font: '700 28px/42px var(--sans)', letterSpacing: '-.01em', whiteSpace: 'nowrap', transformOrigin: '50% 100%', opacity: 0 });
      css($.chip, { left: Math.round(colX + colW / 2 - $.chip.offsetWidth / 2) + 'px' });
      $.chipX = colX + colW / 2;
      // 5. 테스트를 통과한 기능 수(창 오른쪽, 창 높이 가운데)
      const CX = 1250;
      $.cLab = div(el, '테스트를 통과한 기능', { left: CX + 6 + 'px', top: '392px', font: '700 30px/1 var(--sans)', letterSpacing: '-.01em', color: C.ok }, 'a nw');
      $.cNum = div(el, '0', { left: CX + 'px', top: '440px', font: '400 196px/1 var(--num)', color: C.ink, transformOrigin: '0 100%' }, 'a nw tnum');
      $.cOf = div(el, '/ 200여 개', { left: CX + 8 + 'px', top: '652px', font: '600 40px/1.2 var(--sans)', color: C.ink2 }, 'a nw');
      // 6. 규칙 두 칸
      const rule = (ic, html, x0) => {
        const d = div(el, null, { left: x0 + 'px', top: PY.rule + 'px', height: '62px', padding: '0 26px 0 20px', display: 'flex', alignItems: 'center', gap: '14px',
          borderRadius: '14px', border: '2.5px solid var(--paperInk)', background: C.sheet, font: '600 34px/1 var(--sans)', letterSpacing: '-.01em', color: C.ink, whiteSpace: 'nowrap', opacity: 0 });
        U.icon(d, ic, 36, C.redInk, 2.2);
        h('span', '', d, html);
        return d;
      };
      $.r1 = rule('lock', '테스트를 통과한 뒤에만 <span style="font:700 32px var(--mono)">true</span>로 바꾼다', PX);
      $.r2 = rule('x', '테스트를 지우거나 고치지 않는다', PX + $.r1.offsetWidth + 22);
      // 7. 결론 줄(「전부 true」 형광 밑줄)
      $.end = U.rise(el, '전부 true가 되기 전에는 끝났다고 할 수 없다', { left: PX + 'px', top: PY.end + 'px', font: '600 44px/52px var(--serif)', letterSpacing: '-.015em', color: C.ink, whiteSpace: 'nowrap' });
      $.mkEnd = U.mark($.end, { word: '전부 true', light: true });
    },
    render(t, x) {
      const $ = this.$, a = x.a, { S1, S2, S3 } = PS;
      const early = smooth(0.2, 0.7, x.arrive);
      // 맥락 줄·제목 → 설명
      fadeUp($.kick, t, 0.05, 0.45, 20);
      $.title.render(t, 0.12, { each: 0.03, dur: 0.5 });
      const pd = prog(t, PS.desc, 0.5);
      U.wipe($.desc, pd); set($.desc, 'transform', `translateX(${((1 - pd) * -24).toFixed(1)}px)`);
      // 창(비행 중에도 윤곽이 보임)과 false 목록
      show($.win, Math.max(early, prog(t, 0, 0.3)));
      set($.win, 'transform', `translateY(${((1 - Math.max(early, prog(t, 0, 0.5))) * 30).toFixed(1)}px)`);
      $.lineEls.forEach((d, i) => { const p = prog(t, PS.list + i * 0.05, 0.35); show(d, p); set(d, 'transform', `translateX(${((1 - p) * -16).toFixed(1)}px)`); });
      // passes 풀이 칩과 열 점선(머무는 동안 점선이 맥동)
      const pc = prog(t, PS.chip, 0.45, ease.pop);
      show($.chip, prog(t, PS.chip, 0.2, ease.linear)); set($.chip, 'transform', `translateY(${((1 - pc) * 14).toFixed(1)}px) scale(${lerp(0.82, 1, pc).toFixed(4)})`);
      show($.colBox, prog(t, PS.chip + 0.1, 0.35) * (0.75 + 0.25 * Math.sin(a * 2.4)));
      // 위에서부터 false → true, 오른쪽 수가 함께 센다
      let n = 0;
      $.vals.forEach((v, i) => {
        const tf = S1 + 0.1 + i * 0.15, on = i < FLIP && t >= tf;
        if (on) n++;
        const sc = i < FLIP ? prog(t, tf - 0.12, 0.12, ease.linear) : 0;
        const txt = on ? 'true' : sc > 0 ? DECK.scramble('true ', sc, t, i + 3) : 'false';
        if (v.textContent !== txt) v.textContent = txt;
        set(v, 'color', on ? 'var(--ok)' : 'var(--bad)');
        const fp = i < FLIP ? prog(t, tf, 0.5, ease.outCubic) : 0;
        set($.rowsBg[i], 'opacity', (fp > 0 ? 0.07 + 0.16 * (1 - fp) : 0).toFixed(3));
        drawP($.checks[i], i < FLIP ? prog(t, tf, 0.35, ease.outCubic) : 0);
      });
      if ($.cNum.textContent !== String(n)) $.cNum.textContent = String(n);
      const lastF = n > 0 ? S1 + 0.1 + (n - 1) * 0.15 : -9;
      set($.cNum, 'transform', `scale(${(1 + 0.06 * Math.exp(-(t - lastF) * 8) * (t >= lastF ? 1 : 0)).toFixed(4)})`);
      fadeUp($.cLab, t, 0.9, 0.4, 16); show($.cNum, prog(t, 0.9, 0.4)); fadeUp($.cOf, t, 1.0, 0.4, 16);
      // 에이전트가 지금 맡은 줄(다음 false 줄)이 맥동한다
      const wi = Math.min(n, N_FEAT - 1);
      set($.work, 'transform', `translateY(${(PWIN.codeY + wi * LH).toFixed(1)}px)`);
      show($.work, prog(t, 1.1, 0.3) * (0.45 + 0.4 * Math.sin(a * 3.2)));
      // 규칙 두 칸 + 회색 막대를 흐리게(값 칸이 눈에 띄게)
      [$.r1, $.r2].forEach((r, i) => { const p = prog(t, S2 + 0.05 + i * 0.12, 0.5, ease.pop); show(r, prog(t, S2 + 0.05 + i * 0.12, 0.2, ease.linear)); set(r, 'transform', `translateY(${((1 - p) * 36).toFixed(1)}px)`); });
      const dimP = prog(t, S2 + 0.2, 0.4);
      $.code.querySelectorAll('.bar').forEach(b => set(b, 'opacity', (1 - 0.5 * dimP).toFixed(3)));
      // 결론 줄과 밑줄(약 3.4초에 자리)
      $.end.render(t, S3, { each: 0.015, dur: 0.45 });
      $.mkEnd.render(t, S3 + 0.55, 0.45);
    },
  });

  // ═════════════════════ 35. 긴 작업의 실패 네 가지와 막는 파일 ═════════════════════
  const FAILS = [
    ['너무 일찍 끝났다고 선언', `기능 목록 파일<span style="color:var(--paperInk2)">(앞 화면)</span>`],
    ['버그를 남기고 기록도 안 남김', 'git 변경 기록 + 진행 기록 파일'],
    ['확인 없이 완료로 표시', '테스트를 통과한 뒤에만 값 변경'],
    ['앱 실행 방법을 몰라 시간 소모', '실행 스크립트 init.sh를 미리 둠'],
  ];
  // 끝 화면(배율 1, 카메라 가운데)에서 위부터 맥락 줄 · 제목 · 표 머리 · 네 줄 · 결론 줄. 글자 띠는 슬라이드 y 186~822, x 300~1600
  const FROW = { y: [422, 516, 610, 704], rh: 80, hy: 338, ruleY: 372, dotL: 300, txtL: 332, arr0: 878, arr1: 968, dotR: 1002, txtR: 1034, x0: 270, w: 1440 };
  const FY = { kick: 182, title: 222, end: 772 };
  // 줄이 클릭 없이 0.42초 간격으로 나온다(줄 i의 왼쪽 글자는 FSTART[i] + 0.1, 오른쪽은 + 0.5, 넷째 줄이 약 2.7초에 자리).
  // 카메라는 1.12배로 다가가 줄을 따라 내려가고(FBACK부터) 1배 끝 자리로 물러나며, 그동안 결론 줄이 나오고 노란 띠가 오른쪽 열(막는 파일·규칙)로 옮겨 간다
  const FSTART = [0.5, 0.92, 1.34, 1.76], FBACK = 2.2, FEND = 2.5, FCOL = 2.8;
  const failCam = t => {
    const at = [0, ...FSTART, FBACK];
    return { cy: stepVal(t, at, [415, 425, 460, 495, 525, 540]), z: Math.exp(stepVal(t, at, [1.12, 1.12, 1.12, 1.12, 1.12, 1].map(Math.log))) };
  };
  DECK.slide({
    id: 'four-failures', bg: 'paper', holds: [], dur: 3.75, notes: NOTES['four-failures'],
    // 끝 화면 자리(전체가 들어오는 1배). 줄을 따라가는 이동은 cameraHook이 t로 더한다
    camTrack: [[960, 540, 1]],
    cameraHook(t) { const c = failCam(t); return { dy: c.cy - 540, dz: PERSP / c.z - PERSP }; },
    chrome: { source: SRC_ANT },
    setup(el) {
      const $ = this.$;
      // 1. 맥락 줄 2. 제목
      $.kick = div(el, '같은 Anthropic 글 · 긴 작업에서 에이전트가 실패하는 네 가지', { left: FROW.dotL - 10 + 'px', top: FY.kick + 'px', font: '600 28px/34px var(--sans)', letterSpacing: '-.005em', color: C.ink2 }, 'a nw');
      $.title = U.rise(el, '실패마다 막는 파일을 둔다', { left: FROW.dotL - 12 + 'px', top: FY.title + 'px', font: '800 58px/70px var(--sans)', letterSpacing: '-.025em', color: C.ink, whiteSpace: 'nowrap' });
      $.sv = svgBox(el);
      // 줄 자리(비행 중에도 보이는 옅은 띠)
      $.slots = FROW.y.map(y => div(el, null, { left: FROW.x0 + 'px', top: y - FROW.rh / 2 + 'px', width: FROW.w + 'px', height: FROW.rh + 'px', borderRadius: '16px', border: '2px dashed var(--paperLine)' }));
      // 노란 띠: 줄을 따라 내려간 뒤 끝 화면에서 오른쪽 열 전체(머리 + 네 줄)를 감싼다
      $.band = div(el, null, { left: FROW.x0 + 'px', top: '0px', width: FROW.w + 'px', height: FROW.rh + 'px', borderRadius: '16px', background: C.band, opacity: 0 });
      $.sheen = sheen($.band, 300);
      // 3. 표 머리(실패 · 막는 파일·규칙)와 그 아래 선
      $.hDots = [s('circle', { cx: FROW.dotL, cy: FROW.hy, r: 9, fill: 'var(--bad)' }, $.sv), s('circle', { cx: FROW.dotR, cy: FROW.hy, r: 9, fill: 'var(--okInk)' }, $.sv)];
      $.hL = div(el, '실패', { left: FROW.txtL + 'px', top: FROW.hy - 18 + 'px', font: '700 30px/36px var(--sans)', letterSpacing: '-.01em', color: C.ink2 }, 'a nw');
      $.hR = div(el, '막는 파일·규칙', { left: FROW.txtR + 'px', top: FROW.hy - 18 + 'px', font: '700 30px/36px var(--sans)', letterSpacing: '-.01em', color: C.ink2 }, 'a nw');
      $.hLine = s('path', { d: `M${FROW.x0} ${FROW.ruleY} H${FROW.x0 + FROW.w}`, stroke: DECK.rgba('paperInk', 0.3), 'stroke-width': 2, fill: 'none', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, $.sv);
      // 4. 네 줄
      $.rows = FAILS.map(([f, r], i) => {
        const y = FROW.y[i];
        const dl = s('circle', { cx: FROW.dotL, cy: y, r: 11, fill: 'var(--bad)' }, $.sv);
        const dr = s('circle', { cx: FROW.dotR, cy: y, r: 11, fill: 'var(--okInk)' }, $.sv);
        const ln = s('path', { d: `M${FROW.arr0} ${y} H${FROW.arr1 - 4}`, stroke: DECK.rgba('paperInk', 0.6), 'stroke-width': 3, fill: 'none', pathLength: 1, 'stroke-dasharray': '1 1' }, $.sv);
        const hd = s('path', { d: `M${FROW.arr1 - 16} ${y - 11} L${FROW.arr1} ${y} L${FROW.arr1 - 16} ${y + 11}`, stroke: DECK.rgba('paperInk', 0.6), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $.sv);
        const pk = s('circle', { r: 6, fill: DECK.rgba('paperInk', 0.8) }, $.sv);
        const lt = div(el, f, { left: FROW.txtL + 'px', top: y - 26 + 'px', font: '600 40px/52px var(--sans)', letterSpacing: '-.015em', color: C.ink }, 'a nw');
        const rt = div(el, r, { left: FROW.txtR + 'px', top: y - 26 + 'px', font: '600 40px/52px var(--sans)', letterSpacing: '-.015em', color: C.ink }, 'a nw');
        return { y, dl, dr, ln, hd, pk, lt, rt };
      });
      // 5. 결론 줄
      $.end = U.rise(el, '네 가지 대응 모두 파일과, 그 파일을 다루는 규칙이다', { left: FROW.dotL - 4 + 'px', top: FY.end + 'px', font: '600 42px/52px var(--serif)', letterSpacing: '-.015em', color: C.ink, whiteSpace: 'nowrap' }, { word: true });
      // 오른쪽 열 띠 자리(표 머리 위 끝 ~ 넷째 줄 아래 끝)
      $.colBand = { x: FROW.dotR - 22, y: FROW.hy - 32, w: FROW.x0 + FROW.w - (FROW.dotR - 22), h: FROW.y[3] + FROW.rh / 2 - (FROW.hy - 32) };
    },
    render(t, x) {
      const $ = this.$, a = x.a, starts = FSTART;
      const early = smooth(0.1, 0.6, x.arrive);
      const step = clamp(starts.filter(s0 => t >= s0).length - 1, 0, 3);
      // 맥락 줄·제목·표 머리(점과 선은 비행 중에도 보임)
      fadeUp($.kick, t, 0.05, 0.45, 20);
      $.title.render(t, 0.12, { each: 0.03, dur: 0.5 });
      const hp = prog(t, 0.35, 0.45);
      $.hDots.forEach(d => d.setAttribute('r', (9 * Math.max(early, prog(t, 0.3, 0.45, ease.pop))).toFixed(2)));
      show($.hL, hp); set($.hL, 'transform', `translateX(${((1 - hp) * -24).toFixed(1)}px)`);
      show($.hR, hp); set($.hR, 'transform', `translateX(${((1 - hp) * 24).toFixed(1)}px)`);
      drawP($.hLine, Math.max(early, prog(t, 0.3, 0.6, ease.inOutCubic)));
      // 빈 줄 자리: 그 줄이 나오면 지운다. 화면 y 930 아래에 걸리면 지운다(출처 줄과 겹치지 않게)
      $.slots.forEach((sl, i) => show(sl, Math.max(early, prog(t, 0, 0.3)) * (1 - prog(t, starts[i] + 0.1, 0.3)) * inView(x, FROW.y[i] - 40, FROW.y[i] + 40, 120, 930)));
      // 노란 띠: 지금 줄 → 끝 화면에서 오른쪽 열
      const by = stepVal(t, starts, FROW.y.map(y => y - FROW.rh / 2), 0.5);
      const cp = prog(t, FCOL, 0.6, ease.inOutCubic), B = $.colBand;
      css($.band, { left: lerp(FROW.x0, B.x, cp).toFixed(1) + 'px', width: lerp(FROW.w, B.w, cp).toFixed(1) + 'px', height: lerp(FROW.rh, B.h, cp).toFixed(1) + 'px',
        transform: `translateY(${lerp(by, B.y, cp).toFixed(1)}px)` });
      show($.band, prog(t, starts[0], 0.4) * 0.9);
      renderSheen($.sheen, a, lerp(FROW.w, B.w, cp), 3.2, 300);
      $.rows.forEach((r, i) => {
        const s0 = starts[i] + 0.1;
        const pl = prog(t, s0, 0.45), pd = prog(t, s0, 0.45, ease.pop);
        const v = inView(x, r.y - 30, r.y + 30, 120, 1000);
        show(r.lt, pl * v); set(r.lt, 'transform', `translateX(${((1 - pl) * -40).toFixed(1)}px)`);
        r.dl.setAttribute('r', (11 * pd).toFixed(2));
        drawP(r.ln, prog(t, s0 + 0.2, 0.3, ease.inOutCubic)); show(r.ln, t >= s0 + 0.2 ? 1 : 0);
        show(r.hd, prog(t, s0 + 0.42, 0.15, ease.linear));
        const pr = prog(t, s0 + 0.4, 0.45);
        show(r.rt, pr * v); set(r.rt, 'transform', `translateX(${((1 - pr) * 40).toFixed(1)}px)`);
        r.dr.setAttribute('r', (11 * prog(t, s0 + 0.4, 0.45, ease.pop)).toFixed(2));
        // 화살표 위로 점이 실패 → 대응 쪽으로 움직인다: 나오는 동안은 지금 줄만, 끝 화면에서는 네 줄 모두(줄마다 어긋나게)
        const u = (Math.max(0, a) * 0.6 + (t >= FCOL ? i * 0.25 : 0)) % 1;
        r.pk.setAttribute('cx', lerp(FROW.arr0, FROW.arr1 - 14, u).toFixed(1)); r.pk.setAttribute('cy', String(r.y));
        const live = t >= FCOL ? prog(t, FCOL, 0.4) : i === step ? 1 : 0;
        show(r.pk, pr >= 1 ? live * Math.sin(u * Math.PI) : 0);
      });
      // 결론 줄(약 3.35초에 자리)
      $.end.render(t, FEND, { each: 0.05, dur: 0.45 });
    },
  });

  // ═════════════════════ 36. 정리: 요청서.md ═════════════════════
  DECK.slide({
    id: 'recap-request', bg: 'paper', holds: [], dur: 2.4, notes: NOTES['recap-request'],
    setup(el) {
      const $ = this.$;
      $.tree = U.fileTree(el, { preset: 'side', light: true, current: 'c02', done: 2, checkFrom: 2, markAt: 0.2, checkAt: 0.55 });
      const row = $.tree.rows[1], cy = 308 + 2 * $.tree.R + $.tree.R / 2;
      const x0 = 160 + Math.round(2.5 * 34) + row.nameEl.offsetWidth + 22;
      $.lead = div(el, null, { left: x0 + 'px', top: cy - 3 + 'px', width: 640 - x0 + 'px', height: '6px',
        backgroundImage: `radial-gradient(circle, ${DECK.rgba('paperInk', 0.55)} 2.4px, transparent 2.9px)`, backgroundSize: '14px 6px', backgroundRepeat: 'repeat-x' });
      $.kick = div(el, '요청서.md', { left: '660px', top: cy - 32 + 'px', font: '700 60px/64px var(--mono)', color: C.ink, letterSpacing: '-.01em' }, 'a nw');
      // 칸 이름 일곱 개(display 48px): 표지 사진 속 서식과 같은 배치(두 칸씩 세 줄 + 넓은 한 칸)
      const CW = 412, CH = 88, G = 12, GX = 660, GY = 528;
      $.cells = FIELDS.map(([nm], i) => {
        const r = Math.floor(i / 2), c = i % 2, wide = i === 6;
        const d = div(el, null, { left: GX + c * (CW + G) + 'px', top: GY + r * (CH + G) + 'px', width: (wide ? CW * 2 + G : CW) + 'px', height: CH + 'px',
          borderRadius: '12px', border: '2px solid color-mix(in srgb, var(--paperInk) 24%, transparent)', background: C.chip, opacity: 0 });
        const tx = div(d, nm, { left: '28px', top: '20px', font: 'var(--displayW) 48px/1 var(--display)', letterSpacing: '-.025em', color: C.ink }, 'a nw');
        return { d, tx, i };
      });
      $.mk = U.mark($.cells[2].tx, { light: true });
      $.rip = ripple(el, GX - 4, GY + (CH + G) - 4, CW + 8, CH + 8, 16);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.tree.render(t);
      // 다음 장 파일(구성.md) 이름이 천천히 진해졌다 돌아온다. 쉬는 값은 트리 기본색(paperInk2 = 잉크 66%)이라
      // v03_parts 첫 프레임과 같고, 진해지는 쪽은 영상이 0.7초에 구성.md를 잉크색으로 바꾸는 방향과 같다(cut 이음)
      const nw = (0.5 - 0.5 * Math.cos(a * 1.6)) * prog(t, 1.6, 0.6);
      set($.tree.rows[2].nameEl, 'color', `color-mix(in srgb, var(--paperInk) ${(66 + 34 * nw).toFixed(1)}%, transparent)`);
      U.wipe($.lead, prog(t, 0.35, 0.4, ease.inOutCubic));
      const kp = prog(t, 0.5, 0.45);
      U.wipe($.kick, kp); set($.kick, 'transform', `translateX(${((1 - kp) * -24).toFixed(1)}px)`);
      $.cells.forEach((c, j) => { const p = prog(t, 0.75 + j * 0.06, 0.5, ease.pop); show(c.d, prog(t, 0.75 + j * 0.06, 0.18, ease.linear)); set(c.d, 'transform', `translateY(${((1 - p) * 26).toFixed(1)}px) scale(${lerp(0.85, 1, p).toFixed(4)})`); });
      const mp = $.mk.render(t, 1.45, 0.5);
      set($.cells[2].d, 'background', mp > 0 ? `color-mix(in srgb, var(--mark) ${(26 * mp).toFixed(1)}%, ${C.chip})` : C.chip);
      // 완료 기준 칸 둘레로 테두리가 퍼져 나간다(머무는 동안)
      renderRipple($.rip, a, prog(t, 1.9, 0.4));
    },
  });
})();
