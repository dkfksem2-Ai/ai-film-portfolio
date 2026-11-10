/* V9.21 — 제작 과정 숫자 카운트, 소개 카드: 물방울 낙하 → 파문 → 우유에 에스프레소처럼 번져 젖은 천 카드가 된다 */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

 /* ---------- 19컷 그리고 42컷: 보일 때 0부터 센다 ---------- */
 const sec=document.getElementById('process'),count=sec&&sec.querySelector('.pr-count');
 if(count){
  const nums=[...count.querySelectorAll('b')].map(b=>({b,to:parseInt(b.textContent,10)||0}));
  let played=false,raf=0;
  const show=k=>nums.forEach(n=>n.b.textContent=String(Math.round(n.to*k)));
  function play(){
   if(reduce.matches){show(1);return}
   cancelAnimationFrame(raf);const t0=performance.now(),dur=1700;
   const step=now=>{const u=clamp((now-t0)/dur),e=u===1?1:1-Math.pow(2,-10*u);show(e);if(u<1)raf=requestAnimationFrame(step)};
   raf=requestAnimationFrame(step);
  }
  function check(){
   const r=count.getBoundingClientRect(),H=innerHeight,mobile=innerWidth<=760;
   const visible=(mobile||count.classList.contains('is-on'))&&r.top<H*.8&&r.bottom>H*.15;
   if(visible&&!played){played=true;play()}
   // 다음 단계로 넘어가거나 아래로 지나갈 때는 19컷·42컷을 그대로 둔 채 사라진다.
   // 위로 다시 올라가 이 구간 앞으로 돌아갔을 때만 0으로 되돌려 다음에 다시 센다.
   else if(!visible&&played&&sec.getBoundingClientRect().top>H*.6){played=false;cancelAnimationFrame(raf);show(0)}
  }
  show(0);
  let t=false;addEventListener('scroll',()=>{if(!t){t=true;requestAnimationFrame(()=>{t=false;check()})}},{passive:true});
  addEventListener('resize',check);check();
 }

 /* ---------- 소개 문장: '혼자'를 크게 ---------- */
 const row2=document.querySelector('#about .ab-row2 > span');
 if(row2)row2.innerHTML='오로지 <span class="ab-solo">혼자</span>서 제작.';

 // 소개 카드는 V9.22(v922.js)에서 처리
})();
