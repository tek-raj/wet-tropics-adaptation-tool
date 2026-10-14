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


## 2026-10-09: Overview tab and worked example (local only, not yet published)

**New Overview tab, shown first.** It has clickable topics:
- What is climate change? Includes the IPCC AR6 and State of the Climate 2024 figures.
- What are climate hazards?
- Risk, exposure, vulnerability and adaptive capacity, with a clickable Hazard × Exposure × Vulnerability diagram.
- Climate scenarios. An interactive SSP explorer shows warming for 2081–2100 (best estimate and very likely range from IPCC AR6 WGI Table SPM.1), with the Paris 1.5°C and 2°C lines marked.
- The adaptation planning process. Eight clickable steps, each linking to its tab.
- Links to the IPCC reports (Synthesis, WGI, WGII, WGII Chapter 11 Australasia, glossary), CSIRO and BoM State of the Climate, Climate Change in Australia, and the BoM heatwave service. All were checked and return HTTP 200.

**Worked example: spectacled flying-fox.** It sits in an expandable bar with a step drop-down and Previous/Next buttons.
- It covers the plan, site, hazards (heatwaves and cyclones in detail), vulnerability and adaptive capacity, 6 actions with scores (including a deliberately low-scoring misting option to show maladaptation), 4 pathways, and what you can download.
- Buttons download the example as Word (8 pages) or PDF (9 pages), or load it into the tool.
- Verified facts:
  - Endangered under the EPBC Act (uplisted February 2019) and under the Qld Nature Conservation Act 1992.
  - About 23,000 died in the November 2018 Cairns heatwave (above 42°C), about one third of the Australian population.
- The site and scores are labelled illustrative.

**Content files.** The Overview text is in `app/js/overview.js` and the example plan is in `app/js/example.js`.

**Fixes found along the way**
- The page builder now deep-flattens nested element lists.
- In the PDF, the summary poster's padding now shrinks when the boxes are full, so it stays on one page.
- In the PDF, "→" is replaced with "->", because the font has no arrow.


## 2026-10-09: Overview restyled after nesp2climate.com.au (local only)

- The Overview is now a full-width landing page. It runs, top to bottom:
  - a hero banner with a photo, a large title and the "Start your plan" and "See a worked example" buttons
  - a teal intro band
  - "Understanding climate change" photo cards with teal captions; clicking a card opens a detail panel holding the existing text, the risk diagram and the SSP explorer
  - a grey "How adaptation planning works" band with 8 step cards that link to the tabs
  - the worked-example feature card with the expandable example
  - a resources list with document icons
  - a teal footer with an Acknowledgement of Country (wording to be confirmed)
- The style copies the site's look (Open Sans, teal #009db1, short underline accents) but not its logo or branding.
- **Photos.** `app/photos/` holds them, and `photos/README.txt` lists the expected file names. A placeholder shows until each file exists, then the image appears automatically. The names are set in `OVERVIEW.photos` in `overview.js`.
- **App changes**
  - The `h()` helper can now create SVG elements.
  - The panel goes full-width on the Overview, and the status bar and pager are hidden there.


## 2026-10-09: Not Wet Tropics-specific; climate data infographic (local only)

**Tool is for use anywhere, not just the Wet Tropics.**
- Overview text is now location-neutral: hero, band, topic text, resources, and an Australia-wide Acknowledgement of Country.
- In `content.js`, 34 examples were changed to Australia-wide ones (koala, mountain pygmy-possum, hooded plover, Bramble Cay melomys) with bracketed placeholders for places.
- The Climate Change in Australia link now points to the national site instead of the Wet Tropics page.
- The worked example stays, labelled "Case study · Cairns region, Queensland".

**Climate data infographic.** A new Overview section, "Where to get climate data for your site", uses `Images_to_use/climate_projections_infographic-May2026.pdf`.
- The PDF was rendered at 200 dpi to `app/photos/climate-projections-infographic.png`.
- Clickable boxes sit over each of the 9 portal boxes. Positions come from the PDF's own link annotations, and the URLs are the same as in the PDF.
- A text list of the 9 portals (for accessibility and phones), Open/Download PDF buttons, and a credit line are included. The original PDF is copied to `app/resources/`.
- 8 portal links return HTTP 200. Tasmania's recfit.tas.gov.au blocks automated checks (403).

