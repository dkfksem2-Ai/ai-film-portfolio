/* V9.18 — 콜라주 첫 화면: 구간마다 배경색 전환, 사진마다 다른 속도로 움직이는 깊이감 */
(()=>{
 'use strict';
 const cl=document.querySelector('.cl');if(!cl)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 requestAnimationFrame(()=>cl.classList.add('is-in'));
 const zones=[...cl.querySelectorAll('.cl-zone')];
 const paint=z=>{cl.style.setProperty('--cl-bg',z.dataset.bg);cl.style.setProperty('--cl-fg',z.dataset.fg)};
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');paint(e.target)}}),{threshold:.4});
 zones.forEach(z=>io.observe(z));
 const phs=[...cl.querySelectorAll('.cl-ph')];let tick=false;
 function run(){tick=false;
  if(reduce.matches||innerWidth<=760){phs.forEach(p=>p.style.transform='');return}
  const H=innerHeight;
  phs.forEach(p=>{const r=p.closest('.cl-work').getBoundingClientRect();if(r.bottom<-H||r.top>2*H)return;
   const c=r.top+r.height/2-H/2;p.style.transform=`translate3d(0,${(c*parseFloat(p.dataset.speed||0)).toFixed(1)}px,0)`});
 }
 addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(run)}},{passive:true});
 addEventListener('resize',run);run();
})();
