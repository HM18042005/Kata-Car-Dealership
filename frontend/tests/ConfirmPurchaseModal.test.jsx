import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import ConfirmPurchaseModal from "../src/components/ConfirmPurchaseModal";

const vehicle = {
  id: "665f1c1a2b3c4d5e6f7a8b9d",
  make: "Toyota",
  model: "Corolla",
  category: "sedan",
  price: 21000,
  quantity: 3,
};

describe("ConfirmPurchaseModal", () => {
  it("shows the vehicle's make, model, category, and formatted price", () => {
    render(<ConfirmPurchaseModal vehicle={vehicle} onConfirm={vi.fn()} onCancel={vi.fn()} loading={false} />);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Toyota Corolla")).toBeInTheDocument();
    expect(within(dialog).getByText("sedan")).toBeInTheDocument();
    expect(within(dialog).getByText("₹21,000")).toBeInTheDocument();
  });

  it("calls onConfirm when Confirm Purchase is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmPurchaseModal vehicle={vehicle} onConfirm={onConfirm} onCancel={vi.fn()} loading={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm Purchase" }));

    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmPurchaseModal vehicle={vehicle} onConfirm={vi.fn()} onCancel={onCancel} loading={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalled();
  });

  it("disables the Confirm Purchase button while loading", () => {
    render(<ConfirmPurchaseModal vehicle={vehicle} onConfirm={vi.fn()} onCancel={vi.fn()} loading={true} />);

    expect(screen.getByRole("button", { name: /confirming/i })).toBeDisabled();
  });

  it("disables the Cancel button and ignores Escape while loading", () => {
    const onCancel = vi.fn();
    render(<ConfirmPurchaseModal vehicle={vehicle} onConfirm={vi.fn()} onCancel={onCancel} loading={true} />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).not.toHaveBeenCalled();
  });
});
