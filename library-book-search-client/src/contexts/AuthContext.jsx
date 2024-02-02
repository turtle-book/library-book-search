import { createContext, useContext, useEffect, useState } from "react";

import axiosInstance from "../services/axiosInstance";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_SERVER_URL}/auth/login-status`,
        );
        if (response.status === 200 && response.data.code === "IS_LOGGED_IN") {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("로그인 상태 확인 요청 실패", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isLoginForm, setIsLoginForm }}>
      {children}
    </AuthContext.Provider>
  );
};
