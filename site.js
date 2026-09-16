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
