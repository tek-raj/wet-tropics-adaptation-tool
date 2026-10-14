/*
 * MERGE PLAN FILES (version 3)
 * Combines plan files saved by different people into the plan currently open.
 *   - Empty boxes are filled from the other files.
 *   - New actions, hazards, pathways, photos and pathway-map lines are added; matching ones are not duplicated.
 *   - Where two people wrote different things in the same box, a review screen lets the user choose:
 *     keep mine / use theirs / keep both (text) / average (scores).
 * Everything happens in the browser; nothing is uploaded.
 */
(function () {
  "use strict";
  const A = () => window.AppAPI;
  const h = (...a) => A().h(...a);
  const C = () => window.APP_CONTENT;
  let lastSnapshot = null;   // plan before the last merge, for "Undo merge"

  const norm = v => String(v == null ? "" : v).trim().replace(/\s+/g, " ").toLowerCase();
  const isEmpty = v => v == null || String(v).trim() === "";
  const clone = o => JSON.parse(JSON.stringify(o));
  const short = (t, n) => { t = String(t || ""); return t.length > n ? t.slice(0, n - 1) + "…" : t; };
  // show cultural acceptability codes as their labels (older drafts used "D" for to be discussed)
  const shown = (c, v) => { if (c.key !== "cultural") return String(v); const o = (C().scoring.cultural.options || []).find(x => x[0] === (v === "D" ? "U" : v)); return o ? o[1] : String(v); };

  /* ---------- merging one incoming plan into the base plan ---------- */
  function mergeOne(base, inc, source, conflicts, stats) {
    const uid = A().uid;
    // text / choice fields: fill if empty, record a conflict if different
    const field = (bObj, iObj, key, where, kind) => {
      if (!iObj || isEmpty(iObj[key])) return;
      if (isEmpty(bObj[key])) { bObj[key] = iObj[key]; stats.filled++; return; }
      if (norm(bObj[key]) === norm(iObj[key])) return;
      // already included (e.g. kept from an earlier merge): nothing to do
      if ((kind || "text") === "text" && norm(bObj[key]).includes(norm(iObj[key]))) return;
      conflicts.push({ where, kind: kind || "text", source, target: bObj, key, mine: bObj[key], theirs: iObj[key] });
    };
    const fieldsOf = sec => (C()[sec].fields || []).map(f => [f.id, f.label, f.type === "select" || f.type === "radio" ? "choice" : "text"]);

    // start, species, site
    base.start = base.start || {}; base.species = base.species || {}; base.site = base.site || {};
    // contributors: names are combined rather than treated as a difference
    const names = v => String(v || "").split(/\s*[,;]\s*|\s+and\s+/i).map(x => x.trim()).filter(Boolean);
    if (inc.start && !isEmpty(inc.start.preparedBy)) {
      const have = names(base.start.preparedBy);
      names(inc.start.preparedBy).forEach(n => { if (!have.some(x => norm(x) === norm(n))) have.push(n); });
      base.start.preparedBy = have.join(", ");
    }
    fieldsOf("start").filter(([k]) => k !== "preparedBy").forEach(([k, lab, kind]) => field(base.start, inc.start, k, "Start → " + lab, kind));
    fieldsOf("species").forEach(([k, lab, kind]) => field(base.species, inc.species, k, "Species → " + lab, kind));
    fieldsOf("site").forEach(([k, lab, kind]) => field(base.site, inc.site, k, "Site → " + lab, kind));

    // site photos: add any that are not already there
    const sig = p => (p.data || "").length + ":" + (p.data || "").slice(-80);
    base.site.photos = base.site.photos || [];
    const have = new Set(base.site.photos.map(sig));
    ((inc.site || {}).photos || []).forEach(p => {
      if (p && p.data && !have.has(sig(p))) { base.site.photos.push({ ...clone(p), id: uid() }); have.add(sig(p)); stats.photos++; }
    });

    // hazards: match by name; add new custom hazards
    base.risk = base.risk || { hazards: [] };
    const cols = C().risk.columns;
    ((inc.risk || {}).hazards || []).forEach(ih => {
      let bh = base.risk.hazards.find(x => norm(x.label) === norm(ih.label));
      const hasContent = cols.some(c => !isEmpty(ih[c.id]));
      if (!bh) {
        if (!hasContent && ih.custom) return;
        bh = { ...clone(ih), id: uid() }; base.risk.hazards.push(bh); stats.hazards++; return;
      }
      cols.forEach(c => field(bh, ih, c.id, "Risk → " + bh.label + " → " + c.group + (c.id === "adapt" ? " (ability to adapt)" : ""), c.id === "priority" ? "choice" : "text"));
    });

    // actions: match by wording; add new ones (keeping a map of ids for scores, pathways and the map)
    base.actions = base.actions || { existing: [], potential: [] };
    const idMap = {};
    const allBase = () => [...base.actions.existing, ...base.actions.potential];
    ["existing", "potential"].forEach(type => {
      ((inc.actions || {})[type] || []).forEach(ia => {
        if (isEmpty(ia.text) && isEmpty(ia.how)) return;
        const match = allBase().find(ba => !isEmpty(ba.text) && norm(ba.text) === norm(ia.text));
        if (match) {
          idMap[ia.id] = match.id;
          field(match, ia, "how", "Actions → “" + short(match.text, 60) + "” → How it helps");
        } else {
          const nid = uid(); idMap[ia.id] = nid;
          // drop empty placeholder rows in the base list before adding
          base.actions[type] = base.actions[type].filter(ba => !(isEmpty(ba.text) && isEmpty(ba.how)));
          base.actions[type].push({ ...clone(ia), id: nid }); stats.actions++;
        }
      });
    });

    // scores
    base.scores = base.scores || {};
    const crit = [["cultural", C().scoring.cultural.label, "choice"]].concat(C().scoring.criteria.map(c => [c.id, c.label, "score"]));
    Object.entries(inc.scores || {}).forEach(([iid, isc]) => {
      const bid = idMap[iid]; if (!bid) return;
      const a = allBase().find(x => x.id === bid);
      const bs = base.scores[bid] = base.scores[bid] || {};
      crit.forEach(([k, lab, kind]) => field(bs, isc, k, "Scoring → “" + short(a ? a.text : "", 50) + "” → " + lab, kind));
    });

    // pathways: match by action; merge fields or add
    base.pathway = base.pathway || [];
    const pf = C().pathway.fields;
    (inc.pathway || []).forEach(ip => {
      const aid = ip.actionId ? idMap[ip.actionId] : "";
      const bp = base.pathway.find(x => (aid && x.actionId === aid) || (!aid && !isEmpty(ip.actionText) && norm(x.actionText) === norm(ip.actionText)));
      if (bp) {
        const a = allBase().find(x => x.id === bp.actionId);
        const name = short(a ? a.text : bp.actionText, 50);
        pf.forEach(f => field(bp, ip, f.id, "Pathway → “" + name + "” → " + f.label, f.type === "select" ? "choice" : "text"));
      } else {
        base.pathway.push({ ...clone(ip), id: uid(), actionId: aid || "" }); stats.pathways++;
      }
    });

    // summary
    base.summary = base.summary || { photo: null };
    C().summary.boxes.forEach(b => field(base.summary, inc.summary, b.id, "Summary → " + b.label));
    if ((!base.summary.photo || !base.summary.photo.data) && inc.summary && inc.summary.photo && inc.summary.photo.data) {
      base.summary.photo = clone(inc.summary.photo); stats.photos++;
    }

    // pathway map (builder): add lines for actions that are not on the map yet
    const ib = (inc.pathwayBuilder || {}).lines || [];
    if (ib.length) {
      base.pathwayBuilder = base.pathwayBuilder || { lines: [] };
      const bLines = base.pathwayBuilder.lines;
      const mapped = new Set(bLines.filter(l => !l.parentId && l.actionId).map(l => l.actionId));
      const lineId = {}, pointId = {};
      const keepRoots = ib.filter(l => !l.parentId && !(l.actionId && mapped.has(idMap[l.actionId])));
      const keep = new Set();
      const addFamily = l => { keep.add(l.id); ib.filter(c => c.parentId === l.id).forEach(addFamily); };
      keepRoots.forEach(addFamily);
      ib.filter(l => keep.has(l.id)).forEach(l => { lineId[l.id] = uid(); (l.points || []).forEach(p => { pointId[p.id] = uid(); }); });
      ib.filter(l => keep.has(l.id)).forEach(l => {
        const nl = clone(l);
        nl.id = lineId[l.id];
        if (nl.actionId) nl.actionId = idMap[nl.actionId] || "";
        if (nl.parentId) nl.parentId = lineId[nl.parentId];
        if (nl.fromPointId) nl.fromPointId = pointId[nl.fromPointId];
        nl.points = (nl.points || []).map(p => ({ ...p, id: pointId[p.id] }));
        bLines.push(nl); if (!l.parentId) stats.mapLines++;
      });
    }
  }

  /* ---------- review screen ---------- */
  function review(conflicts, onDone) {
    const overlay = h("div", { class: "mg-overlay", role: "dialog", "aria-modal": "true", "aria-labelledby": "mg-title" });
    const choice = conflicts.map(c => c.kind === "text" ? "both" : "mine");
    const list = h("div", { class: "mg-list" });
    const paint = () => {
      list.replaceChildren(...conflicts.map((c, i) => {
        const opts = [["mine", "Keep mine"], ["theirs", "Use " + c.source + "’s"]];
        if (c.kind === "text") opts.push(["both", "Keep both"]);
        if (c.kind === "score" && !isNaN(parseFloat(c.mine)) && !isNaN(parseFloat(c.theirs))) opts.push(["average", "Average"]);
        const name = "mg-" + i;
        return h("div", { class: "mg-item" },
          h("div", { class: "mg-where" }, c.where),
          h("div", { class: "mg-cmp" },
            h("div", { class: "mg-ver" + (choice[i] === "mine" || choice[i] === "both" || choice[i] === "average" ? " on" : "") }, h("span", { class: "mg-who" }, "Yours"), h("div", null, shown(c, c.mine))),
            h("div", { class: "mg-ver" + (choice[i] === "theirs" || choice[i] === "both" || choice[i] === "average" ? " on" : "") }, h("span", { class: "mg-who" }, c.source), h("div", null, shown(c, c.theirs)))),
          h("div", { class: "mg-opts", role: "radiogroup", "aria-label": "Choose for " + c.where }, opts.map(([v, lab]) => {
            const r = h("input", { type: "radio", name, value: v, onchange: () => { choice[i] = v; paint(); } });
            if (choice[i] === v) r.checked = true;
            return h("label", { class: "mg-opt" + (choice[i] === v ? " on" : "") }, r, " " + lab);
          })));
      }));
    };
    const setAll = v => { conflicts.forEach((c, i) => {
      if (v === "both" && c.kind !== "text") return;
      choice[i] = v; }); paint(); };
    const apply = () => {
      conflicts.forEach((c, i) => {
        const v = choice[i];
        if (v === "theirs") c.target[c.key] = c.theirs;
        else if (v === "both") c.target[c.key] = String(c.target[c.key]) + "\n\n[From " + c.source + "] " + String(c.theirs);
        else if (v === "average") c.target[c.key] = String(Math.round((parseFloat(c.mine) + parseFloat(c.theirs)) / 2));
      });
      overlay.remove(); onDone(choice);
    };
    paint();
    overlay.append(h("div", { class: "mg-box" },
      h("h2", { id: "mg-title" }, "Review differences (" + conflicts.length + ")"),
      h("p", { class: "note" }, "These boxes have different answers in your plan and the file you are adding. Choose what to keep for each one. Everything else has already been combined."),
      h("div", { class: "btn-row mg-bulk" },
        h("span", { class: "note" }, "For all:"),
        h("button", { type: "button", class: "btn ghost small", onclick: () => setAll("mine") }, "Keep mine"),
        h("button", { type: "button", class: "btn ghost small", onclick: () => setAll("theirs") }, "Use theirs"),
        h("button", { type: "button", class: "btn ghost small", onclick: () => setAll("both") }, "Keep both (text)")),
      list,
      h("div", { class: "btn-row mg-foot" },
        h("button", { type: "button", class: "btn primary", onclick: apply }, "Apply and finish merge"),
        h("button", { type: "button", class: "btn ghost", onclick: () => { overlay.remove(); onDone(null); } }, "Cancel merge"))));
    document.body.append(overlay);
    overlay.querySelector("button").focus();
  }

  function resultDialog(text, opts) {
    opts = opts || {};
    const overlay = h("div", { class: "mg-overlay", role: "dialog", "aria-modal": "true" });
    overlay.append(h("div", { class: "mg-box small" },
      h("h2", null, opts.title || "Merge complete"),
      h("ul", { class: "mg-summary" }, text.map(t => h("li", null, t))),
      h("p", { class: "note" }, opts.note || "Check the tabs to see the combined plan. Text kept from both people is marked “[From name]” so you can tidy it up."),
      h("div", { class: "btn-row" },
        h("button", { type: "button", class: "btn primary", onclick: () => overlay.remove() }, "OK"),
        h("button", { type: "button", class: "btn ghost", onclick: () => { overlay.remove(); undo(); } }, opts.undoLabel || "Undo merge"))));
    document.body.append(overlay);
    overlay.querySelector("button").focus();
  }

  function undo() {
    if (!lastSnapshot) return;
    A().replacePlan(JSON.parse(lastSnapshot)); lastSnapshot = null;
    alert("The merge has been undone. Your plan is back to how it was before merging.");
  }

  /* ---------- main entry: pick files and merge ---------- */
  async function mergeFiles(files) {
    if (!files.length) return;
    const incoming = [];
    for (const f of files) {
      try {
        const p = JSON.parse(await f.text());
        if (!p || !p.species || !p.risk) throw new Error("not a plan file");
        incoming.push({ p, source: (p.start && p.start.preparedBy || "").trim() || f.name.replace(/\.adaptplan\.json$|\.json$/i, "") });
      } catch (e) { alert(f.name + " could not be read. Choose plan files saved from this tool (.adaptplan.json)."); return; }
    }
    mergePlans(incoming);
  }

  // Merge already-read plans (or partial plans, e.g. an imported site assessment) into the open plan.
  // opts: { title, note, undoLabel, lines(stats) } for the result dialog.
  function mergePlans(incoming, opts) {
    opts = opts || {};
    lastSnapshot = JSON.stringify(A().getPlan());
    const base = JSON.parse(lastSnapshot);
    const conflicts = [], stats = { filled: 0, actions: 0, hazards: 0, pathways: 0, photos: 0, mapLines: 0 };
    incoming.forEach(({ p, source }) => mergeOne(base, p, source, conflicts, stats));
    const finish = choices => {
      if (choices === null) { lastSnapshot = null; return; }   // cancelled: nothing changed
      A().replacePlan(base);
      const who = incoming.map(x => x.source).join(", ");
      const n2 = (n, one, many) => n + " " + (n === 1 ? one : many);
      const lines = opts.lines ? opts.lines(stats, who) : ["Merged from: " + who,
        n2(stats.filled, "empty box filled", "empty boxes filled"), n2(stats.actions, "action added", "actions added"),
        n2(stats.pathways, "pathway added", "pathways added"), n2(stats.photos, "photo added", "photos added"),
        n2(stats.hazards, "hazard added", "hazards added"), n2(stats.mapLines, "pathway-map line added", "pathway-map lines added")];
      if (choices && choices.length) {
        const n = k => choices.filter(c => c === k).length;
        lines.push(choices.length + " differences reviewed: " + n("mine") + " kept yours, " + n("theirs") + " used theirs, " + n("both") + " kept both, " + n("average") + " averaged");
      }
      resultDialog(lines, opts);
    };
    if (conflicts.length) review(conflicts, finish); else finish([]);
  }

  // Card on the Start tab explaining how to work together
  function startCard() {
    return h("div", { class: "card soft mg-card" },
      h("h3", null, "Working together on one plan"),
      h("ol", { class: "steps" },
        h("li", null, "Each person fills in the tool on their own computer, puts their name in ", h("b", null, "Prepared by"), ", and uses ", h("b", null, "Save plan file"), "."),
        h("li", null, "One person collects the files and clicks ", h("b", null, "Merge plan files"), " (at the top of the page) to combine them into their plan."),
        h("li", null, "Where people wrote different things in the same box, choose what to keep. Use ", h("b", null, "Undo merge"), " if needed.")),
      h("button", { type: "button", class: "btn secondary", onclick: () => document.getElementById("mergeFiles").click() }, "Merge plan files…"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("mergeFiles");
    const btn = document.getElementById("btnMerge");
    if (!input || !btn) return;
    btn.addEventListener("click", () => input.click());
    input.addEventListener("change", e => { const fs = Array.from(e.target.files || []); e.target.value = ""; mergeFiles(fs); });
  });

  window.MergeTool = { mergeFiles, mergePlans, startCard, undo, _mergeOne: mergeOne };
})();
