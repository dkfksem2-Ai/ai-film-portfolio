/* 쪽지 저장소: Supabase REST를 직접 부른다. 연결이 없거나 실패하면 이 기기(localStorage)에만 저장한다. */
(()=>{
  const cfg=window.NOTES_DB||{};const ok=!!(cfg.url&&cfg.key);
  const H=()=>({apikey:cfg.key,Authorization:'Bearer '+cfg.key,'Content-Type':'application/json'});
  const LKEY=f=>'film-notes-'+f;
  const local=f=>{try{return JSON.parse(localStorage.getItem(LKEY(f))||'[]')}catch(e){return[]}};
  const saveLocal=(f,n)=>{try{const l=local(f);l.push(n);localStorage.setItem(LKEY(f),JSON.stringify(l.slice(-50)))}catch(e){}};
  // 심사 기간용 최소한의 거친 말 거르기
  const BAD=['씨발','시발','ㅅㅂ','병신','ㅂㅅ','좆','개새','지랄','fuck','shit','꺼져','죽어'];
  const clean=t=>!BAD.some(w=>t.toLowerCase().replace(/\s/g,'').includes(w));
  async function list(film,limit=40){
    if(!ok)return{rows:local(film).slice().reverse(),shared:false};
    try{const r=await fetch(`${cfg.url}/rest/v1/notes?select=id,body,created_at&film=eq.${film}&order=created_at.desc&limit=${limit}`,{headers:H()});
      if(!r.ok)throw new Error(r.status);return{rows:await r.json(),shared:true}}
    catch(e){console.warn('[notes] list',e);return{rows:local(film).slice().reverse(),shared:false}}
  }
  async function one(id){
    if(!ok||!/^\d+$/.test(String(id)))return null;
    try{const r=await fetch(`${cfg.url}/rest/v1/notes?select=id,film,body,created_at&id=eq.${id}`,{headers:H()});const j=await r.json();return j[0]||null}catch(e){return null}
  }
  async function add(film,body){
    body=String(body||'').trim().slice(0,80);
    if(!body)return{error:'empty'};if(!clean(body))return{error:'filtered'};
    const note={body,created_at:new Date().toISOString()};
    if(!ok){saveLocal(film,note);return{note,shared:false}}
    try{const r=await fetch(`${cfg.url}/rest/v1/notes`,{method:'POST',headers:{...H(),Prefer:'return=representation'},body:JSON.stringify({film,body})});
      if(!r.ok)throw new Error(r.status);const j=await r.json();saveLocal(film,j[0]);return{note:j[0],shared:true}}
    catch(e){console.warn('[notes] add',e);saveLocal(film,note);return{note,shared:false}}
  }
  async function count(film){
    if(!ok)return null;
    try{const r=await fetch(`${cfg.url}/rest/v1/notes?select=id&film=eq.${film}`,{headers:{...H(),Prefer:'count=exact',Range:'0-0'}});const cr=r.headers.get('content-range');return cr?Number(cr.split('/')[1]):null}catch(e){return null}
  }
  const shareUrl=(page,id)=>`${location.origin}${location.pathname.replace(/[^/]*$/,'')}${page}?note=${id}`;
  window.NotesDB={connected:ok,list,one,add,count,shareUrl};
})();
