#!/usr/bin/env python3
"""발표 대본(마크다운)과 PDF를 만든다. reference/lecture-deck/tools/make_docs.py를 이 덱에 맞게 옮겼다.

사용법
  python3 tools/make_docs.py notes        qa/notes.json → notes/발표대본.md
  python3 tools/make_docs.py pdf          qa/holds_full/*.jpg → out/슬라이드_빌드별.pdf, out/슬라이드_완성화면.pdf

준비
  node tools/shoot.mjs --notes                          (노트 추출, 덱 전체일 때 qa/notes.json)
  node tools/shoot.mjs --holds --scale 1 --tag full     (빌드별 1920×1080 스틸 → qa/holds_full/NN_id_k.jpg)

시간 배분은 storyboard.json의 chapters[].minutes와 meta.talk_minutes·qa_minutes에서 읽는다.
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_sb():
    return json.load(open(os.path.join(ROOT, 'storyboard.json'), encoding='utf-8'))


def chapter_of(sb, n):
    for c in sb['chapters']:
        ids = [s for s in sb['slides'] if s.get('chapter') == c['id']]
        if ids and min(s['n'] for s in ids) <= n <= max(s['n'] for s in ids):
            return c
    return None


def notes():
    sb = load_sb()
    meta = sb['meta']
    data = json.load(open(os.path.join(ROOT, 'qa/notes.json'), encoding='utf-8'))
    out = ['# 발표 대본', '',
           f"「{meta['title']}: {meta['subtitle']}」 · {meta['speaker']}", '',
           '발표 화면의 노트와 같은 내용입니다. `▶ 클릭`은 다음 빌드로 넘기는 지점입니다. 영상 슬라이드는 넘기지 않아도 끝까지 재생됩니다.', '',
           '## 시간 배분(목표)', '', '| 구간 | 목표 시간 | 누적 |', '| --- | --- | --- |']
    acc = 0.0
    for c in sb['chapters']:
        acc += c['minutes']
        out.append(f"| {c['title']} | {c['minutes']:.1f}분 | {acc:.1f}분 |")
    qa = meta.get('qa_minutes', 10)
    out += [f'| 질문과 답변 | {qa}분 | {acc + qa:.1f}분 |', '']
    cur = None
    for s in sorted(data, key=lambda s: s['n']):
        c = chapter_of(sb, s['n'])
        if c and c['id'] != cur:
            cur = c['id']
            out += [f"## {c['title']}", '']
        title = s.get('title') or s['id']
        out += [f"### {s['n']:03d}. {title}  ·  빌드 {s['builds']}단", '']
        body = re.sub(r'\[클릭 전\]\s*', '', s.get('notes') or '').strip()
        body = re.sub(r'\[(클릭|빌드)\]', '**▶ 클릭**', body)
        if not body:
            out += ['(노트 없음)', '']
        for para in re.split(r'\n\s*\n', body):
            para = para.strip()
            if para:
                out += [para.replace('\n', '  \n'), '']
    path = os.path.join(ROOT, 'notes/발표대본.md')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write('\n'.join(out))
    print(path, len(data), '장')


def pdf():
    from PIL import Image
    files = glob.glob(os.path.join(ROOT, 'qa/holds_full/*.jpg'))
    if not files:
        sys.exit('qa/holds_full 이 비어 있다. node tools/shoot.mjs --holds --scale 1 --tag full 먼저')

    def key(f):  # NN_id_k.jpg: 번호가 두 자리·세 자리로 섞이므로 숫자로 정렬한다
        b = os.path.basename(f)[:-4]
        n, k = b.split('_')[0], b.rsplit('_', 1)[1]
        return (int(n), int(k))
    files.sort(key=key)
    os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
    ims = [Image.open(f).convert('RGB') for f in files]
    a = os.path.join(ROOT, 'out/슬라이드_빌드별.pdf')
    ims[0].save(a, save_all=True, append_images=ims[1:], resolution=144)
    last = {}
    for f in files:
        last[key(f)[0]] = f
    fin = [Image.open(last[k]).convert('RGB') for k in sorted(last)]
    b = os.path.join(ROOT, 'out/슬라이드_완성화면.pdf')
    fin[0].save(b, save_all=True, append_images=fin[1:], resolution=144)
    print(a, len(ims), '쪽')
    print(b, len(fin), '쪽')


if __name__ == '__main__':
    {'notes': notes, 'pdf': pdf}[sys.argv[1] if len(sys.argv) > 1 else 'notes']()
