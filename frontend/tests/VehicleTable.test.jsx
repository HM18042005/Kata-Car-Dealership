import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import VehicleTable from "../src/components/VehicleTable";

const vehicle = {
  id: "665f1c1a2b3c4d5e6f7a8b9d",
  make: "Toyota",
  model: "Corolla",
  category: "sedan",
  price: 21000,
  quantity: 3,
};

describe("VehicleTable", () => {
  it("calls onEdit with the full vehicle when Edit is clicked", () => {
    const onEdit = vi.fn();
    render(
      <VehicleTable vehicles={[vehicle]} onEdit={onEdit} onDelete={vi.fn()} onRestock={vi.fn()} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledWith(vehicle);
  });

  it("calls onDelete with the vehicle id when Delete is clicked", () => {
    const onDelete = vi.fn();
    render(
      <VehicleTable vehicles={[vehicle]} onEdit={vi.fn()} onDelete={onDelete} onRestock={vi.fn()} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith(vehicle.id);
  });

  it("updates the inline restock amount and calls onRestock with the id and the entered amount", () => {
    const onRestock = vi.fn();
    render(
      <VehicleTable vehicles={[vehicle]} onEdit={vi.fn()} onDelete={vi.fn()} onRestock={onRestock} />
    );

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Restock" }));

    expect(onRestock).toHaveBeenCalledWith(vehicle.id, 5);
  });

  it("disables the Restock button when the amount is not at least 1", () => {
    render(
      <VehicleTable vehicles={[vehicle]} onEdit={vi.fn()} onDelete={vi.fn()} onRestock={vi.fn()} />
    );

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "0" } });

    expect(screen.getByRole("button", { name: "Restock" })).toBeDisabled();
  });
});
