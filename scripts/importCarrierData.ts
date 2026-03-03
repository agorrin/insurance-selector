import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import * as XLSX from "xlsx";

type CarrierRow = {
  carrierName: string;
  state: string;
  offersAuto: number;
  offersFire: number;
  offersFlood: number;
};

const stateHeaders = {
  illinois: "Illinois",
  indiana: "Indiana",
  michigan: "Michigan",
} as const;

const stateHeaderAliases = {
  illinois: ["illinois", "il"],
  indiana: ["indiana", "in"],
  michigan: ["michigan", "mi"],
} as const;

const carrierHeaderAliases = ["carrier", "carriername", "insurancecarrier"] as const;

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseCoverageCell(value: unknown): Pick<CarrierRow, "offersAuto" | "offersFire"> {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (["", "none", "na", "n", "no", "notoffered"].includes(normalized)) {
    return { offersAuto: 0, offersFire: 0 };
  }

  if (["both", "autofire", "fireauto", "autoandfire", "fireandauto"].includes(normalized)) {
    return { offersAuto: 1, offersFire: 1 };
  }

  if (["auto"].includes(normalized)) {
    return { offersAuto: 1, offersFire: 0 };
  }

  if (["fire"].includes(normalized)) {
    return { offersAuto: 0, offersFire: 1 };
  }

  const hasAuto = normalized.includes("auto");
  const hasFire = normalized.includes("fire");

  if (hasAuto && hasFire) {
    return { offersAuto: 1, offersFire: 1 };
  }

  if (hasAuto) {
    return { offersAuto: 1, offersFire: 0 };
  }

  if (hasFire) {
    return { offersAuto: 0, offersFire: 1 };
  }

  throw new Error(`Unsupported insurance value: '${String(value)}'. Use auto, fire, both, or leave blank.`);
}

function parseFloodCell(value: unknown): number {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (["yes", "y", "true", "1", "offered"].includes(normalized)) {
    return 1;
  }

  if (["", "no", "n", "false", "0", "notoffered", "none", "na"].includes(normalized)) {
    return 0;
  }

  throw new Error(`Unsupported flood value: '${String(value)}'. Use yes/no or leave blank.`);
}

function resolveColumnKey(keyMap: Map<string, string>, aliases: readonly string[]) {
  for (const alias of aliases) {
    const found = keyMap.get(alias);
    if (found) {
      return found;
    }
  }

  return "";
}

function getSheetRows(workbook: XLSX.WorkBook, sheetName: string) {
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: "",
    raw: false,
  });
}

function resolveRequiredHeaders(rawRows: Record<string, unknown>[]) {
  if (rawRows.length === 0) {
    return null;
  }

  const keyMap = new Map<string, string>();
  for (const key of Object.keys(rawRows[0])) {
    keyMap.set(normalizeHeader(key), key);
  }

  const carrierKey = resolveColumnKey(keyMap, carrierHeaderAliases);
  const illinoisKey = resolveColumnKey(keyMap, stateHeaderAliases.illinois);
  const indianaKey = resolveColumnKey(keyMap, stateHeaderAliases.indiana);
  const michiganKey = resolveColumnKey(keyMap, stateHeaderAliases.michigan);

  const missingKeys = [
    [carrierKey, "carrier"],
    [illinoisKey, "Illinois"],
    [indianaKey, "Indiana"],
    [michiganKey, "Michigan"],
  ]
    .filter(([key]) => !key)
    .map(([, label]) => label);

  if (missingKeys.length > 0) {
    throw new Error(`Missing required column headers: ${missingKeys.join(", ")}`);
  }

  return { carrierKey, illinoisKey, indianaKey, michiganKey };
}

function parseArgs() {
  const [, , inputFileArg, dbFileArg] = process.argv;

  if (!inputFileArg) {
    throw new Error("Usage: npm run import:carriers -- <path-to-excel-file> [path-to-sqlite-db]");
  }

  return {
    inputFile: path.resolve(process.cwd(), inputFileArg),
    dbFile: path.resolve(process.cwd(), dbFileArg ?? "data/insurance.db"),
  };
}

