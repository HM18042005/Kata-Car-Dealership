import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Modal from "../src/components/Modal";

describe("Modal", () => {
  it("renders the title and children", () => {
    render(
      <Modal title="Test Modal" onClose={vi.fn()}>
        <p>Modal body</p>
      </Modal>
    );

    expect(screen.getByRole("heading", { name: "Test Modal" })).toBeInTheDocument();
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("has the dialog role and aria-modal for accessibility", () => {
    render(
      <Modal title="Test Modal" onClose={vi.fn()}>
        <p>Modal body</p>
      </Modal>
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Test Modal" onClose={onClose}>
        <p>Modal body</p>
      </Modal>
    );

    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Test Modal" onClose={onClose}>
        <p>Modal body</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });
});
