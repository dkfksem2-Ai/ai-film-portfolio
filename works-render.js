/* works.js 목록으로 첫 화면 단어·목록, 왼쪽 바로가기, 작품 목록 화면, 티저 목록을 만든다. site.js보다 먼저 실행된다. */
(()=>{const W=window.WORKS||[];if(!W.length)return;
  const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fontOf=w=>w.font?` style="--work-font:${esc(w.font)}"`:'';
  // 첫 화면: 흩어진 오브젝트 카드 (작업 소스·레퍼런스 이미지 + 단어 + 우주 유영/꿈틀거림 모션)
  const words=document.getElementById('vh-words');
  if(words){W.forEach(w=>{
    const items=w.wordItems||(w.words||[w.title]).map((t,i)=>({label:t,img:w.poster,code:`#0${i+1}`}));
    items.forEach((item,k)=>{
      const t=item.label,img=item.img||w.poster,code=item.code||`#0${k+1}`;
      const b=el('button',`vh-word keep-motion tone-${w.tone}${k===0?' is-key':''}`);
      b.type='button';b.dataset.film=w.id;b.dataset.word=t;
      if(w.font)b.style.setProperty('--work-font',w.font);
      b.setAttribute('aria-label',`${t}, ${w.title}`);
      b.innerHTML=`<span class="vw-card"><span class="vw-thumb"><img src="${esc(img)}" alt="" draggable="false" loading="eager"><span class="vw-code">${esc(code)}</span></span><span class="vw-label">${esc(t)}</span></span>`;
      words.append(b);
    });
  })}
  // 첫 화면: 작품마다 오브젝트를 담는 기업형 일러스트 아이콘 그릇 (Nano Banana 2.1 기반)
  const ART={
    lunchbox:`<div class="bin-visual bin-svg">
      <div class="bin-halo"></div>
      <div class="bin-lid bg-mouth"><img class="bin-img" src="assets/icon-lunchbox.webp" alt="락앤락 반찬통 일러스트 아이콘" draggable="false"></div>
      <div class="bin-slots" aria-hidden="true"><span class="f f1"></span><span class="f f2"></span><span class="f f3"></span><span class="f f4"></span><span class="f f5"></span><span class="f f6"></span></div>
    </div>`,
    bag:`<div class="bin-visual bin-svg">
      <div class="bin-halo"></div>
      <div class="bin-body bg-mouth"><img class="bin-img" src="assets/icon-tumgo-bag.webp" alt="틈GO 수거 가방 일러스트 아이콘" draggable="false"></div>
      <div class="bin-slots" aria-hidden="true"><span class="f f1"></span><span class="f f2"></span><span class="f f3"></span><span class="f f4"></span><span class="f f5"></span></div>
    </div>`};
  const bins=document.getElementById('vh-bins');
  if(bins){W.filter(w=>w.collect).forEach(w=>{const n=(w.words||[w.title]).length;const d=el("div",`vh-bin keep-motion bin-${w.collect.box}`);d.dataset.tone=w.tone;d.dataset.film=w.id;d.dataset.total=n;if(w.font)d.style.setProperty('--work-font',w.font);
    d.innerHTML=`${ART[w.collect.box]||''}<p class="bin-name">${esc(w.collect.name)} <span class="bin-count"><b>0</b>/${n}</span></p><p class="bin-say" aria-live="polite"></p>`;bins.append(d)})}
  // 첫 화면: 다 담으면 열리는 작품 화면 (그릇이 있던 절반을 채운다)
  const unlock=document.getElementById('vh-unlock');
  if(unlock){W.filter(w=>w.collect).forEach(w=>{const a=el('article',`vu-panel keep-motion row-${w.tone}`);a.dataset.film=w.id;if(w.font)a.style.setProperty('--work-font',w.font);a.setAttribute('aria-label',`${w.title} 열림`);
    a.innerHTML=`<div class="vu-media"><video muted loop playsinline preload="none" poster="${esc(w.poster)}" data-src="${esc(w.teaser||'')}"></video></div>
      <h2 class="vu-title">${esc(w.title)}</h2><p class="vu-line">${esc(w.line)}</p>
      <div class="vu-actions">${w.play?`<a class="btn btn--primary" href="${esc(w.play.href)}">${esc(w.play.label)}</a>`:''}<button type="button" class="btn btn--secondary" data-open="${w.id}">영상 보기</button><a class="btn btn--secondary" href="#${esc(w.id)}" data-glide>작품 소개</a><button type="button" class="btn--text vu-again">다시 담기</button></div>`;unlock.append(a)})}
  // 첫 화면: 작품 목록과 들어가 보기 링크
  const list=document.getElementById('vh-films');
  if(list){W.forEach(w=>{const li=el("li","vh-film keep-motion");li.dataset.tone=w.tone;li.dataset.film=w.id;
    if(w.font)li.style.setProperty("--work-font",w.font);li.innerHTML=`<button type="button" class="vh-film-name" data-open="${w.id}">${esc(w.title)}</button><span class="vh-film-meta">${esc(w.runtime)}</span>${w.play?`<a class="vh-film-play" href="${esc(w.play.href)}">${esc(w.play.label)}</a>`:''}`;list.append(li)})}
  // 첫 화면 티저 목록
  const v=document.querySelector('.ib-video');if(v)v.dataset.list=W.map(w=>w.teaser).filter(Boolean).join(',');
  // 왼쪽 바로가기
  const nav=document.getElementById('film-index-films');
  if(nav){W.forEach(w=>{const a=el('a','fi-film');a.href='#'+w.id;a.dataset.film=w.id;a.innerHTML=`<span class="fi-name">${esc(w.title)}</span><span class="fi-meta">${w.navMeta.map(esc).join('<br>')}</span>`;nav.append(a)})}
  const navPlay=document.getElementById('film-index-play');
  if(navPlay){W.filter(w=>w.play).forEach(w=>{const a=el('a','fi-link fi-play');a.href=w.play.href;a.textContent=w.play.label.replace(/ 보기$/,'');navPlay.append(a)})}
  // 두 번째 화면: 작품 목록. 한 줄에 한 작품, 고른 줄만 작품 색으로 켜진다
  const idx=document.getElementById('index-bands');
  if(idx){idx.style.setProperty('--n',W.length);W.forEach((w,k)=>{const row=el('article',`v8-row keep-motion row-${w.tone}${k===0?' is-on':''}`);row.dataset.film=w.id;if(w.font)row.style.setProperty('--work-font',w.font);
    row.innerHTML=`<div class="vr-head"><h3><a class="vr-title" href="#${w.id}" data-glide>${esc(w.title)}</a></h3><p class="vr-line">${esc(w.line)}</p><dl class="vr-facts">${w.facts.map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl></div>
      <div class="vr-scenes" aria-label="${esc(w.title)} 장면으로 이동">${w.scenes.map(([src,cap],n)=>`<button type="button" class="hs-scene keep-motion" data-go="${w.id}:${n}"><img src="${esc(src)}" alt=""><span>${esc(cap)}</span></button>`).join('')}</div>`;idx.append(row)})}
})();
