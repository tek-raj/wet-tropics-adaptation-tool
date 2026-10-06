/* Report export: builds one report model from the plan, then renders it to Word (.docx) and PDF. */
(function () {
  "use strict";
  const C = window.APP_CONTENT;
  const GREEN = "1F5F4A", SHADE = "E8EFEA", SHADE2 = "F4F7F5", BORDER = "9AA8A1";
  const PRIORITY_FILL = { "Very low": "E3F1E6", "Low": "EEF5D9", "Medium": "FFF3C4", "High": "FFD9B8", "Very high": "F8C4C0" };

  const s = v => (v === undefined || v === null ? "" : String(v)).trim();

  /* ---------------- report model ---------------- */
  function model(plan) {
    const M = window.AppModel;
    const sp = plan.species, st = plan.site;
    const status = [];
    if (sp.epbc) status.push("Federal (EPBC): " + sp.epbc);
    if (sp.qld) status.push("Queensland: " + sp.qld);

    const fieldLabel = (sec, id) => C[sec].fields.find(f => f.id === id).label;
    const speciesRows = [
      [fieldLabel("species", "name"), s(sp.name)],
      [fieldLabel("species", "habitat"), s(sp.habitat)],
      [fieldLabel("species", "importance"), s(sp.importance)],
      ["Conservation status", status.join("\n")],
      [fieldLabel("species", "monitoring"), s(sp.monitoring)]
    ];
    const siteRows = C.site.fields.map(f => [f.label, s(st[f.id])]);

    const hazards = plan.risk.hazards.filter(hz => s(hz.label)).map(hz => ({
      label: s(hz.label), exposure: s(hz.exposure), impact: s(hz.impact), adapt: s(hz.adapt), priority: s(hz.priority)
    }));

    const acts = M.allActions();
    const actionRow = a => {
      const sc = M.scoreOf(a.id);
      return { num: a.num, text: s(a.text), how: s(a.how),
        score: sc.excluded ? "Not culturally acceptable" : sc.n ? sc.total + (sc.complete ? "" : " (incomplete)") : "" };
    };
    const existing = acts.filter(a => a.type === "existing").map(actionRow);
    const potential = acts.filter(a => a.type === "potential").map(actionRow);

    const scoring = M.namedActions().map(a => {
      const sc = plan.scores[a.id] || {}, t = M.scoreOf(a.id);
      return { num: a.num, text: s(a.text), cultural: s(sc.cultural),
        values: C.scoring.criteria.map(c => t.cultural === "Y" ? s(sc[c.id]) : ""),
        total: t.excluded ? "Excluded" : t.n ? String(t.total) + (t.complete ? "" : "*") : "" };
    });

    const pathway = plan.pathway.map(p => ({
      action: M.pathwayActionName(p), timing: s(p.timing), shortGoal: s(p.shortGoal), longGoal: s(p.longGoal),
      trigger: s(p.trigger), turning: s(p.turning), improved: s(p.improved), stopping: s(p.stopping)
    })).filter(p => Object.values(p).some(Boolean));

    const sum = {};
    C.summary.boxes.forEach(b => (sum[b.id] = s(plan.summary[b.id])));
    const photo = plan.summary.photo && plan.summary.photo.data ? plan.summary.photo : null;

    return {
      meta: { title: s(plan.start.planTitle), focus: s(plan.start.planFocus), purpose: s(plan.start.purpose), preparedBy: s(plan.start.preparedBy),
        organisation: s(plan.start.organisation), date: fmtDate(plan.start.date) },
      speciesName: s(sp.name), speciesRows, siteRows, hazards, existing, potential, scoring, pathway,
      summary: sum, photo, boxLabel: id => C.summary.boxes.find(b => b.id === id).label
    };
  }

  function fmtDate(d) {
    if (!d) return "";
    const t = new Date(d + "T00:00:00");
    return isNaN(t) ? d : t.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  }

  const RISK_HEAD = () => C.risk.columns.map(c => c.label);
  const PATH_HEAD = ["Action", "When", "Short term goal", "Long term goal",
    "Trigger (what to look for to know to start action, or ‘action already started’)",
    "Turning point (what to look for to know when to improve or add additional action)",
    "Improved / additional action", "Stopping point (what to look for to know when to stop this action)"];
  const SCORE_HEAD = () => ["#", "Action", "Culturally acceptable (Y/N)"]
    .concat(C.scoring.criteria.map(c => c.label + "\n0–3"), ["Score out of 21"]);
  const SCORING_NOTE = "Note: scoring is indicative only — discuss which actions are likely to be most effective, practical and appropriate. Culturally acceptable is a filter: only actions marked Y are scored. Each criterion scored 0–3 (3 = most favourable, i.e. lowest cost and lowest risk of negative consequences).";

  /* ================= WORD (.docx) ================= */
  async function exportDocx(plan, base) {
    const D = window.docx;
    const m = model(plan);
    const PORTRAIT_W = 9638, LANDSCAPE_W = 14570; // A4 minus 2 cm margins, in twips
    const margin = { top: 1134, bottom: 1134, left: 1134, right: 1134, header: 567, footer: 567 };
    const border = { style: D.BorderStyle.SINGLE, size: 4, color: BORDER };
    const borders = { top: border, bottom: border, left: border, right: border };

    const paras = (text, opts) => {
      opts = opts || {};
      const lines = s(text) ? s(text).split(/\r?\n/) : [""];
      return lines.map(l => new D.Paragraph({ spacing: { after: 40 }, alignment: opts.align,
        children: [new D.TextRun({ text: l, bold: opts.bold, size: opts.size, color: opts.color })] }));
    };
    const cell = (text, o) => {
      o = o || {};
      return new D.TableCell({
        children: o.children || paras(text, o), borders,
        width: o.width ? { size: o.width, type: D.WidthType.DXA } : undefined,
        columnSpan: o.colSpan, rowSpan: o.rowSpan,
        shading: o.fill ? { type: D.ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        verticalAlign: o.vAlign
      });
    };
    const row = (cells, o) => new D.TableRow({ children: cells, tableHeader: o && o.header, cantSplit: o && o.cantSplit,
      height: o && o.minH ? { value: o.minH, rule: D.HeightRule.ATLEAST } : undefined });
    const table = (widths, rows) => new D.Table({ columnWidths: widths, rows, layout: D.TableLayoutType.FIXED,
      width: { size: widths.reduce((a, b) => a + b, 0), type: D.WidthType.DXA } });
    const h1 = t => new D.Paragraph({ spacing: { before: 120, after: 120 },
      children: [new D.TextRun({ text: t, bold: true, size: 30, color: GREEN })] });
    const h2 = t => new D.Paragraph({ spacing: { before: 240, after: 100 },
      children: [new D.TextRun({ text: t, bold: true, size: 24, color: GREEN })] });
    const note = t => new D.Paragraph({ spacing: { after: 120 }, children: [new D.TextRun({ text: t, italics: true, size: 18 })] });
    const hdrCell = (t, w, o) => cell(t, Object.assign({ width: w, fill: SHADE, bold: true, size: 18 }, o || {}));

    const header = new D.Header({ children: [new D.Paragraph({ children: [
      new D.TextRun({ text: C.reportHeader, size: 16, color: "666666" })] })] });
    const footer = new D.Footer({ children: [new D.Paragraph({ alignment: D.AlignmentType.RIGHT, children: [
      new D.TextRun({ text: (m.speciesName ? m.speciesName + "   ·   " : ""), size: 16, color: "666666" }),
      new D.TextRun({ children: ["Page ", D.PageNumber.CURRENT, " of ", D.PageNumber.TOTAL_PAGES], size: 16, color: "666666" })] })] });
    const section = (children, landscape) => ({
      properties: { page: { margin, size: landscape ? { orientation: D.PageOrientation.LANDSCAPE } : {} } },
      headers: { default: header }, footers: { default: footer }, children
    });

    // --- page 1: cover + species + site
    const kv = (rows, w1) => table([w1, PORTRAIT_W - w1],
      rows.map(([k, v]) => row([cell(k, { width: w1, fill: SHADE2, bold: true }), cell(v, { width: PORTRAIT_W - w1 })], { minH: 420, cantSplit: true })));
    const metaLine = [m.meta.preparedBy && "Prepared by: " + m.meta.preparedBy, m.meta.organisation, m.meta.date].filter(Boolean).join("   ·   ");
    const p1 = [
      new D.Paragraph({ spacing: { after: 60 }, children: [new D.TextRun({ text: C.title, bold: true, size: 36, color: GREEN })] }),
      new D.Paragraph({ spacing: { after: 60 }, children: [new D.TextRun({ text: m.meta.title || (m.speciesName ? "Adaptation plan: " + m.speciesName : C.subtitle), size: 26 })] }),
      metaLine ? new D.Paragraph({ spacing: { after: 120 }, children: [new D.TextRun({ text: metaLine, size: 18, color: "555555" })] }) : null,
      m.meta.focus ? new D.Paragraph({ spacing: { after: 60 }, children: [new D.TextRun({ text: "Plan focus: ", bold: true, size: 20 }), new D.TextRun({ text: m.meta.focus, size: 20 })] }) : null,
      m.meta.purpose ? new D.Paragraph({ spacing: { after: 200 }, children: [new D.TextRun({ text: "Purpose: ", bold: true, size: 20 }), new D.TextRun({ text: m.meta.purpose, size: 20 })] }) : null,
      h2("Species details"), kv(m.speciesRows, 2900),
      h2("Site details"), kv(m.siteRows, 2900)
    ].filter(Boolean);

    // --- page 2: risk assessment
    const rw = [2200, 3000, 2400, PORTRAIT_W - 7600];
    const riskRows = [
      row([hdrCell("EXPOSURE", rw[0]), hdrCell("VULNERABILITY", rw[1] + rw[2], { colSpan: 2 }), hdrCell("PRIORITY", rw[3])], { header: true }),
      row(RISK_HEAD().map((t, i) => hdrCell(t, rw[i])), { header: true })
    ];
    m.hazards.forEach(hz => {
      riskRows.push(row([cell(hz.label, { colSpan: 4, fill: SHADE2, bold: true })], { cantSplit: true }));
      riskRows.push(row([cell(hz.exposure, { width: rw[0] }), cell(hz.impact, { width: rw[1] }), cell(hz.adapt, { width: rw[2] }),
        cell(hz.priority, { width: rw[3], bold: true, fill: PRIORITY_FILL[hz.priority] })], { minH: 560, cantSplit: true }));
    });
    const p2 = [h1("Risk assessment"), table(rw, riskRows)];

    // --- page 3: actions
    const aw = [600, 5200, 6770, 2000];
    const actTable = (title, list) => {
      const rows = [row([hdrCell(title, aw[0] + aw[1], { colSpan: 2 }), hdrCell("How does this help the species adapt to climate change hazards?", aw[2]),
        hdrCell("Score out of 21 (see scoring table)", aw[3])], { header: true })];
      (list.length ? list : [{ num: "", text: "", how: "", score: "" }]).forEach(a => rows.push(row([
        cell(String(a.num), { width: aw[0] }), cell(a.text, { width: aw[1] }), cell(a.how, { width: aw[2] }), cell(a.score, { width: aw[3] })], { minH: 520, cantSplit: true })));
      return table(aw, rows);
    };
    const p3 = [h1("Action assessment"), note(SCORING_NOTE.split(".")[0] + "."),
      actTable("Existing actions", m.existing), new D.Paragraph({ spacing: { after: 200 }, children: [] }),
      actTable("Potential actions", m.potential)];

    // --- page 4: scoring
    const nCrit = C.scoring.criteria.length;
    const sw = [450, 3300, 1200].concat(Array(nCrit).fill(1170), [1430]);
    sw[1] = LANDSCAPE_W - (sw.reduce((a, b) => a + b, 0) - sw[1]);
    const scoreRows = [row(SCORE_HEAD().map((t, i) => hdrCell(t, sw[i])), { header: true })];
    (m.scoring.length ? m.scoring : [{ num: "", text: "", cultural: "", values: Array(nCrit).fill(""), total: "" }]).forEach(r => scoreRows.push(row(
      [cell(String(r.num), { width: sw[0] }), cell(r.text, { width: sw[1] }),
       cell(r.cultural, { width: sw[2], align: D.AlignmentType.CENTER, fill: r.cultural === "N" ? "F8C4C0" : undefined })]
        .concat(r.values.map((v, i) => cell(v, { width: sw[3 + i], align: D.AlignmentType.CENTER })),
          [cell(r.total, { width: sw[sw.length - 1], bold: true, align: D.AlignmentType.CENTER })]), { minH: 480, cantSplit: true })));
    const p4 = [h1("Scoring table"), note(SCORING_NOTE), table(sw, scoreRows),
      m.scoring.some(r => r.total.endsWith("*")) ? note("* not all criteria scored.") : null].filter(Boolean);

    // --- page 5: pathway
    const pw = [2270, 900, 1700, 1700, 2000, 2000, 2000, 2000];
    const pathRows = [row(PATH_HEAD.map((t, i) => hdrCell(t, pw[i])), { header: true })];
    const pList = m.pathway.length ? m.pathway : Array(3).fill({});
    pList.forEach(p => pathRows.push(row(["action", "timing", "shortGoal", "longGoal", "trigger", "turning", "improved", "stopping"]
      .map((k, i) => cell(p[k], { width: pw[i], bold: i === 0 })), { minH: 900, cantSplit: true })));
    const p5 = [h1("Pathway planning"), note(C.pathway.intro), table(pw, pathRows)];

    // --- page 6: summary
    const W3 = Math.floor(PORTRAIT_W / 3), cw = [W3, W3, PORTRAIT_W - 2 * W3];
    const boxParas = id => [new D.Paragraph({ spacing: { after: 60 }, children: [new D.TextRun({ text: m.boxLabel(id), bold: true, size: 20, color: GREEN })] })]
      .concat(paras(m.summary[id], { size: 18 }));
    const boxCell = (id, o) => cell("", Object.assign({ children: boxParas(id) }, o));
    let imgChildren;
    if (m.photo) {
      const bytes = dataUrlBytes(m.photo.data);
      const maxW = 190, maxH = 250; // points-ish (px at 96dpi)
      const k = Math.min(maxW / m.photo.w, maxH / m.photo.h);
      imgChildren = [new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [new D.ImageRun({
        type: "jpg", data: bytes, transformation: { width: Math.round(m.photo.w * k), height: Math.round(m.photo.h * k) },
        altText: { title: "Species photo", description: "Photo of " + (m.speciesName || "species"), name: "species-photo" } })] })];
      const cap = [m.photo.caption, m.photo.credit && "Photo: " + m.photo.credit].filter(Boolean).join(" — ");
      if (cap) imgChildren.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [new D.TextRun({ text: cap, italics: true, size: 16 })] }));
    } else {
      imgChildren = paras("Image", { color: "999999", align: D.AlignmentType.CENTER });
    }
    const actionsChildren = [new D.Paragraph({ spacing: { after: 60 }, children: [new D.TextRun({ text: "Actions", bold: true, size: 20, color: GREEN })] }),
      new D.Paragraph({ children: [new D.TextRun({ text: "NOW", bold: true, size: 18 })] })].concat(paras(m.summary.now, { size: 18 }),
      [new D.Paragraph({ spacing: { before: 120 }, children: [new D.TextRun({ text: "LATER", bold: true, size: 18 })] })], paras(m.summary.later, { size: 18 }));
    const sumTable = table(cw, [
      row([cell("", { colSpan: 3, fill: SHADE, children: [new D.Paragraph({ alignment: D.AlignmentType.CENTER,
        children: [new D.TextRun({ text: m.speciesName || "SPECIES NAME", bold: true, size: 40, color: GREEN })] })] })], { minH: 700 }),
      row([boxCell("hazards", { width: cw[0] }), boxCell("longGoals", { width: cw[1] }), boxCell("shortGoals", { width: cw[2] })], { minH: 2300 }),
      row([boxCell("impacts", { width: cw[0] }), cell("", { width: cw[1], rowSpan: 2, children: imgChildren, vAlign: D.VerticalAlign.CENTER }),
        boxCell("cultural", { width: cw[2], rowSpan: 2 })], { minH: 2100 }),
      row([boxCell("triggers", { width: cw[0] })], { minH: 2100 }),
      row([boxCell("turning", { width: cw[0] }), cell("", { width: cw[1] + cw[2], colSpan: 2, children: actionsChildren })], { minH: 3000 })
    ]);
    const p6 = [h1("Adaptation plan summary"), sumTable];

    const doc = new D.Document({
      creator: m.meta.preparedBy || "Adaptation planning tool",
      title: m.meta.title || "Adaptation plan" + (m.speciesName ? " — " + m.speciesName : ""),
      styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
      sections: [section(p1), section(p2), section(p3, true), section(p4, true), section(p5, true), section(p6)]
    });
    const blob = await D.Packer.toBlob(doc);
    window.AppDownload(blob, base + ".docx");
  }

  function dataUrlBytes(url) {
    const b64 = url.split(",")[1], bin = atob(b64), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  /* ================= PDF ================= */
  async function exportPdf(plan, base) {
    const m = model(plan);
    const G = "#" + GREEN, SH = "#" + SHADE, SH2 = "#" + SHADE2;
    const lines = { hLineColor: () => "#" + BORDER, vLineColor: () => "#" + BORDER, hLineWidth: () => 0.6, vLineWidth: () => 0.6,
      paddingLeft: () => 5, paddingRight: () => 5, paddingTop: () => 4, paddingBottom: () => 4 };
    const hc = (t, o) => Object.assign({ text: t, bold: true, fillColor: SH, fontSize: 8.5 }, o || {});
    const tx = (t, o) => Object.assign({ text: s(t) }, o || {});
    const h1 = t => ({ text: t, fontSize: 15, bold: true, color: G, margin: [0, 0, 0, 8] });
    const h2 = t => ({ text: t, fontSize: 12, bold: true, color: G, margin: [0, 12, 0, 6] });
    const note = t => ({ text: t, italics: true, fontSize: 8.5, margin: [0, 0, 0, 8] });
    const empty = (n, h) => ({ text: "\n".repeat(h || 2) });

    const kv = rows => ({ table: { widths: [150, "*"], dontBreakRows: true,
      body: rows.map(([k, v]) => [{ text: k, bold: true, fillColor: SH2 }, v ? tx(v) : empty(1, 2)]) }, layout: lines });

    const metaLine = [m.meta.preparedBy && "Prepared by: " + m.meta.preparedBy, m.meta.organisation, m.meta.date].filter(Boolean).join("   ·   ");
    const content = [
      { text: C.title, fontSize: 18, bold: true, color: G },
      { text: m.meta.title || (m.speciesName ? "Adaptation plan: " + m.speciesName : C.subtitle), fontSize: 13, margin: [0, 2, 0, 2] },
      metaLine ? { text: metaLine, fontSize: 9, color: "#555", margin: [0, 0, 0, 6] } : "",
      m.meta.focus ? { text: [{ text: "Plan focus: ", bold: true }, m.meta.focus], margin: [0, 0, 0, 3] } : "",
      m.meta.purpose ? { text: [{ text: "Purpose: ", bold: true }, m.meta.purpose], margin: [0, 0, 0, 6] } : "",
      h2("Species details"), kv(m.speciesRows),
      h2("Site details"), kv(m.siteRows)
    ];

    // risk
    const riskBody = [
      [hc("EXPOSURE"), hc("VULNERABILITY", { colSpan: 2 }), {}, hc("PRIORITY")],
      RISK_HEAD().map(t => hc(t))
    ];
    m.hazards.forEach(hz => {
      riskBody.push([{ text: hz.label, bold: true, colSpan: 4, fillColor: SH2 }, {}, {}, {}]);
      riskBody.push([tx(hz.exposure), tx(hz.impact), tx(hz.adapt),
        { text: hz.priority || "\n\n", bold: true, fillColor: PRIORITY_FILL[hz.priority] ? "#" + PRIORITY_FILL[hz.priority] : undefined }]);
    });
    content.push({ stack: [h1("Risk assessment"), { table: { headerRows: 2, widths: [110, "*", 110, 80], dontBreakRows: true, body: riskBody }, layout: lines }],
      pageBreak: "before", pageOrientation: "portrait" });

    // actions
    const actTable = (title, list) => {
      const body = [[hc(title, { colSpan: 2 }), {}, hc("How does this help the species adapt to climate change hazards?"), hc("Score out of 21 (see scoring table)")]];
      (list.length ? list : [{}]).forEach(a => body.push([tx(a.num), a.text ? tx(a.text) : empty(1, 2), tx(a.how), tx(a.score)]));
      return { table: { headerRows: 1, widths: [18, 220, "*", 90], dontBreakRows: true, body }, layout: lines };
    };
    content.push({ stack: [h1("Action assessment"), note(SCORING_NOTE.split(".")[0] + "."),
      actTable("Existing actions", m.existing), { text: "", margin: [0, 0, 0, 12] },
      actTable("Potential actions", m.potential)], pageBreak: "before", pageOrientation: "landscape" });

    // scoring
    const nCrit = C.scoring.criteria.length;
    const scoreBody = [SCORE_HEAD().map(t => hc(t))];
    (m.scoring.length ? m.scoring : [{ num: "", text: "", cultural: "", values: Array(nCrit).fill(""), total: "" }]).forEach(r => scoreBody.push(
      [tx(r.num), r.text ? tx(r.text) : empty(1, 2), { text: r.cultural, alignment: "center", fillColor: r.cultural === "N" ? "#F8C4C0" : undefined }]
        .concat(r.values.map(v => ({ text: v, alignment: "center" })), [{ text: r.total, bold: true, alignment: "center" }])));
    content.push({ stack: [h1("Scoring table"), note(SCORING_NOTE),
      { table: { headerRows: 1, widths: [14, "*", 52].concat(Array(nCrit).fill(52), [50]), dontBreakRows: true, body: scoreBody }, layout: lines },
      m.scoring.some(r => r.total.endsWith("*")) ? note("\n* not all criteria scored.") : ""], pageBreak: "before", pageOrientation: "landscape" });

    // pathway
    const pathBody = [PATH_HEAD.map(t => hc(t))];
    (m.pathway.length ? m.pathway : [{}, {}, {}]).forEach(p => pathBody.push(
      ["action", "timing", "shortGoal", "longGoal", "trigger", "turning", "improved", "stopping"]
        .map((k, i) => i === 0 ? { text: s(p[k]) || "\n\n\n", bold: true } : tx(p[k]))));
    content.push({ stack: [h1("Pathway planning"), note(C.pathway.intro),
      { table: { headerRows: 1, widths: ["*", 36, "*", "*", "*", "*", "*", "*"], dontBreakRows: true, body: pathBody }, layout: lines }],
      pageBreak: "before", pageOrientation: "landscape" });

    // summary
    const box = id => ({ stack: [{ text: m.boxLabel(id), bold: true, color: G, fontSize: 10, margin: [0, 0, 0, 3] },
      { text: m.summary[id] || " ", fontSize: 9 }] });
    const minH = n => ({ text: "", margin: [0, 0, 0, n] });
    const photoCell = m.photo
      ? { stack: [{ image: m.photo.data, fit: [160, 230], alignment: "center" },
          [m.photo.caption, m.photo.credit && "Photo: " + m.photo.credit].filter(Boolean).length
            ? { text: [m.photo.caption, m.photo.credit && "Photo: " + m.photo.credit].filter(Boolean).join(" — "), italics: true, fontSize: 7.5, alignment: "center", margin: [0, 4, 0, 0] } : ""],
          rowSpan: 2, margin: [0, 4, 0, 4] }
      : { text: "Image", color: "#999", alignment: "center", rowSpan: 2, margin: [0, 80, 0, 0] };
    const withMin = (cellObj, h) => ({ stack: [cellObj, minH(h)], rowSpan: cellObj.rowSpan, colSpan: cellObj.colSpan });
    const actionsCell = { colSpan: 2, stack: [
      { text: "Actions", bold: true, color: G, fontSize: 10, margin: [0, 0, 0, 3] },
      { text: "NOW", bold: true, fontSize: 9 }, { text: m.summary.now || " ", fontSize: 9, margin: [0, 0, 0, 8] },
      { text: "LATER", bold: true, fontSize: 9 }, { text: m.summary.later || " ", fontSize: 9 }, minH(60)] };
    const culturalCell = Object.assign(withMin(box("cultural"), 60), { rowSpan: 2 });
    content.push({ stack: [h1("Adaptation plan summary"),
      { table: { widths: ["*", "*", "*"], body: [
        [{ text: m.speciesName || "SPECIES NAME", colSpan: 3, alignment: "center", fontSize: 22, bold: true, color: G, fillColor: SH, margin: [0, 6, 0, 6] }, {}, {}],
        [withMin(box("hazards"), 75), withMin(box("longGoals"), 75), withMin(box("shortGoals"), 75)],
        [withMin(box("impacts"), 70), photoCell, culturalCell],
        [withMin(box("triggers"), 70), {}, {}],
        [withMin(box("turning"), 95), actionsCell, {}]
      ] }, layout: Object.assign({}, lines, { paddingLeft: () => 7, paddingRight: () => 7, paddingTop: () => 6, paddingBottom: () => 6 }) }],
      pageBreak: "before", pageOrientation: "portrait" });

    const dd = {
      pageSize: "A4", pageOrientation: "portrait", pageMargins: [40, 50, 40, 45],
      info: { title: m.meta.title || "Adaptation plan" + (m.speciesName ? " - " + m.speciesName : ""), author: m.meta.preparedBy },
      defaultStyle: { fontSize: 9.5, lineHeight: 1.15 },
      header: () => ({ text: C.reportHeader, fontSize: 8, color: "#666", margin: [40, 22, 40, 0] }),
      footer: (cur, total) => ({ text: (m.speciesName ? m.speciesName + "   ·   " : "") + "Page " + cur + " of " + total,
        alignment: "right", fontSize: 8, color: "#666", margin: [40, 15, 40, 0] }),
      content
    };
    await new Promise((resolve, reject) => {
      try { window.pdfMake.createPdf(dd).getBlob(b => { window.AppDownload(b, base + ".pdf"); resolve(); }); }
      catch (e) { reject(e); }
    });
  }

  window.ReportExport = { docx: exportDocx, pdf: exportPdf, _model: model };
})();
