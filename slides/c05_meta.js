/* 5장 자동구성.md — 슬라이드 66~77 (v-meta · why-meta · one-line · phases · output · levels · run-modes ·
 * workflow-limits · evolve · stars · harness-100 · recap-meta)
 * 아트 디렉션: 청사진. 흰 선으로 그려지는 상자와 선, 청색(accent2) 보조선·치수선·이동하는 점, mono 터미널 입력 줄.
 * 장 바탕은 엔진 blueprint(어두운 바탕에 옅은 accent 모눈)다. 67·77도 사진을 깔지 않고 이 바탕을 그대로 쓴다.
 * 67의 첫 화면(빈 상자 네 개, 340×200, x 190·590·990·1390, y 440)은 v05_meta 마지막 프레임(포스터)과 같은 자리이고 x.arrive 0부터 보인다.
 * 77의 마지막 빌드는 v06_cases 첫 프레임(같은 바탕, U.fileTree side 프리셋)과 이어진다.
 * 노트는 스토리보드 notes를 옮겼고, 67·74번은 리더가 정한 문구(2026-11-16 보완 회차)로 덮어쓴다.
 * 69번 첫 문장과 75번 괄호 안 한 문장은 검수 지시(수정 회차 1)로 바꿨다. 카메라 값은 스토리보드에서 읽는다.
 * 덱 비평 반영 회차(2026-11-16): 67·68·69·70·72번 노트와 67번 제목·70번 요청 줄·72번 보조 줄·74번 변경 이력을 리더 목록대로 고쳤다.
 * 앞 장은 장 번호 대신 파일 이름(구성.md·팀.md)으로 가리킨다.
 * 74번 노트 마지막 문장과 11-16 두 행은 카드에 보이는 행에 맞춰 검수 지시대로 바꿨다(덱 비평 뒤 수정 회차 1).
 * 한 클릭 개편(2026-11-16): 67~77번을 빌드 1개(holds [])로 바꾸고, 클릭마다 나오던 묶음을 클릭 없이 0.4~0.7초 간격으로 이어 3~4초 안에
 * 다 나오게 시각만 당겼다. 노트의 [클릭]을 지웠다(문장은 그대로). 69번 track은 cameraHook으로 앞 세 단계 확대 → 전체로 물러난다.
 */
