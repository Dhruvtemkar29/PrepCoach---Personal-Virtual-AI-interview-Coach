import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { loginUser, registerUser, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

function getStoredToken() {
  return (
    localStorage.getItem("prepcoach-token") ||
    sessionStorage.getItem("prepcoach-token")
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("prepcoach-user") ||
      sessionStorage.getItem("prepcoach-user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("prepcoach-token");
    localStorage.removeItem("prepcoach-user");

    sessionStorage.removeItem("prepcoach-token");
    sessionStorage.removeItem("prepcoach-user");

    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getCurrentUser(token);
      setUser(data.user);

      const storage = localStorage.getItem("prepcoach-token")
        ? localStorage
        : sessionStorage;

      storage.setItem("prepcoach-user", JSON.stringify(data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (values) => {
    const data = await loginUser(values);
    const storage = values.remember ? localStorage : sessionStorage;

    storage.setItem("prepcoach-token", data.token);
    storage.setItem("prepcoach-user", JSON.stringify(data.user));

    setUser(data.user);
    return data;
  };

  const signup = async (values) => {
    const data = await registerUser(values);
    const storage = localStorage;

    storage.setItem("prepcoach-token", data.token);
    storage.setItem("prepcoach-user", JSON.stringify(data.user));

    setUser(data.user);
    return data;
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
