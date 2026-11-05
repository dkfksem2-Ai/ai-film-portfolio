/* V8.1 첫 화면 담기 게임: 흩어진 단어를 끌어 그 작품의 그릇(락앤락 통, 틈GO 수거 가방)에 담는다.
   한 작품의 단어를 다 담으면 체험 페이지 안내 창이 열린다. 단어를 누르기만 하면 그 작품 소개로 간다.
   작품 목록 화면: 마우스를 올린 줄(또는 포커스)이 켜진다. */
(()=>{
  const hero=document.querySelector('.v8-hero'),box=document.getElementById('vh-words'),binWrap=document.getElementById('vh-bins');
  if(!hero||!box||!binWrap)return;
  const words=[...box.querySelectorAll('.vh-word')],bins=[...binWrap.querySelectorAll('.vh-bin')],meta=hero.querySelector('.vh-meta'),reset=document.getElementById('vh-reset');
  const W=window.WORKS||[],work=id=>W.find(w=>w.id===id)||{};
  const st=new Map(),got={};bins.forEach(b=>got[b.dataset.film]=0);
  const set=(el,o)=>{const s=st.get(el);Object.assign(s,o);el.style.setProperty('--x',s.x+'px');el.style.setProperty('--y',s.y+'px');el.style.setProperty('--r',s.r+'deg');el.style.setProperty('--s',s.s)};
  words.forEach(el=>st.set(el,{x:0,y:0,r:0,s:1,hx:0,hy:0,hr:0}));

  // 자리 잡기: 그릇과 아래 글을 피해서, 서로 겹치지 않게 흩는다
  const rel=(r,b)=>({l:r.left-b.left,t:r.top-b.top,r:r.right-b.left,b:r.bottom-b.top});
  const hit=(a,b,pad=10)=>a.l<b.r+pad&&a.r>b.l-pad&&a.t<b.b+pad&&a.b>b.t-pad;
  let seed=Date.now()%100000+1;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  function layout(list=words){
    const B=box.getBoundingClientRect(),blocks=bins.map(b=>rel(b.getBoundingClientRect(),B));
    if(meta&&getComputedStyle(meta).position==='absolute')blocks.push(rel(meta.getBoundingClientRect(),B));
    const placed=[];
    list.forEach(el=>{const w=el.offsetWidth,h=el.offsetHeight;let best=null;
      for(let k=0;k<200;k++){const x=rnd()*Math.max(1,B.width-w),y=rnd()*Math.max(1,B.height-h);const r={l:x,t:y,r:x+w,b:y+h};
        const bad=blocks.some(o=>hit(r,o,22))||placed.some(o=>hit(r,o,8));if(!bad){best=r;break}if(!best)best=r}
      placed.push(best);const s=st.get(el);s.hx=best.l;s.hy=best.t;s.hr=Math.round((rnd()*2-1)*7)});
  }
  function drop(list,first){
    list.forEach((el,i)=>{const s=st.get(el);
      if(first){set(el,{x:s.hx,y:-el.offsetHeight-60-rnd()*200,r:s.hr*3,s:1});el.classList.add('is-falling');
        setTimeout(()=>set(el,{x:s.hx,y:s.hy,r:s.hr}),80+i*70);setTimeout(()=>el.classList.remove('is-falling'),1200+i*70)}
      else set(el,{x:s.hx,y:s.hy,r:s.hr,s:1})});
  }
  const live=()=>words.filter(w=>!w.classList.contains('is-in'));
  const start=()=>{layout();drop(words,true);requestAnimationFrame(()=>hero.classList.add('is-set'))};
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>setTimeout(start,150));
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{const l=live();layout(l);drop(l,false)},200)});

  // 그릇
  const say=(bin,text,cls)=>{const p=bin.querySelector('.bin-say');p.textContent=text;bin.classList.remove('say-wrong','say-ok');if(cls){void bin.offsetWidth;bin.classList.add(cls)}};
  const binAt=(cx,cy)=>bins.find(b=>{const r=b.getBoundingClientRect(),pad=24;return cx>r.left-pad&&cx<r.right+pad&&cy>r.top-pad&&cy<r.bottom+pad});
  function collect(el,bin){
    const B=box.getBoundingClientRect(),m=(bin.querySelector('.bin-lid,.bg-mouth')||bin).getBoundingClientRect();
    el.classList.add('is-eaten');set(el,{x:m.left-B.left+m.width/2-el.offsetWidth/2,y:m.top-B.top+m.height/2-el.offsetHeight/2,s:.15,r:0});
    setTimeout(()=>el.classList.add('is-in'),400);
    const id=bin.dataset.film,n=++got[id],total=+bin.dataset.total;
    bin.style.setProperty('--fill',n/total);bin.querySelector('.bin-count b').textContent=n;
    bin.classList.remove('gulp');void bin.offsetWidth;bin.classList.add('gulp');
    bin.querySelectorAll('.f').forEach((f,i)=>f.classList.toggle('on',i<Math.round(n/total*6)));
    say(bin,n<total?`${n}개 담았어요. ${total-n}개 남았어요`:work(id).collect.done,'say-ok');
    if(reset)reset.hidden=false;
    if(n>=total){bin.classList.add('is-full');setTimeout(()=>openDone(id),900)}
  }
  function bounce(el,bin){const s=st.get(el);say(bin,work(bin.dataset.film).collect.wrong||'',"say-wrong");
    el.classList.add('is-shake');setTimeout(()=>{el.classList.remove('is-shake');set(el,{x:s.hx,y:s.hy,r:s.hr,s:1})},380);
    setTimeout(()=>say(bin,work(bin.dataset.film).collect.hint||''),1800)}

  // 끌기
  words.forEach(el=>{
    let p=null;
    el.addEventListener('pointerdown',e=>{if(e.button!==0||el.classList.contains('is-eaten'))return;const s=st.get(el);
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
      const B=box.getBoundingClientRect(),s=st.get(el);
      const nx=Math.max(0,Math.min(B.width-el.offsetWidth,s.x+q.vx*140)),ny=Math.max(0,Math.min(B.height-el.offsetHeight,s.y+q.vy*140));
      const nr=Math.round(Math.max(-12,Math.min(12,q.vx*10)));set(el,{x:nx,y:ny,r:nr,s:1});s.hx=nx;s.hy=ny;s.hr=nr};
    el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
    el.addEventListener('click',()=>{if(el.dataset.justDragged)return;const t=document.getElementById(el.dataset.film);if(t&&window.__glideTo)window.__glideTo(t)});
  });

  // 다시 흩기
  if(reset)reset.addEventListener('click',()=>{bins.forEach(b=>{got[b.dataset.film]=0;b.style.setProperty('--fill',0);b.classList.remove('is-full','gulp');b.querySelector('.bin-count b').textContent=0;b.querySelectorAll('.f').forEach(f=>f.classList.remove('on'));say(b,work(b.dataset.film).collect.hint)});
    words.forEach(w=>w.classList.remove('is-in','is-eaten'));layout();drop(words,true);reset.hidden=true});

  // 다 담았을 때 창
  const dlg=document.getElementById('vh-done');let doneFilm=null;
  function openDone(id){if(!dlg)return;const w=work(id),c=w.collect||{};doneFilm=id;
    const card=document.getElementById('vh-done-card');card.className=`vd-card tone-${w.tone}`;if(w.font)card.style.setProperty('--work-font',w.font);
    document.getElementById('vh-done-title').textContent=c.done||'';document.getElementById('vh-done-text').textContent=c.text||'';
    const art=document.getElementById('vh-done-art'),bin=bins.find(b=>b.dataset.film===id);art.innerHTML=bin?bin.querySelector('svg').outerHTML:'';art.className=`vd-art bin-${c.box} is-full`;
    const play=document.getElementById('vh-done-play');if(w.play){play.href=w.play.href;play.textContent=w.play.label;play.hidden=false}else play.hidden=true;
    document.getElementById('vh-done-film').textContent=`「${w.title}」 영상 보기`;
    dlg.showModal();requestAnimationFrame(()=>dlg.classList.add('is-in'))}
  const closeDone=()=>{if(!dlg||!dlg.open)return;dlg.classList.remove('is-in');setTimeout(()=>dlg.close(),300)};
  if(dlg){document.getElementById('vh-done-x').addEventListener('click',closeDone);document.getElementById('vh-done-close').addEventListener('click',closeDone);
    dlg.addEventListener('cancel',e=>{e.preventDefault();closeDone()});
    dlg.addEventListener('click',e=>{if(e.target===dlg)closeDone()});
    document.getElementById('vh-done-film').addEventListener('click',()=>{const id=doneFilm;dlg.classList.remove('is-in');dlg.close();if(window.__openFilm)window.__openFilm(id)})}
  window.__collectDebug={openDone,collect,bins,words};
})();

(()=>{const rows=[...document.querySelectorAll('.v8-row')];if(!rows.length)return;
  const on=r=>rows.forEach(x=>x.classList.toggle('is-on',x===r));
  rows.forEach(r=>{r.addEventListener('pointerenter',()=>on(r));r.addEventListener('focusin',()=>on(r))});
})();
