/* V8.1 첫 화면 담기 게임: 흩어진 단어를 끌어 그 작품의 그릇(락앤락 통, 틈GO 수거 가방)에 담는다.
   한 작품의 단어를 다 담으면 체험 페이지 안내 창이 열린다. 단어를 누르기만 하면 그 작품 소개로 간다.
   작품 목록 화면: 마우스를 올린 줄(또는 포커스)이 켜진다. */
(()=>{
  const hero=document.querySelector('.v8-hero'),box=document.getElementById('vh-words'),binWrap=document.getElementById('vh-bins');
  if(!hero||!box||!binWrap)return;
  const words=[...box.querySelectorAll('.vh-word')],bins=[...binWrap.querySelectorAll('.vh-bin')],meta=hero.querySelector('.vh-meta'),panels=[...hero.querySelectorAll('.vu-panel')];
  const W=window.WORKS||[],work=id=>W.find(w=>w.id===id)||{};
  panels.forEach(p=>p.inert=true);
  const st=new Map(),got={};bins.forEach(b=>got[b.dataset.film]=0);
  const set=(el,o)=>{const s=st.get(el);Object.assign(s,o);el.style.setProperty('--x',s.x+'px');el.style.setProperty('--y',s.y+'px');el.style.setProperty('--r',s.r+'deg');el.style.setProperty('--s',s.s)};
  words.forEach((el,i)=>{
    st.set(el,{
      x:0,y:0,r:0,s:1,hx:0,hy:0,hr:0,
      phX:i*1.37+.4,phY:i*2.11+.9,phR:i*1.73+.2,
      spX:.55+(i%4)*.14,spY:.48+((i+2)%4)*.13,spR:.42+(i%3)*.15,
      ampX:4+(i%3),ampY:4+((i+1)%3),
      nextPulse:performance.now()+1400+i*420+Math.random()*1800
    });
  });

  // Bounded randomness keeps every floating card inside its available half.
  const seed=Math.floor(Math.random()*0xffffffff);
  const hit=(a,b,pad=10)=>a.l<b.r+pad&&a.r>b.l-pad&&a.t<b.b+pad&&a.b>b.t-pad;
  function layout(list=words){
    const pageTop=hero.getBoundingClientRect().top+scrollY;
    hero.style.setProperty('--hero-available',Math.max(innerWidth<600?650:620,innerHeight-pageTop)+'px');
    let n=seed;const rnd=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);
    const B=box.getBoundingClientRect();
    if(!B.width||!B.height)return;
    const mem=hero.classList.contains('has-memory'),tum=hero.classList.contains('has-tumgo');
    const minX=mem&&!tum?B.width/2:0,maxX=tum&&!mem?B.width/2:B.width;
    const specs=list.map(el=>{const scale=.78+rnd()*.36,r=(rnd()-.5)*10;return {el,scale,r};});
    let arranged=[];
    // Restart packing if an early random choice leaves no room for the last card.
    for(let pass=0;pass<60;pass++){
      arranged=[];let failed=false;
      const shrink=pass<40?1:.88;
      const sorted=specs.map(q=>{const scale=q.scale*shrink,ew=q.el.offsetWidth,eh=q.el.offsetHeight,a=Math.abs(q.r)*Math.PI/180;return {...q,scale,ew,eh,w:(ew*Math.cos(a)+eh*Math.sin(a))*scale,h:(eh*Math.cos(a)+ew*Math.sin(a))*scale};}).sort((a,b)=>b.w*b.h-a.w*a.h);
      for(const q of sorted){
        let rect=null;
        for(let attempt=0;attempt<1000;attempt++){
          const x=minX+12+rnd()*Math.max(0,maxX-minX-q.w-24),y=12+rnd()*Math.max(0,B.height-q.h-24);
          const candidate={l:x,t:y,r:x+q.w,b:y+q.h};
          if(!arranged.some(p=>hit(candidate,p.rect,12))){rect=candidate;break;}
        }
        if(!rect){failed=true;break;}arranged.push({...q,rect});
      }
      if(!failed)break;
    }
    if(arranged.length!==list.length){
      const cols=Math.max(1,Math.floor((maxX-minX)/94)),rows=Math.ceil(specs.length/cols),cw=(maxX-minX)/cols,ch=B.height/rows;
      const shuffled=[...specs].sort(()=>rnd()-.5);
      arranged=shuffled.map((q,i)=>{
        const ew=q.el.offsetWidth,eh=q.el.offsetHeight,a=Math.abs(q.r)*Math.PI/180;
        const rw=ew*Math.cos(a)+eh*Math.sin(a),rh=eh*Math.cos(a)+ew*Math.sin(a);
        const scale=Math.min(q.scale,(cw-18)/rw,(ch-18)/rh)*(.88+rnd()*.12),w=rw*scale,h=rh*scale;
        const x=minX+(i%cols)*cw+8+rnd()*Math.max(0,cw-w-16),y=Math.floor(i/cols)*ch+8+rnd()*Math.max(0,ch-h-16);
        return {...q,ew,eh,scale,w,h,rect:{l:x,t:y,r:x+w,b:y+h}};
      });
    }
    arranged.forEach(q=>{const state=st.get(q.el);state.baseScale=q.scale;state.hx=q.rect.l+(q.w-q.ew)/2;state.hy=q.rect.t+(q.h-q.eh)/2;state.hr=q.r;q.el.style.setProperty('--rest-scale',q.scale);});
  }
  function drop(list,first){
    list.forEach((el,i)=>{const s=st.get(el);
      if(first){set(el,{x:s.hx,y:-el.offsetHeight-60-Math.random()*200,r:s.hr*3,s:s.baseScale});el.classList.add('is-falling');
        setTimeout(()=>set(el,{x:s.hx,y:s.hy,r:s.hr,s:s.baseScale}),80+i*70);setTimeout(()=>el.classList.remove('is-falling'),1200+i*70)}
      else set(el,{x:s.hx,y:s.hy,r:s.hr,s:s.baseScale})});
  }
  hero.closest('details')?.addEventListener('toggle',e=>{
    hero.querySelectorAll('video').forEach(v=>{if(!e.target.open)v.pause();else if(v.closest('.vh-backdrop')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)v.play().catch(()=>{});});
    if(e.target.open)requestAnimationFrame(()=>{const l=live();layout(l);drop(l,false);});
  });
  const live=()=>words.filter(w=>!w.classList.contains('is-in')&&!w.classList.contains('is-eaten'));
  const start=()=>{layout();drop(words,true);requestAnimationFrame(()=>hero.classList.add('is-set'))};
  let started=false;
  const begin=()=>{if(started)return;started=true;start();};
  setTimeout(begin,100);
  if(document.fonts)document.fonts.ready.then(()=>{if(!started)begin();else{const l=live();layout(l);drop(l,false);}});
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{const l=live();layout(l);drop(l,false)},200)});

  // 우주 유영(무중력 부유) + 간헐적 스케일 꿈틀거림(squirm) 및 미세 떨림(tremor) 루프
  let heroVisible=true;
  if('IntersectionObserver' in window){
    new IntersectionObserver(es=>es.forEach(e=>{heroVisible=e.isIntersecting}),{threshold:.05}).observe(hero);
  }
  (function floatLoop(now){
    if(heroVisible&&hero.classList.contains('is-set')){
      const t=now*.001;
      words.forEach(el=>{
        if(el.classList.contains('is-in')||el.classList.contains('is-eaten')||el.classList.contains('is-drag')||el.classList.contains('is-falling')||el.classList.contains('is-shake'))return;
        const s=st.get(el);if(!s)return;
        const dx=Math.sin(t*s.spX+s.phX)*s.ampX+Math.cos(t*s.spY*.7+s.phR)*3.5;
        const dy=Math.cos(t*s.spY+s.phY)*s.ampY+Math.sin(t*s.spX*.6+s.phX)*3.5;
        const dr=Math.sin(t*s.spR+s.phR)*1.6;
        el.style.setProperty('--dx',dx.toFixed(2)+'px');
        el.style.setProperty('--dy',dy.toFixed(2)+'px');
        el.style.setProperty('--dr',dr.toFixed(2)+'deg');
        if(false && now>=s.nextPulse){
          const mode=Math.random()<.58?'is-squirm':'is-tremor';
          el.classList.remove('is-squirm','is-tremor');
          void el.offsetWidth;
          el.classList.add(mode);
          setTimeout(()=>el.classList.remove(mode),780);
          s.nextPulse=now+2400+Math.random()*3800;
        }
      });
    }
    requestAnimationFrame(floatLoop);
  })(performance.now());

  // 효과음: 단어 선택, 그릇 담기, 오답 튕김, 작품 완성
  let ac=null;
  const ctx=()=>{if(!ac){const C=window.AudioContext||window.webkitAudioContext;if(C)ac=new C()}if(ac&&ac.state==='suspended')ac.resume().catch(()=>{});return ac};
  function tone(freq,type,dur,vol,delay=0,slide=0){
    const c=ctx();if(!c)return;
    const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.02);
  }
  const sfxPick=id=>id==='memory'?tone(420,'triangle',.075,.11,0,580):tone(520,'sine',.07,.09,0,740);
  const sfxCollect=(id,n,total)=>{
    const base=id==='memory'?440+n*55:480+n*65;
    tone(base,'triangle',.11,.13,0,base*1.18);
    tone(base*1.33,'sine',.14,.11,.055,base*1.5);
  };
  const sfxWrong=()=>{tone(190,'sawtooth',.09,.08,0,135);tone(155,'sawtooth',.12,.08,.08,115)};
  const sfxComplete=id=>{
    const notes=id==='memory'?[523.25,659.25,783.99,1046.5]:[493.88,659.25,783.99,987.77];
    notes.forEach((f,i)=>tone(f,id==='memory'?'triangle':'sine',.32,.12,i*.075,f*1.01));
  };

  // 그릇
  const say=(bin,text,cls)=>{const p=bin.querySelector('.bin-say');p.textContent=text;bin.classList.remove('say-wrong','say-ok');if(cls){void bin.offsetWidth;bin.classList.add(cls)}};
  const binAt=(cx,cy)=>bins.find(b=>{if(b.classList.contains('is-gone'))return false;const r=b.getBoundingClientRect(),pad=24;return cx>r.left-pad&&cx<r.right+pad&&cy>r.top-pad&&cy<r.bottom+pad});
  function collect(el,bin){
    if(el.classList.contains('is-eaten')||bin.classList.contains('is-full'))return;
    const B=box.getBoundingClientRect(),m=(bin.querySelector('.bin-lid,.bg-mouth')||bin).getBoundingClientRect();
    el.classList.add('is-eaten');set(el,{x:m.left-B.left+m.width/2-el.offsetWidth/2,y:m.top-B.top+m.height/2-el.offsetHeight/2,s:.15,r:0});
    setTimeout(()=>el.classList.add('is-in'),400);
    const id=bin.dataset.film,n=++got[id],total=+bin.dataset.total;
    sfxCollect(id,n,total);
    bin.style.setProperty('--fill',n/total);bin.style.setProperty('--growth',1+n/total*.24);bin.querySelector('.bin-count b').textContent=n;
    bin.classList.remove('gulp');void bin.offsetWidth;bin.classList.add('gulp');
    bin.querySelectorAll('.f').forEach((f,i)=>f.classList.toggle('on',i<n));
    say(bin,n<total?`${n}개 담았어요. ${total-n}개 남았어요`:work(id).collect.done,'say-ok');
    if(n>=total){bin.classList.add('is-full');setTimeout(()=>bin.classList.add('is-completing'),400);setTimeout(()=>unlock(id),1500)}
  }
  function bounce(el,bin){const s=st.get(el);sfxWrong();say(bin,work(bin.dataset.film).collect.wrong||'',"say-wrong");
    el.classList.add('is-shake');setTimeout(()=>{el.classList.remove('is-shake');set(el,{x:s.hx,y:s.hy,r:s.hr,s:s.baseScale})},380);
    setTimeout(()=>say(bin,''),1800)}
  // 다 담은 작품은 그 절반을 작품 화면으로 연다. 남은 단어는 비어 있는 쪽으로 옮긴다
  function syncHeroState(){
    hero.classList.toggle('has-memory',panels.some(x=>x.dataset.film==='memory'&&x.classList.contains('is-on')));
    hero.classList.toggle('has-tumgo',panels.some(x=>x.dataset.film==='tumgo'&&x.classList.contains('is-on')));
    hero.classList.toggle('is-all',panels.every(x=>x.classList.contains('is-on')));
  }
  function unlock(id){const p=panels.find(x=>x.dataset.film===id),bin=bins.find(b=>b.dataset.film===id);if(!p)return;
    sfxComplete(id);
    p.inert=false;p.classList.add('is-on');if(bin)bin.classList.add('is-gone');
    const v=p.querySelector('video');if(v&&v.dataset.src){if(!v.src)v.src=v.dataset.src;v.play().catch(()=>{})}
    syncHeroState();
    setTimeout(()=>{const l=live();layout(l);drop(l,false)},350)}

  // 끌기
  words.forEach(el=>{
    el.title='끌어서 담기 · 키보드 Enter로 해당 용기에 담기';
    el.addEventListener('keydown',e=>{
      if((e.key==='Enter'||e.key===' ')&&!el.classList.contains('is-eaten')){
        e.preventDefault();const bin=bins.find(b=>b.dataset.film===el.dataset.film);if(bin)collect(el,bin);
      }
    });
    let p=null;
    el.addEventListener('pointerdown',e=>{if(e.button!==0||el.classList.contains('is-eaten'))return;const s=st.get(el);
      sfxPick(el.dataset.film);
      p={id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:s.x,oy:s.y,moved:false,lx:e.clientX,ly:e.clientY,lt:performance.now(),vx:0,vy:0};
      el.setPointerCapture(e.pointerId)});
    el.addEventListener('pointermove',e=>{if(!p||e.pointerId!==p.id)return;const dx=e.clientX-p.sx,dy=e.clientY-p.sy;
      if(!p.moved&&Math.hypot(dx,dy)<6)return;
      if(!p.moved){p.moved=true;el.dataset.justDragged='1';el.classList.add('is-drag');hero.classList.add('is-dragging')}
      const t=performance.now(),dt=Math.max(1,t-p.lt);p.vx=(e.clientX-p.lx)/dt;p.vy=(e.clientY-p.ly)/dt;p.lx=e.clientX;p.ly=e.clientY;p.lt=t;
      set(el,{x:p.ox+dx,y:p.oy+dy,r:0,s:1.06});
      const over=binAt(e.clientX,e.clientY);
      bins.forEach(b=>{b.classList.toggle('is-open',b===over&&b.dataset.film===el.dataset.film);b.classList.toggle('is-nope',b===over&&b.dataset.film!==el.dataset.film)})});
    const end=e=>{if(!p||e.pointerId!==p.id)return;const q=p;p=null;el.classList.remove('is-drag');hero.classList.remove('is-dragging');
      bins.forEach(b=>b.classList.remove('is-open','is-nope'));
      if(!q.moved){delete el.dataset.justDragged;return}
      setTimeout(()=>delete el.dataset.justDragged,0);
      const bin=binAt(e.clientX,e.clientY);
      if(bin){if(bin.dataset.film===el.dataset.film&&!bin.classList.contains('is-full'))collect(el,bin);else bounce(el,bin);return}
      // 던지기: 놓은 속도만큼 조금 더 미끄러지고 탄력 있게 선다
      const B=box.getBoundingClientRect(),s=st.get(el),isAbs=getComputedStyle(box).position==='absolute';
      const minX=0;
      const maxX=B.width-el.offsetWidth;
      const nx=Math.max(minX,Math.min(Math.max(minX,maxX),s.x+q.vx*140)),ny=Math.max(0,Math.min(B.height-el.offsetHeight,s.y+q.vy*140));
      const nr=Math.round(Math.max(-12,Math.min(12,q.vx*10)));set(el,{x:nx,y:ny,r:nr,s:1});s.hx=nx;s.hy=ny;s.hr=nr};
    el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
    el.addEventListener('click',()=>{if(el.dataset.justDragged)return;const t=document.getElementById(el.dataset.film);if(t&&window.__glideTo)window.__glideTo(t)});
  });

  // 다시 담기
  function resetAll(){bins.forEach(b=>{got[b.dataset.film]=0;b.style.setProperty('--fill',0);b.classList.remove('is-full','gulp','is-gone','is-completing');b.style.setProperty('--growth',1);b.querySelector('.bin-count b').textContent=0;b.querySelectorAll('.f').forEach(f=>f.classList.remove('on'));say(b,'')});
    panels.forEach(p=>{p.inert=true;p.classList.remove('is-on');const v=p.querySelector('video');if(v)v.pause()});syncHeroState();
    words.forEach(w=>w.classList.remove('is-in','is-eaten'));setTimeout(()=>{layout();drop(words,true)},300)}
  hero.querySelectorAll('.vu-again').forEach(b=>b.addEventListener('click',resetAll));

  // 다 담았을 때 창
  const dlg=document.getElementById('vh-done');let doneFilm=null;
  function openDone(id){if(!dlg)return;const w=work(id),c=w.collect||{};doneFilm=id;
    const card=document.getElementById('vh-done-card');card.className=`vd-card tone-${w.tone}`;if(w.font)card.style.setProperty('--work-font',w.font);
    document.getElementById('vh-done-title').textContent=c.done||'';document.getElementById('vh-done-text').textContent=c.text||'';
    const art=document.getElementById('vh-done-art'),bin=bins.find(b=>b.dataset.film===id),vis=bin&&bin.querySelector('.bin-visual,.bin-svg');art.innerHTML=vis?vis.outerHTML:'';art.className=`vd-art bin-${c.box} is-full`;
    const play=document.getElementById('vh-done-play');if(w.play){play.href=w.play.href;play.textContent=w.play.label;play.hidden=false}else play.hidden=true;
    document.getElementById('vh-done-film').textContent=`「${w.title}」 영상 보기`;
    dlg.showModal();requestAnimationFrame(()=>dlg.classList.add('is-in'))}
  const closeDone=()=>{if(!dlg||!dlg.open)return;dlg.classList.remove('is-in');setTimeout(()=>dlg.close(),300)};
  if(dlg){document.getElementById('vh-done-x').addEventListener('click',closeDone);document.getElementById('vh-done-close').addEventListener('click',closeDone);
    dlg.addEventListener('cancel',e=>{e.preventDefault();closeDone()});
    dlg.addEventListener('click',e=>{if(e.target===dlg)closeDone()});
    document.getElementById('vh-done-film').addEventListener('click',()=>{const id=doneFilm;dlg.classList.remove('is-in');dlg.close();if(window.__openFilm)window.__openFilm(id)})}
  window.__collectDebug={openDone,collect,unlock,resetAll,bins,words};
})();

(()=>{const rows=[...document.querySelectorAll('.v8-row')];if(!rows.length)return;
  const on=r=>rows.forEach(x=>x.classList.toggle('is-on',x===r));
  rows.forEach(r=>{r.addEventListener('pointerenter',()=>on(r));r.addEventListener('focusin',()=>on(r))});
})();
