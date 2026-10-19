/*
 * CULTURAL SITE MONITORING & REPORTING FORM – questions, in the order of the paper form
 * ("Cultural site monitoring and reporting form.pdf"). Shown on the "Cultural assessment" tab.
 * Field types as in form.js, plus:
 *   choice  – pick one (tap again to clear); an "other" option asks what
 *   table   – rows the user can add to (columns: [id, label, type])
 *   signoff – fixed roles, each with name, date and a signature drawn on the screen
 *   photos with tags: true – each photo is marked Before or After works
 */
window.CULTURAL_ASSESSMENT = {
  title: "Cultural assessment",
  printTitle: "Cultural site monitoring & reporting",
  intro: "Optional: fill this in if the site also needs a cultural assessment. Answer what you can; you can come back to it later.",
  sections: [
    { title: "Site information",
      note: "Before works, have ready: the on-ground works plan (project sites and coordinates, works, timeframes, any permits or approvals), the signed agreement between Supplier and landholder authorising the works, cultural protocols, the risk assessment, a location map with points and coordinates, and \"before\" photos from the photo monitoring points.",
      fields: [
      { id: "project", label: "Project", type: "text", placeholder: "e.g. TCJ-CS008 – On-ground vegetation and weed management at cultural project sites" },
      { id: "siteNo", label: "Site number", type: "text" },
      { id: "siteName", label: "Site name", type: "text" },
      { id: "gps", label: "GPS coordinates", type: "gps", hint: "Latitude, longitude (decimal degrees)" },
      { id: "assessDate", label: "Assessment date", type: "date" },
      { id: "assessor", label: "Assessor", type: "text" },
      { id: "elders", label: "Elders/Cultural Custodians present", type: "textarea", rows: 2 },
      { id: "weather", label: "Weather conditions", type: "text" },
      { id: "prevInspection", label: "Previous inspection date", type: "date" }
    ] },
    { title: "1. Cultural protocols", fields: [
      { id: "docReview", label: "Pre-site document review completed", type: "yesno" },
      { id: "eldersConsulted", label: "Relevant Elders consulted", type: "yesno" },
      { id: "consultedNames", label: "Names", type: "text", showIf: { eldersConsulted: "yes" } },
      { id: "restrictions", label: "Cultural restrictions (if any)", type: "checks", options: [
        ["none", "None"], ["mensArea", "Men's area"], ["womensArea", "Women's area"], ["restrictedInfo", "Restricted information"],
        ["photoRestrictions", "Photography restrictions"], ["other", "Other"] ] },
      { id: "restrictionDetails", label: "Details", type: "textarea", rows: 2 }
    ] },
    { title: "2. Risk assessment", fields: [
      { id: "risks", label: "Hazards", type: "table", rows: 3, addLabel: "+ Add a hazard",
        columns: [["hazard", "Hazard", "text"], ["risk", "Risk", "text"], ["controls", "Controls implemented", "textarea"]] },
      { id: "overallRisk", label: "Overall risk rating", type: "choice", options: [
        ["low", "Low"], ["moderate", "Moderate"], ["high", "High"], ["extreme", "Extreme"] ] }
    ] },
    { title: "3. Site condition assessment", fields: [
      { id: "condition", label: "Overall condition", type: "choice", options: [
        ["excellent", "Excellent"], ["good", "Good"], ["fair", "Fair"], ["poor", "Poor"], ["severe", "Severe deterioration"] ] },
      { id: "conditionIssues", label: "Tick all that apply", type: "checks", options: [
        ["stable", "Stable"], ["overgrowth", "Vegetation overgrowth"], ["weeds", "Weed infestation"], ["fallenTrees", "Fallen trees"],
        ["erosion", "Erosion"], ["flood", "Flood damage"], ["fire", "Fire damage"], ["visitors", "Visitor impacts"],
        ["vehicles", "Vehicle damage"], ["vandalism", "Vandalism"], ["animals", "Animal disturbance"], ["other", "Other"] ] },
      { id: "conditionComments", label: "Comments", type: "textarea", rows: 3 }
    ] },
    { title: "4. Monitoring observations / occurrences", fields: [
      { id: "observations", label: "General site observations", type: "textarea", rows: 5 }
    ] },
    { title: "5. Photographic monitoring", fields: [
      { id: "photoWho", label: "Who did this?", type: "text" },
      { id: "photos", label: "Monitoring photos", type: "photos", tags: true,
        hint: "Mark each photo Before or After works, and describe it (photo point, what, which direction).",
        warnIf: { field: "restrictions", has: "photoRestrictions", text: "Photography restrictions apply at this site. Check what may be photographed before taking photos." } }
    ] },
    { title: "6. Works undertaken", fields: [
      { id: "works", label: "Works undertaken", type: "checks", options: [
        ["weeds", "Weed removal"], ["pruning", "Vegetation pruning"], ["rubbish", "Rubbish removal"], ["tracks", "Track maintenance"],
        ["erosion", "Minor erosion control"], ["signage", "Signage maintenance"], ["monitoringOnly", "Monitoring only"],
        ["none", "No works undertaken"], ["other", "Other"] ] },
      { id: "worksDetails", label: "Details", type: "textarea", rows: 3 }
    ] },
    { title: "7. Recommendations", fields: [
      { id: "immediate", label: "Immediate actions required", type: "textarea", rows: 3 },
      { id: "future", label: "Future works recommended", type: "textarea", rows: 3 },
      { id: "nextReview", label: "Next review", type: "choice", options: [
        ["3m", "3 months"], ["6m", "6 months"], ["12m", "12 months"], ["wetSeason", "Following wet season"], ["other", "Other"] ] }
    ] },
    { title: "8. Cultural notes", fields: [
      { id: "culturalNotes", label: "Cultural notes", type: "textarea", rows: 4, hint: "Record only information approved for documentation." }
    ] },
    { title: "9. Sign-off", fields: [
      { id: "signoff", label: "Sign-off", type: "signoff", roles: [["ranger", "Ranger"], ["custodian", "Cultural Custodian"], ["teamLeader", "Team Leader"]] }
    ] }
  ]
};
