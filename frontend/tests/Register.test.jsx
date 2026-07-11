import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import Register from "../src/pages/Register";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("Register", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    global.fetch = vi.fn();
  });

  it("shows an error message and does not throw when registration fails", async () => {
    global.fetch.mockResolvedValue({
      status: 400,
      ok: false,
      json: async () => ({ detail: "Email already registered" }),
    });

    render(
      <AuthContext.Provider value={{ token: null }}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Email already registered"));
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });
});
