import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useLocation } from "react-router-dom";

import { setIsAuthenticated } from "./app/slices/authSlice";
import AlertModal from "./components/AlertModal";
import Layout from "./layout/Layout";
import JoinPage from "./pages/JoinPage/JoinPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import MobileAuthPage from "./pages/MobileAuthPage/MobileAuthPage";
import PasswordChangePage from "./pages/PasswordChangePage/PasswordChangePage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import AccountNameRecoveryPage from "./pages/RecoveryPages/AccountNameRecoveryPage";
import PasswordRecoveryPage from "./pages/RecoveryPages/PasswordRecoveryPage";
import WithdrawalPage from "./pages/WithdrawalPage/WithdrawalPage";
import HomePage from "./pages/HomePage/HomePage";
import PrivateRoute from "./routes/PrivateRoute";
import axiosInstance from "./services/axiosInstance";

import "./App.css";

/**
 * App 컴포넌트
 */
function App() {
  const location = useLocation();

  // 전역 상태 관리
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); 
  const dispatch = useDispatch();

  // 업데이트 이펙트: 최초 로드 시 또는 location 변경 시 로그인 여부 확인
  useEffect(() => {
    const checkLogin = async () => {
      const accountName = sessionStorage.getItem("loginId");
      // 세션스토리지에 사용자 아이디가 저장되어 있지 않은 경우
      if (!accountName) {
        try {
          // 로그인 여부 확인 API 요청
          const response = await axiosInstance.get(`${import.meta.env.VITE_SERVER_URL}/auth/check-login`);
          // 로그인 상태로 인정된 경우
          if (response.data.code === 'IS_LOGGED_IN') {
            console.log("로그인 상태");
            const { accountName } = response.data.accountName;
            dispatch(setIsAuthenticated(true));
            sessionStorage.setItem("loginId", accountName);
          }
        } catch (error) {
          if (error.response.status === 403) {
            console.log(error.response.data.code);
            console.log("로그아웃 상태");
            dispatch(setIsAuthenticated(false));
          // 서버측 에러
          } else {
            console.log("로그인 여부 확인 중 에러 발생");
            console.error(error);
          }
        }
      // 세션스토리지에 사용자 아이디가 저장되어 있는 경우
      } else {
        console.log("로그인 상태");
        dispatch(setIsAuthenticated(true));
      }
    };

    checkLogin();
  }, [location]);

  return (
    <>
      <AlertModal />
      <Routes>
        {/* 홈 페이지 라우트 */}
        {/* 레이아웃 적용 */}
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
  
        {/* 로그인 페이지 라우트 */}
        <Route path="/auth/login" element={<LoginPage />} />
  
        {/* 회원가입 페이지 라우트 */}
        <Route path="/auth/join" element={<JoinPage />} />
  
        {/* 아이디 또는 비밀번호 찾기 모바일인증 페이지 라우트 */}
        <Route path="/auth/mobile-auth/account-name-recovery" element={<MobileAuthPage type="account-name-recovery" />} />
        <Route path="/auth/mobile-auth/password-recovery" element={<MobileAuthPage type="password-recovery" />} />
  
        {/* 아이디 또는 비밀번호 찾기 페이지 라우트 */}
        <Route path="/auth/account-name-recovery" element={<AccountNameRecoveryPage />} />
        <Route path="/auth/password-recovery" element={<PasswordRecoveryPage />} />
  
        {/* 프로필(내 정보) 페이지 라우트 */}
        {/* PrivateRoute: 로그인 되어 있지 않으면 접근 제한됨 */}
        <Route path="/auth/profile" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <ProfilePage />
          </PrivateRoute>
        } />
  
        {/* 비밀번호 변경 페이지 라우트 */}
        {/* PrivateRoute: 로그인 되어 있지 않으면 접근 제한됨 */}
        <Route path="/auth/profile/password-change" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <PasswordChangePage />
          </PrivateRoute>
        } />    
  
        {/* 회원탈퇴 모바일인증 페이지 라우트 */}
        {/* PrivateRoute: 로그인 되어 있지 않으면 접근 제한됨 */}
        <Route path="/auth/mobile-auth/withdrawal" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <MobileAuthPage type="withdrawal" />
          </PrivateRoute>
        } />
  
        {/* 회원탈퇴 페이지 라우트 */}
        {/* PrivateRoute: 로그인 되어 있지 않으면 접근 제한됨 */}
        <Route path="/auth/withdrawal" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <WithdrawalPage />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

export default App;
