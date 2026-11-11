/* V10 — 팀 프로젝트로 넘어갈 때도 장막 전환, 돌아오면 누른 자리 그대로, 소개 커피 장면 skip */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const ss={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}},del:k=>{try{sessionStorage.removeItem(k)}catch(e){}}};
 const about=document.getElementById('about');
 const curtain=()=>{let c=document.querySelector('.pf-curtain');if(!c){c=document.createElement('div');c.className='pf-curtain';c.setAttribute('aria-hidden','true');document.body.append(c)}return c};

 /* 장막 걷기: 덮인 상태에서 오른쪽으로 걷힌다 */
 function reveal(){
  const c=curtain();document.documentElement.classList.remove('pf-cover');
  if(reduce.matches){c.className='pf-curtain';return}
  c.style.transition='none';c.className='pf-curtain is-in';void c.offsetWidth;c.style.transition='';
  requestAnimationFrame(()=>{c.classList.remove('is-in');c.classList.add('is-out');setTimeout(()=>c.classList.remove('is-out'),560)});
 }

 /* ---------- 팀 프로젝트로 떠날 때 ---------- */
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href="team.html"]');if(!a)return;
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.button!==0)return;
  e.preventDefault();e.stopImmediatePropagation();
  const off=about?scrollY-(about.getBoundingClientRect().top+scrollY):null;
  ss.set('pf-team',JSON.stringify({y:scrollY,off,t:Date.now()}));
  ss.set('pf-curtain-in','1');
  if(reduce.matches){location.href='team.html';return}
  const c=curtain();c.classList.remove('is-out');void c.offsetWidth;c.classList.add('is-in');
  setTimeout(()=>{location.href='team.html'},520);
 },true);


 /* 체험 페이지(원룸·소풍)로 갈 때는 그쪽 복원(v914)에 맡긴다 */
 document.addEventListener('click',e=>{if(e.target.closest('a[href^="room.html"],a[href^="picnic.html"]'))ss.del('pf-team')},true);

 /* ---------- 돌아왔을 때: 누른 자리로 옮기고 장막을 걷는다 ---------- */
 const raw=ss.get('pf-team'),wantCurtain=ss.get('pf-curtain-in')==='1';
 const navType=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0]||{}).type;
 function target(st){
  if(about&&st.off!=null)return about.getBoundingClientRect().top+scrollY+st.off;
  return st.y;
 }
 if(raw&&(wantCurtain||navType==='back_forward')){
  let st=null;try{st=JSON.parse(raw)}catch(e){}
  ss.del('pf-curtain-in');
  if(st&&Date.now()-st.t<6*3600e3){
   if('scrollRestoration' in history)history.scrollRestoration='manual';
   window.__noSnap=true;
   const jump=()=>scrollTo({top:target(st),behavior:'instant'});
   jump();
   /* 이미지·영상이 다 받아질 때까지 기다리지 않는다: 글꼴만(최대 0.4초) 기다렸다가 자리를 잡고 바로 걷는다 */
   let went=false;
   const go=()=>{if(went)return;went=true;jump();requestAnimationFrame(()=>{jump();reveal();setTimeout(()=>{jump();window.__noSnap=false},700)})};
   const fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
   const start=()=>{Promise.race([fonts,new Promise(r=>setTimeout(r,400))]).then(go)};
   if(document.readyState==='loading')addEventListener('DOMContentLoaded',start,{once:true});else start();
   addEventListener('load',()=>{if(went)setTimeout(jump,0)},{once:true});   // 늦게 들어온 그림 때문에 높이가 바뀌어도 같은 자리
  }else reveal();
 }else if(document.documentElement.classList.contains('pf-cover'))reveal();
 /* 브라우저 '뒤로'로 그대로 되살아난 경우(장막이 덮인 채 저장돼 있다) */
 addEventListener('pageshow',e=>{if(e.persisted){ss.del('pf-curtain-in');const c=document.querySelector('.pf-curtain');if(c&&(c.classList.contains('is-in')||document.documentElement.classList.contains('pf-cover')))reveal()}});

 /* ---------- 소개 커피 장면: skip ---------- */
 if(about){
  const pin=about.querySelector('.ab-pin'),foot=about.querySelector('.ab-foot');
  const btn=document.createElement('button');btn.type='button';btn.className='ab-skip';
  btn.innerHTML='skip <span aria-hidden="true">›</span>';btn.setAttribute('aria-label','소개 애니메이션 건너뛰기');
  pin.append(btn);
  const place=()=>{if(foot)pin.style.setProperty('--foot-h',foot.offsetHeight+'px')};
  const sync=()=>{const d=window.__abDone?window.__abDone():about.classList.contains('is-done');btn.hidden=d};
  btn.addEventListener('click',()=>{
   window.__abSkip&&window.__abSkip();sync();
   const end=about.getBoundingClientRect().top+scrollY+about.offsetHeight-innerHeight;
   if(end>scrollY+2)scrollTo({top:end,behavior:reduce.matches?'instant':'smooth'});
   about.querySelector('.ab-copy')?.focus({preventScroll:true});
  });
  new MutationObserver(sync).observe(about,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',place);document.fonts?.ready.then(place);place();sync();
 }
})();
