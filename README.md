# AI 시대를 위한 수석 엔지니어의 비밀노트

「AI 시대를 위한 수석 엔지니어의 비밀노트: 하네스 엔지니어링으로 에이전트 팀을 설계하다」 발표 자료입니다. 브라우저에서 바로 재생하는 모션 슬라이드 덱이고, 인트로 영상과 장 전환 영상이 들어 있습니다.

- 발표 화면: <https://revfactory.github.io/ai-secret-note/>
- PDF: [`out/슬라이드_완성화면.pdf`](out/슬라이드_완성화면.pdf)(107쪽), [`out/슬라이드_빌드별.pdf`](out/슬라이드_빌드별.pdf)(110쪽)
- 발표 대본: [`notes/발표대본.md`](notes/발표대본.md)

## 구성

슬라이드는 107장입니다. 본편 102장(발표 50분, 질문 10분)과 질문 뒤 부록 5장으로 나뉩니다.

| 장 | 제목 | 슬라이드 |
| --- | --- | --- |
| c00 | 오프닝: 비밀노트는 파일 일곱 개 | 1\~12 |
| c01 | 환경.md: 모델이 아니라 환경을 바꾼다 | 13\~26 |
| c02 | 요청서.md: 요청은 문서로 쓴다 | 27\~37 |
| c03 | 구성.md: 역할·방법·순서를 파일에 적는다 | 38\~51 |
| c04 | 팀.md: 나뉘는 일은 팀에 맡긴다 | 52\~65 |
| c05 | 자동구성.md: 팀 구성도 한 줄로 요청한다 | 66\~77 |
| c06 | 사례.md: 결과물로 확인한다 | 78\~93 |
| c07 | 사람.md: 기준과 책임은 사람이 정한다 | 94\~102 |
| 부록 | 더 보기: UX 개선·3D 처리 영상 | 103\~107 |

덱 전체가 말하는 세 문장은 다음과 같습니다.

1. 같은 AI도 일하는 환경을 정리하면 결과가 달라진다.
2. 환경은 파일로 적는다: 요청서, 역할, 방법, 순서, 검증.
3. 나뉘는 일은 에이전트 팀에 맡기고, 기준과 책임은 사람이 정한다.

- 13장은 영상 슬라이드입니다. 인트로(약 57초), 장 전환 영상 5편(13\~15초), 사례 영상 3편, 부록 영상 4편입니다.
- 슬라이드에 들어오는 클릭 한 번에 모든 내용이 움직임과 함께 이어서 나옵니다(2\~4초). 5·16·101번 세 장만 한 번 더 클릭합니다.
- 슬라이드 사이는 같은 평면에서 0.65초 동안 미는 전환 하나로 넘어갑니다. 영상의 앞뒤만 바로 바뀝니다(cut).
- 1920×1080 기준으로 만들었고, 다른 화면 크기에서는 비율에 맞춰 줄어듭니다.

## 보는 방법

### 웹에서

