/*
 * PATHWAY PLANNING (tab 6)
 * An interactive adaptation pathways map. Each root line is an action; clicking it opens that action's
 * pathway form (plan.pathway entry, same fields as content.js pathway.fields) below the map.
 * The map is stored in plan.pathwayBuilder = { lines: [...] } and saved with the plan.
 *
 * Line:  { id, actionId?, label?, parentId?, fromPointId?, caption?, start?, points: [...] }
 *        - root lines are actions; child lines are alternate / improved paths that branch from a point
 * Point: { id, risk, type: "trigger" | "turning" | "stop", note }
 *        - risk is the position on the climate risk axis, 0 (low) to 100 (extreme); line.start uses the same scale.
 *          Older plans stored a year (2025-2100); these are converted to the risk scale when the plan is opened.
 */
(function () {
  "use strict";
  const R0 = 0, R1 = 100;   // climate risk axis: 0 = low, 100 = extreme
  const RISK = () => (window.APP_CONTENT.pathway.risk || { axisLabel: "Climate risk", bands: [{ label: "Low", color: "#fff4c2", text: "#333" }] });
  const bandOf = r => { const b = RISK().bands; return b[Math.min(b.length - 1, Math.max(0, Math.floor(r / (100 / b.length))))]; };
  const riskLabel = r => bandOf(r).label;
  const X0 = 270, X1 = 960, W = 1000, LANE = 74, TOP = 92;
  const TYPES = {
    trigger: { label: "Trigger", colour: "#2b6cb0", prompt: "What will tell you it is time to start this action?" },
    turning: { label: "Turning point", colour: "#d99a00", prompt: "What will tell you this action is no longer enough?" },
    stop: { label: "Stopping point", colour: "#c62828", prompt: "What will tell you to stop this action?" }
  };
  // line colours avoid the point colours (blue trigger, amber turning, red stop)
  const PALETTE = ["#1f5f4a", "#6a4c93", "#2f8f6b", "#4a6572", "#7a3e65", "#3c7d8c", "#5f7d2a", "#8a6d1d"];
  let root = null, selected = null; // selected = { line } or { line, point }

  const A = () => window.AppAPI;
  const h = (...a) => A().h(...a);
  // convert positions saved as years (earlier drafts) to the 0-100 climate risk scale
  const fromYear = y => Math.round(Math.min(100, Math.max(0, (y - 2025) / 75 * 100)));
  function migrate(pb) {
    (pb.lines || []).forEach(l => {
      if (typeof l.start === "number" && l.start > 100) l.start = fromYear(l.start);
      (l.points || []).forEach(q => { if (q.risk === undefined && q.year !== undefined) { q.risk = fromYear(q.year); delete q.year; } });
    });
    return pb;
  }
  const store = () => { const p = A().getPlan(); if (!p.pathwayBuilder) p.pathwayBuilder = { lines: [] }; return migrate(p.pathwayBuilder); };
  const save = () => A().changed();
  const xOf = r => X0 + (r - R0) / (R1 - R0) * (X1 - X0);
  const riskOf = x => Math.round(Math.min(R1, Math.max(R0, R0 + (x - X0) / (X1 - X0) * (R1 - R0))));
  const shortTxt = (t, n) => { t = (t || "").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };

  /* ---------- model helpers ---------- */
  const lines = () => store().lines;
  const byId = id => lines().find(l => l.id === id);
  const findPoint = pid => { for (const l of lines()) { const p = (l.points || []).find(q => q.id === pid); if (p) return { line: l, point: p }; } return null; };
  function lineStart(l) {
    if (l.parentId) { const f = findPoint(l.fromPointId); return f ? f.point.risk : R0; }
    return l.start || R0;
  }
  function lineEnd(l) {
    const s = lineStart(l);
    const stops = (l.points || []).filter(p => p.type === "stop" && p.risk >= s).map(p => p.risk);
    return stops.length ? Math.min(...stops) : null;
  }
  function lineName(l) {
    if (l.parentId) return l.caption ? l.caption : "Alternate / improved path";
    if (l.actionId) { const a = A().allActions().find(x => x.id === l.actionId); if (a) return (a.text || "").trim() || "Action " + a.num; }
    return l.label || "New action";
  }
  function ordered() {   // tree order: each root line followed by its branches
    const out = [];
    const walk = (l, depth) => { out.push({ l, depth }); lines().filter(c => c.parentId === l.id).forEach(c => walk(c, depth + 1)); };
    lines().filter(l => !l.parentId).forEach(l => walk(l, 0));
    return out;
  }
  function colourOf(l) {
    let r = l; while (r.parentId && byId(r.parentId)) r = byId(r.parentId);
    const roots = lines().filter(x => !x.parentId);
    return PALETTE[Math.max(0, roots.indexOf(r)) % PALETTE.length];
  }
  function removeLine(l) {
    lines().filter(c => c.parentId === l.id).forEach(removeLine);
    store().lines = lines().filter(x => x !== l);
  }
  function removePoint(line, point) {
    lines().filter(c => c.fromPointId === point.id).forEach(removeLine);
    line.points = line.points.filter(p => p !== point);
  }
  const uid = () => A().uid();

  /* ---------- draft the map from the pathway details ---------- */
  function importFromPathways() {
    const P = A().getPlan().pathway || [];
    if (!P.length) { alert("There are no pathway details yet. Click a line and fill in its pathway first."); return; }
    if (lines().length && !confirm("Replace the current map with a draft built from the pathway details? Points you have placed will be replaced.")) return;
    store().lines = [];
    P.forEach(p => {
      const later = p.timing === "Later";
      const l = { id: uid(), actionId: p.actionId || "", label: p.actionText || "", start: R0, points: [] };
      if (later || (p.trigger || "").trim()) l.points.push({ id: uid(), type: "trigger", risk: later ? 25 : R0, note: p.trigger || "" });
      let turn = null;
      if ((p.turning || "").trim() || (p.improved || "").trim()) { turn = { id: uid(), type: "turning", risk: 50, note: p.turning || "" }; l.points.push(turn); }
      if ((p.stopping || "").trim() && !/^(not expected|none|n\/a|ongoing|continues)/i.test(p.stopping.trim()))
        l.points.push({ id: uid(), type: "stop", risk: 80, note: p.stopping });
      lines().push(l);
      if (turn && (p.improved || "").trim()) lines().push({ id: uid(), parentId: l.id, fromPointId: turn.id, caption: p.improved, points: [] });
    });
    selected = null; save(); refresh();
  }

  /* ---------- drawing ---------- */
  // Text layout helpers: wrap to a pixel width, shrinking the font (to a minimum of 9) before adding lines.
  const NOTE_W = 150;                 // max width of a point note (px)
  const LABEL_W = X0 - 54;            // width of the action label column (px), leaving a gap before the timeline
  let charK = 0.56;                   // average character width as a share of font size (bold text is wider)
  function wrap(text, widthPx, f) {
    const per = Math.max(8, Math.floor(widthPx / (f * charK)));
    const out = []; let cur = "";
    (text || "").trim().split(/\s+/).forEach(w => {
      while (w.length > per) { if (cur) { out.push(cur); cur = ""; } out.push(w.slice(0, per)); w = w.slice(per); }
      if (!cur) cur = w; else if ((cur + " " + w).length <= per) cur += " " + w; else { out.push(cur); cur = w; }
    });
    if (cur) out.push(cur);
    return out;
  }
  function fitText(text, widthPx, maxLines, sizes) {
    for (const f of sizes) { const l = wrap(text, widthPx, f); if (l.length <= maxLines) return { f, lines: l }; }
    const f = sizes[sizes.length - 1]; return { f, lines: wrap(text, widthPx, f) };   // smallest font, as many lines as needed
  }
  function actionNum(l) {
    if (l.parentId || !l.actionId) return null;
    const a = A().allActions().find(x => x.id === l.actionId); return a ? a.num : null;
  }
  function displayName(l) {   // numbered for actions; "Alternate path" for branches
    if (l.parentId) return "Alternate path: " + (l.caption ? l.caption.trim() : "(add a caption)");
    const n = actionNum(l); return (n ? n + ". " : "") + lineName(l);
  }

  // Work out each lane's text and height before drawing.
  // fs = font scale (1 on screen; larger for the printed report so text stays readable when shrunk to the page)
  function layout(rows, fs = 1) {
    let y = TOP;
    const sz = list => list.map(v => v * fs), NW = NOTE_W * fs;
    return rows.map(({ l, depth }) => {
      const s = lineStart(l);
      charK = l.parentId ? 0.56 : 0.67;
      const maxL = fs > 1 ? 9 : 5;   // in print, allow more lines so names keep a readable size
      const label = l.parentId ? fitText(displayName(l), LABEL_W - depth * 14 - 14, maxL, sz([12.5, 11.5, 10.5, 9.5, 9]))
                               : fitText(displayName(l), LABEL_W - 14, maxL, sz([13.5, 12.5, 11.5, 10.5, 9.5, 9]));
      charK = 0.58;
      const pts = (l.points || []).slice().sort((a, b) => a.risk - b.risk).map(p => ({ p, x: xOf(p.risk),
        text: fitText(p.note || (TYPES[p.type] || TYPES.turning).label, NW, 3, sz([11.5, 10.5, 9.5, 9])) }));
      // notes near the edges are aligned away from the edge so they never run into the labels
      pts.forEach(q => {
        q.anchor = q.x - NW / 2 < X0 - 6 ? "start" : (q.x + NW / 2 > W - 4 ? "end" : "middle");
        q.tx = q.anchor === "start" ? q.x - 8 : q.anchor === "end" ? q.x + 8 : q.x;
        q.hasBranch = lines().some(c => c.fromPointId === q.p.id);
      });
      // Place notes above or below the line so they never overlap.
      // Points with a branch keep their note above (the branch curves away below them).
      pts.forEach(q => {
        const w = Math.max(...q.text.lines.map(t => t.length)) * q.text.f * charK;
        q.l = q.anchor === "start" ? q.tx : q.anchor === "end" ? q.tx - w : q.tx - w / 2;
        q.r = q.l + w;
      });
      const clash = (a, b) => a.l < b.r + 16 && b.l < a.r + 16;
      const placed = { above: [], below: [] };
      pts.filter(q => q.hasBranch).forEach(q => { q.pos = "above"; placed.above.push(q); });
      pts.filter(q => !q.hasBranch).forEach(q => {
        if (!placed.above.some(o => clash(o, q))) q.pos = "above";
        else if (!placed.below.some(o => clash(o, q))) q.pos = "below";
        else q.pos = placed.above.length <= placed.below.length ? "above" : "below";
        placed[q.pos].push(q);
      });
      const lh = q => q.text.lines.length * (q.text.f + 3);
      const above = Math.max(18 * fs, ...pts.filter(q => q.pos === "above").map(q => lh(q) + 20 * fs));
      const below = Math.max(32 * fs, ...pts.filter(q => q.pos === "below").map(q => lh(q) + 40 * fs));
      const labelH = label.lines.length * (label.f + 4);
      const top = Math.max(above, labelH / 2 + 8), bottom = Math.max(below, labelH / 2 + 12);
      const row = { l, depth, s, label, pts, fs, y: y + top };
      y += top + bottom + 8;
      row.bottom = y;
      return row;
    });
  }

  // opts.rows: which lines to draw (default all); opts.fs: font scale (see layout)
  function draw(opts = {}) {
    const fs = opts.fs || 1;
    const rows = layout(opts.rows || ordered(), fs);
    const H = Math.max(TOP + 60, (rows.length ? rows[rows.length - 1].bottom : TOP + 40) + 8);
    const svg = h("svg", { viewBox: "0 0 " + W + " " + H, class: "pb-svg", role: "application",
      "aria-label": "Pathway map. Click a line or its name to open its pathway form; drag points along the climate risk axis." });
    // climate risk axis: a light-to-dark gradient, labelled by risk band, with a faint wash behind the whole map
    const bands = RISK().bands, gid = "pbrisk" + Math.random().toString(36).slice(2, 7);
    svg.append(h("defs", null, h("linearGradient", { id: gid, x1: "0", x2: "1", y1: "0", y2: "0" },
      bands.map((b, i) => h("stop", { offset: (i / Math.max(1, bands.length - 1) * 100) + "%", "stop-color": b.color })))));
    svg.append(h("rect", { x: X0, y: 36, width: X1 - X0, height: H - 42, fill: "url(#" + gid + ")", opacity: 0.16 }),
      h("rect", { x: X0, y: 8, width: X1 - X0, height: 26, rx: 4, fill: "url(#" + gid + ")" }));
    const bw = (X1 - X0) / bands.length;
    bands.forEach((b, i) => {
      if (i) svg.append(h("line", { x1: X0 + i * bw, y1: 36, x2: X0 + i * bw, y2: H - 6, stroke: "#ffffff", "stroke-width": 1.5, opacity: 0.9 }));
      svg.append(h("text", { x: X0 + (i + 0.5) * bw, y: 26, "text-anchor": "middle", class: "pb-band", style: "fill:" + (b.text || "#333") }, b.label));
    });
    svg.append(h("text", { x: 14, y: 26, class: "pb-tick" }, RISK().axisLabel + " →"),
      h("text", { x: 14, y: 58, class: "pb-tick" }, "Action"));

    const laneY = new Map(rows.map(r => [r.l.id, r.y]));
    rows.forEach((r, ri) => {
      const { l, depth, s, label, pts, y } = r;
      const c = colourOf(l), e = lineEnd(l);
      const xs = xOf(s), xe = e !== null ? xOf(e) : X1;
      const g = h("g", { class: "pb-line" + (selected && selected.line === l && !selected.point ? " sel" : "") });
      // separator between actions (not between an action and its branches)
      if (ri > 0 && !l.parentId) g.append(h("line", { x1: 0, y1: rows[ri - 1].bottom - 4, x2: W, y2: rows[ri - 1].bottom - 4, stroke: "#e3e9e5", "stroke-width": 1 }));
      // label: bold numbered action, or italic alternate path
      const lx = 14 + depth * 14, lineH = label.f + 4;
      const lab = h("text", { x: lx, y: y - (label.lines.length - 1) * lineH / 2 + label.f * 0.35,
        class: "pb-label" + (l.parentId ? " child" : ""), "font-size": label.f },
        label.lines.map((t, k) => h("tspan", { x: lx, dy: k ? lineH : 0 }, (k === 0 && l.parentId ? "↳ " : "") + t)));
      const labHit = h("rect", { x: 4, y: y - label.lines.length * lineH / 2 - 6, width: X0 - 20, height: label.lines.length * lineH + 12, fill: "transparent", class: "pb-hit-label" });
      [labHit, lab].forEach(n => n.addEventListener("click", () => { selected = { line: l }; refresh(); showEditor(); }));
      g.append(labHit, lab);
      // branch connector from the parent point
      if (l.parentId && laneY.has(l.parentId)) {
        const py = laneY.get(l.parentId);
        g.append(h("path", { d: `M${xs} ${py} C${xs + 30} ${py} ${xs} ${y} ${xs + 30} ${y}`, fill: "none", stroke: c, "stroke-width": 3, opacity: 0.8, "stroke-linecap": "round" }));
      }
      const x0 = l.parentId ? xs + 30 : xs;
      const trig = (l.points || []).filter(p => p.type === "trigger" && p.risk >= s && (e === null || p.risk <= e)).sort((a, b) => a.risk - b.risk)[0];
      const xt = trig ? Math.max(x0, xOf(trig.risk)) : x0;
      if (trig && xt > x0) g.append(h("line", { x1: x0, y1: y, x2: xt, y2: y, stroke: c, "stroke-width": 2.5, "stroke-dasharray": "2 7", "stroke-linecap": "round", opacity: 0.85 }));
      if (xe > xt) g.append(h("line", { x1: xt, y1: y, x2: xe, y2: y, stroke: c, "stroke-width": l.parentId ? 3 : 3.5, "stroke-linecap": "round", opacity: l.parentId ? 0.85 : 1 }));
      if (e === null) g.append(h("path", { d: `M${X1} ${y - 7} l11 7 l-11 7 z`, fill: c, opacity: l.parentId ? 0.85 : 1 }));
      // click anywhere along the line to open its pathway form (the click position is used for "Add a point")
      const hit = h("line", { x1: x0, y1: y, x2: X1, y2: y, stroke: "transparent", "stroke-width": 20, class: "pb-hit" });
      hit.appendChild(h("title", null, "Click to open this pathway"));
      hit.addEventListener("click", ev => {
        selected = { line: l, at: Math.max(s, riskOf(toSvgX(svg, ev.clientX))) }; refresh(); showEditor();
      });
      g.append(hit);
      if (!l.parentId) {
        const sh = h("circle", { cx: xs, cy: y, r: 6, fill: "#fff", stroke: c, "stroke-width": 2.5, class: "pb-start", tabindex: 0 });
        sh.appendChild(h("title", null, "Start: " + riskLabel(s) + " climate risk (drag to change)"));
        makeDraggable(svg, sh, l, null);
        g.append(sh);
      }
      // points with wrapped notes (above or below the line)
      pts.forEach(q => {
        const p = q.p, t = TYPES[p.type] || TYPES.turning, px = q.x, f = q.text.f, nh = f + 3;
        const isSel = selected && selected.point === p;
        const pg = h("g", { class: "pb-point" + (isSel ? " sel" : ""), tabindex: 0, role: "button",
          "aria-label": t.label + ", " + riskLabel(p.risk) + " climate risk" + (p.note ? ": " + p.note : "") + ". Use arrow keys to move." });
        pg.append(h("title", null, t.label + " (" + riskLabel(p.risk) + " climate risk)" + (p.note ? ": " + p.note : "")));
        if (isSel) pg.append(h("circle", { cx: px, cy: y, r: 14, fill: "none", stroke: t.colour, "stroke-width": 2, "stroke-dasharray": "3 3" }));
        pg.append(h("circle", { cx: px, cy: y, r: 8.5, fill: t.colour, stroke: "#fff", "stroke-width": 2.5, class: "pb-dot" }));
        const n = q.text.lines.length;
        const firstY = q.pos === "above" ? y - 16 * fs - (n - 1) * nh : y + 38 * fs;
        pg.append(h("text", { x: q.tx, y: firstY, "text-anchor": q.anchor, class: "pb-note", "font-size": f, "data-dx": q.tx - px },
          q.text.lines.map((tl, k) => h("tspan", { x: q.tx, dy: k ? nh : 0 }, tl))));
        pg.append(h("text", { x: px, y: y + 23 * fs, "text-anchor": "middle", class: "pb-year", "font-size": 11 * fs }, riskLabel(p.risk)));
        makeDraggable(svg, pg, l, p);
        pg.addEventListener("keydown", ev => {
          if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
            ev.preventDefault();
            p.risk = Math.min(R1, Math.max(lineStart(l), p.risk + (ev.key === "ArrowRight" ? 2 : -2)));
            selected = { line: l, point: p }; save(); refresh(true);
          } else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); selected = { line: l, point: p }; refresh(true); }
          else if (ev.key === "Delete") { removePoint(l, p); selected = null; save(); refresh(); }
        });
        g.append(pg);
      });
      svg.append(g);
    });
    if (!rows.length) svg.append(h("text", { x: W / 2, y: TOP + 30, "text-anchor": "middle", class: "pb-note" },
      "No pathways yet. Use “+ Add action line” to add one for each action you plan to carry forward."));
    return svg;
  }

  function toSvgX(svg, clientX) {
    const pt = svg.createSVGPoint(); pt.x = clientX; pt.y = 0;
    return pt.matrixTransform(svg.getScreenCTM().inverse()).x;
  }

  // Drag a point (or a line's start handle) along the timeline. A press without movement selects it.
  function makeDraggable(svg, el, line, point) {
    el.addEventListener("pointerdown", ev => {
      ev.preventDefault(); ev.stopPropagation();
      el.setPointerCapture(ev.pointerId);
      const startX = ev.clientX; let moved = false;
      const min = point ? lineStart(line) : R0;
      const move = mv => {
        if (Math.abs(mv.clientX - startX) > 3) moved = true;
        if (!moved) return;
        const rv = Math.max(min, riskOf(toSvgX(svg, mv.clientX)));
        if (point) point.risk = rv; else line.start = rv;
        const nx = xOf(rv);
        el.querySelectorAll ? el.querySelectorAll("circle").forEach(c => c.setAttribute("cx", nx)) : null;
        if (el.tagName === "circle") el.setAttribute("cx", nx);
        el.querySelectorAll && el.querySelectorAll("text").forEach(t => {
          const tx = nx + (parseFloat(t.getAttribute("data-dx")) || 0);
          t.setAttribute("x", tx); t.querySelectorAll("tspan").forEach(ts => ts.setAttribute("x", tx));
          if (t.classList.contains("pb-year")) t.textContent = riskLabel(rv);
        });
      };
      const up = () => {
        el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
        if (point) selected = { line, point };
        if (moved) save();
        refresh(true);
      };
      el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    });
  }

  /* ---------- link between a map line and its Pathway planning entry ---------- */
  // Root lines match the pathway for the same action (or the same typed name). If there is none yet,
  // a new entry is made and only added to the plan once something is typed into it.
  function pathwayEntry(l) {
    const plan = A().getPlan(); if (!plan.pathway) plan.pathway = [];
    const name = (l.label || "").trim();
    return (l.actionId ? plan.pathway.find(p => p.actionId === l.actionId)
                       : plan.pathway.find(p => !p.actionId && name && (p.actionText || "").trim() === name))
      || { id: uid(), actionId: l.actionId || "", actionText: l.actionId ? "" : name };
  }
  // "Add a point" buttons: trigger / turning / stop at the level of risk where the line was clicked
  function addPointRow(l) {
    const clicked = selected && selected.at !== undefined;
    const at = t => Math.max(lineStart(l), clicked ? selected.at : { trigger: 25, turning: 50, stop: 80 }[t]);
    return h("div", { class: "pb-addpoint" },
      h("span", { class: "field-label" }, clicked ? "Add a point at " + riskLabel(selected.at).toLowerCase() + " climate risk (where you clicked):" : "Add a point (or click on the line first to choose where):"),
      h("div", { class: "pb-types" }, Object.entries(TYPES).map(([k, v]) =>
        h("button", { type: "button", class: "pb-type", style: "--c:" + v.colour, onclick: () => {
          const pt = { id: uid(), type: k, risk: at(k), note: "" };
          (l.points || (l.points = [])).push(pt); selected = { line: l, point: pt }; save(); refresh();
          setTimeout(() => { const n = document.getElementById("pb-note"); if (n) n.focus(); }, 0);
        } }, h("span", { class: "pb-swatch" }), "+ " + v.label))));
  }
  function showEditor() {
    setTimeout(() => { const hd = edHolder && edHolder.querySelector(".pb-ed-head"); if (hd) hd.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 0);
  }

  /* ---------- editor panel (below the map) ---------- */
  function editor() {
    const box = h("div", { class: "pb-editor" });
    if (!selected || !lines().includes(selected.line)) {
      box.append(h("p", { class: "note", style: "margin:0" }, "Click a line or its name to open its pathway form. Click a point to edit it."));
      return box;
    }
    const l = selected.line, p = selected.point;
    if (p) {
      const t = TYPES[p.type] || TYPES.turning;
      const note = h("textarea", { rows: 2, id: "pb-note", oninput: ev => { p.note = ev.target.value; save(); refreshMap(); } });
      note.value = p.note || "";
      const bandOut = h("span", { class: "pb-risk-out" }, riskLabel(p.risk));
      const riskIn = h("input", { type: "range", id: "pb-risk", class: "pb-risk-range", min: R0, max: R1, step: 1, value: p.risk,
        "aria-valuetext": riskLabel(p.risk) + " climate risk",
        style: "--ramp:linear-gradient(90deg," + RISK().bands.map(b => b.color).join(",") + ")",
        oninput: ev => { p.risk = Math.max(lineStart(l), parseInt(ev.target.value, 10)); ev.target.value = p.risk;
          bandOut.textContent = riskLabel(p.risk); ev.target.setAttribute("aria-valuetext", riskLabel(p.risk) + " climate risk"); refreshMap(); },
        onchange: () => { save(); refresh(true); } });
      box.append(
        h("div", { class: "pb-ed-head" }, h("strong", null, "Point on: "), shortTxt(lineName(l), 70), " ",
          h("button", { type: "button", class: "link-btn", onclick: () => { selected = { line: l }; refresh(); } }, "Open the pathway form \u203a")),
        h("div", { class: "pb-types", role: "radiogroup", "aria-label": "Point type" }, Object.entries(TYPES).map(([k, v]) =>
          h("button", { type: "button", role: "radio", "aria-checked": String(p.type === k), class: "pb-type" + (p.type === k ? " on" : ""),
            style: "--c:" + v.colour, onclick: () => { p.type = k; save(); refresh(true); } }, h("span", { class: "pb-swatch" }), v.label))),
        h("div", { class: "pb-ed-grid" },
          h("div", null, h("label", { class: "field-label", for: "pb-risk" }, "Climate risk level: ", bandOut), riskIn,
            h("div", { class: "pb-risk-ends" }, h("span", null, "Low"), h("span", null, "Extreme"))),
          h("div", null, h("label", { class: "field-label", for: "pb-note" }, t.prompt), note)),
        h("div", { class: "btn-row" },
          h("button", { type: "button", class: "btn secondary", onclick: () => {
            const child = { id: uid(), parentId: l.id, fromPointId: p.id, caption: "", points: [] };
            lines().push(child); selected = { line: child }; save(); refresh();
            setTimeout(() => { const c = document.getElementById("pb-caption"); if (c) c.focus(); }, 0);
          } }, "⤴ Branch a new path from here"),
          h("button", { type: "button", class: "btn ghost", onclick: () => {
            const kids = lines().filter(c => c.fromPointId === p.id).length;
            if (kids && !confirm("This point has " + kids + " branch(es). Delete the point and its branches?")) return;
            removePoint(l, p); selected = { line: l }; save(); refresh();
          } }, "Delete point")));
    } else {
      box.append(h("div", { class: "pb-ed-head" }, h("strong", null, l.parentId ? "Alternate / improved path: " : "Pathway for: "),
        shortTxt(displayName(l).replace(/^Alternate path: /, ""), 110)));
      if (l.parentId) {
        const cap = h("textarea", { rows: 2, id: "pb-caption", placeholder: "e.g. Add shade planting and a heat-stress response team",
          oninput: ev => { l.caption = ev.target.value; save(); refreshMap(); } });
        cap.value = l.caption || "";
        box.append(h("label", { class: "field-label", for: "pb-caption" }, "Caption: what is the alternate or improved action?"), cap);
      } else {
        const acts = A().namedActions();
        const sel = h("select", { id: "pb-action", onchange: ev => {
            const P = A().getPlan().pathway || [], entry = pathwayEntry(l), was = P.includes(entry);
            l.actionId = ev.target.value === "__other" ? "" : ev.target.value;
            if (was && !P.some(q => q !== entry && l.actionId && q.actionId === l.actionId)) { entry.actionId = l.actionId; entry.actionText = l.actionId ? "" : (l.label || ""); }
            save(); refresh(true); } },
          h("option", { value: "__other" }, "Type my own name"), acts.map(a => h("option", { value: a.id }, a.num + ". " + shortTxt(a.text, 80))));
        sel.value = l.actionId && acts.some(a => a.id === l.actionId) ? l.actionId : "__other";
        box.append(h("label", { class: "field-label", for: "pb-action" }, "Action (from Actions tab)"), sel);
        if (sel.value === "__other") {
          const nm = h("input", { type: "text", value: l.label || "", placeholder: "Name of the action", "aria-label": "Action name",
            oninput: ev => { const P = A().getPlan().pathway || [], entry = pathwayEntry(l);
              l.label = ev.target.value; if (P.includes(entry)) entry.actionText = l.label; save(); refreshMap(); } });
          box.append(nm);
        }
        box.append(h("p", { class: "note" }, "Starts at " + riskLabel(lineStart(l)).toLowerCase() + " climate risk. Drag the hollow circle at the start of the line to change it."));
      }
      box.append(addPointRow(l));
      if (!l.parentId) {
        // the pathway form (same fields as content.js pathway.fields), editing this action's plan.pathway entry
        const entry = pathwayEntry(l);
        const P = A().getPlan().pathway;
        box.append(h("h3", { class: "pb-form-title" }, "Pathway details"),
          h("p", { class: "note" }, "These details go into the Pathway planning table and summary of the report."),
          A().pathwayForm(entry, () => { if (!P.includes(entry)) P.push(entry); }));
      }
      box.append(h("div", { class: "btn-row", style: "margin-top:10px" },
        h("button", { type: "button", class: "btn ghost", onclick: () => {
          const P = A().getPlan().pathway || [], entry = l.parentId ? null : pathwayEntry(l);
          if (!confirm("Delete this line" + (lines().some(c => c.parentId === l.id) ? " and its branches" : "") +
            (entry && P.includes(entry) ? " and its pathway details" : "") + "?")) return;
          if (entry && P.includes(entry)) P.splice(P.indexOf(entry), 1);
          removeLine(l); selected = null; save(); refresh();
        } }, "Delete line")));
    }
    return box;
  }

  /* ---------- page ---------- */
  let mapHolder = null, edHolder = null;
  function refreshMap() { if (mapHolder) mapHolder.replaceChildren(draw()); }
  function refresh(keepFocus) {
    const focusLabel = keepFocus && document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("aria-label");
    refreshMap();
    if (edHolder) edHolder.replaceChildren(editor());
    if (focusLabel && selected && selected.point) {
      const g = mapHolder.querySelector(".pb-point.sel"); if (g) g.focus();
    }
  }

  // Every pathway entry (e.g. from an older plan or a merged file) gets a line, so its details can be opened
  function syncFromPathways() {
    let added = 0;
    (A().getPlan().pathway || []).forEach(p => {
      const name = (p.actionText || "").trim();
      if (!p.actionId && !name) return;
      const has = lines().some(l => !l.parentId && (p.actionId ? l.actionId === p.actionId : !l.actionId && (l.label || "").trim() === name));
      if (!has) { lines().push({ id: uid(), actionId: p.actionId || "", label: p.actionId ? "" : name, start: R0, points: [] }); added++; }
    });
    if (added) save();
  }

  function render(el) {
    selected = null;
    root = el;
    syncFromPathways();
    const unused = () => { const used = new Set(lines().map(l => l.actionId)); return A().namedActions().filter(a => !used.has(a.id)); };
    const addBtn = h("button", { type: "button", class: "btn primary", onclick: () => {
      const next = unused()[0];
      const l = { id: uid(), actionId: next ? next.id : "", label: next ? "" : "New action", start: R0, points: [] };
      lines().push(l); selected = { line: l }; save(); refresh(); showEditor();
    } }, "+ Add action line");
    const missing = unused();
    const addAll = missing.length ? h("button", { type: "button", class: "btn secondary", onclick: () => {
      unused().forEach(a => lines().push({ id: uid(), actionId: a.id, label: "", start: R0, points: [] }));
      save(); addAll.remove(); refresh();
    } }, "+ Add a line for every action (" + missing.length + ")") : null;
    mapHolder = h("div", { class: "pb-map" });
    edHolder = h("div", null);
    el.append(
      h("div", { class: "card pb-card" },
        h("div", { class: "btn-row pb-toolbar" }, addBtn, addAll,
          h("button", { type: "button", class: "btn ghost", title: "Rebuild the map from what is written in each pathway (replaces the current map)", onclick: importFromPathways }, "Draft the map from the pathway details")),
        h("div", { class: "pb-scroll" }, mapHolder),
        h("div", { class: "pb-legend" },
          Object.values(TYPES).map(t => h("span", null, h("i", { class: "pb-lg-dot", style: "background:" + t.colour }), t.label)),
          h("span", null, h("i", { class: "pb-lg-dash" }), "Waiting (before the trigger)"),
          h("span", null, h("i", { class: "pb-lg-arrow" }), "Continues")),
        edHolder));
    refresh();
  }

  /* ---------- for the reports ----------
     Returns null when the builder is empty, otherwise
     { png: dataURL, w, h, rows: [{ path, type, risk, note }] }. */
  async function exportForReport() {
    if (!lines().length) return null;
    const FS = 1.35, PAGE_H = 640;            // print font scale; max map height per page (in map units)
    // group lines into families: an action followed by all its branches
    const fams = []; ordered().forEach(r => { if (!r.depth || !fams.length) fams.push([r]); else fams[fams.length - 1].push(r); });
    const pagesRows = []; let cur = [];
    fams.forEach(f => {
      const test = cur.concat(f), rs = layout(test, FS), hgt = rs[rs.length - 1].bottom;
      if (hgt > PAGE_H && cur.length) { pagesRows.push(cur); cur = f; } else cur = test;
    });
    if (cur.length) pagesRows.push(cur);
    const keep = selected; selected = null;
    const pages = [];
    for (const rowsOnPage of pagesRows) {
      const svg = draw({ rows: rowsOnPage, fs: FS });
      // attach off-screen so the page styles apply, then copy them onto the SVG so the picture is self-contained
      const holder = document.createElement("div");
      holder.style.cssText = "position:fixed;left:-5000px;top:0;width:1000px;";
      holder.append(svg); document.body.append(holder);
      svg.querySelectorAll(".pb-hit, .pb-hit-label, .pb-start title, title").forEach(n => n.remove());
      svg.querySelectorAll("text").forEach(t => {
        const cs = getComputedStyle(t);
        t.setAttribute("font-family", "Arial, Helvetica, sans-serif");
        t.setAttribute("font-size", t.getAttribute("font-size") || parseFloat(cs.fontSize) * FS);
        t.setAttribute("font-weight", cs.fontWeight);
        if (cs.fontStyle === "italic") t.setAttribute("font-style", "italic");
        t.setAttribute("fill", cs.fill); t.removeAttribute("class");
      });
      const vb = svg.viewBox.baseVal, W2 = vb.width, H2 = vb.height;
      svg.setAttribute("width", W2); svg.setAttribute("height", H2);
      const xml = new XMLSerializer().serializeToString(svg);
      holder.remove();
      const png = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const k = 2, cv = document.createElement("canvas"); cv.width = W2 * k; cv.height = H2 * k;
          const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
          ctx.drawImage(img, 0, 0, cv.width, cv.height); resolve(cv.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("Could not draw the pathway map."));
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
      });
      pages.push({ png, w: W2, h: H2 });
    }
    selected = keep;
    const rows = [];
    ordered().forEach(({ l }) => {
      const path = displayName(l), isBranch = !!l.parentId;
      if (l.parentId) rows.push({ path, isBranch, type: "New path", risk: riskLabel(lineStart(l)), note: "Branches off here" });
      (l.points || []).slice().sort((a, b) => a.risk - b.risk).forEach(p =>
        rows.push({ path, isBranch, type: (TYPES[p.type] || TYPES.turning).label, risk: riskLabel(p.risk), note: p.note || "" }));
      if (!l.parentId && !(l.points || []).length) rows.push({ path, isBranch, type: "Start", risk: riskLabel(lineStart(l)), note: "" });
    });
    return { pages, png: pages[0].png, w: pages[0].w, h: pages[0].h, rows, colours: Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [v.label, v.colour])) };
  }

  /* ---------- read-only picture of the map (used by the worked example) ----------
     Draws the lines of the plan the app currently holds; the caller swaps in the example plan first. */
  function preview() {
    if (!lines().length) return null;
    const keep = selected; selected = null;
    const svg = draw(); selected = keep;
    svg.querySelectorAll(".pb-hit, .pb-hit-label").forEach(n => n.remove());
    svg.querySelectorAll("[tabindex]").forEach(n => { n.removeAttribute("tabindex"); n.removeAttribute("role"); n.removeAttribute("aria-label"); });
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Adaptation pathways map: each action is a line along increasing climate risk, with triggers, turning points, stopping points and branches.");
    svg.classList.add("pb-static");
    return svg;
  }

  window.PathBuilder = { render, exportForReport, preview };
})();
