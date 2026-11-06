(()=>{
  const rows=[...document.querySelectorAll('.v8-row')];
  rows.forEach(row=>row.querySelectorAll('.hs-scene>img').forEach(img=>{
    const wrap=document.createElement('span');wrap.className='reveal-image';img.before(wrap);wrap.append(img);
    const color=img.cloneNode();color.alt='';color.setAttribute('aria-hidden','true');wrap.append(color);
  }));
  const section=document.querySelector('.about-scroll');
  const beats=[...section.querySelectorAll('.asc-row')];
  const clamp=x=>Math.max(0,Math.min(1,x));
  let queued=false;
  function paint(){
    queued=false;
    rows.forEach(row=>{const r=row.getBoundingClientRect();row.style.setProperty('--color-fill',clamp((innerHeight*.88-r.top)/(r.height+innerHeight*.18)));});
    const r=section.getBoundingClientRect();
    const header=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))||85;
    const p=clamp((header-r.top)/Math.max(1,r.height-innerHeight+header));
    beats.forEach((beat,i)=>beat.style.setProperty('--beat',clamp((p-i*.12)/.12)));
    section.style.setProperty('--underline',clamp((p-.82)/.16));
  }
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(paint);}};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});paint();
})();
