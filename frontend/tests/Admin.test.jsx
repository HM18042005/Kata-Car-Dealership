import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import Admin from "../src/pages/Admin";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderAdmin() {
  return render(
    <AuthContext.Provider value={{ token: "abc", user: { role: "admin" }, logout: vi.fn() }}>
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Admin", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => [],
    });
  });

  it("opens the Add Vehicle modal on click and closes it on Escape", async () => {
    renderAdmin();

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Add New Vehicle" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows a success toast after creating a vehicle, even if the post-save refetch fails", async () => {
    let searchCallCount = 0;
    global.fetch = vi.fn((url, opts) => {
      const method = opts?.method ?? "GET";
      if (method === "GET" || String(url).includes("/search")) {
        searchCallCount += 1;
        if (searchCallCount === 1) {
          return Promise.resolve({ status: 200, ok: true, json: async () => [] });
        }
        return Promise.resolve({ status: 500, ok: false, json: async () => ({ detail: "Server error" }) });
      }
      // POST /api/vehicles (create)
      return Promise.resolve({
        status: 200,
        ok: true,
        json: async () => ({ id: "1", make: "Toyota", model: "Corolla", category: "sedan", price: 20000, quantity: 1 }),
      });
    });

    renderAdmin();
    await waitFor(() => expect(searchCallCount).toBe(1));

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    fireEvent.change(screen.getByLabelText("Make"), { target: { value: "Toyota" } });
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "Corolla" } });
    fireEvent.change(screen.getByLabelText(/^Price/i), { target: { value: "20000" } });
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "1" } });

    const submitButtons = screen.getAllByRole("button", { name: "Add Vehicle" });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => expect(screen.getByText("Vehicle created successfully.")).toBeInTheDocument());
    await waitFor(() => expect(searchCallCount).toBe(2));
  });
});
