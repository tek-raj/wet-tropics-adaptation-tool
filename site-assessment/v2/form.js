/*
 * SITE RECORDING SHEET – questions, in the order of the paper form ("Site recording form.pdf", 4 pages).
 * Field types: text, date, textarea, yesno, checks (tick boxes; options may ask for a detail, and an
 * "other" option asks what), gps (adds "Use my location"), photos (adds camera and captions).
 * showIf: { field: value } shows a question only when another question has that answer.
 * plan: "<id>" marks a question that fills a box on the planning tool's Site tab (content.js, site.fields). It shows
 * that box's help (the "i" button, same as the first Site assessment app) and is imported into the planning tool.
 * Together these cover every question on the planning tool's Site tab.
 * help: { instructions, examples, guidance } gives a question its own "i" help (used instead of the planning tool's).
 * table columns: [id, label, type, options]; type "select" is a drop-down of options.
 * Updated after a review by the project team (Nov 2026).
 */
window.SITE_RECORDING = {
  title: "Site assessment",
  printTitle: "Site recording sheet",
  intro: "Record the site while you are there. Answer what you can; every question is optional and you can come back to it later.",
  sensitive: "This record may hold culturally sensitive information, such as the location of burials or story places. Share the file only with people the Traditional Owners have agreed can see it.",
  fileFormat: "site-recording",          // "format" value in files saved by the app
  fileExt: ".siterecord.json",
  sections: [
    { title: "Recorder and visit", fields: [
      { id: "recorder", label: "Recorder's name", type: "text" },
      { id: "dateRecorded", label: "Date recorded", type: "date", plan: "assessDate" },
      { id: "people", label: "People present", type: "textarea", rows: 2, plan: "people" },
      { id: "reason", label: "Reason for assessment", type: "textarea", rows: 2, plan: "reason" },
      { id: "scale", label: "Scale of assessment", type: "choice", plan: "scale", options: [
        ["Site", "Site"], ["Property", "Property"], ["Local Government Area (LGA)", "Local Government Area (LGA)"], ["Region or catchment", "Region or catchment"], ["Other", "Other"] ] },
      { id: "prevRecorded", label: "Has the site been previously recorded?", type: "yesno" },
      { id: "prevWho", label: "Who recorded it?", type: "text", showIf: { prevRecorded: "yes" } },
      { id: "prevMgmtPlan", label: "Is there a current management plan for the site/area?", type: "text", showIf: { prevRecorded: "yes" } },
      { id: "prevInfoHeld", label: "Where is the information held?", type: "text", showIf: { prevRecorded: "yes" } }
    ] },
    { title: "Site and location", fields: [
      { id: "siteNo", label: "Site No.", type: "text" },
      { id: "siteName", label: "Site name", type: "text", plan: "placeName" },
      { id: "propertyName", label: "Property or area name", type: "text", plan: "propertyName" },
      { id: "gps", label: "GPS location", type: "gps", hint: "Latitude, longitude (decimal degrees)", plan: "gps" },
      { id: "map", label: "Map name, scale and series", type: "text" },
      { id: "tenure", label: "Land tenure", type: "checks", options: [
        ["nationalPark", "National Park"], ["stateForest", "State Forest"], ["freehold", "Freehold"], ["reserve", "Reserve"], ["other", "Other"] ] },
      { id: "landOwner", label: "Current land owner details (if relevant)", type: "textarea", rows: 2, plan: "propertyContact" },
      { id: "landform", label: "Landform", type: "checks", options: [
        ["creekBank", "River/creek bank"], ["beachDune", "Coastal beach/dune"], ["estuary", "River/creek estuary"],
        ["floodplain", "Floodplain"], ["hillSlope", "Hill slope"], ["cultivation", "Under cultivation"], ["other", "Other"] ] },
      { id: "access", label: "Description of location (how to get there)", type: "textarea", rows: 3 }
    ] },
    { title: "Surroundings", fields: [
      // Site description fills the planning tool's "Description of environment" box (one question, not two)
      { id: "siteDescription", label: "Site description", type: "textarea", rows: 5, plan: "environment" },
      // id kept as "bushTucker" so records saved earlier still show their answer here
      { id: "bushTucker", label: "Can you see plants or landscape elements associated with your selected species or site?", type: "textarea", rows: 3,
        hint: "For example, food or shelter plants, nesting or roosting trees, rock outcrops, waterholes or creek banks the species uses." },
      { id: "sightings", label: "Sightings or records of the species or ecosystem", type: "textarea", rows: 2, plan: "sightings" }
    ] },
    { title: "Photos", fields: [
      { id: "photos", label: "Site photos", type: "photos" },
      { id: "photoPoints", label: "Photo monitoring points", type: "textarea", rows: 3, plan: "photoPoints" },
      { id: "pastPhotos", label: "Are there photos of this site from past assessments? Where are those photos held?", type: "textarea", rows: 2 }
    ] },
    { title: "Condition, impacts and management", fields: [
      { id: "condition", label: "Current condition", type: "textarea", rows: 3, plan: "condition" },
      { id: "changes", label: "What changes do you notice from the last visit?", type: "textarea", rows: 3,
        hint: "Leave blank if this is the first visit." },
      { id: "landscapeHealth", label: "Landscape health score (1–3)", type: "choice",
        options: [["1", "1 – Poor"], ["2", "2 – Fair"], ["3", "3 – Good"]],
        help: {
          instructions: "Give the site an overall landscape health score, then describe what you see in the box below.",
          examples: "1 – Poor: weeds cover much of the site, rubbish or pollution is common, and little native vegetation remains.\n2 – Fair: some weeds and pollution, and native vegetation is patchy or partly cleared.\n3 – Good: few or no weeds, no pollution seen, and native vegetation is extensive and healthy.",
          guidance: "Consider:\n• invasive weeds: which ones, and how widespread\n• pollution: rubbish, chemicals, runoff, oil or sewage\n• extent of native vegetation: how much remains, and its condition\n• other damage, such as erosion, feral animal or stock damage, or recent fire" } },
      { id: "landscapeDescribe", label: "Landscape health – describe", type: "textarea", rows: 4,
        hint: "Invasive weeds, pollution, and the extent and condition of native vegetation." },
      { id: "currentImpacts", label: "Current impacts/activities to site and area", type: "textarea", rows: 4 },
      { id: "futureImpacts", label: "Potential future impacts", type: "textarea", rows: 4 },
      { id: "recommendations", label: "Management options/recommendations", type: "textarea", rows: 6 },
      { id: "mgmtPlan", label: "Current management plan(s)", type: "textarea", rows: 2, plan: "mgmtPlans" },
      { id: "monitoring", label: "Existing monitoring at the site (if any)", type: "textarea", rows: 2, plan: "monitoring" }
    ] },
    { title: "Climate hazards", fields: [
      // one row per hazard; the list is the planning tool's hazards (content.js, risk.hazards)
      { id: "hazards", label: "Climate hazards at this site", type: "table", rows: 1, rowLabel: "Hazard", addLabel: "+ Add another hazard",
        hint: "Discuss the climate hazards identified in the pre-site visit discussion. Choose a hazard and note what you see at the site, e.g. signs it is already happening, or parts of the site that are most exposed. A new row appears when you choose a hazard.",
        columns: [["hazard", "Climate hazard", "select", (((window.APP_CONTENT || {}).risk || {}).hazards || []).concat(["Other"])],
                  ["comment", "Comments", "textarea"]] }
    ] },
    { title: "Optional", fields: [
      { id: "seasonal", label: "How is this site and species affected by seasonal or climate changes?", type: "textarea", rows: 3, plan: "seasonal",
        hint: "For example, for platypus this is wet season flooding.",
        help: {
          instructions: "Describe how the site and the species are affected by the seasons or by changes in climate.",
          examples: "Platypus: wet season flooding scours burrows in the creek bank.\nFlying-foxes: food is scarce for months after a cyclone.\nThe creek now stops flowing earlier in the dry season than it used to.",
          guidance: "Think about the wet and dry seasons, fire, cyclone and flood seasons, and any changes you or Traditional Owners have noticed over the years, such as plants flowering earlier or the wet season starting later." } }
    ] },
    { title: "Office use", fields: [
      { id: "inDatabase", label: "Site recorded in database", type: "yesno" },
      { id: "photosWithFile", label: "Photographs with data file", type: "yesno" }
    ] }
  ]
};