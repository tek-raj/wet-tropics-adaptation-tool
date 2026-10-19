/*
 * SITE RECORDING SHEET – questions, in the order of the paper form ("Site recording form.pdf", 4 pages).
 * Shown on the "Site assessment" tab; the "Cultural assessment" tab is in cultural.js.
 * Field types: text, date, textarea, yesno, checks (tick boxes; options may ask for a detail, and an
 * "other" option asks what), gps (adds "Use my location"), photos (adds camera and captions).
 * showIf: { field: value } shows a question only when another question has that answer.
 * plan: "<id>" marks a question that fills a box on the planning tool's Site tab (content.js, site.fields). It shows
 * that box's help (the "i" button, same as the first Site assessment app) and is imported into the planning tool.
 * Together these cover every question on the planning tool's Site tab.
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
      { id: "toGroup", label: "Traditional Owner group", type: "text" },
      { id: "elders", label: "Elders", type: "textarea", rows: 2 },
      { id: "tenure", label: "Land tenure", type: "checks", options: [
        ["nationalPark", "National Park"], ["stateForest", "State Forest"], ["freehold", "Freehold"], ["reserve", "Reserve"], ["other", "Other"] ] },
      { id: "landOwner", label: "Current land owner details", type: "textarea", rows: 2, plan: "propertyContact" },
      { id: "landform", label: "Landform", type: "checks", options: [
        ["creekBank", "River/creek bank"], ["beachDune", "Coastal beach/dune"], ["estuary", "River/creek estuary"],
        ["floodplain", "Floodplain"], ["hillSlope", "Hill slope"], ["cultivation", "Under cultivation"], ["other", "Other"] ] },
      { id: "nativeTitle", label: "Area under Native Title claim?", type: "yesno" },
      { id: "nativeTitleWho", label: "Who? (Native Title claimant)", type: "text", showIf: { nativeTitle: "yes" } },
      { id: "access", label: "Description of location (how to get there)", type: "textarea", rows: 3 }
    ] },
    { title: "The site", fields: [
      { id: "siteType", label: "Site type", type: "checks", options: [
        ["rockshelter", "Rockshelter"], ["shellScatter", "Shell scatter"], ["shellMidden", "Shell midden"], ["isolatedArtefact", "Isolated artefact"],
        ["artefactScatter", "Artefact scatter"], ["artefactShellScatter", "Artefact & shell scatter"], ["fishtrap", "Fishtrap"], ["fireplace", "Fireplace"],
        ["stoneArrangement", "Stone arrangement"], ["burial", "Burial"], ["campsite", "Campsite"], ["stoneCarving", "Stone carving"],
        ["carvedTree", "Carved tree"], ["scarredTree", "Scarred tree"], ["axeGroove", "Axe grinding groove"], ["nativeWell", "Native well"],
        ["storyPlace", "Story place/spiritual area"], ["historicSite", "Historic site (camp)"] ] },
      { id: "siteDescription", label: "Site description", type: "textarea", rows: 5 },
      { id: "components", label: "Site components", type: "checks", options: [
        ["stoneArtefacts", "Stone artefacts", "Number"], ["marineShell", "Marine shell"], ["freshwaterShell", "Freshwater shell"],
        ["charcoal", "Charcoal"], ["ochre", "Ochre"], ["paintings", "Paintings"],
        ["manuports", "Manuports"], ["engravings", "Engravings"], ["bonesHuman", "Bones – human", "Details"], ["bonesAnimal", "Bones – animal", "Details"],
        ["storyPlace", "Story place/spirit place"], ["other", "Other"] ] }
    ] },
    { title: "Surroundings", fields: [
      { id: "environment", label: "Description of environment", type: "textarea", rows: 3, plan: "environment" },
      { id: "vegetation", label: "Vegetation (describe)", type: "textarea", rows: 3 },
      { id: "vegType", label: "Vegetation type", type: "checks", options: [
        ["openForest", "Open forest"], ["closedForest", "Closed forest"], ["grasslands", "Grasslands"], ["mangroves", "Mangroves"],
        ["riparian", "Riparian (creek bank veg.)"], ["regrowth", "Regrowth scrub"], ["other", "Other"] ] },
      { id: "bushTucker", label: "Known bush tucker plants in area near site", type: "textarea", rows: 3 },
      { id: "geology", label: "Local geology", type: "text" },
      { id: "water", label: "Nearest water source (distance and name)", type: "textarea", rows: 2 },
      { id: "sightings", label: "Sightings or records of the species or ecosystem", type: "textarea", rows: 2, plan: "sightings" }
    ] },
    { title: "Photos", fields: [
      { id: "photos", label: "Site photos", type: "photos" },
      { id: "photoPoints", label: "Photo monitoring points", type: "textarea", rows: 3, plan: "photoPoints" },
      { id: "photoNumbers", label: "Photo numbers (from another camera)", type: "textarea", rows: 2,
        hint: "Photos taken in this app are numbered for you. Use this box for photos taken on a separate camera." }
    ] },
    { title: "Condition, impacts and management", fields: [
      { id: "condition", label: "Current condition", type: "textarea", rows: 3, plan: "condition" },
      { id: "currentImpacts", label: "Current impacts/activities to site and area", type: "textarea", rows: 4 },
      { id: "futureImpacts", label: "Potential future impacts", type: "textarea", rows: 4 },
      { id: "recommendations", label: "Management options/recommendations", type: "textarea", rows: 6 },
      { id: "mgmtPlan", label: "Current management plan(s)", type: "textarea", rows: 2, plan: "mgmtPlans" },
      { id: "monitoring", label: "Existing monitoring at the site (if any)", type: "textarea", rows: 2, plan: "monitoring" }
    ] },
    { title: "Optional", fields: [
      { id: "seasonal", label: "Seasonal calendar notes", type: "textarea", rows: 3, plan: "seasonal" }
    ] },
    { title: "Office use", fields: [
      { id: "inDatabase", label: "Site recorded in database", type: "yesno" },
      { id: "photosWithFile", label: "Photographs with data file", type: "yesno" },
      { id: "enteredBy", label: "Signature/date entered", type: "text" }
    ] }
  ]
};
