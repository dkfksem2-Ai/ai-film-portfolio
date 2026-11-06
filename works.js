/* 작품 목록. 새 작품을 추가할 때는 이 배열에 한 덩어리를 더 넣으면 됩니다.
   첫 화면의 참여 카드, 왼쪽 작품 바로가기, 두 번째 화면의 작품 띠, 첫 화면 티저가 모두 이 목록으로 만들어집니다.
   tone: 'butter'(밝은 색) 또는 'night'(어두운 색). play가 없는 작품은 참여 링크 없이 영상만 연결됩니다.
   words: 첫 화면에 흩어지는 단어. 첫 단어가 가장 크게 나옵니다.
   font: 이 작품 단어와 제목에 쓰는 글꼴. collect: 첫 화면 담기 게임의 그릇(lunchbox 또는 bag)과 다 담았을 때 나오는 창의 문구. */
window.WORKS = [
  {
    id: 'memory', title: '반찬통의 왕복', tone: 'butter',
    words: ['반찬통', '1999', '계란말이', '2026', '엄마', '돗자리'],
    wordItems: [
      { label: '반찬통', img: 'assets/memory-cover.webp', code: 'CUT #01' },
      { label: '1999', img: 'assets/memory-pixel.webp', code: 'ERA 1999' },
      { label: '계란말이', img: 'assets/memory-cooking.webp', code: 'CUT #14' },
      { label: '2026', img: 'assets/memory-reality.webp', code: 'ERA 2026' },
      { label: '엄마', img: 'assets/making/s02.webp', code: 'CUT #02' },
      { label: '돗자리', img: 'assets/making/m05-before.webp', code: 'CUT #05' }
    ],
    font: '"Jua", "Pretendard Variable", Pretendard, sans-serif',
    collect: { box: 'lunchbox', icon: 'assets/icon-lunchbox.webp', name: '락앤락 반찬통', hint: '반찬통 오브젝트를 담아 주세요', wrong: '이건 반찬통에 안 들어가요', done: '반찬통이 다 찼어요', text: '이제 1999년 소풍 돗자리에 앉아, 엄마가 싸 준 반찬통을 직접 열어 볼 차례입니다.' },
    kind: '락앤락 비공식 브랜드 필름', runtime: '1분 23초', cuts: '19컷',
    line: '엄마가 채워 보내던 반찬통이, 27년 만에 아들의 손으로 채워져 돌아온다.',
    navMeta: ['1999, 2007, 2026', '1분 23초'],
    facts: [['무엇', '락앤락 비공식 브랜드 필름'], ['시대', '1999 도트, 2007 3D, 2026 실사'], ['길이', '1분 23초, 19컷']],
    teaser: 'assets/previews/memory-teaser.mp4', poster: 'assets/memory-cover.webp',
    play: { href: 'picnic.html', label: '1999년 소풍에 앉아 보기', note: '돗자리에 앉아 반찬통 열기', thumb: 'assets/memory-pixel.webp' },
    scenes: [['assets/memory-pixel.webp', '1999년, 어린 시절'], ['assets/memory-3d.webp', '2007년, 학창 시절'], ['assets/memory-reality.webp', '2026년, 어른이 된 아들']]
  },
  {
    id: 'tumgo', title: '틈GO', tone: 'night',
    words: ['틈GO', '문 앞', '빨래', '로봇', '101호'],
    wordItems: [
      { label: '틈GO', img: 'assets/tumgo-cover.webp', code: 'CUT #07' },
      { label: '문 앞', img: 'assets/tumgo-hallway.webp', code: 'CUT #28' },
      { label: '빨래', img: 'assets/tumgo-life.webp', code: 'CUT #16' },
      { label: '로봇', img: 'assets/tumgo-bag.webp', code: 'UNIT 04' },
      { label: '101호', img: 'assets/making/s10.webp', code: 'ROOM 101' }
    ],
    font: '"Black Han Sans", "Pretendard Variable", Pretendard, sans-serif',
    collect: { box: 'bag', icon: 'assets/icon-tumgo-bag.webp', name: '틈GO 수거 가방', hint: '틈GO 오브젝트를 담아 주세요', wrong: '이건 수거 가방에 안 들어가요', done: '수거 신청 완료', text: '이제 현우의 원룸을 직접 걸어 다니며 빨래를 모아 문 앞에 두어 보세요.' },
    kind: '가상의 빨래·수선 수거 서비스 광고', runtime: '약 1분', cuts: '42컷 기획',
    line: '늦은 퇴근길 계단에서 처음 마주친 배송 로봇.',
    navMeta: ['문 앞의 로봇', '약 1분'],
    facts: [['무엇', '가상의 빨래·수선 수거 서비스 광고'], ['주인공', '김현우, 31세, 촬영 현장 스태프'], ['길이', '약 1분, 42컷 기획']],
    teaser: 'assets/previews/tumgo-teaser.mp4', poster: 'assets/tumgo-cover.webp',
    play: { href: 'room.html', label: '현우의 원룸에 들어가 보기', note: '빨래를 모아 문 앞에 두기', thumb: 'assets/tumgo-life.webp' },
    scenes: [['assets/tumgo-cover.webp', '계단에서의 조우'], ['assets/tumgo-life.webp', '밀린 빨래 앞의 고민'], ['assets/tumgo-hallway.webp', '문 앞에서의 수거']]
  }
];
