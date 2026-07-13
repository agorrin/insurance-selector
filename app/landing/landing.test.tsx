import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import Landing from "./landing";

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/results" element={<div>Results page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Landing", () => {
  it("shows validation when submit is clicked without selections", () => {
    renderLanding();

    fireEvent.click(screen.getByRole("button", { name: "Find carriers" }));

    expect(
      screen.getByText("Please select both a state and at least one insurance type."),
    ).toBeInTheDocument();
  });

  it("renders the modern hero content and form", () => {
    renderLanding();

    expect(screen.getByText(/Lorem ipsum dolor sit amet/i)).toBeInTheDocument();
    expect(screen.getByLabelText("State")).toBeInTheDocument();
    expect(screen.getByLabelText("Insurance Type")).toBeInTheDocument();
  });
});
