## Run Application

```bash
npm run dev
```

Use the dropdown boxes to select a state and insurance type; Click submit to get back a list of insurance carriers that offer that type of policy in the selected state.

## Carrier Data Import

Use the importer script to parse an Excel file and populate a SQLite database with carrier offerings by state (Only supports offerings from Indiana, Illinois and Michigan)

### Run Carrier import

```bash
npm run import:carriers -- ./path/to/carriers.xlsx
```

The script creates a `carrier_offerings` table and upserts rows by the unique pair of `carrier_name` + `state`, combining auto/fire from sheet 1 with flood from sheet 2.

---
