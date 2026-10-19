/*
 * SITE RECORDING APP (version 2 of the site assessment app)
 * An offline form for the Site Recording Sheet, for phones and tablets. It can be added to the home screen
 * and works without signal. Records are kept on the device (IndexedDB) and saved or shared as a file
 * (*.siterecord.json). A record can also be printed or saved as a PDF.
 * The questions are in form.js.
 */
(function () {
  "use strict";
  const F = window.SITE_RECORDING;
  const FIELDS = F.sections.flatMap(s => s.fields);
  const app = document.getElementById("app");

  /* ---------- small helpers ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else if (k === "checked") el.checked = !!v;
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
  const siteTitle = d => [d.siteNo && "Site " + d.siteNo, d.siteName].filter(Boolean).join(" – ") || "Unnamed site";
  const visible = (f, D) => !f.showIf || Object.entries(f.showIf).every(([k, v]) => D[k] === v);

  /* ---------- storage on the device (IndexedDB) ---------- */
  const DB = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open("site-recordings", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("records", { keyPath: "id" });
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const tx = (mode, fn) => open().then(db => new Promise((res, rej) => {
      const t = db.transaction("records", mode), s = t.objectStore("records"), out = fn(s);
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

  /* ---------- the file ---------- */
  const isSaved = rec => rec.exportedAt && rec.exportedAt >= rec.updated;
  const fileName = rec => ("Site recording - " + siteTitle(rec.data) + " - " + (rec.data.dateRecorded || today()))
    .replace(/[\\/:*?"<>|]+/g, "").slice(0, 90) + F.fileExt;
  const fileObject = rec => ({ format: F.fileFormat, version: 1, app: "Site recording app", id: rec.id,
    created: rec.created, updated: rec.updated, data: rec.data, photos: rec.photos });

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
        if (!j || j.format !== F.fileFormat) throw new Error();
        const recs = await DB.all(), exists = recs.find(r => r.id === j.id);
        if (exists && !confirm("“" + siteTitle(j.data || {}) + "” is already on this device. Replace it with the copy in the file?")) continue;
        await DB.put({ id: j.id || uid(), created: j.created || Date.now(), updated: j.updated || Date.now(), exportedAt: j.updated || Date.now(),
          data: j.data || {}, photos: j.photos || [] });
        n++;
      } catch (e) { alert(f.name + " is not a site recording file."); }
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
    if (standalone() || safeLS.get("sr-install-hidden")) return null;
    const hide = () => { safeLS.set("sr-install-hidden", "1"); tip.remove(); };
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

  /* ---------- home: list of records ---------- */
  let view = "home";
  const removeBar = () => document.querySelectorAll(".sa-bar").forEach(b => b.remove());
  async function home() {
    view = "home"; removeBar();
    const recs = (await DB.all()).sort((a, b) => b.updated - a.updated);
    const fileIn = h("input", { type: "file", accept: ".json,application/json", multiple: true, class: "visually-hidden", id: "openFile",
      onchange: e => { const fs = Array.from(e.target.files || []); e.target.value = ""; openFiles(fs); } });
    show(
      installTip(),
      h("div", { class: "card" },
        h("h2", null, F.title),
        h("p", { class: "sa-intro" }, F.intro),
        h("p", { class: "note" }, "Everything is kept on this device until you save or share it. When you finish, tap ", h("b", null, "Save / share file"),
          " to send it, or ", h("b", null, "Print / PDF"), " for a paper copy."),
        h("p", { class: "sensitive" }, F.sensitive),
        h("div", { class: "btn-row" },
          h("button", { type: "button", class: "btn primary", onclick: newRecord }, "+ New site recording"),
          h("label", { class: "btn ghost", for: "openFile" }, "Open a file"), fileIn)),
      recs.length ? recs.map(itemCard) : h("div", { class: "card empty" }, "No site recordings on this device yet."),
      h("p", { class: "note" }, "Also available: ", h("a", { href: "../" }, "Site assessment app (version 1)"), " · ",
        h("a", { href: "../../v3/", target: "_blank", rel: "noopener" }, "Biodiversity Climate Adaptation Planning ↗")));
    window.scrollTo(0, 0);
  }

  function itemCard(rec) {
    const d = rec.data, np = (rec.photos || []).length;
    return h("div", { class: "card sa-item" },
      h("div", { class: "sa-item-title" }, siteTitle(d)),
      h("div", { class: "sa-item-meta" }, [fmtDate(d.dateRecorded), d.recorder, np + " photo" + (np === 1 ? "" : "s"), "edited " + fmtTime(rec.updated)].filter(Boolean).join(" · ")),
      h("div", null, isSaved(rec) ? h("span", { class: "badge ok" }, "✓ Saved to a file") : h("span", { class: "badge warn" }, "Not saved to a file yet")),
      h("div", { class: "btn-row" },
        h("button", { type: "button", class: "btn small primary", onclick: () => edit(rec) }, "Open"),
        h("button", { type: "button", class: "btn small", onclick: async () => { if (await saveFile(rec)) home(); } }, "Save / share file"),
        h("button", { type: "button", class: "btn small", onclick: () => printView(rec) }, "Print / PDF"),
        h("button", { type: "button", class: "btn small danger", onclick: async () => {
          if (!confirm((isSaved(rec) ? "" : "This record has not been saved to a file. ") + "Delete “" + siteTitle(d) + "” from this device?")) return;
          await DB.del(rec.id); home(); } }, "Delete")));
  }

  async function newRecord() {
    const rec = { id: uid(), created: Date.now(), updated: Date.now(), exportedAt: 0, data: { dateRecorded: today() }, photos: [] };
    await DB.put(rec); askPersist(); edit(rec);
  }

  /* ---------- the form ---------- */
  function edit(rec) {
    view = "form";
    const D = rec.data;
    const status = h("span", { class: "status" }, "Saved on this device");
    let timer = null;
    const touch = () => {
      rec.updated = Date.now(); status.textContent = "Saving…";
      clearTimeout(timer); timer = setTimeout(async () => { await DB.put(rec); askPersist(); status.textContent = "Saved on this device · not yet saved to a file"; }, 350);
    };
    const flush = async () => { clearTimeout(timer); await DB.put(rec); };
    const grow = t => { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight + 2, 600) + "px"; };
    const boxes = {};   // field id -> box, for questions shown only after another answer
    const refreshShown = () => FIELDS.forEach(f => { if (f.showIf && boxes[f.id]) boxes[f.id].hidden = !visible(f, D); });

    const textInput = (id, attrs) => h("input", Object.assign({ type: "text", id: "f-" + id, value: D[id] || "", oninput: e => { D[id] = e.target.value; touch(); } }, attrs));

    function fieldBox(f) {
      const inputId = "f-" + f.id;
      let body;
      if (f.type === "date") body = h("input", { type: "date", id: inputId, value: D[f.id] || "", oninput: e => { D[f.id] = e.target.value; touch(); } });
      else if (f.type === "textarea") {
        body = h("textarea", { id: inputId, rows: f.rows || 3, oninput: e => { D[f.id] = e.target.value; grow(e.target); touch(); } });
        body.value = D[f.id] || "";
      }
      else if (f.type === "yesno") body = choiceRow(f);
      else if (f.type === "checks") body = checksBlock(f);
      else if (f.type === "photos") body = photosBlock();
      else if (f.type === "gps") { const inp = textInput(f.id, { placeholder: f.hint, inputmode: "decimal" }); body = [inp, gpsRow(inp)]; }
      else body = textInput(f.id);
      const labelEl = (f.type === "yesno" || f.type === "checks" || f.type === "photos")
        ? h("div", { class: "field-label", id: inputId + "-label" }, f.label)
        : h("label", { class: "field-label", for: inputId }, f.label);
      const box = h("div", { class: "field" + (f.showIf ? " follow-up" : "") }, h("div", { class: "field-head" }, labelEl),
        f.hint && f.type !== "gps" ? h("p", { class: "note hint" }, f.hint) : null, body);
      if (f.showIf) box.hidden = !visible(f, D);
      boxes[f.id] = box;
      return box;
    }

    // Yes / No (tap again to clear)
    function choiceRow(f) {
      const row = h("div", { class: "choice-row", role: "radiogroup", "aria-labelledby": "f-" + f.id + "-label" });
      const paint = () => row.querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", String(D[f.id] === b.dataset.v)));
      [["yes", "Yes"], ["no", "No"]].forEach(([v, l]) => row.append(h("button", { type: "button", role: "radio", class: "chip", "data-v": v,
        onclick: () => { D[f.id] = D[f.id] === v ? "" : v; paint(); refreshShown(); touch(); } }, l)));
      paint();
      return row;
    }

    // Tick boxes; some ask for a number or details, and "Other" asks what
    function checksBlock(f) {
      const sel = new Set(Array.isArray(D[f.id]) ? D[f.id] : []);
      const wrap = h("div", { class: "checks", role: "group", "aria-labelledby": "f-" + f.id + "-label" });
      f.options.forEach(([v, label, detail]) => {
        const key = f.id + "_" + v, cbId = "f-" + key;
        const extra = detail || v === "other"
          ? h("input", { type: "text", class: "check-extra", "aria-label": f.label + ": " + label + (v === "other" ? " – what?" : " – " + detail.toLowerCase()),
              placeholder: v === "other" ? "What?" : detail, inputmode: detail === "Number" ? "numeric" : null,
              value: D[key] || "", hidden: !sel.has(v), oninput: e => { D[key] = e.target.value; touch(); } })
          : null;
        const cb = h("input", { type: "checkbox", id: cbId, checked: sel.has(v), onchange: e => {
          if (e.target.checked) sel.add(v); else sel.delete(v);
          D[f.id] = f.options.map(o => o[0]).filter(x => sel.has(x));
          if (extra) { extra.hidden = !e.target.checked; if (e.target.checked) extra.focus(); }
          touch(); } });
        wrap.append(h("div", { class: "check" + (extra ? " has-extra" : "") }, h("label", { for: cbId }, cb, h("span", null, label)), extra));
      });
      return wrap;
    }

    // GPS from the device
    function gpsRow(input) {
      const st = h("span", { class: "gps-status" }, D.gpsAccuracy ? "Accuracy about ±" + D.gpsAccuracy + " m" : "");
      const btn = h("button", { type: "button", class: "btn small", onclick: () => {
        if (!navigator.geolocation) { st.textContent = "Location is not available on this device."; return; }
        st.textContent = "Finding your location… (this can take up to a minute outdoors)"; btn.disabled = true;
        navigator.geolocation.getCurrentPosition(p => {
          D.gps = p.coords.latitude.toFixed(5) + ", " + p.coords.longitude.toFixed(5);
          D.gpsAccuracy = Math.round(p.coords.accuracy); input.value = D.gps;
          st.textContent = "Accuracy about ±" + D.gpsAccuracy + " m"; btn.disabled = false; touch();
        }, err => {
          btn.disabled = false;
          st.textContent = err.code === 1 ? "Location permission was refused. Allow location for this app in your device settings, or type the coordinates."
            : "Could not get a location. Move into the open and try again, or type the coordinates.";
        }, { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 });
      } }, "\u{1F4CD} Use my location");
      return h("div", { class: "gps-row" }, btn, st);
    }

    // Photos with captions
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
      return h("div", null, grid, h("div", { class: "photo-add" },
          h("label", { class: "btn small primary", for: "camIn" }, "\u{1F4F7} Take photo"), cam,
          h("label", { class: "btn small", for: "libIn" }, "Add from photos"), lib),
        h("p", { class: "note" }, "Photos are made smaller to keep the file easy to send. Add a caption to say what each one shows."));
    }

    const leave = async to => { await flush(); removeBar(); to(); };
    const bar = h("div", { class: "sa-bar" }, h("div", { class: "sa-bar-inner" }, status,
      h("button", { type: "button", class: "btn ghost small", onclick: () => leave(home) }, "Done"),
      h("button", { type: "button", class: "btn primary", onclick: async () => {
        await flush();
        if (await saveFile(rec)) status.textContent = "Saved to a file ✓";
      } }, "Save / share file")));
    removeBar();
    document.body.append(bar);

    show(
      h("button", { type: "button", class: "link-btn sa-back", onclick: () => leave(home) }, "← All site recordings"),
      h("p", { class: "sa-intro" }, F.intro),
      h("p", { class: "sensitive" }, F.sensitive),
      F.sections.map(sec => [h("div", { class: "sa-section" }, sec.title), sec.fields.map(fieldBox)]),
      h("div", { class: "card" },
        h("h2", null, "Finished?"),
        h("p", null, "Tap ", h("b", null, "Save / share file"), " to send the record (e.g. by email, AirDrop, Teams or to Files), or make a paper or PDF copy."),
        h("div", { class: "btn-row" },
          h("button", { type: "button", class: "btn small", onclick: () => leave(() => printView(rec)) }, "Print / PDF"),
          h("button", { type: "button", class: "link-btn", onclick: () => saveFile(rec, "download").then(ok => { if (ok) status.textContent = "Saved to a file ✓"; }) }, "Download the file instead"))));
    app.querySelectorAll("textarea").forEach(grow);
    window.scrollTo(0, 0);
  }

  /* ---------- print / PDF ---------- */
  function answer(f, D) {
    if (f.type === "yesno") return D[f.id] === "yes" ? "Yes" : D[f.id] === "no" ? "No" : "";
    if (f.type === "checks") {
      const sel = Array.isArray(D[f.id]) ? D[f.id] : [];
      return f.options.filter(o => sel.includes(o[0])).map(([v, l]) => { const x = (D[f.id + "_" + v] || "").trim(); return x ? l + " (" + x + ")" : l; }).join("; ");
    }
    if (f.id === "gps" && D.gps && D.gpsAccuracy) return D.gps + " (±" + D.gpsAccuracy + " m)";
    return f.id === "dateRecorded" ? fmtDate(D[f.id]) : (D[f.id] || "");
  }

  function printView(rec) {
    view = "print"; removeBar();
    const D = rec.data;
    show(
      h("div", { class: "no-print btn-row", style: "margin-bottom:14px" },
        h("button", { type: "button", class: "link-btn sa-back", onclick: home }, "← All site recordings"),
        h("button", { type: "button", class: "btn small", onclick: () => edit(rec) }, "Edit"),
        h("button", { type: "button", class: "btn small primary", onclick: () => window.print() }, "Print / save as PDF")),
      h("div", { class: "print-sheet" },
        h("h1", null, "Site recording sheet"),
        h("p", { class: "print-title" }, siteTitle(D)),
        h("p", { class: "sensitive" }, F.sensitive),
        F.sections.map(sec => [h("h2", null, sec.title), h("dl", null, sec.fields.filter(f => f.type !== "photos" && visible(f, D)).map(f =>
          [h("dt", null, f.label), h("dd", null, answer(f, D) || "—")]))]),
        rec.photos.length ? [h("h2", null, "Photos"), h("div", { class: "print-photos" }, rec.photos.map((p, i) =>
          h("figure", null, h("img", { src: p.data, alt: "" }), h("figcaption", null, "Photo " + (i + 1) + (p.caption ? ": " + p.caption : "")))))] : null,
        h("p", { class: "note" }, "Printed " + fmtTime(Date.now()) + " from the Site recording app.")));
    window.scrollTo(0, 0);
  }

  /* ---------- start ---------- */
  const net = document.getElementById("netStatus");
  const showNet = () => { net.hidden = navigator.onLine; };
  window.addEventListener("online", showNet); window.addEventListener("offline", showNet); showNet();
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
  home().catch(e => { show(h("div", { class: "card" }, "This device could not open its storage for the app. ", String(e && e.message || e))); });
  window.SiteRecordApp = { DB, fileObject };   // for testing
})();
