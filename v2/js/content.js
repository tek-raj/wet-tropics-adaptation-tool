/*
 * CONTENT FILE — edit this file to change questions, guidance, examples and links.
 * No programming knowledge needed: only change the text between the quotes.
 *
 * Every question has a `help` block:
 *   instructions : what to write in this box
 *   examples     : example answers (use \n to start a new line)
 *   guidance     : tips, things to consider
 *   moreInfo     : link for "More information" (resource website page, or a trusted external page)
 * Anything left as "" shows as "To be filled" in the app, so gaps are easy to spot.
 *
 * Examples that mention real species are illustrative. Figures for a site should
 * always come from the user's own observations or the linked data sources.
 */
window.APP_CONTENT = {
  title: "Biodiversity Climate Adaptation Planning",
  subtitle: "Site Assessment · Version 2 (draft)",
  // Printed at the top of every page of the exported report
  reportHeader: "Biodiversity Climate Adaptation Planning Site Assessment",

  // Main resource website (shown in the app header). Leave "" until ready.
  resourceSiteUrl: "",

  links: {
    epbcSearch: "https://www.environment.gov.au/cgi-bin/sprat/public/sprat.pl",
    qldSearch: "https://app.powerbi.com/view?r=eyJrIjoiY2I3ZThmODMtNDhhNS00ZGJjLTgxZTAtZjc2ODQwMzM0Yzk2IiwidCI6ImQxNmRlNTMwLTk0ZTctNDE1OC1iN2UyLTZlZTIyMGFmNjI4ZCJ9",
    hazardMaps: "https://www.longpaddock.qld.gov.au/qld-future-climate/dashboard-cmip6/",
    climateMap: "https://tek-raj.github.io/public/index_long.html#8/-17/145.7/0/30",
    seaLevelRise: "https://coastadapt.com.au/resource-centre/tools/sea-level-rise-and-future-climate-information-for-coastal-councils/",
    // Species attribute table will be published on the NESP website; until then the recovery plan lists are shown.
    speciesAttributeTable: "",
    recoveryPlansFederal: "https://www.dcceew.gov.au/environment/biodiversity/threatened/recovery-plans",
    recoveryPlansQld: "https://www.qld.gov.au/environment/plants-animals/conservation/threatened-species/our-work-and-partners/recovery-action-planning-and-programs/recoveryconservation-plans",
    visualisationTool: "https://tek-raj.github.io/public/index_long.html#8/-17/145.7/0/30",
    speciesRecords: "https://apps.des.qld.gov.au/species-search/",
    ala: "https://www.ala.org.au/",
    seasonalCalendars: "https://www.csiro.au/en/research/indigenous-science/indigenous-knowledge/calendars",
    terrainClimate: "https://terrain.org.au/what-we-do/climate/",
    climateChangeAustralia: "https://www.climatechangeinaustralia.gov.au/en/"
  },

  /* ---------------- TAB 0: START ---------------- */
  start: {
    title: "Start",
    intro: "Work through each tab to build your adaptation plan. Your work is saved automatically in this browser. Use “Save plan file” to keep a copy or move it to another computer, and the Export tab to download a Word or PDF report.",
    help: {
      instructions: "Record who is preparing the plan, what it covers and why. These details appear on the cover of the report.",
      examples: "",
      guidance: "An adaptation plan works best when its scope is clear. Decide first whether it is for one species, a group of species that share threats, a particular climate hazard, or a site. Most plans in this tool focus on one species at one site; for a group of species, complete one plan per species and cross-reference them.",
      moreInfo: "" },
    fields: [
      { id: "planTitle", label: "Plan title", type: "text",
        help: {
          instructions: "Give the plan a short title that says what it covers and where.",
          examples: "Koala climate adaptation plan – [property or reserve name]\nMountain pygmy-possum heat and drought adaptation plan – [alpine site]\nSea level rise adaptation plan for beach-nesting shorebirds – [estuary or beach]\nClimate adaptation plan for [property name]",
          guidance: "Use the format: [species, group, hazard or site] + “climate adaptation plan” + [location]. Keep it under about 10 words so it fits on the report cover.",
          moreInfo: "https://terrain.org.au/what-we-do/climate/" } },
      { id: "planFocus", label: "Plan focus", type: "select",
        options: ["Single species", "Group of species", "Particular climate hazard", "Site or property", "Other"],
        help: {
          instructions: "Choose what the plan is mainly about.",
          examples: "Single species – e.g. koalas on one property\nGroup of species – e.g. beach-nesting shorebirds along a stretch of coast\nParticular climate hazard – e.g. heatwave impacts on a flying-fox camp\nSite or property – e.g. all priority species on a nature reserve",
          guidance: "The rest of the tool is set out species by species. If the focus is a group, hazard or site, use the Species tab for the most at-risk species and describe the others under “Purpose of the plan”.",
          moreInfo: "" } },
      { id: "purpose", label: "Purpose of the plan", type: "textarea", rows: 3,
        help: {
          instructions: "In one to three sentences, say why the plan is being prepared and how it will be used.",
          examples: "To agree on-ground actions with the landholder and Traditional Owners to reduce heatwave and drought impacts on koalas, and to support a funding application.\nTo plan how nesting habitat for shorebirds on our beach can be protected as sea levels rise and storm surges increase.",
          guidance: "Mention who will use the plan (e.g. landholder, ranger group, council, funding body) and any decision it supports. This helps readers judge how detailed the plan needs to be.",
          moreInfo: "" } },
      { id: "preparedBy", label: "Prepared by", type: "text",
        help: {
          instructions: "Name of the person (or people) who led the assessment.",
          examples: "Jane Smith (Land for Wildlife officer) with the XYZ Ranger team",
          guidance: "List the lead author first. Record everyone who took part in the site visit under “People present” on the Site tab.",
          moreInfo: "" } },
      { id: "organisation", label: "Organisation / group", type: "text",
        help: {
          instructions: "The organisation, ranger group, landcare group or agency responsible for the plan.",
          examples: "[Regional] Natural Resource Management (NRM) body\nXYZ Aboriginal Corporation Ranger Program\n[Local] Landcare group\n[Local] council",
          guidance: "If the plan is a partnership, list the lead organisation first, then the partners.",
          moreInfo: "" } },
      { id: "date", label: "Date of assessment", type: "date",
        help: {
          instructions: "The date of the site assessment, in DD/MM/YYYY format. Type it in or use the calendar button.",
          examples: "14/10/2026",
          guidance: "Use the date of the field visit, not the date the report was written. Plans should be reviewed at least every 3–5 years, or after a major event such as a severe cyclone or heatwave.",
          moreInfo: "" } }
    ]
  },

  /* ---------------- TAB 1: SPECIES ---------------- */
  species: {
    title: "Species details",
    intro: "Describe the species this plan is for: what it needs, why it matters and its conservation status.",
    help: {
      instructions: "Complete one plan per species. Draw on field knowledge, Traditional Owner knowledge, recovery plans and species profiles.",
      examples: "",
      guidance: "Good species information is the foundation of the risk assessment. The better you describe what the species needs (food, water, shelter, breeding sites, temperature range), the easier it is to see how climate hazards will affect it.",
      moreInfo: "" },
    fields: [
      { id: "name", label: "Species name", type: "text",
        help: {
          instructions: "Give the common name and scientific name. Add the population or subspecies if relevant.",
          examples: "Koala (Phascolarctos cinereus)\nMountain pygmy-possum (Burramys parvus)\nHooded plover (Thinornis cucullatus)\nSpectacled flying-fox (Pteropus conspicillatus)",
          guidance: "Include local Aboriginal names only where Traditional Owners have agreed they can be recorded. Check the scientific name against the EPBC or state/territory species search so it matches official records.",
          moreInfo: "" } },
      { id: "habitat", label: "Ecosystem and habitat", type: "textarea", rows: 4,
        help: {
          instructions: "Describe where the species is found and what it needs to survive: habitat type, food (diet), water, shelter, breeding sites and home range.",
          examples: "Eucalypt forest and woodland. Feeds almost entirely on the leaves of a limited set of local eucalypt species, which also provide most of its water; drinks from the ground in hot, dry weather. Home range from a few hectares to over 100 hectares depending on habitat quality. Needs connected trees to move safely between feeding and shelter trees.",
          guidance: "Focus on the needs most sensitive to climate:\n• temperature limits\n• dependence on water\n• seasonal food sources\n• specific breeding or roosting sites\n• how far the species can move\nThe species’ recovery plan or conservation advice is usually the best source.",
          moreInfo: "https://www.dcceew.gov.au/environment/biodiversity/threatened/recovery-plans" } },
      { id: "importance", label: "Why is it important?", type: "textarea", rows: 3,
        help: {
          instructions: "Explain why this species matters: to Traditional Owners, to the community, to the ecosystem and for conservation.",
          examples: "Culturally significant totem species for Traditional Owners; appears in stories and ceremony.\nBush tucker species.\nPollinator or seed disperser – many plants rely on it to reproduce.\nThreatened species and a focus of the local community.",
          guidance: "Cultural values should be described by, or with the permission of, the Traditional Owners for this Country. Do not record culturally sensitive or restricted knowledge in the plan. Instead, note that cultural values exist and who to contact about them.",
          moreInfo: "" } },
      { id: "epbc", label: "Conservation status — Federal (EPBC listed)", type: "radio",
        options: ["Not listed", "Conservation dependent", "Vulnerable", "Endangered", "Critically endangered"],
        searchLink: "epbcSearch",
        help: {
          instructions: "Search for the species in the federal Species Profile and Threats Database (Search list link) and select its status under the EPBC Act.",
          examples: "",
          guidance: "Status is listed for the species, subspecies or population. Make sure you select the listing that applies to the population at your site; for example, the koala is listed as Endangered only for its Queensland, New South Wales and ACT populations. The species profile also links to its recovery plan and conservation advice.",
          moreInfo: "" } },
      { id: "qld", label: "Conservation status — Queensland (Threatened species list)", type: "radio",
        options: ["Not listed", "Vulnerable", "Endangered", "Critically endangered"],
        searchLink: "qldSearch",
        help: {
          instructions: "Search for the species in the Queensland threatened species list (Search list link) and select its status under the Nature Conservation Act 1992.",
          examples: "",
          guidance: "State/territory and federal status can differ, so check both. If the species is listed in another Queensland category (e.g. Near threatened or Special least concern), select “Not listed” and note the category under “Why is it important?”.",
          moreInfo: "" } },
      { id: "monitoring", label: "Existing monitoring of the species (if any)", type: "textarea", rows: 3,
        help: {
          instructions: "List any monitoring of this species you know about: who does it, what is measured, where, and since when.",
          examples: "Ranger group camera-trap surveys twice a year since 2019 (presence and number of individuals).\nUniversity or agency survey transects at nearby sites.\nCommunity sightings reported to the local council and wildlife carers.",
          guidance: "Existing monitoring can provide a baseline and help set triggers in Pathway planning. Note where the data is held and whether it can be shared. Monitoring at this particular site is recorded on the Site tab.",
          moreInfo: "" } }
    ]
  },

  /* ---------------- TAB 2: SITE ---------------- */
  site: {
    title: "Site details",
    intro: "Site location and description.",
    links: [["visualisationTool", "Visualisation tool"]],
    photosHelp: {
      instructions: "Upload photos of the site and the species\u2019 habitat, and give each one a short caption saying what it shows, where and when.",
      examples: "View east along the creek from photo point PP1, October 2026\nRoost trees on the exposed western edge, showing heat-damaged canopy\nFeed trees planted in 2024, now about 2 m tall",
      guidance: "Photos from your photo monitoring points are especially useful, because the same views can be retaken later to show change. Use JPG or PNG files; large photos are reduced automatically. Only include photos you have permission to use, and avoid images of culturally sensitive places unless Traditional Owners agree.",
      moreInfo: "" },
    help: {
      instructions: "Describe the site being assessed and the people and plans connected with it. Use the Visualisation tool to view climate information for the site.",
      examples: "",
      guidance: "Complete this tab on or soon after the site visit, while details are fresh. Where the site is on Aboriginal land or a place of cultural significance, agree with Traditional Owners what location detail can be recorded and shared.",
      moreInfo: "" },
    fields: [
      { id: "placeName", label: "Place name", type: "text",
        help: {
          instructions: "The name of the location, e.g. a locality, creek, mountain or reserve.",
          examples: "[Creek name], near [town]\n[Reserve name] Nature Reserve",
          guidance: "Use a name that will be recognised by others. Include the traditional place name where Traditional Owners agree.",
          moreInfo: "" } },
      { id: "gps", label: "GPS", type: "text", gps: true,
        help: {
          instructions: "Coordinates of the site centre in decimal degrees (latitude, longitude). Use “Use my location” while on site, or copy the coordinates from a map.",
          examples: "-17.8421, 146.0987",
          guidance: "Use the GDA2020 datum (standard on most phones and GPS units). For larger sites, record the centre here and list other key points under Photo monitoring points. Take care when sharing coordinates of sensitive species or cultural sites.",
          moreInfo: "" } },
      { id: "propertyName", label: "Property name", type: "text",
        help: {
          instructions: "The property, reserve or tenure name, if the site is on a defined property.",
          examples: "Smith family farm (conservation covenant)\n[Name] National Park\nLot and plan number from the title, e.g. Lot 12 on RP123456",
          guidance: "Including the tenure (freehold, nature refuge, national park, Aboriginal land, council reserve) helps show who has authority to carry out actions.",
          moreInfo: "" } },
      { id: "propertyContact", label: "Property contact", type: "text",
        help: {
          instructions: "The name and contact details of the landholder or land manager.",
          examples: "John Smith, 0400 000 000, john@example.com",
          guidance: "Get permission before recording personal contact details, and remove them before sharing the report more widely.",
          moreInfo: "" } },
      { id: "environment", label: "Description of environment", type: "textarea", rows: 3,
        help: {
          instructions: "Describe the site: vegetation type and condition, landform, elevation, water features, surrounding land use and main threats.",
          examples: "Open eucalypt woodland on a gentle slope, 300–400 m elevation. Mostly intact canopy with some weed invasion along the edges. Permanent creek on the eastern boundary with taller riparian trees. Surrounded by cleared grazing land to the west.",
          guidance: "Note features that could buffer climate impacts (cool gullies, permanent water, high elevation, dense canopy) and those that increase risk (fragmentation, weeds, roads, fire-prone edges). The vegetation community or mapping code (e.g. regional ecosystem or plant community type) is useful if known.",
          moreInfo: "" } },
      { id: "sightings", label: "Sightings of species", type: "textarea", rows: 2,
        help: {
          instructions: "Record recent sightings or signs of the species at or near the site: date, location, what was seen, and by whom.",
          examples: "12/08/2026 – adult female with joey in a creek-side gum (landholder).\nFresh scats under feed trees near the northern fence, October 2026.\nAtlas of Living Australia: 14 records within 2 km since 2015.",
          guidance: "Include signs as well as direct sightings (scats, tracks, calls, feeding signs, camera-trap images). Check the Atlas of Living Australia and your state or territory wildlife database for past records, and consider submitting new sightings to them.",
          moreInfo: "https://apps.des.qld.gov.au/species-search/" } },
      { id: "mgmtPlans", label: "Existing management plan(s)", type: "textarea", rows: 2,
        help: {
          instructions: "List any plans that already cover the site or species.",
          examples: "Property vegetation management plan (2022)\nConservation covenant or agreement\nIndigenous Protected Area plan of management\nFire management plan\nNational recovery plan for the species",
          guidance: "Note which actions in existing plans are relevant to climate risk. The adaptation plan should build on, not duplicate, existing commitments.",
          moreInfo: "" } },
      { id: "monitoring", label: "Existing monitoring at the site (if any)", type: "textarea", rows: 2,
        help: {
          instructions: "List monitoring already happening at this site, for any purpose.",
          examples: "Weather station at the homestead (rainfall and temperature)\nAnnual bird surveys by the landcare group\nWater quality sampling in the creek",
          guidance: "Weather, vegetation and water monitoring can be as useful as species surveys for setting climate triggers.",
          moreInfo: "" } },
      { id: "photoPoints", label: "Photo monitoring points", type: "textarea", rows: 3,
        help: {
          instructions: "Record each photo point so the same photo can be retaken in future: an ID, GPS location, compass bearing, and what the photo shows.",
          examples: "PP1 – -17.8421, 146.0987 – bearing 45° – creek crossing and riparian canopy\nPP2 – -17.8430, 146.0975 – bearing 270° – forest edge and lantana infestation",
          guidance: "Mark each point permanently (e.g. a star picket), and photograph from the same height and bearing at the same time of year. Retake photos after major events (cyclone, fire, flood) to record damage and recovery.",
          moreInfo: "" } },
      { id: "reason", label: "Reason for assessment", type: "textarea", rows: 2,
        help: {
          instructions: "Explain why this site was chosen and what prompted the assessment.",
          examples: "Landholder concerned about koala deaths during the last heatwave and drought.\nThe site is a known climate refuge for a heat-sensitive species.\nRequired as part of a revegetation grant.",
          guidance: "A clear reason helps set the scope of the plan and explains to others why the site is a priority.",
          moreInfo: "" } },
      { id: "people", label: "People present", type: "textarea", rows: 2,
        help: {
          instructions: "List the people who took part in the site assessment and their role or organisation.",
          examples: "Jane Smith (regional NRM body), John Smith (landholder), XYZ Ranger team (3 rangers), Dr A. Brown (university ecologist)",
          guidance: "Record Traditional Owner participation and consent. Note any key people who could not attend but should review the plan.",
          moreInfo: "" } },
      { id: "seasonal", label: "Seasonal calendar notes", type: "textarea", rows: 3,
        help: {
          instructions: "Note seasonal events that matter for the species and for timing actions: breeding, flowering and fruiting, wet and dry seasons, cyclone or storm season, and fire season.",
          examples: "Breeding: [months] – young most dependent in [months].\nPeak food availability: [season].\nNorthern Australia: cyclone season November–April.\nFire season: varies by region – check your state fire authority.",
          guidance: "Traditional Owner seasonal calendars often describe these cycles in detail and may show changes already happening. Seasonal timing affects when actions can be done, e.g. planting when soils are moist and weed control before weeds set seed.",
          moreInfo: "https://www.csiro.au/en/research/indigenous-science/indigenous-knowledge/calendars" } }
    ]
  },

  /* ---------------- TAB 3: RISK ASSESSMENT ---------------- */
  risk: {
    title: "Risk assessment",
    intro: "For each climate hazard, describe exposure, vulnerability and priority.",
    help: {
      instructions: "Work through each hazard. First decide if the site is exposed to it, now or in future. If it is, describe how the species is affected and how well it can cope, then rate the priority. Skip hazards that do not apply (e.g. sea level rise at an upland site).",
      examples: "",
      guidance: "Climate risk = exposure × vulnerability. A hazard is a high priority when the site is (or will be) exposed and the species is sensitive to it with limited ability to cope. Use the hazard maps for exposure, and species information (recovery plans, local knowledge) for vulnerability.",
      moreInfo: "https://www.climatechangeinaustralia.gov.au/en/" },
    hazards: [
      "Increased temperature",
      "Cyclones",
      "Heatwaves",
      "Hot days (number of days above 35°C)",
      "Hot nights (number of nights above 20°C)",
      "Drought (time with no rain)",
      "Sea level rise",
      "Flood",
      "Fire"
    ],
    // Extra links shown on a particular hazard card (hazard name must match the list above)
    hazardLinks: {
      "Sea level rise": [["seaLevelRise", "Sea level rise information (CoastAdapt)"]]
    },
    priorityOptions: ["Very low", "Low", "Medium", "High", "Very high"],
    // Column headings — group label is shown in the report header row
    columns: [
      { id: "exposure", group: "Exposure", label: "Is the hazard already present and likely to get worse in the future?",
        links: [["hazardMaps", "Hazard maps"], ["climateMap", "Interactive climate map"]],
        help: {
          instructions: "Answer two parts: (1) Is this hazard already happening at the site? Give evidence. (2) Is it projected to get worse? Give the direction and timeframe from the hazard maps.",
          examples: "Yes. Present: three heatwaves affected the site in the last five summers (landholder observations). Future: hazard maps show a large increase in hot days by 2050 under a high emissions scenario.\nNo. The site is at 900 m elevation, well above projected sea level rise and storm surge.",
          guidance: "Use the hazard maps for projections, and local observations and Bureau of Meteorology records for what is happening now. Note the time period (e.g. 2030, 2050) and emissions scenario you used. Upland sites may be less exposed to heat now but warming faster in relative terms.",
          moreInfo: "" } },
      { id: "impact", group: "Vulnerability", label: "How is the species impacted / affected by the hazard?",
        links: [["speciesAttributeTable", "Species attribute table"], ["recoveryPlansFederal", "Recovery plans (Federal)"], ["recoveryPlansQld", "Recovery plans (Qld)"], ["ala", "Atlas of Living Australia"]],
        help: {
          instructions: "Describe how this hazard affects the species. Consider health and survival, food, water, shelter, and breeding. Include direct effects (e.g. heat stress) and indirect effects (e.g. loss of food trees).",
          examples: "Heatwaves: spectacled flying-foxes die of heat stress when temperatures exceed their tolerance. About a third of the Australian population died in the November 2018 heatwave.\nDrought and heat: koalas suffer dehydration and heat stress when eucalypt leaves dry out; many have died during severe drought and heatwaves.\nSea level rise: the Bramble Cay melomys, found only on one small Torres Strait island, was declared extinct after rising seas and storm surges destroyed its habitat.",
          guidance: "Recovery plans and conservation advice list known threats. Consider which life stage is most sensitive (eggs, young, breeding adults) and whether impacts combine, e.g. drought followed by fire, or a storm followed by a food shortage. Species records and observations (Atlas of Living Australia, WildNet, iNaturalist, Birdata) can show where the species occurs and whether it has declined after past extreme events.",
          moreInfo: "",
          // Extra links listed under "More information" in this question's ⓘ panel
          links: [
            ["WildNet species search (Qld)", "https://apps.des.qld.gov.au/species-search/"],
            ["iNaturalist", "https://www.inaturalist.org/"],
            ["Birdata (BirdLife Australia)", "https://birdata.birdlife.org.au/"]
          ] } },
      { id: "adapt", group: "Vulnerability", label: "Ability to adapt",
        help: {
          instructions: "Describe what the species can do by itself to cope with this hazard: move to cooler or safer places, change behaviour, switch food, or recover numbers quickly.",
          examples: "Can move short distances to cooler gullies if connected forest is present, but cannot cross large cleared areas.\nCan switch to other food plants, but relies on a few key species during dry periods.\nLow ability: slow breeding (one young per year) means populations recover slowly after losses.",
          guidance: "Low ability to adapt means greater vulnerability. Key factors are mobility and habitat connectivity, diet flexibility, breeding rate, and whether there are cooler refuges (e.g. higher elevation) within reach. Also note barriers that stop the species adapting (roads, fences, clearing).",
          moreInfo: "" } },
      { id: "priority", group: "Priority", label: "How concerning is the hazard for this species in this area?",
        help: {
          instructions: "Rate the priority of this hazard for this species at this site, from Very low to Very high, based on your exposure and vulnerability answers.",
          examples: "Very high – hazard already causing deaths or breeding failure and getting worse\nHigh – site exposed now or soon and species clearly sensitive, with limited ability to cope\nMedium – exposed, but moderate impact or some ability to cope\nLow – minor impact expected, or exposure unlikely before 2050\nVery low – not exposed or not relevant at this site",
          guidance: "Agree the rating as a group. High and Very high hazards become the focus of the actions and the summary page. If you are unsure, rate it one level higher and note the uncertainty.",
          moreInfo: "" } }
    ]
  },

  /* ---------------- TAB 4: ACTIONS ---------------- */
  actions: {
    title: "Actions",
    intro: "List existing actions already happening, then potential new actions. Scores come from the Scoring tab.",
    help: {
      instructions: "List what is already being done that helps the species cope with climate hazards, then new actions that could be taken. Focus on the High and Very high priority hazards from the Risk assessment.",
      examples: "",
      guidance: "Good adaptation actions reduce exposure (e.g. protect cool refuges), reduce sensitivity (e.g. reduce other threats such as weeds, pigs and dogs so the species is healthier), or increase the ability to adapt (e.g. restore corridors so the species can move). Actions for other threats count too if they build resilience to climate hazards.",
      moreInfo: "" },
    existingHelp: {
      instructions: "Describe each action already happening at the site: what is done, by whom, and how often.",
      examples: "Feral pig control – ranger group trapping program, quarterly.\nLantana control along the creek – landcare group, twice a year.\nWildlife warning signs and reduced speed zone on the access road – council.",
      guidance: "Include actions by other groups on or near the site. Existing actions can be scored and carried into Pathway planning; they may need to be expanded as the climate changes.",
      moreInfo: "" },
    potentialHelp: {
      instructions: "Describe new actions that could reduce the impact of priority hazards. Be specific about what, where and at what scale.",
      examples: "Revegetate a 2 km corridor linking the creek to upland forest so the species can move to cooler areas.\nProtect and enlarge cool gully refuges by removing weeds and fencing out cattle.\nPrepare a post-cyclone response plan (food monitoring and emergency feeding, coordinated with the department).\nPlant a mix of food trees that fruit at different times of year.",
      guidance: "Draw on recovery plans, Traditional Owner knowledge and what has worked elsewhere. List options even if they seem difficult; the Scoring tab helps compare them. Avoid actions that could cause harm, such as spreading disease through artificial feeding or water points.",
      moreInfo: "" },
    howHelp: {
      instructions: "Explain how the action reduces the risk from one or more climate hazards. Name the hazard(s) it addresses.",
      examples: "Heatwaves and increased temperature: gives the species access to cooler upland refuges.\nCyclones and storms: provides alternative food and shelter while damaged habitat recovers.\nFire: creates buffers around fire-sensitive vegetation.",
      guidance: "Link each action to the specific impact it addresses. If an action does not clearly reduce climate risk, it may still be worthwhile, but it is not an adaptation action for this plan.",
      moreInfo: "" }
  },

  /* ---------------- TAB 5: SCORING ---------------- */
  scoring: {
    title: "Scoring",
    intro: "Note: scoring is indicative only — discuss which actions are likely to be most effective, practical and appropriate. Culturally acceptable is checked first (Y/N) and acts as a filter: only actions that are culturally acceptable are scored further. Those actions are scored on seven criteria, 0–3 each (3 = most favourable), giving a score out of 21.",
    help: {
      instructions: "Score each action as a group. First decide whether it is culturally acceptable. If it is, score the seven criteria from 0 to 3, where 3 is always the most favourable. The tool adds up the score out of 21.",
      examples: "",
      guidance: "Scores help compare options; they do not decide for you. Two actions with similar scores may both be worth doing, and a lower-scoring action may still be essential. Record the reasons for scores in your notes so the plan can be reviewed later.",
      moreInfo: "" },
    // Face scale used to pick scores. The number is what is stored and added up; 3 is always the most favourable.
    scale: [
      { value: "3", emoji: "😊", label: "Good", color: "1E7B34", fill: "D9F0D3" },
      { value: "2", emoji: "😐", label: "OK", color: "D49A00", fill: "FFF3C4" },
      { value: "1", emoji: "😕", label: "Poor", color: "D9640B", fill: "FFE0C2" },
      { value: "0", emoji: "😞", label: "Bad", color: "A61B1B", fill: "F8C4C0" }
    ],
    cultural: { id: "cultural", label: "Culturally acceptable", short: "Cultural",
      help: {
        instructions: "Select Y if Traditional Owners with authority for this Country consider the action culturally acceptable. Select N if they do not. Leave it blank until they have been consulted.",
        examples: "",
        guidance: "This decision rests with Traditional Owners, following their protocols and the principle of free, prior and informed consent. An N removes the action from scoring. Consider whether a changed version of the action could be acceptable, and add it as a new action.",
        moreInfo: "" } },
    criteria: [
      { id: "implement", label: "Ability to implement", short: "Implement",
        help: {
          instructions: "Do we have the people, skills, equipment, access and approvals to carry out this action?",
          examples: "🟢 3 – can start now with existing people, skills and permissions\n🟡 2 – possible with some extra training, equipment or permits\n🟠 1 – major gaps in capacity or approvals\n🔴 0 – no capacity or authority to do this",
          guidance: "Consider who would do the work, land access and tenure, and any permits (e.g. for vegetation clearing or wildlife handling).",
          moreInfo: "" } },
      { id: "cost", label: "Cost", short: "Cost", note: "3 = lowest cost",
        help: {
          instructions: "How expensive is the action to set up and maintain? A higher score means a lower cost.",
          examples: "🟢 3 – low cost, covered by existing budgets or in-kind effort\n🟡 2 – moderate cost, within a typical small grant\n🟠 1 – high cost, needs a major grant or several funders\n🔴 0 – very high cost with no likely funding source",
          guidance: "Include ongoing costs (maintenance, monitoring, follow-up weed control), not just set-up. Agree dollar ranges for each score within your group so scores are consistent between plans.",
          moreInfo: "" } },
      { id: "feasible", label: "Feasible", short: "Feasible",
        help: {
          instructions: "Is the action practical in the conditions at this site?",
          examples: "🟢 3 – proven method, suits the site conditions and timing\n🟡 2 – practical with some challenges (e.g. wet-season access)\n🟠 1 – difficult; untested here or major site constraints\n🔴 0 – not practical at this site",
          guidance: "Consider terrain, access, seasonal timing, the time before benefits appear, and whether the method has worked in similar places.",
          moreInfo: "" } },
      { id: "effective", label: "Effective", short: "Effective",
        help: {
          instructions: "How much will the action reduce the risk from priority climate hazards?",
          examples: "🟢 3 – strong evidence it reduces risk from one or more High/Very high hazards, with lasting benefit\n🟡 2 – likely to give a moderate benefit\n🟠 1 – small or uncertain benefit\n🔴 0 – unlikely to reduce climate risk",
          guidance: "Base the score on evidence where possible (recovery plans, scientific studies, local experience). Consider whether the benefit will last as the climate keeps changing.",
          moreInfo: "" } },
      { id: "social", label: "Socially acceptable", short: "Social",
        help: {
          instructions: "Will landholders, neighbours, the community and other stakeholders support the action?",
          examples: "🟢 3 – strong support from landholders and community\n🟡 2 – general support with some concerns\n🟠 1 – mixed views or likely opposition from some groups\n🔴 0 – strong opposition",
          guidance: "Consider effects on neighbours, industries (e.g. grazing, tourism), access and amenity. Early engagement can often raise this score.",
          moreInfo: "" } },
      { id: "risk", label: "Risk of negative consequences", short: "Risk", note: "3 = lowest risk",
        help: {
          instructions: "Could the action cause harm to the species, other species, people or the environment? A higher score means a lower risk.",
          examples: "🟢 3 – negligible risk of harm\n🟡 2 – minor risks that can be managed\n🟠 1 – significant risks that need careful management\n🔴 0 – high risk of serious harm or maladaptation",
          guidance: "Watch for maladaptation, i.e. actions that increase vulnerability in the long run. Examples are artificial feeding that causes dependence or disease spread, water points that attract predators or weeds, and planting species that will not suit the future climate.",
          moreInfo: "" } },
      { id: "cobenefits", label: "Positive co-benefits", short: "Co-benefits",
        help: {
          instructions: "Does the action bring other benefits beyond this species?",
          examples: "🟢 3 – major benefits for other species, people or Country\n🟡 2 – some additional benefits\n🟠 1 – minor additional benefits\n🔴 0 – no additional benefits",
          guidance: "Co-benefits include habitat for other threatened species, water quality, carbon storage, cultural practice and caring for Country, ranger employment, tourism, and community wellbeing.",
          moreInfo: "" } }
    ]
  },

  /* ---------------- TAB 6: PATHWAY PLANNING ---------------- */
  pathway: {
    title: "Pathway planning",
    intro: "Which actions need to happen now, which are for the future, and when do we need to change or stop an action?",
    help: {
      instructions: "Create a pathway for each action you plan to carry forward, usually the higher-scoring ones. For each, set goals, decide when to start, and define the signals that tell you to change or stop.",
      examples: "",
      guidance: "An adaptation pathway is a sequence of actions linked by decision points. Instead of one fixed plan, it says: do this now, watch for these signals, and switch to the next action when a turning point is reached. Triggers and turning points should be things you can observe or measure, ideally with existing monitoring.",
      moreInfo: "" },
    fields: [
      { id: "timing", label: "When", type: "select", options: ["Now", "Later"],
        help: {
          instructions: "Now = start straight away (or already started). Later = start when the trigger is reached. This sorts actions into the NOW and LATER boxes on the summary page.",
          examples: "",
          guidance: "Actions that are low-cost, low-risk and useful under any future (“no regrets” actions) should usually start now.",
          moreInfo: "" } },
      { id: "shortGoal", label: "Short term goal", type: "textarea", rows: 2,
        help: {
          instructions: "What should this action achieve in the next 1–5 years? Make it specific and measurable.",
          examples: "Revegetate 5 ha of corridor with 80% seedling survival by 2028.\nNo koala road deaths on the access road for two years.",
          guidance: "Use the SMART test: specific, measurable, achievable, relevant, time-bound. The short-term goal should be a step towards the long-term goal.",
          moreInfo: "" } },
      { id: "longGoal", label: "Long term goal", type: "textarea", rows: 2,
        help: {
          instructions: "What outcome do you want for the species at this site in 10–30 years?",
          examples: "A stable or increasing local population with connected habitat between cool refuges.\nCool refuges on the property continue to support possums through heatwaves.",
          guidance: "Frame it as an outcome for the species, not an activity. It should stay relevant as the climate changes.",
          moreInfo: "" } },
      { id: "trigger", label: "Trigger", type: "textarea", rows: 2,
        help: {
          instructions: "What to look for to know to start the action, or ‘action already started’.",
          examples: "Action already started.\nBureau of Meteorology severe heatwave warning for the area.\nA category 3+ cyclone crosses within 50 km of the site.\nFruit counts on monitoring transects fall below the dry-season baseline.",
          guidance: "A good trigger is observable, measurable and linked to monitoring someone is already doing. Allow enough lead time to act, e.g. prepare a heat response before the hottest months.",
          moreInfo: "" } },
      { id: "turning", label: "Turning point", type: "textarea", rows: 2,
        help: {
          instructions: "What to look for to know when to improve or add an additional action.",
          examples: "Two consecutive annual surveys show numbers falling despite the action.\nHeatwave deaths recorded in two consecutive summers.\nPlanted corridor seedlings below 50% survival after two wet seasons.",
          guidance: "A turning point is when the current action is no longer enough. Set it early enough to prepare the next action before conditions become critical.",
          moreInfo: "" } },
      { id: "improved", label: "Improved / additional action", type: "textarea", rows: 2,
        help: {
          instructions: "What will you do instead of, or as well as, this action when the turning point is reached?",
          examples: "Expand the corridor to connect with the national park.\nAdd shade planting and a heat-stress response team for the flying-fox camp.\nSwitch to more heat- and drought-tolerant local plant species for revegetation.",
          guidance: "This could be scaling up, changing the method, or a different action. It may already be listed as a potential action on the Actions tab.",
          moreInfo: "" } },
      { id: "stopping", label: "Stopping point", type: "textarea", rows: 2,
        help: {
          instructions: "What to look for to know when to stop this action.",
          examples: "Corridor canopy closed and self-sustaining for three years with no weed follow-up needed.\nThe action is shown to cause harm, e.g. disease at feeding stations.\nThe species no longer uses the site despite all actions.",
          guidance: "Stop when the goal is achieved, when the action is no longer effective, or when it causes harm. Stopping points prevent effort being wasted on actions that no longer work.",
          moreInfo: "" } }
    ]
  },

  /* ---------------- TAB 7: SUMMARY ---------------- */
  summary: {
    title: "Summary",
    intro: "A one-page summary of the plan. Use “Draft from earlier tabs” to fill the boxes from your answers, then edit the wording.",
    help: {
      instructions: "Press “Draft from earlier tabs” to fill each box from your answers, then edit the text into short, clear points. Upload a photo of the species.",
      examples: "",
      guidance: "The summary page is often the only page people read. It should stand alone and be understood by landholders, rangers and funders. Aim for 2–4 short bullet points per box, using plain language.",
      moreInfo: "" },
    photoHelp: {
      instructions: "Upload a photo of the species (JPG or PNG). Add a caption and a photo credit if the photo is not your own.",
      examples: "Caption: Adult koala, [location]\nCredit: J. Smith",
      guidance: "Use a clear, well-lit photo, ideally taken at or near the site. Make sure you have permission to use it. Portrait-shaped photos fit the summary layout best.",
      moreInfo: "" },
    boxes: [
      { id: "hazards", label: "Key climate hazards",
        help: {
          instructions: "List the High and Very high priority hazards from the Risk assessment.",
          examples: "• Heatwaves (Very high)\n• Cyclones (High)",
          guidance: "Order them from highest to lowest priority. Keep to the 2–4 hazards that matter most.",
          moreInfo: "" } },
      { id: "impacts", label: "Impacts of key climate hazards",
        help: {
          instructions: "Summarise how each key hazard affects the species.",
          examples: "• Heatwaves: heat stress and deaths at the roost\n• Cyclones: loss of fruit for months, with birds moving onto roads",
          guidance: "One line per hazard, focused on the most serious effect.",
          moreInfo: "" } },
      { id: "triggers", label: "Key climate triggers",
        help: {
          instructions: "List the main signals that start actions.",
          examples: "• BoM severe heatwave warning\n• Category 3+ cyclone within 50 km",
          guidance: "Include only triggers that someone is responsible for watching.",
          moreInfo: "" } },
      { id: "turning", label: "Key turning / stopping points",
        help: {
          instructions: "List the signals that mean an action must be changed, scaled up or stopped.",
          examples: "• Numbers fall for two years in a row → add corridor expansion\n• Corridor self-sustaining → stop planting",
          guidance: "Show what happens next after each point, where possible.",
          moreInfo: "" } },
      { id: "longGoals", label: "Long term goals",
        help: {
          instructions: "State the long-term outcome(s) for the species at this site.",
          examples: "• Stable local population with connected habitat from coast to uplands",
          guidance: "One or two goals are enough.",
          moreInfo: "" } },
      { id: "shortGoals", label: "Short term goals",
        help: {
          instructions: "List the measurable goals for the next 1–5 years.",
          examples: "• 5 ha corridor planted with 80% survival by 2028\n• Zero road deaths for two years",
          guidance: "Use goals that can be checked when the plan is reviewed.",
          moreInfo: "" } },
      { id: "cultural", label: "Cultural considerations",
        help: {
          instructions: "Note cultural values, protocols and responsibilities that affect how the plan is carried out.",
          examples: "• Totem species; Traditional Owners to lead decisions on handling\n• Ranger group to be engaged for all on-ground works\n• Seasonal restrictions on access to a cultural site",
          guidance: "Agree the wording with Traditional Owners. Do not include culturally sensitive information in a report that will be shared widely.",
          moreInfo: "" } },
      { id: "now", label: "Actions — NOW",
        help: {
          instructions: "List the actions to start now or continue.",
          examples: "• Feral pig control (ongoing)\n• Begin corridor revegetation",
          guidance: "Add who is responsible, where known.",
          moreInfo: "" } },
      { id: "later", label: "Actions — LATER",
        help: {
          instructions: "List actions that will start when a trigger or turning point is reached.",
          examples: "• Emergency feeding after a severe cyclone (with the department)\n• Expand the corridor to the national park",
          guidance: "Include the trigger in brackets so readers know when each action starts.",
          moreInfo: "" } }
    ]
  }
};
