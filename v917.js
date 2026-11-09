/* V9.17 — 반찬통 카드 세 시대 전환, 틈GO 소개 빛 굴절·크롬 효과, 노이즈 */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');

 /* 반찬통 카드: 마우스를 올린 시대가 넓어진다. 가만히 두면 1999 → 2007 → 2026 순서로 돈다 */
 const era=document.querySelector('.feature-media--era');
 if(era){
  const slices=[...era.querySelectorAll('.era-slice')];let i=0,hover=false;
  const on=k=>{i=k;slices.forEach((s,n)=>s.classList.toggle('is-on',n===k))};
  era.addEventListener('pointermove',e=>{hover=true;const r=era.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;on(Math.min(2,Math.floor(x*3)))});
  era.addEventListener('pointerleave',()=>{hover=false});
  era.addEventListener('focus',()=>{hover=true});era.addEventListener('blur',()=>{hover=false});
  if(!reduce.matches)setInterval(()=>{if(!hover&&!document.hidden)on((i+1)%3)},2600);
 }

 /* 틈GO 소개: 장면이 바뀌는 동안 유리를 통과한 빛처럼 일그러지고 색이 갈라진다 */
 const art=document.querySelector('#tumgo-intro .tumgo-art'),frame=art&&art.querySelector('.poster-frame');
 const f=document.getElementById('tg-refract');
 if(art&&frame&&f){
  const disp=f.querySelector('feDisplacementMap'),offs=f.querySelectorAll('feOffset'),turb=f.querySelector('feTurbulence');
  const sheen=document.createElement('span');sheen.className='tg-sheen';sheen.setAttribute('aria-hidden','true');art.append(sheen);
  let last=-1;
  window.__tgGlass=(g,sweep)=>{
   if(reduce.matches)g=0;
   if(Math.abs(g-last)<.004)return;last=g;const bn=document.querySelector('#tumgo-intro .tb-big');if(bn)bn.style.setProperty('--g',g.toFixed(3));
   if(g<.01){frame.style.filter='';sheen.style.opacity='0';return}
   disp.setAttribute('scale',(g*38).toFixed(1));
   offs[0].setAttribute('dx',(g*7).toFixed(1));offs[1].setAttribute('dx',(-g*7).toFixed(1));
   turb.setAttribute('baseFrequency',`${(.004+.004*g).toFixed(4)} ${(.012+.012*g).toFixed(4)}`);
   frame.style.filter='url(#tg-refract)';
   sheen.style.opacity=(g*.9).toFixed(3);sheen.style.backgroundPosition=`${(100-sweep*100).toFixed(1)}% 0`;
  };
 }

 /* 수거 다음의 일 무대에도 노이즈 */
 const jp=document.querySelector('#tumgo-journey .pull-pin');
 if(jp){const g=document.createElement('span');g.className='grain-layer';g.setAttribute('aria-hidden','true');jp.prepend(g)}
})();
