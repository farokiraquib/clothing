import { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, getMyProfile } from '../api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('userToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMyProfile(token)
        .then(setUser)
        .catch(() => { localStorage.removeItem('userToken'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem('userToken', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    localStorage.setItem('userToken', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => setUser(updated);

  return (
    <UserContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
