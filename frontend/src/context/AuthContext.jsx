import { createContext, useState } from "react";

export const AuthContext = createContext(null);

function decodePayload(token) {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("token");
    if (!stored) return null;
    try {
      const { sub, role } = decodePayload(stored);
      return { sub, role };
    } catch {
      return null;
    }
  });

  function login(newToken) {
    try {
      const { sub, role } = decodePayload(newToken);
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser({ sub, role });
    } catch (e) {
      console.error("Invalid token format", e);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