**Still Queensland-specific (structural, not yet changed)**
- The "Conservation status — Queensland" question.
- The Qld recovery plans link.
- The WildNet link on Sightings.
- The Terrain NRM link on Plan title.

- 2026-10-09: The 'How adaptation planning works' step cards no longer jump to a tab. Clicking a step now opens a panel below the cards with: what the step is for, 'What you will do' bullets, a tip, and Previous/Next step buttons. Clicking the same step again closes the panel. The content is in the bout, doing and 	ip fields of OVERVIEW.steps in overview.js.

- 2026-10-09: Scoring now uses a face scale. The criteria drop-downs show 😊 3 Good / 😐 2 OK / 😕 1 Poor / 😞 0 Bad, with the cell coloured green, yellow, orange or red. Culturally acceptable shows ✅ Y / ❌ N. A legend sits above the table, and the 0–3 rubric examples in the ⓘ panels show the matching faces. Numbers are still stored and totalled. Word and PDF scoring cells are colour-filled to match, with a colour key in the note. The scale is configurable in content.js (scoring.scale).

- 2026-10-09: Emoji faces replaced with custom SVG face icons in their own colours: 3 = dark-green smile, 2 = amber flat, 1 = orange frown, 0 = dark-red frown. Each score cell is a 38px face button. Clicking it opens a picker listing the four faces with their labels, plus Clear (Esc or clicking outside closes it). The number shows under each face. The rubric in the ⓘ panels uses coloured dots (🟢🟡🟠🔴). Face colours are set in content.js scoring.scale[].color.

## 2026-10-09: Illustrations and icons (local only)

- **Illustrations.** Six SVG illustrations were drawn in `app/illustrations/`:
  - hero dawn landscape with flying-foxes
  - stylised warming stripes with a thermometer
  - hazard icon grid
  - Hazard/Exposure/Vulnerability = Risk diagram
  - schematic scenario fan chart
  - spectacled flying-fox roosting at dusk
- They show automatically wherever a photo is missing, using `OVERVIEW.illustrations` as the fallback. A real photo in `app/photos/` still takes priority.
- **Icons.** A line icon set is in `app/js/icons.js`: 10 hazard icons and 8 planning-step icons. Hazard icons appear on the Risk assessment cards (coloured tiles), the Overview 'What are climate hazards?' list and the worked-example hazards. Step icons appear on the 'How adaptation planning works' cards and panels. The hazard-to-icon mapping is in `HAZARD_ICONS` and `STEP_ICONS`.

## 2026-10-09: Borrowed infographic replaced with a pinned map (local only)

- The NPCP/NESP infographic image and PDF were removed from the app because of copyright concerns. The original PDF stays in Images_to_use and is not used.
- **New guide image.** `app/photos/data-portal-guide.jpg` is the user's Gemini image, cropped to the title and three panels (global, national, regional). The bottom row was removed because it contained the CSIRO logo, the Commonwealth Coat of Arms and a state crest.
- **Pins.** There are 10 clickable pins: Global (IPCC Interactive Atlas); Australia (Climate Change in Australia); WA, NT, SA, QLD (Long Paddock), NSW and ACT (NARCliM/AdaptNSW), VIC and TAS. NT has no territory portal, so its pin uses national data. Each pin shows a tooltip with the portal name. Positions are set in `OVERVIEW.dataSources.pins` (x/y as a percentage of the image).
- **Portal cards.** Three cards under the map list the Global, National and State/territory portals, so they work on phones and with screen readers.
- **Topic photos.** The Gemini images 'What is climate change' and 'what are hazards' were copied to `app/photos/topic-climate-change.jpg` and `topic-hazards.jpg`, replacing the drawn illustrations on those two cards.

- 2026-10-09: The user's Gemini 'Risk vulnerability and adaptive' image had garbled text, a wrong risk diagram, hazard and exposure merged, management actions shown as adaptive capacity, non-Australian animals and a CSIRO logo. It was replaced with an accurate drawn infographic, `app/illustrations/risk-infographic.svg`, based on the IPCC AR6 WGII risk framework:
  - Hazard, Exposure and Vulnerability cards, with Vulnerability split into Sensitivity and Adaptive capacity
  - a risk 'propeller' diagram
  - 'How adaptation reduces risk': reduce exposure, reduce sensitivity, build adaptive capacity
  It appears at the top of the Risk topic panel on the Overview, with an 'Open full size' link. `ovBody` now supports `{ figure, alt, caption }` items.

