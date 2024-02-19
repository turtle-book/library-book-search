import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./LoginPage.css";

// 로그인 폼
function LoginPage() {
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // 로그인 요청
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/login`, 
        { accountName, password }, 
        { withCredentials: true },
      );
      // 로그인 성공
      if (response.data.code === "LOGIN_SUCCEEDED") {
        localStorage.setItem("loginId", response.data.loginId);
        navigate("/");
      // 로그인 실패: 가입되지 않은 계정, 비밀번호 불일치
      } else if (response.data.code === "LOGIN_FAILED") {
        alert(`${response.data.message}`);
        setAccountName("");
        setPassword("");
        navigate("/login");
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
          <img src="logo.png" />
        </Link>
        <input
          type="text"
          id="account-name"
          value={accountName}
          placeholder="아이디"
          onChange={(e) => setAccountName(e.target.value)}
        />
        <input
          type="password"
          id="password"
          value={password}
          placeholder="비밀번호"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="login-button" onClick={handleSubmit}>로그인</div>
        <div className="login-page-auth-link">
          <Link to="/">아이디 찾기</Link>
          <Link to="/">비밀번호 찾기</Link>
          <Link to="/join">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
