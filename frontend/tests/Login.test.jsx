import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import Login from "../src/pages/Login";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("Login", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    global.fetch = vi.fn();
  });

  it("shows an error message and does not throw when login fails", async () => {
    global.fetch.mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ detail: "Invalid credentials" }),
    });

    render(
      <AuthContext.Provider value={{ token: null, login: vi.fn() }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials"));
    expect(mockNavigate).not.toHaveBeenCalledWith("/", { replace: true });
  });
});
