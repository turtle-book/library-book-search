import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./JoinPage.css";

// 회원가입 폼
function JoinPage() {
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("male");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/join`, {
        accountName, 
        password, 
        realName, 
        birthday, 
        gender, 
        email,
        mobileNumber, 
        address,
      });

      if (response.data.code === "JOIN_SUCCEEDED") {
        alert(`${response.data.message}`);
      } else if (response.data.code === "JOIN_FAILED") {
        alert(`${response.data.message}`);
      }

      setAccountName("");
      setPassword("");
      setRealName("");
      setBirthday("");
      setGender("male");
      setEmail("");
      setMobileNumber("");
      setAddress("");
      
      navigate("/login");
    } catch (error) {
      console.error("회원가입 요청 실패:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="account-name">아이디:</label>
          <input type="text" id="account-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">비밀번호:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="real-name">성명:</label>
          <input type="text" id="real-name" value={realName} onChange={(e) => setRealName(e.target.value)} required />
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
          <label htmlFor="email">이메일:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="mobile-number">휴대폰번호:</label>
          <input type="tel" id="mobile-number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
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

export default JoinPage;
