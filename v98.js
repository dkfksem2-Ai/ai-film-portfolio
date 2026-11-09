(()=>{
  const slider=document.getElementById('bgm-volume'),value=document.getElementById('bgm-volume-value');
  const showVolume=()=>{value.textContent=Math.round(Number(slider.value)*100)+'%';};
  slider.addEventListener('input',showVolume);
  document.getElementById('bgm-toggle').addEventListener('click',()=>setTimeout(showVolume,0));
  showVolume();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelectorAll('.feature-media').forEach(button=>{
    const video=button.querySelector('video');
    if(!video)return;
    const stop=()=>{video.pause();button.classList.remove('is-previewing');};
    button.addEventListener('pointerenter',()=>{
      if(!matchMedia('(hover:hover)').matches)return;
      video.play().then(()=>button.classList.add('is-previewing')).catch(stop);
    });
    button.addEventListener('pointerleave',stop);
    button.addEventListener('click',stop);
  });
})();
