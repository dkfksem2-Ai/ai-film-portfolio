/* V10.5 — 바로가기 막대: 첫 화면을 지나면 나타나고, 지금 보는 작품을 표시하고, 영상 두 편을 바로 연다 */
(()=>{
 'use strict';
 const qn=document.getElementById('qn');if(!qn)return;
 if(qn.parentElement!==document.body)document.body.append(qn);   // 다른 구간의 쌓임 순서에 갇히지 않게 맨 바깥으로
 const hx=document.getElementById('hx'),pop=document.getElementById('qn-pop'),btn=document.getElementById('qn-play');
 const links=[...qn.querySelectorAll('.qn-l')];
 const order=[['cl-memory','qn-memory'],['cl-tumgo','qn-tumgo'],['process','qn-process'],['about','qn-about']]
  .map(([id,c])=>({el:document.getElementById(id),a:qn.querySelector('.'+c)})).filter(o=>o.el&&o.a);
 const lightIds=['cl-memory','about'];
 function openPop(on){pop.hidden=!on;btn.setAttribute('aria-expanded',String(on));if(on)pop.querySelector('button')?.focus({preventScroll:true})}
 btn.addEventListener('click',e=>{e.stopPropagation();openPop(pop.hidden)});
 pop.addEventListener('click',e=>{if(e.target.closest('[data-open]'))openPop(false)});
 document.addEventListener('click',e=>{if(!pop.hidden&&!qn.contains(e.target))openPop(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){openPop(false);btn.focus()}});
 let raf=0;
 function update(){
  raf=0;
  const hb=hx?hx.getBoundingClientRect().bottom:0,playing=hx&&hx.classList.contains('is-playing');
  const on=!playing&&hb<innerHeight*.35;
  qn.classList.toggle('is-on',on);qn.inert=!on;if(!on&&!pop.hidden)openPop(false);
  // 지금 화면 가운데가 걸친 구간
  const mid=innerHeight*.5;let cur=null;
  order.forEach(o=>{const t=o.el.getBoundingClientRect().top;if(t<=mid)cur=o});
  links.forEach(a=>a.removeAttribute('aria-current'));
  if(cur&&on)cur.a.setAttribute('aria-current','true');
 }
 const kick=()=>{if(!raf)raf=requestAnimationFrame(update)};
 addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);
 if(hx)new MutationObserver(kick).observe(hx,{attributes:true,attributeFilter:['class']});
 update();
})();
