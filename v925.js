/* V9.25 — 틈GO 인트로: 밤하늘에서 계단 위 주인공까지 내려오고,
   배경이 흐려지면 주인공 실루엣 주변에 장면 사진이 떠다니며 선으로 이어진다.
   스크롤 단계(휠 한 칸 ≈ 100px): 들어오기 3칸 → 내려오기 5칸 → 사진 3칸 → 제목 3칸 → 머무름 1칸 */
(()=>{
 'use strict';
 const sec=document.getElementById('cl-tumgo');if(!sec||!sec.classList.contains('tgn'))return;
 const pin=sec.querySelector('.tgn-pin'),bg=sec.querySelector('.tgn-bg'),bgImg=sec.querySelector('.tgn-bg-img'),hero=sec.querySelector('.tgn-hero');
 const bgOff=sec.querySelector('.tgn-bg-off'),capA=sec.querySelector('.tgn-cap--a'),capB=sec.querySelector('.tgn-cap--b'),copy=sec.querySelector('.tgn-copy'),cue=sec.querySelector('.tgn-scroll');
 const phs=[...sec.querySelectorAll('.tgn-ph')],svg=sec.querySelector('.tgn-lines');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),seg=(v,a,b)=>clamp((v-a)/(b-a)),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
 bg.append(hero);                                   // 주인공은 배경과 함께 움직이고, 흐림은 배경 그림에만
 const markEmpty=()=>bg.classList.add('is-empty');
 bgImg.addEventListener('error',markEmpty);if(bgImg.complete&&!bgImg.naturalWidth)markEmpty();
 const desktopKeep=()=>matchMedia('(min-width: 961px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 const TICK=100,D=(desktopKeep()?18:15)*TICK;   // 데스크톱: 끝의 휠 세 칸은 다음 화면으로 넘어가는 크로마 전환                          // 스크롤 길이(섹션 높이에 반영)
 sec.style.setProperty('--tgn-len',D+'px');
 const A=[3,8,11,14].map(k=>k*TICK);                // 단계 경계
 const anchorAt={head:[.42,.12],phone:[.30,.285],chest:[.58,.40],knee:[.62,.66],foot:[.55,.945]};   // 주인공 그림 안의 위치(가로, 세로 비율)
 // 연결선
 const NS='http://www.w3.org/2000/svg';
 const lines=phs.map(()=>{const g=document.createElementNS(NS,'g');const l=document.createElementNS(NS,'line');const c=document.createElementNS(NS,'circle');c.setAttribute('r','4');g.append(l,c);svg.append(g);return {g,l,c}});
 const seeds=phs.map((_,i)=>({a:i*1.9+.3,b:i*2.7+1.1,sx:.11+i*.017,sy:.09+i*.013}));
 let cur=0,target=0,visible=false,raf=0;
 /* 가로등: 꺼진 채 시작 → 스크롤 두 칸쯤에서 두 번 깜빡이고 켜진다 */
 const FLICK=[[0,0],[90,1],[230,0],[310,1],[630,0]];   // [ms, 꺼짐(1)/켜짐(0)]
 let lampT0=-1;
 function lamp(s,now){
  if(reduce.matches){bgOff.style.opacity=0;return}
  if(s<120&&lampT0>=0)lampT0=-1;
  if(s>=200&&lampT0<0)lampT0=now;
  if(lampT0<0){bgOff.style.opacity=1;return}
  const e=now-lampT0;let st=0;for(const [t,v] of FLICK)if(e>=t)st=v;
  bgOff.style.opacity=st;
 }
 function measure(){const r=sec.getBoundingClientRect();target=clamp(-r.top,0,D);visible=r.bottom>0&&r.top<innerHeight;if(reduce.matches)target=D}
 function frame(now){
  raf=0;cur+=(target-cur)*(reduce.matches?1:.11);if(Math.abs(target-cur)<.3)cur=target;
  const s=cur,t=now/1000;
  const pE=seg(s,0,A[0]),pD=ease(seg(s,A[0]*.5,A[1])),pF=ease(seg(s,A[1],A[2])),pT=ease(seg(s,A[2],A[3]));
  // 1·2. 하늘 → 계단: 배경이 위로 올라간다
  const range=Math.max(0,bg.offsetHeight-pin.offsetHeight);
  bg.style.transform=`translate3d(-50%,${(-range*(pE*.06+pD*.94)).toFixed(1)}px,0)`;
  capA.style.opacity=(seg(s,40,220)*(1-seg(s,A[0]+60,A[0]+260))).toFixed(3);
  capB.style.opacity=(seg(s,A[1]-260,A[1]-40)*(1-seg(s,A[2]+40,A[2]+220))).toFixed(3);
  cue.style.opacity=(1-seg(s,20,160)).toFixed(3);
  const pH=ease(seg(s,A[1]-320,A[1]-40));
  hero.style.opacity=1;bg.style.setProperty('--hs',1);   // 주인공은 처음부터 계단 위에 있고, 카메라가 내려가며 만난다
  // 3. 배경 흐림 + 주인공 실루엣
  bgImg.style.filter=pF>0?`blur(${(pF*4.5).toFixed(2)}px) brightness(${(1-pF*.45).toFixed(3)}) saturate(${(1-pF*.3).toFixed(3)})`:'';
  bg.style.setProperty('--dim',pF.toFixed(3));
  // 주인공은 흐리지 않고 그대로, 배경과 살짝 떨어져 보이게만
  hero.style.filter=pF>0?`drop-shadow(0 0 24px rgb(0 0 0 / ${(pF*.55).toFixed(2)}))`:'';
  bgOff.style.filter=bgImg.style.filter;
  lamp(s,now);
  // 사진: 하나씩 나타나 아주 천천히 떠다닌다
  const hr=hero.getBoundingClientRect(),pr=pin.getBoundingClientRect();
  phs.forEach((f,i)=>{
   const k=ease(seg(s,A[1]+i*55,A[1]+i*55+170));
   const sd=seeds[i],dx=Math.sin(t*sd.sx+sd.a)*9,dy=Math.cos(t*sd.sy+sd.b)*8,rot=Math.sin(t*sd.sx*.7+sd.b)*.8;
   f.style.opacity=k.toFixed(3);
   f.style.transform=`translate3d(${dx.toFixed(1)}px,${(dy+(1-k)*24).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${(.94+.06*k).toFixed(3)})`;
   const L=lines[i];
   if(k<.02||hr.width<2){L.g.style.opacity=0;return}
   const r=f.getBoundingClientRect(),[ax,ay]=anchorAt[f.dataset.a]||[.5,.5];
   if(r.width<2){L.g.style.opacity=0;return}            // 숨긴 사진(휴대폰)의 선은 그리지 않는다
   const x2=hr.left+hr.width*ax-pr.left,y2=hr.top+hr.height*ay-pr.top;
   const cx=Math.max(r.left,Math.min(x2+pr.left,r.right))-pr.left,cy=Math.max(r.top,Math.min(y2+pr.top,r.bottom))-pr.top;
   const x1=cx+(x2-cx)*.0,y1=cy;
   const xe=x1+(x2-x1)*k,ye=y1+(y2-y1)*k;
   L.l.setAttribute('x1',x1.toFixed(1));L.l.setAttribute('y1',y1.toFixed(1));L.l.setAttribute('x2',xe.toFixed(1));L.l.setAttribute('y2',ye.toFixed(1));
   L.c.setAttribute('cx',x2.toFixed(1));L.c.setAttribute('cy',y2.toFixed(1));L.c.style.opacity=k>.95?1:0;
   L.g.style.opacity=(k*(1-pT*.35)).toFixed(3);
  });
  // 4. 제목
  copy.style.opacity=pT.toFixed(3);copy.style.transform=`translate3d(0,${(30*(1-pT)).toFixed(1)}px,0)`;
  copy.inert=pT<.5;
  if(visible&&(Math.abs(target-cur)>.3||pF>0||s>A[1]-320||(lampT0>=0&&now-lampT0<700)))raf=requestAnimationFrame(frame);
 }
 const kick=()=>{measure();if(visible&&!raf)raf=requestAnimationFrame(frame)};
 addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);
 kick();raf=raf||requestAnimationFrame(frame);
 window.__tgn={get s(){return cur},jump(v){cur=target=v}};
})();