- 2026-10-09: **Site photos.** A 'Site photos' card on the Site tab:
  - upload several photos at once (resized to max 1400 px, JPEG 80%)
  - a caption for each, move up/down to reorder, and remove
  - an ⓘ guidance panel (content.js site.photosHelp)
  - photos stored in plan.site.photos and kept in saved plan files
  Reports get an 'Appendix: Site photos' section (Word and PDF) with 'Photo n. caption' under each image, about two per page. There is no appendix when no photos are added.

- 2026-10-09: **Whole app restyled to match the Overview.** A theme block appended at the end of style.css overrides the old green.
  - Single teal accent (#009db1 / #007d8c), dark teal-navy header (#0f3a46), light grey background, white cards with soft shadows, Open Sans everywhere.
  - Headings use the Overview's teal underline accent, with a 'Step n of 7' label on the planning tabs.
  - Flat teal buttons, teal tab underline, hazard icons in a single teal tint, and a dark title bar on the summary sheet.
  - The only other colours are meaningful ones: score faces, priority levels and the 'Excluded' red.

- 2026-10-09: The user preferred the original green, so the app colours were reverted to it (header #1f5f4a, green accents, orange 'filled in' dots). The new layout stays: step labels, underlined headings, white cards, flat buttons and Open Sans. The Overview page keeps its teal NESP-style colours.

- 2026-10-09: **Data portal guide reworked** (photos/data-portal-guide-v2.jpg, built from the user's Gemini image with image processing):
  - The national panel now shows Australia's outline only, with the internal state borders repainted out and the coastline kept, plus a single 'Australia' pin in the centre linking to Climate Change in Australia.
  - The regional panel now shows the map with state and territory borders, replacing the south-east zoom, with the state and territory pins.
  - The Global pin stays on the globe.

- 2026-10-09: On the Risk assessment Vulnerability question, an 'Atlas of Living Australia' link was added after the recovery plan links. Its ⓘ panel now lists WildNet species search (Qld), iNaturalist and Birdata (BirdLife Australia) under 'More information'. Help blocks now support a `links: [[label, url], ...]` list. iNaturalist uses www.inaturalist.org, because the Australian node inaturalist.ala.org.au blocks automated checks.

- 2026-10-09: **Risk assessment hazard cards** now open with a teal title band. The band holds a white icon tile and the hazard name, with a matching drawn scene fading in over the right ~45% via a CSS mask. The 10 scenes are in `app/illustrations/hazards/` (thermometer, heatwave, sun, moon, cyclone, drought, sealevel, flood, fire, other). The scene is picked by the same HAZARD_ICONS mapping, and custom 'Other' hazards keep an editable name inside the band.

- 2026-10-09: The temperature hazard scenes (Increased temperature, Heatwaves, Hot days, Hot nights) were made hotter, with deeper orange skies (Hot nights has a hot orange horizon glow). Each now has the red thermometer, scaled to fit inside the band. The generator script is kept in the session scratchpad; the files are in app/illustrations/hazards/.

- 2026-10-09: **Pathway map (experimental)** at the top of the Pathway planning tab, drawn live from the pathway entries.
  - Each action is a coloured line along a schematic time axis (Now / Near term / Longer term / Future).
  - Now actions start with a dot. Later actions start with a dotted line, then a ◆ trigger.
  - A turning point is a ring. When an improved/additional action is entered, a new branch curves out from the turning point.
  - A stopping point is an end bar; otherwise an arrow shows the action continues. 'Not expected / none / ongoing' counts as continues.
  - Hovering a marker shows its full text, and a legend sits underneath. The map is not yet in the Word/PDF reports.

- 2026-10-09: **TEST TAB 'Pathway builder (test)'** (js/pathbuilder.js plus a CSS block at the end of style.css). It is an interactive adaptation pathways editor.
  - Timeline 2025–2100 with ticks every 20 years and Now / Near term / Longer term bands.
  - Lines are added per action; clicking a line adds a point, and points are dragged along the timeline (whole years; arrow keys also move them).
  - Points are typed as Trigger (blue), Turning point (amber) or Stopping point (red). The line is dashed before a trigger, ends at a stop, and otherwise ends in an arrow.
  - 'Branch a new path' from any point creates a child line with a caption for the alternate/improved action; branches can have their own points.
  - 'Start from my pathway entries' drafts lines from the Pathway planning tab. Data is saved in plan.pathwayBuilder and is not in the reports yet.
  - To remove the test tab, delete js/pathbuilder.js, its script tag in index.html, the TABS line marked TEST TAB in app.js, and the CSS block. The tab is unnumbered and does not change the 'Step n of 7' labels.

- 2026-10-09: **Pathway builder in reports.** When the builder has lines, the Word and PDF reports get a landscape 'Adaptation pathways map' page after Pathway planning. It shows the map rendered to PNG through an off-screen SVG and canvas, a colour key (Trigger blue, Turning amber, Stopping red), and a table of every point and branch (path, point type, year, what to look for). Reports without builder lines are unchanged. Sample files are in `samples/` ('Sample report - pathways map' .pdf and .docx, worked example), local only.

- 2026-10-09: **Pathway builder refinements**
  - Actions use the Actions-tab numbering in bold ('1. …'). Branches are italic, indented 'Alternate path: …'.
  - Lines are thinner (3.5 / 3 / dotted 2.5).
  - Point notes wrap fully, shrinking from 11.5 to a minimum of 9, after which lanes grow. Notes near the edges align away from the labels. Overlapping notes are placed above or below the line using width-aware collision checks, and points with a branch keep their note above.
  - In reports, the map is drawn with fonts ×1.35, so printed text is about 9 pt or more. It is paginated by action (an action is kept with its branches), and each page is labelled 'Adaptation pathways map (n of N)'.
  - After the map pages comes an 'Adaptation pathways: points and triggers' table that groups rows under each action (name shown once, bold) with branches in italics.
  - The sample is `samples/Sample report - pathways map v2` (.pdf/.docx).

## 2026-10-09: Version 2 published as a separate tool

- **Version 1** (unchanged): `app/`, https://tek-raj.github.io/wet-tropics-adaptation-tool/ (the root redirects to app/).
- **Version 2** (draft): `v2/`, https://tek-raj.github.io/wet-tropics-adaptation-tool/v2/
  - It includes all work since 6 October.
  - Its storage keys are `wt-adaptation-plan-v2` and `wt-adaptation-tab-v2`, so V1 and V2 plans don't mix.
  - The header subtitle reads 'Version 2 (draft)'.
- **Local only (gitignored):** `Images_to_use/` (including the borrowed NPCP infographic PDF) and `samples/`.
- **From now on**, develop in `v2/`. `app/` is frozen as V1.

## 2026-10-12: Colleague feedback on V2 (local, not yet published)

- **Regional/LGA scale.** These changes stop the tool assuming a single site:
  - New 'Scale of assessment' question at the top of the Site tab (Site / Property / LGA / Region or catchment / Other).
  - Tab renamed 'Site / area', with the heading 'Site or area details' (also used in the reports).
  - Labels changed to 'Property or area name' and 'Landholder or area contact'; place name, GPS and environment guidance now cover larger areas.
  - New Plan focus option: 'Region or Local Government Area (LGA)'.
  - Overview band, data heading and step 2 wording reworded for site, property, LGA or region.
- **Sightings.** The More information link now goes to the Atlas of Living Australia (it was WildNet). The guidance names the ALA and mentions WildNet as a Qld database with more location data. GBIF was not added, at the user's request.
- **Collaboration question.** Options were offered: (1) merge plan files with conflict review (recommended, small effort, no online storage), (2) workshop mode or Track Changes, (3) real-time co-editing (needs a backend, logins and agreement on online data storage). The user has not chosen yet.

## 2026-10-12: Version 3 with Merge plan files (local only, not published)

- `v3/` is a copy of the latest V2 (including the LGA and ALA fixes) plus `js/merge.js`. It has its own storage keys (`wt-adaptation-plan-v3`) and the label 'Version 3 (draft)'.
- **Merge plan files** (header button and a 'Working together' card on the Start tab): pick one or more .adaptplan.json files to merge into the open plan.
  - Empty boxes are filled automatically.
  - Actions are matched by wording; new ones are added and their scores, pathways and pathway-map lines are carried across.
  - Hazards are matched by name, and site photos are de-duplicated.
  - 'Prepared by' names are combined.
  - Text that is already included is skipped.
  - Differences go to a review screen with Keep mine / Use theirs / Keep both (text, marked '[From name]') / Average (scores, rounded), plus apply-to-all buttons. Cancel is available.
  - A result summary is shown, with Undo merge.
- **Tested** with Alice (worked example) and Ed: different habitat text, a different heatwave priority and a different score, plus a new action, pathway and photo. Re-merging the same file adds nothing, and Undo restores the plan exactly.
- Sample files: `samples/Merge test - Alice.adaptplan.json` and `Merge test - Ed.adaptplan.json`.

- 2026-10-12: **V3 published** at https://tek-raj.github.io/wet-tropics-adaptation-tool/v3/ (commit 0d9ed3e). The full merge test passed on the live site, and V1 and V2 were confirmed unchanged live. The local V2 edits (LGA wording, ALA link) are still unpublished.

- 2026-10-12: V3 (local) gets 'CoastAdapt – sea level rise and coastal climate information' added to the National card under 'Where to get climate data' on the Overview (coastadapt.com.au sea level rise page, HTTP 200). Not yet published.

## 2026-10-13 — V3: climate-risk pathways, new scoring scale, AdaptLog, pre-conditions (local, not pushed)
- Pathway builder and Pathway planning map: x-axis is now climate risk (Low → Moderate → High → Very high → Extreme) with a light-to-dark ramp instead of years. Points store `risk` (0–100); maps saved with years are converted automatically. Editor uses a coloured risk slider. Report map notes and the points table use a "Climate risk level" column coloured by band. Bands/colours are in content.js `pathway.risk`.
- Scoring: 3 = good, 2 = OK, 1 = bad, 0 = unknown / limited information (grey face with a wavy mouth and raised eyebrow). Unknowns add nothing and are counted next to each total (app and reports).
- Culturally acceptable is no longer a filter. It is now "Cultural considerations" (Supported / To be discussed / Concerns raised) in the last column, not scored; the reports do the same.
- Actions tab: AdaptLog (CSIRO) box with link https://adapt-log.csiro.au/; also linked from potential-actions help and the "Effective" criterion.
- Pathway planning: new "Pre-conditions (enabling conditions)" field, which also appears in the reports and the worked example. Overview step texts updated.
- Example: old 0 scores (which meant "worst") changed to 1; one unknown added (action 4 social) and one "To be discussed" (action 6).
- Tests: v3 e2e, builder, merge and report renders (PDF and Word) pass.
## 2026-10-13 (later) — V3 scoring: cultural acceptability wording and wide guidance panel (local, not pushed)
- The cultural column is now "Cultural acceptability" (to consider, not scored), with the options Acceptable / May raise concerns / Not acceptable / Unknown, coloured green / amber / red / grey like the score faces. The person filling in the form makes the judgement; the help explains each option.
- Rows marked "Not acceptable" get a red edge and a "Not culturally acceptable" flag under the score. They are flagged, not excluded.
- The summary draft lists Not acceptable, May raise concerns, and Unknown ("Check with Traditional Owners") actions. The reports use the same labels and colours. Merge review shows labels, not codes. Older "D" (to be discussed) values are read as Unknown.
- Scoring column ⓘ: guidance now opens in one full-width panel above the table (title and Close button). Only one is open at a time; clicking the same ⓘ again closes it.
## 2026-10-14 — V3 worked example: summary photo and pathway map (local, not pushed)
- The worked-example summary poster uses the watercolour of a spectacled flying-fox mother and pup. It is saved as v3/photos/example-flying-fox.jpg (1200 px, 200 KB), which the Overview's case-study card also uses. It is also embedded in js/example-photo.js so the example works when the tool is opened from a file. Caption: "Spectacled flying-fox mother with her pup (illustration)"; credit left blank.
- The example now has a pathway map: 4 action lines and 5 branches placed on the climate-risk axis, including a "last resort" misting branch at extreme risk. It shows read-only in the worked-example viewer (step 6, via PathBuilder.preview()), in the example Word/PDF downloads (map pages and the points table), and in the tool when the example is loaded.
- Report fix: the first map page reserves room for the note, so the colour key no longer spills onto an extra page.
## 2026-10-14 — V3 Start tab: no "More information" line (local, not pushed)
- On the Start tab's guidance panels (tab overview, Plan title, Plan focus, Purpose, Prepared by, Organisation, Date), the "More information" line is removed; Instructions, Examples and Guidance stay. This includes the Terrain climate link on Plan title.
- Content rule: moreInfo "" = "link coming soon"; moreInfo null = no link line. Other tabs are unchanged.
## 2026-10-14 — V3 Species links and "More information" pop-up (local, not pushed)
- Ecosystem and habitat ⓘ: added TERN EMSA threatened species literature reviews (https://emsa.tern.org.au/threatened-species-resources#Literature-Reviews), alongside the DCCEEW recovery plans link; the guidance text mentions TERN.
- Species name ⓘ: added links to ALA species search (bie.ala.org.au), WildNet species search (Qld), iNaturalist species search, and EPBC species profiles (SPRAT). The guidance suggests searching them to confirm the common and scientific names.
- "More information" across the tool: one link opens directly; several show a "More information (n links) ▾" button that opens a pop-up list (link name and website). It closes on Escape or a click elsewhere. This replaces the old inline row of extra links.
## 2026-10-14 — V3: Strategy for Nature link and state/territory status (local, not pushed)
- Australia's Strategy for Nature 2024–2030 (NBSAP), https://www.dcceew.gov.au/environment/biodiversity/conservation/strategy: added as the More information link and a guidance line on Species → "Why is it important?" (national target to reduce climate change impacts on biodiversity). Also added on the Overview: a sentence and link in "The adaptation planning process", and a card in Resources.
- Species tab: new "State or territory" picker (8 jurisdictions). The Queensland status question is now "Conservation status — State or territory (Threatened species list)", with a "Search lists (8) ▾" pop-up and the same 8 links in its ⓘ: ACT, NSW BioNet, NT Classification of wildlife, Qld list, SA, Tas, Vic FFG Threatened List, WA DBCA. The URLs were checked in a browser; Vic and NT show a security check first. The field id stays "qld" so older plan files load. Reports and the example read "<State>: <status>"; the example uses Queensland.
- Links pop-up flips to the left when it would run off the right edge of the screen.
## 2026-10-14 — V3 Species/Site "More information" links (local, not pushed)
- No link line: Species → Existing monitoring of the species; Site → Property or area name, Landholder contact, Existing management plan(s), Existing monitoring at the site, Photo monitoring points, Reason for assessment, People present.
- Site → Scale, Place name, GPS: link to the interactive climate hazard map (tek-raj.github.io/public/index_long.html).
- Site → Description of environment: pop-up of 9 vegetation mapping links: NVIS (national), ACTmapi, NSW State Vegetation Type Map, NT NR Maps, Qld Regional ecosystems, SA NatureMaps, Tas TASVEG, Vic NatureKit (EVCs), WA Pre-European vegetation (DPIRD). The guidance names each state's vegetation code type.
- A question with a single named link now shows "More information: <name> ↗".
## 2026-10-14 — V3 Risk assessment links and EPBC link (local, not pushed)
- Species → EPBC status ⓘ: "More information: EPBC species profiles (SPRAT)".
- Risk assessment: no "More information" line in any ⓘ panel (tab and all four questions). moreInfo: null now hides the line even when extra links are listed; the impact question's unused link list was removed.
- Exposure question: the Qld-only "Hazard maps" link is now a "Hazard maps (10) ▾" pop-up with national portals (Climate Change in Australia, Australian Climate Service) and each state/territory portal (ACT/NSW NARCliM, NT national data, Qld Future Climate Dashboard, SA viewer, Tas, Vic Future Climate Tool, WA). Same sources as the Overview. "Interactive climate map" is kept.
- Links pop-ups are now positioned against the window, so cards can't clip them. They open above the link when there is more room there, scroll inside if long, and close on scroll, resize, Escape or a click elsewhere.
## 2026-10-14 — V3: links made useful for all states and territories (local, not pushed)
- content.js now defines two shared lists at the top, STATE_RECOVERY_PLANS and STATE_SPECIES_RECORDS (8 jurisdictions each). Recovery plans: ACT action plans, NSW Saving our Species, NT, Qld, SA, Tas Threatened Species Link, Vic FFG Action Statements, WA DBCA. Species records: Canberra Nature Map, NSW BioNet, NT NR Maps, Qld WildNet, SA NatureMaps, Tas Natural Values Atlas, Vic Biodiversity Atlas, WA Dandjoo.
- Risk → Vulnerability (impact): "Recovery plans (Qld)" is replaced by pop-ups "State and territory recovery plans (8)" and "State and territory species records (8)". Recovery plans (Federal) and ALA are kept. The column `popups` format also drives Hazard maps.
- Species name ⓘ: ALA, iNaturalist, EPBC + 8 state databases (11). Sightings ⓘ: ALA, iNaturalist + 8 state databases (10). The guidance no longer names WildNet alone.
- Overview → "What are climate hazards?": the Qld dashboard link is replaced by Climate Change in Australia and the ACS hazards viewer, with a sentence pointing to the state portals.
- Removed the unused Qld-only keys from C.links (qldSearch, hazardMaps, recoveryPlansQld, speciesRecords).
- Kept on purpose: the Cairns worked example, the Wet Tropics interactive map (labelled as such), and the Qld entries inside the all-state lists.
## 2026-10-14 — V3: species records list moved (local, not pushed)
- Risk → Vulnerability: removed the "State and territory species records" pop-up; only "State and territory recovery plans (8)" remains there.
- Species → Existing monitoring of the species: its ⓘ now has "More information (8 links)", the state and territory species databases, plus a guidance line.
## 2026-10-14 — V3 Scoring and Pathway planning help (local, not pushed)
- Scoring: every "More information" line removed (tab, cultural acceptability, all 7 criteria, including AdaptLog on Effective).
- Scoring tab ⓘ Examples: totals from the spectacled flying-fox example, plus a "See this step of the worked example ›" button. It opens a pop-over with worked-example step 5, which now also has a full colour-coded scoring table (7 criteria, total, cultural acceptability) in both the pop-over and the Overview viewer.
- Pathway planning tab ⓘ Examples: three flying-fox pathways (pre-conditions, risk-level triggers and turning points), plus a button that opens worked-example step 6 with the risk-axis map.
- Pathway planning: empty link lines removed from all 8 fields. The tab ⓘ links to the AdaptNRM "Adaptation Pathways: a playbook…" (RMIT repository) and the CSIRO article "Pathways to prepare for and manage global change".
- New content option: help.exampleStep: "<step id>" adds the worked-example button to an ⓘ panel.
## 2026-10-14 — V3 Actions tab: empty link lines removed (local, not pushed)
- Removed the empty "More information" line from the Actions tab ⓘ, Existing actions, and "How does this help…". Potential actions keeps its AdaptLog link.

## 2026-10-14 — V3 Pathway builder (test tab): pathway map merged with the Pathway planning form (local, not pushed)
- Clicking a line (or its name) now opens that action's full Pathway planning form below the map: When, Pre-conditions, goals, Trigger, Turning point, Improved/additional action, Stopping point, with the same ⓘ help. It edits the same plan.pathway entry as the Pathway planning tab (matched by action, or by typed name). A new entry is created only once something is typed.
- A line click no longer drops a point. The form has "+ Trigger / + Turning point / + Stopping point" buttons that add the point at the risk level where the line was clicked. The point editor has "Open the pathway form ›" to go back.
- Branch (alternate path) lines keep their caption editor and the add-point buttons.
- New AppAPI.pathwayForm(entry, onChange) builds the shared form. Banner and intro text updated.
- Still separate: point notes on the map and the Trigger/Turning/Stopping text in the form.
## 2026-10-14 — V3: Pathway builder is now the Pathway planning tab (local, not pushed)
- The old Pathway planning tab (card list + schematic map: R.pathway, pathwayMap, pathwayMapCard) is deleted. The builder is now tab 6 "Pathway planning" (tab id "pathway"), with content.js pathway title/intro/ⓘ help. The "(test)" tab and its banner are gone. A saved tab of "pathbuilder" opens Pathway planning.
- Each line opens the action's pathway form (all 8 fields). Any pathway entry without a line gets one automatically, so older or merged plans keep all their details.
- Toolbar: "+ Add action line", "+ Add a line for every action (n)", "Draft the map from the pathway details" (rebuilds points from the text, with a confirmation).
- Deleting an action line also deletes its pathway details (confirmation names both). Changing a line's action or typed name carries the details along.
- Intro, ⓘ instructions and Overview step text updated. Reports unchanged: pathway table from plan.pathway, map pages from the lines.
- Tests updated (e2e, builder, form, help, example, report, merge): all pass.
## 2026-10-14 — V3 summary poster photo fits the portrait photo box (local, not pushed)
- The poster's photo box is about 3:4 (portrait). By default the photo is cropped to 3:4 when the report is made (export.js posterPhoto), so landscape photos fill the box instead of shrinking to a strip. Word maxW 190 × maxH 254; PDF fit [165, 220].
- Summary tab: the photo preview is a 3:4 frame matching the poster, with "Fill the photo box (crop)" / "Show the whole photo" and a "Crop position" slider (left↔right for wide photos, top↕bottom for tall ones). Stored as summary.photo.fit and summary.photo.pos; a new upload resets pos to 50.
- Worked example photo: fit "fill", pos 57 (centred on the mother and pup).
- Photo ⓘ guidance explains the crop; its empty link line is removed.
## 2026-10-14 — V3 renamed from "Site Assessment" to a planning tool; V3 pushed
- Header subtitle: "Planning Tool · Version 3 (draft)" (was "Site Assessment"). Report page header: "Biodiversity Climate Adaptation Plan". Date and People present instructions now say "site visit or planning workshop". A separate site assessment tool will be developed later.
- Committed and pushed V3 and this log. The V2 changes (LGA wording, ALA link) are still local only.
## 2026-10-14 — V3 Species tab generalised to species or ecosystem; pushed
- The user decided V3 is the only working version from now on (V1 and V2 are left as they are).
- Tab "Species / ecosystem", title "Species or ecosystem details". Labels: "Species or ecosystem name", "Habitat, ecosystem and key needs", "Existing monitoring of the species or ecosystem", "Conservation status — State or territory (Threatened species or ecological community list)". Instructions, examples and guidance cover ecosystems (Mabi forest, coastal saltmarsh, alpine bogs, regional ecosystem / plant community type codes), with an EPBC threatened ecological communities link (DCCEEW). The Qld note covers regional ecosystem biodiversity status.
- Elsewhere: Start plan focus adds "Ecosystem or ecological community"; Site "Sightings or records of the species or ecosystem"; Risk impact and priority labels; the Actions "How does this help the species or ecosystem…" label (app and reports); the Summary placeholder; the Overview step; the report section heading now uses the tab title.
- Field ids unchanged (species.name, habitat, …), so plan files still load. Tests pass.
## 2026-10-14 — Site assessment app (free, offline) + import into the planning tool (local, not pushed)
- User chose option C: teams with Fulcrum keep using it; teams without it use a free offline app. Both feed the planning tool.
- New folder site-assessment/: an installable web app (PWA). It needs no App Store or developer account: Safari → Share → Add to Home Screen, or Android "Install app". The service worker (sw.js, cache "site-assessment-v1") keeps it working offline and updates in the background. Assessments are stored in IndexedDB (storage persistence requested). The form follows the site assessment template (Date; Part 1; Optional seasonal calendar), with questions and ⓘ help taken from v3/js/content.js (site.fields), GPS from the device (accuracy shown), photos (camera or library, resized to 1600 px, with captions), autosave, a "Not saved to a file yet" badge, and Save / share file (Web Share, or download) as *.siteassess.json. "Open a file" loads a saved file back in. Icons in site-assessment/icons/.
- Planning tool (v3): Site tab gains "Date of site assessment" (assessDate) and "Current condition" (condition); both appear in the reports automatically. Content adds siteAssessment (sections, file format, Fulcrum data names). New js/siteimport.js puts an "Import a site assessment" card on the Site tab. It reads the app's file, or a Fulcrum GeoJSON/CSV export plus its photo files (photos matched by id; captions from <photo field>_caption; GPS from the record location). If there are several records, it asks which one. It goes through MergeTool.mergePlans (new), so empty boxes are filled, photos added, differences reviewed, with Undo import.
- docs/fulcrum-site-assessment.md: the Fulcrum form set-up (field types and data names), and how to export and import.
- Tests (local server, phone-sized Edge): offline reload keeps data, GPS, photo and caption, file save; import fills 7 boxes + photo; conflict review; Fulcrum GeoJSON with 2 records and 2 photos; CSV with quoted multi-line text. V3 regression tests pass.
- Not yet tested on a real iPad/iPhone/Android, or against a real Fulcrum export.- Pushed for testing on iPad/iPhone/Android (user approved).
