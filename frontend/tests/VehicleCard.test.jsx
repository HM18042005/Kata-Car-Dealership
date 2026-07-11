import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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
});
