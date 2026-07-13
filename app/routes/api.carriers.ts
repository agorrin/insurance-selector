import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { Route } from "./+types/api.carriers";

export function resolveInsuranceColumn(insuranceType: string) {
  const normalized = insuranceType.trim().toLowerCase();

  if (normalized === "auto") {
    return "offers_auto";
  }

  if (normalized === "fire") {
    return "offers_fire";
  }

  if (normalized === "flood") {
    return "offers_flood";
  }

  return "";
}

export function resolveStateName(state: string) {
  const normalized = state.trim().toUpperCase();

  if (normalized === "IN" || normalized === "INDIANA") {
    return "Indiana";
  }

  if (normalized === "IL" || normalized === "ILLINOIS") {
    return "Illinois";
  }

  if (normalized === "MI" || normalized === "MICHIGAN") {
    return "Michigan";
  }

  return "";
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const stateParam = url.searchParams.get("state")?.trim() ?? "";
  const insuranceTypeParam = url.searchParams.get("insuranceTypes")?.trim() ?? "";

  if (!stateParam || !insuranceTypeParam) {
    return Response.json(
      { message: "Both state and insurance type are required.", carriers: [] },
      { status: 400 },
    );
  }

  const state = resolveStateName(stateParam);
  if (!state) {
    return Response.json(
      { message: "State must be IN, IL, or MI.", carriers: [] },
      { status: 400 },
    );
  }

  const insuranceTypes = insuranceTypeParam
    .split(",")
    .map((insuranceType) => insuranceType.trim())
    .filter((insuranceType) => insuranceType.length > 0);

  if (insuranceTypes.length === 0) {
    return Response.json(
      { message: "Insurance type must be Auto, Fire, or Flood.", carriers: [] },
      { status: 400 },
    );
  }

  const insuranceColumns: string[] = [];
  for (const insuranceType of insuranceTypes) {
    const insuranceColumn = resolveInsuranceColumn(insuranceType);
    if (!insuranceColumn) {
      return Response.json(
        { message: "Insurance type must be Auto, Fire, or Flood.", carriers: [] },
        { status: 400 },
      );
    }
    if (!insuranceColumns.includes(insuranceColumn)) {
      insuranceColumns.push(insuranceColumn);
    }
  }

  const dbPath = path.resolve(process.cwd(), "data/insurance.db");
  const db = new DatabaseSync(dbPath, { open: true });

  try {
    const insuranceCondition = insuranceColumns
      .map((column) => `${column} = 1`)
      .join(" AND ");
    const query = `
      SELECT carrier_name
      FROM carrier_offerings
      WHERE state = ? AND (${insuranceCondition})
      ORDER BY carrier_name ASC
    `;

    const statement = db.prepare(query);
    const rows = statement.all(state) as Array<{ carrier_name: string }>;
    const carriers = rows.map((row) => row.carrier_name);

    return Response.json({ carriers });
  } catch {
    return Response.json(
      { message: "Unable to load carriers.", carriers: [] },
      { status: 500 },
    );
  } finally {
    db.close();
  }
}
