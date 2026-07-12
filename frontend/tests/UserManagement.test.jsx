import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import UserManagement from "../src/components/UserManagement";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderUserManagement(props = {}) {
  return render(
    <AuthContext.Provider value={{ token: "abc", user: { role: "admin" }, logout: vi.fn() }}>
      <MemoryRouter>
        <UserManagement currentUserId="999" setToast={vi.fn()} {...props} />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const users = [
  { id: "1", email: "user@example.com", role: "user" },
  { id: "2", email: "admin@example.com", role: "admin" },
];

describe("UserManagement", () => {
  it("fetches and renders users on mount", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => users });

    renderUserManagement();

    await waitFor(() => expect(screen.getByText("user@example.com")).toBeInTheDocument());
  });

  it("promotes a user and shows a success toast", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => users });
    const setToast = vi.fn();

    renderUserManagement({ setToast });
    await waitFor(() => expect(screen.getByText("user@example.com")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Promote" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users/1/promote"),
        expect.objectContaining({ method: "POST" })
      )
    );
    await waitFor(() => expect(setToast).toHaveBeenCalledWith({ type: "success", message: "User promoted to admin." }));
  });

  it("demotes a user and shows a success toast", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => users });
    const setToast = vi.fn();

    renderUserManagement({ setToast });
    await waitFor(() => expect(screen.getByText("admin@example.com")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Demote" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users/2/demote"),
        expect.objectContaining({ method: "POST" })
      )
    );
    await waitFor(() => expect(setToast).toHaveBeenCalledWith({ type: "success", message: "User demoted to regular user." }));
  });

  it("asks for confirmation before deleting, and does nothing if cancelled", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => users });
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderUserManagement();
    await waitFor(() => expect(screen.getByText("user@example.com")).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(deleteButtons[0]);

    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/users/1"),
      expect.objectContaining({ method: "DELETE" })
    );

    window.confirm.mockRestore();
  });

  it("deletes a user after confirmation and shows a success toast", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => users });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const setToast = vi.fn();

    renderUserManagement({ setToast });
    await waitFor(() => expect(screen.getByText("user@example.com")).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users/1"),
        expect.objectContaining({ method: "DELETE" })
      )
    );
    await waitFor(() => expect(setToast).toHaveBeenCalledWith({ type: "success", message: "User deleted." }));

    window.confirm.mockRestore();
  });
});
