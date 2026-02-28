import { createContext, useContext, useState, useEffect } from "react";
import { getUser, logoutUser } from "./authService";

const AuthContext = createContext();

// Map raw DB role → frontend role (in case of stale localStorage data)
const mapRole = (role) => {
  if (role === 'GMMC_ADMIN') return 'admin';
  if (role === 'PRINTER') return 'printer';
  if (role === 'SCHOOL_ADMIN') return 'school';
  // Already mapped (admin, printer, school, marketer)
  return role;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      // Always ensure the role is the mapped frontend role
      const correctedUser = { ...storedUser, role: mapRole(storedUser.role) };
      // Re-save corrected user so localStorage stays in sync
      localStorage.setItem('user', JSON.stringify(correctedUser));
      setUser(correctedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Always normalise the role so ProtectedRoute comparisons work
    const correctedUser = { ...userData, role: mapRole(userData.role) };
    localStorage.setItem('user', JSON.stringify(correctedUser));
    setUser(correctedUser);
  };


  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);