import { describe, it, expect } from "vitest";

import { buildQueryString } from "../src/utils/buildQueryString";

describe("buildQueryString", () => {
  it("returns an empty string when there is no search term or filters", () => {
    expect(buildQueryString("", {})).toBe("");
  });

  it("includes make when a search term is given", () => {
    expect(buildQueryString("Toyota", {})).toBe("make=Toyota");
  });

  it("includes category, min_price, and max_price from filters", () => {
    const query = buildQueryString("", { category: "suv", minPrice: "10000", maxPrice: "50000" });
    const params = new URLSearchParams(query);
    expect(params.get("category")).toBe("suv");
    expect(params.get("min_price")).toBe("10000");
    expect(params.get("max_price")).toBe("50000");
  });

  it("combines a search term with filters", () => {
    const query = buildQueryString("Honda", { category: "sedan" });
    const params = new URLSearchParams(query);
    expect(params.get("make")).toBe("Honda");
    expect(params.get("category")).toBe("sedan");
  });
});
