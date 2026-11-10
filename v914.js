/* V9.14 — 장면 조각 담기 '하는 방법' 슬라이드, 체험 페이지에서 돌아오면 떠났던 위치와 상태 복원 */
(()=>{
 'use strict';
 // V9.24: 게임은 첫 화면(#hx)에 있다. '게임 시작하기'를 누른 상태를 open으로 저장한다.
 const hx=document.getElementById('hx');if(!hx)return;
 const ss={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}},del:k=>{try{sessionStorage.removeItem(k)}catch(e){}}};
 const pg={get open(){return hx.classList.contains('is-playing')},set open(v){if(!v)return;if(window.__hxPlay)window.__hxPlay(true);else window.__hxPlayPending=true},classList:{remove(){},add(){}}};

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
