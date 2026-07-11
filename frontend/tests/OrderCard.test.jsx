import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import OrderCard from "../src/components/OrderCard";

describe("OrderCard", () => {
  it("shows the vehicle's make, model, category, and price paid", () => {
    const order = {
      id: "1",
      make: "Toyota",
      model: "Corolla",
      category: "sedan",
      price: 21000,
      quantity: 1,
      created_at: "2026-07-01T10:00:00+00:00",
    };

    render(<OrderCard order={order} />);

    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.getByText("sedan")).toBeInTheDocument();
    expect(screen.getByText("₹21,000")).toBeInTheDocument();
  });
});
