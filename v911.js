/* V9.11 — 틈GO 소개 고정 무대(아래에서 닦아 올리는 단계 전환)와, 모든 무대의 멈춤 지점 붙잡기 */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 960px)');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
 const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,out=t=>1-Math.pow(1-t,3);

 /* ---------- 틈GO 소개 ---------- */
 const intro=document.getElementById('tumgo-intro');
 const I=intro&&{
  el:intro,sticky:intro.querySelector('.tumgo-sticky'),art:intro.querySelector('.tumgo-art'),
  layers:[...intro.querySelectorAll('.stage-layer')],cap:document.getElementById('tumgo-stage-caption'),
  rows:[...intro.querySelectorAll('[data-tumgo-beat]')],bar:intro.querySelector('.tb-indicator'),count:intro.querySelector('.tb-progress b'),
  caps:['계단에서 처음 만난 로봇','밀린 빨래 앞의 현우','문 앞 수거'],cur:-1,uShown:null
 };
 const leadOf=el=>matchMedia('(min-width: 961px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches?(parseFloat(el.dataset.lead)||0):0;
 const OFF=.6;const introTail=()=>{const v=parseFloat(getComputedStyle(I.el).getPropertyValue('--beat-tail'));return isNaN(v)?0:v};
 const introTotal=()=>I.layers.length-OFF+introTail();
 const introLastHold=total=>(I.layers.length-.5+total)/2;
 function setBeat(i){
  if(i===I.cur)return;const first=I.cur<0;I.cur=i;
  I.rows.forEach((b,k)=>b.classList.toggle('is-on',k===i));
  if(I.count)I.count.textContent=String(i+1).padStart(2,'0');
  const big=document.querySelector('#tumgo-intro .tb-big-n');if(big){const t=String(i+1).padStart(2,'0');big.textContent=t;big.dataset.n=t;if(!first){big.classList.remove('is-jiggle');void big.offsetWidth;big.classList.add('is-jiggle')}}
  if(I.cap){I.cap.textContent=I.caps[i];if(!first){I.cap.classList.remove('is-swap');void I.cap.offsetWidth;I.cap.classList.add('is-swap')}}
  const row=I.rows[i];
  if(I.bar&&row){if(mobile.matches)Object.assign(I.bar.style,{left:row.offsetLeft+'px',width:row.offsetWidth+'px',top:'',height:''});
   else Object.assign(I.bar.style,{top:row.offsetTop+'px',height:row.offsetHeight+'px',left:'',width:''})}
 }
 function introFrame(){
  if(!I)return false;
  if(reduce.matches){I.el.classList.remove('is-scroll');I.uShown=null;return false}
  I.el.classList.add('is-scroll');I.art.classList.add('is-moving');
  const r=I.el.getBoundingClientRect(),ld=leadOf(I.el),span=Math.max(1,I.el.offsetHeight-I.sticky.offsetHeight-ld);
  const uTarget=clamp((-r.top-ld)/span)*introTotal(),delta=uTarget-(I.uShown??uTarget);
  const following=r.top<I.sticky.offsetHeight&&r.bottom>0&&!document.hidden&&Math.abs(delta)>.001;
  const u=I.uShown=following?I.uShown+delta*(mobile.matches ? .14 : .10):uTarget,n=I.layers.length;
  let cur=0,glass=0,sweep=-1;
  I.layers.forEach((L,k)=>{
   const raw=k===0?1:clamp((u-k+OFF)/.5),t=ease(raw),next=k+1<n?ease(clamp((u-k-1+OFF)/.5)):0;
   if(t>=.5)cur=k;
   if(k>0&&raw>0&&raw<1){const g=Math.sin(Math.PI*raw);if(g>glass){glass=g;sweep=raw}}
   L.style.zIndex=String(k+1);
   L.style.clipPath='none';
   L.style.setProperty('opacity',k===0?'1':t.toFixed(3),'important');
   L.style.transform=`scale(${(1+.06*(1-t)+.03*next).toFixed(4)})`;
   L.style.filter='none';
  });
  // 빛 굴절·크롬: 장면이 바뀌는 동안 유리를 통과한 듯 일그러지고 색이 갈라진 뒤 또렷해진다
  if(window.__tgGlass)window.__tgGlass(glass,sweep);
  setBeat(cur);
  I.el.dataset.units=u.toFixed(4);
  return following;
 }
 if(I){
  // 고정 무대에서는 마우스 위치 미리보기와 단계 호버가 스크롤 장면을 덮어쓰지 않게 막는다
  ['pointerenter','pointermove','pointerleave','pointerover'].forEach(type=>I.sticky.addEventListener(type,e=>{
   if(!I.el.classList.contains('is-scroll'))return;
   if(e.target.closest('.tumgo-art,.tumgo-beats'))e.stopPropagation();
  },true));
  I.sticky.querySelector('.tumgo-beats')?.addEventListener('click',e=>{
   const row=e.target.closest('[data-tumgo-beat]');if(!row||!I.el.classList.contains('is-scroll'))return;
   e.stopPropagation();e.preventDefault();
   const k=Number(row.dataset.tumgoBeat),total=introTotal();
   const hold=k===0?0:k+.5-OFF;
   const ld=leadOf(I.el);glide(stageTop(I.el)+ld+hold/total*(I.el.offsetHeight-I.sticky.offsetHeight-ld),620);
  },true);
 }

 /* ---------- 멈춤 지점 붙잡기 ---------- */
 const stageTop=el=>el.getBoundingClientRect().top+scrollY;
 const snapStages=[];
 document.querySelectorAll('.scene-pull').forEach(sec=>{
  const pin=sec.querySelector('.pull-pin'),n=sec.querySelectorAll('.pull-item').length,plate=sec.dataset.kind==='plate';
  snapStages.push({el:sec,lead:()=>leadOf(sec),span:()=>Math.max(1,sec.offsetHeight-pin.offsetHeight-leadOf(sec)),total:()=>n+(parseFloat(getComputedStyle(sec).getPropertyValue('--scene-tail'))||.6),
   holds:t=>{const h=[0];for(let i=0;i<n;i++)h.push(i+.75);if(plate&&t-n>=1.5){h.push(n+.6,n+1,n+1.4)}else if(plate&&t-n>=1)h.push(n+.85);h.push(t);return h}});
 });
 if(I)snapStages.push({el:I.el,lead:()=>leadOf(I.el),span:()=>Math.max(1,I.el.offsetHeight-I.sticky.offsetHeight-leadOf(I.el)),total:introTotal,lim:.8,holds:t=>[0,1.5-OFF,2.5-OFF,t],free:u=>introTail()>0&&u>2.5-OFF+.05});   // 03 수거 뒤 여유 구간은 붙잡지 않는다

 const snapDelay=280;
 let anim=null,timer=0,touching=false,settled=-Infinity;
 function glide(y,dur,curve=ease){
  clearTimeout(timer);cancel();const y0=scrollY,d=y-y0;if(Math.abs(d)<2)return;const t0=performance.now();
  const step=now=>{const p=clamp((now-t0)/dur);scrollTo({top:y0+d*curve(p),behavior:'instant'});if(p<1)anim=requestAnimationFrame(step);else{anim=null;settled=performance.now()}};
  anim=requestAnimationFrame(step);
 }
 function cancel(){if(anim){cancelAnimationFrame(anim);anim=null}}
 function userInput(){clearTimeout(timer);cancel();settled=-Infinity}
 function trySnap(){
  if(performance.now()-settled<300)return;
  if(window.__noSnap||reduce.matches||touching||anim||document.querySelector('dialog[open]'))return;
  for(const s of snapStages){
   const top=stageTop(s.el)+(s.lead?s.lead():0),span=s.span(),total=s.total(),pos=scrollY-top;
   if(pos<=1||pos>=span-1)continue;
   const u=pos/span*total;if(s.free&&s.free(u))return;const hs=s.holds(total);let best=null;
   const ahead=hs.filter(h=>dir>0?h>=u-.03:h<=u+.03);
   for(const h of (ahead.length?ahead:hs))if(best===null||Math.abs(h-u)<Math.abs(best-u))best=h;
   const y=top+best/total*span,distance=Math.abs(y-scrollY),limit=span/total*(s.lim||.4);
   if(distance>6&&distance<=limit)glide(y,lerp(500,900,distance/limit),out);
   return;
  }
 }
 let lastY=scrollY,dir=1;
 addEventListener('scroll',()=>{const y=scrollY;if(anim||performance.now()-settled<300){lastY=y;return}if(Math.abs(y-lastY)>1)dir=y>lastY?1:-1;lastY=y;clearTimeout(timer);timer=setTimeout(trySnap,snapDelay)},{passive:true});
 ['wheel','keydown','mousedown'].forEach(t=>addEventListener(t,userInput,{passive:true}));
 addEventListener('touchstart',()=>{touching=true;userInput()},{passive:true});
 ['touchend','touchcancel'].forEach(t=>addEventListener(t,()=>{touching=false;clearTimeout(timer);timer=setTimeout(trySnap,snapDelay)},{passive:true}));

 /* ---------- 갱신 ---------- */
 let pending=false;
 const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;if(introFrame())schedule()})}};
 addEventListener('scroll',schedule,{passive:true});
 const layout=()=>{if(I)I.cur=-1;schedule()};
 addEventListener('resize',layout);
 document.addEventListener('visibilitychange',schedule);
 reduce.addEventListener('change',()=>{userInput();if(I){I.layers.forEach(L=>{L.style.clipPath='';L.style.transform='';L.style.filter='';L.style.zIndex=''})}layout()});
 document.fonts?.ready.then(layout);schedule();
})();
