// 방문·전환 수집 (jihyun_stats D1) — 16개 사이트 공통 모듈.
// 원본은 ~/projects/jihyun-stats/track.js 하나다. 각 사이트의 track.js 는 sync-track.sh 가 복사한 사본이니 직접 고치지 않는다.
// 단말기(thesave-new)는 build.mjs 가 이 파일의 export 를 떼고 워커 한 파일에 합친다 — 그래서 import 없이 혼자 돈다.
//
//   export default withTracking({ ...__APP, fetch: ... }, SITE.domain);
//
//  1) HTML(GET·200) 응답의 </body> 앞에 작은 스크립트를 붙인다(HTMLRewriter — 응답을 기다리지 않고 흘려보낸다).
//     스크립트는 페이지가 열리면 view, tel: 링크·카카오톡 채널 링크를 누르는 순간 tel/kakao 를 /_t 로 sendBeacon 한다.
//     JS 를 실행하지 않는 크롤러는 view 에 잡히지 않는다.
//  2) /_t 는 바로 204 로 답하고, D1 기록은 ctx.waitUntil 로 뒤에서 한다.
//  3) 신청(form)은 버튼 클릭이 아니라 /api/contact 가 실제로 접수({ok:true})됐을 때 서버에서 센다.
//     입력 오류로 막힌 클릭·숨은 칸(hp)이 채워진 봇 접수는 세지 않는다.
//
// 방문자 식별: sha256(IP + User-Agent + KST 날짜 + STATS_SALT) 앞 32자. 원본 IP·UA 는 저장하지 않는다.
// 날짜가 들어가므로 같은 사람도 날이 바뀌면 다른 해시가 된다 → 순방문은 하루 단위다.
// STATS_SALT(워커 시크릿)나 STATS(D1 바인딩)가 없으면 아무것도 기록하지 않는다.

const BOT_RE = /bot|crawl|spider|slurp|scrap|headless|phantom|selenium|puppeteer|playwright|lighthouse|pagespeed|inspectiontool|google-?other|mediapartners|facebookexternalhit|yeti|daumoa|bytespider|petalbot|ahrefs|semrush|mj12|dotbot|dataforseo|serpstat|archiver|monitor|uptime|python|curl|wget|httpclient|okhttp|go-http|java\/|node-fetch|axios|libwww|scrapy/i;
const KAKAO_RE = /^kakaotalk:|^https?:\/\/(pf|open|qr)\.kakao\.com\//i;
const TYPES = { view: 1, tel: 1, kakao: 1 };
const KST = 9 * 3600000;

const SCRIPT = '<script>(function(){var U="/_t";function s(t){try{var d=JSON.stringify({t:t,p:location.pathname,r:t==="view"?document.referrer:""});if(!(navigator.sendBeacon&&navigator.sendBeacon(U,d)))fetch(U,{method:"POST",body:d,keepalive:true}).catch(function(){})}catch(e){}}'
  + 'if(document.prerendering)document.addEventListener("prerenderingchange",function(){s("view")},{once:true});else s("view");'
  + 'document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href")||"";'
  + 'if(/^tel:/i.test(h))s("tel");else if(' + KAKAO_RE + '.test(h))s("kakao")},true)})();</script>';

const isBot = ua => !ua || BOT_RE.test(ua);
const clip = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
// 경로는 '/' 로 시작하는 것만, 유입은 쿼리를 뺀 origin+경로만 남긴다
const cleanPath = p => { p = clip(p, 300); return p.startsWith('/') ? p : ''; };
const cleanRef = r => { try { const u = new URL(clip(r, 500)); return /^https?:$/.test(u.protocol) ? (u.origin + u.pathname).slice(0, 300) : ''; } catch (e) { return ''; } };

async function visitorHash(request, env, ua) {
  const ip = request.headers.get('cf-connecting-ip') || '';
  const day = new Date(Date.now() + KST).toISOString().slice(0, 10);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + '|' + ua + '|' + day + '|' + env.STATS_SALT));
  return [...new Uint8Array(buf)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function record(request, env, site, type, path, ref, ua) {
  try {
    const vh = await visitorHash(request, env, ua);
    await env.STATS.prepare('INSERT INTO events (site, type, path, ref, visitor_hash, ts) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(site, type, path, ref, vh, Date.now()).run();
  } catch (e) { console.log('stats 기록 실패:', String(e && e.message || e)); }
}

// 다른 사이트에서 보낸 비콘은 버린다(Origin 이 있으면 같은 호스트여야 한다)
function sameOrigin(request) {
  const o = request.headers.get('origin');
  if (!o) return true;
  try { return new URL(o).host === new URL(request.url).host || new URL(o).host === request.headers.get('host'); } catch (e) { return false; }
}

// opts.form === false : 신청을 세지 않는다(단말기 — 신청 폼이 없고 /api/contact 가 늘 ok 를 돌려줘 봇만 잡힌다)
export function withTracking(app, site, opts = {}) {
  return {
    ...app,
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const on = !!(env && env.STATS && env.STATS_SALT);

      if (url.pathname === '/_t') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        const ua = request.headers.get('user-agent') || '';
        if (on && !isBot(ua) && sameOrigin(request)) {
          let b = null; try { b = JSON.parse(await request.text()); } catch (e) {}
          if (b && TYPES[b.t] === 1) ctx.waitUntil(record(request, env, site, b.t, cleanPath(b.p), b.t === 'view' ? cleanRef(b.r) : '', ua));
        }
        return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
      }

      if (on && opts.form !== false && url.pathname === '/api/contact' && request.method === 'POST') {
        const ua = request.headers.get('user-agent') || '';
        const body = request.clone().text().catch(() => '');
        const res = await app.fetch(request, env, ctx);
        if (res.status === 200 && !isBot(ua)) {
          const copy = res.clone(); // 응답을 돌려주기 전에 복제해 둔다
          ctx.waitUntil((async () => {
            try {
              const out = await copy.json();
              let d = {}; try { d = JSON.parse(await body); } catch (e) {}
              if (out && out.ok === true && !String(d.hp || '').trim()) {
                let p = ''; try { p = new URL(String(d.page || ''), url.origin).pathname; } catch (e) {}
                await record(request, env, site, 'form', cleanPath(p), '', ua);
              }
            } catch (e) {}
          })());
        }
        return res;
      }

      const res = await app.fetch(request, env, ctx);
      if (!on || request.method !== 'GET' || res.status !== 200 || url.pathname.startsWith('/_')) return res;
      if (!(res.headers.get('content-type') || '').includes('text/html')) return res;
      return new HTMLRewriter().on('body', { element(e) { e.append(SCRIPT, { html: true }); } }).transform(res);
    },
  };
}
