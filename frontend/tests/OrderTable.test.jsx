import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import OrderTable from "../src/components/OrderTable";

const order = {
  id: "1",
  user_email: "buyer@example.com",
  make: "Toyota",
  model: "Corolla",
  category: "sedan",
  price: 21000,
  quantity: 1,
  created_at: "2026-07-01T10:00:00+00:00",
};

describe("OrderTable", () => {
  it("renders a row per order with buyer email, vehicle, and price", () => {
    render(<OrderTable orders={[order]} />);

    expect(screen.getByText("buyer@example.com")).toBeInTheDocument();
    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.getByText("₹21,000")).toBeInTheDocument();
  });

  it("shows an empty message when there are no orders", () => {
    render(<OrderTable orders={[]} />);

    expect(screen.getByText("No orders yet.")).toBeInTheDocument();
  });
});
