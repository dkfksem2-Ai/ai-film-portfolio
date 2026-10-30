For connecting Vercel Blob public MP4 URLs, follow README_BLOB.txt and edit only video-config.js.
MOTION EDITORIAL / V4 — AI FILM PORTFOLIO
========================================

실행 방법
- ZIP 압축을 풀고 index.html을 크롬/엣지에서 엽니다.
- 인터넷 연결 없이도 정적 이미지, 5초 프리뷰, 스토리보드 탐색이 동작하도록 외부 JS·폰트 의존성을 제거했습니다.
- WORKS 아래 각 영화 이미지에 마우스를 왼쪽→오른쪽으로 움직이면 3장면이 자연스럽게 전환됩니다.
- 작품 이미지 안의 ▶ 버튼은 약 5초 프리뷰입니다. 완료하면 원래 화면으로 돌아옵니다.
- VIEW FILM은 OTT 상세 모달, PRODUCTION NOTES는 제작·컷별 데이터 확인입니다.

5초 프리뷰 및 실제 영상 교체
- assets/previews/memory-teaser.mp4 / tumgo-teaser.mp4
- 두 파일은 기존 프로젝트 스틸에서 만든 '모션 스터디'로 완성 광고 영상이 아닙니다.
- 실제 영상의 5초 하이라이트가 있다면 동일한 파일명으로 교체하기만 하면 됩니다.
- 사이트의 영상 프리뷰는 음소거 상태로 시작합니다(브라우저 재생 정책 고려).

최종 전체 MP4 연결
- site.js 앞부분 publishedVideoSources를 수정:
  const publishedVideoSources={memory:'assets/films/memory-final.mp4',tumgo:'assets/films/tumgo-final.mp4'};
- ZIP에는 최종 마스터 영상이 포함되지 않습니다.
- 마스터와 기획서 타임코드가 다르면 전체 컷 동기화 검수가 필요합니다.

기술 적용
- AE F9 스타일의 Ease Out / Ease InOut 유사 cubic-bezier 속도 곡선
- 스크롤 진입/반전 없는 낮은 속도·긴 감속, requestAnimationFrame + damping 기반 패럴랙스
- 스크롤 구간을 기준으로 한 3장면 전환, 마우스 위치로 수동 탐색
- 5초 무음 Inline HTML5 Video, 재생 상태/진행 바/종료 자동 복귀
- 모션 줄이기 OS 접근성 설정(prefers-reduced-motion) 적용
- 외부 라이브러리, 외부 폰트, Tailwind CDN, 불필요한 3D 엔진 없음

검증 주의
- JS 문법, 파일 경로, MP4 컨테이너/길이, 스토리보드 개수 정적 검증 완료.
- 이번 실행 환경의 Chromium URL 접근 정책으로 전면적인 브라우저 화면 동작 및 모바일 시각 검수는 불가했습니다.
- 발표 전 실제 Windows Chrome 및 모바일 브라우저에서 한 번 확인하세요.

브랜드/자료 주의
- 《반찬통의 왕복》은 비공식 포트폴리오 작업이며 브랜드 공식 광고가 아닙니다.
- 《틈GO》는 가상 서비스입니다.
- 스토리보드 시간·컷 수·번호는 생성 단계 기획값이며 최종 마스터 대조가 필요합니다.


FINAL MP4 설치 순서 (VIDEO READY)
- assets/films/memory-final.mp4 = 반찬통의 왕복
- assets/films/tumgo-final.mp4 = 틈GO
- 최종영상 두 파일을 해당 이름으로 복사한 후 사이트 전체 폴더를 다시 배포하세요.
- GitHub 브라우저 파일당 업로드 제한은 25 MiB입니다. 초과하면 Git CLI나 영상 스토리지(Vercel Blob 등)를 이용하세요.
