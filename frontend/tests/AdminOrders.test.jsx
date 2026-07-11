import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import AdminOrders from "../src/pages/AdminOrders";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderAdminOrders() {
  return render(
    <AuthContext.Provider value={{ token: "abc", user: { role: "admin" }, logout: vi.fn() }}>
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("AdminOrders", () => {
  it("renders orders fetched from /api/orders/all", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => [
        {
          id: "1",
          user_email: "buyer@example.com",
          make: "Toyota",
          model: "Corolla",
          category: "sedan",
          price: 21000,
          quantity: 1,
          created_at: "2026-07-01T10:00:00+00:00",
        },
      ],
    });

    renderAdminOrders();

    await waitFor(() => expect(screen.getByText("buyer@example.com")).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/orders/all"),
      expect.anything()
    );
  });
});
