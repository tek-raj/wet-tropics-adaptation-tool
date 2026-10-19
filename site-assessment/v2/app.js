/*
 * SITE RECORDING APP (version 2 of the site assessment app)
 * An offline form for phones and tablets. Each record has two tabs:
 *   Site assessment     – the Site Recording Sheet (form.js)
 *   Cultural assessment – the Cultural Site Monitoring & Reporting Form (cultural.js), filled in only when needed
 * It can be added to the home screen and works without signal. Records are kept on the device (IndexedDB)
 * and saved or shared as a file (*.siterecord.json). A record can also be printed or saved as a PDF.
 */
(function () {
  "use strict";
  const F = window.SITE_RECORDING;
  // the tabs: where each form keeps its answers and photos in a record
  const FORMS = [
    { key: "site", def: F, data: "data", photos: "photos" },
    { key: "cultural", def: window.CULTURAL_ASSESSMENT, data: "cultural", photos: "culturalPhotos" }
  ];
  FORMS.forEach(m => { m.fields = m.def.sections.flatMap(s => s.fields); });
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
  // put a list of elements (nested lists and empty items allowed) into an element
  const fill = (el, ...items) => el.replaceChildren(...items.flat(Infinity).filter(x => x !== null && x !== undefined && x !== false));
  const show = (...items) => fill(app, ...items);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const fmtDate = iso => { if (!iso) return ""; const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : iso; };
  const fmtTime = t => t ? new Date(t).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
  const safeLS = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } } };
  const siteTitle = rec => {
    const d = rec.data || {}, c = rec.cultural || {}, no = d.siteNo || c.siteNo, name = d.siteName || c.siteName;
    return [no && "Site " + no, name].filter(Boolean).join(" – ") || "Unnamed site";
  };
  const visible = (f, D) => !f.showIf || Object.entries(f.showIf).every(([k, v]) => D[k] === v);
  const filled = v => Array.isArray(v) ? v.some(filled) : v && typeof v === "object" ? Object.values(v).some(filled) : !!(v && String(v).trim());
  // has anything been entered on a tab? (answers filled in for you don't count: dates, and the site details
  // the cultural tab copies from the site tab)
  const PREFILLED = { site: [], cultural: ["siteNo", "siteName", "gps"] };
  const started = (rec, m) => (rec[m.photos] || []).length > 0 ||
    m.fields.some(f => f.type !== "date" && !PREFILLED[m.key].includes(f.id) && filled((rec[m.data] || {})[f.id]));

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
  // records saved before the cultural tab existed get its empty parts
  const ready = rec => { rec.data = rec.data || {}; rec.photos = rec.photos || []; rec.cultural = rec.cultural || {}; rec.culturalPhotos = rec.culturalPhotos || []; return rec; };

  /* ---------- the file ---------- */
  const isSaved = rec => rec.exportedAt && rec.exportedAt >= rec.updated;
  const fileName = rec => ("Site recording - " + siteTitle(rec) + " - " + (rec.data.dateRecorded || rec.cultural.assessDate || today()))
    .replace(/[\\/:*?"<>|]+/g, "").slice(0, 90) + F.fileExt;
  const fileObject = rec => ({ format: F.fileFormat, version: 2, app: "Site recording app", id: rec.id,
    created: rec.created, updated: rec.updated, data: rec.data, photos: rec.photos, cultural: rec.cultural, culturalPhotos: rec.culturalPhotos });

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
        const rec = ready({ id: j.id || uid(), created: j.created || Date.now(), updated: j.updated || Date.now(), exportedAt: j.updated || Date.now(),
          data: j.data, photos: j.photos, cultural: j.cultural, culturalPhotos: j.culturalPhotos });
        const exists = (await DB.all()).find(r => r.id === rec.id);
        if (exists && !confirm("“" + siteTitle(rec) + "” is already on this device. Replace it with the copy in the file?")) continue;
        await DB.put(rec);
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
    const recs = (await DB.all()).map(ready).sort((a, b) => b.updated - a.updated);
    const fileIn = h("input", { type: "file", accept: ".json,application/json", multiple: true, class: "visually-hidden", id: "openFile",
      onchange: e => { const fs = Array.from(e.target.files || []); e.target.value = ""; openFiles(fs); } });
    show(
      installTip(),
      h("div", { class: "card" },
        h("h2", null, "Site and cultural assessment"),
        h("p", { class: "sa-intro" }, "Each record has two tabs: ", h("b", null, "Site assessment"), " (the site recording sheet) and ",
          h("b", null, "Cultural assessment"), " (cultural site monitoring and reporting). Fill in one or both."),
        h("p", { class: "note" }, "Everything is kept on this device until you save or share it. When you finish, tap ", h("b", null, "Save / share file"),
          " to send it, or ", h("b", null, "Print / PDF"), " for a paper copy."),
        h("p", { class: "sensitive" }, F.sensitive),
        h("div", { class: "btn-row" },
          h("button", { type: "button", class: "btn primary", onclick: () => newRecord("site") }, "+ New site assessment"),
          h("button", { type: "button", class: "btn", onclick: () => newRecord("cultural") }, "+ New cultural assessment"),
          h("label", { class: "btn ghost", for: "openFile" }, "Open a file"), fileIn)),
      recs.length ? recs.map(itemCard) : h("div", { class: "card empty" }, "No records on this device yet."),
      h("p", { class: "note" }, "Also available: ", h("a", { href: "../" }, "Site assessment app (version 1)"), " · ",
        h("a", { href: "../../v3/", target: "_blank", rel: "noopener" }, "Biodiversity Climate Adaptation Planning ↗")));
    window.scrollTo(0, 0);
  }

  function itemCard(rec) {
    const d = rec.data, c = rec.cultural, np = rec.photos.length + rec.culturalPhotos.length;
    return h("div", { class: "card sa-item" },
      h("div", { class: "sa-item-title" }, siteTitle(rec)),
      h("div", { class: "sa-item-meta" }, [fmtDate(d.dateRecorded || c.assessDate), d.recorder || c.assessor, np + " photo" + (np === 1 ? "" : "s"), "edited " + fmtTime(rec.updated)].filter(Boolean).join(" · ")),
      h("div", { class: "btn-row tight" }, FORMS.map(m => started(rec, m)
          ? h("span", { class: "badge part" }, "✓ " + m.def.title) : h("span", { class: "badge none" }, m.def.title + ": not started")),
        isSaved(rec) ? h("span", { class: "badge ok" }, "✓ Saved to a file") : h("span", { class: "badge warn" }, "Not saved to a file yet")),
      h("div", { class: "btn-row" },
        h("button", { type: "button", class: "btn small primary", onclick: () => edit(rec) }, "Open"),
        h("button", { type: "button", class: "btn small", onclick: async () => { if (await saveFile(rec)) home(); } }, "Save / share file"),
        h("button", { type: "button", class: "btn small", onclick: () => printView(rec) }, "Print / PDF"),
        h("button", { type: "button", class: "btn small danger", onclick: async () => {
          if (!confirm((isSaved(rec) ? "" : "This record has not been saved to a file. ") + "Delete “" + siteTitle(rec) + "” from this device?")) return;
          await DB.del(rec.id); home(); } }, "Delete")));
  }

  async function newRecord(tab) {
    const rec = ready({ id: uid(), created: Date.now(), updated: Date.now(), exportedAt: 0, data: { dateRecorded: today() }, tab });
    if (tab === "cultural") rec.cultural.assessDate = today();
    await DB.put(rec); askPersist(); edit(rec);
  }

  // Starting the cultural tab: bring across the site details already entered on the site tab
  function startCultural(rec) {
    const c = rec.cultural, d = rec.data;
    if (Object.keys(c).length) return;
    ["siteNo", "siteName", "gps", "gpsAccuracy"].forEach(k => { if (d[k]) c[k] = d[k]; });
    c.assessDate = today();
  }

  /* ---------- the form ---------- */
  function edit(rec) {
    view = "form";
    ready(rec);
    const status = h("span", { class: "status" }, "Saved on this device");
    let timer = null;
    const touch = () => {
      rec.updated = Date.now(); status.textContent = "Saving…";
      clearTimeout(timer); timer = setTimeout(async () => { await DB.put(rec); askPersist(); status.textContent = "Saved on this device · not yet saved to a file"; }, 350);
    };
    const flush = async () => { clearTimeout(timer); await DB.put(rec); };
    const grow = t => { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight + 2, 600) + "px"; };

    // tabs at the top
    const tabBar = h("div", { class: "tabs", role: "tablist", "aria-label": "Parts of this record" });
    const panel = h("div", { role: "tabpanel", id: "tabPanel" });
    const paintTabs = () => fill(tabBar, FORMS.map(m => h("button", { type: "button", role: "tab", class: "tab", id: "tab-" + m.key,
      "aria-selected": String(rec.tab === m.key), "aria-controls": "tabPanel",
      onclick: () => { if (rec.tab === m.key) return; rec.tab = m.key; touch(); paintTabs(); renderTab(); window.scrollTo(0, 0); } },
      m.def.title, started(rec, m) ? h("span", { class: "tab-tick", "aria-label": "(started)" }, " ✓") : null)));
    if (!FORMS.some(m => m.key === rec.tab)) rec.tab = "site";

    function renderTab() {
      const m = FORMS.find(x => x.key === rec.tab);
      if (m.key === "cultural") startCultural(rec);
      const D = rec[m.data], P = rec[m.photos];
      const boxes = {};   // field id -> box, for questions shown only after another answer
      const refresh = () => {
        m.fields.forEach(f => { if (f.showIf && boxes[f.id]) boxes[f.id].hidden = !visible(f, D); });
        panel.querySelectorAll("[data-warn-field]").forEach(w => { w.hidden = !(D[w.dataset.warnField] || []).includes(w.dataset.warnHas); });
      };
      const changed = () => { touch(); refresh(); const t = tabBar.querySelector("#tab-" + m.key + " .tab-tick"); if (!t && started(rec, m)) paintTabs(); };
      const textInput = (id, attrs, obj) => { obj = obj || D;
        return h("input", Object.assign({ type: "text", value: obj[id] || "", oninput: e => { obj[id] = e.target.value; changed(); } }, attrs)); };
      const textArea = (id, attrs, obj) => { obj = obj || D;
        const t = h("textarea", Object.assign({ oninput: e => { obj[id] = e.target.value; grow(e.target); changed(); } }, attrs)); t.value = obj[id] || ""; return t; };

      function fieldBox(f) {
        const inputId = "f-" + f.id;
        let body;
        if (f.type === "date") body = h("input", { type: "date", id: inputId, value: D[f.id] || "", oninput: e => { D[f.id] = e.target.value; changed(); } });
        else if (f.type === "textarea") body = textArea(f.id, { id: inputId, rows: f.rows || 3, placeholder: f.placeholder });
        else if (f.type === "yesno") body = choiceRow(f, [["yes", "Yes"], ["no", "No"]]);
        else if (f.type === "choice") body = choiceRow(f, f.options);
        else if (f.type === "checks") body = checksBlock(f);
        else if (f.type === "photos") body = photosBlock(f);
        else if (f.type === "table") body = tableBlock(f);
        else if (f.type === "signoff") body = signoffBlock(f);
        else if (f.type === "gps") { const inp = textInput(f.id, { id: inputId, placeholder: f.hint, inputmode: "decimal" }); body = [inp, gpsRow(inp)]; }
        else body = textInput(f.id, { id: inputId, placeholder: f.placeholder });
        const group = ["yesno", "choice", "checks", "photos", "table", "signoff"].includes(f.type);
        const labelEl = group ? h("div", { class: "field-label", id: inputId + "-label" }, f.label) : h("label", { class: "field-label", for: inputId }, f.label);
        const box = h("div", { class: "field" + (f.showIf ? " follow-up" : "") }, h("div", { class: "field-head" }, labelEl),
          f.hint && f.type !== "gps" ? h("p", { class: "note hint" }, f.hint) : null, body);
        if (f.showIf) box.hidden = !visible(f, D);
        boxes[f.id] = box;
        return box;
      }

      // Pick one (tap again to clear); "Other" asks what
      function choiceRow(f, options) {
        const row = h("div", { class: "choice-row", role: "radiogroup", "aria-labelledby": "f-" + f.id + "-label" });
        const other = options.some(o => o[0] === "other")
          ? h("input", { type: "text", class: "choice-extra", "aria-label": f.label + ": Other – what?", placeholder: "What?",
              value: D[f.id + "_other"] || "", oninput: e => { D[f.id + "_other"] = e.target.value; changed(); } })
          : null;
        const paint = () => {
          row.querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", String(D[f.id] === b.dataset.v)));
          if (other) other.hidden = D[f.id] !== "other";
        };
        options.forEach(([v, l]) => row.append(h("button", { type: "button", role: "radio", class: "chip", "data-v": v,
          onclick: () => { D[f.id] = D[f.id] === v ? "" : v; paint(); changed(); if (v === "other" && D[f.id]) other.focus(); } }, l)));
        paint();
        return other ? [row, other] : row;
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
                value: D[key] || "", hidden: !sel.has(v), oninput: e => { D[key] = e.target.value; changed(); } })
            : null;
          const cb = h("input", { type: "checkbox", id: cbId, checked: sel.has(v), onchange: e => {
            if (e.target.checked) sel.add(v); else sel.delete(v);
            D[f.id] = f.options.map(o => o[0]).filter(x => sel.has(x));
            if (extra) { extra.hidden = !e.target.checked; if (e.target.checked) extra.focus(); }
            changed(); } });
          wrap.append(h("div", { class: "check" + (extra ? " has-extra" : "") }, h("label", { for: cbId }, cb, h("span", null, label)), extra));
        });
        return wrap;
      }

      // Table: one card per row, rows can be added and removed
      function tableBlock(f) {
        if (!Array.isArray(D[f.id]) || !D[f.id].length) D[f.id] = Array.from({ length: f.rows || 1 }, () => ({}));
        const rows = D[f.id], list = h("div", { class: "trows" });
        const paint = () => fill(list, rows.map((r, i) => h("div", { class: "trow" },
          h("div", { class: "trow-head" }, h("span", null, f.label.replace(/s$/, "") + " " + (i + 1)),
            rows.length > 1 ? h("button", { type: "button", class: "link-btn", onclick: () => {
              if (filled(r) && !confirm("Remove row " + (i + 1) + "?")) return; rows.splice(i, 1); changed(); paint(); } }, "Remove") : null),
          f.columns.map(([cid, clabel, ctype]) => { const id = "f-" + f.id + "-" + i + "-" + cid;
            return h("div", { class: "tcell" }, h("label", { for: id }, clabel),
              ctype === "textarea" ? textArea(cid, { id, rows: 2 }, r) : textInput(cid, { id }, r)); }))));
        paint();
        return [list, h("button", { type: "button", class: "btn small", onclick: () => { rows.push({}); changed(); paint();
          const last = list.lastElementChild && list.lastElementChild.querySelector("input,textarea"); if (last) last.focus(); } }, f.addLabel || "+ Add a row")];
      }

      // Sign-off: name, date and a signature for each role
      function signoffBlock(f) {
        D[f.id] = D[f.id] || {};
        return h("div", { class: "trows" }, f.roles.map(([rid, rlabel]) => {
          const r = D[f.id][rid] = D[f.id][rid] || {}, base = "f-" + f.id + "-" + rid;
          return h("div", { class: "trow" }, h("div", { class: "trow-head" }, h("span", null, rlabel)),
            h("div", { class: "tcell" }, h("label", { for: base + "-name" }, "Name"), textInput("name", { id: base + "-name" }, r)),
            h("div", { class: "tcell" }, h("label", { for: base + "-date" }, "Date"),
              h("input", { type: "date", id: base + "-date", value: r.date || "", oninput: e => { r.date = e.target.value; changed(); } })),
            h("div", { class: "tcell" }, h("div", { class: "tcell-label" }, "Signature"), signaturePad(r, rlabel)));
        }));
      }

      function signaturePad(r, who) {
        const W = 600, H = 200;
        const cv = h("canvas", { class: "sig", width: W, height: H, role: "img", "aria-label": "Signature box for " + who + ". Sign with your finger." });
        const ctx = cv.getContext("2d");
        const blank = () => { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = "#d3dcd7"; ctx.beginPath(); ctx.moveTo(20, H - 40); ctx.lineTo(W - 20, H - 40); ctx.stroke(); };
        blank();
        if (r.signature) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, W, H); im.src = r.signature; }
        let drawing = false, inked = false;
        const pt = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * W / b.width, (e.clientY - b.top) * H / b.height]; };
        cv.addEventListener("pointerdown", e => { drawing = true; cv.setPointerCapture(e.pointerId); const [x, y] = pt(e);
          ctx.strokeStyle = "#1d2622"; ctx.lineWidth = 3.2; ctx.lineCap = ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + .1, y + .1); ctx.stroke(); inked = true; });
        cv.addEventListener("pointermove", e => { if (!drawing) return; const [x, y] = pt(e); ctx.lineTo(x, y); ctx.stroke(); });
        const end = () => { if (!drawing) return; drawing = false; if (inked) { r.signature = cv.toDataURL("image/png"); r.signedAt = Date.now(); changed(); } };
        cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
        return [cv, h("div", { class: "sig-bar" }, h("span", { class: "note" }, "Sign with your finger or a stylus"),
          h("button", { type: "button", class: "link-btn", onclick: () => { blank(); inked = false; delete r.signature; delete r.signedAt; changed(); } }, "Clear"))];
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
            st.textContent = "Accuracy about ±" + D.gpsAccuracy + " m"; btn.disabled = false; changed();
          }, err => {
            btn.disabled = false;
            st.textContent = err.code === 1 ? "Location permission was refused. Allow location for this app in your device settings, or type the coordinates."
              : "Could not get a location. Move into the open and try again, or type the coordinates.";
          }, { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 });
        } }, "\u{1F4CD} Use my location");
        input.addEventListener("input", () => { delete D.gpsAccuracy; st.textContent = ""; });
        return h("div", { class: "gps-row" }, btn, st);
      }

      // Photos with captions (and Before / After for monitoring photos)
      function photosBlock(f) {
        const grid = h("div", { class: "photos" });
        const paint = () => fill(grid, P.map((p, i) => {
          const cap = h("textarea", { rows: 2, placeholder: f.tags ? "Description: photo point, what, which direction" : "Caption: what, where, which direction",
            "aria-label": (f.tags ? "Description" : "Caption") + " for photo " + (i + 1), oninput: e => { p.caption = e.target.value; changed(); } });
          cap.value = p.caption || "";
          const tags = f.tags ? h("div", { class: "photo-tags", role: "radiogroup", "aria-label": "Photo " + (i + 1) + ": before or after works" },
            [["before", "Before"], ["after", "After"]].map(([v, l]) => h("button", { type: "button", role: "radio", class: "chip small", "aria-checked": String(p.tag === v),
              onclick: () => { p.tag = p.tag === v ? "" : v; changed(); paint(); } }, l))) : null;
          return h("div", { class: "photo" }, h("img", { src: p.data, alt: p.caption || "Photo " + (i + 1) }),
            h("div", { class: "photo-bar" }, h("span", null, "Photo " + (i + 1) + (p.takenAt ? " · " + fmtTime(p.takenAt) : "")),
              h("button", { type: "button", class: "link-btn", onclick: () => { if (confirm("Remove photo " + (i + 1) + "?")) { P.splice(i, 1); changed(); paint(); } } }, "Remove")),
            tags, cap);
        }));
        const add = async files => {
          for (const file of files) { try { P.push(await readPhoto(file)); } catch (e) { alert(e.message); } }
          changed(); paint();
        };
        const pick = (id, attrs) => h("input", Object.assign({ type: "file", accept: "image/*", class: "visually-hidden", id,
          onchange: e => { const fs = Array.from(e.target.files || []); e.target.value = ""; add(fs); } }, attrs));
        paint();
        const w = f.warnIf;
        return h("div", null,
          w ? h("p", { class: "sensitive", "data-warn-field": w.field, "data-warn-has": w.has, hidden: !(D[w.field] || []).includes(w.has) }, w.text) : null,
          grid, h("div", { class: "photo-add" },
            h("label", { class: "btn small primary", for: "camIn" }, "\u{1F4F7} Take photo"), pick("camIn", { capture: "environment" }),
            h("label", { class: "btn small", for: "libIn" }, "Add from photos"), pick("libIn", { multiple: true })),
          h("p", { class: "note" }, "Photos are made smaller to keep the file easy to send."));
      }

      const other = FORMS.find(x => x !== m);
      fill(panel,
        h("p", { class: "sa-intro" }, m.def.intro),
        m.def.sections.map(sec => [h("div", { class: "sa-section" }, sec.title), sec.note ? h("p", { class: "note sec-note" }, sec.note) : null, sec.fields.map(fieldBox)]),
        h("div", { class: "card" },
          h("h2", null, "Finished?"),
          h("p", null, "Tap ", h("b", null, "Save / share file"), " to send the record (e.g. by email, AirDrop, Teams or to Files), or make a paper or PDF copy. The file holds both tabs."),
          h("div", { class: "btn-row" },
            h("button", { type: "button", class: "btn small", onclick: () => { rec.tab = other.key; touch(); paintTabs(); renderTab(); window.scrollTo(0, 0); } },
              (started(rec, other) ? "Go to " : "Also do a ") + other.def.title.toLowerCase() + " →"),
            h("button", { type: "button", class: "btn small", onclick: () => leave(() => printView(rec)) }, "Print / PDF"),
            h("button", { type: "button", class: "link-btn", onclick: () => saveFile(rec, "download").then(ok => { if (ok) status.textContent = "Saved to a file ✓"; }) }, "Download the file instead"))));
      panel.querySelectorAll("textarea").forEach(grow);
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

    paintTabs(); renderTab();
    show(
      h("button", { type: "button", class: "link-btn sa-back", onclick: () => leave(home) }, "← All records"),
      h("div", { class: "tabs-wrap" }, tabBar),
      h("p", { class: "sensitive" }, F.sensitive),
      panel);
    window.scrollTo(0, 0);
  }

  /* ---------- print / PDF ---------- */
  function answer(f, D) {
    const v = D[f.id];
    if (f.type === "yesno") return v === "yes" ? "Yes" : v === "no" ? "No" : "";
    if (f.type === "choice") { const o = f.options.find(x => x[0] === v); if (!o) return ""; const x = (D[f.id + "_other"] || "").trim(); return v === "other" && x ? "Other (" + x + ")" : o[1]; }
    if (f.type === "checks") {
      const sel = Array.isArray(v) ? v : [];
      return f.options.filter(o => sel.includes(o[0])).map(([k, l]) => { const x = (D[f.id + "_" + k] || "").trim(); return x ? l + " (" + x + ")" : l; }).join("; ");
    }
    if (f.type === "date") return fmtDate(v);
    if (f.id === "gps" && v && D.gpsAccuracy) return v + " (±" + D.gpsAccuracy + " m)";
    return v || "";
  }

  function printValue(f, D) {
    if (f.type === "table") {
      const rows = (D[f.id] || []).filter(filled);
      return rows.length ? h("table", { class: "ptable" }, h("thead", null, h("tr", null, f.columns.map(c => h("th", null, c[1])))),
        h("tbody", null, rows.map(r => h("tr", null, f.columns.map(c => h("td", null, r[c[0]] || "")))))) : "—";
    }
    if (f.type === "signoff") {
      const S = D[f.id] || {};
      return h("table", { class: "ptable" }, h("thead", null, h("tr", null, ["Role", "Name", "Signature", "Date"].map(x => h("th", null, x)))),
        h("tbody", null, f.roles.map(([rid, rl]) => { const r = S[rid] || {};
          return h("tr", null, h("td", null, rl), h("td", null, r.name || ""), h("td", null, r.signature ? h("img", { class: "psig", src: r.signature, alt: "Signature of " + (r.name || rl) }) : ""), h("td", null, fmtDate(r.date))); })));
    }
    return answer(f, D) || "—";
  }

  function printView(rec) {
    view = "print"; removeBar(); ready(rec);
    const parts = FORMS.filter(m => started(rec, m));
    show(
      h("div", { class: "no-print btn-row", style: "margin-bottom:14px" },
        h("button", { type: "button", class: "link-btn sa-back", onclick: home }, "← All records"),
        h("button", { type: "button", class: "btn small", onclick: () => edit(rec) }, "Edit"),
        h("button", { type: "button", class: "btn small primary", onclick: () => window.print() }, "Print / save as PDF")),
      (parts.length ? parts : FORMS.slice(0, 1)).map((m, n) => {
        const D = rec[m.data], P = rec[m.photos];
        const wide = f => f.type === "table" || f.type === "signoff";
        return h("div", { class: "print-sheet" + (n ? " page-break" : "") },
          h("h1", null, m.def.printTitle || m.def.title),
          h("p", { class: "print-title" }, siteTitle(rec)),
          n ? null : h("p", { class: "sensitive" }, F.sensitive),
          m.def.sections.map(sec => {
            const fs = sec.fields.filter(f => f.type !== "photos" && visible(f, D));
            return fs.length ? [h("h2", null, sec.title), h("dl", null, fs.map(f => wide(f)
              ? h("div", { class: "pwide" }, f.type === "signoff" ? null : h("dt", null, f.label), h("dd", null, printValue(f, D)))
              : [h("dt", null, f.label), h("dd", null, printValue(f, D))]))] : null;
          }),
          P.length ? [h("h2", null, "Photos"), h("div", { class: "print-photos" }, P.map((p, i) =>
            h("figure", null, h("img", { src: p.data, alt: "" }), h("figcaption", null, "Photo " + (i + 1) + (p.tag ? " (" + p.tag + " works)" : "") + (p.caption ? ": " + p.caption : "")))))] : null,
          h("p", { class: "note" }, "Printed " + fmtTime(Date.now()) + " from the Site recording app."));
      }));
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
