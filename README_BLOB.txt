AI FILM PORTFOLIO — VERCEL BLOB TWO-VIDEO UPDATE
===================================================
1) Existing Vercel Project > Storage > Create Database > Blob > Public store.
2) Open the store > Browser/Files > Upload (button label may vary) > upload your two MP4s.
3) Copy PUBLIC file URL for each MP4 (https://...public.blob.vercel-storage.com/...).
4) Open video-config.js in Notepad; paste the URL inside the quotes after memory and tumgo. Save with Ctrl+S.
5) Upload this entire unpacked website root to an existing GitHub repository connected to the ORIGINAL Vercel project. Do NOT create a new Vercel project.
6) Wait for Vercel deployment to complete and open your existing site's public URL. Visit WORKS > VIEW FILM and play both videos.
7) The two 5-second TEST previews under assets/previews are independent and remain unchanged by this configuration.
8) If the MP4 lengths differ from storyboard durations, timeline seek positions need checking.
DO NOT PUT A BLOB READ-WRITE TOKEN INTO HTML OR JAVASCRIPT. URLs for PUBLIC video files only.
Original video files are not inside this ZIP; they remain stored in Vercel Blob.
