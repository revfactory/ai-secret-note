/* c07 사람.md — 기준과 책임은 사람이 정한다 (슬라이드 94~102)
 * 바탕: 장 기본 glow(98번만 paper — 내일 해 볼 점검표를 종이 위에 둔다).
 * 콘셉트 반복 요소: U.fileTree(94 장 표지, 100 마지막 트리, 102 질문), U.mark(94·96·99·100·101).
 * 경로 줄·출처 줄은 엔진 공통 크롬(chrome.source). 카메라는 스토리보드 값, 노트는 아래 N에 스토리보드 notes를 그대로 옮겼다.
 * 예외: 99번 노트와 첫 근거 숫자는 리더 결정(2026-11-16, 자체 시험 강조 줄이기)으로 자체 시험 49.5 → 79.3 대신 LangChain 52.8 → 66.5를 쓴다.
 * 덱 비평 반영(2026-11-16, 리더 결정): 99번 셋째 줄·근거 배지, 92번 r 보조 줄과 노트 결론, 97·98·101·102번 노트, 101번 첫 줄, 102번 평면 밀기.
 * dolly-in·drift 슬라이드의 글자는 화면 가장자리에서 175px 이상 안쪽(x 176~1744)에 둔다.
 * 2026-11-17 발표자 지시: 자기평가와 실제 행동(r = .09)·코딩챌린지·더 읽을 자료(책·QR) 세 장을 지웠다. 위아래 번호는 새 덱(102장) 기준, 아래 이력의 번호는 그때 기준.
 * 한 클릭 개편(2026-11-16, 발표자 지시): 92~99번을 빌드 1개로 바꿨다. 묶음은 클릭 없이 이어서 나오고, 끝 화면에서 앞 묶음을 흐리게 두지 않는다. 2빌드는 101번(인사)만 남는다.
 */
