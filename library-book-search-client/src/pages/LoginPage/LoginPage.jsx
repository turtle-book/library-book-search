import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { openAlertModal } from "../../app/slices/alertSlice";
import { setIsAuthenticated} from "../../app/slices/authSlice";
import { resetMobileAuthData } from "../../app/slices/mobileAuthSlice";
import axiosInstance from "../../services/axiosInstance";

import "./LoginPage.css";

/**
 * LoginPage 컴포넌트
 * 
 * 로그인 화면 렌더링
 */
function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 로컬 상태 관리
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");

  // 마운트 이펙트: 모바일인증 페이지에서 뒤로가기 한 경우 모바일인증 관련 전역 상태를 초기화 하는 목적으로 실행
  useEffect(() => {
    dispatch(resetMobileAuthData());
  }, []);

  // 로그인 요청 핸들러
  const handleRequestLogin = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!accountName.trim()) {
      dispatch(openAlertModal({ 
        modalTitle: "로그인 실패", 
        modalContent: "아이디를 입력해주세요.", 
      }));
      return;
    } else if (!password) {
      dispatch(openAlertModal({ 
        modalTitle: "로그인 실패", 
        modalContent: "비밀번호를 입력해주세요.", 
      }));
      return;
    }

    try {
      // 로그인 API 요청
      const response = await axiosInstance.post(`${import.meta.env.VITE_SERVER_URL}/auth/login`, 
        { 
          accountName, 
          password, 
        }, 
      );
      // 로그인 성공
      if (response.data.code === "LOGIN_SUCCEEDED") {
        dispatch(setIsAuthenticated(true));
        sessionStorage.setItem("loginId", response.data.loginId);
        // 홈 페이지로 리다이렉트
        navigate("/");
      // 로그인 실패(원인: 가입되지 않은 계정, 비밀번호 불일치)
      } else if (response.data.code === "LOGIN_FAILED") {
        dispatch(openAlertModal({ 
          modalTitle: "로그인 실패", 
          modalContent: response.data.message, 
        }));
        setAccountName("");
        setPassword("");
      }
    } catch (error) {
      console.log("로그인 요청 실패")
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleRequestLogin} >
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
          maxLength="10"
          onChange={(e) => setAccountName(e.target.value)} 
        />
        <input
          type="password" 
          value={password} 
          placeholder="비밀번호" 
          maxLength="20"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="login-button">로그인</button>
        <div className="login-page-auth-link">
          <Link to="/auth/mobile-auth/account-name-recovery">아이디 찾기</Link>
          <Link to="/auth/mobile-auth/password-recovery">비밀번호 찾기</Link>
          <Link to="/auth/join">회원가입</Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
