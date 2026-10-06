# Biodiversity Climate Adaptation Planning Tool

A browser-based form that walks people through the *Distilled adaptation planning* template and exports a finished adaptation report as **Word (.docx)** or **PDF**.

The source template is `Distilled adaption planning DRAFT-v2.docx` (kept internally, not published here).

**Live app:** https://tek-raj.github.io/wet-tropics-adaptation-tool/

## For reviewers

1. Open the live app link above. It works in any modern browser, on a computer or a phone. Nothing is sent anywhere; what you type stays in your browser.
2. Work through the tabs with a real or made-up species. Press the **ⓘ** next to any question to see the instructions, examples and guidance.
3. On the **Summary** tab, press **Draft from earlier tabs** and upload a photo.
4. On the **Export** tab, download the Word and PDF reports.
5. Send feedback on:
   - the layout of the tabs and questions
   - the guidance wording
   - the scoring approach
   - the report format
   - the open decisions listed in [docs/review-notes.md](docs/review-notes.md)

## Using it

Open `app/index.html` in any modern browser (Edge, Chrome, Firefox, Safari). You don't need to install anything or be online. All libraries are bundled in `app/lib/`.

- **Tabs:** Start → Species → Site → Risk assessment → Actions → Scoring → Pathway planning → Summary → Export
- **ⓘ buttons** next to every question open the Instructions / Examples / Guidance panel and a **More information** link.
- **Autosave:** work is saved in the browser as the user types.
- **Save plan file / Open plan file:** saves the whole plan, including the photo, as a `.adaptplan.json` file. Users can reopen it later, move it to another computer, or email it to a colleague.
- **Summary tab:** has a species photo upload and a **Draft from earlier tabs** button that fills the summary boxes from the user's answers. Users can then edit the text.
- **Export tab:** has a completeness checklist and the Word/PDF download buttons.

Data never leaves the user's computer, because there is no server.

## Editing questions, guidance and links

Everything people read is in **`app/js/content.js`**, and you can edit it without touching the app code:

```js
help: { instructions: "", examples: "", guidance: "", moreInfo: "" }
```

- Any empty `instructions` / `examples` / `guidance` shows as *"To be filled"* in the app.
- Put the URL of the matching page on the resource website in `moreInfo`. Until you do, the app shows *"More information — link coming soon"*.
- `links` (at the top) holds the Search list / Hazard maps / Species attribute table / Visualisation tool URLs.
- `resourceSiteUrl` adds a "Resource library" link to the app header.

After editing, refresh the browser.

## Hosting on the website

The `app/` folder is a plain static site. Upload the whole folder to any web host (or a subfolder of the resource website) and link to `index.html`. You don't need a build step.

## Project layout

```
app/
  index.html        page shell
  css/style.css     styles
  js/content.js     ALL questions, guidance, examples, links  <- edit this
  js/app.js         tabs, form logic, autosave, save/open, photo, summary drafting
  js/export.js      Word + PDF report generation
  lib/              docx 9.5.1, pdfmake 0.2.20 (bundled for offline use)
tools/
  make_content_doc.py  builds the content review Word worksheet from content.js
docs/
  review-notes.md   issues found in the Word template + decisions/assumptions
  session-log.md    record of the build sessions
```