(function () {
  const { ease, prog, clamp, lerp, rand, css, h, s, show, smooth } = DECK;
  const TAU = Math.PI * 2;
  const N = {
    "cover-human": "마지막 파일은 사람입니다. 에이전트가 일을 맡아도 사람이 정해야 하는 것이 있습니다.",
    "public-ethics": "기관에 계신 분들께 직접 해당하는 내용입니다. 지난달 공공부문 AI 윤리기준이 확정됐다는 보도가 있었습니다. 여섯 가지 가치, 점검 항목 예순여덟 개, 3단계 자율점검입니다. 복지 대상자 선정, 인허가, 위험 예측 같은 업무는 사람이 최종 책임을 진다고 적혀 있습니다. 요청서의 권한 칸에 들어갈 내용이 이미 기준으로 정해져 있습니다. (기사 기준이다. 정부 원문은 열어 보지 못했다고 질문이 오면 밝힌다.)",
    "measure-first": "공공부문 AI 도입·활용 가이드도 같은 말을 합니다. 시범 도입부터 합니다. 그리고 성과지표와 중단 기준을 미리 정합니다. 앞에서 본 완료 기준, 한도와 같은 내용입니다. 잘 되면 무엇으로 알 수 있는지, 어떤 경우에 멈추는지를 시작 전에 적습니다.",
    "human-four": "사람이 맡는 일은 네 가지로 모입니다. 목표를 정하고, 품질 기준을 정하고, 맥락을 판단하고, 책임을 집니다. 질문으로 바꾸면 셋입니다. 무엇을 풀 것인가, 왜 중요한가, 어디까지가 좋은 결과인가. 이 세 질문의 답이 요청서가 됩니다.",
    "tomorrow": "내일 사무실이나 강의실에서 해 볼 세 가지입니다. 도구는 무엇이든 괜찮습니다. 첫째, 자주 하는 요청 하나를 골라 일곱 칸 요청서로 다시 써 봅니다. 문서 파일 하나면 됩니다. 둘째, 일을 맡기기 전에 완료 기준을 먼저 적습니다. 세 줄이면 충분합니다. 셋째, 만드는 역할과 확인하는 역할을 나눕니다. 대화 창을 하나 더 열어서 결과만 붙여 넣고 요청서 기준으로 검토하게 하는 것부터 시작할 수 있습니다.",
    "three-again": "처음에 보여 드린 세 문장입니다. 같은 AI도 일하는 환경을 정리하면 결과가 달라집니다. LangChain은 모델을 그대로 두고 하네스만 고쳐 52.8점에서 66.5점이 됐습니다. 환경은 파일로 적습니다. 읽히는 파일에 넣었을 때 통과율이 53퍼센트에서 100퍼센트가 됐습니다. 셋째, 나뉘는 일은 팀에 맡깁니다. Anthropic 리서치 과제에서 멀티에이전트가 단일 에이전트보다 90.2퍼센트 높은 평가를 받았고, 토큰은 약 15배 썼습니다. 그래서 일의 크기에 맞춰 팀을 꾸립니다. 기준과 책임은 사람이 정합니다.",
    "tree-done": "파일 일곱 개를 모두 열었습니다. 제 비밀노트는 이것이 전부입니다. 특별한 문장은 없고, 적어 둔 파일이 있습니다.",
    "final": "AI를 쓰는 데서 그치지 않고 AI 에이전트 팀을 설계하는 시기입니다. 설계할 때 쓰는 것은 오늘 보신 파일들입니다. [클릭] 들어 주셔서 감사합니다.",
    "qa": "(질문 10분. 예상 질문: 실험을 직접 하셨는데 믿을 수 있나 → 한계를 밝히고 LangChain·Vercel 결과를 다시 말한다. 비용은 얼마나 드나 → 약 4배·약 15배, 20분 9달러와 6시간 200달러. 개발자가 아니어도 되나 → 요청서부터. 웹툰과 드라마 대본 사례도 코드를 직접 쓰지 않고 요청과 하네스로 만들었다. 보안·개인정보 → 권한 칸과 공공부문 윤리기준. 질문이 끝나거나 시간이 남으면 → 키로 부록 103~107번 사례 영상을 보여 준다.)",
  };

  // ───────── 장 전용 도우미 ─────────
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${(+a).toFixed(3)})`;
  const mix = (a, b, p) => [0, 1, 2].map(i => Math.round(lerp(a[i], b[i], clamp(p))));
  const pal = () => ({ ink: DECK.color('ink'), mut: DECK.color('mut'), acc: DECK.color('accent'), acc2: DECK.color('accent2'), ok: DECK.color('ok'),
    bg0: DECK.color('bg0'), pink: DECK.color('paperInk'), paper: DECK.color('paper') });
  // 가운데 정렬(상자를 글자 폭만큼으로 — 확대돼도 화면 밖으로 재지지 않게)
  const CENTER = { left: '0px', right: '0px', width: 'fit-content', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' };
  function tline(parent, html, st, cls = 'a nw') {
    const d = h('div', cls, parent, html);
    css(d, Object.assign({ opacity: 0 }, st));
    return d;
  }
  // 아래에서 솟으며 나타남
  function up(el, t, st, dur = 0.55, dy = 34) {
    const p = prog(t, st, dur, ease.snap);
    show(el, prog(t, st, dur * 0.45, ease.linear));
    el.style.transform = `translateY(${((1 - p) * dy).toFixed(1)}px)`;
    return p;
  }
  // 한 줄이 마스크 안에서 통째로 솟는 글자(형광 밑줄을 긋는 줄에 쓴다. U.rise 결과에는 밑줄 아래 글자색을 바꿀 수 없어서)
  function mline(parent, html, o) {
    const box = h('div', 'a nw', parent);
    css(box, { left: (o.x ?? 0) + 'px', top: (o.y ?? 0) + 'px', font: o.font, letterSpacing: o.ls || '0', color: o.color || 'var(--ink)',
      overflow: 'hidden', padding: '.14em .12em .26em', margin: '-.14em -.12em -.26em', visibility: 'hidden', opacity: 0 });
    const inner = h('div', '', box, html);
    return { box, inner };
  }
  function mrise(m, t, st, dur = 0.65) {
    const p = prog(t, st, dur, ease.snap);
    show(m.box, p > 0 ? 1 : 0);
    m.inner.style.transform = `translateY(${((1 - p) * 112).toFixed(2)}%)`;
    return p;
  }
  // 정규분포 난수(결정적)
  const gauss = (i, salt) => Math.sqrt(-2 * Math.log(Math.max(1e-6, rand(i, salt)))) * Math.cos(TAU * rand(i, salt + 1));
  function svgFull(parent) {
    const sv = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, parent);
    css(sv, { position: 'absolute', left: 0, top: 0 });
    return sv;
  }
  // QR 카드(크림색 판 + svg QR). 파일이 없으면 같은 크기의 자리 표시
  function qrCard(parent, src, x, y, size) {
    const pad = Math.round(size * 0.06);
    const card = h('div', 'a', parent);
    css(card, { left: x + 'px', top: y + 'px', width: size + pad * 2 + 'px', height: size + pad * 2 + 'px', borderRadius: '16px', background: '#f6efe6',
      padding: pad + 'px', boxShadow: '0 18px 46px rgba(0,0,0,.42)', opacity: 0 });
    const im = DECK.img(src);
    if (im.missing) {
      const ph = h('div', '', card);
      css(ph, { width: size + 'px', height: size + 'px', border: '2px dashed #9a948a', borderRadius: '8px' });
    } else {
      css(im, { width: size + 'px', height: size + 'px', display: 'block' });
      card.appendChild(im);
    }
    return { card, w: size + pad * 2 };
  }
  // 둘레를 도는 점선 테(QR은 건드리지 않고 바깥에서만 움직인다)
  function ants(sv, x, y, w, hh, col) {
    return s('rect', { x, y, width: w, height: hh, rx: 24, fill: 'none', stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '14 12', opacity: 0 }, sv);
  }

  // ─────────────────────────────────────────────────────────────
  // 94 장 표지: 사람.md (pull-out · drift)
  //   트리는 앞 장 정리(90)에서 이어져 처음부터 보인다(여섯 줄 확인 표시). 도착하면 「사람.md」 줄에 밑줄이 그어지고,
  //   그 줄에서 가지 선이 오른쪽으로 뻗어 장 이름과 요약으로 이어진다. 마지막 줄의 빈 확인 칸이 맥동한다(100번에서 채워짐)
  // ─────────────────────────────────────────────────────────────
  DECK.slide({
    id: 'cover-human', holds: [], dur: 2.3, notes: N['cover-human'],
    setup(el) {
      const $ = this.$;
      $.back = h('div', 'full', el);
      $.ph = h('div', 'full', $.back);
      U.image($.ph, 'assets/img/kv_human.png', { x: -60, y: -34, w: 2040, h: 1148, radius: 0 });
      css($.ph, { opacity: 0.35, transformOrigin: '960px 540px' });
      $.sun = h('div', 'a', $.back);
      css($.sun, { left: '-600px', top: '0px', width: '3120px', height: '1080px',
        background: `linear-gradient(112deg, transparent 40%, ${DECK.rgba('accent', 0.06)} 46%, ${DECK.rgba('accent', 0.11)} 50%, ${DECK.rgba('accent', 0.06)} 54%, transparent 60%)` });
      $.shade = h('div', 'full', el);
      css($.shade, { background: `linear-gradient(90deg, ${DECK.rgba('bg0', 0.88)} 0%, ${DECK.rgba('bg0', 0.78)} 24%, ${DECK.rgba('bg0', 0.42)} 46%, ${DECK.rgba('bg0', 0.3)} 70%, ${DECK.rgba('bg0', 0.5)} 100%)` });

      const X = 176, Y = 308;
      $.tree = U.fileTree(el, { preset: 'side', x: X, current: 7, done: 6, checkFrom: 7, markAt: 0.15, markDur: 0.5 });
      const T = $.tree, sz = T.size, R = T.R, r7 = T.rows[6];
      const kz = Math.round(sz * 0.86), ky = Y + 7 * R + Math.round((R - kz) / 2), kx = X + Math.round(sz * 1.4);
      $.svg = svgFull(el);
      $.pend = s('rect', { x: kx + 2, y: ky + 2, width: kz - 4, height: kz - 4, rx: 4, fill: 'none', stroke: DECK.rgba('accent', 1), 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: 0 }, $.svg);
      // 사람.md 줄에서 오른쪽으로 뻗는 가지(트리 가지 선과 같은 꺾인 선)
      const y0 = Y + 7 * R + R / 2, x0 = X + Math.round(sz * 2.5) + r7.nameEl.offsetWidth + 24;
      const KY = 362, KH = 56, ky0 = KY + KH / 2;
      $.link = s('path', { d: `M${x0} ${y0} H 628 V ${ky0} H 664`, fill: 'none', stroke: DECK.rgba('accent', 0.9), 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $.svg);
      $.knot = s('circle', { cx: 628, cy: y0, r: 6, fill: DECK.rgba('accent', 1), opacity: 0 }, $.svg);
      $.kick = tline(el, '사람.md', { left: '686px', top: KY + 'px', font: '700 46px/56px var(--mono)', color: 'var(--accent)' });
      const TS = { font: 'var(--displayW) 96px/1.12 var(--display)', letterSpacing: '-.035em', color: 'var(--ink)', whiteSpace: 'nowrap' };
      $.t1 = U.rise(el, '기준과 책임은', Object.assign({ left: '682px', top: '448px' }, TS));
      $.t2 = U.rise(el, '사람이 정한다', Object.assign({ left: '682px', top: '556px' }, TS));
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.back.style.transform = U.depth(x, -0.5);
      $.ph.style.transform = `translate(${(10 * Math.sin(a * 0.06)).toFixed(2)}px, ${(6 * Math.cos(a * 0.05)).toFixed(2)}px) scale(${(1.02 + 0.03 * Math.sin(a * 0.09)).toFixed(5)})`;
      $.sun.style.transform = `translateX(${lerp(-1400, 1400, (a * 0.045 + 0.35) % 1).toFixed(1)}px)`;
      $.tree.render(t);
      const pp = prog(t, 0.55, 0.35, ease.linear);
      $.pend.setAttribute('opacity', (pp * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a * 2.6)))).toFixed(3));
      U.draw($.link, prog(t, 0.4, 0.7, ease.inOutCubic));
      $.knot.setAttribute('opacity', prog(t, 0.55, 0.2, ease.linear).toFixed(3));
      up($.kick, t, 0.85, 0.5, 26);
      $.t1.render(t, 0.95, { each: 0.04 });
      $.t2.render(t, 1.12, { each: 0.04 });
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 95 공공부문 AI 윤리기준 (slide-r · none)
  //   숫자 셋 아래에 각 숫자만큼의 도형(가치 6개, 점검 항목 68칸, 3단계 막대). 68칸은 숫자가 올라가는 동안 채워진다.
  //   업무 카드 세 장에 「사람이 최종 책임」 표시가 크게 기울어진 채 내려앉으며 차례로 붙는다.
  //   빌드 1개(한 클릭 개편): 0.1초 기준 이름 → 0.55초 숫자 셋과 도형 → 1.45초 업무 카드와 표시. 2.85초에 모두 자리.
  //   끝 화면에서 숫자를 흐리게 두지 않는다(이전 셋째 빌드의 숫자 흐림을 뺐다)
  // ─────────────────────────────────────────────────────────────
  const COLX = [420, 960, 1500];
  const STATS = [{ n: 6, suf: '대', cap: '가치' }, { n: 68, suf: '개', cap: '점검 항목' }, { n: 3, suf: '단계', cap: '자율점검' }];
  const DUTIES = ['복지 대상자 선정', '인허가', '위험 예측'];
  DECK.slide({
    id: 'public-ethics', holds: [], dur: 3.2, notes: N['public-ethics'],
    chrome: { source: { text: '출처: 뉴스서울, 2026-10-01 기사', step: 0 } },
    setup(el) {
      const $ = this.$; $.c = pal();
      $.head = tline(el, '공공부문 AI 윤리기준<span style="color:var(--mut);font-weight:500"> · 2026년 10월 확정 보도</span>',
        Object.assign({ top: '176px', font: '700 44px/1.3 var(--sans)', color: 'var(--ink)' }, CENTER));
      $.rule = h('div', 'a', el);
      css($.rule, { left: '860px', top: '248px', width: '200px', height: '4px', background: 'var(--accent)', transformOrigin: '50% 50%', transform: 'scaleX(0)' });
      $.sv = svgFull(el);
      // 도형 자리: 숫자 도형과 카드의 윤곽(도착하는 동안 먼저 보이고, 빌드2·3의 도형과 카드가 그 위에 놓인다)
      $.skel = s('g', { opacity: 0 }, $.sv);
      const sk = { fill: 'none', stroke: DECK.rgba('ink', 0.2), 'stroke-width': 1.5 };
      for (let k = 0; k < 6; k++) s('circle', Object.assign({ cx: COLX[0] - 100 + k * 40, cy: 560, r: 11 }, sk), $.skel);
      for (let k = 0; k < 68; k++) s('rect', Object.assign({ x: COLX[1] - 167 + (k % 17) * 20 + 0.75, y: 526 + Math.floor(k / 17) * 20 + 0.75, width: 12.5, height: 12.5, rx: 3 }, sk), $.skel);
      for (let k = 0; k < 3; k++) s('rect', Object.assign({ x: COLX[2] - 98 + k * 70 + 0.75, y: 594 - (24 + k * 22) + 0.75, width: 54.5, height: 22.5 + k * 22, rx: 5 }, sk), $.skel);
      $.slots = COLX.map(cx => s('rect', { x: cx - 230, y: 682, width: 460, height: 180, rx: 20, fill: 'none', stroke: DECK.rgba('ink', 0.18), 'stroke-width': 2, 'stroke-dasharray': '8 10' }, $.sv));
      $.cols = STATS.map((st, i) => {
        const cx = COLX[i];
        const wrap = h('div', 'a nw', el);
        css(wrap, { left: cx - 260 + 'px', top: '284px', width: '520px', textAlign: 'center', opacity: 0, transformOrigin: '50% 100%' });
        const num = h('span', 'tnum', wrap, String(st.n));
        css(num, { font: '400 150px/1 var(--num)', color: 'var(--ink)', display: 'inline-block' });
        const suf = h('span', '', wrap, st.suf);
        css(suf, { font: '800 54px/1 var(--sans)', color: 'var(--accent)', display: 'inline-block', marginLeft: '8px' });
        const cap = tline(el, st.cap, { left: cx - 260 + 'px', top: '448px', width: '520px', textAlign: 'center', font: '600 36px/1.3 var(--sans)', color: 'var(--mut)' });
        return { wrap, num, suf, cap };
      });
      // 도형: 가치 6개(원), 점검 항목 68칸(17×4), 3단계(막대)
      $.vals = Array.from({ length: 6 }, (_, k) => s('circle', { cx: COLX[0] - 100 + k * 40, cy: 560, r: 0, fill: DECK.rgba('accent', 0.85) }, $.sv));
      $.cells = Array.from({ length: 68 }, (_, k) => {
        const col = k % 17, row = Math.floor(k / 17);
        return s('rect', { x: COLX[1] - 167 + col * 20, y: 526 + row * 20, width: 14, height: 14, rx: 3, fill: DECK.rgba('ink', 0.14) }, $.sv);
      });
      $.steps = [0, 1, 2].map(k => s('rect', { x: COLX[2] - 98 + k * 70, y: 594 - (24 + k * 22), width: 56, height: 24 + k * 22, rx: 5, fill: DECK.rgba('accent', 0.85), opacity: 0 }, $.sv));
      $.steps.forEach(r => { r.style.transformBox = 'fill-box'; r.style.transformOrigin = '50% 100%'; });
      // 업무 카드
      $.cards = DUTIES.map((d, i) => {
        const cd = h('div', 'a', el);
        css(cd, { left: COLX[i] - 230 + 'px', top: '682px', width: '460px', height: '180px', borderRadius: '20px', background: 'color-mix(in srgb, var(--bg1) 92%, transparent)',
          border: '2px solid var(--line)', opacity: 0 });
        const tt = h('div', 'a nw', cd, d);
        css(tt, { left: '32px', top: '28px', font: '700 40px/1.25 var(--sans)', color: 'var(--ink)' });
        const st = h('div', 'a nw', cd, '사람이 최종 책임');
        css(st, { left: '30px', top: '104px', font: '800 30px/1 var(--sans)', color: 'var(--accent)', padding: '10px 18px', borderRadius: '12px', border: '3px solid var(--accent)',
          opacity: 0, transformOrigin: '30% 50%' });
        return { cd, st };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      const early = smooth(0.0, 0.5, x.arrive);
      $.skel.setAttribute('opacity', early.toFixed(3));
      $.slots.forEach((r, i) => r.setAttribute('opacity', (early * (1 - prog(t, 1.45 + i * 0.1, 0.3, ease.linear))).toFixed(3)));
      up($.head, t, 0.1);
      $.rule.style.transform = `scaleX(${prog(t, 0.35, 0.6, ease.outExpo).toFixed(4)})`;
      $.cols.forEach((cl, i) => {
        const st = 0.55 + i * 0.12;
        const p = prog(t, st, 0.6, ease.pop);
        show(cl.wrap, prog(t, st, 0.2, ease.linear));
        cl.wrap.style.transform = `translateY(${((1 - p) * 50).toFixed(1)}px) scale(${lerp(0.82, 1, p).toFixed(4)})`;
        if (i === 1) cl.num.textContent = DECK.count(prog(t, st, 0.9, ease.outQuart), 68, { comma: false });
        up(cl.cap, t, st + 0.2, 0.5, 18);
      });
      // 가치 6개: 차례로 솟고, 머무는 동안 차례로 맥동
      $.vals.forEach((v, k) => {
        const p = prog(t, 0.6 + k * 0.06, 0.45, ease.pop);
        const pul = 0.5 + 0.5 * Math.sin(a * 2 - k * 0.8);
        v.setAttribute('r', (12 * p * (1 + 0.18 * pul * prog(t, 1.2, 0.4))).toFixed(2));
      });
      // 68칸: 숫자가 올라가는 만큼 채워지고, 머무는 동안 밝은 띠가 왼쪽에서 오른쪽으로 지나간다
      const filled = 68 * prog(t, 0.67, 0.9, ease.outQuart);
      const sweep = ((a * 3.2) % 26) - 4;
      $.cells.forEach((r, k) => {
        const col = k % 17, on = k < filled ? 1 : 0;
        const hi = Math.exp(-((col - sweep) ** 2) / 3) * prog(t, 1.6, 0.5);
        r.setAttribute('fill', on ? rgb(mix(c.acc, c.ink, hi * 0.7), 0.5 + 0.5 * hi) : rgb(c.ink, 0.12));
        r.setAttribute('opacity', prog(t, 0.6 + col * 0.012, 0.25, ease.linear).toFixed(3));
      });
      // 3단계: 막대가 자라고, 머무는 동안 한 단계씩 차례로 밝아진다
      const cur = Math.floor(a * 0.8) % 3;
      $.steps.forEach((r, k) => {
        const p = prog(t, 0.85 + k * 0.1, 0.5, ease.pop);
        r.setAttribute('opacity', clamp(p * 4).toFixed(3));
        r.style.transform = `scaleY(${Math.max(0.001, p).toFixed(4)})`;
        r.setAttribute('fill', rgb(c.acc, k === cur ? 1 : 0.42 + 0.2 * (1 - prog(t, 1.6, 0.4))));
      });
      // 업무 카드와 「사람이 최종 책임」 표시
      $.cards.forEach((cd, i) => {
        const st = 1.45 + i * 0.1;
        const p = prog(t, st, 0.6, ease.pop);
        show(cd.cd, prog(t, st, 0.22, ease.linear));
        cd.cd.style.transform = `translateY(${((1 - p) * 60).toFixed(1)}px)`;
        const ss = st + 0.4 + i * 0.1;
        const sp = prog(t, ss, 0.42, ease.outBack);
        show(cd.st, prog(t, ss, 0.12, ease.linear));
        cd.st.style.transform = `scale(${lerp(1.7, 1, sp).toFixed(4)}) rotate(${lerp(-10, -3, sp).toFixed(2)}deg)`;
        const land = prog(t, ss + 0.2, 0.4, ease.linear);
        cd.cd.style.borderColor = land > 0 ? `color-mix(in srgb, var(--accent) ${(land * 70).toFixed(0)}%, var(--line))` : '';
      });
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 96 성과지표와 중단 기준을 먼저 (push · drift)
  //   큰 글자 두 줄. 아래 선로: 짧은 시범 구간을 점이 오가고, 둘째 문장과 함께 그 구간에 깃발(성과지표)과 노란 멈춤 막대(중단 기준)가
  //   세워진 뒤 점이 깃발을 지나 막대에서 멈춘다.
  //   빌드 1개(한 클릭 개편): 0.12초 첫 문장과 시범 선로 → 0.8초 둘째 문장, 깃발·멈춤 막대 → 1.9초에 형광 밑줄과 라벨까지 자리.
  //   끝 화면에서 첫 문장을 흐리게 두지 않는다(이전 둘째 빌드의 흐림을 뺐다)
  // ─────────────────────────────────────────────────────────────
  const TRY = 770, TR0 = 240, TR1 = 780, TRE = 1680, FLAGX = 560;
  DECK.slide({
    id: 'measure-first', holds: [], dur: 2.3, notes: N['measure-first'],
    chrome: { source: { text: '출처: 행안부·NIA 공공부문 AI 도입·활용 가이드(기사 인용)', step: 0 } },
    setup(el) {
      const $ = this.$; $.c = pal();
      const F = 'var(--displayW) 76px/1.15 var(--display)';
      $.l1 = mline(el, '시범 도입부터 한다.', { x: 240, y: 356, font: F, ls: '-.03em' });
      $.l2 = mline(el, '성과지표와 중단 기준을 미리 정한다.', { x: 240, y: 470, font: F, ls: '-.03em' });
      $.mk = U.mark($.l2.inner, { word: '중단 기준' });
      $.sv = svgFull(el);
      $.rest = s('path', { d: `M${TR1} ${TRY} H ${TRE}`, stroke: DECK.rgba('ink', 0.18), 'stroke-width': 3, 'stroke-dasharray': '2 14', 'stroke-linecap': 'round', fill: 'none', opacity: 0 }, $.sv);
      $.pilot = s('path', { d: `M${TR0} ${TRY} H ${TR1}`, stroke: DECK.rgba('ink', 0.75), 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, $.sv);
      $.start = s('circle', { cx: TR0, cy: TRY, r: 0, fill: DECK.rgba('ink', 0.9) }, $.sv);
      $.dot = s('circle', { cx: TR0, cy: TRY, r: 11, fill: DECK.rgba('accent2', 1), opacity: 0 }, $.sv);
      $.ring = s('circle', { cx: TR1, cy: TRY, r: 14, fill: 'none', stroke: DECK.rgba('accent', 1), 'stroke-width': 3, opacity: 0 }, $.sv);
      $.stop = s('rect', { x: TR1 - 6, y: TRY - 40, width: 12, height: 80, rx: 4, fill: DECK.rgba('accent', 1), opacity: 0 }, $.sv);
      $.stop.style.transformBox = 'fill-box'; $.stop.style.transformOrigin = '50% 50%';
      // 깃발 72px(아이콘 24 격자의 깃대 x 5 → 15px, 아래 끝 y 21 → 63px). 깃대 아래 끝이 선로 바로 위에 선다
      $.flagBox = h('div', 'a', el);
      css($.flagBox, { left: FLAGX - 15 + 'px', top: TRY - 66 + 'px', width: '72px', height: '66px', opacity: 0, transformOrigin: '15px 63px' });
      $.flag = U.icon($.flagBox, 'flag', 72, 'var(--accent2)', 2);
      css($.flag, { position: 'absolute', left: '0px', top: '0px' });
      // 선로 라벨: 빌드1 「시범」(구간 선 아래 왼쪽), 빌드2 「성과지표」(깃발 위)·「중단 기준」(멈춤 막대 아래)
      const LF = '600 30px/1.3 var(--sans)';
      $.lbPilot = tline(el, '시범', { left: TR0 + 'px', top: TRY + 22 + 'px', font: '500 28px/1.3 var(--sans)', color: 'var(--mut)' });
      $.lbFlag = tline(el, '성과지표', { top: TRY - 108 + 'px', font: LF, color: 'var(--accent2)' });
      $.lbFlag.style.left = FLAGX + 16 - $.lbFlag.offsetWidth / 2 + 'px';
      $.lbStop = tline(el, '중단 기준', { top: TRY + 56 + 'px', font: LF, color: 'var(--accent)' });
      $.lbStop.style.left = TR1 - $.lbStop.offsetWidth / 2 + 'px';
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      mrise($.l1, t, 0.12);
      mrise($.l2, t, 0.8);
      $.mk.render(t, 1.35, 0.55);
      // 선로
      const early = smooth(0.0, 0.5, x.arrive);
      U.draw($.pilot, Math.max(early, prog(t, 0.35, 0.6, ease.inOutCubic)));
      $.rest.setAttribute('opacity', (Math.max(early, prog(t, 0.3, 0.4)) * 0.9).toFixed(3));
      $.start.setAttribute('r', (8 * Math.max(early, prog(t, 0.3, 0.4, ease.pop))).toFixed(2));
      const g2 = prog(t, 1.05, 0.45, ease.pop), g3 = prog(t, 1.2, 0.45, ease.outBack);
      show($.flagBox, prog(t, 1.05, 0.15, ease.linear));
      $.flagBox.style.transform = `scale(${lerp(0.3, 1, g2).toFixed(4)})`;
      $.stop.setAttribute('opacity', clamp(g3 * 3).toFixed(3));
      $.stop.style.transform = `scaleY(${Math.max(0.001, g3).toFixed(4)})`;
      up($.lbPilot, t, 0.7, 0.5, 20);
      up($.lbFlag, t, 1.2, 0.5, 20);
      up($.lbStop, t, 1.35, 0.5, 20);
      // 점: 시범 구간을 오가다가, 깃발과 막대가 선 뒤로는 깃발을 지나 멈춤 막대에서 멈췄다가 처음으로
      const run = prog(t, 0.9, 0.3, ease.linear);
      const P = 3.2, u = ((a * 1) % P) / P;                     // 3.2초 주기
      const go = clamp(u / 0.62), wait = clamp((u - 0.62) / 0.3);
      const xd = lerp(TR0 + 4, TR1 - (g3 > 0 ? 18 : 4), ease.inOutCubic(go));
      $.dot.setAttribute('cx', xd.toFixed(1));
      const fade = (1 - smooth(0.88, 1, u)) * smooth(0, 0.05, u);
      $.dot.setAttribute('opacity', (run * fade).toFixed(3));
      const hitFlag = g2 > 0.5 ? Math.exp(-((xd - FLAGX - 6) ** 2) / 900) : 0;
      $.flag.setAttribute('stroke', rgb(mix(c.acc2, c.ink, hitFlag), 1));
      $.flagBox.style.transform += ` translateY(${(-6 * hitFlag).toFixed(2)}px)`;
      const rw = g3 > 0.9 ? wait : 0;
      $.ring.setAttribute('r', (14 + 30 * rw).toFixed(1));
      $.ring.setAttribute('opacity', (rw > 0 ? 0.9 * (1 - rw) : 0).toFixed(3));
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 97 사람이 맡는 네 가지 (push · drift)
  //   네 칸에서 내려온 선이 한 줄로 모여 세 질문으로 이어진다(넷 → 셋)
  //   빌드 1개(한 클릭 개편): 0.12초 네 낱말이 화면 가운데에 솟고 → 0.82초 위로 비켜 서며 선이 모이고 → 1.6초부터 세 질문. 2.5초에 모두 자리.
  //   끝 화면에서 네 낱말과 번호를 흐리게 두지 않는다(이전 둘째 빌드의 흐림을 뺐다). 막대 맥동만 질문이 나오면 멈춘다
  // ─────────────────────────────────────────────────────────────
  const FOUR = ['목표 설정', '품질 기준', '맥락 판단', '책임과 윤리'];
  const FX = [380, 780, 1180, 1580];
  const QS = ['무엇을 풀 것인가', '왜 중요한가', '어디까지가 좋은 결과인가'];
  DECK.slide({
    id: 'human-four', holds: [], dur: 2.9, notes: N['human-four'],
    setup(el) {
      const $ = this.$; $.c = pal();
      $.sv = svgFull(el);
      $.cols = FOUR.map((w, i) => {
        const n = tline(el, String(i + 1), { left: FX[i] - 60 + 'px', top: '214px', width: '120px', textAlign: 'center', font: '400 60px/1 var(--num)', color: 'var(--accent)' });
        const bar = h('div', 'a', el);
        css(bar, { left: FX[i] - 40 + 'px', top: '292px', width: '80px', height: '6px', borderRadius: '3px', background: 'var(--accent)', transform: 'scaleX(0)' });
        // 낱말 상자는 글자 폭만큼(가운데 FX). 넓은 고정 폭 상자는 오른쪽 끝 「책임과 윤리」 상자가 x 1745를 넘었다
        const wd = tline(el, w, { top: '320px', font: 'var(--displayW) 60px/1.2 var(--display)', letterSpacing: '-.025em', color: 'var(--ink)' });
        wd.style.left = Math.round(FX[i] - wd.offsetWidth / 2) + 'px';
        return { n, bar, wd };
      });
      // 넷 → 셋으로 모이는 선
      $.drops = FX.map(fx => s('path', { d: `M${fx} 412 V 470`, stroke: DECK.rgba('ink', 0.35), 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, $.sv));
      $.bus = s('path', { d: `M${FX[0]} 470 H ${FX[3]}`, stroke: DECK.rgba('ink', 0.35), 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, $.sv);
      $.down = s('path', { d: 'M960 470 V 532', stroke: DECK.rgba('accent', 0.9), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, $.sv);
      $.pk = s('circle', { cx: 960, cy: 470, r: 6, fill: DECK.rgba('accent', 1), opacity: 0 }, $.sv);
      $.qs = QS.map((q, i) => tline(el, q, { left: '0px', top: 566 + i * 96 + 'px', font: '500 48px/1.3 var(--serif)', color: 'var(--ink)' }));
      const wmax = Math.max(...$.qs.map(q => q.offsetWidth));
      $.qx = Math.round(960 - wmax / 2 + 30);
      $.qs.forEach(q => { q.style.left = $.qx + 'px'; });
      $.qbars = QS.map((q, i) => {
        const b = h('div', 'a', el);
        css(b, { left: $.qx - 34 + 'px', top: 566 + i * 96 + 14 + 'px', width: '6px', height: '46px', borderRadius: '3px', background: 'var(--accent)', transformOrigin: '50% 0', transform: 'scaleY(0)' });
        return b;
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      const dim = prog(t, 0.85, 0.5);             // 네 칸 막대 맥동만 멈춘다(글자는 흐리게 하지 않는다)
      const cyc = (a * 0.55) % 4;
      const off = lerp(150, 0, prog(t, 0.82, 0.7, ease.inOutCubic));
      const early = smooth(0.0, 0.5, x.arrive);   // 네 낱말은 화면 가운데에 먼저 솟고, 질문이 나오기 전에 위로 비켜 준다
      $.cols.forEach((cl, i) => {
        const st = 0.12 + i * 0.08;
        const np = up(cl.n, t, st, 0.5, 30);
        cl.n.style.transform += ` translateY(${off.toFixed(1)}px)`;
        if (np < 1) show(cl.n, Math.max(parseFloat(cl.n.style.opacity), 0.45 * early));
        // 낱말도 밀려 들어오는 동안 솟기 시작할 자리에 흐리게 먼저 보인다(전환 35·50% 칸에서 무슨 화면인지 알아보게)
        const wp = up(cl.wd, t, st + 0.06, 0.55, 40);
        if (wp < 1) show(cl.wd, Math.max(parseFloat(cl.wd.style.opacity), 0.4 * early));
        cl.wd.style.transform += ` translateY(${off.toFixed(1)}px)`;
        const act = Math.max(0, 1 - Math.min(Math.abs(cyc - i), 4 - Math.abs(cyc - i)));
        const bw = Math.max(0.5 * early, prog(t, st + 0.2, 0.5, ease.outExpo)) * (1 + 0.9 * act * prog(t, 1.0, 0.4) * (1 - dim));
        cl.bar.style.transform = `translateY(${off.toFixed(1)}px) scaleX(${bw.toFixed(4)})`;
      });
      // 넷 → 셋
      $.drops.forEach((d, i) => U.draw(d, prog(t, 1.15 + i * 0.05, 0.3, ease.inOutCubic)));
      U.draw($.bus, prog(t, 1.25, 0.4, ease.inOutCubic));
      U.draw($.down, prog(t, 1.55, 0.25, ease.inOutCubic));
      $.pk.setAttribute('opacity', prog(t, 1.55, 0.2, ease.linear).toFixed(3));
      $.pk.setAttribute('r', (6 + 3 * (0.5 + 0.5 * Math.sin(a * 2.4)) * prog(t, 1.8, 0.4)).toFixed(2));
      $.qs.forEach((q, i) => {
        const st = 1.6 + i * 0.16;
        const p = prog(t, st, 0.6, ease.snap);
        show(q, prog(t, st, 0.25, ease.linear));
        q.style.transform = `translateX(${((1 - p) * -40).toFixed(1)}px)`;
        const qa = (a * 0.5 + i * 0.66) % 2;
        const br = 0.75 + 0.25 * Math.cos(Math.PI * Math.min(qa, 2 - qa));
        $.qbars[i].style.transform = `scaleY(${prog(t, st, 0.4, ease.outExpo).toFixed(4)})`;
        $.qbars[i].style.opacity = (prog(t, 2.3, 0.3) > 0 ? br : 1).toFixed(3);
      });
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 98 내일 해 볼 세 가지 (drop · track, 종이 바탕)
  //   점검표 세 줄. 한 줄씩 그려지고 카메라가 그 줄을 따라 내려간다. 확인 칸은 비워 둔다(내일 할 일)
  //   빌드 1개(한 클릭 개편): 줄은 0.1·0.75·1.4초에 출발해 2.4초에 모두 자리. camTrack은 끝 화면 영역 하나(세 줄 전체)이고,
  //   cameraHook이 t에 따라 이전 빌드별 영역(첫 줄 → 둘째 줄 → 전체)을 차례로 지나 2.25초에 끝 영역으로 돌아온다.
  //   끝 화면에서 앞 줄을 흐리게 두지 않는다. 다 나온 뒤 빈 확인 칸이 위에서부터 차례로 맥동한다
  // ─────────────────────────────────────────────────────────────
  const TODO = [
    ['자주 하는 요청 하나를 일곱 칸 요청서로 다시 쓴다', '요청서.md'],
    ['시작하기 전에 완료 기준을 먼저 적는다', '요청서.md'],
    ['만드는 역할과 확인하는 역할을 나눈다', '팀.md'],
  ];
  const ROWY = [300, 520, 740];
  const TODO_ST = [0.1, 0.75, 1.4];
  // 이전 빌드별 카메라 영역 [cx, cy, 배율]. 마지막이 끝 화면(camTrack)
  const TODO_CAM = [[960, 483, 1.12], [960, 540, 1.12], [960, 570, 1.06]];
  DECK.slide({
    id: 'tomorrow', bg: 'paper', holds: [], dur: 2.8, notes: N.tomorrow,
    // 배율 z에서 cy는 540/z 이상, 1080−540/z 이하(그 밖이면 슬라이드 판 바깥이 화면 위·아래에 띠로 보인다)
    camTrack: [TODO_CAM[2]],
    // 줄이 나오는 데 맞춰 첫 줄 영역 → 둘째 줄 영역(0.75초 출발) → 끝 영역(1.4초 출발)으로 옮긴다. 반환값은 끝 영역(camTrack) 기준 차이
    cameraHook(t) {
      const P = 2000, E = TODO_CAM[2];
      const p1 = ease.inOutCubic(clamp((t - TODO_ST[1]) / 0.8)), p2 = ease.inOutCubic(clamp((t - TODO_ST[2]) / 0.85));
      const A = TODO_CAM[0], B = TODO_CAM[1];
      const cy = lerp(lerp(A[1], B[1], p1), E[1], p2);
      const z = Math.exp(lerp(lerp(Math.log(A[2]), Math.log(B[2]), p1), Math.log(E[2]), p2));
      return { dy: cy - E[1], dz: (P / z - P) - (P / E[2] - P) };
    },
    setup(el) {
      const $ = this.$; $.c = pal();
      // 창으로 든 햇빛의 창틀 그림자가 종이 위를 천천히 지나간다(kv_human 사진과 같은 아침 빛)
      $.shadow = h('div', 'a', el);
      css($.shadow, { left: '-900px', top: '-200px', width: '3720px', height: '1480px', opacity: 0,
        background: `repeating-linear-gradient(118deg, transparent 0px, transparent 300px, ${DECK.rgba('paperInk', 0.07)} 380px, ${DECK.rgba('paperInk', 0.07)} 470px, transparent 550px, transparent 620px)` });
      $.sv = svgFull(el);
      $.rows = TODO.map(([txt, file], i) => {
        const y = ROWY[i], cy = y + 33;
        const fillR = s('rect', { x: 276, y: cy - 24, width: 48, height: 48, rx: 6, fill: DECK.rgba('accent', 0.0) }, $.sv);
        const box = s('rect', { x: 272, y: cy - 28, width: 56, height: 56, rx: 9, fill: 'none', stroke: DECK.rgba('paperInk', 0.85), 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, $.sv);
        const circ = h('div', 'a nw', el, String(i + 1));
        css(circ, { left: '352px', top: cy - 28 + 'px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent)', textAlign: 'center',
          font: '400 34px/56px var(--num)', color: 'var(--paperInk)', opacity: 0 });
        const m = mline(el, txt, { x: 440, y: y, font: '500 50px/1.3 var(--serif)', color: 'var(--paperInk)' });
        const rule = h('div', 'a', el);
        css(rule, { left: '440px', top: y + 92 + 'px', width: '1240px', height: '2px', background: 'var(--paperLine)', transformOrigin: '0 50%', transform: 'scaleX(0)' });
        const pill = h('div', 'a nw', el);
        css(pill, { top: y + 93 - 22 + 'px', height: '44px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px 0 12px', borderRadius: '999px',
          border: '2px solid color-mix(in srgb, var(--paperInk) 30%, transparent)', background: 'var(--paper)', color: 'var(--paperInk2)', opacity: 0 });
        U.icon(pill, 'doc', 26, 'currentColor', 1.9);
        const nm = h('span', '', pill, file);
        css(nm, { font: '500 28px/1 var(--mono)' });
        pill.style.left = 1680 - pill.offsetWidth + 'px';
        return { fillR, box, circ, m, rule, pill };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      const ST = TODO_ST;
      show($.shadow, Math.max(smooth(0.2, 0.9, x.arrive), prog(t, 0, 0.6)));
      $.shadow.style.transform = `translateX(${((a * 22) % (620 / Math.sin(118 * Math.PI / 180))).toFixed(1)}px)`;   // 무늬 한 주기(가로 거리)마다 되감아 이음매가 보이지 않게
      const early = smooth(0.0, 0.5, x.arrive);
      $.rows.forEach((r, i) => {
        const st = ST[i];
        U.draw(r.box, Math.max(early, prog(t, st, 0.45, ease.inOutCubic)));
        r.box.style.opacity = lerp(0.3 * early, 1, prog(t, st, 0.3, ease.linear)).toFixed(3);
        const cp = prog(t, st + 0.1, 0.45, ease.pop);
        show(r.circ, prog(t, st + 0.1, 0.15, ease.linear));
        r.circ.style.transform = `scale(${lerp(0.3, 1, cp).toFixed(4)})`;
        mrise(r.m, t, st + 0.15, 0.6);
        r.rule.style.transform = `scaleX(${prog(t, st + 0.3, 0.7, ease.outExpo).toFixed(4)})`;
        const pp = prog(t, st + 0.5, 0.45);
        show(r.pill, pp);
        r.pill.style.transform = `translateX(${((1 - pp) * 40).toFixed(1)}px)`;
        // 빈 확인 칸: 줄이 그려지면 한 번 차오르고, 세 줄이 다 나오면 위에서부터 차례로 맥동한다(줄은 흐리게 하지 않는다)
        const once = Math.sin(Math.PI * prog(t, st + 0.45, 0.6, ease.linear));
        const live = prog(t, ST[2] + 0.8, 0.5);
        const pul = Math.max(0, Math.sin(a * 1.6 - i * 0.9));
        r.fillR.setAttribute('fill', rgb(c.acc, Math.max(0.45 * once, (0.12 + 0.5 * pul) * live)));
      });
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 99 세 문장 다시 (rise · none)
  //   오프닝 10번과 같은 배치(serif 54px 세 줄, 왼쪽 확인 칸). 줄마다 확인 표시가 찍히고 핵심 낱말에 밑줄, 문장 오른쪽 끝 아래에 근거 숫자
  //   빌드 1개(한 클릭 개편): 세 줄이 0.1·0.75·1.4초에 차례로 밝아지며 2.35초에 모두 자리. 끝 화면에서 세 문장을 모두 같은 밝기로 둔다
  //   (이전에는 다음 줄이 나오면 앞 줄을 조금 흐렸다). 다 나온 뒤에는 확인 칸 고리와 줄 위 빛이 위에서부터 한 줄씩 돌아간다
  //   근거 숫자 셋은 모두 외부 결과다. 숫자 앞에 출처 이름(o)을 mut 색 sans 30px로 붙여 세 줄의 형식을 맞춘다
  // ─────────────────────────────────────────────────────────────
  const THREE = [
    { s: '같은 AI도 일하는 환경을 정리하면 결과가 달라진다', w: '환경', o: 'LangChain', f: '52.8 → 66.5' },
    { s: '환경은 파일로 적는다: 요청서, 역할, 방법, 순서, 검증', w: '파일', o: 'Vercel', f: '53% → 100%' },
    { s: '나뉘는 일은 에이전트 팀에 맡기고, 기준과 책임은 사람이 정한다', w: '사람', o: 'Anthropic', f: '평가 90.2% 높음 · 토큰 약 15배' },
  ];
  const TY3 = [290, 470, 650];
  const figHtml = r => `<span style="font:500 30px/1 var(--sans);color:var(--mut);margin-right:16px">${r.o}</span>${r.f}`;
  DECK.slide({
    id: 'three-again', holds: [], dur: 2.7, notes: N['three-again'],
    chrome: { source: { text: '출처: LangChain 블로그(2026-02-17) · Vercel 블로그(2026-01-27) · Anthropic(2025-06-13)', step: 0 } },
    setup(el) {
      const $ = this.$; $.c = pal();
      $.sv = svgFull(el);
      $.rows = THREE.map((r, i) => {
        const y = TY3[i], cy = y + 36;
        const box = s('rect', { x: 172, y: cy - 26, width: 52, height: 52, rx: 8, fill: 'none', stroke: DECK.rgba('ink', 0.55), 'stroke-width': 3 }, $.sv);
        const g = s('g', { transform: `translate(${172 - 2} ${cy - 28}) scale(${56 / 24})` }, $.sv);
        const ck = s('path', { d: U.ICON.check, fill: 'none', stroke: DECK.rgba('ok', 1), 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, g);
        const halo = s('circle', { cx: 198, cy, r: 30, fill: 'none', stroke: DECK.rgba('ok', 1), 'stroke-width': 2.5, opacity: 0 }, $.sv);
        const lane = h('div', 'a', el);
        css(lane, { left: '150px', top: y - 6 + 'px', width: '1650px', height: '88px', overflow: 'hidden', borderRadius: '44px' });
        const sheen = h('div', 'a', lane);
        css(sheen, { left: '-420px', top: '0px', width: '420px', height: '88px', opacity: 0,
          background: `radial-gradient(closest-side, ${DECK.rgba('accent', 0.16)}, ${DECK.rgba('accent', 0)})` });
        const txt = h('div', 'a nw', el, r.s);
        css(txt, { left: '258px', top: y - 5 + 'px', font: '500 54px/1.5 var(--serif)', color: 'var(--mut)', visibility: 'hidden', opacity: 0 });
        const mk = U.mark(txt, { word: r.w });
        // 근거 숫자는 문장 오른쪽 끝 바로 아래에 오른쪽을 맞춘다. 같은 줄 오른쪽에 두면 셋째 줄 「평가 90.2% 높음 · 토큰 약 15배」가 안전 영역 x 1800을 넘는다
        const fig = tline(el, figHtml(r), { top: y + 80 + 'px', font: '500 34px/1.3 var(--mono)', color: 'var(--accent2)' });
        fig.style.left = 258 + txt.offsetWidth - fig.offsetWidth + 'px';
        return { box, ck, halo, txt, mk, fig, cy, sheen };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      const early = smooth(0.15, 0.75, x.arrive);
      const ST = [0.1, 0.75, 1.4];
      const live = prog(t, ST[2] + 0.9, 0.4);              // 세 줄이 다 나온 뒤의 머묾 움직임
      const cur = Math.floor(a * 0.3) % 3, v = (a * 0.3) % 1;
      $.rows.forEach((r, i) => {
        const st = ST[i];
        // 문장은 도착하는 동안 흐린 색으로 먼저 보이고, 자기 차례에 밝아진다(뒤 줄이 나와도 다시 흐려지지 않는다)
        const pre = Math.max(early, prog(t, 0, 0.4));
        show(r.txt, pre);
        r.txt.style.transform = `translateY(${((1 - pre) * 16).toFixed(1)}px)`;
        r.box.setAttribute('opacity', pre.toFixed(3));
        const on = prog(t, st, 0.45);
        r.txt.style.color = rgb(mix(c.mut, c.ink, on));
        const cp = prog(t, st + 0.05, 0.4, ease.outCubic);
        r.ck.setAttribute('stroke-dashoffset', (1 - cp).toFixed(4));
        r.box.setAttribute('stroke', rgb(mix(c.ink, c.ok, on), 0.55 + 0.35 * on));
        r.mk.render(t, st + 0.3, 0.5);
        const fp = prog(t, st + 0.45, 0.5);
        show(r.fig, fp);
        r.fig.style.transform = `translateY(${((1 - fp) * -18).toFixed(1)}px)`;
        // 확인 표시가 찍히면 고리가 한 번 퍼진다. 세 줄이 다 나온 뒤에는 한 줄씩 차례로(3.3초씩) 고리와 줄 위 빛이 지나간다
        const q = prog(t, st + 0.3, 0.7, ease.linear);
        let hr = 30 + 26 * q, ho = q > 0 && q < 1 ? 0.7 * (1 - q) : 0;
        const turn = i === cur ? live : 0;
        if (turn > 0) { const u = (a * 0.6) % 1; hr = 30 + 26 * u; ho = Math.max(ho, turn * 0.7 * (1 - u)); }
        r.halo.setAttribute('r', hr.toFixed(1));
        r.halo.setAttribute('opacity', ho.toFixed(3));
        r.sheen.style.transform = `translateX(${lerp(0, 2070, v).toFixed(1)}px)`;
        r.sheen.style.opacity = (turn * Math.sin(Math.PI * v)).toFixed(3);
      });
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 100 파일 일곱 개를 모두 열었다 (스토리보드 pull-out → 평면 밀기 · drift)
  //   목차와 같은 트리(mono 44px). 일곱 줄 모두에 밑줄과 확인 표시가 위에서부터 0.15초 간격으로 찍힌다.
  //   다 찍히면 일곱 줄 끝에서 나온 선이 오른쪽 세로선 하나로 모이고, 그 가운데에서 뻗은 선 끝에 제목이 솟는다(일곱 → 하나).
  //   덱 전체로 물러나는 pull-out이 평면 밀기로 바뀌어, 이 화면 하나로 장면이 끝나도록 모이는 선과 큰 제목을 더했다
  // ─────────────────────────────────────────────────────────────
  DECK.slide({
    id: 'tree-done', holds: [], dur: 2.6, notes: N['tree-done'],
    setup(el) {
      const $ = this.$; $.c = pal();
      $.glow = h('div', 'a', el);
      css($.glow, { left: '200px', top: '0px', width: '760px', height: '180px', borderRadius: '50%', opacity: 0,
        background: `radial-gradient(closest-side, ${DECK.rgba('accent', 0.16)}, ${DECK.rgba('accent', 0)})` });
      $.tree = U.fileTree(el, { preset: 'full', done: 7, checkFrom: 1, marks: [1, 2, 3, 4, 5, 6, 7], markAt: 0.25, checkAt: 0.25, markEach: 0.15, checkEach: 0.15 });
      const T = $.tree, X0 = 240, Y0 = 240, nx = Math.round(T.size * 2.5);
      // 모이는 선: 줄 끝(이름 + 밑줄 끝 + 22px) → 세로선 BX, 세로선 가운데(4번째 줄 높이)에서 제목 쪽으로
      const BX = 650, rowY = k => Y0 + k * T.R + T.R / 2;
      $.mid = rowY(4);
      $.sv = svgFull(el);
      $.feeds = T.rows.map(r => s('path', { d: `M${X0 + nx + r.nameEl.offsetWidth + 22} ${rowY(r.k)} H ${BX}`, fill: 'none', stroke: DECK.rgba('ink', 0.32), 'stroke-width': 2.5, 'stroke-linecap': 'round' }, $.sv));
      $.spine = s('path', { d: `M${BX} ${rowY(1)} V ${rowY(7)}`, fill: 'none', stroke: DECK.rgba('ink', 0.32), 'stroke-width': 2.5, 'stroke-linecap': 'round' }, $.sv);
      $.stem = s('path', { d: `M${BX} ${$.mid} H ${BX + 64}`, fill: 'none', stroke: DECK.rgba('accent', 0.95), 'stroke-width': 3.5, 'stroke-linecap': 'round' }, $.sv);
      $.node = s('circle', { cx: BX, cy: $.mid, r: 0, fill: DECK.rgba('accent', 1) }, $.sv);
      // 제목: display 88px 한 줄, 세로 가운데를 모이는 선 높이에 맞춘다(오른쪽 끝 약 x 1610)
      $.h = mline(el, '파일 일곱 개를 모두 열었다', { x: BX + 88, y: Math.round($.mid - 88 * 1.15 / 2), font: 'var(--displayW) 88px/1.15 var(--display)', ls: '-.03em' });
    },
    render(t, x) {
      const $ = this.$, a = x.a, T = $.tree;
      T.render(t);
      // 확인 표시가 다 찍힐 무렵(1.15~1.5초) 줄 끝에서 선이 나와 모인다
      $.feeds.forEach((f, i) => U.draw(f, prog(t, 1.2 + i * 0.035, 0.3, ease.inOutCubic)));
      U.draw($.spine, prog(t, 1.38, 0.32, ease.inOutCubic));
      U.draw($.stem, prog(t, 1.62, 0.25, ease.inOutCubic));
      const np = prog(t, 1.6, 0.35, ease.pop);
      $.node.setAttribute('r', (7 * np * (1 + 0.3 * (0.5 + 0.5 * Math.sin(a * 2.4)) * prog(t, 2.2, 0.4))).toFixed(2));
      mrise($.h, t, 1.72, 0.7);
      // 머무는 동안 옅은 빛이 트리를 위에서 아래로 훑고, 지나가는 줄의 확인 표시가 살짝 커진다
      const live = prog(t, 1.9, 0.6);
      const u = (a * 0.22) % 1, yy = 240 + lerp(-0.5, 8.5, u) * T.R;
      $.glow.style.transform = `translateY(${(yy - 90).toFixed(1)}px)`;
      $.glow.style.opacity = (live * Math.sin(Math.PI * u)).toFixed(3);
      T.rows.forEach(r => {
        const ry = 240 + (r.k + 0.5) * T.R, d = Math.exp(-((yy - ry) ** 2) / (T.R * T.R * 0.5));
        if (live > 0) r.check.style.transform = `scale(${(1 + 0.16 * d * live).toFixed(4)})`;
      });
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 101 마무리 (push · drift)
  // ─────────────────────────────────────────────────────────────
  DECK.slide({
    id: 'final', holds: [1.6], dur: 2.9, notes: N.final,
    setup(el) {
      const $ = this.$;
      $.back = h('div', 'full', el);
      $.ph = h('div', 'full', $.back);
      // 노트 색인 탭 오른쪽 끝을 x 약 280에 둔다(마무리 문장 왼쪽 끝 x 약 434와 150px 넘게 떨어지게)
      U.image($.ph, 'assets/img/kv_title.png', { x: -410, y: -34, w: 2040, h: 1148, radius: 0 });
      // 사진 오른쪽 끝(x 1630, 머묾 확대로 약 1730)이 세로 이음매로 보이지 않게 그 앞에서 사라지게 한다
      const fadeR = 'linear-gradient(90deg, #000 0px, #000 1260px, transparent 1580px)';
      css($.ph, { opacity: 0.3, transformOrigin: '160px 420px', maskImage: fadeR, webkitMaskImage: fadeR });
      $.shade = h('div', 'full', el);
      css($.shade, { background: `radial-gradient(ellipse 52% 40% at 50% 46%, ${DECK.rgba('bg0', 0.72)} 0%, ${DECK.rgba('bg0', 0.25)} 70%, ${DECK.rgba('bg0', 0)} 100%)` });
      const F = 'var(--displayW) 92px/1.15 var(--display)';
      $.l1 = mline(el, 'AI를 쓰는 데서 그치지 않고,', { y: 326, font: F, ls: '-.03em' });
      $.l2 = mline(el, 'AI 에이전트 팀을 설계합니다.', { y: 446, font: F, ls: '-.03em' });
      $.mk = U.mark($.l2.inner, { word: '설계합니다' });
      [$.l1, $.l2].forEach(m => { m.box.style.left = Math.round(960 - m.inner.offsetWidth / 2) + 'px'; });
      $.bye = tline(el, '감사합니다 · 황민호', Object.assign({ top: '660px', font: '600 44px/1.3 var(--sans)', color: 'var(--ink)' }, CENTER));
      $.line = h('div', 'a', el);
      css($.line, { left: '900px', top: '628px', width: '120px', height: '4px', background: 'var(--accent)', transform: 'scaleX(0)' });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.back.style.transform = U.depth(x, -0.5);
      $.ph.style.transform = `scale(${(1.03 + 0.035 * (0.5 - 0.5 * Math.cos(a * 0.07))).toFixed(5)}) translate(${(8 * Math.sin(a * 0.05)).toFixed(2)}px, 0px)`;
      show($.ph, Math.max(0.6 * smooth(0, 0.6, x.arrive), prog(t, 0, 0.6)) * 0.3);
      mrise($.l1, t, 0.12);
      mrise($.l2, t, 0.3);
      $.mk.render(t, 0.95, 0.6);
      $.line.style.transform = `scaleX(${prog(t, 1.65, 0.6, ease.outExpo).toFixed(4)})`;
      up($.bye, t, 1.75);
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 102 질문과 답변 (스토리보드 cut → 평면 밀기 · drift, 600초 대기)
  //   평면 밀기로 들어오는 동안(t가 -lead에 머묾) 트리·햇빛 띠·궤도 링과 함께 제목 윤곽선과 QR 자리 점선 테가 x.arrive로 먼저 보인다
  //   왼쪽 위 제목, 왼쪽 아래 확인 표시가 모두 붙은 트리, 오른쪽 QR 두 개. 바탕이 x.a로 계속 움직인다:
  //   햇빛 띠가 천천히 지나가고, 트리 선을 따라 빛 점이 내려가며, QR 바깥 점선 테가 돈다
  // ─────────────────────────────────────────────────────────────
  DECK.slide({
    id: 'qa', holds: [], dur: 2.0, notes: N.qa,
    camera: { enter: 'push' },   // 공통 규칙 5: 영상 경계가 아니므로 평면 밀기(엔진이 push를 flat-push로 바꾼다. inner drift는 스토리보드 값)
    setup(el) {
      const $ = this.$; $.c = pal();
      $.back = h('div', 'full', el);
      $.sun = h('div', 'a', $.back);
      css($.sun, { left: '-600px', top: '0px', width: '3120px', height: '1080px',
        background: `linear-gradient(112deg, transparent 38%, ${DECK.rgba('accent', 0.05)} 46%, ${DECK.rgba('accent', 0.09)} 50%, ${DECK.rgba('accent', 0.05)} 54%, transparent 62%)` });
      $.orbit = svgFull($.back);
      $.ring1 = s('circle', { cx: 1410, cy: 430, r: 360, fill: 'none', stroke: DECK.rgba('ink', 0.08), 'stroke-width': 2, 'stroke-dasharray': '3 16' }, $.orbit);
      $.ring2 = s('circle', { cx: 1410, cy: 430, r: 300, fill: 'none', stroke: DECK.rgba('accent', 0.14), 'stroke-width': 2, 'stroke-dasharray': '60 40' }, $.orbit);
      $.sat = s('circle', { cx: 1410, cy: 70, r: 7, fill: DECK.rgba('accent2', 0.9) }, $.orbit);
      // 600초 동안 drift(±14px)가 양 끝을 오가므로 제목·트리는 x 192·194에 둔다(14px을 빼도 x 178 이상)
      const TX = 194;
      // 제목 윤곽선: 평면 밀기로 들어오는 동안 먼저 보이고, 채운 글자가 솟으면 사라진다(92번과 같은 방식)
      $.ghost = tline(el, '질문과 답변', { left: '192px', top: '236px', font: 'var(--displayW) 110px/1.12 var(--display)', letterSpacing: '-.035em',
        color: 'transparent', webkitTextStroke: `2px ${DECK.rgba('ink', 0.4)}` });
      $.title = U.rise(el, '질문과 답변', { left: '192px', top: '236px', font: 'var(--displayW) 110px/1.12 var(--display)', letterSpacing: '-.035em', color: 'var(--ink)', whiteSpace: 'nowrap' });
      $.tree = U.fileTree(el, { preset: 'corner', x: TX, y: 520, size: 28, done: 7 });
      const T = $.tree, sz = T.size, R = T.R, lw = Math.max(2, Math.round(sz / 16));
      $.tsv = svgFull(el);
      // 트리 선을 따라 내려가는 빛 점의 경로(세로 선 → 각 가지)
      $.tx = TX + Math.round(sz * 0.35); $.ty0 = 520 + Math.round(R * 0.8); $.ty1 = 520 + 7 * R + R / 2; $.bx = TX + Math.round(sz * 1.15);
      $.spark = s('circle', { cx: $.tx, cy: $.ty0, r: 5, fill: DECK.rgba('accent', 1), opacity: 0 }, $.tsv);
      $.R = R; $.lw = lw;
      const Q = 220;
      $.q1 = qrCard(el, 'assets/qr_book.svg', 1150, 300, Q);
      $.q2 = qrCard(el, 'assets/qr_harness.svg', 1490 - 26, 300, Q);
      $.i1 = h('div', 'a', el); css($.i1, { left: 1150 + $.q1.w / 2 - 22 + 'px', top: '236px', opacity: 0 }); U.icon($.i1, 'book', 44, 'var(--accent)', 1.8);
      $.i2 = h('div', 'a', el); css($.i2, { left: 1464 + $.q2.w / 2 - 22 + 'px', top: '236px', opacity: 0 }); U.icon($.i2, 'code', 44, 'var(--accent2)', 1.8);
      $.a1 = ants($.orbit, 1150 - 14, 286, $.q1.w + 28, $.q1.w + 28, DECK.rgba('accent', 0.6));
      $.a2 = ants($.orbit, 1464 - 14, 286, $.q2.w + 28, $.q2.w + 28, DECK.rgba('accent2', 0.65));
      // QR마다 바로 아래 라벨(가운데 맞춤). 주소 줄은 그 아래로 내리고 왼쪽에 저장소 색 code 아이콘을 붙인다
      const LF = '600 30px/1.3 var(--sans)';
      $.l1 = tline(el, '책', { top: '572px', font: LF, color: 'var(--accent)' });
      $.l1.style.left = 1150 + $.q1.w / 2 - $.l1.offsetWidth / 2 + 'px';
      $.l2 = tline(el, '저장소', { top: '572px', font: LF, color: 'var(--accent2)' });
      $.l2.style.left = 1464 + $.q2.w / 2 - $.l2.offsetWidth / 2 + 'px';
      $.addr = tline(el, '', { top: '632px', display: 'flex', alignItems: 'center', gap: '12px' });
      U.icon($.addr, 'code', 32, 'var(--accent2)', 2);
      const at = h('span', '', $.addr, 'github.com/revfactory/harness');
      css(at, { font: '500 32px/1.3 var(--mono)', color: 'var(--ink)' });
      $.addr.style.left = 1464 + $.q2.w - $.addr.offsetWidth + 'px';
    },
    render(t, x) {
      const $ = this.$, a = x.a, c = $.c;
      $.back.style.transform = U.depth(x, -0.4);
      $.sun.style.transform = `translateX(${lerp(-1400, 1400, (a * 0.03 + 0.55) % 1).toFixed(1)}px)`;
      $.ring1.style.transformOrigin = '1410px 430px'; $.ring2.style.transformOrigin = '1410px 430px';
      $.ring1.style.transform = `rotate(${(a * 3).toFixed(2)}deg)`;
      $.ring2.style.transform = `rotate(${(-a * 5).toFixed(2)}deg)`;
      const ang = a * 0.21 - Math.PI / 2;
      $.sat.setAttribute('cx', (1410 + 360 * Math.cos(ang)).toFixed(1)); $.sat.setAttribute('cy', (430 + 360 * Math.sin(ang)).toFixed(1));
      const early = smooth(0.0, 0.5, x.arrive);
      show($.ghost, early * (1 - prog(t, 0.1, 0.5, ease.linear)));
      $.title.render(t, 0.05, { each: 0.05 });
      $.tree.render(t);
      // 빛 점: 세로 선을 내려가다 한 줄씩 가지로 들른다(7초 주기)
      const P = 7, u = (a % P) / P, k = Math.min(6, Math.floor(u * 7)), f = u * 7 - k;
      const ry = 520 + (k + 1) * $.R + $.R / 2;
      let sx = $.tx, sy = lerp(k === 0 ? $.ty0 : 520 + k * $.R + $.R / 2, ry, clamp(f / 0.45));
      if (f > 0.45) { const g2 = clamp((f - 0.45) / 0.4); sx = lerp($.tx, $.bx, Math.sin(Math.PI * g2)); sy = ry; }
      $.spark.setAttribute('cx', sx.toFixed(1)); $.spark.setAttribute('cy', sy.toFixed(1));
      $.spark.setAttribute('opacity', (prog(t, 0.6, 0.4) * 0.9).toFixed(3));
      const qp = (q, st) => { const p = prog(t, st, 0.55, ease.snap); show(q.card, prog(t, st, 0.15, ease.linear)); q.card.style.transform = `translateY(${((1 - p) * 40).toFixed(1)}px)`; };
      qp($.q1, 0.25); qp($.q2, 0.37);
      up($.i1, t, 0.3, 0.5, 16); up($.i2, t, 0.42, 0.5, 16);
      up($.l1, t, 0.5, 0.5, 16); up($.l2, t, 0.6, 0.5, 16);
      up($.addr, t, 0.7);
      [$.a1, $.a2].forEach((r, i) => {
        r.setAttribute('opacity', Math.max(0.45 * early, prog(t, 0.9, 0.5)).toFixed(3));
        r.setAttribute('stroke-dashoffset', (-(a * 12 + i * 13) % 26).toFixed(2));
      });
    },
  });
})();

/* ─── 부록 103~107: 더 보기(질문 시간에 보여 준다. 2026-11-17 발표자 지시) ───
 * 103 more-cases 목록 → 104·105 UX 개선 영상 → 106·107 3D 처리 영상. 모두 로컬 파일이라 인터넷 없이 재생된다.
 * UX 영상은 발표자 Movies 폴더의 원본(공개 유튜브 영상과 같은 파일), 3D 영상은 각 사이트를 녹화한 것.
 * 경로 줄은 끈다(비밀노트 파일 일곱 개 밖의 부록). 출처 줄 없음: 발표자 본인 자료다.
 */
(function () {
  const { prog, css, h, show } = DECK;
  const box = (parent, html, st, cls = 'a nw') => { const d = h('div', cls, parent, html); css(d, st || {}); return d; };
  function fadeUp(el, t, start, dur = 0.5, dy = 24) { const p = prog(t, start, dur); show(el, p); el.style.transform = `translateY(${((1 - p) * dy).toFixed(1)}px)`; return p; }
  const CASES = [
    ['UX 개선', '지하철 전광판 UX 개선', 'youtu.be/lzsA2_9lUeE', 'assets/projects/ux_subway.jpg', 30],
    ['UX 개선', '키오스크 UX 개선', 'youtu.be/2ig06B9xw9Q', 'assets/projects/ux_kiosk.jpg', 30],
    ['3D 처리', '사계절 한옥 섬', 'xr-studio-harness.netlify.app', 'assets/projects/hanok.jpg', 32],
    ['3D 처리', '오방색 조각보 돔', 'ax-studio-demo.netlify.app', 'assets/projects/obang.jpg', 30],
  ];

  // ─── 103 더 보기: 사례 네 가지(push · none) ───
  DECK.slide({
    id: 'more-cases', holds: [], dur: 1.8, chrome: { path: false },
    notes: '(부록. 질문 시간에 필요하면 보여 준다.) 시간이 남으면 사례 몇 가지를 더 보겠습니다. 화면 두 가지는 UX 개선입니다. 지하철 전광판과 키오스크 화면을 하네스로 다시 설계했습니다. 나머지 두 가지는 3D입니다. 웹 브라우저에서 바로 돌아가는 3D 장면을 에이전트 팀이 만들었고, 그 화면을 녹화해 왔습니다.',
    setup(el) {
      const $ = this.$;
      $.title = box(el, '더 보기 · 사례 네 가지', { left: '200px', top: '186px', font: 'var(--displayW) 64px/1.2 var(--display)', letterSpacing: '-.025em', color: 'var(--ink)', opacity: 0 });
      const W = 760, IW = 260, IH = 156, GX = 0, X0 = 200, Y0 = 330, ROW = 260, TX = IW + 24;
      $.cards = CASES.map(([grp, name, url, img, sec], i) => {
        const col = i % 2, row = Math.floor(i / 2), x = X0 + col * (W + GX), y = Y0 + row * ROW;
        const host = box(el, '', { left: x + 'px', top: y + 'px', width: W + 'px', height: IH + 'px', opacity: 0 }, 'a');
        const im = U.image(host, img, { x: 0, y: 0, w: IW, h: IH, radius: 12 });
        css(im.el, { border: '1.5px solid var(--line)' });
        box(host, grp, { left: TX + 'px', top: '-4px', font: '700 28px/1.3 var(--sans)', color: grp === 'UX 개선' ? 'var(--accent2)' : 'var(--accent)' });
        box(host, name, { left: TX + 'px', top: '34px', font: '700 38px/1.25 var(--sans)', color: 'var(--ink)' });
        box(host, url, { left: TX + 'px', top: '86px', font: '500 28px/1.3 var(--mono)', letterSpacing: '-.03em', color: 'var(--ink2)' });
        box(host, `▶ 영상 ${sec}초`, { left: TX + 'px', top: '124px', font: '600 28px/1.3 var(--sans)', color: 'var(--mut)' });
        return { host, im, i };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      fadeUp($.title, t, 0, 0.5, 20);
      $.cards.forEach(c => {
        fadeUp(c.host, t, 0.2 + c.i * 0.12, 0.5, 30);
        if (!c.im.missing) c.im.img.style.transform = `scale(${(1.03 + 0.03 * Math.sin(a * 0.4 + c.i)).toFixed(4)})`;
      });
    },
  });

  // ─── 104·105 UX 개선 영상 ───
  DECK.videoSlide({ id: 'v-ux-subway', video: 'v10_ux_subway', notes: '(부록 영상 30초. 지하철 전광판 UX 개선. 공개 영상 youtu.be/lzsA2_9lUeE와 같은 파일이다.)' });
  DECK.videoSlide({ id: 'v-ux-kiosk', video: 'v11_ux_kiosk', notes: '(부록 영상 30초. 키오스크 UX 개선. 공개 영상 youtu.be/2ig06B9xw9Q와 같은 파일이다.)' });

  // ─── 106·107 3D 처리 영상 ───
  // 한옥 섬: 원래 사이트의 자동 투어 녹화본(32초). 조각보 돔: 사이트 캡처 모드(?capture=1)로 투어 2.5~14.5초(입장), 71.5~81.5초(에이전트 패널), 90~98초(위에서 본 돔)를 찍어 이은 30초
  DECK.videoSlide({ id: 'v-3d-hanok', video: 'v12_3d_hanok', notes: '(부록 영상 32초, 소리 없음. 사계절 한옥 섬 자동 투어. 봄 낮에서 해 질 녘과 밤, 가을, 겨울 눈 내리는 밤까지 바뀐다.) 브라우저에서 바로 돌아가는 3D 장면입니다. 계절과 시간대를 바꾸는 장면을 에이전트 팀이 만들었습니다. 주소는 xr-studio-harness.netlify.app입니다.' });
  DECK.videoSlide({ id: 'v-3d-obang', video: 'v13_3d_obang', notes: '(부록 영상 30초, 소리 없음. 오방색 조각보 돔 안으로 들어가는 장면, 이 작품을 만든 에이전트 9개와 스킬 6개를 보여 주는 패널, 위에서 본 돔.) 돔 안을 걷는 WebXR 체험입니다. 화면에 나온 것처럼 에이전트 9개가 조사부터 연출까지 나눠 만들었습니다. 주소는 ax-studio-demo.netlify.app입니다.' });
})();