(function () {
  'use strict';
  const { ease, prog, clamp, lerp, rand, css, h, s, show, smooth } = DECK;
  const W = 1920, H = 1080, TAU = Math.PI * 2;
  const f1 = v => v.toFixed(1), f3 = v => v.toFixed(3);
  const mod = (v, m) => ((v % m) + m) % m;   // x.a는 도착 전 음수일 수 있어 항상 양수 나머지를 쓴다
  const fr = v => v - Math.floor(v);

  const NOTES = {
    'v-meta': '(영상 14초. 끝나면: 방금 보신 한 줄이 제가 만든 도구의 사용법 전부입니다.)',
    'why-meta': '에이전트 팀을 직접 구성해 보면 네 가지에서 시간이 오래 걸립니다. 역할을 어떻게 나눌지, 스킬에 무엇을 적을지, 누가 조율할지, 어떻게 검증할지입니다. 특히 뒤의 두 가지가 자주 빠집니다. 저도 여섯 번째 팀을 직접 만들다가 같은 일을 반복한다는 것을 알았습니다. (연사 확인)',
    'one-line': '그래서 팀을 구성하는 일 자체를 스킬로 만들었습니다. 이름이 하네스입니다. 사용법은 요청 한 줄입니다. 타워 디펜스 웹 게임을 만들고 싶다, 에이전트는 열 개 이상으로 해 달라. 그러면 에이전트 열두 개, 스킬 네 개, 오케스트레이터 하나가 파일로 생깁니다. 이 게임은 뒤 사례에서 다시 나옵니다. 게임은 기획, 그림, 구현, 테스트로 나뉘는 일이 많아 열 개 넘게 나눴습니다. 처음에는 셋에서 다섯으로 시작하셔도 됩니다.',
    'phases': '이 한 줄을 받으면 하네스가 여섯 단계를 차례로 진행합니다. 먼저 어떤 분야의 일인지 분석하고, 팀 구조를 고르고, 에이전트 정의 파일을 만듭니다. 이어서 스킬을 만들고, 조율 규칙으로 묶고, 마지막에 시험 실행으로 검증합니다. 팀.md에서 본 여섯 가지 구조 가운데 무엇을 쓸지도 둘째 단계에서 정합니다. 앞뒤로 기존 구성을 점검하는 단계와 하네스를 고쳐 나가는 진화 단계가 더 있습니다. 진화는 잠시 뒤에 봅니다.',
    'output': '결과는 구성.md에서 본 것과 같은 모양의 폴더입니다. agents 아래에 역할 파일이 생깁니다. skills 아래에 작업 방법 파일이 생깁니다. 사람이 열어서 읽고 고칠 수 있는 글 파일입니다. 자동으로 만든 것은 초안이고, 고치는 것은 사람입니다.',
    'levels': '정리하면 스킬에 세 층이 있습니다. 첫째 층은 작업 하나를 하는 스킬입니다. 이미지 한 장 만들기 같은 것입니다. 둘째 층은 여러 에이전트가 협업하는 워크플로, 곧 하네스입니다. 셋째 층은 그 하네스를 생성하는 스킬입니다. 방금 보신 것이 셋째 층입니다.',
    'run-modes': '생성된 팀을 실행하는 방식은 세 가지입니다. 순서가 정해진 일은 워크플로로, 수정 요청이 오가는 일은 팀원이 남아 있는 지속 협업으로 합니다. 한 번 맡기고 끝나는 일은 서브에이전트로 합니다. 팀.md의 표에서 본 방식들입니다.',
    'workflow-limits': '워크플로는 올해 5월 말에 연구 미리보기로 나온 기능입니다. Claude가 순서를 스크립트로 쓰고, 그 스크립트가 서브에이전트를 실행합니다. 기본으로 열여섯 개가 동시에 돌고, 실행 한 번에 최대 천 개까지 됩니다. 스물다섯 개를 넘거나 토큰 150만을 넘길 것 같으면 먼저 경고합니다. 한도와 경고가 기능 안에 들어 있다는 점을 봐 주십시오. 요청서의 일곱째 칸, 한도입니다.',
    'evolve': '처음 구성이 끝이 아닙니다. 실제로 써 보면 고칠 곳이 나옵니다. 달라진 점을 기록하고, evolve 명령으로 하네스에 반영해 다음 판을 만듭니다. 이 발표 자료를 만든 하네스에도 변경 이력이 날짜별로 남아 있습니다. 처음 구성한 날부터, 슬라이드 전환 방식을 바꾼 날, 검사 규칙을 더한 날까지 날짜와 함께 적혀 있습니다.',
    'stars': '이 스킬은 올해 3월 말에 공개했습니다. Star가 구천삼백 개를 넘었습니다. 아래 적힌 날짜에 조회한 값입니다. 숫자보다 중요한 것은 쓰는 분들이 보내 주는 수정 요청입니다. QR로 들어가시면 설치 명령 두 줄이 있습니다. (Star·Fork는 발표 당일 아침 다시 조회해 화면 숫자를 고친다. 조회일 표기도 함께 고친다. 「계속 급증」이라는 표현은 쓰지 않는다.)',
    'harness-100': '직접 구성하기 전에 가져다 쓰셔도 됩니다. 하네스 백 개를 열 개 분야로 모아 뒀습니다. 문서, 비즈니스, 교육, 데이터, 법률 같은 분야입니다. 에이전트 정의가 사백팔십구 개, 스킬이 삼백십오 개 들어 있습니다. 원하는 폴더를 복사해서 시작합니다. 한국어로 쓸 수 있습니다.',
    'recap-meta': '다섯째 파일 정리입니다. 팀 구성도 한 줄로 요청합니다. 만들어진 파일은 사람이 읽고 고칩니다. 이제 이렇게 만든 팀이 낸 결과물을 보겠습니다.',
  };
  // 출처 줄: 발표자 본인 자료(이전 발표, revfactory 저장소·README, 프로젝트 CLAUDE.md)는 표기하지 않는다(발표자 지시).
  // 이 장에서 chrome.source가 남는 슬라이드는 외부 문서를 근거로 한 73번 하나다.

  // ───────────── 장 전용 도우미 ─────────────
  const pal = () => ({ ink: DECK.color('ink'), mut: DECK.color('mut'), acc: DECK.color('accent'), acc2: DECK.color('accent2'), ok: DECK.color('ok'), bad: DECK.color('bad'), bg0: DECK.color('bg0'), bg1: DECK.color('bg1') });
  const rg = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${(+a).toFixed(3)})`;
  const div = (parent, style, html, cls = 'a') => { const e = h('div', cls, parent, html); if (style) css(e, style); return e; };
  const layer = parent => h('div', 'full', parent);
  function svgIn(parent) {
    const sv = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, parent);
    css(sv, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible' });
    return sv;
  }
  const line = (sv, d, stroke, sw = 3, extra) => s('path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra || {}), sv);
  const rrect = (x, y, w, hh, r = 0) => (r
    ? `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + hh - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + hh}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + hh - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
    : `M${x} ${y}H${x + w}V${y + hh}H${x}Z`);
  // 선 그리기. 0일 때는 숨긴다(둥근 선 끝이 점으로 남지 않게)
  const draw = (p, v) => { U.draw(p, v); const vis = v > 0.001 ? '' : 'hidden'; if (p.style.visibility !== vis) p.style.visibility = vis; };
  const circ = (cx, cy, r) => `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}Z`;
  const DISP = sz => `var(--displayW, 900) ${sz}px/1.12 var(--display)`;
  const BODY = (sz, w = 600) => `${w} ${sz}px/1.3 var(--sans)`;
  const MONO = (sz, w = 500) => `${w} ${sz}px/1.4 var(--mono)`;
  function fadeUp(el, t, start, dur = 0.5, dy = 26) {
    const p = prog(t, start, dur);
    show(el, p);
    el.style.transform = `translateY(${f1((1 - p) * dy)}px)`;
    return p;
  }
  function popIn(el, t, start, dur = 0.5, from = 0.7) {
    const p = prog(t, start, dur, ease.pop);
    show(el, prog(t, start, dur * 0.4, ease.linear));
    el.style.transform = `scale(${f3(lerp(from, 1, p))})`;
    return p;
  }
  // 머묾 카메라를 이 층에서 비율 f만큼 지운다. f 1 = U.pin(x)(이동·회전·확대 모두 지움), f 0 = 그대로(카메라를 따름).
  // 1920×1080 전체 층(transform-origin 기본값 = 슬라이드 가운데)에 쓴다
  function pinMix(x, f) {
    const c = (x && x.cam) || {}, k = DECK.P / Math.max(50, DECK.P + (c.dz || 0));
    if (f <= 0) return 'none';
    return `translate(${((c.dx || 0) * f).toFixed(2)}px, ${((c.dy || 0) * f).toFixed(2)}px) rotate(${((c.rz || 0) * f).toFixed(4)}deg) scale(${Math.pow(1 / k, f).toFixed(5)})`;
  }
  // 들어오는 카메라 이동 동안 미리 보이는 정도(0부터 보이게)
  const pre = x => lerp(0.45, 1, smooth(0, 0.6, x.arrive));
  // 꺾은선 위 위치(p 0→1)
  function poly(pts) {
    const seg = [];
    let L = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    return {
      L,
      at(p) {
        let d = clamp(p) * L;
        for (let i = 0; i < seg.length; i++) {
          if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? clamp(d / seg[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; }
          d -= seg[i];
        }
        return pts[pts.length - 1];
      },
    };
  }
  // 빛나는 점(이동하는 패킷·펜 끝)
  function dot(sv, col, r = 7) {
    const g = s('g', {}, sv);
    s('circle', { r: r * 2.6, fill: rg(col, 0.16) }, g);
    s('circle', { r, fill: rg(col, 1) }, g);
    g.style.opacity = '0';
    return {
      g,
      at(x, y, o = 1, k = 1) { g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${f3(k)})`); g.style.opacity = f3(clamp(o)); },
    };
  }
  // 한 글자씩 찍히는 줄(글자마다 span, 칸은 처음부터 잡아 둔다 → 줄 폭이 바뀌지 않음)
  function typeLine(parent, text, style) {
    const el = div(parent, Object.assign({ whiteSpace: 'pre' }, style));
    const seg = new Intl.Segmenter('ko', { granularity: 'grapheme' });
    const chars = [...seg.segment(text)].map(g => { const c = h('span', '', el); c.textContent = g.segment; return c; });
    const edges = chars.map(c => c.offsetLeft + c.offsetWidth);
    return {
      el, chars, n: chars.length, edges,
      set(k) { chars.forEach((c, j) => { const v = j < k ? '' : 'hidden'; if (c.style.visibility !== v) c.style.visibility = v; }); },
      edge(k) { return k <= 0 ? 0 : edges[Math.min(k, chars.length) - 1]; },
    };
  }
  // 제도용 평행자: 눈금 달린 가로선이 아주 느리게 위에서 아래로 지나간다(머묾 동안의 움직임)
  function tSquare(parent, x0, x1, y0, y1, col) {
    const sv = svgIn(parent);
    const g = s('g', {}, sv);
    line(g, `M${x0} 0H${x1}`, rg(col, 0.5), 1.6);
    let tk = '';
    for (let x = x0, i = 0; x <= x1; x += 24, i++) tk += `M${x} 0V${i % 5 === 0 ? 14 : 7}`;
    line(g, tk, rg(col, 0.42), 1.3);
    return {
      sv,
      render(a, vis = 1) {
        const span = y1 - y0, u = mod(a * 34, span + 160) - 80;
        const y = y0 + u, edge = clamp(Math.min(u + 80, span + 80 - u) / 140);
        g.setAttribute('transform', `translate(0 ${f1(y)})`);
        g.style.opacity = f3(vis * edge);
      },
    };
  }

  // ───────────── 66 v-meta: 장 전환 영상 ─────────────
  DECK.videoSlide({ id: 'v-meta', video: 'v05_meta', notes: NOTES['v-meta'] });

  // ───────────── 67 why-meta: 직접 구성할 때 어려운 네 가지 ─────────────
  // 상자 네 개는 v05_meta 마지막 프레임(포스터)과 같은 자리·모양이다: 340×200, x 190·590·990·1390, y 440, 흰 선 3px, 모서리 12.
  // 바탕은 장 바탕 blueprint 그대로(사진·덮개 없음). 상자는 x.arrive 0부터 다 그려진 상태로 보인다.
  const BW67 = 340, BH67 = 200, BY67 = 440, BR67 = 12;
  const B67 = [
    { x: 190, lab: ['역할을', '어떻게 나눌지'] },
    { x: 590, lab: ['스킬에', '무엇을 적을지'] },
    { x: 990, lab: ['조율 규칙'], miss: true },
    { x: 1390, lab: ['검증 절차'], miss: true },
  ];
  const DIM67 = 404;   // 상자 줄 위 치수선 y
  DECK.slide({
    id: 'why-meta', holds: [], dur: 3.0, notes: NOTES['why-meta'],
    setup(el) {
      const $ = this.$, c = $.c = pal();
      // 상자·치수선·이름은 한 층(눈금이 상자 모서리와 어긋나지 않게)
      $.mid = layer(el);
      const sv = $.sv = svgIn($.mid);
      // 치수선: 상자 줄 위에 청색 보조선, 상자 모서리마다 눈금
      let dd = `M${B67[0].x} ${DIM67}H${B67[3].x + BW67}`;
      B67.forEach(b => { dd += `M${b.x} ${DIM67 - 9}V${DIM67 + 9}M${b.x + BW67} ${DIM67 - 9}V${DIM67 + 9}`; });
      $.dim = line(sv, dd, rg(c.acc2, 0.5), 2, { 'stroke-linecap': 'butt' });
      $.dimDot = dot(sv, c.acc2, 6);
      B67.forEach((b, i) => {
        b.glow = s('path', { d: rrect(b.x, BY67, BW67, BH67, BR67), fill: rg(c.acc2, 0.12) }, sv);
        b.glow.style.opacity = '0';
        if (b.miss) {
          b.fill = s('path', { d: rrect(b.x, BY67, BW67, BH67, BR67), fill: rg(c.bad, 0.13) }, sv);
          b.fill.style.opacity = '0';
          b.dash = line(sv, rrect(b.x, BY67, BW67, BH67, BR67), rg(c.bad, 1), 4, { 'stroke-dasharray': '18 12', 'stroke-linecap': 'butt' });
          b.dash.style.opacity = '0';
        }
        b.solid = line(sv, rrect(b.x, BY67, BW67, BH67, BR67), rg(c.ink, 1), 3);
        b.idx = div($.mid, { left: b.x + 22 + 'px', top: BY67 + 16 + 'px', font: MONO(28, 600), color: 'var(--accent2)', opacity: 0 }, '0' + (i + 1));
        const lh = 50, cy = BY67 + BH67 / 2 + 12;
        b.labEl = div($.mid, { left: '0px', top: f1(cy - (b.lab.length * lh) / 2) + 'px', textAlign: 'center', font: BODY(38, 700), lineHeight: lh + 'px', color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, b.lab.join('<br>'));
        b.labEl.style.left = f1(b.x + (BW67 - b.labEl.offsetWidth) / 2) + 'px';
      });
      // 둘째 묶음: 3·4번 상자를 묶는 괄호와 문장
      const bx0 = B67[2].x + BW67 / 2, bx1 = B67[3].x + BW67 / 2, bm = (bx0 + bx1) / 2;
      $.brace = line(sv, `M${bx0} ${BY67 + BH67 + 18}V${BY67 + BH67 + 38}H${bx1}V${BY67 + BH67 + 18}M${bm} ${BY67 + BH67 + 38}V${BY67 + BH67 + 54}`, rg(c.bad, 0.95), 3, { 'stroke-linecap': 'butt' });
      $.note = div($.mid, { left: '0px', top: BY67 + BH67 + 66 + 'px', font: BODY(46, 700), lineHeight: '60px', color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '뒤의 두 가지가 자주 빠진다');
      $.note.style.left = f1(bm - $.note.offsetWidth / 2) + 'px';
      $.mk = U.mark($.note, { word: '자주 빠진다' });
      // 제목(앞 층): 상자 줄 위 왼쪽, 첫 상자와 왼쪽 끝을 맞춘다
      $.front = layer(el);
      $.title = U.rise($.front, '직접 구성할 때 어려운 네 가지', { left: B67[0].x + 'px', top: '236px', font: DISP(72), letterSpacing: '-.03em', color: 'var(--ink)', whiteSpace: 'nowrap' });
    },
    render(t, x) {
      // 한 클릭 개편(2026-11-16): 빌드 1개. 둘째 묶음(3·4번 점선·괄호·문장)은 앞 묶음 이름이 거의 다 나온 1.05초에 이어서 나온다
      const $ = this.$, a = x.a, c = $.c, H1 = 1.05;
      // 상자 층은 첫 묶음 동안 drift(이동·회전 rz·확대)를 모두 지워 화면에 고정한다(영상 마지막 프레임과 같은 자리).
      // U.depth(x, -1)은 회전을 남겨 첫 화면에서 상자 끝이 4px 기울었다(2026-11-16 측정) → U.pin과 같은 식을 비율 f로 섞는다.
      // 둘째 묶음이 시작되면 1.2초에 걸쳐 drift를 따르게 풀어 준다
      $.mid.style.transform = pinMix(x, 1 - prog(t, H1, 1.2, ease.inOutSine));
      $.front.style.transform = U.depth(x, 0.35);
      $.title.render(t, 0.05, { each: 0.04 });
      // 치수선: 도착 뒤 왼쪽에서 오른쪽으로 그어진다
      draw($.dim, prog(t, 0.35, 0.7, ease.inOutCubic));
      const miss = prog(t, H1 + 0.05, 0.45, ease.inOutCubic), dim = prog(t, H1 + 0.05, 0.5);
      // 머묾: 치수선 위를 점이 오가고, 점 아래 상자 안이 옅게 밝아진다(5초에 한 번 왕복)
      const on = prog(t, 1.2, 0.5, ease.linear), u = fr(a / 5), q = ease.inOutSine(u < 0.5 ? u * 2 : 2 - u * 2);
      const px = lerp(B67[0].x, B67[3].x + BW67, q);
      $.dimDot.at(px, DIM67, on * lerp(1, 0.6, dim));
      $.dim.style.opacity = f3(lerp(1, 0.6, dim));
      B67.forEach((b, i) => {
        const st = 0.22 + i * 0.12;
        show(b.idx, prog(t, st, 0.3));
        fadeUp(b.labEl, t, st + 0.08, 0.45, 18);
        // 상자 안 밝아짐은 둘째 묶음 전까지만(그 뒤에는 3·4번 점선이 움직인다)
        const inBox = on * clamp(Math.min(px - b.x, b.x + BW67 - px) / 60);
        b.glow.style.opacity = f3(inBox * (1 - dim));
        if (b.miss) {
          b.solid.style.opacity = f3(lerp(1, 0.12, miss));
          b.dash.style.opacity = f3(miss);
          b.dash.style.strokeDashoffset = f1(-a * 24);
          b.fill.style.opacity = f3(miss * (0.7 + 0.3 * Math.sin(a * 2.2 + i)));
        } else {
          // 둘째 묶음: 앞 두 상자 선은 흐려져 3·4번에 시선이 가게 한다. 이름은 끝 화면에서도 읽히게 덜 흐린다(0.62)
          const k = lerp(1, 0.5, dim), kt = lerp(1, 0.62, dim);
          b.solid.style.opacity = f3(k); b.labEl.style.opacity = f3(prog(t, st + 0.08, 0.45) * kt); b.idx.style.opacity = f3(prog(t, st, 0.3) * kt);
        }
      });
      draw($.brace, prog(t, H1 + 0.25, 0.45, ease.inOutCubic));
      fadeUp($.note, t, H1 + 0.45, 0.5, 22);
      $.mk.render(t, H1 + 1.0, 0.5);
    },
  });

  // ───────────── 68 one-line: 한 줄 요청이 팀 구성이 된다 ─────────────
  const ROWS68 = [
    { n: 12, lab: '에이전트', icon: 'agent', top: 420 },
    { n: 4, lab: '스킬', icon: 'doc', top: 590 },
    { n: 1, lab: '오케스트레이터', icon: 'gear', top: 760, acc: true },
  ];
  const BX68 = 606, BW68 = 64, BG68 = 14, BH68 = 84, TRUNK68 = 566;
  DECK.slide({
    id: 'one-line', holds: [], dur: 4.0, notes: NOTES['one-line'],
    setup(el) {
      const $ = this.$, c = $.c = pal();
      const sv = $.sv = svgIn(el);
      $.term = layer(el);
      $.panelFill = div($.term, { left: '170px', top: '176px', width: '1580px', height: '178px', borderRadius: '18px', background: rg(c.bg0, 0.8), opacity: 0 });
      $.panel = line(svgIn($.term), rrect(170, 176, 1580, 178, 18), rg(c.ink, 0.5), 2);
      $.prompt = div($.term, { left: '204px', top: '198px', font: MONO(40, 700), color: 'var(--accent2)', opacity: 0 }, '›');
      const LS = { font: MONO(34), lineHeight: '50px', color: 'var(--ink)' };
      $.l1 = typeLine($.term, '/harness HTML 캔버스를 이용하여 타워 디펜스 웹 게임을 만들고자 합니다.', Object.assign({ left: '252px', top: '206px' }, LS));
      $.l2 = typeLine($.term, '… 에이전트는 10개 이상으로 구성합니다.', Object.assign({ left: '252px', top: '266px' }, LS));
      $.caret = div($.term, { left: '0px', top: '0px', width: '16px', height: '38px', background: 'var(--accent2)', opacity: 0 });
      $.mk = U.mark($.l2.el, { word: '10개 이상' });
      // 둘째 묶음: 줄기 → 줄마다 가로선 → 상자
      $.trunk = line(sv, `M${TRUNK68} 354V${ROWS68[2].top - 22}`, rg(c.ink, 0.9), 3);
      $.rows = ROWS68.map((r, ri) => {
        const busY = r.top - 22, cx = k => BX68 + k * (BW68 + BG68) + BW68 / 2;
        const col = r.acc ? c.acc : c.ink;
        const bus = line(sv, `M${TRUNK68} ${busY}H${cx(r.n - 1)}`, rg(c.ink, 0.9), 3);
        const boxes = [];
        for (let k = 0; k < r.n; k++) {
          const drop = line(sv, `M${cx(k)} ${busY}V${r.top}`, rg(c.ink, 0.9), 3);
          const fl = s('path', { d: rrect(BX68 + k * (BW68 + BG68), r.top, BW68, BH68, 10), fill: rg(c.acc2, 0.3) }, sv);
          fl.style.opacity = '0';
          const box = line(sv, rrect(BX68 + k * (BW68 + BG68), r.top, BW68, BH68, 10), rg(col, 0.95), 3);
          const ic = div(el, { left: cx(k) - 20 + 'px', top: r.top + 22 + 'px', width: '40px', height: '40px', opacity: 0 });
          U.icon(ic, r.icon, 40, rg(col, r.acc ? 1 : 0.85), 1.7);
          boxes.push({ drop, box, fl, ic, x: cx(k) });
        }
        const lab = div(el, { right: W - 530 + 'px', top: r.top + 42 - 25 + 'px', font: BODY(38, 700), lineHeight: '50px', color: r.acc ? 'var(--accent)' : 'var(--ink)', whiteSpace: 'nowrap', textAlign: 'right', opacity: 0 }, r.lab);
        const num = div(el, { left: '1590px', top: r.top + 42 - 66 + 'px', font: '400 120px/1 var(--num)', color: r.acc ? 'var(--accent)' : 'var(--ink)', whiteSpace: 'nowrap', transformOrigin: '0 50%', opacity: 0 }, String(r.n));
        return { r, busY, bus, boxes, lab, num };
      });
      // 머묾: 입력 줄에서 상자로 흘러가는 점
      $.packets = [0, 1, 2, 3, 4, 5, 6, 7].map(() => dot(sv, c.acc2, 7));
      $.all = [];
      $.rows.forEach((R, ri) => R.boxes.forEach((B, k) => $.all.push({ ri, k, R, B })));
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      // 한 클릭 개편(2026-11-16): 빌드 1개. 타자가 끝나는 1.5초에 입력 창이 위로 비키고 구성 결과가 이어서 그려진다(3.6초에 다 나옴)
      const pv = pre(x), H1 = 1.5;
      // 첫 묶음: 입력 창이 화면 가운데 → 둘째 묶음: 위로 비켜 주고 그 아래로 선이 뻗는다
      $.term.style.transform = `translateY(${f1(lerp(275, 0, prog(t, H1, 0.6, ease.inOutCubic)))}px)`;
      draw($.panel, Math.max(pv, prog(t, 0, 0.6, ease.inOutCubic)));
      show($.panelFill, Math.max(pv, prog(t, 0, 0.4)));
      show($.prompt, Math.max(pv, prog(t, 0.1, 0.3)));
      // 타자: 두 줄을 이어서 0.15~1.4초에
      const N1 = $.l1.n, N = N1 + $.l2.n;
      const k = Math.floor(prog(t, 0.15, 1.25, ease.linear) * N + 1e-6);
      $.l1.set(k); $.l2.set(k - N1);
      const onL2 = k > N1, ck = onL2 ? $.l2 : $.l1, kk = onL2 ? k - N1 : k;
      const typing = t >= 0.15 && k < N;
      const blink = typing ? 1 : (mod(Math.floor(a * 2.2), 2) ? 0 : 1);
      css($.caret, { transform: `translate(${f1(252 + ck.edge(kk) + 4)}px, ${onL2 ? 272 : 212}px)` });
      $.caret.style.opacity = String(t >= 0.15 ? blink * (1 - prog(t, H1, 0.3) * 0.7) : pv);
      $.mk.render(t, 1.45, 0.5);
      // 둘째 묶음
      draw($.trunk, prog(t, H1 + 0.45, 0.5, ease.inOutCubic));
      $.rows.forEach((R, ri) => {
        const t0 = H1 + 0.7 + ri * 0.28;
        draw(R.bus, prog(t, t0, 0.45, ease.inOutCubic));
        R.boxes.forEach((B, k) => {
          const tb = t0 + 0.12 + k * 0.035;
          draw(B.drop, prog(t, tb, 0.18, ease.linear));
          draw(B.box, prog(t, tb + 0.12, 0.35, ease.inOutCubic));
          popIn(B.ic, t, tb + 0.3, 0.4, 0.5);
        });
        const tn = t0 + 0.2 + R.r.n * 0.035;
        fadeUp(R.lab, t, tn, 0.45, 20);
        const p = prog(t, tn + 0.05, 0.55, ease.pop);
        show(R.num, prog(t, tn + 0.05, 0.2, ease.linear));
        R.num.style.transform = `translateX(${f1((1 - p) * -40)}px) scale(${f3(lerp(0.7, 1, p))})`;
      });
      // 머묾: 점이 줄기와 가로선을 따라 상자로 간다(둘째 묶음이 다 그려진 뒤)
      const on = prog(t, H1 + 2.1, 0.5, ease.linear);
      const lit = new Map();
      $.packets.forEach((P, i) => {
        const per = 2.4, u = a / per + i / 8, cyc = Math.floor(u), f = u - cyc;
        const pick = $.all[Math.floor(rand(cyc * 7 + i * 13, 5) * $.all.length)];
        const pts = [[TRUNK68, 354], [TRUNK68, pick.R.busY], [pick.B.x, pick.R.busY], [pick.B.x, pick.R.r.top]];
        const q = poly(pts).at(ease.inOutQuad(clamp(f / 0.85)));
        P.at(q[0], q[1], on * Math.min(1, f * 8, (1 - f) * 8));
        if (f > 0.8 && on > 0) lit.set(pick.B, Math.max(lit.get(pick.B) || 0, on * Math.sin(clamp((f - 0.8) / 0.2) * Math.PI)));
      });
      $.all.forEach(({ B, R }) => {
        const v = lit.get(B) || 0;
        B.box.setAttribute('stroke', v > 0.02 ? rg(c.acc2, 1) : rg(R.r.acc ? c.acc : c.ink, 0.95));
        B.fl.style.opacity = f3(v);
      });
    },
  });

  // ───────────── 69 phases: 요청 한 줄을 받은 뒤 진행되는 여섯 단계(track) ─────────────
  const ST69 = [
    { x: 300, lab: ['도메인 분석'], icon: 'search' },
    { x: 576, lab: ['팀 구조 설계'], icon: 'layers' },
    { x: 852, lab: ['에이전트', '정의 생성'], icon: 'agent' },
    { x: 1128, lab: ['스킬 생성'], icon: 'doc' },
    { x: 1404, lab: ['통합과 조율'], icon: 'team' },
    { x: 1680, lab: ['검증과', '시험 실행'], icon: 'shield' },
  ];
  const Y69 = 520, R69 = 52, X0_69 = 220;
  // 한 클릭 개편(2026-11-16): 빌드 1개라 camTrack은 끝 화면 자리 하나다. 앞 세 단계를 크게 보던 자리(CAM69A)에서
  // 1.1~1.9초에 끝 자리(CAM69B)로 물러나는 이동은 cameraHook이 t에 따라 만든다.
  // 끝 자리는 도식 전체(글자 x 200~1780)가 가장자리 175px 안쪽에 오도록 가운데를 990으로 옮기고 0.97배로 둔다
  const CAM69A = [620, 545, 1.3], CAM69B = [990, 540, 0.97], CT69 = [1.1, 0.8];
  const T69 = { a0: 0.1, aD: 0.8, b0: 1.3, bD: 0.75 };   // 선 A·B가 그어지는 시각(초)
  DECK.slide({
    id: 'phases', holds: [], dur: 3.2, notes: NOTES['phases'],
    camTrack: [CAM69B],
    cameraHook(t) {
      // 엔진 track이 이미 CAM69B로 옮겨 두었으므로, 지금 보고 싶은 자리와 CAM69B의 차이만 더한다
      const p = ease.inOutCubic(clamp((t - CT69[0]) / CT69[1]));
      const cx = lerp(CAM69A[0], CAM69B[0], p), cy = lerp(CAM69A[1], CAM69B[1], p);
      const z = Math.exp(lerp(Math.log(CAM69A[2]), Math.log(CAM69B[2]), p));
      return { dx: cx - CAM69B[0], dy: cy - CAM69B[1], dz: DECK.P / z - DECK.P / CAM69B[2] };
    },
    setup(el) {
      const $ = this.$, c = $.c = pal();
      const sv = $.sv = svgIn(el);
      // 시작점: 터미널 입력 줄 모양(글자 없음)
      $.term = line(sv, rrect(150, Y69 - 28, 70, 56, 12), rg(c.ink, 0.75), 2.5);
      $.chev = line(sv, `M166 ${Y69 - 10}L178 ${Y69}L166 ${Y69 + 10}`, rg(c.acc2, 1), 3);
      $.cur = s('rect', { x: 186, y: Y69 - 11, width: 14, height: 22, fill: rg(c.acc2, 1) }, sv);
      $.lineA = line(sv, `M${X0_69} ${Y69}H${ST69[2].x}`, rg(c.ink, 0.9), 3);
      $.lineB = line(sv, `M${ST69[2].x} ${Y69}H${ST69[5].x}`, rg(c.ink, 0.9), 3);
      $.ghost = line(sv, `M${X0_69} ${Y69}H${ST69[5].x}`, rg(c.acc2, 0.32), 2, { 'stroke-dasharray': '6 10' });
      $.ghost.setAttribute('stroke', rg(c.acc2, 0.55));
      $.brackets = [[200, 960], [1010, 1770]].map(([x0, x1]) => line(sv, `M${x0} 736V754H${x1}V736`, rg(c.acc2, 0.5), 2));
      $.trail = line(sv, `M0 ${Y69}H1`, rg(c.acc2, 0.95), 6);
      $.pk = dot(sv, c.acc2, 8);
      $.ghostSt = ST69.map(S => line(sv, circ(S.x, Y69, R69), rg(c.acc2, 0.55), 2, { 'stroke-dasharray': '5 8' }));
      $.st = ST69.map((S, i) => {
        const fill = s('circle', { cx: S.x, cy: Y69, r: R69, fill: rg(c.bg0, 0.92) }, sv);
        const ring = line(sv, circ(S.x, Y69, R69), rg(c.ink, 0.95), 3);
        const num = div(el, { left: S.x - 50 + 'px', width: '100px', top: Y69 - 33 + 'px', textAlign: 'center', font: '400 64px/1 var(--num)', color: 'var(--ink)', opacity: 0 }, String(i + 1));
        const ic = div(el, { left: S.x - 30 + 'px', top: '380px', width: '60px', height: '60px', opacity: 0 });
        U.icon(ic, S.icon, 60, rg(c.acc2, 1), 1.6);
        const lab = div(el, { left: S.x - 140 + 'px', width: '280px', top: '612px', textAlign: 'center', font: DISP(44), lineHeight: '52px', letterSpacing: '-.02em', color: 'var(--ink)', opacity: 0 }, S.lab.join('<br>'));
        fill.style.opacity = '0';
        return { S, fill, ring, num, ic, lab };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      const pv = pre(x);
      show($.term, pv); show($.chev, pv);
      $.cur.style.opacity = String(mod(Math.floor(a * 2.2), 2) ? 0.15 : 1);
      // 선이 그어지는 시각: A 0.1~0.9(앞 세 단계), B 1.3~2.05(뒤 세 단계, 카메라가 물러나는 동안)
      const tA = (xx) => T69.a0 + ((xx - X0_69) / (ST69[2].x - X0_69)) * T69.aD;
      const tB = (xx) => T69.b0 + ((xx - ST69[2].x) / (ST69[5].x - ST69[2].x)) * T69.bD;
      const stT = i => (i < 3 ? tA(ST69[i].x - R69) : tB(ST69[i].x - R69));
      show($.ghost, pv * (1 - prog(t, T69.b0 + T69.bD - 0.05, 0.6)));
      $.ghostSt.forEach((g, i) => show(g, pv * (1 - prog(t, stT(i) + 0.3, 0.4))));
      draw($.lineA, prog(t, T69.a0, T69.aD, ease.linear));
      draw($.lineB, prog(t, T69.b0, T69.bD, ease.linear));
      draw($.brackets[0], prog(t, 0.85, 0.6, ease.inOutCubic));
      draw($.brackets[1], prog(t, T69.b0 + T69.bD, 0.6, ease.inOutCubic));
      const lastX = ST69[5].x;
      // 머묾: 여섯 단계가 다 나온 뒤 점이 시작점에서 마지막 단계까지 흐르고, 지나는 원이 잠깐 밝아진다
      const per = 3.0, f = fr(a / per), on = prog(t, 2.6, 0.4, ease.linear);
      const px = lerp(X0_69, lastX, ease.inOutSine(f)), pvis = on * Math.min(1, f * 10, (1 - f) * 10);
      $.pk.at(px, Y69, pvis);
      $.trail.setAttribute('d', `M${f1(Math.max(X0_69, px - 220))} ${Y69}H${f1(px)}`);
      $.trail.style.opacity = f3(pvis * 0.8);
      $.st.forEach((T, i) => {
        const t0 = stT(i);
        const p = prog(t, t0, 0.5, ease.inOutCubic);
        draw(T.ring, p);
        const near = on * clamp(1 - Math.abs(px - T.S.x) / 70);
        T.fill.style.opacity = f3(prog(t, t0, 0.25, ease.linear));
        T.fill.setAttribute('fill', near > 0.02 ? `rgba(${Math.round(lerp(c.bg0[0], c.acc2[0], 0.35 * near))},${Math.round(lerp(c.bg0[1], c.acc2[1], 0.35 * near))},${Math.round(lerp(c.bg0[2], c.acc2[2], 0.35 * near))},0.95)` : rg(c.bg0, 0.92));
        T.ring.setAttribute('stroke', near > 0.02 ? rg(c.acc2, 0.6 + 0.4 * near) : rg(c.ink, 0.95));
        T.ring.setAttribute('stroke-width', f1(3 + 2 * near));
        popIn(T.num, t, t0 + 0.2, 0.45, 0.5);
        const ip = fadeUp(T.ic, t, t0 + 0.25, 0.45, -18);
        T.ic.style.transform += ` scale(${f3(1 + 0.12 * near)})`;
        fadeUp(T.lab, t, t0 + 0.32, 0.5, 22);
      });
    },
  });

  // ───────────── 70 output: 생성되는 파일 ─────────────
  // 폴더 트리는 구성.md의 folder 슬라이드와 같은 탐색기 모양이다. 줄 높이 76, 들여쓰기 66,
  // 펼침 화살표(mut 32) · 폴더 아이콘(accent2 40) · 문서 아이콘(mut 40) · 이름 mono 40px(폴더 600 ink, 파일 500)
  const TREE70 = [
    { d: 0, n: 'your-project/.claude/', f: 1, b: 0 },
    { d: 1, n: 'agents/', f: 1, b: 0 },
    { d: 2, n: 'analyst.md', b: 0 },
    { d: 2, n: 'builder.md', b: 0 },
    { d: 2, n: 'qa.md', b: 0 },
    { d: 1, n: 'skills/', f: 1, b: 1 },
    { d: 2, n: 'analyze/SKILL.md', b: 1 },
    { d: 2, n: 'build/SKILL.md', b: 1 },
  ];
  const G70 = { X: 250, Y: 296, R: 76, IND: 66 };
  const CHEV70 = 'M9 6l6 6-6 6';
  // 서류철 사진(obj_folder.png 2400×1800)에서 서류철이 차지하는 영역만 잘라 폭 500으로 놓는다
  const FB70 = { x0: 401, y0: 125, x1: 2022, y1: 1689 }, FK70 = 500 / (FB70.x1 - FB70.x0);
  const FW70 = 500, FH70 = Math.round((FB70.y1 - FB70.y0) * FK70), FX70 = 1190, FY70 = 322;
  const TAB70 = [236, 252, 24];   // 사진 속 색인 띠 색
  const fpt70 = (px, py) => [(px - FB70.x0) * FK70, (py - FB70.y0) * FK70];   // 사진 좌표 → 서류철 상자 좌표
  DECK.slide({
    id: 'output', holds: [], dur: 2.5, notes: NOTES['output'],
    setup(el) {
      const $ = this.$, c = $.c = pal(), G = G70;
      // 오른쪽: 서류철 사진(뒤 층). 사진 속 색인 띠는 폭이 2px 남짓이라 같은 자리에 노랑 띠를 덧그린다
      $.fold = layer(el);
      $.glow = div($.fold, { left: FX70 - 200 + 'px', top: FY70 - 170 + 'px', width: FW70 + 400 + 'px', height: FH70 + 340 + 'px', borderRadius: '50%', background: `radial-gradient(closest-side, ${rg(c.acc2, 0.16)}, ${rg(c.acc2, 0)})` });
      $.fw = div($.fold, { left: FX70 + 'px', top: FY70 + 'px', width: FW70 + 'px', height: FH70 + 'px', transformOrigin: '50% 50%' });
      // 색인 띠: 사진 속 서류철 오른쪽 가장자리(사진 좌표 (1628,318)→(1703,530))를 따라 사진 뒤에 둔다 → 가장자리 밖으로 밀려 나온다
      const P0 = fpt70(1628, 318), P1 = fpt70(1703, 530), Lt = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
      const ux = (P1[0] - P0[0]) / Lt, uy = (P1[1] - P0[1]) / Lt, nx = uy, ny = -ux;   // 바깥쪽(오른쪽) 법선
      const along = k => [P0[0] + ux * k, P0[1] + uy * k];
      const E0 = along(-6), E1 = along(Lt + 26), pt = (E, o) => `${f1(E[0] + nx * o)} ${f1(E[1] + ny * o)}`;
      $.tabN = [nx, ny];
      $.tabGlow = div($.fw, { left: f1((E0[0] + E1[0]) / 2 + nx * 20 - 95) + 'px', top: f1((E0[1] + E1[1]) / 2 + ny * 20 - 95) + 'px', width: '190px', height: '190px', borderRadius: '50%', background: `radial-gradient(closest-side, ${rg(TAB70, 0.34)}, ${rg(TAB70, 0)})`, opacity: 0 });
      const tsv = svgIn($.fw);
      $.tab = s('path', { d: `M${pt(E0, -8)}L${pt(E0, 22)}L${pt(E1, 22)}L${pt(E1, -8)}Z`, fill: rg(TAB70, 1), stroke: rg(TAB70, 1), 'stroke-width': 8, 'stroke-linejoin': 'round' }, tsv);
      $.ph = U.image($.fw, 'assets/img/obj_folder.png', { x: 0, y: 0, w: FW70, h: FH70, radius: 0 });
      if ($.ph.missing) tsv.style.display = 'none';
      else {
        css($.ph.el, { background: 'transparent' });
        css($.ph.img, { position: 'absolute', left: f1(-FB70.x0 * FK70) + 'px', top: f1(-FB70.y0 * FK70) + 'px', width: f1(2400 * FK70) + 'px', height: f1(1800 * FK70) + 'px', objectFit: 'fill', filter: 'brightness(1.7) contrast(0.95)' });
      }
      const lsv = svgIn($.fold);
      $.lead = line(lsv, 'M840 334 C 990 334, 1080 418, 1200 430', rg(c.acc2, 0.85), 2.5, { 'stroke-dasharray': '7 8', 'stroke-linecap': 'butt' });
      $.leadDot = s('circle', { cx: 840, cy: 334, r: 6, fill: rg(c.acc2, 1) }, lsv);
      // 「예시」 알약: 서류철 위 오른쪽 모서리에 단다(서류철과 같은 층, 기울이지 않음). 68번 요청 줄은 이 슬라이드에서 뺐다
      // (트리의 파일 이름은 실제 생성 결과가 아니라 모양을 보여 주는 예시다. 덱 비평 반영 회차, 2026-11-16)
      $.ex = U.example($.fold, { x: W - (FX70 + FW70) + 30, y: FY70 - 70 });
      const sv = $.sv = svgIn(el);
      // 읽는 줄 띠(트리 뒤)
      $.hl = div(el, { left: G.X - 64 + 'px', top: '0px', width: '680px', height: G.R + 'px', borderRadius: '10px', background: rg(c.acc2, 0.1), opacity: 0 });
      // 들여쓰기 안내선(부모 아이콘 아래 → 마지막 자식 줄 가운데). 구성.md folder 슬라이드와 같은 ink 22%
      const rowY = k => G.Y + k * G.R, mid = k => rowY(k) + G.R / 2, ix = d => G.X + d * G.IND;
      $.guides = [{ d: 0, k0: 0, k1: 5 }, { d: 1, k0: 1, k1: 4 }, { d: 1, k0: 5, k1: 7 }].map(gd => {
        const gx = ix(gd.d) + 20, y0 = rowY(gd.k0) + G.R - 10, y1 = mid(gd.k1);
        return Object.assign(gd, { gx, y0, y1, p: line(sv, `M${gx} ${y0}V${y1}`, rg(c.ink, 0.22), 2, { 'stroke-linecap': 'butt' }) });
      });
      $.yAgents = mid(1);
      $.rows = TREE70.map((r, k) => {
        const y = rowY(k), x0 = ix(r.d);
        const row = div(el, { left: '0px', top: y + 'px', width: W + 'px', height: G.R + 'px', opacity: 0 });
        let chev = null;
        if (r.f) {
          chev = div(row, { left: x0 - 36 + 'px', top: '22px', width: '32px', height: '32px', transformOrigin: '16px 16px' });
          const cs = s('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: rg(c.mut, 1), 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chev);
          s('path', { d: CHEV70 }, cs);
        }
        const ic = div(row, { left: x0 + 'px', top: '18px', width: '40px', height: '40px', transformOrigin: '20px 20px' });
        U.icon(ic, r.f ? 'folder' : 'doc', 40, r.f ? rg(c.acc2, 1) : rg(c.mut, 1), 1.7);
        const name = typeLine(row, r.n, { left: x0 + 60 + 'px', top: '0px', height: G.R + 'px', font: `${r.f ? 600 : 500} 40px/${G.R}px var(--mono)`, color: r.f ? 'var(--ink)' : 'color-mix(in srgb, var(--ink) 86%, transparent)' });
        name.set(0);
        return Object.assign({}, r, { k, y, x0, row, chev, ic, name, dx: 0 });
      });
      $.caret = div(el, { left: '0px', top: '0px', width: '15px', height: '38px', background: 'var(--accent2)', opacity: 0 });
    },
    render(t, x) {
      const $ = this.$, a = x.a, G = G70;
      const pv = pre(x);
      // 서류철: 들어오는 동안 미리 보이고, 머묾 동안 천천히 흔들린다. 색인 띠는 0.7초에 그려지고 빛이 맥동한다
      $.fold.style.transform = U.depth(x, 0.5);
      const fp = Math.max(prog(t, 0.25, 0.7), pv * 0.6);
      show($.fw, fp);
      $.fw.style.transform = `translateY(${f1((1 - fp) * 40 + 6 * Math.sin(a * 0.9))}px) rotate(${f3(6 + 0.8 * Math.sin(a * 0.6))}deg)`;
      show($.glow, fp * (0.8 + 0.2 * Math.sin(a * 1.3)));
      // 색인 띠가 서류철 뒤에서 가장자리 밖으로 밀려 나온다
      const tp = prog(t, 0.6, 0.5, ease.pop), to = (1 - tp) * -30;
      $.tab.setAttribute('transform', `translate(${f1($.tabN[0] * to)} ${f1($.tabN[1] * to)})`);
      show($.tabGlow, prog(t, 0.9, 0.4) * (0.7 + 0.3 * Math.sin(a * 2.1)));
      show($.lead, prog(t, 0.6, 0.4)); show($.leadDot, prog(t, 0.6, 0.3));
      $.lead.style.strokeDashoffset = f1(-a * 18);
      // 「예시」는 도착 뒤(t 0.55, 서류철이 다 보인 다음)에 튀어나온다
      $.ex.render(t, 0.55);
      $.ex.el.style.opacity = f3(+$.ex.el.style.opacity * smooth(0.7, 1, x.arrive));
      // 줄 시각(한 클릭 개편, 2026-11-16): 첫 묶음(폴더·agents/) 0.35부터, 둘째 묶음(skills/) B2 1.3부터 0.16초 간격으로 클릭 없이 이어진다.
      // 줄이 왼쪽에서 밀려 들어오고 아이콘이 튀어나온 뒤 이름이 찍힌다(마지막 줄 2.1초에 다 찍힘).
      // 맨 위 줄(your-project/.claude/)은 트리의 머리라 들어오는 밀기 동안 미리 보인다(요청 줄을 뺀 뒤 35% 칸이 빈 바탕이 되지 않게).
      // 펼침 화살표만 0.55초에 돌아 agents/ 줄이 열리는 것을 알린다
      const B2 = 1.3, rt = R => (R.b === 0 ? 0.35 + R.k * 0.16 : B2 + (R.k - 5) * 0.16);
      let lastRow = null, lastK = 0;
      $.rows.forEach(R => {
        const st = rt(R), n = R.name.n, root = R.k === 0;
        const p = root ? 1 : prog(t, st, 0.45);
        show(R.row, root ? Math.max(pv, prog(t, 0, 0.15, ease.linear)) : prog(t, st, 0.15, ease.linear));
        R.dx = (1 - p) * -30;
        R.row.style.transform = `translateX(${f1(R.dx)}px)`;
        R.ic.style.transform = `scale(${f3(root ? 1 : lerp(0.4, 1, prog(t, st + 0.02, 0.4, ease.pop)))})`;
        if (R.chev) R.chev.style.transform = `rotate(${f1(90 * prog(t, st + 0.2, 0.35, ease.pop))}deg)`;
        const k = root ? n : Math.floor(prog(t, st + 0.08, Math.min(0.4, n * 0.035), ease.linear) * n + 1e-6);
        R.name.set(k);
        if (t >= st) { lastRow = R; lastK = k; }
      });
      // 안내선: 바깥 선은 첫 묶음에 agents/ 줄까지, 둘째 묶음에 skills/ 줄까지 자란다
      const g0 = $.guides[0], reach = lerp($.yAgents, g0.y1, prog(t, B2, 0.3, ease.inOutCubic));
      draw(g0.p, prog(t, 0.5, 0.25, ease.linear) * (reach - g0.y0) / (g0.y1 - g0.y0));
      draw($.guides[1].p, prog(t, 0.72, 0.5, ease.linear));
      draw($.guides[2].p, prog(t, B2 + 0.17, 0.3, ease.linear));
      if (lastRow) {
        const L = lastRow.name, done = lastK >= L.n;
        css($.caret, { transform: `translate(${f1(lastRow.x0 + 60 + L.edge(lastK) + 4 + lastRow.dx)}px, ${f1(lastRow.y + (G.R - 38) / 2)}px)` });
        $.caret.style.opacity = String(done ? (mod(Math.floor(a * 2.2), 2) ? 0 : 1) : 1);
      } else $.caret.style.opacity = '0';
      // 머묾: 줄이 다 찍힌 뒤 읽는 줄을 따라 옅은 띠가 내려간다(여덟 줄)
      const n = 8, u = fr(a * 0.45), row = Math.min(n - 1, Math.floor(u * n));
      $.hl.style.transform = `translateY(${f1(G.Y + row * G.R)}px)`;
      show($.hl, prog(t, 2.15, 0.4) * Math.sin(fr(u * n) * Math.PI) * 0.9);
    },
  });

  // ───────────── 71 levels: 스킬의 세 층 ─────────────
  const LV71 = [
    { k: 'L1', d: '작업 하나를 하는 스킬', y: 694 },
    { k: 'L2', d: '여러 에이전트가 협업하는 워크플로(하네스)', y: 478 },
    { k: 'L3', d: '하네스를 생성하는 스킬', y: 262, acc: true },
  ];
  const SX71 = 280, SW71 = 1380, SH71 = 168, DX71 = 1540;
  DECK.slide({
    id: 'levels', holds: [], dur: 2.8, notes: NOTES['levels'],
    setup(el) {
      const $ = this.$, c = $.c = pal();
      $.back = layer(el);
      const bsv = svgIn($.back);
      $.ghosts = LV71.map(L => line(bsv, rrect(SX71, L.y, SW71, SH71, 16), rg(c.acc2, 0.3), 2, { 'stroke-dasharray': '8 10' }));
      $.mid = layer(el);
      const sv = svgIn($.mid);
      $.lv = LV71.map((L, i) => {
        const g = s('g', {}, sv);
        const ext = line(g, `M${SX71 + 16} ${L.y + SH71}V${L.y + SH71 + 16}H${SX71 + SW71 + 16}V${L.y + 16}H${SX71 + SW71}`, rg(c.acc2, 0.55), 2, { 'stroke-dasharray': '6 7' });
        const fill = s('path', { d: rrect(SX71, L.y, SW71, SH71, 16), fill: L.acc ? rg(c.acc, 0.07) : rg(c.bg0, 0.6) }, g);
        const box = line(g, rrect(SX71, L.y, SW71, SH71, 16), L.acc ? rg(c.acc, 1) : rg(c.ink, 0.92), L.acc ? 4 : 3);
        const kEl = div($.mid, { left: SX71 + 50 + 'px', top: L.y + SH71 / 2 - 50 + 'px', font: '400 90px/100px var(--num)', color: L.acc ? 'var(--accent)' : 'var(--ink)', opacity: 0 }, L.k);
        const dEl = div($.mid, { left: SX71 + 240 + 'px', top: L.y + SH71 / 2 - 28 + 'px', font: BODY(42, 600), lineHeight: '56px', color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, L.d);
        g.style.opacity = '0';
        return { L, g, ext, fill, box, kEl, dEl };
      });
      $.mk = U.mark($.lv[2].dEl, { word: '생성하는' });
      // 오른쪽 작은 도식: L1 점 하나, L2 점 셋(서로 잇는 선), L3 점 하나 → 점선 삼각형
      const cy = L => L.y + SH71 / 2;
      const d1 = $.d1 = s('g', {}, sv);
      s('circle', { cx: DX71, cy: cy(LV71[0]), r: 13, fill: rg(c.ink, 0.95) }, d1);
      $.d1ring = s('circle', { cx: DX71, cy: cy(LV71[0]), r: 26, fill: 'none', stroke: rg(c.ink, 0.5), 'stroke-width': 2 }, d1);
      const T2 = $.T2 = [[DX71, cy(LV71[1]) - 40], [DX71 - 46, cy(LV71[1]) + 34], [DX71 + 46, cy(LV71[1]) + 34]];
      const d2 = $.d2 = s('g', {}, sv);
      line(d2, `M${T2[0][0]} ${T2[0][1]}L${T2[1][0]} ${T2[1][1]}L${T2[2][0]} ${T2[2][1]}Z`, rg(c.ink, 0.45), 2);
      T2.forEach(p => s('circle', { cx: p[0], cy: p[1], r: 11, fill: rg(c.ink, 0.95) }, d2));
      $.p2 = [0, 1, 2].map(() => s('circle', { r: 5, fill: rg(c.acc2, 1) }, d2));
      const d3 = $.d3 = s('g', {}, sv), c3 = cy(LV71[2]);
      s('circle', { cx: DX71 - 52, cy: c3, r: 13, fill: rg(c.acc, 1) }, d3);
      line(d3, `M${DX71 - 30} ${c3}H${DX71 + 6}M${DX71 - 2} ${c3 - 8}L${DX71 + 8} ${c3}L${DX71 - 2} ${c3 + 8}`, rg(c.acc, 0.95), 2.5);
      $.tri3 = line(d3, `M${DX71 + 46} ${c3 - 30}L${DX71 + 20} ${c3 + 22}L${DX71 + 72} ${c3 + 22}Z`, rg(c.acc, 0.85), 2.5, { 'stroke-dasharray': '6 6' });
      // 층 사이 연결(위 층이 아래 층을 만든다·쓴다): 아래로 흐르는 점
      $.conn = [[LV71[2], LV71[1]], [LV71[1], LV71[0]]].map(([A, B]) => {
        const y0 = A.y + SH71, y1 = B.y;
        const p = line(sv, `M${DX71} ${y0 + 4}V${y1 - 6}M${DX71 - 7} ${y1 - 14}L${DX71} ${y1 - 5}L${DX71 + 7} ${y1 - 14}`, rg(c.acc2, 0.9), 2.5);
        const d = dot(sv, c.acc2, 5);
        return { p, d, y0, y1 };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pv = pre(x);
      $.back.style.transform = U.depth(x, -0.4);
      // 한 클릭 개편(2026-11-16): L1 → L2 → L3이 0.6초 간격으로 클릭 없이 아래에서 위로 쌓인다(L3 글 2.03초, 밑줄 2.38초에 끝)
      const st = [0.08, 0.68, 1.28];
      $.ghosts.forEach((g, i) => show(g, pv * (1 - prog(t, st[i] + 0.3, 0.4))));
      $.lv.forEach((V, i) => {
        const t0 = st[i], p = prog(t, t0, 0.55, ease.pop);
        show(V.g, prog(t, t0, 0.15, ease.linear));
        V.g.setAttribute('transform', `translate(0 ${f1((1 - p) * -60)})`);
        draw(V.box, prog(t, t0, 0.6, ease.inOutCubic));
        show(V.ext, prog(t, t0 + 0.25, 0.4));
        V.ext.style.strokeDashoffset = f1(-a * 14);
        const kp = prog(t, t0 + 0.12, 0.5, ease.pop);
        show(V.kEl, prog(t, t0 + 0.12, 0.2, ease.linear)); V.kEl.style.transform = `translateY(${f1((1 - kp) * -50)}px)`;
        fadeUp(V.dEl, t, t0 + 0.25, 0.5, 22);
      });
      $.mk.render(t, st[2] + 0.6, 0.5);
      show($.d1, prog(t, st[0] + 0.32, 0.4)); show($.d2, prog(t, st[1] + 0.3, 0.4)); show($.d3, prog(t, st[2] + 0.3, 0.4));
      $.d1ring.setAttribute('r', f1(22 + 6 * Math.sin(a * 2)));
      // L2 안의 점: 세 변을 돌며 오간다
      const T2 = $.T2;
      $.p2.forEach((P, i) => {
        const f = fr(a * 0.55 + i / 3), A = T2[i], B = T2[(i + 1) % 3], q = Math.sin(f * Math.PI);
        P.setAttribute('cx', f1(lerp(A[0], B[0], q))); P.setAttribute('cy', f1(lerp(A[1], B[1], q)));
      });
      $.tri3.style.strokeDashoffset = f1(-a * 16);
      $.conn.forEach((C, i) => {
        const t1 = st[i === 0 ? 2 : 1] + 0.25;
        const vis = prog(t, t1 + 0.15, 0.4);
        draw(C.p, prog(t, t1, 0.35, ease.linear));
        const f = fr(a * 0.7 + i * 0.5);
        C.d.at(DX71, lerp(C.y0 + 4, C.y1 - 14, f), vis * Math.sin(f * Math.PI));
      });
    },
  });

  // ───────────── 72 run-modes: 실행 방식 세 가지 ─────────────
  // alias: 이름 바로 아래 보조 줄(body 30px, mut). 가운데 칸은 팀.md 실행 방식 표의 이름('에이전트 팀')과 잇는다(리더 결정, 2026-11-16).
  // 세 칸의 높이를 맞춘다: 이름 top 598, 보조 줄 top 664(없는 칸은 비워 둠), 설명 top 720(세 칸 모두). 설명 아래 끝 y 812
  const COL72 = [
    { x: 400, name: '워크플로', d: ['스크립트가', '순서를 정한다'] },
    { x: 960, name: '지속 협업', d: ['팀원이 남아서', '메시지를 주고받는다'], alias: '팀.md의 에이전트 팀' },
    { x: 1520, name: '서브에이전트', d: ['한 번 맡기고', '결과를 받는다'] },
  ];
  const FY72 = 220, FH72 = 340, FW72 = 470, NY72 = 598, AY72 = 664, DY72 = 720;
  DECK.slide({
    id: 'run-modes', holds: [], dur: 2.3, notes: NOTES['run-modes'],
    setup(el) {
      const $ = this.$, c = $.c = pal();
      const sv = $.sv = svgIn(el);
      $.cols = COL72.map((C, i) => {
        const frame = line(sv, rrect(C.x - FW72 / 2, FY72, FW72, FH72, 22), rg(c.ink, 0.42), 2);
        const g = s('g', {}, sv);
        g.style.opacity = '0';
        const name = U.rise(el, C.name, { left: C.x - 260 + 'px', width: '520px', top: NY72 + 'px', textAlign: 'center', font: DISP(48), letterSpacing: '-.02em', color: 'var(--ink)', whiteSpace: 'nowrap' });
        const alias = C.alias ? div(el, { left: C.x - 260 + 'px', width: '520px', top: AY72 + 'px', textAlign: 'center', font: BODY(30, 500), lineHeight: '40px', color: 'var(--mut)', whiteSpace: 'nowrap', opacity: 0 }, C.alias) : null;
        const desc = div(el, { left: C.x - 260 + 'px', width: '520px', top: DY72 + 'px', textAlign: 'center', font: BODY(34, 500), lineHeight: '46px', color: 'var(--ink)', opacity: 0 }, C.d.join('<br>'));
        return { C, frame, g, name, alias, desc };
      });
      // 1 워크플로: 스크립트 → 점 1·2·3 차례로
      const A = $.cols[0], ax = COL72[0].x;
      $.w = { src: [ax, 300], dots: [-130, 0, 130].map(dx => [ax + dx, 470]) };
      const sc = div(el, { left: ax - 30 + 'px', top: '266px', width: '60px', height: '60px', opacity: 0 });
      U.icon(sc, 'code', 60, rg(c.ink, 0.95), 1.6);
      $.w.icon = sc;
      $.w.links = $.w.dots.map(p => line(A.g, `M${ax} 340L${p[0]} ${p[1] - 22}`, rg(c.ink, 0.4), 2));
      $.w.circ = $.w.dots.map(p => s('circle', { cx: p[0], cy: p[1], r: 20, fill: rg(c.bg0, 1), stroke: rg(c.ink, 0.9), 'stroke-width': 3 }, A.g));
      $.w.nums = $.w.dots.map((p, k) => { const n = div(el, { left: p[0] - 30 + 'px', width: '60px', top: p[1] + 30 + 'px', textAlign: 'center', font: MONO(28, 600), color: 'var(--mut)', opacity: 0 }, String(k + 1)); return n; });
      $.w.pk = dot(A.g, c.acc2, 6);
      // 2 지속 협업: 세 점이 남아서 서로 메시지
      const B = $.cols[1], bx = COL72[1].x;
      $.p = { n: [[bx, 290], [bx - 140, 480], [bx + 140, 480]] };
      [[0, 1], [1, 2], [2, 0]].forEach(([i, j]) => line(B.g, `M${$.p.n[i][0]} ${$.p.n[i][1]}L${$.p.n[j][0]} ${$.p.n[j][1]}`, rg(c.ink, 0.4), 2));
      $.p.ring = $.p.n.map(p => s('circle', { cx: p[0], cy: p[1], r: 30, fill: 'none', stroke: rg(c.acc2, 0.5), 'stroke-width': 2 }, B.g));
      $.p.n.forEach(p => s('circle', { cx: p[0], cy: p[1], r: 20, fill: rg(c.ink, 0.95) }, B.g));
      $.p.pk = [0, 1, 2].map(() => dot(B.g, c.acc2, 6));
      // 3 서브에이전트: 한 번 보내고 결과를 받고 사라진다
      const Cc = $.cols[2], cx3 = COL72[2].x;
      $.sb = { m: [cx3 - 140, 400], s: [cx3 + 140, 400] };
      line(Cc.g, `M${cx3 - 110} 400H${cx3 + 110}`, rg(c.ink, 0.35), 2, { 'stroke-dasharray': '6 8' });
      s('circle', { cx: $.sb.m[0], cy: 400, r: 24, fill: rg(c.ink, 0.95) }, Cc.g);
      $.sb.sub = s('g', {}, Cc.g);
      s('circle', { cx: $.sb.s[0], cy: 400, r: 20, fill: rg(c.bg0, 1), stroke: rg(c.ink, 0.95), 'stroke-width': 3 }, $.sb.sub);
      $.sb.spin = s('circle', { cx: $.sb.s[0], cy: 400, r: 34, fill: 'none', stroke: rg(c.acc2, 0.9), 'stroke-width': 3, 'stroke-dasharray': '40 174' }, $.sb.sub);
      $.sb.out = dot(Cc.g, c.acc2, 6);
      $.sb.back = dot(Cc.g, c.ok, 7);
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      const pv = pre(x);
      // 한 클릭 개편(2026-11-16): 워크플로·지속 협업 다음에 서브에이전트 칸이 0.95초에 이어서 나온다(설명 1.85초에 끝)
      const st = [0.1, 0.35, 0.95];
      $.cols.forEach((K, i) => {
        draw(K.frame, Math.max(pv, prog(t, 0, 0.6, ease.inOutCubic)));
        K.frame.setAttribute('stroke', t >= st[i] ? rg(c.ink, 0.42 + 0.3 * prog(t, st[i], 0.4)) : rg(c.ink, 0.3));
        const p = prog(t, st[i] + 0.1, 0.55, ease.pop);
        show(K.g, prog(t, st[i] + 0.1, 0.3));
        K.g.setAttribute('transform', `translate(${COL72[i].x} 390) scale(${f3(lerp(0.8, 1, p))}) translate(${-COL72[i].x} -390)`);
        K.name.render(t, st[i] + 0.2, { each: 0.04 });
        if (K.alias) fadeUp(K.alias, t, st[i] + 0.32, 0.45, 16);
        fadeUp(K.desc, t, st[i] + 0.4, 0.5, 20);
      });
      // 1 워크플로: 주기 3초 동안 점 1→2→3
      const w = $.w, on1 = prog(t, 0.4, 0.3);
      fadeUp(w.icon, t, 0.15, 0.45, 16);
      w.nums.forEach((n, k) => show(n, prog(t, 0.45 + k * 0.08, 0.3)));
      const u1 = fr(a / 3), step = Math.min(2, Math.floor(u1 * 3)), f = fr(u1 * 3);
      const tgt = w.dots[step], q = ease.inOutQuad(clamp(f / 0.55));
      w.pk.at(lerp(COL72[0].x, tgt[0], q), lerp(340, tgt[1] - 22, q), on1 * (f < 0.6 ? 1 : 0));
      w.circ.forEach((C, k) => {
        const lit = k < step || (k === step && f >= 0.55);
        C.setAttribute('fill', lit ? rg(c.acc2, 0.9) : rg(c.bg0, 1));
      });
      w.links.forEach((L, k) => L.setAttribute('stroke', k === step && f < 0.6 ? rg(c.acc2, 0.8) : rg(c.ink, 0.4)));
      // 2 지속 협업: 세 패킷이 쉬지 않고 오간다
      const P = $.p;
      P.pk.forEach((D, i) => {
        const u = fr(a * 0.42 + i / 3), A = P.n[i], B = P.n[(i + 1) % 3], back = mod(Math.floor(a * 0.42 + i / 3), 2);
        const q2 = ease.inOutSine(u), from = back ? B : A, to = back ? A : B;
        D.at(lerp(from[0], to[0], q2), lerp(from[1], to[1], q2), prog(t, 0.6, 0.3) * Math.min(1, u * 8, (1 - u) * 8));
      });
      P.ring.forEach((R, i) => R.setAttribute('r', f1(28 + 4 * Math.sin(a * 2.2 + i * 2))));
      // 3 서브에이전트: 3.2초 주기 — 나타남 → 보냄 → 작업 → 결과 → 사라짐
      const S = $.sb, on3 = prog(t, st[2] + 0.35, 0.3), u3 = fr(a / 3.2);
      const appear = smooth(0.0, 0.12, u3) * (1 - smooth(0.88, 1.0, u3));
      S.sub.style.opacity = f3(appear);
      S.sub.setAttribute('transform', `translate(${S.s[0]} 400) scale(${f3(lerp(0.6, 1, appear))}) translate(${-S.s[0]} -400)`);
      S.spin.style.opacity = f3(smooth(0.42, 0.48, u3) * (1 - smooth(0.62, 0.68, u3)));
      S.spin.setAttribute('transform', `rotate(${f1(a * 400)} ${S.s[0]} 400)`);
      const go = clamp((u3 - 0.15) / 0.27), ret = clamp((u3 - 0.66) / 0.24);
      S.out.at(lerp(S.m[0] + 28, S.s[0] - 24, ease.inOutQuad(go)), 400, on3 * (go > 0 && go < 1 ? 1 : 0));
      S.back.at(lerp(S.s[0] - 24, S.m[0] + 28, ease.inOutQuad(ret)), 400, on3 * (ret > 0 && ret < 1 ? 1 : 0));
    },
  });

  // ───────────── 73 workflow-limits: 워크플로의 규모와 한도 ─────────────
  // 제목 줄을 drift 여백(위 175px) 안으로 내리면서 아래 요소도 함께 내렸다(검수 수정 회차 1)
  const FX73 = 210, FY73 = 604, CELL73 = 15, NC73 = 100, NR73 = 10;
  DECK.slide({
    id: 'workflow-limits', holds: [], dur: 3.0, notes: NOTES['workflow-limits'],
    chrome: { source: '출처: code.claude.com/docs/en/workflows' },
    setup(el) {
      const $ = this.$, c = $.c = pal();
      $.h = U.rise(el, 'Claude Code 동적 워크플로', { left: '196px', top: '208px', font: DISP(64), letterSpacing: '-.025em', color: 'var(--ink)', whiteSpace: 'nowrap' });
      $.h2 = div(el, { left: 196 + $.h.el.offsetWidth + 22 + 'px', top: '230px', font: BODY(36, 500), color: 'var(--mut)', whiteSpace: 'nowrap', opacity: 0 }, '(연구 미리보기)');
      // 점 1,000개(100열 × 10줄). 열 우선 순서로 16개씩 묶어 켜진다
      $.cv = U.canvas(el, 1600, 300);
      css($.cv.canvas, { left: '160px', top: '490px' });
      $.ox = 160; $.oy = 490;
      // 숫자
      $.lab16 = div(el, { left: '200px', top: '318px', font: BODY(34, 600), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '기본 동시 실행');
      $.n16 = U.counter(el, { x: 196, y: 534, from: 16, to: 16, size: 160, color: 'var(--accent2)', suffix: '개', suffixColor: 'var(--ink)' });
      $.lab1k = div(el, { left: '660px', top: '318px', font: BODY(34, 600), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '실행 한 번에 최대');
      $.n1k = U.counter(el, { x: 656, y: 534, from: 0, to: 1000, size: 160, color: 'var(--ink)', suffix: '개', suffixColor: 'var(--ink)' });
      // 경고 줄
      $.warn = div(el, { left: '200px', top: '810px', height: '96px', padding: '0 34px 0 96px', borderRadius: '16px', border: '3px solid var(--accent)', background: rg(c.acc, 0.08), font: BODY(40, 600), lineHeight: '90px', color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '25개 초과 또는 150만 토큰 초과가 예상되면 경고');
      const wi = div($.warn, { left: '30px', top: '22px', width: '46px', height: '46px' });
      const ws = s('svg', { width: 46, height: 46, viewBox: '0 0 24 24', fill: 'none', stroke: rg(c.acc, 1), 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, wi);
      s('path', { d: 'M12 3.5L22 20.5H2z M12 10v5 M12 17.6v.2' }, ws);
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c, g = $.cv;
      const pv = pre(x);
      // 한 클릭 개편(2026-11-16): 세 묶음이 클릭 없이 이어진다. 기능 이름(0.05) → 숫자 B2 1.0(점 마당이 아래로 비킴) → 경고 B3 1.9(2.45초에 자리 잡음)
      const B2 = 1.0, B3 = 1.9;
      $.h.render(t, 0.05, { each: 0.03 });
      fadeUp($.h2, t, 0.5, 0.45, 16);
      // 숫자(둘째 묶음)
      fadeUp($.lab16, t, B2 + 0.1, 0.45, 18); $.n16.render(t, B2 + 0.15, 0.6);
      fadeUp($.lab1k, t, B2 + 0.25, 0.45, 18); $.n1k.render(t, B2 + 0.3, 1.2, ease.outQuart);
      // 경고(셋째 묶음)
      const wp = prog(t, B3 + 0.1, 0.55, ease.pop);
      show($.warn, prog(t, B3 + 0.1, 0.2, ease.linear));
      $.warn.style.transform = `translateY(${f1((1 - wp) * 30)}px) scale(${f3(lerp(0.94, 1, wp))})`;
      const pulse = prog(t, B3 + 0.7, 0.4) * (0.5 + 0.5 * Math.sin(a * 2.4));
      $.warn.style.boxShadow = `0 0 0 ${f1(2 + 8 * pulse)}px ${rg(c.acc, 0.14 * pulse)}`;
      // 점 마당
      g.clearRect(0, 0, 1600, 300);
      // 점 마당은 처음에 위쪽(제목 바로 아래)에 나타났다가, 둘째 묶음에서 숫자 자리를 비켜 아래로 내려간다
      g.canvas.style.transform = `translateY(${f1(lerp(-190, 0, prog(t, B2, 0.6, ease.inOutCubic)))}px)`;
      const ox = $.ox, oy = $.oy;
      const appear = Math.max(pv * 0.5, prog(t, 0.15, 0.8, ease.outCubic));
      const run = prog(t, 0.8, 0.5, ease.linear);
      const per = 0.24, NB = Math.ceil(1000 / 16), cyc = mod(a / per, NB + 6), b = Math.floor(cyc);
      for (let i = 0; i < 1000; i++) {
        const col = Math.floor(i / NR73), row = i % NR73;
        const px = FX73 + col * CELL73 + CELL73 / 2 - ox, py = FY73 + row * CELL73 + CELL73 / 2 - oy;
        const vis = clamp(appear * 1.6 - (col / NC73) * 0.6);
        if (vis <= 0) continue;
        const bi = Math.floor(i / 16);
        let col0 = rg(c.ink, 0.16 * vis), r = 4;
        if (run > 0 && b < NB) {
          if (bi < b) col0 = rg(c.ink, (0.16 + 0.36 * run) * vis);
          else if (bi === b) { col0 = rg(c.acc2, run * vis); r = 5; }
        }
        g.fillStyle = col0;
        g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
      }
      // 지금 묶음 테두리 + 16에서 내려오는 선(둘째 묶음부터)
      const bp = prog(t, B2 + 0.6, 0.5);
      if (bp > 0 && run > 0 && b < NB) {
        const i0 = b * 16, i1 = Math.min(999, i0 + 15), c0 = Math.floor(i0 / NR73), c1 = Math.floor(i1 / NR73);
        const bx0 = FX73 + c0 * CELL73 - ox - 4, bx1 = FX73 + (c1 + 1) * CELL73 - ox + 4;
        g.strokeStyle = rg(c.acc2, 0.95 * bp); g.lineWidth = 2.5;
        g.strokeRect(bx0, FY73 - oy - 6, bx1 - bx0, NR73 * CELL73 + 12);
        g.beginPath(); g.moveTo(260 - ox, 556 - oy); g.lineTo((bx0 + bx1) / 2, FY73 - oy - 8); g.stroke();
        g.fillStyle = rg(c.acc2, bp); g.beginPath(); g.arc(260 - ox, 556 - oy, 5, 0, TAU); g.fill();
      }
      // 1,000 치수선(점 마당 아래 20px. 눈금 아래 끝과 경고 상자 위 끝 사이 26px)
      const dp = prog(t, B2 + 0.4, 0.8, ease.inOutCubic);
      if (dp > 0) {
        const y = FY73 + NR73 * CELL73 + 20 - oy, xa = FX73 - ox, xb = FX73 + NC73 * CELL73 - ox, xm = lerp(xa, xb, dp);
        g.strokeStyle = rg(c.ink, 0.7); g.lineWidth = 2;
        g.beginPath(); g.moveTo(xa, y); g.lineTo(xm, y); g.moveTo(xa, y - 10); g.lineTo(xa, y + 10);
        if (dp >= 1) { g.moveTo(xb, y - 10); g.lineTo(xb, y + 10); }
        g.stroke();
      }
    },
  });

  // ───────────── 74 evolve: 쓰면서 고친다 ─────────────
  const EV74 = [
    { lab: '처음 구성', ang: -90 },
    { lab: '실제 사용', ang: -18 },
    { lab: '달라진 점 기록', ang: 54 },
    { lab: '/harness:evolve', ang: 126, mono: true },
    { lab: '다음 판', ang: 198 },
  ];
  const EC74 = { x: 960, y: 490, rx: 650, ry: 262 };
  // 프로젝트 CLAUDE.md 변경 이력 표(2026-11-16에 읽음, 일곱 행: 11-15 다섯 행 + 11-16 두 행). 카드에 다 들어가지 않으므로
  // 첫 행과 최근 세 행을 넣고 사이 세 행(대체 경로 추가 · 권한 확인 창 대응 · 본인 자료 출처 규칙)을 「…」로 줄인다.
  // 변경 내용 칸은 표의 첫 구절을 줄여 옮기고, 11-16 두 행은 개발 용어(cut·revise·헤드리스·자체 시험) 없이 쉬운 말로 줄인다(검수 지시). null = 「…」 줄. 줄 수를 바꿔도 카드 높이·위치는 아래에서 다시 계산한다
  const LOG74 = [
    ['2026-11-15', '처음 구성: 에이전트 7 · 스킬 8 · 워크플로 2'],
    null,
    ['2026-11-15', '슬라이드 사이 전환을 평면 밀기 하나로 바꿈'],
    ['2026-11-16', '영상 경계 바로 전환 · 여백 검사 추가'],
    ['2026-11-16', '인트로 구성 변경 · 브라우저 실행 규칙'],
  ];
  const ePt = deg => [EC74.x + EC74.rx * Math.cos((deg * Math.PI) / 180), EC74.y + EC74.ry * Math.sin((deg * Math.PI) / 180)];
  DECK.slide({
    id: 'evolve', holds: [], dur: 3.3, notes: NOTES['evolve'],
    setup(el) {
      const $ = this.$, c = $.c = pal();
      $.loop = layer(el);
      const sv = svgIn($.loop);
      $.ghost = line(sv, `M${EC74.x - EC74.rx} ${EC74.y}A${EC74.rx} ${EC74.ry} 0 1 1 ${EC74.x + EC74.rx} ${EC74.y}A${EC74.rx} ${EC74.ry} 0 1 1 ${EC74.x - EC74.rx} ${EC74.y}`, rg(c.acc2, 0.55), 2.5, { 'stroke-dasharray': '6 10' });
      // 칸(가운데 기준)
      $.nodes = EV74.map((N, i) => {
        const [x0, y0] = ePt(N.ang);
        const el2 = div($.loop, { left: '0px', top: '0px', height: '84px', padding: '0 30px', borderRadius: '16px', border: `2.5px solid ${rg(c.ink, 0.75)}`, background: rg(c.bg0, 0.9),
          font: N.mono ? MONO(36, 600) : BODY(38, 700), lineHeight: '79px', color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, N.lab);
        const w = el2.offsetWidth;
        css(el2, { left: f1(x0 - w / 2) + 'px', top: f1(y0 - 42) + 'px' });
        return { N, el: el2, x: x0, y: y0, w, hh: 84 };
      });
      $.mk = U.mark($.nodes[3].el, { word: '/harness:evolve' });
      // 칸 사이 호(칸 밖 부분만) + 화살촉
      const inside = (p, nd) => Math.abs(p[0] - nd.x) < nd.w / 2 + 14 && Math.abs(p[1] - nd.y) < nd.hh / 2 + 14;
      $.arcs = EV74.map((N, i) => {
        const A = $.nodes[i], B = $.nodes[(i + 1) % 5];
        let a0 = N.ang, a1 = EV74[(i + 1) % 5].ang; if (a1 < a0) a1 += 360;
        const pts = [];
        for (let k = 0; k <= 90; k++) { const p = ePt(lerp(a0, a1, k / 90)); if (!inside(p, A) && !inside(p, B)) pts.push(p); }
        const d = 'M' + pts.map(p => `${f1(p[0])} ${f1(p[1])}`).join('L');
        const e = pts[pts.length - 1], e0 = pts[pts.length - 3], an = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
        const hd = `M${f1(e[0] - 16 * Math.cos(an - 0.5))} ${f1(e[1] - 16 * Math.sin(an - 0.5))}L${f1(e[0])} ${f1(e[1])}L${f1(e[0] - 16 * Math.cos(an + 0.5))} ${f1(e[1] - 16 * Math.sin(an + 0.5))}`;
        return { p: line(sv, d, rg(c.ink, 0.9), 3), hd: line(sv, hd, rg(c.ink, 0.9), 3), a0, a1 };
      });
      $.pk = dot(sv, c.acc2, 7);
      // 둘째 묶음: 가운데 변경 이력 표
      // 카드 높이 = 머리 64 + 행 50 × 행 수 + 「…」 줄 30 + 아래 여백 12(첫 행 + … + 세 행: 306).
      // 아래 끝은 634(아래 두 칸 위 끝 y 660과 26px)에 맞추고 위로 쌓는다: 328~634.
      // 위 칸(처음 구성) 아래 끝 y 270과 58px, 카드 위 모서리와 순환 호 사이 가로 70px 안팎
      const HD74 = 64, RP74 = 50, EP74 = 30;
      const cardH = HD74 + LOG74.reduce((sum, r) => sum + (r ? RP74 : EP74), 0) + 12, cardTop = Math.min(372, 634 - cardH);
      $.card = div(el, { left: '520px', top: cardTop + 'px', width: '880px', height: cardH + 'px', borderRadius: '18px', border: `2px solid ${rg(c.acc2, 0.7)}`, background: rg(c.bg0, 0.94), opacity: 0 });
      div($.card, { left: '32px', top: '14px', font: MONO(28, 600), color: 'var(--mut)', whiteSpace: 'nowrap' }, 'CLAUDE.md · 변경 이력');
      let ry = HD74;
      $.rowsEl = LOG74.map(row => {
        const hh = row ? RP74 : EP74;
        const r = div($.card, { left: '32px', top: ry + 'px', width: '816px', height: hh + 'px', borderTop: `1.5px solid ${rg(c.ink, 0.18)}`, opacity: 0 });
        ry += hh;
        if (!row) { div(r, { left: '0px', width: '168px', top: '-10px', textAlign: 'center', font: MONO(28, 600), lineHeight: '40px', color: 'var(--mut)', whiteSpace: 'nowrap' }, '…'); return r; }
        div(r, { left: '0px', top: '5px', font: MONO(28, 600), color: 'var(--accent2)', whiteSpace: 'nowrap' }, row[0]);
        div(r, { left: '200px', top: '5px', font: MONO(28, 500), color: 'var(--ink)', whiteSpace: 'nowrap' }, row[1]);
        return r;
      });
      $.cap = div(el, { left: '0px', right: '0px', width: 'fit-content', marginLeft: 'auto', marginRight: 'auto', top: '836px', textAlign: 'center', font: BODY(40, 600), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '오늘 발표 자료의 하네스에도 변경 이력이 날짜별로 남아 있습니다');
      $.mk2 = U.mark($.cap, { word: '날짜별로' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      const pv = pre(x);
      $.loop.style.transform = U.depth(x, -0.3);
      show($.ghost, pv * (1 - prog(t, 1.2, 0.5)));
      // 한 클릭 개편(2026-11-16): 순환 다섯 칸(0.1~1.55) 다음에 변경 이력 표가 H1 1.35부터 클릭 없이 이어진다(설명 줄 2.45, 밑줄 2.9초에 끝).
      // 표가 나오면 순환 선은 0.55로 흐려 표에 시선이 가게 하고, 칸 이름은 끝 화면에서도 읽히게 0.75까지만 흐린다
      const H1 = 1.35, dim = prog(t, H1 + 0.05, 0.5);
      $.nodes.forEach((N, i) => {
        const t0 = 0.1 + i * 0.2;
        popIn(N.el, t, t0, 0.5, 0.7);
        N.el.style.opacity = f3(prog(t, t0, 0.2, ease.linear) * lerp(1, 0.75, dim));
      });
      $.arcs.forEach((A, i) => {
        const t0 = 0.25 + i * 0.2;
        draw(A.p, prog(t, t0, 0.4, ease.inOutCubic));
        show(A.hd, prog(t, t0 + 0.35, 0.15, ease.linear) * lerp(1, 0.55, dim));
        A.p.style.opacity = f3(lerp(1, 0.55, dim));
      });
      $.mk.render(t, 1.3, 0.5);
      // 머묾: 점이 순환 경로를 돈다(7초에 한 바퀴), 지나는 칸 테두리가 밝아진다
      const on = prog(t, 1.5, 0.5, ease.linear);
      const ang = -90 + mod((a * 360) / 7, 360), P = ePt(ang);
      $.pk.at(P[0], P[1], on);
      $.nodes.forEach(N => {
        let d = Math.abs(((ang - N.N.ang) % 360 + 540) % 360 - 180);
        const near = on * clamp(1 - d / 14);
        N.el.style.borderColor = near > 0.02 ? rg(c.acc2, 0.75 + 0.25 * near) : rg(c.ink, 0.75);
      });
      // 둘째 묶음
      const cp = prog(t, H1 + 0.1, 0.55, ease.pop);
      show($.card, prog(t, H1 + 0.1, 0.25, ease.linear));
      $.card.style.transform = `translateY(${f1((1 - cp) * 30)}px) scale(${f3(lerp(0.92, 1, cp))})`;
      $.rowsEl.forEach((r, i) => { const p = prog(t, H1 + 0.3 + i * 0.12, 0.45); show(r, p); r.style.transform = `translateX(${f1((1 - p) * -24)}px)`; U.wipe(r, p); });
      fadeUp($.cap, t, H1 + 0.6, 0.5, 22);
      $.mk2.render(t, H1 + 1.1, 0.45);
    },
  });

  // ───────────── 75 stars: 공개 저장소 revfactory/harness(dolly-in) ─────────────
  const FORK = 'M7 3.5a2.2 2.2 0 1 1 0 4.4a2.2 2.2 0 1 1 0-4.4z M17 3.5a2.2 2.2 0 1 1 0 4.4a2.2 2.2 0 1 1 0-4.4z M12 16.1a2.2 2.2 0 1 1 0 4.4a2.2 2.2 0 1 1 0-4.4z M7 7.9v1.6a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V7.9 M12 12.5v3.6';
  DECK.slide({
    id: 'stars', holds: [], dur: 2.5, notes: NOTES['stars'],
    setup(el) {
      const $ = this.$, c = $.c = pal();
      $.back = layer(el);
      const bsv = svgIn($.back);
      // 숫자 뒤 치수 칸(청사진 보조선)
      $.guides = [[500, 1060], [1110, 1670]].map(([x0, x1]) => line(bsv, rrect(x0, 286, x1 - x0, 372, 18), rg(c.acc2, 0.3), 2, { 'stroke-dasharray': '7 9' }));
      $.repo = div(el, { left: '0px', right: '0px', width: 'fit-content', marginLeft: 'auto', marginRight: 'auto', top: '200px', textAlign: 'center', font: MONO(44, 600), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, 'github.com/revfactory/harness');
      const lab = (x0, icon, txt) => {
        const L = div(el, { left: x0 + 'px', top: '314px', height: '56px', font: BODY(40, 700), lineHeight: '56px', color: 'var(--ink)', whiteSpace: 'nowrap', paddingLeft: '62px', opacity: 0 }, txt);
        const ic = div(L, { left: '0px', top: '4px', width: '48px', height: '48px' });
        const sv = s('svg', { width: 48, height: 48, viewBox: '0 0 24 24', fill: 'none', stroke: rg(c.acc, 1), 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ic);
        s('path', { d: icon }, sv);
        return { L, ic };
      };
      $.sL = lab(540, U.ICON.star, 'Star');
      $.fL = lab(1150, FORK, 'Fork');
      $.sN = U.counter(el, { x: 532, y: 628, from: 0, to: 9367, size: 200, color: 'var(--ink)' });
      $.fN = U.counter(el, { x: 1142, y: 628, from: 0, to: 1346, size: 200, color: 'var(--ink)' });
      // QR(왼쪽 아래)
      $.qr = U.image(el, 'assets/qr_harness.svg', { x: 190, y: 680, w: 220, h: 220, radius: 14, fit: 'contain' });
      $.qr.el.style.opacity = '0';
      // 둘째 묶음: 시간 축(첫 Star → 조회일)
      const sv = svgIn(el);
      $.axis = line(sv, 'M540 770H1640', rg(c.ink, 0.6), 2.5);
      $.ticks = [540, 1640].map(xx => line(sv, `M${xx} 756V784`, rg(c.ink, 0.8), 3));
      $.trail = line(sv, 'M540 770H541', rg(c.acc2, 0.9), 5);
      $.tdot = dot(sv, c.acc2, 9);
      $.dL = div(el, { left: '540px', top: '800px', font: BODY(32, 500), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '첫 Star 2026-03-27');
      $.dR = div(el, { right: W - 1640 + 'px', top: '800px', font: BODY(32, 500), color: 'var(--ink)', whiteSpace: 'nowrap', textAlign: 'right', opacity: 0 }, '2026-11-17 조회');
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const pv = pre(x);
      $.back.style.transform = U.depth(x, -0.5);
      $.guides.forEach((g, i) => {
        const p = Math.max(pv, prog(t, 0.1 + i * 0.1, 0.7, ease.inOutCubic));
        if (p < 1) draw(g, p); else { g.style.strokeDasharray = '7 9'; g.style.strokeDashoffset = f1(-a * 22 * (i ? -1 : 1)); g.style.visibility = ''; }
      });
      const rp = prog(t, 0.05, 0.6);
      show($.repo, rp); U.wipe($.repo, rp);
      [$.sL, $.fL].forEach((Lb, i) => { fadeUp(Lb.L, t, 0.25 + i * 0.12, 0.45, 18); });
      $.sL.ic.style.transform = `rotate(${f1(a * 12)}deg)`;
      $.fL.ic.style.transform = `translateY(${f1(2 * Math.sin(a * 1.4))}px)`;
      $.sN.render(t, 0.35, 1.5, ease.outQuart);
      $.fN.render(t, 0.5, 1.5, ease.outQuart);
      const qp = prog(t, 0.7, 0.5, ease.pop);
      show($.qr.el, prog(t, 0.7, 0.25, ease.linear));
      $.qr.el.style.transform = `scale(${f3(lerp(0.8, 1, qp))})`;
      // 둘째 묶음(한 클릭 개편, 2026-11-16): 숫자가 거의 다 센 1.1초에 시간 축이 클릭 없이 이어진다(조회일 2.1초에 자리 잡음)
      const H1 = 1.1;
      draw($.axis, prog(t, H1 + 0.05, 0.6, ease.inOutCubic));
      $.ticks.forEach((tk, i) => draw(tk, prog(t, H1 + 0.05 + i * 0.5, 0.2)));
      fadeUp($.dL, t, H1 + 0.15, 0.45, 18); fadeUp($.dR, t, H1 + 0.55, 0.45, 18);
      const f = fr(a * 0.22), tx = lerp(540, 1640, ease.inOutSine(f)), tv = prog(t, H1 + 0.8, 0.4) * Math.min(1, f * 10, (1 - f) * 10);
      $.tdot.at(tx, 770, tv);
      $.trail.setAttribute('d', `M540 770H${f1(tx)}`); $.trail.style.opacity = f3(tv * 0.7);
    },
  });

  // ───────────── 76 harness-100: 바로 가져다 쓰는 하네스 100개 ─────────────
  const GX76 = 430, GY76 = 236, GC76 = 52, GG76 = 12;
  const HUE76 = [198, 222, 250, 280, 318, 350, 18, 42, 88, 150];
  const DOM76 = ['문서', '비즈니스', '교육', '데이터', '법률'];
  DECK.slide({
    id: 'harness-100', holds: [], dur: 2.8, notes: NOTES['harness-100'],
    setup(el) {
      const $ = this.$, c = $.c = pal();
      $.cv = U.canvas(el, 700, 700);
      css($.cv.canvas, { left: GX76 - 30 + 'px', top: GY76 - 30 + 'px' });
      $.cols = HUE76.map(hh => `hsl(${hh} 46% 62%)`);
      $.doms = DOM76.map((d, r) => div(el, { right: W - (GX76 - 26) + 'px', top: GY76 + r * (GC76 + GG76) + GC76 / 2 - 21 + 'px', font: BODY(30, 600), lineHeight: '42px', color: 'var(--ink)', whiteSpace: 'nowrap', textAlign: 'right', opacity: 0 }, d));
      $.domDots = DOM76.map((d, r) => div(el, { left: GX76 - 18 + 'px', top: GY76 + r * (GC76 + GG76) + GC76 / 2 - 5 + 'px', width: '10px', height: '10px', borderRadius: '50%', background: $.cols[r], opacity: 0 }));
      $.h = U.rise(el, 'Harness-100', { left: '1150px', top: '228px', font: DISP(92), letterSpacing: '-.03em', color: 'var(--ink)', whiteSpace: 'nowrap' });
      $.sub = div(el, { left: '1154px', top: '352px', font: BODY(40, 600), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '하네스 100개 · 10개 분야');
      $.sep = div(el, { left: '1154px', top: '440px', width: '600px', height: '2px', background: rg(c.ink, 0.25), transformOrigin: '0 50%' });
      $.labA = div(el, { left: '1154px', top: '470px', font: BODY(34, 600), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '에이전트 정의');
      $.labB = div(el, { left: '1504px', top: '470px', font: BODY(34, 600), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '스킬');
      $.nA = U.counter(el, { x: 1150, y: 668, from: 0, to: 489, size: 140, color: 'var(--accent2)', suffix: '개', suffixColor: 'var(--ink)' });
      $.nB = U.counter(el, { x: 1500, y: 668, from: 0, to: 315, size: 140, color: 'var(--accent2)', suffix: '개', suffixColor: 'var(--ink)' });
      // 저장소 주소(2026-11-17 사용자 지시). 숫자 아래, 오른쪽 끝이 x 1750 안쪽
      $.url = div(el, { left: '1154px', top: '716px', font: MONO(30, 600), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, 'github.com/revfactory/harness-100');
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c, g = $.cv;
      const pv = pre(x);
      $.h.render(t, 0.1, { each: 0.04 });
      fadeUp($.sub, t, 0.5, 0.45, 18);
      $.doms.forEach((d, r) => { const p = prog(t, 0.5 + r * 0.07, 0.45); show(d, p); d.style.transform = `translateX(${f1((1 - p) * 24)}px)`; show($.domDots[r], p); });
      // 한 클릭 개편(2026-11-16): 격자·분야 이름 다음에 489·315가 B2 1.0부터 클릭 없이 이어진다(숫자 2.4초에 다 셈)
      const B2 = 1.0;
      $.sep.style.transform = `scaleX(${f3(prog(t, B2, 0.6, ease.outExpo))})`;
      fadeUp($.labA, t, B2, 0.45, 18); fadeUp($.labB, t, B2 + 0.12, 0.45, 18);
      $.nA.render(t, B2 + 0.05, 1.2, ease.outQuart); $.nB.render(t, B2 + 0.2, 1.2, ease.outQuart);
      { const up = prog(t, B2 + 0.7, 0.6); show($.url, up); U.wipe($.url, up); }
      // 격자: 칸 윤곽은 도착 전부터, 색 칸은 대각선 순서로 튀어 오른다
      g.clearRect(0, 0, 700, 700);
      const scan = mod(Math.floor(a * 2.5), 100), sr = Math.floor(scan / 10), sc = scan % 10, sOn = prog(t, 2.2, 0.4);
      for (let r = 0; r < 10; r++) for (let k = 0; k < 10; k++) {
        const x0 = 30 + k * (GC76 + GG76), y0 = 30 + r * (GC76 + GG76);
        const p = prog(t, 0.15 + (r + k) * 0.03, 0.45, ease.pop);
        g.strokeStyle = rg(c.ink, 0.22 * pv * (1 - clamp(p))); g.lineWidth = 1.5;
        g.strokeRect(x0 + 0.75, y0 + 0.75, GC76 - 1.5, GC76 - 1.5);
        if (p <= 0) continue;
        const sz = GC76 * lerp(0.3, 1, p), off = (GC76 - sz) / 2;
        g.globalAlpha = clamp(p * 1.5) * (0.8 + 0.2 * Math.sin(a * 1.7 - (r + k) * 0.45));
        g.fillStyle = $.cols[r];
        g.beginPath(); g.roundRect(x0 + off, y0 + off, sz, sz, 8); g.fill();
        g.globalAlpha = 1;
      }
      // 머묾: 한 칸씩 골라 보는 테두리
      if (sOn > 0) {
        const x0 = 30 + sc * (GC76 + GG76), y0 = 30 + sr * (GC76 + GG76), k = fr(a * 2.5);
        g.strokeStyle = rg(c.ink, sOn); g.lineWidth = 4;
        g.beginPath(); g.roundRect(x0 - 5, y0 - 5, GC76 + 10, GC76 + 10, 11); g.stroke();
        g.strokeStyle = rg(c.ink, sOn * 0.5 * (1 - k)); g.lineWidth = 2;
        g.beginPath(); g.roundRect(x0 - 5 - 10 * k, y0 - 5 - 10 * k, GC76 + 10 + 20 * k, GC76 + 10 + 20 * k, 11 + 6 * k); g.stroke();
      }
    },
  });

  // ───────────── 77 recap-meta: 정리 ─────────────
  // 바탕은 장 바탕 blueprint 그대로다(v06_cases 첫 프레임과 같은 바탕·같은 트리). 영상이 열리는 동안 오른쪽 요약 글만 사라진다.
  DECK.slide({
    id: 'recap-meta', holds: [], dur: 2.5, notes: NOTES['recap-meta'],
    setup(el) {
      const $ = this.$, c = $.c = pal();
      $.back = layer(el);
      $.ts = tSquare($.back, 600, 1720, 220, 900, c.acc2);
      $.tree = U.fileTree(el, { preset: 'side', current: 'c05', done: 5, checkFrom: 5, markAt: 0.45, checkAt: 0.6 });
      $.k = div(el, { left: '640px', top: '336px', font: MONO(40, 700), color: 'var(--accent)', whiteSpace: 'nowrap', opacity: 0 }, '자동구성.md');
      $.h = div(el, { left: '640px', top: '394px', font: DISP(68), lineHeight: '1.3', letterSpacing: '-.025em', color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '팀 구성도 한 줄로 요청한다');
      $.mk = U.mark($.h, { word: '한 줄' });
      $.sub = div(el, { left: '640px', top: '540px', font: BODY(44, 600), color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0 }, '만들어진 파일은 사람이 읽고 고친다');
      $.mk2 = U.mark($.sub, { word: '사람이' });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.back.style.transform = U.depth(x, -0.3);
      $.ts.render(a, prog(t, 0.8, 0.8, ease.linear));
      $.tree.render(t);
      // 한 클릭 개편(2026-11-16): 파일 트리 시각(markAt 0.45 · checkAt 0.6, 효과음과 맞춤)은 그대로 두고,
      // 덧붙이는 한 줄을 1.1초에 이어서 올린다(밑줄 2.05초에 끝)
      fadeUp($.k, t, 0.2); fadeUp($.h, t, 0.32);
      $.mk.render(t, 1.0, 0.5);
      fadeUp($.sub, t, 1.1);
      $.mk2.render(t, 1.6, 0.45);
    },
  });
})();
