/* V9.13 — 소개 문장 단어 채움 (Awwwards · Sol, Scroll-based Text Highlight 방식) */
(()=>{
 'use strict';
 const box=document.querySelector('.about-statement-clean');if(!box)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const words=[];
 box.querySelectorAll('.asc-row>span').forEach(span=>{
  const parts=span.textContent.split(/(\s+)/);span.textContent='';
  parts.forEach(t=>{if(/^\s+$/.test(t)){span.append(t);return}if(!t)return;const w=document.createElement('span');w.className='w';w.textContent=t;span.append(w);words.push(w)});
 });
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 let shown=0,target=0,raf=0;
 function measure(){
  const r=box.getBoundingClientRect(),H=innerHeight;
  // 문장 윗부분이 화면 85% 지점에 닿을 때 시작, 문장 아랫부분이 화면 55% 지점에 닿을 때 끝
  const start=H*.95,end=H*.45;
  target=reduce.matches?1:clamp((start-r.top)/((start-end)+r.height));
 }
 function paint(){
  shown+= (target-shown)*.18;if(Math.abs(target-shown)<.001)shown=target;
  const n=words.length,spread=2.2;
  words.forEach((w,i)=>w.style.setProperty('--f',String(clamp((shown*(n+spread)-i)/spread).toFixed(3))));
  raf=shown!==target?requestAnimationFrame(paint):0;
 }
 const tick=()=>{measure();if(!raf)raf=requestAnimationFrame(paint)};
 addEventListener('scroll',tick,{passive:true});addEventListener('resize',tick);reduce.addEventListener('change',tick);tick();
})();