function loadWorkbookRows(inputFile: string): CarrierRow[] {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Excel file not found: ${inputFile}`);
  }

  const workbook = XLSX.read(fs.readFileSync(inputFile), { type: "buffer" });
  if (workbook.SheetNames.length < 2) {
    throw new Error("Excel workbook must contain at least two sheets: one for auto/fire and one for flood.");
  }

  const firstSheetName = workbook.SheetNames[0];
  const secondSheetName = workbook.SheetNames[1];

  const coverageRows = getSheetRows(workbook, firstSheetName);
  const floodRows = getSheetRows(workbook, secondSheetName);

  if (coverageRows.length === 0) {
    return [];
  }

  const headers = resolveRequiredHeaders(coverageRows);
  if (!headers) {
    return [];
  }

  const floodHeaders = resolveRequiredHeaders(floodRows);

  const rowsByKey = new Map<string, CarrierRow>();
  const stateColumns = [
    { state: stateHeaders.illinois, key: headers.illinoisKey },
    { state: stateHeaders.indiana, key: headers.indianaKey },
    { state: stateHeaders.michigan, key: headers.michiganKey },
  ] as const;

  for (const row of coverageRows) {
    const carrierName = String(row[headers.carrierKey]).trim();
    if (!carrierName) {
      continue;
    }

    for (const stateColumn of stateColumns) {
      const coverage = parseCoverageCell(row[stateColumn.key]);
      const key = `${carrierName}::${stateColumn.state}`;
      rowsByKey.set(key, {
        carrierName,
        state: stateColumn.state,
        offersAuto: coverage.offersAuto,
        offersFire: coverage.offersFire,
        offersFlood: 0,
      });
    }
  }

  if (floodHeaders) {
    const floodStateColumns = [
      { state: stateHeaders.illinois, key: floodHeaders.illinoisKey },
      { state: stateHeaders.indiana, key: floodHeaders.indianaKey },
      { state: stateHeaders.michigan, key: floodHeaders.michiganKey },
    ] as const;

    for (const row of floodRows) {
      const carrierName = String(row[floodHeaders.carrierKey]).trim();
      if (!carrierName) {
        continue;
      }

      for (const stateColumn of floodStateColumns) {
        const key = `${carrierName}::${stateColumn.state}`;
        const existing = rowsByKey.get(key);

        if (existing) {
          existing.offersFlood = parseFloodCell(row[stateColumn.key]);
        }
      }
    }
  }

  return Array.from(rowsByKey.values());
}

function ensureSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS carrier_offerings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carrier_name TEXT NOT NULL,
      state TEXT NOT NULL,
      offers_auto INTEGER NOT NULL CHECK (offers_auto IN (0, 1)),
      offers_fire INTEGER NOT NULL CHECK (offers_fire IN (0, 1)),
      offers_flood INTEGER NOT NULL CHECK (offers_flood IN (0, 1)),
      UNIQUE(carrier_name, state)
    )
  `);
}

function upsertRows(db: DatabaseSync, rows: CarrierRow[]): number {
  const insert = db.prepare(`
    INSERT INTO carrier_offerings (
      carrier_name,
      state,
      offers_auto,
      offers_fire,
      offers_flood
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(carrier_name, state) DO UPDATE SET
      offers_auto = excluded.offers_auto,
      offers_fire = excluded.offers_fire,
      offers_flood = excluded.offers_flood
  `);

  db.exec("BEGIN");
  try {
    for (const item of rows) {
      insert.run(
        item.carrierName,
        item.state,
        item.offersAuto,
        item.offersFire,
        item.offersFlood,
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return rows.length;
}

function main() {
  const { inputFile, dbFile } = parseArgs();
  const rows = loadWorkbookRows(inputFile);

  fs.mkdirSync(path.dirname(dbFile), { recursive: true });

  const db = new DatabaseSync(dbFile);
  ensureSchema(db);

  const total = upsertRows(db, rows);
  db.close();

  console.log(`Imported ${total} carrier rows into ${dbFile}`);
}

main();
