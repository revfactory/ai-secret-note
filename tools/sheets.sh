#!/bin/bash
# 검수 시트 만들기(showreel contact_sheet.py 사용). 시트는 Read로 열어 직접 본다.
#
#   ./tools/sheets.sh <스틸 폴더> <시트 파일> [열 수]
#       폴더 안 스틸을 시트로 모은다(18칸씩 나눠 <이름>_01.png …). 예: ./tools/sheets.sh qa/holds_c03 qa/c03/sheet.jpg
#   ./tools/sheets.sh [--page demo.html] [--files slides/c03_x.js]
#       덱 전체(또는 그 장 파일)를 빌드별로 찍고 장별 시트를 만든다 → qa/sheets/sheet_<장>.png
#       (4차: 이전에는 qa/review를 지우고 썼다. qa/review/는 검수 담당 결과 폴더라 qa/sheets/로 옮겼다)
set -e
cd "$(dirname "$0")/.."
CS="$HOME/.claude/skills/showreel/scripts/contact_sheet.py"
if [ -n "$1" ] && [ "${1#--}" = "$1" ]; then
  DIR="$1"; OUT="${2:-$1/sheet.png}"; COLS="${3:-3}"
  mkdir -p "$(dirname "$OUT")"
  python3 "$CS" --dir "$DIR" --out "$OUT" --cols "$COLS" --thumb 640 --per 18
  exit 0
fi
node tools/shoot.mjs --holds --tag all --meta --metafile qa/sheets_meta.json "$@"
rm -rf qa/sheets && mkdir -p qa/sheets
python3 - <<'EOF'
import json, os, shutil, glob
meta = json.load(open('qa/sheets_meta.json'))
sec = {s['n']: (s.get('chapter') or s.get('section') or '기타') for s in meta['slides']}
order = []
for f in sorted(glob.glob('qa/holds_all/*.jpg')):
    n = int(os.path.basename(f).split('_')[0])
    d = f"qa/sheets/{sec[n]}"
    if d not in order: order.append(d)
    os.makedirs(d, exist_ok=True)
    shutil.copy(f, d)
open('qa/sheets/_dirs.txt', 'w').write('\n'.join(order) + '\n')
EOF
while read -r d; do
  [ -z "$d" ] && continue
  name=$(basename "$d")
  python3 "$CS" --dir "$d" --out "qa/sheets/sheet_${name}.png" --cols 3 --thumb 640 --per 18 >/dev/null
done < qa/sheets/_dirs.txt
ls qa/sheets/*.png
