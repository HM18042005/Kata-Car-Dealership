import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import VehicleCard from "../src/components/VehicleCard";

describe("VehicleCard", () => {
  it("disables the Purchase button and labels it Out of stock when quantity is 0", () => {
    const vehicle = {
      id: "665f1c1a2b3c4d5e6f7a8b9d",
      make: "Toyota",
      model: "Corolla",
      category: "sedan",
      price: 21000,
      quantity: 0,
    };

    render(<VehicleCard vehicle={vehicle} onPurchase={vi.fn()} />);

    const button = screen.getByRole("button", { name: /out of stock/i });
    expect(button).toBeDisabled();
  });

  it("calls onPurchase with the full vehicle when Purchase is clicked", () => {
    const vehicle = {
      id: "665f1c1a2b3c4d5e6f7a8b9d",
      make: "Toyota",
      model: "Corolla",
      category: "sedan",
      price: 21000,
      quantity: 3,
    };
    const onPurchase = vi.fn();

    render(<VehicleCard vehicle={vehicle} onPurchase={onPurchase} />);

    fireEvent.click(screen.getByRole("button", { name: "Purchase" }));

    expect(onPurchase).toHaveBeenCalledWith(vehicle);
  });
});
