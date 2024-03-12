import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { resetAddressData } from "../../../app/slice/addressDataSlice";
import { resetMobileAuthData } from "../../../app/slice/mobileAuthDataSlice";
import AddressInputForm from "../../../components/AddressInputForm";
import MobileAuthForm from "../../../components/MobileAuthForm";

import "./JoinPage.css";

// 회원가입 폼
function JoinPage() {
  const navigate = useNavigate();

  // 로컬 상태 관리
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");

  // 전역 상태 관리
  const zonecode = useSelector((state) => state.addressData.zonecode);
  const mainAddress = useSelector((state) => state.addressData.mainAddress);
  const detailAddress = useSelector((state) => state.addressData.detailAddress);
  const mobileNumber = useSelector((state) => state.mobileAuthData.mobileNumber);
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuthData.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 언마운트 이펙트: 전역 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetAddressData());
      dispatch(resetMobileAuthData());
    };
  }, []);

  // 성별 남자 선택 핸들러
  const handleSelectMale = () => {
    setGender("남자");
  };

  // 성별 여자 선택 핸들러
  const handleSelectFemale = () => {
    setGender("여자");
  };

  // 회원가입 정보 제출 핸들러
  const handleSubmitJoinData = async () => {
    if (!isMobileAuthCompleted) {
      alert("모바일 인증이 완료되지 않았습니다.");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/join`, {
        accountName, 
        password, 
        realName, 
        birthday, 
        gender, 
        zonecode,
        mainAddress,
        detailAddress,
        mobileNumber, 
      }, {
        withCredentials: true,
      });

      alert(`${response.data.message}`);

      setAccountName("");
      setPassword("");
      setRealName("");
      setBirthday("");
      setGender("");
      dispatch(resetAddressData());
      dispatch(resetMobileAuthData());

      // 회원가입 성공 시 로그인 페이지로 이동
      if (response.data.code === "JOIN_SUCCEEDED") {
        navigate("/auth/login");
      }
    } catch (error) {
      console.error("회원가입 요청 실패:", error);
    }
  };

  return (
    <div className="join-page">
      <form className="join-form">
        <div>
          <div className="join-form-account-name">
            <div className="join-form-label">
              아이디
            </div>
            <input 
              type="text" 
              value={accountName} 
              placeholder="아이디" 
              onChange={(e) => setAccountName(e.target.value)} 
              required 
            />
          </div>
          <div className="join-form-password">
            <div className="join-form-label">
              비밀번호
            </div>
            <input 
              type="password" 
              value={password} 
              placeholder="비밀번호" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            /> 
          </div>
        </div>
        <div>
          <div className="join-form-real-name">
            <div className="join-form-label">
              이름
            </div>
            <input 
              type="text" 
              value={realName} 
              placeholder="이름" 
              onChange={(e) => setRealName(e.target.value)} 
              required 
            />
          </div>
          <div className="join-form-birthday">
            <div className="join-form-label">
              생년월일
            </div>
            <input 
              type="text" 
              value={birthday} 
              placeholder="'-'없이 입력하세요. ex) 19770101" 
              onChange={(e) => setBirthday(e.target.value)} 
              required 
            />
          </div>
          <div className="join-form-gender">
            <div className="join-form-label">
              성별
            </div>
            <div 
              onClick={handleSelectMale}
              className={`join-form-gender-option ${gender === "남자" ? "selected" : ""}`}
            >
              남자
            </div>
            <div 
              onClick={handleSelectFemale}
              className={`join-form-gender-option ${gender === "여자" ? "selected" : ""}`}
            >
              여자
            </div>
          </div>
        </div>
        <AddressInputForm />
        <MobileAuthForm />
        <div className="join-button" onClick={handleSubmitJoinData}>회원가입</div>
      </form>
    </div>
  );
}

export default JoinPage;
