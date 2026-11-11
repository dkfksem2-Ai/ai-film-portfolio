/* V9.27
   1. 반찬통의 왕복: 화면은 고정, 스크롤할 때마다 사진 6장이 천장에서 고무줄에 매달린 돌처럼 떨어져 출렁이다 멈춘다.
   2. 틈GO: 밤 인트로 → 01 조우·02 고민·03 수거 → 수거 다음의 일을 화면 고정 상태에서 크로마·지글 효과로 전환.
      '틈GO' 글자는 맨 위에 고정된 채 그대로 남는다. */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),desk=matchMedia('(min-width: 961px)'),wide=matchMedia('(min-width: 761px)');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

 /* ================= 1. 반찬통 사진 낙하 ================= */
 const mem=document.getElementById('cl-memory');
 if(mem){
  const figs=[...mem.querySelectorAll('.cl-ph')],collage=mem.querySelector('.cl-collage');
  const tilt=[-2.2,1.6,-1.2,2.1,-1.6,1.2];
  const S=figs.map((f,i)=>({f,i,y:0,v:0,rot:0,on:false,hide:0,init:false}));
  const STEP=110,FIRST=30;                       // 휠 한 칸쯤마다 한 장
  mem.style.setProperty('--drop-len',(FIRST+STEP*figs.length+260)+'px');
  function hiddenOffset(s){const r=collage.getBoundingClientRect(),top=r.top+s.f.offsetTop;return -(Math.max(0,top)+s.f.offsetHeight+90)}
  function targetsPinned(){const p=-mem.getBoundingClientRect().top;S.forEach(s=>{s.on=p>FIRST+s.i*STEP})}
  const io=new IntersectionObserver(es=>es.forEach(e=>{const s=S.find(x=>x.f===e.target);if(!s)return;if(e.isIntersecting)s.on=true;else if(e.boundingClientRect.top>innerHeight)s.on=false;kick()}),{threshold:.2});
  let mobileObs=false;
  function mode(){
   if(!wide.matches&&!mobileObs){figs.forEach(f=>io.observe(f));mobileObs=true}
   if(wide.matches&&mobileObs){figs.forEach(f=>io.unobserve(f));mobileObs=false}
  }
  let last=0,raf=0;
  function step(now){
   raf=0;const dt=Math.min(.033,(now-(last||now))/1000)||.016;last=now;
   if(wide.matches)targetsPinned();
   let moving=false;
   S.forEach(s=>{
    const hid=wide.matches?hiddenOffset(s):-160;
    if(!s.init){s.y=s.on?0:hid;s.locked=!s.on;s.init=true}
    if(reduce.matches){s.y=0;s.v=0}
    else{
     const tgt=s.on?0:hid,k=s.on?95:170,c=s.on?9.5:26;
     if(!s.on&&s.locked){s.y=tgt;s.v=0}              // 숨어 있는 동안은 화면 밖에 붙여 둔다
     else{
      if(s.on)s.locked=false;
      const a=-k*(s.y-tgt)-c*s.v;s.v+=a*dt;s.y+=s.v*dt;
      if(Math.abs(s.y-tgt)<.4&&Math.abs(s.v)<4){s.y=tgt;s.v=0;if(!s.on)s.locked=true}else moving=true;
     }
    }
    s.rot=clamp(s.v*.011,-7,7);
    s.f.style.translate=`0 ${s.y.toFixed(1)}px`;
    s.f.style.rotate=`${(tilt[s.i]+s.rot).toFixed(2)}deg`;
    s.f.style.setProperty('--cord',s.on?'1':'0');
    s.f.classList.toggle('is-down',s.on&&Math.abs(s.y)<1);
   });
   if(moving)raf=requestAnimationFrame(step);else last=0;
  }
  function kick(){if(!raf)raf=requestAnimationFrame(step)}
  addEventListener('scroll',kick,{passive:true});
  addEventListener('resize',()=>{mode();S.forEach(s=>s.init=false);kick()});
  wide.addEventListener('change',()=>{mode();S.forEach(s=>s.init=false);kick()});
  mode();kick();
 }

 /* ================= 2. 틈GO 화면 전환 ================= */
 const tgn=document.getElementById('cl-tumgo'),intro=document.getElementById('tumgo-intro'),journey=document.getElementById('tumgo-journey');
 if(!tgn||!intro||!journey)return;
 const tgnPin=tgn.querySelector('.tgn-pin'),tgnTitle=tgn.querySelector('.tgn-title'),introSticky=intro.querySelector('.tumgo-sticky'),journeyPin=journey.querySelector('.pull-pin');
 const keep=document.querySelector('.tg-keep');
 const turb=document.getElementById('tgc-turb'),disp=document.getElementById('tgc-disp'),offR=document.getElementById('tgc-r'),offB=document.getElementById('tgc-b');
 const door=document.createElement('div');door.className='tg-door';door.setAttribute('aria-hidden','true');door.innerHTML='<b class="tg-vig"></b><i></i><s class="tg-flare"><u></u><u></u><u></u></s>';document.body.append(door);
 const scan=document.createElement('div');scan.className='tg-scan';scan.setAttribute('aria-hidden','true');document.body.append(scan);
 const T=300;                                    // 전환 길이(휠 세 칸)
 const A3=1400;                                  // 밤 인트로에서 제목이 다 나온 지점(v925.js와 같음)
 const pairs=[{out:tgnPin,inn:introSticky,sec:intro,T:300},{out:introSticky,inn:journeyPin,sec:journey,T:500}];   // ② 문틈 전환은 휠 다섯 칸
 let seed=3,lastJig=0,keepRect=null,tD=0,tDt=0;
 const on=()=>desk.matches&&!reduce.matches;

 function measureKeep(){
  // 밤 인트로 고정 화면 안에서 '틈GO' 제목이 놓이는 자리(화면 기준)
  const pr=tgnPin.getBoundingClientRect(),tr=tgnTitle.getBoundingClientRect(),cs=getComputedStyle(tgnTitle);
  if(tr.width<2)return;
  keepRect={left:tr.left-pr.left,top:tr.top-pr.top,fs:cs.fontSize};
  Object.assign(keep.style,{left:keepRect.left+'px',top:keepRect.top+'px',fontSize:keepRect.fs});
 }
 function fx(el,g,jx){
  if(g<.02){el.style.filter='';el.style.translate='';return}
  el.style.filter='url(#tg-chroma)';el.style.translate=`${jx.toFixed(1)}px 0`;
 }
 function frame(now){
  raf2=0;
  if(!on()){
   pairs.forEach(p=>{p.inn.style.opacity='';fx(p.out,0,0);fx(p.inn,0,0)});introSticky.style.transform='';door.style.opacity=0;
   keep.classList.remove('is-on');tgnTitle.style.opacity='';scan.style.opacity=0;return;
  }
  const jig=now-lastJig>70;if(jig){lastJig=now;seed=(seed*7+3)%97}
  let gMax=0,busy=false;
  const ps=pairs.map(p=>clamp(-p.sec.getBoundingClientRect().top/p.T));
  // ① 밤 인트로 → 01 조우: 크로마 + 지글
  {const p=pairs[0],r=p.sec.getBoundingClientRect(),t=ps[0];
   const g=Math.sin(Math.PI*t);gMax=g;
   let op;
   if(r.top>0||t<.12)op=0;                        // 아직 아래에서 올라오는 중 → 보이지 않게
   else if(t<.72){const want=(t-.12)/.6;op=((seed*13)%100)/100<want?1:0}   // 깜빡이며 넘어간다
   else op=1;
   p.inn.style.opacity=String(op);
   const jx=((seed%11)-5)/5*g*14;
   fx(p.out,t>0&&t<.85?g:0,-jx);fx(p.inn,op?g:0,jx);
   if(t>0&&t<1)busy=true;}
  // ② 03 수거 → 수거 이후 과정: 영상이 멈추고, 문틈만 빛나며 바깥은 어둠으로 닫히고, 문틈 속으로 천천히 들어간다
  {const p=pairs[1],r=p.sec.getBoundingClientRect(),raw=ps[1];
   const before=r.top>0;
   const dtD=Math.min(.1,(now-(tDt||now))/1000);tDt=now;
   const far=journey.getBoundingClientRect().bottom<0||before;   // V10: 화면이 이미 지나갔거나(새로고침·바로가기 복귀) 아직이면 따라가지 않고 바로 맞춘다
   if(far||Math.abs(raw-tD)>.6)tD=raw;else tD+=(raw-tD)*(1-Math.exp(-dtD*4.5));if(Math.abs(raw-tD)<.0008)tD=raw;   // 화면 속도와 무관하게 약 0.6초에 걸쳐 따라간다           // 스크롤 칸 단위로 튀지 않게 부드럽게 따라간다
   const t=before?0:tD;
   const glow=clamp(t/.22),vig=clamp((t-.06)/.34),zoom=clamp((t-.34)/.5),flash=clamp((t-.76)/.14),reveal=clamp((t-.9)/.1);
   const ez=zoom*zoom*(3-2*zoom),sw=Math.sin(Math.PI*zoom);
   // 영상 멈춤 / 다시 재생
   const v=introSticky.querySelector('.zone-video.is-play');
   if(v){if(t>.005&&!v.paused){v.pause();v.dataset.held='1'}else if(t<=.005&&v.dataset.held){delete v.dataset.held;const q=v.play();q&&q.catch(()=>{})}}
   // 문틈 위치: 03 영상(1280×720, 화면을 꽉 채움)의 가로 59.2% 지점
   // 확대 전 크기로 계산(확대 중 화면 좌표를 다시 재면 기준점이 흔들린다): 영상은 고정 화면을 꽉 채운다
   const art={left:0,top:0,width:introSticky.clientWidth||innerWidth,height:introSticky.clientHeight||innerHeight};
   const vw=Math.max(art.width,art.height*16/9),vh=vw*9/16;
   const gx=art.left+(art.width-vw)/2+vw*.592,gTop=art.top+(art.height-vh)/2,gBot=gTop+vh*.9,gy=(Math.max(0,gTop)+Math.min(innerHeight,gBot))/2;
   if(t>.002){
    const S=1+ez*2.6;                                          // 확대
    door.style.opacity=String(1-reveal);
    door.style.setProperty('--x',(gx+(gx-gx)*0)+'px');door.style.setProperty('--y',gy+'px');
    door.style.setProperty('--top',Math.max(0,gy-(gy-Math.max(0,gTop))*S)+'px');door.style.setProperty('--bot',Math.max(0,innerHeight-(gy+(Math.min(innerHeight,gBot)-gy)*S))+'px');
    door.style.setProperty('--w',(2+glow*3+ez*10+flash*innerWidth*.9).toFixed(1)+'px');
    door.style.setProperty('--glow',(glow*(.85+.15*Math.sin(now/180))).toFixed(3));
    door.style.setProperty('--vig',vig.toFixed(3));
    door.style.setProperty('--vw',(70-vig*42-ez*10).toFixed(1)+'vw');
    door.style.setProperty('--flare',(sw*.9+flash*.4).toFixed(3));
    door.style.setProperty('--white',flash.toFixed(3));
    p.out.style.transformOrigin=`${gx}px ${gy}px`;
    p.out.style.transform=`scale(${S.toFixed(4)})`;
    const cb=sw*.6;                                            // 확대하는 동안만 살짝 크로마
    if(cb>.02){
     p.out.style.filter='url(#tg-chroma)';
     turb.setAttribute('baseFrequency','0.002 0.03');disp.setAttribute('scale',(cb*10).toFixed(1));
     offR.setAttribute('dx',(-cb*6).toFixed(1));offB.setAttribute('dx',(cb*6).toFixed(1));
    }else p.out.style.filter='';
   }else{door.style.opacity=0;p.out.style.transform='';if(!(pairs[0].sec.getBoundingClientRect().top<0&&ps[0]<1))p.out.style.filter=''}
   p.inn.style.opacity=before?'0':String(reveal>0?1:0);
   if((raw>0&&raw<1)||Math.abs(raw-tD)>.0008)busy=true;}
  if(gMax>.02){
   turb.setAttribute('seed',String(seed));
   turb.setAttribute('baseFrequency',`0.0015 ${(0.04+(seed%9)*.015).toFixed(3)}`);
   disp.setAttribute('scale',(gMax*80).toFixed(1));
   offR.setAttribute('dx',(-gMax*24).toFixed(1));offB.setAttribute('dx',(gMax*24).toFixed(1));
  }
  scan.style.opacity=(gMax*.55).toFixed(3);scan.style.backgroundPositionY=(seed*7)+'px';
  // '틈GO' 고정: 밤 인트로에서 제목이 다 나온 뒤부터, 수거 다음의 일로 넘어갈 때까지
  const s=-tgn.getBoundingClientRect().top;
  const kOn=s>=A3&&ps[1]<.32;
  if(kOn&&!keepRect)measureKeep();
  if(s>=A3&&s<A3+T)measureKeep();
  keep.classList.toggle('is-on',kOn);
  keep.style.filter='';
  keep.style.opacity=kOn?String(1-clamp((ps[1]-.05)/.25)):'';
  tgnTitle.style.opacity=kOn?'0':'';
  intro.classList.toggle('has-keep',kOn);
  if(busy||jig&&gMax>.02)raf2=requestAnimationFrame(frame);
 }
 let raf2=0;
 const kick2=()=>{if(!raf2)raf2=requestAnimationFrame(frame)};
 addEventListener('scroll',kick2,{passive:true});
 addEventListener('resize',()=>{keepRect=null;kick2()});
 desk.addEventListener('change',kick2);document.fonts?.ready.then(()=>{keepRect=null;kick2()});
 kick2();

 /* 전환 도중에 멈추면 가까운 쪽 끝으로 마저 넘긴다 */
 let timer=0,lastY=scrollY,dir=1,anim=0;
 const easeOut=t=>1-Math.pow(1-t,3);
 function glide(y){cancelAnimationFrame(anim);const y0=scrollY,d=y-y0,t0=performance.now();const st=n=>{const p=clamp((n-t0)/520);scrollTo({top:y0+d*easeOut(p),behavior:'instant'});if(p<1)anim=requestAnimationFrame(st);else anim=0};anim=requestAnimationFrame(st)}
 addEventListener('scroll',()=>{if(anim)return;const y=scrollY;if(Math.abs(y-lastY)>1)dir=y>lastY?1:-1;lastY=y;clearTimeout(timer);timer=setTimeout(()=>{
  if(!on()||window.__noSnap||document.querySelector('dialog[open]'))return;
  for(const p of pairs){const top=p.sec.getBoundingClientRect().top;const t=-top/p.T;if(t>.04&&t<.96){glide(scrollY+(dir>0?p.T+top:top));return}}
 },260)},{passive:true});
 ['wheel','touchstart','keydown'].forEach(e=>addEventListener(e,()=>{if(anim){cancelAnimationFrame(anim);anim=0}},{passive:true}));
})();
