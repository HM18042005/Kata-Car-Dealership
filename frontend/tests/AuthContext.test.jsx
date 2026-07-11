import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useContext } from "react";

import { AuthContext, AuthProvider } from "../src/context/AuthContext";

function encodeToken(payload) {
  const base64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `header.${base64}.signature`;
}

function Consumer() {
  const { token, user, login, logout } = useContext(AuthContext);
  return (
    <div>
      <span data-testid="token">{token ?? "none"}</span>
      <span data-testid="role">{user?.role ?? "none"}</span>
      <button onClick={() => login(encodeToken({ sub: "user-1", role: "admin" }))}>
        login
      </button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates token and user from localStorage on mount", () => {
    localStorage.setItem("token", encodeToken({ sub: "user-1", role: "user" }));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("role")).toHaveTextContent("user");
  });

  it("login decodes the token, updates state, and persists it to localStorage", () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("login"));

    expect(screen.getByTestId("role")).toHaveTextContent("admin");
    expect(localStorage.getItem("token")).toBe(
      encodeToken({ sub: "user-1", role: "admin" })
    );
  });

  it("logout clears state and localStorage", () => {
    localStorage.setItem("token", encodeToken({ sub: "user-1", role: "user" }));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("logout"));

    expect(screen.getByTestId("role")).toHaveTextContent("none");
    expect(localStorage.getItem("token")).toBeNull();
  });
});
