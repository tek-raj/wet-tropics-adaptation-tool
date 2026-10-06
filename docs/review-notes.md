# Review of `Distilled adaption planning DRAFT-v2.docx`

These are problems found in the template while turning it into the app, how the app handles each one for now, and what still needs a decision.

## Needs a decision from the project team

| # | Issue in the template | What the app does for now | Decision needed |
|---|---|---|---|
| 2 | **The scoring direction is undefined for Cost and Risk.** For these a high score could mean "bad", which would break the total. | Assumes 3 = most favourable (lowest cost, lowest risk). This is shown in the app and printed in the report. | Confirm. |
| 3 | **The Summary page needs Actions NOW / LATER, but nothing in the template records now vs later.** | Added a **"When: Now / Later"** field to each pathway. | Confirm, or say where this should come from. |
| 4 | **The Summary page needs "Cultural considerations", but no question collects them.** The only related items are "Why is it important?" and the Y/N culturally acceptable score. | The summary draft pulls in "Why is it important?" and any actions scored N. Users edit the text. | Consider adding a dedicated cultural considerations question (Species or Site tab). |
| 5 | **Conservation status checkboxes can be ticked in contradictory ways**, and a single "Not listed" covers both lists. The Qld list also has categories the template leaves out (e.g. Near threatened, Special least concern). | Each list (Federal, Qld) is one choice with its own "Not listed". | Confirm the category lists. |
| 6 | **"Existing monitoring" is asked twice** (Species and Site). | Kept both, relabelled "…of the species" and "…at the site". | Keep both, or merge? |
| 7 | **The hazards overlap:** increased temperature, heatwaves, hot days and hot nights. "Hot nights" was defined as *days* above 20°. | Kept all of them. Corrected the text to "nights above 20°C" and added °C. | Confirm the hazard list and thresholds. |
| 8 | **Links are missing:** `<link to visualisation tool>` is a placeholder, and "Species attribute table" has no link. | Both show "link coming soon". The URLs go in `content.js → links`. | Supply the URLs. |
| 9 | **Some existing links may be stale.** The EPBC search link uses the old `environment.gov.au/cgi-bin/sprat` address. The Qld "Search list" is a Power BI dashboard link. | Links are kept as they are in the template. | Check they still resolve and are the intended permanent links. |
| 10 | **No guidance or examples exist yet** beyond two e.g. notes. | Every ⓘ panel shows "To be filled". | Write the content in `content.js` as the resource site is built. |

## Fixed in the app (no decision needed)

- **Scoring (decided 2026-09-28):** "Culturally acceptable" is a **filter**. The other criteria unlock only when it is **Y**. Actions marked **N** are excluded and get no score. Actions marked Y are scored on 7 criteria at 0–3 each, giving a total out of 21.

- **Fixed row counts** (4 existing actions, 6 potential, 10 scored, 5 pathways) are replaced by add/remove rows. There is no limit.
- **"Action (from previous page)"** is now a dropdown of the actions already entered. Scoring rows and pathway choices follow the Actions tab automatically, and the score total is calculated for you.
- The **"Existing Action Assessment"** heading covered both existing and potential actions, so it has been renamed "Action assessment".
- **"Steps the animal can take"** now reads "steps the species can take", because plants are in scope too.
- **Priority** ("very low to very high") is now a colour-coded 5-level dropdown.
- **Plan details are captured on a Start tab:** title, prepared by, organisation and date, which the template did not ask for.
- Diane Jarvis's reviewer comments are addressed: the examples are added to "Why is it important?", and the missing word in "How is the species impacted…" is fixed.
- **The template's title "Site Assessment"** is kept as the subtitle and report header. You can change it in `content.js`.
