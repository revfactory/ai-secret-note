/* AI 시대를 위한 수석 엔지니어의 비밀노트 — 카메라 모션 슬라이드 엔진 (deck/engine.js)
 * 출발점: reference/lecture-deck/deck/engine.js. 빌드·발표자 창·render 모드·효과음 처리는 원본 규칙을 따르고,
 * 3D 공간 배치·가상 카메라·영상 슬라이드·개관 화면을 더했다.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 규칙
 *   화면은 시각의 순수 함수다. render(t, x)는 t와 x의 값만으로 화면을 정한다.
 *   Math.random · Date.now · CSS transition/animation · 이전 프레임 값 누적을 쓰지 않는다.
 *   무작위는 DECK.rand(i, salt), 흔들림은 DECK.noise(t, seed). render 모드에서 렌더러가 임의 시각으로 이동하고
 *   여러 워커가 나눠 그리기 때문이다. 카메라 위치도 (지금 슬라이드, 전환 상대, 전환 진행률, 시각)만으로 계산한다.
 *
 * ━━ 슬라이드 등록: DECK.slide(def) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   id          스토리보드 slides[].id와 같게 쓴다. 엔진이 id로 장·배치·전환·노트·seconds를 찾는다
 *   section     장 이름(발표자 창). 없으면 스토리보드 장 제목
 *   title       슬라이드 제목(발표자 창·개관 화면). 없으면 스토리보드 title
 *   bg          배경 층 이름(DECK.bg). 없으면 스토리보드 chapters[].art.bg, 등록되지 않은 이름이면 'plain'
 *   holds       빌드 멈춤 시각(초) 배열. 빌드 수 = holds.length + 1. 등록할 때 정한다(setup에서 바꾸지 않는다)
 *   dur         타임라인 끝(마지막 멈춤) 시각(초)
 *   lead        첫 빌드 전 여유(기본 0.18). t는 -lead에서 시작한다
 *   exit        이 슬라이드에서 나가는 전환 길이를 직접 정할 때만 쓴다(보통 비운다. 비우면 다음 슬라이드 enter의 기본 길이)
 *   ownExit     true면 나가는 동안 x.exit(0→1)로 직접 퇴장을 그린다. 기본은 엔진이 슬라이드를 공간에 그대로 두고 카메라만 옮긴다
 *   notes       발표 노트. 빌드 경계마다 [클릭]. 없으면 스토리보드 notes
 *   camera      선택. { enter, inner, dur }. 없으면 스토리보드 slides[].camera. dur은 들어오는 전환 길이(초).
 *               평면 밀기 모드(기본)에서는 enter가 cut·video일 때만 그 값을 쓰고, 나머지는 flat-push 0.65초다(dur 무시). inner는 그대로 쓴다
 *   camTrack    inner 'track'일 때 빌드마다 카메라가 볼 영역 [[cx, cy, zoom], …](슬라이드 좌표 px, 빌드 수만큼)
 *   zoomTarget  다음 슬라이드가 'zoom-through'로 들어올 때 이 슬라이드에서 파고들 지점 { x, y }(슬라이드 좌표 px).
 *               없으면 다음 슬라이드 스토리보드 camera.target 글의 "x 1340 y 620"을 읽고, 그것도 없으면 { x:960, y:540 }
 *   pose        선택. { x, y, z, rx, ry, rz }(월드 px·도). 배치를 직접 정할 때. 없으면 장 layout으로 계산
 *   plate       false면 전환 중에 그리는 슬라이드 판(옅은 바탕+테두리)을 끈다
 *   chrome      선택. 공통 크롬(아래 "공통 크롬") 설정. false면 이 슬라이드에서 모두 끔.
 *               { path: false | '다른 경로', source: '출처 글' | { text, step, at }, example: true | false | '글', light: true | false }
 *   cameraHook(t, x)  선택. { dx, dy, dz, rx, ry, rz }를 반환하면 머묾 오프셋에 더한다(슬라이드 좌표 px, dz<0이면 다가감, 각도는 도).
 *               rx·ry가 0이 아니면 머묾 상태에서도 3D로 그리므로 글자가 덜 선명해질 수 있다
 *   setup(el)   처음 가까워질 때(지금 슬라이드 앞뒤 두 장 안에 들어올 때) 한 번 부른다. el = 1920×1080 section.
 *               이미지는 여기서 DECK.img로 부른다. 부르는 동안 el은 보이지 않지만 배치는 되어 있어 offsetWidth를 잴 수 있다
 *   render(t, x) 매 프레임. 그리는 대상은 지금 슬라이드, 전환 상대, (3D 전환 중) 앞뒤 한 장뿐이다
 *   el 자체의 transform·opacity·visibility·display·zIndex·willChange는 엔진이 쓴다. 슬라이드는 el 안의 자식만 움직인다
 *   주의: 내부 상태는 this.$ 아래에 둔다. this에 lead·exit·el·index·holds·dur·bg·camera·pose·plate 같은 엔진 필드 이름으로 값을 넣지 않는다.
 *         등록하는 순간 document.currentScript.src를 def.$file로 보관한다(검수 스크립트가 오류를 장 파일과 연결한다)
 *
 * ━━ render(t, x)의 t와 x ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   t           빌드 멈춤 시각에서 멈추는 타임라인 시각. 들어오는 전환의 앞부분 동안 -lead에 머물고,
 *               카메라가 도착하기 0.3초 전에 0이 된다(전환이 짧으면 처음부터 흐른다)
 *   x.a         슬라이드에 들어온(전환 시작) 뒤 흐른 시각. 멈춘 동안에도 흐른다. 배경 흐름·맥동·도는 링에
 *   x.step      지금 빌드 번호(0부터)
 *   x.arrive    이 슬라이드로 들어오는 전환(평면 밀기, 3D 모드에서는 카메라 이동)의 진행률 0→1(도착 뒤 1). 큰 등장은 0.7을 넘은 뒤에.
 *               ← 키로 끝 상태 그대로 돌아올 때는 처음부터 1이다.
 *               전환 중 들어오는 슬라이드는 t가 -lead에 머물러 비어 보이므로, 바탕 도형처럼 미리 보여도 되는 요소는
 *               x.arrive로 먼저 보이게 한다(예: slides/_engine_demo.js 3·7번)
 *   x.exit      다음 슬라이드로 넘어가는 동안 0→1(나가는 슬라이드에서만, 그 밖에는 0). ← 키로 앞 슬라이드에 돌아가는 동안은 0
 *   x.cam       머묾 움직임 오프셋 { dx, dy, dz, rz }(px, dz<0이면 다가감, rz는 화면 회전 도. drift ±0.25°). 층마다 다른 비율을 곱해 시차를 만든다(U.depth 참고).
 *               슬라이드 전체는 scale(P/(P+dz)) rotate(-rz) translate(-dx, -dy)를 받는다. 한 층만 카메라를 모두 지우려면 U.pin(x)(4차에서 rz와 함께 더함)
 *   x.speed     전환 이동 속도 0~1(평면 밀기는 가로 속도 ÷ 9000px/s, e 0.33에서 최대 약 0.94). 이동 중 흐림·늘어짐에. 머묾 상태에서는 0
 *   x.dur, x.holds, x.live(발표 모드면 true), x.g(전역 시각), x.enter, x.inner(이 슬라이드의 카메라 값), x.role('cur'|'from'|'near')
 *
 * ━━ 슬라이드 사이 전환: 평면 밀기(기본, 발표자 지시 2026-11-15) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   슬라이드 사이 전환은 평면 밀기 하나만 쓴다. 3D 카메라 전환(아래 enter 목록)은 ?transitions=3d 또는 <meta name="deck-transitions" content="3d">일 때만.
 *   flat-push 0.65  같은 평면에서 앞 슬라이드가 왼쪽으로 밀려 나가고 다음 슬라이드가 오른쪽에서 들어온다(← 키는 반대 방향).
 *                   위치 곡선 ease.push = bezier(0.45, 0, 0.2, 1)(e 0.5에서 76%, e 0.65에서 91%). 회전·깊이 이동·확대·개관·썸네일 평면 없음.
 *                   슬라이드마다 머묾 카메라(inner drift·dolly-in·parallax·track, cameraHook)는 그대로 두고 그 앞에 가로 이동만 더한다.
 *                   확대된 슬라이드(track·dolly-in 등, 화면 틀 밖으로 40px 넘게 나감)는 밀리는 동안 제 화면 틀로 자른다(clip-path)
 *   배경            같은 배경끼리는 배경 층을 고정하고 내용만 민다. 배경이 다르면(장 경계·종이 ↔ 어두운 바탕: 7→8, 8→9, 25→26, 90→91, 95→96, 96→97)
 *                   두 배경도 제 슬라이드와 같은 판으로 함께 밀려 경계가 슬라이드 경계와 같은 곳에서 움직인다(섞지 않음).
 *                   배경 층에 넘기는 cam은 배치 좌표가 아닌 머묾 오프셋이다(같은 배경끼리 밀 때 격자·입자가 건너뛰지 않게)
 *   크롬            경로 줄은 화면 고정(경로가 바뀌면 지우고 다시 찍기). 출처 줄·예시 표시는 두 슬라이드 글이 같으면 고정, 다르면 제 슬라이드와 함께 밀린다.
 *                   글자색은 그 자리 아래 바탕(왼쪽 x 290, 오른쪽 x 1500 기준)을 따른다
 *   예외(이어짐)    cut은 그대로(1·3·15·83·102번).
 *                   영상 슬라이드로 들어감(2·12·38·52·66·78번): 4차부터 기본 cut. 영상 0프레임이 앞 슬라이드 끝 화면에서 시작하도록 만들었기 때문이다.
 *                   이전의 띠 열기(1.04→1배)는 열리는 동안 같은 글자가 20~25px 어긋나 두 겹으로 보였다. DECK.videoSlide({ open })로 바꾼다(아래 영상 슬라이드).
 *                   cut이면 전환 길이가 0이라 앞 슬라이드는 x.exit를 받지 않는다(x.exit로 그리던 퇴장은 일어나지 않고 끝 화면에서 바로 영상 0프레임).
 *                   영상 슬라이드 바로 다음(3·13·39·53·67·79번)은 cut: 영상 마지막 프레임이 그 슬라이드 첫 화면과 같다
 *   ← 키            그 경계가 flat-push면 앞 슬라이드가 끝 상태 그대로 왼쪽에서 밀려 들어온다(x.arrive 1, 나가는 슬라이드 x.exit 0).
 *                   cut·영상 경계(영상으로 들어가거나 나옴)는 바로 바뀐다. 3D 모드의 ←는 이전처럼 바로 바뀐다
 *   번호+Enter      방향에 맞는 평면 밀기(영상 슬라이드로는 0.6초 동안 영상이 나타남: open 'band'면 띠, 그 밖은 투명도. 영상 슬라이드에서는 바로 바뀜)
 *   개관 화면(O)    두 모드 모두 3D 개관(썸네일 평면)이다. 배치는 스토리보드 camera.enter(slides[].$enterSB)로 계산한다
 *   t 대기          들어오는 슬라이드의 t는 3D 전환과 같은 규칙(도착 0.3초 전에 0): 밀기 0.17초까지 -lead, 0.35초(위치 79%)에 0
 *
 * ━━ 카메라(3D 모드: ?transitions=3d. 머묾 inner는 두 모드 공통) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   enter(들어올 때)  기본 길이(초)와 경로
 *     push 0.9        layout의 다음 칸으로. 두 배치를 보간하며 가운데에서 거리에 비례해 뒤로 물러났다(sin πe) 다가간다
 *     slide-l/-r 0.8  앞 슬라이드의 왼쪽/오른쪽 칸으로 수평 이동. 물러남은 작다
 *     orbit-l/-r 1.1  앞 슬라이드 뒤쪽 축을 중심으로 60° 돈 옆면으로. 두 슬라이드 시선이 만나는 점을 축으로 돈다
 *     rise/drop 0.9   앞 슬라이드 위/아래 칸으로. rx를 7° 기울였다 복귀
 *     zoom-through 1.2 앞 슬라이드의 zoomTarget으로 30배 다가가며 앞 슬라이드가 사라지고, 그 지점에서 이 슬라이드가 커지며 나타남(2D로 그림)
 *     pull-out 2.0    크게 뒤로 물러나(최소 z +8000) 개관 화면(썸네일 평면)을 보여 준 뒤 이 장 구역으로 내려앉음. 장 경계는 두 장이 화면에 들 만큼.
 *                     같은 장 안의 pull-out(예: 100번)은 덱 전체가 들 만큼 물러나고 바라보는 점도 덱 가운데로 옮긴다. 기본 길이 3.0
 *     whip 0.5        빠른 ry 회전(25°)과 수평 이동, 이동 중 흐림
 *     cut 0           바로 바뀜(영상 슬라이드의 기본 open 'cut'도 이것)
 *     video 0.6       영상 층이 열림(덱은 뒤에서 그대로). 영상 슬라이드가 open 'band'·'fade'일 때만
 *   inner(머무는 동안)
 *     drift      x.a 기반 사인 이동(±14px, ±9px, 화면 회전 ±0.25°)
 *     dolly-in   빌드가 진행될수록 다가감(t/dur에 비례, 최대 120px)
 *     parallax   drift의 1.5배 + x.cam으로 층마다 다른 이동을 만들라는 표시
 *     track      camTrack 영역을 빌드 경계에서 0.8초 동안 보간
 *     none       고정
 *   배치: 장 원점 chapters[].world {x,y,z,ry}에서 layout(row·arc·spiral·stack·grid)과 spacing으로 놓는다.
 *     장 첫 슬라이드는 장 원점. push·whip·cut·zoom-through·pull-out(장 안)은 layout의 다음 칸, slide-l/-r·rise/drop·orbit-l/-r는
 *     앞 슬라이드 기준 그 방향 칸. 다른 슬라이드와 1300px 안으로 겹치거나, 카메라와 슬라이드 사이를 가리면(정면 2150px 안) 위·아래·뒤로 비켜 놓는다.
 *     grid는 3열 칸(가로 spacing, 세로 spacing×0.6)에 놓는다: push 계열은 읽는 순서로 다음 칸, slide-r/-l은 같은 줄 옆 칸, drop/rise는 아래/위 줄. 찬 칸은 건너뛴다.
 *     영상 슬라이드는 앞 슬라이드와 같은 자리(장 첫 슬라이드면 다음 슬라이드 자리). 스토리보드를 읽지 못하면 section별로 row에 놓는다.
 *     장 옵션: spacing, radius(arc·spiral), rise(spiral 한 칸 상승). 스토리보드에서는 x_radius, x_rise로 써도 된다.
 *     arc는 radius를 주지 않으면 장 전체가 110° 안에 들도록 반지름을 늘린다(기본 3600 이상)
 *   발표 모드에서 번호로 멀리 이동하거나 뒤로 이동하면 같은 장은 push, 다른 장은 pull-out 경로를 쓴다.
 *   썸네일 평면(<thumbs>/NN.jpg): 3D 전환 중 화면에 들어온 먼 슬라이드(직접 그리지 않는 슬라이드)와, 크게 물러난 pull-out·개관 화면의
 *     모든 슬라이드를 이 평면으로 보인다. 썸네일이 없으면 빈 판(크게 물러났을 때만 번호·제목). 썸네일은 tools/shoot.mjs --thumbs로 만든다.
 *     뒤에서 보이는 평면은 뒤집어 붙이고, 뒤에서 보이는 슬라이드는 그리지 않는다.
 *     평면은 display가 아니라 visibility로 켜고 끈다. display:none에서 한 프레임에 백 개 가까이 켜면 배치·래스터가 몰려
 *     pull-out 첫 프레임이 56~200ms 걸렸다(102장 덱, 헤드리스 측정). visibility로 바꾼 뒤 최대 19ms.
 *   글자 선명도: 크롬은 3D 변환 중인 층을 낮은 해상도로 그리거나 확대된 텍스처로 늘릴 수 있다. 그래서 머묾 상태에서는 #world의 3D 변환을 풀고
 *     지금 슬라이드에 2D 변환(scale·rotate·translate)만 건다. 3D 카메라 행렬은 전환 중에만 쓰고, will-change: transform도 발표 모드 전환 중에만 켠다
 *     (render 모드에서는 켜지 않는다. 켜 두면 래스터 배율이 이전 탐색 이력에 따라 달라져 같은 g의 스틸이 달라질 수 있다).
 *   흐림은 #view(원근 층)에 건다. preserve-3d 요소(#world)에 filter·opacity를 걸면 크롬이 3D 공간을 평면으로 눌러 버리기 때문이다.
 *   배경 바뀜: 보통은 두 배경 층을 섞는다. 어두운 바탕 ↔ 밝은 바탕(paper)은 섞으면 가운데에서 회색이 되므로 섞지 않고, 카메라가 움직이는 쪽에서
 *     새 배경이 밀려 들어온다(mask wipe, 가장자리 22%). pull-out은 가장 멀리 물러난 구간(e 0.3~0.7)에서 바뀐다.
 *     영상이 열리는 동안은 앞 슬라이드 배경을 그대로 두고(영상이 덮은 뒤 바뀜), 영상에서 나올 때는 처음부터 다음 슬라이드 배경이다.
 *
 * ━━ 공통 크롬(엔진이 그림. 장 담당은 따로 만들지 않는다) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   #top 층(화면 고정)에 그린다. drift·dolly-in·track 카메라를 따라 움직이지 않으므로 화면 밖으로 나가거나 크기가 바뀌지 않는다.
 *   경로 줄   chapters[].x_path(예: 비밀노트/요청서.md). x 160, y 100~130, JetBrains Mono 500 22px/30px, 어두운 바탕 mut, 밝은 바탕 paperInk2.
 *             같은 경로끼리 넘기면 그대로 있고, 경로가 바뀌는 전환에서는 공통 앞부분(비밀노트/)까지 지운 뒤 새 파일 이름을 타자로 찍는다(커서 12×24px).
 *             영상 슬라이드에서는 끄고, 영상이 열리면 사라졌다가 영상에서 나오면 다시 나타난다
 *   출처 줄   def.chrome.source. 오른쪽 끝 x 1760(right 160), y 940~970, Pretendard 500 24px/30px, 경로 줄과 같은 색.
 *             { text, step: 이 빌드부터, at: 그 빌드 시작 뒤 초(기본 첫 빌드 0.3, 그 밖 0.2) }. 0.5초에 걸쳐 나타난다
 *   예시 표시 스토리보드 slides[].example이 true이거나 def.chrome.example. 오른쪽 끝 x 1760, y 96~144, Pretendard 800 28px, accent2 테두리 알약
 *   쪽 번호  「지금 번호 / 전체 장 수」. 오른쪽 끝 x 1864(right 56), y 1018~1048, JetBrains Mono 500 22px/30px, 경로 줄과 같은 색.
 *             영상 슬라이드와 def.chrome.num이 false인 슬라이드(대기 화면)에서는 끈다. 화면에 고정되고, 평면 밀기의 가운데(e 0.5)에서 번호가 바뀐다
 *   슬라이드 내용은 왼쪽 위(x 160~620, y 90~140)·오른쪽 위(x 1560~1760, y 90~150)·오른쪽 아래(y 930~980)를 비워 둔다.
 *   U.tag는 경로 줄과 역할이 겹치므로 이 덱에서는 쓰지 않는다. U.source·U.example(슬라이드 안에 그림)보다 chrome.source·example을 쓴다
 *
 * ━━ 자리 표시 슬라이드 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   스토리보드에 있는데 코드로 등록되지 않은 슬라이드는 엔진이 번호·id·유형·카메라·제목·화면 문구·빌드 설명을 카드로 그린다.
 *   빌드 수 = 스토리보드 builds 수(멈춤 1초 간격), 노트·카메라는 스토리보드 값. inner track이면 기본 camTrack(±40px, 1.04배).
 *   다음 슬라이드가 zoom-through면 파고들 지점에 점선 원을 그린다. 영상 슬라이드(type video, video 값)는 DECK.videoSlide와 같은 슬라이드를 만든다.
 *   __meta.slides[].placeholder = true. 덱 순서는 스토리보드 순서다(등록 순서가 다르면 [DECK] 경고 후 스토리보드 순서로 놓는다).
 *   스토리보드에 없는 id로 등록한 슬라이드는 등록 순서상 바로 앞 슬라이드 뒤에 둔다.
 *   방식: ?placeholders= 또는 <meta name="deck-placeholders" content="…">  all(기본) | chapters(불러온 장 파일의 장만) | off.
 *     tools의 --files(_only.html)와 deck_audit --files(_audit_only.html)는 기본이 chapters다(그 장만 검수)
 *
 * ━━ 영상 슬라이드: DECK.videoSlide(o) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   DECK.videoSlide({ id: 'intro-video', video: 'v01_intro', section, title, notes, seconds, camera, bg, open })
 *     src = assets/video/<video>.mp4, poster = assets/video/<video>_poster.jpg(마지막 프레임). src·poster로 경로를 바꿀 수 있다
 *     open        영상으로 들어가는 전환(4차). 'cut'(기본) 바로 영상 0프레임으로 바뀜(길이 0, 앞 슬라이드 x.exit 없음)
 *                 | 'band' 가운데 가로 띠로 열리며 1.04→1배(0.6초, 3차까지의 기본. 앞 슬라이드는 x.exit 0→1을 받음)
 *                 | 'fade' 배율·띠 없이 투명도만 0→1(0.6초, 앞 슬라이드는 x.exit를 받음. 앞 화면이 x.exit로 영상 0프레임까지 바뀌는 경우에)
 *                 __meta.slides[].open에 남는다. 장 파일을 고치지 않고 바꾸려면 페이지에 <meta name="deck-videoopen" content="intro-video:fade, v-parts:fade">
 *                 (또는 ?videoopen=…, 값 하나만 쓰면 open을 주지 않은 모든 영상). 순서: def.open > id 지정 > 전체 값 > 'cut'
 *     빌드 1개. 길이 = 영상 메타데이터 길이. 파일이 없으면 o.seconds → 스토리보드 seconds → videos[].seconds → 10초
 *   발표 모드: 들어오는 키 입력 때 처음부터 소리와 함께 재생, 끝나면 마지막 프레임에 멈춤. 재생 중 다음 키 → 끝 프레임으로 건너뜀, 한 번 더 → 다음 슬라이드.
 *     M은 영상 소리도 끈다. R은 처음부터 다시 재생. 이전 슬라이드에서 뒤로 들어오면 마지막 프레임.
 *   render 모드: __seek(g)가 Promise를 반환해 video.currentTime의 seeked와 그 프레임 표시(requestVideoFrameCallback, 없으면 0.3초)를 기다린다.
 *     메타데이터 전이면 loadedmetadata 뒤에 탐색하고, 3초 안에 seeked가 없으면 한 번 더 탐색한다(4차). 서버는 HTTP Range를 지원해야 한다
 *   발표 모드: 영상 바로 앞 슬라이드에 들어서면 그 영상을 0프레임에 맞춰 둔다(뒤로 나갔다 다시 들어올 때 cut 순간 끝 프레임이 비치지 않게)
 *   파일이 없으면 포스터, 그것도 없으면 "영상 준비 중"과 제목·파일 경로를 보여 준다. 오류를 던지지 않는다.
 *
 * ━━ 배경 층: DECK.bg(name, { light, setup(el), render(a, w, cam) }) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   화면에 고정된 층. a = 전역 시각, w = 보이는 정도(전환 중 두 배경을 섞음), cam = { x, y, z, rx, ry, rz, D, speed }(지금 카메라).
 *   light: true면 밝은 바탕(전환 중 슬라이드 판을 종이색으로 그림). 배경 이름 목록은 deck/common.js 맨 위 주석
 *
 * ━━ 자원·색·스토리보드 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   스토리보드 경로: 기본 storyboard.json. 페이지에 <meta name="deck-storyboard" content="slides/x.json">을 두거나 ?storyboard=…로 바꾼다
 *   썸네일 폴더: 기본 thumbs(파일 thumbs/NN.jpg). <meta name="deck-thumbs" content="thumbs/_demo">로 페이지마다 바꾼다
 *   색: deck/theme.css의 --bg0 --bg1 --ink --mut --accent --accent2 --ok --bad --paper --paperInk. 스토리보드 concept.palette가 있으면
 *     시작할 때 :root 변수를 그 값으로 덮어쓴다. concept.fonts(display·body·serif·mono·number)는 --display --sans --serif --mono --num 서체 이름을 바꾸고,
 *     "Paperlogy 900"처럼 굵기를 적으면 --displayW 같은 굵기 변수(이름 + W)도 넣는다. 파생: --okInk(종이 위 확인 표시), --mark(형광 밑줄 = accent)
 *     서체 파일은 모두 fonts/에 있다(CDN 없음). JetBrains Mono·Anton에는 한글이 없어 한글은 Pretendard로 그린다
 *   DECK.color('accent') → [r, g, b], DECK.rgba('accent', 0.4) → 'rgba(…)'(캔버스용. palette 키 이름만)
 *   자원 목록: deck/files.json(assets/·thumbs/ 파일 목록). tools/*가 실행될 때마다 tools/files.mjs로 다시 만든다.
 *     DECK.has(path) → true/false(목록에 있는지), 목록을 못 읽었으면 null. 없는 파일은 요청하지 않는다(검수 스크립트가 404를 오류로 센다)
 *   DECK.img(src) → Image. 목록에 없으면 요청하지 않고 im.missing = true로 돌려준다(U.image가 자리 표시를 그림). setup 안에서 부른다
 *   DECK.preload(promise) → render 모드 탐색이 이 Promise를 기다린다
 *   DECK.storyboard, DECK.chapters, DECK.poseOf(i), DECK.chapterOf(i), DECK.stage, DECK.top(화면 고정 상단 층), DECK.slides[i].el, DECK.soundOn()
 *   도우미(원본과 같음): ease, bezier, prog, win, kf, spring, clamp, lerp, map, smooth, rand, noise, split, stagger, inout, count, scramble, shake, pulse, css, h, s, set, show
 *
 * ━━ 모드 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   발표 모드(기본): →·Space·PageDown·클릭 다음, ←·PageUp 이전, 숫자+Enter 이동, Home·End, P 발표자 창, O 개관 화면, B·. 화면 끄기,
 *     F 전체 화면, R 다시 재생, M 소리, T 시간 초기화, H·? 도움말. 재생 중 다음 키는 빠르게 감아(4배) 이번 빌드를 끝낸다.
 *     발표자 창: 노트(지금 빌드 강조), 다음 슬라이드와 다음 전환 종류, 시계·경과, 장별 목표 시각(스토리보드 seconds 누적) 대비 앞섬/늦음, 영상 남은 시간
 *   ?render=1: showreel render.mjs 규약. window.__ready, window.__seek(g)(Promise를 반환할 수 있음), window.__meta.
 *     모든 슬라이드를 멈춤(?hold=1.2, 마지막 빌드 ?finalhold=1.6)을 넣어 한 줄 타임라인으로 편다. ?t=초로 시작 화면.
 *     __meta = { duration, fps, width, height, fonts, scenes, thumbs, storyboard, transitions('flat'|'3d'), chapters, placeholders(자리 표시 수),
 *                slides: [{ n, id, title, section, g0, end, holds, notes, builds, chapter, file, enter, enterSB, inner, type, trans, seconds,
 *                           placeholder, light, bg, chrome: { path, source, example }, pose }] }
 *       g0 = 이 슬라이드로 들어오는 전환이 시작되는 전역 시각, trans = 그 전환 길이, holds = 빌드별 멈춤 시작 시각, end = 마지막 멈춤이 끝나는 시각
 *       enter = 실제로 쓰는 전환(평면 밀기 모드: flat-push | cut | video), enterSB = 스토리보드(def.camera) 값, open = 영상 슬라이드의 열림 방식(4차)
 *     window.__seekBack(n, e): n번에서 ←로 n-1번에 돌아가는 전환의 진행률 e 화면(점검용, tools/shoot.mjs --back)
 *   window.__perf = { engine, render, bg, frames }: 마지막 프레임의 엔진 JS 시간, 슬라이드 render 시간, 배경 render 시간(ms). tools/perf.mjs가 읽는다
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
(function () {
  'use strict';
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const map = (x, a, b, c, d, e) => lerp(c, d, (e || (p => p))(clamp((x - a) / (b - a))));
  const smooth = (a, b, x) => { const p = clamp((x - a) / (b - a)); return p * p * (3 - 2 * p); };

  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t;
    const sy = t => ((ay * t + by) * t + cy) * t;
    const dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return p => {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      let t = p;
      for (let i = 0; i < 8; i++) {
        const e = sx(t) - p;
        if (Math.abs(e) < 1e-6) break;
        const d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      return sy(clamp(t));
    };
  }

  const ease = {
    linear: p => p,
    inQuad: p => p * p,
    outQuad: p => 1 - (1 - p) * (1 - p),
    inOutQuad: p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    inCubic: p => p * p * p,
    outCubic: p => 1 - Math.pow(1 - p, 3),
    inOutCubic: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    inQuart: p => p ** 4,
    outQuart: p => 1 - Math.pow(1 - p, 4),
    inOutQuart: p => (p < 0.5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2),
    outQuint: p => 1 - Math.pow(1 - p, 5),
    inExpo: p => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10)),
    outExpo: p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    inOutExpo: p => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2),
    outBack: (p, s = 1.70158) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
    inBack: (p, s = 1.70158) => (s + 1) * p * p * p - s * p * p,
    outElastic: p => (p <= 0 || p >= 1 ? clamp(p) : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
    inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
    snap: bezier(0.16, 1, 0.3, 1),
    swift: bezier(0.83, 0, 0.17, 1),
    push: bezier(0.45, 0, 0.2, 1),       // 평면 밀기: e 0.5에서 76%, e 0.65에서 91%까지 온 뒤 천천히 내려앉는다(최고 속도 2.86배, e 0.33)
    exit: bezier(0.7, 0, 0.84, 0),
    pop: bezier(0.34, 1.56, 0.64, 1),
  };

  const prog = (t, start, dur, e = ease.snap) => e(clamp((t - start) / Math.max(1e-6, dur)));
  const win = (t, a, b, inDur = 0.4, outDur = 0.3, ei = ease.snap, eo = ease.exit) =>
    Math.min(prog(t, a, inDur, ei), 1 - prog(t, b - outDur, outDur, eo));
  function kf(t, frames) {
    if (t <= frames[0][0]) return frames[0][1];
    for (let i = 1; i < frames.length; i++) {
      const [t1, v1, e] = frames[i];
      const [t0, v0] = frames[i - 1];
      if (t <= t1) return lerp(v0, v1, (e || ease.inOutCubic)(clamp((t - t0) / Math.max(1e-6, t1 - t0))));
    }
    return frames[frames.length - 1][1];
  }
  function spring(t, t0 = 0, f = 2.2, z = 0.42) {
    const dt = t - t0;
    if (dt <= 0) return 0;
    const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + ((z * w) / wd) * Math.sin(wd * dt));
  }
  const rand = (i, salt = 0) => {
    const x = Math.sin(i * 12.9898 + salt * 78.233 + 0.1) * 43758.5453;
    return x - Math.floor(x);
  };
  const noise = (t, seed = 0) =>
    Math.sin(t * 1.31 + seed * 12.9) * 0.5 + Math.sin(t * 2.17 + seed * 7.3) * 0.3 + Math.sin(t * 3.73 + seed * 3.1) * 0.2;

  function split(el, mode = 'char', opts = {}) {
    const text = el.textContent;
    el.textContent = '';
    const units = [];
    const add = (str, isSpace) => {
      if (isSpace) { el.appendChild(document.createTextNode(str)); return; }
      let host = el;
      if (opts.mask) {
        host = document.createElement('span');
        host.className = 'mask';
        host.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding:.12em .04em .18em;margin:-.12em -.04em -.18em';
        el.appendChild(host);
      }
      const sp = document.createElement('span');
      sp.className = mode === 'word' ? 'w' : 'ch';
      sp.style.display = 'inline-block';
      sp.style.whiteSpace = 'pre';
      sp.textContent = str;
      host.appendChild(sp);
      units.push(sp);
    };
    if (mode === 'word') {
      for (const part of text.split(/(\s+)/)) if (part) add(part, /^\s+$/.test(part));
    } else {
      const seg = new Intl.Segmenter('ko', { granularity: 'grapheme' });
      for (const { segment } of seg.segment(text)) add(segment, segment === ' ');
    }
    return units;
  }
  const stagger = (t, start, each, dur, i, e = ease.snap) => prog(t, start + i * each, dur, e);

  function inout(el, t, a, b, o = {}) {
    const pi = prog(t, a, o.inDur ?? 0.45, ease.snap);
    const po = b == null ? 0 : prog(t, b - (o.outDur ?? 0.4), o.outDur ?? 0.4, ease.exit);
    const v = Math.min(pi, 1 - po);
    if (v <= 0.001) { if (el.style.opacity !== '0') el.style.opacity = '0'; return 0; }
    const y = (1 - pi) * (o.rise ?? 60) - po * (o.lift ?? 140);
    const x = (1 - pi) * (o.x ?? 0) + po * (o.dx ?? 0);
    const sc = lerp(o.from ?? 1.06, 1, pi) * lerp(1, o.to ?? 0.9, po);
    const bl = (1 - pi) * (o.blur ?? 12) + po * (o.blur ?? 12) * 0.8;
    el.style.opacity = v.toFixed(3);
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(4)})`;
    el.style.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : 'none';
    return v;
  }
  const count = (p, to, { decimals = 0, comma = true, from = 0 } = {}) => {
    const v = lerp(from, to, clamp(p));
    return comma
      ? v.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : v.toFixed(decimals);
  };
  const GLY = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@/<>=+*';
  function scramble(final, p, t, seed = 1) {
    const a = [...final];
    const f = Math.floor(t * 30);
    return a.map((ch, i) => {
      if (ch === ' ' || ch === '\n' || p >= 1 || p >= (i / a.length) * 0.75 + 0.25) return ch;
      const r = rand(i * 977 + f * 131, seed);
      if (/[가-힣]/.test(ch)) return String.fromCharCode(0xac00 + Math.floor(r * 11172));
      return GLY[Math.floor(r * GLY.length)];
    }).join('');
  }
  function shake(t, hits, freq = 75) {
    let x = 0, y = 0, r = 0;
    for (const [t0, amp = 12, d = 0.45] of hits) {
      const dt = t - t0;
      if (dt < 0 || dt > d * 2.5) continue;
      const k = amp * Math.exp(-(dt / d) * 5);
      x += k * Math.sin(dt * freq + t0 * 3);
      y += k * Math.cos(dt * (freq * 0.87) + t0 * 5);
      r += k * 0.03 * Math.sin(dt * freq * 0.7);
    }
    return { x, y, r };
  }
  const pulse = (t, hits, decay = 0.25) => {
    let v = 0;
    for (const hh of hits) { const dt = t - hh; if (dt >= 0) v = Math.max(v, Math.exp(-dt / decay)); }
    return v;
  };
  const css = (el, o) => { for (const k in o) el.style[k] = o[k]; return el; };
  const h = (tag, cls, parent, html) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    if (parent) parent.appendChild(el);
    return el;
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  const s = (tag, attrs, parent) => {
    const el = document.createElementNS(svgNS, tag);
    for (const k in attrs || {}) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const set = (el, prop, v) => { if (el.style[prop] !== v) el.style[prop] = v; };
  const show = (el, v) => { const o = clamp(v); set(el, 'opacity', o.toFixed(3)); set(el, 'visibility', o <= 0.001 ? 'hidden' : 'inherit'); return o; };

  // ───────────────────────── 상수·설정 ─────────────────────────
  const W = 1920, H = 1080, P = 2000;             // P = 원근 거리(px). 카메라가 슬라이드 정면 P 거리에 있으면 슬라이드가 화면을 꽉 채운다
  const ENTER_DUR = { push: 0.9, 'slide-l': 0.8, 'slide-r': 0.8, 'orbit-l': 1.1, 'orbit-r': 1.1, rise: 0.9, drop: 0.9, 'zoom-through': 1.2, 'pull-out': 2.0, whip: 0.5, cut: 0, video: 0.6, 'flat-push': 0.65 };
  const PULL_ALL_DUR = 3.0;                       // 같은 장 안의 pull-out(덱 전체 개관) 기본 길이
  const INNERS = ['drift', 'dolly-in', 'parallax', 'track', 'none'];
  const LAYOUT = {
    row: { spacing: 2400 }, arc: { spacing: 2300, radius: 3600 }, spiral: { spacing: 2200, radius: 2400, rise: 700 },
    stack: { spacing: 2600 }, grid: { spacing: 2400 },
  };
  const VSTEP = 1500, ORBIT_R = 2100, ORBIT_DEG = 60, NEAR = 1300, ARC_SPAN = 110;
  const ARRIVE_LEAD = 0.3;                        // 들어오는 슬라이드의 t가 0이 되는 시점: 카메라 도착 0.3초 전
  const params = new URLSearchParams(location.search);
  const RENDER = params.has('render');
  const HOLD = Number(params.get('hold') || 1.2);
  const FINAL_HOLD = Number(params.get('finalhold') || 1.6);
  const metaContent = name => { const m = document.querySelector(`meta[name="${name}"]`); return m ? m.getAttribute('content') : null; };
  let SB_PATH = 'storyboard.json', THUMBS = 'thumbs';
  // 슬라이드 사이 전환 방식(발표자 지시, 2026-11-15): 기본은 평면 밀기 하나('flat'). ?transitions=3d 또는
  // <meta name="deck-transitions" content="3d">면 스토리보드 camera.enter대로 3D 카메라 전환(이전 동작)
  const TRANS_MODE = String(params.get('transitions') || metaContent('deck-transitions') || 'flat').trim() === '3d' ? '3d' : 'flat';
  const FLAT = TRANS_MODE === 'flat';
  // 영상 슬라이드 열림 방식 기본값 바꾸기(4차): ?videoopen= 또는 <meta name="deck-videoopen" content="…">.
  // 'fade'처럼 하나만 쓰면 open을 주지 않은 모든 영상, 'intro-video:fade, v-parts:fade'처럼 id:값이면 그 영상만. 장 파일의 def.open이 먼저다
  const VOPEN = (() => {
    const o = { all: null, byId: new Map() };
    for (const part of String(params.get('videoopen') || metaContent('deck-videoopen') || '').split(',').map(x => x.trim()).filter(Boolean)) {
      const m = /^([^:]+):\s*(\w+)$/.exec(part);
      if (m) o.byId.set(m[1].trim(), m[2]); else o.all = part;
    }
    return o;
  })();
  const FLAT_DUR = ENTER_DUR['flat-push'];

  // ───────────────────────── 등록 ─────────────────────────
  const slides = [];
  const bgs = {};
  const waits = [];
  let FILES = null, SB = null;
  const SBMAP = new Map();
  let CHAPTERS = [];
  const norm = p => String(p || '').replace(/^\.?\/+/, '').split(/[?#]/)[0];
  function relSrc(src) {
    try {
      const u = new URL(src, location.href), base = new URL('.', location.href);
      return u.href.startsWith(base.href) ? decodeURIComponent(u.href.slice(base.href.length)) : decodeURIComponent(u.pathname);
    } catch (e) { return String(src || ''); }
  }
  const has = p => (FILES ? FILES.has(norm(p)) : null);

  function img(src) {
    const im = new Image();
    im.decoding = 'sync';
    if (has(src) === false) {
      im.missing = true; im.dataset.missing = norm(src);
      console.warn('[DECK] 자원 없음(요청하지 않고 자리 표시로 둠):', src);
      return im;
    }
    const p = new Promise(res => {
      im.onload = () => im.decode().catch(() => null).then(() => res(im));
      im.onerror = () => { im.missing = true; console.error('[DECK] 이미지 로드 실패:', src); res(im); };
    });
    im.src = src;
    waits.push(p);
    return im;
  }

  const stops = sl => [...(sl.holds || []), sl.dur];

  function prep(def, file) {
    def.$title = def.title; def.$notes = def.notes; def.$section = def.section;
    def.$file = file;
    def.$ = def.$ || {};
    return def;
  }
  function slide(def) {
    const cs = document.currentScript;
    prep(def, cs && cs.src ? relSrc(cs.src) : null);
    slides.push(def);
    return def;
  }

  // ───────────────────────── 색 ─────────────────────────
  const PALETTE_KEYS = ['bg0', 'bg1', 'ink', 'mut', 'accent', 'accent2', 'ok', 'bad', 'paper', 'paperInk'];
  let colorCtx = null;
  function color(name) {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim() || '#808080';
    if (!colorCtx) colorCtx = document.createElement('canvas').getContext('2d');
    colorCtx.fillStyle = '#808080'; colorCtx.fillStyle = v;
    const f = colorCtx.fillStyle;
    if (f[0] === '#') return [parseInt(f.slice(1, 3), 16), parseInt(f.slice(3, 5), 16), parseInt(f.slice(5, 7), 16)];
    const m = f.match(/[\d.]+/g) || [128, 128, 128];
    return [Number(m[0]), Number(m[1]), Number(m[2])];
  }
  const rgba = (name, a = 1) => { const c = Array.isArray(name) ? name : color(name); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  function applyConcept() {
    const c = SB && SB.concept;
    if (!c) return;
    const root = document.documentElement.style;
    if (c.palette) for (const k of PALETTE_KEYS) if (c.palette[k]) root.setProperty('--' + k, c.palette[k]);
    if (c.fonts) {
      // "Paperlogy 900" → 서체 이름 "Paperlogy" + 굵기 변수(--displayW: 900). 굵기를 적지 않으면 theme.css 기본값을 쓴다
      const fam = v => String(v || '').replace(/\s+\d{3}$/, '').replace(/"/g, '').trim();
      const wgt = v => { const m = /\s(\d{3})$/.exec(String(v || '')); return m ? m[1] : null; };
      const map2 = { display: ['--display', 'sans-serif'], body: ['--sans', 'sans-serif'], serif: ['--serif', 'serif'], mono: ['--mono', 'monospace'], number: ['--num', 'sans-serif'] };
      for (const k in map2) if (c.fonts[k]) {
        root.setProperty(map2[k][0], `"${fam(c.fonts[k])}", "Pretendard", ${map2[k][1]}`);
        if (wgt(c.fonts[k])) root.setProperty(map2[k][0] + 'W', wgt(c.fonts[k]));
      }
    }
  }

  // ───────────────────────── 3D 수학(행렬은 행 우선 3×3 + 이동) ─────────────────────────
  const RAD = Math.PI / 180;
  const wrap180 = d => { d = ((d + 180) % 360 + 360) % 360 - 180; return d; };
  const lerpAng = (a, b, p) => a + wrap180(b - a) * p;
  const mul3 = (A, B) => {
    const C = new Array(9);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) C[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
    return C;
  };
  const mv3 = (M, v) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
  const tr3 = M => [M[0], M[3], M[6], M[1], M[4], M[7], M[2], M[5], M[8]];
  // CSS 규약의 회전 행렬(y축은 아래, 각도는 도)
  const rX = d => { const c = Math.cos(d * RAD), s2 = Math.sin(d * RAD); return [1, 0, 0, 0, c, -s2, 0, s2, c]; };
  const rY = d => { const c = Math.cos(d * RAD), s2 = Math.sin(d * RAD); return [c, 0, s2, 0, 1, 0, -s2, 0, c]; };
  const rZ = d => { const c = Math.cos(d * RAD), s2 = Math.sin(d * RAD); return [c, -s2, 0, s2, c, 0, 0, 0, 1]; };
  const euler = (rx, ry, rz) => mul3(mul3(rY(ry), rX(rx)), rZ(rz));    // = CSS rotateY(ry) rotateX(rx) rotateZ(rz)
  const poseCSS = p => `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, ${p.z.toFixed(2)}px) rotateY(${p.ry.toFixed(4)}deg) rotateX(${p.rx.toFixed(4)}deg) rotateZ(${p.rz.toFixed(4)}deg)`;
  // 카메라 상태 { x, y, z (바라보는 점), rx, ry, rz, D (그 점까지 거리) } → #world 변환(카메라 역변환)
  const camCSS = c => `translateZ(${(P - c.D).toFixed(2)}px) rotateZ(${(-c.rz).toFixed(4)}deg) rotateX(${(-c.rx).toFixed(4)}deg) rotateY(${(-c.ry).toFixed(4)}deg) translate3d(${(-c.x).toFixed(2)}px, ${(-c.y).toFixed(2)}px, ${(-c.z).toFixed(2)}px)`;
  function camMatrix(c) {
    const R = tr3(euler(c.rx, c.ry, c.rz));
    const t = mv3(R, [-c.x, -c.y, -c.z]);
    t[2] += P - c.D;
    return { R, t };
  }
  const CORNERS = [[-960, -540, 0], [960, -540, 0], [960, 540, 0], [-960, 540, 0]];
  // 슬라이드(또는 같은 크기 평면) 네 모서리를 카메라 공간으로 옮겨 화면 위치와 가까움을 잰다
  function project(M, pose) {
    if (!pose.$R) pose.$R = euler(pose.rx, pose.ry, pose.rz);
    let zmax = -Infinity, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const c of CORNERS) {
      const w = mv3(pose.$R, c); w[0] += pose.x; w[1] += pose.y; w[2] += pose.z;
      const q = mv3(M.R, w); q[0] += M.t[0]; q[1] += M.t[1]; q[2] += M.t[2];
      zmax = Math.max(zmax, q[2]);
      const k = P / Math.max(1, P - q[2]);
      const sx = q[0] * k + 960, sy = q[1] * k + 540;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    }
    const near = zmax > 0.92 * P;
    const off = x1 < -40 || x0 > W + 40 || y1 < -40 || y0 > H + 40;
    // 뒷면: 슬라이드 앞쪽 법선이 보는 사람 쪽을 향하지 않으면 뒤에서 보는 것(글자가 좌우로 뒤집혀 보인다)
    const n = mv3(M.R, mv3(pose.$R, [0, 0, 1])), cq = mv3(M.R, [pose.x, pose.y, pose.z]);
    const back = n[0] * -(cq[0] + M.t[0]) + n[1] * -(cq[1] + M.t[1]) + n[2] * (P - cq[2] - M.t[2]) <= 0;
    return { on: !near && !off && !back, vis: !near && !off, back, fade: 1 - smooth(0.3 * P, 0.78 * P, zmax), area: (x1 - x0) * (y1 - y0) };
  }
  // 앞 배치 A의 로컬 좌표(lx, ly, lz)만큼 옮긴 배치(회전은 y축만 이어받는다)
  const offPose = (A, lx, ly, lz, dry = 0) => {
    const c = Math.cos(A.ry * RAD), s2 = Math.sin(A.ry * RAD);
    return { x: A.x + c * lx + s2 * lz, y: A.y + ly, z: A.z - s2 * lx + c * lz, rx: 0, ry: A.ry + dry, rz: 0 };
  };
  // A 뒤(r>0) 또는 앞(r<0) r 거리의 세로축을 중심으로 dθ만큼 돈 배치
  const aroundPose = (A, r, dDeg) => {
    const pv = offPose(A, 0, 0, -r);
    const ry = A.ry + dDeg;
    return { x: pv.x + Math.sin(ry * RAD) * r, y: pv.y, z: pv.z + Math.cos(ry * RAD) * r, rx: 0, ry, rz: 0 };
  };
  const dist3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

  // ───────────────────────── 스토리보드 반영·배치 ─────────────────────────
  function resolveSlides() {
    for (const c of (SB && SB.chapters) || []) c.$sb = true;
    const chById = new Map(((SB && SB.chapters) || []).map(c => [c.id, c]));
    const sbVideos = new Map(((SB && SB.videos) || []).map(v => [v.id, v]));
    let prevCh = null;
    const order = [];
    slides.forEach((sl, i) => {
      sl.index = i;
      const sb = SBMAP.get(sl.id) || null;
      sl.$sb = sb;
      if (SB && !sb) console.warn('[DECK] 스토리보드에 없는 슬라이드 id:', sl.id, sl.$file || '');
      let chId = sl.chapter || (sb && sb.chapter) || null;
      if (!chId) chId = SB ? (prevCh || '_c0') : '_s:' + (sl.$section || '');
      if (!chById.has(chId)) chById.set(chId, { id: chId, title: sl.$section || chId, layout: 'row' });
      const ch = chById.get(chId);
      if (!order.includes(ch)) order.push(ch);
      sl.$chapter = ch; prevCh = chId;
      sl.$title = sl.$title || (sb && sb.title) || sl.id;
      sl.$section = sl.$section || ch.title || '';
      if (sl.$notes == null && sb && typeof sb.notes === 'string') sl.$notes = sb.notes;
      if (sl.$notes == null) sl.$notes = '';
      sl.$type = sl.type || (sb && sb.type) || (sl.$isVideo ? 'video' : null);
      sl.$seconds = Number((sb && sb.seconds) ?? sl.seconds ?? 0) || null;
      const cam = Object.assign({}, (sb && sb.camera) || {}, sl.camera || {});
      let en = cam.enter || (sl.$isVideo ? 'video' : 'push');
      if (!(en in ENTER_DUR)) { console.warn('[DECK] 알 수 없는 enter, push로 둠:', sl.id, en); en = 'push'; }
      let inn = cam.inner || (sl.$isVideo ? 'none' : 'drift');
      if (!INNERS.includes(inn)) { console.warn('[DECK] 알 수 없는 inner, drift로 둠:', sl.id, inn); inn = 'drift'; }
      if (inn === 'track' && !(Array.isArray(sl.camTrack) && sl.camTrack.length)) { console.warn('[DECK] inner track인데 camTrack이 없음, drift로 둠:', sl.id); inn = 'drift'; }
      // $enterSB = 스토리보드(또는 def.camera) 값. 배치(layoutPoses)와 개관 화면은 이 값으로 계산한다.
      // 평면 밀기 모드의 $enter: cut·video는 그대로, 영상 슬라이드 바로 다음은 cut(영상 끝 프레임 = 그 슬라이드 첫 화면), 나머지는 flat-push
      sl.$enterSB = en;
      // 영상 슬라이드로 들어가는 전환(4차): videoSlide의 open 값을 따른다. 기본 'cut'(앞 슬라이드 끝 화면 = 영상 0프레임이라 바로 바꾼다).
      // 'band'(가운데 띠로 열림, 1.04→1배)와 'fade'(투명도만)는 video 전환 0.6초. 평면 밀기 모드에서는 스토리보드 enter와 상관없이 이 규칙
      if (sl.$isVideo) {
        if (FLAT && en !== 'cut') en = 'video';
        if (en === 'video' && sl.$open === 'cut') en = 'cut';
      }
      if (FLAT && en !== 'cut' && en !== 'video') en = i > 0 && slides[i - 1].$isVideo && !sl.$isVideo ? 'cut' : 'flat-push';
      sl.$enter = en; sl.$inner = inn; sl.$camDur = cam.dur;
      sl.$lead = sl.$isVideo ? 0 : (sl.lead ?? 0.18);
      if (!sl.bg && ch.art && ch.art.bg) sl.bg = ch.art.bg;
      if (sl.$isVideo) {
        const v = sbVideos.get(sl.$vname);
        if (!sl.$vsecFixed) sl.dur = Number(sl.$sec0 || (sb && sb.seconds) || (v && v.seconds) || 10);
      }
      sl.$chrome = chromeConf(sl, ch, sb);
    });
    CHAPTERS = order;
    // 들어오는 전환 길이와 t 대기 시간
    slides.forEach((sl, i) => {
      if (i === 0) { sl.$trans = 0; sl.$delay = 0; return; }
      const prev = slides[i - 1];
      const base = sl.$enter === 'pull-out' && prev.$chapter === sl.$chapter ? PULL_ALL_DUR : ENTER_DUR[sl.$enter];
      let d = sl.$camDur ?? prev.exit ?? base;
      if (sl.$enter === 'cut') d = FLAT || sl.$isVideo ? 0 : sl.$camDur ?? 0;
      if (sl.$enter === 'flat-push') d = FLAT_DUR;            // 평면 밀기는 길이를 하나로 둔다(스토리보드 exit·camera.dur은 3D 경로용)
      sl.$trans = Math.max(0, Number(d) || 0);
      sl.$delay = sl.$isVideo ? 0 : Math.max(0, sl.$trans - ARRIVE_LEAD - sl.$lead);
    });
    // zoomTarget 기본값: 다음 슬라이드가 zoom-through이고 이 슬라이드에 zoomTarget이 없으면
    // 다음 슬라이드 스토리보드 camera.target 글의 "x 1340 y 620"을 읽어 쓴다
    slides.forEach((sl, i) => {
      sl.$zoomT = null;
      const nx = slides[i + 1];
      if (!nx || nx.$enter !== 'zoom-through') return;
      if (sl.zoomTarget) { sl.$zoomT = { x: sl.zoomTarget.x ?? 960, y: sl.zoomTarget.y ?? 540 }; return; }
      const tg = nx.$sb && nx.$sb.camera && nx.$sb.camera.target;
      const m = /x\s*(-?\d+(?:\.\d+)?)\s*[,·]?\s*y\s*(-?\d+(?:\.\d+)?)/i.exec(String(tg || ''));
      sl.$zoomT = m ? { x: Number(m[1]), y: Number(m[2]) } : { x: 960, y: 540 };
    });
  }

  // ───────────────────────── 공통 크롬 설정 ─────────────────────────
  // 경로 줄(chapters[].x_path), 출처 줄(def.chrome.source), 예시 표시(스토리보드 slides[].example 또는 def.chrome.example)
  // 발표자 본인이 만든 자료(이전 발표, 본인 GitHub 저장소·논문, 본인 프로젝트 파일)는 출처로 표기하지 않는다(발표자 지시, 2026-11-15).
  // 출처 글을 ' · '로 나눠 본인 자료 항목만 빼고, 남는 항목이 없으면 출처 줄을 그리지 않는다.
  const OWN_SOURCE = [/연사/, /발표자/, /revfactory/i, /claude-code-harness/i, /CLAUDE\.md/, /\.claude\//, /비밀노트/];
  function ownFree(text) {
    const body = text.replace(/^\s*출처\s*[:：]\s*/, '');
    const kept = body.split(/\s*·\s*/).filter(p => p && !OWN_SOURCE.some(re => re.test(p)));
    return kept.length ? '출처: ' + kept.join(' · ') : '';
  }
  function chromeConf(sl, ch, sb) {
    if (sl.$isVideo || sl.chrome === false) return { path: null, source: null, example: null, light: null, num: false };
    const co = sl.chrome && typeof sl.chrome === 'object' ? sl.chrome : {};
    const path = co.path === false ? null : typeof co.path === 'string' ? co.path : (ch && (ch.x_path || ch.path)) || null;
    let source = co.source ?? null;
    if (typeof source === 'string') source = { text: source };
    if (source && !source.text) source = null;
    if (source) source = { text: ownFree(String(source.text)), step: Number(source.step) || 0, at: source.at };
    if (source && !source.text) source = null;
    let example = co.example ?? (sb && sb.example ? true : null);
    if (example === true) example = '예시';
    if (example === false) example = null;
    return { path, source, example: example ? String(example) : null, light: typeof co.light === 'boolean' ? co.light : null, num: co.num !== false };
  }

  function forwardPose(A, ch, j, origin) {
    const L = LAYOUT[ch.layout] ? ch.layout : 'row';
    const S = Number(ch.spacing) || LAYOUT[L].spacing;
    // arc는 장 전체가 ARC_SPAN° 안에 들도록 반지름을 늘린다(한 바퀴를 넘겨 겹치지 않게). radius를 직접 주면 그 값
    const R = Number(ch.radius ?? ch.x_radius) || (L === 'arc' ? Math.max(LAYOUT.arc.radius, (Math.max(2, ch.$n || 2) - 1) * S / (ARC_SPAN * RAD)) : LAYOUT[L].radius || 3000);
    switch (L) {
      case 'arc': return aroundPose(A, -R, -(S / R) / RAD);
      case 'spiral': { const p = aroundPose(A, R, (S / R) / RAD); p.y -= Number(ch.rise ?? ch.x_rise) || LAYOUT.spiral.rise; return p; }
      case 'stack': return offPose(A, 0, 0, -S);
      case 'grid': { const col = j % 3, row = Math.floor(j / 3); return offPose(origin, col * S, row * S * 0.6, 0); }
      default: return offPose(A, S, 0, 0);
    }
  }
  function stepPose(A, enter, ch, j, origin) {
    const S = Number(ch.spacing) || (LAYOUT[ch.layout] || LAYOUT.row).spacing;
    switch (enter) {
      case 'slide-r': return offPose(A, S, 0, 0);
      case 'slide-l': return offPose(A, -S, 0, 0);
      case 'rise': return offPose(A, 0, -VSTEP, 0);
      case 'drop': return offPose(A, 0, VSTEP, 0);
      case 'orbit-r': return aroundPose(A, ORBIT_R, ORBIT_DEG);
      case 'orbit-l': return aroundPose(A, ORBIT_R, -ORBIT_DEG);
      default: return forwardPose(A, ch, j, origin);
    }
  }
  // p가 q 앞(q를 보는 카메라와 q 사이)에 있어 q를 가리는지. q의 로컬 좌표로 옮겨 잰다
  function blocks(p, q) {
    const R = tr3(euler(q.rx || 0, q.ry || 0, q.rz || 0)), d = mv3(R, [p.x - q.x, p.y - q.y, p.z - q.z]);
    return Math.abs(d[0]) < 1800 && Math.abs(d[1]) < 1000 && d[2] > 0 && d[2] < P + 150;
  }
  // grid: 3열 칸. push(앞으로 가는 전환)는 읽는 순서로 다음 칸, slide-r/-l은 같은 줄 옆 칸, drop/rise는 아래/위 줄. 찬 칸은 같은 방향으로 건너뛴다
  function gridStep(cell, enter, used) {
    const k = (c, r) => c + ',' + r;
    let [c, r] = cell;
    const mv = { 'slide-r': [1, 0], 'orbit-r': [1, 0], 'slide-l': [-1, 0], 'orbit-l': [-1, 0], drop: [0, 1], rise: [0, -1] }[enter];
    for (let n = 0; n < 60; n++) {
      if (mv) { c += mv[0]; r += mv[1]; } else if (c < 2) c++; else { c = 0; r++; }
      if (!used.has(k(c, r))) break;
    }
    used.add(k(c, r));
    return [c, r];
  }
  function layoutPoses() {
    const placed = [];
    const free = q => !placed.some(p => dist3(p, q) < NEAR || blocks(p, q) || blocks(q, p));
    const avoid = q => {
      if (free(q)) return q;
      for (const [lx, ly, lz] of [[0, -1400, 0], [0, 1400, 0], [0, 0, -1800], [0, -2800, 0], [0, 2800, 0], [0, 0, -3600], [0, -4200, 0]]) {
        const c = offPose(q, lx, ly, lz); c.rx = q.rx; c.rz = q.rz;
        if (free(c)) return c;
      }
      return q;
    };
    let maxX = -Infinity;
    for (const ch of CHAPTERS) {
      const list = slides.filter(sl => sl.$chapter === ch);
      ch.$n = list.filter(sl => !sl.$isVideo).length;
      let wo = ch.world;
      if (!wo) wo = { x: placed.length ? maxX + 7000 : 0, y: 0, z: 0, ry: 0 };
      const origin = { x: Number(wo.x) || 0, y: Number(wo.y) || 0, z: Number(wo.z) || 0, rx: 0, ry: Number(wo.ry) || 0, rz: 0 };
      let A = null, j = 0;
      const isGrid = ch.layout === 'grid', S = Number(ch.spacing) || LAYOUT.grid.spacing, used = new Set(['0,0']);
      let cell = [0, 0];
      for (const sl of list) {
        if (sl.$isVideo && !sl.pose) continue;
        let p;
        if (sl.pose) p = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, ...sl.pose };
        else if (!A) p = { ...origin };
        else if (isGrid) { cell = gridStep(cell, sl.$enterSB, used); p = avoid(offPose(origin, cell[0] * S, cell[1] * S * 0.6, 0)); }
        else p = avoid(stepPose(A, sl.$enterSB, ch, j, origin));
        sl.$pose = p; placed.push(p); A = p; j++;
        maxX = Math.max(maxX, p.x);
      }
      // 영상 슬라이드: 앞 슬라이드 자리(장 첫 슬라이드면 다음 슬라이드 자리)
      list.forEach((sl, k) => {
        if (!sl.$isVideo || sl.pose) return;
        const before = list.slice(0, k).reverse().find(x => x.$pose && !x.$isVideo);
        const after = list.slice(k + 1).find(x => x.$pose && !x.$isVideo);
        sl.$pose = { ...((before || after || {}).$pose || origin) };
      });
    }
    slides.forEach(sl => { if (!sl.$pose) sl.$pose = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }; sl.$poseCSS = poseCSS(sl.$pose); });
  }

  // ───────────────────────── 카메라 ─────────────────────────
  // 머묾 오프셋(슬라이드 좌표): inner 종류 + cameraHook
  function offsetOf(i, t, a, k) {
    const sl = slides[i], o = { dx: 0, dy: 0, dz: 0, rx: 0, ry: 0, rz: 0 };
    const ph = rand(i + 1, 3) * 6.2832;
    switch (sl.$inner) {
      case 'drift': case 'parallax': {
        const m = sl.$inner === 'parallax' ? 1.5 : 1;
        o.dx = 14 * m * Math.sin(a * 0.23 + ph);
        o.dy = 9 * m * Math.sin(a * 0.17 + ph * 1.7);
        o.rz = 0.25 * Math.sin(a * 0.11 + ph * 0.6);
        break;
      }
      case 'dolly-in': {
        const L = sl.$lead;
        o.dz = -120 * ease.inOutSine(clamp((t + L) / Math.max(0.01, sl.dur + L)));
        break;
      }
      case 'track': {
        const tk = sl.camTrack, st = stops(sl);
        const at = n => { const v = tk[clamp(n, 0, tk.length - 1)] || [960, 540, 1]; return { cx: v[0] ?? 960, cy: v[1] ?? 540, z: v[2] || 1 }; };
        const kk = clamp(k, 0, st.length - 1);
        let A = at(kk), p = 1;
        if (kk > 0) { const B = A; A = at(kk - 1); p = ease.inOutCubic(clamp((t - st[kk - 1]) / 0.8)); A = { cx: lerp(A.cx, B.cx, p), cy: lerp(A.cy, B.cy, p), z: Math.exp(lerp(Math.log(A.z), Math.log(B.z), p)) }; }
        o.dx = A.cx - 960; o.dy = A.cy - 540; o.dz = P / A.z - P;
        break;
      }
      default: break;
    }
    if (sl.cameraHook) {
      try {
        const hk = sl.cameraHook.call(sl, t, { a, step: k, dur: sl.dur, holds: sl.holds || [] }) || {};
        for (const key in o) if (typeof hk[key] === 'number') o[key] += hk[key];
      } catch (e) { console.error('[DECK] cameraHook 오류', sl.id, e); }
    }
    return o;
  }
  function restCam(i, o) {
    const p = slides[i].$pose;
    if (!p.$R) p.$R = euler(p.rx, p.ry, p.rz);
    const d = mv3(p.$R, [o.dx, o.dy, 0]);
    return { x: p.x + d[0], y: p.y + d[1], z: p.z + d[2], rx: p.rx + o.rx, ry: p.ry + o.ry, rz: p.rz + o.rz, D: P + o.dz };
  }
  const is2D = o => Math.abs(o.rx) < 1e-4 && Math.abs(o.ry) < 1e-4;
  function rest2D(o) {
    const k = P / Math.max(50, P + o.dz);
    if (Math.abs(k - 1) < 1e-5 && Math.abs(o.rz) < 1e-5 && Math.abs(o.dx) < 0.005 && Math.abs(o.dy) < 0.005) return 'none';
    return `scale(${k.toFixed(5)}) rotate(${(-o.rz).toFixed(4)}deg) translate(${(-o.dx).toFixed(2)}px, ${(-o.dy).toFixed(2)}px)`;
  }
  const lerpCam = (A, B, p) => ({ x: lerp(A.x, B.x, p), y: lerp(A.y, B.y, p), z: lerp(A.z, B.z, p), rx: lerpAng(A.rx, B.rx, p), ry: lerpAng(A.ry, B.ry, p), rz: lerpAng(A.rz, B.rz, p), D: lerp(A.D, B.D, p) });
  // B 위치를 A 카메라 화면 평면 기준으로 나눈 값: u(오른쪽) v(아래) w(앞)
  function relView(A, B) {
    const R = tr3(euler(A.rx, A.ry, A.rz));
    return mv3(R, [B.x - A.x, B.y - A.y, B.z - A.z]);
  }
  const lateral = (A, B) => { const q = relView(A, B); return Math.hypot(q[0], q[1]); };
  const sinE = e => Math.sin(Math.PI * e);

  function orbitPath(A, B, e, dir) {
    const nA = [Math.sin(A.ry * RAD), Math.cos(A.ry * RAD)], nB = [Math.sin(B.ry * RAD), Math.cos(B.ry * RAD)];
    const det = nB[0] * nA[1] - nA[0] * nB[1];
    const p = ease.inOutCubic(e);
    if (Math.abs(det) > 0.08) {
      // A - nA·s = B - nB·u 를 풀어 두 시선이 만나는 점(축)을 구한다
      const bx = A.x - B.x, bz = A.z - B.z;
      const sA = (bx * -nB[1] - bz * -nB[0]) / (nA[0] * -nB[1] - nA[1] * -nB[0]);
      const pv = { x: A.x - nA[0] * sA, z: A.z - nA[1] * sA };
      const rA = Math.hypot(A.x - pv.x, A.z - pv.z), rB = Math.hypot(B.x - pv.x, B.z - pv.z);
      if (sA > 200 && rA > 200 && rB > 200) {
        const aA = Math.atan2(A.x - pv.x, A.z - pv.z) / RAD, aB = Math.atan2(B.x - pv.x, B.z - pv.z) / RAD;
        const ang = lerpAng(aA, aB, p), r = lerp(rA, rB, p);
        const chord = Math.hypot(A.x - B.x, A.z - B.z);
        return { x: pv.x + Math.sin(ang * RAD) * r, y: lerp(A.y, B.y, p), z: pv.z + Math.cos(ang * RAD) * r, rx: lerpAng(A.rx, B.rx, p), ry: lerpAng(A.ry, B.ry, p), rz: lerpAng(A.rz, B.rz, p), D: lerp(A.D, B.D, p) + 0.22 * chord * sinE(e) };
      }
    }
    // 두 슬라이드가 나란하면: 보간하면서 ry를 한쪽으로 돌렸다 복귀
    const c = lerpCam(A, B, p);
    c.ry += dir * 20 * sinE(e);
    c.D += 0.35 * lateral(A, B) * sinE(e);
    return c;
  }

  // pull-out 개관 거리. 장 경계(두 장이 다름)는 두 장이 화면에 들도록, 같은 장 안의 pull-out은 덱 전체가 들도록 물러난다.
  // 덱 전체일 때는 바라보는 점도 덱 가운데로 옮긴다(all: true, cx·cy·cz)
  const pullCache = new Map();
  function pullInfo(ia, ib) {
    const key = ia + ':' + ib;
    if (pullCache.has(key)) return pullCache.get(key);
    const ca = slides[ia].$chapter, cb = slides[ib].$chapter, all = ca === cb;
    const list = slides.filter(sl => !sl.$isVideo && (all || sl.$chapter === ca || sl.$chapter === cb)).map(sl => sl.$pose);
    const A = slides[ia].$pose, B = slides[ib].$pose;
    let mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, mz = (A.z + B.z) / 2;
    if (all) {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (const p of list) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
      mx = (x0 + x1) / 2; my = (y0 + y1) / 2; mz = (z0 + z1) / 2;
    }
    let ex = 0, ey = 0;
    for (const p of list) { ex = Math.max(ex, Math.abs(p.x - mx) + 960, Math.abs(p.z - mz) * 0.6 + 960); ey = Math.max(ey, Math.abs(p.y - my) + 540); }
    const fit = P * Math.max((2 * ex) / W, (2 * ey) / H) * 1.08;
    const v = { D: clamp(Math.max(P + 8000, fit), P + 8000, all ? 240000 : 60000), all, cx: mx, cy: my, cz: mz };
    pullCache.set(key, v);
    return v;
  }

  // 전환 경로: 같은 (A, B, e)에 대해 늘 같은 카메라를 돌려준다
  function camPath(type, A, B, e, ia, ib) {
    switch (type) {
      case 'slide-l': case 'slide-r': {
        const c = lerpCam(A, B, ease.inOutCubic(e)); c.D += 0.18 * lateral(A, B) * sinE(e); return c;
      }
      case 'rise': case 'drop': {
        const c = lerpCam(A, B, ease.swift(e)); c.D += 0.28 * lateral(A, B) * sinE(e);
        c.rx += (B.y < A.y ? -1 : 1) * 7 * sinE(e); return c;
      }
      case 'orbit-l': case 'orbit-r': return orbitPath(A, B, e, type === 'orbit-r' ? -1 : 1);
      case 'whip': {
        const c = lerpCam(A, B, ease.inOutQuart(e)); const u = relView(A, B)[0];
        c.ry += (u >= 0 ? -1 : 1) * 25 * sinE(e); c.D += 0.15 * lateral(A, B) * sinE(e); return c;
      }
      case 'pull-out': {
        const pi = pullInfo(ia, ib);
        // 덱 전체 개관은 멀리 물러나는 데 시간이 더 들어 물러남·내려앉음 구간을 조금 길게 잡는다
        const hump = pi.all ? smooth(0, 0.4, e) * (1 - smooth(0.6, 1, e)) : smooth(0, 0.34, e) * (1 - smooth(0.66, 1, e));
        const pan = ease.inOutCubic(clamp((e - 0.22) / 0.56));
        const c = lerpCam(A, B, pan);
        c.D = lerp(A.D, B.D, pan) + (pi.D - P) * hump;
        if (pi.all) { const k = ease.inOutSine(hump); c.x = lerp(c.x, pi.cx, k); c.y = lerp(c.y, pi.cy, k); c.z = lerp(c.z, pi.cz, k); }
        c.rx += 9 * hump;      // 위에서 조금 내려다본다
        return c;
      }
      case 'land': {   // 개관 화면 ↔ 슬라이드
        const p = ease.inOutCubic(e);
        const c = lerpCam(A, B, p);
        c.D = Math.exp(lerp(Math.log(A.D), Math.log(B.D), p));
        return c;
      }
      default: {   // push
        const c = lerpCam(A, B, ease.swift(e)); c.D += Math.min(9000, 0.8 * lateral(A, B)) * sinE(e); return c;
      }
    }
  }
  // 카메라 속도: 같은 경로를 e±δ에서 계산한 차분(이전 프레임 값을 쓰지 않는다)
  function camSpeed(type, A, B, e, dur, ia, ib) {
    if (!(dur > 0)) return { speed: 0, vx: 0, vy: 0 };
    const d = 0.015, c1 = camPath(type, A, B, clamp(e - d), ia, ib), c2 = camPath(type, A, B, clamp(e + d), ia, ib);
    const dt = (clamp(e + d) - clamp(e - d)) * dur || 1e-3;
    const q = relView(c1, c2), Dm = (c1.D + c2.D) / 2;
    const vx = (q[0] * P) / Dm / dt, vy = (q[1] * P) / Dm / dt;
    const zoom = (Math.abs(c2.D - c1.D) / Dm / dt) * 900;
    const ang = ((Math.abs(wrap180(c2.ry - c1.ry)) + Math.abs(wrap180(c2.rx - c1.rx))) / dt) * 35;
    return { speed: clamp((Math.hypot(vx, vy) + zoom + ang) / 6500), vx, vy };
  }

  // ───────────────────────── 평면 밀기(기본 전환) ─────────────────────────
  // 두 슬라이드가 같은 평면에서 옆으로 밀린다. 슬라이드마다 머묾 오프셋(rest2D, drift·dolly-in·track·cameraHook) 앞에 가로 이동만 더한다.
  // 회전·깊이 이동·확대·개관·썸네일 평면은 쓰지 않는다. 앞으로: 앞 슬라이드는 왼쪽으로 나가고 다음 슬라이드가 오른쪽에서 들어온다(dir 1). 뒤로: 반대(dir -1).
  const flatTf = (X, o) => { const r = rest2D(o), tx = `translate(${X.toFixed(2)}px, 0px)`; return r === 'none' ? tx : tx + ' ' + r; };
  // 밀리는 동안 슬라이드를 제 화면 틀(1920×1080) 안으로 자른다. inner track·dolly-in으로 확대된 슬라이드는 상자가 화면보다 커서,
  // 자르지 않으면 화면 밖에 있던 부분이 이웃 슬라이드 자리로 밀려 들어와 보인다(예: 18번 camTrack 1.45배에서 오른쪽 1280px).
  // 화면 틀의 네 모서리를 머묾 변환의 역으로 슬라이드 좌표에 옮긴 다각형(clip-path)으로 자른다. 밀기 이동은 변환 맨 앞이라 틀 모양과 무관하다.
  // 틀 밖으로 나간 부분이 40px 미만이면(drift·parallax 가장자리, 빈 여백) 자르지 않는다. clip-path를 바꾸면 그 슬라이드를 다시 그려야 하기 때문이다.
  function frameClip(o) {
    const k = P / Math.max(50, P + o.dz), r = o.rz * RAD, c = Math.cos(r), s2 = Math.sin(r);
    if ((k - 1) * 960 + Math.hypot(o.dx, o.dy) * k + Math.abs(r) * 1100 < 40) return '';
    const pts = [[0, 0], [W, 0], [W, H], [0, H]].map(([sx, sy]) => {
      const ux = (sx - 960) / k, uy = (sy - 540) / k;
      return `${(960 + o.dx + c * ux - s2 * uy).toFixed(1)}px ${(540 + o.dy + s2 * ux + c * uy).toFixed(1)}px`;
    });
    return `polygon(${pts.join(', ')})`;
  }
  // 배경 층에 넘기는 카메라. 평면 밀기 모드에서는 슬라이드 배치(월드 좌표)와 무관하게 머묾 오프셋만 쓴다.
  // 배치 좌표를 쓰면 같은 배경끼리 밀 때 격자·입자가 두 배치 차이만큼 건너뛰거나 흘러간다
  const vcam = o => ({ x: o.dx, y: o.dy, z: 0, rx: 0, ry: 0, rz: o.rz, D: P + o.dz });
  const lerpV = (A, B, p) => ({ x: lerp(A.x, B.x, p), y: lerp(A.y, B.y, p), z: 0, rx: 0, ry: 0, rz: lerp(A.rz, B.rz, p), D: lerp(A.D, B.D, p) });
  // 밀기 진행률(위치) p의 시간 미분(1/초 단위가 아니라 e 기준). x.speed 계산용
  const pushVel = e => (ease.push(clamp(e + 0.01)) - ease.push(clamp(e - 0.01))) / Math.max(1e-6, clamp(e + 0.01) - clamp(e - 0.01));
  const FLAT_CHROME_X = { path: 290, side: 1500 };   // 경로 줄 가운데(x 160~420), 출처 줄·예시 표시 쪽(x 1240~1760)

  // 크롬 글자색을 정하는 밝기(0 어두운 바탕, 1 밝은 바탕). def.chrome.light가 있으면 그 값
  const lightOf = i => { const sl = slides[i]; if (!sl) return 0; const c = sl.$chrome; return c && c.light != null ? (c.light ? 1 : 0) : (sl.$light ? 1 : 0); };

  // ───────────────────────── 장면 구성: 상태 → 그릴 것 ─────────────────────────
  // S = { cur, t, a, k, g, trans: { from, t, a, k, e, dur, type } | null, ov: { e, cam } | null }
  function compose(S) {
    const B = slides[S.cur], tr = S.trans && S.trans.e < 1 ? S.trans : null;
    const e = tr ? clamp(tr.e) : 1;
    const oB = offsetOf(S.cur, S.t, S.a, S.k);
    const camB = restCam(S.cur, oB);
    const F = { mode: is2D(oB) ? '2d' : '3d', cam: camB, views: [], ghost: 0, blur: 0, speed: 0, vx: 0, vy: 0, plate: 0, bg: [[B.$bg, 1]], zoomE: 0, sel: -1, hide: new Set(),
      wipe: null, lightW: lightOf(S.cur), ci: { a: null, b: S.cur, e: 1, tB: S.t, kB: S.k, tA: 0, kA: 0 },
      flat: false, flatX: null, bgCam: FLAT ? vcam(oB) : null, bgCams: null, bgX: null, lightL: null, lightR: null };
    const vB = { i: S.cur, t: S.t, a: S.a, step: S.k, exit: 0, arrive: e, o: oB, role: 'cur' };
    F.views.push(vB);
    if (tr) {
      const A = slides[tr.from];
      const oA = offsetOf(tr.from, tr.t, tr.a, tr.k);
      const camA = restCam(tr.from, oA);
      const vA = { i: tr.from, t: tr.t, a: tr.a, step: tr.k, exit: e, arrive: 1, o: oA, role: 'from' };
      F.views.unshift(vA);
      F.ci = { a: tr.from, b: S.cur, e, tB: S.t, kB: S.k, tA: tr.t, kA: tr.k };
      const type = tr.type;
      // 배경: 보통은 두 배경을 섞는다. 영상이 열리는 동안은 앞 배경을 그대로 두고(영상이 덮은 뒤 바뀜), 영상에서 나올 때는 처음부터 다음 배경.
      // 어두운 바탕 ↔ 밝은 바탕(종이)은 섞으면 가운데에서 회색이 되므로 카메라가 움직이는 쪽에서 새 배경이 밀려 들어오게 가린다(wipe)
      const be = ease.inOutSine(e);
      if (type === 'video') { F.bg = [[A.$bg, 1]]; F.lightW = lightOf(tr.from); }
      else if (A.$isVideo) { F.bg = [[B.$bg, 1]]; F.lightW = lightOf(S.cur); }
      else if (type !== 'cut' && A.$bg !== B.$bg && A.$light !== B.$light) {
        const p = type === 'pull-out' ? ease.inOutCubic(clamp((e - 0.3) / 0.4)) : ease.inOutCubic(clamp((e - 0.12) / 0.7));
        const q = relView(camA, camB);
        const dir = Math.abs(q[1]) >= Math.abs(q[0]) ? (q[1] >= 0 ? 'to top' : 'to bottom') : (q[0] >= 0 ? 'to left' : 'to right');
        const SOFT = 22, a0 = p * (100 + SOFT) - SOFT;
        F.wipe = { from: A.$bg, to: B.$bg, p, mask: `linear-gradient(${dir}, #000 ${a0.toFixed(2)}%, transparent ${(a0 + SOFT).toFixed(2)}%)` };
        F.bg = [[A.$bg, 1], [B.$bg, 1]];
        F.lightW = lerp(lightOf(tr.from), lightOf(S.cur), p);
      } else { F.bg = [[A.$bg, 1 - be], [B.$bg, be]]; F.lightW = lerp(lightOf(tr.from), lightOf(S.cur), be); }
      if (type === 'video') {
        F.mode = '2d'; F.cam = camA; vA.tf = rest2D(oA); vB.world = false;
        if (FLAT) F.bgCam = vcam(oA);
      } else if (type === 'cut') {
        F.views = [vB];
      } else if (type === 'flat-push') {
        // 평면 밀기. dir 1 = 앞으로(다음 슬라이드가 오른쪽에서), -1 = 뒤로(왼쪽에서). rev = ← 키로 돌아감(들어오는 슬라이드는 끝 상태 그대로, arrive 1·나가는 슬라이드 exit 0)
        F.mode = '2d'; F.flat = true;
        const dir = tr.dir || 1, p = ease.push(e);
        const XA = -dir * W * p, XB = XA + dir * W, seam = dir > 0 ? XB : XA;   // seam = 두 슬라이드 경계의 화면 x
        vA.tf = flatTf(XA, oA); vA.clip = frameClip(oA);
        vB.tf = flatTf(XB, oB); vB.clip = frameClip(oB);
        if (tr.rev) { vA.exit = 0; vB.arrive = 1; }
        F.flatX = { a: XA, b: XB };          // 출처 줄·예시 표시(슬라이드마다 다른 크롬)를 제 슬라이드와 함께 밀 때 쓴다
        F.cam = lerpCam(camA, camB, p);      // 개관 화면(O)을 밀기 도중에 열 때의 출발점
        const v = (pushVel(e) * W) / Math.max(0.05, tr.dur);
        F.speed = clamp(v / 9000); F.vx = -dir * v; F.vy = 0;
        // 배경: 같은 배경이면 층을 고정하고 내용만 민다. 다른 배경(장 경계, 종이 ↔ 어두운 바탕)이면 배경도 제 슬라이드와 같은 판으로 함께 민다.
        // 두 배경의 경계가 슬라이드 경계와 같은 곳에서 움직이므로 섞이거나(회색) 따로 닦이지 않는다
        F.wipe = null;
        if (A.$bg !== B.$bg) {
          F.bg = [[A.$bg, 1], [B.$bg, 1]];
          F.bgX = { [A.$bg]: XA, [B.$bg]: XB };
          F.bgCams = { [A.$bg]: vcam(oA), [B.$bg]: vcam(oB) };
        } else { F.bg = [[B.$bg, 1]]; F.bgCam = lerpV(vcam(oA), vcam(oB), p); }
        // 크롬(화면 고정) 글자색: 그 자리 아래에 어느 슬라이드 바탕이 있는지로 정한다(경계 ±120px에서 섞음)
        const lA = lightOf(tr.from), lB = lightOf(S.cur);
        const onB = x => smooth(-120, 120, dir > 0 ? x - seam : seam - x);
        F.lightL = lerp(lA, lB, onB(FLAT_CHROME_X.path)); F.lightR = lerp(lA, lB, onB(FLAT_CHROME_X.side));
        F.lightW = lerp(lA, lB, p);
      } else if (type === 'zoom-through') {
        F.mode = 'zoom';
        const zt = A.zoomTarget || A.$zoomT || { x: 960, y: 540 };
        const px = (zt.x ?? 960) - 960, py = (zt.y ?? 540) - 540;
        const s0 = Math.pow(30, ease.inOutCubic(e)), w = ease.inOutSine(clamp(e / 0.85));
        const cx = px * (1 - (1 - w) / s0), cy = py * (1 - (1 - w) / s0);
        const oM = { dx: lerp(oA.dx, oB.dx, w), dy: lerp(oA.dy, oB.dy, w), dz: lerp(oA.dz, oB.dz, w), rz: lerp(oA.rz, oB.rz, w), rx: 0, ry: 0 };
        const base = rest2D(oM), pre = base === 'none' ? '' : base + ' ';
        vA.tf = `${pre}translate(${(-s0 * cx).toFixed(2)}px, ${(-s0 * cy).toFixed(2)}px) scale(${s0.toFixed(5)})`;
        vB.tf = `${pre}translate(${(s0 * (px - cx)).toFixed(2)}px, ${(s0 * (py - cy)).toFixed(2)}px) scale(${(s0 / 30).toFixed(6)})`;
        vA.op = 1 - smooth(0.42, 0.74, e);
        vB.op = smooth(0.34, 0.62, e);
        F.zoomE = sinE(e);
        F.speed = clamp(sinE(e) * 0.9);
        F.cam = lerpCam(camA, camB, w);
      } else {
        F.mode = '3d';
        F.cam = camPath(type, camA, camB, e, tr.from, S.cur);
        const sp = camSpeed(type, camA, camB, e, tr.dur, tr.from, S.cur);
        F.speed = sp.speed; F.vx = sp.vx; F.vy = sp.vy;
        if (type === 'whip') F.blur = 6 * smooth(0.12, 0.55, sp.speed) * sinE(e);
        if (type === 'pull-out') F.blur = 3.5 * smooth(0.25, 0.65, sp.speed) * smooth(0.2, 0.4, e) * (1 - smooth(0.6, 0.8, e));
        F.plate = Math.pow(sinE(e), 0.6);
      }
    }
    if (S.ov && S.ov.e > 0) {
      const oe = clamp(S.ov.e), base = F.cam;
      F.mode = '3d';
      F.cam = camPath('land', F.cam, S.ov.cam, oe, 0, 0);
      if (F.flat) { F.flat = false; F.flatX = null; F.bgX = null; F.bgCams = null; F.bg = [[B.$bg, 1]]; F.lightL = F.lightR = null; }
      // 평면 밀기 모드의 배경 카메라: 머묾 오프셋에서 출발해 개관 비행만큼 더한다(열 때 배경이 건너뛰지 않게)
      if (F.bgCam) { const v = F.bgCam, c = F.cam; F.bgCam = { x: v.x + c.x - base.x, y: v.y + c.y - base.y, z: v.z + c.z - base.z, rx: v.rx + c.rx - base.rx, ry: v.ry + c.ry - base.ry, rz: v.rz + c.rz - base.rz, D: v.D + c.D - base.D }; }
      F.plate = Math.max(F.plate, Math.pow(sinE(oe), 0.6));
      F.sel = S.ov.sel;
    }
    if (F.mode === '3d') {
      F.ghost = smooth(P + 3000, P + 7000, F.cam.D);
      // 3D 전환 중에는 앞뒤 한 장도 그린다(지나간 슬라이드는 끝 상태, 다음 슬라이드는 시작 전 상태)
      const want = new Set(F.views.map(v => v.i));
      // 영상 슬라이드에서 나갈 때: 영상과 같은 자리(앞 슬라이드)를 다시 보이지 않게 한다(영상이 닫히는 동안 앞 슬라이드가 비쳐 보이는 것을 막음)
      if (tr && slides[tr.from].$isVideo) {
        const vp = slides[tr.from].$pose;
        slides.forEach((sl, i) => { if (i !== S.cur && !sl.$isVideo && sl.$pose && dist3(sl.$pose, vp) < 1) F.hide.add(i); });
      }
      for (const i of F.hide) want.add(i);
      const cand = [S.cur - 1, S.cur + 1];
      if (tr) cand.push(tr.from - 1, tr.from + 1);
      for (const i of cand) {
        if (i < 0 || i >= slides.length || want.has(i) || slides[i].$isVideo) continue;
        want.add(i);
        const sl = slides[i];
        F.views.push(i < S.cur ? { i, t: sl.dur, a: sl.dur + 0.5, step: stops(sl).length - 1, exit: 0, arrive: 1, o: null, role: 'near' }
          : { i, t: -sl.$lead, a: -sl.$lead, step: 0, exit: 0, arrive: 0, o: null, role: 'near' });
      }
    }
    return F;
  }

  // ───────────────────────── 그리기 ─────────────────────────
  let stage, bgLayer, view, world, videoLayer, topLayer, msgBox;
  const drawnNow = new Set();
  const ghostsOn = new Set();
  let curMode = null, willOn = false;
  const perfRec = { engine: 0, render: 0, bg: 0, frames: 0 };
  window.__perf = perfRec;

  function setMode(m) {
    if (m === curMode) return;
    curMode = m;
    if (m === '3d') { set(view, 'perspective', P + 'px'); set(world, 'transformStyle', 'preserve-3d'); }
    else { set(view, 'perspective', 'none'); set(world, 'transformStyle', 'flat'); set(world, 'transform', 'none'); }
  }
  function setWill(on) {
    if (RENDER) on = false;
    if (on === willOn) return;
    willOn = on;
    set(world, 'willChange', on ? 'transform' : 'auto');
  }
  function renderSlide(sl, v, F, g) {
    const key = `${v.t}|${v.step}|${v.role === 'near' ? v.a : ''}`;
    if (v.role === 'near' && sl.$lastKey === key) return 0;
    sl.$lastKey = v.role === 'near' ? key : null;
    const x = {
      a: v.a, step: v.step, exit: v.exit || 0, arrive: v.arrive ?? 1, dur: sl.dur, holds: sl.holds || [], live: !RENDER, g,
      cam: v.o ? { dx: v.o.dx, dy: v.o.dy, dz: v.o.dz, rz: v.o.rz } : { dx: 0, dy: 0, dz: 0, rz: 0 }, speed: v.role === 'near' ? 0 : F.speed,
      enter: sl.$enter, inner: sl.$inner, role: v.role,
    };
    const t0 = performance.now();
    try { sl.render && sl.render.call(sl, v.t, x); } catch (e) { console.error('[DECK] render 오류', sl.id, e); }
    return performance.now() - t0;
  }
  function draw(F, g) {
    const t0 = performance.now();
    let rt = 0, bt = 0;
    setMode(F.mode === '3d' ? '3d' : '2d');
    setWill(F.mode === '3d');
    let M = null;
    if (F.mode === '3d') { set(world, 'transform', camCSS(F.cam)); M = camMatrix(F.cam); }
    const now = new Set();
    F.views.forEach((v, idx) => {
      const sl = slides[v.i];
      if (!sl.$ready || v.world === false && !sl.$isVideo) return;
      let op = 1, tf;
      if (F.mode === '3d') {
        const pr = project(M, sl.$pose);
        if (!pr.on && v.role !== 'cur' && v.role !== 'from') return;
        op = pr.on ? pr.fade * (1 - F.ghost) : 0;
        tf = sl.$poseCSS;
      } else tf = v.tf || rest2D(v.o || { dx: 0, dy: 0, dz: 0, rz: 0, rx: 0, ry: 0 });
      if (v.op != null) op *= v.op;
      if (v.world === false) op = 0;
      const el = sl.el;
      now.add(v.i);
      if (el.style.display === 'none') el.style.display = '';
      set(el, 'transform', tf);
      set(el, 'opacity', op >= 0.999 ? '' : op.toFixed(3));
      set(el, 'visibility', op <= 0.002 ? 'hidden' : '');
      set(el, 'zIndex', String(10 + idx));
      // 평면 밀기 중 화면 틀 자르기(frameClip). 쓰지 않을 때는 한 번만 지운다(슬라이드가 el.style.clipPath를 쓰지 않으므로 엔진만 건드린다)
      const clip = v.clip || '';
      if (clip || sl.$clipOn) { set(el, 'clipPath', clip); sl.$clipOn = !!clip; }
      // will-change: 발표 모드 3D 전환 중(가까운 앞뒤 슬라이드 제외), zoom-through의 나가는 슬라이드, 평면 밀기 중인 두 슬라이드만.
      // 커지는 슬라이드에 켜면 작은 배율로 굳은 텍스처가 늘어나 흐려진다(평면 밀기는 배율이 그대로라 해당 없음)
      set(el, 'willChange', !RENDER && ((F.mode === '3d' && v.role !== 'near') || (F.mode === 'zoom' && v.role === 'from') || F.flat) ? 'transform' : 'auto');
      // 슬라이드 판: 3D 전환 중에만
      const pl = sl.$plate;
      if (pl) {
        const po = F.mode === '3d' && sl.plate !== false ? F.plate * op * (sl.$light ? 1 : 0.85) : 0;
        if (po > 0.003) { if (pl.style.display === 'none') pl.style.display = ''; set(pl, 'transform', sl.$poseCSS + ' translateZ(-2px)'); set(pl, 'opacity', po.toFixed(3)); }
        else if (pl.style.display !== 'none') pl.style.display = 'none';
      }
      if (op > 0.002 || sl.$isVideo) rt += renderSlide(sl, v, F, g);
    });
    for (const i of drawnNow) if (!now.has(i)) {
      const sl = slides[i];
      sl.el.style.display = 'none';
      if (sl.$plate) sl.$plate.style.display = 'none';
      if (sl.$isVideo && sl.$v) sl.$v.box.style.display = 'none';
      sl.$lastKey = null;
    }
    drawnNow.clear(); for (const i of now) drawnNow.add(i);
    // 썸네일 평면: 크게 물러날 때(F.ghost) 모든 슬라이드에, 3D 전환 중에는 그리지 않는 슬라이드(화면에 들어온 먼 슬라이드)에 판 세기(F.plate)만큼.
    // 썸네일 파일이 없을 때의 번호·제목 글자는 크게 물러났을 때만 보인다
    const gOn = new Set();
    const pass = F.mode === '3d' ? F.plate : 0;
    if (F.mode === '3d' && (F.ghost > 0.01 || pass > 0.01)) {
      const gtOp = smooth(0.15, 0.6, F.ghost).toFixed(3);
      slides.forEach((sl, i) => {
        if (!sl.$ghost || sl.$isVideo || F.hide.has(i)) return;
        const gv = now.has(i) ? F.ghost : Math.max(F.ghost, pass);
        if (gv <= 0.01) return;
        const pr = project(M, sl.$pose);
        if (!pr.vis) return;
        gOn.add(i);
        const gh = sl.$ghost;
        if (gh.style.visibility === 'hidden') gh.style.visibility = '';
        // 뒤에서 보이는 썸네일 평면은 뒤집어 붙인다(글자가 좌우로 뒤집혀 보이지 않게. 개관 화면에서 모든 슬라이드를 고를 수 있게)
        if (gh.$flip !== pr.back) { gh.$flip = pr.back; gh.style.transform = sl.$poseCSS + (pr.back ? ' rotateY(180deg) translateZ(1px)' : ' translateZ(1px)') + ' scale(3)'; }
        set(gh, 'opacity', (gv * pr.fade).toFixed(3));
        if (sl.$gt) set(sl.$gt, 'opacity', gtOp);
        gh.classList.toggle('sel', i === F.sel);
        gh.classList.toggle('here', F.sel < 0 && drawnNow.has(i) && F.views.some(v => v.i === i && v.role === 'cur'));
      });
    }
    for (const i of ghostsOn) if (!gOn.has(i)) slides[i].$ghost.style.visibility = 'hidden';
    ghostsOn.clear(); for (const i of gOn) ghostsOn.add(i);
    set(world, 'pointerEvents', F.sel >= 0 ? 'auto' : 'none');
    // 흐림(원근 층에만)
    set(view, 'filter', F.blur > 0.25 ? `blur(${F.blur.toFixed(2)}px)` : 'none');
    // 배경 층: 두 배경을 섞고, 카메라 속도만큼 조금 움직인다
    const wsum = {};
    for (const [n, w] of F.bg) if (n) wsum[n] = (wsum[n] || 0) + w;
    // 배경 카메라: 3D 모드는 지금 카메라, 평면 밀기 모드는 배치와 무관한 머묾 오프셋(F.bgCam, 배경마다 다르면 F.bgCams)
    const camOf = n => {
      const c = (F.bgCams && F.bgCams[n]) || F.bgCam || F.cam;
      return { x: c.x, y: c.y, z: c.z, rx: c.rx, ry: c.ry, rz: c.rz, D: c.D, speed: F.bgCam || F.bgCams ? 0 : F.speed };
    };
    const wp = F.wipe;
    for (const n in bgs) {
      const b = bgs[n], w = clamp(wsum[n] || 0);
      if (!b.el) continue;
      if (w <= 0.001) { if (b.el.style.display !== 'none') b.el.style.display = 'none'; continue; }
      if (b.el.style.display === 'none') b.el.style.display = '';
      set(b.el, 'opacity', w >= 0.999 ? '' : w.toFixed(3));
      // wipe: 새 배경을 위에 올리고 마스크로 가린다(섞지 않음)
      const mk = wp && n === wp.to ? wp.mask : '';
      set(b.el, 'zIndex', wp && (n === wp.to || n === wp.from) ? (n === wp.to ? '2' : '1') : '');
      set(b.el, 'webkitMaskImage', mk); set(b.el, 'maskImage', mk);
      // 평면 밀기에서 배경이 다르면 배경도 제 슬라이드와 함께 민다. 층 밖으로 넓게 그린 격자(grid 3배 폭 등)가 이웃 자리로 넘어오지 않게 자른다
      const bx = F.bgX ? F.bgX[n] : undefined;
      set(b.el, 'transform', bx != null ? `translate(${bx.toFixed(2)}px, 0px)` : '');
      set(b.el, 'overflow', F.bgX ? 'hidden' : '');
      set(b.el, 'willChange', F.bgX && !RENDER ? 'transform' : 'auto');
      const tb = performance.now();
      try { b.render && b.render.call(b, g, w, camOf(n)); } catch (e) { console.error('[DECK] bg 오류', n, e); }
      bt += performance.now() - tb;
    }
    // 배경 층 전체의 속도 밀림·확대는 3D 전환에서만(평면 밀기 모드에서는 배경 층을 고정)
    const bsp = F.bgCam || F.bgCams ? 0 : F.speed;
    const vl = Math.hypot(F.vx, F.vy) || 1, shift = Math.min(36, bsp * 46);
    const bs = 1 + 0.045 * bsp + 0.05 * F.zoomE;
    set(bgLayer, 'transform', bs > 1.0005 ? `translate(${(-F.vx / vl * shift).toFixed(1)}px, ${(-F.vy / vl * shift).toFixed(1)}px) scale(${bs.toFixed(4)})` : 'none');
    drawChrome(F);
    const total = performance.now() - t0;
    perfRec.engine = total - rt - bt; perfRec.render = rt; perfRec.bg = bt; perfRec.frames++;
  }

  // ───────────────────────── 공통 크롬(화면 고정, #top 층) ─────────────────────────
  // 경로 줄·출처 줄·예시 표시를 엔진이 한 번에 그린다. 화면에 고정되어 drift·dolly-in·track 카메라를 따라 움직이지 않는다.
  // 같은 경로끼리 넘기면 그대로 있고, 경로가 바뀌는 전환(장 경계 pull-out 등)에서는 공통 앞부분(비밀노트/)만 남기고 지운 뒤 새 파일 이름을 타자로 찍는다.
  // 상태는 compose가 만든 F.ci(전환 상대·진행률·빌드)만으로 정한다(이전 프레임 값을 쓰지 않음)
  let chromeEl = null, chPath, chPathTx, chCur, chSrc, chEx, chSrcB, chExB, chNum;
  function buildChrome() {
    chromeEl = h('div', 'chrome', topLayer);
    chPath = h('div', 'ch-path', chromeEl); chPathTx = h('span', '', chPath); chCur = h('span', 'ch-cur', chPath);
    chSrc = h('div', 'ch-src', chromeEl);
    chEx = h('div', 'ch-ex', chromeEl);
    // 평면 밀기 중 들어오는 슬라이드의 출처 줄·예시 표시(앞 슬라이드 것과 글이 다를 때 두 개가 함께 밀린다)
    chSrcB = h('div', 'ch-src', chromeEl);
    chExB = h('div', 'ch-ex', chromeEl);
    chNum = h('div', 'ch-num', chromeEl);   // 쪽 번호(지금 번호 / 전체 장 수)
    for (const el of [chPath, chSrc, chEx, chSrcB, chExB, chNum]) el.style.opacity = '0';
  }
  const chromeAt = i => (i == null || !slides[i] ? null : slides[i].$chrome);
  // 출처 줄이 보이는 정도: 지정한 빌드에 들어선 뒤 0.5초에 걸쳐 나타난다
  function srcVis(i, t, k) {
    const c = chromeAt(i), s2 = c && c.source;
    if (!s2 || k < s2.step) return 0;
    const st = stops(slides[i]), t0 = s2.step === 0 ? (s2.at ?? 0.3) : st[s2.step - 1] + (s2.at ?? 0.2);
    return prog(t, t0, 0.5);
  }
  function exVis(i, t) { const c = chromeAt(i); return c && c.example ? prog(t, 0.15, 0.45) : 0; }
  function commonPrefix(a, b) { const A = [...a], B = [...b]; let n = 0; while (n < A.length && n < B.length && A[n] === B[n]) n++; return n; }
  function drawChrome(F) {
    if (!chromeEl) return;
    const ci = F.ci, cA = chromeAt(ci.a), cB = chromeAt(ci.b), e = ci.a == null ? 1 : clamp(ci.e);
    const pA = cA && cA.path, pB = cB && cB.path;
    let text = '', op = 0, cur = false;
    if (ci.a == null || e >= 1 || pA === pB) { text = pB || ''; op = pB ? 1 : 0; }
    else if (pA && pB) {
      const np = commonPrefix(pA, pB), A = [...pA], B = [...pB];
      if (e < 0.5) text = A.slice(0, Math.round(lerp(A.length, np, ease.inOutSine(clamp((e - 0.06) / 0.36))))).join('');
      else text = B.slice(0, Math.round(lerp(np, B.length, clamp((e - 0.52) / 0.38)))).join('');
      op = 1; cur = e > 0.04 && e < 0.96;
    } else if (pA) { text = pA; op = 1 - smooth(0.05, 0.45, e); }
    else { text = pB; op = smooth(0.45, 0.95, e); }
    if (chPathTx.textContent !== text) chPathTx.textContent = text;
    set(chCur, 'display', cur ? '' : 'none');
    set(chPath, 'opacity', op >= 0.999 ? '1' : op.toFixed(3));
    // 글자색: 어두운 바탕 mut ↔ 밝은 바탕 paperInk2. 평면 밀기 중에는 왼쪽(경로 줄)과 오른쪽(출처 줄·예시 표시) 아래 바탕을 따로 본다
    const colOf = l => (l < 0.002 ? 'var(--mut)' : l > 0.998 ? 'var(--paperInk2)' : `color-mix(in srgb, var(--paperInk2) ${(l * 100).toFixed(1)}%, var(--mut))`);
    const lw = clamp(F.lightR ?? F.lightW ?? 0), lp = clamp(F.lightL ?? F.lightW ?? 0);
    set(chPath, 'color', colOf(lp));
    // 쪽 번호: 두 슬라이드 모두 번호가 있으면 밀기 가운데에서 바꾸고, 한쪽(영상·대기 화면)만 있으면 경로 줄처럼 사라지거나 나타난다
    {
      const nA = ci.a != null && cA && cA.num, nB = cB && cB.num;
      let ni = ci.b, no = nB ? 1 : 0;
      if (ci.a != null && e < 1) {
        if (nA && nB) { ni = e < 0.5 ? ci.a : ci.b; no = 1; }
        else if (nA) { ni = ci.a; no = 1 - smooth(0.05, 0.45, e); }
        else if (nB) no = smooth(0.55, 0.95, e);
      }
      const nt = ni == null ? '' : `${ni + 1} / ${slides.length}`;
      if (chNum.textContent !== nt) chNum.textContent = nt;
      set(chNum, 'opacity', no >= 0.999 ? '1' : clamp(no).toFixed(3));
      set(chNum, 'color', colOf(clamp(F.lightR ?? F.lightW ?? 0)));
    }
    const tA = cA && cA.source ? cA.source.text : null, tB = cB && cB.source ? cB.source.text : null;
    const xA = cA && cA.example, xB = cB && cB.example;
    // put: 글·보이는 정도·가로 이동·밝기(예시 표시의 light 모양)를 한 요소에 쓴다
    const put = (el, text, op, x, l, isEx) => {
      if (text && el.textContent !== text) el.textContent = text;
      set(el, 'opacity', (text ? clamp(op) : 0).toFixed(3));
      set(el, 'transform', x ? `translate(${x.toFixed(2)}px, 0px)` : '');
      if (isEx) el.classList.toggle('light', l > 0.5); else set(el, 'color', colOf(l));
    };
    if (F.flatX && ci.a != null && e < 1) {
      // 평면 밀기: 출처 줄·예시 표시는 슬라이드마다 다른 내용이라 제 슬라이드와 함께 밀린다(화면에 고정하면 경계가 먼저 지나가
      // 앞 슬라이드 출처가 다음 슬라이드 바탕 위에 남는다). 두 슬라이드의 글이 같으면 경로 줄처럼 화면에 고정한다
      const lA = lightOf(ci.a), lB = lightOf(ci.b), vA = srcVis(ci.a, ci.tA, ci.kA), vB = srcVis(ci.b, ci.tB, ci.kB);
      if (tA && tA === tB) { put(chSrc, tA, Math.max(vA, vB), 0, lw); put(chSrcB, null, 0, 0, lw); }
      else { put(chSrc, tA, vA, F.flatX.a, lA); put(chSrcB, tB, vB, F.flatX.b, lB); }
      const wA = exVis(ci.a, ci.tA), wB = exVis(ci.b, ci.tB);
      if (xA && xA === xB) { put(chEx, xA, Math.max(wA, wB), 0, lw, true); put(chExB, null, 0, 0, lw, true); }
      else { put(chEx, xA, wA, F.flatX.a, lA, true); put(chExB, xB, wB, F.flatX.b, lB, true); }
      return;
    }
    put(chSrcB, null, 0, 0, lw); put(chExB, null, 0, 0, lw, true);
    // 출처 줄: 같은 글이면 이어서 보이고, 다르면 앞 슬라이드 것이 사라진 뒤 다음 것이 나타난다
    const oA = ci.a == null ? 0 : srcVis(ci.a, ci.tA, ci.kA) * (1 - smooth(0, 0.4, e)), oB = srcVis(ci.b, ci.tB, ci.kB) * (ci.a == null ? 1 : smooth(0.5, 0.9, e));
    let st = tB, so = oB;
    if (tA && tA === tB) so = Math.max(oA, oB);
    else if (oA > 0.001 && e < 0.5) { st = tA; so = oA; }
    put(chSrc, st, so, 0, lw);
    // 예시 표시
    const eA = ci.a == null ? 0 : exVis(ci.a, ci.tA) * (1 - smooth(0, 0.4, e)), eB = exVis(ci.b, ci.tB) * (ci.a == null ? 1 : smooth(0.5, 0.9, e));
    let xt = xB, xo = eB;
    if (xA && xA === xB) xo = Math.max(eA, eB);
    else if (eA > 0.001 && e < 0.5) { xt = xA; xo = eA; }
    put(chEx, xt, xo, 0, lw, true);
  }

  // ───────────────────────── 자리 표시 슬라이드 ─────────────────────────
  // 스토리보드에는 있는데 코드로 등록되지 않은 슬라이드를 번호·제목·화면 문구 카드로 그린다(장 파일이 비어 있어도 102장 카메라 경로를 볼 수 있게).
  // 영상 슬라이드(type 'video'와 video 값)는 DECK.videoSlide와 같은 슬라이드를 만든다(파일이 없으면 "영상 준비 중").
  // 덱 순서는 스토리보드 순서다. 스토리보드에 없는 id로 등록한 슬라이드는 등록 순서상 바로 앞 슬라이드 뒤에 둔다.
  // 방식: ?placeholders= 또는 <meta name="deck-placeholders" content="…">  all(기본) | chapters(불러온 장 파일의 장만) | off
  //   tools의 --files(_only.html, _audit_only.html)는 기본이 chapters다(그 장만 검수)
  const PH_STEP = 1.0;
  function phMode() {
    const v = String(params.get('placeholders') || metaContent('deck-placeholders') || '').trim();
    if (['all', 'chapters', 'off'].includes(v)) return v;
    return /\/_(?:audit_)?only\.html$/.test(location.pathname) ? 'chapters' : 'all';
  }
  function placeholderDef(sb) {
    const nb = Math.max(1, Array.isArray(sb.builds) ? sb.builds.length : 1);
    if (sb.type === 'video' && sb.video) {
      const d = prep(videoDef({ id: sb.id, video: sb.video }), null);
      d.$placeholder = true;
      return d;
    }
    const holds = [];
    for (let k = 1; k < nb; k++) holds.push(k * PH_STEP);
    const def = { id: sb.id, holds, dur: nb * PH_STEP, $placeholder: true, setup(el) { phSetup(this, el); }, render(t, x) { phRender(this, t, x); } };
    // inner track이면 카메라가 빌드마다 조금씩 옮겨 가는 기본 경로(글자가 화면 밖으로 나가지 않을 만큼만)
    if (sb.camera && sb.camera.inner === 'track') def.camTrack = Array.from({ length: nb }, (_, k) => (k === 0 ? [960, 540, 1] : [960 + (k % 2 ? 40 : -40), 530 + 10 * (k % 3), 1.04]));
    return prep(def, null);
  }
  function injectPlaceholders() {
    if (!SB || !Array.isArray(SB.slides) || !SB.slides.length) return 0;
    const mode = phMode();
    const first = new Map(), extras = new Map();
    let key = '^';
    for (const sl of slides) {
      if (SBMAP.has(sl.id) && !first.has(sl.id)) { first.set(sl.id, sl); key = sl.id; continue; }
      if (SBMAP.has(sl.id)) console.warn('[DECK] 같은 id를 두 번 등록함(뒤의 것은 등록 순서상 앞 슬라이드 다음에 둠):', sl.id, sl.$file || '');
      if (!extras.has(key)) extras.set(key, []);
      extras.get(key).push(sl);
    }
    const regOrder = [...first.keys()].join('|'), sbOrder = SB.slides.map(x => x.id).filter(id => first.has(id)).join('|');
    if (regOrder !== sbOrder) console.warn('[DECK] 슬라이드 등록 순서가 스토리보드와 다름 — 스토리보드 순서로 놓는다');
    const loaded = new Set([...document.querySelectorAll('script[src]')].map(sc => norm(relSrc(sc.src))));
    const chOn = new Set();
    for (const sl of first.values()) chOn.add(SBMAP.get(sl.id).chapter);
    for (const c of SB.chapters || []) if (c.file && loaded.has(norm(c.file))) chOn.add(c.id);
    const out = [...(extras.get('^') || [])];
    let nph = 0;
    for (const sb of SB.slides) {
      let sl = first.get(sb.id);
      if (!sl) {
        if (mode === 'off' || (mode === 'chapters' && !chOn.has(sb.chapter))) continue;
        sl = placeholderDef(sb); nph++;
      }
      out.push(sl, ...(extras.get(sb.id) || []));
    }
    slides.length = 0; slides.push(...out);
    return nph;
  }
  function fitFont(el, max, min, lim, axis) {
    for (let f = max; f >= min; f -= 2) { el.style.fontSize = f + 'px'; if ((axis === 'w' ? el.scrollWidth : el.scrollHeight) <= lim) return f; }
    return min;
  }
  function phSetup(sl, el) {
    const sb = sl.$sb || {}, $ = sl.$;
    const box = $.ph = h('div', 'ph' + (sl.$light ? ' light' : ''), el);
    $.glow = h('div', 'ph-glow', box); $.glow2 = h('div', 'ph-glow', box);
    h('div', 'ph-frame', box);
    h('div', 'ph-num', box).textContent = String(sl.index + 1);
    h('div', 'ph-meta', box).textContent = [sl.id, sl.$type || '', `${sl.$enter} → ${sl.$inner}`].filter(Boolean).join(' · ');
    const ti = h('div', 'ph-title', box); ti.textContent = sl.$title || sl.id;
    fitFont(ti, 60, 40, 1210, 'w');
    const ls = h('div', 'ph-lines', box);
    const lines = (sb.screen || []).map(String).filter(Boolean);
    for (const ln of lines.length ? lines : ['(화면 문구 없음)']) h('div', 'ph-line', ls).textContent = ln;
    fitFont(ls, 36, 30, 362, 'h');
    $.bl = h('div', 'ph-build', box);
    $.blN = h('span', 'ph-bn', $.bl); $.blT = h('span', 'ph-bt', $.bl);
    $.builds = (sb.builds || []).map(String);
    const nx = slides[sl.index + 1];
    h('div', 'ph-tag', box).textContent = '자리 표시' + (sl.$chapter && sl.$chapter.file ? ' · ' + sl.$chapter.file : '') + (nx && nx.$enter === 'zoom-through' ? ' · 다음 zoom-through' : '');
    if (sl.$zoomT) { const z = h('div', 'ph-zoom', box); css(z, { left: sl.$zoomT.x - 70 + 'px', top: sl.$zoomT.y - 70 + 'px' }); }
  }
  function phRender(sl, t, x) {
    const $ = sl.$;
    if (!$.ph) return;
    const N = Math.max(1, $.builds.length), k = clamp(x.step, 0, N - 1);
    const lab = `빌드 ${k + 1}/${N}`;
    if ($.blN.textContent !== lab) { $.blN.textContent = lab; $.blT.textContent = $.builds[k] || ''; }
    const st = stops(sl), p = k === 0 ? 1 : prog(t, st[k - 1], 0.45);
    $.blT.style.opacity = (0.3 + 0.7 * p).toFixed(3);
    $.blT.style.transform = `translateY(${((1 - p) * 14).toFixed(1)}px)`;
    // 멈춘 화면이 되지 않게 옅은 빛 두 개가 위상을 90° 달리해 오간다(한쪽이 방향을 바꿀 때 다른 쪽은 가장 빠름)
    const ph = x.a * 0.5 + sl.index;
    $.glow.style.transform = `translateX(${(620 * Math.sin(ph)).toFixed(1)}px)`;
    $.glow2.style.transform = `translate(${(560 * Math.cos(ph)).toFixed(1)}px, ${(120 * Math.sin(ph * 0.7)).toFixed(1)}px)`;
  }

  // ───────────────────────── 지연 탑재 ─────────────────────────
  function ensure(i) {
    const sl = slides[i];
    if (!sl || sl.$ready) return sl ? sl.$wait : null;
    const el = sl.el, n0 = waits.length;
    el.style.display = ''; el.style.visibility = 'hidden'; el.style.transform = 'none';
    let r = null;
    try { r = sl.setup ? sl.setup.call(sl, el) : null; } catch (e) { console.error('[DECK] setup 오류', sl.id, e); }
    el.style.visibility = ''; el.style.display = 'none';
    sl.$ready = true;
    const ws = waits.slice(n0);
    if (r && typeof r.then === 'function') ws.push(r.catch(e => console.error('[DECK] setup 오류', sl.id, e)));
    sl.$wait = ws.length ? Promise.all(ws).then(() => null) : null;
    return sl.$wait;
  }
  function ensureAround(i, before = 2, after = 2) {
    const ps = [];
    for (let k = i - before; k <= i + after; k++) { const p = ensure(k); if (p) ps.push(p); }
    return ps;
  }

  // ───────────────────────── 영상 슬라이드 ─────────────────────────
  const VIDEO_OPEN = ['cut', 'band', 'fade'];
  function videoDef(o) {
    const name = o.video || o.id;
    const src = o.src || `assets/video/${name}.mp4`;
    const poster = o.poster || `assets/video/${name}_poster.jpg`;
    let open = o.open || VOPEN.byId.get(o.id) || VOPEN.all || 'cut';
    if (!VIDEO_OPEN.includes(open)) { console.warn('[DECK] 알 수 없는 영상 open 값, cut으로 둠:', o.id, open); open = 'cut'; }
    return Object.assign({}, o, {
      type: 'video', holds: [], dur: Number(o.seconds) || 10, lead: 0, ownExit: true, plate: false,
      $isVideo: true, $vname: name, $vsrc: src, $vposter: poster, $sec0: o.seconds || null, $open: open,
      setup(el) { setupVideo(this); },
      render(t, x) { renderVideo(this, t, x); },
    });
  }
  function videoSlide(o) { return slide(videoDef(o)); }
  function setupVideo(sl) {
    const box = h('div', 'vslide', videoLayer);
    box.style.display = 'none';
    const V = sl.$v = { box, video: null, poster: null, card: null, failed: false };
    const fallback = () => {
      if (V.poster || V.card) return;
      if (has(sl.$vposter) !== false && !V.posterTried) {
        V.posterTried = true;
        const im = img(sl.$vposter); V.poster = im; im.className = 'vposter'; box.appendChild(im);
        if (im.missing) { im.remove(); V.poster = null; }
      }
      if (!V.poster) {
        V.card = h('div', 'vcard', box, `<div class="vglow"></div><div class="vk">영상 준비 중</div><div class="vt"></div><div class="vf"></div>`);
        V.glow = V.card.querySelector('.vglow');
        V.card.querySelector('.vt').textContent = sl.$title || sl.id;
        V.card.querySelector('.vf').textContent = `${sl.$vsrc} · ${Math.round(sl.dur)}초`;
        V.prog = h('div', 'vbar', V.card); V.progIn = h('i', '', V.prog);
      }
    };
    if (sl.$vok) {
      const v = h('video', '', box);
      v.preload = 'auto'; v.playsInline = true; v.muted = RENDER || !snd.on; v.src = sl.$vsrc;
      v.addEventListener('error', () => { if (V.failed) return; V.failed = true; console.warn('[DECK] 영상 재생 실패, 대체 화면:', sl.$vsrc); v.remove(); V.video = null; fallback(); });
      V.video = v;
      if (RENDER) waits.push(new Promise(res => { if (v.readyState >= 2) return res(); v.addEventListener('loadeddata', () => res(), { once: true }); v.addEventListener('error', () => res(), { once: true }); setTimeout(res, 8000); }));
    } else fallback();
  }
  function renderVideo(sl, t, x) {
    const V = sl.$v; if (!V) return;
    const open = x.arrive < 1 ? ease.inOutCubic(clamp(x.arrive)) : 1;
    const close = x.exit > 0 ? 1 - ease.inOutCubic(clamp(x.exit / 0.6)) : 1;
    const v = Math.min(open, close);
    if (v <= 0.002) { if (V.box.style.display !== 'none') V.box.style.display = 'none'; return; }
    if (V.box.style.display === 'none') V.box.style.display = '';
    // 열림 모양(4차): open 'band'만 가운데 띠 + 1.04→1배. 'cut'은 x.arrive가 처음부터 1이라 여기 오지 않고,
    // 'fade'와 번호 이동으로 들어오는 'cut' 영상은 투명도만 바꾼다(배율·띠가 없어 앞 화면 글자와 어긋나지 않음).
    // 닫힘(3D 모드에서 영상 슬라이드를 떠날 때 x.exit)은 이전과 같은 띠
    if (sl.$open === 'band' || close < 1) {
      const ins = ((1 - v) * 50).toFixed(2);
      set(V.box, 'clipPath', v >= 0.999 ? 'none' : `inset(${ins}% 0 ${ins}% 0)`);
      set(V.box, 'transform', v >= 0.999 ? 'none' : `scale(${(1.04 - 0.04 * v).toFixed(4)})`);
      set(V.box, 'opacity', v >= 0.999 ? '' : smooth(0, 0.35, v).toFixed(3));
    } else {
      set(V.box, 'clipPath', 'none');
      set(V.box, 'transform', 'none');
      set(V.box, 'opacity', v >= 0.999 ? '' : v.toFixed(3));
    }
    if (V.progIn) set(V.progIn, 'transform', `scaleX(${clamp(t / Math.max(0.01, sl.dur)).toFixed(4)})`);
    if (V.card) {
      set(V.card.querySelector('.vk'), 'opacity', (0.75 + 0.25 * Math.sin(x.a * 2.4)).toFixed(3));
      set(V.glow, 'transform', `translateX(${(510 + 620 * Math.sin(x.a * 0.35)).toFixed(1)}px)`);   // 멈춘 화면이 되지 않게 옅은 빛이 좌우로 오간다
    }
  }
  // render 모드: 영상의 지금 프레임으로 탐색하고, seeked와 그 프레임이 화면에 올라온 것(requestVideoFrameCallback)을 기다린다.
  // 4차: 메타데이터를 읽기 전(readyState 0)이면 loadedmetadata 뒤에 탐색한다. 3초 안에 seeked가 오지 않으면 한 번 더 탐색한다.
  // 탐색이 끝나지 않은 채 찍으면 영상 슬라이드 스틸이 0프레임으로 남았다(서버가 HTTP Range를 지원하지 않을 때 특히. tools/lib.mjs serve는 지원)
  function seekVideo(sl, t) {
    const V = sl.$v, v = V && V.video;
    if (!v) return null;
    const go = () => {
      const target = clamp(t, 0, Math.max(0, (isFinite(v.duration) ? v.duration : sl.dur) - 0.04));
      if (Math.abs(v.currentTime - target) < 0.004 && v.readyState >= 2 && !v.seeking) return null;
      return new Promise(res => {
        let done = false, seeked = false, framed = !v.requestVideoFrameCallback, to = 0;
        const fin = () => { if (done) return; done = true; clearTimeout(to); res(); };
        const chk = () => { if (seeked && framed) fin(); };
        if (!framed) v.requestVideoFrameCallback(() => { framed = true; chk(); });
        v.addEventListener('seeked', () => {
          seeked = true;
          if (!framed) setTimeout(() => { framed = true; chk(); }, 300);   // 같은 프레임이면 콜백이 오지 않는다
          chk();
        }, { once: true });
        to = setTimeout(() => { if (done) return; console.warn('[DECK] 영상 탐색이 3초 안에 끝나지 않아 다시 탐색:', sl.$vsrc, target.toFixed(2)); v.currentTime = target; to = setTimeout(fin, 5000); }, 3000);
        v.currentTime = target;
      });
    };
    if (v.readyState >= 1) return go();
    return new Promise(res => {
      let done = false;
      const fin = () => { if (done) return; done = true; res(); };
      v.addEventListener('loadedmetadata', () => { const p = go(); if (p) p.then(fin); else fin(); }, { once: true });
      v.addEventListener('error', fin, { once: true });
      setTimeout(fin, 8000);
    });
  }
  async function probeVideos() {
    const list = slides.filter(sl => sl.$isVideo);
    await Promise.all(list.map(sl => new Promise(res => {
      sl.$vok = has(sl.$vsrc) !== false;
      if (!sl.$vok) { console.warn('[DECK] 영상 파일 없음, 대체 화면으로 둠:', sl.$vsrc); return res(); }
      const v = document.createElement('video');
      v.preload = 'metadata'; v.muted = true;
      let fin = false;
      const done = ok => { if (fin) return; fin = true; if (ok && isFinite(v.duration) && v.duration > 0) { sl.dur = v.duration; sl.$vsecFixed = true; } else { sl.$vok = false; console.warn('[DECK] 영상 메타데이터를 읽지 못함, 대체 화면:', sl.$vsrc); } v.removeAttribute('src'); v.load(); res(); };
      v.addEventListener('loadedmetadata', () => done(true), { once: true });
      v.addEventListener('error', () => done(false), { once: true });
      setTimeout(() => done(false), 6000);
      v.src = sl.$vsrc;
    })));
  }

  // ───────────────────────── render 모드: 한 줄 타임라인 ─────────────────────────
  // 슬라이드마다: 들어오는 전환 시작(g0) → t 대기(delay) → lead → 첫 멈춤까지 재생 → HOLD … → 끝 멈춤 FINAL_HOLD → 다음 슬라이드 전환 시작
  let plan = null;
  function buildPlan() {
    let g = 0;
    const out = [];
    for (let i = 0; i < slides.length; i++) {
      const sl = slides[i], st = stops(sl), lead = sl.$lead;
      const g0 = g, gs = g0 + (i ? sl.$delay : 0);
      const segs = [];
      let tt = -lead, gg = gs;
      st.forEach((stop, k) => {
        const play = Math.max(0, stop - tt);
        segs.push({ k, g0: gg, g1: gg + play, t0: tt, t1: stop, hold: false });
        gg += play; tt = stop;
        const hd = k === st.length - 1 ? FINAL_HOLD : HOLD;
        segs.push({ k, g0: gg, g1: gg + hd, t0: stop, t1: stop, hold: true });
        gg += hd;
      });
      if (i > 0) gg = Math.max(gg, g0 + sl.$trans);
      out.push({ i, g0, gs, gEnd: gg, td: i ? sl.$trans : 0, segs, holdsAt: segs.filter(x => x.hold).map(x => x.g0) });
      g = gg;
    }
    const last = out[out.length - 1];
    plan = { items: out, duration: last ? last.gEnd + 0.4 : 1 };
  }
  function stateAt(g) {
    const items = plan.items;
    let lo = 0, hi = items.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (items[m].g0 <= g) lo = m; else hi = m - 1; }
    const it = items[lo], sl = slides[it.i], st = stops(sl);
    let t = -sl.$lead, k = 0;
    if (g >= it.gs) {
      let found = false;
      for (const sg of it.segs) if (g >= sg.g0 && g < sg.g1) { k = sg.k; t = sg.hold ? sg.t1 : lerp(sg.t0, sg.t1, (g - sg.g0) / Math.max(1e-6, sg.g1 - sg.g0)); found = true; break; }
      if (!found) { t = sl.dur; k = st.length - 1; }
    }
    const S = { cur: it.i, t, k, a: g - it.g0 - sl.$lead, g, trans: null, ov: null };
    if (lo > 0 && it.td > 0 && g < it.g0 + it.td) {
      const pi = items[lo - 1], ps = slides[pi.i];
      S.trans = { from: pi.i, t: ps.dur, k: stops(ps).length - 1, a: g - pi.g0 - ps.$lead, e: (g - it.g0) / it.td, dur: it.td, type: sl.$enter, dir: 1 };
    }
    return S;
  }
  function seekLinear(g) {
    g = Number(g) || 0;
    return seekState(stateAt(g), g);
  }
  // 점검용(render 모드): n번 슬라이드에서 ←로 n-1번에 돌아가는 전환의 진행률 e 화면. 발표 모드 prev()와 같은 규칙
  // (평면 밀기 경계면 반대 방향 밀기, cut·영상 경계면 바로 바뀜). tools/shoot.mjs --back이 쓴다
  function seekBack(n, e) {
    const i = clamp(Math.round(Number(n)) - 1, 1, slides.length - 1), j = i - 1;
    const A = slides[i], B = slides[j], type = backType(j, i);
    e = clamp(Number(e) || 0);
    const S = { cur: j, t: B.dur, k: stops(B).length - 1, a: B.dur + 0.5 + e * FLAT_DUR, g: 0, ov: null,
      trans: type && e < 1 ? { from: i, t: stops(A)[0], k: 0, a: stops(A)[0] + 1.5, e, dur: FLAT_DUR, type, dir: -1, rev: true } : null };
    return seekState(S, plan.items[j].g0 + 50 + e);
  }
  function seekState(S, g) {
    const F = compose(S);
    // 그릴 슬라이드를 모두 먼저 탑재한다(탐색 이력에 따라 앞뒤 슬라이드가 그려지거나 빠지면 같은 g의 스틸이 달라진다)
    const pend = [];
    for (const i of new Set([...F.views.map(v => v.i), S.cur + 1])) { const p = ensure(i); if (p) pend.push(p); }
    const vids = () => {
      const ps = [];
      for (const i of [S.cur, S.trans && S.trans.from]) {
        if (i == null) continue;
        const sl = slides[i];
        if (sl.$isVideo) { const p = seekVideo(sl, i === S.cur ? S.t : sl.dur); if (p) ps.push(p); }
      }
      return ps;
    };
    const finish = () => { draw(F, g); window.__t = g; };
    if (pend.length) return Promise.all(pend).then(() => Promise.all(vids())).then(finish);
    const vp = vids();
    if (vp.length) return Promise.all(vp).then(finish);
    finish();
    return undefined;
  }

  // ───────────────────────── 소리(발표 모드) ─────────────────────────
  // deck/sound.js 의 표(빌드 번호, 빌드 시작 뒤 초, 소리, dB)대로 빌드가 재생되는 동안 효과음을 낸다.
  // 브라우저 자동 재생 정책 때문에 첫 키 입력·클릭에서 오디오가 켜진다. M 으로 모든 소리(영상 포함)를 켜고 끈다.
  const SOUND = window.SOUND || null;
  const snd = { ctx: null, master: null, buf: {}, on: true, loading: null, bgm: null, bgmG: null, bgmBufs: {}, bgmKey: null, cur: -1, k: -1, prevDt: Infinity, armed: false };
  try { snd.on = localStorage.getItem('deck-sound') !== 'off'; } catch (e) { /* 저장소를 못 쓰면 켠 상태 */ }
  function audioUnlock() {
    if (!SOUND || RENDER) return;
    if (!snd.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      // 소리 파일이 48kHz라 문맥도 48kHz로 연다. 출력 장치가 44.1kHz일 때 크롬이 반복 음악 버퍼를 통째로 바꾸며 이음매에 딸깍 소리가 생겼다(효과음 담당 측정)
      try { snd.ctx = new AC({ sampleRate: 48000 }); } catch (e) { snd.ctx = new AC(); }
      snd.master = snd.ctx.createGain(); snd.master.gain.value = snd.on ? 1 : 0; snd.master.connect(snd.ctx.destination);
      const load = async url => snd.ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
      snd.loading = Promise.all(Object.entries(SOUND.files || {}).map(async ([name, url]) => {
        if (has(url) === false) { console.warn('[DECK] 소리 파일 없음:', url); return; }
        try {
          const b = await load(url);
          let pk = 0, pi = 0;                                    // 피크 크기·위치(믹스와 같은 기준: 피크 -3dBFS 에 맞춘 뒤 dB)
          for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i += 2) { const v = Math.abs(d[i]); if (v > pk) { pk = v; pi = i; } } }
          snd.buf[name] = { b, norm: 0.708 / (pk || 1), peakT: pi / b.sampleRate };
        } catch (e) { console.warn('[DECK] 소리 로드 실패', name, e); }
      })).then(async () => {
        // bgm { 슬라이드 id 또는 유형: 경로 }. standby(1번 대기 화면), qa(102번 질문 시간)
        for (const [key, url] of Object.entries(SOUND.bgm || {})) {
          if (!url || has(url) === false) continue;
          try { snd.bgmBufs[key] = await load(url); } catch (e) { console.warn('[DECK] 배경 음악 로드 실패', key); }
        }
      });
    }
    if (snd.ctx.state === 'suspended') snd.ctx.resume().catch(() => null);
  }
  function playSnd(name, gainDb) {
    const sb = snd.buf[name];
    if (!sb || !snd.ctx || !snd.on || snd.ctx.state !== 'running') return;
    const src = snd.ctx.createBufferSource(), g = snd.ctx.createGain();
    src.buffer = sb.b; g.gain.value = sb.norm * Math.pow(10, gainDb / 20);
    src.connect(g); g.connect(snd.master); src.start();
    (window.__sndLog = window.__sndLog || []).push([location.hash, name]);   // 점검용 기록
  }
  // key: 지금 슬라이드에 맞는 배경 음악 이름(없으면 null). 바뀌면 앞 곡은 1.5초 동안 줄이고 새 곡은 2.5초 동안 키운다
  function bgmUpdate(key) {
    if (!snd.ctx || snd.ctx.state !== 'running') return;
    if (key && !snd.bgmBufs[key]) key = null;
    if (key === snd.bgmKey) return;
    const now = snd.ctx.currentTime;
    if (snd.bgm) {
      const b = snd.bgm, g = snd.bgmG; snd.bgm = null;
      g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(0, now + 1.5);
      b.stop(now + 1.6);
    }
    snd.bgmKey = key;
    if (key) {
      snd.bgm = snd.ctx.createBufferSource(); snd.bgm.buffer = snd.bgmBufs[key]; snd.bgm.loop = true;
      snd.bgmG = snd.ctx.createGain(); snd.bgmG.gain.setValueAtTime(0, now); snd.bgmG.gain.linearRampToValueAtTime(0.55, now + 2.5);
      snd.bgm.connect(snd.bgmG); snd.bgmG.connect(snd.master); snd.bgm.start();
    }
  }
  function soundTick() {
    if (!snd.ctx || !SOUND) return;
    const sl = slides[live.cur], st = stops(sl);
    const cur = live.t - (live.k === 0 ? -sl.$lead : st[live.k - 1]);
    if (snd.cur !== live.cur || snd.k !== live.k) { snd.cur = live.cur; snd.k = live.k; snd.prevDt = snd.armed ? -Infinity : cur; snd.armed = false; }
    const evs = SOUND.slides && SOUND.slides[sl.id];
    if (evs && !live.rush && cur > snd.prevDt) {
      for (const [k, dt, name, gdb, align] of evs) {
        if (k !== live.k) continue;
        const b = snd.buf[name], at = dt - (align === 'peak' && b ? b.peakT : 0);
        if (at > snd.prevDt && at <= cur) playSnd(name, gdb);
      }
    }
    snd.prevDt = cur;
    const bg = SOUND.bgm || {};
    bgmUpdate(bg[sl.id] ? sl.id : bg[sl.$type] ? sl.$type : null);
  }
  function toggleSound() {
    audioUnlock();
    snd.on = !snd.on;
    try { localStorage.setItem('deck-sound', snd.on ? 'on' : 'off'); } catch (e) { /* 무시 */ }
    if (snd.master) { const now = snd.ctx.currentTime; snd.master.gain.cancelScheduledValues(now); snd.master.gain.setValueAtTime(snd.master.gain.value, now); snd.master.gain.linearRampToValueAtTime(snd.on ? 1 : 0, now + 0.25); }
    for (const sl of slides) if (sl.$v && sl.$v.video) sl.$v.video.muted = !snd.on;
    alertBox(snd.on ? '소리 켬' : '소리 끔', 1500); presenterTick();
  }

  // ───────────────────────── 발표 모드 ─────────────────────────
  const live = { cur: 0, k: 0, t: 0, a: 0, wait: 0, rush: false, trans: null, g: 0, started: null, black: false, blackV: 0, ov: null, enteredAt: 0, chEnd: {} };
  const SPEED_RUSH = 4;
  const chapterOf = i => (slides[i] && slides[i].$chapter ? slides[i].$chapter.id : null);
  const vEl = sl => (sl && sl.$isVideo && sl.$v && sl.$v.video) || null;

  // ← 키로 i번에서 j = i-1번으로 돌아갈 때의 전환. 평면 밀기 모드에서 그 경계가 평면 밀기면 반대 방향 밀기,
  // cut·영상 경계(영상 슬라이드로 들어가거나 나옴)면 바로 바뀜. 3D 모드는 이전처럼 바로 바뀜(null)
  function backType(j, i) {
    if (!FLAT || !slides[i] || !slides[j]) return null;
    return slides[i].$enter === 'flat-push' && !slides[i].$isVideo && !slides[j].$isVideo ? 'flat-push' : null;
  }
  // 번호로 멀리 이동할 때의 전환(평면 밀기 모드): 영상 슬라이드로는 영상 열림, 영상 슬라이드에서는 바로 바뀜, 나머지는 방향에 맞는 평면 밀기
  function jumpType(prevI, i) {
    if (slides[i].$isVideo) return { type: 'video', dur: ENTER_DUR.video, dir: 1 };
    if (slides[prevI].$isVideo) return { type: 'cut', dur: 0, dir: 1 };
    return { type: 'flat-push', dur: FLAT_DUR, dir: i > prevI ? 1 : -1 };
  }
  function enter(i, opts = {}) {
    i = clamp(i, 0, slides.length - 1);
    const sl = slides[i], prevI = live.cur;
    ensureAround(i);
    if (prevI !== i) { const pv = vEl(slides[prevI]); if (pv) pv.pause(); }
    let wait = 0;
    if (opts.transition && i !== prevI) {
      let type = sl.$enter, dur = sl.$trans, dir = 1;
      if (i !== prevI + 1) {
        if (FLAT) ({ type, dur, dir } = jumpType(prevI, i));
        else { type = chapterOf(i) !== chapterOf(prevI) ? 'pull-out' : 'push'; dur = ENTER_DUR[type]; }
      }
      live.trans = dur > 0 ? { from: prevI, t: live.t, a: live.a, k: live.k, e: 0, dur, type, dir } : null;
      wait = live.trans && !sl.$isVideo ? Math.max(0, dur - ARRIVE_LEAD - sl.$lead) : 0;
      // 번호로 뒤로 건너뛰는 평면 밀기(dir -1)는 ← 키와 같은 소리
      const en = !SOUND || type === 'cut' ? null : dir < 0 ? SOUND.back : SOUND.enter && SOUND.enter[sl.id]; if (en) playSnd(en[0], en[1]);
    } else if (opts.back && i === prevI - 1 && backType(i, prevI)) {
      // ← 키: 앞 슬라이드가 왼쪽에서 끝 상태 그대로 밀려 들어온다(아래 opts.end가 끝 상태로 둔다)
      live.trans = { from: prevI, t: live.t, a: live.a, k: live.k, e: 0, dur: FLAT_DUR, type: 'flat-push', dir: -1, rev: true };
      if (SOUND && SOUND.back) playSnd(SOUND.back[0], SOUND.back[1]);
    } else live.trans = null;
    snd.armed = !!(opts.transition || opts.arm); snd.cur = -1;
    if (live.started && chapterOf(prevI) !== chapterOf(i) && i > prevI) live.chEnd[chapterOf(prevI)] = (performance.now() - live.started) / 1000;
    live.cur = i; live.wait = wait;
    if (opts.end) { live.k = stops(sl).length - 1; live.t = sl.dur; live.a = sl.dur + 0.5; live.wait = 0; }
    else { live.k = opts.k ?? 0; live.t = opts.k ? stops(sl)[opts.k - 1] : -sl.$lead; live.a = live.t; }
    if (opts.wait) live.wait = opts.wait;
    live.rush = false;
    live.enteredAt = performance.now();
    if (!live.started && i > 0) live.started = performance.now();
    const v = vEl(sl);
    if (v) {
      v.muted = !snd.on;
      if (opts.end) { try { v.currentTime = Math.max(0, sl.dur - 0.05); } catch (e) { /* 무시 */ } v.pause(); }
      else { try { if (v.currentTime > 0.001 || v.ended) v.currentTime = 0; } catch (e) { /* 무시 */ } const p = v.play(); if (p && p.catch) p.catch(() => alertBox('영상 재생이 막혔습니다. 화면을 한 번 클릭하세요.', 3000)); }
    }
    // 다음 슬라이드가 영상이면 0프레임에 미리 맞춰 둔다(4차). 영상으로 들어가는 전환이 바로 바뀜(cut)이라,
    // 뒤로 나갔다가 다시 들어갈 때 탐색이 끝나기 전 끝 프레임이 한 프레임 비치지 않게 한다
    const nv = vEl(slides[i + 1]);
    if (nv && nv.paused && nv.currentTime > 0.001) { try { nv.currentTime = 0; } catch (e) { /* 무시 */ } }
    syncHash(); presenterUpdate();
  }
  function next() {
    const sl = slides[live.cur], st = stops(sl);
    if (sl.$isVideo && live.t < sl.dur - 0.06) {      // 영상 재생 중: 끝 프레임으로
      const v = vEl(sl);
      if (v) { try { v.currentTime = Math.max(0, sl.dur - 0.05); } catch (e) { /* 무시 */ } v.pause(); }
      live.t = sl.dur; live.trans = null; presenterUpdate(); return;
    }
    if (live.wait > 0 || live.t < st[live.k] - 0.02) { live.rush = true; return; }       // 재생 중이면 빠르게 감아 이번 멈춤까지
    if (live.k < st.length - 1) { live.k++; live.rush = false; snd.armed = true; syncHash(); presenterUpdate(); return; }
    if (live.cur < slides.length - 1) enter(live.cur + 1, { transition: true });
  }
  function prev() {
    const sl = slides[live.cur], st = stops(sl);
    if (live.k > 0) { live.k--; live.t = st[live.k]; live.rush = false; live.trans = null; live.wait = 0; syncHash(); presenterUpdate(); return; }
    if (live.cur > 0) enter(live.cur - 1, { end: true, back: true });
  }
  function syncHash() {
    const v = `#${live.cur + 1}${live.k ? '.' + live.k : ''}`;
    if (location.hash !== v) history.replaceState(null, '', v);
  }
  function ovCam() {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const sl of slides) { const p = sl.$pose; x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
    const wx = x1 - x0 + 1920 + (z1 - z0) * 0.5, wy = y1 - y0 + 1080;
    const D = clamp(P * Math.max(wx / W, wy / H) * 1.12 + (z1 - z0) * 0.3, P + 4500, 90000);
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: (z0 + z1) / 2, rx: 12, ry: 0, rz: 0, D };
  }
  function overview(on) {
    if (on && !live.ov) { live.ov = { e: 0, dir: 1, sel: live.cur, cam: ovCam() }; ensureAround(live.cur); }
    else if (!on && live.ov) live.ov.dir = -1;
    ovHint.classList.toggle('on', !!on);
  }
  function ovGo(i) {
    if (!live.ov) return;
    i = clamp(i, 0, slides.length - 1);
    if (i !== live.cur) enter(i, { wait: 0.55 });
    live.ov.dir = -1; ovHint.classList.remove('on');
  }
  function frame(now) {
    const dt = Math.min(0.1, (now - (frame.last || now)) / 1000);
    frame.last = now;
    const sl = slides[live.cur], st = stops(sl), sp = live.rush ? SPEED_RUSH : 1;
    live.a += dt; live.g += dt;
    if (live.trans) { live.trans.e += (dt * sp) / Math.max(1e-6, live.trans.dur); live.trans.a += dt; if (live.trans.e >= 1) live.trans = null; }
    const v = vEl(sl);
    if (v && !sl.$v.failed) { live.t = clamp(v.currentTime, 0, sl.dur); if (v.ended || live.t >= sl.dur - 0.05) live.t = sl.dur; }
    else if (live.wait > 0) live.wait -= dt * sp;
    else { const stop = st[live.k]; if (live.t < stop) { live.t = Math.min(stop, live.t + dt * sp); if (live.t >= stop) live.rush = false; } }
    if (live.ov) {
      live.ov.e = clamp(live.ov.e + (live.ov.dir * dt) / 0.9);
      if (live.ov.dir < 0 && live.ov.e <= 0) live.ov = null;
    }
    // 화면 끄기: 프레임마다 0.3초에 걸쳐 바꾼다(CSS transition을 쓰지 않음)
    live.blackV = clamp(live.blackV + (live.black ? 1 : -1) * dt / 0.3);
    set(blackout, 'opacity', live.blackV.toFixed(3));
    set(blackout, 'pointerEvents', live.black ? 'auto' : 'none');
    const S = { cur: live.cur, t: live.t, k: live.k, a: live.a, g: live.g, trans: live.trans, ov: live.ov ? { e: ease.inOutCubic(live.ov.e), cam: live.ov.cam, sel: live.ov.sel } : null };
    const F = compose(S);
    for (const v of F.views) if (!slides[v.i].$ready) ensure(v.i);
    draw(F, live.g);
    soundTick();
    requestAnimationFrame(frame);
  }

  // ───────────────────────── 화면 맞춤·UI ─────────────────────────
  function fit() {
    const wrap = document.getElementById('wrap');
    const k = Math.min(innerWidth / W, innerHeight / H);
    css(wrap, { transform: `translate(${(innerWidth - W * k) / 2}px, ${(innerHeight - H * k) / 2}px) scale(${k})` });
  }
  let blackout, helpBox, gotoBox, ovHint, gotoBuf = '';
  function buildUI() {
    blackout = h('div', 'ui-black', document.body);
    helpBox = h('div', 'ui-help', document.body, `
      <h3>발표 조작</h3>
      <dl>
        <dt>→ · Space · PageDown · 클릭</dt><dd>다음 빌드 / 다음 슬라이드(재생 중이면 빠르게 감음, 영상은 끝 프레임으로)</dd>
        <dt>← · PageUp</dt><dd>이전 빌드 / 이전 슬라이드</dd>
        <dt>숫자 + Enter</dt><dd>해당 번호 슬라이드로 이동</dd>
        <dt>Home · End</dt><dd>처음 · 마지막</dd>
        <dt>P</dt><dd>발표자 창(노트·다음 슬라이드·장별 목표 시각)</dd>
        <dt>O</dt><dd>개관 화면(←→ 고르기, Enter·클릭 이동, Esc 닫기)</dd>
        <dt>B · .</dt><dd>화면 끄기 / 켜기</dd>
        <dt>F</dt><dd>전체 화면</dd>
        <dt>R</dt><dd>현재 슬라이드(영상) 처음부터</dd>
        <dt>M</dt><dd>소리 켜기 / 끄기(효과음·대기 음악·영상)</dd>
        <dt>T</dt><dd>경과 시간 초기화</dd>
        <dt>H · ?</dt><dd>이 도움말</dd>
      </dl>`);
    gotoBox = h('div', 'ui-goto', document.body);
    ovHint = h('div', 'ui-ovhint', document.body, '개관 화면 · ←→ 고르기 · Enter 이동 · Esc 닫기');
  }
  function toggle(el, on) { el.classList.toggle('on', on ?? !el.classList.contains('on')); }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    audioUnlock();
    const k = e.key;
    if (live.ov && live.ov.dir > 0) {
      if (k === 'Escape' || k === 'o' || k === 'O') { overview(false); e.preventDefault(); return; }
      if (k === 'ArrowRight' || k === 'ArrowDown') { live.ov.sel = clamp(live.ov.sel + 1, 0, slides.length - 1); e.preventDefault(); return; }
      if (k === 'ArrowLeft' || k === 'ArrowUp') { live.ov.sel = clamp(live.ov.sel - 1, 0, slides.length - 1); e.preventDefault(); return; }
      if (k === 'Enter' && !gotoBuf) { ovGo(live.ov.sel); e.preventDefault(); return; }
    }
    if (/^[0-9]$/.test(k)) { gotoBuf += k; gotoBox.textContent = gotoBuf; gotoBox.classList.add('on'); return; }
    if (k === 'Enter' && gotoBuf) {
      const n = Number(gotoBuf) - 1; gotoBuf = ''; gotoBox.classList.remove('on'); e.preventDefault();
      if (live.ov) { ovGo(n); return; }
      enter(n, { transition: true }); return;
    }
    if (k === 'Escape') { gotoBuf = ''; toggle(gotoBox, false); toggle(helpBox, false); return; }
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown': case 'Enter': e.preventDefault(); if (live.black) { live.black = false; } else next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': e.preventDefault(); prev(); break;
      case 'Home': enter(0); break;
      case 'End': enter(slides.length - 1, { end: true }); break;
      case 'b': case 'B': case '.': live.black = !live.black; break;
      case 'f': case 'F': if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => null); break;
      case 'o': case 'O': overview(!live.ov || live.ov.dir < 0); break;
      case 'h': case 'H': case '?': toggle(helpBox); break;
      case 'p': case 'P': openPresenter(); break;
      case 'r': case 'R': enter(live.cur, { arm: true }); break;
      case 'm': case 'M': toggleSound(); break;
      case 't': case 'T': live.started = performance.now(); live.chEnd = {}; presenterUpdate(); break;
    }
  }

  // ───────────────────────── 발표자 창 ─────────────────────────
  let pw = null, pTimer = null, PACE = null;
  const fmt = sec => { const neg = sec < 0; sec = Math.floor(Math.abs(sec)); return `${neg ? '-' : ''}${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; };
  const fmtD = sec => { sec = Math.round(Math.abs(sec)); return `${Math.floor(sec / 60)}분 ${String(sec % 60).padStart(2, '0')}초`; };
  const esc = str => String(str || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  // 장별 목표 시각: 스토리보드 seconds 누적(대기 화면 제외). 경과 시간은 첫 넘김부터 센다
  function buildPace() {
    if (!SB) return null;
    const start = [], sec = [];
    let acc = 0, any = false;
    slides.forEach((sl, i) => {
      const sv = sl.$type === 'standby' || (i === 0 && sl.id === 'standby') ? 0 : sl.$seconds || 0;
      if (sv) any = true;
      start.push(acc); sec.push(sv); acc += sv;
    });
    if (!any) return null;
    const chapters = CHAPTERS.map(ch => {
      const idx = slides.map((sl, i) => (sl.$chapter === ch ? i : -1)).filter(i => i >= 0);
      const last = idx[idx.length - 1];
      return { id: ch.id, title: ch.title || ch.id, from: idx[0], to: last, end: start[last] + sec[last] };
    });
    return { start, sec, total: acc, chapters, talk: SB.meta && SB.meta.talk_minutes ? SB.meta.talk_minutes * 60 : null };
  }
  function notesHtml(n, k = 0) {
    const segs = String(n || '').replace(/\[클릭 전\]\s*/g, '').split(/\[(?:클릭|빌드)\]/);
    return segs.map((seg, i) => {
      const body = esc(seg).trim().split(/\n\s*\n/).filter(Boolean).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
      return `<div class="seg ${i === k ? 'now' : i < k ? 'past' : 'next'}">${i ? `<span class="clk">▶ 클릭 ${i}</span>` : ''}${body}</div>`;
    }).join('');
  }
  const thumbURL = i => (has(`${THUMBS}/${String(i + 1).padStart(2, '0')}.jpg`) === false ? 'none' : `url(${THUMBS}/${String(i + 1).padStart(2, '0')}.jpg)`);
  function openPresenter() {
    if (pw && !pw.closed) { pw.focus(); return; }
    pw = window.open('', 'deck-presenter', 'width=1400,height=900');
    if (!pw) { alertBox('팝업이 막혀 있습니다. 주소창 오른쪽에서 팝업을 허용한 뒤 P 를 다시 누르세요.'); return; }
    const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    const root = getComputedStyle(document.documentElement);
    const vars = PALETTE_KEYS.map(k => `--${k}:${root.getPropertyValue('--' + k).trim()}`).join(';');
    pw.document.open();
    pw.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>발표자 화면 — ${esc(document.title)}</title><base href="${base}">
<link rel="stylesheet" href="fonts/fonts.css"><link rel="stylesheet" href="deck/presenter.css"><style>:root{${vars}}</style></head><body>
<header><div id="clock"></div><div id="elapsed"></div><div id="pace"></div><div id="pos"></div><div id="snd"></div><div id="sec"></div></header>
<main><section class="cur"><div class="lab">지금</div><div class="thumb" id="tc"></div><h2 id="ttl"></h2><div id="steps"></div><div id="vrem"></div></section>
<section class="notes"><div class="lab">노트</div><div id="notes"></div></section>
<section class="nxt"><div class="lab">다음</div><div class="thumb" id="tn"></div><h3 id="nttl"></h3><div id="ntr"></div></section></main>
<nav id="chap"></nav>
<footer>→ 다음 · ← 이전 · O 개관 화면 · T 타이머 초기화 · M 소리 켜기/끄기 · 이 창에서도 조작할 수 있습니다</footer></body></html>`);
    pw.document.close();
    pw.document.addEventListener('keydown', onKey);
    clearInterval(pTimer);
    pTimer = setInterval(presenterTick, 500);
    presenterUpdate();
  }
  function presenterTick() {
    if (!pw || pw.closed) { clearInterval(pTimer); return; }
    const d = pw.document, now = new Date();
    const $ = id => d.getElementById(id);
    if (!$('clock')) return;
    $('clock').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if ($('snd')) $('snd').textContent = !SOUND ? '' : !snd.ctx || snd.ctx.state !== 'running' ? '소리 대기(아무 키나 누르면 켜짐)' : snd.on ? '소리 켬' : '소리 끔';
    const el = live.started ? (performance.now() - live.started) / 1000 : 0;
    $('elapsed').textContent = live.started ? `경과 ${fmt(el)}` : '경과 00:00 (첫 넘김부터)';
    const pace = $('pace');
    if (PACE && live.started) {
      const here = (performance.now() - live.enteredAt) / 1000;
      const expect = PACE.start[live.cur] + Math.min(here, PACE.sec[live.cur]);
      const dl = el - expect;
      pace.className = Math.abs(dl) < 15 ? 'ok' : dl > 0 ? 'late' : 'early';
      pace.textContent = Math.abs(dl) < 15 ? '목표대로' : dl > 0 ? `${fmtD(dl)} 늦음` : `${fmtD(dl)} 앞섬`;
    } else pace.textContent = PACE ? `목표 ${fmt(PACE.total)}` : '';
    const sl = slides[live.cur];
    $('vrem').textContent = sl && sl.$isVideo ? `영상 남은 시간 ${fmt(Math.max(0, sl.dur - live.t))}` : '';
    if (PACE) {
      const cur = chapterOf(live.cur);
      $('chap').innerHTML = PACE.chapters.map(c => {
        const done = live.chEnd[c.id];
        const st = c.id === cur ? 'now' : done != null ? 'done' : '';
        const dd = done != null ? done - c.end : null;
        const tag = dd == null ? '' : Math.abs(dd) < 15 ? ' · 목표대로' : dd > 0 ? ` · ${fmtD(dd)} 늦음` : ` · ${fmtD(dd)} 앞섬`;
        return `<div class="ch ${st}"><b>${esc(c.title)}</b><span>목표 ${fmt(c.end)}${done != null ? ` · 실제 ${fmt(done)}${tag}` : ''}</span></div>`;
      }).join('');
    }
  }
  function presenterUpdate() {
    if (!pw || pw.closed) return;
    const d = pw.document, $ = id => d.getElementById(id);
    if (!$('ttl')) return;
    const sl = slides[live.cur], nx = slides[live.cur + 1], st = stops(sl);
    $('pos').textContent = `${live.cur + 1} / ${slides.length}`;
    $('sec').textContent = sl.$section || '';
    $('ttl').textContent = sl.$title || sl.id;
    $('steps').innerHTML = st.map((_, k) => `<i class="${k < live.k ? 'done' : k === live.k ? 'now' : ''}"></i>`).join('') + `<span>빌드 ${live.k + 1}/${st.length}</span>`;
    $('notes').innerHTML = notesHtml(sl.$notes, live.k);
    const cur = $('notes').querySelector('.seg.now'); if (cur) cur.scrollIntoView({ block: 'nearest' });
    $('tc').style.backgroundImage = thumbURL(live.cur);
    $('tn').style.backgroundImage = nx ? thumbURL(live.cur + 1) : 'none';
    $('nttl').textContent = nx ? `${live.cur + 2}. ${nx.$title || nx.id}` : '마지막 슬라이드';
    const trName = { 'flat-push': '평면 밀기', cut: '바로 바뀜', video: '영상 열림' };
    const trLab = nx && nx.$isVideo ? (nx.$enter === 'cut' ? '바로 바뀜(영상 시작)' : nx.$open === 'fade' ? '영상 나타남' : '영상 열림') : nx && ((FLAT && trName[nx.$enter]) || nx.$enter);
    $('ntr').textContent = nx ? `다음 전환: ${trLab}${nx.$trans ? ` (${nx.$trans.toFixed(2)}초)` : ''}` : '';
    presenterTick();
  }
  function alertBox(msg, ms = 4000) { if (!gotoBox) return; gotoBox.textContent = msg; gotoBox.classList.add('on'); clearTimeout(alertBox.t); alertBox.t = setTimeout(() => gotoBox.classList.remove('on'), ms); }

  // ───────────────────────── 시작 ─────────────────────────
  async function loadJSON(url) {
    try { const r = await fetch(url, { cache: 'no-store' }); if (!r.ok) return null; return await r.json(); } catch (e) { return null; }
  }
  function metaOut() {
    window.__fonts = [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family.replace(/"/g, '')} ${f.weight}`))];
    window.__meta = {
      duration: plan.duration, fps: 30, width: W, height: H, fonts: window.__fonts, thumbs: THUMBS, storyboard: SB ? SB_PATH : null, transitions: TRANS_MODE,
      scenes: plan.items.map((it, k) => [slides[it.i].id, it.g0, k < plan.items.length - 1 ? plan.items[k + 1].g0 + plan.items[k + 1].td : it.gEnd]),
      chapters: CHAPTERS.map(c => ({ id: c.id, title: c.title || c.id, layout: c.layout || 'row', path: c.x_path || null, file: c.file || null })),
      placeholders: slides.filter(sl => sl.$placeholder).length,
      slides: plan.items.map(it => {
        const sl = slides[it.i];
        return {
          n: it.i + 1, id: sl.id, title: sl.$title, section: sl.$section, g0: it.g0, end: it.gEnd, holds: it.holdsAt,
          notes: sl.$notes || '', builds: stops(sl).length, chapter: sl.$chapter ? sl.$chapter.id : null, file: sl.$file,
          enter: sl.$enter, enterSB: sl.$enterSB, inner: sl.$inner, type: sl.$type, trans: it.td, seconds: sl.$seconds,
          placeholder: !!sl.$placeholder, light: !!sl.$light, bg: sl.$bg, ...(sl.$isVideo ? { open: sl.$open } : {}),
          chrome: { path: sl.$chrome ? sl.$chrome.path : null, source: sl.$chrome && sl.$chrome.source ? sl.$chrome.source.text : null, example: sl.$chrome ? sl.$chrome.example : null },
          pose: { x: Math.round(sl.$pose.x), y: Math.round(sl.$pose.y), z: Math.round(sl.$pose.z), ry: Math.round(sl.$pose.ry * 10) / 10 },
        };
      }),
    };
  }
  async function init() {
    SB_PATH = params.get('storyboard') || metaContent('deck-storyboard') || 'storyboard.json';
    THUMBS = (params.get('thumbs') || metaContent('deck-thumbs') || 'thumbs').replace(/\/+$/, '');
    stage = document.getElementById('stage');
    css(stage, { width: W + 'px', height: H + 'px' });
    bgLayer = h('div', 'layer bg', stage);
    view = h('div', 'layer view', stage);
    world = h('div', 'world', view);
    videoLayer = h('div', 'layer video', stage);
    topLayer = h('div', 'layer top', stage);
    const [files, sb] = await Promise.all([loadJSON('deck/files.json'), loadJSON(SB_PATH)]);
    FILES = files && Array.isArray(files.files) ? new Set(files.files.map(norm)) : null;
    if (!FILES) console.warn('[DECK] deck/files.json을 읽지 못함 — 자원이 있는지 미리 알 수 없어 모두 요청한다(node tools/files.mjs)');
    SB = sb && typeof sb === 'object' ? sb : null;
    if (!SB) console.warn(`[DECK] 스토리보드(${SB_PATH})를 읽지 못함 — 장별 row 배치로 둔다. 로컬 서버(start.command)로 열었는지 확인`);
    for (const x of (SB && SB.slides) || []) SBMAP.set(x.id, x);
    applyConcept();
    await document.fonts.ready;
    await Promise.all([...document.fonts].map(f => (f.status === 'loaded' ? null : f.load().catch(() => null))));
    const sample = '가나다라마바사 하네스 ABC 0123456789';
    await Promise.all(['Pretendard', 'Paperlogy', 'Noto Serif KR', 'JetBrains Mono', 'Anton'].flatMap(f => [400, 700, 900].map(w => document.fonts.load(`${w} 64px "${f}"`, sample).catch(() => null))));
    const nph = injectPlaceholders();
    if (nph) console.info(`[DECK] 자리 표시 슬라이드 ${nph}장(스토리보드에 있고 코드로 등록되지 않음)`);
    if (!slides.length) {
      msgBox = h('div', 'ui-empty', stage, '등록된 슬라이드가 없습니다.<br><small>index.html에 장 파일(slides/cNN_*.js)을 넣으세요. 엔진 시험은 demo.html</small>');
      plan = { items: [], duration: 1 };
      metaOut();
      window.__seek = () => undefined;
      window.__ready = true;
      return;
    }
    await probeVideos();
    resolveSlides();
    for (const sl of slides) {
      if (!bgs[sl.bg]) { if (sl.bg) console.warn('[DECK] 등록되지 않은 배경, plain으로 둠:', sl.id, sl.bg); sl.bg = bgs.plain ? 'plain' : Object.keys(bgs)[0]; }
      sl.$bg = sl.bg; sl.$light = !!(bgs[sl.bg] && bgs[sl.bg].light);
    }
    layoutPoses();
    const pending = [];
    for (const n in bgs) {
      const b = bgs[n];
      b.el = h('div', 'bglayer', bgLayer);
      b.el.dataset.bg = n;
      if (b.setup) pending.push(Promise.resolve().then(() => b.setup.call(b, b.el)).catch(e => console.error('[DECK] bg setup 오류', n, e)));
    }
    slides.forEach((sl, i) => {
      sl.$plate = sl.plate === false ? null : h('div', 'plate' + (sl.$light ? ' light' : ''), world);
      if (sl.$plate) sl.$plate.style.display = 'none';
      sl.el = h('section', 'slide', world);
      sl.el.id = 'slide-' + sl.id;
      sl.el.dataset.n = String(i + 1);
      sl.el.style.display = 'none';
    });
    // 개관 화면 썸네일 평면(640×360을 3배로 키워 슬라이드와 같은 넓이)
    slides.forEach((sl, i) => {
      if (sl.$isVideo) return;
      const gh = sl.$ghost = h('div', 'ghost', world);
      gh.dataset.n = String(i + 1);
      gh.style.transform = sl.$poseCSS + ' translateZ(1px) scale(3)';
      gh.style.visibility = 'hidden';
      const th = `${THUMBS}/${String(i + 1).padStart(2, '0')}.jpg`;
      if (has(th) === true) { const im = img(th); im.className = 'gimg'; gh.appendChild(im); }
      else sl.$gt = h('div', 'gt', gh, `<b>${i + 1}</b>${esc(sl.$title || sl.id)}`);
      gh.addEventListener('click', ev => { ev.stopPropagation(); if (live.ov) ovGo(i); });
    });
    await Promise.all(pending);
    for (const n in bgs) bgs[n].el.style.display = 'none';
    buildChrome();
    await Promise.all(waits);
    buildPlan();
    PACE = buildPace();
    metaOut();
    window.__seekBack = seekBack;
    if (RENDER) {
      document.body.classList.add('render');
      window.__seek = seekLinear;
      const t0 = Number(params.get('t') || 0);
      await seekLinear(t0);
      window.__ready = true;
      return;
    }
    window.__seek = seekLinear;
    document.body.classList.add('live');
    fit(); addEventListener('resize', fit);
    buildUI();
    addEventListener('keydown', onKey);
    stage.addEventListener('click', e => { audioUnlock(); if (live.ov) return; if (!e.target.closest('a,button')) next(); });
    addEventListener('pointerdown', audioUnlock);
    let hideT;
    addEventListener('mousemove', () => { document.body.classList.remove('nocursor'); clearTimeout(hideT); hideT = setTimeout(() => document.body.classList.add('nocursor'), 1800); });
    const m = /^#(\d+)(?:\.(\d+))?$/.exec(location.hash);
    const i0 = m ? clamp(Number(m[1]) - 1, 0, slides.length - 1) : 0;
    await Promise.all(ensureAround(i0));
    enter(i0, { k: m ? Math.min(Number(m[2] || 0), stops(slides[i0]).length - 1) : 0 });
    window.__live = live;
    window.__ready = true;
    requestAnimationFrame(frame);
  }

  window.__ready = false;
  window.DECK = {
    W, H, P, RENDER, params, ENTER_DUR, INNERS, TRANSITIONS: TRANS_MODE,
    get stage() { return stage; },
    get top() { return topLayer; },
    get slides() { return slides; },
    get storyboard() { return SB; },
    get chapters() { return CHAPTERS; },
    poseOf: i => (slides[i] ? slides[i].$pose : null),
    chapterOf,
    // 제목·노트·장 이름은 등록할 때 따로 보관한다(setup 에서 this.title 등을 덮어써도 발표자 창이 깨지지 않게)
    slide, videoSlide,
    bg(name, def) { bgs[name] = def; return def; },
    get bgs() { return Object.keys(bgs); },
    img, preload(p) { waits.push(p); }, has,
    color, rgba,
    soundOn: () => snd.on,
    ease, bezier, prog, win, kf, spring, clamp, lerp, map, smooth, rand, noise, split, stagger, inout, count, scramble, shake, pulse,
    css, h, s, set, show,
  };
  addEventListener('load', init);
})();
