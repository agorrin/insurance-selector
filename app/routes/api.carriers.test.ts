import { describe, expect, it } from "vitest";

import { resolveInsuranceColumn, resolveStateName } from "./api.carriers";

describe("api.carriers helpers", () => {
  it("resolves insurance column names", () => {
    expect(resolveInsuranceColumn("Auto")).toBe("offers_auto");
    expect(resolveInsuranceColumn("fire")).toBe("offers_fire");
    expect(resolveInsuranceColumn(" FLOOD ")).toBe("offers_flood");
    expect(resolveInsuranceColumn("renters")).toBe("");
  });

  it("resolves state abbreviations and full names", () => {
    expect(resolveStateName("IN")).toBe("Indiana");
    expect(resolveStateName("illinois")).toBe("Illinois");
    expect(resolveStateName(" Mi ")).toBe("Michigan");
    expect(resolveStateName("OH")).toBe("");
  });
});
