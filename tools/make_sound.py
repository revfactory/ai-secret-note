#!/usr/bin/env python3
"""발표 화면 효과음 표(deck/sound.js)를 만든다.

소리 파일은 video/deck_sound/make_sfx.py(효과음)와 make_loops.py(대기 음악)가 audio/ 아래에 만든다.
이 스크립트는
  1) 엔진에서 슬라이드 정보(전환 종류·빌드 수·멈춤 시각·lead)를 다시 뽑고(video/deck_sound/dump_slides.mjs),
  2) 영상 여섯 편 안에서 같은 계열 효과음이 실제로 난 크기(video/deck_sound/video_levels.json, 순간 음량 최대의 중앙값)에서
     8dB(빌드 클릭은 12dB) 낮은 크기가 되도록 소리마다 dB를 계산하고,
  3) 규칙대로 표를 쓴다.
규칙
  enter   평면 밀기(flat-push)로 들어오는 슬라이드: push_a / push_b 를 번갈아. cut(영상 앞뒤)과 첫 슬라이드·영상 슬라이드는 소리 없음. 15·83·102번은 2026-11-16 비평 반영 회차에 평면 밀기로 바뀜
  slides  빌드 1번부터(클릭으로 요소가 나올 때) build_a / build_b 를 번갈아, 빌드 시작 0.02초 뒤.
          정리 슬라이드는 이번 장 파일 줄의 확인 표시가 그려질 때 check, 장 표지는 밑줄이 다음 파일로 옮겨 갈 때 mark,
          100번은 확인 표시 일곱 개 중 앞 여섯 개에 build, 마지막에 check(EVENTS 표)
  back    ← 키 평면 밀기(엔진 훅이 생기면 쓰인다)
  bgm     standby(1번), qa(102번). 엔진이 슬라이드 id 또는 유형으로 고른다
사용법: python3 tools/make_sound.py [--no-refresh]
"""
import json
import subprocess
import sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent                 # 덱 루트
DS = ROOT / 'video' / 'deck_sound'
sys.path.insert(0, str(DS))
import aud  # noqa: E402

LIVE_DB = -8.0            # 영상 믹스보다 낮춘다(발표장에는 배경 음악이 없다)
BUILD_DB = -4.0           # 빌드 클릭은 거기서 더 낮춘다
BUILD_DT = 0.02           # 빌드 시작 뒤 초
FILES = ['push_a', 'push_b', 'push_back', 'build_a', 'build_b', 'check', 'mark']
BGM = {'standby': 'audio/music/standby_loop.flac', 'qa': 'audio/music/qa_loop.flac'}

# 슬라이드별 예외: id → [(빌드, 슬라이드 시각 t, 소리)]. t는 render(t)의 시각(장 파일의 U.fileTree 옵션에서 읽은 값)
EVENTS = {
    'recap-env':     [(0, 0.55, 'check')],     # c01_env.js  fileTree done 1, checkAt 0.55
    'cover-request': [(0, 0.35, 'mark')],      # c02_request.js fileTree markAt 0.35(요청서.md로 밑줄)
    'recap-request': [(0, 0.55, 'check')],     # c02_request.js done 2, checkFrom 2, checkAt 0.55
    'recap-parts':   [(0, 1.15, 'check')],     # c03_parts.js done 3, checkAt 1.15
    'recap-team':    [(0, 1.30, 'check')],     # c04_team.js done 4, at 0 each 0.1 → 줄 끝 0.9, markAt 기본 1.0, checkAt 기본 markAt+0.3 = 1.3
    'recap-meta':    [(0, 0.60, 'check')],     # c05_meta.js done 5, checkFrom 5, checkAt 0.6
    'recap-cases':   [(0, 0.20, 'check')],     # c06_cases.js done 6, checkFrom 6, checkAt 0.2
    'cover-human':   [(0, 0.15, 'mark')],      # c07_human.js markAt 0.15(사람.md로 밑줄)
    'tree-done':     [(0, 0.25 + i * 0.15, 'build') for i in range(6)] + [(0, 0.25 + 6 * 0.15, 'check')],   # checkAt 0.25, checkEach 0.15, 일곱 줄
}


