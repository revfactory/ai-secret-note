/* c00 오프닝: 비밀노트는 파일 일곱 개 (슬라이드 1~12)
 * 1 대기 화면 → 2 인트로 영상 → 3 제목(영상 마지막 프레임에서 cut) → 4 연사 → 5 질문 → 6 프로젝트 306개
 * → 7 개발·리서치에서 업무 실무로 → 8 지금은 업무 실무에 → 9 모델이 아니라 환경 → 10 에이전트 = 모델 + 하네스 → 11 세 문장 → 12 목차 트리
 * 경로 줄·출처 줄은 엔진 공통 크롬(chrome)이 그린다. 파일 트리·형광 밑줄은 U.fileTree·U.mark.
 * drift·dolly-in·parallax 슬라이드의 글자는 화면 가장자리에서 175px 이상 안쪽에 둔다.
 */
(function () {
  const { ease, prog, clamp, lerp, rand, noise, css, h, s, show, split } = DECK;
  const TAU = Math.PI * 2;

  // ── 장 전용 도우미 ──
  const box = (parent, html, st, cls = 'a nw') => { const d = h('div', cls, parent, html); css(d, st || {}); return d; };
  function fadeUp(el, t, start, dur = 0.55, dy = 28) {
    const p = prog(t, start, dur);
    show(el, p);
    el.style.transform = `translateY(${((1 - p) * dy).toFixed(1)}px)`;
    return p;
  }
  // 한 줄이 마스크 안에서 통째로 솟는다. 글자를 낱자로 쪼개지 않으므로 U.mark의 글자 겹침 처리(under)가 그대로 된다
  function lineRise(parent, html, st) {
    const st2 = Object.assign({}, st); delete st2.center;
    const wrap = box(parent, '', Object.assign(st2, { overflow: 'hidden', padding: '.12em .16em .26em', margin: '-.12em -.16em -.26em' }));
    const inner = h('div', '', wrap, html);
    css(inner, { display: 'block', whiteSpace: 'nowrap' });
    if (st.center != null) wrap.style.left = Math.round(st.center - inner.offsetWidth / 2) + 'px';   // 글자 폭만큼의 상자를 가운데에
    return {
      wrap, inner,
      render(t, start, dur = 0.6, e = ease.snap) {
        const p = prog(t, start, dur, e);
        inner.style.transform = `translateY(${((1 - p) * 125).toFixed(1)}%)`;
        show(wrap, p > 0 ? 1 : 0);
        return p;
      },
    };
  }
  // 화면 가득한 사진 층(가장자리에 bg0 색 안쪽 그림자를 깔아, drift·시차로 판 가장자리가 드러나도 경계선이 보이지 않게 한다)
  function photoLayer(parent, src, o = {}) {
    const layer = box(parent, '', {}, 'full');
    const im = U.image(layer, src, { x: 0, y: 0, w: 1920, h: 1080, radius: 0, label: o.label });
    css(im.el, { background: 'transparent' });
    if (!im.missing) css(im.img, { transform: o.flip ? 'scaleX(-1)' : '', opacity: String(o.opacity ?? 1) });
    const edge = box(layer, '', { boxShadow: o.edge || 'inset 0 0 120px 36px var(--bg0)' }, 'full');
    return { layer, im, edge };
  }
  // 천천히 지나가는 부드러운 빛(멈춘 동안에도 화면 변화가 0.2% 밑으로 내려가지 않게 한다)
  function softLight(parent, o = {}) {
    const d = box(parent, '', {
      left: '-400px', top: '-200px', width: '1400px', height: '1500px',
      background: `radial-gradient(ellipse 50% 45% at 50% 50%, ${o.color || 'rgba(255,236,190,.10)'} 0%, rgba(255,236,190,0) 70%)`,
      mixBlendMode: 'screen', pointerEvents: 'none',
    }, 'a');
    return {
      el: d,
      render(a, ph = 0) {
        const xx = 620 + 560 * Math.sin(a * 0.07 + ph), yy = -40 + 60 * Math.sin(a * 0.05 + ph * 2);
        d.style.transform = `translate(${xx.toFixed(1)}px, ${yy.toFixed(1)}px)`;
      },
    };
  }

  // ─────────────── 1. 대기 화면 (cut · drift) ───────────────
  // 커서는 인트로 영상 첫 프레임(assets/video/v01_intro.mp4 0.05초)에서 잰 커서와 같다: x 421~447, y 720~800(26×80px)
  // 영상 입력 줄은 Pretendard 500 72px, 커서는 글자 끝에서 4px 뒤
  const CUR = { x: 421, y: 760, w: 26, h: 80 };
  // 엔진 drift 식(머묾 오프셋). 이 슬라이드는 카메라 drift를 cameraHook으로 지우고, 입력 줄을 뺀 층에만 같은 drift를 직접 건다.
  // 그래서 입력 줄 커서는 drift 중에도, 영상으로 넘어가는 동안에도 화면 x 421에 그대로 있다
  const driftOf = (sl, a) => {
    const ph = rand(sl.index + 1, 3) * 6.2832;
    return { dx: 14 * Math.sin(a * 0.23 + ph), dy: 9 * Math.sin(a * 0.17 + ph * 1.7), rz: 0.25 * Math.sin(a * 0.11 + ph * 0.6) };
  };
  DECK.slide({
    id: 'standby', bg: 'plain', holds: [], dur: 2.2,
    chrome: { num: false },   // 대기 화면에는 쪽 번호를 두지 않는다
    notes: '(발표 전 대기 화면. 다음 키로 인트로 영상을 시작한다.)',
    cameraHook(t, o) {
      const d = driftOf(this, o.a);
      return { dx: -d.dx, dy: -d.dy, rz: -d.rz };
    },
    setup(el) {
      const $ = this.$;
      $.mov = box(el, '', {}, 'full');   // drift를 받는 층(사진·빛·글자)
      $.ph = photoLayer($.mov, 'assets/img/bg_standby.png', { flip: true });   // 공책을 오른쪽 위로(글자 자리를 비움)
      $.scrim = box($.mov, '', { background: 'linear-gradient(100deg, rgba(14,16,19,.55) 0%, rgba(14,16,19,.25) 55%, rgba(14,16,19,0) 75%)' }, 'full');
      $.light = softLight($.mov);
      $.title = box($.mov, 'AI 시대를 위한<br>수석 엔지니어의 비밀노트', { left: '416px', top: '446px', font: 'var(--displayW) 84px/1.14 var(--display)', letterSpacing: '-.03em', color: 'var(--ink)', opacity: 0 });
      $.time = box($.mov, '하네스 엔지니어링으로 에이전트 팀을 설계하다', { left: '420px', top: '660px', font: '500 34px/1.3 var(--sans)', color: 'var(--ink2)', opacity: 0 });
      // 입력 줄(화면 고정): 글자와 커서를 한 줄에 둔다(커서는 글자 끝에서 4px 뒤를 따라간다)
      $.input = box(el, '', { left: CUR.x + 'px', top: CUR.y - CUR.h / 2 + 'px', height: CUR.h + 'px', font: `500 64px/${CUR.h}px var(--mono)`, color: 'var(--ink)' });
      $.typed = h('span', '', $.input);
      $.cur = h('span', '', $.input);
      css($.cur, { display: 'inline-block', width: CUR.w + 'px', height: CUR.h + 'px', verticalAlign: 'top', background: 'var(--accent)' });
      $.word = [...'비밀노트/'];
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const d = driftOf(this, a);
      // 영상으로 넘어가는 동안(x.exit) 커서만 남기고 나머지를 거둔다: 영상 첫 프레임은 어두운 바탕에 커서 하나다
      const out = 1 - DECK.smooth(0, 0.7, x.exit || 0);
      $.mov.style.transform = `rotate(${(-d.rz).toFixed(4)}deg) translate(${(-d.dx).toFixed(2)}px, ${(-d.dy).toFixed(2)}px)`;
      show($.mov, out);
      $.ph.layer.style.transform = `scale(${(1.035 + 0.015 * Math.sin(a * 0.05)).toFixed(4)}) translate(${(-10 * Math.sin(a * 0.04)).toFixed(1)}px, ${(6 * Math.sin(a * 0.03 + 1)).toFixed(1)}px)`;
      show($.ph.layer, Math.max(prog(t, -0.2, 1.0, ease.linear), x.arrive));
      $.light.render(a);
      const tp = prog(t, 0.2, 0.8, ease.snap);
      show($.title, tp); $.title.style.transform = `translateY(${((1 - tp) * 36).toFixed(1)}px)`;
      fadeUp($.time, t, 0.45);
      // 20초마다 「비밀노트/」가 찍혔다가 지워진다(a 6초부터). 찍는 동안은 커서가 켜져 있다
      const c = a >= 6 ? (a - 6) % 20 : -1;
      let n = 0, busy = false;
      if (c >= 0 && c < 0.9) { n = Math.ceil((c / 0.9) * $.word.length); busy = true; }
      else if (c >= 0.9 && c < 4.0) n = $.word.length;
      else if (c >= 4.0 && c < 4.6) { n = Math.ceil((1 - (c - 4.0) / 0.6) * $.word.length); busy = true; }
      if (x.exit > 0) { n = Math.min(n, Math.ceil((1 - DECK.smooth(0, 0.35, x.exit)) * $.word.length)); busy = true; }   // 넘어갈 때는 빨리 지우고 커서를 켠다
      const txt = $.word.slice(0, n).join('');
      if ($.typed.textContent !== txt) $.typed.textContent = txt;
      $.cur.style.marginLeft = n > 0 ? '4px' : '0px';
      const blinkOn = busy || (a % 1 + 1) % 1 < 0.5;
      show($.cur, blinkOn ? 1 : 0);
      show($.input, Math.max(prog(t, 0.6, 0.3, ease.linear), x.exit > 0 ? 1 : 0));
    },
  });

  // ─────────────── 2. 인트로 영상 ───────────────
  DECK.videoSlide({ id: 'intro-video', video: 'v01_intro' });

  // ─────────────── 3. 제목 (cut · parallax) ───────────────
  // 엔진 parallax 식(engine.js offsetOf: 이동은 drift의 1.5배, 회전은 drift와 같은 0.25°): 14·1.5·sin(0.23a + ph), 9·1.5·sin(0.17a + 1.7ph), 0.25°·sin(0.11a + 0.6ph)
  const titlePar = (sl, a) => {
    const ph = rand(sl.index + 1, 3) * 6.2832;
    return { dx: 21 * Math.sin(a * 0.23 + ph), dy: 13.5 * Math.sin(a * 0.17 + ph * 1.7), rz: 0.25 * Math.sin(a * 0.11 + ph * 0.6) };
  };
  // 인트로 영상 마지막 프레임에서 cut으로 들어온다. 첫 화면(t 0)은 처음부터 완성된 상태(트리 일곱 줄 · 제목 · 「비밀노트」 밑줄 · 부제)이고,
  // 클릭 없이 0.6초부터 선 → 연사 이름·소속이 이어서 나온다(한 클릭 빌드, 2026-11-16)
  DECK.slide({
    id: 'title', lead: 0, holds: [], dur: 2.2,
    // 엔진 parallax 머묾 카메라는 cameraHook으로 모두 지우고(슬라이드 판 = 화면, x.cam = 0), 같은 흐름을 render에서 층마다 직접 건다.
    // 판(.slide, overflow hidden)이 움직이면 화면 가득한 사진 층이 판 가장자리에서 잘려 위·오른쪽에 바탕 띠가 드러났기 때문이다.
    // 영상 마지막 프레임과 cut 순간에 같은 자리가 되도록 a = 0 값을 지우고 4초에 걸쳐 원래 흐름으로 돌려 놓는다(titlePar 참고)
    cameraHook(t, o) {
      const b = titlePar(this, o.a);
      return { dx: -b.dx, dy: -b.dy, rz: -b.rz };
    },
    notes: '안녕하세요. 카카오 AI Studio의 황민호입니다. 오늘 제목이 비밀노트인데, 실제로는 파일 일곱 개입니다. 왼쪽에 보이는 이 목록이 오늘 순서입니다. 50분 동안 이 파일들을 하나씩 열어 보겠습니다.',
    setup(el) {
      const $ = this.$;
      $.back = box(el, '', {}, 'full');
      $.ph = photoLayer($.back, 'assets/img/kv_title.png', { opacity: 0.4, edge: 'inset 0 0 70px 6px rgba(14,16,19,.7)' });
      $.light = softLight($.back, { color: 'rgba(255,236,190,.07)' });
      $.mid = box(el, '', {}, 'full');
      $.tree = U.fileTree($.mid, { preset: 'title' });
      $.front = box(el, '', {}, 'full');
      // 제목 두 줄은 줄마다 한 요소. 위치는 영상 마지막 프레임에서 잰 글자 위치(1줄 위 395, 2줄 위 507)에 맞춘다.
      // 줄 높이 1.22에서는 U.mark가 잰 기준선이 어긋나 막대가 글자 아래로 떨어지므로 1.12로 두고 top으로 맞춘다
      const TF = { left: '790px', font: 'var(--displayW) 96px/1.12 var(--display)', letterSpacing: '-.035em', color: 'var(--ink)' };
      $.t1 = box($.front, 'AI 시대를 위한', Object.assign({ top: '384px' }, TF));
      $.t2 = box($.front, '수석 엔지니어의 비밀노트', Object.assign({ top: '495px' }, TF));
      $.mk = U.mark($.t2, { word: '비밀노트' });
      $.mk.set(1);
      $.sub = box($.front, '하네스 엔지니어링으로 에이전트 팀을 설계하다', { left: '790px', top: '646px', font: '500 40px/1.3 var(--sans)', color: 'var(--ink2)' });
      // 이어서 나오는 묶음(0.6초부터): 선 → 연사 이름·소속
      $.rule = box($.front, '', { left: '792px', top: '746px', width: '120px', height: '4px', background: 'var(--accent)', transformOrigin: '0 50%', transform: 'scaleX(0)' }, 'a');
      $.who = U.rise($.front, '황민호 · 카카오 AI Studio 수석', { left: '790px', top: '774px', font: '700 44px/1.2 var(--sans)', color: 'var(--ink)', whiteSpace: 'nowrap' });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      // 층마다 parallax: 판 이동 1배에 층 비율을 더한 값(뒤 0.5, 가운데 1.15, 앞 1.45배)과 판 회전. a = 0에서는 모두 0이다
      const b = titlePar(this, a), b0 = titlePar(this, 0), s4 = DECK.smooth(0, 4, a);
      const c = { dx: b.dx - b0.dx * (1 - s4), dy: b.dy - b0.dy * (1 - s4), rz: b.rz - b0.rz * (1 - s4) };
      const lay = (m, o) => `rotate(${(-o.rz).toFixed(4)}deg) translate(${(-m * o.dx).toFixed(2)}px, ${(-m * o.dy).toFixed(2)}px)`;
      // 뒤 층(사진·빛)은 s4만큼만 움직여, 아래 사진 층 배율이 커지는 만큼보다 먼저 가장자리가 들어오지 않게 한다
      $.back.style.transform = lay(0.5, { dx: s4 * b.dx, dy: s4 * b.dy, rz: s4 * b.rz });
      // 사진 층 배율: a 0에서 1.0(영상 마지막 프레임과 cut 일치), 시차를 되돌리는 4초 동안 1.03까지 키워
      // 뒤 층 이동(가로 최대 약 10px, 세로 약 7px, 회전 0.25°)에도 층 가장자리가 화면 안으로 들어오지 않게 한다
      $.ph.layer.style.transform = `scale(${(1 + 0.03 * s4 + 0.01 * (1 - Math.cos(a * 0.08))).toFixed(4)})`;
      $.light.render(a, 2);
      $.mid.style.transform = lay(1.15, c);
      $.front.style.transform = lay(1.45, c);
      $.tree.render(t);
      // 제목은 t 0에 이미 자리에 있으므로 이름 줄은 0.6초부터 이어서 나온다(선 0.6 → 이름 0.7~1.3)
      const r = prog(t, 0.6, 0.6, ease.outExpo);
      $.rule.style.transform = `scaleX(${r.toFixed(4)})`;
      $.who.render(t, 0.7, { each: 0.025, dur: 0.55 });
    },
  });

  // ─────────────── 4. 연사 소개 (slide-r · drift) ───────────────
  // 배치는 다른 강연 덱(cau-slide) 2쪽 발표자 소개를 따른다: 왼쪽 사진·이름·소개·인용문·직함, 가운데 책 표지, 오른쪽 세로 연표,
  // 아래 카드 네 장(넷째 카드에 GitHub Star 추이 그래프). 색은 이 덱의 어두운 바탕 팔레트로 옮겼다.
  // drift 슬라이드라 글자는 모두 x 175~1745, y 175~905 안에 둔다. 왼쪽 위(경로 줄)는 비워 둔다.
  // Star 추이: revfactory/harness 일별 누적 Star(2026-03-27 첫 Star ~ 2026-11-17). 11-16까지는 stargazers의 starred_at을 날짜별로 센 값
  // (2026-11-16 23:11 조회, Star를 취소한 계정은 빠져 과거 값이 조금 작을 수 있다), 11-17은 저장소 조회값 9,367(2026-11-17 00:51 KST).
  // 발표 직전 숫자를 고칠 때는 STARS_NOW·STARS_AT과 STAR_DAILY의 마지막 값을 함께 바꾼다.
  const STARS_NOW = 9367, STARS_AT = '2026. 11. 17.';
  const STAR_DAILY = [1,24,282,676,1059,1322,1517,1634,1735,1823,1924,2014,2078,2152,2203,2234,2276,2346,2401,2443,2470,2503,2530,2571,2622,2655,2692,2734,2770,2792,2819,2848,2878,2918,2945,2960,2978,3001,3026,3041,3065,3092,3122,3142,3154,3176,3202,3254,3281,3301,3313,3324,3338,3359,3391,3410,3427,3439,3445,3454,3496,3562,3672,3989,4055,4372,4881,5314,5507,5735,5952,6079,6240,6374,6499,6582,6658,6739,6786,6820,6845,6876,6907,6932,6951,6976,7000,7061,7197,7480,7782,7847,7871,7897,7939,7965,7988,8015,8035,8049,8067,8083,8108,8125,8143,8157,8167,8180,8194,8217,8229,8243,8258,8272,8286,8301,8313,8321,8336,8371,8382,8393,8405,8415,8428,8445,8451,8459,8465,8472,8486,8493,8506,8516,8522,8527,8539,8593,8629,8652,8660,8667,8673,8676,8686,8696,8713,8720,8724,8730,8739,8742,8749,8755,8762,8769,8772,8781,8787,8797,8807,8815,8822,8830,8842,8851,8864,8875,8881,8890,8901,8915,8923,8930,8942,8948,8956,8964,8975,8981,8987,8998,8999,9005,9010,9015,9026,9039,9047,9051,9057,9063,9068,9074,9082,9091,9096,9100,9108,9118,9125,9132,9138,9146,9158,9166,9178,9194,9201,9209,9214,9218,9228,9237,9245,9262,9269,9275,9282,9290,9292,9298,9308,9314,9326,9328,9331,9336,9341,9348,9351,9355,9360,9367,9367,9367];
  const STAR_DAY0 = Date.UTC(2026, 2, 27);   // STAR_DAILY[0]의 날짜
  const starIdx = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - STAR_DAY0) / 864e5);
  const CAREER = [['2009', 'WIPRO', '자동 SQL DBMS 테스트'], ['2010', 'KISTI', '문장 패턴 분석 · 온톨로지'], ['2013', 'DAUM', '클라우드 서비스 · 검색'], ['현재', 'KAKAO', '광고 · OLIVE · AI Studio']];
  const SPK = {
    X: 192,                                        // 왼쪽 글자 열·카드 줄의 왼쪽 끝(drift ±14px를 더해도 175px 안쪽)
    face: { x: 192, y: 182, d: 156 },
    cover: { x: 884, y: 184, w: 355, h: 456 },     // 책 표지 840×1080
    TX: 1368, TY: 232, STEP: 120,                  // 세로 연표: 점의 x, 첫 점 y, 간격
    CY: 680, CH: 224, CW: [296, 340, 236, 614], GAP: 20,
  };
  DECK.slide({
    // 한 클릭 빌드: 사진·이름(0) → 소개·인용문·직함(0.45~1.15), 책 표지(0.35), 연표(0.5~1.4) → 카드 네 장(1.3) → Star 그래프(1.7~2.6)가 클릭 없이 이어서 나온다
    id: 'speaker', holds: [], dur: 3.0,
    // 출처 줄을 두지 않는다: 경력·책·커뮤니티·Star 수(revfactory/harness) 모두 발표자 본인 자료다. 조회 시점은 노트에서 말한다
    notes: '제 소개는 짧게 하겠습니다. 카카오 AI Studio에서 현장 팀과 함께 AI 에이전트를 업무에 적용하는 일을 합니다. 저는 프롬프트를 잘 쓰는 것보다 AI가 일할 시스템을 만드는 데 관심이 많습니다. 테스트 자동화, 연구기관, 검색과 클라우드, 광고 플랫폼을 거쳤습니다. 올해 하네스 엔지니어링 책을 냈고 곧 4쇄를 찍습니다. 카카오 그룹사 AI 사용자 모임도 운영합니다. 오른쪽 아래는 같은 이름의 공개 저장소에 붙은 Star 수입니다. 3월 말 첫 Star 이후 6월 한 달 동안 3천 5백 개 넘게 늘었습니다. (Star 수는 11월 17일 0시 51분 조회값. 발표 직전에 다시 확인한다.)',
    setup(el) {
      const $ = this.$, L = SPK;
      // ── 왼쪽 글자 열 ──
      $.face = U.image(el, 'assets/speaker/profile_face.jpg', { x: L.face.x, y: L.face.y, w: L.face.d, h: L.face.d, radius: L.face.d / 2, label: '사진' });
      css($.face.el, { boxSizing: 'border-box', border: '4px solid var(--ink)', boxShadow: '0 14px 30px rgba(0,0,0,.4)', transformOrigin: '50% 50%' });
      $.name = U.rise(el, '황민호', { left: '378px', top: '176px', font: 'var(--displayW) 136px/1.0 var(--display)', letterSpacing: '-.03em', color: 'var(--ink)', whiteSpace: 'nowrap' });
      $.uid = box(el, 'robin.hwang', { left: '384px', top: '318px', font: '500 28px/34px var(--mono)', color: 'var(--mut)', opacity: 0 });
      $.intro = box(el, 'AI가 일할 환경을 설계하는 사람', { left: L.X + 'px', top: '368px', font: '700 44px/56px var(--sans)', color: 'var(--ink)', letterSpacing: '-.01em', opacity: 0 });
      $.bar = box(el, '', { left: L.X + 2 + 'px', top: '450px', width: '8px', height: '112px', borderRadius: '4px', background: 'var(--ok)', transformOrigin: '50% 0' }, 'a');
      $.quote = ['“프롬프트가 아니라,', '시스템을 만듭니다.”'].map((q, i) => lineRise(el, q, { left: L.X + 40 + 'px', top: 446 + i * 60 + 'px', font: '800 48px/60px var(--display)', letterSpacing: '-.02em', color: 'var(--ink)' }));
      $.chip = box(el, '수석 · Kakao AI Studio FDE', { left: L.X + 'px', top: '588px', font: '700 34px/44px var(--sans)', padding: '7px 18px 9px', borderRadius: '10px', background: 'var(--ink)', color: 'var(--bg0)', opacity: 0 });
      // ── 가운데 책 표지(실제 출간물 표지) ──
      $.cover = U.image(el, 'assets/speaker/book_cover_dark.png', { x: L.cover.x, y: L.cover.y, w: L.cover.w, h: L.cover.h, radius: 6, label: '책 표지' });
      css($.cover.el, { boxShadow: '0 0 0 1.5px var(--line), 0 26px 50px rgba(0,0,0,.5)', transformOrigin: '50% 100%' });
      // ── 오른쪽 세로 연표(현재 칸만 노란 점) ──
      $.track = box(el, '', { left: L.TX - 3 + 'px', top: L.TY + 'px', width: '6px', height: L.STEP * 3 + 'px', borderRadius: '3px', background: 'color-mix(in srgb, var(--ink) 32%, transparent)', transformOrigin: '50% 0' }, 'a');
      $.tl = CAREER.map(([yr, org, desc], i) => {
        const y = L.TY + i * L.STEP, last = i === 3, r = last ? 22 : 16;
        const ring = last ? box(el, '', { left: L.TX - 22 + 'px', top: y - 22 + 'px', width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--accent)', opacity: 0 }, 'a') : null;
        const dot = box(el, '', { left: L.TX - r + 'px', top: y - r + 'px', width: r * 2 + 'px', height: r * 2 + 'px', borderRadius: '50%', boxSizing: 'border-box',
          border: last ? '6px solid var(--bg0)' : '6px solid color-mix(in srgb, var(--ink) 70%, var(--bg0))', background: last ? 'var(--accent)' : 'var(--bg0)', boxShadow: last ? '0 0 0 3px var(--accent)' : 'none', opacity: 0 }, 'a');
        const g = box(el, '', { left: L.TX + 44 + 'px', top: y - 46 + 'px', opacity: 0 }, 'a');
        box(g, yr, { left: '0px', top: '0px', font: `${/^\d/.test(yr) ? '500 28px/34px var(--mono)' : '600 28px/34px var(--sans)'}`, color: last ? 'var(--accent)' : 'var(--mut)' });
        box(g, org, { left: '0px', top: '30px', font: 'var(--displayW) 44px/50px var(--display)', letterSpacing: '-.01em', color: 'var(--ink)' });
        box(g, desc, { left: '1px', top: '80px', font: '600 28px/34px var(--sans)', color: 'var(--ink2)' });
        return { dot, ring, g };
      });
      // ── 아래 카드 네 장 ──
      const xs = []; L.CW.reduce((x, w) => { xs.push(x); return x + w + L.GAP; }, L.X);
      const plate = (i, dark) => box(el, '', { left: xs[i] + 'px', top: L.CY + 'px', width: L.CW[i] + 'px', height: L.CH + 'px', borderRadius: '18px', boxSizing: 'border-box',
        background: dark ? 'color-mix(in srgb, var(--accent2) 13%, var(--bg1))' : 'var(--card)',
        border: `1.5px solid ${dark ? 'color-mix(in srgb, var(--accent2) 38%, transparent)' : 'var(--line)'}`, boxShadow: '0 18px 40px rgba(0,0,0,.35)', opacity: 0 }, 'a');
      const head = (c, txt) => {
        box(c, '', { left: '24px', top: '30px', width: '14px', height: '22px', borderRadius: '3px', background: 'var(--ok)' }, 'a');
        return box(c, txt, { left: '48px', top: '18px', font: '800 32px/44px var(--display)', color: 'var(--ink)' });
      };
      const body = (c, txt, top, o = {}) => box(c, txt, Object.assign({ left: '24px', top: top + 'px', font: `${o.w || 700} 28px/${o.lh || 38}px var(--sans)`, color: o.color || 'var(--ink)' }, o.st || {}), o.cls);
      $.cards = [];
      // 1 저서 + 「4쇄 예정」 표시
      { const c = plate(0), inner = box(c, '', { left: '0px', top: '0px', width: '100%', height: '100%' }, 'a');
        const hd = head(inner, '저서');
        box(inner, '4쇄 예정', { left: 48 + hd.offsetWidth + 14 + 'px', top: '22px', font: '700 28px/32px var(--sans)', padding: '1px 10px 3px', borderRadius: '8px', border: '2px solid var(--accent)', color: 'var(--accent)' });
        body(inner, '「하네스 엔지니어링', 72); body(inner, 'with 클로드 코드」', 110);
        body(inner, '한빛미디어, 2026', 156, { w: 600, color: 'var(--ink2)' });
        $.cards.push({ c, inner }); }
      // 2 교육·강연
      { const c = plate(1), inner = box(c, '', { left: '0px', top: '0px', width: '100%', height: '100%' }, 'a');
        head(inner, '교육·강연');
        body(inner, '카카오 그룹·대학·정부·기업', 72); body(inner, 'AI 실습형 강의', 112, { w: 600, color: 'var(--ink2)' });
        $.cards.push({ c, inner }); }
      // 3 커뮤니티(설명 줄은 카드 폭에서 낱말 사이로 나눈다)
      { const c = plate(2), inner = box(c, '', { left: '0px', top: '0px', width: '100%', height: '100%' }, 'a');
        head(inner, '커뮤니티');
        body(inner, 'AI 사용자 모임', 70);
        body(inner, '카카오 그룹사 4,700명 이상 커뮤니티 운영', 108, { w: 600, lh: 34, color: 'var(--ink2)', cls: 'a', st: { width: L.CW[2] - 44 + 'px', whiteSpace: 'normal', wordBreak: 'keep-all' } });
        $.cards.push({ c, inner }); }
      // 4 GitHub Star 카드(그래프 포함)
      { const W = L.CW[3], c = plate(3, true), inner = box(c, '', { left: '0px', top: '0px', width: '100%', height: '100%' }, 'a');
        box(inner, 'revfactory/harness', { left: '24px', top: '14px', font: '500 28px/36px var(--mono)', color: 'var(--ink)', fontVariantLigatures: 'none' });
        $.starIc = box(inner, '', { left: '334px', top: '15px', width: '34px', height: '34px', transformOrigin: '50% 50%' }, 'a');
        U.icon($.starIc, 'star', 34, 'var(--accent)', 2);
        $.num = box(inner, '0', { left: '22px', top: '48px', font: '400 96px/104px var(--num)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' });
        box(inner, `GitHub Stars · ${STARS_AT} 기준`, { left: '24px', top: '180px', font: '600 28px/34px var(--sans)', color: 'var(--ink2)' });
        // 그래프: 가로 = 날짜 순서, 세로 = 0 ~ 마지막 값. 축·격자 없이 선과 아래 면, 기준선 하나
        const S = STAR_DAILY, n = S.length, max = S[n - 1], PX = 296, PY = 30, PW = W - 24 - PX, PH = 104;
        const X = (k) => PX + (k / (n - 1)) * PW, Y = (v) => PY + PH - (v / max) * PH;
        const pts = S.map((v, k) => `${X(k).toFixed(1)},${Y(v).toFixed(1)}`);
        const sv = s('svg', { width: W, height: L.CH }, inner); css(sv, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
        const clip = s('clipPath', { id: 'spk-star-clip' }, s('defs', {}, sv));
        $.clipR = s('rect', { x: PX - 8, y: 0, width: 0, height: L.CH }, clip);
        const gg = s('g', { 'clip-path': 'url(#spk-star-clip)' }, sv);
        s('path', { d: `M${PX},${PY + PH} L${pts.join(' L')} L${PX + PW},${PY + PH} Z`, fill: DECK.rgba('ok', 0.2), stroke: 'none' }, gg);
        s('path', { d: `M${pts.join(' L')}`, fill: 'none', stroke: DECK.rgba('ok', 1), 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, gg);
        $.base = s('line', { x1: PX, y1: PY + PH + 3, x2: PX + PW, y2: PY + PH + 3, stroke: DECK.rgba('ink', 0.35), 'stroke-width': 2 }, sv);
        $.endDot = s('circle', { r: 7, fill: DECK.rgba('ok', 1), 'stroke-width': 3 }, sv);
        $.endDot.style.stroke = 'color-mix(in srgb, var(--accent2) 13%, var(--bg1))';   // 카드 바탕색 고리
        $.plot = { S, n, X, Y, PX, PW };
        // 가로축 글자(3월은 첫날 3월 27일, 6·9월은 1일 자리, 11월은 오른쪽 끝에 맞춤)
        $.ax = [['3월', PX, 'left'], ['6월', X(starIdx(2026, 6, 1)), 'center'], ['9월', X(starIdx(2026, 9, 1)), 'center'], ['11월', PX + PW, 'right']].map(([t, x, al]) =>
          box(inner, t, { left: (al === 'left' ? x : al === 'right' ? x - 56 : x - 25) + 'px', top: '140px', width: (al === 'right' ? 56 : 50) + 'px', textAlign: al, font: '600 28px/34px var(--sans)', color: 'var(--ink2)', opacity: 0 }));
        // 주석 하나: 6월 한 달 증가(5월 31일 → 6월 30일 누적값 차). 급증 구간 바로 오른쪽, 선 아래 면 안에 둔다
        const j0 = starIdx(2026, 6, 1), j1 = starIdx(2026, 6, 30), inc = S[j1] - S[j0 - 1];
        $.an = box(inner, `6월 +${inc.toLocaleString('en-US')}`, { left: Math.round(X(j1)) + 14 + 'px', top: Math.round(Y(S[j1])) + 18 + 'px', font: '700 28px/34px var(--sans)', color: 'var(--ink)', opacity: 0 });
        $.cards.push({ c, inner }); }
    },
    render(t, x) {
      const $ = this.$, a = x.a, L = SPK;
      // 카메라가 오는 동안 카드 판이 옅게 먼저 보인다
      const early = DECK.smooth(0.05, 0.6, x.arrive);
      // 왼쪽 열
      const fp = prog(t, 0, 0.45, ease.pop);
      show($.face.el, prog(t, 0, 0.2, ease.linear));
      $.face.el.style.transform = `scale(${lerp(0.6, 1, fp).toFixed(4)})`;
      $.name.render(t, 0.1, { each: 0.07, dur: 0.55 });
      fadeUp($.uid, t, 0.45, 0.5, 18);
      fadeUp($.intro, t, 0.55, 0.55, 22);
      $.bar.style.transform = `scaleY(${prog(t, 0.8, 0.4, ease.outCubic).toFixed(4)})`;
      $.quote.forEach((q, i) => q.render(t, 0.85 + i * 0.12, 0.55));
      fadeUp($.chip, t, 1.15, 0.5, 22);
      // 책 표지: 아래에서 올라와 내려앉는다
      const cp = prog(t, 0.35, 0.65, ease.outCubic);
      show($.cover.el, prog(t, 0.35, 0.25, ease.linear));
      $.cover.el.style.transform = `translateY(${((1 - cp) * 60).toFixed(1)}px) scale(${lerp(0.95, 1, cp).toFixed(4)})`;
      // 연표: 선이 위에서 아래로 자라며 점과 글자가 0.25초 간격으로 붙는다
      show($.track, prog(t, 0.5, 0.2, ease.linear));
      $.track.style.transform = `scaleY(${Math.max(1e-3, prog(t, 0.5, 0.95, ease.inOutCubic)).toFixed(4)})`;
      $.tl.forEach((n, i) => {
        const st = 0.5 + i * 0.25, p = prog(t, st, 0.45, ease.pop);
        show(n.dot, p > 0 ? 1 : 0); n.dot.style.transform = `scale(${Math.max(0.001, p).toFixed(4)})`;
        const q = prog(t, st + 0.08, 0.5, ease.outCubic);
        show(n.g, q); n.g.style.transform = `translateX(${((1 - q) * 32).toFixed(1)}px)`;
        if (n.ring) {   // 지금(KAKAO): 고리가 퍼지며 맥동
          const u = (a * 0.6) % 1;
          n.ring.style.transform = `scale(${(1 + u * 1.1).toFixed(4)})`;
          n.ring.style.opacity = (prog(t, st + 0.4, 0.4) * (1 - u) * 0.9).toFixed(3);
        }
      });
      // 카드: 판은 옅게 먼저, 내용은 0.1초 간격으로 올라온다
      $.cards.forEach(({ c, inner }, i) => {
        const st = 1.3 + i * 0.1;
        show(c, Math.max(early * 0.4, prog(t, st, 0.3, ease.linear)));
        const q = prog(t, st + 0.05, 0.5, ease.outCubic);
        show(inner, q); inner.style.transform = `translateY(${((1 - q) * 22).toFixed(1)}px)`;
      });
      // Star 그래프: 선이 왼쪽에서 오른쪽으로 그려지고 숫자가 같은 날짜의 누적값으로 올라간다(1.7 → 2.6초)
      const P = $.plot, g = prog(t, 1.7, 0.9, ease.inOutSine), kf = g * (P.n - 1), k0 = Math.floor(kf), fr = kf - k0;
      const v = g >= 1 ? P.S[P.n - 1] : lerp(P.S[k0], P.S[Math.min(k0 + 1, P.n - 1)], fr);
      $.clipR.setAttribute('width', (8 + g * P.PW + 6).toFixed(1));
      $.endDot.setAttribute('cx', P.X(kf).toFixed(1)); $.endDot.setAttribute('cy', P.Y(v).toFixed(1));
      show($.endDot, g > 0 ? 1 : 0); show($.base, prog(t, 1.6, 0.3, ease.linear));
      const txt = (g >= 1 ? STARS_NOW : Math.round(v)).toLocaleString('en-US');
      if ($.num.textContent !== txt) $.num.textContent = txt;
      $.ax.forEach((e, i) => show(e, prog(t, 1.7 + i * 0.12, 0.3, ease.linear)));
      show($.an, prog(t, 2.45, 0.3, ease.linear));
      $.starIc.style.transform = `rotate(${(8 * Math.sin(a * 1.3)).toFixed(2)}deg) scale(${(1 + 0.06 * Math.sin(a * 2.1)).toFixed(4)})`;
    },
  });

  // ─────────────── 5. 청중에게 묻는 질문 (push · drift) ───────────────
  DECK.slide({
    id: 'audience-q', holds: [1.6], dur: 3.2,
    notes: '먼저 여쭙겠습니다. 보고서 초안이든 공고문 요약이든, AI에게 일을 맡겨 보신 분 손 들어 주시겠어요? [클릭] 그러면 그 결과를 고치지 않고 그대로 쓰신 분은요? 손이 많이 내려갑니다. 오늘 이야기는 이 두 질문 사이의 차이를 줄이는 방법입니다.',
    setup(el) {
      const $ = this.$;
      $.glow = box(el, '', { left: '160px', top: '60px', width: '1600px', height: '900px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 16%, transparent) 0%, color-mix(in srgb, var(--accent) 5%, transparent) 55%, transparent 100%)' }, 'a');
      $.glow2 = box(el, '', { left: '560px', top: '260px', width: '800px', height: '520px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent2) 10%, transparent), transparent)' }, 'a');
      // 카메라가 오는 동안 보이는 첫 질문의 옅은 자리(글자가 솟기 시작하면 사라진다)
      $.q1g = box(el, 'AI에게 일을 맡겨 본 적이 있으신가요?', { left: '0px', width: '1920px', top: '352px', textAlign: 'center', font: '700 72px/1.3 var(--serif)', color: 'var(--ink)', opacity: 0 });
      $.q1 = box(el, 'AI에게 일을 맡겨 본 적이 있으신가요?', { left: '0px', width: '1920px', top: '352px', textAlign: 'center', font: '700 72px/1.3 var(--serif)', color: 'var(--ink)' });
      $.w1 = split($.q1, 'word', { mask: true });
      $.q2 = lineRise(el, '그 결과를 고치지 않고 쓸 수 있었나요?', { center: 960, top: '540px', font: '700 72px/1.3 var(--serif)', color: 'var(--ink)' });
      $.mk = U.mark($.q2.inner, { word: '고치지 않고' });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      // 질문 뒤 빛: 들어오는 동안 먼저 보이고, 머무는 동안 천천히 밝아진다
      const lit = Math.max(DECK.smooth(0, 0.7, x.arrive) * 0.5, 0.5 + 0.5 * DECK.smooth(0, 9, a));
      show($.glow, lit * (0.85 + 0.15 * Math.sin(a * 0.9)));
      $.glow.style.transform = `scale(${(0.9 + 0.12 * lit + 0.02 * Math.sin(a * 0.6)).toFixed(4)})`;
      show($.glow2, 0.5 + 0.3 * Math.sin(a * 0.45));
      $.glow2.style.transform = `translate(${(160 * Math.sin(a * 0.21)).toFixed(1)}px, ${(40 * Math.sin(a * 0.33)).toFixed(1)}px)`;
      show($.q1g, DECK.smooth(0.1, 0.7, x.arrive) * 0.32 * (1 - prog(t, 0, 0.3, ease.linear)));
      $.w1.forEach((w, i) => {
        const p = prog(t, 0.05 + i * 0.07, 0.6);
        w.style.transform = `translateY(${((1 - p) * 120).toFixed(1)}%)`;
        w.style.opacity = p > 0 ? '1' : '0';
      });
      const d = prog(t, 1.6, 0.5);
      $.q1.style.color = d > 0 ? `color-mix(in srgb, var(--mut) ${(d * 100).toFixed(0)}%, var(--ink))` : '';
      $.q1.style.transform = `translateY(${(-d * 16).toFixed(1)}px)`;
      $.q2.render(t, 1.65, 0.65);
      $.mk.render(t, 2.3, 0.55);
    },
  });

  // ─────────────── 6~8. 하네스로 만든 프로젝트 ───────────────
  // 2026-11-17 사용자 지시로 옛 6번(결과물 8가지)·7번(해남 사이트)을 지우고 세 장으로 바꿨다.
  // 숫자는 발표자의 프로젝트 목록(harness-projects: 2026-03-02~11-15 구성, 306개 = 사이트 공개 287 + 회사 업무라 비공개 19)에서 셌다.
  // 출처 줄 없음: 발표자 본인 자료다.
  const PJ = {
    total: 306, agents: 3008, skills: 2035,
    // 칸 순서(날짜순)대로 분야 한 글자: r 리서치 · a 웹앱 개발 · m 하네스 연구 · p 웹사이트 · g 게임 · b 업무 실무 · s 스토리 · w 이미지·영상
    // (벽 그림 assets/projects/wall_atlas.jpg는 18×17칸, 칸 200×112px. 화면이 있는 174칸은 첫 화면, 나머지는 분야 색 카드)
    cols: 18, rows: 17,
  };

  // ─────────────── 6. 프로젝트 306개 (push · dolly-in) ───────────────
  const WALL = { tw: 100, th: 56, gap: 6 };
  WALL.w = PJ.cols * WALL.tw + (PJ.cols - 1) * WALL.gap; WALL.h = PJ.rows * WALL.th + (PJ.rows - 1) * WALL.gap;
  WALL.x = Math.round((1920 - WALL.w) / 2); WALL.y = Math.round((1080 - WALL.h) / 2);
  WALL.T0 = 0.1; WALL.FILL = 1.9;   // 칸이 날짜순으로 채워지는 구간
  DECK.slide({
    // 한 클릭 빌드: 칸 306개가 날짜순으로 채워지며 프로젝트 수가 함께 오른다(0.1~2.0) → 에이전트·스킬 수(0.6~2.4) → 칸 설명(2.2)
    id: 'projects-wall', holds: [], dur: 2.8,
    notes: '제가 올해 3월부터 이번 달까지 하네스로 만든 프로젝트입니다. 칸 하나가 프로젝트 하나이고, 왼쪽 위부터 날짜순입니다. 모두 306개입니다. 프로젝트마다 에이전트 팀을 짰는데, 에이전트를 모두 더하면 3,008개, 스킬은 2,035개입니다. (색만 있는 칸은 화면을 남기지 않은 프로젝트다. 306개 가운데 19개는 회사 업무라 소개 사이트에 공개하지 않았고, 사이트에는 287개가 보인다. 에이전트 수에는 예제 100개를 묶은 harness-100의 489개가 들어 있다. 연사 확인)',
    setup(el) {
      const $ = this.$;
      $.wall = box(el, '', { left: WALL.x + 'px', top: WALL.y + 'px', width: WALL.w + 'px', height: WALL.h + 'px' }, 'a');
      $.tiles = [];
      for (let i = 0; i < PJ.cols * PJ.rows; i++) {
        const c = i % PJ.cols, r = Math.floor(i / PJ.cols);
        const d = box($.wall, '', {
          left: c * (WALL.tw + WALL.gap) + 'px', top: r * (WALL.th + WALL.gap) + 'px', width: WALL.tw + 'px', height: WALL.th + 'px',
          borderRadius: '5px', backgroundImage: 'url(assets/projects/wall_atlas.jpg)',
          backgroundSize: `${PJ.cols * WALL.tw}px ${PJ.rows * WALL.th}px`, backgroundPosition: `${-c * WALL.tw}px ${-r * WALL.th}px`, opacity: 0,
        }, 'a');
        $.tiles.push({ d, st: WALL.T0 + (i / (PJ.cols * PJ.rows)) * WALL.FILL, last: -1 });
      }
      // 머무는 동안 벽 위를 천천히 지나가는 빛 띠(멈춘 화면 방지). 칸 위, 글자 그림자 아래
      $.sweep = box(el, '', { left: '0px', top: WALL.y + 'px', width: '420px', height: WALL.h + 'px', opacity: 0,
        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,244,214,.16) 50%, rgba(255,255,255,0) 100%)' }, 'a');
      // 글자 뒤를 어둡게 하는 타원 그림자(칸은 그대로 보이게 가장자리로 갈수록 옅어진다)
      $.shade = box(el, '', { left: '260px', top: '150px', width: '1400px', height: '780px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(14,16,19,.94) 0%, rgba(14,16,19,.86) 55%, rgba(14,16,19,.5) 80%, rgba(14,16,19,0) 100%)', opacity: 0 }, 'a');
      $.kick = box(el, '2026년 3월부터 11월까지, 하네스로 만든 프로젝트', { left: '360px', width: '1200px', top: '238px', textAlign: 'center', font: '700 40px/1.3 var(--sans)', color: 'var(--ink)', opacity: 0 });
      // 큰 숫자: 칸이 채워진 수와 같다. 자릿수가 바뀌어도 「개」가 움직이지 않게 숫자 상자 폭을 「306」 폭으로 고정하고 오른쪽 맞춤
      $.bigWrap = box(el, '', { top: '300px', height: '270px', opacity: 0 }, 'a nw');
      $.bigNum = h('span', '', $.bigWrap, '306');
      css($.bigNum, { display: 'inline-block', font: '400 260px/1 var(--num)', color: 'var(--accent)', textAlign: 'right', letterSpacing: '-.01em' });
      $.bigUnit = h('span', '', $.bigWrap, '개');
      css($.bigUnit, { display: 'inline-block', font: 'var(--displayW) 96px/1 var(--display)', color: 'var(--ink)', marginLeft: '18px' });
      const nw = $.bigNum.offsetWidth; css($.bigNum, { width: nw + 'px' });
      $.bigWrap.style.left = Math.round(960 - $.bigWrap.offsetWidth / 2) + 'px';
      // 에이전트·스킬 수
      $.agLab = box(el, '에이전트', { left: '0px', top: '0px', font: '700 36px/1.2 var(--sans)', color: 'var(--mut)', opacity: 0 });
      $.skLab = box(el, '스킬', { left: '0px', top: '0px', font: '700 36px/1.2 var(--sans)', color: 'var(--mut)', opacity: 0 });
      $.ag = U.counter(el, { x: 0, y: 720, to: PJ.agents, size: 110, color: 'var(--ink)' });
      $.sk = U.counter(el, { x: 0, y: 720, to: PJ.skills, size: 110, color: 'var(--ink)' });
      // 두 묶음(이름 + 숫자)을 가운데에 나란히: 숫자 폭은 마지막 값으로 잰다
      const measure = (txt) => { const m = box(el, txt, { font: '400 110px/1 var(--num)', letterSpacing: '-.01em', visibility: 'hidden' }); const w = m.offsetWidth; m.remove(); return w; };
      const wAgL = $.agLab.offsetWidth, wSkL = $.skLab.offsetWidth, wAg = measure('3,008'), wSk = measure('2,035'), G1 = 22, G2 = 110;
      const total = wAgL + G1 + wAg + G2 + wSkL + G1 + wSk;
      let x0 = Math.round(960 - total / 2);
      css($.agLab, { left: x0 + 'px', top: '658px' }); $.ag.el.style.left = x0 + wAgL + G1 + 'px';
      x0 += wAgL + G1 + wAg + G2;
      css($.skLab, { left: x0 + 'px', top: '658px' }); $.sk.el.style.left = x0 + wSkL + G1 + 'px';
      $.foot = box(el, '칸 하나가 프로젝트 하나 · 왼쪽 위부터 날짜순', { left: '360px', width: '1200px', top: '786px', textAlign: 'center', font: '500 30px/1.3 var(--sans)', color: 'var(--ink2)', opacity: 0 });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      // 칸: 날짜순으로 하나씩 튀어나온다. 바뀐 칸만 DOM에 쓴다
      const early = DECK.smooth(0, 0.6, x.arrive);
      const dim = 1 - 0.38 * prog(t, 2.0, 0.8);
      $.tiles.forEach(tl => {
        const p = prog(t, tl.st, 0.32, ease.pop);
        const q = Math.round(p * 200) / 200;
        if (q === tl.last) return;
        tl.last = q;
        tl.d.style.opacity = (Math.min(1, p * 1.6)).toFixed(3);
        tl.d.style.transform = q >= 1 ? '' : `scale(${lerp(0.4, 1, p).toFixed(3)})`;
      });
      show($.wall, Math.max(early * 0.25, 1) * dim);
      // 글자
      show($.shade, prog(t, 0.2, 0.6));
      fadeUp($.kick, t, 0.15, 0.5, 20);
      const n = Math.max(0, Math.min(PJ.total, Math.floor(((t - WALL.T0 - 0.12) / WALL.FILL) * PJ.total + 1)));
      const nt = t < WALL.T0 ? '0' : String(n);
      if ($.bigNum.textContent !== nt) $.bigNum.textContent = nt;
      const bp = prog(t, 0.1, 0.5, ease.pop);
      show($.bigWrap, prog(t, 0.1, 0.25, ease.linear));
      $.bigWrap.style.transform = `translateY(${((1 - bp) * 30).toFixed(1)}px)`;
      fadeUp($.agLab, t, 0.6, 0.45, 18); fadeUp($.skLab, t, 0.7, 0.45, 18);
      $.ag.render(t, 0.6, 1.6, ease.outCubic); $.sk.render(t, 0.7, 1.6, ease.outCubic);
      fadeUp($.foot, t, 2.2, 0.5, 16);
      // 머무는 동안: 큰 숫자 아래 빛이 아주 천천히 오르내린다(멈춘 화면 방지)
      $.shade.style.transform = `translate(${(18 * Math.sin(a * 0.35)).toFixed(1)}px, ${(10 * Math.sin(a * 0.27)).toFixed(1)}px)`;
      // 빛 띠: 칸이 다 찬 뒤 왼쪽에서 오른쪽으로 7초에 한 번 지나간다(왼쪽 위부터 날짜순이라는 읽는 방향과 같다)
      show($.sweep, prog(t, 2.1, 0.6));
      $.sweep.style.transform = `translateX(${(WALL.x - 420 + ((a / 7) % 1) * (WALL.w + 840)).toFixed(1)}px)`;
    },
  });

  // ─────────────── 7. 개발·리서치에서 업무 실무로 (push · drift) ───────────────
  // 달마다 만든 프로젝트를 세 묶음 비율로: 개발·리서치(리서치·웹앱 개발·하네스 연구·웹사이트·게임), 콘텐츠·창작(이미지·영상·스토리), 업무 실무(업무 자동화·기업 실무)
  const MON = ['3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월'];
  const MTOT = [64, 49, 60, 31, 22, 20, 24, 23, 13];
  const MBIZ = [7, 4, 6, 2, 3, 1, 3, 5, 4];
  const MCRE = [6, 2, 15, 4, 5, 1, 2, 3, 2];
  const CH7 = { x: 214, base: 812, H: 400, bw: 78, gap: 40 };
  DECK.slide({
    // 한 클릭 빌드: 제목(0) → 막대 아홉 개가 차례로 자람(0.3~1.5) → 9~11월 띠와 오른쪽 비율 비교(1.4~2.3) → 범례(1.9~2.4)
    id: 'projects-shift', holds: [], dur: 2.8,
    notes: '분야로 나눠 보면 이렇습니다. 파란 부분이 개발과 리서치, 노란 부분이 업무 실무입니다. 처음에는 대부분 개발과 리서치였습니다. 3월부터 5월까지 만든 173개 가운데 업무 실무는 17개, 10%였습니다. 9월부터 이번 달까지는 60개 가운데 12개, 20%입니다. 업무에 바로 쓰는 하네스가 늘고 있습니다. (막대 위 숫자는 그 달에 만든 프로젝트 수. 11월은 15일까지)',
    setup(el) {
      const $ = this.$;
      $.title = lineRise(el, '개발·리서치에서 업무 실무로', { left: '200px', top: '190px', font: 'var(--displayW) 64px/1.2 var(--display)', letterSpacing: '-.025em', color: 'var(--ink)' });
      $.mk = U.mark($.title.inner, { word: '업무 실무' });
      $.sub = box(el, '달마다 만든 프로젝트를 분야별 비율로', { left: '202px', top: '282px', font: '500 32px/1.3 var(--sans)', color: 'var(--mut)', opacity: 0 });
      // 9~11월 띠
      const bx = i => CH7.x + i * (CH7.bw + CH7.gap);
      $.band = box(el, '', { left: bx(6) - 16 + 'px', top: CH7.base - CH7.H - 64 + 'px', width: 3 * CH7.bw + 2 * CH7.gap + 32 + 'px', height: CH7.H + 64 + 56 + 'px',
        borderRadius: '14px', background: 'color-mix(in srgb, var(--accent) 9%, transparent)', border: '2px solid color-mix(in srgb, var(--accent) 35%, transparent)', opacity: 0 }, 'a');
      $.bars = MON.map((m, i) => {
        const x0 = bx(i), dev = MTOT[i] - MBIZ[i] - MCRE[i];
        const col = box(el, '', { left: x0 + 'px', top: CH7.base - CH7.H + 'px', width: CH7.bw + 'px', height: CH7.H + 'px', transformOrigin: '50% 100%', overflow: 'hidden', borderRadius: '8px 8px 0 0' }, 'a');
        const hB = CH7.H * MBIZ[i] / MTOT[i], hC = CH7.H * MCRE[i] / MTOT[i], hD = CH7.H - hB - hC;
        box(col, '', { left: '0px', top: '0px', width: '100%', height: hD.toFixed(1) + 'px', background: 'color-mix(in srgb, var(--accent2) 52%, var(--bg1))' }, 'a');
        box(col, '', { left: '0px', top: (hD + 2).toFixed(1) + 'px', width: '100%', height: Math.max(0, hC - 2).toFixed(1) + 'px', background: 'color-mix(in srgb, var(--ink) 34%, var(--bg1))' }, 'a');
        box(col, '', { left: '0px', top: (hD + hC + 2).toFixed(1) + 'px', width: '100%', height: Math.max(0, hB - 2).toFixed(1) + 'px', background: 'var(--accent)' }, 'a');
        const n = box(el, String(MTOT[i]), { left: x0 - 20 + 'px', width: CH7.bw + 40 + 'px', top: CH7.base - CH7.H - 46 + 'px', textAlign: 'center', font: '500 28px/1.2 var(--mono)', color: 'var(--mut)', opacity: 0 });
        const lb = box(el, m, { left: x0 - 20 + 'px', width: CH7.bw + 40 + 'px', top: CH7.base + 14 + 'px', textAlign: 'center', font: '600 30px/1.2 var(--sans)', color: i >= 6 ? 'var(--ink)' : 'var(--ink2)', opacity: 0 });
        return { col, n, lb, i };
      });
      $.axis = box(el, '', { left: CH7.x - 12 + 'px', top: CH7.base + 'px', width: 9 * CH7.bw + 8 * CH7.gap + 24 + 'px', height: '2px', background: 'var(--line)', transformOrigin: '0 50%' }, 'a');
      // 오른쪽: 업무 실무 비율 비교
      const RX = 1330;
      $.cmpT = box(el, '업무 실무 비율', { left: RX + 'px', top: '402px', font: '700 34px/1.3 var(--sans)', color: 'var(--ink)', opacity: 0 });
      $.cmpA = box(el, '3~5월', { left: RX + 'px', top: '480px', font: '600 30px/1.2 var(--sans)', color: 'var(--mut)', opacity: 0 });
      $.cmpAv = U.counter(el, { x: RX + 120, y: 552, to: 10, size: 84, color: 'var(--ink2)', suffix: '%', suffixColor: 'var(--ink2)' });
      $.cmpArr = box(el, '↓', { left: RX + 150 + 'px', top: '560px', font: '700 40px/1 var(--sans)', color: 'var(--mut)', opacity: 0 });
      $.cmpB = box(el, '9~11월', { left: RX + 'px', top: '622px', font: '700 30px/1.2 var(--sans)', color: 'var(--accent)', opacity: 0 });
      $.cmpBv = U.counter(el, { x: RX + 120, y: 716, to: 20, size: 112, color: 'var(--accent)', suffix: '%' });
      // 범례(9개월 합계)
      const LG = [['color-mix(in srgb, var(--accent2) 52%, var(--bg1))', '개발·리서치', 231], ['color-mix(in srgb, var(--ink) 34%, var(--bg1))', '콘텐츠·창작', 40], ['var(--accent)', '업무 실무', 35]];
      $.legend = LG.map(([c, name, v], i) => {
        const g = box(el, '', { left: RX + 'px', top: 752 + i * 46 + 'px', width: '400px', height: '40px', opacity: 0 }, 'a');
        box(g, '', { left: '0px', top: '9px', width: '22px', height: '22px', borderRadius: '5px', background: c }, 'a');
        box(g, name, { left: '36px', top: '2px', font: '600 28px/1.3 var(--sans)', color: 'var(--ink2)' });
        box(g, v + '개', { left: '230px', top: '2px', font: '500 28px/1.3 var(--mono)', color: 'var(--ink2)' });
        return g;
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.title.render(t, 0.0, 0.6);
      fadeUp($.sub, t, 0.2, 0.5, 16);
      const early = DECK.smooth(0, 0.6, x.arrive);
      $.axis.style.transform = `scaleX(${Math.max(early * 0.3, prog(t, 0.15, 0.5, ease.inOutCubic)).toFixed(4)})`;
      show($.axis, Math.max(early, prog(t, 0, 0.2)));
      $.bars.forEach(b => {
        const st = 0.3 + b.i * 0.1, p = prog(t, st, 0.6, ease.pop);
        b.col.style.transform = `scaleY(${Math.max(0.0001, p).toFixed(4)})`;
        show(b.col, p > 0 ? 1 : 0);
        fadeUp(b.n, t, st + 0.35, 0.4, 10);
        show(b.lb, Math.max(early * 0.6, prog(t, st, 0.3)));
      });
      // 9~11월 띠: 막대가 다 선 뒤 나타나고, 머무는 동안 테두리 밝기가 천천히 오르내린다
      const bp = prog(t, 1.4, 0.5);
      show($.band, bp * (0.82 + 0.18 * Math.sin(a * 1.1)));
      $.mk.render(t, 1.5, 0.55);
      fadeUp($.cmpT, t, 1.4, 0.45, 16);
      fadeUp($.cmpA, t, 1.5, 0.45, 16);
      $.cmpAv.render(t, 1.5, 0.8, ease.outCubic);
      show($.cmpArr, prog(t, 1.75, 0.3)); $.cmpArr.style.transform = `translateY(${(4 * Math.sin(a * 2)).toFixed(1)}px)`;
      fadeUp($.cmpB, t, 1.8, 0.45, 16);
      $.cmpBv.render(t, 1.8, 0.9, ease.outCubic);
      $.legend.forEach((g, i) => fadeUp(g, t, 1.9 + i * 0.12, 0.45, 14));
    },
  });

  // ─────────────── 8. 지금은 업무 실무에 (push · drift) ───────────────
  // 최근 업무 실무 사례 여섯(2026-06~11). 사진은 소개 사이트에 공개한 화면만 쓴다(assets/projects/*.jpg, 960×540)
  const PRAC = [
    ['aikorea', '공공 행정', 'AI전략위원회 실무 8종', 35, '2026. 6.'],
    ['archives', '기록관리', '공공기관 기록관리 하네스', 15, '2026. 11.'],
    ['patent', '특허', '특허 발굴·출원 서류 8종', 15, '2026. 10.'],
    ['marketing', '마케팅', '마케팅 루프', 16, '2026. 10.'],
    ['ipops', '콘텐츠 사업', '웹툰·웹소설 IP 운영', 16, '2026. 10.'],
    ['shorts', '영상 제작', '지식 쇼츠 40편', 16, '2026. 10.'],
  ];
  const PC = { x: 200, y: 290, w: 480, ih: 180, gx: 40, rowH: 300 };
  DECK.slide({
    // 한 클릭 빌드: 제목(0) → 카드 여섯 장이 차례로(0.25~1.25) → 에이전트 수가 카드마다 오른다
    id: 'projects-practice', holds: [], dur: 2.4,
    notes: '요즘 만드는 하네스는 이런 것들입니다. 국가인공지능전략위원회의 행정문서와 예상 질의응답, 공공기관 기록물 분류, 특허 출원 서류, 마케팅, 웹툰·웹소설 IP 운영, 지식 쇼츠 40편입니다. 하네스 하나에 에이전트가 15개에서 35개 들어갑니다. 모두 누구나 쓸 수 있는 상용 모델로 만들었습니다. 그런데 같은 모델을 일반 채팅 창에서 쓰면 이런 결과가 나오지 않습니다. (연사 확인)',
    setup(el) {
      const $ = this.$;
      $.title = lineRise(el, '지금은 업무 실무에 씁니다', { left: '200px', top: '182px', font: 'var(--displayW) 60px/1.2 var(--display)', letterSpacing: '-.025em', color: 'var(--ink)' });
      $.mk = U.mark($.title.inner, { word: '업무 실무' });
      $.cards = PRAC.map(([img, field, name, ag, date], i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const cx = PC.x + col * (PC.w + PC.gx), cy = PC.y + row * PC.rowH;
        const host = box(el, '', { left: cx + 'px', top: cy + 'px', width: PC.w + 'px', height: PC.rowH - 26 + 'px' }, 'a');
        const im = U.image(host, `assets/projects/${img}.jpg`, { x: 0, y: 0, w: PC.w, h: PC.ih, radius: 12 });
        css(im.el, { border: '1.5px solid var(--line)' });
        const chip = box(im.el, date, { right: '12px', bottom: '12px', padding: '0 10px', height: '36px', borderRadius: '8px', font: '500 28px/36px var(--mono)', color: 'var(--ink)', background: 'rgba(14,16,19,.82)' });
        const fl = box(host, field, { left: '2px', top: PC.ih + 18 + 'px', font: '700 28px/1.3 var(--sans)', color: 'var(--accent)' });
        const agl = box(host, '에이전트', { right: '62px', top: PC.ih + 18 + 'px', font: '600 28px/1.3 var(--sans)', color: 'var(--mut)' });
        const agn = box(host, '0', { right: '0px', width: '56px', textAlign: 'right', top: PC.ih + 8 + 'px', font: '400 46px/1 var(--num)', color: 'var(--ink)' });
        const nm = box(host, name, { left: '2px', top: PC.ih + 60 + 'px', font: '700 32px/1.3 var(--sans)', color: 'var(--ink)' });
        return { host, im, chip, fl, agl, agn, nm, ag, i };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      $.title.render(t, 0.0, 0.6);
      $.mk.render(t, 1.5, 0.55);
      const early = DECK.smooth(0, 0.6, x.arrive);
      $.cards.forEach(c => {
        const st = 0.25 + c.i * 0.15, p = prog(t, st, 0.6, ease.pop), q = prog(t, st, 0.4);
        show(c.host, Math.max(early * 0.15, q));
        c.host.style.transform = `translateY(${((1 - p) * 40).toFixed(1)}px)`;
        css(c.im.el, { clipPath: `inset(0 0 ${((1 - q) * 100).toFixed(1)}% 0 round 12px)` });
        const v = String(Math.round(c.ag * prog(t, st + 0.2, 0.7, ease.outCubic)));
        if (c.agn.textContent !== v) c.agn.textContent = v;
        // 머무는 동안 사진이 아주 조금씩 확대·축소된다(카드마다 위상이 다름)
        if (!c.im.missing) c.im.img.style.transform = `scale(${(1.02 + 0.02 * Math.sin(a * 0.4 + c.i * 1.1)).toFixed(4)})`;
      });
    },
  });

  // ─────────────── 9. 모델이 아니라 환경 (whip · none) ───────────────
  DECK.slide({
    // 한 클릭 빌드: 첫 문장(0~0.9) → 둘째 문장(0.7~1.3) → 「환경」 밑줄(1.25~1.8)
    id: 'not-model', bg: 'plain', holds: [], dur: 2.2,
    notes: '차이는 모델이 아닙니다. 같은 모델입니다. 바꾼 것은 그 모델이 일하는 환경입니다. 이 환경을 하네스라고 부릅니다.',
    setup(el) {
      const $ = this.$;
      // 「환경」 뒤 빛: 가운데를 낱말 가운데(x 956, y 566)에 두고, 가운데 24% → 35% 지점 10%로 떨어지는 원형 그라데이션(맥동을 곱하면 20% 안팎)
      $.spot = box(el, '', { left: '536px', top: '366px', width: '840px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 24%, transparent) 0%, color-mix(in srgb, var(--accent) 10%, transparent) 35%, color-mix(in srgb, var(--accent) 3%, transparent) 70%, transparent 100%)' }, 'a');
      const F = 'var(--displayW) 88px/1.2 var(--display)';
      // 평면 밀기로 들어오는 동안 보이는 첫 문장의 옅은 자리(음절이 솟기 시작하면 사라진다)
      $.l1g = box(el, '모델을 바꾸지 않았습니다.', { left: '0px', top: '0px', font: F, letterSpacing: '-.03em', color: 'var(--mut)', opacity: 0 });
      $.l1 = U.rise(el, '모델을 바꾸지 않았습니다.', { left: '0px', top: '0px', font: F, letterSpacing: '-.03em', color: 'var(--mut)', whiteSpace: 'nowrap' });
      $.l2 = lineRise(el, '모델이 일하는 환경을 바꿨습니다.', { left: '0px', top: '0px', font: F, letterSpacing: '-.03em', color: 'var(--ink)' });
      // 두 줄을 왼쪽 맞춤으로 쌓고 두 줄을 묶은 전체 폭을 가운데에 둔다(두 줄의 「모델」이 같은 자리에서 시작)
      const w = Math.max($.l1.el.offsetWidth, $.l2.inner.offsetWidth), x0 = Math.round((1920 - w) / 2);
      css($.l1.el, { left: x0 + 'px', top: '372px' });
      css($.l1g, { left: x0 + 'px', top: '372px' });
      css($.l2.wrap, { left: x0 + 'px', top: '508px' });
      $.mk = U.mark($.l2.inner, { word: '환경' });
      $.x0 = x0;
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      show($.l1g, DECK.smooth(0.0, 0.5, x.arrive) * 0.4 * (1 - prog(t, 0, 0.3, ease.linear)));
      $.l1.render(t, 0.0, { each: 0.03, dur: 0.5 });
      $.l2.render(t, 0.7, 0.6);
      $.mk.render(t, 1.25, 0.55);
      // 「환경」 뒤 빛: 둘째 문장과 함께 밝아지고, 머무는 동안 좌우로 오가며 세기가 천천히 오르내린다
      const p2 = prog(t, 0.7, 0.8);
      show($.spot, (0.35 + 0.65 * p2) * (0.82 + 0.18 * Math.sin(a * 1.3)));
      // 빛의 가운데가 「환경」 둘레의 납작한 타원(가로 170 · 세로 75px)을 따라 8초에 한 바퀴씩 돈다(멈춤 동안에도 속도가 0이 되지 않는다)
      $.spot.style.transform = `translate(${(170 * Math.cos(a * 0.8) + lerp(-160, 0, p2)).toFixed(1)}px, ${(lerp(-110, 0, p2) + 75 * Math.sin(a * 0.8)).toFixed(1)}px)`;
    },
  });

  // ─────────────── 10. 에이전트 = 모델 + 하네스 (push · dolly-in) ───────────────
  // dolly-in이 끝난 화면(약 1.06배)에서도 등식 위 끝과 「작업 순서」 아래 끝이 화면 가장자리에서 175px 안쪽에 들도록 도식을 줄여 올린다
  const D = { cx: 960, cy: 648, half: 150, r: 76 };
  const SIDES = [
    { k: 'top', text: '역할' }, { k: 'right', text: '도구' }, { k: 'bottom', text: '작업 순서' }, { k: 'left', text: '검증과 기록' },
  ];
  DECK.slide({
    // 한 클릭 빌드: 등식·원·테두리(0~1.75) → 뜻 한 줄(1.25~2.25) → 네 낱말(1.8~2.65)
    id: 'define-harness', holds: [], dur: 3.0,
    // 출처 줄 없음: 정의 도식은 발표자 본인 자료(이전 발표)다
    notes: '정의는 한 줄입니다. 에이전트는 모델에 하네스를 더한 것입니다. 하네스는 모델이 일하는 환경 전체를 가리킵니다. 구체적으로는 네 가지입니다. 누가 무엇을 맡는지, 무엇을 실행할 수 있는지, 어떤 순서로 하는지, 무엇을 확인하고 남기는지. 오늘은 이 네 가지를 어디에 어떻게 적는지 보여 드립니다.',
    setup(el) {
      const $ = this.$;
      // 등식: 낱말마다 따로 움직인다. 「모델」은 원과 같은 색, 「하네스」는 테두리와 같은 형광 밑줄
      $.eq = box(el, '', { left: '0px', width: '1920px', top: '188px', textAlign: 'center', font: 'var(--displayW) 110px/1.15 var(--display)', letterSpacing: '-.03em', color: 'var(--ink)' }, 'a nw');
      const parts = [['에이전트', 'var(--ink)'], ['=', 'var(--mut)'], ['모델', 'var(--accent2)'], ['+', 'var(--mut)'], ['하네스', 'var(--ink)']];
      $.tok = parts.map(([tx, col], i) => {
        const sp = h('span', '', $.eq, tx);
        css(sp, { display: 'inline-block', color: col, margin: i % 2 ? '0 .28em' : '0' });
        return sp;
      });
      // 평면 밀기로 들어오는 동안 보이는 등식의 옅은 자리(낱말이 솟기 시작하면 사라진다). 밑줄을 붙이기 전에 복제한다
      $.eqg = $.eq.cloneNode(true); el.insertBefore($.eqg, $.eq); $.eqg.style.opacity = '0';
      $.mkH = U.mark($.tok[4]);
      // 도식
      $.sv = s('svg', { width: 1920, height: 1080 }, el); css($.sv, { position: 'absolute', left: 0, top: 0 });
      const { cx, cy, half, r } = D;
      $.outline = s('rect', { x: cx - half, y: cy - half, width: half * 2, height: half * 2, rx: 6, fill: DECK.rgba('accent', 0.04), stroke: DECK.rgba('accent', 0.25), 'stroke-width': 2, 'stroke-dasharray': '6 10' }, $.sv);
      $.frame = s('rect', { x: cx - half, y: cy - half, width: half * 2, height: half * 2, rx: 6, fill: 'none', stroke: DECK.rgba('accent', 1), 'stroke-width': 5 }, $.sv);
      $.run = s('rect', { x: cx - half, y: cy - half, width: half * 2, height: half * 2, rx: 6, fill: 'none', stroke: 'rgba(255,250,225,.95)', 'stroke-width': 5, 'stroke-linecap': 'round' }, $.sv);
      $.disc = s('circle', { cx, cy, r, fill: DECK.rgba('accent2', 0.12), stroke: DECK.rgba('accent2', 0.95), 'stroke-width': 3 }, $.sv);
      $.dots = Array.from({ length: 34 }, (_, i) => s('circle', { r: 2.2 + rand(i, 4) * 2.4, fill: DECK.rgba('accent2', 0.35 + rand(i, 5) * 0.4) }, $.sv));
      $.mLab = box(el, '모델', { left: cx - 100 + 'px', width: '200px', top: cy - 23 + 'px', textAlign: 'center', font: '700 36px/1.3 var(--sans)', color: 'var(--ink)', opacity: 0 });
      $.hLab = box(el, '하네스', { left: cx - half + 18 + 'px', top: cy - half + 14 + 'px', font: '700 30px/1.3 var(--sans)', color: 'var(--accent)', opacity: 0 });
      // 둘째 묶음: 뜻 한 줄
      $.def = lineRise(el, '하네스: 모델이 일하는 환경', { center: 960, top: '344px', font: '600 44px/1.2 var(--sans)', color: 'var(--ink)' });
      $.mkD = U.mark($.def.inner, { word: '환경' });
      // 셋째 묶음: 네 변에 붙는 낱말
      $.sides = SIDES.map((sd, i) => {
        const pill = box(el, sd.text, { font: '700 36px/52px var(--sans)', color: 'var(--ink)', padding: '0 22px', height: '56px', borderRadius: '14px', background: 'var(--card)', border: '2px solid var(--accent)', opacity: 0 });
        const w = pill.offsetWidth, hh = 56, gap = 22;
        let px, py, dx = 0, dy = 0, tick;
        if (sd.k === 'top') { px = cx - w / 2; py = cy - half - gap - hh; dy = -1; tick = `M${cx} ${cy - half - gap} L${cx} ${cy - half}`; }
        if (sd.k === 'bottom') { px = cx - w / 2; py = cy + half + gap; dy = 1; tick = `M${cx} ${cy + half} L${cx} ${cy + half + gap}`; }
        if (sd.k === 'right') { px = cx + half + gap; py = cy - hh / 2; dx = 1; tick = `M${cx + half} ${cy} L${cx + half + gap} ${cy}`; }
        if (sd.k === 'left') { px = cx - half - gap - w; py = cy - hh / 2; dx = -1; tick = `M${cx - half - gap} ${cy} L${cx - half} ${cy}`; }
        css(pill, { left: px.toFixed(0) + 'px', top: py.toFixed(0) + 'px' });
        const tk = s('path', { d: tick, stroke: DECK.rgba('accent', 1), 'stroke-width': 3, fill: 'none' }, $.sv);
        return { pill, tk, dx, dy };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const { cx, cy, half, r } = D;
      // 들어오는 동안 점선 틀과 원이 먼저 보인다
      const early = DECK.smooth(0.05, 0.6, x.arrive);
      show($.outline, Math.max(early, prog(t, 0, 0.3)) * (1 - prog(t, 0.9, 0.5)));
      show($.eqg, DECK.smooth(0.0, 0.4, x.arrive) * 0.32 * (1 - prog(t, 0.05, 0.3, ease.linear)));
      $.tok.forEach((sp, i) => {
        const st = 0.05 + i * 0.09, p = prog(t, st, 0.55, ease.pop);
        sp.style.opacity = prog(t, st, 0.2, ease.linear).toFixed(3);
        sp.style.transform = `translateY(${((1 - p) * 50).toFixed(1)}px) scale(${lerp(0.7, 1, p).toFixed(4)})`;
      });
      $.mkH.render(t, 0.95, 0.5);
      // 원(모델): 흔들리는 점이 안에서 돈다
      const dp = prog(t, 0.45, 0.6, ease.pop);
      show($.disc, Math.max(early * 0.6, prog(t, 0.45, 0.2, ease.linear)));
      $.disc.setAttribute('r', (r * lerp(early * 0.6, 1, dp)).toFixed(1));
      $.dots.forEach((d, i) => {
        const rr = (r - 10) * Math.sqrt(rand(i, 1)), th = rand(i, 2) * TAU + a * (0.25 + 0.5 * rand(i, 3)) * (i % 2 ? 1 : -1);
        const j = 6 * noise(a * 0.8 + i, i % 7);
        d.setAttribute('cx', (cx + Math.cos(th) * rr + j).toFixed(1)); d.setAttribute('cy', (cy + Math.sin(th) * rr - j * 0.6).toFixed(1));
        d.style.opacity = (prog(t, 0.6, 0.5, ease.linear) * dp).toFixed(3);
      });
      fadeUp($.mLab, t, 0.7, 0.45, 12);
      // 테두리(하네스)가 그려지고, 다 그려지면 빛이 테두리를 돈다
      U.draw($.frame, prog(t, 0.75, 0.75, ease.inOutCubic));
      const per = 8 * half;
      $.run.style.strokeDasharray = `90 ${per - 90}`;
      $.run.style.strokeDashoffset = (-((a * 260) % per)).toFixed(1);
      show($.run, prog(t, 1.45, 0.4, ease.linear) * 0.85);
      fadeUp($.hLab, t, 1.3, 0.45, 12);
      // 둘째 묶음: 테두리가 거의 다 그려질 때 뜻 한 줄이 솟는다
      $.def.render(t, 1.25, 0.6);
      $.mkD.render(t, 1.75, 0.5);
      // 셋째 묶음: 네 낱말이 바깥에서 변으로 붙는다
      $.sides.forEach((sd, i) => {
        const st = 1.8 + i * 0.1, p = prog(t, st, 0.55, ease.pop);
        show(sd.pill, prog(t, st, 0.2, ease.linear));
        sd.pill.style.transform = `translate(${(sd.dx * (1 - p) * 70).toFixed(1)}px, ${(sd.dy * (1 - p) * 70).toFixed(1)}px)`;
        U.draw(sd.tk, prog(t, st + 0.3, 0.25, ease.outCubic));
      });
    },
  });

  // ─────────────── 11. 오늘 가져가실 세 문장 (push · none) ───────────────
  // 문장마다 화면 줄 목록과 밑줄 낱말. 셋째 문장은 한 줄로 두면 x 1793까지 가서 띠(오른쪽 끝 1766)를 넘으므로 쉼표에서 두 줄로 나눈다
  const THREE = [
    [['같은 AI도 일하는 환경을 정리하면 결과가 달라진다'], '환경'],
    [['환경은 파일로 적는다: 요청서, 역할, 방법, 순서, 검증'], '파일'],
    [['나뉘는 일은 에이전트 팀에 맡기고,', '기준과 책임은 사람이 정한다'], '사람'],
  ];
  // 두 줄짜리 셋째 문장이 들어가도 덩어리 가운데가 전과 같은 y 561에 오도록 전체를 35px 올렸다
  const ROW_Y = [321, 491, 661], ROW_H = 70;
  const rowH = i => THREE[i][0].length * ROW_H;
  DECK.slide({
    // 한 클릭 빌드: 세 문장이 0.6초 간격으로 솟고(0.05 · 0.65 · 1.25, 마지막 밑줄 2.43), 막대와 띠는 새 문장을 따라 내려간 뒤
    // 2.0초부터 세 문장 전체를 덮도록 늘어난다. 끝 화면에서는 세 문장 모두 ink(앞 문장을 흐리게 하지 않는다)
    id: 'three-sentences', holds: [], dur: 3.0,
    notes: '50분 뒤에 이 세 문장만 기억하셔도 됩니다. 첫째, 같은 AI도 일하는 환경을 정리하면 결과가 달라집니다. 둘째, 그 환경은 말로 하지 않고 파일로 적습니다. 셋째, 나뉘는 일은 에이전트 팀에 맡기고, 기준과 책임은 사람이 정합니다.',
    setup(el) {
      const $ = this.$;
      // 지금 문장 뒤의 옅은 띠(막대와 함께 옮겨 가고 머무는 동안 천천히 밝아졌다 어두워진다)
      $.band = box(el, '', { left: '176px', top: '-14px', width: '1590px', height: ROW_H + 28 + 'px', borderRadius: '14px',
        background: 'linear-gradient(90deg, color-mix(in srgb, var(--accent) 14%, transparent) 0%, color-mix(in srgb, var(--accent) 6%, transparent) 55%, transparent 100%)', overflow: 'hidden' }, 'a');
      $.glints = [0, 1].map(() => box($.band, '', { left: '0px', top: '0px', width: '460px', height: '100%',
        background: 'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent) 13%, transparent) 50%, transparent 100%)' }, 'a'));
      $.sv = s('svg', { width: 1920, height: 1080 }, el); css($.sv, { position: 'absolute', left: 0, top: 0 });
      $.bar = box(el, '', { left: '158px', top: '0px', width: '10px', height: ROW_H + 'px', borderRadius: '5px', background: 'var(--accent)' }, 'a');
      // 확인 칸은 비워 둔다. 확인 표시는 99번(three-again)에서 빌드마다 찍힌다
      $.rows = THREE.map(([lines, word], i) => {
        const y = ROW_Y[i], cyy = y + ROW_H / 2 + 2;   // 확인 칸은 첫 줄 높이에 맞춘다
        const bx = s('rect', { x: 200, y: cyy - 24, width: 48, height: 48, rx: 8, fill: 'none', stroke: DECK.rgba('ink', 0.55), 'stroke-width': 3 }, $.sv);
        const lns = lines.map((tx, j) => lineRise(el, tx, { left: '286px', top: y + j * ROW_H + 'px', font: `700 54px/${ROW_H}px var(--serif)`, color: 'var(--ink)' }));
        const mk = U.mark(lns.find(ln => ln.inner.textContent.includes(word)).inner, { word });
        return { bx, lns, mk };
      });
    },
    render(t, x) {
      const $ = this.$, a = x.a;
      const ST = [0.05, 0.65, 1.25], SPAN = 2.0;
      const early = DECK.smooth(0.05, 0.6, x.arrive);
      // 막 솟은 문장(시각으로 계산). 세 문장이 다 나오면(SPAN) 막대·띠·칸 강조가 세 문장 전체로 넓어진다
      const cur = t >= ST[2] ? 2 : t >= ST[1] ? 1 : 0;
      const span = prog(t, SPAN, 0.6, ease.inOutCubic);
      $.rows.forEach((r, i) => {
        show(r.bx, Math.max(early * 0.7, prog(t, ST[i] - 0.05, 0.3)));
        r.lns.forEach((ln, j) => ln.render(t, ST[i] + 0.05 + j * 0.08, 0.6));   // 둘째 줄은 0.08초 뒤에 솟는다
        r.mk.render(t, ST[i] + 0.6 + (r.lns.length - 1) * 0.08, 0.5);
        // 칸 테두리: 막 솟은 문장의 칸은 accent, 지난 칸은 옅은 ink. 세 문장이 다 나오면 세 칸 모두 accent로 차례로 맥동한다
        const on = Math.max(i === cur ? 1 : 0, span);
        const pulse = 0.5 + 0.5 * Math.sin(a * 2.2 - i * 0.9);
        r.bx.style.stroke = `color-mix(in srgb, ${DECK.rgba('accent', 0.6 + 0.4 * pulse)} ${(on * 100).toFixed(0)}%, ${DECK.rgba('ink', 0.4)})`;
      });
      // 막대와 뒤 띠: 새 문장을 따라 옮겨 간 뒤(셋째 문장은 두 줄이라 높이도 늘어난다) 세 문장 전체 높이로 늘어난다
      const iA = Math.max(0, cur - 1), yA = ROW_Y[iA], yB = ROW_Y[cur], mv = cur === 0 ? 1 : prog(t, ST[cur], 0.6, ease.pop);
      const yy0 = lerp(yA, yB, mv), hh0 = lerp(rowH(iA), rowH(cur), clamp(mv, 0, 1));
      const yy = lerp(yy0, ROW_Y[0], span), hh = lerp(hh0, ROW_Y[2] + rowH(2) - ROW_Y[0], span);
      $.bar.style.height = hh.toFixed(1) + 'px';
      $.band.style.height = (hh + 28).toFixed(1) + 'px';
      const amp = lerp(0.18, 0.03, span);   // 막대가 길어지면 늘었다 줄었다 하는 폭을 줄인다
      $.bar.style.transform = `translateY(${yy.toFixed(1)}px) scaleY(${(1 - amp + amp * Math.sin(a * 2.2)).toFixed(4)})`;
      show($.bar, prog(t, 0.2, 0.4) * (0.65 + 0.35 * Math.sin(a * 2.2)));
      const bp = prog(t, 0.3, 0.5);
      $.band.style.transform = `translateY(${yy.toFixed(1)}px) scaleX(${lerp(0.6, 1, bp).toFixed(4)})`;
      $.band.style.transformOrigin = '0 50%';
      show($.band, bp * (0.7 + 0.3 * Math.sin(a * 1.6 + 0.8)));
      // 띠 안을 옅은 빛 두 개가 반 바퀴 간격으로 왼쪽에서 오른쪽으로 일정한 속도로 지나간다(하나가 11초에 한 번)
      $.glints.forEach((gl, i) => {
        const gu = ((a * 0.09 + i * 0.5) % 1 + 1) % 1;
        gl.style.transform = `translateX(${lerp(-460, 1590, gu).toFixed(1)}px)`;
        show(gl, bp * DECK.smooth(0, 0.08, gu) * (1 - DECK.smooth(0.85, 1, gu)));
      });
    },
  });

  // ─────────────── 12. 오늘 열어 볼 파일 일곱 개 (rise · track) ───────────────
  // 끝 화면은 다음 영상 v02_env의 0프레임과 같은 화면이다: 트리는 full 프리셋 자리(x 240), 요약 열은 x 629(영상에서 잰 값).
  // 그래서 끝 카메라는 [960, 540, 1.0](화면 좌표 = 슬라이드 좌표)이고, 영상 0프레임에 없는 요소(연결선·띠·화살표)는 두지 않는다
  const SUMS = ['모델이 아니라 환경을 바꾼다', '요청은 문서로 쓴다', '역할·방법·순서를 파일에 적는다', '나뉘는 일은 팀에 맡긴다', '팀 구성도 한 줄로 요청한다', '결과물로 확인한다', '기준과 책임은 사람이 정한다'];
  const SUM_X = 629;
  // 경로 줄 끝 커서: 영상 0.6초에 「비밀노트/README.md」 끝에 나타나는 커서(x 371~383, y 103~127, mut)와 같은 자리·크기
  const PCUR = { x: 371, y: 103, w: 12, h: 24 };
  // 한 클릭 빌드(2026-11-16): camTrack은 빌드 수만큼 하나만 둔다(끝 자리 [960, 540, 1.0]). 이전 2빌드의 카메라 이동
  // (트리를 1.15배로 보다가 화면 전체로)은 cameraHook이 t로 만든다: TOC_CAM.t0부터 0.8초 동안 엔진 track과 같은 곡선(inOutCubic, 배율은 로그 보간)
  const TOC_CAM = { from: [430, 540, 1.15], to: [960, 540, 1.0], t0: 1.15, len: 0.8 };
  DECK.slide({
    id: 'toc-tree', holds: [], dur: 3.2,
    camTrack: [TOC_CAM.to],
    cameraHook(t) {
      const P = DECK.P || 2000, F = TOC_CAM.from, E = TOC_CAM.to;
      const p = ease.inOutCubic(clamp((t - TOC_CAM.t0) / TOC_CAM.len));
      const cx = lerp(F[0], E[0], p), cy = lerp(F[1], E[1], p), z = Math.exp(lerp(Math.log(F[2]), Math.log(E[2]), p));
      // camTrack 끝 자리(E)가 엔진 오프셋에 이미 들어 있으므로 그 차이만 더한다
      return { dx: cx - E[0], dy: cy - E[1], dz: (P / z - P) - (P / E[2] - P) };
    },
    notes: '순서는 이렇습니다. 파일 일곱 개입니다. 왜 환경인지부터 시작해서, 요청을 쓰는 법, 구성 요소, 팀을 꾸리는 기준, 자동으로 구성하는 도구, 실제 사례, 마지막으로 사람이 맡을 일입니다. 첫 파일을 열겠습니다.',
    setup(el0) {
      const $ = this.$;
      // 모든 요소를 한 층에 둔다. 영상(v02_env)으로는 cut으로 넘어가므로(엔진 4차) 이 층을 잘라 내거나 거두지 않는다
      const el = $.L = box(el0, '', {}, 'full');
      $.tree = U.fileTree(el, { preset: 'full', at: 0.05, each: 0.12 });
      const T = $.tree, P0 = U.TREE_PRESETS.full;
      // 들어오는 동안 보이는 줄 자리(이름이 찍히면 사라진다)
      $.ghost = T.rows.map(r => box(el, '', { left: P0.x + Math.round(P0.size * 2.5) + 'px', top: P0.y + r.k * T.R + Math.round(T.R * 0.32) + 'px', width: r.nameEl.offsetWidth + 'px', height: Math.round(T.R * 0.36) + 'px', borderRadius: '6px', background: DECK.rgba('ink', 0.1) }, 'a'));
      // 요약은 줄마다 마스크 안에서 왼쪽부터 드러난다(끝난 상태는 영상 0프레임의 글자 자리와 같다)
      $.rows = T.rows.map((r, i) => {
        const cyy = P0.y + r.k * T.R + T.R / 2;
        const sm = box(el, SUMS[i], { left: SUM_X + 'px', top: cyy - 24 + 'px', font: '500 36px/48px var(--sans)', color: 'var(--mut)', opacity: 0 });
        return { sm, cyy };
      });
      // 첫 파일을 열기 직전: 경로 줄 끝에서 커서가 깜박인다(영상에서는 이 커서 자리의 README.md가 지워지고 환경.md가 찍힌다)
      $.pcur = box(el, '', { left: PCUR.x + 'px', top: PCUR.y + 'px', width: PCUR.w + 'px', height: PCUR.h + 'px', background: 'var(--mut)', opacity: 0 }, 'a');
    },
    render(t, x) {
      const $ = this.$, a = x.a, T = $.tree;
      T.render(t);
      const early = DECK.smooth(0.0, 0.6, x.arrive);
      $.ghost.forEach((g, i) => show(g, early * (1 - prog(t, 0.05 + (i + 1) * 0.12, 0.25, ease.linear))));
      // 머무는 동안: 요약 글이 위에서 아래로 한 줄씩 조금 밝아졌다 돌아온다(7.7초에 한 바퀴, 글자 자리는 그대로).
      // 나가는 전환(x.exit)을 받는 경우(번호 이동·fade)에는 0.1초 안에 거둬 영상 0프레임과 같은 색이 된다. cut이면 영상 0프레임으로 바로 바뀐다
      const wave = prog(t, 2.95, 0.2, ease.linear) * (1 - DECK.smooth(0, 0.15, x.exit || 0));
      const WP = 1.1, WN = SUMS.length * WP;
      $.rows.forEach((r, i) => {
        const st = 1.6 + i * 0.1;   // 카메라가 끝 자리로 옮겨 가는 0.8초(t 1.15~1.95) 중 56%가 지난 뒤 시작(그때 위치는 이미 89%). 마지막 줄 2.75에 다 붙는다
        const sp = prog(t, st, 0.55, ease.outCubic);
        show(r.sm, prog(t, st, 0.2, ease.linear));
        r.sm.style.clipPath = sp >= 1 ? '' : `inset(-10% ${((1 - sp) * 100).toFixed(2)}% -10% 0)`;
        r.sm.style.transform = sp >= 1 ? '' : `translateX(${((1 - sp) * -34).toFixed(1)}px)`;
        let u = (((a - i * WP) % WN) + WN) % WN;   // 요약 줄마다 차례로 밝아지는 순서가 이 줄에 온 뒤 지난 시간
        if (u > WN / 2) u -= WN;
        const lit = wave * Math.max(0, Math.cos(clamp(u / 1.3, -1, 1) * Math.PI / 2)) ** 2;
        r.sm.style.color = lit > 0.004 ? `color-mix(in srgb, var(--ink) ${(lit * 50).toFixed(1)}%, var(--mut))` : 'var(--mut)';
      });
      // 커서: 카메라가 끝 자리에 선 뒤(요약이 다 붙은 뒤) 나타나 1초에 한 번 깜박이고, 영상으로 넘어가기 시작하면 거둔다
      const on = prog(t, 2.8, 0.2, ease.linear) * (1 - DECK.smooth(0.05, 0.3, x.exit || 0));   // 엔진 경로 줄이 옅어지는 것과 함께 거둔다
      show($.pcur, on * ((a % 1 + 1) % 1 < 0.55 ? 1 : 0));
    },
  });
})();
