import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { resetMobileAuthData } from "../../../app/slice/mobileAuthDataSlice";

import "./LoginPage.css";

// 로그인 폼
function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 로컬 상태 관리
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");

  // 마운트 이펙트: 모바일인증 페이지에서 뒤로가기를 할 경우 모바일인증 관련 전역상태를 초기화하기 위한 이펙트
  useEffect(() => {
    dispatch(resetMobileAuthData());
  }, []);

  // 로그인 정보 제출 핸들러
  const handleSubmitLoginData = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/login`, 
        { accountName, password }, 
        { withCredentials: true },
      );

      // 로그인 성공
      if (response.data.code === "LOGIN_SUCCEEDED") {
        sessionStorage.setItem("loginId", response.data.loginId);
        navigate("/");
      // 로그인 실패: 가입되지 않은 계정, 비밀번호 불일치
      } else if (response.data.code === "LOGIN_FAILED") {
        alert(`${response.data.message}`);
        setAccountName("");
        setPassword("");
      }
    } catch (error) {
      console.error("로그인 요청 실패", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <Link  
          to="/"
          className="login-form-home-link"
        >
          <img src="/logo.png" />
        </Link>
        <input
          type="text" 
          value={accountName} 
          placeholder="아이디" 
          onChange={(e) => setAccountName(e.target.value)} 
          required 
        />
        <input
          type="password" 
          value={password} 
          placeholder="비밀번호" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <div className="login-button" onClick={handleSubmitLoginData}>로그인</div>
        <div className="login-page-auth-link">
          <Link to="/auth/mobile-auth/recovery-account-name">아이디 찾기</Link>
          <Link to="/auth/mobile-auth/recovery-password">비밀번호 찾기</Link>
          <Link to="/auth/join">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
