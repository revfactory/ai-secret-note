/* 공용 배경 층과 부품(deck/common.js). 슬라이드 담당이 함께 쓴다. 이 파일은 엔진 담당만 고친다.
 *
 * 배경 층(슬라이드 def.bg 이름) — 모두 deck/theme.css의 palette 변수 색을 쓴다(concept.palette가 바뀌면 함께 바뀜)
 *   plain      bg0 단색 + 옅은 가운데 밝기
 *   glow       어두운 바탕 위 큰 빛 덩어리(accent·accent2·bg1)가 천천히 떠다님. 카메라 위치에 따라 조금 밀림
 *   grid       어두운 바탕 + 아주 옅은 80px 격자. 카메라가 움직이면 격자가 시차를 두고 따라 움직임
 *   paper      밝은 종이(paper) + 종이 결 + 48px 모눈 점 + 천천히 지나가는 빛. light: true
 *   blueprint  설계도 모눈(accent 선, 120px·24px 두 겹, 1배 칸 그림 반복)이 아주 느리게 흐름. 카메라 시차. 색은 크롬이 그린 영상(v05 끝·v06 시작)에 맞춤(4차)
 *   field      깊이감 있는 점 입자 필드(약 1100개, 가까운 점일수록 크고 밝고 빠름). 카메라 이동·거리(D)에 따라 시차·확대
 *
 * 부품(window.U) — 반환값의 render(t, …)를 슬라이드 render 안에서 부른다
 *   U.rise(parent, html, style, o) → { el, chars, render(t, start, { each, dur, out }) }   음절이 마스크 안에서 솟는 글자
 *   U.wipe(el, p)                    한 줄이 왼쪽부터 열림(clip-path)
 *   U.type(el, full, p, cursor, a)   타자
 *   U.sampler(path, n) → { L, at(p) } / U.draw(path, p)   SVG 경로 점 샘플링 / 선 그리기
 *   U.ICON, U.icon(parent, name, size, color, sw) → svg   아이콘(이모지 대신). 이름 목록은 U.ICON 키
 *   U.tag(parent, num, name, o) → { el, render(t, start) }   장 표시(번호 + 이름). 기본 위치 x 160, y 150(2차에서 84 → 150).
 *                                    이 덱에서는 엔진의 경로 줄(공통 크롬)과 역할이 겹치므로 쓰지 않는다
 *   U.card(parent, { x, y, w, hh, icon, title, sub, light, accent }) → el   아이콘 카드(가운데 기준 좌표)
 *   U.pop(el, t, start, dur, from)   크기 + 투명도 등장
 *   U.canvas(parent, w, hh) → 2d context
 *   U.cover(el, { num, kicker, title, sub, light }) → { render(t, x) }   장 표지(큰 외곽선 번호가 그려지고 제목이 솟음)
 *   U.coverSlide({ id, num, kicker, title, sub, notes, bg, light, holds, dur, camera })   장 표지 슬라이드를 바로 등록
 *   U.source(parent, text, { x, y, size, right, light, prefix }) → { el, render(t, start) }   출처 표기(24px, 기본 x 160, y 940).
 *                                    슬라이드와 함께 움직인다. 화면에 고정된 출처는 def.chrome.source(엔진)를 쓴다
 *   U.example(parent, { text, x, y, light }) → { el, render(t, start) }   "예시" 표기(기본 right 160, y 150). 보통은 스토리보드 example: true로 엔진이 그린다
 *   U.counter(parent, { x, y, to, from, decimals, prefix, suffix, size, color, font, align, comma }) → { el, render(t, start, dur) }   큰 숫자 카운터
 *   U.image(parent, src, { x, y, w, h, fit, radius, label, light }) → { el, img, missing }   이미지. 파일이 없으면 같은 크기의 자리 표시(빗금+파일 이름)
 *   U.depth(x, k) → 'translate(…) scale(…)'   x.cam으로 만든 층 이동. k>0 앞 층(더 움직임), k<0 뒤 층(덜 움직임)
 *   U.pin(x) → 'translate(…) rotate(…) scale(…)'   머묾 카메라(이동·회전 x.cam.rz·확대)를 이 층에서 모두 지움(4차). 영상 끝 프레임과
 *                                    같은 자리에 둘 층에. transform-origin = 슬라이드 가운데(1920×1080 전체 층이면 기본값)
 *   U.mark(target, { word, color, thick, under, light }) → { el, thick, y, under, set(p), render(t, start = 0, dur = 0.5, e) }
 *       형광 노랑 밑줄(콘셉트 반복 요소). target = 글자 요소 또는 U.rise 결과. word를 주면 그 낱말만 감싸서 긋는다.
 *       막대는 글자 아래에 둔다: 위 끝 = 기준선 + 0.03em, 두께 = 0.1em(46px에서 5px), 좌우 0.08em 더 나옴, 색 var(--mark)(= accent #ffd84a).
 *       글자와 겹치지 않으므로 글자색은 그대로다. 이전 방식(두께 0.3em, 글자 아래쪽과 겹치고 겹친 부분을 어둡게)은 { overlap: true }.
 *       핵심 낱말은 굵게 하지 않고 이것으로 강조한다. 한 줄 안의 낱말에 쓴다(줄이 바뀌면 줄마다 따로 부른다)
 *   U.fileTree(parent, { preset, x, y, size, light, current, done, marks, dim, header, files,
 *                        at, each, type, markAt, markEach, markDur, checkAt, checkFrom, checkEach })
 *       → { el, head, rows[], R, size, width, height, current, done, render(t, 바꿀 시각 값) }
 *       비밀노트/ 아래 파일 일곱 줄. 장 표지·정리·제목·목차·마지막 슬라이드에서 같은 모양으로 쓴다(영상 첫·끝 프레임과 맞춤).
 *       current = 지금 장(줄 번호 1~7, '요청서.md', '비밀노트/요청서.md', 장 id 'c02' 모두 받음), done = 확인 표시 줄 수(1~done 줄).
 *       marks 기본 [current]. at을 주지 않으면 처음부터 모두 보인다. 크기 공식·색은 deck/common.js의 U.fileTree 주석과 _workspace/03_engine_api.md
 *   U.TREE_PRESETS  title {160,336,30} · side {160,308,34} · full {240,240,44} · corner {160,568,26}  ({x, y, size})
 *   U.TREE_FILES    ['환경.md','요청서.md','구성.md','팀.md','자동구성.md','사례.md','사람.md'](스토리보드 x_path에서 읽지 못할 때)
 *   U.TAU
 */
