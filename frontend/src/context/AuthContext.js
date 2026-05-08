import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const t = localStorage.getItem('bpqg_token');
  const u = localStorage.getItem('bpqg_user');

  setToken(t || null);

  let parsedUser = null;

  if (u && u !== "undefined") {
    try {
      parsedUser = JSON.parse(u);
    } catch (err) {
      localStorage.removeItem('bpqg_user');
    }
  }

  setUser(parsedUser);
  setLoading(false);
}, []);

  const login = (token, user) => {
    localStorage.setItem('bpqg_token', token);
    localStorage.setItem('bpqg_user', JSON.stringify(user));
    setToken(token); setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('bpqg_token');
    localStorage.removeItem('bpqg_user');
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
