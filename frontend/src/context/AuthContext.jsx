import { createContext, useContext, useState } from 'react';

import {
  login as loginAPI,
  register as registerAPI,
} from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('opsmind_user');

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    const response = await loginAPI({
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem('opsmind_token', data.token);

    localStorage.setItem(
      'opsmind_user',

      JSON.stringify(data.user),
    );

    setUser(data.user);

    return data;
  };

  const register = async (name, email, password) => {
    const response = await registerAPI({
      name,
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem('opsmind_token', data.token);

    localStorage.setItem('opsmind_user', JSON.stringify(data.user));

    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem('opsmind_token');

    localStorage.removeItem('opsmind_user');

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
