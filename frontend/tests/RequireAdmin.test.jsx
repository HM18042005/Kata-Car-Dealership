import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import RequireAdmin from "../src/components/RequireAdmin";

describe("RequireAdmin", () => {
  it("redirects a logged-in non-admin user to /", () => {
    render(
      <AuthContext.Provider value={{ token: "abc", user: { sub: "1", role: "user" } }}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/" element={<div>Dashboard</div>} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <div>Admin page</div>
                </RequireAdmin>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders the route for an admin user", () => {
    render(
      <AuthContext.Provider value={{ token: "abc", user: { sub: "1", role: "admin" } }}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/" element={<div>Dashboard</div>} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <div>Admin page</div>
                </RequireAdmin>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Admin page")).toBeInTheDocument();
  });
});
