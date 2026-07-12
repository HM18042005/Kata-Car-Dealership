import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import UserTable from "../src/components/UserTable";

const users = [
  { id: "1", email: "user@example.com", role: "user" },
  { id: "2", email: "admin@example.com", role: "admin" },
];

describe("UserTable", () => {
  it("shows Promote for a regular user row and Demote for an admin row", () => {
    render(<UserTable users={users} currentUserId="999" onPromote={vi.fn()} onDemote={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Promote" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Demote" })).toBeInTheDocument();
  });

  it("calls onPromote with the user's id when Promote is clicked", () => {
    const onPromote = vi.fn();
    render(<UserTable users={users} currentUserId="999" onPromote={onPromote} onDemote={vi.fn()} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Promote" }));

    expect(onPromote).toHaveBeenCalledWith("1");
  });

  it("calls onDemote with the user's id when Demote is clicked", () => {
    const onDemote = vi.fn();
    render(<UserTable users={users} currentUserId="999" onPromote={vi.fn()} onDemote={onDemote} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Demote" }));

    expect(onDemote).toHaveBeenCalledWith("2");
  });

  it("calls onDelete with the user's id when Delete is clicked", () => {
    const onDelete = vi.fn();
    render(<UserTable users={users} currentUserId="999" onPromote={vi.fn()} onDemote={vi.fn()} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("hides all action buttons for the current user's own row", () => {
    render(<UserTable users={users} currentUserId="1" onPromote={vi.fn()} onDemote={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Promote" })).not.toBeInTheDocument();
    expect(screen.getByText("This is you")).toBeInTheDocument();
  });

  it("shows the empty message when there are no users", () => {
    render(<UserTable users={[]} currentUserId="999" onPromote={vi.fn()} onDemote={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });
});
