/* V9.20 — 첫 구간 배경 그라데이션 계산, 소개 순차 등장과 물감 번짐 */
(()=>{
 'use strict';
 const cl=document.querySelector('.cl');
 if(cl){
  const zones=[['.cl-hero','#141414'],['.cl-memory','#eef4f2'],['.cl-tumgo','#10141a']].map(([s,c])=>[cl.querySelector(s),c]).filter(z=>z[0]);
  function grad(){
   const H=cl.offsetHeight,top=cl.getBoundingClientRect().top+scrollY,blend=Math.min(innerHeight*.35,260),stops=[];
   zones.forEach(([el,c],i)=>{const a=el.getBoundingClientRect().top+scrollY-top,b=a+el.offsetHeight;
    const s=i===0?0:a+blend,e=i===zones.length-1?H:b-blend;stops.push(`${c} ${(s/H*100).toFixed(2)}%`,`${c} ${(e/H*100).toFixed(2)}%`)});
   cl.style.setProperty('--cl-grad',`linear-gradient(180deg, ${stops.join(', ')})`);
  }
  addEventListener('resize',grad);addEventListener('load',grad);document.fonts?.ready.then(grad);grad();
 }

 // 소개 구간은 V9.21(v921.js)에서 처리
})();