def refs():
    """영상 안 기준 크기(순간 음량 최대 중앙값, LUFS)."""
    lv = json.load(open(DS / 'video_levels.json'))
    ev = lv['events']
    clip0 = {'v01_intro': 0, 'v02_env': 0, 'v03_parts': 14, 'v04_team': 27, 'v05_meta': 41, 'v06_cases': 55}
    pick = lambda f: float(np.median([e['mmax'] for e in ev if f(e)]))
    r = {
        'push': pick(lambda e: e['name'] == 'swish'),                                             # 장 전환 영상 다섯 편의 카메라 이동 소리
        'build': pick(lambda e: e['name'] == 'tick' and e['video'] != 'v01_intro'),               # 같은 파일(interludes tick)
        'check': pick(lambda e: e['name'] == 'pass'),                                             # 인트로 칸 통과
        'mark': pick(lambda e: e['name'] == 'marker' and e['t'] - clip0[e['video']] < 1.0),       # 장 전환 영상 여는 구간의 밑줄
    }
    n = {
        'push': sum(e['name'] == 'swish' for e in ev),
        'build': sum(e['name'] == 'tick' and e['video'] != 'v01_intro' for e in ev),
        'check': sum(e['name'] == 'pass' for e in ev),
        'mark': sum(e['name'] == 'marker' and e['t'] - clip0[e['video']] < 1.0 for e in ev),
    }
    return r, n


def engine_norm(x):
    """deck/engine.js audioUnlock와 같은 계산: 채널마다 짝수 번째 표본의 최대값으로 피크 -3dBFS(0.708)에 맞춘다."""
    pk = max(np.abs(x[::2, c]).max() for c in range(x.shape[1]))
    return 0.708 / (pk or 1)


