/* V9.24 — 첫 화면으로 돌아온 장면 조각 담기.
   처음에는 조각들이 배경에서 계속 떠다니고(영상 두 편도 뒤에서 반복), 가운데에 갈림길이 있다:
   '게임 시작하기'를 누르면 조각을 잡을 수 있고, '작품 바로 보기'를 누르면 아래 작품 소개로 내려간다.
   그릇마다 다 담으면 무엇이 열리는지 미리 적어 둔다. */
(()=>{
 'use strict';
 const hx=document.getElementById('hx');if(!hx)return;
 const stage=document.getElementById('play-stage'),gate=document.getElementById('hx-gate'),bar=document.getElementById('hx-bar');
 const playBtn=document.getElementById('hx-play'),backBtn=document.getElementById('hx-back');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');

 /* 그릇 아래에 '다 담으면 무엇이 열리는지' */
 const dest={memory:'1999년 소풍 체험',tumgo:'현우의 원룸 체험'};
 document.querySelectorAll('#vh-bins .vh-bin').forEach(b=>{
  if(b.querySelector('.hx-dest'))return;
  const d=document.createElement('span');d.className='hx-dest';
  d.innerHTML=`다 담으면 <b>${dest[b.dataset.film]||'체험'}</b>`;
  b.append(d);
 });

 /* 처음에는 조각을 잡을 수 없다(키보드로도) */
 const words=()=>[...document.querySelectorAll('#vh-words .vh-word')];
 function lock(on){
  stage.inert=on;
  words().forEach(w=>{if(on){w.dataset.tab=w.getAttribute('tabindex')??'';w.setAttribute('tabindex','-1')}else if('tab' in w.dataset){w.dataset.tab===''?w.removeAttribute('tabindex'):w.setAttribute('tabindex',w.dataset.tab);delete w.dataset.tab}});
 }
 function play(on){
  hx.classList.toggle('is-playing',on);
  gate.setAttribute('aria-hidden',String(on));gate.inert=on;
  bar.hidden=!on;lock(!on);
  if(on){
   requestAnimationFrame(()=>dispatchEvent(new Event('resize')));   // 조각 자리 다시 잡기
   const r=hx.getBoundingClientRect();if(Math.abs(r.top)>4)scrollTo({top:scrollY+r.top,behavior:reduce.matches?'instant':'smooth'});
   setTimeout(()=>words().find(w=>!w.classList.contains('is-eaten'))?.focus({preventScroll:true}),400);
  }else{
   resetGame();setTimeout(()=>{if(!hx.classList.contains('is-playing'))resetGame()},1700);   // 마지막 조각 직후에 돌아와도(1.5초 뒤 열림) 다시 비운다
   playBtn.focus({preventScroll:true});
  }
 }
 /* 처음 화면으로 돌아가면 퍼즐을 처음 상태로: 담은 조각, 그릇, 열린 작품 화면, 완료 창 모두 */
 function resetGame(){
  const api=window.__collectDebug;if(!api)return;
  const dirty=document.querySelector('#vh-words .is-eaten,#vh-words .is-in,#vh-bins .is-full,#vh-bins .is-gone,#vh-unlock .is-on');
  const dlg=document.getElementById('vh-done');if(dlg&&dlg.open)dlg.close();
  if(dirty)api.resetAll();
 }
 window.__hxPlay=play;
 playBtn.addEventListener('click',()=>play(true));
 backBtn.addEventListener('click',()=>play(false));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&hx.classList.contains('is-playing')&&!document.querySelector('dialog[open]'))play(false)});
 play(!!window.__hxPlayPending);

 /* 배경 영상: 첫 화면이 보일 때만 재생 */
 const vids=[...stage.querySelectorAll('.vh-backdrop video')];
 const run=on=>vids.forEach(v=>{if(on&&!reduce.matches){const p=v.play();p&&p.catch(()=>{})}else v.pause()});
 new IntersectionObserver(es=>es.forEach(e=>run(e.isIntersecting)),{threshold:.05}).observe(hx);
})();
