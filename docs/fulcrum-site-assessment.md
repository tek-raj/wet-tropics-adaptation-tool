# Site assessment in Fulcrum: form set-up

This guide is for teams that already use **Fulcrum** and want their site assessments to go into the
Biodiversity Climate Adaptation Planning tool. Teams without Fulcrum can use the free
[Site assessment app](https://tek-raj.github.io/wet-tropics-adaptation-tool/site-assessment/) instead.

The planning tool imports a Fulcrum record if the form uses the **data names** below. Labels can say
whatever suits your team; only the data names matter.

## 1. Build the form (Fulcrum App Designer)

Create a new app called, for example, **Site assessment (adaptation planning)**, and add these fields.

| Question (label)                       | Fulcrum field type     | Data name                 |
|----------------------------------------|------------------------|---------------------------|
| Date of site assessment                | Date                   | `assessment_date`         |
| Place name                             | Text                   | `place_name`              |
| Property name                          | Text                   | `property_name`           |
| Property contact                       | Text                   | `property_contact`        |
| Description of environment             | Text (multiple lines)  | `environment_description` |
| Current condition                      | Text (multiple lines)  | `current_condition`       |
| Photos of the current condition        | Photo                  | `condition_photos`        |
| Sightings or records of the species or ecosystem | Text (multiple lines) | `species_sightings` |
| Existing management plan(s)            | Text (multiple lines)  | `management_plans`        |
| Existing monitoring                    | Text (multiple lines)  | `existing_monitoring`     |
| Photo monitoring points                | Text (multiple lines)  | `photo_monitoring_points` |
| Reason for assessment                  | Text (multiple lines)  | `assessment_reason`       |
| People present                         | Text (multiple lines)  | `people_present`          |
| Seasonal calendar notes (optional)     | Text (multiple lines)  | `seasonal_calendar_notes` |

**GPS:** use the record's location (Fulcrum records it for each record). If you prefer to type it in, add a
Text field with the data name `gps` (decimal degrees, e.g. `-17.84210, 146.09870`).

**Photo captions:** turn on captions for the photo field. They come across as the photo captions in the plan.

## 2. Export a record

1. In Fulcrum, open the app's data, filter to the record (or records) you want, and choose **Export**.
2. Choose **GeoJSON** (recommended) or **CSV**, and include **photos**.
3. Unzip the download on your computer.

## 3. Import into the planning tool

1. Open the plan in the planning tool and go to the **Site / area** tab.
2. Click **Import site assessment…** and choose the **.geojson** (or **.csv**) file **and** the photo files
   (`.jpg`) from the unzipped folder, all at once.
3. If the file has several records, choose the one for this plan.
4. Empty boxes on the Site tab are filled and the photos are added to **Site photos**. Where the plan already
   has different text, a review screen lets you keep yours, use the imported text, or keep both.

The field names are also listed in the planning tool's content file (`v3/js/content.js`, `siteAssessment.fulcrum`).
If you change a data name in Fulcrum, change it there too.
