import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

// 로그인 폼
function LoginForm() {
  const { setIsLoggedIn } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // 로그인 요청
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/login`, 
        { userId, password }, 
        { withCredentials: true },
      );
      // 로그인 성공
      if (response.data.code === "LOGIN_SUCCESS") {
        setIsLoggedIn(true);
        navigate("/");
      // 로그인 실패: 가입되지 않은 계정, 비밀번호 불일치
      } else if (response.data.code === "LOGIN_FAIL") {
        alert(`${response.data.message}`);
        setUserId("");
        setPassword("");
        navigate("/auth");
      }
    } catch (error) {
      if (error.response.status === 401) {
        alert(`${error.response.data.code}`);
      }
      console.error("로그인 요청 실패", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="userId">ID:</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">PW:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button>로그인</button>
      </form>
    </>
  );
}

export default LoginForm;
