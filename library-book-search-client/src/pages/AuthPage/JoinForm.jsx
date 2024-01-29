import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

function JoinForm() {
  const { isLoginForm, setIsLoginForm } = useAuth();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/join`, {
        userId, 
        password, 
        realName, 
        birthday, 
        gender, 
        mobileNumber, 
        address,
      });

      if (response.data.code === "JOIN SUCCESS") {
        setIsLoginForm(true);
        alert(`${response.data.message}`);
      } else if (response.data.code === "JOIN FAIL") {
        alert(`${response.data.message}`);
      }

      setUserId("");
      setPassword("");
      setRealName("");
      setBirthday("");
      setGender("");
      setMobileNumber("");
      setAddress("");
      
      navigate("/auth");
    } catch (error) {
      console.error("회원가입 실패:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="userId">아이디:</label>
          <input type="text" id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">비밀번호:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="realName">성명:</label>
          <input type="text" id="realName" value={realName} onChange={(e) => setRealName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="birthday">생년월일:</label>
          <input type="date" id="birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="gender">성별:</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
        <div>
          <label htmlFor="mobileNumber">휴대폰번호:</label>
          <input type="tel" id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="address">주소:</label>
          <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>
        <button type="submit">회원가입</button>
      </form>
    </>
  );
}

export default JoinForm;
