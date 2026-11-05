/* 쪽지 저장소(Supabase) 연결 정보.
   url은 프로젝트 주소, key는 Supabase 대시보드 → Project Settings → API Keys의
   "Publishable key"(또는 anon public key)를 붙여 넣습니다. 이 키는 공개해도 되는 키입니다.
   절대 secret / service_role 키는 넣지 마세요. 키가 비어 있으면 이 기기에만 저장됩니다. */
window.NOTES_DB = {
  url: "https://vwnqvqaviotzmkpltmbm.supabase.co",
  key: ""
};
