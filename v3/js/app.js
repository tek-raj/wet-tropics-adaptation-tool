/* Adaptation planning tool — UI, state and persistence. Content lives in content.js. */
(function () {
  "use strict";
  const C = window.APP_CONTENT;
  const STORE_KEY = "wt-adaptation-plan-v3";   // V3 keeps its own saved plan, separate from V1 and V2
  const TAB_KEY = "wt-adaptation-tab-v3";

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "start", label: "Start" },
    { id: "species", label: "Species / ecosystem" },
    { id: "site", label: "Site / area" },
    { id: "risk", label: "Risk assessment" },
    { id: "actions", label: "Actions" },
    { id: "scoring", label: "Scoring" },
    { id: "pathway", label: "Pathway planning" },
    { id: "summary", label: "Summary" },
    { id: "export", label: "Export" }
  ];

  /* ---------------- state ---------------- */
  const uid = () => Math.random().toString(36).slice(2, 10);

  function newPlan() {
    return {
      version: 1,
      start: {}, species: {}, site: {},
      risk: { hazards: C.risk.hazards.map(l => ({ id: uid(), label: l, custom: false }))
        .concat([{ id: uid(), label: "Other", custom: true }]) },
      actions: { existing: [{ id: uid() }], potential: [{ id: uid() }] },
      scores: {},
      pathway: [],
      summary: { photo: null }
    };
  }

  let plan = load() || newPlan();
  let currentTab = safeGet(TAB_KEY) || "overview";
  if (currentTab === "pathbuilder") currentTab = "pathway";   // the Pathway builder test tab is now Pathway planning
  if (!TABS.some(t => t.id === currentTab)) currentTab = "overview";

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  function load() {
    const raw = safeGet(STORE_KEY);
    if (!raw) return null;
    try { return migrate(JSON.parse(raw)); } catch (e) { return null; }
  }

  function migrate(p) {
    const base = newPlan();
    for (const k of Object.keys(base)) if (p[k] === undefined) p[k] = base[k];
    if (!p.actions.existing) p.actions.existing = [];
    if (!p.actions.potential) p.actions.potential = [];
    if (!p.summary) p.summary = { photo: null };
    return p;
  }

  let saveTimer = null;
  function changed() {
    clearTimeout(saveTimer);
    setStatus("Saving…");
    saveTimer = setTimeout(() => {
      const ok = safeSet(STORE_KEY, JSON.stringify(plan));
      const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setStatus(ok ? "Saved in this browser · " + t
        : "Could not save in this browser — use “Save plan file” to keep your work");
      updateTabDots();
    }, 400);
  }
  function setStatus(msg) { document.getElementById("saveStatus").textContent = msg; }

  /* ---------------- DOM helper ---------------- */
  const SVG_TAGS = new Set(["svg", "path", "circle", "rect", "g", "line", "polyline", "polygon", "text", "tspan", "title", "defs", "linearGradient", "stop"]);
  // Line icon from icons.js (24 x 24 grid)
  function icon(name, size, cls) {
    const spec = (window.ICONS || {})[name];
    if (!spec) return null;
    const svg = h("svg", { viewBox: "0 0 24 24", width: size || 24, height: size || 24, class: "ico " + (cls || ""), "aria-hidden": "true", focusable: "false",
      fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" });
    spec.forEach(([t, ...a]) => {
      if (t === "path") svg.append(h("path", { d: a[0] }));
      else if (t === "circle") svg.append(h("circle", { cx: a[0], cy: a[1], r: a[2], fill: a[2] < 1 ? "currentColor" : "none" }));
      else if (t === "line") svg.append(h("line", { x1: a[0], y1: a[1], x2: a[2], y2: a[3] }));
      else if (t === "rect") svg.append(h("rect", { x: a[0], y: a[1], width: a[2], height: a[3], rx: a[4] || 0 }));
    });
    return svg;
  }
  function hazardIconName(label) {
    const l = (label || "").toLowerCase();
    const m = (window.HAZARD_ICONS || []).find(([k]) => l.startsWith(k));
    return m ? m[1] : "other";
  }
  const hazardIcon = (label, size) => h("span", { class: "hz-ico hz-" + hazardIconName(label) }, icon(hazardIconName(label), size || 22));

  function h(tag, attrs, ...kids) {
    const el = SVG_TAGS.has(tag) ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.setAttribute("class", v);
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid === null || kid === undefined || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  /* ---------------- help ("i") panels ---------------- */
  function isEmptyHelp(help) {
    return !help || !(help.instructions || help.examples || help.guidance || help.moreInfo);
  }

  function helpButton(panel) {
    const btn = h("button", { type: "button", class: "info-btn", "aria-expanded": "false",
      "aria-label": "Show guidance", title: "Instructions, examples and guidance" }, "i");
    btn.addEventListener("click", () => {
      const open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.classList.toggle("on", open);
    });
    return btn;
  }

  function helpPanel(help) {
    help = help || {};
    const block = (title, text) => h("div", { class: "help-block" },
      h("div", { class: "help-title" }, title),
      text ? h("div", { class: "help-text" }, text) : h("div", { class: "help-text tbf" }, "To be filled"));
    // All links for this question: moreInfo plus any extra [label, url] pairs.
    // One link opens directly; several open a small pop-up list.
    // moreInfo: null turns the link line off completely, even if extra links are listed.
    const all = help.moreInfo === null ? []
      : (help.moreInfo ? [["More information", help.moreInfo]] : []).concat((help.links || []).filter(l => l && l[1]));
    let more;
    if (all.length === 1) more = h("a", { class: "more-link", href: all[0][1], target: "_blank", rel: "noopener" },
      (all[0][0] === "More information" ? "More information" : "More information: " + all[0][0]) + " ↗");
    else if (all.length > 1) more = linksPopup(all);
    else more = help.moreInfo === null ? null   // null = this question needs no link
      : h("span", { class: "more-link disabled", title: "A link to the resource website will be added here" }, "More information — link coming soon");
    const examples = block("Examples", help.examples);
    if (help.exampleStep) examples.append(h("button", { type: "button", class: "link-btn ex-open",
      onclick: () => openExampleStep(help.exampleStep) }, "See this step of the worked example ›"));
    const panel = h("div", { class: "help-panel", hidden: true },
      block("Instructions", help.instructions),
      examples,
      block("Guidance", help.guidance),
      more ? h("div", { class: "help-more" }, more) : null);
    return panel;
  }

  // "More information (n links)" button that opens a list of links; closes on Escape or a click elsewhere.
  function linksPopup(list, label) {
    const pop = h("div", { class: "links-pop", role: "dialog", "aria-label": (label || "More information") + " links", hidden: true },
      h("div", { class: "links-pop-title" }, label ? label.replace(/\s*\(\d+\)$/, "") : "More information"),
      h("ul", null, list.map(([label, url]) => h("li", null,
        h("a", { href: url, target: "_blank", rel: "noopener" }, label + " ↗"),
        h("span", { class: "links-pop-host" }, url.replace(/^https?:\/\/(www\.)?/, "").split(/[/#?]/)[0])))));
    const btn = h("button", { type: "button", class: "more-link more-btn", "aria-expanded": "false" },
      (label || "More information (" + list.length + " links)") + " ▾");
    const close = () => { pop.hidden = true; btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", outside, true); document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", close); };
    const outside = e => { if (!wrap.contains(e.target)) close(); };
    const esc = e => { if (e.key === "Escape") { close(); btn.focus(); } };
    const onScroll = e => { if (!pop.contains(e.target)) close(); };
    // Fixed to the window so cards that clip their content (e.g. hazard cards) cannot cut it off
    const place = () => {
      const r = btn.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
      pop.style.maxHeight = ""; const ph = pop.offsetHeight, pw = pop.offsetWidth;
      const below = vh - r.bottom - 12, above = r.top - 12;
      const up = ph > below && above > below;
      pop.style.left = Math.max(8, Math.min(r.left, vw - pw - 8)) + "px";
      pop.style.top = (up ? Math.max(8, r.top - 6 - Math.min(ph, above)) : r.bottom + 6) + "px";
      pop.style.maxHeight = Math.max(160, up ? above : below) + "px";
    };
    btn.addEventListener("click", () => {
      if (!pop.hidden) { close(); return; }
      pop.hidden = false; btn.setAttribute("aria-expanded", "true");
      place();
      document.addEventListener("click", outside, true); document.addEventListener("keydown", esc);
      window.addEventListener("scroll", onScroll, true); window.addEventListener("resize", close);
      const first = pop.querySelector("a"); if (first) first.focus();
    });
    const wrap = h("span", { class: "links-wrap" }, btn, pop);
    return wrap;
  }

  function labelWithHelp(text, help, forId, extra) {
    const panel = helpPanel(help);
    const row = h("div", { class: "label-row" },
      h("label", { class: "field-label", for: forId }, text),
      helpButton(panel), extra || null);
    return [row, panel];
  }

  function extLink(key, label) {
    const url = C.links[key];
    return url
      ? h("a", { class: "ext-link", href: url, target: "_blank", rel: "noopener" }, label + " ↗")
      : h("span", { class: "ext-link disabled", title: "Link to be added" }, label + " (link coming soon)");
  }
  // A list of [linkKey, label] pairs. Links without a URL are hidden unless none have one.
  function extLinks(list) {
    if (!list || !list.length) return null;
    const live = list.filter(([k]) => C.links[k]);
    const shown = live.length ? live : list.slice(0, 1);
    return h("span", { class: "ext-links" }, shown.map(([k, l]) => extLink(k, l)));
  }
  const linkList = o => o.links || (o.linkKey ? [[o.linkKey, o.linkLabel]] : null);

  /* ---------------- Australian date (DD/MM/YYYY) ----------------
     Native date inputs follow the computer's region setting, so we show a text box
     in DD/MM/YYYY and use the native picker only as a calendar pop-up. Stored as YYYY-MM-DD. */
  const pad = n => String(n).padStart(2, "0");
  const isoToAu = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); return m ? m[3] + "/" + m[2] + "/" + m[1] : ""; };
  function auToIso(txt) {
    const m = /^\s*(\d{1,2})[\/.\-\s](\d{1,2})[\/.\-\s](\d{2}|\d{4})\s*$/.exec(txt || "");
    if (!m) return null;
    let [d, mo, y] = [+m[1], +m[2], +m[3]];
    if (y < 100) y += 2000;
    const t = new Date(y, mo - 1, d);
    if (t.getFullYear() !== y || t.getMonth() !== mo - 1 || t.getDate() !== d) return null;
    return y + "-" + pad(mo) + "-" + pad(d);
  }
  function dateInput(id, obj, key) {
    const text = h("input", { id, type: "text", inputmode: "numeric", placeholder: "DD/MM/YYYY", autocomplete: "off" });
    text.value = isoToAu(obj[key]);
    const native = h("input", { type: "date", class: "date-native", tabindex: "-1", "aria-hidden": "true" });
    native.value = obj[key] || "";
    const msg = h("div", { class: "date-msg", hidden: true }, "Please use DD/MM/YYYY, e.g. 28/09/2026");
    text.addEventListener("input", () => {
      const v = text.value.trim();
      const iso = v ? auToIso(v) : "";
      text.classList.toggle("invalid", iso === null && v.length >= 8);
      msg.hidden = true;
      if (iso !== null) { obj[key] = iso; native.value = iso; changed(); }
    });
    text.addEventListener("blur", () => {
      const v = text.value.trim();
      if (!v) return;
      const iso = auToIso(v);
      if (iso) { text.value = isoToAu(iso); text.classList.remove("invalid"); msg.hidden = true; }
      else { text.classList.add("invalid"); msg.hidden = false; }
    });
    native.addEventListener("change", () => {
      obj[key] = native.value; text.value = isoToAu(native.value);
      text.classList.remove("invalid"); msg.hidden = true; changed();
    });
    const btn = h("button", { type: "button", class: "icon-btn date-btn", title: "Choose from calendar", "aria-label": "Choose date from calendar",
      onclick: () => { try { native.showPicker(); } catch (e) { native.focus(); native.click(); } } },
      h("span", { "aria-hidden": "true" }, "📅"));
    return h("div", null, h("div", { class: "date-wrap" }, text, btn, native), msg);
  }

  /* ---------------- generic field ---------------- */
  function field(def, obj, key, opts) {
    opts = opts || {};
    const id = "f-" + (opts.idPrefix || "") + def.id + "-" + uid();
    let input;
    const onInput = e => { obj[key] = e.target.value; changed(); if (opts.onChange) opts.onChange(); };

    if (def.type === "textarea") {
      input = h("textarea", { id, rows: def.rows || 3, oninput: onInput });
      input.value = obj[key] || "";
    } else if (def.type === "select") {
      input = h("select", { id, onchange: onInput },
        h("option", { value: "" }, "— choose —"),
        def.options.map(o => h("option", { value: o }, o)));
      input.value = obj[key] || "";
    } else if (def.type === "date") {
      input = dateInput(id, obj, key);
    } else if (def.type === "radio") {
      input = h("div", { class: "radio-group", role: "radiogroup", id });
      const name = "r-" + uid();
      def.options.forEach(o => {
        const r = h("input", { type: "radio", name, value: o, onchange: onInput });
        if (obj[key] === o) r.checked = true;
        input.append(h("label", { class: "radio" }, r, " " + o));
      });
      const clear = h("button", { type: "button", class: "link-btn", onclick: () => {
        obj[key] = ""; input.querySelectorAll("input").forEach(x => (x.checked = false)); changed();
      } }, "Clear");
      input.append(clear);
    } else {
      input = h("input", { id, type: "text", oninput: onInput });
      input.value = obj[key] || "";
    }

    const extras = [];
    if (def.searchLink) extras.push(extLink(def.searchLink, "Search list"));
    if (def.searchLinks) extras.push(linksPopup(def.searchLinks, "Search lists (" + def.searchLinks.length + ")"));   // one list per jurisdiction
    if (def.gps && navigator.geolocation) {
      extras.push(h("button", { type: "button", class: "link-btn", onclick: () => {
        navigator.geolocation.getCurrentPosition(
          p => { input.value = p.coords.latitude.toFixed(5) + ", " + p.coords.longitude.toFixed(5);
                 obj[key] = input.value; changed(); },
          () => alert("Could not get your location. Check location permission, or type the GPS in."));
      } }, "Use my location"));
    }
    const [row, panel] = labelWithHelp(opts.label || def.label, def.help, id,
      extras.length ? h("span", { class: "label-extras" }, extras) : null);
    return h("div", { class: "field" + (def.type === "radio" ? " field-radio" : "") }, row, panel, input);
  }

  function sectionHead(sec, extra) {
    const panel = helpPanel(sec.help);
    // "Step n of 7" label for the numbered planning tabs
    const steps = TABS.filter(t => !["overview", "start", "export"].includes(t.id));
    const stepNo = steps.findIndex(t => t.id === currentTab) + 1;
    return h("div", { class: "section-head" },
      stepNo ? h("span", { class: "step-kicker" }, "Step " + stepNo + " of " + steps.length) : null,
      h("div", { class: "title-row" }, h("h2", null, sec.title), helpButton(panel), extra || null),
      panel,
      sec.intro ? h("p", { class: "intro" }, sec.intro) : null);
  }

  /* ---------------- actions helpers ---------------- */
  function allActions() {
    const out = [];
    plan.actions.existing.forEach(a => out.push({ ...a, type: "existing" }));
    plan.actions.potential.forEach(a => out.push({ ...a, type: "potential" }));
    return out.map((a, i) => ({ ...a, num: i + 1 }));
  }
  const namedActions = () => allActions().filter(a => (a.text || "").trim());

  function scoreOf(actionId) {
    // All seven criteria count. 0 = unknown / limited information: it adds nothing to the total but is counted,
    // so gaps in knowledge are visible. Cultural considerations are recorded separately and are not scored.
    const s = plan.scores[actionId] || {};
    if (s.cultural === "D") s.cultural = "U";   // older drafts: "to be discussed" is now "unknown"
    const cultural = s.cultural || "";
    let total = 0, n = 0, unknown = 0;
    C.scoring.criteria.forEach(c => {
      if (s[c.id] !== undefined && s[c.id] !== "") { total += Number(s[c.id]); n++; if (String(s[c.id]) === "0") unknown++; }
    });
    return { total, n, unknown, complete: n === C.scoring.criteria.length, max: C.scoring.criteria.length * 3, cultural, excluded: false };
  }
  function scoreText(actionId) {
    const s = scoreOf(actionId);
    if (!s.n) return "\u2014";
    return s.total + "/" + s.max + (s.complete ? "" : " (incomplete)") + (s.unknown ? " \u00b7 " + s.unknown + " unknown" : "");
  }
  function pathwayActionName(p) {
    if (p.actionId) {
      const a = allActions().find(x => x.id === p.actionId);
      if (a) return (a.text || "").trim() || "Action " + a.num;
    }
    return (p.actionText || "").trim();
  }

  /* ---------------- tab renderers ---------------- */
  const R = {};

  /* ---------------- overview tab ---------------- */
  const clone = o => JSON.parse(JSON.stringify(o));

  function ovBody(items) {
    return items.map(it => {
      if (typeof it === "string") return h("p", null, it);
      if (it.list) return h("ul", { class: "ov-list" }, it.list.map(x => h("li", null, x)));
      if (it.def) return h("div", { class: "ov-def" + (it.icon ? " with-ico" : "") }, it.icon ? hazardIcon(it.def, 22) : null, h("strong", null, it.def), " ", it.text,
        it.source ? h("span", { class: "ov-source" }, " (" + it.source + ")") : null);
      if (it.figure) return h("figure", { class: "ov-figure" },
        h("a", { href: it.figure, target: "_blank", rel: "noopener", title: "Open full size" }, h("img", { src: it.figure, alt: it.alt || "", loading: "lazy" })),
        h("figcaption", null, it.caption || "", h("a", { href: it.figure, target: "_blank", rel: "noopener" }, "Open full size ↗")));
      if (it.links) return h("div", { class: "ov-links" }, h("span", { class: "ov-links-label" }, "Read more:"),
        h("ul", null, it.links.map(([l, u]) => h("li", null, h("a", { href: u, target: "_blank", rel: "noopener" }, l + " ↗")))));
      return null;
    });
  }

  function scenarioExplorer() {
    const O = window.OVERVIEW, MAX = 6;
    const pct = v => (v / MAX * 100) + "%";
    const detail = h("div", { class: "ssp-detail", "aria-live": "polite" });
    const rows = h("div", { class: "ssp-chart", role: "radiogroup", "aria-label": "Climate scenarios" });
    const show = sc => {
      rows.querySelectorAll(".ssp-row").forEach(r => r.classList.toggle("on", r.dataset.id === sc.id));
      rows.querySelectorAll(".ssp-row").forEach(r => r.setAttribute("aria-checked", String(r.dataset.id === sc.id)));
      detail.replaceChildren(
        h("div", { class: "ssp-detail-head" }, h("span", { class: "ssp-id" }, sc.id), " " + sc.name),
        h("div", { class: "ssp-warming" }, h("strong", null, "+" + sc.best.toFixed(1) + "°C"),
          " by 2081–2100 (very likely range " + sc.low.toFixed(1) + "–" + sc.high.toFixed(1) + "°C)"),
        h("p", null, sc.text));
    };
    O.scenarios.forEach((sc, i) => {
      const row = h("button", { type: "button", class: "ssp-row s" + i, "data-id": sc.id, role: "radio", onclick: () => show(sc) },
        h("span", { class: "ssp-label" }, sc.id),
        h("span", { class: "ssp-track" },
          h("span", { class: "ssp-goal", style: "left:" + pct(1.5) }), h("span", { class: "ssp-goal two", style: "left:" + pct(2) }),
          h("span", { class: "ssp-range", style: "left:" + pct(sc.low) + ";width:" + pct(sc.high - sc.low) }),
          h("span", { class: "ssp-best", style: "left:" + pct(sc.best) })),
        h("span", { class: "ssp-val" }, "+" + sc.best.toFixed(1) + "°C"));
      rows.append(row);
    });
    const axis = h("div", { class: "ssp-axis" }, h("span", { class: "ssp-label" }),
      h("span", { class: "ssp-ticks" }, [0, 1, 2, 3, 4, 5, 6].map(t => h("span", { style: "left:" + pct(t) }, t + "°"))),
      h("span", { class: "ssp-val" }));
    show(O.scenarios[2]);
    return h("div", { class: "ov-widget" }, rows, axis,
      h("p", { class: "ssp-legend" }, "Bar = very likely range, dot = best estimate. Dashed lines mark the Paris Agreement goals of 1.5°C and 2°C."),
      detail, h("p", { class: "ov-source" }, O.scenarioSource));
  }

  function riskDiagram() {
    const O = window.OVERVIEW;
    const out = h("div", { class: "risk-detail", "aria-live": "polite" });
    const btns = [];
    const pick = p => {
      btns.forEach(b => b.classList.toggle("on", b.dataset.id === p.id));
      out.replaceChildren(h("strong", null, p.label + ": "), p.text);
    };
    const parts = [];
    O.riskParts.forEach((p, i) => {
      const b = h("button", { type: "button", class: "risk-part rp-" + p.id, "data-id": p.id, onclick: () => pick(p) }, p.label);
      btns.push(b);
      if (i) parts.push(h("span", { class: "risk-op", "aria-hidden": "true" }, "×"));
      parts.push(b);
    });
    parts.push(h("span", { class: "risk-op", "aria-hidden": "true" }, "="), h("span", { class: "risk-part rp-risk" }, "Climate risk"));
    pick(O.riskParts[0]);
    return h("div", { class: "ov-widget" }, h("p", { class: "note", style: "margin:0 0 8px" }, "Click each part to see what it means."), h("div", { class: "risk-eq" }, parts),
      h("div", { class: "risk-sub" }, "Vulnerability = sensitivity − adaptive capacity"), out);
  }

  function processSteps() {
    return h("ol", { class: "ov-steps" }, window.OVERVIEW.steps.map((s, i) =>
      h("li", null, h("button", { type: "button", class: "ov-step", onclick: () => go(s.tab) },
        h("span", { class: "ov-step-num" }, i + 1),
        h("span", { class: "ov-step-text" }, h("strong", null, s.label), h("span", null, s.text)),
        h("span", { class: "ov-step-go", "aria-hidden": "true" }, "→")))));
  }

  /* ---- worked example viewer ---- */
  function exampleScore(E, id) {
    const s = E.scores[id] || {};
    const unk = C.scoring.criteria.filter(c => String(s[c.id]) === "0").length;
    return C.scoring.criteria.reduce((t, c) => t + Number(s[c.id] || 0), 0) + "/21" + (unk ? " (" + unk + " unknown)" : "");
  }

  function exampleSteps(E) {
    const acts = [...E.actions.existing.map(a => ({ ...a, type: "Existing" })), ...E.actions.potential.map(a => ({ ...a, type: "Potential" }))]
      .map((a, i) => ({ ...a, num: i + 1 }));
    const actName = id => { const a = acts.find(x => x.id === id); return a ? a.num + ". " + a.text : ""; };
    const kv = rows => h("dl", { class: "ex-kv" }, rows.filter(r => r[1]).map(([k, v]) => [h("dt", null, k), h("dd", null, v)]));
    const PRI = C.risk.priorityOptions;
    const key = E.risk.hazards.filter(x => PRI.indexOf(x.priority) >= PRI.indexOf("High"))
      .sort((a, b) => PRI.indexOf(b.priority) - PRI.indexOf(a.priority));
    const focus = key.filter(x => /Heatwaves|Cyclones/.test(x.label));
    const others = E.risk.hazards.filter(x => !focus.includes(x) && x.priority);

    return [
      { id: "plan", title: "1. Plan and species", body: () => [
        kv([["Plan title", E.start.planTitle], ["Plan focus", E.start.planFocus], ["Purpose", E.start.purpose],
            ["Species", E.species.name], ["Habitat and needs", E.species.habitat], ["Why it matters", E.species.importance],
            ["Status", "Federal (EPBC): " + E.species.epbc + " · " + (E.species.state || "State or territory") + ": " + E.species.qld]])] },
      { id: "site", title: "2. Site", body: () => [
        h("p", { class: "ex-note" }, "The site is illustrative."),
        kv([["Place", E.site.placeName], ["Environment", E.site.environment], ["Existing plans", E.site.mgmtPlans],
            ["Reason for assessment", E.site.reason], ["Seasonal notes", E.site.seasonal]])] },
      { id: "hazards", title: "3. Hazards and exposure", body: () => [
        h("p", null, "Two priority hazards are worked through in detail. The others were rated more briefly."),
        focus.map(hz => h("div", { class: "ex-hazard" }, h("div", { class: "ex-hazard-head" }, hazardIcon(hz.label, 22), h("strong", null, hz.label),
          h("span", { class: "pri", "data-level": hz.priority }, hz.priority)), h("p", null, h("em", null, "Exposure: "), hz.exposure))),
        h("table", { class: "ex-table" }, h("thead", null, h("tr", null, h("th", null, "Other hazards"), h("th", null, "Priority"))),
          h("tbody", null, others.map(hz => h("tr", null, h("td", null, hz.label), h("td", null, h("span", { class: "pri", "data-level": hz.priority }, hz.priority))))))] },
      { id: "vuln", title: "4. Vulnerability and adaptive capacity", body: () =>
        focus.map(hz => h("div", { class: "ex-hazard" }, h("div", { class: "ex-hazard-head" }, h("strong", null, hz.label)),
          h("p", null, h("em", null, "Sensitivity (how it is affected): "), hz.impact),
          h("p", null, h("em", null, "Adaptive capacity (ability to adapt): "), hz.adapt))) },
      { id: "actions", title: "5. Existing and planned actions", body: () => [
        h("p", null, "Each action is scored on seven criteria (3 = good, 2 = OK, 1 = bad, 0 = unknown or limited information), and each action\u2019s cultural acceptability is recorded alongside. Action 6 shows how scoring flags a risky option, and action 4 shows an unknown (not yet discussed with landholders)."),
        h("table", { class: "ex-table" }, h("thead", null, h("tr", null, h("th", null, "#"), h("th", null, "Action"), h("th", null, "Type"), h("th", null, "Helps with"), h("th", null, "Score"))),
          h("tbody", null, acts.map(a => h("tr", null, h("td", null, a.num), h("td", null, a.text), h("td", null, a.type), h("td", null, a.how),
            h("td", { class: "ex-score" }, exampleScore(E, a.id)))))),
        exampleScoreTable(E, acts)] },
      { id: "pathways", title: "6. Pathways", body: () => [
        h("p", null, "Actions to start now, and actions held for later with the signals that trigger them."),
        exampleMap(E),
        E.pathway.map(p => h("div", { class: "ex-path" }, h("div", { class: "ex-path-head" }, h("span", { class: "when " + p.timing.toLowerCase() }, p.timing), h("strong", null, actName(p.actionId))),
          kv([["Pre-conditions", p.preconditions], ["Short-term goal", p.shortGoal], ["Long-term goal", p.longGoal], ["Trigger", p.trigger], ["Turning point", p.turning],
              ["Improved / additional action", p.improved], ["Stopping point", p.stopping]])))] },
      { id: "outputs", title: "7. What you can download", body: () => [
        h("p", null, "The Export tab produces a report in Word (.docx, to keep editing) and PDF (to share or print). Both contain:"),
        h("ul", { class: "ov-list" },
          h("li", null, "Cover with plan title, focus and purpose, followed by species and site details"),
          h("li", null, "Risk assessment table, with priority colour-coded"),
          h("li", null, "Existing and potential actions, with scores"),
          h("li", null, "Scoring table, with unknowns counted and cultural acceptability in the last column"),
          h("li", null, "Pathway planning table, including pre-conditions"),
          h("li", null, "Adaptation pathways map along increasing climate risk, with a table of triggers, turning points and stopping points"),
          h("li", null, "One-page summary poster with the species photo")),
        h("p", null, "Download this example to see the result, or load it into the tool to explore and edit it."),
        exampleButtons()] }
    ];
  }

  // The example's pathway map (from the Pathway builder), drawn read-only by briefly swapping in the example plan
  function exampleMap(E) {
    if (!window.PathBuilder || !window.PathBuilder.preview || !(E.pathwayBuilder || {}).lines) return null;
    const saved = plan;
    try {
      plan = migrate(clone(E));
      const svg = window.PathBuilder.preview();
      return svg ? h("figure", { class: "ex-pbmap" },
        h("div", { class: "pb-scroll" }, svg),
        h("figcaption", null, "Pathway map: each action is a line along increasing climate risk, from low (light) to extreme (dark). ",
          h("b", { style: "color:#2b6cb0" }, "Triggers"), ", ", h("b", { style: "color:#b07c00" }, "turning points"), " and ",
          h("b", { style: "color:#c62828" }, "stopping points"), " sit at the level of risk where the group would act; branches show improved or additional actions.")) : null;
    } finally { plan = saved; }
  }

  function exampleButtons() {
    const status = h("span", { class: "export-status", role: "status" });
    const dl = async (fn, label) => {
      status.textContent = "Preparing " + label + "…";
      const saved = plan;
      try { plan = migrate(clone(window.EXAMPLE_PLAN)); await fn(plan, "Worked example - Spectacled flying-fox"); status.textContent = label + " downloaded."; }
      catch (e) { console.error(e); status.textContent = "Sorry, the " + label + " could not be created: " + e.message; }
      finally { plan = saved; }
    };
    return h("div", { class: "btn-row ex-buttons" },
      h("button", { type: "button", class: "btn primary", onclick: () => dl(window.ReportExport.docx, "example Word document") }, "Download example (Word)"),
      h("button", { type: "button", class: "btn primary", onclick: () => dl(window.ReportExport.pdf, "example PDF") }, "Download example (PDF)"),
      h("button", { type: "button", class: "btn secondary", onclick: () => {
        if (!confirm("Load the worked example into the tool?\n\nThis replaces the plan currently in the tool. Save a plan file first if you want to keep it.")) return;
        plan = migrate(clone(window.EXAMPLE_PLAN)); changed(); go("start");
      } }, "Load example into the tool"),
      status);
  }

  // The example's scoring table: each criterion 0–3 (coloured as on the Scoring tab), total and cultural acceptability
  function exampleScoreTable(E, acts) {
    const crit = C.scoring.criteria, CUL = Object.fromEntries((C.scoring.cultural.options || []).map(o => [o[0], o[1]]));
    return [h("h5", { class: "ex-subhead" }, "Scoring table"),
      h("div", { class: "ex-scores-wrap" }, h("table", { class: "ex-table ex-scores" },
        h("thead", null, h("tr", null, h("th", null, "#"), h("th", null, "Action"),
          crit.map(c => h("th", { class: "num" }, c.short || c.label)), h("th", { class: "num" }, "Total"), h("th", null, "Cultural acceptability"))),
        h("tbody", null, acts.map(a => {
          const s = E.scores[a.id] || {}, code = s.cultural === "D" ? "U" : s.cultural;
          return h("tr", null, h("td", null, a.num), h("td", null, a.text),
            crit.map(c => h("td", { class: "num", "data-score": s[c.id] }, s[c.id])),
            h("td", { class: "num ex-score" }, exampleScore(E, a.id).replace("/21", "")),
            h("td", { "data-cultural": code }, (CULT_ICON[code] || "") + " " + (CUL[code] || "")));
        })))),
      h("p", { class: "ex-note" }, "3 = good, 2 = OK, 1 = bad, 0 = unknown or limited information. For Cost and Risk, 3 = lowest cost or lowest risk.")];
  }

  // One step of the worked example in a pop-over window (opened from an ⓘ panel's Examples)
  function openExampleStep(id) {
    const step = exampleSteps(window.EXAMPLE_PLAN).find(s => s.id === id);
    if (!step) return;
    const opener = document.activeElement;
    const close = () => { back.remove(); document.removeEventListener("keydown", esc); if (opener && opener.focus) opener.focus(); };
    const esc = e => { if (e.key === "Escape") close(); };
    const closeBtn = h("button", { type: "button", class: "btn ghost small", onclick: close }, "Close ✕");
    const back = h("div", { class: "ex-modal-back", onclick: e => { if (e.target === back) close(); } },
      h("div", { class: "ex-modal", role: "dialog", "aria-modal": "true", "aria-label": "Worked example: " + step.title },
        h("div", { class: "ex-modal-head" },
          h("div", null, h("span", { class: "ex-badge" }, "Worked example"), " ", h("strong", null, "Spectacled flying-fox – " + step.title)),
          closeBtn),
        h("div", { class: "ex-content" }, ...[step.body()].flat(Infinity).filter(Boolean)),
        h("p", { class: "note" }, "The full example, with Word and PDF downloads, is on the Overview tab under “Worked example”.")));
    document.body.append(back);
    document.addEventListener("keydown", esc);
    closeBtn.focus();
  }

  function exampleViewer() {
    const O = window.OVERVIEW, E = window.EXAMPLE_PLAN;
    const steps = exampleSteps(E);
    let idx = 0;
    const content = h("div", { class: "ex-content", "aria-live": "polite" });
    const sel = h("select", { "aria-label": "Choose a step of the worked example", onchange: e => { idx = Number(e.target.value); paint(); } },
      steps.map((s, i) => h("option", { value: i }, s.title)));
    const prev = h("button", { type: "button", class: "btn ghost small", onclick: () => { if (idx > 0) { idx--; paint(); } } }, "← Previous");
    const next = h("button", { type: "button", class: "btn primary small", onclick: () => { if (idx < steps.length - 1) { idx++; paint(); } } }, "Next →");
    function paint() {
      sel.value = String(idx);
      prev.disabled = idx === 0; next.disabled = idx === steps.length - 1;
      content.replaceChildren(h("h4", null, steps[idx].title), ...[steps[idx].body()].flat(Infinity).filter(Boolean));
    }
    paint();
    return h("details", { class: "ov-example" },
      h("summary", null, h("span", { class: "ex-badge" }, "Worked example"), h("span", { class: "ex-title" }, "Spectacled flying-fox"),
        h("span", { class: "ex-hint" }, "Click to open")),
      h("div", { class: "ex-inner" },
        h("p", null, O.example.intro),
        h("div", { class: "ex-nav" }, h("label", null, "Step: ", sel), h("span", { class: "ex-nav-btns" }, prev, next)),
        content,
        h("div", { class: "ov-links" }, h("span", { class: "ov-links-label" }, "Sources:"),
          h("ul", null, O.example.sources.map(([l, u]) => h("li", null, h("a", { href: u, target: "_blank", rel: "noopener" }, l + " ↗")))))));
  }

  // Photo with placeholder: shows the image if the file exists in app/photos, otherwise a styled placeholder.
  function photo(key, alt, cls) {
    const src = (window.OVERVIEW.photos || {})[key];
    const wrap = h("div", { class: "ph " + (cls || "") },
      h("div", { class: "ph-empty", "aria-hidden": "true" },
        h("svg", { viewBox: "0 0 24 24", width: "34", height: "34" },
          h("path", { fill: "currentColor", d: "M21 5H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Zm-1 12H4l4.5-6 3.5 4.5 2.5-3L20 17ZM16.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" })),
        src ? h("span", null, "Photo: " + src.replace(/^photos\//, "")) : null));
    const fallback = (window.OVERVIEW.illustrations || {})[key];
    if (src || fallback) {
      const img = h("img", { alt: alt || "", loading: "lazy" });
      img.addEventListener("load", () => wrap.classList.add("has-img"));
      img.addEventListener("error", () => {
        if (fallback && img.getAttribute("src") !== fallback) { img.src = fallback; wrap.classList.add("is-illustration"); }
        else img.remove();
      });
      img.src = src || fallback;
      wrap.append(img);
    }
    return wrap;
  }

  const sectionTitle = (text, extra) => h("div", { class: "ovp-head" }, h("h2", null, text), extra || null);

  R.overview = el => {
    const O = window.OVERVIEW;
    const page = h("div", { class: "ovp" });

    // --- hero
    let exampleEl;
    const hero = h("section", { class: "ovp-hero" }, photo("hero", "", "ovp-hero-img"),
      h("div", { class: "ovp-hero-shade" }),
      h("div", { class: "ovp-wrap ovp-hero-text" },
        h("span", { class: "ovp-accent" }),
        h("h1", null, O.hero.title),
        h("p", null, O.hero.subtitle),
        h("div", { class: "btn-row" },
          h("button", { type: "button", class: "ovp-btn", onclick: () => go("start") }, O.hero.primary + " ›"),
          h("button", { type: "button", class: "ovp-btn ghost", onclick: () => {
            exampleEl.open = true; exampleEl.scrollIntoView({ behavior: "smooth", block: "start" });
          } }, O.hero.secondary + " ›"))));

    // --- teal band
    const band = h("section", { class: "ovp-band" }, h("div", { class: "ovp-wrap" },
      h("h2", null, O.band.title), h("span", { class: "ovp-accent light" }),
      O.band.paragraphs.map(p => h("p", null, p))));

    // --- topic cards + detail panel
    const topics = O.topics.filter(t => !t.processSteps);
    const detail = h("div", { class: "ovp-detail", hidden: true, "aria-live": "polite" });
    const cards = [];
    const openTopic = t => {
      const already = !detail.hidden && detail.dataset.id === t.id;
      cards.forEach(c => { c.classList.toggle("on", !already && c.dataset.id === t.id); c.setAttribute("aria-expanded", String(!already && c.dataset.id === t.id)); });
      if (already) { detail.hidden = true; detail.dataset.id = ""; return; }
      detail.dataset.id = t.id;
      detail.replaceChildren(
        h("div", { class: "ovp-detail-head" }, h("h3", null, t.title),
          h("button", { type: "button", class: "icon-btn", "aria-label": "Close", onclick: () => openTopic(t) }, "✕")),
        h("div", { class: "ov-body" }, ovBody(t.body),
          t.riskDiagram ? riskDiagram() : null,
          t.scenarioExplorer ? scenarioExplorer() : null));
      detail.hidden = false;
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    const grid = h("div", { class: "ovp-cards" }, topics.map(t => {
      const c = h("button", { type: "button", class: "ovp-card", "data-id": t.id, "aria-expanded": "false", onclick: () => openTopic(t) },
        photo(t.id, ""),
        h("span", { class: "ovp-card-cap" }, h("strong", null, t.title), h("span", null, t.blurb || ""),
          h("span", { class: "ovp-more" }, "Read more ›")));
      cards.push(c);
      return c;
    }));
    const topicsSec = h("section", { class: "ovp-sec" }, h("div", { class: "ovp-wrap" },
      sectionTitle(O.topicsHeading), h("p", { class: "ovp-lead" }, O.topicsIntro), grid, detail));

    // --- climate data guide: map image with a clickable pin on each state/territory
    const D = O.dataSources;
    const dataSec = D ? h("section", { class: "ovp-sec grey" }, h("div", { class: "ovp-wrap" },
      sectionTitle(D.heading), h("p", { class: "ovp-lead" }, D.intro),
      h("figure", { class: "ovp-infographic" },
        h("div", { class: "ovp-ig-frame" },
          h("img", { src: D.image, alt: D.alt, loading: "lazy" }),
          D.pins.map(pt => h("a", { class: "map-pin" + (pt.kind ? " " + pt.kind : "") + (pt.small ? " small" : ""), href: pt.url, target: "_blank", rel: "noopener",
            style: "left:" + pt.x + "%;top:" + pt.y + "%", "aria-label": pt.code + ": open " + pt.name + " (opens in a new tab)" },
            h("span", { class: "map-pin-dot", "aria-hidden": "true" }),
            h("span", { class: "map-pin-label" }, pt.code),
            h("span", { class: "map-pin-tip", role: "tooltip" }, pt.name, h("em", null, "Click to open ↗"))))),
        h("figcaption", null, D.credit)),
      h("div", { class: "portal-groups" }, D.groups.map(g => h("div", { class: "portal-group" },
        h("h3", null, g.title), h("p", null, g.text),
        h("ul", null, g.links.map(([l, u]) => h("li", null, h("a", { href: u, target: "_blank", rel: "noopener" }, l + " ↗"))))))))) : null;

    // Clicking a step opens its details below the step cards (click again to close).
    const stepDetail = h("div", { class: "ovp-detail", hidden: true, "aria-live": "polite" });
    const stepBtns = [];
    const openStep = (s, i) => {
      const already = !stepDetail.hidden && stepDetail.dataset.i === String(i);
      stepBtns.forEach((b, j) => { const on = !already && j === i; b.classList.toggle("on", on); b.setAttribute("aria-expanded", String(on)); });
      if (already) { stepDetail.hidden = true; stepDetail.dataset.i = ""; return; }
      stepDetail.dataset.i = String(i);
      stepDetail.replaceChildren(
        h("div", { class: "ovp-detail-head" },
          h("h3", null, h("span", { class: "ovp-step-num inline" }, i + 1), icon((window.STEP_ICONS || {})[s.tab], 26, "ovp-step-ico inline"), s.label),
          h("button", { type: "button", class: "icon-btn", "aria-label": "Close", onclick: () => openStep(s, i) }, "✕")),
        h("div", { class: "ov-body ovp-step-body" },
          s.about ? h("p", null, s.about) : null,
          s.doing ? [h("h4", null, "What you will do"), h("ul", { class: "ov-list" }, s.doing.map(d => h("li", null, d)))] : null,
          s.tip ? h("div", { class: "ov-def" }, h("strong", null, "Tip:"), " ", s.tip) : null,
          h("div", { class: "ovp-step-nav" },
            i > 0 ? h("button", { type: "button", class: "ovp-btn outline small", onclick: () => openStep(O.steps[i - 1], i - 1) }, "‹ Step " + i) : h("span"),
            i < O.steps.length - 1 ? h("button", { type: "button", class: "ovp-btn outline small", onclick: () => openStep(O.steps[i + 1], i + 1) }, "Step " + (i + 2) + " ›") : h("span"))));
      stepDetail.hidden = false;
      stepDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    const processSec = h("section", { class: "ovp-sec" }, h("div", { class: "ovp-wrap" },
      sectionTitle(O.processHeading), h("p", { class: "ovp-lead" }, O.processIntro),
      h("ol", { class: "ovp-steps" }, O.steps.map((s, i) => {
        const b = h("button", { type: "button", class: "ovp-step", "aria-expanded": "false", onclick: () => openStep(s, i) },
          h("span", { class: "ovp-step-top" }, h("span", { class: "ovp-step-num" }, i + 1), icon((window.STEP_ICONS || {})[s.tab], 28, "ovp-step-ico")),
          h("strong", null, s.label), h("span", null, s.text),
          h("span", { class: "ovp-more" }, "Read more ›"));
        stepBtns.push(b);
        return h("li", null, b);
      })),
      stepDetail));

    // --- worked example
    exampleEl = exampleViewer();
    const exSec = h("section", { class: "ovp-sec grey" }, h("div", { class: "ovp-wrap" },
      sectionTitle(O.exampleHeading),
      h("div", { class: "ovp-feature" }, photo("example", "Spectacled flying-fox", "ovp-feature-img"),
        h("div", { class: "ovp-feature-text" },
          h("span", { class: "ovp-kicker" }, "Case study · Cairns region, Queensland"),
          h("h3", null, "Spectacled flying-fox"),
          h("p", null, O.example.intro),
          h("button", { type: "button", class: "ovp-btn", onclick: () => { exampleEl.open = true; exampleEl.scrollIntoView({ behavior: "smooth", block: "start" }); } },
            "Open the worked example ›"))),
      exampleEl));

    // --- resources
    const resSec = h("section", { class: "ovp-sec" }, h("div", { class: "ovp-wrap" },
      sectionTitle(O.resourcesHeading),
      h("ul", { class: "ovp-res" }, O.resources.map(r => h("li", null,
        h("a", { href: r.url, target: "_blank", rel: "noopener" },
          h("span", { class: "ovp-res-icon", "aria-hidden": "true" },
            h("svg", { viewBox: "0 0 24 24", width: "26", height: "26" },
              h("path", { fill: "none", stroke: "currentColor", "stroke-width": "1.6", d: "M7 3h7l5 5v13H7zM14 3v5h5M10 12h6M10 15h6M10 18h4" }))),
          h("span", null, h("strong", null, r.title + " ↗"), h("span", null, r.text))))))));

    // --- footer
    const foot = h("section", { class: "ovp-foot" }, h("div", { class: "ovp-wrap" },
      h("p", null, O.acknowledgement), O.footerNote ? h("p", { class: "small" }, O.footerNote) : null));

    page.append(hero, band, topicsSec, dataSec, processSec, exSec, resSec, foot);
    el.append(page);
  };


  R.start = el => {
    el.append(sectionHead(C.start));
    const grid = h("div", { class: "grid-2" });
    C.start.fields.forEach(f => grid.append(field(f, plan.start, f.id)));
    el.append(grid);
    el.append(h("div", { class: "card soft" },
      h("h3", null, "How it works"),
      h("ol", { class: "steps" },
        h("li", null, "Fill in each tab in order. Tap the ", h("span", { class: "info-inline" }, "i"),
          " next to any question for instructions, examples and guidance."),
        h("li", null, "Your work saves automatically in this browser. Use ", h("b", null, "Save plan file"),
          " to keep a copy you can reopen on any computer."),
        h("li", null, "On the ", h("b", null, "Summary"), " tab, upload a photo of the species and draft the one-page summary."),
        h("li", null, "On the ", h("b", null, "Export"), " tab, download your report as Word (.docx) or PDF."))));
    if (window.MergeTool) el.append(window.MergeTool.startCard());
  };

  const simpleTab = key => el => {
    const sec = C[key];
    const extra = extLinks(linkList(sec));
    el.append(sectionHead(sec, extra));
    const card = h("div", { class: "card" });
    sec.fields.forEach(f => card.append(field(f, plan[key], f.id)));
    el.append(card);
  };
  R.species = simpleTab("species");
  R.site = el => {
    simpleTab("site")(el);
    // "Import a site assessment" (from the Site assessment app or Fulcrum) goes just under the heading
    const head = el.querySelector(".section-head");
    if (window.SiteImport && head) head.after(window.SiteImport.card());
    el.append(sitePhotosCard());
  };

  /* Site photos: uploaded on the Site tab, printed as an appendix in the reports */
  function sitePhotosCard() {
    const list = plan.site.photos = plan.site.photos || [];
    const help = (C.site.photosHelp) || {};
    const panel = helpPanel(help);
    const status = h("span", { class: "export-status", role: "status" });
    const fileIn = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp", multiple: true, id: "sitePhotoFiles", class: "visually-hidden",
      onchange: async e => {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        let added = 0;
        for (const f of files) {
          status.textContent = "Adding photo " + (added + 1) + " of " + files.length + "\u2026";
          try { const p = await readPhoto(f, 1400, 0.8); list.push({ id: uid(), ...p, caption: "" }); added++; }
          catch (err) { alert(f.name + ": " + err.message); }
        }
        changed(); render();
      } });
    const move = (i, d) => { const j = i + d; if (j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; changed(); render(); };
    const grid = h("div", { class: "site-photos" }, list.map((p, i) => h("figure", { class: "site-photo" },
      h("div", { class: "site-photo-img" }, h("img", { src: p.data, alt: p.caption || "Site photo " + (i + 1) }),
        h("span", { class: "site-photo-num" }, "Photo " + (i + 1))),
      h("label", { class: "field-label", for: "cap-" + p.id }, "Caption"),
      h("textarea", { id: "cap-" + p.id, rows: 2, placeholder: "e.g. View east along the creek from photo point PP1, October 2026",
        oninput: e => { p.caption = e.target.value; changed(); } }, ),
      h("div", { class: "site-photo-tools" },
        h("button", { type: "button", class: "icon-btn", title: "Move earlier", "aria-label": "Move photo " + (i + 1) + " earlier", disabled: i === 0, onclick: () => move(i, -1) }, "\u2191"),
        h("button", { type: "button", class: "icon-btn", title: "Move later", "aria-label": "Move photo " + (i + 1) + " later", disabled: i === list.length - 1, onclick: () => move(i, 1) }, "\u2193"),
        h("button", { type: "button", class: "icon-btn danger", title: "Remove photo", "aria-label": "Remove photo " + (i + 1),
          onclick: () => { if (confirm("Remove photo " + (i + 1) + "?")) { list.splice(i, 1); changed(); render(); } } }, "\u2715")))));
    grid.querySelectorAll("textarea").forEach((t, i) => { t.value = list[i].caption || ""; });
    return h("div", { class: "card" },
      h("div", { class: "title-row" }, h("h3", null, "Site photos"), helpButton(panel)), panel,
      h("p", { class: "note", style: "margin-top:0" }, "Photos are added to the Word and PDF reports as an appendix, numbered in the order shown, with their captions."),
      list.length ? grid : h("div", { class: "photo-empty site-photos-empty" }, "No site photos yet"),
      h("div", { class: "btn-row", style: "margin-top:12px;align-items:center" },
        h("label", { class: "btn secondary upload", for: "sitePhotoFiles" }, "+ Add photos"), fileIn, status),
      list.length > 6 ? h("p", { class: "note" }, "Tip: many photos can fill this browser\u2019s storage. Use \u201cSave plan file\u201d to keep a safe copy.") : null);
  }

  R.risk = el => {
    el.append(sectionHead(C.risk));
    const cols = C.risk.columns;
    plan.risk.hazards.forEach((hz, idx) => {
      const card = h("div", { class: "card hazard" });
      // Teal title band with a matching illustration fading in on the right
      const art = h("div", { class: "hazard-band-art", "aria-hidden": "true",
        style: "background-image:url('illustrations/hazards/" + hazardIconName(hz.label) + ".svg')" });
      const head = h("div", { class: "hazard-head hazard-band" }, art, hazardIcon(hz.label, 24));
      if (hz.custom) {
        const nameIn = h("input", { type: "text", class: "hazard-name-input", "aria-label": "Hazard name",
          value: hz.label, oninput: e => { hz.label = e.target.value; changed(); } });
        head.append(nameIn);
        head.append(h("button", { type: "button", class: "icon-btn danger", title: "Remove this hazard",
          onclick: () => { if (confirm("Remove this hazard?")) { plan.risk.hazards.splice(idx, 1); changed(); render(); } } }, "✕"));
      } else {
        head.append(h("h3", null, hz.label));
      }
      const hl = extLinks((C.risk.hazardLinks || {})[hz.label]);
      if (hl) head.append(hl);
      card.append(head);
      const grid = h("div", { class: "grid-hazard" });
      cols.forEach(c => {
        const def = c.id === "priority"
          ? { id: c.id, label: c.label, type: "select", options: C.risk.priorityOptions, help: c.help }
          : { id: c.id, label: c.label, type: "textarea", rows: 3, help: c.help };
        const f = field(def, hz, c.id, { label: c.group + ": " + c.label });
        // pop-up link lists (e.g. hazard maps or recovery plans for each state and territory)
        (c.popups || []).forEach(pp => f.querySelector(".label-row").append(linksPopup(pp.list, pp.label + " (" + pp.list.length + ")")));
        const cl = extLinks(linkList(c));
        if (cl) f.querySelector(".label-row").append(cl);
        if (c.id === "priority") {
          const sel = f.querySelector("select");
          const paint = () => { sel.dataset.level = sel.value; };
          sel.addEventListener("change", paint); paint();
        }
        grid.append(f);
      });
      card.append(grid);
      el.append(card);
    });
    el.append(h("button", { type: "button", class: "btn secondary", onclick: () => {
      plan.risk.hazards.push({ id: uid(), label: "Other", custom: true }); changed(); render();
    } }, "+ Add another hazard"));
  };

  R.actions = el => {
    el.append(sectionHead(C.actions));
    const AL = C.actions.adaptlog;
    if (AL) el.append(h("div", { class: "callout adaptlog-callout" },
      h("div", { class: "callout-title" }, AL.title),
      h("p", null, AL.text),
      h("a", { href: AL.url, target: "_blank", rel: "noopener", class: "btn secondary" }, AL.linkLabel + " ↗")));
    const all = allActions();
    const group = (type, title, help) => {
      const list = plan.actions[type];
      const panel = helpPanel(help);
      const card = h("div", { class: "card" },
        h("div", { class: "title-row" }, h("h3", null, title), helpButton(panel)), panel);
      list.forEach((a, i) => {
        const num = all.find(x => x.id === a.id).num;
        const row = h("div", { class: "action-row" },
          h("div", { class: "action-num" }, num),
          h("div", { class: "action-fields" },
            field({ id: "text", label: "Action", type: "textarea", rows: 2, help: help }, a, "text"),
            field({ id: "how", label: "How does this help the species or ecosystem adapt to climate change hazards?", type: "textarea", rows: 2, help: C.actions.howHelp }, a, "how")),
          h("div", { class: "action-side" },
            h("div", { class: "score-pill", title: "Score from the Scoring tab" }, h("small", null, "Score"), scoreText(a.id)),
            h("button", { type: "button", class: "icon-btn danger", title: "Remove action", onclick: () => {
              if (((a.text || "") + (a.how || "")).trim() && !confirm("Remove this action and its score?")) return;
              list.splice(i, 1); delete plan.scores[a.id]; changed(); render();
            } }, "✕")));
        card.append(row);
      });
      card.append(h("button", { type: "button", class: "btn secondary", onclick: () => {
        list.push({ id: uid() }); changed(); render();
      } }, type === "existing" ? "+ Add existing action" : "+ Add potential action"));
      return card;
    };
    el.append(group("existing", "Existing actions", C.actions.existingHelp));
    el.append(group("potential", "Potential actions", C.actions.potentialHelp));
  };

  /* ---------------- face scale (scoring) ---------------- */
  // Mouth shapes for each score: 3 smile (good), 2 flat (OK), 1 frown (bad), 0 wavy with a raised eyebrow (unknown).
  const FACE_MOUTH = { "3": "M7 13.6 Q12 18.6 17 13.6", "2": "M7.6 15.4 H16.4", "1": "M7 17.6 Q12 11.8 17 17.6", "0": "M7.2 16 q1.6 -2 3.2 0 t3.2 0 t3.2 0" };
  function faceIcon(value, size) {
    const o = (C.scoring.scale || []).find(x => x.value === String(value));
    const svg = h("svg", { viewBox: "0 0 24 24", width: size || 30, height: size || 30, class: "face-ico", "aria-hidden": "true", focusable: "false" });
    if (!o) {
      svg.append(h("circle", { cx: "12", cy: "12", r: "10.5", fill: "#fff", stroke: "#a9b4ae", "stroke-width": "1.4", "stroke-dasharray": "3 2.2" }));
      return svg;
    }
    svg.append(
      h("circle", { cx: "12", cy: "12", r: "11", fill: "#" + o.color }),
      h("circle", { cx: "8.4", cy: "9.4", r: "1.5", fill: "#fff" }),
      h("circle", { cx: "15.6", cy: "9.4", r: "1.5", fill: "#fff" }),
      h("path", { d: FACE_MOUTH[o.value], fill: "none", stroke: "#fff", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    if (o.value === "0") svg.append(h("path", { d: "M13.6 6.4 l3.6 -1.4", stroke: "#fff", "stroke-width": "1.6", "stroke-linecap": "round", fill: "none" }));   // raised eyebrow
    return svg;
  }

  // One shared pop-up list of faces, positioned under whichever score button was clicked.
  let facePop = null, facePopOwner = null;
  function closeFacePop() {
    if (facePop) { facePop.remove(); facePop = null; }
    if (facePopOwner) { facePopOwner.setAttribute("aria-expanded", "false"); facePopOwner.focus(); facePopOwner = null; }
  }
  document.addEventListener("click", e => { if (facePop && !facePop.contains(e.target) && e.target.closest(".face-btn") !== facePopOwner) closeFacePop(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && facePop) closeFacePop(); });
  window.addEventListener("resize", () => { if (facePop) closeFacePop(); });

  function facePicker(label, onPick) {
    let current = "";
    const num = h("span", { class: "face-num" });
    const btn = h("button", { type: "button", class: "face-btn", "aria-haspopup": "listbox", "aria-expanded": "false" });
    const paint = () => {
      const o = (C.scoring.scale || []).find(x => x.value === current);
      btn.replaceChildren(faceIcon(current, 38), num);
      num.textContent = o ? current : "–";
      btn.dataset.score = current;
      btn.setAttribute("aria-label", label + ": " + (o ? o.value + " " + o.label : "not scored") + ". Click to choose.");
    };
    btn.addEventListener("click", () => {
      if (facePop && facePopOwner === btn) { closeFacePop(); return; }
      closeFacePop();
      const pop = h("div", { class: "face-pop", role: "listbox", "aria-label": label });
      (C.scoring.scale || []).forEach(o => {
        const opt = h("button", { type: "button", role: "option", class: "face-opt" + (o.value === current ? " on" : ""), "aria-selected": String(o.value === current),
          onclick: () => { current = o.value; paint(); closeFacePop(); onPick(o.value); } },
          faceIcon(o.value, 30), h("span", { class: "face-opt-num" }, o.value), h("span", { class: "face-opt-label" }, o.label));
        pop.append(opt);
      });
      pop.append(h("button", { type: "button", class: "face-opt clear", onclick: () => { current = ""; paint(); closeFacePop(); onPick(""); } }, "Clear"));
      document.body.append(pop);
      const r = btn.getBoundingClientRect();
      const left = Math.min(window.innerWidth - pop.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - pop.offsetWidth / 2));
      const below = r.bottom + 6 + pop.offsetHeight < window.innerHeight;
      pop.style.left = left + window.scrollX + "px";
      pop.style.top = (below ? r.bottom + 6 : r.top - pop.offsetHeight - 6) + window.scrollY + "px";
      facePop = pop; facePopOwner = btn; btn.setAttribute("aria-expanded", "true");
      const first = pop.querySelector(".face-opt.on") || pop.querySelector(".face-opt");
      if (first) first.focus();
    });
    paint();
    return {
      el: btn,
      update(value, disabled, title) { current = value; btn.disabled = disabled; btn.title = title || ""; paint(); }
    };
  }

  R.scoring = el => {
    el.append(sectionHead(C.scoring));
    const acts = namedActions();
    if (!acts.length) {
      el.append(h("div", { class: "card empty" }, "Add actions on the Actions tab first — they will appear here for scoring."));
      return;
    }
    const crit = C.scoring.criteria;
    // Guidance for a column opens in one wide panel above the table (only one at a time), so it is easy to read.
    const helpHolder = h("div", { class: "score-help", hidden: true });
    let helpOwner = null;
    const closeHelp = () => {
      helpHolder.hidden = true; helpHolder.replaceChildren();
      if (helpOwner) { helpOwner.setAttribute("aria-expanded", "false"); helpOwner.classList.remove("on"); }
      helpOwner = null;
    };
    const openHelp = (c, btn) => {
      if (helpOwner === btn) { closeHelp(); return; }
      closeHelp();
      const panel = helpPanel(c.help); panel.hidden = false;
      helpHolder.append(h("div", { class: "score-help-head" }, h("h3", null, c.label),
        h("button", { type: "button", class: "btn ghost score-help-close", onclick: () => { const b = helpOwner; closeHelp(); if (b) b.focus(); } }, "Close ✕")), panel);
      helpHolder.hidden = false; helpOwner = btn;
      btn.setAttribute("aria-expanded", "true"); btn.classList.add("on");
      helpHolder.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };
    const headCell = (c, extra) => {
      const btn = h("button", { type: "button", class: "info-btn", "aria-expanded": "false",
        "aria-label": "Show guidance for " + c.label, title: "Instructions, examples and guidance" }, "i");
      btn.addEventListener("click", () => openHelp(c, btn));
      return h("th", { scope: "col" },
        h("div", { class: "th-inner" }, h("span", null, c.label), btn),
        extra ? h("div", { class: "th-note" }, extra) : null);
    };
    const SCALE = C.scoring.scale;
    const table = h("table", { class: "score-table" },
      h("thead", null, h("tr", null,
        h("th", { scope: "col", class: "col-action" }, "Action"),
        crit.map(c => headCell(c, "0\u20133" + (c.note ? " (" + c.note + ")" : ""))),
        h("th", { scope: "col", class: "col-total" }, "Score", h("br"), "/ 21"),
        headCell(C.scoring.cultural, C.scoring.cultural.sub))));
    const legend = h("div", { class: "score-legend", "aria-label": "Scoring scale" },
      h("span", { class: "score-legend-title" }, "Scale:"),
      SCALE.map(o => h("span", { class: "score-chip" }, faceIcon(o.value, 24), h("span", null, o.value + " " + o.label))),
      h("span", { class: "score-legend-note" }, "Use grey (0) when you don\u2019t know yet. For Cost and Risk, a green face means low cost or low risk."));
    const tbody = h("tbody");
    acts.forEach(a => {
      const s = plan.scores[a.id] = plan.scores[a.id] || {};
      if (s.cultural === "D") s.cultural = "U";   // older drafts: "to be discussed" is now "unknown"
      const totalCell = h("td", { class: "total" });
      const pickers = [];
      const upd = () => {
        const sc = scoreOf(a.id);
        totalCell.replaceChildren(...[sc.n ? sc.total + (sc.complete ? "" : " *") : "\u2014",
          sc.unknown ? h("span", { class: "unk-count" }, sc.unknown + " unknown") : null].filter(Boolean));
        culturalSel.dataset.cultural = s.cultural || "";
        culturalSel.title = ((C.scoring.cultural.options || []).find(o => o[0] === s.cultural) || [])[2] || "";
        tr.classList.toggle("cultural-no", s.cultural === "N");
        if (s.cultural === "N") totalCell.append(h("span", { class: "cult-flag" }, "\u26d4 Not culturally acceptable"));
        pickers.forEach(pk => pk.update(s[pk.key] || "", false, ""));
      };
      const culturalSel = h("select", { class: "score-sel cultural-sel", "aria-label": "Cultural acceptability for action " + a.num,
        onchange: e => { s.cultural = e.target.value; changed(); upd(); } },
        h("option", { value: "" }, "\u2013 choose"),
        (C.scoring.cultural.options || []).map(([v, lab, meaning]) => h("option", { value: v, title: meaning }, (CULT_ICON[v] || "") + " " + lab)));
      culturalSel.value = s.cultural || "";
      const critCell = c => {
        const pk = facePicker(c.label + " score for action " + a.num, v => { s[c.id] = v; changed(); upd(); });
        pk.key = c.id;
        pickers.push(pk);
        return h("td", { class: "face-cell" }, pk.el);
      };
      const tr = h("tr", null,   // upd() uses tr, so it is only called after this line
        h("th", { scope: "row", class: "col-action" }, h("span", { class: "num" }, a.num), " ", a.text,
          h("div", { class: "tag " + a.type }, a.type === "existing" ? "Existing" : "Potential")),
        crit.map(critCell),
        totalCell,
        h("td", { class: "cultural-cell" }, culturalSel));
      upd();
      tbody.append(tr);
    });
    table.append(tbody);
    el.append(legend, helpHolder);
    el.append(h("div", { class: "table-wrap" }, table));
    el.append(h("p", { class: "note" }, "Grey faces (0) mean unknown or limited information: they add nothing to the score and are counted, so you can see where more information is needed. * = not all criteria scored yet. Cultural acceptability is chosen for every action and does not change the score; actions marked \u26d4 Not acceptable are flagged in red."));
  };

  const POSTER_PHOTO_RATIO = 3 / 4;   // width / height of the photo box on the summary poster (also used in export.js)
  const CULT_ICON = { Y: "\u2705", C: "\u26a0\ufe0f", N: "\u26d4", U: "\u2754" };   // cultural acceptability

  /* ---- pathway planning: the pathway map with a form for each line (js/pathbuilder.js) ---- */
  R.pathway = el => {
    el.append(sectionHead(C.pathway));
    if (window.PathBuilder) window.PathBuilder.render(el);
    else el.append(h("div", { class: "card empty" }, "The pathway map could not be loaded."));
  };

  /* ---- summary ---- */
  const bullets = arr => arr.filter(Boolean).map(s => "• " + s).join("\n");
  const PRI = C.risk.priorityOptions;

  function draftSummary() {
    const hz = plan.risk.hazards.filter(x => (x.label || "").trim());
    const rank = x => PRI.indexOf(x.priority);
    let key = hz.filter(x => rank(x) >= PRI.indexOf("High"));
    if (!key.length) key = hz.filter(x => rank(x) >= PRI.indexOf("Medium"));
    key.sort((a, b) => rank(b) - rank(a));
    const pw = plan.pathway.map(p => ({ ...p, name: pathwayActionName(p) })).filter(p => p.name);
    const cult = code => namedActions().filter(a => (plan.scores[a.id] || {}).cultural === code);
    let now = pw.filter(p => p.timing === "Now").map(p => p.name);
    let later = pw.filter(p => p.timing === "Later").map(p => p.name);
    if (!pw.length) now = plan.actions.existing.map(a => (a.text || "").trim());
    return {
      hazards: bullets(key.map(x => x.label + " (" + x.priority + ")")),
      impacts: bullets(key.filter(x => (x.impact || "").trim()).map(x => x.label + ": " + x.impact.trim())),
      triggers: bullets(pw.filter(p => (p.trigger || "").trim()).map(p => p.name + ": " + p.trigger.trim())),
      turning: bullets(pw.flatMap(p => [
        (p.turning || "").trim() ? p.name + " — turning point: " + p.turning.trim() : "",
        (p.stopping || "").trim() ? p.name + " — stopping point: " + p.stopping.trim() : ""])),
      longGoals: bullets(pw.map(p => (p.longGoal || "").trim())),
      shortGoals: bullets(pw.map(p => (p.shortGoal || "").trim())),
      cultural: bullets([(plan.species.importance || "").trim()].concat(
        cult("N").map(a => "Not culturally acceptable: " + a.text.trim()),
        cult("C").map(a => "May raise cultural concerns: " + a.text.trim()),
        cult("U").map(a => "Check with Traditional Owners: " + a.text.trim()))),
      now: bullets(now), later: bullets(later)
    };
  }

  R.summary = el => {
    el.append(sectionHead(C.summary, h("button", { type: "button", class: "btn secondary", onclick: () => {
      const d = draftSummary();
      const filled = C.summary.boxes.filter(b => (plan.summary[b.id] || "").trim());
      let overwrite = false;
      if (filled.length) overwrite = confirm("Some boxes already have text.\n\nOK = replace all boxes with a fresh draft\nCancel = only fill the empty boxes");
      C.summary.boxes.forEach(b => { if (overwrite || !(plan.summary[b.id] || "").trim()) plan.summary[b.id] = d[b.id]; });
      changed(); render();
    } }, "Draft from earlier tabs")));

    const S = plan.summary;
    const box = id => {
      const def = C.summary.boxes.find(b => b.id === id);
      return h("div", { class: "sbox sbox-" + id }, field({ ...def, type: "textarea", rows: 5 }, S, id));
    };

    // photo
    // The preview frame has the same 3:4 shape as the photo box on the report poster, so what you see is what prints.
    // fit "fill" (default) crops the photo to the frame; pos (0-100) moves the crop; fit "whole" shows all of it.
    const preview = h("div", { class: "photo-preview" });
    const paintPhoto = () => {
      preview.replaceChildren();
      const P = S.photo;
      if (P && P.data) {
        const fill = P.fit !== "whole", pos = P.pos === undefined ? 50 : P.pos;
        const ar = P.w && P.h ? P.w / P.h : 0.75, wide = ar > POSTER_PHOTO_RATIO;
        const img = h("img", { src: P.data, alt: "Photo of " + (plan.species.name || "the species"),
          style: "object-fit:" + (fill ? "cover" : "contain") + ";object-position:" + (wide ? pos + "% 50%" : "50% " + pos + "%") });
        const frame = h("div", { class: "photo-frame" }, img);
        const needsCrop = fill && Math.abs(ar - POSTER_PHOTO_RATIO) > 0.02;
        const slider = needsCrop ? h("label", { class: "photo-pos" }, (wide ? "Crop position (left ↔ right)" : "Crop position (top ↕ bottom)"),
          h("input", { type: "range", min: 0, max: 100, step: 1, value: pos, "aria-label": "Crop position",
            oninput: e => { P.pos = Number(e.target.value); img.style.objectPosition = wide ? P.pos + "% 50%" : "50% " + P.pos + "%"; },
            onchange: () => changed() })) : null;
        const fitSel = h("div", { class: "photo-fit", role: "radiogroup", "aria-label": "How the photo fits the poster" },
          [["fill", "Fill the photo box (crop)"], ["whole", "Show the whole photo"]].map(([v, lab]) =>
            h("label", null, h("input", { type: "radio", name: "photoFit", value: v, checked: (P.fit || "fill") === v,
              onchange: () => { P.fit = v; changed(); paintPhoto(); } }), " " + lab)));
        preview.append(frame, h("div", { class: "photo-note" }, "Preview of the photo box on the report poster"), fitSel, slider,
          h("button", { type: "button", class: "link-btn", onclick: () => { S.photo = null; changed(); paintPhoto(); } }, "Remove photo"));
      } else {
        preview.append(h("div", { class: "photo-empty" }, "No photo yet. A portrait (tall) photo fits the poster best; other photos are cropped to fit, and you can adjust the crop."));
      }
    };
    paintPhoto();
    const fileIn = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp", id: "photoFile", class: "visually-hidden",
      onchange: e => { const f = e.target.files[0]; if (f) readPhoto(f).then(p => { S.photo = { ...(S.photo || {}), ...p, pos: 50 }; changed(); paintPhoto(); }).catch(err => alert(err.message)); e.target.value = ""; } });
    const [prow, ppanel] = labelWithHelp("Species photo", C.summary.photoHelp, "photoFile");
    const photoBox = h("div", { class: "sbox sbox-photo" }, prow, ppanel, preview,
      h("label", { class: "btn secondary upload", for: "photoFile" }, "Upload photo"), fileIn,
      h("input", { type: "text", placeholder: "Caption (optional)", "aria-label": "Photo caption", value: (S.photo && S.photo.caption) || "",
        oninput: e => { S.photo = S.photo || {}; S.photo.caption = e.target.value; changed(); } }),
      h("input", { type: "text", placeholder: "Photo credit (optional)", "aria-label": "Photo credit", value: (S.photo && S.photo.credit) || "",
        oninput: e => { S.photo = S.photo || {}; S.photo.credit = e.target.value; changed(); } }));

    el.append(h("div", { class: "summary-sheet" },
      h("div", { class: "summary-title" }, plan.species.name || "Species or ecosystem name (set on the Species / ecosystem tab)"),
      h("div", { class: "summary-grid" },
        box("hazards"), box("longGoals"), box("shortGoals"),
        box("impacts"), photoBox, box("cultural"),
        box("triggers"), box("turning"),
        h("div", { class: "sbox sbox-actions" }, box("now"), box("later")))));
  };

  function readPhoto(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
      if (!/^image\//.test(file.type)) return reject(new Error("Please choose an image file (JPG or PNG)."));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const MAX = maxSize || 1600;
        const k = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * k), hgt = Math.round(img.height * k);
        const cv = document.createElement("canvas"); cv.width = w; cv.height = hgt;
        const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, hgt); ctx.drawImage(img, 0, 0, w, hgt);
        URL.revokeObjectURL(url);
        resolve({ data: cv.toDataURL("image/jpeg", quality || 0.85), w, h: hgt });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That image could not be read.")); };
      img.src = url;
    });
  }

  /* ---- export tab ---- */
  function fileBase() {
    const n = (plan.species.name || plan.start.planTitle || "adaptation-plan").trim();
    return ("Adaptation plan - " + n).replace(/[\\/:*?"<>|]+/g, "").slice(0, 80);
  }

  R.export = el => {
    el.append(h("div", { class: "section-head" }, h("h2", null, "Export report"),
      h("p", { class: "intro" }, "Download your plan as a Word document (to keep editing) or a PDF (to share or print).")));
    const checks = [
      ["Species name", !!(plan.species.name || "").trim(), "species"],
      ["Site place name", !!(plan.site.placeName || "").trim(), "site"],
      ["Hazard priorities rated", plan.risk.hazards.some(x => x.priority), "risk"],
      ["At least one action", namedActions().length > 0, "actions"],
      ["Actions scored", namedActions().some(a => scoreOf(a.id).n), "scoring"],
      ["Pathway planning", plan.pathway.length > 0, "pathway"],
      ["Summary drafted", C.summary.boxes.some(b => (plan.summary[b.id] || "").trim()), "summary"],
      ["Species photo", !!(plan.summary.photo && plan.summary.photo.data), "summary"]
    ];
    el.append(h("div", { class: "card" }, h("h3", null, "Checklist"),
      h("ul", { class: "checklist" }, checks.map(([t, ok, tab]) => h("li", { class: ok ? "ok" : "todo" },
        h("span", { class: "mark" }, ok ? "✓" : "○"), " " + t + " ",
        ok ? null : h("button", { type: "button", class: "link-btn", onclick: () => go(tab) }, "Go to tab")))),
      h("p", { class: "note" }, "You can export at any time — empty boxes are left blank in the report.")));

    const status = h("p", { class: "export-status", role: "status" });
    const run = async (fn, label) => {
      status.textContent = "Preparing " + label + "…";
      try { await fn(plan, fileBase()); status.textContent = label + " downloaded."; }
      catch (e) { console.error(e); status.textContent = "Sorry, the " + label + " could not be created: " + e.message; }
    };
    el.append(h("div", { class: "card export-card" },
      h("div", { class: "btn-row" },
        h("button", { type: "button", class: "btn primary", onclick: () => run(window.ReportExport.docx, "Word document") }, "Download Word (.docx)"),
        h("button", { type: "button", class: "btn primary", onclick: () => run(window.ReportExport.pdf, "PDF") }, "Download PDF")),
      status));
  };

  /* ---------------- tabs, dots, render ---------------- */
  function tabHasContent(id) {
    const any = o => o && Object.entries(o).some(([k, v]) => k !== "id" && typeof v === "string" && v.trim());
    switch (id) {
      case "start": return any(plan.start);
      case "species": return any(plan.species);
      case "site": return any(plan.site) || (plan.site.photos || []).length > 0;
      case "risk": return plan.risk.hazards.some(x => x.exposure || x.impact || x.adapt || x.priority);
      case "actions": return namedActions().length > 0;
      case "scoring": return namedActions().some(a => scoreOf(a.id).n);
      case "pathway": return plan.pathway.some(p => any(p));
      case "summary": return any(plan.summary) || !!(plan.summary.photo && plan.summary.photo.data);
      default: return false;
    }
  }
  function updateTabDots() {
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("has-content", tabHasContent(b.dataset.tab)));
  }

  function buildTabs() {
    const nav = document.getElementById("tabs");
    nav.replaceChildren();
    const UNNUMBERED = ["overview", "start", "export"];
    let n = 0;
    TABS.forEach(t => nav.append(h("button", { type: "button", class: "tab", role: "tab", "data-tab": t.id,
      id: "tab-" + t.id, "aria-controls": "panel", onclick: () => go(t.id) },
      h("span", { class: "tab-num" }, UNNUMBERED.includes(t.id) ? "" : ++n), t.label, h("span", { class: "dot", "aria-hidden": "true" }))));
  }

  function go(id) {
    currentTab = id; safeSet(TAB_KEY, id); render();
    window.scrollTo({ top: 0 });
    const b = document.getElementById("tab-" + id); if (b) b.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function render() {
    document.querySelectorAll(".tab").forEach(b => {
      const on = b.dataset.tab === currentTab;
      b.classList.toggle("active", on); b.setAttribute("aria-selected", String(on));
    });
    const panel = document.getElementById("panel");
    panel.replaceChildren();
    panel.setAttribute("aria-labelledby", "tab-" + currentTab);
    panel.classList.toggle("wide", currentTab === "overview");
    document.body.classList.toggle("on-overview", currentTab === "overview");
    R[currentTab](panel);
    if (currentTab === "overview") { updateTabDots(); return; }
    const idx = TABS.findIndex(t => t.id === currentTab);
    const nav = h("div", { class: "pager" },
      idx > 0 ? h("button", { type: "button", class: "btn ghost", onclick: () => go(TABS[idx - 1].id) }, "← " + TABS[idx - 1].label) : h("span"),
      idx < TABS.length - 1 ? h("button", { type: "button", class: "btn primary", onclick: () => go(TABS[idx + 1].id) }, TABS[idx + 1].label + " →") : h("span"));
    panel.append(nav);
    updateTabDots();
  }

  /* ---------------- file save / open / new ---------------- */
  function download(blob, name) {
    const a = h("a", { href: URL.createObjectURL(blob), download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  window.AppDownload = download;

  function init() {
    document.title = C.title + " — " + C.subtitle;
    document.getElementById("appTitle").textContent = C.title;
    document.getElementById("appSubtitle").textContent = C.subtitle;
    const res = document.getElementById("resourceLink");
    if (C.resourceSiteUrl) { res.href = C.resourceSiteUrl; res.hidden = false; }

    document.getElementById("btnSave").addEventListener("click", () =>
      download(new Blob([JSON.stringify(plan, null, 1)], { type: "application/json" }), fileBase() + ".adaptplan.json"));
    const openIn = document.getElementById("openFile");
    document.getElementById("btnOpen").addEventListener("click", () => openIn.click());
    openIn.addEventListener("change", e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => {
        const p = JSON.parse(t);
        if (!p || !p.species || !p.risk) throw new Error("not a plan file");
        if (!confirm("Open this plan? It will replace the plan currently on screen.")) return;
        plan = migrate(p); changed(); go("start");
      }).catch(() => alert("That file could not be opened. Choose a plan file saved from this tool (.adaptplan.json)."));
      e.target.value = "";
    });
    document.getElementById("btnNew").addEventListener("click", () => {
      if (!confirm("Start a new, empty plan?\n\nThe current plan will be cleared from this browser. Save a plan file first if you want to keep it.")) return;
      plan = newPlan(); changed(); go("start");
    });

    buildTabs();
    render();
    setStatus(safeGet(STORE_KEY) ? "Restored your last plan from this browser" : "Not saved yet");
  }

  // For export.js
  window.AppModel = { allActions, namedActions, scoreOf, pathwayActionName };
  // Small API used by js/pathbuilder.js (Pathway planning) and js/merge.js
  // The Pathway planning form for one pathway entry (same fields and help as the Pathway planning tab)
  const pathwayForm = (p, onChange) => {
    const grid = h("div", { class: "grid-2" });
    C.pathway.fields.forEach(f => grid.append(field(f, p, f.id, { onChange, idPrefix: "pb-" })));
    return grid;
  };
  window.AppAPI = { h, uid, changed, allActions, namedActions, pathwayActionName, pathwayForm, readPhoto, helpPanel, helpButton, getPlan: () => plan,
    // used by the merge tool: replace the whole plan, save it and redraw
    replacePlan: p => { plan = migrate(p); changed(); render(); } };
  document.addEventListener("DOMContentLoaded", init);
})();
