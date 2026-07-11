import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "../src/context/AuthContext";
import { useApi } from "../src/hooks/useApi";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function wrapperFor(authValue) {
  return function Wrapper({ children }) {
    return (
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthContext.Provider>
    );
  };
}

describe("useApi", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    global.fetch = vi.fn();
  });

  it("logs out and navigates to /login on a 401 when a token is present", async () => {
    const logout = vi.fn();
    global.fetch.mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ detail: "Unauthorized" }),
    });

    const { result } = renderHook(() => useApi("/api/vehicles"), {
      wrapper: wrapperFor({ token: "abc", logout }),
    });

    await result.current.execute();

    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("sets an error and does not redirect on a 401 when there is no token", async () => {
    const logout = vi.fn();
    global.fetch.mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ detail: "Bad credentials" }),
    });

    const { result } = renderHook(() => useApi("/api/auth/login"), {
      wrapper: wrapperFor({ token: null, logout }),
    });

    await result.current.execute();

    await waitFor(() => expect(result.current.error).toBe("Bad credentials"));
    expect(logout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("sets loading to true while in flight and false with the response data once it resolves", async () => {
    let resolveFetch;
    global.fetch.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    const { result } = renderHook(() => useApi("/api/vehicles"), {
      wrapper: wrapperFor({ token: "abc", logout: vi.fn() }),
    });

    let executePromise;
    act(() => {
      executePromise = result.current.execute();
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFetch({ status: 200, ok: true, json: async () => ({ id: "1", make: "Toyota" }) });
      await executePromise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({ id: "1", make: "Toyota" });
  });

  it("calls execute automatically on mount when auto is true", async () => {
    global.fetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => [],
    });

    renderHook(() => useApi("/api/vehicles", { auto: true }), {
      wrapper: wrapperFor({ token: "abc", logout: vi.fn() }),
    });

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });
});
