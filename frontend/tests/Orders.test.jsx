import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import Orders from "../src/pages/Orders";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderOrders() {
  return render(
    <AuthContext.Provider value={{ token: "abc", user: { role: "user" }, logout: vi.fn() }}>
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Orders", () => {
  it("renders fetched orders", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => [
        {
          id: "1",
          make: "Toyota",
          model: "Corolla",
          category: "sedan",
          price: 21000,
          quantity: 1,
          created_at: "2026-07-01T10:00:00+00:00",
        },
      ],
    });

    renderOrders();

    await waitFor(() => expect(screen.getByText("Toyota Corolla")).toBeInTheDocument());
  });

  it("shows an empty state when there are no orders", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => [] });

    renderOrders();

    await waitFor(() =>
      expect(screen.getByText("You haven't purchased any vehicles yet.")).toBeInTheDocument()
    );
  });
});
