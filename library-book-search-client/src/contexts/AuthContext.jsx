import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isLoginForm, setIsLoginForm }}>
      {children}
    </AuthContext.Provider>
  );
};
