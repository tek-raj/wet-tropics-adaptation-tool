/*
 * SITE ASSESSMENT APP
 * An offline form for collecting site details in the field (phones and tablets). It can be added to the
 * home screen and works without signal. Assessments are kept on the device (IndexedDB) and saved or shared
 * as a file (*.siteassess.json), which the planning tool imports on its Site tab.
 * Questions and help come from the planning tool's content file (../v3/js/content.js), so both stay the same.
 */
(function () {
  "use strict";
  const C = window.APP_CONTENT, SA = C.siteAssessment;
  const FIELD = Object.fromEntries(C.site.fields.map(f => [f.id, f]));
  const app = document.getElementById("app");

  /* ---------- small helpers ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return el;
  }
  // put a list of elements (nested lists and empty items allowed) into the page
  const show = (...items) => app.replaceChildren(...items.flat(Infinity).filter(x => x !== null && x !== undefined && x !== false));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const fmtDate = iso => { if (!iso) return ""; const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : iso; };
  const fmtTime = t => t ? new Date(t).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
  const safeLS = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } } };

  /* ---------- storage on the device (IndexedDB) ---------- */
  const DB = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open("site-assessments", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("assessments", { keyPath: "id" });
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const tx = (mode, fn) => open().then(db => new Promise((res, rej) => {
      const t = db.transaction("assessments", mode), s = t.objectStore("assessments"), out = fn(s);
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : undefined); t.onerror = () => rej(t.error);
    }));
    return {
      all: () => tx("readonly", s => s.getAll()),
      put: rec => tx("readwrite", s => s.put(rec)),
      del: id => tx("readwrite", s => s.delete(id))
    };
  })();
  let persistAsked = false;
  const askPersist = () => { if (persistAsked) return; persistAsked = true; if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); };

  /* ---------- the file (shared with the planning tool) ---------- */
  const isSaved = rec => rec.exportedAt && rec.exportedAt >= rec.updated;
  const fileName = rec => ("Site assessment - " + ((rec.assessment.placeName || "unnamed site").trim()) + " - " + (rec.assessment.assessDate || today()))
    .replace(/[\\/:*?"<>|]+/g, "").slice(0, 90) + SA.fileExt;
  const fileObject = rec => ({ format: SA.fileFormat, version: 1, app: "Site assessment app", id: rec.id,
    created: rec.created, updated: rec.updated, assessment: rec.assessment, photos: rec.photos });

  async function saveFile(rec, mode) {
    const name = fileName(rec);
    const blob = new Blob([JSON.stringify(fileObject(rec), null, 1)], { type: "application/json" });
    let done = false;
    if (mode !== "download" && navigator.canShare) {
      const file = new File([blob], name, { type: "application/json" });
      if (navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: name }); done = true; }
        catch (e) { if (e && e.name === "AbortError") return false; }
      }
    }
    if (!done) {
      const a = h("a", { href: URL.createObjectURL(blob), download: name });
      document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    }
    rec.exportedAt = Date.now(); if (rec.exportedAt < rec.updated) rec.exportedAt = rec.updated;
    await DB.put(rec);
    return true;
  }

  async function openFiles(files) {
    let n = 0;
    for (const f of files) {
      try {
        const j = JSON.parse(await f.text());
        if (!j || j.format !== SA.fileFormat) throw new Error();
        const recs = await DB.all(), exists = recs.find(r => r.id === j.id);
        if (exists && !confirm("“" + (j.assessment.placeName || "This assessment") + "” is already on this device. Replace it with the copy in the file?")) continue;
        await DB.put({ id: j.id || uid(), created: j.created || Date.now(), updated: j.updated || Date.now(), exportedAt: j.updated || Date.now(),
          assessment: j.assessment || {}, photos: j.photos || [] });
        n++;
      } catch (e) { alert(f.name + " is not a site assessment file."); }
    }
    if (n) home();
  }

  /* ---------- photos ---------- */
  function readPhoto(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const MAX = 1600, k = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * k), hh = Math.round(img.height * k);
        const cv = h("canvas"); cv.width = w; cv.height = hh;
        const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, hh); ctx.drawImage(img, 0, 0, w, hh);
        URL.revokeObjectURL(url);
        resolve({ id: uid(), data: cv.toDataURL("image/jpeg", 0.82), w, h: hh, caption: "", takenAt: file.lastModified || Date.now() });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That photo could not be read.")); };
      img.src = url;
    });
  }

  /* ---------- install hint (Add to Home Screen) ---------- */
  let installEvent = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvent = e; if (view === "home") home(); });
  const standalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function installTip() {
    if (standalone() || safeLS.get("sa-install-hidden")) return null;
    const hide = () => { safeLS.set("sa-install-hidden", "1"); tip.remove(); };
    const how = installEvent
      ? h("div", { class: "btn-row" }, h("button", { type: "button", class: "btn primary small", onclick: async () => { installEvent.prompt(); await installEvent.userChoice; installEvent = null; hide(); } }, "Install the app"),
          h("button", { type: "button", class: "btn ghost small", onclick: hide }, "Not now"))
      : h("div", null, isIOS()
          ? ["On iPhone or iPad: in Safari, tap ", h("b", null, "Share"), " (the square with an arrow), then ", h("b", null, "Add to Home Screen"), "."]
          : ["In your browser menu, choose ", h("b", null, "Install app"), " or ", h("b", null, "Add to Home screen"), "."],
          h("div", { class: "btn-row" }, h("button", { type: "button", class: "btn ghost small", onclick: hide }, "OK, hide this")));
    const tip = h("div", { class: "tip" }, h("b", null, "Use it offline in the field. "),
      "Add this app to your home screen while you have signal. It then opens and works with no signal.", how);
    return tip;
  }

  /* ---------- home: list of assessments ---------- */
  let view = "home";
  async function home() {
    view = "home";
    const recs = (await DB.all()).sort((a, b) => b.updated - a.updated);
    const fileIn = h("input", { type: "file", accept: ".json,application/json", multiple: true, class: "visually-hidden", id: "openFile",
      onchange: e => { const fs = Array.from(e.target.files || []); e.target.value = ""; openFiles(fs); } });
    show(
      installTip(),
      h("div", { class: "card" },
        h("h2", null, SA.title),
        h("p", { class: "sa-intro" }, SA.intro),
        h("p", { class: "note" }, "Everything is kept on this device until you save or share it. When you finish, tap ", h("b", null, "Save / share file"),
          " and send the file to whoever is writing the plan. They import it in the planning tool (Site tab → Import a site assessment)."),
        h("div", { class: "btn-row" },
          h("button", { type: "button", class: "btn primary", onclick: newAssessment }, "+ New site assessment"),
          h("label", { class: "btn ghost", for: "openFile" }, "Open a file"), fileIn)),
      recs.length ? recs.map(itemCard) : h("div", { class: "card empty" }, "No site assessments on this device yet."),
      h("p", { class: "note" }, "Planning tool: ", h("a", { href: "../v3/", target: "_blank", rel: "noopener" }, "Biodiversity Climate Adaptation Planning ↗")));
    window.scrollTo(0, 0);
  }

  function itemCard(rec) {
    const a = rec.assessment;
    return h("div", { class: "card sa-item" },
      h("div", { class: "sa-item-title" }, a.placeName || "Unnamed site"),
      h("div", { class: "sa-item-meta" }, [fmtDate(a.assessDate), (rec.photos || []).length + " photo" + ((rec.photos || []).length === 1 ? "" : "s"), "edited " + fmtTime(rec.updated)].filter(Boolean).join(" · ")),
      h("div", null, isSaved(rec) ? h("span", { class: "badge ok" }, "✓ Saved to a file") : h("span", { class: "badge warn" }, "Not saved to a file yet")),
      h("div", { class: "btn-row" },
        h("button", { type: "button", class: "btn small primary", onclick: () => edit(rec) }, "Open"),
        h("button", { type: "button", class: "btn small", onclick: async () => { if (await saveFile(rec)) home(); } }, "Save / share file"),
        h("button", { type: "button", class: "btn small danger", onclick: async () => {
          if (!confirm((isSaved(rec) ? "" : "This assessment has not been saved to a file. ") + "Delete “" + (a.placeName || "Unnamed site") + "” from this device?")) return;
          await DB.del(rec.id); home(); } }, "Delete")));
  }

  async function newAssessment() {
    const rec = { id: uid(), created: Date.now(), updated: Date.now(), exportedAt: 0, assessment: { assessDate: today() }, photos: [] };
    await DB.put(rec); askPersist(); edit(rec);
  }

  /* ---------- the form ---------- */
  function helpBlock(help) {
    const links = (help.moreInfo ? [["More information", help.moreInfo]] : []).concat(help.moreInfo === null ? [] : (help.links || []));
    return h("div", { class: "help", hidden: true },
      help.instructions ? [h("h4", null, "Instructions"), h("p", null, help.instructions)] : null,
      help.examples ? [h("h4", null, "Examples"), h("p", null, help.examples)] : null,
      help.guidance ? [h("h4", null, "Guidance"), h("p", null, help.guidance)] : null,
      links.length ? [h("h4", null, "More information"), h("ul", null, links.map(([l, u]) => h("li", null, h("a", { href: u, target: "_blank", rel: "noopener" }, l + " ↗"))))] : null);
  }

  function edit(rec) {
    view = "form";
    const A = rec.assessment;
    const status = h("span", { class: "status" }, "Saved on this device");
    let timer = null;
    const touch = () => {
      rec.updated = Date.now(); status.textContent = "Saving…";
      clearTimeout(timer); timer = setTimeout(async () => { await DB.put(rec); askPersist(); status.textContent = "Saved on this device · not yet saved to a file"; }, 350);
    };

    const fieldBox = id => {
      const def = FIELD[id]; if (!def) return null;
      const help = helpBlock(def.help || {});
      const info = h("button", { type: "button", class: "info-btn", "aria-expanded": "false", "aria-label": "Help for " + def.label,
        onclick: () => { help.hidden = !help.hidden; info.setAttribute("aria-expanded", String(!help.hidden)); } }, "i");
      const inputId = "f-" + id;
      let input;
      if (def.type === "date") input = h("input", { type: "date", id: inputId, value: A[id] || "", oninput: e => { A[id] = e.target.value; touch(); } });
      else if (def.type === "textarea") {
        input = h("textarea", { id: inputId, rows: def.rows || 3, oninput: e => { A[id] = e.target.value; grow(e.target); touch(); } });
        input.value = A[id] || "";
      } else input = h("input", { type: "text", id: inputId, value: A[id] || "", oninput: e => { A[id] = e.target.value; touch(); } });
      const box = h("div", { class: "field" },
        h("div", { class: "field-head" }, h("label", { class: "field-label", for: inputId }, def.label), info), help, input);
      if (id === "gps") box.append(gpsRow(input));
      if (id === "condition") box.append(photosBlock());
      return box;
    };
    const grow = t => { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight + 2, 600) + "px"; };

    // GPS from the device
    function gpsRow(input) {
      const st = h("span", { class: "gps-status" }, A.gpsAccuracy ? "Accuracy about ±" + A.gpsAccuracy + " m" : "");
      const btn = h("button", { type: "button", class: "btn small", onclick: () => {
        if (!navigator.geolocation) { st.textContent = "Location is not available on this device."; return; }
        st.textContent = "Finding your location… (this can take up to a minute outdoors)"; btn.disabled = true;
        navigator.geolocation.getCurrentPosition(p => {
          A.gps = p.coords.latitude.toFixed(5) + ", " + p.coords.longitude.toFixed(5);
          A.gpsAccuracy = Math.round(p.coords.accuracy); input.value = A.gps;
          st.textContent = "Accuracy about ±" + A.gpsAccuracy + " m"; btn.disabled = false; touch();
        }, err => {
          btn.disabled = false;
          st.textContent = err.code === 1 ? "Location permission was refused. Allow location for this app in your device settings, or type the coordinates."
            : "Could not get a location. Move into the open and try again, or type the coordinates.";
        }, { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 });
      } }, "\u{1F4CD} Use my location");
      return h("div", { class: "gps-row" }, btn, st);
    }

    // Photos of the current condition
    function photosBlock() {
      const grid = h("div", { class: "photos" });
      const paint = () => grid.replaceChildren(...rec.photos.map((p, i) => {
        const cap = h("textarea", { rows: 2, placeholder: "Caption: what, where, which direction", "aria-label": "Caption for photo " + (i + 1),
          oninput: e => { p.caption = e.target.value; touch(); } });
        cap.value = p.caption || "";
        return h("div", { class: "photo" }, h("img", { src: p.data, alt: p.caption || "Photo " + (i + 1) }),
          h("div", { class: "photo-bar" }, h("span", null, "Photo " + (i + 1) + (p.takenAt ? " · " + fmtTime(p.takenAt) : "")),
            h("button", { type: "button", class: "link-btn", onclick: () => { if (confirm("Remove photo " + (i + 1) + "?")) { rec.photos.splice(i, 1); touch(); paint(); } } }, "Remove")),
          cap);
      }));
      const add = async files => {
        for (const f of files) { try { rec.photos.push(await readPhoto(f)); } catch (e) { alert(e.message); } }
        touch(); paint();
      };
      const cam = h("input", { type: "file", accept: "image/*", capture: "environment", class: "visually-hidden", id: "camIn",
        onchange: e => { const fs = Array.from(e.target.files || []); e.target.value = ""; add(fs); } });
      const lib = h("input", { type: "file", accept: "image/*", multiple: true, class: "visually-hidden", id: "libIn",
        onchange: e => { const fs = Array.from(e.target.files || []); e.target.value = ""; add(fs); } });
      paint();
      return h("div", null, h("div", { class: "field-label", style: "margin-top:12px" }, "Photos of the current condition"),
        grid, h("div", { class: "photo-add" },
          h("label", { class: "btn small primary", for: "camIn" }, "\u{1F4F7} Take photo"), cam,
          h("label", { class: "btn small", for: "libIn" }, "Add from photos"), lib),
        h("p", { class: "note" }, "Photos are made smaller to keep the file easy to send. Add a caption to say what each one shows."));
    }

    const bar = h("div", { class: "sa-bar" }, h("div", { class: "sa-bar-inner" }, status,
      h("button", { type: "button", class: "btn ghost small", onclick: async () => { clearTimeout(timer); await DB.put(rec); bar.remove(); home(); } }, "Done"),
      h("button", { type: "button", class: "btn primary", onclick: async () => {
        clearTimeout(timer); await DB.put(rec);
        if (await saveFile(rec)) status.textContent = "Saved to a file ✓";
      } }, "Save / share file")));
    document.querySelectorAll(".sa-bar").forEach(b => b.remove());
    document.body.append(bar);

    show(
      h("button", { type: "button", class: "link-btn sa-back", onclick: async () => { clearTimeout(timer); await DB.put(rec); bar.remove(); home(); } }, "← All site assessments"),
      h("p", { class: "sa-intro" }, SA.intro),
      SA.sections.map(sec => [h("div", { class: "sa-section" }, sec.title), sec.fields.map(fieldBox)]),
      h("div", { class: "card" },
        h("h2", null, "Finished?"),
        h("p", null, "Tap ", h("b", null, "Save / share file"), " to send the assessment (e.g. by email, AirDrop, Teams or to Files). The person writing the plan imports it in the planning tool: Site tab → Import a site assessment."),
        h("button", { type: "button", class: "link-btn", onclick: () => saveFile(rec, "download").then(ok => { if (ok) status.textContent = "Saved to a file ✓"; }) }, "Download the file instead")));
    app.querySelectorAll("textarea").forEach(grow);
    window.scrollTo(0, 0);
  }

  /* ---------- start ---------- */
  const net = document.getElementById("netStatus");
  const showNet = () => { net.hidden = navigator.onLine; };
  window.addEventListener("online", showNet); window.addEventListener("offline", showNet); showNet();
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
  home().catch(e => { show(h("div", { class: "card" }, "This device could not open its storage for the app. ", String(e && e.message || e))); });
  window.SiteAssessApp = { DB, fileObject };   // for testing
})();
