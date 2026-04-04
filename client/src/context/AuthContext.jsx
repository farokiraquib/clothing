import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('adminPassword'));

  const loginAdmin = (password) => {
    localStorage.setItem('adminPassword', password);
    setIsAdmin(true);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminPassword');
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
