import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios'; // we'll use it to fetch "me" later if implemented, for now manage state via login response

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const verifyUserSession = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          // Optimistically set the user to avoid flicker
          setUser(JSON.parse(storedUser));
          
          // Verify with the backend if the token is still valid. 
          // If valid, sync user details. If invalid, the interceptor handles the 401.
          const response = await api.get('/auth/verify');
          if (response.data.success && isMounted) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        }
      } catch (error) {
        // Interceptor handles 401 and clears localStorage, we just clear the state here
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    verifyUserSession();
    return () => { isMounted = false; };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout failed on server", error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
