/* Film portfolio — dependency-free interactions, 2026. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  // 이 사이트의 모션은 작품 표현의 일부라 OS의 '애니메이션 효과 끄기' 설정과 상관없이 재생한다.
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  const projectData = {
    memory: {name:'반찬통의 왕복', number:'FILM 01 / THE RETURN',cuts: MEMORY_CUTS, duration:82.8, color:'#96a7c6', note:'1999 도트 → 2007 3D → 2026 실사. 시대가 바뀌는 시점에 같은 반찬통의 위치와 동작을 연결하고, 잠금 소리도 칩튠에서 실제 음향으로 성장하도록 설계했습니다.'},
    tumgo: {name:'틈GO (TUMGO)', number:'FILM 02 / TUMGO',cuts:TUMGO_CUTS,duration:62.04,color:'#a8e7b8',note:'서울의 야간 계단, 현관, 4족 서비스 로봇. 캐릭터와 공간을 반복 검증하며 기계적 보행, QR 스캔, 가방 적재를 장면별로 구성했습니다.'}
  };
  let currentFilm='memory', currentCut=0;
  // Public film URLs are configured in video-config.js (never put a Blob token here).
  const configured=window.PORTFOLIO_VIDEO_URLS||{};
  const publishedVideoSources={memory:configured.memory||'',tumgo:configured.tumgo||''};
  const videoState={memory:{url:publishedVideoSources.memory||null,name:'최종 영상'},tumgo:{url:publishedVideoSources.tumgo||null,name:'최종 영상'}};
  const dialog=$('#screening-dialog'),video=$('#screen-video');
  const fmt=t=>{const m=Math.floor(t/60),s=Math.floor(t%60),d=Math.floor((t%1)*10);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${d}`};
  const escapeHTML = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* Direct image exploration: pointer position selects 1999/2007/2026 or each TUMGO beat.
     Crossfades use a real F9-like ease-in-out curve in CSS, never hard timed cuts. */
  const captions={
    memory:['1999년, 소풍 가는 날','2007년, 교실의 점심','2026년, 돌려주는 반찬통'],
    tumgo:['계단에서 처음 만난 로봇','밀린 빨래 앞의 현우','문 앞 수거']
  };
  const stages={};
  function setStage(key,n){
    const stage=stages[key];if(!stage)return;
    const index=((n%stage.slides.length)+stage.slides.length)%stage.slides.length;
    stage.slides.forEach((el,i)=>el.classList.toggle('is-active',i===index));stage.index=index;
    const cap=$(`#${key}-stage-caption`);if(cap)cap.textContent=captions[key][index];
    $$('.stage-zone',stage.el).forEach((z,i)=>z.classList.toggle('is-on',i===index));
    if(key==='memory')$$('[data-era]').forEach(b=>b.classList.toggle('is-selected',Number(b.dataset.era)===index));
    if(key==='tumgo')$$('[data-tumgo-beat]').forEach(b=>b.classList.toggle('is-on',Number(b.dataset.tumgoBeat)===index));
  }
  $$('.motion-stage').forEach(stage=>{
    const key=stage.dataset.motion;
    stages[key]={el:stage,slides:$$('.stage-layer',stage),index:0};
    if(prefersReducedMotion)return;
    stage.addEventListener('pointerenter',()=>stage.classList.add('is-moving'));
    stage.addEventListener('pointerleave',()=>{stage.classList.remove('is-moving');stage.style.removeProperty('--image-shift-x');stage.style.removeProperty('--image-shift-y');});
    stage.addEventListener('pointermove',e=>{
      if(matchMedia('(pointer:coarse)').matches||$(`[data-quicklook="${key}"]`)?.hidden===false)return;
      const r=stage.getBoundingClientRect(),u=Math.max(0,Math.min(.999,(e.clientX-r.left)/r.width));
      setStage(key,Math.floor(u*3));
      stage.style.setProperty('--image-shift-x',`${(u-.5)*1.8}%`);
      stage.style.setProperty('--image-shift-y',`${((e.clientY-r.top)/r.height-.5)*1.3}%`);
    },{passive:true});
  });
  /* 호버 프리뷰: 커서가 올라간 구간의 3초 영상을 gif처럼 반복 재생 */
  $$('.motion-stage').forEach(stage=>{
    const vids=$$('.zone-video',stage);if(!vids.length||matchMedia('(hover:none)').matches)return;
    let live=-1;
    const play=i=>{
      if(i===live)return;live=i;
      vids.forEach((v,n)=>{
        if(n===i){v.currentTime=0;const p=v.play();if(p)p.catch(()=>{});v.classList.add('is-live')}
        else{v.classList.remove('is-live');setTimeout(()=>{if(!v.classList.contains('is-live'))v.pause()},500)}
      });
    };
    const stop=()=>{live=-1;vids.forEach(v=>{v.classList.remove('is-live');setTimeout(()=>{if(!v.classList.contains('is-live'))v.pause()},500)})};
    stage.addEventListener('pointerenter',()=>vids.forEach(v=>{if(v.preload!=='auto'){v.preload='auto';v.load()}}));
    stage.addEventListener('pointermove',e=>{
      const key=stage.dataset.motion;if($(`[data-quicklook="${key}"]`)?.hidden===false){stop();return}
      const r=stage.getBoundingClientRect();play(Math.min(2,Math.floor((e.clientX-r.left)/r.width*3)));
    },{passive:true});
    stage.addEventListener('pointerleave',stop);
    $$('[data-peek]',stage).forEach(b=>b.addEventListener('click',stop));
  });
  $$('[data-era]').forEach(btn=>btn.addEventListener('click',()=>setStage('memory',Number(btn.dataset.era))));
  // V9.1 양방향 연동: 틈GO 01/02/03 버튼 클릭/호버 시 좌측 화면 즉각 동기화 및 영상 재생
  const tumgoStage = document.querySelector('.tumgo-art');
  const tumgoBeatBtns = $$('[data-tumgo-beat]');
  
  function applyTumgoBeat(idx, playVideo = true) {
    if(!stages.tumgo && tumgoStage) {
      stages.tumgo = { el: tumgoStage, slides: $$('.stage-layer', tumgoStage), index: 0 };
    }
    setStage('tumgo', idx);
    tumgoBeatBtns.forEach(b => b.classList.toggle('is-on', Number(b.dataset.tumgoBeat) === idx));
    
    if(tumgoStage) {
      tumgoStage.classList.add('is-active-zone');
      $$('.stage-zone', tumgoStage).forEach((z, i) => z.classList.toggle('is-on', i === idx));
      
      const vids = $$('.zone-video', tumgoStage);
      vids.forEach((v, n) => {
        if(n === idx && playVideo) {
          if(v.preload !== 'auto') { v.preload = 'auto'; v.load(); }
          v.currentTime = 0;
          const p = v.play();
          if(p) p.catch(() => {});
          v.classList.add('is-live');
        } else {
          v.classList.remove('is-live');
          v.pause();
        }
      });
      
      // 촉각 피드백 펄스
      tumgoStage.classList.remove('is-switched');
      void tumgoStage.offsetWidth;
      tumgoStage.classList.add('is-switched');
    }
  }

  tumgoBeatBtns.forEach(btn => {
    const idx = Number(btn.dataset.tumgoBeat);
    btn.addEventListener('pointerenter', () => applyTumgoBeat(idx, true));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      applyTumgoBeat(idx, true);
    });
  });

  /* Five-second actual video previews rendered from the user's existing photo assets.
     Not misrepresented as finished footage. Replacing assets/previews/*.mp4 with real 5s footage is supported. */
  let activePeek=null;
  function closePeek(){
    if(!activePeek)return;
    const q=activePeek, v=$('video',q), bar=$('.quicklook-progress span',q);
    v.pause();q.classList.remove('is-playing');activePeek=null;
    setTimeout(()=>{if(!q.classList.contains('is-playing')){q.hidden=true;v.currentTime=0;bar.style.width='0%';}},600);
  }
  function openPeek(key){
    closePeek();const q=$(`[data-quicklook="${key}"]`),v=$('video',q);
    if(!q)return;
    q.hidden=false;activePeek=q;v.currentTime=0;
    requestAnimationFrame(()=>q.classList.add('is-playing'));
    v.play().catch(()=>{closePeek();openFilm(key,'watch',0)});
  }
  $$('[data-peek]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();openPeek(btn.dataset.peek)}));
  $$('[data-close-peek]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();closePeek()}));
  $$('.quicklook video').forEach(v=>{
    v.addEventListener('timeupdate',()=>{const q=v.closest('.quicklook');const bar=$('.quicklook-progress span',q);bar.style.width=`${Math.min(100,Math.max(0,v.currentTime/5*100))}%`;if(v.currentTime>=5)closePeek()});
    v.addEventListener('ended',closePeek);
  });

  /* Pointer depth with restraint: no jump on pointer leave, eased via CSS. */
  const heroArt=$('.hero-art');
  if(heroArt&&!prefersReducedMotion&&matchMedia('(pointer:fine)').matches){
    heroArt.addEventListener('pointermove',e=>{
      const r=heroArt.getBoundingClientRect(),x=((e.clientX-r.left)/r.width-.5)*13,y=((e.clientY-r.top)/r.height-.5)*10;
      $$('.hero-sheet img',heroArt).forEach((im,i)=>{im.style.setProperty('--shift-x',`${x*(i===0?1:-.6)}px`);im.style.setProperty('--shift-y',`${y*(i===0?1:-.6)}px`)});
    },{passive:true});
    heroArt.addEventListener('pointerleave',()=>$$('.hero-sheet img',heroArt).forEach(im=>{im.style.removeProperty('--shift-x');im.style.removeProperty('--shift-y')}));
  }
  /* Easy Ease entrance (velocity decays): fade/blur/translation, with native scrolling preserved. */
  if('IntersectionObserver' in window&&!prefersReducedMotion){
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}
    }),{threshold:.10,rootMargin:'0px 0px -25px 0px'});
    $$('.reveal').forEach(el=>obs.observe(el));
  }else{$$('.reveal').forEach(el=>el.classList.add('is-visible'))}

  /* Scroll-linked cinematic parallax. requestAnimationFrame + exponential damping
     are equivalent to easing the scroll keyframes instead of making them linear.
     No external font/JS libraries and respects reduced motion. */
  const interlude=$('.interlude'), breath=$('.interlude-quote');
  const trackedStages=$$('.motion-stage');let scrollTarget=scrollY,scrollSmoothed=scrollY,animating=false;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function animateScroll(){
    if(prefersReducedMotion){animating=false;return}
    scrollSmoothed+=(scrollTarget-scrollSmoothed)*.085;
    const delta=scrollSmoothed-scrollTarget;
    const adjusted=scrollY+delta;
    trackedStages.forEach(stage=>{
      const top=stage.getBoundingClientRect().top+scrollY;
      const pos=clamp((innerHeight*.5 - (top+stage.offsetHeight*.5-adjusted))/(innerHeight*.7+stage.offsetHeight*.5),-1,1);
      stage.style.setProperty('--poster-scroll-y',`${(pos*15).toFixed(2)}px`);
      // Scroll-to-cinema: the three real stills change progressively while scrolling.
      // Mouse exploration overrides this while the visitor is directly interacting.
      const visibleProgress=clamp((innerHeight-(top-adjusted))/(innerHeight+stage.offsetHeight),0,.999);
      const key=stage.dataset.motion;
      if(!stage.classList.contains('is-moving')&&!stages[key]?.pinned&&$(`[data-quicklook="${key}"]`)?.hidden!==false){
        setStage(key,Math.floor(visibleProgress*3));
      }
    });
    if(interlude&&breath){const top=interlude.getBoundingClientRect().top+scrollY;
    const mid=top+interlude.offsetHeight/2-adjusted;
    const normalized=clamp((innerHeight/2-mid)/(innerHeight*.7),-1,1);
    breath.style.setProperty('--breath-y',`${(-normalized*30).toFixed(2)}px`);
    breath.style.setProperty('--breath-opacity',String((1-Math.abs(normalized)*.13).toFixed(3)));}
    const max=document.documentElement.scrollHeight-innerHeight;
    $('#reading-progress').style.width=`${max>0?clamp(scrollY/max*100,0,100):0}%`;
    if(Math.abs(scrollTarget-scrollSmoothed)>0.2){requestAnimationFrame(animateScroll)}else animating=false;
  }
  function scheduleScroll(){scrollTarget=scrollY;if(!animating){animating=true;requestAnimationFrame(animateScroll)}}
  addEventListener('scroll',scheduleScroll,{passive:true});
  addEventListener('resize',scheduleScroll,{passive:true});
  scheduleScroll();

  /* ===== Screening room (V5.2): one film, one player, quiet details ===== */
  const filmInfo={
    memory:{
      number:'첫 번째 작품', next:'tumgo', nextLabel:'틈GO 광고 영상 보기',
      poster:'assets/memory-cover.webp',
      logline:'엄마가 채워 보내던 반찬통이, 27년 만에 아들의 손으로 채워져 돌아온다.',
      synopsis:'1999년의 도트, 2007년의 3D, 2026년의 실사. 시대마다 그림의 결이 바뀌는 동안 같은 반찬통이 엄마에게서 아들로, 다시 엄마에게로 건너간다.',
      meta:[['형식','브랜드 필름 (락앤락 비공식, 교육용)'],['러닝타임','1분 23초'],['제작','2026, 기획·연출·편집 정재환'],['기획 보조','ChatGPT, Claude'],['이미지','GPT Image (컷별 시작·끝 프레임, 도트 원화)'],['영상','Seedance 2.5'],['소리','ElevenLabs v3 (대사·나레이션), Suno (음악), Mirelo, MMAudio·ComfyUI (효과음)'],['편집·합성','After Effects (도트 애니메이션, 전환, 타이포), Photoshop (도트 원화 정리), Premiere Pro (편집, 색, 믹스)']],
      chapters:[['고지',0,3],['1999 기억',3,19.2],['전환',19.2,26.5],['2007 성장',26.5,47.6],['전환',47.6,50.4],['2026 현실',50.4,75.6],['엔딩',75.6,82.8]]
    },
    tumgo:{
      number:'두 번째 작품', next:'memory', nextLabel:'반찬통의 왕복 광고 영상 보기',
      poster:'assets/tumgo-cover.webp',
      logline:'문 앞에 두세요. 나머지는 틈GO가.',
      synopsis:'늦은 퇴근길 계단에서 처음 마주친 배송 로봇. 밀린 빨래와 수선을 문 앞에서 맡기고 돌려받는, 가까운 미래의 생활 서비스를 실사형 AI 영상으로 그렸다.',
      meta:[['형식','서비스 광고 (가상 서비스)'],['러닝타임','약 1분'],['제작','2026, 기획·연출·편집 정재환'],['주인공','김현우, 31세, 촬영 현장 스태프'],['기획 보조','ChatGPT, Claude'],['이미지','GPT Image, Nano Banana, Gemini (캐릭터·로봇·공간 기준 이미지)'],['영상','Google Flow (Veo 3.1), Kling (잡기·들기 같은 접촉 동작), Runway'],['소리','ElevenLabs (김현우 1인칭 나레이션), Suno (음악), 후반 효과음'],['편집·합성','After Effects (로봇 합성, UI·자막), Premiere Pro (편집, 색, 믹스)']],
      chapters:null
    }
  };
  const chapEl=$('#sc-chapters');
  const fmtShort=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  function seekTo(t){
    if(!videoState[currentFilm].url||video.hidden)return;
    const go=()=>{video.currentTime=Math.min(t,Math.max(0,(video.duration||t)-.05));};
    video.readyState>=1?go():video.addEventListener('loadedmetadata',go,{once:true});
  }
  function renderChapters(){
    const f=filmInfo[currentFilm];chapEl.replaceChildren();
    const ch=f.chapters;chapEl.hidden=!ch;
    if(!ch)return;
    const total=ch[ch.length-1][2];
    ch.forEach(([name,a,b])=>{
      const btn=document.createElement('button');btn.type='button';btn.className='sc-chap';
      btn.style.flexGrow=String(b-a);btn.dataset.start=a;btn.dataset.end=b;
      btn.innerHTML=`<span class="sc-chap-name">${escapeHTML(name)}</span><span class="sc-chap-track"><span class="sc-chap-fill"></span></span><span class="sc-chap-time">${fmtShort(a)}</span>`;
      btn.addEventListener('click',()=>{seekTo(a);video.play().catch(()=>{});});
      chapEl.append(btn);
    });
    chapEl.dataset.total=total;
  }
  function updateChapters(t){
    $$('.sc-chap',chapEl).forEach(b=>{
      const a=+b.dataset.start,e=+b.dataset.end,p=Math.max(0,Math.min(1,(t-a)/(e-a)));
      b.classList.toggle('is-now',t>=a&&t<e);
      b.querySelector('.sc-chap-fill').style.transform=`scaleX(${p})`;
    });
  }
  function renderCuts(){
    const p=projectData[currentFilm],f=filmInfo[currentFilm],list=$('#sc-cut-list');list.replaceChildren();
    const timed=!!f.chapters;
    p.cuts.forEach(c=>{
      const li=document.createElement('li');
      li.innerHTML=`<button type="button"${timed?'':' disabled'}><span class="sc-cut-time">${timed?fmtShort(c.start):''}</span><span class="sc-cut-no">${escapeHTML(c.cut)}</span><span class="sc-cut-body"><strong>${escapeHTML(c.title)}</strong><small>${escapeHTML(c.visual)}</small></span></button>`;
      if(timed)li.firstElementChild.addEventListener('click',()=>{seekTo(c.start);video.play().catch(()=>{});$('.sc-stage').scrollIntoView({behavior:prefersReducedMotion?'auto':'smooth',block:'start'});});
      list.append(li);
    });
    $('#sc-cuts-count').textContent=`${p.cuts.length}컷`;
    $('#sc-cut-note').textContent=timed?'컷을 누르면 그 장면부터 재생됩니다.':'이 목록은 기획 단계의 컷 기준이라 컷 시간은 표시하지 않습니다.';
  }
  function renderInfo(){
    const f=filmInfo[currentFilm];
    $('#sc-number').textContent=f.number;$('#sc-title').textContent=projectData[currentFilm].name;
    $('#sc-logline').textContent=f.logline;$('#sc-synopsis').textContent=f.synopsis;
    $('#sc-next-label').textContent=f.nextLabel;$('#sc-poster-img').src=f.poster;video.poster=f.poster;
    $('#sc-meta').innerHTML=f.meta.map(([k,v])=>`<div><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join('');
    dialog.dataset.film=currentFilm;
  }
  const statusEl=$('#player-status');
  function connectMediaIfNeeded(){
    const state=videoState[currentFilm];
    video.pause();
    if(!state.url){video.removeAttribute('src');video.load();video.hidden=true;$('#sc-poster').hidden=false;statusEl.textContent='영상 준비 중입니다';return}
    $('#sc-poster').hidden=false;statusEl.textContent='영상을 불러오는 중입니다';
    video.src=state.url;video.load();
    video.onloadeddata=()=>{video.hidden=false;$('#sc-poster').hidden=true;};
    video.onerror=()=>{
      const code=video.error&&video.error.code;
      const why={2:'네트워크 문제로 영상을 받지 못했습니다',3:'영상을 해독하지 못했습니다',4:'영상 주소를 찾지 못했습니다'}[code]||'영상을 재생할 수 없습니다';
      console.warn('[portfolio video]',currentFilm,state.url,video.error);
      video.hidden=true;$('#sc-poster').hidden=false;statusEl.textContent=`${why} (오류 ${code??'-'})`;
    };
  }
  function openFilm(key,tab='watch',cut=0){
    closePeek();currentFilm=key;currentCut=cut;
    renderInfo();renderChapters();renderCuts();updateChapters(0);
    $('#sc-cuts').open=(tab==='making'||tab==='cuts');
    connectMediaIfNeeded();
    const sc=dialog.querySelector('.sc'),wasOpen=dialog.open;
    if(!wasOpen){dialog.classList.remove('is-in');dialog.showModal()}
    // 컷 아카이브: 시트가 올라오기 전에 아카이브 위치로 맞춰 두어, 올라올 때 바로 아카이브가 보이게 한다
    const toCuts=()=>{const t=$('#sc-cuts');sc.scrollTop=(tab==='making'||tab==='cuts')?Math.max(0,t.offsetTop-80):0};
    toCuts();requestAnimationFrame(()=>{toCuts();requestAnimationFrame(()=>dialog.classList.add('is-in'))});
    const c=projectData[key].cuts[cut];if(cut&&c&&filmInfo[key].chapters)seekTo(c.start);
  }
  let closing=0;
  function closeFilm(){if(!dialog.open)return;video.pause();dialog.classList.remove('is-in');clearTimeout(closing);closing=setTimeout(()=>{if(!dialog.classList.contains('is-in'))dialog.close()},700)}
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeFilm()});
  $('#close-modal').addEventListener('click',closeFilm);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeFilm()});
  dialog.addEventListener('close',()=>video.pause());
  $('#switch-film').addEventListener('click',()=>openFilm(filmInfo[currentFilm].next));
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>{
    if(b.classList.contains('header-screening')){
      const tEl=$('#tumgo');
      if(tEl){const r=tEl.getBoundingClientRect();if(r.top<innerHeight*.55&&r.bottom>innerHeight*.2){openFilm('tumgo');return}}
    }
    openFilm(b.dataset.open);
  }));
  $$('[data-open-notes]').forEach(b=>b.addEventListener('click',()=>openFilm(b.dataset.openNotes,'making')));
  $$('[data-jump]').forEach(b=>b.addEventListener('click',()=>{const [key,n]=b.dataset.jump.split(':');openFilm(key,'watch',Number(n))}));
  $('#open-evaluator')?.addEventListener('click',()=>openFilm('memory','making'));
  video.addEventListener('timeupdate',()=>updateChapters(video.currentTime));
  /* Glide: SCROLL TO EXPLORE 클릭 시 AE Easy Ease처럼 천천히 출발해 천천히 멈추는 스크롤 */
  const headerH=()=>($('.site-header')?.offsetHeight||0);
  const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  let glideId=0;
  function glideTo(el){
    const start=scrollY,end=(el.id==='top'||el.tagName==='HEADER')?0:Math.max(0,el.getBoundingClientRect().top+scrollY-headerH()),dist=end-start;
    if(Math.abs(dist)<2)return;
    const dur=Math.min(1700,Math.max(1000,700+Math.abs(dist)*.45)),t0=performance.now(),id=++glideId;
    const stop=()=>{glideId++;removeEventListener('wheel',stop);removeEventListener('touchstart',stop)};
    addEventListener('wheel',stop,{passive:true,once:true});addEventListener('touchstart',stop,{passive:true,once:true});
    (function step(now){
      if(id!==glideId)return;
      const p=Math.min(1,(now-t0)/dur);scrollTo(0,start+dist*easeIO(p));
      if(p<1)requestAnimationFrame(step);else stop();
    })(t0);
  }
  window.__glideTo=glideTo;window.__openFilm=(k,t)=>openFilm(k,t);
  $$('a[data-glide]').forEach(a=>a.addEventListener('click',e=>{const t=$(a.getAttribute('href'));if(!t)return;e.preventDefault();glideTo(t)}));
  /* 작품 소개 화면: 들어올 때마다 모션그래픽 재생 */
  const intro=$('.section-intro');
  if(intro&&'IntersectionObserver' in window){
    new IntersectionObserver(es=>es.forEach(e=>{
      if(e.intersectionRatio>=.55)intro.classList.add('intro-play');
      else if(e.intersectionRatio<.05)intro.classList.remove('intro-play');
    }),{threshold:[0,.05,.55]}).observe(intro);
  }else if(intro)intro.classList.add('intro-play');

  /* ABOUT: 이메일 복사 */
  const copyBtn=$('#copy-mail');
  if(copyBtn)copyBtn.addEventListener('click',async()=>{
    const mail=$('#about-mail').textContent.trim();
    try{await navigator.clipboard.writeText(mail);copyBtn.textContent='복사됨';}
    catch(e){const r=document.createRange();r.selectNodeContents($('#about-mail'));const sel=getSelection();sel.removeAllRanges();sel.addRange(r);copyBtn.textContent='선택됨 · Ctrl+C';}
    setTimeout(()=>copyBtn.textContent='주소 복사',1800);
  });
  /* 구간 표시: 스크롤 옆에 현재 위치 */
  const rail=$('#sec-rail');
  if(rail){
    const secs=[['#projects','처음'],['#hero','작품 목록'],['#memory','반찬통의 왕복'],['#memory-notes','반찬통 제작 노트'],['#tumgo','틈GO'],['#process','작업 노트'],['#about','소개']].map(([sel,label])=>({el:$(sel),label})).filter(x=>x.el);
    const ticks=$('#sr-ticks'),label=$('#sr-label');
    secs.forEach((x,i)=>{const li=document.createElement('li');const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',x.label);b.addEventListener('click',()=>glideTo(x.el));li.append(b);ticks.append(li)});
    let cur=-1;
    const update=()=>{
      const y=scrollY+innerHeight*.45;let idx=0;
      secs.forEach((x,i)=>{const t=i===0?0:x.el.getBoundingClientRect().top+scrollY;if(y>=t)idx=i});
      rail.classList.toggle('is-shown',scrollY>innerHeight*.3);
      if(idx!==cur){cur=idx;document.documentElement.style.setProperty('--sec-p',(idx/(secs.length-1)).toFixed(4));label.textContent=secs[idx].label;$$('li',ticks).forEach((l,i)=>l.classList.toggle('is-on',i===idx))}
    };
    addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
  }

  /* STORIES 위치: '이야기.' 오른쪽 끝에서 한 글자 간격 띄워 같은 줄 높이에 둔다 */
  const ghost=$('.intro-ghost'),stmt=$('.intro-statement'),line2=$('.section-intro h2 .ln:nth-child(2)>span');
  function placeGhost(){
    if(!ghost||!stmt||!line2)return;
    // offset 값은 등장 애니메이션(transform)의 영향을 받지 않는다
    const gap=parseFloat(getComputedStyle(line2.closest('h2')).fontSize)*.22;
    let x=line2.offsetLeft+line2.offsetWidth+gap,y=line2.offsetTop+(line2.offsetHeight-ghost.offsetHeight)/2;
    for(let e=line2.offsetParent;e&&e!==stmt;e=e.offsetParent){x+=e.offsetLeft;y+=e.offsetTop}
    ghost.style.setProperty('--ghost-x',`${x}px`);ghost.style.setProperty('--ghost-y',`${y}px`);
  }
  placeGhost();addEventListener('resize',placeGhost);document.fonts&&document.fonts.ready.then(placeGhost);

  /* BEHIND THE FRAME: 드래그로 비교, 탭으로 장면 바꾸기 */
  const pairs={memory:[
    {b:'assets/making/m05-before.webp',a:'assets/making/m05-after.webp',l:'1999 도트',r:'2007 3D',start:50,cap:'같은 구도로 맞춘 도트 프레임과 3D 프레임. After Effects에서 도트를 픽셀 단위로 흩었다가 같은 자리의 3D로 모으고, 화면을 4:3에서 16:9로 넓혔습니다.'},
    {b:'assets/making/m18-before.webp',a:'assets/making/m18-after.webp',l:'합성 전 배경',r:'AE 타이포 합성',start:6,cap:'Seedance로 만든 글자 없는 엔딩 배경 위에, After Effects로 카피 세 줄과 밑줄, 워드마크를 나레이션 박자에 맞춰 올렸습니다. 왼쪽은 페이드 인 중인 프레임이라 조금 어둡습니다.'}]};
  $$('.mk-compare').forEach(box=>{
    const stage=$('.mk-stage',box),before=$('.mk-before',box),list=pairs[box.dataset.film]||[];
    let pos=50,drag=false;
    const set=p=>{pos=Math.max(0,Math.min(100,p));box.style.setProperty('--mk',pos+'%')};
    const fromX=x=>{const r=stage.getBoundingClientRect();set((x-r.left)/r.width*100)};
    set(50);
    stage.addEventListener('pointerdown',e=>{drag=true;stage.setPointerCapture(e.pointerId);box.classList.add('is-drag');fromX(e.clientX)});
    stage.addEventListener('pointermove',e=>{if(drag)fromX(e.clientX)});
    const end=()=>{drag=false;box.classList.remove('is-drag')};
    stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
    stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){set(pos-5);e.preventDefault()}if(e.key==='ArrowRight'){set(pos+5);e.preventDefault()}});
    $$('.mk-tabs button',box).forEach(btn=>btn.addEventListener('click',()=>{
      const d=list[+btn.dataset.pair];if(!d)return;
      if(btn.classList.contains('is-on')){set(pos>60?20:pos<40?50:80);return}
      $$('.mk-tabs button',box).forEach(x=>{const on=x===btn;x.classList.toggle('is-on',on);x.setAttribute('aria-selected',String(on))});
      box.classList.add('is-swap');
      setTimeout(()=>{$('.mk-after',box).src=d.a;$('img',before).src=d.b;$('.mk-tag-l',box).textContent=d.l;$('.mk-tag-r',box).textContent=d.r;$('.mk-cap',box).textContent=d.cap;set(d.start??50);box.classList.remove('is-swap')},280);
    }));
  });
  /* STORY MOMENTS: 마우스를 올리면 그 장면이 재생, 누르면 상영관에서 그 컷부터 */
  $$('.mm').forEach(m=>{const v=$('video',m);if(!v)return;
    m.addEventListener('pointerenter',()=>{if(v.preload!=='auto'){v.preload='auto';v.load()}v.currentTime=0;const p=v.play();if(p)p.catch(()=>{});m.classList.add('is-live')});
    m.addEventListener('pointerleave',()=>{m.classList.remove('is-live');setTimeout(()=>{if(!m.classList.contains('is-live'))v.pause()},450)});
  });

  /* 2번째 화면: 들어올 때마다 글자 → 양옆 장면 순서로 등장, 장면을 누르면 그 작품·그 장면으로 이동 */
  const hero2=$('.hero2');
  if(hero2&&'IntersectionObserver' in window){
    new IntersectionObserver(es=>es.forEach(e=>{
      if(e.intersectionRatio>=.5)hero2.classList.add('hero-play');
      else if(e.intersectionRatio<.05)hero2.classList.remove('hero-play');
    }),{threshold:[0,.05,.5]}).observe(hero2);
  }else if(hero2)hero2.classList.add('hero-play');
  const unpin=()=>Object.values(stages).forEach(st=>st.pinned=false);
  $$('.hs-scene').forEach(b=>b.addEventListener('click',()=>{
    const [key,n]=b.dataset.go.split(':');const target=$('#'+key);if(!target)return;
    unpin();stages[key].pinned=true;setStage(key,Number(n));glideTo(target);
    setTimeout(()=>{const once=()=>{unpin();removeEventListener('wheel',once);removeEventListener('touchmove',once);removeEventListener('keydown',once)};addEventListener('wheel',once,{passive:true});addEventListener('touchmove',once,{passive:true});addEventListener('keydown',once)},1800);
  }));

  /* G key: toggle the 1920×950 / 1440 layout guide for review */
  const guide=$('#layout-guide');
  addEventListener('keydown',e=>{if((e.key==='g'||e.key==='G')&&!e.target.closest('input,textarea')&&!dialog.open){guide.hidden=!guide.hidden}});
  if(location.hash==='#guide')guide.hidden=false;
  addEventListener('beforeunload',()=>Object.values(videoState).forEach(s=>{if(s.url&&s.url.startsWith('blob:'))URL.revokeObjectURL(s.url)}));
})();

/* V6.2 첫 화면 옅은 영상 배경: 두 티저를 번갈아 반복 */
(()=>{const v=document.querySelector('.ib-video');if(!v)return;const list=v.dataset.list.split(',');let i=0;
  const load=()=>{v.src=list[i];v.play().catch(()=>{})};
  v.addEventListener('playing',()=>v.classList.add('is-on'));
  v.addEventListener('timeupdate',()=>{if(v.duration&&v.duration-v.currentTime<1.2)v.classList.remove('is-on')});
  v.addEventListener('ended',()=>{i=(i+1)%list.length;load()});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){if(!v.src)load();else v.play().catch(()=>{})}else v.pause()}));
  io.observe(v.closest('section'));
})();
/* V6.2 제목+STORIES 덩어리를 콘텐츠 띠 가운데로 */
(()=>{const st=document.querySelector('.intro-statement'),gh=document.querySelector('.intro-ghost');if(!st||!gh)return;
  const fit=()=>{if(innerWidth<=1100){st.style.removeProperty('--intro-shift');return}
    st.style.setProperty('--intro-shift','0px');
    requestAnimationFrame(()=>{let l=st.offsetLeft,r=l+st.offsetWidth;const gr=l+gh.offsetLeft+gh.offsetWidth;r=Math.max(r,gr);
      const par=st.offsetParent||document.body,cx=par.clientWidth/2;st.style.setProperty('--intro-shift',`${Math.round(cx-(l+r)/2)}px`);
      const id=st.querySelector('.intro-id'),l1=st.querySelector('h2 .ln>span');if(id&&l1){id.style.marginLeft='0px';id.style.marginLeft=`${Math.round(l1.getBoundingClientRect().left-id.getBoundingClientRect().left)}px`}});};
  addEventListener('resize',()=>setTimeout(fit,30));document.fonts&&document.fonts.ready.then(()=>setTimeout(fit,60));setTimeout(fit,300);setTimeout(fit,2700);
})();

/* V6.3 인터미션 타이포: 영문은 단어, 한글은 글자 단위로 쪼개서 순서대로 */
(()=>{const sec=document.querySelector('.interlude');if(!sec)return;
  let i=0;sec.querySelectorAll('.iq-line').forEach(l=>{const words=l.textContent.trim().split(/\s+/);l.textContent='';words.forEach((w,k)=>{const o=document.createElement('span');o.className='w';const n=document.createElement('i');n.textContent=w;n.style.setProperty('--i',i++);o.append(n);l.append(o);if(k<words.length-1)l.append(' ')})});
  let j=0;sec.querySelectorAll('.ik-line').forEach(l=>{const words=l.textContent.split(' ');l.textContent='';words.forEach((w,k)=>{const wd=document.createElement('span');wd.className='wd';[...w].forEach(c=>{const s=document.createElement('span');s.className='ch';s.textContent=c;s.style.setProperty('--i',j++);wd.append(s)});l.append(wd);if(k<words.length-1){l.append(' ');j++}})});
  new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)sec.classList.add('il-play')}),{threshold:.35}).observe(sec);
})();

/* V7.4 소풍에서 뚜껑을 닫고 오면(?play=memory) 그 작품 영상을 바로 연다 */
(()=>{const k=new URLSearchParams(location.search).get('play');if(!k||!['memory','tumgo'].includes(k))return;
  const go=()=>{if(window.__openFilm)window.__openFilm(k);else setTimeout(go,100)};setTimeout(go,400);
  history.replaceState(null,'',location.pathname+location.hash)})();

/* V7.7 첫 화면 순서: 영상 → 제목 한 줄씩 타자 치듯 → 소개 → 참여 카드 차례로 → 작품 링크 */
(()=>{const sec=document.querySelector('.section-intro');if(!sec)return;const lines=[...sec.querySelectorAll('.type-in .tl')];
  const at=(ms,fn)=>setTimeout(fn,ms);let t=200;
  at(t,()=>sec.classList.add('seq-0'));t+=500;
  at(t,()=>sec.classList.add('seq-1'));
  lines.forEach(l=>{const n=[...l.textContent].length,d=Math.max(.45,n*.075);l.style.setProperty('--tl-steps',n);l.style.setProperty('--tl-dur',d+'s');at(t,()=>l.classList.add('is-typed'));t+=d*1000+180});
  at(t+=100,()=>sec.classList.add('seq-2'));
  at(t+=550,()=>sec.classList.add('seq-3'));
  at(t+=(document.querySelectorAll('.play-card').length*160)+500,()=>sec.classList.add('seq-4'));
})();

// V9.1 BGM Audio Controller with Volume Slider & Smooth Fadeout Navigation
(()=>{
  const bgmAudio = document.getElementById('site-bgm');
  const bgmBtn = document.getElementById('bgm-toggle');
  const volSlider = document.getElementById('bgm-volume');
  if(!bgmAudio) return;
  
  let bgmPlaying = false;
  const savedVol = localStorage.getItem('portfolio-bgm-volume');
  const initialVol = savedVol !== null && Number.isFinite(Number(savedVol)) ? Math.max(0,Math.min(1,Number(savedVol))) : 0.5;
  bgmAudio.volume = initialVol;
  if(volSlider) volSlider.value = initialVol;

  function setBgmState(play) {
    bgmPlaying = play;
    if(bgmBtn) {
      bgmBtn.classList.toggle('is-playing', bgmPlaying);
      bgmBtn.setAttribute('aria-pressed', String(bgmPlaying));
      bgmBtn.setAttribute('aria-label',bgmPlaying?'체험 음악 끄기':'체험 음악 켜기');
      const txt = bgmBtn.querySelector('.bgm-text');
      if(txt) txt.textContent = bgmPlaying ? '체험 음악 끄기' : '체험 음악 켜기';
    }
    if(bgmPlaying) {
      const vol = volSlider ? parseFloat(volSlider.value) : initialVol;
      bgmAudio.volume = vol > 0 ? vol : 0.5;
      if(volSlider && vol === 0) volSlider.value = 0.5;
      const p = bgmAudio.play();
      if(p) p.catch(() => {
        bgmPlaying = false;
        if(bgmBtn) {
          bgmBtn.classList.remove('is-playing');
          bgmBtn.setAttribute('aria-pressed', 'false');bgmBtn.setAttribute('aria-label','체험 음악 켜기');
          const txt = bgmBtn.querySelector('.bgm-text');
          if(txt) txt.textContent = '체험 음악 켜기';
        }
      });
    } else {
      bgmAudio.pause();
    }
  }

  if(bgmBtn) {
    bgmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setBgmState(!bgmPlaying);
    });
  }

  if(volSlider) {
    volSlider.addEventListener('input', () => {
      const val = parseFloat(volSlider.value);
      bgmAudio.volume = val;
      localStorage.setItem('portfolio-bgm-volume', String(val));
      if(val === 0 && bgmPlaying) {
        setBgmState(false);
      }
    });
  }

  document.getElementById('screen-video')?.addEventListener('play',()=>setBgmState(false));
  document.getElementById('playground')?.addEventListener('toggle',e=>{if(!e.currentTarget.open)setBgmState(false)});

  // Smooth Fadeout before entering 1999 소풍(picnic.html) or 틈GO 원룸(room.html)
  function fadeOutAndNavigate(url, duration = 380) {
    if(!bgmAudio || bgmAudio.paused || bgmAudio.volume <= 0.01) {
      window.location.href = url;
      return;
    }
    const startVol = bgmAudio.volume;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      bgmAudio.volume = Math.max(0, startVol * (1 - progress));
      if(progress < 1) {
        requestAnimationFrame(step);
      } else {
        bgmAudio.pause();
        bgmPlaying = false;
        if(bgmBtn) {
          bgmBtn.classList.remove('is-playing');
          bgmBtn.setAttribute('aria-pressed', 'false');bgmBtn.setAttribute('aria-label','체험 음악 켜기');
        }
        window.location.href = url;
      }
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href*="picnic.html"], a[href*="room.html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      // Don't intercept if modified click (new tab)
      if(e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      const href = link.getAttribute('href');
      if(href && bgmAudio && !bgmAudio.paused) {
        e.preventDefault();
        fadeOutAndNavigate(href);
      }
    });
  });

  // Mouse ambient parallax
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX - window.innerWidth / 2);
    const y = (e.clientY - window.innerHeight / 2);
    document.documentElement.style.setProperty('--mouse-x', `${x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${y}px`);
  }, { passive: true });
})();


