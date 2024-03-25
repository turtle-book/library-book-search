import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { openAlertModal } from "../app/slices/alertSlice";
import axiosInstance from "../services/axiosInstance";

import "./PasswordChangeForm.css";

/**
 * PasswordChangeForm 컴포넌트
 * 
 * 비밀번호 변경 양식 컴포넌트
 * isForPasswordChange prop이 true인 경우 비밀번호 변경을 위해 현재 비밀번호 input도 활성화 됨
 * 또한 isForPasswordChange prop의 값에 따라 각각 다른 비밀번호 변경 API 요청을 보냄
 * 
 * @param {Object} props 컴포넌트에 전달되는 props 
 * @param {boolean} props.isForPasswordChange 비밀번호 변경의 목적을 나타내는 boolean 값(true의 경우 비밀번호 변경이 목적)
 */
function PasswordChangeForm({ isForPasswordChange }) {
  const navigate = useNavigate();

  // 전역 상태 관리
  const accountNameForMobileAuth = useSelector((state) => state.mobileAuth.accountNameForMobileAuth);
  const dispatch = useDispatch();

  // 로컬 상태 관리
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // 비밀번호 변경 정보 제출 핸들러
  const handleRequestPasswordChange = async () => {
    // 유효성 검사
    if (
      (isForPasswordChange && !currentPassword) ||
      !newPassword ||
      !newPasswordConfirm
    ) {
      dispatch(openAlertModal({
        modalTitle: "비밀번호 변경 제출 불가",
        modalContent: "비밀번호를 입력해주세요.",
      }));
      return;
    }

    // 새 비밀번호 확인
    if (newPassword !== newPasswordConfirm) {
      dispatch(openAlertModal({
        modalTitle: "비밀번호 변경 제출 불가",
        modalContent: "비밀번호가 일치하지 않습니다.",
      }));
      resetPasswordFields();
      return;
    }

    try {
      // 비밀번호 변경이 목적인 경우
      if (isForPasswordChange) {
        const accountName = sessionStorage.getItem("loginId");

        // 비밀번호 변경 API 요청
        const response = await axiosInstance.patch(`${import.meta.env.VITE_SERVER_URL}/auth/profile/password`, {
          accountName, 
          currentPassword, 
          newPassword,
        });

        // 비밀번호 변경 성공 시 모달 닫은 뒤 로그인 페이지로 리다이렉트
        dispatch(openAlertModal({
          modalTitle: "비밀번호 변경 결과",
          modalContent: response.data.message,
          modalNavigatePath: response.data.code === "CHANGE_PASSWORD_SUCCEEDED" ? "/auth/login" : "",
        }));

        // 비밀번호 변경 실패
        if (response.data.code === "CHANGE_PASSWORD_FAILED") {
          resetPasswordFields();
        }
        
      // 비밀번호 찾기가 목적인 경우
      } else {
        // 비밀번호 찾기 API 요청
        const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/auth/recovery/password`, {
          accountName: accountNameForMobileAuth,
          newPassword,
        }, {
          withCredentials: true,
        });
  
        // 비밀번호 찾기 성공
        if (response.data.code === "CHANGE_PASSWORD_SUCCEEDED") {
          dispatch(openAlertModal({
            modalTitle: "비밀번호 찾기 성공",
            modalContent: "비밀번호가 변경되었습니다.",
            modalNavigatePath: "/auth/login",
          }));
        }
      }
    } catch (error) {
      console.log("비밀번호 변경 또는 비밀번호 찾기 요청 실패");
      console.error(error);
    }
  };

  // 비밀번호 변경 취소 핸들러
  const handleCancelPasswordChange = () => {
    resetPasswordFields();
    if (isForPasswordChange) {
      navigate("/auth/profile");
    } else {
      navigate("/auth/login");
    }
  };

  // 비밀번호 입력 필드 초기화 함수
  function resetPasswordFields() {
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  return (
    <div className="password-change-form">
      {isForPasswordChange && (
        <div className="password-change-current-password">
          <div>현재 비밀번호</div>
          <input 
            type="password" 
            value={currentPassword} 
            maxLength="20"
            onChange={(e) => setCurrentPassword(e.target.value)} 
          />
        </div>
      )}
      <div className="password-change-new-password">
        <div>새 비밀번호</div>
        <input 
          type="password" 
          value={newPassword} 
          maxLength="20"
          onChange={(e) => setNewPassword(e.target.value)} 
        />
      </div>
      <div className="password-change-new-password-confirm">
        <div>새 비밀번호 확인</div>
        <input 
          type="password"  
          value={newPasswordConfirm} 
          maxLength="20"
          onChange={(e) => setNewPasswordConfirm(e.target.value)} 
        />
      </div>
      <div className="password-change-action">
        <div onClick={handleRequestPasswordChange}>
          확인
        </div>
        <div onClick={handleCancelPasswordChange}>
          취소
        </div>
      </div>
    </div>
  );
}

export default PasswordChangeForm;