[발표 화면](https://revfactory.github.io/ai-secret-note/)을 Chrome으로 엽니다. 첫 화면은 대기 화면이고, → 키를 누르면 인트로 영상부터 재생됩니다. 영상과 이미지가 커서 처음 몇 장은 불러오는 데 시간이 걸릴 수 있습니다.

### 내 컴퓨터에서

```bash
git clone https://github.com/revfactory/ai-secret-note.git
cd ai-secret-note
node tools/serve.mjs 8765        # node가 없으면: python3 -m http.server 8765
```

브라우저에서 `http://127.0.0.1:8765/`에 접속합니다. macOS에서는 `start.command`를 더블클릭해도 서버가 켜지고 Chrome이 열립니다.

`index.html`을 파일로 직접 열면 Chrome이 글꼴과 영상을 막으므로 꼭 로컬 서버로 엽니다. `tools/serve.mjs`는 영상 탐색에 필요한 부분 요청(Range)에 답합니다.

## 조작

| 키 | 동작 |
| --- | --- |
| → · Space · PageDown · 클릭 | 다음 슬라이드(5·16·101번은 다음 빌드). 내용이 나오는 중에 누르면 4배로 빠르게 감아 끝냄. 영상에서는 끝 프레임으로 |
| ← · PageUp | 이전 빌드 또는 이전 슬라이드 |
| 숫자 + Enter | 해당 번호 슬라이드로 이동 |
| Home · End | 처음 · 마지막 |
| P | 발표자 창. 노트, 다음 슬라이드, 시계, 경과 시간, 장별 목표 시각 대비 앞섬·늦음, 영상 남은 시간 |
| O | 개관 화면(←→ 고르기, Enter·클릭 이동, Esc 닫기) |
| B · . | 화면 끄기 / 켜기 |
| F | 전체 화면 |
| R | 지금 슬라이드(영상)를 처음부터 |
| M | 소리 켜기 / 끄기(효과음·대기 음악·영상 소리 모두) |
| T | 경과 시간 초기화 |
| H · ? | 도움말 |

- 프레젠터 리모컨(PageUp/PageDown)으로 넘길 수 있습니다.
- 주소 끝의 `#12.2`는 12번 슬라이드의 두 번째 빌드라는 뜻입니다. 새로 고쳐도 그 자리로 돌아옵니다.
- 발표자 창이 열리지 않으면 주소창 오른쪽에서 팝업을 허용합니다.
- 소리는 브라우저 정책 때문에 첫 키 입력이나 클릭 뒤에 켜집니다. `M`으로 끈 설정은 브라우저(localStorage `deck-sound`)에 남습니다.

## 주소 옵션

| 옵션 | 뜻 |
| --- | --- |
| `?transitions=3d` | 3D 카메라 전환으로 재생. 기본은 평면 밀기 |
| `?videoopen=fade` | 영상으로 들어갈 때 0.6초 동안 겹쳐 바꿈. 기본은 cut. `id:fade, …`로 영상별 지정 가능 |
| `?render=1` | 촬영·영상 렌더용 모드. 소리가 나지 않음 |

`demo.html`은 엔진 시험 덱입니다(전환·머묾 움직임·영상 슬라이드 견본).

## 폴더

| 경로 | 내용 |
| --- | --- |
| `index.html` | 발표 화면 |
| `deck/engine.js` | 슬라이드 엔진(빌드, 평면 밀기 전환, 발표자 창, 영상 슬라이드, render 모드, 소리) |
| `deck/common.js` | 바탕 층과 공용 부품(파일 트리, 형광 밑줄 등) |
| `deck/sound.js` | 효과음 표. `python3 tools/make_sound.py`로 만든다 |
| `slides/c00_open.js` … `c07_human.js` | 장별 슬라이드 코드 |
| `storyboard.json`, `storyboard.md` | 콘셉트, 장 구성, 슬라이드별 화면 문구와 발표 노트 |
| `assets/video/` | 인트로·장 전환·사례 영상과 포스터 |
| `assets/img/`, `assets/cases/`, `assets/projects/` | 생성 이미지, 사례 화면, 프로젝트 화면 |
| `audio/` | 효과음(`sfx/`), 대기·질문 시간 음악(`music/`) |
| `thumbs/` | 발표자 창·개관 화면용 썸네일 |
| `notes/발표대본.md` | 발표 노트 모음 |
| `out/` | PDF 두 종 |
| `tools/` | 로컬 서버(`serve.mjs`), 촬영(`shoot.mjs`), 발표 모드 점검(`livetest.mjs`, `soundtest.mjs`), 문서 생성(`make_docs.py`) |

## 다시 만들기

촬영 도구는 `playwright-core`와 Chrome을 헤드리스로 씁니다. `tools/lib.mjs`의 `chromium()`이 `playwright-core`를 찾는 경로를 자기 환경에 맞게 바꾼 뒤 실행합니다.

```bash
node tools/files.mjs                                  # 자원 목록(deck/files.json)
node tools/shoot.mjs --thumbs                         # 썸네일
node tools/shoot.mjs --notes && python3 tools/make_docs.py notes
node tools/shoot.mjs --holds --scale 1 --tag full && python3 tools/make_docs.py pdf
python3 tools/make_sound.py && node tools/files.mjs   # 효과음 표
```

엔진은 `deck/files.json`에 없는 이미지·영상·썸네일을 요청하지 않습니다. 자원을 넣거나 뺀 뒤에는 `node tools/files.mjs`를 다시 실행합니다.
