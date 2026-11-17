#!/usr/bin/env node
// deck/files.json(assets/·thumbs/·audio/ 파일 목록)을 다시 만든다. 이미지·영상·썸네일을 넣은 뒤 한 번 실행한다.
// tools/shoot.mjs·livetest.mjs·perf.mjs와 start.command는 실행할 때마다 자동으로 다시 만든다.
//   node tools/files.mjs
import { writeFiles } from './lib.mjs';
console.log(`deck/files.json: 파일 ${writeFiles()}개`);
