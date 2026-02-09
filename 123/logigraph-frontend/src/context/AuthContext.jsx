import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextValue';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            // Parse JWT manually (token.payload is the middle part)
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            const userData = JSON.parse(storedUser);
            
            // Check if token is expired
            if (payload.exp * 1000 > Date.now()) {
              if (isMounted) {
                setUser(userData);
              }
            } else {
              // Token expired, clear storage
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
            }
          } catch {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    logout,
    isAuthenticated: !!user,
    userRole: user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
