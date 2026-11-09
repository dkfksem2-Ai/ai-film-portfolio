/* V9.19 — 제작한 과정: 화면을 고정한 채 스크롤 위치로 한 단계씩 바꾼다 */
(()=>{
 'use strict';
 const sec=document.getElementById('process');if(!sec||!sec.classList.contains('pr'))return;
 const pin=sec.querySelector('.pr-pin'),bg=[...sec.querySelectorAll('.pr-bg img')],count=sec.querySelector('.pr-count'),steps=[...sec.querySelectorAll('.pr-step')],notes=sec.querySelector('.pr-notes'),prog=sec.querySelector('.pr-progress b');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let cur=-1;
 function set(k){if(k===cur)return;cur=k;
  bg.forEach((im,i)=>im.classList.toggle('is-on',i===k));
  count.classList.toggle('is-on',k===0);
  steps.forEach((st,i)=>{st.classList.toggle('is-on',i+1===k);st.classList.toggle('is-past',i+1<k)});
  notes.classList.toggle('is-on',k===steps.length);
  if(prog)prog.textContent=String(k).padStart(2,'0');
 }
 function frame(){
  if(reduce.matches){set(0);steps.forEach(s=>s.classList.add('is-on'));notes.classList.add('is-on');return}
  const r=sec.getBoundingClientRect(),span=Math.max(1,sec.offsetHeight-pin.offsetHeight);
  const p=Math.max(0,Math.min(.9999,-r.top/span));set(Math.floor(p*(steps.length+1)));
 }
 let t=false;addEventListener('scroll',()=>{if(!t){t=true;requestAnimationFrame(()=>{t=false;frame()})}},{passive:true});
 addEventListener('resize',frame);frame();
})();
