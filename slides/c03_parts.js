/* c03 「구성.md: 역할·방법·순서를 파일에 적는다」 — 슬라이드 38~51(14장)
 * 매체: 코드 편집기 화면(mono), 폴더 트리, 파일 탭. 바탕 grid.
 * 38 영상 → 39 편집기(탐색기 트리 = 영상 마지막 프레임과 같은 틀)에서 탭 세 개가 열려 세 칸으로 나뉨
 * 40 탐색기 트리 track · 41 에이전트 파일 타자 · 42 스킬 폴더 + SKILL.md 종이 미리보기 · 43 순환 도식
 * 44 질문 · 45 막대 · 46 진술 · 47 도구 17→2 · 48 점 400개 · 49 대화 기록 띠 · 50 명령 표 · 51 정리(U.fileTree·U.mark)
 */
(function () {
  const { ease, prog, clamp, lerp, rand, noise, css, h, s, show, spring, smooth } = DECK;
  const TAU = Math.PI * 2;
  const P1 = v => (+v).toFixed(1);

  // ───────────────────────── 장 전용 도우미 ─────────────────────────
  function T(parent, html, st, cls = 'a nw') { const d = h('div', cls, parent, html); if (st) css(d, st); return d; }
  function svgLayer(parent, w = 1920, hh = 1080) { const sv = s('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); css(sv, { position: 'absolute', left: 0, top: 0, overflow: 'visible' }); return sv; }
  function up(el, p, dy = 24, dx = 0) { show(el, p); el.style.transform = `translate(${P1((1 - p) * dx)}px, ${P1((1 - p) * dy)}px)`; return p; }
  function fadeUp(el, t, start, dur = 0.55, dy = 28) { return up(el, prog(t, start, dur), dy); }
  function popIn(el, t, start, dur = 0.5, from = 0.6) { const p = prog(t, start, dur, ease.pop); show(el, prog(t, start, dur * 0.35, ease.linear)); el.style.transform = `scale(${lerp(from, 1, p).toFixed(4)})`; return p; }
  const blink = a => (Math.floor(a * 1.8) % 2 === 0 ? 1 : 0.15);
  const ICON = Object.assign({}, U.ICON, {
    cycle: 'M4.5 12a7.5 7.5 0 0 1 13.2-4.9 M19.5 12a7.5 7.5 0 0 1-13.2 4.9 M18 3.5v4h-4 M6 20.5v-4h4',
    term: 'M3 5h18v14H3z M7 10l3 2.5L7 15 M12 15h5',
    chev: 'M9 6l6 6-6 6',
  });
  function icon(parent, name, size, color, sw = 1.9) {
    const sv = s('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
    s('path', { d: ICON[name] || ICON.doc }, sv);
    return sv;
  }
  // 글자 하나씩 찍히는 줄. segs = [{ text, st }]. set(n): 앞 n글자만 보임. caret: 줄 끝 막대
  function typeLine(parent, segs, st, caretColor = 'var(--accent)') {
    const el = T(parent, '', st);
    const chars = [];
    const parts = segs.map(sg => {
      const sp = h('span', '', el); if (sg.st) css(sp, sg.st);
      [...sg.text].forEach(ch => { const c = h('span', '', sp); c.textContent = ch; chars.push(c); });
      return sp;
    });
    const caret = h('span', '', el);
    css(caret, { display: 'inline-block', width: '0.12em', height: '1.02em', marginLeft: '0.06em', verticalAlign: '-0.16em', background: caretColor, opacity: 0 });
    let last = -1;
    return {
      el, chars, parts, caret, n: chars.length,
      set(n) { n = Math.max(0, Math.min(chars.length, Math.floor(n + 1e-6))); if (n === last) return n; last = n; chars.forEach((c, i) => { const v = i < n ? '' : 'none'; if (c.style.display !== v) c.style.display = v; }); return n; },
      type(t, start, per = 0.034) { return this.set((t - start) / per); },
      doneAt(start, per = 0.034) { return start + chars.length * per; },
    };
  }
  // 편집기 창 틀: 둥근 창 + 위 막대(점 세 개). 반환 { win, bar, body }
  const BAR = 64;
  function editorWin(parent, X, Y, W, H) {
    const win = T(parent, '', { left: X + 'px', top: Y + 'px', width: W + 'px', height: H + 'px', borderRadius: '18px', overflow: 'hidden',
      background: 'color-mix(in srgb, var(--bg1) 93%, var(--ink))', border: '2px solid var(--line)', boxShadow: '0 40px 100px rgba(0,0,0,.5)' }, 'a');
    const bar = T(win, '', { left: 0, top: 0, width: W + 'px', height: BAR + 'px', background: 'color-mix(in srgb, var(--bg0) 70%, var(--bg1))', borderBottom: '2px solid var(--line2)' }, 'a');
    [0, 1, 2].forEach(i => T(bar, '', { left: 26 + i * 24 + 'px', top: '25px', width: '14px', height: '14px', borderRadius: '50%', background: 'color-mix(in srgb, var(--mut) 45%, transparent)' }, 'a'));
    return { win, bar, W, H };
  }
  // 영상 v03_parts의 마지막 프레임과 같은 탐색기 트리(39·44): project/ → CLAUDE.md → .claude/agents/(파일 넷) → .claude/skills/ → evals/
  const EXP = [
    { d: 0, n: 'project/', f: 1, open: 1 },
    { d: 1, n: 'CLAUDE.md' },
    { d: 1, n: '.claude/agents/', f: 1, open: 1 },
    { d: 2, n: 'researcher.md' },
    { d: 2, n: 'planner.md' },
    { d: 2, n: 'builder.md' },
    { d: 2, n: 'reviewer.md' },
    { d: 1, n: '.claude/skills/', f: 1 },
    { d: 1, n: 'evals/', f: 1 },
  ];
  const EXR = 52, EXT = BAR + 28;
  function explorer(parent, W, H) {
    const side = T(parent, '', { left: 0, top: BAR + 'px', width: W + 'px', height: H - BAR + 'px', overflow: 'hidden', background: 'color-mix(in srgb, var(--bg0) 55%, var(--bg1))', borderRight: '2px solid var(--line2)' }, 'a');
    const tree = T(side, '', { left: 0, top: 0, width: '440px', height: H + 'px' }, 'a');
    const rows = EXP.map((r, k) => {
      const y = EXT - BAR + k * EXR, x = 30 + r.d * 32;
      const row = T(tree, '', { left: 0, top: y + 'px', width: '440px', height: EXR + 'px' }, 'a');
      const band = T(row, '', { left: 0, top: 0, width: '440px', height: EXR + 'px', background: 'color-mix(in srgb, var(--accent2) 22%, transparent)', borderLeft: '4px solid var(--accent2)', opacity: 0, transformOrigin: '0 50%' }, 'a');
      if (r.f) { const cv = T(row, '', { left: x - 4 + 'px', top: '15px' }, 'a'); const sv = icon(cv, 'chev', 22, 'var(--mut)', 2.4); if (r.open) sv.style.transform = 'rotate(90deg)'; }
      const ic = T(row, '', { left: x + 20 + 'px', top: '12px' }, 'a'); icon(ic, r.f ? 'folder' : 'doc', 28, r.f ? 'var(--accent2)' : 'var(--mut)', 1.8);
      const nm = T(row, r.n, { left: x + 58 + 'px', top: 0, font: `${r.f ? 600 : 500} 28px/${EXR}px var(--mono)`, color: r.f ? 'var(--ink)' : 'color-mix(in srgb, var(--ink) 82%, transparent)' });
      return { row, band, nm };
    });
    // 접혔을 때 보이는 아이콘 줄
    const rail = T(side, '', { left: 0, top: 0, width: '96px', height: H + 'px', opacity: 0 }, 'a');
    ['folder', 'search', 'layers'].forEach((nm, i) => { const b = T(rail, '', { left: '30px', top: 36 + i * 70 + 'px' }, 'a'); icon(b, nm, 34, i === 0 ? 'var(--ink)' : 'var(--mut)', 1.7); });
    return { side, tree, rows, rail };
  }

  // ───────────────────────── 38 v-parts: 장 전환 영상 ─────────────────────────
  DECK.videoSlide({ id: 'v-parts', video: 'v03_parts' });

  // ───────────────────────── 39 three-parts (push · drift) ─────────────────────────
  // 첫 화면(t ≤ 0) = 영상 v03_parts 마지막 프레임(포스터)과 같은 배치(video/interludes/reel/scenes_s03.js 값):
  //   문장 「하네스는 폴더 하나에 들어 있습니다」 serif 700 64px/1.32, 위 끝 y 176, 가운데 정렬, '폴더 하나'에 밑줄
  //   창 x 160·y 310·1600×620(반경 20, 점 없음), 탐색기 칸 600, 줄 mono 500 32px·간격 54·들여쓰기 40, 첫 줄 위 끝 y 400
  //   영상의 줄은 블록 한 줄(아이콘이 글자 기준선에 앉음)이라 글자 가운데가 줄 위 끝 + 22(첫 줄 y 422)다. 같은 짜임으로 만든다.
  //   이 창은 CSS 테두리 2px 안쪽이 좌표 원점이므로 영상 값에서 2px씩 뺀다(TOP 88, LEFT 46, 칸 598)
  // 탐색기 접힘(t 0.35~1.0) 동안 문장이 위로 40px 빠지며 사라지고, 창·탐색기·트리가 E39 틀로 옮겨 간다.
  // 그 뒤 클릭 없이 탭이 하나씩 열리고 편집기가 1→2→3칸으로 나뉜다(한 클릭 개편: 빌드 3개 → 1개, 묶음 시작은 S39)
  const E39 = { X: 180, Y: 170, W: 1560, H: 740, SIDE: 440, RAIL: 96 };
  // 묶음 시작 시각(이전 빌드 경계 2.1·3.7 자리): 둘째 탭(스킬), 셋째 탭(오케스트레이터). 첫 탭은 0.8에 열린다
  const S39 = [1.25, 1.85];
  const V39 = { X: 160, Y: 310, W: 1600, H: 620, R: 20, SIDE: 598, TOP: 88, ROW: 54, LEFT: 46, IND: 40, FS: 32, MID: 22 };
  // 창 바탕: 영상 rgba(bg1, .9) → E39 color-mix(bg1 93%, ink). 위 막대: 투명 → color-mix(bg0 70%, bg1)
  const WIN0 = [24, 28, 34, 0.9], WIN1 = [39.3, 42.8, 47.7, 1], BAR1 = [17, 19.6, 23.5];
  // 머묾 카메라 지우기(4차 U.pin): w = 1이면 U.pin(x) 그대로, 0이면 지우지 않음. 그 사이는 이동·회전·확대를 w만큼만 되돌린다
  //   (U.pin과 같은 순서·같은 식. 층의 transform-origin은 슬라이드 가운데 960·540에 맞춘다)
  function pinW(x, w) {
    if (w >= 1) return U.pin(x);
    if (w <= 0) return '';
    const c = (x && x.cam) || { dx: 0, dy: 0, dz: 0, rz: 0 };
    const k = DECK.P / Math.max(50, DECK.P + (c.dz || 0));
    return `translate(${((c.dx || 0) * w).toFixed(2)}px, ${((c.dy || 0) * w).toFixed(2)}px) rotate(${((c.rz || 0) * w).toFixed(4)}deg) scale(${Math.pow(k, -w).toFixed(5)})`;
  }
  const rgbaL = (A, B, u) => `rgba(${[0, 1, 2].map(i => lerp(A[i], B[i], u).toFixed(1)).join(',')},${lerp(A[3], B[3], u).toFixed(3)})`;
  const PARTS = [
    { tab: 'researcher.md', icon: 'agent', name: '에이전트', pre: '', key: '누가', post: ' 맡는가' },
    { tab: 'SKILL.md', icon: 'skill', name: '스킬', pre: '', key: '어떻게', post: ' 하는가' },
    { tab: 'workflow.md', icon: 'cycle', name: '오케스트레이터', pre: '', key: '어떤 순서로', post: ' 하는가' },
  ];
  DECK.slide({
    id: 'three-parts', holds: [], dur: 3.6,
    setup(el) {
      const $ = this.$, E = E39, V = V39;
      // 영상 끝 문장(영상과 같은 글꼴·자리)
      $.q = T(el, '하네스는 폴더 하나에 들어 있습니다', { left: 0, top: '176px', width: '1920px', textAlign: 'center', font: '700 64px/1.32 var(--serif)', letterSpacing: '-0.025em', color: 'var(--ink)' });
      $.qm = U.mark($.q, { word: '폴더 하나' });
      $.qm.set(1);
      // 편집기 창: 영상 끝 틀에서 시작
      const ed = $.ed = editorWin(el, V.X, V.Y, V.W, V.H);
      css(ed.win, { borderRadius: V.R + 'px', background: rgbaL(WIN0, WIN0, 0) });
      ed.bar.style.background = 'transparent';
      $.dots = [...ed.bar.children];
      // 탐색기(39 전용): 영상 끝 화면과 같은 줄 모양. 접힐 때 E39 줄 자리로 옮겨 가며 사라진다
      const side = T(ed.win, '', { left: 0, top: 0, width: V.SIDE + 'px', height: V.H + 'px', overflow: 'hidden',
        background: 'color-mix(in srgb, var(--bg0) 55%, var(--bg1))', borderRight: '2px solid var(--line2)' }, 'a');
      const tree = T(side, '', { left: 0, top: 0, width: '1px', height: '1px' }, 'a');
      const band = T(tree, '', { left: 0, top: 0, width: V.SIDE + 'px', height: V.ROW + 'px', background: 'color-mix(in srgb, var(--accent2) 22%, transparent)',
        borderLeft: '4px solid var(--accent2)', opacity: 0, transformOrigin: '0 50%' }, 'a');
      const rows = EXP.map(r => {
        const row = T(tree, '', { left: 0, top: 0, height: V.ROW + 'px', font: `500 ${V.FS}px var(--mono)`, transformOrigin: '0 0' }, 'a nw');
        const cv = h('span', '', row);
        css(cv, { display: 'inline-block', width: '30px', lineHeight: 0, opacity: r.f ? 1 : 0, transformOrigin: '12px 15px', transform: r.open ? 'rotate(90deg)' : '' });
        icon(cv, 'chev', 24, 'var(--mut)', 2.4);
        const ic = h('span', '', row);
        css(ic, { display: 'inline-block', width: '48px', lineHeight: 0 });
        icon(ic, r.f ? 'folder' : 'doc', 32, r.f ? 'var(--accent2)' : 'color-mix(in srgb, var(--ink) 80%, transparent)', 1.8);
        const nm = h('span', '', row, r.n);
        nm.style.color = r.f ? 'var(--ink)' : 'color-mix(in srgb, var(--ink) 86%, transparent)';
        return row;
      });
      // 접혔을 때 보이는 아이콘 줄
      const rail = T(side, '', { left: 0, top: 0, width: E.RAIL + 'px', height: E.H + 'px', opacity: 0 }, 'a');
      ['folder', 'search', 'layers'].forEach((nm, i) => { const b = T(rail, '', { left: '30px', top: 36 + i * 70 + 'px' }, 'a'); icon(b, nm, 34, i === 0 ? 'var(--ink)' : 'var(--mut)', 1.7); });
      $.ex = { side, tree, band, rows, rail };
      $.panes = PARTS.map((P, i) => {
        const pane = T(ed.win, '', { left: E.W + 'px', top: 0, width: '0px', height: E.H + 'px', overflow: 'hidden' }, 'a');
        const div = T(pane, '', { left: 0, top: 0, width: '2px', height: E.H + 'px', background: 'var(--line)' }, 'a');
        const tab = T(pane, '', { left: '0px', top: '0px', height: BAR + 'px', padding: '0 30px 0 26px', display: 'flex', alignItems: 'center', gap: '12px',
          background: 'color-mix(in srgb, var(--bg1) 93%, var(--ink))', borderRight: '2px solid var(--line2)' }, 'a nw');
        const tline = T(tab, '', { left: 0, top: 0, width: '100%', height: '3px', background: 'var(--accent)', transformOrigin: '0 50%' }, 'a');
        icon(tab, 'doc', 26, 'var(--accent2)', 1.8);
        T(tab, P.tab, { font: '500 28px var(--mono)', color: 'var(--ink)' }, 'nw');
        const body = T(pane, '', { left: '58px', top: '150px', width: '460px', height: '560px' }, 'a');
        const ib = T(body, '', { left: 0, top: 0, width: '72px', height: '72px', borderRadius: '18px', background: 'color-mix(in srgb, var(--accent2) 16%, transparent)', border: '2px solid color-mix(in srgb, var(--accent2) 45%, transparent)', transformOrigin: '50% 50%' }, 'a');
        const ic = T(ib, '', { left: '14px', top: '14px' }, 'a'); icon(ic, P.icon, 40, 'var(--accent2)', 1.8);
        const name = T(body, P.name, { left: '-2px', top: '102px', font: 'var(--displayW) 60px/1.2 var(--display)', letterSpacing: '-.025em', color: 'var(--ink)' });
        const mean = T(body, '', { left: 0, top: '196px', font: '500 42px/1.3 var(--sans)', color: 'var(--ink)' });
        const kw = h('span', '', mean, P.key); h('span', '', mean, P.post);
        const mk = U.mark(kw);
        const lines = [0, 1, 2, 3, 4].map(j => T(body, '', { left: 0, top: 300 + j * 46 + 'px', height: '14px', borderRadius: '7px', width: Math.round(130 + rand(i * 7 + j, 31) * 250) + 'px', background: 'color-mix(in srgb, var(--ink) 13%, transparent)', transformOrigin: '0 50%' }, 'a'));
        const caret = T(body, '', { left: '0px', top: 300 + 5 * 46 - 12 + 'px', width: '4px', height: '38px', background: 'var(--accent)', opacity: 0 }, 'a');
        return { pane, div, tab, tline, body, ib, name, mean, mk, lines, caret };
      });
      // 탐색기에서 탭으로 날아가는 파일 이름(빌드 1). 왼쪽 끝 기준으로 키워 글자 시작이 줄 이름과 맞게 한다
      $.chip = T(ed.win, '', { left: 0, top: 0, height: BAR + 'px', padding: '0 30px 0 26px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '10px',
        background: 'color-mix(in srgb, var(--accent2) 26%, var(--bg1))', border: '2px solid var(--accent2)', opacity: 0, transformOrigin: '0 50%' }, 'a nw');
      icon($.chip, 'doc', 26, 'var(--accent2)', 1.8); T($.chip, PARTS[0].tab, { font: '500 28px var(--mono)', color: 'var(--ink)' }, 'nw');
    },
    render(t, x) {
      const $ = this.$, E = E39, V = V39, a = x.a, H = S39;
      // 들어오는 동안: 영상 마지막 프레임과 같은 화면이 처음부터 그대로 보인다(닫히는 영상 띠와 겹쳐도 어긋나지 않게)
      const u = prog(t, 0.35, 0.65, ease.inOutCubic);          // 영상 틀 → E39 틀(탐색기 접힘과 같은 구간)
      // 문장: 위로 40px 빠지며 사라진다
      const qp = prog(t, 0.35, 0.4, ease.inOutCubic);           // 창 위 끝이 문장 자리에 닿기 전에 거의 사라진다
      // 머묾 흔들림(drift: 이동·회전 rz·확대) 지우기: 첫 화면이 영상 끝 프레임과 같은 자리에 오도록 U.pin(x)으로 카메라를 모두 지우고,
      // 창이 옮겨 가는 동안(u 0→1) 지우기를 푼다. 문장과 창 두 층에만 쓴다(영상 끝 프레임과 겹치는 층)
      const comp = pinW(x, 1 - u);
      show($.q, 1 - qp);
      $.q.style.transformOrigin = `960px ${540 - 176}px`;
      $.q.style.transform = `${comp} translateY(${P1(-40 * qp)}px)`;
      // 창 사각
      const WX = lerp(V.X, E.X, u), WY = lerp(V.Y, E.Y, u), W = lerp(V.W, E.W, u), WH = lerp(V.H, E.H, u);
      css($.ed.win, { left: P1(WX) + 'px', top: P1(WY) + 'px', width: P1(W) + 'px', height: P1(WH) + 'px', borderRadius: P1(lerp(V.R, 18, u)) + 'px',
        background: u >= 1 ? 'color-mix(in srgb, var(--bg1) 93%, var(--ink))' : rgbaL(WIN0, WIN1, u) });
      show($.ed.win, 1);
      $.ed.win.style.transformOrigin = `${P1(960 - WX)}px ${P1(540 - WY)}px`;
      $.ed.win.style.transform = comp;
      css($.ed.bar, { width: P1(W) + 'px', background: u >= 1 ? 'color-mix(in srgb, var(--bg0) 70%, var(--bg1))' : rgbaL([...BAR1, 0], [...BAR1, 1], u) });
      $.dots.forEach(d => { d.style.opacity = prog(t, 0.6, 0.4, ease.linear).toFixed(3); });
      // 탐색기: 칸 600 → 접힘 96, 위 끝 0 → 막대 아래
      const ex = $.ex, S = lerp(V.SIDE, E.RAIL, u), sTop = lerp(0, BAR, u);
      css(ex.side, { top: P1(sTop) + 'px', width: P1(S) + 'px', height: P1(WH - sTop) + 'px' });
      ex.tree.style.top = P1(-sTop) + 'px';                       // 트리 좌표 = 창 좌표
      show(ex.tree, 1 - prog(t, 0.35, 0.3, ease.linear));
      show(ex.rail, prog(t, 0.75, 0.35, ease.linear));
      const sc = lerp(1, 28 / V.FS, u), rowH = lerp(V.ROW, EXR, u);
      // 줄 위 끝(창 좌표). 끝 값은 E39 줄의 글자 가운데(위 끝 + 26)와 이름 시작(x 88 + 32d)에 맞춘 자리
      const rowY = k => lerp(V.TOP + k * V.ROW, EXT + k * EXR + 26 - V.MID * (28 / V.FS), u);
      ex.rows.forEach((row, k) => {
        const d = EXP[k].d;
        row.style.transform = `translate(${P1(lerp(V.LEFT + d * V.IND, 88 + d * 32 - 78 * (28 / V.FS), u))}px, ${P1(rowY(k))}px) scale(${sc.toFixed(4)})`;
      });
      // 첫 묶음: researcher.md 줄 강조 → 이름이 탭 자리로 날아감 → 탐색기가 접힘
      const hb = prog(t, 0.0, 0.3, ease.outCubic);
      ex.band.style.opacity = (hb * (1 - prog(t, 0.55, 0.3))).toFixed(3);
      ex.band.style.top = P1(rowY(3) + V.MID * sc - rowH / 2) + 'px'; ex.band.style.height = P1(rowH) + 'px';   // 띠 가운데 = 글자 가운데
      ex.band.style.transform = `scaleX(${hb.toFixed(4)})`;
      // 날아가는 칩: 영상 틀의 researcher.md 줄(글자 시작 x 204, 글자 가운데 y 272, 창 좌표) → 탭 자리(x RAIL, y 0)
      //   칩 글자 시작 = 칩 왼쪽 + 64 × 1.1(처음 배율)
      const fp = prog(t, 0.2, 0.62, ease.inOutCubic), arc = Math.sin(fp * Math.PI);
      const cx = lerp(V.LEFT + 2 * V.IND + 78 - 64 * 1.1, E.RAIL, fp), cy = lerp(V.TOP + 3 * V.ROW + V.MID - BAR / 2, 0, fp) - arc * 60;
      show($.chip, prog(t, 0.2, 0.12, ease.linear) * (1 - prog(t, 0.8, 0.12, ease.linear)));
      $.chip.style.transform = `translate(${P1(cx)}px, ${P1(cy)}px) scale(${(lerp(1.1, 0.96, fp) + 0.08 * arc).toFixed(4)})`;
      // 칸 나누기: 0 → 1 → 2 → 3칸
      const p2 = prog(t, H[0] + 0.05, 0.7, ease.inOutCubic), p3 = prog(t, H[1] + 0.05, 0.7, ease.inOutCubic);
      const Wm = W - S;
      const lefts = [S, lerp(lerp(W, S + Wm / 2, p2), S + Wm / 3, p3), lerp(W, S + (2 * Wm) / 3, p3)];
      const starts = [0.8, H[0] + 0.25, H[1] + 0.25];
      $.panes.forEach((P, i) => {
        const L0 = i === 0 ? (t >= 0.78 ? S : W) : lefts[i], R0 = i < 2 ? lefts[i + 1] : W;
        css(P.pane, { left: P1(L0) + 'px', width: P1(Math.max(0, R0 - L0)) + 'px' });
        P.div.style.opacity = i === 0 ? '0' : '1';
        const st = starts[i];
        const act = i === (t >= H[1] ? 2 : t >= H[0] ? 1 : 0);
        P.tline.style.transform = `scaleX(${(act ? prog(t, st - 0.1, 0.4, ease.outCubic) : 0).toFixed(4)})`;
        P.tab.style.transform = i === 0 ? '' : `translateY(${P1((1 - prog(t, st - 0.15, 0.45, ease.pop)) * -BAR)}px)`;
        show(P.tab, i === 0 ? (t >= 0.8 ? 1 : 0) : prog(t, st - 0.15, 0.2, ease.linear));
        popIn(P.ib, t, st, 0.5, 0.4);
        up(P.name, prog(t, st + 0.08, 0.5), 40);
        up(P.mean, prog(t, st + 0.2, 0.5), 30);
        P.mk.render(t, st + 0.6, 0.5);
        const pw = Math.max(0, R0 - L0) - 130;
        P.lines.forEach((ln, j) => { const q = prog(t, st + 0.35 + j * 0.07, 0.35, ease.outCubic); show(ln, q > 0 ? 1 : 0); ln.style.transform = `scaleX(${q.toFixed(4)})`; ln.style.width = P1(Math.max(60, pw * (0.32 + 0.5 * rand(i * 7 + j, 31)))) + 'px'; });
        P.caret.style.opacity = act && t > st + 0.8 ? blink(a).toFixed(2) : '0';
        P.ib.style.boxShadow = act ? `0 0 ${P1(18 + 10 * Math.sin(a * 2.2))}px color-mix(in srgb, var(--accent2) 35%, transparent)` : 'none';
      });
    },
  });

  // ───────────────────────── 40 folder (push · track) ─────────────────────────
  // 탐색기 모양 트리를 크게(mono 40px). 묶음마다 줄이 펼쳐지고 카메라가 따라간다. 처음에는 검은 서류철 사진이 project/ 아이콘으로 줄어든다
  // 한 클릭 개편: 빌드 3개 → 1개. 묶음 시작은 S40, 카메라는 camTrack 한 칸(끝 화면 = 이전 빌드 3 영역) + cameraHook로
  //   이전 세 영역(T40CAM)을 t에 따라 옮겨 가다 끝 영역에서 멈춘다
  const F40 = [
    { d: 0, n: 'project/', f: 1, b: 0 },
    { d: 1, n: 'CLAUDE.md', desc: '프로젝트 공통 규칙', b: 0 },
    // 수정 회차 1: 이 줄에만 오른쪽 설명이 없어 강조 띠 오른쪽이 비었다. 노트 「역할마다 파일이 하나씩」에서 「역할마다 파일 하나」를 넣음(검수 지시)
    { d: 1, n: '.claude/agents/', f: 1, desc: '역할마다 파일 하나', b: 1 },
    { d: 2, n: 'researcher.md', b: 1 },
    { d: 2, n: 'planner.md', b: 1 },
    { d: 2, n: 'builder.md', b: 1 },
    { d: 2, n: 'reviewer.md', b: 1 },
    { d: 1, n: '.claude/skills/', f: 1, desc: '작업 방법', b: 2 },
    { d: 1, n: 'evals/', f: 1, desc: '평가 기준', b: 2 },
  ];
  const T40 = { X: 330, Y: 196, R: 76, IND: 66, DX: 1080 };
  const S40 = [0.7, 1.45];                                            // 묶음 시작(이전 빌드 경계 1.8·3.5 자리): agents/ 묶음, skills/·evals/ 묶음
  const T40CAM = [[860, 292, 1.34], [870, 468, 1.12], [880, 533, 1.04]]; // 이전 빌드별 camTrack. 묶음 시작마다 0.8초 동안 다음 영역으로
  function cam40(t) {
    const lz = (A, B, p) => [lerp(A[0], B[0], p), lerp(A[1], B[1], p), Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), p))];
    const p1 = ease.inOutCubic(clamp((t - S40[0]) / 0.8)), p2 = ease.inOutCubic(clamp((t - S40[1]) / 0.8));
    return lz(lz(T40CAM[0], T40CAM[1], p1), T40CAM[2], p2);
  }
  DECK.slide({
    id: 'folder', holds: [], dur: 3.4,
    camTrack: [T40CAM[2]],
    // camTrack 한 칸(끝 영역)에 더하는 값: 지금 영역 - 끝 영역. dz는 엔진 track과 같은 식(P / 배율 - P)의 차
    cameraHook(t) {
      const c = cam40(t), E = T40CAM[2], P = DECK.P;
      return { dx: c[0] - E[0], dy: c[1] - E[1], dz: P / c[2] - P / E[2] };
    },
    setup(el) {
      const $ = this.$, G = T40;
      $.fold = T(el, '', { left: '560px', top: '40px', width: '620px', height: '465px', transformOrigin: '50% 50%' }, 'a');
      $.foldImg = DECK.img('assets/img/obj_folder.png');
      if ($.foldImg.missing) { const ph = U.image($.fold, 'assets/img/obj_folder.png', { x: 0, y: 0, w: 620, h: 465 }); void ph; }
      else { css($.foldImg, { width: '620px', height: '465px', objectFit: 'contain', display: 'block' }); $.fold.appendChild($.foldImg); DECK.preload(new Promise(r => { if ($.foldImg.complete) r(); else { $.foldImg.addEventListener('load', r, { once: true }); $.foldImg.addEventListener('error', r, { once: true }); } })); }
      // 띠 너비 1160(오른쪽 끝 x 1440): 빌드 1 카메라 1.34배에서 화면 x 약 1737(이전 1280이면 1898로 가장자리에 붙었다)
      $.band = T(el, '', { left: G.X - 50 + 'px', top: '0px', width: '1160px', height: G.R + 'px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent2) 11%, transparent)', borderLeft: '5px solid var(--accent2)', opacity: 0 }, 'a');
      $.svg = svgLayer(el);
      const rowY = k => G.Y + k * G.R, mid = k => rowY(k) + G.R / 2, ix = d => G.X + d * G.IND;
      // 들여쓰기 안내선(부모 아이콘 아래 → 마지막 자식)
      $.guides = [
        { d: 0, k0: 0, k1: 8, b: 0 }, { d: 1, k0: 2, k1: 6, b: 1 },
      ].map(gd => {
        const gx = ix(gd.d) + 20, y0 = rowY(gd.k0) + G.R - 10, y1 = mid(gd.k1);
        const p = s('path', { d: `M${gx} ${y0} L${gx} ${y1}`, stroke: DECK.rgba('ink', 0.22), 'stroke-width': 2, fill: 'none' }, $.svg);
        return Object.assign(gd, { p, gx, y0, y1 });
      });
      $.flows = [0, 1, 2, 3, 4, 5].map(i => s('circle', { r: 6, fill: DECK.rgba('accent2', 1) }, $.svg));
      $.rows = F40.map((r, k) => {
        const y = rowY(k), x = ix(r.d);
        const row = T(el, '', { left: 0, top: y + 'px', width: '1920px', height: G.R + 'px' }, 'a');
        let chev = null;
        if (r.f) { const cv = T(row, '', { left: x - 36 + 'px', top: '22px', transformOrigin: '16px 16px', width: '32px', height: '32px' }, 'a'); icon(cv, 'chev', 32, 'var(--mut)', 2.4); chev = cv; }
        const ic = T(row, '', { left: x + 'px', top: '18px', transformOrigin: '20px 20px', width: '40px', height: '40px' }, 'a'); icon(ic, r.f ? 'folder' : 'doc', 40, r.f ? 'var(--accent2)' : 'var(--mut)', 1.7);
        const nm = typeLine(row, [{ text: r.n }], { left: x + 60 + 'px', top: 0, font: `${r.f ? 600 : 500} 40px/${G.R}px var(--mono)`, color: r.f ? 'var(--ink)' : 'color-mix(in srgb, var(--ink) 86%, transparent)' }, 'var(--accent2)');
        let desc = null, lead = null;
        if (r.desc) {
          desc = T(row, r.desc, { left: G.DX + 'px', top: 0, font: `500 32px/${G.R}px var(--sans)`, color: 'var(--mut)' });
          const x0 = x + 60 + r.n.length * 24 + 22;
          lead = s('path', { d: `M${x0} ${mid(k)} L${G.DX - 24} ${mid(k)}`, stroke: DECK.rgba('ink', 0.24), 'stroke-width': 2, fill: 'none' }, $.svg);
        }
        return Object.assign({}, r, { k, row, chev, ic, nm, desc, lead });
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = S40, G = T40;
      // 서류철 사진: 들어오는 동안 보이고(빈 판 방지), t 0~0.6에 project/ 아이콘 자리로 줄어든다
      const fe = prog(t, 0.0, 0.62, ease.inOutCubic);
      const tx = G.X + 20 - (560 + 310), ty = G.Y + G.R / 2 - (40 + 232);
      show($.fold, smooth(0.0, 0.3, x.arrive) * (1 - prog(t, 0.42, 0.2, ease.linear)));
      $.fold.style.transform = `translate(${P1(tx * fe)}px, ${P1(ty * fe)}px) scale(${lerp(1, 0.07, fe).toFixed(4)}) rotate(${P1(-6 * (1 - fe))}deg)`;
      const starts = [[0.42, 0.75], [H[0] + 0.35, H[0] + 0.55, H[0] + 0.67, H[0] + 0.79, H[0] + 0.91], [H[1] + 0.35, H[1] + 0.55]];
      const idx = [0, 0, 0, 1, 2, 3, 4, 0, 1];
      $.rows.forEach((r, k) => {
        const st = starts[r.b][r.b === 1 ? k - 2 : r.b === 2 ? k - 7 : k];
        const p = prog(t, st, 0.45, ease.snap);
        show(r.row, prog(t, st, 0.15, ease.linear));
        r.row.style.transform = `translateX(${P1((1 - p) * -30)}px)`;
        if (k === 0) r.ic.style.transform = `scale(${lerp(0.4, 1, prog(t, 0.45, 0.4, ease.pop)).toFixed(4)})`;
        r.nm.type(t, st + 0.08, 0.03);
        r.nm.caret.style.opacity = '0';
        if (r.chev) {
          const open = k === 0 ? prog(t, 0.55, 0.35, ease.pop) : k === 2 ? prog(t, H[0] + 0.5, 0.35, ease.pop) : 0;
          r.chev.style.transform = `rotate(${P1(90 * open)}deg)`;
        }
        if (r.desc) {
          const dt = st + 0.35;
          U.draw(r.lead, prog(t, dt, 0.45, ease.inOutCubic)); r.lead.style.opacity = t > dt ? '1' : '0';
          up(r.desc, prog(t, dt + 0.2, 0.45), 0, -24);
        }
        void idx;
      });
      // 안내선과 그 위를 흐르는 점
      // 바깥 안내선은 묶음마다 마지막 줄까지 자란다(묶음 1: CLAUDE.md, 2: .claude/agents/, 3: evals/)
      const g0 = $.guides[0], gl = g0.y1 - g0.y0;
      const reach = lerp(lerp(G.R * 1.5 + G.Y - g0.y0, G.R * 2.5 + G.Y - g0.y0, prog(t, H[0] + 0.35, 0.4, ease.inOutCubic)), gl, prog(t, H[1] + 0.35, 0.5, ease.inOutCubic));
      U.draw(g0.p, (reach / gl) * prog(t, 0.6, 0.4, ease.inOutCubic));
      U.draw($.guides[1].p, prog(t, H[0] + 0.45, 0.6, ease.inOutCubic));
      $.flows.forEach((c, i) => {
        const gd = $.guides[i % 2], f = (a * 0.22 + i * 0.37) % 1;
        const y1 = i % 2 === 0 ? gd.y0 + reach : gd.y1;
        c.setAttribute('cx', gd.gx); c.setAttribute('cy', P1(lerp(gd.y0, y1, f)));
        // 묶음 1의 바깥 안내선은 1.5줄(48px)뿐이라 점 셋이 한 덩어리로 겹친다 → 점 하나(i 0)만, 나머지 둘은 안내선이 자라는 묶음 2부터
        const on = i % 2 === 0 ? prog(t, 1.0, 0.4) * (i === 0 ? 1 : prog(t, H[0] + 0.55, 0.4)) : prog(t, H[0] + 1.0, 0.4);
        c.style.opacity = (on * Math.sin(f * Math.PI) * 0.9).toFixed(3);
      });
      // 지금 묶음 줄 강조 띠(끝 화면: skills/·evals/)
      const bandOf = k => (k === 0 ? [1, 1] : k === 1 ? [2, 5] : [7, 2]);
      const kk = t >= H[1] ? 2 : t >= H[0] ? 1 : 0;
      const A = bandOf(Math.max(0, kk - 1)), B = bandOf(kk);
      const bp = kk === 0 ? 1 : prog(t, H[kk - 1] + 0.3, 0.6, ease.inOutCubic);
      const by = G.Y + lerp(A[0], B[0], bp) * G.R, bh = lerp(A[1], B[1], bp) * G.R;
      css($.band, { top: P1(by) + 'px', height: P1(bh) + 'px' });
      show($.band, prog(t, 0.9, 0.4) * (0.6 + 0.4 * Math.sin(a * 1.6)));
    },
  });

  // ───────────────────────── 41 agent-file (drop · none · 예시) ─────────────────────────
  // 편집기에 파일 하나. 줄 번호, 칸 이름은 accent2. 줄이 타자 속도로 찍힌다
  // 한 클릭 개편: 빌드 3개 → 1개. 묶음(제목 / 언제·무엇을 / 완료·중단)을 끊지 않고 한 줄씩 이어서 찍는다.
  //   줄 시작 = 앞 줄 끝 + GAP41(같은 묶음) 또는 GAPB41(다음 묶음). 글자 간격 PER41
  const E41 = { X: 380, Y: 196, W: 1160, H: 680, LH: 72, CX: 150 };
  const T041 = 0.4, PER41 = 0.02, GAP41 = 0.1, GAPB41 = 0.2;
  const FIELD = { color: 'var(--accent2)', fontWeight: 700 }, COLON = { color: 'var(--mut)' };
  const L41 = [
    { b: 0, segs: [{ text: '# ', st: { color: 'var(--mut)' } }, { text: '근거 확인 담당', st: { fontWeight: 700, color: 'var(--ink)' } }] },
    null,
    { b: 1, segs: [{ text: '언제', st: FIELD }, { text: ': ', st: COLON }, { text: '중요한 외부 사실을 결론에 쓸 때' }] },
    { b: 1, segs: [{ text: '무엇을', st: FIELD }, { text: ': ', st: COLON }, { text: '원문과 적용 조건을 확인한다' }] },
    null,
    { b: 2, segs: [{ text: '완료', st: FIELD }, { text: ': ', st: COLON }, { text: '주장마다 근거 또는 「미확인」 표시' }] },
    { b: 2, segs: [{ text: '중단', st: FIELD }, { text: ': ', st: COLON }, { text: '조사 예산을 다 쓰면 필요한 자료를 남긴다' }] },
  ];
  DECK.slide({
    id: 'agent-file', holds: [], dur: 3.35,
    setup(el) {
      const $ = this.$, E = E41;
      const ed = $.ed = editorWin(el, E.X, E.Y, E.W, E.H);
      $.tab = T(ed.bar, '', { left: '120px', top: 0, height: BAR + 'px', padding: '0 30px 0 26px', display: 'flex', alignItems: 'center', gap: '12px', background: 'color-mix(in srgb, var(--bg1) 93%, var(--ink))', borderLeft: '2px solid var(--line2)', borderRight: '2px solid var(--line2)' }, 'a nw');
      $.tline = T($.tab, '', { left: 0, top: 0, width: '100%', height: '3px', background: 'var(--accent)', transformOrigin: '0 50%' }, 'a');
      icon($.tab, 'doc', 26, 'var(--accent2)', 1.8);
      $.tabName = typeLine($.tab, [{ text: 'agents/', st: { color: 'var(--mut)' } }, { text: 'fact-checker.md', st: { color: 'var(--ink)' } }], { position: 'relative', font: '500 28px var(--mono)' });
      $.gutter = T(ed.win, '', { left: 0, top: BAR + 'px', width: '110px', height: E.H - BAR + 'px', borderRight: '2px solid var(--line2)', background: 'color-mix(in srgb, var(--bg0) 30%, transparent)' }, 'a');
      $.hl = T(ed.win, '', { left: '110px', top: '0px', width: E.W - 110 + 'px', height: E.LH + 'px', background: 'color-mix(in srgb, var(--accent2) 8%, transparent)', opacity: 0 }, 'a');
      const y0 = BAR + 34;
      $.nums = L41.map((_, i) => T(ed.win, String(i + 1), { right: E.W - 84 + 'px', top: y0 + i * E.LH + 'px', font: `500 28px/${E.LH}px var(--mono)`, color: 'color-mix(in srgb, var(--mut) 85%, transparent)', textAlign: 'right' }));
      $.lines = L41.map((ln, i) => ln && Object.assign(typeLine(ed.win, ln.segs, { left: E.CX + 'px', top: y0 + i * E.LH + 'px', font: `500 34px/${E.LH}px var(--mono)`, color: 'var(--ink)' }), { b: ln.b, i }));
      // 줄마다 타자 시작 시각(묶음 첫 줄 시작은 $.gst[b])
      let c = T041, pb = 0;
      $.gst = [T041];
      $.lines.forEach(ln => {
        if (!ln) return;
        if (ln.b !== pb) { c += GAPB41 - GAP41; pb = ln.b; $.gst[ln.b] = c; }
        ln.st = c; c = ln.doneAt(c, PER41) + GAP41;
      });
      // 미니맵
      $.mini = T(ed.win, '', { left: E.W - 128 + 'px', top: BAR + 24 + 'px', width: '100px', height: '260px' }, 'a');
      $.miniBars = L41.map((ln, i) => ln ? T($.mini, '', { left: '6px', top: 10 + i * 18 + 'px', height: '7px', width: Math.min(84, 18 + ln.segs.reduce((n, sg) => n + sg.text.length, 0) * 3) + 'px', borderRadius: '3px', background: i === 0 ? 'color-mix(in srgb, var(--ink) 45%, transparent)' : 'color-mix(in srgb, var(--accent2) 45%, transparent)', transformOrigin: '0 50%' }, 'a') : null);
      $.read = T(ed.win, '', { left: '112px', top: '0px', width: E.W - 250 + 'px', height: '80px', background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent2) 9%, transparent) 50%, transparent)', opacity: 0 }, 'a');
      $.miniView = T($.mini, '', { left: 0, top: 0, width: '100px', height: '140px', borderRadius: '6px', background: 'color-mix(in srgb, var(--ink) 7%, transparent)', border: '1.5px solid color-mix(in srgb, var(--ink) 14%, transparent)' }, 'a');
    },
    render(t, x) {
      const $ = this.$, a = x.a, E = E41;
      show($.ed.win, Math.max(smooth(0.0, 0.3, x.arrive), prog(t, -0.2, 0.2)));
      $.tline.style.transform = `scaleX(${prog(t, 0.05, 0.45, ease.outCubic).toFixed(4)})`;
      $.tabName.type(t, 0.0, 0.025);
      // 묶음별 타자 시작(setup에서 계산한 줄 시각)
      const B0 = $.gst;
      let cursor = null, curEnd = 0;
      $.lines.forEach((ln, i) => {
        if (!ln) return;
        const st = ln.st;
        const n = ln.type(t, st, PER41);
        const end = ln.doneAt(st, PER41);
        if (t >= st) { cursor = ln; curEnd = end; }
        ln.caret.style.opacity = '0';
        show(ln.el, t >= st ? 1 : 0);
        void n;
      });
      // 줄 번호: 그 줄(또는 다음 줄)이 시작되면 보인다
      $.nums.forEach((nm, i) => {
        const ln = $.lines[i] || $.lines[i + 1];
        const st = ln ? (ln.b === 0 ? B0[0] : ln.b === 1 ? B0[1] : B0[2]) : 0;
        show(nm, prog(t, st - 0.05, 0.25, ease.linear));
      });
      if (cursor) {
        cursor.caret.style.opacity = t < curEnd ? '1' : blink(a).toFixed(2);
        css($.hl, { top: P1(BAR + 34 + cursor.i * E.LH) + 'px' });
      }
      show($.hl, prog(t, 0.4, 0.3));
      $.miniBars.forEach((mb, i) => { if (!mb) return; const ln = $.lines[i]; const st = ln.b === 0 ? B0[0] : ln.b === 1 ? B0[1] : B0[2]; const q = prog(t, st, 0.6, ease.outCubic); show(mb, q > 0 ? 1 : 0); mb.style.transform = `scaleX(${q.toFixed(4)})`; });
      show($.miniView, prog(t, 0.3, 0.4) * 0.9);
      $.miniView.style.transform = `translateY(${P1(60 - 60 * Math.cos(a * 0.55))}px)`;
      // 읽는 줄: 코드 영역을 위에서 아래로 천천히 훑는다
      const lastY = cursor ? BAR + 34 + (cursor.i + 1) * E.LH : BAR + 34 + E.LH;
      const span = lastY - (BAR + 34) + 40, sf = (a * 0.16) % 1;
      $.read.style.transform = `translateY(${P1(BAR + 34 - 60 + sf * span)}px)`;
      show($.read, prog(t, 1.0, 0.5) * Math.sin(sf * Math.PI));
    },
  });

  // ───────────────────────── 42 skill-file (slide-r · none) ─────────────────────────
  // 왼쪽 탐색기 트리(my-skill/), 오른쪽 SKILL.md 종이 미리보기(세 칸). 마지막 묶음에 원칙 한 줄
  // 한 클릭 개편: 빌드 3개 → 1개. 묶음 시작은 S42(함께 두는 파일, 원칙 한 줄)
  const F42 = [
    { d: 0, n: 'my-skill/', f: 1, b: 0 },
    { d: 1, n: 'SKILL.md', b: 0, key: 1 },
    { d: 1, n: 'reference.md', b: 1 },
    { d: 1, n: 'examples.md', b: 1 },
    { d: 1, n: 'checklist.md', b: 1 },
    { d: 1, n: 'scripts/', f: 1, b: 1 },
  ];
  const T42 = { X: 250, Y: 214, R: 78, IND: 64 };
  const PG = { x: 1010, y: 196, w: 700, h: 520 };
  const SEC = ['언제 쓰는지', '작업 순서', '기준'];
  const S42 = [1.0, 1.6];
  DECK.slide({
    id: 'skill-file', holds: [], dur: 3.3,
    // 노트: 스토리보드 노트의 「잘 된 방식은」을 「잘된 방식은」으로 고침(한 단어 '잘되다', 수정 회차 1 검수 지시). 나머지는 스토리보드 그대로
    //   한 클릭 개편: 클릭 표시 두 개를 지움(문장은 그대로)
    notes: '스킬도 폴더입니다. 가운데 파일이 SKILL.md입니다. 이 스킬을 언제 쓰는지, 작업 순서, 판단 기준을 적습니다. 옆에 참고 자료, 예시, 점검표, 실행 스크립트를 둡니다. 한 번 잘된 방식은 대화에 남기지 않고 스킬로 저장합니다. 대화는 끝나면 사라지지만 파일은 다음 작업에서 다시 읽힙니다.',
    setup(el) {
      const $ = this.$, G = T42;
      $.panel = T(el, '', { left: '190px', top: '170px', width: '700px', height: '600px', borderRadius: '20px', background: 'color-mix(in srgb, var(--bg0) 45%, var(--bg1))', border: '2px solid var(--line2)' }, 'a');
      $.svg = svgLayer(el);
      const rowY = k => G.Y + k * G.R, ix = d => G.X + d * G.IND;
      $.guide = s('path', { d: `M${ix(0) + 20} ${rowY(0) + G.R - 10} L${ix(0) + 20} ${rowY(5) + G.R / 2}`, stroke: DECK.rgba('ink', 0.22), 'stroke-width': 2, fill: 'none' }, $.svg);
      $.rows = F42.map((r, k) => {
        const y = rowY(k), x = ix(r.d);
        const row = T(el, '', { left: 0, top: y + 'px', width: '1000px', height: G.R + 'px' }, 'a');
        if (r.f) { const cv = T(row, '', { left: x - 36 + 'px', top: '23px', width: '32px', height: '32px', transform: k === 0 ? 'rotate(90deg)' : '' }, 'a'); icon(cv, 'chev', 32, 'var(--mut)', 2.4); }
        const ic = T(row, '', { left: x + 'px', top: '19px' }, 'a'); icon(ic, r.f ? 'folder' : 'doc', 40, r.f ? 'var(--accent2)' : r.key ? 'var(--ink)' : 'var(--mut)', 1.7);
        const nm = T(row, '', { left: x + 60 + 'px', top: 0, font: `${r.f || r.key ? 600 : 500} 40px/${G.R}px var(--mono)`, color: r.f || r.key ? 'var(--ink)' : 'color-mix(in srgb, var(--ink) 80%, transparent)' });
        const sp = h('span', '', nm, r.n);
        const mk = r.key ? U.mark(sp) : null;
        return { row, nm, mk, b: r.b, k };
      });
      // 연결선: SKILL.md 줄 → 미리보기
      const ky = rowY(1) + G.R / 2;
      $.link = s('path', { d: `M${ix(1) + 60 + 8 * 24 + 26} ${ky} C ${PG.x - 120} ${ky}, ${PG.x - 120} ${PG.y + 60}, ${PG.x - 6} ${PG.y + 60}`, stroke: DECK.rgba('accent', 0.75), 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '2 9', 'stroke-linecap': 'round' }, $.svg);
      $.dot = s('circle', { r: 6, fill: DECK.rgba('accent', 1) }, $.svg);
      $.smp = null;
      // 종이 미리보기
      $.page = T(el, '', { left: PG.x + 'px', top: PG.y + 'px', width: PG.w + 'px', height: PG.h + 'px', borderRadius: '14px', background: 'var(--paper)', boxShadow: '0 30px 80px rgba(0,0,0,.5)', overflow: 'hidden', transformOrigin: '0 0' }, 'a');
      T($.page, 'SKILL.md', { left: '40px', top: '26px', font: '600 30px var(--mono)', color: 'var(--paperInk2)' });
      T($.page, '', { left: '40px', top: '80px', width: PG.w - 80 + 'px', height: '2px', background: 'var(--paperLine)' }, 'a');
      $.secs = SEC.map((tx, i) => {
        const y = 112 + i * 134;
        const num = T($.page, String(i + 1), { left: '40px', top: y + 'px', width: '46px', height: '46px', borderRadius: '10px', background: 'var(--paperInk)', color: 'var(--paper)', font: '400 32px/46px var(--num)', textAlign: 'center' });
        const hd = T($.page, tx, { left: '104px', top: y - 2 + 'px', font: '800 40px/50px var(--sans)', color: 'var(--paperInk)' });
        const ls = [0, 1].map(j => T($.page, '', { left: '104px', top: y + 66 + j * 26 + 'px', height: '12px', borderRadius: '6px', width: Math.round(280 + rand(i * 3 + j, 9) * 240) + 'px', background: 'color-mix(in srgb, var(--paperInk) 14%, transparent)', transformOrigin: '0 50%' }, 'a'));
        return { num, hd, ls, y };
      });
      $.scan = T($.page, '', { left: 0, top: 0, width: PG.w + 'px', height: '56px', background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--paperInk) 9%, transparent) 50%, transparent)', opacity: 0 }, 'a');
      T($.scan, '', { left: 0, top: '14px', width: '7px', height: '28px', borderRadius: '0 4px 4px 0', background: 'var(--accent)' }, 'a');
      // 마지막 묶음: 원칙 한 줄
      $.rule = T(el, '', { left: '190px', top: '810px', font: '600 44px/1.3 var(--sans)', color: 'var(--ink)' });
      h('span', '', $.rule, '잘된 방식은 ');
      const kw = h('span', '', $.rule, '스킬로 저장한다');
      $.ruleMk = U.mark(kw);
      $.ruleIc = h('span', '', $.rule); css($.ruleIc, { display: 'inline-block', width: '50px', height: '50px', marginLeft: '22px', verticalAlign: '-8px', transformOrigin: '50% 50%' });
      icon($.ruleIc, 'check', 50, 'var(--ok)', 2.6);
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = S42, G = T42;
      show($.panel, Math.max(smooth(0.0, 0.3, x.arrive), prog(t, -0.2, 0.2)));
      show($.page, Math.max(smooth(0.1, 0.45, x.arrive), prog(t, -0.2, 0.2)));
      const pp = prog(t, 0.0, 0.6, ease.pop);
      $.page.style.transform = `translate(${P1((1 - pp) * 40)}px, 0px) rotate(${P1((1 - pp) * 1.5)}deg)`;
      U.draw($.guide, Math.max(prog(t, 0.2, 0.4) * 0.25, prog(t, H[0] + 0.1, 0.6, ease.inOutCubic)));
      $.rows.forEach((r, k) => {
        const st = r.b === 0 ? 0.1 + k * 0.15 : H[0] + 0.15 + (k - 2) * 0.12;
        up(r.row, prog(t, st, 0.45), 0, -28);
        if (r.mk) r.mk.render(t, 0.55, 0.5);
      });
      if (!$.smp) $.smp = U.sampler($.link, 80);
      U.draw($.link, prog(t, 0.6, 0.5, ease.inOutCubic)); $.link.style.opacity = t > 0.6 ? '1' : '0';
      const f = (a * 0.35) % 1, q = $.smp.at(f);
      $.dot.setAttribute('cx', P1(q[0])); $.dot.setAttribute('cy', P1(q[1]));
      $.dot.style.opacity = (prog(t, 1.1, 0.3) * Math.sin(f * Math.PI)).toFixed(3);
      $.secs.forEach((sc, i) => {
        const st = 0.55 + i * 0.16;
        popIn(sc.num, t, st, 0.45, 0.4);
        up(sc.hd, prog(t, st + 0.05, 0.45), 18);
        sc.ls.forEach((l, j) => { const p = prog(t, st + 0.2 + j * 0.06, 0.4, ease.outCubic); show(l, p > 0 ? 1 : 0); l.style.transform = `scaleX(${p.toFixed(4)})`; });
      });
      // 읽는 줄: 미리보기를 위에서 아래로 천천히 훑는다
      const sy = ((a * 0.16) % 1) * (PG.h + 60) - 60;
      $.scan.style.transform = `translateY(${P1(sy)}px)`; show($.scan, prog(t, 1.3, 0.5));
      up($.rule, prog(t, H[1] + 0.1, 0.5), 30);
      $.ruleMk.render(t, H[1] + 0.55, 0.5);
      popIn($.ruleIc, t, H[1] + 0.85, 0.45, 0.3);
    },
  });

  // ───────────────────────── 43 orchestrator (slide-r · drift) ─────────────────────────
  // 네 단계 사각 순환(시계 방향 화살표) → 가운데 workflow.md → 오른쪽 네 항목(마지막 묶음에 순환이 왼쪽으로 비켜남)
  // 한 클릭 개편: 빌드 3개 → 1개. 묶음 시작은 S43(파일 이름, 네 항목)
  const STEP = ['계획', '위임', '검토', '조정'];
  const CY = { cx: 960, cy: 560, hw: 330, hh: 205, bw: 230, bh: 104 };
  const ITEMS = ['에이전트 목록', '각자의 역할', '순서와 기준', '실패하면 다시 실행하는 규칙'];
  const S43 = [0.95, 1.6];
  DECK.slide({
    id: 'orchestrator', holds: [], dur: 3.55,
    setup(el) {
      const $ = this.$, C = CY;
      $.grp = T(el, '', { left: 0, top: 0, width: '1920px', height: '1080px', transformOrigin: `${C.cx}px ${C.cy}px` }, 'a');
      $.svg = svgLayer($.grp);
      const P = [[C.cx - C.hw, C.cy - C.hh], [C.cx + C.hw, C.cy - C.hh], [C.cx + C.hw, C.cy + C.hh], [C.cx - C.hw, C.cy + C.hh]];
      $.P = P;
      const gx = C.bw / 2 + 18, gy = C.bh / 2 + 16;
      const segs = [
        `M${P[0][0] + gx} ${P[0][1]} L${P[1][0] - gx} ${P[1][1]}`,
        `M${P[1][0]} ${P[1][1] + gy} L${P[2][0]} ${P[2][1] - gy}`,
        `M${P[2][0] - gx} ${P[2][1]} L${P[3][0] + gx} ${P[3][1]}`,
        `M${P[3][0]} ${P[3][1] - gy} L${P[0][0]} ${P[0][1] + gy}`,
      ];
      $.arrows = segs.map(d => s('path', { d, stroke: DECK.rgba('accent', 0.85), 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, $.svg));
      const heads = [[P[1][0] - gx, P[1][1], 0], [P[2][0], P[2][1] - gy, 90], [P[3][0] + gx, P[3][1], 180], [P[0][0], P[0][1] + gy, 270]];
      $.heads = heads.map(([hx, hy, r]) => s('path', { d: 'M-16 -11 L0 0 L-16 11', transform: `translate(${hx} ${hy}) rotate(${r})`, stroke: DECK.rgba('accent', 0.95), 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $.svg));
      // 둘레를 도는 점(순환)
      const loop = `M${P[0][0]} ${P[0][1]} L${P[1][0]} ${P[1][1]} L${P[2][0]} ${P[2][1]} L${P[3][0]} ${P[3][1]} Z`;
      $.loop = s('path', { d: loop, fill: 'none', stroke: 'none' }, $.svg);
      $.pk = [0, 1, 2].map(i => s('circle', { r: 9 - i * 2.5, fill: DECK.rgba('accent', 1 - i * 0.3) }, $.svg));
      $.nodes = STEP.map((nm, i) => {
        const b = T($.grp, '', { left: P[i][0] - C.bw / 2 + 'px', top: P[i][1] - C.bh / 2 + 'px', width: C.bw + 'px', height: C.bh + 'px', borderRadius: '22px',
          background: 'color-mix(in srgb, var(--bg1) 90%, var(--ink))', border: '2.5px solid var(--line)', boxShadow: '0 18px 40px rgba(0,0,0,.35)' }, 'a');
        const n = T(b, String(i + 1), { left: '20px', top: '10px', font: '400 36px/1 var(--num)', color: 'var(--accent)' });
        const tx = centerBox(T(b, nm, { top: '22px', font: 'var(--displayW) 52px/60px var(--display)', letterSpacing: '-.02em', color: 'var(--ink)' }));
        return { b, n, tx };
      });
      // 가운데 파일 이름. 아이콘은 순환 도식 층($.grp)이 아니라 슬라이드 층에 두어, 마지막 묶음에 글자와 함께 오른쪽 제목 앞으로 옮겨 간다
      $.fileIc = T(el, '', { left: C.cx - 28 + 'px', top: C.cy - 84 + 'px', width: '56px', height: '56px', transformOrigin: '0 0' }, 'a'); icon($.fileIc, 'doc', 56, 'var(--accent2)', 1.7);
      $.file = T(el, 'workflow.md', { left: C.cx - 132 + 'px', top: C.cy - 4 + 'px', font: '600 40px/50px var(--mono)', color: 'var(--accent2)', transformOrigin: '0 50%' });
      // 오른쪽 목록. 제목 아이콘은 번호 원 열(x 1150), 제목 글자는 항목 글자 열(x 1220)에 맞춘다
      $.head = T(el, '', { left: '1220px', top: '262px', font: '600 40px/50px var(--sans)', color: 'var(--ink)' });
      $.headFile = h('span', '', $.head, 'workflow.md'); css($.headFile, { font: '600 40px/50px var(--mono)', color: 'var(--accent2)', visibility: 'hidden' });
      $.headRest = h('span', '', $.head, '에 적는 네 가지');
      $.items = ITEMS.map((tx, i) => {
        const y = 370 + i * 112;
        const row = T(el, '', { left: '1150px', top: y + 'px', width: '600px', height: '92px' }, 'a');
        T(row, '', { left: 0, top: '0px', width: '580px', height: '2px', background: 'var(--line2)' }, 'a');
        const nb = T(row, String(i + 1), { left: '0px', top: '26px', width: '48px', height: '48px', borderRadius: '50%', border: '2.5px solid var(--accent)', color: 'var(--accent)', font: '400 28px/43px var(--num)', textAlign: 'center' });
        const tt = T(row, '', { left: '70px', top: '18px', font: '600 40px/60px var(--sans)', color: 'var(--ink)' });
        const sp = h('span', '', tt, tx);
        const mk = i === 3 ? U.mark(sp) : null;
        return { row, nb, tt, mk };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = S43, C = CY;
      const early = smooth(0.05, 0.45, x.arrive);
      // 마지막 묶음: 순환이 왼쪽으로 비켜나며 줄어든다
      const sh = prog(t, H[1], 0.7, ease.inOutCubic);
      $.grp.style.transform = `translate(${P1(-372 * sh)}px, ${P1(14 * sh)}px) scale(${lerp(1, 0.8, sh).toFixed(4)})`;
      $.nodes.forEach((nd, i) => {
        const st = 0.05 + i * 0.12, p = prog(t, st, 0.5, ease.pop);
        show(nd.b, Math.max(early * 0.35, prog(t, st, 0.2, ease.linear)));
        nd.b.style.transform = `scale(${lerp(0.75, 1, Math.max(p, early * 0.4)).toFixed(4)})`;
        show(nd.tx, prog(t, st + 0.05, 0.3, ease.linear)); show(nd.n, prog(t, st + 0.1, 0.3, ease.linear));
        // 둘레의 점이 지나갈 때 테두리가 밝아진다
        const ph = ((a * 0.2) % 1) * 4, d = Math.min(Math.abs(ph - i), 4 - Math.abs(ph - i));
        const hl = clamp(1 - d * 1.6) * prog(t, 1.6, 0.4);
        nd.b.style.borderColor = hl > 0.02 ? `color-mix(in srgb, var(--accent) ${(hl * 100).toFixed(0)}%, var(--line))` : '';
      });
      $.arrows.forEach((ar, i) => { const st = 0.45 + i * 0.22; U.draw(ar, prog(t, st, 0.36, ease.inOutCubic)); ar.style.opacity = t > st ? '1' : '0'; show($.heads[i], prog(t, st + 0.3, 0.12, ease.linear)); });
      if (!$.L) $.L = $.loop.getTotalLength();
      $.pk.forEach((c, i) => {
        const f = ((a * 0.2 - i * 0.012) % 1 + 1) % 1, q = $.loop.getPointAtLength(f * $.L);
        c.setAttribute('cx', P1(q.x)); c.setAttribute('cy', P1(q.y));
        c.style.opacity = (prog(t, 1.6, 0.4) * (1 - i * 0.25)).toFixed(3);
      });
      // 묶음 2: 가운데 파일 이름 / 묶음 3: 아이콘과 이름이 함께 오른쪽 제목 자리로 옮겨 간다
      //   아이콘: 56px(왼쪽 위 932·476) → 48px(왼쪽 위 1150·263, 제목 줄 가운데 y 287에 맞춤)
      const ip = prog(t, H[0] + 0.05, 0.5, ease.pop);
      show($.fileIc, prog(t, H[0] + 0.05, 0.2, ease.linear));
      const im = prog(t, H[1] + 0.02, 0.75, ease.inOutCubic);
      const isc = lerp(0.3, 1, ip) * lerp(1, 48 / 56, im);
      $.fileIc.style.transform = `translate(${P1((1150 - (C.cx - 28)) * im + 28 * (1 - isc) * (1 - im))}px, ${P1((263 - (C.cy - 84)) * im + 28 * (1 - isc) * (1 - im))}px) scale(${isc.toFixed(4)})`;
      const fp = prog(t, H[0] + 0.15, 0.5, ease.pop);
      if (!$.fx) { $.fx = { x0: C.cx - 132, y0: C.cy - 4 }; }
      const tx = 1220 - $.fx.x0, ty = 262 - $.fx.y0;
      const mv = prog(t, H[1] + 0.05, 0.75, ease.inOutCubic);
      show($.file, prog(t, H[0] + 0.15, 0.15, ease.linear));
      $.file.style.transform = `translate(${P1(tx * mv)}px, ${P1(ty * mv)}px) scale(${lerp(0.7, 1, fp).toFixed(4)})`;
      show($.headRest, prog(t, H[1] + 0.6, 0.3, ease.linear));
      show($.head, 1);
      $.items.forEach((it, i) => {
        const st = H[1] + 0.6 + i * 0.1;
        up(it.row, prog(t, st, 0.5), 0, 40);
        if (it.mk) it.mk.render(t, H[1] + 1.0, 0.55);
      });
    },
  });
  // 가운데 정렬 글자 상자(글자 폭만큼. drift로 움직여도 화면 밖으로 재지지 않게)
  function centerBox(el) { css(el, { left: '0px', right: '0px', width: 'fit-content', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }); return el; }

  // ───────────────────────── 44 q-read (push · drift) ─────────────────────────
  // 편집기 화면이 어두워지고 가운데 serif 80px 두 줄. 「읽을까요」에 형광 밑줄
  // 자리: 43번(장 원점 + 3칸, 1줄)과 같은 줄 오른쪽 한 칸. grid 줄바꿈 push(43→44)가 7,200px를 건너며
  // 크게 물러나 45·46번 화면이 먼저 보이지 않게 한다. 장 원점 { x: 0, y: 27000 }, 가로 2400, 세로 2400×0.6
  DECK.slide({
    id: 'q-read', holds: [], dur: 2.6,
    pose: { x: 4 * 2400, y: 27000 + 2400 * 0.6, z: 0 },
    setup(el) {
      const $ = this.$;
      $.back = T(el, '', { left: 0, top: 0, width: '1920px', height: '1080px', transformOrigin: '960px 540px' }, 'a');
      const ed = $.ed = editorWin($.back, 180, 170, 1560, 740);
      $.ex = explorer(ed.win, 440, 740);
      $.sk = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(j => T(ed.win, '', { left: '520px', top: 130 + j * 58 + 'px', height: '16px', borderRadius: '8px', width: Math.round(260 + rand(j, 44) * 640) + 'px', background: 'color-mix(in srgb, var(--ink) 12%, transparent)' }, 'a'));
      $.scan = T(ed.win, '', { left: '440px', top: 0, width: '1120px', height: '90px', background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent2) 14%, transparent) 50%, transparent)' }, 'a');
      $.veil = T(el, '', { left: 0, top: 0, width: '1920px', height: '1080px', background: 'radial-gradient(ellipse 60% 55% at 50% 50%, color-mix(in srgb, var(--bg0) 92%, transparent) 0%, color-mix(in srgb, var(--bg0) 70%, transparent) 100%)' }, 'a');
      $.q1 = centerBox(T(el, '파일을 만들어 두면', { top: '424px', font: '700 80px/1.3 var(--serif)', color: 'var(--ink)', letterSpacing: '-.01em' }));
      $.q2 = centerBox(T(el, '', { top: '530px', font: '700 80px/1.3 var(--serif)', color: 'var(--ink)', letterSpacing: '-.01em' }));
      h('span', '', $.q2, '에이전트가 ');
      const kw = h('span', '', $.q2, '읽을까요');
      h('span', '', $.q2, '?');
      $.mk = U.mark(kw);
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      // 들어오는 동안 편집기가 그대로 보였다가, 질문이 나오며 어두워진다
      const dim = prog(t, 0.0, 0.7, ease.inOutCubic);
      show($.back, Math.max(smooth(0.0, 0.3, x.arrive), prog(t, -0.2, 0.2)) * lerp(1, 0.4, dim));
      $.back.style.transform = U.depth(x, -0.4) + ` scale(${lerp(1, 0.94, dim).toFixed(4)})`;
      show($.veil, dim);
      const sy = ((a * 0.12) % 1) * 760 - 90;
      $.scan.style.transform = `translateY(${P1(sy)}px)`;
      up($.q1, prog(t, 0.25, 0.6), 36);
      up($.q2, prog(t, 0.4, 0.6), 36);
      $.mk.render(t, 1.05, 0.55);
    },
  });

  // ───────────────────────── 45 vercel-eval (whip · none) ─────────────────────────
  // 세로 막대 네 개(53·53 → 79·100). 마지막 묶음에 오른쪽 56%와 눈금 100칸 중 56칸
  // 한 클릭 개편: 빌드 3개 → 1개. 53·53 막대 → 79·100 막대 → 56%가 클릭 없이 이어진다. 묶음 시작은 S45
  const B45 = { base: 812, sc: 4.6, xs: [400, 610, 820, 1030], w: 150 };
  const S45 = [1.1, 1.85];
  const V45 = [
    { v: 53, lab: '문서 없음', col: 'color-mix(in srgb, var(--ink) 30%, var(--bg1))' },
    { v: 53, lab: '스킬', col: 'color-mix(in srgb, var(--ink) 30%, var(--bg1))' },
    { v: 79, lab: '스킬+<br>명시적 지시', col: 'color-mix(in srgb, var(--ink) 52%, var(--bg1))' },
    { v: 100, lab: 'AGENTS.md', mono: 1, col: 'var(--accent)' },
  ];
  DECK.slide({
    id: 'vercel-eval', holds: [], dur: 3.5,
    chrome: { source: { text: '출처: Vercel 블로그, 2026-01-27', step: 0, at: 0.6 } },
    setup(el) {
      const $ = this.$, B = B45;
      $.head = T(el, '', { left: '220px', top: '178px', font: '600 40px/1.3 var(--sans)', color: 'var(--ink)' });
      h('span', '', $.head, 'Vercel, 2026년 1월').style.color = 'var(--accent2)';
      h('span', '', $.head, ' · Next.js 16 과제 통과율');
      $.svg = svgLayer(el);
      $.grid = [0, 25, 50, 75, 100].map(v => {
        const y = B.base - v * B.sc;
        const ln = s('path', { d: `M300 ${y} L1130 ${y}`, stroke: DECK.rgba('ink', v === 0 ? 0.5 : 0.1), 'stroke-width': v === 0 ? 2.5 : 1.5, fill: 'none' }, $.svg);
        const lb = T(el, String(v), { right: 1920 - 272 + 'px', top: y - 20 + 'px', font: '500 28px/40px var(--mono)', color: 'color-mix(in srgb, var(--mut) 85%, transparent)', textAlign: 'right' });
        return { ln, lb };
      });
      $.ref = s('path', { d: `M300 ${B.base - 53 * B.sc} L1130 ${B.base - 53 * B.sc}`, stroke: DECK.rgba('ink', 0.55), 'stroke-width': 2, 'stroke-dasharray': '8 8', fill: 'none' }, $.svg);
      $.bars = V45.map((d, i) => {
        const cx = B.xs[i];
        const bar = T(el, '', { left: cx - B.w / 2 + 'px', top: B.base - d.v * B.sc + 'px', width: B.w + 'px', height: d.v * B.sc + 'px', borderRadius: '10px 10px 0 0', transformOrigin: '50% 100%', overflow: 'hidden',
          background: d.col, boxShadow: i === 3 ? '0 0 50px color-mix(in srgb, var(--accent) 30%, transparent)' : 'none' }, 'a');
        const sheen = T(bar, '', { left: 0, top: 0, width: B.w + 'px', height: '120px', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,.16), transparent)' }, 'a');
        const val = T(el, '0%', { left: cx - 120 + 'px', width: '240px', textAlign: 'center', top: '0px', font: '400 64px/1 var(--num)', color: i === 3 ? 'var(--accent)' : 'var(--ink)' }, 'a nw tnum');
        const lab = T(el, d.lab, { left: cx - 105 + 'px', width: '210px', textAlign: 'center', top: B.base + 18 + 'px', font: `${d.mono ? '600 30px/1.3 var(--mono)' : '600 30px/1.3 var(--sans)'}`, color: i === 3 ? 'var(--accent)' : 'var(--ink)' }, 'a');
        return { bar, sheen, val, lab, d };
      });
      // 오른쪽: 설명 → 56% → 눈금 100칸
      $.d1 = T(el, '스킬이 한 번도', { left: '1260px', top: '290px', font: '600 44px/1.3 var(--sans)', color: 'var(--ink)' });
      $.d2 = T(el, '호출되지 않은 평가', { left: '1260px', top: '350px', font: '600 44px/1.3 var(--sans)', color: 'var(--ink)' });
      $.n56 = T(el, '56%', { left: '1250px', top: '426px', font: '400 200px/1 var(--num)', color: 'var(--bad)', transformOrigin: '0 100%' }, 'a nw tnum');
      $.ticks = [];
      for (let i = 0; i < 100; i++) $.ticks.push(T(el, '', { left: 1262 + i * 4.8 + 'px', top: '690px', width: '3px', height: '54px', borderRadius: '1.5px', background: i < 56 ? 'var(--bad)' : 'color-mix(in srgb, var(--ink) 26%, transparent)', transformOrigin: '50% 100%' }, 'a'));
      $.tickCap = T(el, '', { left: '1262px', top: '760px', width: '476px', height: '2px', background: 'var(--line)' }, 'a');
      $.br = s('path', { d: 'M1262 778 L1262 790 L1529 790 L1529 778', stroke: DECK.rgba('bad', 0.8), 'stroke-width': 2.5, fill: 'none' }, $.svg);
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = S45, B = B45;
      const early = smooth(0.05, 0.5, x.arrive);
      fadeUp($.head, t, 0.0);
      $.grid.forEach((g, i) => { show(g.lb, Math.max(early * 0.6, prog(t, 0.05 + i * 0.04, 0.3))); g.ln.style.opacity = Math.max(early * 0.6, prog(t, 0.05, 0.4)).toFixed(3); });
      const starts = [0.35, 0.5, H[0] + 0.15, H[0] + 0.32];
      $.bars.forEach((b, i) => {
        const st = starts[i], sp = t < st ? 0 : clamp(spring(t, st, 1.6, 0.55), 0, 1.08);
        b.bar.style.transform = `scaleY(${sp.toFixed(4)})`;
        show(b.bar, t >= st ? 1 : 0);
        const vh = b.d.v * B.sc * sp;
        b.val.textContent = Math.round(b.d.v * prog(t, st, 0.8, ease.outQuart)) + '%';
        css(b.val, { top: P1(B.base - vh - 78) + 'px' });
        show(b.val, prog(t, st + 0.05, 0.2, ease.linear));
        show(b.lab, Math.max(early * 0.5, prog(t, st - 0.1, 0.3)));
        b.lab.style.opacity = (Math.max(early * 0.45, prog(t, st - 0.1, 0.3))).toFixed(3);
        const f = ((a * 0.25 + i * 0.23) % 1);
        b.sheen.style.transform = `translateY(${P1(lerp(b.d.v * B.sc, -120, f))}px)`;
      });
      // 같은 높이 표시: 53% 점선(앞 두 막대가 선 뒤, 뒤 두 막대가 나오기 전에 그린다)
      U.draw($.ref, prog(t, 0.75, 0.4, ease.inOutCubic)); $.ref.style.opacity = (t > 0.75 ? 1 - 0.6 * prog(t, H[0] + 0.3, 0.4) : 0).toFixed(3);
      // 마지막 묶음: 앞 막대는 흐려지고 오른쪽에 56%
      const dim = prog(t, H[1], 0.5);
      $.bars.forEach(b => { b.bar.style.filter = dim > 0.01 ? `saturate(${(1 - 0.3 * dim).toFixed(3)}) brightness(${(1 - 0.15 * dim).toFixed(3)})` : 'none'; });
      up($.d1, prog(t, H[1] + 0.1, 0.5), 24); up($.d2, prog(t, H[1] + 0.2, 0.5), 24);
      const np = prog(t, H[1] + 0.35, 0.5, ease.pop);
      $.n56.textContent = Math.round(56 * prog(t, H[1] + 0.35, 0.85, ease.outQuart)) + '%';
      show($.n56, prog(t, H[1] + 0.35, 0.15, ease.linear)); $.n56.style.transform = `translateY(${P1((1 - np) * 40)}px) scale(${lerp(0.8, 1, np).toFixed(4)})`;
      const scanX = ((a * 0.3) % 1.4) * 100;
      $.ticks.forEach((tk, i) => {
        const p = prog(t, H[1] + 0.45 + i * 0.005, 0.3, ease.outCubic);
        const near = Math.exp(-Math.abs(i - scanX) / 3) * prog(t, H[1] + 1.3, 0.3);
        tk.style.transform = `scaleY(${(p * (1 + 0.35 * near)).toFixed(4)})`;
        show(tk, p > 0 ? 1 : 0);
      });
      show($.tickCap, prog(t, H[1] + 0.45, 0.4));
      U.draw($.br, prog(t, H[1] + 0.85, 0.45, ease.inOutCubic)); $.br.style.opacity = t > H[1] + 0.85 ? '1' : '0';
    },
  });

  // ───────────────────────── 46 called (push · none) ─────────────────────────
  // display 72px 왼쪽 정렬. 둘째 묶음에 첫 문장이 위로 비켜나고, 아래에 CLAUDE.md · AGENTS.md. 오른쪽: 세션을 시작할 때 도구마다 먼저 읽히는 파일(Claude Code는 CLAUDE.md, Codex 등은 AGENTS.md)
  // 한 클릭 개편: 빌드 2개 → 1개. 둘째 묶음 시작은 S46. 첫 문장은 비켜날 때 0.78까지만 옅어져 끝 화면에서도 읽힌다(이전 0.5)
  const S46 = 0.95;
  DECK.slide({
    id: 'called', holds: [], dur: 2.85,
    setup(el) {
      const $ = this.$;
      const F = 'var(--displayW) 72px/1.25 var(--display)';
      // 첫 묶음 움직임: 첫 문장 뒤를 왼쪽에서 오른쪽으로 지나는 옅은 읽기 띠(글자는 움직이지 않음). 첫 문장보다 먼저 넣어 글자 뒤에 깔린다
      $.sweep = T(el, '', { left: '0px', top: '0px', width: '240px', height: '104px', borderRadius: '12px', background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 13%, transparent), transparent)', opacity: 0 }, 'a');
      $.l1 = T(el, '', { left: '200px', top: '0px', font: F, letterSpacing: '-.025em', color: 'var(--ink)' });
      h('span', '', $.l1, '지침은 '); $.mk1 = U.mark(h('span', '', $.l1, '읽혀야')); h('span', '', $.l1, ' 효과가 있습니다.');
      $.l2 = T(el, '꼭 지켜야 하는 것은', { left: '200px', top: '372px', font: F, letterSpacing: '-.025em', color: 'var(--ink)' });
      $.l3 = T(el, '', { left: '200px', top: '464px', font: F, letterSpacing: '-.025em', color: 'var(--ink)' });
      $.mk2 = U.mark(h('span', '', $.l3, '항상 읽히는 파일')); h('span', '', $.l3, '에 둡니다.');
      $.chips = [['CLAUDE.md', 'var(--accent)'], ['AGENTS.md', 'var(--accent2)']].map(([nm, c], i) => {
        const b = T(el, '', { left: 200 + i * 420 + 'px', top: '640px', width: '390px', height: '96px', borderRadius: '16px', background: 'color-mix(in srgb, var(--bg1) 92%, var(--ink))', border: `2.5px solid ${c}`, overflow: 'hidden' }, 'a');
        const ic = T(b, '', { left: '26px', top: '26px' }, 'a'); icon(ic, 'doc', 44, c, 1.8);
        T(b, nm, { left: '90px', top: '0px', font: '600 40px/92px var(--mono)', color: 'var(--ink)' });
        const sw = T(b, '', { left: '-140px', top: 0, width: '140px', height: '96px', background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${c} 26%, transparent), transparent)` }, 'a');
        return { b, sw };
      });
      // 세션 줄: 줄마다 노랑·파랑 칸(두 파일, 칩 테두리 색과 같음)이 먼저 오고 그 뒤에 대화 막대
      // 수정 회차 1: 줄 묶음 위에 설명을 넣고, 칩과 함께 둘째 묶음에서만 보인다
      $.cap = T(el, '도구마다 먼저 읽히는 파일', { left: '1250px', top: '291px', font: '500 30px/1.3 var(--sans)', color: 'var(--mut)' });
      $.sess = T(el, '', { left: '1250px', top: '360px', width: '470px', height: '470px', overflow: 'hidden' }, 'a');
      $.rows = [0, 1, 2, 3, 4, 5, 6].map(i => {
        const r = T($.sess, '', { left: 0, top: '0px', width: '470px', height: '52px' }, 'a');
        T(r, '', { left: 0, top: '10px', width: '32px', height: '32px', borderRadius: '7px', background: 'var(--accent)' }, 'a');
        T(r, '', { left: '42px', top: '10px', width: '32px', height: '32px', borderRadius: '7px', background: 'var(--accent2)' }, 'a');
        const n = 2 + Math.floor(rand(i, 71) * 3);
        let xx = 92;
        for (let j = 0; j < n; j++) { const w = 40 + rand(i * 5 + j, 72) * 90; if (xx + w > 460) break; T(r, '', { left: P1(xx) + 'px', top: '19px', width: P1(w) + 'px', height: '14px', borderRadius: '7px', background: 'color-mix(in srgb, var(--ink) 18%, transparent)' }, 'a'); xx += w + 12; }
        return r;
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = [S46];
      // 첫 묶음: 첫 문장 가운데 높이 / 둘째 묶음: 위로 비켜나며 조금 옅어진다(끝 화면에서도 읽히게 0.78)
      const mv = prog(t, H[0], 0.6, ease.inOutCubic);
      // 수정 회차 1: 줄 묶음을 첫 묶음에서 숨겼으므로 들어오는 밀기 동안 첫 문장을 먼저 보인다(전환 35·50% 빈 판 방지)
      const p1 = Math.max(prog(t, 0.0, 0.6), smooth(0.0, 0.4, x.arrive));
      const l1y = lerp(470, 196, mv);
      css($.l1, { top: P1(l1y) + 'px', opacity: (p1 * lerp(1, 0.78, mv)).toFixed(3), transform: `translateY(${P1((1 - p1) * 36)}px)` });
      $.mk1.render(t, 0.55, 0.5);
      // 읽기 띠: 첫 문장이 가운데 있는 동안 문장 위를 지나고, 둘째 묶음으로 넘어가면 사라진다
      const sf = (a * 0.28) % 1;
      css($.sweep, { top: P1(l1y - 7) + 'px', transform: `translateX(${P1(150 + sf * 940)}px)`, opacity: (prog(t, 0.9, 0.4) * (1 - prog(t, H[0], 0.3)) * Math.sin(sf * Math.PI)).toFixed(3) });
      up($.l2, prog(t, H[0] + 0.3, 0.55), 36);
      up($.l3, prog(t, H[0] + 0.42, 0.55), 36);
      $.mk2.render(t, H[0] + 0.95, 0.55);
      $.chips.forEach((c, i) => {
        up(c.b, prog(t, H[0] + 0.7 + i * 0.1, 0.5), 30);
        const f = ((a * 0.32 - i * 0.12) % 1 + 1) % 1;
        c.sw.style.transform = `translateX(${P1(f * 680)}px)`;
        c.sw.style.opacity = prog(t, H[0] + 1.3, 0.3).toFixed(3);
      });
      // 세션 줄: 아래에서 하나씩 올라오며 위로 흘러간다(멈춘 동안에도)
      // 수정 회차 1: 첫 묶음에서는 숨기고(칩이 없을 때 뜻 없는 도형이 되던 것), 둘째 묶음에서 칩과 함께 설명과 띄운다
      show($.sess, prog(t, H[0] + 0.7, 0.45));
      up($.cap, prog(t, H[0] + 0.75, 0.5), 0, -24);
      const sp = 66, flow = a * 0.45;
      $.rows.forEach((r, i) => {
        const pos = ((i - flow) % 7 + 7) % 7;
        const y = pos * sp;
        r.style.transform = `translateY(${P1(y)}px)`;
        r.style.opacity = (clamp(1 - Math.abs(y - 200) / 260) * 0.95).toFixed(3);
      });
    },
  });

  // ───────────────────────── 47 d0-tools (drop · dolly-in) ─────────────────────────
  // 작은 사각 17개 → 15개가 떨어지고 2개만 남는다 → 성공 건수 · 실행 시간 막대 → 오른쪽 아래 표본 표시
  // 한 클릭 개편: 빌드 3개 → 1개. 첫 묶음(솟음·떨어짐·제목)을 0.4초쯤 당기고, 다음 묶음 시작은 S47
  const TOOLS47 = ['search', 'code', 'db', 'doc', 'folder', 'gear', 'tool', 'eye', 'lock', 'flag', 'list', 'pen', 'chart', 'chat', 'bolt', 'layers', 'target'];
  const KEEP47 = [6, 12];
  const S47 = [1.6, 2.3];
  DECK.slide({
    id: 'd0-tools', holds: [], dur: 3.5,
    chrome: { source: { text: '출처: Vercel 블로그, 2025-12-22', step: 0, at: 0.6 } },
    setup(el) {
      const $ = this.$;
      $.top = T(el, '', { left: 0, top: 0, width: '1920px', height: '1080px' }, 'a');
      $.src = T($.top, 'Vercel d0, 2025년 12월', { left: '240px', top: '232px', font: '600 36px/1.3 var(--sans)', color: 'var(--accent2)' });
      $.sq = TOOLS47.map((nm, i) => {
        const keep = KEEP47.includes(i);
        const b = T($.top, '', { left: 240 + i * 86 + 'px', top: '310px', width: '66px', height: '66px', borderRadius: '14px', background: keep ? 'color-mix(in srgb, var(--accent) 22%, var(--bg1))' : 'color-mix(in srgb, var(--bg1) 88%, var(--ink))', border: `2px solid ${keep ? 'var(--accent)' : 'var(--line)'}`, transformOrigin: '50% 50%' }, 'a');
        const ic = T(b, '', { left: '15px', top: '15px' }, 'a'); icon(ic, nm, 32, keep ? 'var(--accent)' : 'var(--mut)', 1.8);
        return { b, keep, i };
      });
      $.hl = T($.top, '', { left: '440px', top: '302px', font: 'var(--displayW) 72px/80px var(--display)', letterSpacing: '-.02em', color: 'var(--ink)' });
      h('span', '', $.hl, '도구 ');
      $.n17 = h('span', '', $.hl, '17개'); css($.n17, { color: 'var(--mut)', textDecorationColor: 'var(--bad)', textDecorationThickness: '5px' });
      h('span', '', $.hl, ' → ');
      $.n2 = h('span', '', $.hl, '2개'); css($.n2, { color: 'var(--accent)' });
      // 왼쪽: 성공 건수(원 다섯 개 두 줄)
      $.okRows = [[1, 1, 1, 1, 0], [1, 1, 1, 1, 1]].map((pat, r) => {
        const y = 470 + r * 124;
        const dots = pat.map((ok, j) => {
          const d = T(el, '', { left: 240 + j * 66 + 'px', top: y + 'px', width: '52px', height: '52px', borderRadius: '50%', background: ok ? 'color-mix(in srgb, var(--ok) 85%, var(--bg1))' : 'transparent', border: ok ? 'none' : '3px solid var(--bad)', transformOrigin: '50% 50%' }, 'a');
          const ic = T(d, '', { left: ok ? '10px' : '7px', top: ok ? '10px' : '7px' }, 'a'); icon(ic, ok ? 'check' : 'x', 32, ok ? 'var(--bg0)' : 'var(--bad)', 3);
          return d;
        });
        const tx = T(el, r === 0 ? '질의 5건 중 4건 성공' : '→ 5건 성공', { left: '600px', top: y - 2 + 'px', font: `600 40px/56px var(--sans)`, color: r === 0 ? 'var(--ink)' : 'var(--ok)' });
        return { dots, tx };
      });
      $.box = s('rect', { x: 222, y: 452, width: 352, height: 212, rx: 18, fill: 'none', stroke: DECK.rgba('mut', 0.9), 'stroke-width': 2.5, 'stroke-dasharray': '10 9' }, svgLayer(el));
      // 오른쪽: 실행 시간 막대
      const PX = 2.2;
      $.tm = [[274.8, '평균 274.8초', 'color-mix(in srgb, var(--ink) 34%, var(--bg1))', 'var(--ink)'], [77.4, '→ 77.4초', 'var(--accent)', 'var(--accent)']].map(([v, lab, col, tc], r) => {
        const y = 440 + r * 124;
        const tx = T(el, lab, { left: '1060px', top: y + 'px', font: '600 40px/50px var(--sans)', color: tc });
        const bar = T(el, '', { left: '1060px', top: y + 62 + 'px', width: P1(v * PX) + 'px', height: '40px', borderRadius: '8px', transformOrigin: '0 50%',
          backgroundImage: `repeating-linear-gradient(115deg, rgba(255,255,255,.12) 0 10px, transparent 10px 26px), linear-gradient(${col}, ${col})` }, 'a');
        return { tx, bar, v };
      });
      // 표본 표시: 점선 상자(성공 건수 원 열 개) 바로 아래에 붙여 상자와 한 묶음으로 읽히게 한다
      $.sample = T(el, '', { left: '222px', top: '686px', font: '500 32px/48px var(--sans)', color: 'var(--mut)', display: 'flex', alignItems: 'center', gap: '12px' }, 'a nw');
      const si = h('span', '', $.sample); icon(si, 'eye', 34, 'var(--mut)', 1.8);
      h('span', '', $.sample, '표본은 질의 5건');
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = S47;
      const early = smooth(0.05, 0.5, x.arrive);
      fadeUp($.src, t, 0.0);
      // 첫 묶음은 화면 가운데 높이, 둘째 묶음에서 위로 비켜난다
      $.top.style.transform = `translateY(${P1(190 * (1 - prog(t, H[0], 0.6, ease.inOutCubic)))}px)`;
      // 사각 17개: 들어오는 동안 윤곽 → 차례로 솟음 → 15개 떨어짐 → 남은 2개가 왼쪽으로
      const cut = 0.85, glide = prog(t, 1.15, 0.5, ease.inOutCubic);
      $.sq.forEach(q => {
        const pin = prog(t, 0.1 + q.i * 0.025, 0.4, ease.pop);
        let op = Math.max(early * 0.3, prog(t, 0.1 + q.i * 0.025, 0.15, ease.linear)), dx = 0, dy = (1 - pin) * 30, rot = 0, sc = lerp(0.6, 1, Math.max(pin, early * 0.5));
        if (!q.keep) {
          const d0 = cut + ((q.i * 7) % 17) * 0.015, f = prog(t, d0, 0.45, ease.inCubic);
          dy += f * 260; rot = (rand(q.i, 5) - 0.5) * 70 * f; op *= 1 - f; sc *= lerp(1, 0.7, f);
        } else {
          const k = KEEP47.indexOf(q.i);
          dx = (240 + k * 86 - (240 + q.i * 86)) * glide;
          dy -= 6 * Math.sin(a * 1.4 + k) * prog(t, 1.7, 0.3);
        }
        show(q.b, op);
        q.b.style.transform = `translate(${P1(dx)}px, ${P1(dy)}px) rotate(${P1(rot)}deg) scale(${sc.toFixed(4)})`;
      });
      up($.hl, prog(t, 1.35, 0.5), 0, -30);
      // 축약 속성(textDecoration)을 쓰면 setup에서 준 색·두께가 초기화되므로 줄 종류만 바꾼다
      $.n17.style.textDecorationLine = t > 1.7 ? 'line-through' : 'none';
      // 둘째 묶음
      $.okRows.forEach((r, ri) => {
        r.dots.forEach((d, j) => { const st = H[0] + 0.15 + ri * 0.3 + j * 0.06; popIn(d, t, st, 0.4, 0.3); });
        up(r.tx, prog(t, H[0] + 0.35 + ri * 0.3, 0.45), 0, -24);
      });
      $.tm.forEach((m, r) => {
        const st = H[0] + 0.3 + r * 0.3;
        up(m.tx, prog(t, st, 0.45), 18);
        const g = prog(t, st + 0.1, 0.8, ease.outExpo);
        m.bar.style.transform = `scaleX(${g.toFixed(4)})`; show(m.bar, g > 0 ? 1 : 0);
        m.bar.style.backgroundPosition = `${P1(a * (r ? 60 : 16))}px 0, 0 0`;
      });
      // 마지막 묶음: 점선 상자가 원 열 개를 두르고, 그 아래로 표본 표시가 내려온다
      up($.sample, prog(t, H[1] + 0.3, 0.5), -22);
      $.box.style.opacity = prog(t, H[1] + 0.1, 0.4).toFixed(3);
      $.box.style.strokeDashoffset = P1(-a * 12);
    },
  });

  // ───────────────────────── 48 stripe (slide-r · drift) ─────────────────────────
  // 점 400개(20×20) 가운데 일부만 켜지고 에이전트 점 하나에 연결된다. 둘째 묶음에 1,000+
  // 한 클릭 개편: 빌드 2개 → 1개. 둘째 묶음 시작은 S48
  const G48 = { x: 228, y: 300, p: 24, n: 20, ax: 900, ay: 528 };
  const S48 = 1.45;
  DECK.slide({
    id: 'stripe', holds: [], dur: 2.8,
    chrome: { source: { text: '출처: Stripe 공식 글, 2026-02-09', step: 0, at: 0.6 } },
    setup(el) {
      const $ = this.$, G = G48;
      const sv = $.svg = svgLayer(el);
      $.rowsG = [];
      for (let r = 0; r < G.n; r++) {
        const g = s('g', {}, sv);
        for (let c = 0; c < G.n; c++) s('circle', { cx: G.x + c * G.p, cy: G.y + r * G.p, r: 4, fill: DECK.rgba('ink', 0.28) }, g);
        $.rowsG.push(g);
      }
      // 켜지는 점: 고른 일부(16개)
      const pick = [];
      for (let i = 0; pick.length < 16 && i < 400; i++) { const k = Math.floor(rand(i, 81) * 400); if (!pick.includes(k)) pick.push(k); }
      $.links = pick.map((k, i) => {
        const r = Math.floor(k / G.n), c = k % G.n, px = G.x + c * G.p, py = G.y + r * G.p;
        const mx = (px + G.ax) / 2 + 60, my = (py + G.ay) / 2;
        const ln = s('path', { d: `M${px} ${py} Q ${mx} ${py}, ${G.ax - 58} ${G.ay + (py - G.ay) * 0.12}`, stroke: DECK.rgba('accent', 0.5), 'stroke-width': 2, fill: 'none' }, sv);
        const dot = s('circle', { cx: px, cy: py, r: 7, fill: DECK.rgba('accent', 1) }, sv);
        const pk = s('circle', { r: 4.5, fill: DECK.rgba('accent', 1) }, sv);
        return { ln, dot, pk, smp: null, i };
      });
      $.ring = s('circle', { cx: G.ax, cy: G.ay, r: 60, fill: 'none', stroke: DECK.rgba('accent2', 0.6), 'stroke-width': 2 }, sv);
      $.agent = T(el, '', { left: G.ax - 58 + 'px', top: G.ay - 58 + 'px', width: '116px', height: '116px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent2) 18%, var(--bg1))', border: '3px solid var(--accent2)', transformOrigin: '50% 50%' }, 'a');
      const ic = T($.agent, '', { left: '27px', top: '27px' }, 'a'); icon(ic, 'agent', 56, 'var(--accent2)', 1.8);
      // 산출: 에이전트에서 오른쪽으로 나가는 작은 사각
      // 이동 거리가 50px로 짧아져 다섯 개면 겹쳐 한 덩어리로 보인다. 세 개(12px)를 16px 간격으로 흘린다
      $.outs = [0, 1, 2].map(() => T(el, '', { left: G.ax + 70 + 'px', top: G.ay - 6 + 'px', width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent)' }, 'a'));
      $.src = T(el, 'Stripe, 2026년 2월', { left: '1080px', top: '200px', font: '600 36px/1.3 var(--sans)', color: 'var(--accent2)' });
      $.t1 = T(el, '사내 도구 400개 이상', { left: '1080px', top: '268px', font: 'var(--displayW) 64px/1.2 var(--display)', letterSpacing: '-.02em', color: 'var(--ink)' });
      $.t2 = T(el, '', { left: '1080px', top: '366px', font: '600 42px/1.3 var(--sans)', color: 'var(--ink)' });
      h('span', '', $.t2, '에이전트에는 '); $.mk = U.mark(h('span', '', $.t2, '고른 일부만')); h('span', '', $.t2, ' 연결');
      $.big = T(el, '1,000+', { left: '1072px', top: '494px', font: '400 170px/1 var(--num)', color: 'var(--accent)', transformOrigin: '0 100%' }, 'a nw tnum');
      $.t3 = T(el, '매주 코드 변경 1,000건 넘게 제출', { left: '1080px', top: '690px', font: '600 44px/1.3 var(--sans)', color: 'var(--ink)' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = [S48], G = G48;
      const early = smooth(0.05, 0.5, x.arrive);
      $.rowsG.forEach((g, r) => { g.style.opacity = Math.max(early * 0.6, prog(t, 0.05 + r * 0.025, 0.3, ease.linear)).toFixed(3); });
      popIn($.agent, t, 0.5, 0.5, 0.4);
      $.ring.setAttribute('r', P1(60 + ((a * 0.5) % 1) * 70));
      $.ring.style.opacity = (prog(t, 1.0, 0.3) * (1 - ((a * 0.5) % 1)) * 0.8).toFixed(3);
      $.links.forEach(L => {
        const st = 0.7 + L.i * 0.03;
        const dp = prog(t, st, 0.35, ease.pop);
        L.dot.setAttribute('r', P1(7 * dp)); L.dot.style.opacity = dp > 0 ? '1' : '0';
        U.draw(L.ln, prog(t, st + 0.15, 0.5, ease.inOutCubic)); L.ln.style.opacity = t > st + 0.15 ? '1' : '0';
        if (!L.smp) L.smp = U.sampler(L.ln, 40);
        const f = (a * 0.4 + rand(L.i, 83)) % 1, q = L.smp.at(f);
        L.pk.setAttribute('cx', P1(q[0])); L.pk.setAttribute('cy', P1(q[1]));
        L.pk.style.opacity = (prog(t, 1.6, 0.4) * Math.sin(f * Math.PI)).toFixed(3);
      });
      fadeUp($.src, t, 0.0);
      fadeUp($.t1, t, 0.15, 0.6, 36);
      fadeUp($.t2, t, 0.35, 0.6, 30);
      $.mk.render(t, 1.2, 0.5);
      // 둘째 묶음
      const bp = prog(t, H[0] + 0.1, 0.5, ease.pop);
      show($.big, prog(t, H[0] + 0.1, 0.15, ease.linear));
      $.big.style.transform = `translateY(${P1((1 - bp) * 50)}px) scale(${lerp(0.8, 1, bp).toFixed(4)})`;
      fadeUp($.t3, t, H[0] + 0.4, 0.55, 30);
      $.outs.forEach((o, i) => {
        // 사각은 x 1040(1,000+ 왼쪽 끝 1072)에 닿기 전에 사라진다: 이동 50px, f 0.8에서 투명도 0
        const f = ((a * 0.55 + i / 3) % 1);
        o.style.transform = `translateX(${P1(f * 50)}px) rotate(${P1(f * 90)}deg)`;
        o.style.opacity = (prog(t, H[0] + 0.3, 0.3) * Math.sin(Math.min(1, f / 0.8) * Math.PI)).toFixed(3);
      });
    },
  });

  // ───────────────────────── 49 context-rot (slide-r · none) ─────────────────────────
  // 왼쪽: 대화 기록 띠가 아래로 길어지고 위쪽 줄이 흐려진다. 가운데: 증상 주석 넷. 오른쪽: 뜻과 설명
  // 한 클릭 개편: 빌드 3개 → 1개. 묶음 시작은 B49(길어질 때 생기는 일, 증상 네 가지)
  const S49 = { x: 200, y: 176, w: 300, h1: 360, h2: 724 };
  const B49 = [0.9, 1.75];
  const MSG = [];
  (function () {
    let y = 18;
    for (let i = 0; i < 26; i++) {
      const user = i % 3 === 0, n = user ? 1 : 1 + Math.floor(rand(i, 91) * 2.4);
      const hh = 14 + n * 20;
      const w = user ? 120 + rand(i, 92) * 80 : 170 + rand(i, 93) * 90;
      MSG.push({ i, user, n, y, hh, w: i === 7 ? MSG[5].w : w });
      y += hh + 14;
    }
  })();
  // 증상 주석: 가리키는 메시지 번호
  const SYM = [
    { tx: '예전 내용을 계속 씀', m: [1] },
    { tx: '바뀐 요구를 놓침', m: [3] },
    { tx: '설명이 중복됨', m: [5, 7] },
    { tx: '작은 오류가 쌓임', m: [8, 10] },
  ];
  DECK.slide({
    id: 'context-rot', holds: [], dur: 3.4,
    // 출처는 둘째 묶음(길어질 때 생기는 일)과 함께 나온다(이전 step 1)
    chrome: { source: { text: '출처: Anthropic 컨텍스트 엔지니어링 글(2025-09-29)', step: 0, at: 1.1 } },
    // 노트: 스토리보드 노트에서 「이름 붙인 현상」을 「다룬 현상」으로 바꿈(리더 결정, 보완 회차). 그 글은 앞선 연구의 개념을 인용한다.
    // 비평 반영 회차: 첫 클릭 표시 뒤 첫 문장과 마지막 문장을 리더가 고른 문장으로 바꿈
    // 수정 회차 1: 「모델이 지금 보고 있는」(의인화)을 「모델에 지금 입력된」으로 바꿈(화면 문구와 노트 둘째 문장, 검수 지시)
    // 한 클릭 개편: 클릭 표시 두 개를 지움(문장은 그대로)
    notes: '읽을 것을 줄여야 하는 이유입니다. 컨텍스트는 모델에 지금 입력된 글 전체입니다. 대화, 파일, 도구 결과가 다 들어갑니다. 이것이 길어지면 앞부분에 있던 내용을 답에 정확히 반영하는 비율이 떨어집니다. Anthropic이 작년 9월 글에서 다룬 현상입니다. 증상은 네 가지입니다. 예전 내용을 계속 쓰고, 바뀐 요구를 놓치고, 같은 설명을 반복하고, 작은 오류가 쌓입니다. 긴 대화 끝에 AI가 앞에서 정한 조건을 놓친 적이 있다면 이 현상입니다.',
    setup(el) {
      const $ = this.$, S = S49;
      $.strip = T(el, '', { left: S.x + 'px', top: S.y + 'px', width: S.w + 'px', height: S.h1 + 'px', borderRadius: '20px', overflow: 'hidden', background: 'color-mix(in srgb, var(--bg0) 50%, var(--bg1))', border: '2px solid var(--line)' }, 'a');
      $.msgs = MSG.map(m => {
        const dup = m.i === 5 || m.i === 7, req = m.i === 3;
        const b = T($.strip, '', { left: m.user ? S.w - 20 - m.w + 'px' : '20px', top: m.y + 'px', width: P1(m.w) + 'px', height: m.hh + 'px', borderRadius: '10px',
          background: m.user ? 'color-mix(in srgb, var(--accent2) 22%, transparent)' : 'color-mix(in srgb, var(--ink) 9%, transparent)', border: req ? '2.5px solid var(--accent2)' : dup ? '2px solid color-mix(in srgb, var(--accent) 70%, transparent)' : 'none' }, 'a');
        for (let j = 0; j < m.n; j++) T(b, '', { left: '12px', top: 10 + j * 20 + 'px', height: '9px', borderRadius: '4.5px', width: P1((m.w - 24) * (j === m.n - 1 && m.n > 1 ? 0.6 : 0.92)) + 'px', background: m.user ? 'color-mix(in srgb, var(--accent2) 60%, transparent)' : 'color-mix(in srgb, var(--ink) 40%, transparent)' }, 'a');
        let err = null;
        if (m.i === 8 || m.i === 10) err = T(b, '', { right: '8px', top: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bad)', opacity: 0 }, 'a');
        return Object.assign({ b, err }, m);
      });
      $.att = T($.strip, '', { left: 0, top: 0, width: S.w + 'px', height: '130px', background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--ink) 15%, transparent) 50%, transparent)', opacity: 0 }, 'a');
      $.typing = [0, 1, 2].map(i => T($.strip, '', { left: 30 + i * 18 + 'px', top: '0px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--ink)' }, 'a'));
      // 오른쪽 글
      $.k = T(el, '컨텍스트', { left: '1060px', top: '186px', font: 'var(--displayW) 76px/1.2 var(--display)', letterSpacing: '-.02em', color: 'var(--ink)' });
      $.d = T(el, '모델에 지금 입력된 글 전체', { left: '1060px', top: '290px', font: '500 42px/1.3 var(--sans)', color: 'var(--ink)' });
      $.e1 = T(el, '길어질수록 앞부분 내용을', { left: '1060px', top: '430px', font: '500 42px/1.3 var(--sans)', color: 'var(--ink)' });
      $.e2 = T(el, '', { left: '1060px', top: '490px', font: '500 42px/1.3 var(--sans)', color: 'var(--ink)' });
      h('span', '', $.e2, '반영하는 '); $.mk = U.mark(h('span', '', $.e2, '정확도가 떨어진다'));
      // 증상 주석
      $.svg = svgLayer(el);
      $.tags = SYM.map((sy, i) => {
        const y = 300 + i * 152;
        const tg = T(el, '', { left: '590px', top: y - 34 + 'px', height: '68px', padding: '0 24px 0 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px',
          background: 'color-mix(in srgb, var(--bg1) 92%, var(--ink))', border: `2px solid ${i === 3 ? 'color-mix(in srgb, var(--bad) 70%, transparent)' : 'var(--line)'}` }, 'a nw');
        T(tg, String(i + 1), { font: '400 30px/1 var(--num)', color: i === 3 ? 'var(--bad)' : 'var(--accent)' }, 'nw');
        T(tg, sy.tx, { font: '600 36px/1 var(--sans)', color: 'var(--ink)' }, 'nw');
        const lines = sy.m.map(mi => {
          const m = MSG[mi], ty = S.y + m.y + m.hh / 2, tx = S.x + (m.user ? S.w - 20 : 20 + m.w);
          return s('path', { d: `M590 ${y} C 556 ${y}, ${tx + 40} ${ty}, ${tx + 4} ${ty}`, stroke: DECK.rgba(i === 3 ? 'bad' : 'accent', 0.75), 'stroke-width': 2.5, fill: 'none' }, $.svg);
        });
        const ends = sy.m.map(mi => { const m = MSG[mi]; return s('circle', { cx: S.x + (m.user ? S.w - 20 : 20 + m.w) + 4, cy: S.y + m.y + m.hh / 2, r: 6, fill: DECK.rgba(i === 3 ? 'bad' : 'accent', 1) }, $.svg); });
        return { tg, lines, ends };
      });
      // 「예전 내용을 계속 씀」: 위쪽 메시지에서 아래 메시지로 되돌아오는 화살표
      const m0 = MSG[1], m1 = MSG[10];
      $.back = s('path', { d: `M${S.x + 8} ${S.y + m0.y + m0.hh / 2} C ${S.x - 60} ${S.y + m0.y + 120}, ${S.x - 60} ${S.y + m1.y - 60}, ${S.x + 8} ${S.y + m1.y + m1.hh / 2}`, stroke: DECK.rgba('accent', 0.7), 'stroke-width': 2.5, fill: 'none', 'stroke-dasharray': '6 8' }, $.svg);
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = B49, S = S49;
      show($.strip, Math.max(smooth(0.0, 0.35, x.arrive), prog(t, -0.2, 0.2)));
      // 띠 길이: 첫 묶음 → 둘째 묶음에서 아래로 길어진다
      const gp = prog(t, H[0] + 0.1, 0.9, ease.inOutCubic);
      const sh = lerp(S.h1, S.h2, gp);
      $.strip.style.height = P1(sh) + 'px';
      const fill = prog(t, 0.05, 1.0, ease.linear) * S.h1 + gp * (S.h2 - S.h1);
      const bottom = Math.min(sh, fill) - 30;
      $.msgs.forEach(m => {
        const vis = m.y + m.hh <= bottom ? 1 : 0;
        const dist = bottom - (m.y + m.hh);
        const op = vis * lerp(0.14, 1, clamp(1 - dist / 620));
        const pin = clamp((bottom - (m.y + m.hh)) / 40);
        m.b.style.opacity = op.toFixed(3);
        m.b.style.transform = `translateY(${P1((1 - pin) * 10)}px)`;
        if (m.err) { const ep = prog(t, H[1] + 0.9 + (m.i - 8) * 0.06, 0.3, ease.pop); m.err.style.opacity = (ep * (0.75 + 0.25 * Math.sin(a * 3 + m.i))).toFixed(3); m.err.style.transform = `scale(${ep.toFixed(3)})`; }
      });
      // 아래에서 위로 올라가며 옅어지는 띠(앞쪽일수록 덜 보인다)
      const af = (a * 0.2) % 1;
      css($.att, { transform: `translateY(${P1(bottom - 60 - af * (bottom + 60))}px)`, opacity: (prog(t, 0.8, 0.4) * (0.4 + 0.6 * (1 - af))).toFixed(3) });
      // 입력 중 표시(멈춘 동안에도 움직임)
      $.typing.forEach((d, i) => { css(d, { top: P1(bottom + 6) + 'px', opacity: (0.25 + 0.6 * Math.max(0, Math.sin(a * 4 - i * 0.7))).toFixed(3) }); });
      // 제목 「컨텍스트」는 들어오는 밀기 동안 먼저 보인다(평면 밀기 35·50%에서 대화 띠 틀만 보이던 것을 고침)
      up($.k, Math.max(prog(t, 0.1, 0.55), smooth(0.0, 0.4, x.arrive)), 30);
      fadeUp($.d, t, 0.3, 0.55, 26);
      fadeUp($.e1, t, H[0] + 0.2, 0.55, 26); fadeUp($.e2, t, H[0] + 0.32, 0.55, 26);
      $.mk.render(t, H[0] + 0.8, 0.5);
      // 마지막 묶음: 주석
      $.tags.forEach((g, i) => {
        const st = H[1] + 0.1 + i * 0.15;
        up(g.tg, prog(t, st, 0.45), 0, 30);
        g.lines.forEach((l, j) => { U.draw(l, prog(t, st + 0.15 + j * 0.08, 0.45, ease.inOutCubic)); l.style.opacity = t > st + 0.15 ? '1' : '0'; });
        g.ends.forEach(e => { e.style.opacity = prog(t, st + 0.5, 0.2).toFixed(3); });
      });
      U.draw($.back, prog(t, H[1] + 0.35, 0.6, ease.inOutCubic)); $.back.style.opacity = t > H[1] + 0.35 ? '1' : '0';
    },
  });

  // ───────────────────────── 50 context-cmds (push · none) ─────────────────────────
  // 두 열 표. 왼쪽 상황(body 40px), 오른쪽 명령(mono 40px, accent2). 앞 세 줄은 대화 안, 뒤 두 줄은 다시 시작할 때
  // 한 클릭 개편: 빌드 2개 → 1개. 뒤 두 줄 묶음 시작은 S50
  const CMDS = [
    ['지금 상태가 궁금할 때', '/context'], ['새 주제를 시작할 때', '/clear'], ['대화가 길어졌을 때', '/compact'],
    ['방금 하던 일을 이어서', 'claude --continue'], ['저장된 세션을 골라서', 'claude --resume'],
  ];
  const S50 = 0.95;
  DECK.slide({
    id: 'context-cmds', holds: [], dur: 2.5,
    // 노트: 스토리보드 노트에서 끝의 괄호 메모(철자 대조 할 일)를 지움. 명령 다섯 개는 리더가 확인함(비평 반영 회차)
    //   한 클릭 개편: 클릭 표시를 지움(문장은 그대로)
    notes: 'Claude Code에서 쓰는 명령입니다. 지금 무엇이 들어 있는지 보려면 context, 새 주제로 넘어갈 때는 clear, 길어졌을 때는 compact입니다. compact는 목표, 결정, 제약, 할 일을 남기고 요약합니다. 터미널을 닫았다가 다시 열 때는 continue로 방금 하던 일을 잇고, resume으로 저장된 작업을 골라 엽니다. 습관 하나만 권합니다. 한 세션에는 한 주제만 둡니다.',
    setup(el) {
      const $ = this.$;
      const rowY = i => 214 + i * 116 + (i >= 3 ? 56 : 0);
      $.band = T(el, '', { left: '330px', top: '0px', width: '1400px', height: '100px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent2) 7%, transparent)', opacity: 0 }, 'a');
      $.rows = CMDS.map(([sit, cmd], i) => {
        const y = rowY(i);
        const ln = T(el, '', { left: '330px', top: y + 104 + 'px', width: '1400px', height: '2px', background: i === 2 ? 'var(--line)' : 'var(--line2)', transformOrigin: '0 50%' }, 'a');
        const s1 = T(el, sit, { left: '330px', top: y + 'px', font: '500 40px/104px var(--sans)', color: 'var(--ink)' });
        const c = typeLine(el, [{ text: cmd }], { left: '1080px', top: y + 'px', font: '600 40px/104px var(--mono)', color: 'var(--accent2)' }, 'var(--accent2)');
        return { ln, s1, c, y };
      });
      $.groups = [['chat', 0, 2], ['term', 3, 4]].map(([ic, a0, a1]) => {
        const y0 = rowY(a0) + 14, y1 = rowY(a1) + 90;
        const g = T(el, '', { left: '196px', top: y0 + 'px', width: '96px', height: y1 - y0 + 'px' }, 'a');
        T(g, '', { left: '82px', top: '0px', width: '4px', height: y1 - y0 + 'px', borderRadius: '2px', background: ic === 'chat' ? 'var(--accent)' : 'var(--accent2)', transformOrigin: '50% 0' }, 'a');
        const b = T(g, '', { left: '0px', top: (y1 - y0) / 2 - 32 + 'px', width: '64px', height: '64px', borderRadius: '16px', background: 'color-mix(in srgb, var(--bg1) 90%, var(--ink))', border: '2px solid var(--line)' }, 'a');
        const ii = T(b, '', { left: '13px', top: '13px' }, 'a'); icon(ii, ic, 36, ic === 'chat' ? 'var(--accent)' : 'var(--accent2)', 1.8);
        return g;
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = [S50];
      const early = smooth(0.05, 0.5, x.arrive);
      let last = null, lastEnd = 0;
      $.rows.forEach((r, i) => {
        const st = i < 3 ? 0.1 + i * 0.22 : H[0] + 0.1 + (i - 3) * 0.25;
        const lp = prog(t, st - 0.05, 0.5, ease.outCubic);
        r.ln.style.transform = `scaleX(${Math.max(lp, early * 0.999).toFixed(4)})`;
        r.ln.style.opacity = Math.max(lp, early * 0.5).toFixed(3);
        up(r.s1, prog(t, st, 0.45), 0, -26);
        r.c.type(t, st + 0.25, 0.035);
        r.c.caret.style.opacity = '0';
        if (t >= st + 0.25) { last = r; lastEnd = r.c.doneAt(st + 0.25, 0.035); }
      });
      if (last) last.c.caret.style.opacity = t < lastEnd ? '1' : blink(a).toFixed(2);
      // 첫 묶음 표시(대화 아이콘·세로 막대)는 들어오는 밀기 동안 먼저 보인다(평면 밀기 35·50%에서 옅은 줄만 보이던 것을 고침)
      $.groups.forEach((g, i) => { if (i === 0) up(g, Math.max(prog(t, 0.05, 0.5), smooth(0.0, 0.4, x.arrive)), 20); else fadeUp(g, t, H[0] + 0.05, 0.5, 20); });
      // 강조 띠가 줄 사이를 천천히 오간다(멈춘 동안의 움직임). 표를 읽을 수 있게 아주 옅게
      const n = t >= H[0] ? 5 : 3, ph = (0.5 - 0.5 * Math.cos(a * 0.3)) * (n - 1);
      const k0 = Math.floor(ph), k1 = Math.min(n - 1, k0 + 1), f = ph - k0;
      css($.band, { top: P1(lerp($.rows[k0].y, $.rows[k1].y, f) + 2) + 'px' });
      show($.band, prog(t, 1.0, 0.5));
    },
  });

  // ───────────────────────── 51 recap-parts (rise · none) ─────────────────────────
  // 왼쪽 파일 트리(셋째 줄까지 확인 표시, 구성.md에 밑줄), 오른쪽 요약. 오른쪽 아래에 서류철 세 개 사진(어둡게)
  // 한 클릭 개편: 빌드 2개 → 1개. 파일 트리 시각(at 0, each 0.1, markAt 1.0, checkAt 1.15)은 그대로 두고,
  //   이전 둘째 빌드의 덧붙이는 한 줄을 S51에 이어서 띄운다. 끝 화면 구성은 이전과 같다(다음 영상 v04_team 첫 프레임과 cut)
  const S51 = 1.45;
  DECK.slide({
    id: 'recap-parts', holds: [], dur: 2.5,
    // 노트: 스토리보드 노트의 「셋째 파일 정리입니다」에 파일 이름을 붙임(비평 반영 회차 공통 규칙 4, 장을 파일 이름으로 부른다)
    //   한 클릭 개편: 클릭 표시를 지움(문장은 그대로)
    notes: '셋째 파일, 구성.md 정리입니다. 역할, 방법, 순서를 파일에 적습니다. 그리고 그 파일이 읽히는 자리에 두고, 도구와 읽을 것은 줄입니다. 여기까지가 에이전트 하나의 이야기입니다. 이제 여럿으로 넘어갑니다.',
    setup(el) {
      const $ = this.$;
      $.photo = T(el, '', { left: '900px', top: '596px', width: '1060px', height: '596px', overflow: 'hidden', transformOrigin: '30% 30%',
        maskImage: 'linear-gradient(90deg, transparent 0%, #000 22%, #000 100%), linear-gradient(180deg, transparent 0%, #000 30%)', webkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 34%)' }, 'a');
      const im = U.image($.photo, 'assets/img/kv_parts.png', { x: 0, y: 0, w: 1060, h: 596, radius: 0 });
      $.im = im;
      if (!im.missing) DECK.preload(new Promise(r => { const g = im.img; if (g.complete) r(); else { g.addEventListener('load', r, { once: true }); g.addEventListener('error', r, { once: true }); } }));
      $.shade = T($.photo, '', { left: 0, top: 0, width: '1060px', height: '596px', background: 'linear-gradient(90deg, var(--bg0) 0%, color-mix(in srgb, var(--bg0) 40%, transparent) 40%, color-mix(in srgb, var(--bg0) 55%, transparent) 100%)' }, 'a');
      $.tree = U.fileTree(el, { preset: 'side', current: 3, done: 3, at: 0, each: 0.1, markAt: 1.0, checkAt: 1.15 });
      $.k = T(el, '구성.md', { left: '640px', top: '330px', font: '600 38px/1.3 var(--mono)', color: 'var(--accent)' });
      $.h = T(el, '', { left: '640px', top: '398px', font: 'var(--displayW) 68px/1.2 var(--display)', letterSpacing: '-.025em', color: 'var(--ink)' });
      h('span', '', $.h, '역할·방법·순서를 '); $.mk = U.mark(h('span', '', $.h, '파일')); h('span', '', $.h, '에 적는다');
      $.sub = T(el, '읽히는 곳에 두고, 도구와 읽을 것은 줄인다', { left: '640px', top: '528px', font: '500 44px/1.3 var(--sans)', color: 'var(--ink)' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, H = [S51];
      show($.photo, Math.max(smooth(0.0, 0.4, x.arrive), prog(t, -0.2, 0.3)) * 0.85);
      $.photo.style.transform = `translate(${P1(-30 * Math.sin(a * 0.4))}px, ${P1(-12 * Math.sin(a * 0.3))}px) scale(${(1.05 + 0.03 * Math.sin(a * 0.33)).toFixed(4)})`;
      // 파일 트리 줄은 들어오는 밀기 동안 찍힌다(평면 밀기 35%에서 빈 바탕이던 것을 고침). 0.98은 줄 일곱 개가 다 찍히고
      // 밑줄(markAt 1.0)·확인 표시(checkAt 1.15) 전인 시각이다. 밑줄·확인 표시는 그대로 t로 그려져 효과음 시각(공통 E)이 바뀌지 않는다
      $.tree.render(Math.max(t, 0.98 * smooth(0.0, 0.3, x.arrive)));
      fadeUp($.k, t, 0.25); fadeUp($.h, t, 0.35, 0.6, 32);
      $.mk.render(t, 1.15, 0.5);
      fadeUp($.sub, t, H[0] + 0.1, 0.55, 28);
    },
  });
})();

