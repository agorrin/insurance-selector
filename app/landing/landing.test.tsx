import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Landing from "./landing";

describe("Landing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows validation when submit is clicked without selections", async () => {
    render(<Landing />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      screen.getByText("Please select both a state and insurance type."),
    ).toBeInTheDocument();
  });

  it("calls api with state abbreviation and insurance type", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ carriers: ["Acme Insurance"] }), { status: 200 }));

    render(<Landing />);

    fireEvent.change(screen.getByLabelText("State"), { target: { value: "IN" } });
    fireEvent.change(screen.getByLabelText("Insurance Type"), {
      target: { value: "Auto" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/carriers?state=IN&insuranceType=Auto",
      );
    });

    expect(await screen.findByText("Acme Insurance")).toBeInTheDocument();
  });

  it("shows no matches only after an empty successful search", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ carriers: [] }), { status: 200 }),
    );

    render(<Landing />);

    expect(screen.queryByText("No matching carriers found.")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("State"), { target: { value: "IL" } });
    fireEvent.change(screen.getByLabelText("Insurance Type"), {
      target: { value: "Flood" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("No matching carriers found.")).toBeInTheDocument();
  });
});
