/* Film portfolio — dependency-free interactions, 2026. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const projectData = {
    memory: {name:'반찬통의 왕복', number:'FILM 01 / THE RETURN',cuts: MEMORY_CUTS, duration:83.0, color:'#96a7c6', note:'1999 도트 → 2007 3D → 2026 실사. 시대가 바뀌는 시점에 같은 반찬통의 위치와 동작을 연결하고, 잠금 소리도 칩튠에서 실제 음향으로 성장하도록 설계했습니다.'},
    tumgo: {name:'틈GO (TUMGO)', number:'FILM 02 / TUMGO',cuts:TUMGO_CUTS,duration:62.04,color:'#a8e7b8',note:'서울의 야간 계단, 101호 현관, 4족 서비스 로봇. 캐릭터와 공간을 반복 검증하며 기계적 보행, QR 스캔, 가방 적재를 장면별로 구성했습니다.'}
  };
  let currentFilm='memory', currentCut=0;
  // Public film URLs are configured in video-config.js (never put a Blob token here).
  const configured=window.PORTFOLIO_VIDEO_URLS||{};
  const publishedVideoSources={memory:configured.memory||'',tumgo:configured.tumgo||''};
  const videoState={memory:{url:publishedVideoSources.memory||null,name:'Published master'},tumgo:{url:publishedVideoSources.tumgo||null,name:'Published master'}};
  const dialog=$('#screening-dialog'),video=$('#screen-video');
  const fmt=t=>{const m=Math.floor(t/60),s=Math.floor(t%60),d=Math.floor((t%1)*10);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${d}`};
  const escapeHTML = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* Direct image exploration: pointer position selects 1999/2007/2026 or each TUMGO beat.
     Crossfades use a real F9-like ease-in-out curve in CSS, never hard timed cuts. */
  const captions={
    memory:['1999 · FIRST MEMORY','2007 · THE MEMORY GROWS','2026 · THE RETURN HOME'],
    tumgo:['THE FIRST ENCOUNTER','AUTONOMOUS PICKUP','EVERYDAY INTERRUPTED']
  };
  const stages={};
  function setStage(key,n){
    const stage=stages[key];if(!stage)return;
    const index=((n%stage.slides.length)+stage.slides.length)%stage.slides.length;
    if(stage.index===index)return;
    stage.slides.forEach((el,i)=>el.classList.toggle('is-active',i===index));stage.index=index;
    const cap=$(`#${key}-stage-caption`);if(cap)cap.textContent=captions[key][index];
    if(key==='memory')$$('[data-era]').forEach(b=>b.classList.toggle('is-selected',Number(b.dataset.era)===index));
  }
  $$('.motion-stage').forEach(stage=>{
    const key=stage.dataset.motion;
    stages[key]={el:stage,slides:$$('.stage-layer',stage),index:0};
    if(prefersReducedMotion)return;
    stage.addEventListener('pointerenter',()=>stage.classList.add('is-moving'));
    stage.addEventListener('pointerleave',()=>{stage.classList.remove('is-moving');stage.style.removeProperty('--image-shift-x');stage.style.removeProperty('--image-shift-y');});
    stage.addEventListener('pointermove',e=>{
      if(matchMedia('(pointer:coarse)').matches||!$(`[data-quicklook="${key}"]`).hidden)return;
      const r=stage.getBoundingClientRect(),u=Math.max(0,Math.min(.999,(e.clientX-r.left)/r.width));
      setStage(key,Math.floor(u*3));
      stage.style.setProperty('--image-shift-x',`${(u-.5)*1.8}%`);
      stage.style.setProperty('--image-shift-y',`${((e.clientY-r.top)/r.height-.5)*1.3}%`);
    },{passive:true});
  });
  $$('[data-era]').forEach(btn=>btn.addEventListener('click',()=>setStage('memory',Number(btn.dataset.era))));

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
      if(!stage.classList.contains('is-moving')&&$(`[data-quicklook="${key}"]`).hidden){
        setStage(key,Math.floor(visibleProgress*3));
      }
    });
    const top=interlude.getBoundingClientRect().top+scrollY;
    const mid=top+interlude.offsetHeight/2-adjusted;
    const normalized=clamp((innerHeight/2-mid)/(innerHeight*.7),-1,1);
    breath.style.setProperty('--breath-y',`${(-normalized*30).toFixed(2)}px`);
    breath.style.setProperty('--breath-opacity',String((1-Math.abs(normalized)*.13).toFixed(3)));
    const max=document.documentElement.scrollHeight-innerHeight;
    $('#reading-progress').style.width=`${max>0?clamp(scrollY/max*100,0,100):0}%`;
    if(Math.abs(scrollTarget-scrollSmoothed)>0.2){requestAnimationFrame(animateScroll)}else animating=false;
  }
  function scheduleScroll(){scrollTarget=scrollY;if(!animating){animating=true;requestAnimationFrame(animateScroll)}}
  addEventListener('scroll',scheduleScroll,{passive:true});
  addEventListener('resize',scheduleScroll,{passive:true});
  scheduleScroll();

  function setTab(name){
    $$('.modal-tabs [data-tab]').forEach(b=>{const active=b.dataset.tab===name;b.classList.toggle('selected',active);b.setAttribute('aria-selected',String(active))});
    $$('.tab-panel').forEach(p=>p.hidden=p.dataset.panel!==name);
    if(name==='cuts')renderArchive();
    if(name==='making')renderNotes();
  }
  function renderNotes(){
    $('#notes-film-title').textContent=projectData[currentFilm].name;
    $('#notes-specific').textContent=projectData[currentFilm].note;
  }
  function selectCut(n,doSeek=true){
    const p=projectData[currentFilm];if(n<0||n>=p.cuts.length)return;
    currentCut=n;const c=p.cuts[n];
    $('#active-cut-title').textContent=`${c.cut} — ${c.title}`;
    $('#active-cut-desc').textContent=c.visual;
    $('#active-cut-audio').textContent=`AUDIO / ${c.sfx||c.audio||'별도 효과음'}`;
    $('#active-cut-time').textContent=`${fmt(c.start)} — ${fmt(c.end)}`;
    $('#previs-title').textContent=c.title;
    $('#previs-image').src=`assets/${c.art}.webp`;
    $$('#cut-timeline button').forEach((b,i)=>b.classList.toggle('is-active',i===n));
    $('#timeline-duration').textContent=`${fmt(c.start)} / ${fmt(p.duration)}`;
    if(doSeek&&videoState[currentFilm].url){
      if(video.readyState>=1){video.currentTime=Math.min(c.start,Math.max(0,video.duration-.05));}
      else video.addEventListener('loadedmetadata',()=>{video.currentTime=Math.min(c.start,video.duration-.05)},{once:true});
    }
    const b=$$(`#cut-timeline button`)[n];if(b&&doSeek)b.scrollIntoView({behavior:prefersReducedMotion?'instant':'smooth',inline:'center',block:'nearest'});
  }
  function renderTimeline(){
    const p=projectData[currentFilm];const strip=$('#cut-timeline');strip.replaceChildren();
    p.cuts.forEach((c,i)=>{
      const b=document.createElement('button');b.type='button';b.innerHTML=`<strong>${escapeHTML(c.cut)}</strong><small>${fmt(c.start)} · ${escapeHTML(c.title)}</small>`;
      b.title=`${c.cut}: ${c.title}`;b.addEventListener('click',()=>selectCut(i));strip.append(b);
    });
    selectCut(Math.min(currentCut,p.cuts.length-1),false);
  }
  function renderArchive(){
    const q=$('#cut-search').value.trim().toLocaleLowerCase();
    const container=$('#cut-archive');container.replaceChildren();
    projectData[currentFilm].cuts.forEach((c,i)=>{
      const hay=[c.cut,c.title,c.visual,c.text,c.sfx,c.audio,c.seq,c.era].join(' ').toLowerCase();
      if(q&&!hay.includes(q))return;
      const b=document.createElement('button');b.type='button';b.className='archive-cut';
      b.innerHTML=`<span>${escapeHTML(c.cut)} · ${fmt(c.start)} — ${fmt(c.end)}</span><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.visual)}</p><small>${escapeHTML(c.sfx||c.audio||'')}</small>`;
      b.addEventListener('click',()=>{setTab('watch');selectCut(i)});container.append(b);
    });
  }
  function connectMediaIfNeeded(){
    const state=videoState[currentFilm],p=projectData[currentFilm];
    if(!state.url){video.pause();video.removeAttribute('src');video.load();video.hidden=true;$('#previs-area').hidden=false;$('#player-status').textContent='MP4 미연결 · 스틸 프리뷰';return}
    video.pause();video.src=state.url;video.hidden=false;$('#previs-area').hidden=true;
    video.load();$('#player-status').textContent=`영상 연결됨 · ${state.name} · 길이 확인 중`;
    video.onloadedmetadata=()=>{
      const diff=Math.abs(video.duration-p.duration);
      $('#player-status').textContent=`${state.name} · ${fmt(video.duration)}`+(diff>0.8?` · ⚠ 기획서와 ${diff.toFixed(1)}초 차이`: ' · 컷 타임라인 비교 가능');
      const seekTime=p.cuts[currentCut]?.start||0;if(seekTime<video.duration)video.currentTime=seekTime;
    };
    video.onerror=()=>{$('#player-status').textContent='영상을 재생할 수 없습니다. MP4 코덱을 확인하세요.'};
  }
  function openFilm(key,tab='watch',cut=0){
    closePeek();
    currentFilm=key;currentCut=cut;
    const p=projectData[currentFilm];
    $('#modal-number').textContent=p.number;$('#modal-title').textContent=p.name;
    $('#cut-search').value='';renderTimeline();renderNotes();setTab(tab);connectMediaIfNeeded();
    if(!dialog.open)dialog.showModal();
  }
  function closeFilm(){if(!video.paused)video.pause();dialog.close()}
  $$('#close-modal').forEach(b=>b.addEventListener('click',closeFilm));
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeFilm()});
  dialog.addEventListener('close',()=>{video.pause()});
  $('#switch-film').addEventListener('click',()=>openFilm(currentFilm==='memory'?'tumgo':'memory','watch',0));
  $$('.modal-tabs [data-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
  $('#notes-open-cuts').addEventListener('click',()=>setTab('cuts'));
  $('#cut-search').addEventListener('input',renderArchive);
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>openFilm(b.dataset.open)));
  $$('[data-open-notes]').forEach(b=>b.addEventListener('click',()=>openFilm(b.dataset.openNotes,'making')));
  $$('[data-jump]').forEach(b=>b.addEventListener('click',()=>{const [key,n]=b.dataset.jump.split(':');openFilm(key,'watch',Number(n))}));
  $('#open-evaluator').addEventListener('click',()=>openFilm('memory','making'));
  const fileInput=$('#file-input');fileInput.addEventListener('change',()=>{
    const file=fileInput.files?.[0];if(!file)return;
    if(!file.type.startsWith('video/')&&!/\.(mp4|mov|webm)$/i.test(file.name)){alert('비디오 파일을 선택하세요.');return}
    const state=videoState[currentFilm];if(state.url&&state.url.startsWith('blob:'))URL.revokeObjectURL(state.url);
    state.url=URL.createObjectURL(file);state.name=file.name;connectMediaIfNeeded();
  });
  video.addEventListener('timeupdate',()=>{
    const t=video.currentTime;const cuts=projectData[currentFilm].cuts;
    $('#timeline-duration').textContent=`${fmt(t)} / ${fmt(video.duration||projectData[currentFilm].duration)}`;
    const idx=cuts.findIndex((c,i)=>t>=c.start&&t<(i===cuts.length-1?Infinity:c.end));
    if(idx!==-1&&idx!==currentCut)selectCut(idx,false);
  });
  addEventListener('beforeunload',()=>Object.values(videoState).forEach(s=>{if(s.url&&s.url.startsWith('blob:'))URL.revokeObjectURL(s.url)}));
})();
