/* Adaptation planning tool — UI, state and persistence. Content lives in content.js. */
(function () {
  "use strict";
  const C = window.APP_CONTENT;
  const STORE_KEY = "wt-adaptation-plan-v1";
  const TAB_KEY = "wt-adaptation-tab";

  const TABS = [
    { id: "start", label: "Start" },
    { id: "species", label: "Species" },
    { id: "site", label: "Site" },
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
  let currentTab = safeGet(TAB_KEY) || "start";
  if (!TABS.some(t => t.id === currentTab)) currentTab = "start";

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
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) {
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
    const more = help.moreInfo
      ? h("a", { class: "more-link", href: help.moreInfo, target: "_blank", rel: "noopener" }, "More information ↗")
      : h("span", { class: "more-link disabled", title: "A link to the resource website will be added here" }, "More information — link coming soon");
    const panel = h("div", { class: "help-panel", hidden: true },
      block("Instructions", help.instructions),
      block("Examples", help.examples),
      block("Guidance", help.guidance),
      h("div", { class: "help-more" }, more));
    return panel;
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
    return h("div", { class: "section-head" },
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
    // Culturally acceptable is a gate: criteria only count when it is "Y"
    const s = plan.scores[actionId] || {};
    const cultural = s.cultural || "";
    let total = 0, n = 0;
    if (cultural === "Y") C.scoring.criteria.forEach(c => { if (s[c.id] !== undefined && s[c.id] !== "") { total += Number(s[c.id]); n++; } });
    return { total, n, complete: n === C.scoring.criteria.length, max: C.scoring.criteria.length * 3, cultural, excluded: cultural === "N" };
  }
  function scoreText(actionId) {
    const s = scoreOf(actionId);
    if (s.excluded) return "Not culturally acceptable";
    if (!s.n) return "—";
    return s.total + "/" + s.max + (s.complete ? "" : " (incomplete)");
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
  R.site = simpleTab("site");

  R.risk = el => {
    el.append(sectionHead(C.risk));
    const cols = C.risk.columns;
    plan.risk.hazards.forEach((hz, idx) => {
      const card = h("div", { class: "card hazard" });
      const head = h("div", { class: "hazard-head" });
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
            field({ id: "how", label: "How does this help the species adapt to climate change hazards?", type: "textarea", rows: 2, help: C.actions.howHelp }, a, "how")),
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

  R.scoring = el => {
    el.append(sectionHead(C.scoring));
    const acts = namedActions();
    if (!acts.length) {
      el.append(h("div", { class: "card empty" }, "Add actions on the Actions tab first — they will appear here for scoring."));
      return;
    }
    const crit = C.scoring.criteria;
    const headCell = (c, extra) => {
      const panel = helpPanel(c.help);
      return h("th", { scope: "col" },
        h("div", { class: "th-inner" }, h("span", null, c.label), helpButton(panel)),
        extra ? h("div", { class: "th-note" }, extra) : null, panel);
    };
    const table = h("table", { class: "score-table" },
      h("thead", null, h("tr", null,
        h("th", { scope: "col", class: "col-action" }, "Action"),
        headCell(C.scoring.cultural, "Y / N"),
        crit.map(c => headCell(c, "0–3" + (c.note ? " (" + c.note + ")" : ""))),
        h("th", { scope: "col" }, "Score out of 21"))));
    const tbody = h("tbody");
    acts.forEach(a => {
      const s = plan.scores[a.id] = plan.scores[a.id] || {};
      const totalCell = h("td", { class: "total" });
      const critSelects = [];
      const upd = () => {
        const sc = scoreOf(a.id);
        totalCell.textContent = sc.excluded ? "Excluded" : sc.n ? sc.total + (sc.complete ? "" : " *") : "—";
        tr.classList.toggle("flag-no", sc.excluded);
        const open = s.cultural === "Y";
        critSelects.forEach(x => {
          x.disabled = !open;
          x.value = open ? (s[x.dataset.key] || "") : "";
          x.title = open ? "" : sc.excluded ? "Not scored — action is not culturally acceptable" : "Set Culturally acceptable to Y first";
        });
      };
      const sel = (key, opts) => {
        const x = h("select", { "aria-label": key + " score for action " + a.num, onchange: e => { s[key] = e.target.value; changed(); upd(); } },
          h("option", { value: "" }, "–"), opts.map(o => h("option", { value: o[0] }, o[1])));
        x.value = s[key] || "";
        if (key !== "cultural") { x.dataset.key = key; critSelects.push(x); }
        return h("td", null, x);
      };
      const tr = h("tr", null,
        h("th", { scope: "row", class: "col-action" }, h("span", { class: "num" }, a.num), " ", a.text,
          h("div", { class: "tag " + a.type }, a.type === "existing" ? "Existing" : "Potential")),
        sel("cultural", [["Y", "Y"], ["N", "N"]]),
        crit.map(c => sel(c.id, [["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"]])),
        totalCell);
      upd();
      tbody.append(tr);
    });
    table.append(tbody);
    el.append(h("div", { class: "table-wrap" }, table));
    el.append(h("p", { class: "note" }, "Culturally acceptable works as a filter: the other criteria open only when it is Y. Actions marked N are excluded (shown in red). * = not all criteria scored yet."));
  };

  R.pathway = el => {
    el.append(sectionHead(C.pathway));
    const acts = namedActions();
    plan.pathway.forEach((p, i) => {
      const card = h("div", { class: "card pathway" });
      const sel = h("select", { "aria-label": "Action", onchange: e => {
        p.actionId = e.target.value === "__other" ? "" : e.target.value; changed();
        other.hidden = !!p.actionId;
      } },
        h("option", { value: "" }, "— choose an action —"),
        acts.map(a => h("option", { value: a.id }, a.num + ". " + a.text.slice(0, 90))),
        h("option", { value: "__other" }, "Other (type it in)"));
      sel.value = p.actionId && acts.some(a => a.id === p.actionId) ? p.actionId : (p.actionText ? "__other" : "");
      const other = h("input", { type: "text", class: "other-action", placeholder: "Describe the action",
        value: p.actionText || "", oninput: e => { p.actionText = e.target.value; changed(); } });
      other.hidden = sel.value !== "__other";
      card.append(h("div", { class: "pathway-head" },
        h("div", { class: "pathway-action" }, h("label", { class: "field-label" }, "Action (from Actions tab)"), sel, other),
        h("button", { type: "button", class: "icon-btn danger", title: "Remove", onclick: () => {
          if (confirm("Remove this pathway?")) { plan.pathway.splice(i, 1); changed(); render(); } } }, "✕")));
      const grid = h("div", { class: "grid-2" });
      C.pathway.fields.forEach(f => grid.append(field(f, p, f.id)));
      card.append(grid);
      el.append(card);
    });
    if (!plan.pathway.length) el.append(h("div", { class: "card empty" }, "No pathways yet. Add one for each action you plan to carry forward."));
    const row = h("div", { class: "btn-row" },
      h("button", { type: "button", class: "btn secondary", onclick: () => { plan.pathway.push({ id: uid() }); changed(); render(); } }, "+ Add pathway"));
    const missing = acts.filter(a => !plan.pathway.some(p => p.actionId === a.id));
    if (missing.length) row.append(h("button", { type: "button", class: "btn ghost", onclick: () => {
      missing.forEach(a => plan.pathway.push({ id: uid(), actionId: a.id, timing: a.type === "existing" ? "Now" : "" }));
      changed(); render();
    } }, "+ Add a pathway for every action (" + missing.length + ")"));
    el.append(row);
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
    const culturalNo = namedActions().filter(a => (plan.scores[a.id] || {}).cultural === "N");
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
        culturalNo.map(a => "Not culturally acceptable: " + a.text.trim()))),
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
    const preview = h("div", { class: "photo-preview" });
    const paintPhoto = () => {
      preview.replaceChildren();
      if (S.photo && S.photo.data) {
        preview.append(h("img", { src: S.photo.data, alt: "Photo of " + (plan.species.name || "the species") }));
        preview.append(h("button", { type: "button", class: "link-btn", onclick: () => { S.photo = null; changed(); paintPhoto(); } }, "Remove photo"));
      } else {
        preview.append(h("div", { class: "photo-empty" }, "No photo yet"));
      }
    };
    paintPhoto();
    const fileIn = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp", id: "photoFile", class: "visually-hidden",
      onchange: e => { const f = e.target.files[0]; if (f) readPhoto(f).then(p => { S.photo = { ...(S.photo || {}), ...p }; changed(); paintPhoto(); }).catch(err => alert(err.message)); e.target.value = ""; } });
    const [prow, ppanel] = labelWithHelp("Species photo", C.summary.photoHelp, "photoFile");
    const photoBox = h("div", { class: "sbox sbox-photo" }, prow, ppanel, preview,
      h("label", { class: "btn secondary upload", for: "photoFile" }, "Upload photo"), fileIn,
      h("input", { type: "text", placeholder: "Caption (optional)", "aria-label": "Photo caption", value: (S.photo && S.photo.caption) || "",
        oninput: e => { S.photo = S.photo || {}; S.photo.caption = e.target.value; changed(); } }),
      h("input", { type: "text", placeholder: "Photo credit (optional)", "aria-label": "Photo credit", value: (S.photo && S.photo.credit) || "",
        oninput: e => { S.photo = S.photo || {}; S.photo.credit = e.target.value; changed(); } }));

    el.append(h("div", { class: "summary-sheet" },
      h("div", { class: "summary-title" }, plan.species.name || "Species name (set on the Species tab)"),
      h("div", { class: "summary-grid" },
        box("hazards"), box("longGoals"), box("shortGoals"),
        box("impacts"), photoBox, box("cultural"),
        box("triggers"), box("turning"),
        h("div", { class: "sbox sbox-actions" }, box("now"), box("later")))));
  };

  function readPhoto(file) {
    return new Promise((resolve, reject) => {
      if (!/^image\//.test(file.type)) return reject(new Error("Please choose an image file (JPG or PNG)."));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        const k = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * k), hgt = Math.round(img.height * k);
        const cv = document.createElement("canvas"); cv.width = w; cv.height = hgt;
        const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, hgt); ctx.drawImage(img, 0, 0, w, hgt);
        URL.revokeObjectURL(url);
        resolve({ data: cv.toDataURL("image/jpeg", 0.85), w, h: hgt });
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
      case "site": return any(plan.site);
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
    TABS.forEach((t, i) => nav.append(h("button", { type: "button", class: "tab", role: "tab", "data-tab": t.id,
      id: "tab-" + t.id, "aria-controls": "panel", onclick: () => go(t.id) },
      h("span", { class: "tab-num" }, i === 0 || t.id === "export" ? "" : i), t.label, h("span", { class: "dot", "aria-hidden": "true" }))));
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
    R[currentTab](panel);
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
  document.addEventListener("DOMContentLoaded", init);
})();
