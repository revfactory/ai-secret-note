#!/bin/bash
# 더블클릭하면 발표 화면을 Chrome으로 엽니다(폰트·영상·스토리보드를 불러오려면 로컬 서버가 필요합니다).
#   ./start.command          발표 덱(index.html)
#   ./start.command demo     엔진 시험 덱(demo.html)
cd "$(dirname "$0")"
PORT=8765
PAGE=index.html
[ "$1" = "demo" ] && PAGE=demo.html
# 자원 목록(deck/files.json)을 다시 만든다. 엔진은 이 목록에 없는 이미지·영상·썸네일을 요청하지 않는다
if command -v node >/dev/null 2>&1; then node tools/files.mjs >/dev/null; else echo "node가 없어 deck/files.json을 갱신하지 못했습니다(새로 넣은 자원이 자리 표시로 보일 수 있음)"; fi
if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "이미 서버가 실행 중입니다: http://127.0.0.1:$PORT/"
else
  # node가 있으면 영상 부분 요청(Range)에 답하는 tools/serve.mjs로 연다(검수·촬영 때와 같은 방식). 없으면 python 서버
  if command -v node >/dev/null 2>&1; then node tools/serve.mjs $PORT >/dev/null 2>&1 &
  else echo "node가 없어 python 서버로 엽니다(영상으로 되돌아갈 때 끝 프레임이 아니라 처음 프레임이 보일 수 있음)"; python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
  fi
  SERVER=$!
  sleep 1
fi
URL="http://127.0.0.1:$PORT/$PAGE"
open -a "Google Chrome" "$URL" 2>/dev/null || open "$URL"
echo ""
echo "  발표 화면: $URL"
echo "  엔진 시험: http://127.0.0.1:$PORT/demo.html"
echo "  F 전체 화면 · P 발표자 창 · O 개관 화면 · → 다음 · ← 이전 · M 소리 · H 도움말"
echo "  이 창을 닫으면 서버가 종료됩니다."
[ -n "$SERVER" ] && wait $SERVER
