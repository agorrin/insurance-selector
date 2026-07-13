import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ResultsPage from "./results";

function renderResultsPage(initialEntry = "/results?state=IN&insuranceTypes=Auto") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ResultsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders carrier cards when the API returns results", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ carriers: ["Acme Insurance", "Northstar Mutual"] }), { status: 200 }),
    );

    renderResultsPage();

    expect(screen.getByText("Loading carriers...")).toBeInTheDocument();

    expect(await screen.findByText("Acme Insurance")).toBeInTheDocument();
    expect(screen.getByText("Northstar Mutual")).toBeInTheDocument();
    expect(screen.getAllByText("(800) 555-0199")).toHaveLength(2);
  });

  it("shows an empty state when no carriers are returned", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ carriers: [] }), { status: 200 }),
    );

    renderResultsPage();

    expect(await screen.findByText("No carriers matched your search.")).toBeInTheDocument();
  });

  it("shows an error message when the API request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Unable to load carriers." }), { status: 500 }),
    );

    renderResultsPage();

    expect(await screen.findByText("Unable to load carriers.")).toBeInTheDocument();
  });

  it("redirects to the home page when required query params are missing", async () => {
    renderResultsPage("/results");

    await waitFor(() => {
      expect(screen.getByText("Home page")).toBeInTheDocument();
    });
  });
});
