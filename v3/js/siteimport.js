/*
 * IMPORT A SITE ASSESSMENT (Site tab)
 * Reads a site assessment collected in the field and adds it to the open plan's Site tab:
 *   - a file saved by the Site assessment app version 2 (../site-assessment/v2/, *.siterecord.json):
 *     its answers fill the Site tab boxes (extra answers from the recording sheet are added, labelled, under them),
 *   - a file saved by the first Site assessment app (../site-assessment/, *.siteassess.json), or
 *   - a Fulcrum export: the GeoJSON (.geojson/.json) or CSV file, plus the photo files (.jpg) from the export.
 * Field names are in content.js (siteAssessment.fulcrum). Empty boxes are filled; where the plan already has
 * different text, the merge review screen lets the user choose. Everything happens in the browser.
 */
(function () {
  "use strict";
  const A = () => window.AppAPI;
  const h = (...a) => A().h(...a);
  const C = () => window.APP_CONTENT;
  const SA = () => C().siteAssessment;
  const SR = () => window.SITE_RECORDING;   // the version 2 app's form (../site-assessment/v2/form.js)

  /* ---------- reading files ---------- */
  const isImage = f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic)$/i.test(f.name);
  const key = s => String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  // A small CSV reader (quoted fields, commas and line breaks inside quotes)
  function parseCSV(text) {
    text = text.replace(/\r\n?/g, "\n");
    const rows = []; let row = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') q = false;
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    const head = (rows.shift() || []).map(x => key(x.replace(/^﻿/, "")));
    return rows.filter(r => r.some(v => String(v).trim())).map(r => Object.fromEntries(head.map((k, i) => [k, r[i] == null ? "" : r[i]])));
  }

  // Fulcrum record (an object of data name -> value) to { site, photoIds, captions, title }
  function fromFulcrum(rec, lat, lon) {
    const F = SA().fulcrum, props = {};
    Object.entries(rec).forEach(([k, v]) => { props[key(k)] = v; });
    const site = {};
    Object.entries(F).forEach(([id, dn]) => { if (id === "photos") return; const v = props[key(dn)]; if (v != null && String(v).trim()) site[id] = String(v).trim(); });
    if (site.assessDate) site.assessDate = toISODate(site.assessDate);
    lat = lat != null ? lat : props.latitude; lon = lon != null ? lon : props.longitude;
    if (!site.gps && lat !== undefined && lat !== "" && lon !== undefined && lon !== "") site.gps = Number(lat).toFixed(5) + ", " + Number(lon).toFixed(5);
    const pf = key(F.photos);
    const split = v => String(v || "").split(/\s*[,|]\s*/).map(x => x.trim()).filter(Boolean);
    const photoIds = split(props[pf]);
    const capList = split(props[pf + "_caption"] || props[pf + "_captions"]);
    return { site, photoIds, captions: capList.length === photoIds.length ? capList : [],
      title: [site.placeName || "Unnamed site", site.assessDate].filter(Boolean).join(" – ") };
  }
  const toISODate = v => {
    const s = String(v).trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return m[1] + "-" + m[2] + "-" + m[3];
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (m) return m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0");
    return s;
  };

  /* ---------- files from the Site assessment app version 2 ---------- */
  const filled = v => Array.isArray(v) ? v.some(filled) : v && typeof v === "object" ? Object.values(v).some(filled) : !!(v && String(v).trim());
  const fmtDate = iso => { const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : (iso || ""); };
  // One answer as text, as the app prints it (tick boxes and choices by their labels, with any details)
  function answerText(f, D) {
    const v = D[f.id];
    if (f.type === "yesno") return v === "yes" ? "Yes" : v === "no" ? "No" : "";
    if (f.type === "choice") { const o = f.options.find(x => x[0] === v); if (!o) return ""; const x = String(D[f.id + "_other"] || "").trim(); return v === "other" && x ? "Other (" + x + ")" : o[1]; }
    if (f.type === "checks") {
      const sel = Array.isArray(v) ? v : [];
      return f.options.filter(o => sel.includes(o[0])).map(([k, l]) => { const x = String(D[f.id + "_" + k] || "").trim(); return x ? l + " (" + x + ")" : l; }).join("; ");
    }
    if (f.type === "date") return fmtDate(v);
    return typeof v === "string" ? v.trim() : "";
  }
  const fieldsOf = def => Object.fromEntries(def.sections.flatMap(sec => sec.fields).map(f => [f.id, f]));

  // The app's answers -> the plan's Site tab boxes. Questions marked plan: "<box>" in the app's form.js fill
  // that box; the recording sheet's other answers are added, labelled, under the closest box
  // (e.g. landform and vegetation under "Description of environment").
  function siteFromRecording(d) {
    const FD = fieldsOf(SR()), ans = id => FD[id] ? answerText(FD[id], d) : "";
    const lines = pairs => pairs.filter(([, v]) => v && String(v).trim()).map(([l, v]) => l + ": " + String(v).trim()).join("\n");
    const site = {}, put = (k, ...parts) => { const v = parts.map(x => String(x || "").trim()).filter(Boolean).join("\n"); if (v) site[k] = v; };
    // the questions that match a Site tab box one to one
    Object.values(FD).filter(f => f.plan).forEach(f => put(f.plan, f.type === "date" ? d[f.id] : f.type === "choice" ? d[f.id] : ans(f.id)));
    // boxes built from more than one answer
    put("placeName", [d.siteNo && "Site " + d.siteNo, d.siteName].filter(Boolean).join(" – "));
    put("environment", d.environment, lines([["Site description", d.siteDescription], ["Site type", ans("siteType")], ["Site components", ans("components")],
      ["Landform", ans("landform")], ["Land tenure", ans("tenure")], ["Vegetation", d.vegetation], ["Vegetation type", ans("vegType")],
      ["Known bush tucker plants near the site", d.bushTucker], ["Local geology", d.geology], ["Nearest water source", d.water],
      ["Map", d.map], ["How to get there", d.access]]));
    put("condition", d.condition, lines([["Current impacts/activities", d.currentImpacts], ["Potential future impacts", d.futureImpacts]]));
    put("mgmtPlans", d.mgmtPlan, lines([["Management plan (earlier recording)", d.prevMgmtPlan], ["Management options/recommendations", d.recommendations]]));
    put("photoPoints", d.photoPoints, d.photoNumbers && "Photo numbers (other camera): " + d.photoNumbers);
    put("people", d.people, lines([["Recorder", d.recorder], ["Traditional Owner group", d.toGroup], ["Elders", d.elders],
      ["Area under Native Title claim", [ans("nativeTitle"), d.nativeTitleWho].filter(Boolean).join(" – ")],
      ["Site previously recorded by", d.prevWho], ["Earlier information held at", d.prevInfoHeld]]));
    if (site.scale && !(C().site.fields.find(f => f.id === "scale") || { options: [] }).options.includes(site.scale)) delete site.scale;
    return site;
  }

  function fromRecordingFile(j, fileName) {
    const d = j.data || {};
    const siteDone = Object.keys(d).some(k => k !== "dateRecorded" && filled(d[k])) || (j.photos || []).length > 0;
    const name = [d.siteNo ? "Site " + d.siteNo : "", d.siteName].filter(Boolean).join(" \u2013 ") || "Unnamed site";
    return { kind: "recording", source: "Site assessment app v2 (" + fileName + ")",
      site: siteDone ? siteFromRecording(d) : {}, photos: siteDone ? (j.photos || []) : [],
      title: [name, d.dateRecorded].filter(Boolean).join(" \u2013 ") };
  }

  // Read the chosen files into a list of candidate records
  async function readRecords(files) {
    const data = files.filter(f => !isImage(f)), images = files.filter(isImage);
    const recs = [];
    for (const f of data) {
      const text = await f.text();
      if (/\.csv$/i.test(f.name)) {
        parseCSV(text).forEach(r => recs.push({ kind: "fulcrum", source: "Fulcrum (" + f.name + ")", ...fromFulcrum(r) }));
        continue;
      }
      let j; try { j = JSON.parse(text); } catch (e) { throw new Error(f.name + " is not a site assessment file, a Fulcrum GeoJSON export or a CSV export."); }
      if (j && SR() && j.format === SR().fileFormat) {
        const r = fromRecordingFile(j, f.name);
        if (!Object.keys(r.site).length && !r.photos.length) throw new Error(f.name + " has nothing filled in yet.");
        recs.push(r);
      } else if (j && j.format === SA().fileFormat) {
        recs.push({ kind: "app", source: "Site assessment app (" + f.name + ")", site: { ...(j.assessment || {}) }, photos: j.photos || [],
          title: [(j.assessment || {}).placeName || "Unnamed site", (j.assessment || {}).assessDate].filter(Boolean).join(" – ") });
      } else if (j && (j.type === "FeatureCollection" || j.type === "Feature")) {
        (j.type === "Feature" ? [j] : j.features || []).forEach(ft => {
          const c = ft.geometry && ft.geometry.type === "Point" ? ft.geometry.coordinates : null;
          recs.push({ kind: "fulcrum", source: "Fulcrum (" + f.name + ")", ...fromFulcrum(ft.properties || {}, c ? c[1] : undefined, c ? c[0] : undefined) });
        });
      } else if (j && j.species && j.risk) {
        throw new Error(f.name + " is a plan file. Use “Merge plan files” at the top of the page for plan files.");
      } else throw new Error(f.name + " is not a site assessment file or a Fulcrum export.");
    }
    // Fulcrum photos: match the photo ids in the record to the chosen image files
    for (const r of recs.filter(x => x.kind === "fulcrum")) {
      r.photos = []; r.missing = 0;
      for (let i = 0; i < r.photoIds.length; i++) {
        const img = images.find(f => f.name.toLowerCase().includes(r.photoIds[i].toLowerCase()));
        if (!img) { r.missing++; continue; }
        const p = await A().readPhoto(img, 1600, 0.85);
        r.photos.push({ ...p, caption: r.captions[i] || "Current condition" });
      }
      if (!r.photoIds.length && images.length && recs.length === 1)   // no photo ids: use the images chosen
        for (const img of images) r.photos.push({ ...(await A().readPhoto(img, 1600, 0.85)), caption: "Current condition" });
    }
    if (!data.length && images.length) throw new Error("Choose the GeoJSON or CSV file from the Fulcrum export as well as its photos.");
    return recs;
  }

  /* ---------- importing ---------- */
  function pick(recs) {
    if (recs.length === 1) return Promise.resolve(recs[0]);
    return new Promise(resolve => {
      const overlay = h("div", { class: "mg-overlay", role: "dialog", "aria-modal": "true" });
      overlay.append(h("div", { class: "mg-box small" },
        h("h2", null, "Which site assessment?"),
        h("p", null, "The file holds " + recs.length + " records. Choose the one for this plan."),
        h("div", { class: "si-pick" }, recs.map(r => h("button", { type: "button", class: "btn secondary", onclick: () => { overlay.remove(); resolve(r); } }, r.title))),
        h("div", { class: "btn-row" }, h("button", { type: "button", class: "btn ghost", onclick: () => { overlay.remove(); resolve(null); } }, "Cancel"))));
      document.body.append(overlay);
    });
  }

  async function importFiles(files, status) {
    if (!files.length) return;
    let recs;
    try { if (status) status.textContent = "Reading…"; recs = await readRecords(files); }
    catch (e) { if (status) status.textContent = ""; alert(e.message); return; }
    if (status) status.textContent = "";
    if (!recs.length) { alert("No site assessment records were found in the chosen files."); return; }
    const r = await pick(recs); if (!r) return;
    const photos = (r.photos || []).filter(p => p && p.data).map(p => ({ id: A().uid(), data: p.data, w: p.w, h: p.h, caption: p.caption || "" }));
    const fragment = { start: {}, site: { ...r.site, photos } };
    delete fragment.site.gpsAccuracy;
    window.MergeTool.mergePlans([{ p: fragment, source: r.source }], {
      title: "Site assessment imported",
      note: "Check the Site tab. Boxes that were empty have been filled; where you chose “keep both”, the imported text is marked “[From " + r.source + "]”.",
      undoLabel: "Undo import",
      lines: (stats, who) => ["From: " + who, stats.filled + (stats.filled === 1 ? " box filled" : " boxes filled"),
        stats.photos + (stats.photos === 1 ? " photo added" : " photos added")]
        .concat(r.missing ? [r.missing + " photo(s) listed in the record were not among the chosen files"] : [])
    });
  }

  /* ---------- the card on the Site tab ---------- */
  function card() {
    const status = h("span", { class: "export-status", role: "status" });
    const input = h("input", { type: "file", multiple: true, class: "visually-hidden", id: "siteImportFiles",
      accept: ".json,.geojson,.csv,application/json,text/csv,image/*",
      onchange: e => { const fs = Array.from(e.target.files || []); e.target.value = ""; importFiles(fs, status); } });
    return h("div", { class: "card soft si-card" },
      h("h3", null, "Import a site assessment"),
      h("p", null, "Collected the site details in the field? Import them here instead of typing them again."),
      h("ul", { class: "si-list" },
        h("li", null, h("b", null, "Site assessment app"), " (free, works offline on phones and tablets): choose the ", h("code", null, SR() ? SR().fileExt : ".siterecord.json"),
          " file it saved. ", h("a", { href: "../site-assessment/v2/", target: "_blank", rel: "noopener" }, "Open the app \u2197")),
        h("li", null, h("b", null, "First Site assessment app (version 1)"), ": choose the ", h("code", null, SA().fileExt), " file it saved. ",
          h("a", { href: "../site-assessment/", target: "_blank", rel: "noopener" }, "Open it ↗")),
        h("li", null, h("b", null, "Fulcrum"), ": export the record (GeoJSON or CSV) and choose that file together with its photo files. ",
          h("a", { href: "https://github.com/tek-raj/wet-tropics-adaptation-tool/blob/main/docs/fulcrum-site-assessment.md", target: "_blank", rel: "noopener" }, "Fulcrum form set-up ↗"))),
      h("div", { class: "btn-row" }, h("label", { class: "btn secondary", for: "siteImportFiles" }, "Import site assessment…"), input, status),
      h("p", { class: "note" }, "Empty boxes are filled and photos are added to Site photos. Where the plan already has different text, you choose what to keep."));
  }

  window.SiteImport = { importFiles, card, answerText, _parseCSV: parseCSV, _readRecords: readRecords };
})();
