/* V9.14 — 장면 조각 담기 '하는 방법' 슬라이드, 체험 페이지에서 돌아오면 떠났던 위치와 상태 복원 */
(()=>{
 'use strict';
 const pg=document.getElementById('playground');if(!pg)return;
 const guide=document.getElementById('pe-guide');
 const ss={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}},del:k=>{try{sessionStorage.removeItem(k)}catch(e){}}};

 /* ---------- 하는 방법 슬라이드 ---------- */
 const slides=[...guide.querySelectorAll('.pe-slide')],dots=[...guide.querySelectorAll('.pe-dot')];
 const prev=guide.querySelector('.pe-side--prev'),next=guide.querySelector('.pe-side--next'),startBtn=guide.querySelector('.pe-start');
 let idx=0;
 function show(i){
  idx=Math.max(0,Math.min(slides.length-1,i));
  slides.forEach((s,k)=>{s.classList.toggle('is-on',k===idx);s.classList.toggle('is-left',k<idx);s.setAttribute('aria-hidden',String(k!==idx))});
  dots.forEach((d,k)=>{d.classList.toggle('is-on',k===idx);d.setAttribute('aria-current',String(k===idx))});
  prev.hidden=idx===0;next.hidden=idx===slides.length-1;
  startBtn.classList.toggle('is-ready',idx===slides.length-1);
 }
 prev.addEventListener('click',()=>show(idx-1));next.addEventListener('click',()=>show(idx+1));
 dots.forEach((d,k)=>d.addEventListener('click',()=>show(k)));
 guide.addEventListener('keydown',e=>{if(e.key==='ArrowRight')show(idx+1);if(e.key==='ArrowLeft')show(idx-1)});
 let sx=null;const track=guide.querySelector('.pe-track');
 track.addEventListener('pointerdown',e=>{sx=e.clientX},{passive:true});
 track.addEventListener('pointerup',e=>{if(sx==null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40)show(idx+(dx<0?1:-1))},{passive:true});
 function startGame(){
  pg.classList.remove('is-guide');ss.set('pf-guide-seen','1');
  requestAnimationFrame(()=>{dispatchEvent(new Event('resize'));document.getElementById('play-stage')?.scrollIntoView({behavior:'smooth',block:'start'})});
 }
 startBtn.addEventListener('click',startGame);guide.querySelector('.pe-skip').addEventListener('click',startGame);
 document.querySelector('.pe-reopen')?.addEventListener('click',()=>{pg.classList.add('is-guide');show(0);guide.scrollIntoView({behavior:'smooth',block:'center'})});
 if(ss.get('pf-guide-seen'))pg.classList.remove('is-guide');
 show(0);

 /* ---------- 체험 페이지로 떠날 때 상태 저장 ---------- */
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="picnic.html"],a[href^="room.html"]');if(!a)return;
  const eaten=[...document.querySelectorAll('.vh-word.is-eaten')].map(w=>({film:w.dataset.film,word:w.dataset.word}));
  ss.set('pf-return',JSON.stringify({y:scrollY,open:pg.open,eaten,t:Date.now()}));
 },true);

 addEventListener('pageshow',e=>{if(e.persisted){ss.del('pf-return');ss.del('pf-return-now')}});
 /* ---------- 돌아왔을 때 복원 ---------- */
 const params=new URLSearchParams(location.search);
 const navType=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0]||{}).type;
 const raw=ss.get('pf-return');
 const now=ss.get('pf-return-now');ss.del('pf-return-now');
 if(raw&&(now||params.has('return')||navType==='back_forward')){
  let st=null;try{st=JSON.parse(raw)}catch(e){}
  ss.del('pf-return');
  if(params.has('return')){params.delete('return');history.replaceState(null,'',location.pathname+(params.toString()?'?'+params:'')+location.hash)}
  if(st&&Date.now()-st.t<6*3600e3){
   if('scrollRestoration' in history)history.scrollRestoration='manual';
   const jump=()=>scrollTo({top:st.y,behavior:'instant'});
   if(st.open){pg.classList.remove('is-guide');pg.open=true}
   jump();
   const refill=()=>{
    const api=window.__collectDebug;
    if(api&&st.eaten&&st.eaten.length){
     st.eaten.forEach(({film,word})=>{
      const el=[...api.words].find(w=>w.dataset.film===film&&w.dataset.word===word),bin=api.bins.find(b=>b.dataset.film===film);
      if(el&&bin&&!el.classList.contains('is-eaten'))api.collect(el,bin);
     });
    }
    jump();setTimeout(jump,1700);
   };
   (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>setTimeout(refill,450));
  }
 }
})();
