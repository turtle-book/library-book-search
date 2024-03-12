import axios from "axios";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; 

import Layout from "./layout/Layout";
import JoinPage from "./pages/auth/JoinPage/JoinPage";
import LoginPage from "./pages/auth/LoginPage/LoginPage";
import MobileAuthPage from "./pages/auth/MobileAuthPage/MobileAuthPage";
import ProfilePage from "./pages/auth/ProfilePage/ProfilePage";
import RecoveryAccountNamePage from "./pages/auth/RecoveryPages/RecoveryAccountNamePage";
import RecoveryPasswordPage from "./pages/auth/RecoveryPages/RecoveryPasswordPage";
import WithdrawalPage from "./pages/auth/WithdrawalPage/WithdrawalPage";
import HomePage from "./pages/HomePage/HomePage";
import store from "../src/store";

import "./App.css";

function App() {
  // 마운트 이펙트: 세션스토리지에 사용자 정보가 없는 경우 로그아웃 여부 확인 요청(애플리케이션 최초 로드 시에만 실행)
  useEffect(() => {
    const checkLogout = async () => {
      const accountName = sessionStorage.getItem("loginId");
      if (!accountName) {
        try {
          // 로그아웃 여부 확인 요청
          await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/check-logout`, {
            withCredentials: true,
          });
        } catch (error) {
          // 토큰 등 서버에 아직 로그인 데이터가 남은 경우 로그아웃 요청
          if (error.response.data.code === "IS_LOGGED_IN") {
            try {
              await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/auth/logout`, 
                { accountName }, 
                { withCredentials: true } 
              );
            } catch (logoutError) {
              console.error("로그아웃 요청 실패", logoutError);
            }
          } else {
            console.error("로그아웃 여부 확인 요청 실패", error);
          }
        }
      }
    };

    checkLogout();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/join" element={<JoinPage />} />
          <Route path="/auth/profile" element={<ProfilePage />} />
          <Route path="/auth/mobile-auth/withdrawal" element={<MobileAuthPage type="withdrawal" />} />
          <Route path="/auth/mobile-auth/recovery-account-name" element={<MobileAuthPage type="recovery-account-name" />} />
          <Route path="/auth/mobile-auth/recovery-password" element={<MobileAuthPage type="recovery-password" />} />
          <Route path="/auth/withdrawal" element={<WithdrawalPage />} />
          <Route path="/auth/recovery-account-name" element={<RecoveryAccountNamePage />} />
          <Route path="/auth/recovery-password" element={<RecoveryPasswordPage />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
