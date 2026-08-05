<<<<<<< HEAD
import { createContext, useContext, useState } from "react";
=======
import { createContext, useContext, useState, useEffect } from "react";
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
<<<<<<< HEAD
  // Read from localStorage synchronously — no async gap, no flash
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
=======
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
    } catch (_) {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

<<<<<<< HEAD
  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      const updated = { ...(prevUser || {}), ...updatedFields };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      await api.post("logout/");
    } catch (_) {}
=======
  const logout = async () => {
    try {
      await api.post("logout/");
    } catch (_) {
      // ignore network/session errors on logout
    }
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
=======
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
