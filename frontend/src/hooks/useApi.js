import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function useApi(path, { method = "GET", body, auto = false } = {}) {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const reqBody = overrides.body ?? body;
      const res = await fetch(overrides.path ?? path, {
        method: overrides.method ?? method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: reqBody ? JSON.stringify(reqBody) : undefined,
      });
      if (res.status === 401 && token) { 
        logout(); 
        navigate("/login", { replace: true }); 
        return; 
      }
      const json = res.status === 204 ? null : await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.detail || "Request failed");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, method, body, token, logout, navigate]);

  useEffect(() => { if (auto) execute(); }, [auto, execute]);

  return { data, loading, error, execute };
}
