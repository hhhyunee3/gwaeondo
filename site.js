// 과외온도 사이트 설정 — 브랜드·도메인·색상처럼 이 사이트에서만 다른 값.
// 문구(홈·과목·지역·학교 본문)는 content.js, 교육정보 글은 guides.js 에 있다.
export default {
  name: '과외온도',
  nameEn: 'GwaeOndo',
  domain: 'gwaeondo.com',
  origin: 'https://gwaeondo.com',
  tel: '010-3038-8978',
  telRaw: '01030388978',
  tagline: '아이의 온도에 맞추는 따뜻한 1:1 과외',
  // 검색결과·SNS 요약 한 줄
  desc: '초·중등 기초와 공부 습관부터 잡는 1:1 방문·화상 과외. 아이의 속도와 온도에 맞춰 천천히, 확실하게 쌓아 갑니다. 무료 상담 010-3038-8978',
  // 디자인 토큰 — 기본(c1)·보조(c2)·버튼(c3)·포인트(c4)
  colors: { c1: '#9A3412', c2: '#FFEDD5', c3: '#F97316', c4: '#0EA5E9' },
  // 로고 마크 안 글자
  logoLetter: '온',
  // 로고·파비콘 공용 온도계 마크 (viewBox 64). 헤더·푸터 로고, /favicon.svg, favicon.png·apple-touch-icon.png
  // (tools/icons.mjs 로 생성)이 모두 이 함수 하나를 쓴다. 모양이나 색을 바꿀 때는 여기만 고친다.
  // 작은 크기에서 뭉개지지 않게 눈금 없이 관·구슬·수은 세 덩어리만 둔다. 색은 위 colors(c1 바탕·c2 관·c3 수은).
  // square: 모서리 없이 꽉 찬 정사각형 (애플 터치 아이콘은 iOS 가 모서리를 직접 깎는다)
  logo(size = 34, { square = false } = {}) {
    const c = this.colors;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="${square ? 0 : 15}" fill="${c.c1}"/><rect x="23.5" y="7" width="17" height="36" rx="8.5" fill="${c.c2}"/><circle cx="32" cy="44.5" r="13" fill="${c.c2}"/><rect x="28.5" y="18" width="7" height="26" rx="3.5" fill="${c.c3}"/><circle cx="32" cy="44.5" r="8" fill="${c.c3}"/></svg>`;
  },
  // 지역 페이지까지 만드는 공통 과목(순서대로 메뉴에 표시)과 특화 프로그램
  subjects: ['math', 'english', 'korean', 'science', 'social'],
  extras: ['hangul', 'coding'],
  // IndexNow 키 — /<키>.txt 로도 응답한다
  indexNowKey: 'b2e8d4c1f7a94e2d8c6b1f3a5e7d9c0b',
  // 본문 "최종 업데이트" 표시와 사이트맵 lastmod
  updated: '2026-09-16',
  mailFrom: 'noreply@gwaeondo.com',
  mailTo: 'hhhyunee3@naver.com',
};
