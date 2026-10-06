# Session log

## 2026-09-28: Project set-up and first build

**Request (paraphrased):** Create a new project. The Word document (`Distilled adaption planning DRAFT-v2.docx`) is an adaptation planning template. Build a browser-based app so people can fill it in and produce an adaptation report:

- one tab for each component of the template
- an **i** button on each question with instructions, examples and guidance, showing a "to be filled" placeholder where the content doesn't exist yet
- a **More information** option on each question, linking to the resource website that is being built (the links will be added later)
- export of neat **Word and PDF** files built from the tabs
- a final **summary page** like the one in the template, with a species photo upload
- a review of the template to find the problems and what needs doing

**What was done:**

1. Took the template apart. It has 6 pages: Species, Site, Risk assessment, Existing/potential actions, Scoring table, Pathway planning, and a one-page Summary poster made of text boxes. Pulled out the hyperlinks (EPBC SPRAT, Qld Power BI list, Long Paddock hazard maps) and Diane Jarvis's two reviewer comments.
2. Built a static, offline-capable web app in `app/`:
   - It has 9 tabs, ⓘ guidance panels, More-information links and autosave.
   - Plans can be saved and opened as files, and a GPS "use my location" button fills in coordinates.
   - Actions link automatically to the scoring and pathway tabs, and scores add up for you.
   - The Summary tab has a photo upload and a "Draft from earlier tabs" button.
   - Word (.docx, via docx.js) and PDF (via pdfmake) exports follow the template layout. The action, scoring and pathway pages are landscape.
3. Tested end-to-end in headless Edge. Filled in every tab, uploaded a photo, and exported both formats. Opened the .docx in Word and checked the page rendering: 6 pages, no errors, no horizontal scroll at phone width. An empty plan also exports cleanly.
4. Wrote down the template problems and assumptions in `docs/review-notes.md`.

**Open items:** see the "Needs a decision" table in `docs/review-notes.md`. Guidance and example text, and the resource-site URLs, still need to be written into `app/js/content.js`.

## 2026-09-28: Update 1

- **Dates are now Australian (DD/MM/YYYY).** Browsers show the native date box in the computer's region format, which was US on this machine. It's replaced with a DD/MM/YYYY text box and a calendar button. Short forms such as 5/3/26 are accepted, and impossible dates like 31/02 are rejected. The date is still stored as YYYY-MM-DD. Reports print it as "28 September 2026".
- **Culturally acceptable is now a filter on the Scoring tab.** The other criteria are greyed out until it is set to Y. Choosing N excludes the action: the row shows "Excluded" in red, the Actions tab shows "Not culturally acceptable", and the reports show "Excluded". Scores already entered are kept, so switching back to Y brings them back.

## 2026-09-28: Content worksheet for colleagues

- Created `docs/Adaptation tool - content to complete.docx` (28 pages, A4). It is a Word worksheet the team can share to write the missing content. It contains:
  - how to fill it in and a contributors table
  - Part A: decisions still needed on the template
  - Part B: every link, with its current address and a box for the confirmed or new address
  - Parts C–J: one table per question, tab by tab, with Instructions / Examples / Guidance / More information link. Existing text is pre-filled in white, and empty boxes are yellow.
  - Part K: other comments
- Each table has a grey `ID:` code, e.g. `species.habitat` or `risk.impact`, that matches `content.js`. **Next step:** write an importer that reads the completed .docx back into `content.js` automatically.
- To regenerate the worksheet after the content changes: export `window.APP_CONTENT` to JSON, then run `python tools/make_content_doc.py content.json "docs/Adaptation tool - content to complete.docx"`. This needs `python-docx`.

## 2026-09-28: Contributor feedback actioned; guidance written

**Feedback from the v1 worksheet, and what was done about it**

| Feedback | Action |
|---|---|
| The visualisation tool is the interactive map at tek-raj.github.io | Linked on the Site tab, and as "Interactive climate map" next to Hazard maps. |
| Add CoastAdapt for sea level rise | Linked on the Sea level rise hazard card, using the new `hazardLinks` option. |
| The species attribute table is not published yet, so point to recovery plans | The Vulnerability column links to the Federal (DCCEEW) and Qld recovery plan lists. The attribute table link takes over when its URL is added. |
| Start tab: examples of plan type (single species, group, hazard, site) | Added a **Plan focus** drop-down and a **Purpose of the plan** question. Both are printed on the report cover. |
| Link Plan title to the Terrain climate plan | Linked to terrain.org.au/what-we-do/climate/. |
| EPBC and Qld search links confirmed | Kept. |
| Contributors table needs instructions | Added. |

**Guidance written**
- Instructions, examples and guidance are written for every question in `app/js/content.js`. This includes a definition for each 0–3 level of the 7 scoring criteria and a Very low–Very high priority scale.
- Examples use published Wet Tropics cases: the spectacled flying-fox 2018 heatwave, cassowaries after cyclones Larry and Yasi, and the lemuroid ringtail possum heat limit.
- Added "More information" links to trusted external sources. Every link was checked and returns HTTP 200: WildNet, CSIRO seasonal calendars, Climate Change in Australia Wet Tropics, and recovery plans. The EPBC SPRAT link blocks automated checks but the user confirmed it.

**App changes**
- Several links per question or section (`links: [[key, label], ...]`). Links with no address are hidden.
- Guidance panels keep line breaks and stack their columns when space is narrow.

**New worksheet**
- `docs/Adaptation tool - content review v2.docx` is 9 pages, down from 28. It contains:
  - what changed
  - Part A: open decisions
  - Part B: 2 missing links and 8 added links to confirm
  - Part C: 10 suggested resource-website pages
  - Part D: 10 drafts that need local, cultural or project review
  - Part E: other comments
- The v1 worksheet with the team's comments is kept as a record.

## 2026-10-06: Published to GitHub for manager review

- **Public repository:** https://github.com/tek-raj/wet-tropics-adaptation-tool
- **Live app (GitHub Pages, served from the root of `main`):** https://tek-raj.github.io/wet-tropics-adaptation-tool/
  - The root `index.html` redirects to `app/`.
- **Kept off GitHub by `.gitignore`:** all `.docx` files, i.e. the draft template and both team worksheets. They stay local only.
- The README has a "For reviewers" section explaining how to test the tool and what feedback is wanted.
