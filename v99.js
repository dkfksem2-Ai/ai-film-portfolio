/* Both stages share a scroll clock. Rest geometry follows the visible photograph. */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 960px)'),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 document.querySelectorAll('.vh-word').forEach(b=>{const w=(window.WORKS||[]).find(w=>w.id===b.dataset.film);const label=`${b.dataset.word}, ${w?.title||''} 제작 이야기로 이동. 끌거나 Enter로 담기`;b.title=label;b.setAttribute('aria-label',label)});
 const leadOf=el=>matchMedia('(min-width: 961px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches?(parseFloat(el.dataset.lead)||0):0;
 const stages=[...document.querySelectorAll('.scene-pull')].map(sec=>({sec,pin:sec.querySelector('.pull-pin'),backdrop:sec.querySelector('.pull-background'),copy:sec.querySelector('.pull-copy'),items:[...sec.querySelectorAll('.pull-item')],seats:[...sec.querySelectorAll('.pull-seats i')],cap:sec.querySelector('.pull-caption'),read:sec.querySelector('.pull-readout'),kind:sec.dataset.kind,rest:[],front:null}));
 function stop(s){s.items.forEach(it=>{const v=it.querySelector('video');v.pause();it.classList.remove('is-playing')})}
 function measure(s){
  const W=s.pin.clientWidth,H=s.pin.clientHeight,style=getComputedStyle(s.backdrop);
  const compact=style.getPropertyValue('--compact-stage').trim()==='1';
  const pin=s.pin.getBoundingClientRect(),bg=s.backdrop.getBoundingClientRect();
  // Match background-size: cover and its percentage position against the 1920 × 1080 source.
  const scale=Math.max(bg.width/1920,bg.height/1080),iw=1920*scale,ih=1080*scale;
  const ox=bg.left-pin.left+(bg.width-iw)*parseFloat(style.backgroundPositionX)/100;
  const oy=bg.top-pin.top+(bg.height-ih)*parseFloat(style.backgroundPositionY)/100;
  s.rest=s.items.map((it,i)=>{
   const [cx,cy,width,height]=it.dataset.anchor.split(',').map(value=>parseFloat(value)/100);
   const w=width*iw,h=height?height*ih:w*9/16;
   const rest={x:ox+cx*iw-w/2,y:oy+cy*ih-h/2,w,h};
   const seat=s.seats[i];
   if(seat)Object.assign(seat.style,{left:rest.x+'px',top:rest.y+'px',width:w+'px',height:h+'px'});
   return rest;
  });
  if(compact){
   const y=s.copy.offsetTop+s.copy.offsetHeight+14;
   const restTop=Math.min(...s.rest.map(rest=>rest.y));
   const h=Math.max(66,Math.min(W*.90*9/16,restTop-y-60));
   s.front={x:(W-h*16/9)/2,y,w:h*16/9,h};
  }else{
   const w=Math.min(W*.57,H*.55*16/9);
   s.front={x:s.kind==='plate'?W*.36:W*.06,y:H*.23,w,h:w*9/16};
  }
 }
 function place(s,it,i,progress){
  const a=s.rest[i],b=s.front,t=ease(progress);
  let x=lerp(a.x,b.x,t),y=lerp(a.y,b.y,t)-Math.sin(Math.PI*t)*Math.min(65,b.h*.16);
  let w=lerp(a.w,b.w,t),h=lerp(a.h,b.h,t);
  if(s.kind==='file'){
   const slide=ease(clamp(progress/.30)),unfold=ease(clamp((progress-.30)/.70));
   x=lerp(a.x-Math.min(32,a.w*.22)*slide,b.x,unfold);
   y=lerp(a.y,b.y,unfold)-Math.sin(Math.PI*unfold)*Math.min(65,b.h*.2);
   w=lerp(a.w,b.w,unfold);h=lerp(a.h,b.h,unfold);
   it.style.setProperty('--fabric',String(clamp(progress/.18)));
   it.style.setProperty('--media-reveal',String(clamp((progress-.30)/.175)));
   it.style.setProperty('--label',String(1-clamp((progress-.02)/.08)));
   s.seats[i].style.opacity=String(clamp((progress-.17)/.25));
  }
  it.style.setProperty('--lift',String(clamp(progress/.25)));
  const restRadius=s.kind==='plate'?clamp(a.h*.18,8,18):5;
  it.style.width=w+'px';it.style.height=h+'px';it.style.borderRadius=lerp(restRadius,12,t)+'px';
  it.style.transform=`translate3d(${x}px,${y}px,0)`;it.style.zIndex=String(progress>.001?20+Math.round(progress*100):10+i);
 }
 function frame(s){
  if(reduce.matches){stop(s);s.uShown=null;s.sec.dataset.mode='static';return false}
  if(!s.front)measure(s);
  const r=s.sec.getBoundingClientRect(),ld=leadOf(s.sec),span=Math.max(1,s.sec.offsetHeight-s.pin.offsetHeight-ld),tail=Number(getComputedStyle(s.sec).getPropertyValue('--scene-tail'))||.6;
  const onScreen=r.top<s.pin.offsetHeight&&r.bottom>0;
  const uTarget=clamp((-r.top-ld)/span)*(s.items.length+tail),delta=uTarget-(s.uShown??uTarget);
  const following=onScreen&&!document.hidden&&Math.abs(delta)>.001;
  const u=s.uShown=following?s.uShown+delta*(mobile.matches ? .14 : .10):uTarget;
  const cur=Math.min(s.items.length-1,Math.floor(u)),loc=clamp((u-cur)/.5),shown=u-cur>=.5;
  s.sec.classList.toggle('has-started',u>=.5);
  const values=s.items.map(it=>Number(it.dataset.value)),start=cur?values[cur-1]:values[0];s.read.textContent=s.kind==='plate'?String(Math.round(lerp(start,values[cur],ease(loc)))):String(Math.round(lerp(cur?values[cur-1]:values[0],values[cur],ease(loc)))).padStart(2,'0');
  const n=s.items.length,end=s.kind==='plate'?clamp((u-n-.15)/.4):0;s.sec.style.setProperty('--ghost',String(lerp(.32,.92,end)));s.sec.classList.toggle('is-ending',end>.5);
  if(s.kind==='plate'&&s.rest.length===n){
   if(!s.words){s.words=['담는 건,','반찬만이','아니니까.'].map(t=>{const e=document.createElement('p');e.className='pull-word';e.setAttribute('aria-hidden','true');e.textContent=t;s.pin.append(e);return e});}
   s.words.forEach((e,i)=>{const r=s.rest[i];if(!r)return;e.style.left=(r.x+r.w/2)+'px';e.style.top=(r.y-r.h*.42)+'px';e.classList.toggle('is-on',u>=n+.45+i*.4)});
  }
  s.cap.textContent=s.items[cur].dataset.caption;s.cap.classList.toggle('is-shown',shown&&!(s.kind==='plate'&&u>n));Object.assign(s.cap.style,{left:s.front.x+'px',top:s.front.y+s.front.h+14+'px',width:s.front.w+'px'});
  const visible=onScreen&&!document.hidden&&!document.querySelector('dialog[open]');
  s.items.forEach((it,i)=>{
   const step=u-i;let p=step>0&&step<=.5?step/.5:step>.5&&(step<=1||i===s.items.length-1)?1:step>1&&step<1.5?1-(step-1)/.5:0;
   if(s.kind==='plate'&&i===s.items.length-1&&u>s.items.length)p=1-ease(clamp((u-s.items.length)/.5));
   p=clamp(p);place(s,it,i,p);const play=visible&&i===cur&&shown&&p>=.999,v=it.querySelector('video');
   it.dataset.front=String(play);it.setAttribute('aria-hidden',String(p<.99));
   if(play&&v.paused){v.play().then(()=>{if(it.dataset.front==='true')it.classList.add('is-playing');else v.pause()}).catch(()=>{})}
   else if(!play){v.pause();it.classList.remove('is-playing')}
  });
  s.sec.dataset.mode='scroll';s.sec.dataset.step=String(cur+1);s.sec.dataset.units=u.toFixed(4);
  return following;
 }
 let pending=false;
 function update(){
  pending=false;
  let following=false;
  for(const stage of stages)following=frame(stage)||following;
  if(following)schedule();
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
 function resize(){stages.forEach(s=>{if(!reduce.matches)measure(s)});schedule()}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);document.addEventListener('visibilitychange',schedule);document.addEventListener('click',schedule);
 document.querySelectorAll('dialog').forEach(d=>{new MutationObserver(schedule).observe(d,{attributes:true,attributeFilter:['open']})});
 reduce.addEventListener('change',()=>{stages.forEach(s=>{s.items.forEach(it=>it.removeAttribute('aria-hidden'));s.front=null});resize()});
 document.fonts?.ready.then(resize);resize();
})();