def main():
    if '--no-refresh' not in sys.argv:
        subprocess.run(['node', str(DS / 'dump_slides.mjs')], check=True)
    info = json.load(open(DS / 'slides.json'))
    slides = info['slides']
    ref, nref = refs()
    kind = {'push_a': 'push', 'push_b': 'push', 'push_back': 'push', 'build_a': 'build', 'build_b': 'build', 'check': 'check', 'mark': 'mark'}
    gain, lev = {}, {}
    for f in FILES:
        x = aud.load(ROOT / 'audio' / 'sfx' / f'{f}.wav')
        k = kind[f]
        target = ref[k] + LIVE_DB + (BUILD_DB if k == 'build' else 0)
        m0 = aud.mmax(x * engine_norm(x))                      # 표의 dB가 0일 때 엔진이 내는 크기
        g = round(target - m0, 1)
        y = x * engine_norm(x) * 10 ** (g / 20)
        gain[f] = g
        lev[f] = dict(ref_video=round(ref[k], 1), ref_n=nref[k], target=round(target, 1), mmax=round(aud.mmax(y), 1), tp=round(aud.tpeak(y), 1), db=g)

    out = {'files': {f: f'audio/sfx/{f}.wav' for f in FILES}, 'enter': {}, 'slides': {}, 'back': ['push_back', gain['push_back']], 'bgm': dict(BGM)}
    np_ = 0
    nb = 0
    for s in slides:
        if s['isVideo']:
            continue
        if s['enter'] == 'flat-push':
            name = 'push_a' if np_ % 2 == 0 else 'push_b'
            np_ += 1
            out['enter'][s['id']] = [name, gain[name]]
        ev = []
        for k in range(1, s['builds']):
            name = 'build_a' if nb % 2 == 0 else 'build_b'
            nb += 1
            ev.append([k, BUILD_DT, name, gain[name], 'start'])
        for k, t, name in EVENTS.get(s['id'], []):
            if name == 'build':
                name = 'build_a' if nb % 2 == 0 else 'build_b'
                nb += 1
            start = -s['lead'] if k == 0 else s['holds'][k - 1]
            ev.append([k, round(t - start, 3), name, gain[name], 'start'])
        if ev:
            ev.sort(key=lambda e: (e[0], e[1]))
            out['slides'][s['id']] = ev
    missing = [i for i in EVENTS if i not in {s['id'] for s in slides}]
    if missing:
        print('스토리보드에 없는 예외 id:', missing, file=sys.stderr)

    nev = sum(len(v) for v in out['slides'].values())
    head = f"""/* 발표 화면 효과음 표. tools/make_sound.py가 만든다(직접 고치지 말고 make_sound.py의 규칙·EVENTS를 고친 뒤 다시 실행).
 * 형식(deck/engine.js 소리 절, 원본 reference/lecture-deck/deck/sound.js와 같음)
 *   files  {{ 이름: 경로 }}              엔진이 첫 키 입력 때 모두 불러 피크 -3dBFS로 맞춘다
 *   enter  {{ 슬라이드id: [소리, dB] }}   → 키로 그 슬라이드에 들어오는 순간(전환 시작). 평면 밀기로 들어오는 슬라이드만 있다
 *   slides {{ 슬라이드id: [[빌드 번호, 빌드 시작 뒤 초, 소리, dB, 'start'], …] }}
 *          빌드 0의 시작은 t = -lead(전환이 시작될 때), 빌드 k의 시작은 k번째 클릭
 *   back   [소리, dB]                  ← 키 평면 밀기와 번호로 뒤로 건너뛰는 평면 밀기
 *   bgm    {{ standby, qa }}             슬라이드 id 또는 유형이 같은 곡을 반복한다(1번 standby, 102번 qa. 0.55배, 들어올 때 2.5초 페이드 인·나갈 때 1.5초 페이드 아웃)
 * 크기: 영상 여섯 편 안에서 같은 계열 소리가 난 크기(순간 음량 최대 중앙값)보다 8dB, 빌드 클릭은 12dB 낮다.
{chr(10).join(f' *   {f:10s} {v["db"]:6.1f} dB → 순간 최대 {v["mmax"]:6.1f} LUFS, true peak {v["tp"]:6.1f} dBTP (영상 기준 {v["ref_video"]} LUFS, {v["ref_n"]}곳)' for f, v in lev.items())}
 *   standby_loop 120.0초 반복, 재생 크기 -22.0 LUFS(엔진 0.55배 뒤) · qa_loop 121.7초 반복, -28.0 LUFS
 * 배치: 진입음 {len(out['enter'])}곳 · 슬라이드 안 소리 {nev}곳({len(out['slides'])}장) · 소리 파일 {len(FILES)}개 + 대기 음악 2곡
 * 끄기: 발표 중 M 키(영상 소리 포함, 브라우저 localStorage 'deck-sound'에 저장되어 다음에 열 때도 유지). 표 전체를 끄려면 window.SOUND = null
 */
"""
    js = head + 'window.SOUND = ' + json.dumps(out, ensure_ascii=False, indent=0).replace('\n', '') + ';\n'
    tmp = ROOT / 'deck' / 'sound.js.tmp'
    tmp.write_text(js)
    tmp.replace(ROOT / 'deck' / 'sound.js')
    json.dump(dict(levels=lev, enter=len(out['enter']), events=nev, slides_with_events=len(out['slides'])), open(DS / 'sound_levels.json', 'w'), ensure_ascii=False, indent=1)
    print(f"deck/sound.js: 진입음 {len(out['enter'])}곳 · 슬라이드 안 소리 {nev}곳 · 소리 {len(FILES)}종")
    for f, v in lev.items():
        print(f'  {f:10s} {v["db"]:6.1f} dB  순간 최대 {v["mmax"]:6.1f} LUFS (목표 {v["target"]}, 영상 {v["ref_video"]})  TP {v["tp"]:6.1f}')


if __name__ == '__main__':
    main()
