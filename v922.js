/* V9.22 — 틈GO 소개 배경을 영상으로(01 조우 · 02 고민 · 03 수거),
   소개 카드: 에스프레소 한 방울이 우유에 떨어져 파문 → 소용돌이로 섞이며 → 한 방울 얼룩으로 남는다 */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

 /* ---------- 틈GO 소개: 단계마다 해당 영상 재생 ---------- */
 const intro=document.getElementById('tumgo-intro');
 if(intro){
  const vids=[...intro.querySelectorAll('.zone-video')];
  const big=intro.querySelector('.tb-big-n');
  const words=['조우','고민','수거'];
  let w=intro.querySelector('.tb-big-w');
  if(big&&!w){w=document.createElement('span');w.className='tb-big-w';big.after(w)}
  vids.forEach((v,i)=>{v.preload=i===0?'auto':'metadata';v.muted=true;v.setAttribute('muted','')});
  let cur=-1,inView=false;
  function show(i){
   if(i===cur)return;cur=i;
   vids.forEach((v,k)=>{
    const on=k===i;v.classList.toggle('is-play',on);
    if(on&&inView){if(v.preload!=='auto')v.preload='auto';const p=v.play();p&&p.catch(()=>{})}
    else setTimeout(()=>{if(!v.classList.contains('is-play'))v.pause()},700);
   });
   if(w){w.textContent=words[i]||'';w.classList.remove('is-in');void w.offsetWidth;w.classList.add('is-in')}
  }
  const read=()=>{const n=parseInt(big?.dataset.n||'1',10)-1;show(clamp(n,0,2))};
  if(big)new MutationObserver(read).observe(big,{attributes:true,attributeFilter:['data-n']});
  new IntersectionObserver(es=>es.forEach(e=>{inView=e.isIntersecting;
   const v=vids[cur];if(!v)return;if(inView){const p=v.play();p&&p.catch(()=>{})}else v.pause()}),{threshold:.05}).observe(intro);
  read();
 }

 /* ---------- 소개: 에스프레소 한 방울 ---------- */
 const ab=document.getElementById('about');
 if(!ab||!ab.querySelector('.ab-pin'))return;
 const pin=ab.querySelector('.ab-pin'),card=ab.querySelector('.ab-card'),steps=[...ab.querySelectorAll('.ab-step')];
 const DROP=1.6;            // 물방울 장면에 쓰는 스크롤 칸 수
 const DUR=5.2;             // 떨어지고 얼룩으로 굳기까지 걸리는 시간(초)
 let t0=-1,visible=false,gl=null,prog=null,U={};
 /* V10: 한 번 끝까지 본 뒤에는(또는 skip) 이 탭을 닫기 전까지 완성된 모습 그대로 둔다 */
 const KEY='ab-done';let done=false;try{done=sessionStorage.getItem(KEY)==='1'}catch(e){}
 function finish(){if(done)return;done=true;try{sessionStorage.setItem(KEY,'1')}catch(e){}ab.classList.add('is-done');}
 if(done)ab.classList.add('is-done','is-restored');

 const cv=document.createElement('canvas');cv.className='ab-gl';cv.setAttribute('aria-hidden','true');pin.prepend(cv);
 try{gl=cv.getContext('webgl',{premultipliedAlpha:false,antialias:false})}catch(e){gl=null}
 if(gl){
  const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs=`precision highp float;
uniform vec2 uRes,uC;uniform float uR,uT,uTime,uDpr;
const float PI=3.14159265;
float h1(float x){return fract(sin(x*127.1)*43758.5453);}
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
float fbm3(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<3;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
/* 둥글게 감긴 각도 노이즈 (θ가 한 바퀴 돌면 이어지게) */
float angN(float th,float f,float s){return fbm3(vec2(cos(th),sin(th))*f+s);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float sdSeg(vec2 p,vec2 a,vec2 b,float ra,float rb){vec2 pa=p-a,ba=b-a;float t=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*t)-mix(ra,rb,t);}
/* 한 방울 얼룩: 들쭉날쭉한 몸통 + 끝이 동그랗게 맺힌 팔 */
float stainD(vec2 q,float R,float grow,float s){
 float r=length(q),th=atan(q.y,q.x);
 float body=r-R*(.93+.09*angN(th,1.4,3.1)+.035*angN(th,4.5,7.7));
 float d=body;
 for(int i=0;i<13;i++){
  float fi=float(i);
  float a=(fi+.5*h1(fi*2.3))/13.*2.*PI;
  float len=R*(.05+.30*pow(h1(fi*9.1),1.8))*grow;
  if(len<1.)continue;
  vec2 dir=vec2(cos(a),sin(a));
  float w=(4.+7.*h1(fi*5.3))*s;
  vec2 p0=dir*R*.86,p1=dir*(R*.92+len);
  /* 팔이 살짝 휘어진다 */
  vec2 bend=vec2(-dir.y,dir.x)*(h1(fi*1.7)-.5)*len*.35;
  float arm=min(sdSeg(q,p0,p0+(p1-p0)*.55+bend,w,w*.6),sdSeg(q,p0+(p1-p0)*.55+bend,p1,w*.6,w*.42));
  float tip=length(q-p1)-w*(.75+.5*h1(fi*8.8));
  d=smin(d,min(arm,tip),9.*s);
 }
 return d+(fbm3(q/(14.*s))-.5)*3.*s;
}
vec3 milk=vec3(.953,.937,.906);
vec3 esp=vec3(.30,.17,.08);
vec3 crema=vec3(.62,.40,.20);
vec3 latte=vec3(.86,.75,.58);
vec3 paper=vec3(.94,.89,.80);
/* 물결 높이: 퍼지며 흩어지는 세 줄의 파동 */
float wave(float r,float t){
 if(t<=0.)return 0.;
 float hgt=0.;
 for(int i=0;i<3;i++){
  float fi=float(i);float tt=t-fi*.16;if(tt<=0.)continue;
  float front=tt*230.*uDpr;
  float x=(r-front)/(26.*uDpr);
  float env=exp(-x*x*.55)*exp(-tt*1.15)*(1.-fi*.25);
  hgt+=sin((r-front)/(7.5*uDpr)+fi)*env;
 }
 /* 중심의 출렁임 */
 hgt+=sin(r/(9.*uDpr)-t*14.)*exp(-r/(60.*uDpr))*exp(-t*2.2)*.8;
 return hgt/sqrt(1.+r/(120.*uDpr));
}
void main(){
 vec2 px=gl_FragCoord.xy;float s=uDpr;
 vec2 d=px-uC;float r=length(d);float th=atan(d.y,d.x);
 float T=uT;                 /* 시작 후 경과 초 (-1이면 아직) */
 float IMP=.62;              /* 닿는 순간 */
 float tt=T-IMP;             /* 닿은 뒤 경과 */
 /* 우유 표면: 창가 빛이 비친 듯 아주 옅은 밝기 차 */
 vec3 col=milk*(.985+.03*smoothstep(uRes.y*.9,0.,length(px-vec2(uRes.x*.3,uRes.y*1.05))));
 col*=1.-.03*fbm3(px/(220.*s));
 /* 파문으로 생기는 표면 기울기 */
 vec2 grad=vec2(0.);
 if(tt>0.){
  float e=1.5*s;
  float g=(wave(r+e,tt)-wave(r-e,tt))/(2.*e);
  grad=g*d/max(r,1.)*34.*s;
 }
 vec3 N=normalize(vec3(-grad,1.));
 vec3 L=normalize(vec3(-.45,.55,.7));
 /* 굴절: 얼룩 무늬를 기울기만큼 밀어서 본다 */
 vec2 q=d-grad*10.*s;float rq=length(q);float thq=atan(q.y,q.x);
 if(tt>0.){
  float R=uR;
  float spread=1.-exp(-tt*1.25);                    /* 퍼짐 */
  float settle=smoothstep(2.3,DURV,tt);             /* 얼룩으로 굳음 */
  float grow=smoothstep(0.,.38,tt);                 /* 튄 가시가 뻗음 */
  /* 소용돌이: 가운데일수록 많이 감기고, 결은 불규칙하게 비틀린다 */
  float swirl=(3.4*(1.-exp(-tt*.85)))*exp(-rq/(R*.6));
  float a=thq+swirl+(fbm3(q/(90.*s))-.5)*1.2;
  vec2 w=vec2(cos(a),sin(a))*rq/s;
  vec2 wq=w*.0095;
  vec2 warp=vec2(fbm(wq+vec2(1.7,tt*.07)),fbm(wq+vec2(8.3,2.8)-tt*.05));
  vec2 warp2=vec2(fbm(wq*1.9+warp*1.6+vec2(4.1,.6)),fbm(wq*1.9+warp*1.6+vec2(.9,6.2)));
  float marb=fbm(wq*1.4+warp2*2.2);
  float vein=1.-smoothstep(0.,.045,abs(marb-.5));           /* 우유가 접혀 들어간 가는 흰 결 */
  float vein2=1.-smoothstep(0.,.03,abs(fbm(wq*2.6+warp*3.)-.48));
  float scale=mix(.06,1.,spread);
  float sd=stainD(q/scale,R,grow,s/scale)*scale;
  float inside=1.-smoothstep(-1.4*s,1.4*s,sd);
  float mixAmt=smoothstep(.0,2.4,tt);
  float core=smoothstep(R*1.1*scale,0.,rq);
  float dens=clamp(mix(1.,.15,mixAmt)*(.55+.45*core)+(smoothstep(.42,.72,marb)-.4)*.9*(1.-settle),0.,1.);
  vec3 dye=mix(latte,esp,dens);
  dye=mix(dye,crema,smoothstep(.3,.6,marb)*(1.-smoothstep(.6,.8,marb))*.45*(1.-settle));
  dye=mix(dye,vec3(.97,.95,.9),max(vein*.85,vein2*.6)*smoothstep(.15,.9,tt)*(1.-settle));
  /* 굳은 얼룩: 안쪽은 종이빛, 가장자리로 갈수록 짙은 커피 테 */
  float rimD=-sd;
  float rimW=(6.+10.*angN(thq,3.,1.3))*s;
  float rim=smoothstep(rimW*3.,0.,rimD)*inside;
  float mottled=fbm(q/(42.*s)+5.);
  vec3 stain=mix(paper,latte,smoothstep(.45,.85,mottled)*.6+smoothstep(R*.25,R*1.05,rq)*.25);
  stain=mix(stain,vec3(.6,.38,.18),pow(rim,1.4)*.8);
  stain=mix(stain,vec3(.40,.22,.09),smoothstep(rimW*.55,0.,rimD)*inside*.7);
  float fib=n(vec2(q.x/(1.3*s),q.y/(7.*s)))*.5+n(vec2(q.x/(6.*s),q.y/(1.2*s)))*.5;
  stain*=1.-.05*fib-.035*n(q/(2.2*s));
  vec3 inner=mix(dye,stain,settle);
  inner=mix(inner,inner*vec3(.74,.64,.54),smoothstep(12.*s,0.,rimD)*(1.-settle)*.65*inside);
  /* 젖은 얼룩 바깥으로 살짝 번진 물기 */
  float halo=(1.-smoothstep(0.,7.*s,sd))*(1.-inside);
  col=mix(col,col*vec3(.94,.9,.85),halo*.6);
  col=mix(col,inner,inside);
  /* 가시 끝에 튄 작은 방울 */
  for(int i=0;i<7;i++){
   float fi=float(i);
   float aa=h1(fi*13.1)*2.*PI;float dist=R*(1.18+.16*h1(fi*4.4))*mix(.12,1.,spread);
   vec2 c=uC+vec2(cos(aa),sin(aa))*dist;
   float rr=(2.+3.8*h1(fi*7.7))*s*smoothstep(.05,.3,tt);
   float dd=length(px-c)-rr;
   float m=1.-smoothstep(-1.*s,1.*s,dd);
   vec3 dc=mix(mix(esp,latte,mixAmt),vec3(.6,.38,.18),settle);
   dc=mix(dc,dc*.75,smoothstep(-rr*.6,0.,dd));
   col=mix(col,dc,m);
  }
 }
 /* 빛: 파문의 결이 반짝이도록 */
 float diff=dot(N,L);
 vec3 V=vec3(0,0,1);
 float spec=pow(max(dot(reflect(-L,N),V),0.),70.);
 col*=.9+.1*(diff/.7);
 col+=spec*.55*step(0.,tt);
 /* 떨어지는 방울 */
 if(T>=0.&&T<IMP){
  float f=T/IMP;
  vec2 dp=uC+vec2(0.,(uRes.y-uC.y+40.*s)*(1.-f*f));
  vec2 dq=px-dp;
  float stretch=1.+f*f*.7;
  dq.y/=stretch;
  float R=15.*s;
  float tip=max(dq.y,0.)/(R*1.5);
  float dd=length(vec2(dq.x*(1.+tip*1.5),dq.y*.85))-R;
  float m=1.-smoothstep(-1.2*s,1.2*s,dd);
  /* 그림자: 떨어질수록 진하고 작아진다 */
  float sh=exp(-pow(length((px-uC)/(R*(3.2-f*1.8))),2.))*f*.22;
  col*=1.-sh;
  vec3 dc=mix(esp,crema,smoothstep(R,-R*.4,dq.x*.6+dq.y));
  float hl=smoothstep(R*.45,0.,length(dq-vec2(-R*.38,R*.3)));
  float hl2=smoothstep(R*.25,0.,length(dq-vec2(R*.35,-R*.4)))*.35;
  dc+=hl*.8+hl2;
  dc=mix(dc,esp*.6,smoothstep(-4.*s,0.,dd)*.6);
  col=mix(col,dc,m);
 }
 /* 튀어 오르는 작은 방울(왕관 모양) */
 if(tt>0.&&tt<.6){
  for(int i=0;i<9;i++){
   float fi=float(i);float aa=fi/9.*2.*PI+.3;
   float u=tt/.6;
   vec2 c=uC+vec2(cos(aa),sin(aa))*(18.*s+uR*.35*u)+vec2(0.,sin(u*PI)*26.*s);
   float rr=(4.5-3.*u)*s;
   float m=1.-smoothstep(rr-1.,rr+1.,length(px-c));
   col=mix(col,mix(esp,crema,.5)+.25*smoothstep(rr,0.,length(px-c-vec2(-1.2,1.2)*s)),m*(1.-u*.3));
  }
  float u=tt/.6;
  vec2 jc=uC+vec2(0.,sin(clamp(u*1.4,0.,1.)*PI)*62.*s);
  float jr=(6.-3.*u)*s;
  float jm=1.-smoothstep(jr-1.,jr+1.,length(px-jc));
  col=mix(col,crema+.3*smoothstep(jr,0.,length(px-jc-vec2(-1.5,1.5)*s)),jm*step(u,.72));
 }
 gl_FragColor=vec4(col,1.);
}`.replace('DURV',DUR.toFixed(2));
  const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(o));return null}return o};
  const v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);
  if(v&&f){prog=gl.createProgram();gl.attachShader(prog,v);gl.attachShader(prog,f);gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))prog=null}
  if(prog){gl.useProgram(prog);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
   const loc=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
   ['uRes','uC','uR','uT','uTime','uDpr'].forEach(k=>U[k]=gl.getUniformLocation(prog,k))}
 }
 if(prog)ab.classList.add('has-gl');else cv.remove();

 let dpr=1,W=0,H=0;
 function size(){dpr=Math.min(1.5,devicePixelRatio||1);const r=pin.getBoundingClientRect();W=Math.round(r.width*dpr);H=Math.round(r.height*dpr);
  if(prog&&(cv.width!==W||cv.height!==H)){cv.width=W;cv.height=H;gl.viewport(0,0,W,H)}}
 function elapsed(now){if(window.__abFix!=null)return window.__abFix;if(reduce.matches||done)return DUR+1;return t0<0?-1:(now-t0)/1000}
 function draw(now){
  if(!prog)return;
  const pr=pin.getBoundingClientRect(),cr=card.getBoundingClientRect();
  const cx=(cr.left+cr.width/2-pr.left)*dpr,cy=(pr.bottom-(cr.top+cr.height/2))*dpr;
  gl.uniform2f(U.uRes,W,H);gl.uniform2f(U.uC,cx,cy);gl.uniform1f(U.uR,Math.min(cr.width,cr.height)/2*dpr*.8);
  gl.uniform1f(U.uT,elapsed(now));gl.uniform1f(U.uTime,now/1000);gl.uniform1f(U.uDpr,dpr);
  gl.drawArrays(gl.TRIANGLES,0,3);
 }
 function measure(){
  const r=ab.getBoundingClientRect(),span=Math.max(1,ab.offsetHeight-pin.offsetHeight),p=clamp(-r.top/span);
  const u=p*(steps.length+DROP+1);
  visible=r.bottom>0&&r.top<innerHeight;
  if(reduce.matches||done){steps.forEach(s=>s.classList.add('is-on'));ab.classList.add('is-formed');return}
  if(getComputedStyle(pin).position!=='sticky'){   // 휴대폰: 고정 없이, 카드가 보이면 떨어진다
   const cr=card.getBoundingClientRect();
   if(cr.top<innerHeight*.7&&t0<0)t0=performance.now();
   if(r.top>innerHeight&&t0>=0)t0=-1;
   const ok=elapsed(performance.now())>DUR*.8;
   steps.forEach(s=>s.classList.toggle('is-on',ok));ab.classList.toggle('is-formed',ok);if(ok)finish();return;
  }
  if(u>.12&&t0<0)t0=performance.now();          // 내려오면 방울이 떨어진다
  if(u<.02&&r.top>-4&&t0>=0){t0=-1}             // 위로 다시 올라가면 처음으로
  const n=Math.floor(u-DROP+1);
  const ready=elapsed(performance.now())>DUR*.8;
  steps.forEach((s,i)=>s.classList.toggle('is-on',ready&&i<n));
  ab.classList.toggle('is-formed',ready);
  if(ready&&n>=steps.length)finish();
 }
 let running=false;
 function loop(now){measure();draw(now);if(visible)requestAnimationFrame(loop);else running=false}
 function kick(){measure();if(visible&&!running){running=true;requestAnimationFrame(loop)}}
 addEventListener('scroll',kick,{passive:true});
 addEventListener('resize',()=>{size();kick()});
 document.fonts?.ready.then(()=>{size();kick()});
 size();kick();
 window.__abDrop=()=>({t:elapsed(performance.now()),gl:!!prog});
 window.__abStart=sec=>{t0=performance.now()-sec*1000};
 window.__abSkip=()=>{finish();kick()};
 window.__abDone=()=>done;
})();
