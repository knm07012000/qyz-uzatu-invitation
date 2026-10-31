# Qyz Uzatu — Nargiza

Static invitation page (Kazakh by default, English toggle). RSVPs go to a Google Sheet.

- `index.html`, `style.css`, `script.js` — the page
- `assets/` — images and the `.ics` calendar file
- `backend/Code.gs` — Google Apps Script that writes RSVPs to the sheet

## 1. Google Sheets setup (once)

1. Create a new Google Sheet (any name, e.g. "Nargiza RSVP").
2. **Extensions → Apps Script**. Delete the sample code, paste in `backend/Code.gs`, save.
3. Pick the `setup` function in the toolbar and click **Run**. Approve the permissions (Google shows an "unverified app" warning for your own script: *Advanced → Go to … (unsafe)*). This creates the `Responses` and `Summary` tabs.
4. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy and copy the **Web app URL** (ends in `/exec`).
5. Open `script.js` and paste the URL into `RSVP_URL` at the top.

If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**. The URL stays the same.

Only you (the sheet owner) see the answers. Do not share the sheet link.

## 2. GitHub Pages

Push this folder to a GitHub repo, then **Settings → Pages → Deploy from branch → main / root**. The site will be at `https://<user>.github.io/<repo>/`.

For a link preview in WhatsApp/Telegram, add this inside `<head>` in `index.html` using your real URL (it must be absolute):

```html
<meta property="og:image" content="https://<user>.github.io/<repo>/assets/photo-frame.jpg">
```

## 3. After 26 December 2026

The invitation page stays visible, but the RSVP form is replaced by "Жауап қабылдау аяқталды" after 23:59 on 26 Dec (Almaty). The Apps Script also refuses submissions after that moment, even from a page that was left open. To shut the page down completely, make the repo private or turn off Pages.

## Editing

- Event time and deadline: top of `script.js` and top of `backend/Code.gs`, plus `assets/nargiza-qyz-uzatu.ics`.
- Texts in both languages: the `T` object in `script.js`.