(function () {
  const { ease, prog, clamp, lerp, rand, noise, css, h, s, show } = DECK;
  const W = 1920, H = 1080, TAU = Math.PI * 2;
  const mixc = (a, b, t) => [0, 1, 2].map(i => Math.round(lerp(a[i], b[i], t)));
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const wrapv = (v, L) => ((v % L) + L) % L;

  // ── 화면 고정 디더: 어두운 바탕의 넓은 그라디언트 밴딩을 줄인다. 한 번만 굽는다 ──
  let ditherURL = null;
  function dither() {
    if (ditherURL) return ditherURL;
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const g = c.getContext('2d'), im = g.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const v = 128 + (rand((y >> 1) * 4096 + (x >> 1), 17) < 0.5 ? -3 : 3), i = (y * 256 + x) * 4;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    ditherURL = c.toDataURL();
    return ditherURL;
  }
  function addDither(el, op = 0.5) {
    const d = h('div', 'full', el);
    css(d, { backgroundImage: `url(${dither()})`, mixBlendMode: 'overlay', opacity: op, pointerEvents: 'none' });
    return d;
  }
  function vignette(el, col, a = 0.8, inner = 45) {
    const v = h('div', 'full', el);
    css(v, { background: `radial-gradient(ellipse 78% 72% at 50% 45%, rgba(0,0,0,0) ${inner}%, ${rgb(col, a)} 100%)`, pointerEvents: 'none' });
    return v;
  }

  // ───────────────────────── 배경 층 ─────────────────────────
  DECK.bg('plain', {
    setup(el) {
      const b0 = DECK.color('bg0'), b1 = DECK.color('bg1');
      css(el, { background: `radial-gradient(ellipse 80% 75% at 50% 42%, ${rgb(mixc(b0, b1, 0.7))} 0%, ${rgb(b0)} 72%)` });
      addDither(el, 0.35);
    },
  });

  DECK.bg('glow', {
    setup(el) {
      const b0 = DECK.color('bg0'), b1 = DECK.color('bg1'), ac = DECK.color('accent'), ac2 = DECK.color('accent2');
      css(el, { background: rgb(b0) });
      const c = h('canvas', '', el); c.width = 240; c.height = 135;
      css(c, { position: 'absolute', left: 0, top: 0, width: W + 'px', height: H + 'px', filter: 'blur(28px)', transform: 'scale(1.08)' });
      this.g = c.getContext('2d');
      this.base = rgb(b0);
      this.blobs = [
        [0.8, 0.18, 0.55, ac, 0.22], [0.15, 0.85, 0.62, ac2, 0.14], [0.5, 0.5, 0.82, mixc(b1, ac, 0.18), 0.55], [0.93, 0.86, 0.42, ac, 0.10], [0.3, 0.12, 0.38, mixc(ac, ac2, 0.5), 0.08],
      ];
      addDither(el, 0.4);
    },
    render(a, w, cam) {
      const g = this.g;
      g.fillStyle = this.base; g.fillRect(0, 0, 240, 135);
      const px = cam ? 0.05 * Math.sin(cam.x * 0.00021) : 0, py = cam ? 0.05 * Math.sin(cam.y * 0.00027 + 1) : 0;
      g.globalCompositeOperation = 'lighter';
      this.blobs.forEach(([x, y, r, col, al], i) => {
        const cx = (x + px * (1 + i * 0.3) + 0.06 * noise(a * 0.05, i * 3 + 1)) * 240, cy = (y + py * (1 + i * 0.2) + 0.07 * noise(a * 0.045, i * 5 + 2)) * 135;
        const rr = r * 135 * (1 + 0.08 * noise(a * 0.07, i + 9));
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
        gr.addColorStop(0, rgb(col, al)); gr.addColorStop(1, rgb(col, 0));
        g.fillStyle = gr; g.fillRect(0, 0, 240, 135);
      });
      g.globalCompositeOperation = 'source-over';
    },
  });

  DECK.bg('grid', {
    setup(el) {
      const b0 = DECK.color('bg0'), b1 = DECK.color('bg1'), ink = DECK.color('ink');
      css(el, { background: `radial-gradient(ellipse 85% 80% at 50% 40%, ${rgb(mixc(b0, b1, 0.85))} 0%, ${rgb(b0)} 75%)` });
      this.grid = h('div', 'a', el);
      const L = 80;
      css(this.grid, { left: -W + 'px', top: -H + 'px', width: W * 3 + 'px', height: H * 3 + 'px', transformOrigin: '50% 50%',
        backgroundImage: `linear-gradient(${rgb(ink, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${rgb(ink, 0.05)} 1px, transparent 1px)`,
        backgroundSize: `${L}px ${L}px`, backgroundPosition: `${W % L}px ${H % L}px` });
      this.L = L;
      vignette(el, b0, 0.85, 40);
      addDither(el, 0.35);
    },
    render(a, w, cam) {
      const L = this.L, k = cam ? Math.pow(DECK.P / cam.D, 0.35) : 1;
      const ox = wrapv(-(cam ? cam.x : 0) * 0.1 - a * 2, L), oy = wrapv(-(cam ? cam.y : 0) * 0.1 - a * 1.2, L);
      css(this.grid, { transform: `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px) scale(${k.toFixed(4)})` });
    },
  });

  DECK.bg('paper', {
    light: true,
    setup(el) {
      const pa = DECK.color('paper'), ink = DECK.color('paperInk');
      css(el, { background: rgb(pa) });
      const c = h('canvas', '', el); c.width = W; c.height = H;
      css(c, { position: 'absolute', left: 0, top: 0 });
      const g = c.getContext('2d');
      for (let i = 0; i < 2600; i++) {           // 종이 결
        const x = rand(i, 1) * W, y = rand(i, 2) * H, l = 6 + rand(i, 3) * 26, an = rand(i, 4) * TAU;
        g.strokeStyle = rgb(ink, 0.025 + rand(i, 5) * 0.045); g.lineWidth = 0.6 + rand(i, 6);
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke();
      }
      g.fillStyle = rgb(ink, 0.14);         // 모눈 점(48px)
      for (let y = 36; y < H; y += 48) for (let x = 24; x < W; x += 48) g.fillRect(x - 1, y - 1, 2, 2);
      this.light = h('div', 'full', el);
      css(this.light, { background: 'radial-gradient(ellipse 40% 70% at 50% 40%, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)', mixBlendMode: 'soft-light' });
      vignette(el, ink, 0.14, 55);
    },
    render(a) {
      css(this.light, { transform: `translateX(${(-520 + 520 * Math.sin(a * 0.06)).toFixed(1)}px)` });
    },
  });

  // blueprint 바탕은 장 전환 영상(v05 끝, v06 시작)과 바로 바뀜(cut)으로 이어진다. 영상이 기준이다(엔진 4차, 2026-11-16).
  //  - 모눈: CSS linear-gradient 1px 선 대신 120px 칸 그림(캔버스, 1배)을 반복한다. gradient 선은 화소 가운데에서만 색을 정해서
  //    화면 배율이 1보다 작으면(검수 스틸 0.5배, 1280×800 프로젝터 0.67배) 선이 빠지거나 끊겼다(0.5배 스틸에서 밝기 폭 12 대 영상 22).
  //    1배 그림은 영상처럼 축소·확대 때 걸러져 어느 배율에서나 영상과 같은 세기로 보인다.
  //  - 색: 크롬은 영상을 같은 장면의 슬라이드보다 조금 밝게 그린다(같은 화면을 ffmpeg로 풀면 슬라이드와 같다. 색 태그를 바꿔도 같음).
  //    영상 끝·첫 프레임과 슬라이드를 같은 크기로 겹쳐 맞춘 채널별 식 BP_TONE으로 바탕 색을 옮기고, 선 불투명도를 1.09배로 올렸다
  //    (0.085 → 0.093, 0.04 → 0.044). 측정과 수치는 _workspace/03_engine_api.md 「4차」
  const BP_TONE = c => [1.112 * c[0] - 1.03, 1.075 * c[1] + 0.70, 1.046 * c[2] + 1.56];
  const rgbf = (c, a = 1) => `rgba(${c.map(v => clamp(v, 0, 255).toFixed(2)).join(',')},${a})`;
  function bpTile(ac) {
    const c = document.createElement('canvas'); c.width = 120; c.height = 120;
    const g = c.getContext('2d');
    // 이전 CSS와 같은 순서로 겹친다(아래부터 24px 세로·가로, 120px 세로·가로). 선은 칸의 맨 위 줄·맨 왼쪽 열
    const lines = (a, step) => {
      g.fillStyle = rgb(ac, a);
      for (let k = 0; k < 120; k += step) g.fillRect(k, 0, 1, 120);
      for (let k = 0; k < 120; k += step) g.fillRect(0, k, 120, 1);
    };
    lines(0.044, 24); lines(0.093, 120);
    return c.toDataURL();
  }
  DECK.bg('blueprint', {
    setup(el) {
      const b0 = DECK.color('bg0'), b1 = DECK.color('bg1'), ac = DECK.color('accent');
      const base = mixc(b1, ac, 0.07);
      css(el, { background: `radial-gradient(ellipse 90% 80% at 50% 40%, ${rgbf(BP_TONE(base))} 0%, ${rgbf(BP_TONE(mixc(b0, base, 0.5)))} 70%, ${rgbf(BP_TONE(b0))} 100%)` });
      this.grid = h('div', 'a', el);
      css(this.grid, { left: '-240px', top: '-240px', width: W + 480 + 'px', height: H + 480 + 'px',
        backgroundImage: `url(${bpTile(ac)})`, backgroundSize: '120px 120px' });
      const vg = vignette(el, b0, 0.85, 40);
      css(vg, { background: `radial-gradient(ellipse 78% 72% at 50% 45%, rgba(0,0,0,0) 40%, ${rgbf(BP_TONE(b0), 0.85)} 100%)` });
      addDither(el, 0.4);
    },
    render(a, w, cam) {
      const ox = wrapv(a * 6 + (cam ? cam.x : 0) * 0.12, 120), oy = wrapv(a * 3 + (cam ? cam.y : 0) * 0.12, 120);
      css(this.grid, { transform: `translate(${(-ox).toFixed(1)}px, ${(-oy).toFixed(1)}px)` });
    },
  });

  DECK.bg('field', {
    setup(el) {
      const b0 = DECK.color('bg0'), b1 = DECK.color('bg1');
      css(el, { background: `radial-gradient(ellipse 90% 80% at 50% 45%, ${rgb(mixc(b0, b1, 0.8))} 0%, ${rgb(b0)} 75%)` });
      const c = h('canvas', '', el); c.width = 960; c.height = 540;
      css(c, { position: 'absolute', left: 0, top: 0, width: W + 'px', height: H + 'px' });
      this.g = c.getContext('2d');
      this.ink = DECK.color('ink'); this.ac = DECK.color('accent'); this.ac2 = DECK.color('accent2');
      const N = 1100, pts = new Float32Array(N * 4);
      for (let i = 0; i < N; i++) { pts[i * 4] = rand(i, 11); pts[i * 4 + 1] = rand(i, 12); pts[i * 4 + 2] = 0.12 + 0.88 * Math.pow(rand(i, 13), 1.6); pts[i * 4 + 3] = rand(i, 14); }
      this.N = N; this.pts = pts;
      vignette(el, b0, 0.6, 50);
    },
    render(a, w, cam) {
      const g = this.g, N = this.N, pts = this.pts;
      g.clearRect(0, 0, 960, 540);
      const cx = cam ? cam.x : 0, cy = cam ? cam.y : 0, zoom = cam ? DECK.P / cam.D : 1;
      const SPAN_X = 1160, SPAN_Y = 740;
      for (let i = 0; i < N; i++) {
        const z = pts[i * 4 + 2], kind = pts[i * 4 + 3];
        let x = wrapv(pts[i * 4] * SPAN_X - cx * 0.05 * z - a * 3.5 * z, SPAN_X) - 100;
        let y = wrapv(pts[i * 4 + 1] * SPAN_Y - cy * 0.05 * z - a * 1.2 * z, SPAN_Y) - 100;
        const k = Math.pow(zoom, 0.55 * z);
        x = 480 + (x - 480) * k; y = 270 + (y - 270) * k;
        if (x < -4 || x > 964 || y < -4 || y > 544) continue;
        const sz = (0.5 + 1.9 * z) * Math.sqrt(k), al = (0.1 + 0.6 * z * z) * (0.75 + 0.25 * Math.sin(a * (0.6 + kind) + i));
        const col = kind < 0.07 ? this.ac : kind < 0.1 ? this.ac2 : this.ink;
        g.fillStyle = rgb(col, al.toFixed(3));
        g.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      }
    },
  });

  // ───────────────────────── 부품 ─────────────────────────
  const U = {};

  U.rise = function (parent, html, style, o = {}) {
    const el = h('div', o.cls || 'a', parent, html);
    css(el, style || {});
    const chars = DECK.split(el, o.word ? 'word' : 'char', { mask: true });
    return {
      el, chars,
      render(t, start, opt = {}) {
        const each = opt.each ?? 0.035, dur = opt.dur ?? 0.6, out = opt.out ?? 0;
        chars.forEach((c, i) => {
          const p = prog(t, start + i * each, dur, ease.snap);
          const y = (1 - p) * 120 - out * 120;
          c.style.transform = `translateY(${y.toFixed(1)}%)`;
          c.style.opacity = p > 0 ? '1' : '0';
        });
      },
    };
  };
  U.wipe = function (el, p) { css(el, { clipPath: `inset(-20% ${(100 - 100 * clamp(p)).toFixed(2)}% -20% 0)` }); };
  U.type = function (el, full, p, cursor, a) {
    const n = Math.floor(clamp(p) * [...full].length);
    el.textContent = [...full].slice(0, n).join('') + (cursor ? (Math.floor((a || 0) * 2.2) % 2 ? '▍' : ' ') : '');
  };
  U.sampler = function (path, n = 200) {
    const L = path.getTotalLength(), pts = [];
    for (let i = 0; i <= n; i++) { const q = path.getPointAtLength((L * i) / n); pts.push([q.x, q.y]); }
    return { L, at(p) { p = clamp(p); const f = p * n, i = Math.floor(f), k = f - i, A = pts[i], B = pts[Math.min(n, i + 1)]; return [lerp(A[0], B[0], k), lerp(A[1], B[1], k)]; } };
  };
  // strokeDasharray를 매번 다시 쓴다. 3차까지는 처음 한 번만 써서, 슬라이드가 p ≥ 1 뒤에 점선('7 9' 등)으로 바꾼 경로를
  // 뒤로 탐색하면 점선이 남았다(4차 결정성 검사, c05 stars 전환 중간 4926화소 차이)
  U.draw = function (path, p) {
    if (!path._len) path._len = path.getTotalLength();
    path.style.strokeDasharray = path._len;
    path.style.strokeDashoffset = (path._len * (1 - clamp(p))).toFixed(1);
  };

  U.ICON = {
    doc: 'M6 3h9l5 5v13H6z M15 3v5h5 M9 12h8 M9 16h8',
    folder: 'M3 6h6l2 2h10v11H3z',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    x: 'M6 6l12 12 M18 6L6 18',
    agent: 'M12 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8z M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6',
    skill: 'M4 7h16 M4 12h10 M4 17h13 M18 14l3 3-3 3',
    gear: 'M12 8.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7z M12 2.5v3 M12 18.5v3 M2.5 12h3 M18.5 12h3 M5.3 5.3l2.1 2.1 M16.6 16.6l2.1 2.1 M5.3 18.7l2.1-2.1 M16.6 7.4l2.1-2.1',
    shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
    tool: 'M14.5 4.5a4 4 0 0 0-5 5L4 15l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z',
    eye: 'M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z M12 9a3 3 0 1 1 0 6a3 3 0 1 1 0-6z',
    db: 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
    lock: 'M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    flag: 'M5 21V4 M5 4h11l-2 4 2 4H5',
    search: 'M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13z M15.5 15.5L20 20',
    chat: 'M4 5h16v11H9l-5 4z',
    code: 'M8 7l-5 5 5 5 M16 7l5 5-5 5 M13.5 5l-3 14',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
    clock: 'M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z M12 7v5l3.5 2',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
    list: 'M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01',
    pen: 'M4 20l4-1 11-11-3-3L5 16z M14 6l3 3',
    image: 'M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6 M15.5 8.5a1.5 1.5 0 1 1 0 .1',
    game: 'M6 9h12a4 4 0 0 1 3.9 4.9l-.7 3a2.5 2.5 0 0 1-4.3 1.1L15 16H9l-1.9 2a2.5 2.5 0 0 1-4.3-1.1l-.7-3A4 4 0 0 1 6 9z M8 11.5v3 M6.5 13h3 M15.5 12.5h.01 M17.5 14h.01',
    film: 'M3 5h18v14H3z M7 5v14 M17 5v14 M3 9h4 M3 15h4 M17 9h4 M17 15h4',
    book: 'M4 5c3-1.5 5.5-1.5 8 0v15c-2.5-1.5-5-1.5-8 0z M12 5c2.5-1.5 5-1.5 8 0v15c-3-1.5-5.5-1.5-8 0z',
    users: 'M9 5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7z M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5 M16 5.5a3 3 0 0 1 0 6 M18 14.5c1.9.6 3.1 2.5 3.5 5.5',
    building: 'M4 21V5l8-2v18 M12 8h8v13 M7 8h2 M7 12h2 M7 16h2 M15 12h2 M15 16h2 M2 21h20',
    video: 'M3 6h13v12H3z M16 10l5-3v10l-5-3',
    camera: 'M4 7h4l2-2h4l2 2h4v12H4z M12 10a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7z',
    layers: 'M12 3l9 5-9 5-9-5z M3 13l9 5 9-5 M3 17.5l9 5 9-5',
    target: 'M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z M12 7.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 1 1 0-9z M12 11.2a.8.8 0 1 1 0 1.6a.8.8 0 1 1 0-1.6z',
    arrow: 'M4 12h15 M13 6l6 6-6 6',
    chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-8',
    team: 'M7 7a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z M17 7a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z M12 4a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z M2.5 19c.6-3 2.4-4.5 4.5-4.5 M21.5 19c-.6-3-2.4-4.5-4.5-4.5 M7 20c.7-3.6 2.6-5.5 5-5.5s4.3 1.9 5 5.5',
  };
  U.icon = function (parent, name, size = 32, color = 'currentColor', sw = 1.8) {
    const sv = s('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
    s('path', { d: U.ICON[name] || U.ICON.doc }, sv);
    return sv;
  };

  // 화면 왼쪽 위 장 표시(번호 + 이름)
  U.tag = function (parent, num, name, o = {}) {
    const color = o.color || 'var(--accent)', ink = o.light ? 'var(--paperInk)' : 'var(--ink)';
    const el = h('div', 'a nw', parent, `<span style="font:700 28px var(--mono);color:${color}">${num}</span><span style="display:inline-block;width:40px;height:2px;background:${color};margin:0 16px;vertical-align:8px;opacity:.75"></span><span style="font:650 28px var(--sans);letter-spacing:.01em;color:${ink}">${name}</span>`);
    css(el, { left: (o.x ?? 160) + 'px', top: (o.y ?? 150) + 'px', opacity: 0 });
    return { el, render(t, start = 0.05) { const p = prog(t, start, 0.6); css(el, { opacity: (p * 0.9).toFixed(3), transform: `translateX(${((1 - p) * -24).toFixed(1)}px)` }); } };
  };
  U.chapter = U.tag;

  U.card = function (parent, { x, y, w = 300, hh = 96, icon, title, sub, light = false, accent = 'var(--accent)' }) {
    const el = h('div', 'a', parent);
    css(el, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', marginLeft: -w / 2 + 'px', marginTop: -hh / 2 + 'px',
      borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 22px',
      background: light ? 'var(--paper2)' : 'var(--card)', border: `1.5px solid ${light ? 'var(--paperLine)' : 'var(--line)'}`,
      boxShadow: light ? '0 14px 30px rgba(0,0,0,.12)' : '0 18px 40px rgba(0,0,0,.35)', color: light ? 'var(--paperInk)' : 'var(--ink)' });
    if (icon) {
      const ic = h('div', '', el);
      css(ic, { width: '54px', height: '54px', borderRadius: '14px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${accent} 18%, transparent)` });
      U.icon(ic, icon, 30, accent, 1.9);
    }
    const tx = h('div', '', el);
    h('div', '', tx, title).style.cssText = 'font:750 30px/1.15 var(--sans);white-space:nowrap';
    if (sub) h('div', '', tx, sub).style.cssText = `font:500 28px/1.3 var(--sans);margin-top:4px;white-space:nowrap;color:${light ? 'var(--paperInk2)' : 'var(--mut)'}`;
    return el;
  };

  U.pop = function (el, t, start, dur = 0.5, from = 0.6) {
    const p = prog(t, start, dur, ease.pop), o = prog(t, start, dur * 0.4, ease.linear);
    css(el, { opacity: o.toFixed(3), transform: `scale(${lerp(from, 1, p).toFixed(4)})` });
    return o;
  };

  U.canvas = function (parent, w = W, hh = H) {
    const c = h('canvas', '', parent); c.width = w; c.height = hh;
    css(c, { position: 'absolute', left: 0, top: 0, width: w + 'px', height: hh + 'px' });
    return c.getContext('2d');
  };

  // x.cam(머묾 움직임 오프셋)으로 만든 층 이동
  U.depth = function (x, k = 1) {
    const c = (x && x.cam) || { dx: 0, dy: 0, dz: 0 };
    const sc = Math.pow(DECK.P / Math.max(100, DECK.P + c.dz), k);
    return `translate(${(-c.dx * k).toFixed(2)}px, ${(-c.dy * k).toFixed(2)}px) scale(${sc.toFixed(5)})`;
  };
  // 머묾 카메라(drift·parallax·dolly-in·track·cameraHook)를 이 층에서만 모두 지운다(이동·회전 x.cam.rz·확대). 4차에서 더함.
  // 영상 끝 프레임과 같은 자리에 있어야 하는 층(영상 다음 슬라이드의 첫 화면)에 쓴다. U.depth(x, -1)은 이동만 지우고 회전(±0.25°)은 남는다.
  // 층의 transform-origin이 슬라이드 가운데(960px 540px)여야 한다: 1920×1080 전체 층(left 0, top 0)이면 기본값 그대로 되고,
  // 다른 크기·자리면 transformOrigin을 `${960 - left}px ${540 - top}px`로 준다
  U.pin = function (x) {
    const c = (x && x.cam) || { dx: 0, dy: 0, dz: 0, rz: 0 };
    const k = DECK.P / Math.max(50, DECK.P + (c.dz || 0));
    return `translate(${(c.dx || 0).toFixed(2)}px, ${(c.dy || 0).toFixed(2)}px) rotate(${(c.rz || 0).toFixed(4)}deg) scale(${(1 / k).toFixed(5)})`;
  };

  // 장 표지: 오른쪽 큰 번호의 외곽선이 그려지고, 위 줄(kicker) → 제목(음절 솟음) → 선 → 부제 순서로 나온다
  U.cover = function (el, o = {}) {
    const light = !!o.light;
    const C = light
      ? { text: 'var(--paperInk)', sub: 'var(--paperInk2)', acc: 'var(--accent)', stroke: DECK.rgba('paperInk', 0.45), fill: DECK.rgba('paperInk', 0.05) }
      : { text: 'var(--ink)', sub: 'var(--mut)', acc: 'var(--accent)', stroke: DECK.rgba('accent', 0.75), fill: DECK.rgba('accent', 0.07) };
    const num = o.num != null ? String(o.num).padStart(2, '0') : '';
    const $ = {};
    $.back = h('div', 'full', el);
    $.svg = s('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, $.back); css($.svg, { position: 'absolute', left: 0, top: 0 });
    // 번호 글자 상자(Anton은 위 1.17em·아래 0.33em)가 안전 영역(y 96~1000)에 들도록 크기 600, 기준선 800
    $.num = s('text', { x: 1800, y: 800, 'text-anchor': 'end', fill: 'none', stroke: C.stroke, 'stroke-width': 2.4, 'font-family': 'Anton', 'font-size': 600, 'letter-spacing': -6 }, $.svg);
    $.num.textContent = num;
    $.numFill = s('text', { x: 1800, y: 800, 'text-anchor': 'end', fill: C.fill, 'font-family': 'Anton', 'font-size': 600, 'letter-spacing': -6 }, $.svg);
    $.numFill.textContent = num;
    const TY = o.titleY ?? 420;
    $.kick = h('div', 'a nw', el, o.kicker || '');
    css($.kick, { left: '140px', top: `${TY - 74}px`, font: '700 36px var(--sans)', color: C.acc });
    $.title = U.rise(el, o.title || '', { left: '134px', top: `${TY}px`, font: '900 124px/1.12 var(--display)', letterSpacing: '-.035em', color: C.text, whiteSpace: 'nowrap' });
    const w0 = $.title.el.offsetWidth;
    if (w0 > 1560) $.title.el.style.fontSize = Math.floor((124 * 1560) / w0) + 'px';
    $.line = h('div', 'a', el); css($.line, { left: '140px', top: `${TY + 168}px`, width: '150px', height: '5px', background: C.acc, transformOrigin: '0 50%' });
    $.sub = h('div', 'a nw', el, o.sub || '');
    css($.sub, { left: '140px', top: `${TY + 196}px`, font: '600 44px var(--sans)', color: C.sub });
    return {
      $,
      render(t, x) {
        const go = x ? Math.max(0, x.arrive ?? 1) : 1;
        const kp = prog(t, 0.05, 0.5); show($.kick, kp); $.kick.style.transform = `translateY(${((1 - kp) * 18).toFixed(1)}px)`;
        $.title.render(t, 0.15, { each: 0.04, dur: 0.6 });
        css($.line, { transform: `scaleX(${prog(t, 0.55, 0.7, ease.outExpo).toFixed(4)})` });
        const sp = prog(t, 0.7, 0.6); show($.sub, sp); $.sub.style.transform = `translateY(${((1 - sp) * 24).toFixed(1)}px)`;
        if (!$.L) { try { $.L = $.num.getComputedTextLength() * 4.2 || 6000; } catch (e) { $.L = 6000; } }
        const dp = prog(t, 0.0, 1.8, ease.inOutCubic) * go;
        $.num.style.strokeDasharray = `${($.L * dp).toFixed(0)} ${$.L.toFixed(0)}`;
        $.num.style.strokeDashoffset = (-(x ? x.a : 0) * 50).toFixed(1);
        $.numFill.style.opacity = prog(t, 1.4, 0.9, ease.linear).toFixed(3);
        $.back.style.transform = x ? U.depth(x, -0.6) + ` translate(${(-(x.a) * 2.5).toFixed(1)}px, 0px)` : 'none';
      },
    };
  };
  U.coverSlide = function (def) {
    const o = { num: def.num, kicker: def.kicker, title: def.cover_title || def.title, sub: def.sub, light: def.light };
    return DECK.slide(Object.assign({ holds: [], dur: 2.4 }, def, {
      setup(el) { this.$.cv = U.cover(el, o); if (def.setup2) def.setup2.call(this, el); },
      render(t, x) { this.$.cv.render(t, x); if (def.render2) def.render2.call(this, t, x); },
    }));
  };

  // 출처 표기(기본 왼쪽 아래, 24px)
  U.source = function (parent, text, o = {}) {
    const el = h('div', 'a nw', parent);
    el.textContent = (o.prefix ?? '출처: ') + text;
    css(el, { top: (o.y ?? 940) + 'px', font: `500 ${o.size ?? 24}px/1.3 var(--sans)`, color: o.light ? 'var(--paperInk2)' : 'var(--mut)', opacity: 0 });
    if (o.right) el.style.right = (o.x ?? 160) + 'px'; else el.style.left = (o.x ?? 160) + 'px';
    return { el, render(t, start = 0.4) { const p = prog(t, start, 0.5); css(el, { opacity: (p * 0.92).toFixed(3), transform: `translateY(${((1 - p) * 10).toFixed(1)}px)` }); } };
  };

  // "예시" 표기(기본 오른쪽 위)
  U.example = function (parent, o = {}) {
    const el = h('div', 'a nw', parent, o.text || '예시');
    const c = o.color || 'var(--accent2)';
    css(el, { right: (o.x ?? 160) + 'px', top: (o.y ?? 150) + 'px', font: '800 28px/1 var(--sans)', color: c, padding: '10px 22px', borderRadius: '999px',
      border: `2px solid ${c}`, background: o.light ? 'rgba(255,255,255,.4)' : 'color-mix(in srgb, var(--bg0) 50%, transparent)', opacity: 0 });
    return { el, render(t, start = 0.2) { const p = prog(t, start, 0.45, ease.pop); css(el, { opacity: prog(t, start, 0.2, ease.linear).toFixed(3), transform: `scale(${lerp(0.7, 1, p).toFixed(4)})` }); } };
  };

  // 큰 숫자 카운터. x·y는 글자 기준선 왼쪽(align 'right'면 오른쪽, 'center'면 가운데)
  U.counter = function (parent, o = {}) {
    const el = h('div', 'a nw tnum', parent);
    const size = o.size ?? 280;
    css(el, { top: (o.y - size) + 'px', height: size * 1.05 + 'px', font: `400 ${size}px/1 ${o.font || 'var(--num)'}`, color: o.color || 'var(--ink)', letterSpacing: '-.01em', opacity: 0 });
    if (o.align === 'right') { el.style.right = (W - o.x) + 'px'; el.style.transformOrigin = '100% 100%'; }
    else if (o.align === 'center') { el.style.left = '0px'; el.style.width = W + 'px'; el.style.textAlign = 'center'; el.style.transformOrigin = `${o.x}px 100%`; if (o.x !== 960) el.style.left = (o.x - 960) + 'px'; }
    else { el.style.left = o.x + 'px'; el.style.transformOrigin = '0 100%'; }
    // inline-block + line-height 1: 글자 상자를 글자 크기만큼으로 줄여 아래 줄과 겹쳐 재지지 않게 한다
    const num = h('span', '', el), suf = o.suffix ? h('span', '', el, o.suffix) : null;
    css(num, { display: 'inline-block', lineHeight: '1' });
    if (suf) css(suf, { display: 'inline-block', lineHeight: '1', fontSize: '0.42em', marginLeft: '0.08em', color: o.suffixColor || 'var(--accent)' });
    return {
      el,
      render(t, start = 0, dur = 1.4, e = ease.outExpo) {
        const p = prog(t, start, dur, e);
        num.textContent = (o.prefix || '') + DECK.count(p, o.to ?? 0, { decimals: o.decimals ?? 0, from: o.from ?? 0, comma: o.comma ?? true });
        const ap = prog(t, start, 0.5, ease.pop);
        css(el, { opacity: prog(t, start, 0.2, ease.linear).toFixed(3), transform: `translateY(${((1 - ap) * 40).toFixed(1)}px) scale(${lerp(0.88, 1, ap).toFixed(4)})` });
        return p;
      },
    };
  };

  // 이미지. 파일이 deck/files.json에 없으면 요청하지 않고 같은 크기의 자리 표시를 그린다
  U.image = function (parent, src, o = {}) {
    const box = h('div', 'a', parent);
    const w = o.w ?? 800, hh = o.h ?? 450;
    css(box, { left: (o.x ?? 0) + 'px', top: (o.y ?? 0) + 'px', width: w + 'px', height: hh + 'px', borderRadius: (o.radius ?? 18) + 'px', overflow: 'hidden',
      background: o.light ? 'var(--paper2)' : 'var(--bg1)' });
    const im = DECK.img(src);
    const placeholder = () => {
      const line = o.light ? 'var(--paperLine)' : 'var(--line)';
      css(box, { border: `2px dashed ${line}`, backgroundImage: `repeating-linear-gradient(135deg, ${line} 0 2px, transparent 2px 26px)` });
      const lab = h('div', 'a', box);
      css(lab, { left: '0', right: '0', top: '50%', transform: 'translateY(-50%)', textAlign: 'center', color: o.light ? 'var(--paperInk2)' : 'var(--mut)', padding: '0 24px' });
      const ic = h('div', '', lab); U.icon(ic, 'image', 56, 'currentColor', 1.6);
      h('div', '', lab, o.label || String(src).split('/').pop()).style.cssText = 'font:700 28px/1.3 var(--sans);margin-top:10px;word-break:break-all';
      h('div', '', lab, `${w}×${hh} 자리 표시`).style.cssText = 'font:500 24px var(--sans);margin-top:6px';
    };
    if (im.missing) placeholder();
    else {
      css(im, { width: '100%', height: '100%', objectFit: o.fit || 'cover', display: 'block' });
      box.appendChild(im);
      im.addEventListener('error', () => { im.remove(); placeholder(); }, { once: true });
    }
    return { el: box, img: im, missing: !!im.missing };
  };

  // ───────────────────────── 콘셉트 반복 요소: 형광 노랑 밑줄 · 파일 트리 ─────────────────────────
  // 글자 기준선 위치(요소 위 끝에서 px). 높이 0인 inline-block을 기준선에 놓고 offsetTop을 잰다(변환과 무관한 배치 좌표)
  function baselineOf(el) {
    const pr = document.createElement('span');
    pr.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.insertBefore(pr, el.firstChild);
    const y = pr.offsetParent === el ? pr.offsetTop : pr.offsetTop - el.offsetTop;
    pr.remove();
    return y;
  }
  // el 안에서 처음 나오는 낱말을 <span>으로 감싼다. 한 글자 노드 안에 있으면 쪼개고, U.rise처럼 글자마다 나뉘어 있으면 이어진 자식들을 감싼다
  function wrapWord(el, word) {
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const i = n.data.indexOf(word);
      if (i < 0) continue;
      const mid = n.splitText(i); mid.splitText(word.length);
      const sp = document.createElement('span'); mid.parentNode.insertBefore(sp, mid); sp.appendChild(mid);
      return sp;
    }
    const kids = [...el.childNodes], txt = kids.map(k => k.textContent);
    const all = txt.join(''), at = all.indexOf(word);
    if (at < 0) { console.warn('[U.mark] 낱말을 찾지 못함:', word); return null; }
    let pos = 0, a = -1, b = -1;
    kids.forEach((k, j) => { const L = txt[j].length; if (a < 0 && pos + L > at) a = j; if (pos < at + word.length) b = j; pos += L; });
    const sp = document.createElement('span'); el.insertBefore(sp, kids[a]);
    for (let j = a; j <= b; j++) sp.appendChild(kids[j]);
    return sp;
  }
  // 형광 노랑 밑줄. 핵심 낱말은 굵게 하지 않고 이것으로 강조한다.
  //   두께 = 글자 크기 × 0.3(46px 글자에서 14px), 막대 아래 끝 = 기준선 + 0.08em → 막대가 글자 아래쪽 약 30%와 겹친다. 좌우로 0.08em 더 나온다.
  //   왼쪽에서 오른쪽으로 긋는다(set(p), render(t, start, dur)). 한 줄 안의 낱말에 쓴다
  //   밝은 글자(어두운 바탕)는 막대와 겹친 글자 아래쪽이 막대 색에 묻히므로, 겹친 부분만 어두운 색(o.under, 기본 var(--bg0))으로 그린다.
  //   이때 글자는 배경 세 겹으로 그린다(위부터: 막대 안 글자 · 글자(currentColor) · 막대, 앞 두 겹은 background-clip: text).
  //   글자색은 color로 계속 바꿀 수 있다. U.rise 결과(글자마다 변환이 걸림)는 막대만 그린다(o.under: false와 같음)
  U.mark = function (target, o = {}) {
    const isRise = !!(target && target.el && target.chars);
    let el = isRise ? target.el : target;                                  // U.rise 결과도 받는다
    if (o.word) el = wrapWord(el, o.word) || el;
    if (getComputedStyle(el).display !== 'inline') {                        // 블록이면 안쪽 글자를 inline span으로 감싼다
      const sp = document.createElement('span');
      while (el.firstChild) sp.appendChild(el.firstChild);
      el.appendChild(sp); el = sp;
    }
    el.classList.add('mk');
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 40;
    // 기본(2026-11-15 변경): 막대를 글자 아래에 두고 글자와 겹치지 않게 한다.
    //   한글은 아래 가로획(ㅡ·ㄹ·ㅌ)이 많아, 막대가 글자 아래쪽과 겹치면 낱말이 읽히지 않았다(3번 제목, 10번 문장에서 확인).
    //   한글 글자 아래 끝은 기준선과 거의 같으므로 막대 위 끝 = 기준선 + 0.03em, 두께 = 0.1em(96px에서 10px, 46px에서 5px).
    //   막대 아래 끝은 기준선 + 0.13em으로, 이전 값(기준선 + 0.08em)보다 0.05em만 내려간다.
    //   이전 방식(글자 아래쪽 30%와 겹치고 겹친 부분을 어둡게 칠함)은 o.overlap: true로 쓸 수 있다.
    const overlap = !!o.overlap;
    const T = o.thick ?? (overlap ? Math.max(4, Math.round(fs * 0.3)) : Math.max(3, Math.round(fs * 0.1)));
    const y = overlap ? Math.round(baselineOf(el) + fs * 0.08 - T) : Math.round(baselineOf(el) + fs * 0.03);
    const col = o.color || 'var(--mark)';
    const m = (cs.color.match(/[\d.]+/g) || [0, 0, 0]).map(Number);
    const lightText = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 > 0.5;
    const under = !overlap || o.under === false || isRise || (o.under == null && !lightText) ? null : (o.under || 'var(--bg0)');
    if (under) {
      css(el, { backgroundImage: `linear-gradient(${under}, ${under}), linear-gradient(currentColor, currentColor), linear-gradient(${col}, ${col})`,
        backgroundPosition: `0 ${y}px, 0 0, 0 ${y}px`, webkitBackgroundClip: 'text, text, padding-box', backgroundClip: 'text, text, padding-box', webkitTextFillColor: 'transparent' });
    } else css(el, { backgroundImage: `linear-gradient(${col}, ${col})`, backgroundPosition: `0 ${y}px` });
    let last = -1;
    const set = p => {
      const v = Math.round(clamp(p) * 1000) / 10;
      if (v !== last) { last = v; el.style.backgroundSize = under ? `${v}% ${T}px, 100% 100%, ${v}% ${T}px` : `${v}% ${T}px`; }
      return v / 100;
    };
    set(0);
    return { el, thick: T, y, under, set, render(t, start = 0, dur = 0.5, e = ease.outCubic) { return set(prog(t, start, dur, e)); } };
  };

  // 파일 트리: 비밀노트/ 아래 파일 일곱 줄. 장 표지·정리·제목·목차·마지막 슬라이드에서 같은 모양으로 쓴다(영상 첫·끝 프레임과 맞춤).
  // 파일 이름은 스토리보드 chapters[].x_path(비밀노트/*.md, README 제외)에서 읽고, 일곱 개가 아니면 U.TREE_FILES
  U.TREE_FILES = ['환경.md', '요청서.md', '구성.md', '팀.md', '자동구성.md', '사례.md', '사람.md'];
  U.TREE_PRESETS = {
    title: { x: 160, y: 336, size: 30 },   // 제목(3번) 왼쪽
    side: { x: 160, y: 308, size: 34 },    // 장 표지·정리(25·26·37·51·65·77·90·91)
    full: { x: 240, y: 240, size: 44 },    // 목차(11)·마지막 트리(100)
    corner: { x: 160, y: 568, size: 26 },  // 질문(102) 왼쪽 아래
  };
  function treeFiles() {
    const chs = (DECK.storyboard && DECK.storyboard.chapters) || [];
    const f = chs.map(c => String(c.x_path || '')).filter(p => /^비밀노트\/.+\.md$/.test(p) && !/README\.md$/i.test(p)).map(p => p.split('/').pop());
    return f.length === U.TREE_FILES.length ? f : U.TREE_FILES.slice();
  }
  // 줄 번호(1~7) · 파일 이름('요청서.md') · 경로('비밀노트/요청서.md') · 장 id('c02') → 줄 번호(없으면 0)
  function treeRow(v, files) {
    if (v == null || v === false) return 0;
    if (typeof v === 'number') return v;
    const str = String(v);
    let k = files.indexOf(str) + 1;
    if (!k) k = files.findIndex(f => str.endsWith('/' + f)) + 1;
    if (!k) { const ch = ((DECK.storyboard && DECK.storyboard.chapters) || []).find(c => c.id === str); if (ch && ch.x_path) k = files.indexOf(String(ch.x_path).split('/').pop()) + 1; }
    return k;
  }
  U.fileTree = function (parent, o = {}) {
    const P0 = U.TREE_PRESETS[o.preset] || U.TREE_PRESETS.side;
    const x = o.x ?? P0.x, y = o.y ?? P0.y, sz = o.size ?? P0.size;
    const files = o.files || treeFiles(), N = files.length;
    const R = Math.round(sz * 1.7), lw = Math.max(2, Math.round(sz / 16));
    const vx = Math.round(sz * 0.35), tx = Math.round(sz * 1.15), kx = Math.round(sz * 1.4), kz = Math.round(sz * 0.86), nx = Math.round(sz * 2.5);
    const light = !!o.light;
    const cur = treeRow(o.current, files), done = clamp(Math.round(o.done ?? 0), 0, N);
    const marks = (o.marks ?? (cur ? [cur] : [])).map(v => treeRow(v, files)).filter(v => v >= 1 && v <= N);
    const C = light ? { ink: 'var(--paperInk)', off: 'var(--paperInk2)', ok: 'var(--okInk)' } : { ink: 'var(--ink)', off: 'var(--mut)', ok: 'var(--ok)' };
    const dimOn = o.dim ?? (cur > 0 || done > 0);
    const el = h('div', 'ftree' + (light ? ' light' : ''), parent);
    css(el, { left: x + 'px', top: y + 'px', height: R * (N + 1) + 'px' });
    const letters = (host, text) => [...text].map(ch => { const c = h('span', '', host); c.textContent = ch; return c; });
    const head = h('div', 'fr fh', el);
    css(head, { top: '0px', height: R + 'px', font: `700 ${sz}px/${R}px var(--mono)`, color: C.ink });
    const headCh = letters(head, o.header ?? '비밀노트/');
    const v0 = Math.round(R * 0.8), v1 = R * N + Math.round(R / 2);
    const vline = h('div', 'fl', el);
    css(vline, { left: vx - lw / 2 + 'px', top: v0 + 'px', width: lw + 'px', height: v1 - v0 + 'px' });
    const rows = files.map((name, i) => {
      const k = i + 1, on = !dimOn || k <= done || k === cur;
      const row = h('div', 'fr', el);
      css(row, { top: k * R + 'px', height: R + 'px', width: '1px' });
      const tick = h('div', 'fl', row);
      css(tick, { left: vx - lw / 2 + 'px', top: Math.round(R / 2 - lw / 2) + 'px', width: tx - vx + lw / 2 + 'px', height: lw + 'px', transformOrigin: '0 50%' });
      const ck = s('svg', { width: kz, height: kz, viewBox: '0 0 24 24', fill: 'none', class: 'fk' }, row);
      css(ck, { left: kx + 'px', top: Math.round((R - kz) / 2) + 'px', transformOrigin: '50% 50%' });
      const cp = s('path', { d: U.ICON.check, stroke: C.ok, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 }, ck);
      const nm = h('div', 'fn', row);
      css(nm, { left: nx + 'px', top: '0px', height: R + 'px', font: `500 ${sz}px/${R}px var(--mono)`, color: on ? C.ink : C.off });
      const chars = letters(nm, name);
      const mk = marks.includes(k) ? U.mark(nm, { light }) : null;
      return { k, name, el: row, tick, check: ck, checkPath: cp, nameEl: nm, chars, mark: mk, on, done: k <= done };
    });
    const width = Math.max(...rows.map(r => nx + r.nameEl.offsetWidth), head.offsetWidth);
    const A0 = { at: o.at ?? null, each: o.each ?? 0.12, type: o.type ?? true, markAt: o.markAt, markEach: o.markEach ?? 0.15, markDur: o.markDur ?? 0.45, checkAt: o.checkAt, checkFrom: o.checkFrom ?? done, checkEach: o.checkEach ?? 0.15 };
    const typeIn = (chs, t, t0) => {                       // 타자: 글자 수만큼 차례로 보인다(at이 없으면 다 보임)
      const n = t0 == null ? chs.length : Math.floor(prog(t, t0, Math.min(0.4, chs.length * 0.055), ease.linear) * chs.length + 1e-6);
      chs.forEach((c, j) => { const v = j < n ? '' : 'hidden'; if (c.style.visibility !== v) c.style.visibility = v; });
    };
    return {
      el, head, rows, R, size: sz, width, height: R * (N + 1), current: cur, done,
      // render(t, 바꿀 시각 값): at(줄이 찍히기 시작) each(줄 간격) markAt checkAt checkFrom … 생성할 때 준 값을 덮어쓴다
      render(t, a) {
        const A = a ? Object.assign({}, A0, a) : A0;
        const at = A.at, rowsEnd = at == null ? null : at + N * A.each + 0.2;
        const markAt = A.markAt !== undefined ? A.markAt : rowsEnd == null ? null : rowsEnd + 0.1;
        const checkAt = A.checkAt !== undefined ? A.checkAt : markAt == null ? null : markAt + 0.3;
        const rt = i => (at == null ? null : at + i * A.each);
        if (A.type) typeIn(headCh, t, rt(0)); else show(head, at == null ? 1 : prog(t, rt(0), 0.3));
        vline.style.transform = at == null ? '' : `scaleY(${prog(t, at + A.each, N * A.each, ease.linear).toFixed(4)})`;
        let mj = 0;
        for (const r of rows) {
          const t0 = rt(r.k), vis = t0 == null ? 1 : prog(t, t0, 0.2, ease.linear);
          show(r.el, vis);
          if (vis <= 0) { if (r.mark) { r.mark.set(0); mj++; } continue; }
          r.tick.style.transform = t0 == null ? '' : `scaleX(${prog(t, t0, 0.25).toFixed(4)})`;
          if (A.type) typeIn(r.chars, t, t0);
          // 확인 표시: checkFrom보다 앞 줄은 줄과 함께 보이고, 그 뒤 줄은 checkAt부터 checkEach 간격으로 그려진다
          let cp = 0;
          if (r.done) cp = checkAt == null || r.k < A.checkFrom ? 1 : prog(t, checkAt + (r.k - A.checkFrom) * A.checkEach, 0.35, ease.outCubic);
          r.checkPath.style.strokeDashoffset = (1 - cp).toFixed(4);
          r.check.style.opacity = cp > 0 ? '1' : '0';
          r.check.style.transform = cp > 0 && cp < 1 ? `scale(${lerp(0.7, 1, ease.pop(cp)).toFixed(4)})` : '';
          if (r.mark) { r.mark.set(markAt == null ? 1 : prog(t, markAt + mj * A.markEach, A.markDur, ease.outCubic)); mj++; }
        }
      },
    };
  };

  U.TAU = TAU;
  window.U = U;
})();
