/*
 * PATHWAY BUILDER (TEST TAB)
 * An interactive adaptation pathways map. Everything for this experiment lives in this file
 * (plus its tab entry in app.js and its styles at the end of style.css), so it can be removed easily.
 * Data is stored in plan.pathwayBuilder = { lines: [...] } and saved with the plan.
 *
 * Line:  { id, actionId?, label?, parentId?, fromPointId?, caption?, start?, points: [...] }
 *        - root lines are actions; child lines are alternate / improved paths that branch from a point
 * Point: { id, year, type: "trigger" | "turning" | "stop", note }
 */
(function () {
  "use strict";
  const YEAR0 = 2025, YEAR1 = 2100, TICKS = [2025, 2045, 2065, 2085, 2100];
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
  const store = () => { const p = A().getPlan(); if (!p.pathwayBuilder) p.pathwayBuilder = { lines: [] }; return p.pathwayBuilder; };
  const save = () => A().changed();
  const xOf = y => X0 + (y - YEAR0) / (YEAR1 - YEAR0) * (X1 - X0);
  const yearOf = x => Math.round(Math.min(YEAR1, Math.max(YEAR0, YEAR0 + (x - X0) / (X1 - X0) * (YEAR1 - YEAR0))));
  const shortTxt = (t, n) => { t = (t || "").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };

  /* ---------- model helpers ---------- */
  const lines = () => store().lines;
  const byId = id => lines().find(l => l.id === id);
  const findPoint = pid => { for (const l of lines()) { const p = (l.points || []).find(q => q.id === pid); if (p) return { line: l, point: p }; } return null; };
  function lineStart(l) {
    if (l.parentId) { const f = findPoint(l.fromPointId); return f ? f.point.year : YEAR0; }
    return l.start || YEAR0;
  }
  function lineEnd(l) {
    const s = lineStart(l);
    const stops = (l.points || []).filter(p => p.type === "stop" && p.year >= s).map(p => p.year);
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

  /* ---------- import from the Pathway planning tab ---------- */
  function importFromPathways() {
    const P = A().getPlan().pathway || [];
    if (!P.length) { alert("There are no pathways on the Pathway planning tab yet."); return; }
    if (lines().length && !confirm("Replace the current map with a draft built from your Pathway planning entries?")) return;
    store().lines = [];
    P.forEach(p => {
      const later = p.timing === "Later";
      const l = { id: uid(), actionId: p.actionId || "", label: p.actionText || "", start: YEAR0, points: [] };
      if (later || (p.trigger || "").trim()) l.points.push({ id: uid(), type: "trigger", year: later ? 2035 : YEAR0, note: p.trigger || "" });
      let turn = null;
      if ((p.turning || "").trim() || (p.improved || "").trim()) { turn = { id: uid(), type: "turning", year: 2050, note: p.turning || "" }; l.points.push(turn); }
      if ((p.stopping || "").trim() && !/^(not expected|none|n\/a|ongoing|continues)/i.test(p.stopping.trim()))
        l.points.push({ id: uid(), type: "stop", year: 2075, note: p.stopping });
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
      const pts = (l.points || []).slice().sort((a, b) => a.year - b.year).map(p => ({ p, x: xOf(p.year),
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
      "aria-label": "Pathway builder. Click on a line to add a point; drag points along the timeline." });
    // time bands and axis
    [["Now", 2025, 2045], ["Near term", 2045, 2065], ["Longer term", 2065, 2100]].forEach(([t, a, b], i) => {
      svg.append(h("rect", { x: xOf(a), y: 8, width: xOf(b) - xOf(a), height: 22, fill: i % 2 ? "#eef3f0" : "#e4ece7" }),
        h("text", { x: (xOf(a) + xOf(b)) / 2, y: 24, "text-anchor": "middle", class: "pb-band" }, t));
    });
    svg.append(h("line", { x1: X0, y1: 56, x2: X1, y2: 56, stroke: "#8a9a92", "stroke-width": 2 }));
    TICKS.forEach(y => {
      svg.append(h("line", { x1: xOf(y), y1: 50, x2: xOf(y), y2: H - 6, stroke: "#dfe6e2", "stroke-width": 1 }),
        h("line", { x1: xOf(y), y1: 50, x2: xOf(y), y2: 62, stroke: "#8a9a92", "stroke-width": 2 }),
        h("text", { x: xOf(y), y: 46, "text-anchor": "middle", class: "pb-tick" }, y === YEAR0 ? "Now (" + y + ")" : String(y)));
    });
    svg.append(h("text", { x: 14, y: 46, class: "pb-tick" }, "Action"));

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
      [labHit, lab].forEach(n => n.addEventListener("click", () => { selected = { line: l }; refresh(); }));
      g.append(labHit, lab);
      // branch connector from the parent point
      if (l.parentId && laneY.has(l.parentId)) {
        const py = laneY.get(l.parentId);
        g.append(h("path", { d: `M${xs} ${py} C${xs + 30} ${py} ${xs} ${y} ${xs + 30} ${y}`, fill: "none", stroke: c, "stroke-width": 3, opacity: 0.8, "stroke-linecap": "round" }));
      }
      const x0 = l.parentId ? xs + 30 : xs;
      const trig = (l.points || []).filter(p => p.type === "trigger" && p.year >= s && (e === null || p.year <= e)).sort((a, b) => a.year - b.year)[0];
      const xt = trig ? Math.max(x0, xOf(trig.year)) : x0;
      if (trig && xt > x0) g.append(h("line", { x1: x0, y1: y, x2: xt, y2: y, stroke: c, "stroke-width": 2.5, "stroke-dasharray": "2 7", "stroke-linecap": "round", opacity: 0.85 }));
      if (xe > xt) g.append(h("line", { x1: xt, y1: y, x2: xe, y2: y, stroke: c, "stroke-width": l.parentId ? 3 : 3.5, "stroke-linecap": "round", opacity: l.parentId ? 0.85 : 1 }));
      if (e === null) g.append(h("path", { d: `M${X1} ${y - 7} l11 7 l-11 7 z`, fill: c, opacity: l.parentId ? 0.85 : 1 }));
      // click anywhere along the line to add a point
      const hit = h("line", { x1: x0, y1: y, x2: X1, y2: y, stroke: "transparent", "stroke-width": 20, class: "pb-hit" });
      hit.appendChild(h("title", null, "Click to add a point here"));
      hit.addEventListener("click", ev => {
        const yr = Math.max(s, yearOf(toSvgX(svg, ev.clientX)));
        const list = l.points || (l.points = []);
        const pt = { id: uid(), type: !list.length ? "trigger" : "turning", year: yr, note: "" };
        list.push(pt); selected = { line: l, point: pt }; save(); refresh();
      });
      g.append(hit);
      if (!l.parentId) {
        const sh = h("circle", { cx: xs, cy: y, r: 6, fill: "#fff", stroke: c, "stroke-width": 2.5, class: "pb-start", tabindex: 0 });
        sh.appendChild(h("title", null, "Start: " + s + " (drag to change)"));
        makeDraggable(svg, sh, l, null);
        g.append(sh);
      }
      // points with wrapped notes (above or below the line)
      pts.forEach(q => {
        const p = q.p, t = TYPES[p.type] || TYPES.turning, px = q.x, f = q.text.f, nh = f + 3;
        const isSel = selected && selected.point === p;
        const pg = h("g", { class: "pb-point" + (isSel ? " sel" : ""), tabindex: 0, role: "button",
          "aria-label": t.label + ", " + p.year + (p.note ? ": " + p.note : "") + ". Use arrow keys to move." });
        pg.append(h("title", null, t.label + " (" + p.year + ")" + (p.note ? ": " + p.note : "")));
        if (isSel) pg.append(h("circle", { cx: px, cy: y, r: 14, fill: "none", stroke: t.colour, "stroke-width": 2, "stroke-dasharray": "3 3" }));
        pg.append(h("circle", { cx: px, cy: y, r: 8.5, fill: t.colour, stroke: "#fff", "stroke-width": 2.5, class: "pb-dot" }));
        const n = q.text.lines.length;
        const firstY = q.pos === "above" ? y - 16 * fs - (n - 1) * nh : y + 38 * fs;
        pg.append(h("text", { x: q.tx, y: firstY, "text-anchor": q.anchor, class: "pb-note", "font-size": f, "data-dx": q.tx - px },
          q.text.lines.map((tl, k) => h("tspan", { x: q.tx, dy: k ? nh : 0 }, tl))));
        pg.append(h("text", { x: px, y: y + 23 * fs, "text-anchor": "middle", class: "pb-year", "font-size": 11 * fs }, String(p.year)));
        makeDraggable(svg, pg, l, p);
        pg.addEventListener("keydown", ev => {
          if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
            ev.preventDefault();
            p.year = Math.min(YEAR1, Math.max(lineStart(l), p.year + (ev.key === "ArrowRight" ? 1 : -1)));
            selected = { line: l, point: p }; save(); refresh(true);
          } else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); selected = { line: l, point: p }; refresh(true); }
          else if (ev.key === "Delete") { removePoint(l, p); selected = null; save(); refresh(); }
        });
        g.append(pg);
      });
      svg.append(g);
    });
    if (!rows.length) svg.append(h("text", { x: W / 2, y: TOP + 30, "text-anchor": "middle", class: "pb-note" },
      "No lines yet. Use “+ Add action line” or “Start from my pathway entries”."));
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
      const min = point ? lineStart(line) : YEAR0;
      const move = mv => {
        if (Math.abs(mv.clientX - startX) > 3) moved = true;
        if (!moved) return;
        const yr = Math.max(min, yearOf(toSvgX(svg, mv.clientX)));
        if (point) point.year = yr; else line.start = yr;
        const nx = xOf(yr);
        el.querySelectorAll ? el.querySelectorAll("circle").forEach(c => c.setAttribute("cx", nx)) : null;
        if (el.tagName === "circle") el.setAttribute("cx", nx);
        el.querySelectorAll && el.querySelectorAll("text").forEach(t => {
          const tx = nx + (parseFloat(t.getAttribute("data-dx")) || 0);
          t.setAttribute("x", tx); t.querySelectorAll("tspan").forEach(ts => ts.setAttribute("x", tx));
          if (t.classList.contains("pb-year")) t.textContent = yr;
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

  /* ---------- editor panel (below the map) ---------- */
  function editor() {
    const box = h("div", { class: "pb-editor" });
    if (!selected || !lines().includes(selected.line)) {
      box.append(h("p", { class: "note", style: "margin:0" }, "Select a point or a line name to edit it. Click on a line to add a point."));
      return box;
    }
    const l = selected.line, p = selected.point;
    if (p) {
      const t = TYPES[p.type] || TYPES.turning;
      const note = h("textarea", { rows: 2, id: "pb-note", oninput: ev => { p.note = ev.target.value; save(); refreshMap(); } });
      note.value = p.note || "";
      const yearIn = h("input", { type: "number", id: "pb-year", min: lineStart(l), max: YEAR1, step: 1, value: p.year,
        onchange: ev => { p.year = Math.min(YEAR1, Math.max(lineStart(l), parseInt(ev.target.value, 10) || p.year)); save(); refresh(true); } });
      box.append(
        h("div", { class: "pb-ed-head" }, h("strong", null, "Point on: "), shortTxt(lineName(l), 70)),
        h("div", { class: "pb-types", role: "radiogroup", "aria-label": "Point type" }, Object.entries(TYPES).map(([k, v]) =>
          h("button", { type: "button", role: "radio", "aria-checked": String(p.type === k), class: "pb-type" + (p.type === k ? " on" : ""),
            style: "--c:" + v.colour, onclick: () => { p.type = k; save(); refresh(true); } }, h("span", { class: "pb-swatch" }), v.label))),
        h("div", { class: "pb-ed-grid" },
          h("div", null, h("label", { class: "field-label", for: "pb-year" }, "Year"), yearIn),
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
      box.append(h("div", { class: "pb-ed-head" }, h("strong", null, l.parentId ? "Alternate / improved path" : "Action line")));
      if (l.parentId) {
        const cap = h("textarea", { rows: 2, id: "pb-caption", placeholder: "e.g. Add shade planting and a heat-stress response team",
          oninput: ev => { l.caption = ev.target.value; save(); refreshMap(); } });
        cap.value = l.caption || "";
        box.append(h("label", { class: "field-label", for: "pb-caption" }, "Caption: what is the alternate or improved action?"), cap);
      } else {
        const acts = A().namedActions();
        const sel = h("select", { id: "pb-action", onchange: ev => { l.actionId = ev.target.value === "__other" ? "" : ev.target.value; save(); refresh(true); } },
          h("option", { value: "__other" }, "Type my own name"), acts.map(a => h("option", { value: a.id }, a.num + ". " + shortTxt(a.text, 80))));
        sel.value = l.actionId && acts.some(a => a.id === l.actionId) ? l.actionId : "__other";
        box.append(h("label", { class: "field-label", for: "pb-action" }, "Action"), sel);
        if (sel.value === "__other") {
          const nm = h("input", { type: "text", value: l.label || "", placeholder: "Name of the action", "aria-label": "Action name",
            oninput: ev => { l.label = ev.target.value; save(); refreshMap(); } });
          box.append(nm);
        }
        box.append(h("p", { class: "note" }, "Starts in " + lineStart(l) + ". Drag the hollow circle at the start of the line to change it."));
      }
      box.append(h("div", { class: "btn-row", style: "margin-top:10px" },
        h("button", { type: "button", class: "btn ghost", onclick: () => {
          if (!confirm("Delete this line" + (lines().some(c => c.parentId === l.id) ? " and its branches" : "") + "?")) return;
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

  function render(el) {
    selected = null;
    root = el;
    const addBtn = h("button", { type: "button", class: "btn primary", onclick: () => {
      const used = new Set(lines().map(l => l.actionId));
      const next = A().namedActions().find(a => !used.has(a.id));
      const l = { id: uid(), actionId: next ? next.id : "", label: next ? "" : "New action", start: YEAR0, points: [] };
      lines().push(l); selected = { line: l }; save(); refresh();
    } }, "+ Add action line");
    mapHolder = h("div", { class: "pb-map" });
    edHolder = h("div", null);
    el.append(
      h("div", { class: "pb-banner" }, h("strong", null, "Test tab. "),
        "This is an experimental way to build adaptation pathways. It does not change your Pathway planning entries and is not yet in the reports."),
      h("div", { class: "section-head" },
        h("div", { class: "title-row" }, h("h2", null, "Pathway builder")),
        h("p", { class: "intro" }, "Draw each action as a line through time. Click on a line to add a point, drag points to move them, then set each one as a trigger, turning point or stopping point. Branch off a new line for an alternate or improved action.")),
      h("div", { class: "card pb-card" },
        h("div", { class: "btn-row pb-toolbar" }, addBtn,
          h("button", { type: "button", class: "btn secondary", onclick: importFromPathways }, "Start from my pathway entries")),
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
     { png: dataURL, w, h, rows: [{ path, type, year, note }] }. */
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
      if (l.parentId) rows.push({ path, isBranch, type: "New path", year: String(lineStart(l)), note: "Branches off here" });
      (l.points || []).slice().sort((a, b) => a.year - b.year).forEach(p =>
        rows.push({ path, isBranch, type: (TYPES[p.type] || TYPES.turning).label, year: String(p.year), note: p.note || "" }));
      if (!l.parentId && !(l.points || []).length) rows.push({ path, isBranch, type: "Start", year: String(lineStart(l)), note: "" });
    });
    return { pages, png: pages[0].png, w: pages[0].w, h: pages[0].h, rows, colours: Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [v.label, v.colour])) };
  }

  window.PathBuilder = { render, exportForReport };
})();
