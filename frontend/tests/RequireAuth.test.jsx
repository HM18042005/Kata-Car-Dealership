import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import RequireAuth from "../src/components/RequireAuth";

describe("RequireAuth", () => {
  it("redirects to /login when there is no token", () => {
    render(
      <AuthContext.Provider value={{ token: null, user: null }}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/login" element={<div>Login page</div>} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <div>Dashboard</div>
                </RequireAuth>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });
});
