import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { resetMobileAuthData } from "../../../app/slice/mobileAuthDataSlice";

import "./RecoveryPasswordPage.css";

function RecoveryPasswordPage() {
  const navigate = useNavigate();

  // 로컬 상태 관리
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // 전역 상태 관리
  const accountNameForMobileAuth = useSelector((state) => state.mobileAuthData.accountNameForMobileAuth);
  const isMobileAuthCompleted = useSelector((state) => state.mobileAuthData.isMobileAuthCompleted);
  const dispatch = useDispatch();

  // 마운트 이펙트: 인증 미완료시 비밀번호찾기 불가
  useEffect(() => {
    if (!isMobileAuthCompleted) {
      navigate("/auth/login");
      return;
    }
  }, []);

  // 언마운트 이펙트: 전역 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetMobileAuthData());
    };
  }, []);

  // 비밀번호 변경(찾기) 정보 제출 핸들러
  const handleSubmitPasswordChangeData = async () => {
    // 새 비밀번호 확인
    if (newPassword !== newPasswordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      setNewPassword("");
      setNewPasswordConfirm("");
      return;
    }

    try {
      // 비밀번호 변경 요청
      const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/auth/recovery/password`, {
        accountName: accountNameForMobileAuth,
        newPassword,
      }, {
        withCredentials: true,
      });

      // 비밀번호 찾기 성공
      if (response.data.code === "CHANGE_PASSWORD_SUCCEEDED") {
        alert("비밀번호가 변경되었습니다.");
        dispatch(resetMobileAuthData());
        navigate("/auth/login");
      }
    } catch (error) {
      console.error("비밀번호 찾기 요청 실패", error);
    }
  };

  // 비밀번호 변경(찾기) 취소 핸들러
  const handleCancelPasswordChange = () => {
    dispatch(resetMobileAuthData());
    navigate("/auth/login");
  };

  return (
    <div>
      <div>
        <div>새 비밀번호</div>
        <input 
          type="password" 
          value={newPassword} 
          onChange={e => setNewPassword(e.target.value)} 
          required 
        />
      </div>
      <div>
        <div>새 비밀번호 확인</div>
        <input 
          type="password" 
          value={newPasswordConfirm} 
          onChange={e => setNewPasswordConfirm(e.target.value)} 
          required 
        />
      </div>
      <div>
        <div onClick={handleSubmitPasswordChangeData}>
          확인
        </div>
        <div onClick={handleCancelPasswordChange}>
          취소
        </div>
      </div>
    </div>
  );
}

export default RecoveryPasswordPage;
