/* works.js 목록으로 첫 화면 단어·목록, 왼쪽 바로가기, 작품 목록 화면, 티저 목록을 만든다. site.js보다 먼저 실행된다. */
(()=>{const W=window.WORKS||[];if(!W.length)return;
  const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fontOf=w=>w.font?` style="--work-font:${esc(w.font)}"`:'';
  // 첫 화면: 흩어진 단어 (v8.js가 위치를 잡고 끌기·담기를 붙인다)
  const words=document.getElementById('vh-words');
  if(words){W.forEach(w=>(w.words||[w.title]).forEach((t,k)=>{const b=el('button',`vh-word keep-motion tone-${w.tone}${k===0?' is-key':''}`);b.type='button';b.dataset.film=w.id;b.textContent=t;if(w.font)b.style.setProperty('--work-font',w.font);b.setAttribute('aria-label',`${t}, ${w.title}`);words.append(b)}))}
  // 첫 화면: 작품마다 단어를 담는 그릇
  const ART={
    lunchbox:`<svg viewBox="0 0 320 240" class="bin-svg" aria-hidden="true">
      <g class="bin-body"><path d="M22 92h276l-14 124a18 18 0 0 1-18 16H54a18 18 0 0 1-18-16z" class="lb-glass"/>
      <g class="lb-food"><rect class="f f1" x="50" y="110" width="66" height="48" rx="8"/><rect class="f f2" x="127" y="110" width="66" height="48" rx="8"/><rect class="f f3" x="204" y="110" width="66" height="48" rx="8"/><rect class="f f4" x="56" y="166" width="62" height="48" rx="8"/><rect class="f f5" x="129" y="166" width="62" height="48" rx="8"/><rect class="f f6" x="202" y="166" width="62" height="48" rx="8"/></g>
      <path d="M40 104h240" class="lb-shine"/></g>
      <g class="bin-lid"><rect x="12" y="66" width="296" height="28" rx="12" class="lb-lid"/><rect x="4" y="74" width="20" height="38" rx="6" class="lb-clip"/><rect x="296" y="74" width="20" height="38" rx="6" class="lb-clip"/><rect x="140" y="88" width="40" height="22" rx="6" class="lb-clip"/></g>
    </svg>`,
    bag:`<svg viewBox="0 0 300 340" class="bin-svg" aria-hidden="true">
      <path d="M92 70C80 34 112 14 150 14s70 20 58 56" class="bg-cord"/>
      <g class="bin-body"><path d="M58 76Q150 52 242 76l26 222q-118 34-236 0z" class="bg-sack"/>
      <ellipse cx="150" cy="78" rx="92" ry="14" class="bg-mouth"/>
      <path d="M78 96q72 22 144 0" class="bg-fold"/>
      <g class="bg-logo"><path d="M150 168a26 26 0 1 0 24 34h-24v-12h38a38 38 0 1 1-6-26z" class="bg-g"/><path d="M182 160l12-8v14z" class="bg-g2"/>
      <text x="150" y="246" text-anchor="middle" class="bg-word">TUMGO</text><text x="150" y="264" text-anchor="middle" class="bg-tag">LAUNDRY FOR A BETTER YOU</text></g></g>
      <g class="bg-label"><path d="M206 74l14 28" class="bg-cord bg-thin"/><rect x="204" y="98" width="44" height="54" rx="4" class="bg-paper"/><rect x="214" y="106" width="24" height="24" class="bg-qr"/><text x="226" y="144" text-anchor="middle" class="bg-no">T10-0477</text></g>
    </svg>`};
  const bins=document.getElementById('vh-bins');
  if(bins){W.filter(w=>w.collect).forEach(w=>{const n=(w.words||[w.title]).length;const d=el("div",`vh-bin keep-motion bin-${w.collect.box}`);d.dataset.tone=w.tone;d.dataset.film=w.id;d.dataset.total=n;if(w.font)d.style.setProperty('--work-font',w.font);
    d.innerHTML=`${ART[w.collect.box]||''}<p class="bin-name">${esc(w.collect.name)}</p><p class="bin-count"><b>0</b> / ${n}</p><p class="bin-say" aria-live="polite">${esc(w.collect.hint)}</p>`;bins.append(d)})}
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
