import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import Dashboard from "../src/pages/Dashboard";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const vehicle = {
  id: "665f1c1a2b3c4d5e6f7a8b9d",
  make: "Toyota",
  model: "Corolla",
  category: "sedan",
  price: 21000,
  quantity: 3,
};

function renderDashboard() {
  return render(
    <AuthContext.Provider value={{ token: "abc", user: { role: "user" }, logout: vi.fn() }}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Dashboard purchase confirmation", () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (String(url).includes("/purchase")) {
        return Promise.resolve({
          status: 200,
          ok: true,
          json: async () => ({ ...vehicle, quantity: 2 }),
        });
      }
      return Promise.resolve({
        status: 200,
        ok: true,
        json: async () => [vehicle],
      });
    });
  });

  it("opens a confirmation modal with vehicle details instead of purchasing immediately", async () => {
    renderDashboard();

    await screen.findByText("Toyota Corolla");
    fireEvent.click(screen.getByRole("button", { name: "Purchase" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Toyota Corolla")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining("/purchase"), expect.anything());
  });

  it("purchases the vehicle and closes the modal when Confirm Purchase is clicked", async () => {
    renderDashboard();

    await screen.findByText("Toyota Corolla");
    fireEvent.click(screen.getByRole("button", { name: "Purchase" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm Purchase" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/vehicles/${vehicle.id}/purchase`),
        expect.objectContaining({ method: "POST" })
      )
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText("Purchase successful!")).toBeInTheDocument();
  });

  it("closes the modal without purchasing when Cancel is clicked", async () => {
    renderDashboard();

    await screen.findByText("Toyota Corolla");
    fireEvent.click(screen.getByRole("button", { name: "Purchase" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining("/purchase"), expect.anything());
  });
});
