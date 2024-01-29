import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

function LoginForm() {
  const { setIsLoggedIn } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/login`, 
        { userId, password }, 
        { withCredentials: true },
      );
      if (response.data.code === "LOGIN SUCCESS") {
        setIsLoggedIn(true);
        navigate("/");
      } else if (response.data.code === "LOGIN FAIL") {
        alert(`${response.data.message}`);
        setUserId("");
        setPassword("");
        navigate("/auth");
      }

    } catch (error) {
      console.error(error);
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
