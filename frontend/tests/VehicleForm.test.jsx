import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import VehicleForm from "../src/components/VehicleForm";

describe("VehicleForm", () => {
  it("marks price and quantity as required, non-negative number inputs", () => {
    render(<VehicleForm onSubmit={vi.fn()} />);

    const price = screen.getByLabelText(/price/i);
    const quantity = screen.getByLabelText(/quantity/i);

    expect(price).toHaveAttribute("type", "number");
    expect(price).toHaveAttribute("min", "0");
    expect(price).toBeRequired();

    expect(quantity).toHaveAttribute("type", "number");
    expect(quantity).toHaveAttribute("min", "0");
    expect(quantity).toBeRequired();
  });

  it("submits the entered fields as a Vehicle-shaped payload", () => {
    const onSubmit = vi.fn();
    const { container } = render(<VehicleForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/make/i), { target: { value: "Toyota" } });
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: "Corolla" } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "sedan" } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: "21000" } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: "3" } });
    fireEvent.submit(container.querySelector("form"));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        make: "Toyota",
        model: "Corolla",
        category: "sedan",
        price: 21000,
        quantity: 3,
      })
    );
  });
});
