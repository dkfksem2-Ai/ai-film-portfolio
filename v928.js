/* V9.28 — 맨 아래 바로가기를 누르면 어둠 장막이 왼쪽에서 오른쪽으로 0.5초 동안 덮고, 그 뒤에 해당 위치로 옮겨 장막을 걷는다 */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const curtain=document.createElement('div');curtain.className='pf-curtain';curtain.setAttribute('aria-hidden','true');document.body.append(curtain);
 let busy=false;
 document.addEventListener('click',e=>{
  const a=e.target.closest('.ab-nav a[href^="#"]');if(!a||busy)return;
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.button!==0)return;
  e.preventDefault();e.stopImmediatePropagation();
  const id=a.getAttribute('href').slice(1),el=id==='top'?null:document.getElementById(id);
  const go=()=>{const y=el?el.getBoundingClientRect().top+scrollY:0;scrollTo({top:y,behavior:'instant'});history.replaceState(null,'','#'+id)};
  if(reduce.matches){go();return}
  busy=true;curtain.classList.remove('is-out');void curtain.offsetWidth;curtain.classList.add('is-in');
  setTimeout(()=>{
   go();
   setTimeout(()=>{curtain.classList.remove('is-in');curtain.classList.add('is-out');setTimeout(()=>{curtain.classList.remove('is-out');busy=false},520)},180);   // 새 화면이 자리 잡을 시간
  },520);
 },true);
})();
