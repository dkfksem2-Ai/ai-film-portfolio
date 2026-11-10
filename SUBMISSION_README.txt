AI FILM PORTFOLIO V9.33 - FINAL SUBMISSION (based on v9.32)
===============================================================

[IMPORTANT]
This ZIP contains a COMPLETE static website. After unzipping,
index.html and assets/ must be in the same folder. The ZIP ROOT is
already deployment-ready: no extra AI_Visual_Portfolio_V9.32 subfolder.

1) Local check (Windows): double-click OPEN_LOCAL_EDGE.bat.
   Uses Microsoft Edge. If Python is installed, launches a local web server
   to better match Vercel. Without Python it opens index.html directly,
   which may limit features that need HTTP origin or Internet access.

2) Vercel deployment:
   - Use the EXISTING project connected to the site, not a new project.
   - Replace/upload the unpacked project files at the repository/deploy ROOT.
   - Verify the Vercel deployment has succeeded before sharing the site.
   - Root must contain index.html, favicon.png, favicon.ico, and assets/.
   - Final public URL: https://ai-film-portfolio-psi.vercel.app/

3) Social preview (KakaoTalk, messenger):
   - Browser tab title: JEONG JAEHWAN — AI Film Portfolio
   - og:title: JEONG JAEHWAN — AI Film Portfolio
   - og:image: https://ai-film-portfolio-psi.vercel.app/assets/og-cover-v933.jpg
   - Expected image dimensions: 1200 x 575 JPG (matches user's reference)
   - Once deployed, confirm the image URL opens in an incognito browser.
   - An old KakaoTalk preview may persist due to Kakao caching even
     after a correct redeploy. Use Kakao Sharing Debugger to refresh
     the exact URL; alternatively test a link with ?v=933 appended.
   - Do not expect the local ZIP or an undeployed HTML to alter
     previews of an existing vercel.app URL.

4) Preserved content and known external dependencies:
   - All original v9.32 CSS/JS/HTML, graphics, preview videos, sound files,
     and interactive elements were preserved.
   - The two FULL final MP4 files stay on Vercel Blob through video-config.js.
     They are not bundled and need online access; do not delete Blob files.
   - Remote web fonts/CDN files also require an Internet connection.
   - Missing image edge masks in the v9.32 ZIP were reconstructed
     (assets/v925/mask-0.webp through mask-2.webp) to preserve styling.

5) CHANGES (relative to v9.32):
   index.html: consistent OG/Twitter/canonical metadata + PNG/ICO favicon.
   assets/og-cover-v933.jpg: versioned copy of the confirmed OG cover.
   favicon.png, favicon.ico, apple-touch-icon.png: raster browser icons.
   assets/v925/mask-0.webp, mask-1.webp, mask-2.webp: missing image masks.
   OPEN_LOCAL_EDGE.bat, SUBMISSION_README.txt: local preview/instructions.
   Everything else from v9.32 is unchanged.

NOTE: Browser title & share thumbnail are separate. A Kakao preview works
only when Kakao's scraper can reach the DEPLOYED website and image URLs.
