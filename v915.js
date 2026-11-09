/* V9.15 — 체험 페이지 전환 연출(소풍: 바탕색 상자가 화면을 채움 / 현우방: 로봇 스캔), 게임 첫 클릭에 배경음 7% */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let ctx=null;
 const ac=()=>{try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}catch(e){return null}};
 function tone(f,type,dur,vol,delay=0,to=null){const c=ac();if(!c)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.03)}
 const sfxPicnic=()=>{[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,'triangle',.28,.11,i*.09));tone(196,'sine',.7,.06,0,392)};
 const sfxScan=()=>{tone(220,'sawtooth',1.05,.07,0,1760);tone(880,'square',.06,.05,.02);tone(1320,'square',.06,.05,1.0);tone(1760,'sine',.25,.07,1.05)};

 const bgm=document.getElementById('site-bgm');
 function fadeBgm(ms){if(!bgm||bgm.paused)return;const v0=bgm.volume,t0=performance.now();const step=n=>{const p=Math.min(1,(n-t0)/ms);bgm.volume=Math.max(0,v0*(1-p));if(p<1)requestAnimationFrame(step);else bgm.pause()};requestAnimationFrame(step)}

 function goPicnic(a,href){
  const r=a.getBoundingClientRect(),ov=document.createElement('div'),box=document.createElement('div');
  ov.className='go-overlay';box.className='go-box';ov.append(box);document.body.append(ov);
  Object.assign(box.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  sfxPicnic();fadeBgm(700);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const d=Math.hypot(innerWidth,innerHeight);
   Object.assign(box.style,{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'});
  }));
  setTimeout(()=>{location.href=href},880);
 }
 function goRoom(href){
  const ov=document.createElement('div');ov.className='go-overlay';
  ov.innerHTML='<div class="go-scan"></div><div class="go-beam"><span>TUMGO SCAN · 현우의 원룸으로 이동</span></div>';
  document.body.append(ov);sfxScan();fadeBgm(900);
  requestAnimationFrame(()=>{ov.querySelector('.go-scan').classList.add('is-run');ov.querySelector('.go-beam').classList.add('is-run')});
  setTimeout(()=>{location.href=href},1200);
 }
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="picnic.html"],a[href^="room.html"]');if(!a)return;
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.button!==0)return;
  e.preventDefault();e.stopImmediatePropagation();
  const href=a.getAttribute('href');
  if(reduce.matches){location.href=href;return}
  if(href.startsWith('room'))goRoom(href);else goPicnic(a,href);
 },true);
 // 뒤로 가기로 돌아왔을 때 전환 막이 남아 있지 않게
 addEventListener('pageshow',()=>document.querySelectorAll('.go-overlay').forEach(o=>o.remove()));

 /* 게임 무대를 처음 누르는 순간 배경음 7% */
 const stage=document.getElementById('play-stage');
 if(stage&&bgm){
  stage.addEventListener('pointerdown',()=>{
   if(!bgm.paused)return;
   bgm.volume=0;bgm.play().then(()=>{const t0=performance.now();const up=n=>{const p=Math.min(1,(n-t0)/2200);bgm.volume=.07*p;if(p<1&&!bgm.paused)requestAnimationFrame(up)};requestAnimationFrame(up)}).catch(()=>{});
  },true);
 }
})();
