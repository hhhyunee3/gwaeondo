// favicon.png(192) · apple-touch-icon.png(180) 를 site.js 의 logo() 로 다시 만든다.
// 사용: Chrome 을 원격 디버깅 포트로 띄운 뒤  node tools/icons.mjs [포트=9333]
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9333
// logo() 를 고친 뒤 이 스크립트를 돌리면 SVG(헤더·푸터·/favicon.svg)와 PNG 가 같은 그림이 된다. og.png 는 건드리지 않는다.
import fs from 'node:fs';
import SITE from '../site.js';
const port = process.argv[2] || 9333;
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const wait = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } };
const cmd = (method, params = {}) => new Promise(r => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await cmd('Page.enable');
await cmd('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
for (const [file, px, square] of [['favicon.png', 192, false], ['apple-touch-icon.png', 180, true]]) {
  await cmd('Emulation.setDeviceMetricsOverride', { width: px, height: px, deviceScaleFactor: 1, mobile: false });
  const html = `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block}</style>${SITE.logo(px, { square })}`;
  await cmd('Page.navigate', { url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html) });
  await new Promise(r => setTimeout(r, 500));
  const s = await cmd('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: px, height: px, scale: 1 } });
  fs.writeFileSync(new URL('../public/' + file, import.meta.url), Buffer.from(s.result.data, 'base64'));
  console.log('public/' + file, px + 'px');
}
ws.close(); await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`);
