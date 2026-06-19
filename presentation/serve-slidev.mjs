// presentation/serve-slidev.mjs — Slidev 빌드본(output/slidev)을 HTTP로 서빙.
// Slidev/Vite 빌드는 file://로 직접 열면 CORS로 안 뜨므로 반드시 HTTP로 봐야 함.
// 사용: node presentation/serve-slidev.mjs  → 출력된 http://localhost:PORT 를 브라우저로 연다.
//      (제출 패키지에선 node serve-slidev.mjs 로 동일 동작 — slidev/ 폴더 자동 탐색)
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { extname, join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// 빌드본 위치 자동 탐색: presentation/output/slidev (개발) 또는 ./slidev (제출 패키지)
const candidates = [join(here, 'output', 'slidev'), join(here, 'slidev'), process.argv[2] || ''];
const ROOT = candidates.find((d) => d && existsSync(join(d, 'index.html')));
if (!ROOT) { console.error('slidev 빌드본을 찾을 수 없습니다. 먼저 빌드하세요.'); process.exit(1); }

const PORT = Number(process.env.PORT) || 4173;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };

http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/' || p === '') p = '/index.html';
    let fp = join(ROOT, normalize(p).replace(/^(\.\.[/\\])+/, ''));
    if (!existsSync(fp) || statSync(fp).isDirectory()) fp = join(ROOT, 'index.html'); // SPA fallback
    const data = await readFile(fp);
    res.writeHead(200, { 'content-type': types[extname(fp)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(PORT, () => {
  console.log(`\n  Slidev 발표 서빙 중 →  http://localhost:${PORT}\n  (브라우저에서 열고 ←/→ 로 이동, F 전체화면. 종료: Ctrl+C)\n  source: ${ROOT}\n`);
});
